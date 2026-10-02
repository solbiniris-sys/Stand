// server.js — 같은 골목 (서나기 · 이준야 2인 역극 게임 서버)
// 폴더 구조: server.js / data.js / content.js / engine.js / legacy.js / ch1a.js ... / package.json / public/(index.html, app.js, style.css)
const express = require('express'), http = require('http'), crypto = require('crypto'), fs = require('fs');
const { WebSocketServer } = require('ws');
const D = require('./data'); require('./content')(D);
const E = require('./engine')(D);
const Ro = require('./romance')(D, E); // 엔딩 판정 (마지막 장 끝에서 호출)

const app = express(); app.use(express.static(__dirname + '/public'));
const srv = http.createServer(app);
const wss = new WebSocketServer({ server: srv, maxPayload: 16 * 1024 }); // 기본값(100MB) 방지

/* ── 저장 ── */
const FILE = (process.env.DATA_DIR || __dirname) + '/save.json';
const R = Object.create(null); // 세션 코드가 '__proto__' 등이어도 안전하도록 프로토타입 없는 객체 사용
let timer;
try { Object.assign(R, JSON.parse(fs.readFileSync(FILE))); } catch {}
const save = () => { clearTimeout(timer); timer = setTimeout(() => fs.writeFile(FILE + '.tmp', JSON.stringify(R), () => fs.rename(FILE + '.tmp', FILE, () => {})), 400); };
const flush = () => { try { fs.writeFileSync(FILE, JSON.stringify(R)); } catch {} process.exit(0); };
process.on('SIGTERM', flush); process.on('SIGINT', flush);
process.on('uncaughtException', e => console.error('uncaught', e)); // 이상한 메시지 하나로 서버 전체가 죽지 않도록

/* ── 기본 도구 ── */
const NM = { nagi: '서나기', junya: '이준야' };
const WX = ['맑음', '맑음', '흐림', '비', '바람'];
// ── 난이도·살림 설정: 숫자만 바꾸면 전체 균형이 조절돼요 ──
const DCB = [0, 1, 1, 2];                                   // 장별 난이도 보정 (모든 판정 난이도에 더해짐)
const PRICE = { fish: 15, star: 8, crop: 14, dish: 45 };    // 출하 단가 (별 물고기는 +8)
const SEED = 10, PLOTS = 4;                                  // 씨앗값(칸당) · 텃밭 칸 수
const SKN = { farm: '농사', fish: '낚시' };
const slv = xp => Math.min(10, Math.floor(Math.sqrt((xp | 0) / 3))); // 기술 레벨 0~10
const dcb = r => DCB[r.ch] || 0;
const EMPTY_BIN = () => ({ fish: 0, star: 0, crop: 0, dish: 0 });
const rand = n => 1 + Math.floor(Math.random() * n), pk = a => a[rand(a.length) - 1];
const H = x => crypto.createHash('sha256').update('cg:' + String(x || '')).digest('hex');
const P = k => ({ st: { ...D.base[k] }, xp: {}, boost: 0, en: 6, money: 50, set: 0, used: {}, sk: { farm: 0, fish: 0 }, fails: 0 });
const mk = () => ({ tried: {}, wx: '맑음', diary: { nagi: [], junya: [] }, album: [], ch: 0, day: 1, per: 0, sb: 0, bond: D.bondFloor[0], mem: 0,
  done: [], recent: [], ev: null, evAt: 0, votes: [], log: [], n: 0, pick: {}, sl: [], inv: { fish: 0, crop: 0, dish: 0, star: 0 }, plots: Array(PLOTS).fill(0), bin: { nagi: EMPTY_BIN(), junya: EMPTY_BIN() }, last: {},
  p: { nagi: P('nagi'), junya: P('junya') } });

// 옛 저장 파일을 새 구조로 맞춘다 (이벤트 id 방식으로 바뀌면서 필요)
function migrate(r) {
  r.diary = r.diary || { nagi: [], junya: [] }; r.album = r.album || []; r.done = r.done || []; r.recent = r.recent || [];
  r.inv = r.inv || { fish: 0, crop: 0, dish: 0 }; r.sl = r.sl || []; r.last = r.last || {}; r.votes = r.votes || []; r.wx = r.wx || '맑음';
  r.inv.star = r.inv.star | 0;
  if (!Array.isArray(r.plots)) { r.plots = Array(PLOTS).fill(0); if (r.crop) r.plots[0] = { w: Math.max(0, r.day - r.crop), t: 0 }; } // 옛 단일 텃밭 → 칸 구조
  delete r.crop; r.bin = r.bin || {}; for (const k of ['nagi', 'junya']) r.bin[k] = Object.assign(EMPTY_BIN(), r.bin[k]);
  for (const k in r.p) { r.p[k].sk = Object.assign({ farm: 0, fish: 0 }, r.p[k].sk); r.p[k].fails = r.p[k].fails | 0; }
  r.evAt = r.evAt || 0; r.sb = r.sb || 0; r.tried = r.tried || {};
  r.log.forEach((l, i) => { if (l.i == null) l.i = i; });
  r.n = Math.max(r.n || 0, r.log.length ? r.log[r.log.length - 1].i + 1 : 0);
  if (r.ev != null && !E.byId[r.ev]) r.ev = null; // 옛 인덱스식 이벤트 값은 버린다
  delete r.seen; delete r.fx;
  for (const k in r.p) r.p[k].used = r.p[k].used || {};
  r.bond = Math.max(0, Math.min(D.bondCap[r.ch], r.bond));
}
for (const c in R) migrate(R[c]);

