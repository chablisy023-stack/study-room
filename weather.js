// 随机天气：每座城市每 30 分钟换一次；同一时间同一座城，所有人看到的天气相同（不需要服务器）
// Random weather: changes every 30 min per city; deterministic from city + time slot,
// so everyone in the same city sees the same weather without a server.

export const WEATHER_SLOT = 30 * 60e3;
export const WEATHERS = ['sunny', 'cloudy', 'rain', 'snow', 'fog'];
export const WEATHER_ICON = { sunny: '☀️', cloudy: '☁️', rain: '🌧️', snow: '❄️', fog: '🌫️' };

// 各城市的气候权重 [晴, 多云, 雨, 雪(仅冬季), 雾] · climate weights [sunny, cloudy, rain, snow (winter only), fog]
const CLIMATE = {
  linkoping: [25, 35, 20, 25, 10],
  beijing: [50, 25, 10, 15, 8],
  london: [15, 40, 35, 5, 12],
  paris: [25, 35, 30, 5, 8],
  tokyo: [45, 25, 25, 5, 3],
  seoul: [40, 25, 20, 15, 5],
  newyork: [40, 25, 20, 15, 5],
  sydney: [55, 25, 20, 0, 3],
};
const SOUTH = new Set(['sydney']);

function isWinter(cityId, date) {
  const m = date.getMonth() + 1;
  return SOUTH.has(cityId) ? m >= 6 && m <= 8 : m >= 11 || m <= 3;
}

// 简单的整数哈希 · small integer hash
function hash(str) {
  let h = 2166136261;
  for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return h >>> 0;
}

// 天气会持续一阵：每个时段有 75% 的机会延续上一个时段的天气（最多往回看 16 段）
// Weather tends to last: each slot has a 75% chance to keep the previous slot's weather (looks back up to 16 slots).
export function weatherFor(cityId, now = Date.now()) {
  let slot = Math.floor(now / WEATHER_SLOT);
  for (let k = 0; k < 16 && hash(`${cityId}:keep:${slot}`) % 100 < 75; k++) slot--;
  return pick(cityId, slot, now);
}

function pick(cityId, slot, now) {
  const w = [...(CLIMATE[cityId] || CLIMATE.linkoping)];
  if (!isWinter(cityId, new Date(now))) w[3] = 0;
  const total = w.reduce((a, b) => a + b, 0);
  let r = hash(`${cityId}:${slot}`) % total;
  for (let i = 0; i < w.length; i++) { if (r < w[i]) return WEATHERS[i]; r -= w[i]; }
  return 'sunny';
}
