'use strict';
/* 16×16 도트 아이콘 — 각 줄: "색 x y 너비 높이" (색 글자는 PAL 참고, C=글자색) */
const PAL={k:'#0f1b24',w:'#f6f3ea',g:'#8a99a3',d:'#55646e',l:'#c7d5dd',b:'#4ba3d6',B:'#2b6a9c',c:'#9fe3f1',r:'#e8604c',R:'#a63a36',o:'#f2a33f',O:'#c4701f',y:'#ffd45e',Y:'#c9962e',n:'#9a6535',N:'#603c1e',G:'#62cf7a',D:'#2f7d4a',p:'#f58fb4',v:'#8a6bb8',m:'#5d3f85',s:'#f4c9a0',C:'currentColor'};
const PX={
chat:'w 2 3 12 7;l 2 9 12 1;b 4 5 2 2;b 7 5 2 2;b 10 5 2 2;w 4 10 3 1;w 4 11 2 1;w 4 12 1 1',
compass:'w 5 2 6 12;w 4 3 8 10;w 3 4 10 8;w 2 5 12 6;l 3 11 10 1;l 4 12 8 1;l 5 13 6 1;r 7 3 2 2;r 6 5 4 2;B 6 9 4 2;b 7 11 2 2;d 7 7 2 2',
sprout:'G 3 6 4 3;D 3 8 4 1;G 9 4 4 3;D 9 6 4 1;D 7 6 2 6;n 3 11 10 3;N 3 13 10 1;s 4 11 3 1',
leaf:'D 7 5 2 9;G 3 2 4 4;G 9 1 4 4;G 3 7 4 3;G 9 6 4 3;n 4 13 8 2',
cup:'w 3 6 8 7;n 3 6 8 2;N 3 7 8 1;l 3 12 8 1;l 11 7 2 1;l 13 8 1 3;l 11 11 2 1;g 2 13 12 1',
book:'B 3 2 10 12;b 4 3 8 10;B 3 2 2 12;c 6 5 5 1;c 6 7 4 1;w 4 13 10 1',
street:'r 7 2 2 1;r 5 3 6 1;r 3 4 10 1;r 2 5 12 1;R 2 6 12 1;w 3 7 10 6;l 3 12 10 1;n 7 9 2 4;c 4 8 2 2;c 10 8 2 2',
sea:'y 10 2 2 1;y 9 3 4 5;b 2 7 12 7;B 2 11 12 3;c 3 9 3 1;c 9 9 3 1;c 6 12 4 1',
river:'G 2 2 12 12;D 2 12 12 2;D 3 4 2 2;D 11 8 2 2;b 6 2 3 4;b 7 6 3 3;b 8 9 3 3;b 9 12 3 2;c 7 3 1 2;c 8 7 1 1',
pool:'b 2 4 12 10;c 2 4 12 2;B 2 11 12 3;l 10 1 1 7;l 13 1 1 7;l 11 3 2 1;l 11 5 2 1;w 3 8 3 1;w 7 9 3 1',
shop:'l 2 12 12 2;w 3 9 10 3;r 3 5 10 4;p 3 5 10 1;w 5 6 1 3;w 8 6 1 3;w 11 6 1 3;d 7 5 2 7',
school:'w 6 1 4 3;c 7 2 2 1;r 2 4 12 2;R 2 6 12 1;w 2 7 12 7;l 2 13 12 1;c 4 8 2 2;c 10 8 2 2;n 7 10 2 4',
town:'l 3 2 10 12;g 3 13 10 1;g 3 2 10 1;c 5 4 2 2;c 9 4 2 2;c 5 7 2 2;c 9 7 2 2;r 2 10 12 1;n 6 11 4 2',
pin:'r 6 2 4 1;r 5 3 6 4;p 5 3 2 2;r 6 7 4 1;R 7 8 2 3;w 7 4 2 2',
str:'d 2 6 2 4;d 12 6 2 4;g 4 5 2 6;g 10 5 2 6;l 6 7 4 2;w 4 5 1 2;w 10 5 1 2',
rock:'l 4 4 8 1;l 3 5 10 8;g 3 10 10 3;d 3 12 10 1;g 9 6 3 4;w 5 5 3 1;w 4 6 2 1',
heart:'r 3 3 4 1;r 9 3 4 1;r 2 4 12 3;r 3 7 10 1;r 4 8 8 1;r 5 9 6 1;r 6 10 4 1;r 7 11 2 1;R 11 5 2 2;R 10 7 2 1;R 9 8 2 1;R 8 9 2 1;R 7 10 2 2;p 3 4 2 1;w 3 5 1 1',
bulb:'y 5 2 6 1;y 4 3 8 5;y 5 8 6 1;Y 10 4 2 4;Y 9 8 1 1;w 5 4 1 2;l 6 9 4 1;g 6 10 4 1;d 7 11 2 1',
eye:'w 5 5 6 6;w 3 6 10 4;w 2 7 12 2;b 6 5 4 6;B 6 9 4 2;d 7 7 2 2;w 7 6 1 1',
fire:'r 7 1 2 2;r 6 3 3 2;r 5 5 5 3;r 4 7 8 5;r 5 12 6 1;o 6 8 4 4;y 7 10 2 3',
sofa:'B 3 4 10 4;b 3 4 10 1;b 1 7 3 5;b 12 7 3 5;b 4 8 8 3;B 4 10 8 1;B 1 11 14 1;d 2 12 2 2;d 12 12 2 2',
corn:'y 6 1 4 9;Y 7 2 1 1;Y 9 4 1 1;Y 7 6 1 1;Y 9 8 1 1;G 4 7 3 7;G 9 7 3 7;D 6 9 4 5;G 7 13 2 2',
yam:'v 4 5 8 1;v 3 6 10 3;v 2 7 12 3;m 3 10 10 1;m 5 11 6 1;w 4 6 2 1;n 1 8 1 1;n 14 8 1 1',
spinach:'D 7 8 2 6;G 3 3 5 5;G 8 2 5 5;G 4 7 4 4;G 8 7 4 4;D 5 5 2 1;D 9 4 2 1',
berry:'G 4 3 8 1;G 7 1 2 2;r 3 4 10 4;r 4 8 8 2;r 5 10 6 1;r 6 11 4 1;R 3 7 10 1;y 5 5 1 1;y 8 5 1 1;y 10 6 1 1;y 6 8 1 1;y 9 9 1 1',
sunrise:'o 7 1 2 2;o 3 3 1 1;o 12 3 1 1;o 1 7 2 1;o 13 7 2 1;y 6 5 4 1;y 5 6 6 1;y 4 7 8 3;o 1 10 14 1;O 3 12 10 1',
sun:'y 5 4 6 8;y 4 5 8 6;o 7 1 2 2;o 7 13 2 2;o 1 7 2 2;o 13 7 2 2;o 3 3 1 1;o 12 3 1 1;o 3 12 1 1;o 12 12 1 1;w 6 5 2 1',
dusk:'o 3 3 1 1;o 12 3 1 1;r 6 5 4 1;r 5 6 6 1;r 4 7 8 3;v 1 10 14 1;m 3 12 10 1',
moon:'y 7 2 4 1;y 5 3 3 1;y 4 4 2 1;y 3 5 3 6;y 4 11 2 1;y 5 12 3 1;y 7 13 6 1;y 11 12 2 1;y 12 11 1 1;w 11 5 1 1;w 13 8 1 1',
rain:'l 5 3 5 1;l 3 4 10 4;l 2 5 12 2;g 3 8 10 1;b 4 10 1 2;b 7 10 1 3;b 10 10 1 2;B 5 13 1 1',
cloud:'l 5 4 4 1;l 3 5 10 5;l 2 6 12 3;g 3 10 10 1',
wind:'l 2 5 8 1;l 9 4 2 1;l 10 3 2 1;l 11 4 1 1;l 2 8 11 1;l 12 9 2 1;l 13 10 1 1;l 4 11 6 1;l 9 12 2 1',
coin:'y 4 4 8 8;y 5 3 6 1;y 5 12 6 1;Y 5 2 6 1;Y 4 3 2 1;Y 10 3 2 1;Y 3 4 1 8;Y 12 4 1 8;Y 4 12 2 1;Y 10 12 2 1;Y 5 13 6 1;Y 7 5 2 6;w 5 5 1 2',
bolt:'y 8 1 4 1;y 7 2 4 1;y 6 3 4 1;y 5 4 4 1;y 4 5 8 2;y 7 7 4 1;y 6 8 4 1;y 5 9 4 1;y 5 10 3 1;y 4 11 3 1;y 4 12 2 1;o 4 5 1 2',
lock:'g 5 2 6 1;g 4 3 2 4;g 10 3 2 4;y 3 7 10 7;Y 3 13 10 1;k 7 9 2 3',
check:'G 2 8 2 2;G 4 10 2 2;G 6 8 2 2;G 8 6 2 2;G 10 4 2 2;G 12 2 2 2',
x:'C 3 3 2 2;C 5 5 2 2;C 7 7 2 2;C 9 9 2 2;C 11 11 2 2;C 11 3 2 2;C 9 5 2 2;C 5 9 2 2;C 3 11 2 2',
spark:'y 7 2 2 3;y 7 11 2 3;y 2 7 3 2;y 11 7 3 2;y 5 5 6 6;w 7 7 2 2;o 6 6 1 1',
fish:'b 3 6 8 4;b 4 5 6 6;B 5 9 5 1;b 11 6 1 4;b 12 5 1 6;b 13 4 1 8;k 5 7 1 1;w 4 6 1 1',
pot:'w 5 2 1 2;w 8 1 1 3;w 11 2 1 2;o 3 5 10 2;l 2 7 12 2;l 3 9 10 2;l 5 11 6 1;b 3 8 10 1',
plate:'l 4 4 8 8;l 3 5 10 6;l 2 6 12 4;w 5 5 6 6;w 4 6 8 4;g 0 3 1 9;g 15 3 1 9',
basket:'n 5 3 6 1;n 5 3 1 3;n 10 3 1 3;n 2 6 12 7;N 2 8 12 1;N 2 11 12 1;N 5 6 1 7;N 8 6 1 7;N 11 6 1 7;N 3 13 10 1',
hands:'b 0 6 3 4;r 13 6 3 4;s 3 6 10 4;s 4 5 8 1;s 4 10 8 1;n 6 8 1 2;n 8 8 1 2;n 10 8 1 2',
store:'r 2 4 3 3;w 5 4 3 3;r 8 4 3 3;w 11 4 3 3;R 2 7 12 1;y 2 8 12 6;n 6 9 4 5;c 3 9 2 2;c 11 9 2 2',
gift:'r 2 6 12 3;r 3 9 10 5;R 3 13 10 1;y 7 6 2 8;y 5 3 2 3;y 9 3 2 3;y 7 5 2 1',
snack:'n 7 1 2 14;p 5 2 6 4;w 5 6 6 4;G 5 10 6 4',
teddy:'n 4 2 3 3;n 9 2 3 3;n 4 4 8 5;s 6 7 4 2;k 5 5 1 1;k 10 5 1 1;k 7 7 2 1;n 3 9 10 5;N 3 13 3 1;N 10 13 3 1',
clip:'n 3 2 10 13;w 4 4 8 10;g 6 1 4 2;k 5 6 6 1;k 5 8 6 1;k 5 10 4 1',
face:'s 4 5 8 8;H 4 3 8 3;H 3 4 1 5;H 12 4 1 5;k 6 8 1 2;k 9 8 1 2;r 7 11 2 1;b 3 13 10 2'
};
PX.fish2=PX.fish.replace(/(^|;)b /g,'$1o ').replace(/(^|;)B /g,'$1O ');
const ICONS=false;   // true 로 바꾸면 아래 목록 밖의 옛 아이콘도 모두 나타나요
const KEEP=['x','lock','check','chat','compass','sprout','cup','book','street','sea','river','pool','shop','school','town','pin','str','rock','heart','bulb','eye','fire','sofa','spark'],OL='#16202c',_pc={};
function px(n,c,o){const s=PX[n];if(!s)return'';if(!ICONS&&!KEEP.includes(n))return'';
 const key=n+(o?JSON.stringify(o):'');let r=_pc[key];
 if(!r){const P=o?Object.assign({},PAL,o):PAL,g=Array.from({length:16},()=>Array(16).fill(null));
  s.split(';').forEach(t=>{const[k,x,y,w,h]=t.split(' ').map((v,i)=>i?+v:v);for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)g[j][i]=P[k]});
  const q=g.map(r=>r.slice());if(n!=='x')for(let j=0;j<16;j++)for(let i=0;i<16;i++)if(!g[j][i]&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>g[j+b]&&g[j+b][i+a]))q[j][i]=OL;
  r='';for(let j=0;j<16;j++){let i=0;while(i<16){const c=q[j][i];if(!c){i++;continue}let e=i;while(e<16&&q[j][e]===c)e++;r+=`<rect fill="${c}" x="${i}" y="${j}" width="${e-i}" height="1"/>`;i=e}}_pc[key]=r}
 return`<svg class="px ${c||''}" viewBox="0 0 16 16" aria-hidden="true">${r}</svg>`}