const socks = c => [...wss.clients].filter(w => w.room === c && w.readyState === 1);
const online = c => ['nagi', 'junya'].filter(k => socks(c).some(w => w.role === k));
const add = (r, k, t, who) => { r.log.push({ i: r.n++, k, who, t }); if (r.log.length > 2000) r.log.shift(); };
const tell = (ws, t) => ws.send(JSON.stringify({ type: 'toast', t: fill(t) }));
const bc = (c, m) => socks(c).forEach(w => w.send(JSON.stringify(m)));

// {N}{J} 이름 치환 + 조사 자동 보정 (이(가) 은(는) 을(를) 와(과) 으로(로))
const jong = ch => { const n = ch.charCodeAt(0) - 0xAC00; return n < 0 || n > 11171 ? -1 : n % 28; };
const fill = t => String(t).replaceAll('{N}', '나기').replaceAll('{J}', '준야')
  .replace(/([가-힣])(이\(가\)|은\(는\)|을\(를\)|와\(과\)|과\(와\)|으로\(로\))/g, (m, c, j) => {
    const f = jong(c);
    if (j === '이(가)') return c + (f > 0 ? '이' : '가');
    if (j === '은(는)') return c + (f > 0 ? '은' : '는');
    if (j === '을(를)') return c + (f > 0 ? '을' : '를');
    if (j === '으로(로)') return c + (f <= 0 || f === 8 ? '로' : '으로');
    return c + (f > 0 ? '과' : '와');
  });
const withName = (t, k) => fill(String(t).replaceAll('{P}', NM[k]));

const LOC = Object.fromEntries(Object.entries(D.loc).map(([k, v]) => [k, { n: v.n, ch: v.ch, a: v.a.map(a => [a[0], a[1], a[2], a[3]]) }]));
const wd = (r, l) => ['street', 'sea', 'river'].includes(l) && r.wx === '비' ? 1 : 0;
const stg = b => D.stages.filter(x => b >= x[0]).length - 1;
const lk = (r, k, o) => o[7] ? (o[7][0] === 'bond' ? r.bond < o[7][1] : r.p[k].st[o[7][0]] < o[7][1]) : false;
// 행동의 상태: 0=이 장/조건에선 안 보임, 1=가능, 문자열=보이지만 잠김(사유)
const act = (r, k, a) => {
  if (a[8] && !a[8].includes(r.ch)) return 0;
  const L = a[7]; if (!L) return 1;
  if (L[0] === 'ev') return r.done.includes(L[1]) ? 1 : 0;
  if (L[0] === 'noev') return r.done.includes(L[1]) ? 0 : 1;
  if (L[0] === 'bond') return r.bond >= L[1] ? 1 : `유대 ${L[1]} 필요`;
  return r.p[k].st[L[0]] >= L[1] ? 1 : `${L[0]} ${L[1]} 필요`;
};
const avail = (r, k) => { const o = {}; for (const l in D.loc) { const L = D.loc[l]; if (L.ch && !L.ch.includes(r.ch)) continue; const v = L.a.map(a => act(r, k, a)); if (v.some(x => x)) o[l] = v; } return o; };

// [수정됨] 캐릭터, 장(chapter) 정보를 받아 우선순위에 따라 지문을 뽑습니다.
const tx = (t, k, ch) => {
  let v = t;
  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    const phase = ch < 2 ? 'A' : 'B'; 
    v = v[k + ch] || v[k + phase] || v[k] || v['_'] || v['default'] || "지문이 없습니다.";
  }
  return Array.isArray(v) ? pk(v) : v;
};

const roll = (mod, dc) => { const d = rand(20), tot = d + mod, ok = d === 20 || (d > 1 && tot >= dc); return { d, mod, tot, ok, res: d === 20 ? '대성공' : d === 1 ? '대실패' : ok ? '성공' : '실패' }; };

