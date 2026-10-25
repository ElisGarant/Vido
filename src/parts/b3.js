const C=["Человек понял, что вы предлагаете.","Теперь он решает, верить ли вам.",
"Исследовательский центр Spiegel при Northwestern University","вместе с PowerReviews проанализировал больше ста тысяч товаров.","Если у товара есть пять отзывов,","вероятность покупки на 270% выше, чем у товара без отзывов.","У дорогих товаров конверсия выросла ещё сильнее, на 380%.",
"Человеку нужно увидеть, что до него кто-то уже рискнул и остался доволен.","Для услуг это кейсы с цифрами, скриншоты переписок и видеоотзывы.",
"В том же исследовании есть парадокс.","Вероятность покупки выше всего при рейтинге от 4,2 до 4,7.","Когда рейтинг поднимается выше 4,7, она немного снижается.","Авторы объясняют это так: слишком хорошим отзывам люди не верят.",
"Двадцать отзывов по пять звёзд, написанных одним стилем, выглядят как реклама.","Оставляйте в отзывах живые детали и даже небольшие минусы.",
"Вернёмся к Стэнфорду.","Лаборатория Фогга составила рекомендации по доверию к сайтам,","и два пункта оттуда легко проверить прямо сейчас.","Показывайте реальных людей и реальную компанию за сайтом.","И помните, что даже мелкие ошибки вроде опечаток сильно бьют по доверию.",
"Фото команды со стока,","ни адреса, ни реквизитов,","опечатка в заголовке.","Каждую такую мелочь человек замечает и начинает сомневаться."];
const PRE={0:.6,2:.5,9:1.3,15:1.3};
const [T,E,DUR]=timeline(C,PRE);window.DUR=DUR;
const stars=(n,sz=30,col='#E3342F')=>[1,2,3,4,5].map(i=>`<span style="font-size:${sz}px;color:${i<=n?col:'#3A3A3E'}">★</span>`).join('');
// E8-A
const A8=add(`<div style="position:absolute;left:160px;top:250px;display:flex;gap:40px">
<div id="pc0" style="width:380px;border-radius:18px;background:var(--surf);border:1px solid var(--line);padding:26px;opacity:0"><div style="height:200px;border-radius:12px;background:linear-gradient(160deg,#2B2B2F,#1B1B1E);position:relative"><i style="position:absolute;left:34%;top:14%;width:32%;height:72%;border:8px solid #E9E9EC;border-radius:4px"></i></div><div style="font-size:28px;font-weight:700;margin-top:18px">Окно ПВХ, 2 створки</div><div style="margin-top:8px">${stars(0,28)}</div><div style="font-size:22px;color:var(--mut)">нет отзывов</div></div>
<div id="pc1" style="width:380px;border-radius:18px;background:var(--surf);border:1px solid var(--line);padding:26px;opacity:0"><div style="height:200px;border-radius:12px;background:linear-gradient(160deg,#2B2B2F,#1B1B1E);position:relative"><i style="position:absolute;left:34%;top:14%;width:32%;height:72%;border:8px solid #E9E9EC;border-radius:4px"></i></div><div style="font-size:28px;font-weight:700;margin-top:18px">Окно ПВХ, 2 створки</div><div style="margin-top:8px">${stars(4,28)}</div><div style="font-size:22px;color:var(--mut)">5 отзывов</div></div></div>
<div style="position:absolute;left:1080px;top:250px;width:760px"><div class="lbl">Рост вероятности покупки<br>при 5 отзывах против нуля</div>
<div class="big" id="p270" style="font-size:190px;color:var(--red2);margin-top:20px;opacity:0">+270%</div>
<div id="p380" style="font-size:40px;font-weight:700;margin-top:24px;opacity:0">у дорогих товаров <span style="font-size:64px;font-weight:900;color:var(--red2)">+380%</span></div>
<div id="psku" style="font-size:24px;color:var(--mut);margin-top:22px;opacity:0">больше 100 000 товаров, данные PowerReviews</div></div>`);
// E8-B proofs
const B8=add(`<div style="position:absolute;left:160px;top:240px;display:grid;grid-template-columns:repeat(3,1fr);gap:30px;width:1600px">
<div id="pr0" style="opacity:0;height:500px;border-radius:18px;background:var(--surf);border:1px solid var(--line);border-top:8px solid var(--red);padding:34px"><div class="lbl">Кейс с цифрами</div><div style="font-size:40px;font-weight:900;line-height:1.2;margin-top:20px">Квартира на Лесной</div><div style="margin-top:26px;display:grid;grid-template-columns:1fr 1fr;gap:20px"><div><div class="big" style="font-size:76px">6</div><div style="font-size:22px;color:var(--mut)">окон</div></div><div><div class="big" style="font-size:76px">2</div><div style="font-size:22px;color:var(--mut)">дня на монтаж</div></div></div><div style="font-size:24px;color:#BDBDC2;margin-top:24px;line-height:1.4">Фото до и после, смета, сроки по дням</div></div>
<div id="pr1" style="opacity:0;height:500px;border-radius:18px;background:var(--surf);border:1px solid var(--line);border-top:8px solid #F3F3F3;padding:34px"><div class="lbl">Скриншот переписки</div>
<div style="margin-top:24px;background:#2A2A2D;border-radius:18px 18px 18px 4px;padding:16px 20px;font-size:24px;line-height:1.4;width:88%">Окна поставили, в спальне наконец тихо. Мастер даже подоконник подровнял</div>
<div style="margin-top:14px;margin-left:auto;background:var(--red);border-radius:18px 18px 4px 18px;padding:16px 20px;font-size:24px;width:70%">Спасибо, Ирина! Рады, что всё понравилось</div>
<div style="font-size:20px;color:var(--mut);margin-top:16px">Ирина, 14:32</div></div>
<div id="pr2" style="opacity:0;height:500px;border-radius:18px;background:var(--surf);border:1px solid var(--line);border-top:8px solid #F3F3F3;padding:34px"><div class="lbl">Видеоотзыв</div><div style="margin-top:24px;height:260px;border-radius:14px;background:linear-gradient(160deg,#2F2F33,#1A1A1D);position:relative;display:flex;align-items:center;justify-content:center"><div style="width:96px;height:96px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center"><div style="width:0;height:0;border-left:34px solid #fff;border-top:21px solid transparent;border-bottom:21px solid transparent;margin-left:8px"></div></div><div style="position:absolute;right:14px;bottom:12px;font-size:20px;background:rgba(0,0,0,.6);padding:2px 10px;border-radius:6px">0:48</div></div><div style="font-size:26px;font-weight:700;margin-top:20px">Сергей, дом в пригороде</div></div></div>
<div id="b8l" style="position:absolute;left:160px;top:800px;font-size:36px;font-weight:700;opacity:0">Кто-то уже рискнул <span style="color:var(--red2)">и остался доволен</span></div>`);
// E9-A rating curve
const rx=r=>260+(r-1)*330, ry=v=>800-v*440;
const rv=r=>r<=4.45?Math.pow((r-1)/3.45,1.6):1-0.09*Math.pow((r-4.45)/0.55,1.5);
const rp=[...Array(81)].map((_,i)=>{const r=1+i*0.05;return (i?'L':'M')+rx(r).toFixed(1)+' '+ry(rv(r)).toFixed(1)}).join(' ');
const A9=add(`<div class="lbl" style="position:absolute;left:260px;top:220px">Вероятность покупки в зависимости от рейтинга</div>
<svg width="1920" height="1080" style="position:absolute;left:0;top:0">
<rect id="pz" x="${rx(4.2)}" y="300" width="0" height="500" fill="rgba(227,52,47,.18)"/>
<line x1="${rx(1)}" y1="800" x2="${rx(5)}" y2="800" stroke="#3A3A3E" stroke-width="3"/>
${[1,2,3,4,5].map(r=>`<text x="${rx(r)}" y="846" fill="#8C8C90" font-size="28" text-anchor="middle" font-family="Noto Sans CJK SC">${r} ★</text>`).join('')}
<path id="rc" d="${rp}" fill="none" stroke="#F3F3F3" stroke-width="7" stroke-linecap="round" stroke-dasharray="2400" stroke-dashoffset="2400"/>
<circle id="rd" cx="${rx(5)}" cy="${ry(rv(5))}" r="16" fill="#FF5A4F" opacity="0"/></svg>
<div id="pzl" style="position:absolute;left:${rx(4.2)-120}px;top:250px;font-size:38px;font-weight:900;color:var(--red2);opacity:0">4,2–4,7</div>
<div id="rdl" style="position:absolute;left:${rx(5)-260}px;top:${ry(rv(5))+40}px;font-size:28px;font-weight:700;opacity:0;width:300px;text-align:right">выше 4,7<br>немного ниже</div>
<div style="position:absolute;left:260px;top:870px;font-size:20px;color:#5E5E63">Форма кривой по описанию исследования, без точных значений</div>`);
// E9-B fake vs real reviews
const fake='<div>'+stars(5,20)+'</div><div style="font-size:19px;line-height:1.3;color:#BDBDC2;margin-top:6px">Отличная компания, всё супер, рекомендую!</div>';
const real=[[5,"Замерщик приехал в тот же день. В спальне стало тихо, даже трамвая не слышно.","Ирина, ул. Лесная"],[4,"Монтажники опоздали на час, но сделали аккуратно и убрали за собой.","Олег, ЖК «Северный»"],[5,"Посчитали на сайте, цена в договоре совпала до рубля.","Марина, Заречье"],[4,"Подоконник ждали лишние два дня. Окна отличные.","Денис, пос. Солнечный"]];
const B9=add(`<div id="fk" style="position:absolute;left:160px;top:230px;display:grid;grid-template-columns:repeat(5,1fr);gap:16px;width:1600px">`+
[...Array(20)].map((_,i)=>`<div class="fkc" style="height:112px;border-radius:14px;background:var(--surf);border:1px solid var(--line);padding:20px;opacity:0">${fake}</div>`).join('')+`</div>
<div id="fkl" style="position:absolute;left:160px;top:770px;font-size:40px;font-weight:700;color:var(--red2);opacity:0">Выглядит как реклама</div>
<div id="rl" style="position:absolute;left:160px;top:230px;display:grid;grid-template-columns:repeat(2,1fr);gap:24px;width:1600px;opacity:0">`+
real.map((r,i)=>`<div class="rlc" style="border-radius:16px;background:var(--surf);border:1px solid var(--line);padding:28px">${stars(r[0],28)}<div style="font-size:28px;line-height:1.4;margin-top:12px">${r[1]}</div><div style="font-size:22px;color:var(--mut);margin-top:12px">${r[2]}</div></div>`).join('')+`</div>`);
// E10-A guidelines
const A10=add(`<div id="gd" style="position:absolute;left:160px;top:220px;width:1000px;background:#F3F3F3;color:#111;border-radius:10px;padding:46px 54px;font-family:'Liberation Serif',serif">
<div style="font-size:40px;font-weight:700">Stanford Guidelines for Web Credibility</div><div style="font-size:22px;margin-top:8px;font-style:italic">B. J. Fogg, Stanford Persuasive Technology Lab</div>
<div id="gl1" style="font-size:30px;margin-top:34px;padding:10px 14px;border-radius:6px">Show that there’s a real organization behind your site.</div>
<div style="height:9px;background:#D4D4D9;border-radius:5px;margin:16px 14px 0;width:80%"></div><div style="height:9px;background:#D4D4D9;border-radius:5px;margin:12px 14px 0;width:66%"></div>
<div id="gl2" style="font-size:30px;margin-top:20px;padding:10px 14px;border-radius:6px">Avoid errors of all types, no matter how small they seem.</div>
<div style="height:9px;background:#D4D4D9;border-radius:5px;margin:16px 14px 0;width:74%"></div></div>
<div id="gr1" style="position:absolute;left:1240px;top:330px;font-size:40px;font-weight:700;line-height:1.3;opacity:0;width:560px">Реальные люди и компания за сайтом</div>
<div id="gr2" style="position:absolute;left:1240px;top:560px;font-size:40px;font-weight:700;line-height:1.3;opacity:0;width:560px"><span style="color:var(--red2)">Никаких ошибок</span>, даже мелких</div>`);
// E10-B issues on site
const site10=`<div class="gs" style="transform:scale(1)"><nav><span class="logo">Тёплый дом</span><span>Окна &nbsp;&nbsp; Балконы &nbsp;&nbsp; Контакты</span><span>+7 900 000-00-00</span></nav>
<div style="padding:10px 44px"><div style="font-size:46px;font-weight:900">Пластиковые окна с <span id="typo" style="border-radius:4px">устоновкой</span> за 3 дня</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:30px"><div id="stock" style="height:300px;border-radius:14px;background:linear-gradient(160deg,#30343C,#1D2026);position:relative;overflow:hidden">
${[0,1,2,3].map(i=>`<div style="position:absolute;bottom:0;left:${40+i*110}px;width:90px"><div style="width:56px;height:56px;border-radius:50%;background:#C9CDD6;margin:0 auto"></div><div style="width:90px;height:110px;border-radius:40px 40px 0 0;background:#9AA1AD;margin-top:8px"></div></div>`).join('')}
<div style="position:absolute;right:14px;top:12px;font-size:16px;color:#C9CDD6;background:rgba(0,0,0,.4);padding:2px 10px;border-radius:6px">photobank_team_0347.jpg</div></div>
<div style="font-size:22px;line-height:1.8;color:#BDBDC2"><div style="font-size:30px;font-weight:900;color:#fff;margin-bottom:10px">Контакты</div><div id="adr">Адрес: <b style="color:#5E5E63">—</b></div><div id="rq">Реквизиты: <b style="color:#5E5E63">—</b></div><div>Почта: info@teplydom.ru</div></div></div></div></div>`;
const B10=add(browser(140,220,1160,629,'teplydom.ru',site10)+
`<div class="call" id="i1" style="left:1380px;top:290px">Фото со стока<small>команду не узнать</small></div>
<div class="call" id="i2" style="left:1380px;top:430px">Ни адреса, ни реквизитов<small>непонятно, кто за сайтом</small></div>
<div class="call" id="i3" style="left:1380px;top:570px">Опечатка в заголовке<small>«устоновкой»</small></div>
<div id="dq" style="position:absolute;left:1380px;top:730px;font-size:44px;font-weight:900;color:var(--red2);opacity:0">Им можно доверять?</div>`);

