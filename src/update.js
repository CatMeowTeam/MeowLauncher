// Meow Launcher — tự kiểm tra bản mới trên GitHub Releases. Phát triển bởi Catmeow Team
const { app, net } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sys = require('./sys');

const REPO = 'CatMeowTeam/MeowLauncher';
const PAGE = `https://github.com/${REPO}/releases/latest`;

// "2.0.0" > "2.0.0-beta" > "1.0.1-beta"
function parse(v) {
  const m = String(v).trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9a-z.-]+))?/i);
  return m ? { n: [+m[1], +m[2], +m[3]], pre: m[4] || '' } : null;
}
function cmp(a, b) {
  const x = parse(a), y = parse(b); if (!x || !y) return 0;
  for (let i = 0; i < 3; i++) if (x.n[i] !== y.n[i]) return x.n[i] > y.n[i] ? 1 : -1;
  if (x.pre === y.pre) return 0;
  if (!x.pre) return 1; if (!y.pre) return -1;
  return x.pre > y.pre ? 1 : -1;
}

async function getJSON(url) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await net.fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'MeowLauncher/' + app.getVersion(), Accept: 'application/vnd.github+json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

// Lấy bản mới nhất (tính cả bản Beta), chỉ nhận bản có file cài .exe
async function check() {
  const list = await getJSON(`https://api.github.com/repos/${REPO}/releases?per_page=10`);
  let best = null;
  for (const r of list || []) {
    if (r.draft) continue;
    const v = String(r.tag_name || '').replace(/^v/i, '');
    if (!parse(v)) continue;
    if (!best || cmp(v, best.version) > 0) {
      const exe = (r.assets || []).find((a) => /\.exe$/i.test(a.name));
      best = { version: v, name: r.name || ('v' + v), notes: String(r.body || '').slice(0, 1500), page: r.html_url || PAGE, url: exe ? exe.browser_download_url : '', size: exe ? exe.size : 0, file: exe ? exe.name : '' };
    }
  }
  if (!best) return { newer: false, current: app.getVersion() };
  return { ...best, current: app.getVersion(), newer: cmp(best.version, app.getVersion()) > 0 };
}

// Tải file cài về thư mục tạm, báo tiến độ qua onProgress(0..1)
async function download(info, onProgress) {
  if (!info || !info.url) throw new Error('no-exe');
  const dst = path.join(os.tmpdir(), info.file || `MeowLauncherSetup-${info.version}.exe`);
  try { const st = fs.statSync(dst); if (info.size && st.size === info.size) { onProgress(1); return dst; } } catch {}
  const r = await net.fetch(info.url, { headers: { 'User-Agent': 'MeowLauncher/' + app.getVersion() } });
  if (!r.ok || !r.body) throw new Error('HTTP ' + r.status);
  const total = info.size || Number(r.headers.get('content-length')) || 0;
  const part = dst + '.part';
  const out = fs.createWriteStream(part);
  let got = 0, lastP = -1;
  const reader = r.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      got += value.length;
      if (!out.write(Buffer.from(value))) await new Promise((res) => out.once('drain', res));
      if (total) { const p = Math.floor((got / total) * 100); if (p !== lastP) { lastP = p; onProgress(got / total); } }
    }
  } finally { await new Promise((res) => out.end(res)); }
  if (total && got !== total) { try { fs.unlinkSync(part); } catch {} throw new Error('size'); }
  try { fs.unlinkSync(dst); } catch {}
  fs.renameSync(part, dst);
  onProgress(1);
  return dst;
}

// Chạy file cài ở chế độ im lặng (giữ thư mục cài cũ và dữ liệu), cài xong tự mở lại Meow.
// Windows sẽ hỏi quyền Admin một lần. Trả về false nếu người dùng bấm Không.
async function install(file) {
  if (!sys.IS_WIN) return false;
  const q = (s) => "'" + s.replace(/'/g, "''") + "'";
  const r = await sys.ps(`try { Start-Process -FilePath ${q(file)} -ArgumentList '/S','--updated','--force-run' -ErrorAction Stop; 'OK' } catch { 'NO' }`, 120000);
  return r.out.includes('OK');
}

module.exports = { check, download, install, cmp, PAGE };
