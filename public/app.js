'use strict';
let ws,S,me,I={},ROOM,PW,dead=0,busy=0,pend,tab='rp',RQ=[],A=null,openLoc=null,prevLife=null,tt;
const last={rp:0,ooc:0},TABS=['rp','act','life','ooc','me'];
const $=i=>document.getElementById(i),send=o=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k){try{return localStorage.getItem(k)||''}catch{return''}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};

/* ───────── 아이콘 ───────── */
const LOCI={street:'🏘️',sea:'🌊',river:'🏞️',pool:'🏊',shop:'🍣',school:'🏫',town:'🏬'};
const STI={체력:'💪',끈기:'🪨',다정:'💗',재치:'💡',눈치:'👀',용기:'🔥',rest:'🛋️'};
const CROPI={옥수수:'🌽',고구마:'🍠',시금치:'🥬',딸기:'🍓'};
const OUTDOOR=['street','sea','river'];

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
 $('dt').textContent=`${S.month} ${S.day}일 · ${['🌅','☀️','🌇','🌙'][S.per]||''}${S.pers[S.per]} · ${S.wx}`;
 $('stg').textContent=S.stage+' '+S.bond+'/'+S.cap;$('bond').style.width=S.bond+'%';
 $('en').textContent='⚡'+Math.max(0,mp.en)+'/6';
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
 $('evbox').innerHTML=e?`<div class="evc"><b>${e.title}</b>${mineEv?e.c.map((c,i)=>`<button class="btn ghost choice" ${c[3]?'disabled':''} onclick="send({type:'pick',i:${i}})"><span>${c[3]?'🔒 ':''}${c[0]}</span><small>${STI[c[1]]||''} ${c[1]} · 난이도 ${c[2]}${c[3]?'':' · 성공 약 '+chance(mp.st[c[1]]+mp.boost,c[2])+'%'}</small></button>`).join(''):'<small>상대가 선택할 차례예요. 그 사이 장면을 이어가 주세요.</small><button class="btn ghost choice" onclick="send({type:\'dismiss\'})">상대가 자리에 없어요<small>접속 중이면 10분 뒤에 넘길 수 있어요</small></button>'}</div>`:'';
 const rain=S.wx==='비';
 $('jobs').innerHTML=e?'':
  `<div class="status"><span>💰 ${mp.money}원</span><span>${['🌅','☀️','🌇','🌙'][S.per]||''} ${S.pers[S.per]} · ${S.wx}${rain?' (야외 난이도 +1)':''}</span><span class="slots">${[0,1,2].map(i=>`<i class="${i<S.per?'u':''}"></i>`).join('')}</span></div>`+
  (waiting?`<div class="wait">✔ 행동을 골랐어요. 상대를 기다리는 중이에요. <button class="link" onclick="send({type:'cancel'})">선택 취소</button></div>`:'')+
  (S.per>=3?'<div class="wait">해가 졌어요. 이제 하루를 넘기면 돼요.</div>':'')+
  `<div id="map">`+Object.entries(S.loc).filter(([k])=>(S.av||{})[k]).map(([k,v])=>{const st=S.av[k],ok=st.filter(x=>x===1).length;
   return`<button class="tile" data-l="${k}" ${S.per>=3?'disabled':''}><span class="ic">${LOCI[k]||'📍'}</span><b>${v.n}</b><small>${ok?ok+'가지 할 수 있어요':'지금은 잠겨 있어요'}</small></button>`}).join('')+`</div>`;
 $('daybar').innerHTML=e?'':`<button class="btn sleep ${sl.includes(me)?'on':''}" onclick="send({type:'sleep'})">${sl.includes(me)?'🌙 넘기기 취소':'🌙 하루 넘기기'} <span>${sl.length}/${Object.keys(S.on).length||1}</span>${S.day>S.len?'<small>이 장의 기간이 끝났어요</small>':''}</button>`}
