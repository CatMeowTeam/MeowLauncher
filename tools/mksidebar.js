// Vẽ ảnh bên trái của trình cài đặt / gỡ cài đặt (NSIS cần BMP 24-bit, tỉ lệ 164x314; vẽ gấp đôi cho màn hình độ phân giải cao)
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const FD = __dirname + '/';
const fontFiles = ['nunito-900.ttf', 'bvp-600.ttf'].map((f) => FD + f);
const PAW = '<ellipse cx="17" cy="27" rx="5" ry="6.5" transform="rotate(-22 17 27)"/><ellipse cx="26.5" cy="17.5" rx="5" ry="6.8" transform="rotate(-8 26.5 17.5)"/><ellipse cx="37.5" cy="17.5" rx="5" ry="6.8" transform="rotate(8 37.5 17.5)"/><ellipse cx="47" cy="27" rx="5" ry="6.5" transform="rotate(22 47 27)"/><path d="M32 30c-7 0-13.8 7.4-15.4 13.8-1.4 5.7 2.7 9.2 7.4 9.2 3 0 5.2-1.6 8-1.6s5 1.6 8 1.6c4.7 0 8.8-3.5 7.4-9.2C45.8 37.4 39 30 32 30z"/>';
const cat = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 64})">
  <path d="M9 24L11 5.5Q11.6 3 13.6 4.4L25 13h14l11.4-8.6Q52.4 3 53 5.5L55 24v25q0 11-11 11H20Q9 60 9 49z" fill="#fffaf6"/>
  <path d="M14.2 10.5l1 8.6 5.6-4.3z" fill="#ffc2d1"/><path d="M49.8 10.5l-1 8.6-5.6-4.3z" fill="#ffc2d1"/>
  <g fill="#f08a3c" transform="translate(32 41) scale(.6) translate(-32 -36)">${PAW}</g></g>`;
const paws = (op) => [[40, 520, -25, .5], [92, 470, -10, .42], [60, 404, -30, .36], [250, 560, 20, .55], [282, 492, 35, .4], [36, 40, -15, .36], [270, 90, 25, .44]]
  .map(([x, y, r, s]) => `<g fill="#fff" opacity="${op}" transform="translate(${x} ${y}) rotate(${r}) scale(${s}) translate(-32 -36)">${PAW}</g>`).join('');

function sidebar({ top, bottom, bubble, line1, line2 }) {
  line1 = line1.normalize('NFC'); line2 = line2.normalize('NFC');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="328" height="628" viewBox="0 0 328 628">
  <defs><linearGradient id="bg" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#7a2e0a" flood-opacity=".28"/></filter></defs>
  <rect width="328" height="628" fill="url(#bg)"/>
  <circle cx="40" cy="70" r="120" fill="#fff" opacity=".10"/><circle cx="300" cy="600" r="150" fill="#ff9ab4" opacity=".16"/>
  ${paws(.16)}
  <g filter="url(#sh)">${cat(84, 112, 160)}</g>
  <g transform="translate(212 92)"><rect x="0" y="0" width="98" height="46" rx="23" fill="#fff"/><path d="M22 42 L14 60 L36 44 Z" fill="#fff"/>
  <text x="49" y="31" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="#e8602a">${bubble}</text></g>
  <text x="164" y="356" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="52" fill="#fff">Meow</text>
  <text x="164" y="398" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="34" fill="#fff" opacity=".95">Launcher</text>
  <rect x="134" y="420" width="60" height="5" rx="2.5" fill="#fff" opacity=".6"/>
  <text x="164" y="462" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="600" font-size="19" fill="#fff">${line1}</text>
  <text x="164" y="490" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="600" font-size="16" fill="#fff" opacity=".85">${line2}</text>
  <text x="164" y="598" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="600" font-size="13" fill="#fff" opacity=".8">ver 2.0.0 · Catmeow Team</text>
  </svg>`;
}
const render = (svg, out) => {
  const png = new Resvg(svg, { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Nunito' }, fitTo: { mode: 'width', value: 328 } }).render().asPng();
  fs.writeFileSync(out, png);
};
render(sidebar({ top: '#ffb862', bottom: '#e8602a', bubble: 'Meow!', line1: 'Xin chào!', line2: 'Hello there!' }), '/tmp/claude-0/sb-install.png');
render(sidebar({ top: '#f7a6b8', bottom: '#d9603a', bubble: 'Bye!', line1: 'Hẹn gặp lại nha!', line2: 'See you again soon!' }), '/tmp/claude-0/sb-uninstall.png');
console.log('ok');
