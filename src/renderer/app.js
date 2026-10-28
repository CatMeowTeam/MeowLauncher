// Meow Launcher — giao diện. Phát triển bởi Catmeow Team
'use strict';
const api = window.meow;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();
const fmt = (b) => { const mb = b / 1048576; return mb >= 1024 ? (mb / 1024).toFixed(1) + ' GB' : mb >= 1 ? Math.round(mb) + ' MB' : Math.max(0, Math.round(b / 1024)) + ' KB'; };

// ---------- biểu tượng ----------
const PAW = '<ellipse cx="17" cy="27" rx="5" ry="6.5" transform="rotate(-22 17 27)"/><ellipse cx="26.5" cy="17.5" rx="5" ry="6.8" transform="rotate(-8 26.5 17.5)"/><ellipse cx="37.5" cy="17.5" rx="5" ry="6.8" transform="rotate(8 37.5 17.5)"/><ellipse cx="47" cy="27" rx="5" ry="6.5" transform="rotate(22 47 27)"/><path d="M32 30c-7 0-13.8 7.4-15.4 13.8-1.4 5.7 2.7 9.2 7.4 9.2 3 0 5.2-1.6 8-1.6s5 1.6 8 1.6c4.7 0 8.8-3.5 7.4-9.2C45.8 37.4 39 30 32 30z"/>';
let icoN = 0;
function ICON() { const id = 'mlg' + (++icoN); return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" style="stop-color:var(--ico1)"/><stop offset="1" style="stop-color:var(--ico2)"/></linearGradient></defs><path d="M9 24L11 5.5Q11.6 3 13.6 4.4L25 13h14l11.4-8.6Q52.4 3 53 5.5L55 24v25q0 11-11 11H20Q9 60 9 49z" fill="url(#${id})" style="stroke:var(--ico-stroke);stroke-width:1.2"/><path d="M14.2 10.5l1 8.6 5.6-4.3z" style="fill:var(--ico-ear)" opacity=".9"/><path d="M49.8 10.5l-1 8.6-5.6-4.3z" style="fill:var(--ico-ear)" opacity=".9"/><g style="fill:var(--ico-paw)" transform="translate(32 41) scale(.6) translate(-32 -36)">${PAW}</g></svg>`; }
const SVG = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const GLYPH = {
  all: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  fav: '<path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4 7.2 18.9l.9-5.4L4.2 9.7l5.4-.8z"/>',
  office: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  web: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.5 2.5 13.5 0 16M12 4c-2.5 2.5-2.5 13.5 0 16"/>',
  dev: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
  design: '<path d="M14 5l5 5-9 9H5v-5z"/><path d="M12 7l5 5"/>',
  tools: '<path d="M14.5 5.5a4 4 0 00-5 5L4 16l4 4 5.5-5.5a4 4 0 005-5l-2.5 2.5-2.5-.5-.5-2.5z"/>',
  game: '<rect x="3" y="8" width="18" height="10" rx="4"/><path d="M8 11v4M6 13h4M15 12h.01M17 14h.01"/>',
  folder: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  clean: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
  proc: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  startup: '<path d="M12 3v8"/><path d="M7 6.5a7 7 0 1010 0"/>',
  uninst: '<path d="M4 8h16v12H4zM3 4h18v4H3zM10 13h4"/>',
  fix: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
  info: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  clip: '<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V3h6v2M9 11h6M9 15h4"/>',
  win: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 9v11"/>',
  hub: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="3.5"/><rect x="4" y="13" width="7" height="7" rx="3.5"/><path d="M16.5 13v7M13 16.5h7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
};
const TOOLS = [['clean', 'Dọn rác', '#8b6b2e'], ['proc', 'App đang chạy', '#c42b1c'], ['startup', 'App tự khởi động', '#5b6bd6'], ['uninst', 'Gỡ cài đặt', '#a3562a'], ['fix', 'Sửa lỗi nhanh', '#1f8a5b'], ['info', 'Thông tin máy', '#4a6b80'], ['clip', 'Lịch sử copy', '#8a4fbf'], ['win', 'Công cụ Windows', '#2f6fd6']];
const WINT = [['control', 'Control Panel', 'Bảng điều khiển', 'control'], ['devmgmt', 'Device Manager', 'Driver và thiết bị', 'devmgmt.msc'], ['diskmgmt', 'Disk Management', 'Phân vùng, gán ký tự ổ', 'diskmgmt.msc'], ['services', 'Services', 'Dịch vụ chạy nền', 'services.msc'], ['network', 'Network Settings', 'Wi-Fi, Ethernet, VPN', 'ms-settings:network'], ['settings', 'Cài đặt Windows', 'Settings', 'ms-settings:'], ['taskmgr', 'Task Manager', 'Trình quản lý tác vụ', 'taskmgr'], ['appwiz', 'Programs and Features', 'Chương trình đã cài', 'appwiz.cpl'], ['eventvwr', 'Event Viewer', 'Nhật ký lỗi hệ thống', 'eventvwr.msc'], ['taskschd', 'Task Scheduler', 'Lịch chạy tác vụ', 'taskschd.msc'], ['sysprops', 'System Properties', 'Tên máy, hiệu năng', 'sysdm.cpl'], ['envvars', 'Biến môi trường', 'PATH và biến hệ thống', 'EditEnvironmentVariables']];
const FIX = [
  { id: 'dns', n: 'Xoá bộ nhớ DNS', d: 'Khi web không vào được dù mạng vẫn có', cmd: 'ipconfig /flushdns', ok: 'Đã xoá bộ nhớ DNS' },
  { id: 'ip', n: 'Làm mới địa chỉ IP', d: 'Khi máy báo trùng IP hoặc không nhận mạng', cmd: 'ipconfig /release · ipconfig /renew', adm: 1, ok: 'Đã làm mới IP' },
  { id: 'net', n: 'Reset mạng', d: 'Khi đã thử hai cách trên mà mạng vẫn lỗi', cmd: 'netsh winsock reset · netsh int ip reset', adm: 1, ok: 'Đã reset, cần khởi động lại máy', rb: 1 },
  { id: 'print', n: 'Sửa lỗi máy in', d: 'Khởi động lại dịch vụ in và xoá lệnh in bị kẹt', cmd: 'net stop spooler · del spool\\PRINTERS · net start spooler', adm: 1, ok: 'Đã khởi động lại dịch vụ in' },
  { id: 'exp', n: 'Khởi động lại Explorer', d: 'Khi taskbar, menu Start hoặc màn hình chính bị đơ', cmd: 'taskkill /f /im explorer.exe · start explorer', ok: 'Explorer đã chạy lại' },
  { id: 'sfc', n: 'Kiểm tra tệp hệ thống', d: 'Quét và sửa tệp Windows bị hỏng, mất 10–15 phút', cmd: 'sfc /scannow', adm: 1, ok: 'Đã mở cửa sổ quét, chờ chạy xong' },
];
const SKINS = [['auto', 'Theo Windows', '#f7f1ef', '#2a2530'], ['cam', 'Mướp', '#f7ece6', '#e8732c'], ['trang', 'Trắng', '#ffffff', '#4f86d9'], ['hong', 'Hồng', '#fbe6ee', '#df568a'], ['xam', 'Xám', '#e3e8ee', '#2f9467'], ['mun', 'Mun', '#19161c', '#ffb547']];

// ---------- trạng thái ----------
let C = {}, L = { apps: [], groups: [], cats: [], recent: [] }, CL = [], META = {};
const S = { cat: 'all', q: '', tool: null, sel: 0, stats: null, warnHidden: false, files: [], cmds: [] };
const T = { junk: null, cl: { phase: 'idle' }, procs: null, pr: { tab: 'app', sel: new Set() }, startup: null, inst: null, un: { sort: 'size', q: '', confirm: null }, fx: {}, info: null, ip: null, clq: '' };

// ---------- tiện ích UI ----------
let tt; function toast(m, action) {
  const t = $('#toast'); t.innerHTML = `<span>${esc(m)}</span>` + (action ? `<button id="tAct">${esc(action.label)}</button>` : ''); t.hidden = false;
  if (action) $('#tAct').onclick = () => { t.hidden = true; action.fn(); };
  clearTimeout(tt); tt = setTimeout(() => (t.hidden = true), action ? 7000 : 2200);
}
function cat(id) { return L.cats.find((c) => c.id === id) || { id, name: 'Khác', color: '#6b7a85', glyph: 'folder' }; }
const initials = (n) => { const w = String(n).replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/); return ((w.length > 1 ? w[0][0] + w[1][0] : String(n).slice(0, 2)) || '?').toUpperCase(); };
function icon(a) { return a.icon ? `<span class="ic img"><img src="${a.icon}" alt=""></span>` : `<span class="ic" style="--c:${cat(a.cat).color}">${esc(initials(a.name))}</span>`; }
const hd = (t, s) => `<div class="sec-h"><h2>${t}</h2><small>${s}</small></div>`;
const hkLabel = (h) => String(h || '').replace('CommandOrControl', 'Ctrl').replace('Control', 'Ctrl').split('+').map((k) => `<kbd>${esc(k)}</kbd>`).join(' + ');
async function saveConfig(p) { const r = await api['config:set'](p); if (r && r.config) C = r.config; return r; }
async function saveLib() { await api['lib:set']({ apps: L.apps, groups: L.groups, cats: L.cats, recent: L.recent }); }

// ---------- modal ----------
function modal({ title, sub = '', body = '', ok = 'Đồng ý', cancel = 'Huỷ', danger = false, onOpen, collect }) {
  return new Promise((resolve) => {
    const m = $('#modal');
    m.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><header><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</header><div class="mb">${body}</div><footer>${cancel ? `<button class="btn" data-m="no">${cancel}</button>` : ''}<button class="btn ${danger ? 'danger' : 'pri'}" data-m="ok">${ok}</button></footer></div>`;
    m.hidden = false; api['dialog:open'](true);
    const close = (v) => { m.hidden = true; m.innerHTML = ''; api['dialog:open'](false); document.removeEventListener('keydown', kd, true); resolve(v); };
    const kd = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(null); } else if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') { e.stopPropagation(); e.preventDefault(); close(collect ? collect(m) : true); } };
    document.addEventListener('keydown', kd, true);
    m.onclick = (e) => { const b = e.target.closest('[data-m]'); if (b) close(b.dataset.m === 'ok' ? (collect ? collect(m) : true) : null); else if (e.target === m) close(null); };
    if (onOpen) onOpen(m);
    const f = m.querySelector('input[type=text],input:not([type])'); if (f) { f.focus(); f.select(); }
  });
}
async function askText(title, value = '', sub = '') { const r = await modal({ title, sub, body: `<input class="tin" id="mIn" value="${esc(value)}">`, collect: (m) => $('#mIn', m).value.trim() }); return r || null; }

// ---------- context menu ----------
function menu(x, y, items) {
  const m = $('#menu');
  m.innerHTML = items.map((it, i) => it === '-' ? '<hr>' : it.sub ? `<div class="sub">${esc(it.sub)}</div>` : `<button data-mi="${i}" ${it.danger ? 'style="color:#c42b1c"' : ''}>${esc(it.label)}${it.k ? `<span class="k">${esc(it.k)}</span>` : ''}</button>`).join('');
  m.hidden = false;
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(6, Math.min(x, innerWidth - r.width - 8)) + 'px';
  m.style.top = Math.max(6, Math.min(y, innerHeight - r.height - 8)) + 'px';
  m.onclick = (e) => { const b = e.target.closest('[data-mi]'); if (!b) return; const it = items[+b.dataset.mi]; m.hidden = true; if (it.act) it.act(); };
}

// ---------- thanh bên ----------
function renderSide() {
  const count = (id) => id === 'all' ? L.apps.length : id === 'fav' ? L.apps.filter((a) => a.fav).length : L.apps.filter((a) => a.cat === id).length;
  const btn = (id, name, color, glyph) => `<button class="cat" data-cat="${id}" title="${esc(name)}" aria-pressed="${S.cat === id && !S.q && !S.tool}"><span class="ci" style="--c:${color}">${SVG(GLYPH[glyph] || GLYPH.folder)}</span><span class="lb">${esc(name)}</span><span class="n">${count(id)}</span></button>`;
  if (C.mode === 'popup') {
    const chip = (id, name, color, glyph) => `<button class="pchip" data-cat="${id}" aria-pressed="${S.cat === id && !S.q && !S.tool}"><span class="ci" style="--c:${color}">${SVG(GLYPH[glyph] || GLYPH.folder)}</span>${esc(name)}</button>`;
    $('#popcats').innerHTML = chip('all', 'Tất cả', '#6b7a85', 'all') + chip('fav', 'Yêu thích', '#d79a1d', 'fav') + L.cats.filter((c) => count(c.id)).map((c) => chip(c.id, c.name, c.color, c.glyph)).join('');
  } else $('#popcats').innerHTML = '';
  $('#side').innerHTML = '<h3>Thể loại</h3>' + btn('all', 'Tất cả', '#6b7a85', 'all') + btn('fav', 'Yêu thích', '#d79a1d', 'fav')
    + L.cats.map((c) => btn(c.id, c.name, c.color, c.glyph)).join('')
    + `<h3>Hệ thống</h3><button class="cat" data-tool="hub" title="Công cụ hệ thống" aria-pressed="${!!S.tool && S.tool !== 'settings' && S.tool !== 'guide'}"><span class="ci" style="--c:#4a6b80">${SVG(GLYPH.hub)}</span><span class="lb">Công cụ hệ thống</span><span class="n">${TOOLS.length}</span></button>`
    + `<div class="sfoot"><button class="add" id="addBtn" title="Thêm app, thư mục hoặc danh mục">+<span class="lb"> Thêm app</span></button><button class="rail-btn" id="railBtn" title="Thu gọn / mở rộng thanh bên" aria-label="Thu gọn thanh bên">${SVG('<path d="M15 6l-6 6 6 6"/>')}</button></div>`;
}

// ---------- trang chính ----------
function visible() {
  const q = norm(S.q.trim());
  let list = L.apps.filter((a) => q ? norm(a.name).includes(q) || norm(cat(a.cat).name).includes(q) : S.cat === 'all' ? true : S.cat === 'fav' ? a.fav : a.cat === S.cat);
  if (q) list.sort((a, b) => (norm(b.name).startsWith(q) ? 1 : 0) - (norm(a.name).startsWith(q) ? 1 : 0));
  else list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  return list;
}
function render() {
  renderSide();
  $('#win').classList.toggle('popup', C.mode === 'popup');
  const tv = !!S.tool; $('#toolView').hidden = !tv; $('#home').hidden = tv;
  $('#setBtn').setAttribute('aria-pressed', S.tool === 'settings'); $('#popSet').setAttribute('aria-pressed', S.tool === 'settings'); $('#popHelp').setAttribute('aria-pressed', S.tool === 'guide'); $('#popTools').setAttribute('aria-pressed', !!S.tool && S.tool !== 'settings' && S.tool !== 'guide'); $('#helpBtn').setAttribute('aria-pressed', S.tool === 'guide');
  renderWarn();
  if (tv) { renderTool(); return; }
  renderHome();
}
function renderHome() {
  const list = visible(); const q = S.q.trim();
  if (S.sel >= list.length) S.sel = Math.max(0, list.length - 1);
  let h = '';
  if (q && S.cmds.length) h += `<div class="cmds">${S.cmds.map((c, i) => `<button class="cmd${i === 0 ? ' first' : ''}" data-cmd="${i}"><span class="ck">${c.label}</span><span class="ct"><b>${esc(c.title)}</b><small>${esc(c.sub)}</small></span>${i === 0 ? '<kbd>Enter</kbd>' : ''}</button>`).join('')}</div>`;
  if (!L.apps.length && !q) {
    h += `<div class="empty-hero"><div class="big">${ICON()}</div><h2>Chào mừng tới Meow Launcher</h2><p>Kéo shortcut từ màn hình chính thả vào cửa sổ này, hoặc để Meow quét app đã cài trên máy và xếp theo thể loại giúp bạn.</p><div class="acts"><button class="btn pri" data-act="scan">Quét app trên máy</button><button class="btn" data-act="pick">Chọn file app…</button><button class="btn ghost" data-x="open" data-id="guide">Xem hướng dẫn</button></div></div>`;
  }
  if (!q && S.cat === 'all' && L.apps.length) {
    const rec = L.recent.map((id) => L.apps.find((a) => a.id === id)).filter(Boolean).slice(0, 8);
    if (rec.length) h += `<div><div class="sec-h"><h2>Mở gần đây</h2></div><div class="recent">${rec.map((a) => `<button class="chip" data-id="${a.id}">${icon(a)}${esc(a.name)}</button>`).join('')}</div></div>`;
    h += `<div><div class="sec-h"><h2>Nhóm app</h2><small>Bấm một lần để mở cả nhóm · chuột phải để sửa</small></div><div class="groups">${L.groups.map((g) => { const as = g.apps.map((id) => L.apps.find((a) => a.id === id)).filter(Boolean); return `<button class="grp" data-g="${g.id}"><span class="stack">${as.slice(0, 4).map(icon).join('')}</span><span><b>${esc(g.name)}</b><small>Mở ${as.length} app</small></span></button>`; }).join('')}<button class="grp add-g" data-g="new"><span class="plus">+</span><span><b>Tạo nhóm</b><small>Chọn các app muốn mở cùng lúc</small></span></button></div></div>`;
  }
  if (L.apps.length && (!q || list.length)) {
    const title = q ? `Kết quả cho “${esc(q)}”` : S.cat === 'all' ? 'Tất cả' : S.cat === 'fav' ? 'Yêu thích' : esc(cat(S.cat).name);
    h += `<div><div class="sec-h"><h2>${title}</h2><small>${list.length} app</small></div><div class="grid${C.view === 'list' ? ' list' : ''}" id="grid" role="listbox">${list.length ? list.map((a, i) => `<button class="app${i === S.sel ? ' sel' : ''}" role="option" data-id="${a.id}" title="${esc(a.target || a.launch)}">${icon(a)}<span class="name">${esc(a.name)}</span>${a.fav ? '<span class="star">★</span>' : ''}<span class="path">${esc(a.target || a.launch)}</span></button>`).join('') : `<div class="empty">${S.cat === 'fav' ? 'Chưa ghim app nào. Chuột phải vào app › Ghim vào Yêu thích.' : 'Danh mục này chưa có app. Kéo shortcut thả vào đây để thêm.'}</div>`}</div></div>`;
  }
  if (q && S.files.length) h += `<div><div class="sec-h"><h2>File và thư mục</h2><small>${S.files.length} kết quả</small></div><div class="plist">${S.files.map((f, i) => `<button class="frow" data-f="${i}" title="${esc(f.p)}"><span class="ft${f.dir ? ' folder' : ''}">${f.dir ? 'THƯ MỤC' : esc((f.n.split('.').pop() || '').toUpperCase().slice(0, 5))}</span><span class="fn"><b>${esc(f.n)}</b><small>${esc(f.p)}</small></span><span class="ago">${f.recent ? 'Mở gần đây' : ''}</span></button>`).join('')}</div></div>`;
  if (q && !list.length && !S.files.length && !S.cmds.length) h += `<div class="empty">Meo… không tìm thấy gì cho “${esc(q)}”.</div>`;
  $('#home').innerHTML = h;
}

// ---------- tìm kiếm & lệnh nhanh ----------
function calc(s) {
  let i = 0; s = s.replace(/\s+/g, '');
  const num = () => { const m = s.slice(i).match(/^\d*\.?\d+%?/); if (!m) throw 0; i += m[0].length; const v = parseFloat(m[0]); return m[0].endsWith('%') ? v / 100 : v; };
  const atom = () => { if (s[i] === '-') { i++; return -atom(); } if (s[i] === '+') { i++; return atom(); } if (s[i] === '(') { i++; const v = expr(); if (s[i++] !== ')') throw 0; return v; } return num(); };
  const pow = () => { const b = atom(); if (s[i] === '^') { i++; return Math.pow(b, pow()); } return b; };
  const term = () => { let v = pow(); while (s[i] === '*' || s[i] === '/') { const o = s[i++], r = pow(); v = o === '*' ? v * r : v / r; } return v; };
  const expr = () => { let v = term(); while (s[i] === '+' || s[i] === '-') { const o = s[i++], r = term(); v = o === '+' ? v + r : v - r; } return v; };
  const v = expr(); if (i !== s.length) throw 0; return v;
}
function getCmds(q) {
  const out = [], t = q.trim(), nq = norm(t);
  const ex = t.replace(/^=/, '').replace(/,/g, '.').replace(/[x×]/gi, '*').replace(/:/g, '/');
  if (/^[\d\s.+\-*/()%^]+$/.test(ex) && /\d/.test(ex) && (t.startsWith('=') || /[-+*/^%]/.test(ex.trim().slice(1)))) {
    try { const v = calc(ex); if (isFinite(v)) { const r = Math.round(v * 1e8) / 1e8; out.push({ k: 'calc', label: 'Tính', title: '= ' + r.toLocaleString('vi-VN', { maximumFractionDigits: 8 }), sub: t + ' · Enter để copy kết quả', copy: String(r) }); } } catch {}
  }
  if (['ip', 'ip may', 'dia chi ip', 'myip'].includes(nq)) {
    const l = T.ip?.local?.[0]?.ip || '…', p = T.ip?.pub || '…';
    out.push({ k: 'ip', label: 'IP', title: l, sub: `IP nội bộ · IP công cộng ${p} · Enter để copy`, copy: l });
    if (!T.ip) api['sys:ip']().then((r) => { T.ip = r; if (S.q.trim() === t) onSearch(); });
  }
  const PW = [['khoa may', 'lock', 'Khoá máy'], ['khoi dong lai', 'restart', 'Khởi động lại máy'], ['tat may', 'shutdown', 'Tắt máy'], ['hen gio tat may', 'timer', 'Hẹn giờ tắt máy'], ['ngu', 'sleep', 'Ngủ'], ['lock', 'lock', 'Khoá máy'], ['restart', 'restart', 'Khởi động lại máy'], ['shutdown', 'shutdown', 'Tắt máy'], ['sleep', 'sleep', 'Ngủ']];
  if (nq.length >= 2) { const p = PW.find(([k]) => k.startsWith(nq)); if (p) out.push({ k: 'pw', a: p[1], label: 'Nguồn', title: p[2], sub: 'Enter để chạy' }); }
  if (nq.length >= 3) {
    const TEN = { clean: 'clean up junk cleaner', proc: 'running apps task process', startup: 'startup apps boot', uninst: 'uninstall remove programs', fix: 'quick fixes repair', info: 'pc info system specs', clip: 'clipboard history', win: 'windows tools' };
    TOOLS.filter(([id, n]) => norm(n + ' ' + TEN[id]).includes(nq)).forEach(([id, n]) => out.push({ k: 'tool', id, label: 'Công cụ', title: n, sub: 'Enter để mở' }));
    if ('huong dan su dung help user guide'.includes(nq)) out.push({ k: 'tool', id: 'guide', label: 'Meow', title: 'Hướng dẫn sử dụng', sub: 'Enter để mở' });
    if ('cua so thuong window mode normal'.includes(nq) && C.mode === 'popup') out.push({ k: 'mode', id: 'window', label: 'Meow', title: 'Chuyển sang cửa sổ thường', sub: 'Enter để chuyển' });
    if ('kieu popup mode'.includes(nq) && C.mode !== 'popup') out.push({ k: 'mode', id: 'popup', label: 'Meow', title: 'Chuyển sang kiểu popup', sub: 'Enter để chuyển' });
    if ('cai dat settings preferences'.includes(nq)) out.push({ k: 'tool', id: 'settings', label: 'Meow', title: 'Cài đặt Meow Launcher', sub: 'Enter để mở' });
    FIX.filter((f) => norm(f.n + ' ' + f.cmd).includes(nq)).slice(0, 2).forEach((f) => out.push({ k: 'tool', id: 'fix', label: 'Sửa lỗi', title: f.n, sub: f.d }));
    WINT.filter(([, n, d, c]) => norm(n + ' ' + d + ' ' + c).includes(nq)).slice(0, 3).forEach(([id, n, d, c]) => out.push({ k: 'win', id, label: 'Windows', title: n, sub: d + ' · ' + c }));
  }
  return out.slice(0, 4);
}
function runCmd(c) {
  if (c.k === 'calc' || c.k === 'ip') { api.copy(c.copy); toast('Đã copy ' + c.copy); }
  else if (c.k === 'pw') { if (c.a === 'restart' || c.a === 'shutdown') confirmPower(c.a); else if (c.a === 'timer') showPower($('#pwr')); else doPower(c.a); }
  else if (c.k === 'tool') openTool(c.id);
  else if (c.k === 'mode') { S.q = ''; $('#q').value = ''; S.cmds = []; saveConfig({ mode: c.id }).then(() => render()); }
  else if (c.k === 'win') { api['sys:wintool'](c.id); toast('Đang mở ' + c.title); }
}
let searchT, searchSeq = 0;
function onSearch() {
  S.cmds = S.q.trim() ? getCmds(S.q) : [];
  render();
  clearTimeout(searchT);
  const q = S.q.trim(); if (!q) { S.files = []; return; }
  if (q.length < 2) return;
  const seq = ++searchSeq;
  searchT = setTimeout(async () => { const r = await api['files:search'](q); if (seq !== searchSeq) return; S.files = Array.isArray(r) ? r : []; if (!S.tool) renderHome(); }, 220);
}

// ---------- mở app ----------
async function launch(id, admin) {
  const a = L.apps.find((x) => x.id === id); if (!a) return;
  const r = await api['apps:launch'](id, !!admin);
  if (r && r.ok) {
    L.recent = [id, ...L.recent.filter((x) => x !== id)].slice(0, 8);
    toast(`${admin ? 'Đang chạy (Admin)' : 'Đang mở'} ${a.name}…`);
    if (C.autoHide) setTimeout(() => api['win:hide'](), 250);
  } else if (r && r.missing) {
    toast(`Không tìm thấy ${a.name}. App có thể đã bị gỡ hoặc dời chỗ.`, { label: 'Xoá khỏi launcher', fn: () => removeApp(id) });
  } else toast(`Không mở được ${a.name}`);
}
async function launchGroup(g) {
  const ids = g.apps.filter((id) => L.apps.some((a) => a.id === id));
  for (const id of ids) { await api['apps:launch'](id, false); L.recent = [id, ...L.recent.filter((x) => x !== id)].slice(0, 8); await new Promise((r) => setTimeout(r, 350)); }
  toast(`Đã mở ${ids.length} app trong nhóm ${g.name}`);
  if (C.autoHide) setTimeout(() => api['win:hide'](), 300);
}
async function removeApp(id) { const a = L.apps.find((x) => x.id === id); L = (await api['apps:remove'](id)) || L; render(); if (a) toast(`Đã xoá ${a.name} khỏi launcher`); }
async function addResult(r, catName) {
  if (!r || r.error) { toast('Không thêm được: ' + (r && r.error || 'lỗi')); return; }
  const st = await api.state(); L = st.lib;
  if (!r.added.length) { toast('Các app này đã có trong launcher'); render(); return; }
  render();
  let msg = `Đã thêm ${r.added.length} app` + (catName ? ` vào ${catName}` : '');
  if (r.moved) msg += ` · đã dọn ${r.moved} shortcut khỏi màn hình chính`;
  if (r.desktopPaths && r.desktopPaths.length) toast(msg, { label: 'Dọn khỏi màn hình chính', fn: async () => { const n = await api['desktop:clean'](r.desktopPaths); toast(`Đã chuyển ${n} shortcut vào thư mục sao lưu`); } });
  else toast(msg);
}

// ---------- công cụ ----------
function openTool(id) { S.tool = id; S.q = ''; $('#q').value = ''; S.cmds = []; S.files = []; render(); $('#scroll').scrollTop = 0; loadTool(id); }
async function loadTool(id) {
  if (id === 'proc') pollProcs();
  if (id === 'startup' && !T.startup) { T.startup = 'loading'; T.startup = await api['sys:startup'](); if (S.tool === 'startup') render(); }
  if (id === 'uninst' && !T.inst) { T.inst = 'loading'; T.inst = await api['sys:installed'](); if (S.tool === 'uninst') render(); }
  if (id === 'info') { if (!T.info) { T.info = 'loading'; } const [i, ip] = await Promise.all([api['sys:info'](), api['sys:ip']()]); T.info = i; T.ip = ip; if (S.tool === 'info') render(); }
  if (id === 'clean' && T.cl.phase === 'idle') scanJunk();
}
let procT;
async function pollProcs() {
  clearTimeout(procT);
  if (S.tool !== 'proc' || document.hidden) return;
  const r = await api['sys:procs']();
  if (Array.isArray(r)) { T.procs = r; if (S.tool === 'proc' && !$('#menu').offsetParent) renderToolKeepScroll(); }
  procT = setTimeout(pollProcs, 2500);
}
function renderToolKeepScroll() { const sc = $('#scroll').scrollTop; renderTool(); $('#scroll').scrollTop = sc; }
const loadingBox = (t) => `<div class="loading"><span class="spin"></span>${t}</div>`;
function renderTool() {
  const R = { guide: guideHTML, hub: hubHTML, clean: cleanHTML, proc: procHTML, startup: startupHTML, uninst: uninstHTML, fix: fixHTML, info: infoHTML, clip: clipHTML, win: winHTML, settings: settingsHTML };
  const back = !['hub', 'settings', 'guide'].includes(S.tool) ? '<button class="back" data-x="open" data-id="hub">‹ Công cụ hệ thống</button>' : S.tool !== 'hub' ? '<button class="back" data-x="home">‹ Về trang chính</button>' : '';
  $('#toolView').innerHTML = back + (R[S.tool] || hubHTML)();
}
function guideHTML() {
  return `<div class="g-hero"><div class="big">${ICON()}</div><div><h2>Hướng dẫn sử dụng</h2><p>Meow Launcher ${esc(verLabel())} · mở app nhanh và chăm sóc máy Windows</p></div></div>` + ((window.I18N && I18N.lang === 'en' ? window.GUIDE_HTML_EN : window.GUIDE_HTML) || '') + `<div class="g-foot"><span class="sig">${sigHTML()}</span></div>`;
}
function hubHTML() {
  const s = S.stats || {}; const low = s.cTotal && s.cFree / s.cTotal < 0.1;
  const st = {
    clean: [s.cTotal ? (low ? 'Ổ C chỉ còn ' : 'Ổ C còn trống ') + fmt(s.cFree) : 'Dọn tệp tạm, bộ nhớ đệm', low],
    proc: [s.ramTotal ? `RAM đang dùng ${fmt(s.ramUsed)} / ${fmt(s.ramTotal)}` : 'Xem và tắt app', s.ramTotal && s.ramUsed / s.ramTotal > 0.9],
    startup: [Array.isArray(T.startup) ? `${T.startup.filter((x) => x.on).length}/${T.startup.length} app tự chạy khi bật máy` : 'App tự chạy khi bật máy', 0],
    uninst: [Array.isArray(T.inst) ? `${T.inst.length} app đã cài` : 'Xem app đã cài kèm dung lượng', 0],
    fix: [FIX.length + ' lệnh sửa lỗi mạng, máy in…', 0],
    info: [s.uptime > 7 * 86400 ? `Đã chạy ${Math.floor(s.uptime / 86400)} ngày chưa khởi động lại` : 'Cấu hình, IP, ổ đĩa', s.uptime > 7 * 86400],
    clip: [`${CL.length} mục · ${hkText(C.clipHotkey)}`, 0], win: [WINT.length + ' công cụ có sẵn', 0],
  };
  return hd('Công cụ hệ thống', 'Dọn dẹp, theo dõi và sửa lỗi máy') + `<div class="hub">${TOOLS.map(([id, n, col]) => `<button class="tile${st[id][1] ? ' alert' : ''}" data-x="open" data-id="${id}"><span class="ci" style="--c:${col}">${SVG(GLYPH[id])}</span><span><b>${n}</b><small>${esc(st[id][0])}</small></span></button>`).join('')}</div>`;
}
const hkText = (h) => String(h || '').replace('CommandOrControl', 'Ctrl').replace('Control', 'Ctrl');

// Dọn rác
async function scanJunk() { T.cl = { phase: 'scanning' }; if (S.tool === 'clean') render(); const r = await api['sys:junkScan'](); T.junk = Array.isArray(r) ? r : []; T.cl = { phase: 'ready' }; if (S.tool === 'clean') render(); }
function cleanHTML() {
  const head = hd('Dọn rác', 'Xoá tệp tạm và bộ nhớ đệm để lấy lại dung lượng');
  const ph = T.cl.phase;
  if (ph === 'idle') return head + `<div class="tcard"><p>Quét mất vài giây. Chưa xoá gì cho đến khi bạn xác nhận.</p><button class="btn pri" data-x="jscan">Quét ngay</button></div>`;
  if (ph === 'scanning' || ph === 'cleaning') return head + `<div class="tcard"><p>${ph === 'scanning' ? 'Đang quét…' : 'Đang dọn… (file đang được app khác dùng sẽ được bỏ qua)'}</p><div class="prog"><span></span></div></div>`;
  if (ph === 'done') return head + `<div class="tcard"><b class="big-n">${fmt(T.cl.freed)}</b><p>đã được giải phóng${T.cl.cancelled ? ' (một số mục cần quyền Admin đã bị bỏ qua)' : ''}. Ổ C còn trống ${fmt(S.stats?.cFree || 0)}.</p><button class="btn" data-x="jscan">Quét lại</button></div>`;
  const sel = T.junk.filter((j) => j.on), tot = sel.reduce((s, j) => s + j.size, 0);
  return head + `<div class="jlist">${T.junk.map((j) => `<label class="jrow"><input type="checkbox" data-j="${j.id}" ${j.on ? 'checked' : ''}><span class="t"><b>${esc(j.name)}${j.admin ? '<em class="tag">Admin</em>' : ''}</b><span class="mono">${esc(j.desc)}</span></span><span class="sz">${fmt(j.size)}</span></label>`).join('')}</div>
  <div class="tfoot">${T.cl.confirm ? `<span>Xoá vĩnh viễn <b>${fmt(tot)}</b>? Không khôi phục được.</span><div><button class="btn" data-x="jcancel">Huỷ</button><button class="btn danger" data-x="jgo">Xoá</button></div>` : `<span>Đã chọn <b>${sel.length}</b> mục · <b>${fmt(tot)}</b></span><div><button class="btn" data-x="jscan">Quét lại</button><button class="btn pri" data-x="jask" ${tot ? '' : 'disabled'}>Dọn ${fmt(tot)}</button></div>`}</div>`;
}
async function cleanJunk() {
  const ids = T.junk.filter((j) => j.on).map((j) => j.id);
  const before = (await api['sys:stats']()).cFree;
  T.cl = { phase: 'cleaning' }; render();
  const r = await api['sys:junkClean'](ids);
  const after = await api['sys:stats'](); S.stats = after;
  T.cl = { phase: 'done', freed: Math.max(0, after.cFree - before), cancelled: r && r.cancelled }; render();
}

// App đang chạy
function procHTML() {
  const s = S.stats || { cpu: 0, ramUsed: 0, ramTotal: 1 };
  const head = hd('App đang chạy', 'Tắt app bị treo hoặc tốn RAM') + `<div class="meters"><div class="meter"><span>CPU</span><b>${s.cpu}%</b><i><s style="width:${s.cpu}%"></s></i></div><div class="meter"><span>RAM</span><b>${fmt(s.ramUsed)} / ${fmt(s.ramTotal)}</b><i><s style="width:${Math.round(s.ramUsed / s.ramTotal * 100)}%"></s></i></div></div>`;
  if (!T.procs) return head + loadingBox('Đang đọc danh sách app…');
  const inTab = (p, k) => k === 'sys' ? (p.type === 'sys' || p.type === 'self') : p.type === k;
  const tabs = [['app', 'Ứng dụng'], ['bg', 'Chạy nền'], ['sys', 'Hệ thống']];
  const list = T.procs.filter((p) => inTab(p, T.pr.tab)).sort((a, b) => b.ram - a.ram);
  const selP = T.procs.filter((p) => T.pr.sel.has(p.name)), selRam = selP.reduce((a, p) => a + p.ram, 0);
  return head + `<div class="seg ptabs" role="group">${tabs.map(([k, l]) => `<button data-x="ptab" data-id="${k}" aria-pressed="${T.pr.tab === k}">${l}<span class="n">${T.procs.filter((p) => inTab(p, k)).length}</span></button>`).join('')}</div>
  <div class="plist"><div class="phead"><span></span><span>Tên</span><span>CPU</span><span>RAM</span><span></span></div>
  ${list.map((p) => { const lock = p.type === 'sys' || p.type === 'self'; const isExp = p.name.toLowerCase() === 'explorer'; return `<div class="prow"><input type="checkbox" data-p="${esc(p.name)}" ${T.pr.sel.has(p.name) ? 'checked' : ''} ${lock ? 'disabled' : ''} aria-label="Chọn ${esc(p.name)}"><span class="pn"><span class="ic" style="--c:${lock ? '#6b7a85' : '#4a6b80'}">${esc(initials(p.title))}</span><span><b>${esc(p.title)}</b><small>${p.pids.length} tiến trình · ${esc(p.name)}.exe</small></span></span><span class="num">${p.cpu}%</span><span class="num">${fmt(p.ram)}</span>${isExp ? '<button class="btn sm" data-x="explorer">Khởi động lại</button>' : lock ? `<span class="lock">${p.type === 'self' ? 'App này' : 'Không cho tắt'}</span>` : `<button class="btn sm" data-x="kill" data-id="${esc(p.name)}">Tắt</button>`}</div>`; }).join('')}</div>
  <div class="tfoot"><span>Tắt sẽ đóng như bấm nút X để app kịp hỏi lưu file. App không chịu tắt sẽ có nút Buộc tắt.</span><div><button class="btn danger" data-x="killsel" ${selP.length ? '' : 'disabled'}>Tắt ${selP.length || ''} app đã chọn${selP.length ? ' · ' + fmt(selRam) : ''}</button></div></div>`;
}
async function killNames(names) {
  const ps = T.procs.filter((p) => names.includes(p.name)); if (!ps.length) return;
  const ram = ps.reduce((a, p) => a + p.ram, 0);
  toast(`Đang tắt ${ps.length > 1 ? ps.length + ' app' : ps[0].title}…`);
  names.forEach((n) => T.pr.sel.delete(n));
  const gui = ps.filter((p) => p.type === 'app'), bg = ps.filter((p) => p.type !== 'app');
  T.procs = T.procs.filter((p) => !names.includes(p.name)); render();
  const [r1, r2] = await Promise.all([gui.length ? api['sys:kill'](gui.flatMap((p) => p.pids), false) : { left: [] }, bg.length ? api['sys:kill'](bg.flatMap((p) => p.pids), true) : { left: [] }]);
  const left = [...(r1.left || []), ...(r2.left || [])];
  if (left.length) toast('Có app chưa tắt, có thể đang hỏi lưu file. Kiểm tra cửa sổ app trước khi buộc tắt.', { label: 'Buộc tắt', fn: async () => { await api['sys:kill'](left, true); toast('Đã buộc tắt'); pollProcs(); } });
  else toast(`Đã tắt ${ps.length > 1 ? ps.length + ' app' : ps[0].title} · giải phóng khoảng ${fmt(ram)} RAM`);
  pollProcs();
}

// App tự khởi động
function startupHTML() {
  const head = hd('App tự khởi động', 'Tắt bớt để bật máy nhanh hơn');
  if (!Array.isArray(T.startup)) return head + loadingBox('Đang đọc danh sách…');
  const on = T.startup.filter((s) => s.on);
  return head + `<div class="tfoot"><span>Đang bật <b>${on.length}/${T.startup.length}</b> app tự chạy khi bật máy</span><div><button class="btn" data-x="streload">Tải lại</button></div></div>
  <div class="plist">${T.startup.map((s, i) => `<div class="srow"><span class="pn"><span class="ic" style="--c:#5b6bd6">${esc(initials(s.name))}</span><span><b>${esc(s.name.replace(/\.lnk$/i, ''))}</b><small title="${esc(s.cmd)}">${esc(s.src)}${s.scope === 'machine' ? ' · mọi người dùng' : ''} · ${esc(String(s.cmd).slice(0, 70))}</small></span></span><span class="imp${s.scope === 'machine' ? ' i2' : ''}">${s.scope === 'machine' ? 'Cần Admin' : 'Người dùng'}</span><button class="tg" role="switch" aria-checked="${!!s.on}" data-x="st" data-id="${i}" aria-label="Bật ${esc(s.name)} khi khởi động"></button></div>`).join('') || '<div class="empty">Không có app nào tự khởi động.</div>'}</div>
  <p class="hint">Tắt ở đây chỉ ngăn app tự chạy khi bật máy, không gỡ app. Giống công tắc trong tab Startup của Task Manager.</p>`;
}

// Gỡ cài đặt
function uninstHTML() {
  if (!Array.isArray(T.inst)) return hd('Gỡ cài đặt', '') + loadingBox('Đang đọc danh sách app đã cài…');
  const nq = norm(T.un.q);
  const L2 = T.inst.filter((a) => norm(a.name + ' ' + a.pub).includes(nq)).sort(T.un.sort === 'size' ? (a, b) => b.size - a.size : T.un.sort === 'date' ? (a, b) => (b.date.split('/').reverse().join('')).localeCompare(a.date.split('/').reverse().join('')) : (a, b) => a.name.localeCompare(b.name, 'vi'));
  return hd('Gỡ cài đặt', `${T.inst.length} app · ${fmt(T.inst.reduce((s, a) => s + a.size, 0))}`) + `<div class="tbar"><input class="tin" id="unQ" placeholder="Lọc theo tên…" value="${esc(T.un.q)}" aria-label="Lọc app đã cài"><div class="seg" role="group">${[['size', 'Dung lượng'], ['date', 'Ngày cài'], ['name', 'Tên']].map(([k, l]) => `<button data-x="unsort" data-id="${k}" aria-pressed="${T.un.sort === k}">${l}</button>`).join('')}</div></div>
  <div class="plist">${L2.map((a) => { const i = T.inst.indexOf(a); return `<div class="urow"><span class="pn"><span class="ic" style="--c:#a3562a">${esc(initials(a.name))}</span><span><b>${esc(a.name)}</b><small>${esc([a.pub, a.ver, a.date ? 'cài ' + a.date : ''].filter(Boolean).join(' · '))}</small></span></span><span class="num">${a.size ? fmt(a.size) : '—'}</span>${T.un.confirm === i ? `<span class="cf"><button class="btn sm" data-x="uncancel">Huỷ</button><button class="btn sm danger" data-x="ungo" data-id="${i}">Gỡ</button></span>` : `<button class="btn sm" data-x="unask" data-id="${i}">Gỡ cài đặt</button>`}</div>`; }).join('') || '<div class="empty">Không có app nào khớp.</div>'}</div>`;
}

// Sửa lỗi
function fixHTML() {
  return hd('Sửa lỗi nhanh', 'Lệnh sửa lỗi thường gặp, chạy bằng một nút. Mục Admin sẽ hiện hộp xác nhận của Windows.') + `<div class="fgrid">${FIX.map((f) => { const st = T.fx[f.id]; return `<div class="fcard"><b>${f.n}${f.adm ? '<em class="tag">Admin</em>' : ''}</b><p>${f.d}</p><code>${f.cmd}</code><div class="fact">${st === 'run' ? '<span class="spin"></span><span>Đang chạy…</span>' : st === 'done' ? `<span class="okm">✓ ${f.ok}</span>${f.rb ? '<button class="btn sm" data-x="restart">Khởi động lại</button>' : ''}` : st === 'cancel' ? '<span class="lock">Đã huỷ ở hộp xác nhận</span> <button class="btn sm" data-x="fix" data-id="' + f.id + '">Chạy lại</button>' : `<button class="btn sm" data-x="fix" data-id="${f.id}">Chạy</button>`}</div></div>`; }).join('')}</div>`;
}

// Thông tin máy
function infoRows() {
  const i = T.info; const up = S.stats?.uptime || i.uptime; const d = Math.floor(up / 86400), h = Math.floor(up % 86400 / 3600);
  return [['Tên máy', i.host], ['Người dùng', i.user], ['Windows', i.os], ['CPU', i.cpu], ['RAM', i.ram], ['Card đồ hoạ', i.gpu], ['Bo mạch chủ', i.board], ['IP nội bộ', T.ip?.local?.[0]?.ip || i.ip], ['IP công cộng', T.ip?.pub || 'Không lấy được (cần mạng)'], ['Địa chỉ MAC', i.mac], ['Cổng mạng', i.gw], ['Đã chạy liên tục', `${d} ngày ${h} giờ`]].filter((r) => r[1]);
}
function infoHTML() {
  if (!T.info || T.info === 'loading' || T.info.error) return hd('Thông tin máy', 'Gửi cho IT khi cần hỗ trợ') + loadingBox('Đang đọc thông tin máy…');
  const rows = infoRows(); const up = S.stats?.uptime || T.info.uptime;
  return hd('Thông tin máy', 'Gửi cho IT khi cần hỗ trợ') + `<div class="kv">${rows.map(([k, v], i) => `<div class="kvr"><span>${k}</span><b>${esc(v)}</b><button class="btn sm ghost" data-x="cpv" data-id="${i}">Copy</button></div>`).join('')}</div>
  <div class="kv">${(T.info.disks || []).map((d) => `<div class="kvr disk"><span>Ổ ${esc(d.l)} ${esc(d.n)}</span><span class="bar${d.size && d.free / d.size < 0.1 ? ' low' : ''}"><s style="width:${d.size ? Math.round((1 - d.free / d.size) * 100) : 0}%"></s></span><b>trống ${fmt(d.free)} / ${fmt(d.size)}</b></div>`).join('')}</div>
  <div class="tfoot"><span>${up > 7 * 86400 ? `Máy đã chạy ${Math.floor(up / 86400)} ngày chưa khởi động lại.` : ''}</span><div><button class="btn pri" data-x="cpall">Copy tất cả</button></div></div>`;
}

// Lịch sử copy
function clipHTML() {
  const nq = norm(T.clq);
  const list = CL.map((c, i) => ({ ...c, i })).filter((c) => norm(c.t).includes(nq)).sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0));
  const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'vừa xong' : m < 60 ? m + ' phút' : m < 1440 ? Math.round(m / 60) + ' giờ' : Math.round(m / 1440) + ' ngày'; };
  const kind = (t) => /^https?:\/\//i.test(t) ? 'Link' : /^[a-z]:\\/i.test(t) ? 'Đường dẫn' : /^[\d\s.,+\-()]+$/.test(t) ? 'Số' : 'Văn bản';
  return hd('Lịch sử copy', `Gọi nhanh ở bất kỳ đâu: ${esc(hkText(C.clipHotkey))}`) + `<div class="tbar"><input class="tin" id="clQ" placeholder="Tìm trong lịch sử copy…" value="${esc(T.clq)}" aria-label="Tìm trong lịch sử copy"></div>
  <div class="plist">${list.map((c) => `<div class="crow"><button class="ctext" data-x="clcp" data-id="${c.i}" title="Bấm để copy lại"><span class="kt">${kind(c.t)}</span><span class="tx">${esc(c.t.slice(0, 400))}</span></button><span class="ago">${ago(c.at)}</span><button class="ib${c.pin ? ' on' : ''}" data-x="clpin" data-id="${c.i}" aria-label="${c.pin ? 'Bỏ ghim' : 'Ghim'}">${c.pin ? '★' : '☆'}</button><button class="ib" data-x="cldel" data-id="${c.i}" aria-label="Xoá">✕</button></div>`).join('') || '<div class="empty">Chưa có gì. Copy một đoạn chữ bất kỳ, nó sẽ hiện ở đây.</div>'}</div>
  <div class="tfoot"><span>Lưu 50 mục gần nhất, mục ghim giữ mãi. Không lưu nội dung copy từ trình quản lý mật khẩu.</span><div><button class="btn" data-x="clclear">Xoá tất cả trừ mục ghim</button></div></div>`;
}
function winHTML() { return hd('Công cụ Windows', 'Mở nhanh công cụ có sẵn của Windows') + `<div class="wgrid">${WINT.map(([id, n, d, c]) => `<button class="wt" data-x="win" data-id="${id}"><b>${n}</b><span>${d}</span><code>${c}</code></button>`).join('')}</div>`; }

// Cài đặt
function skinsHTML() { return `<div class="skins" role="radiogroup" aria-label="Màu giao diện">${SKINS.map(([k, n, a, b]) => `<button class="sk" role="radio" aria-checked="${C.skin === k}" data-skin-pick="${k}" title="${n}"><i class="sw" style="--a:${a};--b:${b}"></i><span>${n}</span></button>`).join('')}</div>`; }
const tg = (key, label) => `<button class="tg" role="switch" aria-checked="${!!C[key]}" data-x="cfg" data-id="${key}" aria-label="${esc(label)}"></button>`;
function settingsHTML() {
  return hd('Cài đặt', 'Meow Launcher') + `<div class="setlist">
  <h4>Giao diện</h4>
  <div class="row"><div class="t"><b>Ngôn ngữ</b><span>Ngôn ngữ hiển thị của Meow Launcher</span></div><div class="seg" role="group" data-notr><button data-x="lang" data-id="vi" aria-pressed="${C.lang !== 'en'}">Tiếng Việt</button><button data-x="lang" data-id="en" aria-pressed="${C.lang === 'en'}">English</button></div></div>
  <div class="row stack"><div class="t"><b>Màu giao diện</b><span>Theo Windows sẽ tự đổi giữa Mướp (sáng) và Mun (tối)</span></div>${skinsHTML()}</div>
  <div class="row"><div class="t"><b>Kiểu cửa sổ</b><span>Popup chỉ hiện ô tìm kiếm và app, tự ẩn khi bấm ra ngoài</span></div><div class="seg" role="group"><button data-x="mode" data-id="window" aria-pressed="${C.mode === 'window'}">Thường</button><button data-x="mode" data-id="popup" aria-pressed="${C.mode === 'popup'}">Popup</button></div></div>
  <h4>Phím tắt</h4>
  <div class="row"><div class="t"><b>Gọi Meow Launcher</b><span>Bấm vào ô rồi nhấn tổ hợp phím mới</span></div><button class="hk" data-hk="hotkey">${esc(hkText(C.hotkey))}</button></div>
  <div class="row"><div class="t"><b>Mở lịch sử copy</b><span>Dùng được ở bất kỳ đâu</span></div><button class="hk" data-hk="clipHotkey">${esc(hkText(C.clipHotkey))}</button></div>
  <h4>Hoạt động</h4>
  <div class="row"><div class="t"><b>Tự ẩn sau khi mở app</b><span>Esc cũng ẩn cửa sổ</span></div>${tg('autoHide', 'Tự ẩn sau khi mở app')}</div>
  <div class="row"><div class="t"><b>Tiết kiệm RAM</b><span>Ẩn quá 1 phút thì giải phóng bộ nhớ giao diện. Tắt nếu muốn mở tức thì.</span></div>${tg('saveRam', 'Tiết kiệm RAM')}</div>
  <div class="row"><div class="t"><b>Khởi động cùng Windows</b><span>Chạy nền ở khay hệ thống, gọi bằng phím tắt</span></div>${tg('startWithWindows', 'Khởi động cùng Windows')}</div>
  <h4>Dọn màn hình chính</h4>
  <div class="row sub"><div class="t"><b>Khi kéo shortcut từ màn hình chính vào</b><span>Shortcut gốc được chuyển vào thư mục sao lưu, khôi phục lại được</span></div>
   <div class="opt">${[['move', 'Tự chuyển shortcut gốc vào thư mục sao lưu'], ['ask', 'Hỏi mỗi lần kéo vào'], ['off', 'Giữ nguyên trên màn hình chính']].map(([k, l]) => `<label><input type="radio" name="cd" data-x="cd" data-id="${k}" ${C.cleanDesktop === k ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
   <div class="btnrow"><button class="btn" data-x="restore">Khôi phục tất cả về màn hình chính${META.backups ? ` (${META.backups})` : ''}</button><button class="btn" data-x="openbk">Mở thư mục sao lưu</button></div></div>
  <h4>Cảnh báo</h4>
  <div class="row"><div class="t"><b>Ổ C sắp đầy</b><span>Khi dung lượng trống dưới 10%</span></div>${tg('warnDisk', 'Cảnh báo ổ C')}</div>
  <div class="row"><div class="t"><b>RAM quá tải</b><span>Khi RAM trên 90% liên tục 5 phút</span></div>${tg('warnRam', 'Cảnh báo RAM')}</div>
  <div class="row"><div class="t"><b>Nhắc khởi động lại máy</b><span>Khi máy chạy liên tục quá 7 ngày</span></div>${tg('warnUptime', 'Nhắc khởi động lại')}</div>
  <h4>Dữ liệu</h4>
  <div class="row sub"><div class="t"><b>Sao lưu cấu hình</b><span>Danh sách app, nhóm, danh mục và cài đặt. Chép sang máy khác để dùng lại.</span></div><div class="btnrow"><button class="btn" data-x="export">Xuất ra file…</button><button class="btn" data-x="import">Nhập từ file…</button><button class="btn" data-x="data">Mở thư mục dữ liệu</button><button class="btn" data-x="scan">Quét lại app trên máy…</button></div></div>
  <h4>Giới thiệu</h4>
  <div class="row about"><div class="t"><b data-notr>Meow Launcher ${esc(verLabel())}</b><span>Bản thử nghiệm · Windows 10 / 11</span></div><span class="sig">${sigHTML()}</span></div>
  <div class="row"><div class="t"><b>Hướng dẫn sử dụng</b><span>Phím tắt, lệnh nhanh, công cụ và hỏi đáp</span></div><button class="btn" data-x="open" data-id="guide">Mở hướng dẫn</button></div>
  <div class="row"><div class="t"><b>Thoát hẳn</b><span>Tắt Meow Launcher, phím tắt sẽ không còn hoạt động</span></div><button class="btn danger" data-x="quit">Thoát Meow Launcher</button></div>
  </div>`;
}
const verLabel = () => String(META.version || '1.0.1-beta').replace(/-beta.*$/i, ' Beta');
const sigHTML = () => `<svg viewBox="0 0 64 64" aria-hidden="true">${PAW}</svg><span class="ver" data-notr>ver ${esc(verLabel())}</span><span class="dotsep">·</span><span class="by">Phát triển bởi</span> <b>Catmeow Team</b>`;

// ---------- cảnh báo ổ C ----------
function renderWarn() {
  const s = S.stats, w = $('#warn');
  const show = s && C.warnDisk && !S.warnHidden && s.cTotal && s.cFree / s.cTotal < 0.1 && S.tool !== 'clean' && S.tool !== 'settings' && S.tool !== 'guide';
  w.hidden = !show;
  if (show) w.innerHTML = `<span class="wi">!</span><span><b>Ổ C sắp đầy.</b> Còn trống ${fmt(s.cFree)} (${Math.round(s.cFree / s.cTotal * 100)}%).</span><button class="btn sm" data-w="clean">Dọn rác</button><button class="btn sm ghost" data-w="hide">Để sau</button>`;
}
async function pollStats() {
  if (!document.hidden) {
    const s = await api['sys:stats']();
    if (s && !s.error) {
      const first = !S.stats; S.stats = s;
      $('#sys').textContent = `CPU ${s.cpu}% · RAM ${fmt(s.ramUsed)} / ${fmt(s.ramTotal)}`;
      if (first) render(); else { renderWarn(); if (S.tool === 'proc') { const m = $$('.meter b'); if (m[0]) { m[0].textContent = s.cpu + '%'; m[1].textContent = `${fmt(s.ramUsed)} / ${fmt(s.ramTotal)}`; } } }
    }
  }
  setTimeout(pollStats, 2000);
}

// ---------- nguồn ----------
let timerIv;
function showPower(btn) {
  const r = btn.getBoundingClientRect();
  menu(r.right - 220, r.bottom + 4, [
    { label: 'Khoá máy', k: 'Win+L', act: () => doPower('lock') }, { label: 'Ngủ', act: () => doPower('sleep') },
    { label: 'Khởi động lại…', act: () => { confirmPower('restart'); } }, { label: 'Tắt máy…', act: () => { confirmPower('shutdown'); } }, '-',
    { sub: 'Hẹn giờ tắt máy' }, ...[15, 30, 60, 120].map((m) => ({ label: m < 60 ? `Sau ${m} phút` : `Sau ${m / 60} giờ`, act: () => doPower('timer', m) })),
    { label: 'Hẹn giờ khác…', act: async () => { const v = await askText('Hẹn giờ tắt máy', '45', 'Nhập số phút'); const n = Number(v); if (n > 0) doPower('timer', n); } },
    ...(META.shutdownAt ? [{ label: 'Huỷ hẹn giờ tắt máy', act: () => doPower('cancel') }] : []),
  ]);
}
async function confirmPower(a) {
  const L2 = a === 'restart' ? 'Khởi động lại' : 'Tắt máy';
  const ok = await modal({ title: `${L2} ngay?`, sub: 'Các app đang mở sẽ được yêu cầu lưu trước. Hãy lưu công việc dở dang.', ok: L2, danger: true });
  if (ok) doPower(a);
}
async function doPower(a, minutes) {
  const r = await api['sys:power'](a, minutes);
  if (a === 'timer') { META.shutdownAt = r.shutdownAt; updTimer(); toast(`Máy sẽ tắt sau ${minutes < 60 ? minutes + ' phút' : (minutes / 60) + ' giờ'}`); }
  else if (a === 'cancel') { META.shutdownAt = null; updTimer(); toast('Đã huỷ hẹn giờ tắt máy'); }
  else if (a === 'lock') toast('Đã khoá máy');
}
function updTimer() {
  const el = $('#timer'); clearInterval(timerIv);
  if (!META.shutdownAt || META.shutdownAt < Date.now()) { el.hidden = true; return; }
  el.hidden = false;
  const f = () => { const s = Math.max(0, Math.round((META.shutdownAt - Date.now()) / 1000)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; el.innerHTML = `Tắt máy sau ${h ? h + ':' + String(m).padStart(2, '0') : m}:${String(ss).padStart(2, '0')} <button id="tcx">Huỷ</button>`; if (!s) { clearInterval(timerIv); } };
  f(); timerIv = setInterval(f, 1000);
}

// ---------- quét app trên máy ----------
async function scanStartMenu() {
  toast('Đang quét Start Menu và màn hình chính…');
  const list = await api['scan:startmenu']();
  if (!Array.isArray(list) || !list.length) { toast('Không tìm thấy shortcut nào'); return; }
  const opts = (c) => L.cats.map((x) => `<option value="${x.id}" ${x.id === c ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  const body = `<div class="tbar"><input class="tin" id="scQ" placeholder="Lọc theo tên…"><button class="btn sm" id="scAll">Chọn hết</button><button class="btn sm" id="scNone">Bỏ chọn</button></div>
  <div class="picklist">${list.map((a, i) => `<label class="pick${a.have ? ' dim' : ''}" data-n="${esc(norm(a.name))}"><input type="checkbox" data-i="${i}" ${a.have ? 'disabled' : 'checked'}>${a.icon ? `<img src="${a.icon}" alt="">` : '<span></span>'}<span class="nm" title="${esc(a.path)}">${esc(a.name)}${a.have ? ' · đã có' : ''}</span><select data-c="${i}" ${a.have ? 'disabled' : ''}>${opts(a.cat)}</select></label>`).join('')}</div>`;
  const res = await modal({
    title: 'Thêm app từ máy', sub: `Tìm thấy ${list.length} shortcut. Bỏ chọn app không cần, chỉnh lại danh mục nếu Meow đoán sai.`, body, ok: 'Thêm các app đã chọn',
    onOpen: (m) => {
      $('#scQ', m).oninput = (e) => { const q = norm(e.target.value); $$('.pick', m).forEach((p) => (p.hidden = !p.dataset.n.includes(q))); };
      $('#scAll', m).onclick = () => $$('.pick:not([hidden]) input:not(:disabled)', m).forEach((c) => (c.checked = true));
      $('#scNone', m).onclick = () => $$('.pick:not([hidden]) input:not(:disabled)', m).forEach((c) => (c.checked = false));
    },
    collect: (m) => $$('input[data-i]:checked', m).map((c) => ({ p: list[+c.dataset.i].path, cat: $(`select[data-c="${c.dataset.i}"]`, m).value })),
  });
  if (!res || !res.length) return;
  const byCat = {}; res.forEach((r) => (byCat[r.cat] = byCat[r.cat] || []).push(r.p));
  let added = 0;
  const prev = C.cleanDesktop;
  for (const [c, ps] of Object.entries(byCat)) { const r = await api['apps:add'](ps, c); added += r.added ? r.added.length : 0; }
  const st = await api.state(); L = st.lib; META.backups = st.backups; render();
  toast(`Đã thêm ${added} app` + (prev === 'move' ? ' · shortcut trên màn hình chính đã được dọn vào thư mục sao lưu' : ''));
}

// ---------- nhóm app ----------
async function editGroup(g) {
  const isNew = !g || !!g._new; g = g || { id: 'g' + Date.now().toString(36), name: '', apps: [] }; delete g._new;
  const apps = [...L.apps].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  const body = `<input class="tin" id="gName" placeholder="Tên nhóm, ví dụ: Vào ca làm việc" value="${esc(g.name)}"><input class="tin" id="gQ" placeholder="Lọc app…"><div class="picklist">${apps.map((a) => `<label class="pick" data-n="${esc(norm(a.name))}"><input type="checkbox" data-id="${a.id}" ${g.apps.includes(a.id) ? 'checked' : ''}>${a.icon ? `<img src="${a.icon}" alt="">` : '<span></span>'}<span class="nm">${esc(a.name)}</span><span></span></label>`).join('')}</div>`;
  const r = await modal({ title: isNew ? 'Tạo nhóm app' : 'Sửa nhóm', sub: 'Bấm vào nhóm sẽ mở tất cả app đã chọn.', body, ok: isNew ? 'Tạo nhóm' : 'Lưu',
    onOpen: (m) => { $('#gQ', m).oninput = (e) => { const q = norm(e.target.value); $$('.pick', m).forEach((p) => (p.hidden = !p.dataset.n.includes(q))); }; },
    collect: (m) => ({ name: $('#gName', m).value.trim(), apps: $$('input[data-id]:checked', m).map((c) => c.dataset.id) }) });
  if (!r) return;
  if (!r.name || !r.apps.length) { toast('Cần đặt tên và chọn ít nhất 1 app'); return; }
  g.name = r.name; g.apps = r.apps;
  if (isNew) L.groups.push(g);
  await saveLib(); render(); toast(isNew ? `Đã tạo nhóm ${g.name}` : 'Đã lưu nhóm');
}

// ---------- danh mục ----------
const CAT_COLORS = ['#2f6fd6', '#7a52c7', '#c73d7d', '#0b7a75', '#b4471e', '#1f8a5b', '#8b6b2e', '#5b6bd6', '#d79a1d', '#4a6b80'];
async function addCategory() {
  const n = await askText('Thêm danh mục', '', 'Ví dụ: Kế toán, Học tập, Máy in…'); if (!n) return;
  const c = { id: 'c' + Date.now().toString(36), name: n, color: CAT_COLORS[L.cats.length % CAT_COLORS.length], glyph: 'folder' };
  L.cats.push(c); await saveLib(); S.cat = c.id; render(); toast(`Đã thêm danh mục ${n}`);
}
async function moveToCat(a) {
  const body = `<div class="radiolist">${L.cats.map((c) => `<label><input type="radio" name="mc" value="${c.id}" ${a.cat === c.id ? 'checked' : ''}><span class="ci" style="--c:${c.color}">${SVG(GLYPH[c.glyph] || GLYPH.folder)}</span>${esc(c.name)}</label>`).join('')}</div>`;
  const r = await modal({ title: `Chuyển ${esc(a.name)} sang danh mục`, body, ok: 'Chuyển', collect: (m) => $('input[name=mc]:checked', m)?.value });
  if (!r) return; a.cat = r; await saveLib(); render(); toast(`Đã chuyển sang ${cat(r).name}`);
}

// ---------- phím tắt toàn cục: ghi phím ----------
function captureHotkey(btn) {
  const key = btn.dataset.hk; btn.classList.add('rec'); btn.textContent = 'Nhấn tổ hợp phím…';
  const done = async (acc) => {
    document.removeEventListener('keydown', kd, true); btn.classList.remove('rec');
    if (!acc) { btn.textContent = hkText(C[key]); return; }
    const r = await saveConfig({ [key]: acc });
    const okMain = key === 'hotkey' ? r.hotkeys?.main : r.hotkeys?.clip;
    btn.textContent = hkText(C[key]);
    toast(okMain ? `Đã đổi phím tắt thành ${hkText(acc)}` : `Phím ${hkText(acc)} đang bị app khác dùng, chọn tổ hợp khác`);
    $('#hkHint').innerHTML = hkLabel(C.hotkey);
  };
  const kd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.key === 'Escape') return done(null);
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
    const mods = []; if (e.ctrlKey) mods.push('Ctrl'); if (e.altKey) mods.push('Alt'); if (e.shiftKey) mods.push('Shift'); if (e.metaKey) mods.push('Super');
    let k = e.code.startsWith('Key') ? e.code.slice(3) : e.code.startsWith('Digit') ? e.code.slice(5) : /^F\d+$/.test(e.key) ? e.key : ({ Space: 'Space', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', Backquote: '`', Enter: 'Enter', Tab: 'Tab' })[e.code] || null;
    if (!k || (!mods.length && !/^F\d+$/.test(k))) { btn.textContent = 'Cần có Ctrl, Alt hoặc Shift…'; return; }
    done([...mods, k].join('+'));
  };
  document.addEventListener('keydown', kd, true);
}

// ---------- sự kiện click ----------
document.addEventListener('click', async (e) => {
  const t = e.target;
  if (!$('#menu').contains(t)) $('#menu').hidden = true;
  if (t.closest('#tcx')) return doPower('cancel');
  if (t.closest('#pwr')) { e.stopPropagation(); return showPower(t.closest('#pwr')); }
  if (t.closest('#popExpand')) { await saveConfig({ mode: 'window' }); render(); return toast('Đã chuyển sang cửa sổ thường'); }
  if (t.closest('#popTools')) return S.tool && S.tool !== 'settings' && S.tool !== 'guide' ? (S.tool = null, render()) : openTool('hub');
  if (t.closest('#popSet')) return S.tool === 'settings' ? (S.tool = null, render()) : openTool('settings');
  if (t.closest('#popHelp')) return S.tool === 'guide' ? (S.tool = null, render()) : openTool('guide');
  const pc = t.closest('.pchip'); if (pc) { S.tool = null; S.cat = pc.dataset.cat; S.q = ''; $('#q').value = ''; S.sel = 0; S.cmds = []; return render(); }
  if (t.closest('#helpBtn')) return S.tool === 'guide' ? (S.tool = null, render()) : openTool('guide');
  const gg = t.closest('[data-go]'); if (gg) return openTool(gg.dataset.go);
  const gt = t.closest('[data-try]'); if (gt) { const q = $('#q'); S.tool = null; q.value = gt.dataset.try; S.q = q.value; S.sel = 0; onSearch(); q.focus(); $('#scroll').scrollTop = 0; return; }
  if (t.closest('#setBtn')) return S.tool === 'settings' ? (S.tool = null, render()) : openTool('settings');
  if (t.closest('#bMin')) return api['win:min']();
  if (t.closest('#bMax')) return api['win:max']();
  if (t.closest('#bClose')) return api['win:hide']();
  if (t.closest('#railBtn')) return $('#win').classList.toggle('rail');
  if (t.closest('#addBtn')) { const r = t.closest('#addBtn').getBoundingClientRect(); e.stopPropagation(); return menu(r.left, r.top - 170, [{ label: 'Chọn file app / shortcut…', act: async () => addResult(await api['apps:pick'](S.cat), null) }, { label: 'Thêm thư mục…', act: async () => addResult(await api['apps:pickFolder'](S.cat), null) }, { label: 'Quét app trên máy…', act: () => scanStartMenu() }, '-', { label: 'Thêm danh mục…', act: () => addCategory() }]); }
  const sk = t.closest('[data-skin-pick]'); if (sk) { await saveConfig({ skin: sk.dataset.skinPick }); applySkin(); render(); return; }
  const hk = t.closest('[data-hk]'); if (hk) return captureHotkey(hk);
  const ct = t.closest('.cat'); if (ct) { if (ct.dataset.tool) return openTool(ct.dataset.tool); S.tool = null; S.cat = ct.dataset.cat; S.q = ''; $('#q').value = ''; S.sel = 0; S.cmds = []; return render(); }
  const w = t.closest('[data-w]'); if (w) { if (w.dataset.w === 'clean') openTool('clean'); else { S.warnHidden = true; renderWarn(); } return; }
  const act = t.closest('[data-act]'); if (act) { if (act.dataset.act === 'scan') scanStartMenu(); if (act.dataset.act === 'pick') addResult(await api['apps:pick'](S.cat)); return; }
  const cm = t.closest('[data-cmd]'); if (cm) return runCmd(S.cmds[+cm.dataset.cmd]);
  const f = t.closest('[data-f]'); if (f) { const it = S.files[+f.dataset.f]; api['files:open'](it.p); toast('Đang mở ' + it.n); if (C.autoHide) setTimeout(() => api['win:hide'](), 250); return; }
  const g = t.closest('[data-g]'); if (g) { if (g.dataset.g === 'new') return editGroup(null); const gr = L.groups.find((x) => x.id === g.dataset.g); if (gr) launchGroup(gr); return; }
  const a = t.closest('.app,.chip'); if (a && a.dataset.id) return launch(a.dataset.id, e.ctrlKey);
  const x = t.closest('[data-x]'); if (x) return toolAction(x.dataset.x, x.dataset.id, x);
});
document.addEventListener('change', (e) => {
  const d = e.target.dataset;
  if (d.j) { T.junk.find((j) => j.id === d.j).on = e.target.checked; render(); }
  if (d.p) { e.target.checked ? T.pr.sel.add(d.p) : T.pr.sel.delete(d.p); render(); }
  if (d.x === 'cd') saveConfig({ cleanDesktop: d.id });
});
document.addEventListener('input', (e) => {
  const id = e.target.id;
  if (id === 'q') { S.q = e.target.value; S.sel = 0; if (S.q.trim()) S.tool = null; onSearch(); return; }
  if (id === 'unQ') T.un.q = e.target.value; else if (id === 'clQ') T.clq = e.target.value; else return;
  renderTool(); const i = $('#' + id); i.focus(); i.setSelectionRange(i.value.length, i.value.length);
});
async function toolAction(x, id, el) {
  switch (x) {
    case 'open': return openTool(id);
    case 'home': S.tool = null; return render();
    case 'jscan': return scanJunk();
    case 'jask': T.cl.confirm = true; return render();
    case 'jcancel': T.cl.confirm = false; return render();
    case 'jgo': return cleanJunk();
    case 'ptab': T.pr.tab = id; return render();
    case 'kill': return killNames([id]);
    case 'killsel': return killNames([...T.pr.sel]);
    case 'explorer': await api['sys:explorer'](); return toast('Đã khởi động lại Windows Explorer');
    case 'st': { const it = T.startup[+id]; const on = !it.on; const r = await api['sys:startupToggle'](it, on); if (r.ok) { it.on = on; toast(`${on ? 'Đã bật' : 'Đã tắt'} ${it.name.replace(/\.lnk$/i, '')} khi khởi động`); } else toast(r.cancelled ? 'Đã huỷ ở hộp xác nhận Admin' : 'Không đổi được, thử lại với quyền Admin'); return render(); }
    case 'streload': T.startup = null; render(); return loadTool('startup');
    case 'unsort': T.un.sort = id; return render();
    case 'unask': T.un.confirm = +id; return render();
    case 'uncancel': T.un.confirm = null; return render();
    case 'ungo': { const a = T.inst[+id]; T.un.confirm = null; await api['sys:uninstall'](a.un); toast(`Đã mở trình gỡ của ${a.name}. Làm theo hướng dẫn trên màn hình.`); setTimeout(async () => { T.inst = await api['sys:installed'](); if (S.tool === 'uninst') render(); }, 15000); return render(); }
    case 'fix': { T.fx[id] = 'run'; render(); const r = await api['sys:fix'](id); T.fx[id] = r.ok ? 'done' : r.cancelled ? 'cancel' : 'done'; if (S.tool === 'fix') render(); return; }
    case 'restart': return confirmPower('restart');
    case 'cpv': { const row = infoRows()[+id]; api.copy(row[1]); return toast('Đã copy ' + row[0]); }
    case 'cpall': { api.copy(infoRows().map((r) => r.join(': ')).concat((T.info.disks || []).map((d) => `Ổ ${d.l} ${d.n}: trống ${fmt(d.free)} / ${fmt(d.size)}`)).join('\n')); return toast('Đã copy toàn bộ thông tin máy'); }
    case 'clcp': await api['clips:copy'](CL[+id].t); return toast('Đã copy lại vào clipboard');
    case 'clpin': CL[+id].pin = !CL[+id].pin; CL = await api['clips:set'](CL); return render();
    case 'cldel': CL.splice(+id, 1); CL = await api['clips:set'](CL); return render();
    case 'clclear': CL = await api['clips:set'](CL.filter((c) => c.pin)); render(); return toast('Đã xoá, giữ lại các mục đã ghim');
    case 'win': api['sys:wintool'](id); return toast('Đang mở ' + (WINT.find((w) => w[0] === id) || [])[1]);
    case 'mode': await saveConfig({ mode: id }); return render();
    case 'lang': if (C.lang === id) return; await saveConfig({ lang: id }); return location.reload();
    case 'cfg': await saveConfig({ [id]: !C[id] }); return render();
    case 'restore': { const n = await api['desktop:restore'](); META.backups = (await api.state()).backups; render(); return toast(n ? `Đã trả ${n} shortcut về màn hình chính` : 'Không có shortcut nào cần khôi phục'); }
    case 'openbk': return api['desktop:openBackup']();
    case 'export': { const p = await api['config:export'](); if (p) toast('Đã lưu cấu hình'); return; }
    case 'import': { const ok = await api['config:import'](); if (ok) { await reload(); toast('Đã nhập cấu hình'); } return; }
    case 'data': return api['data:open']();
    case 'scan': return scanStartMenu();
    case 'quit': { const ok = await modal({ title: 'Thoát Meow Launcher?', sub: 'Phím tắt và lịch sử copy sẽ ngừng hoạt động cho tới khi mở lại app.', ok: 'Thoát', danger: true }); if (ok) api['win:quit'](); return; }
  }
}

// ---------- chuột phải ----------
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const a = e.target.closest('.app,.chip');
  if (a && a.dataset.id) {
    const app = L.apps.find((x) => x.id === a.dataset.id); if (!app) return;
    return menu(e.clientX, e.clientY, [
      { label: 'Mở', k: 'Enter', act: () => launch(app.id) }, { label: 'Chạy với quyền Admin', k: 'Ctrl+Enter', act: () => launch(app.id, true) }, { label: 'Mở thư mục chứa', act: () => api['apps:folder'](app.id) }, '-',
      { label: app.fav ? 'Bỏ ghim khỏi Yêu thích' : 'Ghim vào Yêu thích', act: async () => { app.fav = !app.fav; await saveLib(); render(); } },
      { label: 'Chuyển danh mục…', act: () => moveToCat(app) },
      { label: 'Thêm vào nhóm…', act: () => addToGroup(app) },
      { label: 'Đổi tên…', act: async () => { const n = await askText('Đổi tên app', app.name); if (n) { app.name = n; await saveLib(); render(); } } },
      { label: 'Làm mới icon', act: async () => { app.icon = await api['apps:refreshIcon'](app.id); render(); } }, '-',
      { label: 'Xoá khỏi launcher', k: 'Del', danger: true, act: () => removeApp(app.id) },
    ]);
  }
  const g = e.target.closest('[data-g]');
  if (g && g.dataset.g !== 'new') {
    const gr = L.groups.find((x) => x.id === g.dataset.g);
    return menu(e.clientX, e.clientY, [{ label: 'Mở cả nhóm', act: () => launchGroup(gr) }, { label: 'Sửa nhóm…', act: () => editGroup(gr) }, { label: 'Xoá nhóm', danger: true, act: async () => { L.groups = L.groups.filter((x) => x !== gr); await saveLib(); render(); } }]);
  }
  const c = e.target.closest('.cat[data-cat]');
  if (c && !['all', 'fav'].includes(c.dataset.cat)) {
    const ca = L.cats.find((x) => x.id === c.dataset.cat);
    return menu(e.clientX, e.clientY, [
      { label: 'Đổi tên danh mục…', act: async () => { const n = await askText('Đổi tên danh mục', ca.name); if (n) { ca.name = n; await saveLib(); render(); } } },
      { label: 'Thêm danh mục mới…', act: () => addCategory() },
      { label: 'Xoá danh mục', danger: true, act: async () => {
        if (L.cats.length <= 1) return toast('Cần giữ lại ít nhất 1 danh mục');
        const rest = L.cats.filter((x) => x !== ca); const to = rest.find((x) => x.id === 'tools') || rest[0];
        const n = L.apps.filter((a) => a.cat === ca.id).length;
        const ok = await modal({ title: `Xoá danh mục ${esc(ca.name)}?`, sub: n ? `${n} app trong danh mục sẽ được chuyển sang ${esc(to.name)}.` : 'Danh mục đang trống.', ok: 'Xoá', danger: true });
        if (!ok) return; L.apps.forEach((a) => { if (a.cat === ca.id) a.cat = to.id; }); L.cats = rest; if (S.cat === ca.id) S.cat = 'all'; await saveLib(); render();
      } },
    ]);
  }
  if (c && ['all', 'fav'].includes(c.dataset.cat)) return menu(e.clientX, e.clientY, [{ label: 'Thêm danh mục mới…', act: () => addCategory() }]);
});
async function addToGroup(app) {
  if (!L.groups.length) return editGroup({ id: 'g' + Date.now().toString(36), name: '', apps: [app.id], _new: true });
  const body = `<div class="radiolist">${L.groups.map((g) => `<label><input type="radio" name="ag" value="${g.id}">${esc(g.name)}</label>`).join('')}<label><input type="radio" name="ag" value="__new">+ Tạo nhóm mới</label></div>`;
  const r = await modal({ title: `Thêm ${esc(app.name)} vào nhóm`, body, ok: 'Thêm', collect: (m) => $('input[name=ag]:checked', m)?.value });
  if (!r) return;
  if (r === '__new') return editGroup({ id: 'g' + Date.now().toString(36), name: '', apps: [app.id], _new: true });
  const g = L.groups.find((x) => x.id === r); if (!g.apps.includes(app.id)) g.apps.push(app.id); await saveLib(); render(); toast(`Đã thêm vào nhóm ${g.name}`);
}

// ---------- bàn phím ----------
document.addEventListener('keydown', (e) => {
  if (!$('#modal').hidden) return;
  const q = $('#q');
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); q.focus(); q.select(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); openTool('settings'); return; }
  if (e.key === 'Escape') {
    if (!$('#menu').hidden) { $('#menu').hidden = true; return; }
    if (S.q) { S.q = ''; q.value = ''; S.cmds = []; S.files = []; render(); return; }
    if (S.tool) { S.tool = null; render(); return; }
    api['win:hide'](); return;
  }
  if (S.tool) return;
  const inInput = e.target.tagName === 'INPUT' && e.target !== q;
  if (inInput) return;
  if (e.key === 'Enter' && document.activeElement === q && S.cmds.length && (!visible().length || e.altKey || S.cmds[0].k === 'calc' || S.cmds[0].k === 'ip')) { e.preventDefault(); runCmd(S.cmds[0]); return; }
  const list = visible();
  if (e.key === 'Delete' && document.activeElement !== q && list[S.sel]) { removeApp(list[S.sel].id); return; }
  if (list.length) {
    const g = $('#grid'); const cols = C.view === 'list' || !g ? 1 : Math.max(1, Math.floor(g.clientWidth / 116));
    const mv = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (mv && !(document.activeElement === q && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && q.value)) { e.preventDefault(); S.sel = Math.min(list.length - 1, Math.max(0, S.sel + mv)); renderHome(); $('.app.sel')?.scrollIntoView({ block: 'nearest' }); return; }
    if (e.key === 'Enter') { e.preventDefault(); launch(list[S.sel].id, e.ctrlKey); return; }
  } else if (e.key === 'Enter' && S.cmds.length) { e.preventDefault(); runCmd(S.cmds[0]); return; }
  // gõ chữ ở đâu cũng nhảy vào ô tìm kiếm
  if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && document.activeElement !== q) { q.focus(); }
});
$('#vGrid').onclick = () => { saveConfig({ view: 'grid' }); C.view = 'grid'; $('#vGrid').setAttribute('aria-pressed', 'true'); $('#vList').setAttribute('aria-pressed', 'false'); render(); };
$('#vList').onclick = () => { saveConfig({ view: 'list' }); C.view = 'list'; $('#vList').setAttribute('aria-pressed', 'true'); $('#vGrid').setAttribute('aria-pressed', 'false'); render(); };

// ---------- kéo thả ----------
let dc = 0; const win = $('#win');
function showDrop(n) {
  $('#zones').innerHTML = L.cats.map((c) => `<div class="z" data-cat="${c.id}"><span class="dot" style="width:10px;height:10px;border-radius:3px;background:${c.color}"></span>${esc(c.name)}</div>`).join('');
  $('#dropfiles').innerHTML = `<span class="ic" style="width:56px;height:56px;background:none;box-shadow:none">${ICON()}</span>`;
  $('#dropTitle').textContent = n ? `Thả vào đây để thêm ${n} mục` : 'Thả vào đây để thêm app';
  $('#dropSub').textContent = C.cleanDesktop === 'move' ? 'Shortcut từ màn hình chính sẽ được chuyển vào thư mục sao lưu. Thả lên danh mục bên trái để chọn luôn.' : 'Meow tự đoán danh mục. Thả lên một danh mục bên trái để chọn luôn.';
  $('#drop').hidden = false;
}
win.addEventListener('dragenter', (e) => { if (!e.dataTransfer.types.includes('Files')) return; e.preventDefault(); if (dc++ === 0) showDrop(e.dataTransfer.items?.length); });
win.addEventListener('dragleave', () => { if (--dc <= 0) { dc = 0; $('#drop').hidden = true; } });
win.addEventListener('dragover', (e) => { e.preventDefault(); $$('#zones .z').forEach((z) => z.classList.toggle('hot', z.contains(e.target))); });
win.addEventListener('drop', async (e) => {
  e.preventDefault(); dc = 0; $('#drop').hidden = true;
  const z = e.target.closest('#zones .z');
  const paths = [...e.dataTransfer.files].map((f) => api.pathOf(f)).filter(Boolean);
  if (!paths.length) return;
  const c = z ? z.dataset.cat : (S.cat !== 'all' && S.cat !== 'fav' ? S.cat : null);
  toast('Đang thêm…');
  addResult(await api['apps:add'](paths, c), c ? cat(c).name : null);
});

// ---------- màu ----------
function sysDark() { return matchMedia('(prefers-color-scheme: dark)').matches; }
function applySkin() { document.documentElement.setAttribute('data-skin', C.skin === 'auto' ? (sysDark() ? 'mun' : 'cam') : C.skin); }
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySkin);

