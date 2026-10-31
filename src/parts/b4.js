const C=["Последний шаг.","Человек готов, осталось оставить заявку или оформить заказ,","и здесь его тоже можно потерять.",
"Baymard Institute сводит данные десятков исследований:","в интернет-магазинах в среднем бросают около 70% корзин.","Чаще всего из-за неожиданных платежей:","доставка и комиссии всплывают в самом конце.","Так ответили 40% опрошенных.","Ещё 17% ушли, потому что оформление было длинным и сложным.",
"По заявкам на услуги такой статистики нет, но логика та же:","каждое лишнее поле и каждый сюрприз в цене отсеивают людей.","Имя и телефон, остальное уточните в разговоре.",
"И самая дорогая ошибка.","Покупают красивый шаблон, вставляют свои тексты","и потом подгоняют под него бизнес.","Работать нужно в обратном порядке.","Сначала задача, например 30 заявок в месяц на установку окон с рекламы.","Из неё понятно, что поставить на первый экран, нужен ли калькулятор и какая форма.",
"А ещё у задачи есть цифра, которую можно измерить.","Без аналитики вы не узнаете, на каком экране уходят люди и где бросают форму.","Пока задачи нет, остальные одиннадцать ошибок приходится исправлять наугад,","поэтому эта ошибка и стоит дороже всех.",
"Я собрал все двенадцать пунктов в чек-лист,","по нему свой сайт можно проверить минут за десять.","Там же шаблон, как сформулировать задачу сайта до разработки.","Всё это лежит в моём телеграм-канале,","ссылка в шапке профиля и в описании под видео."];
const PRE={0:.6,3:.5,12:1.3,22:1.2};
const [T,E,DUR]=timeline(C,PRE,6.0);window.DUR=DUR;
// E11-A Baymard
const A11=add(`<div style="position:absolute;left:160px;top:250px"><div class="lbl">Бросают корзину в интернет-магазинах</div><div class="big" id="b70" style="font-size:200px;color:var(--red2);margin-top:10px;opacity:0">≈70%</div></div>
<div style="position:absolute;left:900px;top:260px;width:860px"><div class="lbl" id="rsn" style="opacity:0">Причины, которые можно исправить</div>
<div class="bars" style="margin-top:30px"><div class="row" id="ra" style="opacity:0"><div class="nm" style="width:340px;font-size:28px;white-space:nowrap">неожиданные платежи</div><div class="tr"><div class="fl" id="fa" style="background:var(--red);width:0"></div></div><div style="width:110px;font-size:40px;font-weight:900">40%</div></div>
<div class="row" id="rb" style="opacity:0"><div class="nm" style="width:340px;font-size:28px;white-space:nowrap">длинное оформление</div><div class="tr"><div class="fl" id="fb" style="background:#F3F3F3;width:0"></div></div><div style="width:110px;font-size:40px;font-weight:900">17%</div></div></div>
<div id="rnote" style="font-size:20px;color:#5E5E63;margin-top:8px;opacity:0">Доли опрошенных, один человек мог назвать несколько причин</div></div>`);
// E11-B checkout + form
const fields=["Имя","Фамилия","Телефон","Email","Город","Адрес","Этаж","Тип дома","Как узнали о нас","Комментарий"];
const B11=add(`<div style="position:absolute;left:160px;top:230px;width:720px;border-radius:18px;background:var(--surf);border:1px solid var(--line);padding:40px">
<div style="font-size:36px;font-weight:900">Ваш заказ</div>
<div style="display:flex;justify-content:space-between;font-size:28px;margin-top:30px;color:#BDBDC2"><span>Окно 1300×1400</span><span>18 300 ₽</span></div>
<div id="ex1" style="display:flex;justify-content:space-between;font-size:28px;margin-top:16px;color:var(--red2);opacity:0"><span>Доставка</span><span>+1 500 ₽</span></div>
<div id="ex2" style="display:flex;justify-content:space-between;font-size:28px;margin-top:16px;color:var(--red2);opacity:0"><span>Подъём на этаж</span><span>+900 ₽</span></div>
<div style="height:2px;background:#2A2A2D;margin:26px 0"></div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-size:30px;color:var(--mut)">Итого</span><span class="big" id="tot" style="font-size:64px">18 300 ₽</span></div></div>
<div id="frm" style="position:absolute;left:980px;top:230px;width:780px;border-radius:18px;background:var(--surf);border:1px solid var(--line);padding:34px 40px">
<div style="font-size:34px;font-weight:900;margin-bottom:16px">Заявка на замер</div><div id="fl" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">`+
fields.map((f,i)=>`<div class="fld" data-k="${i==0||i==2?1:0}" style="height:58px;border-radius:10px;border:2px solid #3A3A3E;font-size:22px;color:var(--mut);display:flex;align-items:center;padding:0 16px;overflow:hidden">${f}</div>`).join('')+`</div>
<div style="margin-top:18px;background:var(--red);border-radius:12px;text-align:center;font-size:26px;font-weight:700;padding:16px">Отправить</div></div>
<div id="nost" style="position:absolute;left:160px;top:820px;font-size:22px;color:#6A6A6F;opacity:0">Для услуг отдельной статистики нет, вывод по аналогии с магазинами</div>`);
// E12-A template vs task
const A12=add(`<div id="tpl" style="position:absolute;left:220px;top:300px;width:520px;height:420px;border-radius:18px;background:var(--surf);border:2px dashed #4A4A4F;padding:30px">
<div style="height:30px;width:60%;background:#2A2A2D;border-radius:6px"></div><div style="height:110px;background:#232326;border-radius:10px;margin-top:20px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#6A6A6F">ваш текст здесь</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:20px">${'<div style="height:110px;background:#232326;border-radius:10px"></div>'.repeat(3)}</div><div id="tpll" style="font-size:24px;font-weight:700;margin-top:20px;color:#8C8C90">Красивый шаблон</div></div>
<div id="biz" style="position:absolute;left:1180px;top:300px;width:520px;height:420px;border-radius:18px;background:var(--surf);border:2px solid #F3F3F3;padding:30px;display:flex;flex-direction:column;justify-content:center;align-items:center"><div id="bizh" style="font-size:52px;font-weight:900">Ваш бизнес</div><div id="bizs" style="font-size:26px;color:var(--mut);margin-top:12px;text-align:center">услуги, клиенты, задачи</div></div>
<svg width="1920" height="1080" style="position:absolute;left:0;top:0"><defs><marker id="ah" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#E3342F"/></marker></defs>
<line id="arr" x1="770" y1="510" x2="1150" y2="510" stroke="#E3342F" stroke-width="8" marker-end="url(#ah)" opacity="0"/></svg>
<div id="arrl" style="position:absolute;left:0;right:0;top:770px;text-align:center;font-size:42px;font-weight:700;opacity:0"></div>`);
// E12-B task tree
const kids=["Первый экран","Калькулятор","Форма"];
const B12=add(`<div id="task" style="position:absolute;left:460px;top:220px;width:1000px;border-radius:18px;background:var(--red);padding:30px 40px;opacity:0"><div style="font-size:24px;color:#FFD3CF;font-weight:700">Задача сайта</div><div style="font-size:44px;font-weight:900;line-height:1.2;margin-top:8px">30 заявок в месяц на установку окон с рекламы</div></div>
<svg width="1920" height="1080" style="position:absolute;left:0;top:0">${[0,1,2].map(i=>`<path id="br${i}" d="M960 420 C960 500 ${430+i*530} 480 ${430+i*530} 580" stroke="#F3F3F3" stroke-width="5" fill="none" stroke-dasharray="600" stroke-dashoffset="600"/>`).join('')}</svg>
${kids.map((k,i)=>`<div id="kd${i}" style="position:absolute;left:${430+i*530-220}px;top:590px;width:440px;border-radius:16px;background:var(--surf);border:1px solid var(--line);padding:28px;text-align:center;font-size:38px;font-weight:900;opacity:0">${k}</div>`).join('')}`);
// E12-C funnel (example)
const fun=[["Зашли на сайт",1000],["Досмотрели первый экран",620],["Открыли калькулятор",240],["Начали заполнять форму",90],["Отправили заявку",31]];
const C12=add(`<div class="lbl" style="position:absolute;left:160px;top:210px">Воронка в аналитике <span style="color:#5E5E63">(пример)</span></div>
<div style="position:absolute;left:160px;top:280px;width:1600px">`+fun.map((f,i)=>`<div class="frow" style="display:flex;align-items:center;gap:24px;margin-bottom:22px;opacity:0"><div style="width:480px;font-size:30px;font-weight:700;text-align:right">${f[0]}</div><div style="flex:1;height:70px;position:relative"><div class="ffl" data-w="${f[1]/10}" style="position:absolute;left:0;top:0;bottom:0;border-radius:10px;background:${i==2?'#E3342F':'#F3F3F3'};width:0"></div></div><div style="width:120px;font-size:36px;font-weight:900">${f[1]}</div></div>`).join('')+`</div>
<div id="drop" style="position:absolute;left:960px;top:462px;font-size:30px;font-weight:700;color:var(--red2);opacity:0">← самый большой обрыв, чинить первым</div>`);
// E12-D grid callback
const D12=add(`<div id="gcap" style="position:absolute;left:0;right:0;top:760px;text-align:center;font-size:42px;font-weight:700;opacity:0"></div><div id="grid" style="position:absolute;left:330px;top:290px;display:grid;grid-template-columns:repeat(6,190px);gap:24px">`+
[...Array(12)].map((_,i)=>`<div class="cell" style="height:190px;border-radius:20px;background:var(--surf);border:2px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:${i==11?40:76}px;font-weight:900;color:#6A6A6F;position:relative">${i==11?'<span class="tk">12</span>':i+1}</div>`).join('')+`</div>`);
// Final: checklist + end card
const items=["Загрузка быстрее 3 секунд","Удобно с телефона","Аккуратный дизайн","Оффер на первом экране","Одно главное действие","Текст о клиенте","Калькулятор или подбор","Отзывы и кейсы","Живые, неидеальные отзывы","Люди, адрес, без опечаток","Короткая форма, честная цена","Сайт под задачу и аналитика"];
const F1=add(`<div style="position:absolute;left:160px;top:200px;width:980px;border-radius:20px;background:#F3F3F3;color:#111;padding:40px 46px">
<div style="font-size:42px;font-weight:900">Чек-лист: 12 пунктов</div><div style="font-size:22px;color:#6A6A6F;margin-top:4px">проверка сайта за 10 минут</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 30px;margin-top:26px">`+items.map((x,i)=>`<div class="cli" style="display:flex;align-items:center;gap:14px;font-size:23px;font-weight:500"><span class="cb" style="flex:none;width:30px;height:30px;border-radius:7px;border:3px solid #111;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff"></span>${x}</div>`).join('')+`</div></div>
<div id="tplc" style="position:absolute;left:1220px;top:330px;width:540px;border-radius:20px;background:var(--surf);border:1px solid var(--line);border-top:8px solid var(--red);padding:36px;opacity:0"><div class="lbl" style="font-size:24px">+ бонус</div><div style="font-size:40px;font-weight:900;line-height:1.2;margin-top:10px">Шаблон: задача сайта до разработки</div></div>`);
const F2=add(`<div style="position:absolute;left:0;right:0;top:250px;text-align:center"><div class="big" style="font-size:200px">Eli<span style="color:var(--red)">'</span>s</div>
<div style="font-size:52px;font-weight:700;margin-top:30px">@elis_dev</div>
<div id="ec1" style="display:inline-block;margin-top:50px;background:var(--red);border-radius:16px;padding:20px 40px;font-size:44px;font-weight:900">Чек-лист в Telegram-канале</div>
<div id="ec2" style="font-size:34px;color:#BDBDC2;margin-top:28px">Ссылка в шапке профиля и в описании под видео</div></div>`);

