// Meow Launcher — lớp hiển thị FPS / CPU / GPU / nhiệt độ khi chơi game. Phát triển bởi Catmeow Team
// Chỉ chạy khi người dùng bật; tắt là dừng hết tiến trình phụ và giải phóng cửa sổ.
const { BrowserWindow, screen } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const sys = require('./sys');

let win = null, timer = null, statsProc = null, last = {}, fpsState = 'off', topT = 0;
let opts = { res: null, pos: 'tr', fps: true, onState: () => {} };
const FPS_FILE = path.join(os.tmpdir(), `meow-fps-${process.pid}.json`);

// CPU riêng cho overlay (không dùng chung bộ đếm với phần cảnh báo)
let prevCpu = null;
function cpuNow() {
  const t = os.cpus().reduce((a, c) => { const tot = Object.values(c.times).reduce((x, y) => x + y, 0); a.idle += c.times.idle; a.total += tot; return a; }, { idle: 0, total: 0 });
  let pct = null;
  if (prevCpu) { const dt = t.total - prevCpu.total; if (dt > 0) pct = Math.round((1 - (t.idle - prevCpu.idle) / dt) * 100); }
  prevCpu = t; return pct;
}

function bounds() {
  const d = screen.getPrimaryDisplay().bounds, w = 196, h = 132, m = 14;
  const right = opts.pos.endsWith('r'), bottom = opts.pos.startsWith('b');
  return { x: Math.round(right ? d.x + d.width - w - m : d.x + m), y: Math.round(bottom ? d.y + d.height - h - m - 40 : d.y + m), width: w, height: h };
}

function startStats() {
  if (!sys.IS_WIN || statsProc) return;
  const file = opts.res('helpers', 'stats.ps1');
  statsProc = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', file, '-Parent', String(process.pid)], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
  let buf = '';
  statsProc.stdout.on('data', (d) => {
    buf += d.toString('utf8'); let i;
    while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); try { if (line) last = JSON.parse(line); } catch {} }
  });
  statsProc.on('exit', () => { statsProc = null; });
  statsProc.on('error', () => { statsProc = null; });
}

// FPS cần quyền Admin (phiên ETW). Thử chạy thường trước; bị từ chối thì hỏi UAC một lần.
// Sau khi được cấp, tiến trình đo FPS ở lại tới khi thoát Meow; tắt overlay chỉ tạm dừng nó (không tốn CPU).
async function startFps() {
  if (!sys.IS_WIN || !opts.fps) { fpsState = 'off'; return; }
  try { fs.unlinkSync(FPS_FILE + '.pause'); } catch {}
  if (fpsState === 'running') return;
  try { fs.unlinkSync(FPS_FILE + '.stop'); } catch {}
  try { fs.unlinkSync(FPS_FILE); } catch {}
  const file = opts.res('helpers', 'fps.ps1');
  fpsState = 'starting';
  const p = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', file, '-Out', FPS_FILE, '-Parent', String(process.pid)], { windowsHide: true, stdio: 'ignore', detached: false });
  p.on('error', () => {});
  const r = await waitFps(9000);
  if (r && !r.err) { fpsState = 'running'; return; }
  if (r && r.err === 'denied') {
    fpsState = 'asking';
    const q = (s) => "'" + s.replace(/'/g, "''") + "'";
    const a = await sys.psAdmin(`& ${q(file)} -Out ${q(FPS_FILE)} -Parent ${process.pid}`, { wait: false });
    if (!a.ok) { fpsState = 'denied'; return; }
    const r2 = await waitFps(15000);
    fpsState = r2 && !r2.err ? 'running' : 'error';
    return;
  }
  fpsState = 'error';
}
function waitFps(ms) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      let v = null; try { v = JSON.parse(fs.readFileSync(FPS_FILE, 'utf8')); } catch {}
      if (v || Date.now() - t0 > ms) { clearInterval(iv); resolve(v); }
    }, 400);
  });
}
function readFps() {
  if (fpsState !== 'running') return null;
  try {
    const v = JSON.parse(fs.readFileSync(FPS_FILE, 'utf8'));
    if (v.err) { fpsState = 'error'; return null; }
    if (Date.now() - v.t > 4000) return null;
    return v;
  } catch { return null; }
}

function tick() {
  if (!win || win.isDestroyed()) return;
  const f = readFps();
  const data = {
    fps: f ? f.fps : null, app: f ? f.name : '', fpsState,
    cpu: cpuNow(), cpuT: last.cpuT ?? null, gpu: last.gpu ?? null, gpuT: last.gpuT ?? null,
    ram: Math.round((1 - os.freemem() / os.totalmem()) * 100),
  };
  win.webContents.send('ov', data);
  // một số game tự đẩy mình lên trên cùng: nhắc lại vị trí mỗi 5 giây
  if (++topT % 5 === 0) { try { win.setAlwaysOnTop(true, 'screen-saver'); win.moveTop(); } catch {} }
}

function start(o) {
  Object.assign(opts, o || {});
  if (win) return;
  win = new BrowserWindow({
    ...bounds(), frame: false, transparent: true, resizable: false, movable: false, minimizable: false, maximizable: false,
    focusable: false, skipTaskbar: true, hasShadow: false, show: false, alwaysOnTop: true, title: 'Meow Overlay',
    webPreferences: { preload: path.join(__dirname, 'overlay-preload.js'), contextIsolation: true, sandbox: true, spellcheck: false, backgroundThrottling: false, v8CacheOptions: 'none', webgl: false },
  });
  win.setIgnoreMouseEvents(true);
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, 'renderer', 'overlay.html'), { hash: o && o.lang === 'en' ? 'en' : 'vi' });
  win.once('ready-to-show', () => { win.showInactive(); tick(); });
  win.on('closed', () => { win = null; });
  cpuNow();
  startStats();
  startFps().then(() => { opts.onState(fpsState); });
  timer = setInterval(tick, 1000);
  opts.onState(fpsState);
}

function stop() {
  clearInterval(timer); timer = null;
  if (win && !win.isDestroyed()) win.destroy(); win = null;
  if (statsProc) { try { statsProc.kill(); } catch {} statsProc = null; }
  if (fpsState === 'running') { try { fs.writeFileSync(FPS_FILE + '.pause', '1'); } catch {} }
  last = {}; prevCpu = null;
  opts.onState(fpsState);
}
// Thoát hẳn Meow: dừng cả tiến trình đo FPS
function shutdown() {
  stop();
  try { fs.writeFileSync(FPS_FILE + '.stop', '1'); } catch {}
  try { fs.unlinkSync(FPS_FILE + '.pause'); } catch {}
}
function setPos(pos) { opts.pos = pos; if (win) win.setBounds(bounds()); }
function setLang(lang) { if (win) win.webContents.send('ov-lang', lang); }
const isOn = () => !!win;
const state = () => fpsState;

module.exports = { start, stop, shutdown, setPos, setLang, isOn, state };