const ic=(m,k,c)=>m[k]?px(m[k],c):'';
const LOCI={street:'street',sea:'sea',river:'river',pool:'pool',shop:'shop',school:'school',town:'town'};
const STI={체력:'str',끈기:'rock',다정:'heart',재치:'bulb',눈치:'eye',용기:'fire',rest:'sofa'};
const CROPI={옥수수:'corn',고구마:'yam',시금치:'spinach',딸기:'berry'};
const TI=['sunrise','sun','dusk','moon'],NAVI={rp:'chat',act:'compass',life:'sprout',ooc:'cup',me:'book'};
let selLoc=null,ws,S,me,I={},ROOM,PW,dead=0,busy=0,pend,tab='rp',RQ=[],A=null,openLoc=null,prevLife=null,tt;
const last={rp:0,ooc:0},TABS=['rp','act','life','ooc','me'];
const $=i=>document.getElementById(i),send=o=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k){try{return localStorage.getItem(k)||''}catch{return''}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};

/* ───────── 아이콘 ───────── */
const OUTDOOR=['street','sea','river'];
document.querySelectorAll('nav button').forEach(b=>b.querySelector('em').innerHTML=px(NAVI[b.dataset.t]));$('fx').innerHTML=px('x');

/* ───────── 접속 ───────── */
$('room').value=store.get('room');
function go(role){const room=$('room').value.trim();if(!room)return;ROOM=room;PW=$('pw').value;me=role;store.set('room',room);store.set('role',role);
 ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host);
 ws.onopen=()=>{send({type:'join',room,role,pw:PW});$('login').hidden=true;$('net').hidden=true};
 ws.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.type==='init'){I=m.d;return}
  if(m.type==='deny'){dead=1;alert(m.t);location.reload();return}
  if(m.type==='kick'){dead=1;alert('다른 곳에서 같은 캐릭터로 접속했어요.');return}
  if(m.type==='toast'){toast(m.t);return}
  if(m.type==='recap'){const r=$('recap');r.hidden=false;r.innerHTML='<b>자리를 비운 사이</b><br>'+m.ls.map(esc).join('<br>')+'<br><a href="#" onclick="this.parentNode.hidden=true;return false" style="color:var(--ac)">닫기</a>';return}
  if(m.type==='roll'){RQ.push(...m.rolls);if(!busy)nx();return}
  if(m.type==='state'){if(busy){if(pend&&!m.s.log&&pend.s.log)m.s.log=pend.s.log;pend=m;return}apply(m)}};
 ws.onclose=()=>{if(!dead){$('net').hidden=false;setTimeout(()=>go(role),2000)}}}