$('jobs').onclick=e=>{const b=e.target.closest('[data-l]');if(b&&!b.disabled)openSheet(b.dataset.l)};

function openSheet(l){openLoc=l;renderSheet();$('sheet').hidden=false}
function closeSheet(){openLoc=null;$('sheet').hidden=true}
$('sheet').onclick=e=>{if(e.target===$('sheet'))closeSheet()};
function renderSheet(){
 const v=S.loc[openLoc],st=(S.av||{})[openLoc];if(!v||!st||S.evd||S.per>=3){closeSheet();return}
 const mp=S.p[me],rain=S.wx==='비'&&OUTDOOR.includes(openLoc);
 $('sh').innerHTML=`<div class="sh-top"><h2>${LOCI[openLoc]||'📍'} ${v.n}</h2><button class="x" onclick="closeSheet()" aria-label="닫기">✕</button></div>`+
  v.a.map((x,i)=>{const s=st[i];if(!s)return'';const rest=x[1]==='rest',lock=s!==1,tired=!rest&&mp.en<x[3],off=lock||tired,dc=x[2]+(rain?1:0);
   const chips=rest?`<span class="chip g">⚡ +${x[3]} 회복</span>`:`<span class="chip">${STI[x[1]]||''} ${x[1]} ${mp.st[x[1]]+mp.boost}</span><span class="chip">난이도 ${dc}${rain?'☔':''}</span><span class="chip g">성공 약 ${chance(mp.st[x[1]]+mp.boost,dc)}%</span><span class="chip">⚡ -${x[3]}</span>`;
   return`<button class="act" ${off?'disabled':''} data-i="${i}"><span class="ai">${lock?'🔒':STI[x[1]]||'✨'}</span><span class="am"><b>${x[0]}</b><span class="cr">${lock?`<span class="chip">${s}</span>`:tired?'<span class="chip">행동력이 부족해요</span>':chips}</span></span></button>`}).join('');
}
$('sh').onclick=e=>{const b=e.target.closest('.act');if(!b||b.disabled)return;const l=openLoc;closeSheet();send({type:'go',l,i:+b.dataset.i});toast('행동을 골랐어요')};

