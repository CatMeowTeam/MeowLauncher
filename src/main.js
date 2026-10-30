// Meow Launcher — main process
if (process.argv.includes('--confirm-uninstall')) { require('./bye'); return; }
// Phát triển bởi Catmeow Team
const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage, shell, clipboard, dialog, Notification, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const sys = require('./sys');
const overlay = require('./overlay');
const updater = require('./update');
const v8 = require('v8');
try { v8.setFlagsFromString('--expose-gc'); } catch {}
const runGC = (() => { try { return require('vm').runInNewContext('gc'); } catch { return () => {}; } })();

app.setAppUserModelId('team.catmeow.meowlauncher');
// ---- tiết kiệm RAM ----
// Không cần tăng tốc phần cứng cho một cửa sổ tĩnh; gộp GPU và mạng vào tiến trình chính; V8 ưu tiên bộ nhớ.
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('enable-features', 'NetworkServiceInProcess2');
app.commandLine.appendSwitch('disable-features', 'SpareRendererForSitePerProcess,CalculateNativeWinOcclusion,MediaSessionService,HardwareMediaKeyHandling,WebRtcAllowInputVolumeAdjustment');
app.commandLine.appendSwitch('js-flags', '--lite-mode --max-old-space-size=96 --max-semi-space-size=1');
// Gộp phần vẽ giao diện (GPU process) vào tiến trình chính: bớt hẳn một tiến trình nền.
// Có chốt an toàn: nếu lần trước Meow tắt bất thường trước khi hiện được cửa sổ thì tự quay về cách cũ.
const GPU_GUARD = path.join(app.getPath('userData'), 'gpu-guard');
let inProcGpu = false;
try {
  const cfg0 = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'config.json'), 'utf8'));
  if (fs.existsSync(GPU_GUARD)) { cfg0.inProcGpu = false; fs.writeFileSync(path.join(app.getPath('userData'), 'config.json'), JSON.stringify(cfg0)); try { fs.unlinkSync(GPU_GUARD); } catch {} }
  else if (cfg0.inProcGpu !== false) inProcGpu = true;
} catch { inProcGpu = !fs.existsSync(GPU_GUARD); try { fs.unlinkSync(GPU_GUARD); } catch {} }
if (inProcGpu) app.commandLine.appendSwitch('in-process-gpu');
// chốt được đặt ngay trước khi vẽ cửa sổ và gỡ khi cửa sổ vẽ xong
const gpuMark = () => { if (inProcGpu) { try { fs.writeFileSync(GPU_GUARD, String(Date.now())); } catch {} } };
const gpuOk = () => { if (inProcGpu) { try { fs.unlinkSync(GPU_GUARD); } catch {} } };
if (!app.requestSingleInstanceLock()) { app.quit(); }

// ---------------- lưu trữ ----------------
const DATA = app.getPath('userData');
const F = { config: path.join(DATA, 'config.json'), lib: path.join(DATA, 'library.json'), clips: path.join(DATA, 'clips.json'), backup: path.join(DATA, 'desktop-backup.json') };
const SHORTCUT_DIR = path.join(DATA, 'shortcuts');
const BACKUP_DIR = path.join(DATA, 'desktop-backup');
for (const d of [DATA, SHORTCUT_DIR, BACKUP_DIR]) { try { fs.mkdirSync(d, { recursive: true }); } catch {} }

