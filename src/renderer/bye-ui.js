// Meow Launcher — giao diện "Bạn muốn xoá Meow thật hả?"
'use strict';
(function () {
  const q = new URLSearchParams(location.search);
  const lang = q.get('lang') === 'en' ? 'en' : 'vi';
  const skin = q.get('skin') || 'auto';
  const n = (k) => Number(q.get(k)) || 0;
  document.documentElement.lang = lang;
  const applySkin = () => document.documentElement.setAttribute('data-skin', skin === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'mun' : 'cam') : skin);
  applySkin();
  const T = {
    vi: { title: 'Bạn muốn xoá Meow thật hả?', sub: 'Meow sẽ nhớ bạn nhiều lắm đó…', keep: 'Meow đang giữ giúp bạn:', apps: (x) => `<b>${x}</b> app đã xếp gọn`, groups: (x) => `<b>${x}</b> nhóm app`, clips: (x) => `<b>${x}</b> lần copy`,
      stay: 'Ở lại với Meow', go: 'Vẫn xoá Meow', sad: 'Huhu…', cry: 'Đừng mà…', happy: 'Yay!', wave: 'Bye bye!',
      stayTitle: 'Yay! Meow ở lại với bạn nha!', staySub: 'Không xoá gì hết. Meow tiếp tục chạy ở khay hệ thống.', goTitle: 'Hẹn gặp lại nha…', goSub: 'Meow sẽ dọn dẹp gọn gàng trước khi đi.', close: 'Đóng' },
    en: { title: 'Do you really want to delete Meow?', sub: 'Meow will miss you so much…', keep: 'Meow is looking after:', apps: (x) => `<b>${x}</b> app${x === 1 ? '' : 's'} sorted`, groups: (x) => `<b>${x}</b> app group${x === 1 ? '' : 's'}`, clips: (x) => `<b>${x}</b> cop${x === 1 ? 'y' : 'ies'}`,
      stay: 'Stay with Meow', go: 'Delete Meow anyway', sad: 'Sniff…', cry: 'Don’t go…', happy: 'Yay!', wave: 'Bye bye!',
      stayTitle: 'Yay! Meow is staying with you!', staySub: 'Nothing was deleted. Meow keeps running in the system tray.', goTitle: 'See you again…', goSub: 'Meow will tidy up before leaving.', close: 'Close' },
  }[lang];
  const $ = (id) => document.getElementById(id);
  const cat = $('cat'), bubble = $('bubble');
  let locked = false;
  function mood(m) {
    if (cat.dataset.mood === m) return;
    cat.dataset.mood = m;
    bubble.textContent = T[m];
    bubble.style.animation = 'none'; void bubble.offsetWidth; bubble.style.animation = '';
  }
  $('title').textContent = T.title;
  $('sub').textContent = T.sub;
  $('stayT').textContent = T.stay;
  $('go').textContent = T.go;
  $('x').title = T.close; $('x').setAttribute('aria-label', T.close);
  const chips = [['apps', n('apps')], ['groups', n('groups')], ['clips', n('clips')]].filter(([, v]) => v > 0);
  $('keep').innerHTML = chips.length ? chips.map(([k, v]) => `<span>${T[k](v)}</span>`).join('') : '';
  mood('sad');

  const stay = $('stay'), go = $('go');
  stay.addEventListener('mouseenter', () => !locked && mood('happy'));
  go.addEventListener('mouseenter', () => !locked && mood('cry'));
  [stay, go].forEach((b) => b.addEventListener('mouseleave', () => !locked && mood('sad')));
  function chooseStay() {
    if (locked) return; locked = true; mood('happy');
    $('title').textContent = T.stayTitle; $('sub').textContent = T.staySub; $('acts').classList.add('done');
    setTimeout(() => window.bye.done(13), 1600);
  }
  function chooseGo() {
    if (locked) return; locked = true; mood('wave');
    $('title').textContent = T.goTitle; $('sub').textContent = T.goSub; $('acts').classList.add('done');
    setTimeout(() => window.bye.done(0), 1500);
  }
  stay.addEventListener('click', chooseStay);
  $('x').addEventListener('click', chooseStay);
  go.addEventListener('click', chooseGo);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') chooseStay(); });
  setTimeout(() => stay.focus(), 80);
})();