const CARDS=[[0,T[3]-.35,'Ошибка 11 из 12','Сложная форма<br>и сюрпризы в цене',11],[T[12]-1.25,T[12]+.35,'Ошибка 12 из 12','Шаблон<br>вместо задачи',12]];
const SRC=[[T[3],T[9],'Baymard Institute, Cart Abandonment Rate (обзор 50 исследований)']];
const TTL=[[0,'Ошибка 11. Сложная форма и сюрпризы в цене'],[T[12]-.5,'Ошибка 12. Шаблон вместо задачи'],[T[22]-.6,'Итог']];
window.render=function(t){
 common(t,{CARDS,SRC,TTL,N0:11,C,T,E,DUR,full:true});
 if(t>T[22]-.6)$('cn').textContent='12';
 A11.style.opacity=win(t,T[3]-.2,T[9]);
 $('b70').style.opacity=eo(seg(t,T[4]+.8,T[4]+1.3));$('rsn').style.opacity=eo(seg(t,T[5],T[5]+.4));
 $('ra').style.opacity=eo(seg(t,T[5]+.2,T[5]+.6));$('fa').style.width=(40/40*80*eio(seg(t,T[7],T[7]+1)))+'%';
 $('rb').style.opacity=eo(seg(t,T[8],T[8]+.4));$('rnote').style.opacity=eo(seg(t,T[8]+.6,T[8]+1));$('fb').style.width=(17/40*80*eio(seg(t,T[8]+.3,T[8]+1.3)))+'%';
 B11.style.opacity=win(t,T[9],T[12]-.9);
 const x1=eo(seg(t,T[10]+.6,T[10]+1)),x2=eo(seg(t,T[10]+1.1,T[10]+1.5));$('ex1').style.opacity=x1;$('ex2').style.opacity=x2;
 const tot=18300+(x1>.5?1500:0)+(x2>.5?900:0);$('tot').textContent=tot.toLocaleString('ru-RU').replace(/\u00a0/g,' ')+' ₽';$('tot').style.color=tot>18300?'#FF5A4F':'#F3F3F3';
 const sh=eio(seg(t,T[11]+.2,T[11]+1));
 document.querySelectorAll('.fld').forEach(f=>{const keep=f.dataset.k=='1';f.style.opacity=keep?1:1-sh;f.style.height=keep?(58+20*sh)+'px':(58*(1-sh))+'px';f.style.borderWidth=keep?'2px':(2*(1-sh))+'px';f.style.gridColumn=keep&&sh>.5?'1 / span 2':'';f.style.fontSize=keep?(22+6*sh)+'px':'22px';f.style.color=keep&&sh>.5?'#F3F3F3':''});
 $('fl').style.rowGap=(12*(1-sh)+12*sh)+'px';
 $('nost').style.opacity=eo(seg(t,T[9]+.3,T[9]+.8));
 A12.style.opacity=win(t,T[12]+.3,T[16]);
 const flip=eio(seg(t,T[15]+.2,T[15]+.9));
 $('tpl').style.left=(220+960*flip)+'px';$('biz').style.left=(1180-960*flip)+'px';
 $('arr').setAttribute('opacity',eo(seg(t,T[13]+.4,T[13]+.9)));
 $('arrl').style.opacity=eo(seg(t,T[14],T[14]+.5));$('arrl').innerHTML=flip>.5?'Сначала задача, <span style="color:#FF5A4F">потом сайт</span>':'Бизнес подгоняют <span style="color:#FF5A4F">под шаблон</span>';
 $('bizh').textContent=flip>.5?'Задача':'Ваш бизнес';$('bizs').textContent=flip>.5?'что сайт должен дать бизнесу':'услуги, клиенты, задачи';$('tpll').textContent=flip>.5?'Сайт под задачу':'Красивый шаблон';$('biz').style.borderColor=flip>.5?'#E3342F':'#F3F3F3';
 B12.style.opacity=win(t,T[16],T[18]);
 $('task').style.opacity=eo(seg(t,T[16]+.3,T[16]+.8));
 [0,1,2].forEach(i=>{$('br'+i).setAttribute('stroke-dashoffset',600*(1-eio(seg(t,T[17]+.6+i*.9,T[17]+1.2+i*.9))));const a=eo(seg(t,T[17]+1+i*.9,T[17]+1.4+i*.9));$('kd'+i).style.opacity=a;$('kd'+i).style.transform=`translateY(${(1-a)*24}px)`});
 C12.style.opacity=win(t,T[18],T[20]);
 document.querySelectorAll('.frow').forEach((r,i)=>{const a=eo(seg(t,T[18]+.5+i*.45,T[18]+.9+i*.45));r.style.opacity=a;r.querySelector('.ffl').style.width=(+r.querySelector('.ffl').dataset.w*eio(a))+'%'});
 $('drop').style.opacity=eo(seg(t,T[19]+1.2,T[19]+1.7));
 D12.style.opacity=win(t,T[20],T[22]-.6);
 document.querySelectorAll('#grid .cell').forEach((c,i)=>{if(i<11){const k=eo(seg(t,T[20]+.4+i*.12,T[20]+.7+i*.12));c.style.borderColor=k>.5?'#4A4A4F':'#2A2A2D';c.style.color=k>.5?'#F3F3F3':'#6A6A6F'}
  else{const r=eo(seg(t,T[20]+.2,T[20]+.6));c.style.borderColor='#E3342F';c.style.color='#FF5A4F';c.style.boxShadow=`0 0 ${40+20*Math.sin(t*5)}px rgba(227,52,47,.45)`;c.querySelector('.tk').textContent=t>T[21]?'Задача':'12';c.style.fontSize=t>T[21]?'40px':'76px';c.style.transform=`scale(${1+.05*Math.sin(t*5)})`}});
 $('gcap').style.opacity=eo(seg(t,T[20]+1.4,T[20]+1.9));$('gcap').innerHTML=t>T[21]?'Сначала задача, <span style="color:#FF5A4F">потом всё остальное</span>':'Без задачи одиннадцать пунктов чинят <span style="color:#FF5A4F">наугад</span>';
 const fe=eo(seg(t,T[25],T[25]+.6));$('steps').style.opacity=1-fe;$('ttl').style.opacity=1-fe;
 F1.style.opacity=win(t,T[22]-.2,T[25]+.2);
 document.querySelectorAll('.cb').forEach((b,i)=>{const on=t>T[22]+.3+i*.22;b.style.background=on?'#E3342F':'transparent';b.style.borderColor=on?'#E3342F':'#111';b.textContent=on?'✓':''});
 $('tplc').style.opacity=eo(seg(t,T[24],T[24]+.5));$('tplc').style.transform=`translateY(${(1-eo(seg(t,T[24],T[24]+.5)))*30}px)`;
 F2.style.opacity=eo(seg(t,T[25],T[25]+.6));
 $('ec1').style.transform=`scale(${.9+.1*eo(seg(t,T[25]+.3,T[25]+.8))})`;$('ec2').style.opacity=eo(seg(t,T[26],T[26]+.5));
};
render(0);