const CARDS=[[0,T[2]-.35,'Ошибка 8 из 12','Нет<br>отзывов',8],[T[9]-1.25,T[9]+.35,'Ошибка 9 из 12','Слишком идеальные<br>отзывы',9],[T[15]-1.25,T[15]+.35,'Ошибка 10 из 12','Не видно людей,<br>есть опечатки',10]];
const SRC=[[T[2],T[15]-.9,'Spiegel Research Center, Northwestern University, 2017'],[T[16],T[20],'Stanford Guidelines for Web Credibility']];
const TTL=[[0,'Ошибка 8. Нет отзывов'],[T[9]-.5,'Ошибка 9. Слишком идеальные отзывы'],[T[15]-.5,'Ошибка 10. Не видно людей, есть опечатки']];
window.render=function(t){
 common(t,{CARDS,SRC,TTL,N0:8,C,T,E,DUR});
 A8.style.opacity=win(t,T[2]-.3,T[7]);
 [0,1].forEach(i=>{const a=eo(seg(t,T[2]+.3+i*.5,T[2]+.8+i*.5));$('pc'+i).style.opacity=a;$('pc'+i).style.transform=`translateY(${(1-a)*30}px)`});
 $('pc1').style.borderColor=t>T[4]+.3?'#E3342F':'#2A2A2D';
 $('p270').style.opacity=eo(seg(t,T[5]+.6,T[5]+1.1));$('p380').style.opacity=eo(seg(t,T[6]+1,T[6]+1.5));$('psku').style.opacity=eo(seg(t,T[3]+.5,T[3]+1));
 B8.style.opacity=win(t,T[7],T[9]-.9);
 [0,1,2].forEach(i=>{const a=eo(seg(t,T[7]+.5+i*.45,T[7]+1+i*.45));$('pr'+i).style.opacity=a;$('pr'+i).style.transform=`translateY(${(1-a)*30}px)`});
 $('b8l').style.opacity=eo(seg(t,T[7]+1.8,T[7]+2.3));
 A9.style.opacity=win(t,T[9],T[13]);
 $('rc').setAttribute('stroke-dashoffset',2400*(1-eio(seg(t,T[9]+.4,T[10]+.4))));
 $('pz').setAttribute('width',(rx(4.7)-rx(4.2))*eio(seg(t,T[10]+1,T[10]+1.6)));$('pzl').style.opacity=eo(seg(t,T[10]+1.2,T[10]+1.7));
 $('rd').setAttribute('opacity',eo(seg(t,T[11]+.6,T[11]+1)));$('rdl').style.opacity=eo(seg(t,T[11]+.8,T[11]+1.3));
 B9.style.opacity=win(t,T[13],T[15]-.9);
 document.querySelectorAll('.fkc').forEach((c,i)=>{const a=eo(seg(t,T[13]+i*.06,T[13]+.4+i*.06));c.style.opacity=a*(1-eio(seg(t,T[14],T[14]+.5)))});
 $('fkl').style.opacity=eo(seg(t,T[13]+1.6,T[13]+2.1))*(1-seg(t,T[14],T[14]+.4));
 $('rl').style.opacity=eo(seg(t,T[14]+.4,T[14]+.9));
 document.querySelectorAll('.rlc').forEach((c,i)=>{const a=eo(seg(t,T[14]+.5+i*.35,T[14]+.9+i*.35));c.style.opacity=a;c.style.transform=`translateY(${(1-a)*24}px)`});
 A10.style.opacity=win(t,T[15]+.2,T[20]);
 $('gd').style.transform=`translateY(${(1-eo(seg(t,T[16],T[16]+.6)))*40}px)`;$('gd').style.opacity=eo(seg(t,T[16],T[16]+.6));
 const h1=eo(seg(t,T[18],T[18]+.4)),h2=eo(seg(t,T[19],T[19]+.4));
 $('gl1').style.background=`rgba(227,52,47,${.22*h1})`;$('gl2').style.background=`rgba(227,52,47,${.22*h2})`;$('gr1').style.opacity=h1;$('gr2').style.opacity=h2;
 B10.style.opacity=win(t,T[20],DUR,.5);
 [['i1',T[20]],['i2',T[21]],['i3',T[22]]].forEach(([id,a])=>{const v=eo(seg(t,a,a+.45));$(id).style.opacity=v;$(id).style.transform=`translateX(${(1-v)*-24}px)`});
 const ty=eo(seg(t,T[22],T[22]+.4));$('typo').style.background=`rgba(227,52,47,${.85*ty})`;$('typo').style.boxShadow=`0 0 0 6px rgba(227,52,47,${.85*ty})`;
 $('stock').style.outline=t>T[20]?'4px solid #E3342F':'none';$('adr').style.color=t>T[21]?'#FF5A4F':'';$('rq').style.color=t>T[21]?'#FF5A4F':'';
 $('dq').style.opacity=eo(seg(t,T[23]+.4,T[23]+.9));
};
render(0);