const DEFAULT_CONFIG = {
  hotkey: 'Alt+Space', clipHotkey: 'CommandOrControl+Shift+V', mode: 'window', skin: 'auto', autoHide: true, startWithWindows: true,
  lang: null, saveRam: true, cleanDesktop: 'move', warnDisk: true, warnRam: true, warnUptime: true, view: 'grid', firstRun: true, bounds: null,
  ovHotkey: 'CommandOrControl+Alt+F', ovPos: 'tr', ovFps: true, autoUpdate: true, skipVersion: '',
};
const DEFAULT_CATS = [
  { id: 'office', name: 'Công việc', color: '#2f6fd6', glyph: 'office' },
  { id: 'net', name: 'Internet', color: '#7a52c7', glyph: 'web' },
  { id: 'dev', name: 'Lập trình', color: '#3b4450', glyph: 'dev' },
  { id: 'design', name: 'Thiết kế', color: '#c73d7d', glyph: 'design' },
  { id: 'tools', name: 'Tiện ích', color: '#0b7a75', glyph: 'tools' },
  { id: 'game', name: 'Giải trí', color: '#b4471e', glyph: 'game' },
];
function readJSON(f, d) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } }
let config = { ...DEFAULT_CONFIG, ...readJSON(F.config, {}) };
let lib = { apps: [], groups: [], cats: DEFAULT_CATS, recent: [], ...readJSON(F.lib, {}) };
if (!Array.isArray(lib.cats) || !lib.cats.length) lib.cats = DEFAULT_CATS;
// Vừa cài (lại) xong: hỏi lại ngôn ngữ bằng màn hình chọn của app, gợi ý theo ngôn ngữ Windows
try {
  const f = path.join(path.dirname(process.execPath), 'install-lang.txt');
  const st = fs.statSync(f); const v = fs.readFileSync(f, 'utf8').trim();
  if ((v === 'vi' || v === 'en') && st.mtimeMs > (config.installLangStamp || 0)) {
    // đã chọn ngôn ngữ từ trước (cài đè bản mới) thì giữ nguyên, chỉ hỏi khi chưa chọn
    config.langSuggest = v; config.installLangStamp = st.mtimeMs;
    fs.writeFileSync(F.config, JSON.stringify(config));
  }
} catch {}
let clips = readJSON(F.clips, []);
let backups = readJSON(F.backup, []);
const timers = {};
function save(which) {
  clearTimeout(timers[which]);
  timers[which] = setTimeout(() => {
    const data = { config, lib, clips, backup: backups }[which];
    fs.writeFile(F[which] + '.tmp', JSON.stringify(data), (e) => { if (!e) fs.rename(F[which] + '.tmp', F[which], () => {}); });
  }, 300);
}
const EN = {
  'Mở Meow Launcher': 'Open Meow Launcher', 'Lịch sử copy': 'Clipboard history', 'Công cụ hệ thống': 'System tools', 'Dọn rác': 'Clean up', 'Hướng dẫn sử dụng': 'User guide', 'Cài đặt': 'Settings', 'Thoát Meow Launcher': 'Quit Meow Launcher', 'Chuyển sang cửa sổ thường': 'Switch to window mode', 'Chuyển sang kiểu popup': 'Switch to popup mode', 'Overlay FPS & nhiệt độ': 'FPS & temperature overlay', 'Kiểm tra bản mới': 'Check for updates', 'Có bản mới': 'Update available',
  'Ổ C sắp đầy': 'Drive C is almost full', 'RAM quá tải': 'RAM overloaded', 'Nên khởi động lại máy': 'Time to restart your PC', 'RAM trên 90% liên tục 5 phút. Mở App đang chạy để tắt bớt app.': 'RAM has been above 90% for 5 minutes. Open Running apps to close some.',
  'Chọn app để thêm': 'Choose apps to add', 'App và shortcut': 'Apps and shortcuts', 'Tất cả file': 'All files', 'Chọn thư mục': 'Choose folders', 'Xuất cấu hình': 'Export settings', 'Nhập cấu hình': 'Import settings',
};
const L = (s) => (config.lang === 'en' && EN[s]) || s;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ---------------- đoán danh mục ----------------
const GUESS = [
  ['office', /word|excel|powerpoint|outlook|onenote|office|wps|foxit|acrobat|pdf|libre|notepad|lark|feishu|notion|teams|zoom|meet|skype|nhanh|shopee|lazada|tiktok|misa|kế toán|ke toan|in tem|print/i],
  ['net', /chrome|edge|firefox|opera|brave|cốc cốc|coc coc|coccoc|browser|zalo|telegram|messenger|discord|viber|whatsapp|line|slack|thunderbird|mail|signal/i],
  ['dev', /code|studio|terminal|powershell|cmd|git|postman|docker|python|node|putty|winscp|filezilla|mongo|mysql|sql|dbeaver|navicat|jetbrains|intellij|pycharm|sublime|notepad\+\+|android|xampp|wsl|ubuntu/i],
  ['design', /photoshop|illustrator|premiere|after effects|lightroom|figma|canva|capcut|davinci|blender|corel|inkscape|gimp|krita|autocad|sketchup|camtasia|audition|indesign/i],
  ['game', /steam|epic|riot|valorant|league|garena|battle\.net|ubisoft|origin|ea app|minecraft|roblox|spotify|vlc|obs|potplayer|media player|netflix|game|xbox|nvidia app|geforce/i],
];
function guessCat(name) { for (const [c, re] of GUESS) if (re.test(name)) return c; return 'tools'; }

// ---------------- icon ----------------
async function iconOf(file) {
  try { const img = await app.getFileIcon(file, { size: 'large' }); if (!img.isEmpty()) return img.toDataURL(); } catch {}
  return '';
}
function readLnk(p) { try { return shell.readShortcutLink(p); } catch { return null; } }
async function iconForSource(src) {
  if (/\.lnk$/i.test(src)) {
    const info = readLnk(src);
    if (info) {
      if (info.icon && /\.ico$/i.test(info.icon) && fs.existsSync(info.icon)) { const i = await iconOf(info.icon); if (i) return i; }
      if (info.target && fs.existsSync(info.target)) { const i = await iconOf(info.target); if (i) return i; }
    }
  }
  return iconOf(src);
}