function apply(m){const old=S;S=Object.assign(m.s,I);if(!S.log&&old)S.log=old.log;draw()}   // 로그는 바뀔 때만 서버가 보낸다

/* ───────── 작은 도구: 토스트 · 떠오르는 숫자 ───────── */
function toast(t){const e=$('toast');e.textContent=t;e.hidden=false;clearTimeout(tt);tt=setTimeout(()=>e.hidden=true,2400)}
function pop(el,txt,bad){if(!el)return;const r=el.getBoundingClientRect(),s=document.createElement('span');s.textContent=txt;s.className='pop'+(bad?' bad':'');
 s.style.left=(r.left+r.width/2)+'px';s.style.top=r.top+'px';$('pops').appendChild(s);s.onanimationend=()=>s.remove()}

/* ───────── 탭 ───────── */
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;draw();const L=$(tab==='rp'?'rplog':tab==='ooc'?'ooclog':'');if(L)requestAnimationFrame(()=>L.scrollTop=1e9)});

/* ───────── 능력치 분배 ───────── */
function allocDraw(){$('ast').innerHTML=I.stats.map(k=>`<div class="ar"><span>${k}</span><button onclick="al('${k}',-1)" aria-label="${k} 줄이기">−</button><b>${A.v[k]}</b><button onclick="al('${k}',1)" aria-label="${k} 늘리기">+</button></div>`).join('');$('pl').textContent=A.left;$('aok').disabled=A.left!==0}
function al(k,d){if(d>0&&(A.left<1||A.v[k]>=8))return;if(d<0&&A.v[k]<=2)return;A.v[k]+=d;A.left-=d;allocDraw()}
function allocOk(){send({type:'alloc',st:A.v});send({type:'trait',k:$('tr').value})}