// ---------- khởi chạy ----------
async function reload() {
  const st = await api.state();
  C = st.config; L = st.lib; CL = st.clips || []; META = { version: st.version, backups: st.backups, shutdownAt: st.shutdownAt, dataDir: st.dataDir };
  applySkin();
  if (window.I18N) I18N.set(C.lang || 'vi');
  $('#sig').innerHTML = sigHTML();
  $('#hkHint').innerHTML = hkLabel(C.hotkey);
  $('#vGrid').setAttribute('aria-pressed', C.view !== 'list'); $('#vList').setAttribute('aria-pressed', C.view === 'list');
  updTimer(); render();
}
api.on('clips', (c) => { CL = c; if (S.tool === 'clip') renderToolKeepScroll(); });
api.on('toast', (m) => toast(m));
api.on('mode', (m) => { C.mode = m; render(); });
api.on('max', () => {});
api.on('shown', (view) => {
  if (view) openTool(view);
  else if (C.mode === 'popup' || !S.tool) { const q = $('#q'); q.focus(); q.select(); }
  if (S.tool === 'proc') pollProcs();
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.tool === 'proc') pollProcs(); });
$('#logo').innerHTML = ICON();
$('#setBtn').innerHTML = SVG(GLYPH.gear);
$('#popSet').innerHTML = SVG(GLYPH.gear);
$('#popTools').innerHTML = SVG(GLYPH.hub);
$('#popExpand').innerHTML = SVG('<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>');
function showLangPick() {
  const pref = C.langSuggest || ((navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en');
  const el = $('#langPick');
  const mini = (v) => `<span class="lp-mini" style="${v}">${ICON()}</span>`;
  const trail = [0, 1, 2, 3, 4].map((i) => `<svg class="lp-paw" style="--i:${i}" viewBox="0 0 64 64" aria-hidden="true">${PAW}</svg>`).join('');
  el.innerHTML = `<div class="lp-box" role="dialog" aria-label="Chọn ngôn ngữ · Choose your language">
    <div class="lp-hero"><div class="lp-ico">${ICON()}</div><div class="lp-bubble">Xin chào!<br><span>Hello!</span></div></div>
    <h2>Meow! Bạn nói tiếng gì?</h2><p>Meow! Which language do you speak?</p>
    <div class="lp-opts">
      <button class="lp-opt${pref === 'vi' ? ' pref' : ''}" data-lang="vi">${mini('--ico1:#ffb862;--ico2:#ec672b;--ico-paw:#fff;--ico-ear:#ffd3dc;--ico-stroke:transparent')}<span class="lp-t"><b>Xin chào</b><span>Tiếng Việt</span></span><i class="lp-check">✓</i></button>
      <button class="lp-opt${pref === 'en' ? ' pref' : ''}" data-lang="en">${mini('--ico1:#ffffff;--ico2:#dde3ec;--ico-paw:#f397b2;--ico-ear:#ffc9d6;--ico-stroke:rgba(30,45,70,.18)')}<span class="lp-t"><b>Hello</b><span>English</span></span><i class="lp-check">✓</i></button>
    </div>
    <div class="lp-trail" aria-hidden="true">${trail}</div>
    <small>Đổi lại bất cứ lúc nào trong Cài đặt · Change it anytime in Settings</small></div>`;
  el.hidden = false; api['dialog:open'](true);
  el.onclick = async (e) => { const b = e.target.closest('[data-lang]'); if (!b) return; b.classList.add('picked'); await saveConfig({ lang: b.dataset.lang }); api['dialog:open'](false); setTimeout(() => location.reload(), 280); };
  el.onkeydown = (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const o = $$('.lp-opt', el); const k = o.indexOf(document.activeElement); o[(k + 1) % 2].focus(); } };
  setTimeout(() => el.querySelector('.lp-opt.pref')?.focus(), 50);
}
reload().then(() => { if (!C.lang) showLangPick(); else $('#q').focus(); pollStats(); });
