// test.js — 이벤트 로딩/엔딩 판정 점검 (서버 없이 실행: node test.js)
const assert = require('assert');
const D = require('./data'); require('./content')(D);
const E = require('./engine')(D);
const RO = require('./romance')(D, E);

// 1) 로맨틱 사건이 로드되고 need 가 id 로 해석되었는가
const roms = D.events.flat().filter(e => e.rom);
assert(roms.length >= 15, 'rom 사건이 너무 적음: ' + roms.length);
roms.forEach(e => (e.need || []).forEach(id => assert(E.byId[id], `need 해석 실패: ${e.title} → ${id}`)));
roms.forEach(e => e.opts.forEach(o => assert(o.length === 7 && D.stats.includes(o[1]), `선택지 형식 오류: ${e.title}`)));
console.log('rom 사건', roms.length, '개 OK');

// 2) 고백 전/후 분기: 이름 붙이기 b[85,100] vs 고백 전 사건 b[0,84]
const base = () => ({ ch: 3, day: 10, bond: 80, done: ['3:졸업여행 4일'], tried: {}, recent: [],
  p: { nagi: { st: { 체력: 2, 끈기: 2, 다정: 2, 재치: 2, 눈치: 2, 용기: 2 } }, junya: { st: { 체력: 2, 끈기: 2, 다정: 2, 재치: 2, 눈치: 2, 용기: 2 } } } });
let r = base();
assert(E.open(r, E.byId['3:불 하나만 켜 둔 가게']), '고백 전 사건이 열려야 함');
assert(!E.open(r, E.byId['3:처음 잡은 손']), '고백 전에는 처음 잡은 손이 잠겨야 함');
r.bond = 90; r.day = 15;
assert(!E.open(r, E.byId['3:불 하나만 켜 둔 가게']), '유대 85+ 에서는 고백 전 사건이 닫혀야 함');
r.done.push('3:이름 붙이기');
assert(E.open(r, E.byId['3:처음 잡은 손']), '고백 후 처음 잡은 손이 열려야 함');
console.log('고백 전/후 분기 OK');

// 3) 엔딩 4종
const mk = (bond, confessed, romN) => {
  const x = base(); x.bond = bond; x.done = confessed ? ['3:이름 붙이기'] : [];
  roms.slice(0, romN).forEach(e => x.done.push(e.id)); return x;
};
assert.strictEqual(RO.ending(mk(100, true, 10)).id, 'promise');
assert.strictEqual(RO.ending(mk(88, true, 3)).id, 'named');
assert.strictEqual(RO.ending(mk(100, true, 7)).id, 'named');
assert.strictEqual(RO.ending(mk(78, false, 5)).id, 'unspoken');
assert.strictEqual(RO.ending(mk(40, false, 1)).id, 'alley');
console.log('엔딩 4종 OK');

// 4) 장 시뮬레이션 — choose/forced 가 예외 없이 돌고, 장마다 로맨틱 사건이 나오는가
for (let ch = 1; ch <= 3; ch++) {
  let seen = new Set();
  for (let trial = 0; trial < 200; trial++) {
    const x = base(); x.ch = ch; x.bond = D.bondCap[ch] - 3; x.day = 1 + (trial % D.len[ch]);
    x.done = ch === 3 ? ['3:졸업여행 4일', '3:이름 붙이기'] : ch === 2 ? ['2:선수 은퇴', '2:늦은 사춘기', '2:생일 전날'] : ['1:진로 조사서', '0:종이학 천 마리'];
    E.forced(x); const e = E.choose(x, null, true); if (e && e.rom) seen.add(e.title);
  }
  console.log(`${ch + 1}장 로맨틱 사건 ${seen.size}종 등장`);
  assert(seen.size > 0);
}
// 5) 텃밭 규칙 (farm.js)
{
  const F = require('./farm')(D), rn = () => ({ ch: 0, day: 1, wx: '맑음', plots: F.empty() });
  const r = rn(); assert.strictEqual(r.plots.length, 6);
  assert(F.plant(r, 'nagi', 0).ok && F.plant(r, 'nagi', 0).err && F.plant(r, 'nagi', 6).err, '심기/중복/범위');
  const rnd = Math.random; Math.random = () => 0.1; r.day = 2; F.newDay(r); Math.random = rnd;
  assert.strictEqual(r.plots[0].need.length, 3, '일감 3개');
  assert(F.tend(r, 'nagi', 0, 'water', 2).ok && F.tend(r, 'nagi', 0, 'water', 2).err, '물주기 1회만');
  assert.strictEqual(r.plots[0].q, 2); assert(F.tend(r, 'nagi', 0, 'xxx', 1).err, '없는 일 거부');
  const t = F.tend(r, 'junya', 0, 'weed', 1); assert(t.ok && t.pair, '둘이 같은 날 돌보면 pair');
  assert(!F.tend(r, 'junya', 0, 'bug', 1).pair, 'pair 는 하루에 한 번');
  assert(F.harvest(r, 'nagi', 0, 2).err, '덜 자란 밭은 수확 불가');
  r.day = 4; r.plots[0].need = [];
  const h = F.harvest(r, 'junya', 0, 2); assert(h.ok && h.cross && h.n >= 1 && h.n <= 3, 'cross 수확'); assert.strictEqual(r.plots[0], null);
  // 이틀 연속 방치 → 시듦, 다 자란 밭은 방치돼도 안 시듦
  const w = rn(); F.plant(w, 'nagi', 1); Math.random = () => 0.1;
  w.day = 2; F.newDay(w); w.day = 3; F.newDay(w); assert.strictEqual(w.plots[1].neg, 1); w.day = 4; F.newDay(w); Math.random = rnd;
  assert.strictEqual(w.plots[1], null, '방치 시듦');
  const ripe = rn(); F.plant(ripe, 'nagi', 2); ripe.day = 4; F.newDay(ripe); ripe.day = 9; F.newDay(ripe); assert(ripe.plots[2], '다 자란 밭은 유지');
  // 비 오는 날엔 물이 필요 없다
  const rain = rn(); rain.wx = '비'; F.plant(rain, 'nagi', 0); Math.random = () => 0.1; rain.day = 2; F.newDay(rain); Math.random = rnd;
  assert(!rain.plots[0].need.includes('water'), '비 → 물 일감 없음');
  console.log('텃밭 규칙 OK');
}
console.log('ALL PASS');