// ---------------- màn hình chính ----------------
const DESKTOPS = () => [path.join(os.homedir(), 'Desktop'), app.getPath('desktop'), path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop')].map((p) => p.toLowerCase());
const onDesktop = (p) => DESKTOPS().some((d) => path.dirname(p).toLowerCase() === d);
async function moveFile(src, dst) {
  try { await fsp.rename(src, dst); return true; } catch (e) {
    if (e.code === 'EXDEV') { try { await fsp.copyFile(src, dst); await fsp.unlink(src); return true; } catch {} }
    if (e.code === 'EPERM' || e.code === 'EACCES') {
      const q = (s) => "'" + s.replace(/'/g, "''") + "'";
      const r = await sys.psAdmin(`Move-Item -LiteralPath ${q(src)} -Destination ${q(dst)} -Force`);
      return r.ok && !fs.existsSync(src);
    }
    return false;
  }
}
async function cleanFromDesktop(paths) {
  let moved = 0; const needAdmin = [];
  for (const p of paths) {
    if (!onDesktop(p) || !fs.existsSync(p)) continue;
    let dst = path.join(BACKUP_DIR, path.basename(p));
    if (fs.existsSync(dst)) dst = path.join(BACKUP_DIR, `${path.parse(p).name} (${uid()})${path.extname(p)}`);
    try { await fsp.rename(p, dst); backups.push({ orig: p, backup: dst, t: Date.now() }); moved++; }
    catch (e) {
      if (e.code === 'EXDEV') { try { await fsp.copyFile(p, dst); await fsp.unlink(p); backups.push({ orig: p, backup: dst, t: Date.now() }); moved++; } catch {} }
      else needAdmin.push([p, dst]);
    }
  }
  if (needAdmin.length) {
    // shortcut trên màn hình chính dùng chung (Public) cần quyền Admin: gộp lại hỏi một lần
    const q = (s) => "'" + s.replace(/'/g, "''") + "'";
    const r = await sys.psAdmin(needAdmin.map(([a, b]) => `Move-Item -LiteralPath ${q(a)} -Destination ${q(b)} -Force`).join(';'));
    if (r.ok) for (const [a, b] of needAdmin) if (!fs.existsSync(a) && fs.existsSync(b)) { backups.push({ orig: a, backup: b, t: Date.now() }); moved++; }
  }
  save('backup');
  return moved;
}
async function restoreDesktop() {
  let n = 0; const left = [];
  for (const b of backups) {
    if (!fs.existsSync(b.backup)) continue;
    let dst = b.orig; if (fs.existsSync(dst)) { left.push(b); continue; }
    if (await moveFile(b.backup, dst)) n++; else left.push(b);
  }
  backups = left; save('backup'); return n;
}

// ---------------- thêm app ----------------
function parseUrlFile(p) { try { const m = fs.readFileSync(p, 'utf8').match(/^URL=(.+)$/m); return m ? m[1].trim() : ''; } catch { return ''; } }
async function makeApp(p, cat) {
  let st; try { st = await fsp.stat(p); } catch { return null; }
  const id = uid();
  const ext = path.extname(p).toLowerCase();
  let name = path.basename(p, ext);
  let kind = 'file', launch = p, target = p;
  if (st.isDirectory()) { kind = 'folder'; name = path.basename(p) || p; }
  else if (ext === '.lnk' || ext === '.url') {
    kind = 'shortcut';
    const copy = path.join(SHORTCUT_DIR, id + ext);
    await fsp.copyFile(p, copy);
    launch = copy;
    if (ext === '.lnk') { const info = readLnk(p); target = info && info.target ? info.target : p; }
    else { target = parseUrlFile(p) || p; }
  } else if (ext === '.exe') { kind = 'exe'; try { const vi = await sys.ps(`(Get-Item -LiteralPath '${p.replace(/'/g, "''")}').VersionInfo.FileDescription`); const d = vi.out.trim(); if (d && d.length < 40) name = d; } catch {} }
  const icon = await iconForSource(p);
  return { id, name, kind, launch, target, src: p, cat: cat || guessCat(name + ' ' + target), fav: false, icon, added: Date.now() };
}
async function addPaths(paths, cat) {
  const added = [];
  const deskAll = [];
  for (const p of paths) {
    if (onDesktop(p)) deskAll.push(p);
    const exists = lib.apps.find((a) => a.src && a.src.toLowerCase() === p.toLowerCase() && fs.existsSync(a.launch));
    if (exists) continue;
    const a = await makeApp(p, cat && cat !== 'all' && cat !== 'fav' ? cat : null);
    if (a) { lib.apps.push(a); added.push(a); }
  }
  save('lib');
  let moved = 0;
  const desk = deskAll;
  if (config.cleanDesktop === 'move' && desk.length) moved = await cleanFromDesktop(desk);
  return { added, moved, desktopPaths: config.cleanDesktop === 'ask' ? desk : [] };
}

// ---------------- mở app ----------------
async function launchApp(id, admin) {
  const a = lib.apps.find((x) => x.id === id); if (!a) return { ok: false };
  let ok = true;
  if (!fs.existsSync(a.launch) && !/^https?:/i.test(a.launch)) return { ok: false, missing: true };
  if (admin) {
    const r = await sys.ps(`try{Start-Process -FilePath '${a.launch.replace(/'/g, "''")}' -Verb RunAs -ErrorAction Stop;'OK'}catch{'NO'}`);
    ok = r.out.includes('OK');
  } else if (a.kind === 'exe') {
    ok = (await sys.startDetached(a.launch, [], { cwd: path.dirname(a.launch) })) || !(await shell.openPath(a.launch));
  } else {
    ok = !(await shell.openPath(a.launch));
  }
  if (ok) { lib.recent = [id, ...lib.recent.filter((x) => x !== id)].slice(0, 8); save('lib'); }
  return { ok };
}

// ---------------- clipboard ----------------
let lastClip = '';
function clipTick() {
  try {
    if (clipboard.has && (clipboard.has('ExcludeClipboardContentFromMonitorProcessing') || clipboard.has('CanIncludeInClipboardHistory'))) return;
    const t = clipboard.readText();
    if (!t || t === lastClip || !t.trim() || t.length > 10000) { lastClip = t; return; }
    lastClip = t;
    const ex = clips.findIndex((c) => c.t === t);
    let pin = false; if (ex >= 0) { pin = clips[ex].pin; clips.splice(ex, 1); }
    clips.unshift({ t, at: Date.now(), pin });
    const pinned = clips.filter((c) => c.pin), rest = clips.filter((c) => !c.pin).slice(0, 50);
    clips = [...clips.filter((c) => c.pin || rest.includes(c))];
    save('clips'); send('clips', clips);
  } catch {}
}

// ---------------- cảnh báo ----------------
const warned = {}; let ramHigh = 0;
async function warnTick() {
  const s = await sys.stats();
  const day = new Date().toDateString();
  const notify = (k, title, body) => { if (warned[k] === day) return; warned[k] = day; try { new Notification({ title, body, icon: trayIconPath() }).show(); } catch {} };
  if (config.warnDisk && s.cTotal && s.cFree / s.cTotal < 0.1) notify('disk', L('Ổ C sắp đầy'), config.lang === 'en' ? `${(s.cFree / 1073741824).toFixed(1)} GB free. Open Meow Launcher › Clean up to free space.` : `Còn trống ${(s.cFree / 1073741824).toFixed(1)} GB. Mở Meow Launcher › Dọn rác để giải phóng.`);
  ramHigh = s.ramUsed / s.ramTotal > 0.9 ? ramHigh + 1 : 0;
  if (config.warnRam && ramHigh >= 5) { notify('ram', L('RAM quá tải'), L('RAM trên 90% liên tục 5 phút. Mở App đang chạy để tắt bớt app.')); }
  if (config.warnUptime && s.uptime > 7 * 86400) notify('up', L('Nên khởi động lại máy'), config.lang === 'en' ? `Your PC has been running for ${Math.floor(s.uptime / 86400)} days without a restart.` : `Máy đã chạy ${Math.floor(s.uptime / 86400)} ngày chưa khởi động lại.`);
}

// ---------------- cửa sổ ----------------
let win = null, tray = null, quitting = false, shutdownAt = null;
const res = (...p) => app.isPackaged ? path.join(process.resourcesPath, ...p) : path.join(__dirname, '..', 'build', ...p);
function currentSkin() { return config.skin === 'auto' ? (require('electron').nativeTheme.shouldUseDarkColors ? 'mun' : 'cam') : config.skin; }
function trayIconPath() { return res('icons', `tray-${currentSkin()}.png`); }
function winIconPath() { return res('icons', `app-${currentSkin()}.png`); }
function send(ch, data) { if (win && !win.isDestroyed()) win.webContents.send(ch, data); }

function popupBounds() {
  const d = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
  const w = Math.min(780, d.width - 40), h = Math.min(600, d.height - 80);
  return { x: Math.round(d.x + (d.width - w) / 2), y: Math.round(d.y + d.height * 0.14), width: w, height: h };
}
function applyMode() {
  if (!win) return;
  const pop = config.mode === 'popup';
  win.setSkipTaskbar(pop);
  win.setAlwaysOnTop(pop, 'pop-up-menu');
  win.setResizable(!pop);
  if (pop) { if (win.isMaximized()) win.unmaximize(); win.setBounds(popupBounds()); }
  else { const b = config.bounds; if (b) win.setBounds(b); else { win.setSize(1120, 740); win.center(); } }
  send('mode', config.mode);
}
function createWindow(show, view) {
  gpuMark();
  win = new BrowserWindow({
    width: 1120, height: 740, minWidth: 720, minHeight: 480, show: false, frame: false, backgroundColor: '#f7f1ef',
    title: 'Meow Launcher', icon: winIconPath(), roundedCorners: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false, spellcheck: false, backgroundThrottling: true, v8CacheOptions: 'none', enableWebSQL: false, webgl: false, autoplayPolicy: 'user-gesture-required' },
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.once('ready-to-show', () => { gpuOk(); applyMode(); if (show) showWin(view); });
  win.on('close', (e) => { if (!quitting) { e.preventDefault(); win.hide(); } });
  win.on('hide', scheduleUnload); win.on('show', () => { clearTimeout(unloadT); clearTimeout(trimT); warmIndex(); });
  win.on('closed', () => { win = null; });
  win.on('blur', () => { if (config.mode === 'popup' && !win.webContents.isDevToolsOpened() && !dialogOpen) win.hide(); });
  const keep = () => { if (config.mode === 'window' && !win.isMaximized() && !win.isMinimized()) { config.bounds = win.getBounds(); save('config'); } };
  win.on('resized', keep); win.on('moved', keep);
  win.on('maximize', () => send('max', true)); win.on('unmaximize', () => send('max', false));
  if (process.env.MEOW_DEBUG) {
    win.webContents.on('console-message', (_e, level, msg) => console.log('[renderer]', level, msg));
    win.webContents.on('did-finish-load', () => setTimeout(async () => {
      try { const img = await win.webContents.capturePage(); fs.writeFileSync(process.env.MEOW_DEBUG, img.toPNG()); } catch (e) { console.log('cap err', e); }
      const r = await win.webContents.executeJavaScript('JSON.stringify({apps:document.querySelectorAll(".app").length, side:document.querySelectorAll(".cat").length, err:window.__err||null})');
      console.log('[check]', r); quitting = true; app.quit();
    }, 3500));
  }
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}
// Ẩn quá 60 giây thì giải phóng cửa sổ (tiến trình giao diện chiếm phần lớn RAM). Gọi lại sẽ tạo mới trong chưa tới 1 giây.
let unloadT = null;
function scheduleUnload() {
  clearTimeout(unloadT);
  if (!config.saveRam || quitting) return;
  unloadT = setTimeout(() => {
    if (win && !win.isVisible() && !dialogOpen) { win.removeAllListeners('close'); win.destroy(); win = null; freeMem(); }
  }, Number(process.env.MEOW_UNLOAD_MS) || 60000);
}
// Dọn bộ nhớ khi Meow nằm yên dưới khay: bỏ chỉ mục tìm file, bộ đệm icon, chạy GC rồi trả RAM thừa cho Windows.
// Lần mở sau Meow lấy lại trong tích tắc nên không ảnh hưởng tới việc dùng app.
let trimT = null;
function freeMem() {
  sys.dropIndex(); iconCache.clear(); runGC();
  clearTimeout(trimT);
  trimT = setTimeout(() => { if (!win) { runGC(); sys.trimWorkingSet(); trimT = setTimeout(freeMem, 30 * 60000); } }, 3000);
}
let warmT = null;
function warmIndex() { clearTimeout(warmT); warmT = setTimeout(() => sys.searchFiles('~~warm~~', () => null).catch(() => {}), 1500); }
function showWin(view) {
  if (!win) { createWindow(true, view); return; }
  if (config.mode === 'popup') win.setBounds(popupBounds());
  if (win.isMinimized()) win.restore();
  win.show(); win.focus();
  send('shown', view || null);
}
function toggleWin() { if (win && win.isVisible() && win.isFocused()) win.hide(); else showWin(); }

function registerHotkeys() {
  globalShortcut.unregisterAll();
  const res1 = { main: false, clip: false };
  try { res1.main = globalShortcut.register(config.hotkey, toggleWin); } catch {}
  if (!res1.main && config.hotkey === 'Alt+Space') { try { if (globalShortcut.register('Control+Alt+Space', toggleWin)) { res1.main = 'Control+Alt+Space'; } } catch {} }
  try { res1.clip = globalShortcut.register(config.clipHotkey, () => showWin('clip')); } catch {}
  res1.ov = false; if (config.ovHotkey) { try { res1.ov = globalShortcut.register(config.ovHotkey, toggleOverlay); } catch {} }
  return res1;
}

// ---------------- overlay FPS ----------------
function toggleOverlay(on) {
  const want = typeof on === 'boolean' ? on : !overlay.isOn();
  if (want === overlay.isOn()) return overlay.isOn();
  if (want) overlay.start({ res, pos: config.ovPos, fps: config.ovFps, lang: config.lang, onState: ovChanged });
  else overlay.stop();
  ovChanged(); return want;
}
function ovChanged() { send('ov:state', { on: overlay.isOn(), fps: overlay.state() }); buildTray(); }

// ---------------- cập nhật ----------------
let upd = null, updBusy = false;
async function checkUpdate(manual) {
  try {
    const r = await updater.check();
    if (r.newer) {
      const fresh = !upd || upd.version !== r.version;
      upd = r; send('update', upd); buildTray();
      if (fresh && !manual && config.skipVersion !== r.version) {
        try {
          const n = new Notification({ title: L('Có bản mới') + ` · Meow Launcher ${r.version}`, body: config.lang === 'en' ? 'Click to see what’s new and update.' : 'Bấm để xem có gì mới và cập nhật.', icon: trayIconPath() });
          n.on('click', () => showWin('update')); n.show();
        } catch {}
      }
    }
    return r;
  } catch (e) { return { error: String(e && e.message || e) }; }
}
async function installUpdate() {
  if (updBusy) return { busy: true };
  if (!upd || !upd.newer) { const r = await checkUpdate(true); if (!r || !r.newer) return { none: true }; }
  if (!upd.url) { shell.openExternal(upd.page || updater.PAGE); return { page: true }; }
  updBusy = true;
  try {
    const file = await updater.download(upd, (p) => send('update:progress', p));
    send('update:progress', 'install');
    const ok = await updater.install(file);
    if (!ok) { send('update:progress', 'cancel'); return { cancelled: true }; }
    setTimeout(() => { quitting = true; app.quit(); }, 800);
    return { ok: true };
  } catch (e) { send('update:progress', 'error'); return { error: String(e && e.message || e) }; }
  finally { updBusy = false; }
}

function buildTray() {
  if (tray) tray.destroy();
  tray = new Tray(nativeImage.createFromPath(trayIconPath()));
  tray.setToolTip('Meow Launcher');
  const menu = Menu.buildFromTemplate([
    { label: L('Mở Meow Launcher'), click: () => showWin() },
    { label: L('Lịch sử copy'), click: () => showWin('clip') },
    { label: L('Công cụ hệ thống'), click: () => showWin('hub') },
    { label: L('Dọn rác'), click: () => showWin('clean') },
    { label: L('Overlay FPS & nhiệt độ'), type: 'checkbox', checked: overlay.isOn(), accelerator: config.ovHotkey || undefined, click: () => toggleOverlay() },
    { type: 'separator' },
    { label: L(config.mode === 'popup' ? 'Chuyển sang cửa sổ thường' : 'Chuyển sang kiểu popup'), click: () => { config.mode = config.mode === 'popup' ? 'window' : 'popup'; save('config'); applyMode(); buildTray(); showWin(); } },
    { label: L('Hướng dẫn sử dụng'), click: () => showWin('guide') },
    { label: L('Cài đặt'), click: () => showWin('settings') },
    upd && upd.newer ? { label: `${L('Có bản mới')}: ${upd.version}`, click: () => showWin('update') } : { label: L('Kiểm tra bản mới'), click: async () => { const r = await checkUpdate(true); showWin(r && r.newer ? 'update' : 'settings'); } },
    { label: L('Thoát Meow Launcher'), click: () => { quitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => toggleWin());
}
function applyLogin() {
  try { app.setLoginItemSettings({ openAtLogin: !!config.startWithWindows, path: process.execPath, args: ['--hidden'] }); } catch {}
}

// ---------------- IPC ----------------
let dialogOpen = false;
const h = (ch, fn) => ipcMain.handle(ch, async (_e, ...a) => { try { return await fn(...a); } catch (err) { return { error: String(err && err.message || err) }; } });
h('state', () => ({ config, lib, clips, platform: process.platform, version: app.getVersion(), dataDir: DATA, skin: currentSkin(), backups: backups.length, shutdownAt, overlay: { on: overlay.isOn(), fps: overlay.state() }, update: upd }));
h('config:set', (patch) => {
  const old = { ...config }; Object.assign(config, patch); save('config');
  let hk = null;
  if (patch.hotkey || patch.clipHotkey || 'ovHotkey' in patch) hk = registerHotkeys();
  if ('ovPos' in patch) overlay.setPos(config.ovPos);
  if ('ovFps' in patch && overlay.isOn()) { overlay.stop(); toggleOverlay(true); }
  if ('lang' in patch) overlay.setLang(config.lang);
  if ('mode' in patch && patch.mode !== old.mode) { applyMode(); buildTray(); }
  if ('startWithWindows' in patch) applyLogin();
  if ('lang' in patch) buildTray();
  if ('saveRam' in patch) { if (!config.saveRam) clearTimeout(unloadT); }
  if ('skin' in patch) { buildTray(); try { win.setIcon(winIconPath()); } catch {} }
  return { config, hotkeys: hk };
});
h('lib:set', (patch) => { Object.assign(lib, patch); save('lib'); return lib; });
h('apps:add', (paths, cat) => addPaths(paths, cat));
h('apps:pick', async (cat) => {
  dialogOpen = true;
  const r = await dialog.showOpenDialog(win, { title: L('Chọn app để thêm'), properties: ['openFile', 'multiSelections'], filters: [{ name: L('App và shortcut'), extensions: ['exe', 'lnk', 'url', 'bat', 'cmd'] }, { name: L('Tất cả file'), extensions: ['*'] }] });
  dialogOpen = false;
  if (r.canceled) return { added: [] };
  return addPaths(r.filePaths, cat);
});
h('apps:pickFolder', async (cat) => {
  dialogOpen = true; const r = await dialog.showOpenDialog(win, { title: L('Chọn thư mục'), properties: ['openDirectory', 'multiSelections'] }); dialogOpen = false;
  if (r.canceled) return { added: [] }; return addPaths(r.filePaths, cat);
});
h('apps:launch', (id, admin) => launchApp(id, admin));
h('apps:folder', (id) => { const a = lib.apps.find((x) => x.id === id); if (!a) return; const t = a.target && fs.existsSync(a.target) ? a.target : a.src; if (a.kind === 'folder') shell.openPath(a.launch); else shell.showItemInFolder(t); return true; });
h('apps:remove', async (id) => { const a = lib.apps.find((x) => x.id === id); lib.apps = lib.apps.filter((x) => x.id !== id); lib.recent = lib.recent.filter((x) => x !== id); lib.groups.forEach((g) => (g.apps = g.apps.filter((x) => x !== id))); if (a && a.launch.startsWith(SHORTCUT_DIR)) fsp.unlink(a.launch).catch(() => {}); save('lib'); return lib; });
h('apps:refreshIcon', async (id) => { const a = lib.apps.find((x) => x.id === id); if (!a) return null; a.icon = (await iconForSource(a.launch)) || a.icon; save('lib'); return a.icon; });
h('desktop:clean', (paths) => cleanFromDesktop(paths));
h('desktop:restore', () => restoreDesktop());
h('desktop:openBackup', () => shell.openPath(BACKUP_DIR));
h('scan:startmenu', async () => {
  const have = new Set(lib.apps.map((a) => a.name.toLowerCase()));
  const seen = new Set(); const out = [];
  for (const p of await sys.startMenuShortcuts()) {
    const name = path.basename(p, path.extname(p)); const k = name.toLowerCase();
    if (seen.has(k)) continue; seen.add(k);
    out.push({ path: p, name, cat: guessCat(name), have: have.has(k) });
  }
  out.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  for (const o of out) o.icon = await iconForSource(o.path);
  return out;
});
h('files:search', (q) => sys.searchFiles(q, (lnk) => { const i = readLnk(lnk); return i && i.target; }));
h('files:open', (p) => shell.openPath(p));
h('files:reveal', (p) => shell.showItemInFolder(p));
const iconCache = new Map();
h('files:icon', async (p, isDir) => {
  const key = isDir ? '<dir>' : (path.extname(p).toLowerCase() === '.exe' ? p : path.extname(p).toLowerCase());
  if (iconCache.has(key)) return iconCache.get(key);
  let i = ''; try { const img = await app.getFileIcon(p, { size: 'normal' }); i = img.toDataURL(); } catch {}
  iconCache.set(key, i); return i;
});
h('sys:stats', () => sys.stats());
h('sys:procs', () => sys.processes());
h('sys:kill', (pids, force) => sys.killProcs(pids, force));
h('sys:explorer', () => sys.restartExplorer());
h('sys:startup', () => sys.startupList());
h('sys:startupToggle', (item, on) => sys.startupToggle(item, on));
h('sys:installed', () => sys.installedApps());
h('sys:uninstall', (un) => sys.uninstall(un));
h('sys:junkScan', () => sys.junkScan());
h('sys:junkClean', (ids) => sys.junkClean(ids));
h('sys:fix', (id) => sys.runFix(id));
h('sys:info', () => sys.machineInfo());
h('sys:ip', async () => ({ local: sys.localIPs(), pub: await sys.publicIP() }));
h('sys:wintool', (id) => sys.openWinTool(id));
h('sys:power', async (action, minutes) => {
  const r = await sys.power(action, minutes);
  if (action === 'timer') shutdownAt = Date.now() + minutes * 60000;
  if (action === 'cancel') shutdownAt = null;
  return { ok: r && r.ok !== false, shutdownAt };
});
h('clips:set', (list) => { clips = list; save('clips'); return clips; });
h('clips:copy', (t) => { lastClip = t; clipboard.writeText(t); return true; });
h('copy', (t) => { clipboard.writeText(String(t)); return true; });
h('config:export', async () => {
  dialogOpen = true; const r = await dialog.showSaveDialog(win, { title: L('Xuất cấu hình'), defaultPath: path.join(app.getPath('documents'), 'meow-launcher-cauhinh.json'), filters: [{ name: 'JSON', extensions: ['json'] }] }); dialogOpen = false;
  if (r.canceled) return false; await fsp.writeFile(r.filePath, JSON.stringify({ version: 1, config, lib }, null, 1)); return r.filePath;
});
h('config:import', async () => {
  dialogOpen = true; const r = await dialog.showOpenDialog(win, { title: L('Nhập cấu hình'), properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] }); dialogOpen = false;
  if (r.canceled) return false;
  const d = JSON.parse(await fsp.readFile(r.filePaths[0], 'utf8'));
  if (d.lib) { lib = { ...lib, ...d.lib }; save('lib'); }
  if (d.config) { const { bounds, ...rest } = d.config; Object.assign(config, rest); save('config'); registerHotkeys(); applyLogin(); }
  return true;
});
h('data:open', () => shell.openPath(DATA));
h('win:hide', () => win.hide());
h('win:min', () => win.minimize());
h('win:max', () => (win.isMaximized() ? win.unmaximize() : win.maximize()));
h('win:quit', () => { quitting = true; app.quit(); });
h('open:url', (u) => shell.openExternal(u));
h('dialog:open', (v) => { dialogOpen = !!v; });
h('ov:toggle', (on) => toggleOverlay(on));
h('update:check', () => checkUpdate(true));
h('update:install', () => installUpdate());
h('update:skip', (v) => { config.skipVersion = v; save('config'); return true; });
h('update:page', () => shell.openExternal((upd && upd.page) || updater.PAGE));

// ---------------- khởi động ----------------
app.on('second-instance', () => showWin());
app.whenReady().then(() => {
  const hidden = process.argv.includes('--hidden');
  if (!hidden) createWindow(true);
  if (process.env.MEOW_OV_TEST) setTimeout(() => { toggleOverlay(true); setTimeout(async () => { try { const ow = BrowserWindow.getAllWindows().find((w) => w.getTitle() === 'Meow Overlay'); fs.writeFileSync(process.env.MEOW_OV_TEST, (await ow.webContents.capturePage()).toPNG()); console.log('[ov] captured', ow.getBounds()); } catch (e) { console.log('[ov] err', e); } }, 3000); }, 1000);
  if (process.env.MEOW_HIDE_AFTER) setTimeout(() => win && win.hide(), Number(process.env.MEOW_HIDE_AFTER));
  buildTray();
  const hk = registerHotkeys();
  if (config.firstRun) { config.firstRun = false; save('config'); applyLogin(); }
  if (!hk.main) setTimeout(() => send('toast', `Không đăng ký được phím tắt ${config.hotkey}. Vào Cài đặt để đổi phím khác.`), 2500);
  else if (hk.main === 'Control+Alt+Space') setTimeout(() => send('toast', 'Alt+Space đang bị app khác dùng, tạm dùng Ctrl+Alt+Space.'), 2500);
  setInterval(clipTick, 800);
  if (hidden) setTimeout(() => { if (!win) freeMem(); }, 30000);
  if (config.autoUpdate) { setTimeout(() => checkUpdate(false), 45000); setInterval(() => { if (config.autoUpdate) checkUpdate(false); }, 6 * 3600 * 1000); }
  setInterval(warnTick, 60000); setTimeout(warnTick, 15000);
  require('electron').nativeTheme.on('updated', () => { if (config.skin === 'auto') { buildTray(); try { win.setIcon(winIconPath()); } catch {} } });
});
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('before-quit', () => { quitting = true; gpuOk(); overlay.shutdown(); });
app.on('window-all-closed', (e) => e.preventDefault());
