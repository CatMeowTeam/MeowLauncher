// Ảnh bìa README và dải icon theo màu
const { Resvg } = require('@resvg/resvg-js'); const fs = require('fs');
const out = process.argv[2];
const fontFiles = [__dirname + '/nunito-900.ttf', __dirname + '/bvp-600.ttf'];
const PAW = '<ellipse cx="17" cy="27" rx="5" ry="6.5" transform="rotate(-22 17 27)"/><ellipse cx="26.5" cy="17.5" rx="5" ry="6.8" transform="rotate(-8 26.5 17.5)"/><ellipse cx="37.5" cy="17.5" rx="5" ry="6.8" transform="rotate(8 37.5 17.5)"/><ellipse cx="47" cy="27" rx="5" ry="6.5" transform="rotate(22 47 27)"/><path d="M32 30c-7 0-13.8 7.4-15.4 13.8-1.4 5.7 2.7 9.2 7.4 9.2 3 0 5.2-1.6 8-1.6s5 1.6 8 1.6c4.7 0 8.8-3.5 7.4-9.2C45.8 37.4 39 30 32 30z"/>';
const icon = (x, y, s, [a, b, paw, ear, st], id) => `<g transform="translate(${x} ${y}) scale(${s / 64})"><defs><linearGradient id="${id}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><path d="M9 24L11 5.5Q11.6 3 13.6 4.4L25 13h14l11.4-8.6Q52.4 3 53 5.5L55 24v25q0 11-11 11H20Q9 60 9 49z" fill="url(#${id})" stroke="${st}" stroke-width="1.2"/><path d="M14.2 10.5l1 8.6 5.6-4.3z" fill="${ear}"/><path d="M49.8 10.5l-1 8.6-5.6-4.3z" fill="${ear}"/><g fill="${paw}" transform="translate(32 41) scale(.6) translate(-32 -36)">${PAW}</g></g>`;
const SK = { cam: ['#ffb862', '#ec672b', '#fff', '#ffd3dc', 'none'], trang: ['#ffffff', '#dde3ec', '#f397b2', '#ffc9d6', 'rgba(30,45,70,.25)'], hong: ['#ffa3c4', '#df568a', '#fff', '#ffe2ec', 'none'], xam: ['#a6b6c7', '#5c6e80', '#fff', '#dbe4ec', 'none'], mun: ['#3d3843', '#151218', '#ffb547', '#6a5560', 'rgba(255,255,255,.2)'] };
const paws = [[70, 320, -25, .7], [150, 360, -10, .55], [1180, 80, 25, .7], [1110, 360, 15, .6], [620, 380, -20, .45], [960, 330, 30, .5]].map(([x, y, r, s]) => `<g fill="#e8732c" opacity=".09" transform="translate(${x} ${y}) rotate(${r}) scale(${s}) translate(-32 -36)">${PAW}</g>`).join('');
const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="420" viewBox="0 0 1280 420">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4ec"/><stop offset="1" stop-color="#fde3ea"/></linearGradient>
<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#c0501a" flood-opacity=".28"/></filter></defs>
<rect width="1280" height="420" rx="28" fill="url(#bg)"/>
<circle cx="200" cy="40" r="220" fill="#ffb862" opacity=".18"/><circle cx="1180" cy="420" r="240" fill="#ff9ab4" opacity=".18"/>
${paws}
<g filter="url(#sh)">${icon(120, 86, 240, SK.cam, 'g0')}</g>
<g transform="translate(330 70)"><rect width="128" height="54" rx="27" fill="#fff"/><path d="M26 50 L16 72 L44 52 Z" fill="#fff"/><text x="64" y="37" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="26" fill="#e8602a">Meow!</text></g>
<text x="440" y="200" font-family="Nunito" font-weight="900" font-size="92" fill="#2b1f1b">Meow Launcher</text>
<text x="444" y="252" font-family="Be Vietnam Pro" font-weight="600" font-size="28" fill="#7a6862">Mở app theo thể loại chỉ với Alt + Space</text>
<text x="444" y="292" font-family="Be Vietnam Pro" font-weight="600" font-size="22" fill="#a08f88">A cute cat-themed launcher &amp; PC care tool for Windows</text>
<g transform="translate(444 322)"><rect width="196" height="40" rx="20" fill="#e8732c"/><text x="98" y="27" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="600" font-size="17" fill="#fff">ver 1.0.1 Beta</text></g>
<text x="660" y="349" font-family="Be Vietnam Pro" font-weight="600" font-size="17" fill="#a08f88">Phát triển bởi Catmeow Team</text>
</svg>`.normalize('NFC');
const strip = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="200" viewBox="0 0 900 200"><rect width="900" height="200" rx="24" fill="#faf6f4"/>
${Object.entries(SK).map(([k, v], i) => icon(60 + i * 168, 26, 110, v, 's' + i) + `<text x="${115 + i * 168}" y="172" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="600" font-size="20" fill="#5a4a44">${{ cam: 'Mướp', trang: 'Trắng', hong: 'Hồng', xam: 'Xám', mun: 'Mun' }[k]}</text>`).join('')}</svg>`.normalize('NFC');
const r = (s, w, f) => fs.writeFileSync(f, new Resvg(s, { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Be Vietnam Pro' }, fitTo: { mode: 'width', value: w } }).render().asPng());
r(banner, 1280, out + '/banner.png'); r(strip, 900, out + '/themes.png');
console.log('ok');