function setB(r, d) {
  const o = stg(r.bond), cap = D.bondCap[r.ch], before = r.bond;
  r.bond = Math.max(Math.max(0, D.bondFloor[r.ch] - 8), Math.min(cap, r.bond + d));
  if (d > 0 && before < cap && r.bond === cap) add(r, 'sys', '이 시기에 쌓을 수 있는 마음은 여기까지인 것 같다. 이야기가 이어지면 더 깊어질 것이다.');
  const n = stg(r.bond);
  if (n > o) add(r, 'sys', `[관계 - ${D.stages[n][1]}] ${D.stages[n][2]}`);
}
const SHOP_B = 4; // 선물·기념품·요리 대접으로 하루에 쌓을 수 있는 유대 (돈·요리로 유대 상한까지 며칠 만에 도달하는 것 방지)
function shopB(r, d) { const g = Math.min(d, Math.max(0, SHOP_B - (r.sb | 0))); r.sb = (r.sb | 0) + g; if (g > 0) setB(r, g); return g; }
function skillXp(r, k, s, n) {
  const p = r.p[k], b = slv(p.sk[s]); p.sk[s] = (p.sk[s] | 0) + n; const a = slv(p.sk[s]);
  if (a > b) add(r, 'sys', fill(`${NM[k]}의 ${SKN[s]} 실력이 늘었다. (Lv.${a})`));
}
// 연속 실패 보호: 두 번 연달아 실패하면 다음 판정에 +2 (스타듀밸리처럼 너무 가혹하지 않게)
function pity(r, k, ok) {
  const p = r.p[k]; if (ok) { p.fails = 0; return; }
  p.fails = (p.fails | 0) + 1;
  if (p.fails >= 2) { p.fails = 0; p.boost = Math.max(p.boost, 2); add(r, 'sys', fill(`${NM[k]}에게 오기가 생겼다. 다음 판정에 +2.`)); }
}
function grow(r, k, s, n) {
  const p = r.p[k]; p.xp[s] = (p.xp[s] || 0) + n;
  if (p.xp[s] >= 6 && p.st[s] < 12) { p.xp[s] = 0; p.st[s]++; add(r, 'sys', fill(`${NM[k]}의 ${s}이(가) 올랐다. (${p.st[s]})`)); }
}
function startEv(r, e, tag) {
  r.ev = e.id; r.evAt = Date.now(); if (!r.done.includes(e.id)) r.done.push(e.id); r.recent = [...r.recent.slice(-14), e.id];
  add(r, 'ev', `${tag} ${fill(e.title)}\n${fill(e.scene)}`);
}

/* ── 상태 전송 ── */
function push(c) {
  const r = R[c]; if (!r) return;
  const on = {}; online(c).forEach(k => (on[k] = 1)); save();
  const e = r.ev == null ? null : E.byId[r.ev], crop = D.crops[D.month[r.ch]];
  socks(c).forEach(w => w.send(JSON.stringify({ type: 'state', s: {
    ch: r.ch, day: r.day, per: r.per, wx: r.wx, bond: r.bond, mem: r.mem, p: r.p, inv: r.inv, plots: r.plots, bin: r.bin[w.role] || null, dcb: dcb(r), price: PRICE, seed: SEED, sl: r.sl, votes: r.votes, album: r.album,
    diary: r.diary[w.role] || [], av: w.role ? avail(r, w.role) : {}, stage: D.stages[stg(r.bond)][1], pick: Object.fromEntries(Object.keys(r.pick).map(k => [k, 1])),
    evd: e && { who: e.who, title: fill(e.title), c: e.opts.map(o => [fill(o[0]), o[1], o[2] + dcb(r), lk(r, w.role, o)]) },
    on, log: w.ln === r.n ? undefined : (w.ln = r.n, r.log.slice(-150)), len: D.len[r.ch], month: D.month[r.ch], cap: D.bondCap[r.ch], cn: crop[0], cd: crop[1],
  } })));
}

/* ── 하루 넘기기 ── */
function newDay(c) {
  const r = R[c], on = online(c), rolls = [];
  for (const k of ['nagi', 'junya']) { // 출하함 정산 (밤사이 팔린다)
    const b = r.bin[k], g = b.fish * PRICE.fish + b.star * PRICE.star + b.crop * PRICE.crop + b.dish * PRICE.dish;
    if (g > 0) { r.p[k].money += g; add(r, 'sys', fill(`출하 정산 / ${NM[k]}: 물고기 ${b.fish} · 작물 ${b.crop} · 요리 ${b.dish} → +${g}원`)); }
    r.bin[k] = EMPTY_BIN();
  }
  r.plots = r.plots.map(p => { if (!p) return 0; if (p.t) p.w++; p.t = 0; return p; }); // 물 준 칸은 밤사이 자란다
  r.per = 0; r.day++; r.sl = []; r.pick = {}; r.sb = 0; // 어제 골라 둔 행동이 새 날에 남아 해결되던 문제 방지
  for (const k in r.p) { r.p[k].en = 6; r.p[k].used = {}; }
  for (const k of on) {
    const d = rand(20), res = d <= 3 ? '불운' : d >= 18 ? '행운' : '평범';
    const t = d <= 3 ? `${NM[k]}은(는) 아침부터 일이 꼬였다. 에너지가 줄었다.` : d >= 18 ? `${NM[k]}은(는) 이유 없이 기분 좋게 하루를 시작했다. 다음 판정에 +2.` : `${NM[k]}의 하루는 평범하게 시작되었다.`;
    if (d <= 3) r.p[k].en -= 1; if (d >= 18) r.p[k].boost = Math.max(r.p[k].boost, 2);
    rolls.push({ who: k, d, mod: 0, lab: '하루 운세', res, title: '오늘의 운', stat: '운', t: fill(t) });
    add(r, 'roll', fill(`오늘의 운 / ${NM[k]} (d20=${d} ${res})\n${t}`));
  }
  r.wx = pk(WX);
  if (r.wx === '비' && r.plots.some(x => x)) { r.plots.forEach(x => { if (x) x.t = 1; }); add(r, 'sys', '비가 텃밭에 물을 대 주었다. 오늘은 물 줄 일이 없다.'); }
  add(r, 'sys', `${D.month[r.ch]} ${r.day}일이 밝았다. 오늘 날씨: ${r.wx}${r.wx === '비' ? ' (야외 행동 난이도 +1)' : ''}.`);
  if (r.day === D.len[r.ch] + 1) add(r, 'sys', '이 장의 기간이 끝났다. 두 사람이 동의하면 다음 장으로 넘어갈 수 있다. 원한다면 계속 머물러도 된다.');
  const f = r.ev == null && E.forced(r); if (f) startEv(r, f, '[정해진 날]');
  for (const k of on) { const s = r.p[k].plan; if (s) { grow(r, k, s, 3); add(r, 'sys', fill(`${NM[k]}이(가) 어제 정해 둔 일과로 ${s}을(를) 단련했다.`)); } }
  bc(c, { type: 'roll', rolls }); push(c);
}

