// Общий слой динамики поверх любой части: камера в такт фразам, фон, номер на карточке ошибки, появление субтитров.
// Подключается последним скриптом страницы и оборачивает render(t). Всё зависит только от t, рендер остаётся детерминированным.
(function(){
const g=id=>document.getElementById(id);
const clp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const sg=(t,a,b)=>clp((t-a)/Math.max(b-a,1e-6));
const eOut=x=>x>=1?1:1-Math.pow(2,-10*x);
const eIO=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;

// сцена: во вступлении слои лежат прямо в body, собираем их в #stage
let stage=g('stage');
if(!stage){stage=document.createElement('div');stage.id='stage';
 const first=document.querySelector('.L');first.parentNode.insertBefore(stage,first);
 document.querySelectorAll('body > .L').forEach(l=>stage.appendChild(l));}
const css=document.createElement('style');css.textContent=`
#stage{position:absolute;inset:0;transform-origin:960px 560px;will-change:transform}
#bgfx{position:absolute;inset:0;pointer-events:none;overflow:hidden}
#bgfx .grid{position:absolute;inset:-80px;background-image:linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px);background-size:80px 80px}
#bgfx .glow{position:absolute;width:1400px;height:1400px;border-radius:50%;background:radial-gradient(closest-side,rgba(227,52,47,.10),rgba(227,52,47,0))}
#bgfx .vig{position:absolute;inset:0;background:radial-gradient(ellipse 75% 70% at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%)}
.bignum{position:absolute;right:90px;top:50%;font-weight:900;font-size:760px;line-height:1;letter-spacing:-.05em;color:rgba(255,255,255,.13);pointer-events:none;transform:translateY(-50%)}
#card .k,#card .h,#next .k,#next .h{position:relative;z-index:1}`;
document.head.appendChild(css);
const bg=document.createElement('div');bg.id='bgfx';bg.innerHTML='<div class="grid"></div><div class="glow"></div><div class="vig"></div>';
document.body.insertBefore(bg,document.body.firstChild);

// карточка ошибки: огромный номер справа
const card=g('card')||g('next');let num=null;
if(card){num=document.createElement('div');num.className='bignum';card.appendChild(num)}
const cardNo=()=>{const k=card&&card.querySelector('.k');const m=k&&k.textContent.match(/(\d+)\s*из/);return m?m[1]:''};

// опорные моменты: начала фраз и уходы карточек
const beats=typeof T!=='undefined'?T.slice():(typeof SUBS!=='undefined'?SUBS.map(s=>s[0]):[]);
const outs=typeof CARDS!=='undefined'?CARDS.map(c=>c[1]):[29.4];
const Z=[0,.035,.015,.045];

const base=window.render;
window.render=function(t){
 base(t);
 // камера: ступенька масштаба на каждую фразу + медленное плавание
 let k=-1;for(let i=0;i<beats.length;i++)if(t>=beats[i]-.1)k=i;
 let z=k<0?0:Z[k%4];
 if(k>0){const p=eIO(sg(t,beats[k]-.1,beats[k]+.6));z=Z[(k-1)%4]+(z-Z[(k-1)%4])*p}
 // после красной карточки — отъезд камеры, открываем новую сцену
 outs.forEach(o=>{const p=sg(t,o,o+1.1);if(p>0&&p<1)z+=.09*(1-eOut(p))});
 const dx=12*Math.sin(t*2*Math.PI/19), dy=7*Math.sin(t*2*Math.PI/13+1);
 stage.style.transform=`translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) scale(${(1.02+z).toFixed(4)})`;
 // фон
 bg.querySelector('.grid').style.transform=`translate(${(t*9)%80}px,${(t*5)%80}px)`;
 bg.querySelector('.glow').style.transform=`translate(${260+900*(.5+.5*Math.sin(t/7))}px,${-300+500*(.5+.5*Math.cos(t/9))}px)`;
 // номер на карточке
 if(num){const n=cardNo();num.textContent=n;
  const c0=typeof CARDS!=='undefined'?(CARDS.find(c=>t>=c[0]&&t<c[1]+.5)||[0])[0]:28.9;
  const p=eOut(sg(t,Math.max(c0,0)+.15,Math.max(c0,0)+1));
  num.style.transform=`translateY(-50%) translateX(${160*(1-p)}px) scale(${1.08-.08*p})`;num.style.opacity=p}
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
 else ev.push([28.8,'whoosh',1],[29.35,'hit',1]);
 const busy=x=>ev.some(e=>Math.abs(e[0]-x)<1.2);
 // появление нового слоя сцены
 const L=[...stage.children].filter(l=>l.classList.contains('L')),was=L.map(()=>0);
 const dur=typeof DUR!=='undefined'?DUR:30;
 for(let t=0;t<dur;t+=.1){base(t);L.forEach((l,i)=>{const o=+getComputedStyle(l).opacity;if(o>.3&&was[i]<=.3&&t>.2&&!busy(t))ev.push([t-.15,'swish',.8]);was[i]=o})}
 if(window.SFX)window.SFX.forEach(e=>ev.push(e));
 window.render(0);
 return ev.sort((a,b)=>a[0]-b[0]);
};
window.render(0);
})();