/* ───────── 역극 / 잡담 / 일기 ───────── */
function say(){const t=$('t').value.trim();if(!t)return;send({type:'chat',t,k:$('k').value});$('t').value=''}
function ooc(){const t=$('o').value.trim();if(!t)return;send({type:'chat',t,k:'ooc'});$('o').value=''}
function dia(){const t=$('dti').value.trim();if(t){send({type:'diary',t});$('dti').value=''}}
['t','o','dti'].forEach(i=>$(i).onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing)({t:say,o:ooc,dti:dia})[i]()});
const exp=()=>{location.href='/export/'+encodeURIComponent(ROOM)+'?pw='+encodeURIComponent(PW)};

function line(l){const w=l.who?S.names[l.who]:'',mine=l.who===me,t=esc(l.t);
 if(l.k==='say')return`<div class="r ${mine?'me':''}"><small>${w}</small><div class="b">${t}</div></div>`;
 if(l.k==='mind')return`<div class="r ${mine?'me':''}"><small>${w} · 속마음</small><div class="b mind">${t}</div></div>`;
 if(l.k==='act')return`<div class="nar">${w} — ${t}</div>`;
 if(l.k==='roll'||l.k==='ev'){const[a,...b]=t.split('\n');return l.k==='ev'?`<div class="evc"><b>${a}</b>${b.join('\n')}</div>`:`<div class="roll"><b>${a}</b><br>${b.join('\n')}</div>`}
 if(l.k==='ooc')return`<div class="r ${mine?'me':''}"><small>${w}</small><div class="b plain">${t}</div></div>`;
 if(l.k==='note')return`<div class="sys">${w}의 쪽지 · ${t}</div>`;
 return`<div class="${['sys','gm','npc'].includes(l.k)?l.k:'nar'}">${t}</div>`}
function fillLog(id,f){const L=$(id),a=S.log.filter(f),key=a.length+':'+(a.length?a[a.length-1].i:-1);
 if(L.dataset.k===key)return;                                   // 바뀐 게 없으면 다시 그리지 않는다
 const bot=L.scrollTop+L.clientHeight>=L.scrollHeight-60,first=!L.dataset.k;L.dataset.k=key;L.innerHTML=a.map(line).join('');if(bot||first)L.scrollTop=1e9}

/* ───────── 화면 그리기 (보이는 탭만) ───────── */
const RPK=l=>l.k!=='ooc'&&l.k!=='note',OK=l=>l.k==='ooc'||l.k==='note';
function draw(){
 const mp=S.p[me];
 if(!mp.set){$('game').hidden=true;$('alloc').hidden=false;if(!A){A={v:Object.fromEntries(I.stats.map(k=>[k,2])),left:14};$('tr').innerHTML=Object.entries(I.traits).map(([k,v])=>`<option value="${k}">${k} (${v}+1)</option>`).join('');allocDraw()}return}
 $('alloc').hidden=true;$('game').hidden=false;
 $('chn').textContent=S.chs[S.ch].name.split(' - ')[0];
 $('dt').innerHTML=`${S.month} ${S.day}일 · ${px(TI[S.per])} ${S.pers[S.per]} · ${S.wx}`;
 $('stg').textContent=S.stage+' '+S.bond+'/'+S.cap;$('bond').style.width=S.bond+'%';
 $('en').textContent='행동력 '+Math.max(0,mp.en)+'/6';
 const lastI=f=>{for(let i=S.log.length-1;i>=0;i--)if(f(S.log[i]))return S.log[i].i;return -1},cnt={rp:lastI(RPK),ooc:lastI(OK)};
 document.querySelectorAll('nav button').forEach(b=>{const t=b.dataset.t;b.classList.toggle('on',t===tab);$('p-'+t).hidden=t!==tab;if(t===tab&&cnt[t]!=null)last[t]=cnt[t];
  b.querySelector('i').classList.toggle('d',(t!==tab&&cnt[t]!=null&&cnt[t]>last[t])||(t==='act'&&tab!=='act'&&!!S.evd&&(S.evd.who==='b'||S.evd.who===me[0])))});
 if(tab==='rp')fillLog('rplog',RPK);
 if(tab==='ooc')fillLog('ooclog',OK);
 if(tab==='act')drawAct();
 if(tab==='life')drawLife();else prevLife=null;
 if(tab==='me')drawMe();
 if(openLoc)renderSheet();
}