/* ── 한 라운드 해결 (온라인인 모두가 행동을 골랐을 때) ── */
function resolve(c) {
  const r = R[c], on = online(c);
  if (!r || r.ev != null || !on.length || on.some(k => !r.pick[k])) return;
  add(r, 'sys', `${D.month[r.ch]} ${r.day}일 ${D.pers[r.per]}`);
  const rolls = [];
  for (const k of on) {
    const [l, i] = r.pick[k], a = D.loc[l].a[i], p = r.p[k], key = l + ':' + i, h = p.hist = p.hist || [];
    let run = 0; for (let j = h.length - 1; j >= 0 && h[j] === key; j--) run++; // 같은 일을 몇 번째 연속으로 하는지
    const nov = h.includes(key) ? 0 : 1, note = nov ? '\n(오랜만의 새로운 일이라 손끝이 가볍다. 판정 +1)' : run >= 2 ? '\n(같은 일을 거듭해 몸이 먼저 움직인다. 얻는 것이 적다.)' : '';
    r.tried[l + ':' + a[0]] = (r.tried[l + ':' + a[0]] | 0) + 1; // 이 방에서 해 본 행동 기록 (사건 해금용)
    
    // [수정됨] 행동(휴식) 및 성공/실패 시 지문 출력에 tx(.., k, r.ch) 반영
    if (a[1] === 'rest') { p.en = Math.min(8, p.en + a[3]); add(r, 'roll', `${D.loc[l].n} / ${NM[k]} - ${a[0]}\n` + withName(tx(a[4], k, r.ch), k)); continue; }
    const dc = a[2] + wd(r, l) + dcb(r), x = roll(p.st[a[1]] + p.boost + nov, dc), text = withName(tx(x.ok ? a[4] : a[5], k, r.ch), k) + note;
    
    p.boost = 0; pity(r, k, x.ok); p.en = Math.max(0, p.en - a[3]); h.push(key); if (h.length > 8) h.shift();
    grow(r, k, a[1], run >= 2 ? 0 : (x.ok ? 2 : 1) + (nov && x.ok ? 1 : 0));
    if (x.ok) { p.money += a[6] || 0; if (Math.random() < 0.3) r.mem++; }
    add(r, 'roll', `${D.loc[l].n} / ${NM[k]} - ${a[0]} (${a[1]} d20=${x.d}+${x.mod}=${x.tot} 난이도 ${dc} ${x.res})\n${text}`);
    rolls.push({ who: k, d: x.d, mod: x.mod, dc, res: x.res, title: `${D.loc[l].n} - ${a[0]}`, stat: a[1], t: text });
  }
  add(r, 'gm', fill(pk(D.amb[r.ch])));
  if (Math.random() < 0.25) { // 어른들과 마주침
    add(r, 'npc', fill(pk(D.parents)));
    const k = pk(on), x = roll(r.p[k].st['다정'], 9);
    const t = fill(x.ok ? `${NM[k]}이(가) 밝게 인사해 어른들에게 좋은 인상을 남겼다.` : `${NM[k]}이(가) 인사를 얼버무려 머쓱해졌다.`);
    if (x.ok) setB(r, 1);
    add(r, 'roll', `어른들과의 마주침 / ${NM[k]} - 인사 (다정 d20=${x.d}+${x.mod} 난이도 9 ${x.res})\n${t}`);
    rolls.push({ who: k, d: x.d, mod: x.mod, dc: 9, res: x.res, title: '어른들과의 마주침 - 인사', stat: '다정', t });
  }
  if (on.length === 2) {
    const together = r.pick.nagi[0] === r.pick.junya[0];
    if (together) {
      add(r, 'sys', '두 사람은 같은 장소에 있었다.');
      const q = {}; for (const k of on) q[k] = { d: rand(20), m: r.p[k].st['눈치'] };
      const A = q.nagi.d + q.nagi.m, B = q.junya.d + q.junya.m, w = A > B ? 'nagi' : B > A ? 'junya' : null;
      for (const k of on) {
        const o = k === 'nagi' ? 'junya' : 'nagi', tot = q[k].d + q[k].m, opp = q[o].d + q[o].m;
        const res = !w ? '동시에 알아챔' : w === k ? '먼저 알아챔' : '뒤늦게 알아챔';
        const t = !w ? '두 사람이 동시에 서로를 발견했다.' : w === k ? `${NM[k]}이(가) 먼저 상대를 발견하고 다가갔다.` : `${NM[k]}은(는) 이름을 부르는 소리에 뒤늦게 고개를 돌렸다.`;
        rolls.push({ who: k, d: q[k].d, mod: q[k].m, lab: '상대 합계 ' + opp, res, title: '조우 판정', stat: '눈치', t: fill(t) });
        add(r, 'roll', fill(`조우 판정 / ${NM[k]} (눈치 d20=${q[k].d}+${q[k].m}=${tot} 상대 ${opp} ${res})\n${t}`));
      }
    }
    const ev = E.choose(r, together ? r.pick.nagi[0] : null, together);
    if (ev) { if (!together) add(r, 'sys', '서로 다른 곳에 있던 두 사람의 하루가 어딘가에서 겹쳤다.'); startEv(r, ev, together ? '[조우]' : '[사건]'); }
  }
  r.pick = {}; r.per = Math.min(3, r.per + 1);
  const f = r.ev == null && E.forced(r); if (f) startEv(r, f, '[정해진 날]');
  bc(c, { type: 'roll', rolls }); push(c);
}

