// Meow Overlay — Catmeow Team
let lang = location.hash === '#en' ? 'en' : 'vi';
const T = {
  vi: { starting: 'Đang bật đo FPS…', asking: 'Bấm Có ở hộp Windows để đo FPS', denied: 'Chưa có quyền Admin nên chưa đo được FPS', error: 'Game này chưa đo được FPS', off: 'Đo FPS đang tắt trong Cài đặt', nofps: 'Mở game để xem FPS' },
  en: { starting: 'Starting FPS counter…', asking: 'Click Yes in the Windows prompt to count FPS', denied: 'FPS needs Administrator rights', error: 'Can’t count FPS for this game', off: 'FPS counter is off in Settings', nofps: 'Open a game to see FPS' },
};
const $ = (id) => document.getElementById(id);
const cls = (el, v, warn, hot) => { el.className = el.className.replace(/\s?(good|warn|hot)/g, '') + (v == null ? '' : v >= hot ? ' hot' : v >= warn ? ' warn' : ''); };
window.ov.onLang((l) => { lang = l === 'en' ? 'en' : 'vi'; });
window.ov.on((d) => {
  const f = $('fps');
  f.textContent = d.fps == null ? '–' : d.fps;
  f.className = d.fps == null ? '' : d.fps >= 55 ? 'good' : d.fps >= 30 ? 'warn' : 'hot';
  const t = T[lang];
  $('hint').textContent = d.fpsState === 'running' ? (d.fps == null ? t.nofps : (d.app || '')) : (t[d.fpsState] || '');
  $('cpu').textContent = d.cpu == null ? '–' : d.cpu + '%'; cls($('cpu'), d.cpu, 80, 95);
  $('gpu').textContent = d.gpu == null ? '–' : d.gpu + '%'; cls($('gpu'), d.gpu, 85, 98);
  $('ram').textContent = d.ram + '%'; cls($('ram'), d.ram, 80, 92);
  $('cpuT').textContent = d.cpuT == null ? '' : d.cpuT + '°C'; cls($('cpuT'), d.cpuT, 80, 90);
  $('gpuT').textContent = d.gpuT == null ? '' : d.gpuT + '°C'; cls($('gpuT'), d.gpuT, 80, 88);
});