/* ───────── 행동 탭: 장소 타일 → 터치하면 행동 목록 ───────── */
function chance(mod,dc){let n=1;for(let d=2;d<=19;d++)if(d+mod>=dc)n++;return Math.round(n/20*100)}
function drawAct(){
 const mp=S.p[me],e=S.evd,mineEv=e&&(e.who==='b'||e.who===me[0]),sl=S.sl||[],waiting=S.pick[me];
 $('evbox').innerHTML=e?`<div class="evc"><b>${e.title}</b>${mineEv?e.c.map((c,i)=>`<button class="btn ghost choice" ${c[3]?'disabled':''} onclick="send({type:'pick',i:${i}})"><span>${c[3]?px('lock')+' ':''}${c[0]}</span><small>${ic(STI,c[1])} ${c[1]} · 난이도 ${c[2]}${c[3]?'':' · 성공 약 '+chance(mp.st[c[1]]+mp.boost,c[2])+'%'}</small></button>`).join(''):'<small>상대가 선택할 차례예요. 그 사이 장면을 이어가 주세요.</small><button class="btn ghost choice" onclick="send({type:\'dismiss\'})">상대가 자리에 없어요<small>접속 중이면 10분 뒤에 넘길 수 있어요</small></button>'}</div>`:'';
 const rain=S.wx==='비';
 const locs=Object.entries(S.loc).filter(([k])=>(S.av||{})[k]);if(!locs.some(([k])=>k===selLoc))selLoc=(locs.find(([k])=>S.av[k].some(x=>x===1))||locs[0]||[])[0];
 $('jobs').innerHTML=e?'':
  `<div class="status"><span>${px('coin')} ${mp.money}원</span><span>${px(TI[S.per])}  ${S.pers[S.per]} · ${S.wx}${rain?' (야외 난이도 +1)':''}</span><span class="slots">${[0,1,2].map(i=>`<i class="${i<S.per?'u':''}"></i>`).join('')}</span></div>`+
  (waiting?`<div class="wait">${px('check')} 행동을 골랐어요. 상대를 기다리는 중이에요. <button class="link" onclick="send({type:'cancel'})">선택 취소</button></div>`:'')+
  (S.per>=3?'<div class="wait">해가 졌어요. 이제 하루를 넘기면 돼요.</div>':'')+
  `<div class="plan2"><div class="pt"><b>오늘의 일과</b><small>하루를 넘기면 고른 능력치가 단련돼요</small></div><div class="pchips">${['',...S.stats].map(k=>`<button class="pc ${(mp.plan||'')===k?'on':''}" data-p="${k}">${k?ic(STI,k)+' '+k:'정하지 않음'}</button>`).join('')}</div></div>`+
  `<div class="locbar">${locs.map(([k,v])=>{const ok=S.av[k].filter(x=>x===1).length;return`<button class="lt ${k===selLoc?'on':''}" data-l="${k}">${px(LOCI[k]||'pin')}<span>${v.n}</span><small>${ok}</small></button>`}).join('')}</div>`+(S.per>=3?'':`<div id="acts">${actsHTML(selLoc)}</div>`);
 $('daybar').innerHTML=e?'':`<button class="btn sleep ${sl.includes(me)?'on':''}" onclick="send({type:'sleep'})">${sl.includes(me)?px('moon')+' 넘기기 취소':px('moon')+' 하루 넘기기'} <span>${sl.length}/${Object.keys(S.on).length||1}</span>${S.day>S.len?'<small>이 장의 기간이 끝났어요</small>':''}</button>`}
$('jobs').onclick=e=>{const p=e.target.closest('[data-p]');if(p){send({type:'plan',s:p.dataset.p});toast(p.dataset.p?'오늘의 일과를 정했어요':'일과를 비웠어요');return}const t=e.target.closest('[data-l]');if(t){selLoc=t.dataset.l;drawAct();return}const b=e.target.closest('.act');if(!b||b.disabled)return;send({type:'go',l:selLoc,i:+b.dataset.i});toast('행동을 골랐어요')};

function actsHTML(l){const v=S.loc[l],st=(S.av||{})[l];if(!v||!st)return'';const mp=S.p[me],rain=S.wx==='비'&&OUTDOOR.includes(l);
 return v.a.map((x,i)=>{const s=st[i];if(!s)return'';const rest=x[1]==='rest',lock=s!==1,tired=!rest&&mp.en<x[3],off=lock||tired,dc=x[2]+(rain?1:0)+(S.dcb|0);
   const chips=rest?`<span class="chip g">행동력 +${x[3]} 회복</span>`:`<span class="chip">${ic(STI,x[1])} ${x[1]} ${mp.st[x[1]]+mp.boost}</span><span class="chip">난이도 ${dc}${rain?' (비)':''}</span><span class="chip g">성공 약 ${chance(mp.st[x[1]]+mp.boost,dc)}%</span><span class="chip">행동력 -${x[3]}</span>`;
   return`<button class="act" ${off?'disabled':''} data-i="${i}"><span class="ai">${lock?px('lock'):px(STI[x[1]]||'spark')}</span><span class="am"><b>${x[0]}</b><span class="cr">${lock?`<span class="chip">${s}</span>`:tired?'<span class="chip">행동력이 부족해요</span>':chips}</span></span></button>`}).join('')}