/* ── 메시지 처리 ── */
const other = me => (me === 'nagi' ? 'junya' : 'nagi');
const LIFE = ['fish', 'farm', 'cook', 'serve', 'sell', 'assist', 'gift', 'buy', 'use'];
const STUFF = ['fish', 'farm', 'cook', 'serve', 'sell', 'assist', 'gift', 'buy', 'use', 'plan', 'trait', 'sleep', 'go'];

function onMessage(ws, raw) {
  let m; try { m = JSON.parse(raw); } catch { return; }
  if (!m || typeof m !== 'object') return;

  if (m.type === 'join') {
    const c = String(m.room || '').trim().slice(0, 20);
    if (!c || !['nagi', 'junya'].includes(m.role)) return;
    if (String(m.pw || '').length < 4) return ws.send(JSON.stringify({ type: 'deny', t: '비밀번호는 4자 이상이어야 합니다.' }));
    if (R[c] && R[c].pw && R[c].pw !== H(m.pw)) return ws.send(JSON.stringify({ type: 'deny', t: '세션 코드 또는 비밀번호가 맞지 않습니다.' }));
    socks(c).forEach(w => { if (w !== ws && w.role === m.role) { w.send(JSON.stringify({ type: 'kick' })); w.role = null; w.close(); } });
    ws.room = c; ws.role = m.role;
    ws.send(JSON.stringify({ type: 'init', d: { chs: D.chapters, stats: D.stats, pers: D.pers, loc: LOC, names: NM, npcs: D.npcs,
      traits: Object.fromEntries(Object.entries(D.traits).filter(([, v]) => v[1] === m.role).map(([k, v]) => [k, v[0]])) } }));
    if (!R[c]) { R[c] = mk(); add(R[c], 'sys', D.chapters[0].intro); }
    R[c].pw = R[c].pw || H(m.pw); migrate(R[c]); push(c);
    const ix = R[c].last[m.role];
    if (ix != null) { // 자리를 비운 사이 상대가 한 말 요약 (로그 번호 기준이라 로그가 잘려도 정확)
      const ls = R[c].log.filter(l => l.i >= ix && l.who && l.who !== m.role && l.k !== 'ooc').slice(-8).map(l => l.t.split('\n')[0].slice(0, 70));
      if (ls.length) ws.send(JSON.stringify({ type: 'recap', ls }));
    }
    return resolve(c);
  }

  const c = ws.room, r = R[c], me = ws.role;
  if (!r || !me) return;
  const p = r.p[me], now = Date.now(), n0 = r.n;
  ws.q = (ws.q || []).filter(t => now - t < 5000); if (ws.q.length > 15) return; ws.q.push(now); // 도배 방지
  if (STUFF.includes(m.type) && !p.set) return; // 능력치 확정 전에는 생활 행동 불가

  switch (m.type) {
    case 'chat': {
      const t = String(m.t || '').slice(0, 600).trim(); if (!t) return;
      add(r, ['say', 'act', 'ooc', 'mind'].includes(m.k) ? m.k : 'say', t, me); break;
    }
    case 'go': {
      if (r.ev != null) return;
      if (r.per >= 3) { add(r, 'sys', '해가 졌다. 하루를 넘겨 주세요.'); break; }
      const Lc = typeof m.l === 'string' && Object.hasOwn(D.loc, m.l) ? D.loc[m.l] : null;
      if (!Lc || (Lc.ch && !Lc.ch.includes(r.ch))) return;
      const a = Number.isInteger(m.i) ? Lc.a[m.i] : null; if (!a || act(r, me, a) !== 1) return;
      if (a[1] !== 'rest' && p.en < a[3]) { add(r, 'sys', fill(`${NM[me]}은(는) 지쳐서 그 일을 할 수 없다.`)); break; }
      r.pick[me] = [m.l, m.i]; push(c); return resolve(c);
    }
    case 'cancel': delete r.pick[me]; break;
    case 'pick': {
      if (r.ev == null) return;
      const e = E.byId[r.ev]; if (!e || (e.who !== 'b' && e.who !== me[0])) return;
      const o = Number.isInteger(m.i) ? e.opts[m.i] : null; if (!o || lk(r, me, o)) return;
      const dc = o[2] + dcb(r), x = roll(p.st[o[1]] + p.boost, dc); p.boost = 0; pity(r, me, x.ok);
      setB(r, (x.ok ? o[5] : o[6]) + (x.d === 20 ? 1 : 0)); r.mem++;
      r.album.push({ ch: r.ch, day: r.day, t: `${fill(e.title)} / ${NM[me]} - ${fill(o[0])} (${x.res})` });
      grow(r, me, o[1], 2);
      
      // [수정됨] 이벤트 내 선택지에도 캐릭터별 지문을 지원하도록 수정
      const t = withName(tx(x.ok ? o[3] : o[4], me, r.ch), me);
      add(r, 'roll', `${NM[me]} - ${fill(o[0])} (${o[1]} d20=${x.d}+${x.mod}=${x.tot} 난이도 ${dc} ${x.res})\n${t}`);
      r.ev = null;
      bc(c, { type: 'roll', rolls: [{ who: me, d: x.d, mod: x.mod, dc, res: x.res, title: `${fill(e.title)}: ${fill(o[0])}`, stat: o[1], t }] });
      push(c); return resolve(c);
    }
    case 'alloc': {
      if (p.set) return;
      const v = D.stats.map(k => (m.st || {})[k]);
      if (v.some(x => !Number.isInteger(x) || x < 2 || x > 8) || v.reduce((a, b) => a + b, 0) !== 26) return;
      D.stats.forEach((k, j) => (p.st[k] = v[j])); p.set = 1; add(r, 'sys', NM[me] + '의 능력치가 정해졌다.'); break;
    }
    case 'trait': {
      const t = typeof m.k === 'string' && Object.hasOwn(D.traits, m.k) ? D.traits[m.k] : null;
      if (!p.set || p.tr || !t || t[1] !== me) return;
      p.tr = m.k; p.st[t[0]] = Math.min(12, p.st[t[0]] + 1); add(r, 'sys', NM[me] + '의 특성: ' + m.k); break;
    }
    case 'sleep': {
      if (r.ev != null || !p.set) return;
      const i = r.sl.indexOf(me); i < 0 ? r.sl.push(me) : r.sl.splice(i, 1);
      if (online(c).every(k => r.sl.includes(k))) return newDay(c);
      break;
    }
    case 'fish': {
      if (r.ev != null) return tell(ws, '장면을 먼저 마무리해 주세요.');
      if (r.pick[me]) return tell(ws, '골라 둔 행동이 있어요. 상대를 기다리는 중이에요.');
      if (p.en < 1) return tell(ws, '행동력이 없어요.');
      const sk = [1, 2].includes(m.skill) ? m.skill : 0; // 미니게임 결과 (최대 +2)
      p.en--; const x = roll(p.st['끈기'] + p.boost + sk + Math.floor(slv(p.sk.fish) / 3), 12 + dcb(r)); p.boost = 0; grow(r, me, '끈기', 1); pity(r, me, x.ok);
      skillXp(r, me, 'fish', x.ok ? 2 : 1);
      if (x.ok) { r.inv.fish += x.d === 20 ? 2 : 1; if (sk === 2 || x.d >= 19) r.inv.star = Math.min(r.inv.fish, r.inv.star + 1); } // 완벽한 타이밍이면 별 물고기
      if (x.d >= 19) { r.mem++; add(r, 'sys', '희귀한 물고기가 걸렸다. 기억 조각 +1'); }
      add(r, 'roll', fill(`낚시 / ${NM[me]} (끈기 d20=${x.d}+${x.mod}=${x.tot} 난이도 ${12 + dcb(r)} ${x.res})\n` + (x.ok ? (x.d === 20 ? '커다란 놈이 걸렸다. 두 마리분이다!' : sk === 2 ? '찌가 정확히 맞았다. 윤기 나는 별 물고기를 건졌다.' : '찌가 움직였다. 물고기를 건졌다.') : '오늘은 입질이 없다. 바다만 오래 바라보았다.'))); break;
    }
    case 'farm': { // 스타듀밸리식: 심기(씨앗값) → 물 주기 → 자람(물 준 날만) → 수확. 비 오는 날은 비가 물을 대신 준다.
      if (r.ev != null) return tell(ws, '장면을 먼저 마무리해 주세요.');
      if (r.pick[me]) return tell(ws, '골라 둔 행동이 있어요. 상대를 기다리는 중이에요.');
      const [name, days] = D.crops[D.month[r.ch]], pl = r.plots, fl = slv(p.sk.farm);
      if (p.en < 1) return tell(ws, '행동력이 없어요.');
      if (m.a === 'plant') {
        const free = pl.map((x, i) => (x ? -1 : i)).filter(i => i >= 0);
        if (!free.length) return tell(ws, '빈 칸이 없어요.');
        const n = Math.min(free.length, Math.floor(p.money / SEED)); if (n < 1) return tell(ws, `씨앗값이 모자라요. (칸당 ${SEED}원)`);
        p.en--; p.money -= n * SEED; free.slice(0, n).forEach(i => (pl[i] = { w: 0, t: r.wx === '비' ? 1 : 0 })); skillXp(r, me, 'farm', n);
        add(r, 'sys', fill(`${NM[me]}이(가) 텃밭 ${n}칸에 ${name} 씨앗을 심었다. (-${n * SEED}원)`));
      } else if (m.a === 'water') {
        const dry = pl.filter(x => x && !x.t); if (!dry.length) return tell(ws, '물 줄 곳이 없어요. (비었거나 이미 줬어요)');
        p.en--; dry.forEach(x => (x.t = 1)); skillXp(r, me, 'farm', 1);
        add(r, 'sys', fill(`${NM[me]}이(가) 텃밭 ${dry.length}칸에 물을 주었다.`));
      } else if (m.a === 'harvest') {
        const ready = pl.map((x, i) => (x && x.w >= days ? i : -1)).filter(i => i >= 0);
        if (!ready.length) return tell(ws, `${name}이(가) 아직 자라는 중이에요.`);
        p.en--; let got = 0; ready.forEach(i => { got += 2 + (rand(10) <= fl ? 1 : 0); pl[i] = 0; });
        r.inv.crop += got; skillXp(r, me, 'farm', ready.length * 2); grow(r, me, '체력', 1);
        add(r, 'sys', fill(`${NM[me]}이(가) ${ready.length}칸을 수확했다. (${name} +${got})`));
      } else return;
      break;
    }
    case 'cook': {
      if (r.ev != null) return;
      if (r.inv.fish < 1 || r.inv.crop < 1) return tell(ws, '물고기와 채소가 하나씩 필요해요.');
      r.inv.fish--; r.inv.crop--; r.inv.star = Math.min(r.inv.star, r.inv.fish); const n = p.st['재치'] >= 6 ? 2 : 1; r.inv.dish += n; grow(r, me, '재치', 1);
      add(r, 'sys', fill(`${NM[me]}이(가) 직접 잡은 재료로 요리를 완성했다. (요리 +${n})`)); break;
    }
    case 'serve': {
      if (r.inv.dish < 1 || (p.used.serve | 0) >= 1) { if (r.inv.dish >= 1) add(r, 'sys', '오늘은 이미 요리를 대접했다.'); break; }
      const o = other(me); r.inv.dish--; p.used.serve = 1; r.p[o].en = Math.min(8, r.p[o].en + 2); shopB(r, 2);
      add(r, 'sys', fill(`${NM[me]}이(가) ${NM[o]}에게 요리를 대접했다. (행동력 +2, 유대 +2)`)); break;
    }
    case 'sell': { // 출하함: 지금 넣어 두면 밤사이 정산돼요 (m.k==='dish' 면 요리 한 접시)
      const iv = r.inv, b = r.bin[me];
      if (m.k === 'dish') {
        if (iv.dish < 1) return tell(ws, '출하할 요리가 없어요.');
        iv.dish--; b.dish++; add(r, 'sys', fill(`${NM[me]}이(가) 요리 한 접시를 출하함에 넣었다. (내일 아침 +${PRICE.dish}원)`)); break;
      }
      if (iv.fish + iv.crop < 1) return tell(ws, '출하할 물건이 없어요.');
      const g = iv.fish * PRICE.fish + iv.star * PRICE.star + iv.crop * PRICE.crop;
      b.fish += iv.fish; b.star += iv.star; b.crop += iv.crop; iv.fish = 0; iv.star = 0; iv.crop = 0;
      add(r, 'sys', fill(`${NM[me]}이(가) 물고기와 작물을 출하함에 넣었다. (내일 아침 정산 +${g}원)`)); break;
    }
    case 'assist': {
      if (p.en < 1) return tell(ws, '행동력이 없어요.');
      const o = r.p[other(me)]; p.en--; o.boost = Math.max(o.boost, 2);
      add(r, 'sys', fill(`${NM[me]}이(가) 상대의 다음 일을 거들기로 했다. (상대 판정 +2)`)); break;
    }
    case 'plan': p.plan = D.stats.includes(m.s) ? m.s : ''; break;
    case 'use': {
      if (r.mem < 5) return tell(ws, '기억 조각이 5개 필요해요.');
      r.mem -= 5; p.boost = 3; add(r, 'sys', fill(`${NM[me]}이(가) 기억 조각을 써서 다음 판정에 +3을 얻었다.`)); break;
    }
    case 'gift': { // 하루 1번 (돈으로 유대를 무한히 사는 것을 방지)
      if (p.money < 30) return tell(ws, '소지금이 모자라요. (30원 필요)');
      if ((p.used.gift | 0) >= 1) { add(r, 'sys', '선물은 하루에 한 번만 건넬 수 있다.'); break; }
      p.money -= 30; p.used.gift = 1; shopB(r, 3); add(r, 'sys', fill(`${NM[me]}이(가) ${NM[other(me)]}에게 작은 선물을 건넸다.`)); break;
    }
    case 'buy': {
      if (m.k === 'snack' && p.money >= 20 && (p.used.snack | 0) < 2) { p.money -= 20; p.used.snack = (p.used.snack | 0) + 1; p.en = Math.min(8, p.en + 2); add(r, 'sys', fill(`${NM[me]}이(가) 간식을 사 먹었다. (행동력 +2)`)); }
      else if (m.k === 'keep' && p.money >= 60 && (p.used.keep | 0) < 1) { p.money -= 60; p.used.keep = 1; shopB(r, 2); r.album.push({ ch: r.ch, day: r.day, t: fill(`${NM[me]}이(가) 기념품을 준비했다`) }); add(r, 'sys', fill(`${NM[me]}이(가) 상대를 떠올리며 기념품을 샀다.`)); }
      break;
    }
    case 'diary': { const t = String(m.t || '').slice(0, 400).trim(); if (t) { r.diary[me].push(t); if (r.diary[me].length > 200) r.diary[me].shift(); } break; }
    case 'reveal': { const t = r.diary[me][m.i | 0]; if (t) add(r, 'mind', t, me); break; }
    case 'dismiss': { // 상대 장면이 열려 있는데 상대가 없거나(오프라인), 10분 넘게 응답이 없으면 넘길 수 있다
      if (r.ev == null) return;
      const e = E.byId[r.ev]; if (!e || e.who === 'b' || e.who === me[0]) return;
      const away = !online(c).includes(e.who === 'n' ? 'nagi' : 'junya'), stale = now - r.evAt > 10 * 60 * 1000;
      if (away || stale) { r.ev = null; add(r, 'sys', '자리를 비운 사람의 장면은 조용히 지나갔다.'); } else add(r, 'sys', '상대가 아직 접속 중이에요. 10분이 지나면 넘길 수 있어요.');
      break;
    }
    case 'note': { const t = String(m.t || '').slice(0, 300).trim(); if (t) add(r, 'note', t, me); break; }
    case 'vote': {
      if (r.day <= D.len[r.ch] && r.votes.indexOf(me) < 0) { add(r, 'sys', `아직 이 장의 기간이 남았어요. (${r.day}/${D.len[r.ch]}일) 굵직한 사건을 놓치지 않도록 기간이 끝난 뒤에 넘어갈 수 있어요.`); break; }
      const i = r.votes.indexOf(me); i < 0 ? r.votes.push(me) : r.votes.splice(i, 1);
      if (r.votes.length === 2) {
        r.votes = [];
        if (r.ch < D.chapters.length - 1) {
          add(r, 'sys', `[${D.chapters[r.ch].name.split(' - ')[0]} 회고] 이 장에서 남긴 추억 ${r.album.filter(x => x.ch === r.ch).length}개 / 현재 유대 ${r.bond} (${D.stages[stg(r.bond)][1]})`);
          r.ch++; r.day = 1; r.per = 0; r.pick = {}; r.ev = null; r.plots = Array(PLOTS).fill(0); r.sl = []; r.wx = pk(WX);
          r.bond = Math.max(r.bond, D.bondFloor[r.ch]); for (const k in r.p) r.p[k].hist = [];
          for (const k in r.p) { r.p[k].en = 6; r.p[k].used = {}; }
          add(r, 'sys', D.chapters[r.ch].name + '\n' + D.chapters[r.ch].intro);
          add(r, 'sys', '한 뼘 자란 만큼, 골목에서 할 수 있는 일도 달라졌다. 행동 탭에서 새로 열린 일들을 확인해 보세요.');
          const f = E.forced(r); if (f) startEv(r, f, '[정해진 날]');
        } else {
          // 마지막 장: 관계에 따라 엔딩을 보여 준다 (이야기는 그대로 계속 진행 가능)
          const e = Ro.ending(r); r.end = e.id;
          add(r, 'sys', fill(`[엔딩 - ${e.title}]\n${e.lines.join('\n')}`));
          add(r, 'sys', `함께 쌓은 설렘 ${e.stats.rom}개 / 유대 ${e.stats.bond} / 추억 ${e.stats.memories}개`);
          if (e.hint) add(r, 'sys', fill(e.hint));
          add(r, 'sys', '이야기는 계속된다. 더 머물며 다른 결말을 향해 가 보아도 좋다.');
        }
      }
      break;
    }
    default: return;
  }
  if (LIFE.includes(m.type)) { const nl = r.log.filter(l => l.i >= n0); if (nl.length) tell(ws, nl[nl.length - 1].t.split('\n')[0]); }
  push(c);
}

wss.on('connection', ws => {
  ws.dead = false; ws.on('pong', () => (ws.dead = false));
  ws.on('message', raw => { try { onMessage(ws, raw); } catch (e) { console.error('message error', e); } });
  ws.on('close', () => {
    const r = R[ws.room]; if (!r || !ws.role) return;
    r.last[ws.role] = r.n; push(ws.room);
    const room = ws.room; setTimeout(() => { try { resolve(room); } catch (e) { console.error(e); } }, 8000); // 상대가 나간 뒤에도 기다리던 라운드가 풀리도록
  });
});
setInterval(() => wss.clients.forEach(w => { if (w.dead) return w.terminate(); w.dead = true; w.ping(); }), 30000); // 프록시의 유휴 연결 끊김 방지

app.get('/export/:c', (q, s) => {
  const r = R[q.params.c];
  if (!r || r.pw !== H(q.query.pw)) return s.status(404).end();
  s.set({ 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': 'attachment; filename=session.txt' });
  s.send(r.log.map(l => (l.who ? NM[l.who] + ': ' : '') + l.t).join('\n\n'));
});

srv.listen(process.env.PORT || 3000, () => console.log('listening'));
