const {Resvg}=require('@resvg/resvg-js');const fs=require('fs');const pngToIco=require('png-to-ico');
const PAW='<ellipse cx="17" cy="27" rx="5" ry="6.5" transform="rotate(-22 17 27)"/><ellipse cx="26.5" cy="17.5" rx="5" ry="6.8" transform="rotate(-8 26.5 17.5)"/><ellipse cx="37.5" cy="17.5" rx="5" ry="6.8" transform="rotate(8 37.5 17.5)"/><ellipse cx="47" cy="27" rx="5" ry="6.5" transform="rotate(22 47 27)"/><path d="M32 30c-7 0-13.8 7.4-15.4 13.8-1.4 5.7 2.7 9.2 7.4 9.2 3 0 5.2-1.6 8-1.6s5 1.6 8 1.6c4.7 0 8.8-3.5 7.4-9.2C45.8 37.4 39 30 32 30z"/>';
const SK={cam:['#ffb862','#ec672b','#ffffff','#ffd3dc','none'],trang:['#ffffff','#dde3ec','#f397b2','#ffc9d6','rgba(30,45,70,.25)'],hong:['#ffa3c4','#df568a','#ffffff','#ffe2ec','none'],xam:['#a6b6c7','#5c6e80','#ffffff','#dbe4ec','none'],mun:['#3d3843','#151218','#ffb547','#6a5560','rgba(255,255,255,.22)']};
const svg=([a,b,paw,ear,st],small)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${small?'7 2 50 59':'4 0 56 64'}"><defs><linearGradient id="g" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><path d="M9 24L11 5.5Q11.6 3 13.6 4.4L25 13h14l11.4-8.6Q52.4 3 53 5.5L55 24v25q0 11-11 11H20Q9 60 9 49z" fill="url(#g)" stroke="${st}" stroke-width="1.5"/><path d="M14.2 10.5l1 8.6 5.6-4.3z" fill="${ear}" opacity=".9"/><path d="M49.8 10.5l-1 8.6-5.6-4.3z" fill="${ear}" opacity=".9"/><g fill="${paw}" transform="translate(32 41) scale(${small?.66:.6}) translate(-32 -36)">${PAW}</g></svg>`;
const png=(s,w)=>new Resvg(s,{fitTo:{mode:'width',value:w},background:'rgba(0,0,0,0)'}).render().asPng();
(async()=>{
 for(const [k,v] of Object.entries(SK)){
   fs.writeFileSync(`build/icons/tray-${k}.png`,png(svg(v,true),16));
   fs.writeFileSync(`build/icons/tray-${k}@2x.png`,png(svg(v,true),32));
   fs.writeFileSync(`build/icons/app-${k}.png`,png(svg(v,false),256));
 }
 const sizes=[16,24,32,48,64,128,256];const bufs=sizes.map(s=>png(svg(SK.cam,s<=32),s));
 sizes.forEach((s,i)=>fs.writeFileSync(`/tmp/claude-0/ico-${s}.png`,bufs[i]));
 fs.writeFileSync('build/icon.ico',await pngToIco(sizes.map(s=>`/tmp/claude-0/ico-${s}.png`)));
 fs.writeFileSync('build/icon.png',bufs[6]);
 console.log('ok');
})();