function openSheet(l){openLoc=l;renderSheet();$('sheet').hidden=false}
function closeSheet(){openLoc=null;$('sheet').hidden=true}
$('sheet').onclick=e=>{if(e.target===$('sheet'))closeSheet()};
function renderSheet(){
 const v=S.loc[openLoc],st=(S.av||{})[openLoc];if(!v||!st||S.evd||S.per>=3){closeSheet();return}
 const mp=S.p[me],rain=S.wx==='비'&&OUTDOOR.includes(openLoc);
 $('sh').innerHTML=`<div class="sh-top"><h2>${px(LOCI[openLoc]||'pin')} ${v.n}</h2><button class="x" onclick="closeSheet()" aria-label="닫기">${px('x')}</button></div>`+
  v.a.map((x,i)=>{const s=st[i];if(!s)return'';const rest=x[1]==='rest',lock=s!==1,tired=!rest&&mp.en<x[3],off=lock||tired,dc=x[2]+(rain?1:0)+(S.dcb|0);
   const chips=rest?`<span class="chip g">행동력 +${x[3]} 회복</span>`:`<span class="chip">${ic(STI,x[1])} ${x[1]} ${mp.st[x[1]]+mp.boost}</span><span class="chip">난이도 ${dc}${rain?' (비)':''}</span><span class="chip g">성공 약 ${chance(mp.st[x[1]]+mp.boost,dc)}%</span><span class="chip">행동력 -${x[3]}</span>`;
   return`<button class="act" ${off?'disabled':''} data-i="${i}"><span class="ai">${lock?px('lock'):px(STI[x[1]]||'spark')}</span><span class="am"><b>${x[0]}</b><span class="cr">${lock?`<span class="chip">${s}</span>`:tired?'<span class="chip">행동력이 부족해요</span>':chips}</span></span></button>`}).join('');
}
$('sh').onclick=e=>{const b=e.target.closest('.act');if(!b||b.disabled)return;const l=openLoc;closeSheet();send({type:'go',l,i:+b.dataset.i});toast('행동을 골랐어요')};

