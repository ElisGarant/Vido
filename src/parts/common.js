const $=id=>document.getElementById(id);
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const seg=(t,a,b)=>cl((t-a)/(Math.max(b-a,1e-6)));
const eo=x=>x>=1?1:1-Math.pow(2,-10*x);
const eio=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const win=(t,a,b,f=.45)=>cl(Math.min(eo(seg(t,a,a+f)),1-seg(t,b-f*.7,b)));
function timeline(C,PRE,tail=1.6){const T=[],E=[];let tt=0;C.forEach((s,i)=>{tt+=PRE[i]||0.12;let w=0;s.split(/\s+/).forEach(x=>{w+=/\d+-\d+/.test(x)?6:/\d{4}/.test(x)?4.5:/\d/.test(x)?3:1});const d=w/2.55+.25;T.push(tt);tt+=d;E.push(tt)});return [T,E,tt+tail]}
const st=document.getElementById('stage');
const add=(h)=>{const d=document.createElement('div');d.className='L';d.innerHTML=h;st.appendChild(d);return d};
function common(t,o){
 let cv=null;o.CARDS.forEach(c=>{if(t>=c[0]&&t<c[1]+.5)cv=c});
 if(cv){const inn=cv[0]<0?1:eio(seg(t,cv[0],cv[0]+.45)), out=eio(seg(t,cv[1],cv[1]+.45));
  $('card').style.clipPath=`inset(0 ${100-100*inn}% 0 ${100*out}%)`;$('card').style.display='flex';$('ck').textContent=cv[2];$('ch').innerHTML=cv[3];
  $('card').querySelector('.h').style.transform=`translateX(${cv[0]<0?0:40*(1-eo(seg(t,cv[0]+.3,cv[0]+.8)))}px)`}else $('card').style.display='none';
 let n=o.N0;o.CARDS.forEach(c=>{if(t>=c[0]+.4)n=c[4]});$('cn').textContent=n;
 let tl='';o.TTL.forEach(x=>{if(t>=x[0])tl=x[1]});$('ttl').textContent=tl;
 const s=o.SRC.find(x=>t>=x[0]&&t<x[1]);$('src').style.opacity=s?eo(seg(t,s[0],s[0]+.5)):0;if(s)$('src').textContent='Источник: '+s[2];
 let k=-1;for(let i=0;i<o.C.length;i++)if(t>=o.T[i]&&t<o.E[i]+.1)k=i;$('st').textContent=k>=0?o.C[k]:'';$('sub').style.opacity=k>=0?1:0;
 const f=1-seg(t,o.DUR-.5,o.DUR);
 if(o.full){document.body.style.opacity=f}else{['stage','ttl','src','sub'].forEach(id=>{$(id).style.opacity=(id=='src'||id=='sub')?(+$(id).style.opacity)*f:f})}
}