/* ───────── 골목살림: 미니게임 탭 ───────── */
const SKY=[8,34,64,88];
function slot(ic,n,id,lb){return`<div class="hs" id="${id}" title="${lb}"><em>${ic}</em><b>${n}</b></div>`}
function drawLife(){
 const mp=S.p[me],iv=S.inv||{fish:0,crop:0,dish:0},cr=S.crop,grown=cr?S.day-cr:0,rd=cr&&grown>=S.cd,ce=CROPI[S.cn]||'🌱',busyEv=!!S.evd,other=me==='nagi'?'junya':'nagi',g=iv.fish*12+iv.crop*8;
 const stage=!cr?'':rd?ce:grown*3>=S.cd*2?'🌿':'🌱';
 const dis=busyEv?'disabled':'';
 $('life').innerHTML=
 `<div class="farm t${S.per}${S.wx==='비'?' rain':''}">
   <div class="sky"><span class="sun" style="left:${SKY[S.per]||50}%">${['🌅','☀️','🌇','🌙'][S.per]||'☀️'}</span><span class="wx">${S.wx==='비'?'🌧️ 비':S.wx==='흐림'?'☁️ 흐림':S.wx==='바람'?'🍃 바람':'🌤️ 맑음'}</span><span class="dy">${S.month} ${S.day}일</span></div>
   <div class="ppl">${['nagi','junya'].map(k=>`<div class="pl ${S.on[k]?'':'off'} ${k===me?'self':''}"><span class="av">${k==='nagi'?'🏊':'🍳'}</span><div><b>${S.names[k]}</b><small>⚡${S.p[k].en} · 💰${S.p[k].money}</small></div></div>`).join('')}</div>
   ${busyEv?'<div class="wait">장면이 진행 중이에요. 행동 탭에서 먼저 마무리해 주세요.</div>':''}
   <button class="zone pond" id="zPond" ${dis}><span class="wave"></span><span class="fsh f1">🐟</span><span class="fsh f2">🐠</span><span class="lb">🎣 연못 낚시<small>⚡1 · 타이밍을 맞춰요</small></span></button>
   <div class="zone field"><div class="plots" id="zField">${[0,1,2,3,4,5].map(i=>`<button class="plot ${cr?'':'empty'} ${rd?'ready':''}" ${dis} aria-label="텃밭">${stage}</button>`).join('')}</div>
     <div class="lb"><b>🌱 골목 텃밭</b><small>${!cr?S.cn+' 심기 · ⚡1':rd?S.cn+' 수확! · ⚡1':S.cn+' 자라는 중 '+grown+'/'+S.cd+'일'}</small>${cr&&!rd?`<span class="grow"><i style="width:${Math.min(100,grown/S.cd*100)}%"></i></span>`:''}</div></div>
   <div class="stations">
     <button class="st-b" data-a="cook"><em>🍳</em><b>부엌</b><small>🐟+${ce} → 🍲</small></button>
     <button class="st-b" data-a="serve"><em>🍽️</em><b>대접</b><small>${S.names[other]}에게 · 유대+2</small></button>
     <button class="st-b" data-a="sell"><em>🧺</em><b>장터</b><small>${g?'모두 팔면 +'+g+'원':'팔 물건 없음'}</small></button>
     <button class="st-b" data-a="assist"><em>🤝</em><b>거들기</b><small>⚡1 · 상대 판정+2</small></button>
   </div>
   <div class="shop"><b>🏪 골목 가게</b>
     <button class="shp" data-b="gift"><em>🎁</em>선물<small>30원 · 유대+3</small></button>
     <button class="shp" data-b="snack"><em>🍡</em>간식<small>20원 · ⚡+2</small></button>
     <button class="shp" data-b="keep"><em>🧸</em>기념품<small>60원 · 유대+2</small></button>
     <button class="shp" data-b="use"><em>✨</em>기억 조각<small>5개 · 판정+3</small></button></div>
   <div class="plan"><label for="plan">📋 오늘의 일과 <small>(하루가 넘어가면 단련돼요)</small></label><select id="plan"><option value="">정하지 않음</option>${S.stats.map(k=>`<option ${mp.plan===k?'selected':''}>${k}</option>`).join('')}</select></div>
 </div>
 <div class="hotbar">${slot('🐟',iv.fish,'hFish','물고기')}${slot(stage&&!rd?'🌱':ce,iv.crop,'hCrop','채소')}${slot('🍲',iv.dish,'hDish','요리')}${slot('💰',mp.money,'hMoney','소지금')}${slot('✨',S.mem,'hMem','기억 조각')}</div>`;
 $('plan').onchange=function(){send({type:'plan',s:this.value})};
 // 늘고 준 만큼 숫자가 떠오른다
 const cur={hFish:iv.fish,hCrop:iv.crop,hDish:iv.dish,hMoney:mp.money,hMem:S.mem,en:mp.en};
 if(prevLife)for(const k in cur){const d=cur[k]-prevLife[k];if(d)pop(k==='en'?document.querySelector('.pl.self'):$(k),(d>0?'+':'')+d+(k==='en'?'⚡':''),d<0)}
 prevLife=cur}
$('life').onclick=e=>{
 if(e.target.closest('#zPond')&&!e.target.closest('[disabled]'))return startFish();
 if(e.target.closest('#zField'))return send({type:'farm'});
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
 if(now-FM.t0>700){FM.x+=FM.dir*FM.v*dt;if(FM.x>=1){FM.x=1;FM.dir=-1}if(FM.x<=0){FM.x=0;FM.dir=1}$('fmark').style.left=FM.x*100+'%';$('fmsg').textContent='지금이야? 🎣'}
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
