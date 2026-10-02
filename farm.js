// farm.js — 텃밭 규칙. 서버/네트워크와 분리된 순수 함수라서 따로 테스트할 수 있다.
//
// 밭 6칸(r.plots). 칸 하나: { d:심은 일차, by:심은 사람, q:품질 점수, need:['water'|'weed'|'bug'], neg:방치한 날 수 }
//  · 심기(⚡1) → 매일 아침 밭마다 손이 필요한 일이 생긴다 (물 / 잡초 / 벌레, 날씨 영향)
//  · 돌보기(⚡0, 미니게임) → 일을 끝내면 skill(0~2)만큼 품질이 쌓인다
//  · 이틀 연속 방치하면 시든다. 다 자라면 수확(⚡1, 미니게임) — 품질과 skill 로 수확량 1~3
//  · 로맨스: 같은 날 두 사람이 같은 밭을 돌보면(pair) / 심은 사람과 거두는 사람이 다르면(cross) 유대가 오른다
module.exports = D => {
  const N = 6;
  const NEEDS = { water: '물 주기', weed: '잡초 뽑기', bug: '벌레 잡기' };
  const GROW = { water: '끈기', weed: '체력', bug: '눈치' }; // 돌보면 오르는 능력치 경험
  const cropOf = r => D.crops[D.month[r.ch]]; // [이름, 자라는 일수]
  const ripe = (r, pl) => r.day - pl.d >= cropOf(r)[1];

  // {P}=하는 사람 {O}=상대 {C}=작물 (server 의 fmt 가 채운다)
  const TEXT = {
    water: [
      '{P}이(가) 물뿌리개를 기울이다 그만 쏟아 버렸다. 밭이 질척해졌다.',
      '물이 조금 흘렀지만 뿌리 쪽엔 닿았다. {C}이(가) 한결 나아 보인다.',
      '{P}이(가) 딱 알맞게 물을 주었다. 흙이 촉촉하게 반짝인다.',
    ],
    weed: [
      '잡초 몇 포기를 놓쳤다. 내일 또 올라올 것 같다.',
      '{P}이(가) 대부분의 잡초를 뽑았다. 손끝에 흙냄새가 배었다.',
      '{P}이(가) 잡초를 뿌리째 뽑았다. 밭고랑이 말끔해졌다.',
    ],
    bug: [
      '벌레가 잎 사이로 숨어 버렸다. 잎에 구멍이 하나 더 났다.',
      '{P}이(가) 벌레 대부분을 잡았다. 한두 마리는 도망갔다.',
      '{P}이(가) 벌레를 한 마리도 남기지 않고 잡았다. {C} 잎이 반짝인다.',
    ],
  };
  const PAIR = [ // 같은 날 같은 밭을 두 사람이 돌봤을 때
    '같은 밭 위에서 두 사람의 손이 겹쳤다. 흙 묻은 손을 보고 둘이 동시에 웃었다.',
    '{P}이(가) 물을 주는 동안 {O}이(가) 잡초를 뽑았다. 말 없이도 손이 맞는 하루다.',
    '밭고랑에 나란히 쪼그려 앉은 어깨가 슬쩍 닿았다. 아무도 먼저 비키지 않았다.',
  ];
  const CROSS = [ // 심은 사람과 거두는 사람이 다를 때
    '{O}이(가) 심어 둔 {C}을(를) {P}이(가) 거두었다. 서로의 수고를 거두는 기분이 이상하게 뭉클하다.',
    '"네가 심은 거야?" "응." {P}이(가) {C}을(를) 한참 들여다보다 소중하게 바구니에 담았다.',
  ];
  const WILT = (i, name) => `${i + 1}번 밭의 ${name}이(가) 돌보지 못한 사이 시들어 버렸다.`;

  const empty = () => Array(N).fill(null);
  const migrate = r => { // 옛 저장(r.crop: 심은 일차 하나)을 새 구조로
    if (!Array.isArray(r.plots)) { r.plots = empty(); if (r.crop) r.plots[0] = { d: r.crop, by: null, q: 0, need: [], neg: 0 }; }
    while (r.plots.length < N) r.plots.push(null);
    r.plots.length = N;
    delete r.crop;
  };

  const plant = (r, role, i) => {
    if (!Number.isInteger(i) || i < 0 || i >= N) return { err: '그런 밭은 없어요.' };
    if (r.plots[i]) return { err: '이미 무언가 자라고 있어요.' };
    r.plots[i] = { d: r.day, by: role, q: 0, need: [], neg: 0 };
    return { ok: 1, n: i + 1, crop: cropOf(r)[0] };
  };

  const tend = (r, role, i, act, skill) => {
    const pl = Number.isInteger(i) ? r.plots[i] : null;
    if (!pl) return { err: '빈 밭이에요.' };
    if (ripe(r, pl)) return { err: '이미 다 자랐어요. 수확해 주세요.' };
    if (!Object.hasOwn(NEEDS, act) || !pl.need.includes(act)) return { err: '지금은 그 일이 필요하지 않아요.' };
    const sk = [0, 1, 2].includes(skill) ? skill : 0;
    pl.need = pl.need.filter(x => x !== act); pl.q += sk;
    if (!pl.t || pl.t.day !== r.day) pl.t = { day: r.day, by: [] }; // 오늘 이 밭을 돌본 사람들
    if (!pl.t.by.includes(role)) pl.t.by.push(role);
    const pair = pl.t.by.length === 2 && pl.pair !== r.day; if (pair) pl.pair = r.day;
    return { ok: 1, sk, act, name: NEEDS[act], stat: GROW[act], text: TEXT[act][sk], pair, pairText: PAIR[Math.floor(Math.random() * PAIR.length)], left: pl.need.length, n: i + 1 };
  };

  const harvest = (r, role, i, skill) => {
    const pl = Number.isInteger(i) ? r.plots[i] : null;
    if (!pl) return { err: '빈 밭이에요.' };
    if (!ripe(r, pl)) return { err: `${cropOf(r)[0]}이(가) 아직 자라는 중이에요. (${r.day - pl.d}/${cropOf(r)[1]}일)` };
    const sk = [0, 1, 2].includes(skill) ? skill : 0, qual = pl.q + sk;
    const n = 1 + (qual >= 4 ? 1 : 0) + (qual >= 8 ? 1 : 0);
    const cross = !!pl.by && pl.by !== role;
    r.plots[i] = null;
    return { ok: 1, n, sk, grade: n === 3 ? '최고' : n === 2 ? '좋음' : '보통', cross, crossText: CROSS[Math.floor(Math.random() * CROSS.length)], num: i + 1 };
  };

  // 새 날 아침: 방치한 밭 처리 → 새 일감 뽑기. (r.day 와 r.wx 가 이미 새 날 값이어야 한다)
  const newDay = r => {
    const out = [], [name, days] = cropOf(r), rain = r.wx === '비';
    r.plots.forEach((pl, i) => {
      if (!pl) return;
      if (pl.need.length) { pl.neg++; pl.q = Math.max(0, pl.q - 1); } else pl.neg = 0;
      if (pl.neg >= 2) { r.plots[i] = null; out.push(WILT(i, name)); return; }
      if (pl.neg === 1) out.push(`${i + 1}번 밭의 ${name}이(가) 힘이 없어 보인다. 오늘은 꼭 돌봐 주자.`);
      pl.need = [];
      if (r.day - pl.d >= days) return; // 다 자란 밭은 일감이 없다
      if (!rain && Math.random() < 0.7) pl.need.push('water');
      if (Math.random() < (rain ? 0.5 : 0.3)) pl.need.push('weed');
      if (Math.random() < (rain ? 0.1 : 0.3)) pl.need.push('bug');
    });
    const todo = r.plots.filter(p => p && p.need.length).length, done = r.plots.filter(p => p && ripe(r, p)).length;
    if (todo) out.push(`텃밭에 손이 필요한 곳이 ${todo}곳 있다.${rain ? ' (비가 와서 물은 줄 필요가 없다)' : ''}`);
    if (done) out.push(`텃밭에 수확할 수 있는 ${name}이(가) ${done}곳 있다.`);
    return out;
  };

  return { N, NEEDS, empty, migrate, plant, tend, harvest, newDay, ripe, cropOf };
};