/* ───────── 골목살림: 미니게임 탭 ───────── */
const SKY=[8,34,64,88];
function slot(ic,n,id,lb){return`<div class="hs" id="${id}" title="${lb}"><em>${ICONS?px(ic):lb}</em><b>${n}</b></div>`}
const LV=x=>Math.min(10,Math.floor(Math.sqrt((x|0)/3))),LVP=x=>{const l=LV(x),a=l*l*3,b=(l+1)*(l+1)*3;return l>=10?100:Math.round(((x|0)-a)/(b-a)*100)};
function drawLife(){
 const mp=S.p[me],iv=Object.assign({fish:0,crop:0,dish:0,star:0},S.inv),pl=S.plots||[],bn=Object.assign({fish:0,star:0,crop:0,dish:0},S.bin),PR=S.price||{fish:15,star:8,crop:14,dish:45},seed=S.seed||10,rain=S.wx==='비';
 const busyEv=!!S.evd,other=me==='nagi'?'junya':'nagi',dis=busyEv?'disabled':'',ce=CROPI[S.cn]||'sprout';
 const planted=pl.filter(x=>x).length,ready=pl.filter(x=>x&&x.w>=S.cd).length,dry=pl.filter(x=>x&&!x.t&&x.w<S.cd).length,free=pl.length-planted,nPlant=Math.min(free,Math.floor(mp.money/seed));
 const g=iv.fish*PR.fish+iv.star*PR.star+iv.crop*PR.crop,bg=bn.fish*PR.fish+bn.star*PR.star+bn.crop*PR.crop+bn.dish*PR.dish,binN=bn.fish+bn.crop+bn.dish;
 const sk=mp.sk||{farm:0,fish:0};
 const plotH=pl.map(x=>!x?`<div class="plot empty" aria-label="빈 칸"></div>`:x.w>=S.cd?`<div class="plot g ready">수확!<small>다 자람</small></div>`:`<div class="plot g ${x.t?'wet':'thirsty'}">${x.w}/${S.cd}<small>${x.t?'물 줌':'목마름'}</small></div>`).join('');
 const skH=[['farm','농사'],['fish','낚시']].map(([k,n])=>`<div class="sk"><b>${n} Lv.${LV(sk[k])}</b><span class="grow"><i style="width:${LVP(sk[k])}%"></i></span></div>`).join('');
 $('life').innerHTML=
 `<div class="farm t${S.per}${rain?' rain':''}">
   <div class="sky"><span class="sun" style="left:${SKY[S.per]||50}%">${px(TI[S.per]||'sun')}</span><span class="wx">${rain?px('rain')+' 비':S.wx==='흐림'?px('cloud')+' 흐림':S.wx==='바람'?px('wind')+' 바람':px('sun')+' 맑음'}</span><span class="dy">${S.month} ${S.day}일</span></div>
   <div class="ppl">${['nagi','junya'].map(k=>`<div class="pl ${S.on[k]?'':'off'} ${k===me?'self':''}"><div><b>${S.names[k]}</b><small>행동력 ${S.p[k].en} · ${S.p[k].money}원</small></div></div>`).join('')}</div>
   ${busyEv?'<div class="wait">장면이 진행 중이에요. 행동 탭에서 먼저 마무리해 주세요.</div>':''}
   <div class="skills">${skH}<small>${S.dcb?'이 장의 난이도 +'+S.dcb+' · ':''}물고기 별 ${iv.star}개</small></div>
   <button class="zone pond" id="zPond" ${dis}><span class="wave"></span><span class="fsh f1">${px('fish')}</span><span class="fsh f2">${px('fish2')}</span><span class="lb"><b>${px('fish')} 연못 낚시</b><small>행동력 1 · 타이밍이 완벽하면 별 물고기</small></span></button>
   <div class="zone field"><div class="plots p4">${plotH}</div>
     <div class="lb"><b>${px('sprout')} 골목 텃밭 · ${S.cn}</b><small>${rain?'비가 와서 물은 저절로 줘요 · ':''}${S.cd}일 동안 물 준 날만 자라요 · 씨앗 ${seed}원/칸</small></div></div>
   <div class="stations s3">
     <button class="st-b" data-f="plant" ${dis||!nPlant?'disabled':''}><b>심기</b><small>${free?nPlant?nPlant+'칸 · -'+nPlant*seed+'원':'씨앗값 부족':'빈 칸 없음'}</small></button>
     <button class="st-b" data-f="water" ${dis||!dry?'disabled':''}><b>물 주기</b><small>${dry?dry+'칸':'줄 곳 없음'}</small></button>
     <button class="st-b" data-f="harvest" ${dis||!ready?'disabled':''}><b>수확</b><small>${ready?ready+'칸 · 농사 Lv.'+LV(sk.farm):'아직 자라는 중'}</small></button>
   </div>
   <div class="stations">
     <button class="st-b" data-a="cook"><em>${px('pot')}</em><b>부엌</b><small>물고기+${S.cn} → 요리</small></button>
     <button class="st-b" data-a="serve"><em>${px('plate')}</em><b>대접</b><small>${S.names[other]}에게 · 유대+2</small></button>
     <button class="st-b" data-a="sell"><em>${px('basket')}</em><b>출하함에 넣기</b><small>${g?'물고기·작물 → 내일 +'+g+'원':'넣을 물건 없음'}</small></button>
     <button class="st-b" data-a="assist"><em>${px('hands')}</em><b>거들기</b><small>행동력 1 · 상대 판정+2</small></button>
   </div>
   <div class="bin"><b>출하함</b><small>${binN?`물고기 ${bn.fish} · 작물 ${bn.crop} · 요리 ${bn.dish} → 내일 아침 +${bg}원`:'비어 있어요. 넣어 두면 밤사이 정산돼요.'}</small><button class="link" data-d="1" ${iv.dish?'':'disabled'}>요리 한 접시 넣기 (+${PR.dish}원)</button></div>
   <div class="shop"><b>${px('store')} 골목 가게</b>
     <button class="shp" data-b="gift"><em>${px('gift')}</em>선물<small>30원 · 유대+3</small></button>
     <button class="shp" data-b="snack"><em>${px('snack')}</em>간식<small>20원 · 행동력 +2</small></button>
     <button class="shp" data-b="keep"><em>${px('teddy')}</em>기념품<small>60원 · 유대+2</small></button>
     <button class="shp" data-b="use"><em>${px('spark')}</em>기억 조각<small>5개 · 판정+3</small></button></div>
 </div>
 <div class="hotbar">${slot('fish',iv.fish,'hFish','물고기')}${slot(ce,iv.crop,'hCrop','채소')}${slot('pot',iv.dish,'hDish','요리')}${slot('coin',mp.money,'hMoney','소지금')}${slot('spark',S.mem,'hMem','기억 조각')}</div>`;
 const cur={hFish:iv.fish,hCrop:iv.crop,hDish:iv.dish,hMoney:mp.money,hMem:S.mem,en:mp.en};
 if(prevLife)for(const k in cur){const d=cur[k]-prevLife[k];if(d)pop(k==='en'?document.querySelector('.pl.self'):$(k),(d>0?'+':'')+d,d<0)}
 prevLife=cur}
$('life').onclick=e=>{
 if(e.target.closest('#zPond')&&!e.target.closest('[disabled]'))return startFish();
 const f=e.target.closest('[data-f]');if(f&&!f.disabled)return send({type:'farm',a:f.dataset.f});
 if(e.target.closest('[data-d]')&&!e.target.closest('[disabled]'))return send({type:'sell',k:'dish'});
 const a=e.target.closest('[data-a]');if(a)return send({type:a.dataset.a});
 const b=e.target.closest('[data-b]');if(b){const k=b.dataset.b;return k==='gift'||k==='use'?send({type:k}):send({type:'buy',k})}};

/* ───────── 낚시 미니게임: 움직이는 찌가 초록 구간에 올 때 터치 ───────── */
let FM=null;
function startFish(){const mp=S.p[me];
 if(S.evd)return toast('장면을 먼저 마무리해 주세요.');
 if(S.pick[me])return toast('골라 둔 행동이 있어요. 상대를 기다리는 중이에요.');
 if(mp.en<1)return toast('행동력이 없어요.');
 const w=.2,z=.1+Math.random()*(.8-w);
 FM={z,w,x:0,dir:1,v:.85+Math.random()*.3,t0:performance.now(),t:performance.now(),done:0,raf:0};
 $('fzone').style.left=z*100+'%';$('fzone').style.width=w*100+'%';$('fmark').style.left='0%';
 $('fmsg').textContent='찌를 던졌어요…';$('fhint').textContent='초록 구간에서 화면을 터치!';$('fish').hidden=false;
 FM.raf=requestAnimationFrame(fishLoop)}
