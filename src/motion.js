// Общий слой динамики поверх любой части: камера в такт фразам, фон, номер на карточке ошибки, появление субтитров,
// укрупнение пустых сцен, плашка призыва (window.CTA), события для звука (sfxEvents).
// Подключается последним скриптом страницы и оборачивает render(t). Всё зависит только от t, рендер остаётся детерминированным.
// Настройки страницы (необязательные): window.CTA=[начало, конец]; window.STILL_FROM — с этого момента камера стоит;
// window.SFX — дополнительные звуки; WIPE — момент шторки во вступлении.
(function(){
const g=id=>document.getElementById(id);
const clp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const sg=(t,a,b)=>clp((t-a)/Math.max(b-a,1e-6));
const eOut=x=>x>=1?1:1-Math.pow(2,-10*x);
const eIO=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const DURA=typeof DUR!=='undefined'?DUR:30;

// сцена: во вступлении слои лежат прямо в body, собираем их в #stage
let stage=g('stage');
if(!stage){stage=document.createElement('div');stage.id='stage';
 const first=document.querySelector('.L');first.parentNode.insertBefore(stage,first);
 document.querySelectorAll('body > .L').forEach(l=>stage.appendChild(l));}
const css=document.createElement('style');css.textContent=`
#stage{position:absolute;inset:0;transform-origin:0 0}
#bgfx{position:absolute;inset:0;pointer-events:none;overflow:hidden}
#bgfx .grid{position:absolute;inset:-80px;background-image:linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px);background-size:80px 80px}
#bgfx .glow{position:absolute;width:1400px;height:1400px;border-radius:50%;background:radial-gradient(closest-side,rgba(227,52,47,.10),rgba(227,52,47,0))}
#bgfx .vig{position:absolute;inset:0;background:radial-gradient(ellipse 75% 70% at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%)}
.bignum{position:absolute;right:90px;top:50%;font-weight:900;font-size:760px;line-height:1;letter-spacing:-.05em;color:rgba(255,255,255,.13);pointer-events:none;transform:translateY(-50%)}
#card .k,#card .h,#next .k,#next .h{position:relative;z-index:1}
#cta{position:absolute;left:50%;top:470px;width:1180px;margin-left:-590px;transform:translateY(-50%);z-index:25;opacity:0;background:var(--surf);border:1px solid var(--line);border-top:8px solid var(--red);border-radius:22px;padding:44px 56px;box-shadow:0 30px 120px rgba(0,0,0,.6)}
#cta .t{font-size:62px;font-weight:900;line-height:1.1;letter-spacing:-.01em}
#cta .s{font-size:34px;color:#BDBDC2;margin-top:14px}
#cta .s b{color:#fff;background:var(--red);border-radius:10px;padding:2px 14px;font-weight:700}
#cta .row{display:flex;gap:14px;margin-top:34px}
#cta .row i{width:64px;height:64px;border-radius:12px;border:2px solid #3A3A3E;display:flex;align-items:center;justify-content:center;font-style:normal}
#cta .row i svg{opacity:0}`;
document.head.appendChild(css);
const bg=document.createElement('div');bg.id='bgfx';bg.innerHTML='<div class="grid"></div><div class="glow"></div><div class="vig"></div>';
document.body.insertBefore(bg,document.body.firstChild);

// карточка ошибки: огромный номер справа
const card=g('card')||g('next');let num=null;
if(card){num=document.createElement('div');num.className='bignum';card.appendChild(num)}
const cardNo=()=>{const k=card&&card.querySelector('.k');const m=k&&k.textContent.match(/(\d+)\s*из/);return m?m[1]:''};

// плашка призыва посреди ролика
let cta=null,dim=null;
if(window.CTA){cta=document.createElement('div');cta.id='cta';
 const ck='<svg width="38" height="38" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#F3F3F3" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 cta.innerHTML=`<div class="t">Все 12 пунктов — в чек-листе</div><div class="s"><b>Telegram-канал</b> &nbsp;ссылка в описании под видео</div><div class="row">${('<i>'+ck+'</i>').repeat(12)}</div>`;
 dim=document.createElement('div');dim.style.cssText='position:absolute;inset:0;background:#0C0C0D;z-index:24;opacity:0';
 document.body.appendChild(dim);document.body.appendChild(cta)}

// опорные моменты: начала фраз и уходы карточек
const beats=typeof T!=='undefined'?T.slice():(typeof SUBS!=='undefined'?SUBS.map(s=>s[0]):[]);
const wipe=typeof WIPE!=='undefined'?WIPE:28.9;
const outs=typeof CARDS!=='undefined'?CARDS.map(c=>c[1]):[wipe+.5];
const Z=[0,.035,.015,.045];
const base=window.render;

// кадрирование: фразы с одной и той же картинкой собираются в план, камера берёт план крупно,
// если его содержимое занимает малую часть кадра
const BOX=[150,165,1770,905], MAXS=1.35;
const layers=[...stage.children].filter(l=>l.classList.contains('L'));
const shots=[];   // [начало, s, tx, ty]
(function measure(){
 const ends=beats.map((b,i)=>i+1<beats.length?beats[i+1]:DURA);
 const look=t=>{base(t);const set=new Set(),bb=[1e9,1e9,-1e9,-1e9];
  stage.querySelectorAll('*').forEach(e=>{
   // у SVG-холста на весь кадр считаем сами фигуры, а не холст
   const inSvg=e.tagName!=='svg'&&!!e.closest('svg');if(e.tagName==='svg'||(inSvg&&!/^(path|line|rect|circle|ellipse|polyline|polygon|text)$/.test(e.tagName)))return;
   const r=e.getBoundingClientRect();if(inSvg?(r.width<1&&r.height<1):(r.width<1||r.height<1))return;
   if(inSvg&&(e.getAttribute('opacity')==='0'||getComputedStyle(e).opacity==='0'))return;
   if(!e.checkVisibility({opacityProperty:true,visibilityProperty:true}))return;
   let o=1;for(let x=e;x&&x!==stage;x=x.parentElement)o*=+getComputedStyle(x).opacity;if(o<.15)return;
   const st=getComputedStyle(e),own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
   if(!(own||inSvg||!e.children.length||st.backgroundColor!=='rgba(0, 0, 0, 0)'||st.backgroundImage!=='none'||parseFloat(st.borderTopWidth)>0))return;
   set.add(e);bb[0]=Math.min(bb[0],Math.max(r.left,0));bb[1]=Math.min(bb[1],Math.max(r.top,0));bb[2]=Math.max(bb[2],Math.min(r.right,1920));bb[3]=Math.max(bb[3],Math.min(r.bottom,1080))});
  return {set,bb}};
 const uni=(a,b)=>[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.max(a[3],b[3])];
 let cur=null,prevSet=null;
 beats.forEach((t0,i)=>{let bb=[1e9,1e9,-1e9,-1e9],first=null,last=null;
  for(let t=t0+.3;t<ends[i];t+=.25){const r=look(t);bb=uni(bb,r.bb);if(!first)first=r.set;last=r.set}
  if(!first){const r=look(t0);first=last=r.set;bb=r.bb}
  let same=false;if(prevSet&&first.size&&prevSet.size){let c=0;first.forEach(e=>{if(prevSet.has(e))c++});same=c/Math.min(first.size,prevSet.size)>=.5}
  if(same)cur.bb=uni(cur.bb,bb);else{cur={t:t0,bb};shots.push(cur)}
  prevSet=last});
 shots.forEach(sh=>{const b=sh.bb,w=b[2]-b[0],h=b[3]-b[1];sh.s=1;sh.tx=0;sh.ty=0;if(w<=0||h<=0)return;
  const s=Math.min((BOX[2]-BOX[0])/w,(BOX[3]-BOX[1])/h,MAXS);if(s<1.08)return;
  sh.s=s;sh.tx=(BOX[0]+BOX[2])/2-s*(b[0]+b[2])/2;sh.ty=(BOX[1]+BOX[3])/2-s*(b[1]+b[3])/2});
 window.SHOTS=shots.map(s=>[+s.t.toFixed(1),+s.s.toFixed(2),s.bb.map(Math.round)]);
})();
const frame=t=>{let i=-1;shots.forEach((s,k)=>{if(t>=s.t-.1)i=k});if(i<0)return {s:1,tx:0,ty:0};
 const c=shots[i];if(i===0)return c;const p=shots[i-1],q=eIO(sg(t,c.t-.1,c.t+.6));
 return {s:p.s+(c.s-p.s)*q,tx:p.tx+(c.tx-p.tx)*q,ty:p.ty+(c.ty-p.ty)*q}};

window.render=function(t){
 base(t);
 // камера: ступенька масштаба на каждую фразу + медленное плавание
 let k=-1;for(let i=0;i<beats.length;i++)if(t>=beats[i]-.1)k=i;
 let z=k<0?0:Z[k%4];
 if(k>0){const p=eIO(sg(t,beats[k]-.1,beats[k]+.6));z=Z[(k-1)%4]+(z-Z[(k-1)%4])*p}
 // после красной карточки — отъезд камеры, открываем новую сцену
 outs.forEach(o=>{const p=sg(t,o,o+1.1);if(p>0&&p<1)z+=.09*(1-eOut(p))});
 // на концевой заставке камера встаёт, чтобы элементы YouTube легли ровно
 const live=window.STILL_FROM?1-eIO(sg(t,window.STILL_FROM,window.STILL_FROM+1)):1;
 const dx=12*Math.sin(t*2*Math.PI/19)*live, dy=7*Math.sin(t*2*Math.PI/13+1)*live;
 const cam=1+(.02+z)*live,f=frame(t);
 // кадрирование плана, затем камера вокруг центра кадра
 stage.style.transform=`translate(${(cam*f.tx+960*(1-cam)+dx).toFixed(2)}px,${(cam*f.ty+560*(1-cam)+dy).toFixed(2)}px) scale(${(cam*f.s).toFixed(4)})`;
 // фон
 bg.querySelector('.grid').style.transform=`translate(${(t*9)%80}px,${(t*5)%80}px)`;
 bg.querySelector('.glow').style.transform=`translate(${260+900*(.5+.5*Math.sin(t/7))}px,${-300+500*(.5+.5*Math.cos(t/9))}px)`;
 // номер на карточке
 if(num){const n=cardNo();num.textContent=n;
  const c0=typeof CARDS!=='undefined'?(CARDS.find(c=>t>=c[0]&&t<c[1]+.5)||[0])[0]:wipe;
  const p=eOut(sg(t,Math.max(c0,0)+.15,Math.max(c0,0)+1));
  num.style.transform=`translateY(-50%) translateX(${160*(1-p)}px) scale(${1.08-.08*p})`;num.style.opacity=p}
 // плашка призыва: сцена приглушается, плашка въезжает, клетки отмечаются по одной
 if(cta){const [a,b]=window.CTA,p=Math.min(eOut(sg(t,a,a+.5)),1-sg(t,b-.4,b));
  cta.style.opacity=p;cta.style.transform=`translateY(${-50+6*(1-eOut(sg(t,a,a+.6)))}%) scale(${.96+.04*eOut(sg(t,a,a+.6))})`;
  dim.style.opacity=.8*p;
  cta.querySelectorAll('.row i').forEach((c,i)=>{const q=eOut(sg(t,a+.6+i*.12,a+.85+i*.12));c.querySelector('svg').style.opacity=q;c.style.background=q>.5?'#E3342F':'transparent';c.style.borderColor=q>.5?'#E3342F':'#3A3A3E'})}
 // субтитр: короткий подъём на старте фразы
 const sp=g('st');if(sp&&k>=0){const p=eOut(sg(t,beats[k],beats[k]+.3));sp.style.transform=`translateY(${14*(1-p)}px) scale(${.96+.04*p})`}
 // апостроф в логотипе белеет, пока под ним красная карточка
 const ap=document.querySelector('#bug span');if(ap){let red=false;
  if(g('card')&&g('card').style.display!=='none'){
   // inset() браузер сокращает: 1–4 значения, как у margin
   const v=((g('card').style.clipPath||'').match(/[\d.]+/g)||['0']).map(Number);
   const r=v.length>1?v[1]:v[0], l=v.length>3?v[3]:r;red=r<92&&l<3}
  if(g('wipe'))red=parseFloat(g('wipe').style.width)>150;
  ap.style.color=red?'#F3F3F3':''}
};
// события для звука: [время, тип, громкость]. Тип: whoosh, hit, swish, pop, tick
window.sfxEvents=function(){
 const ev=[];
 if(typeof CARDS!=='undefined')CARDS.forEach(c=>{if(c[0]>=0){ev.push([c[0]-.12,'whoosh',1]);ev.push([c[0]+.4,'hit',1])}ev.push([c[1]-.05,'whoosh',.55])});
 else ev.push([wipe-.1,'whoosh',1],[wipe+.45,'hit',1]);
 if(window.CTA){const a=window.CTA[0];ev.push([a-.1,'swish',1]);for(let i=0;i<12;i++)ev.push([a+.6+i*.12,'tick',.45])}
 const busy=x=>ev.some(e=>Math.abs(e[0]-x)<1.2);
 // появление нового слоя сцены
 const was=layers.map(()=>0);
 for(let t=0;t<DURA;t+=.1){base(t);layers.forEach((l,i)=>{const o=+getComputedStyle(l).opacity;if(o>.3&&was[i]<=.3&&t>.2&&!busy(t))ev.push([t-.15,'swish',.8]);was[i]=o})}
 if(window.SFX)window.SFX.forEach(e=>ev.push(e));
 window.render(0);
 return ev.sort((a,b)=>a[0]-b[0]);
};
window.render(0);
})();
