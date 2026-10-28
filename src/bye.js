// Meow Launcher — màn hình "Bạn muốn xoá Meow thật hả?" chạy trước trình gỡ cài đặt.
// Trình gỡ gọi: "Meow Launcher.exe" --confirm-uninstall
//   mã thoát 0  -> tiếp tục gỡ
//   mã thoát 13 -> người dùng chọn ở lại, huỷ gỡ
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

app.disableHardwareAcceleration();
const userData = app.getPath('userData');
const read = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(userData, f), 'utf8')); } catch { return d; } };
const cfg = read('config.json', {});
const lib = read('library.json', {});
const clips = read('clips.json', []);
// dùng thư mục tạm riêng để không đụng app đang chạy ở khay hệ thống
app.setPath('userData', path.join(app.getPath('temp'), 'meow-launcher-bye'));

let decided = false;
const finish = (code) => { decided = true; app.exit(code); };

app.whenReady().then(() => {
  const lang = cfg.lang || (String(app.getLocale()).toLowerCase().startsWith('vi') ? 'vi' : 'en');
  const win = new BrowserWindow({
    width: 480, height: 540, resizable: false, maximizable: false, minimizable: false, frame: false, center: true, alwaysOnTop: true,
    show: false, backgroundColor: '#f7f1ef', title: 'Meow Launcher',
    icon: path.join(process.resourcesPath || '', 'icons', 'app-cam.png'),
    webPreferences: { preload: path.join(__dirname, 'bye-preload.js'), contextIsolation: true, sandbox: false, spellcheck: false },
  });
  win.setMenu(null);
  const q = { lang, skin: cfg.skin || 'auto', apps: (lib.apps || []).length, groups: (lib.groups || []).length, clips: (clips || []).length };
  win.loadFile(path.join(__dirname, 'renderer', 'bye.html'), { query: Object.fromEntries(Object.entries(q).map(([k, v]) => [k, String(v)])) });
  win.once('ready-to-show', () => { win.show(); win.focus(); });
  win.on('closed', () => { if (!decided) finish(13); });
  ipcMain.on('bye:done', (_e, code) => finish(code === 0 ? 0 : 13));
});
app.on('window-all-closed', () => { if (!decided) finish(13); });