function fishLoop(now){if(!FM||FM.done)return;const dt=Math.min(.05,(now-FM.t)/1000);FM.t=now;
 if(now-FM.t0>700){FM.x+=FM.dir*FM.v*dt;if(FM.x>=1){FM.x=1;FM.dir=-1}if(FM.x<=0){FM.x=0;FM.dir=1}$('fmark').style.left=FM.x*100+'%';$('fmsg').textContent='지금이야?!'}
 FM.raf=requestAnimationFrame(fishLoop)}
function fishTap(){if(!FM)return;
 if(FM.done)return closeFish();
 if(performance.now()-FM.t0<700)return;                          // 던지는 동안엔 무시
 FM.done=1;cancelAnimationFrame(FM.raf);
 const d=Math.abs(FM.x-(FM.z+FM.w/2)),sk=d<=FM.w/2?2:d<=FM.w/2+.12?1:0;
 send({type:'fish',skill:sk});
 $('fmsg').textContent=sk===2?'완벽한 타이밍! (+2)':sk===1?'아슬아슬! (+1)':'너무 빨랐나 봐요…';$('fhint').textContent='터치하면 닫혀요';
 setTimeout(()=>{if(FM&&FM.done)closeFish()},1600)}
function closeFish(){if(FM)cancelAnimationFrame(FM.raf);FM=null;$('fish').hidden=true}
$('fish').onclick=e=>{if(e.target.closest('#fx')){closeFish();return}fishTap()};

/* ───────── 기록 탭 ───────── */
function drawMe(){
 $('side').innerHTML=['nagi','junya'].map(r=>`<div class="card ${S.on[r]?'':'off'}"><b>${S.names[r]}</b> <small>${S.p[r].money}원${S.p[r].boost?' · 다음 판정 +'+S.p[r].boost:''}</small>${S.stats.map(k=>`<div class="st"><span>${k}</span><span class="bar"><i style="width:${S.p[r].st[k]/12*100}%"></i></span><em>${S.p[r].st[k]}</em></div>`).join('')}</div>`).join('')+`<small>유대 ${S.bond} · 기억 조각 ${S.mem}</small>`;
 $('dr').innerHTML=S.diary.map((d,i)=>`<div class="mem">${esc(d)} <a href="#" style="color:var(--ac)" onclick="send({type:'reveal',i:${i}});return false">역극에 공개</a></div>`).join('')||'<small>아직 비어 있어요.</small>';
 $('al').innerHTML=S.album.map(x=>`<div class="mem"><small>${x.ch+1}장 ${x.day}일</small><br>${esc(x.t)}</div>`).join('')||'<small>첫 추억을 기다리는 중.</small>';
 $('npc').innerHTML=S.npcs.map(n=>`<div class="mem"><b>${n.n}</b> <small>${n.t}</small></div>`).join('');
 $('vote').textContent=(S.votes.includes(me)?'동의 취소':'다음 장으로')+` (${S.votes.length}/2)`}

/* ───────── 주사위: 돌아가는 중 터치 = 결과 바로 보기 · 결과에서 터치 = 다음으로 ───────── */
const VC={'대성공':'v3','성공':'v2','실패':'v1','대실패':'v0'};
let DR=null,DT=[],DI=0,DN=0,DTOT=0;
const dclear=()=>{DT.forEach(clearTimeout);DT=[];clearInterval(DI)};
function nx(){dclear();const r=RQ.shift();
 if(!r){DR=null;$('dice').hidden=true;busy=0;DN=0;if(pend){const m=pend;pend=null;apply(m)}return}
 if(!busy){DN=0;DTOT=RQ.length+1}busy=1;DR=r;DN++;DTOT=Math.max(DTOT,DN+RQ.length);
 $('dice').hidden=false;$('dres').hidden=true;const c=$('cube');c.className='';
 $('dinfo').textContent=(I.names[r.who]||'')+' · '+r.title+' ('+r.stat+')'+(DTOT>1?`  [${DN}/${DTOT}]`:'');
 $('dtap').textContent='터치하면 바로 결과를 봐요';$('dall').hidden=!RQ.length;
 DI=setInterval(()=>c.textContent=1+Math.floor(Math.random()*20),70);
 DT.push(setTimeout(()=>{clearInterval(DI);c.className='stop';c.textContent=r.d},1100),setTimeout(showRes,1700))}
function showRes(){if(!DR)return;dclear();const r=DR,c=$('cube');c.className='stop';c.textContent=r.d;
 const x=$('dres');x.hidden=false;x.className=VC[r.res]||'v2';$('dv').textContent=r.res;
 $('dn').textContent='d20 '+r.d+(r.mod?' + '+r.mod+' = '+(r.d+r.mod):'')+' · '+(r.lab||'난이도 '+r.dc);$('dt2').textContent=r.t;
 DR.shown=1;$('dall').hidden=!RQ.length;$('dtap').textContent=RQ.length?'터치하면 다음 판정':'터치하면 닫혀요';DT.push(setTimeout(nx,4500))}
$('dice').onclick=e=>{if(e.target.closest('#dall'))return;if(!DR)return;DR.shown?nx():showRes()};
$('dall').onclick=()=>{RQ.length=0;nx()};
document.addEventListener('keydown',e=>{
 if(!$('dice').hidden&&(e.key===' '||e.key==='Enter'||e.key==='Escape')){e.preventDefault();DR&&DR.shown?nx():showRes()}
 else if(e.key==='Escape'){if(!$('fish').hidden)closeFish();else if(openLoc)closeSheet()}});
