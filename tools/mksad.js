// Mèo buồn vẫy tay cho trang gỡ cài đặt (BMP nền F0F0F0 trùng màu hộp thoại Windows)
const { Resvg } = require('@resvg/resvg-js'); const fs = require('fs');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 120 120">
<rect width="120" height="120" fill="#f0f0f0"/>
<ellipse cx="58" cy="108" rx="34" ry="5" fill="#000" opacity=".07"/>
<path d="M22 50 L25 18 Q26 14 29.5 16.5 L44 28 h28 L86.5 16.5 Q90 14 91 18 L94 50 v30 q0 22-22 22 H44 q-22 0-22-22z" fill="#fffaf6" stroke="#ec672b" stroke-width="3" stroke-linejoin="round"/>
<path d="M30 25 l1.5 13 8-6.5z" fill="#ffc2d1"/><path d="M86 25 l-1.5 13-8-6.5z" fill="#ffc2d1"/>
<path d="M40 62 q6 6 12 0" fill="none" stroke="#3a2a24" stroke-width="3" stroke-linecap="round"/>
<path d="M64 62 q6 6 12 0" fill="none" stroke="#3a2a24" stroke-width="3" stroke-linecap="round"/>
<path d="M78 70 q-3 6 0 9 q3-3 0-9z" fill="#7cc4f2"/>
<ellipse cx="38" cy="74" rx="6" ry="3.5" fill="#ffb3c4" opacity=".8"/><ellipse cx="78" cy="74" rx="6" ry="3.5" fill="#ffb3c4" opacity=".5"/>
<path d="M52 78 q3 3 6 0 q3 3 6 0" fill="none" stroke="#3a2a24" stroke-width="2.4" stroke-linecap="round"/>
<g transform="translate(100 66) rotate(18)"><rect x="-8" y="-4" width="16" height="22" rx="8" fill="#fffaf6" stroke="#ec672b" stroke-width="3"/>
<g fill="#ffc2d1"><circle cx="-3.5" cy="2" r="2"/><circle cx="3.5" cy="2" r="2"/><ellipse cx="0" cy="9" rx="4" ry="3"/></g></g>
<path d="M108 52 q4 4 4 9 M112 46 q6 6 6 14" fill="none" stroke="#ec672b" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
</svg>`;
fs.writeFileSync('/tmp/claude-0/sad.png', new Resvg(svg, { fitTo: { mode: 'width', value: 192 } }).render().asPng());
