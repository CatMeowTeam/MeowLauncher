// Dữ liệu giả chỉ dùng khi mở giao diện ngoài Electron (để kiểm tra). Trong app thật window.meow đã có sẵn.
if (!window.meow) (function () {
  const D = (n, cat) => ({ id: n.toLowerCase().replace(/\W/g, ''), name: n, kind: 'shortcut', launch: 'C:\\x\\' + n + '.lnk', target: 'C:\\Program Files\\' + n + '\\' + n + '.exe', cat, fav: false, icon: '' });
  const apps = [D('Word', 'office'), D('Excel', 'office'), D('Zalo', 'net'), D('Chrome', 'net'), D('VS Code', 'dev'), D('Postman', 'dev'), D('Photoshop', 'design'), D('UltraViewer', 'tools'), D('Steam', 'game')];
  apps[1].fav = true;
  const st = { config: { lang: location.hash.slice(1) || null, hotkey: 'Alt+Space', clipHotkey: 'CommandOrControl+Shift+V', mode: 'window', skin: 'auto', autoHide: false, startWithWindows: true, cleanDesktop: 'move', warnDisk: true, warnRam: true, warnUptime: true, view: 'grid', ovHotkey: 'CommandOrControl+Alt+F', ovPos: 'tr', ovFps: true, autoUpdate: true, skipVersion: '' },
    lib: { apps, groups: [{ id: 'g1', name: 'Vào ca', apps: ['chrome', 'excel', 'zalo'] }], cats: [{ id: 'office', name: 'Công việc', color: '#2f6fd6', glyph: 'office' }, { id: 'net', name: 'Internet', color: '#7a52c7', glyph: 'web' }, { id: 'dev', name: 'Lập trình', color: '#3b4450', glyph: 'dev' }, { id: 'design', name: 'Thiết kế', color: '#c73d7d', glyph: 'design' }, { id: 'tools', name: 'Tiện ích', color: '#0b7a75', glyph: 'tools' }, { id: 'game', name: 'Giải trí', color: '#b4471e', glyph: 'game' }], recent: ['excel', 'zalo'] },
    clips: [{ t: '192.168.1.24', at: Date.now() - 60000, pin: false }, { t: 'Xin chào', at: Date.now() - 3600000, pin: true }], version: '2.0.0', backups: 2, shutdownAt: null, overlay: { on: false, fps: 'off' }, update: null };
  const ok = async () => ({ ok: true });
  const m = {
    state: async () => JSON.parse(JSON.stringify(st)),
    'config:set': async (p) => { Object.assign(st.config, p); if (p.lang) location.hash = p.lang; return { config: st.config, hotkeys: { main: true, clip: true } }; },
    'lib:set': async (p) => Object.assign(st.lib, p),
    'apps:add': async () => ({ added: [], moved: 0 }), 'apps:pick': async () => ({ added: [] }), 'apps:pickFolder': async () => ({ added: [] }),
    'apps:launch': ok, 'apps:folder': ok, 'apps:remove': async (id) => { st.lib.apps = st.lib.apps.filter((a) => a.id !== id); return st.lib; }, 'apps:refreshIcon': async () => '',
    'desktop:clean': async () => 1, 'desktop:restore': async () => 2, 'desktop:openBackup': ok,
    'scan:startmenu': async () => [{ path: 'C:\\a\\Notepad++.lnk', name: 'Notepad++', cat: 'dev', have: false, icon: '' }, { path: 'C:\\a\\Word.lnk', name: 'Word', cat: 'office', have: true, icon: '' }],
    'files:search': async (q) => [{ n: 'Báo cáo tháng 10.xlsx', p: 'D:\\Kế toán\\Báo cáo tháng 10.xlsx', dir: false, recent: true }, { n: 'Kế toán', p: 'D:\\Kế toán', dir: true }].filter((f) => f.n.toLowerCase().includes(q.toLowerCase().slice(0, 2))),
    'files:open': ok, 'files:reveal': ok, 'files:icon': async () => '',
    'sys:stats': async () => ({ cpu: 23, ramUsed: 11.2e9, ramTotal: 16e9, cFree: 20e9, cTotal: 240e9, uptime: 8.2 * 86400 }),
    'sys:procs': async () => [{ name: 'chrome', title: 'Google Chrome', pids: [1, 2, 3], ram: 2.8e9, cpu: 4.2, type: 'app' }, { name: 'OneDrive', title: 'Microsoft OneDrive', pids: [9], ram: 1.2e8, cpu: 0, type: 'bg' }, { name: 'explorer', title: 'Windows Explorer', pids: [5], ram: 1.9e8, cpu: 1, type: 'sys' }, { name: 'Meow Launcher', title: 'Meow Launcher', pids: [7], ram: 1.4e8, cpu: 0.5, type: 'self' }],
    'sys:kill': ok, 'sys:explorer': ok,
    'sys:startup': async () => [{ name: 'Steam', cmd: '"C:\\Steam\\steam.exe" -silent', hive: 'HKCU', sub: 'Run', scope: 'user', src: 'Registry', on: true }, { name: 'Zalo.lnk', cmd: 'C:\\Users\\a\\Startup\\Zalo.lnk', hive: 'HKCU', sub: 'StartupFolder', scope: 'user', src: 'Thư mục Startup', on: false }, { name: 'SecurityHealth', cmd: 'C:\\Windows\\system32\\SecurityHealthSystray.exe', hive: 'HKLM', sub: 'Run', scope: 'machine', src: 'Registry', on: true }],
    'sys:startupToggle': ok,
    'sys:installed': async () => [{ name: 'Adobe Photoshop 2025', pub: 'Adobe', size: 6.2e9, date: '14/03/2026', un: 'x', ver: '26.0' }, { name: 'Zalo', pub: 'VNG', size: 5.4e8, date: '22/06/2025', un: 'x', ver: '24.1' }],
    'sys:uninstall': ok,
    'sys:junkScan': async () => [{ id: 'tmp', name: 'Tệp tạm của người dùng', desc: '%TEMP%', on: true, size: 2.4e9 }, { id: 'wtmp', name: 'Tệp tạm của Windows', desc: 'C:\\Windows\\Temp', admin: true, on: true, size: 8.6e8 }, { id: 'wu', name: 'Bộ đệm Windows Update', desc: 'C:\\Windows\\SoftwareDistribution\\Download', admin: true, on: false, size: 3.2e9 }],
    'sys:junkClean': async () => ({ cancelled: false }),
    'sys:fix': async () => { await new Promise((r) => setTimeout(r, 400)); return { ok: true }; },
    'sys:info': async () => ({ host: 'DESKTOP-TEST', user: 'nhanvien', os: 'Windows 11 Pro 23H2 (build 22631)', cpu: 'Intel Core i5-12400 · 6 nhân 12 luồng', ram: '16 GB · 3200 MHz · 2 thanh', gpu: 'Intel UHD Graphics 730', board: 'ASUS PRIME B660M-A', ip: '192.168.1.24', mac: 'aa:bb', gw: '192.168.1.1', uptime: 700000, disks: [{ l: 'C:', n: 'Windows', free: 2e10, size: 2.4e11 }, { l: 'D:', n: 'Data', free: 4e11, size: 9.3e11 }] }),
    'sys:ip': async () => ({ local: [{ ip: '192.168.1.24' }], pub: '203.0.113.42' }),
    'sys:wintool': ok, 'sys:power': async (a, m) => ({ ok: true, shutdownAt: a === 'timer' ? Date.now() + m * 60000 : null }),
    'clips:set': async (l) => (st.clips = l), 'clips:copy': ok, copy: ok, 'config:export': async () => false, 'config:import': async () => false, 'data:open': ok,
    'win:hide': ok, 'win:min': ok, 'win:max': ok, 'win:quit': ok, 'open:url': ok, 'dialog:open': ok,
    'ov:toggle': async () => { st.overlay.on = !st.overlay.on; st.overlay.fps = st.overlay.on ? 'running' : 'off'; return st.overlay.on; },
    'update:check': async () => { await new Promise((r) => setTimeout(r, 300)); return /noupd/.test(location.search) ? { newer: false, version: '2.0.0', current: '2.0.0' } : { newer: true, version: '2.1.0', current: '2.0.0', url: 'x', notes: '## Có gì mới\n- Thêm widget thời tiết\n- Sửa lỗi overlay ở màn hình phụ\n- **Nhẹ hơn** 10%', page: 'x' }; },
    'update:install': async () => ({ ok: true }), 'update:skip': ok, 'update:page': ok,
    on: () => {}, pathOf: (f) => f.name,
  };
  window.meow = m;
})();
