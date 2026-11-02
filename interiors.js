// 地点内部：场景美术 + 座位 · Place interiors: scene art + seats (1000 × 640 canvas)
// 每个座位 {x, y}：y 是桌子后沿，坐着的小人下沿对齐这里（下半身被桌子挡住）
// Each seat {x, y}: y is the back edge of the desk; a seated sprite's bottom sits on it.

const P = 'shape-rendering="crispEdges"';
const R = (x, y, w, h, f, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${extra}/>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// 墙上的招牌 · name plaque on the wall
function sign(text, y = 14, bg = '#5E3523', fg = '#FBF2E6') {
  const w = [...text].reduce((s, c) => s + (c.charCodeAt(0) > 255 ? 26 : 14), 0) + 44;
  return `${R(500 - w / 2 - 4, y - 4, w + 8, 52, '#00000022')}${R(500 - w / 2, y, w, 44, bg)}${R(500 - w / 2 + 4, y + 4, w - 8, 36, 'none', ` stroke="${fg}" stroke-opacity="0.35" stroke-width="2"`)}
    <text x="500" y="${y + 30}" text-anchor="middle" font-size="24" font-weight="700" fill="${fg}" font-family="'Noto Sans SC', system-ui, sans-serif">${esc(text)}</text>`;
}

/* ---------- 家具：每件返回 {svg, seats} · furniture: each piece returns its art and its seats ---------- */
// pose: 'seat' = 坐在桌子/椅子后面（只露上半身）· waist-up behind a desk
//       'ground' = 盘腿坐在地上/草地上 · cross-legged on the floor or grass
const seat = (x, y, pose = 'seat') => ({ x, y, pose });
const chairOf = (c, top) => (x, y) => R(x - 20, y - 46, 40, 50, c) + R(x - 23, y - 52, 46, 9, top);
const stoolOf = (c) => (x, y) => R(x - 16, y - 10, 32, 12, c) + R(x - 3, y + 2, 6, 40, c);
const between = (xs) => xs.slice(1).map((x, i) => (x + xs[i]) / 2);

// 长桌 + 椅子 · long table with chairs
function longTable(xs, y, st) {
  const x0 = xs[0] - 60;
  const w = xs[xs.length - 1] - xs[0] + 120;
  let svg = xs.map((x) => st.chair(x, y)).join('');
  svg += R(x0 + 14, y + 30, 10, st.legH || 40, st.leg) + R(x0 + w - 24, y + 30, 10, st.legH || 40, st.leg);
  svg += R(x0, y, w, 22, st.top) + R(x0, y + 22, w, 10, st.apron);
  if (st.deco) svg += between(xs).map((gx) => st.deco(gx, y)).join('');
  return { svg, seats: xs.map((x) => seat(x, y)) };
}
// 圆桌，两人 · round table for two (single pedestal)
function roundTable(cx, y, st) {
  const xs = [cx - 48, cx + 48];
  let svg = xs.map((x) => st.chair(x, y)).join('');
  svg += R(cx - 6, y + 26, 12, 34, st.leg) + R(cx - 26, y + 58, 52, 6, st.leg);
  svg += R(cx - 62, y + 2, 124, 20, st.top) + R(cx - 72, y + 6, 144, 12, st.top) + R(cx - 62, y + 22, 124, 6, st.apron);
  if (st.deco) svg += st.deco(cx, y);
  return { svg, seats: xs.map((x) => seat(x, y)) };
}
// 卡座：沙发靠背 + 桌子 · booth: sofa back behind, table in front
function booth(xs, y, c, st) {
  const x0 = xs[0] - 66;
  const w = xs[xs.length - 1] - xs[0] + 132;
  let svg = R(x0, y - 62, w, 66, c) + R(x0 - 10, y - 30, 14, 34, c) + R(x0 + w - 4, y - 30, 14, 34, c) + R(x0 + 6, y - 56, w - 12, 6, '#FFFFFF22');
  return { svg: svg + longTable(xs, y, { ...st, chair: () => '' }).svg, seats: xs.map((x) => seat(x, y)) };
}
// 吧台 + 高脚凳 · bar counter with stools
function barCounter(xs, y, st) {
  const x0 = xs[0] - 70;
  const w = xs[xs.length - 1] - xs[0] + 140;
  let svg = xs.map((x) => R(x - 16, y - 10, 32, 12, st.stool)).join('');
  svg += R(x0, y, w, 18, st.top) + R(x0 + 6, y + 18, w - 12, 50, st.front) + R(x0 + 6, y + 30, w - 12, 4, '#00000022');
  if (st.deco) svg += between(xs).map((gx) => st.deco(gx, y)).join('');
  return { svg, seats: xs.map((x) => seat(x, y)) };
}
// 双人沙发 · two-seat sofa
function sofa(cx, y, c) {
  const svg = R(cx - 96, y - 56, 192, 60, c) + R(cx - 108, y - 26, 20, 56, c) + R(cx + 88, y - 26, 20, 56, c) + R(cx - 96, y, 192, 28, c)
    + R(cx - 90, y + 2, 86, 6, '#FFFFFF33') + R(cx + 4, y + 2, 86, 6, '#FFFFFF33') + R(cx - 100, y + 28, 10, 8, '#3C4A5C') + R(cx + 90, y + 28, 10, 8, '#3C4A5C');
  return { svg, seats: [seat(cx - 48, y), seat(cx + 48, y)] };
}
// 公园长椅 · park bench
function bench(cx, y, c = '#B07A4A', leg = '#3C4A5C') {
  let svg = R(cx - 100, y - 50, 200, 10, c) + R(cx - 100, y - 34, 200, 10, c) + R(cx - 94, y - 50, 8, 60, leg) + R(cx + 86, y - 50, 8, 60, leg);
  svg += R(cx - 104, y, 208, 14, c) + R(cx - 94, y + 14, 8, 26, leg) + R(cx + 86, y + 14, 8, 26, leg);
  return { svg, seats: [seat(cx - 48, y), seat(cx + 48, y)] };
}
// 矮桌 + 坐垫（坐地上）· low table with floor cushions (sit on the floor)
function lowTable(cx, y, st) {
  const xs = [cx - 52, cx + 52];
  let svg = xs.map((x) => R(x - 30, y - 10, 60, 22, st.cushion) + R(x - 26, y - 8, 52, 4, '#FFFFFF33')).join('');
  svg += R(cx - 26, y - 22, 52, 10, st.top) + R(cx - 22, y - 12, 6, 16, st.leg) + R(cx + 16, y - 12, 6, 16, st.leg);
  if (st.deco) svg += st.deco(cx, y - 30);
  return { svg, seats: xs.map((x) => seat(x, y, 'ground')) };
}
// 野餐垫（坐草地上）· picnic blanket on the grass
function blanket(cx, y, c = '#C94F3D') {
  let svg = R(cx - 104, y - 22, 208, 44, '#FBF2E6');
  for (let x = cx - 104, k = 0; x < cx + 104; x += 26, k++) svg += R(x, y - 22 + (k % 2) * 22, 26, 22, c);
  svg += R(cx - 14, y - 30, 28, 22, '#B07A4A') + R(cx - 10, y - 38, 20, 6, '#8C4F33') + R(cx - 8, y - 2, 16, 10, '#3B5BA9');
  return { svg, seats: [seat(cx - 52, y, 'ground'), seat(cx + 52, y, 'ground')] };
}
// 沙滩巾（坐沙滩上）· beach towels on the sand
function towels(cx, y, c1 = '#3B7FC4', c2 = '#F07F6A') {
  let svg = '';
  [[cx - 52, c1], [cx + 52, c2]].forEach(([x, c]) => { svg += R(x - 34, y - 26, 68, 50, c); for (let i = 0; i < 3; i++) svg += R(x - 34, y - 18 + i * 16, 68, 5, '#FFFFFF66'); });
  svg += R(cx - 10, y - 4, 20, 16, '#E3A72F') + R(cx - 6, y - 10, 12, 6, '#E3A72F');
  return { svg, seats: [seat(cx - 52, y, 'ground'), seat(cx + 52, y, 'ground')] };
}
// 遮阳伞（画在后面）· beach umbrella (background)
const umbrella = (cx, y, c = '#F07F6A') => R(cx - 3, y - 150, 6, 150, '#8C4F33') + R(cx - 96, y - 160, 192, 16, c) + R(cx - 70, y - 174, 140, 16, c) + R(cx - 30, y - 174, 30, 30, '#FBF2E6');
// 草地块 · a patch of grass
const lawn = (x, y, w, h) => R(x, y, w, h, '#A8D08D') + R(x + 8, y + 8, w - 16, h - 16, '#9CC783') + [0.15, 0.45, 0.8].map((f) => R(x + w * f, y + h * 0.3, 6, 10, '#7FB069')).join('');

/* ---------- 桌面小物 desk deco ---------- */
const lamp = (x, y) => R(x - 9, y + 12, 18, 5, '#8C6A44') + R(x - 2, y - 8, 4, 22, '#8C6A44') + R(x - 16, y - 20, 32, 13, '#2E7D5B') + R(x - 12, y - 8, 24, 3, '#F6E7A8');
const books = (x, y) => R(x - 18, y + 4, 30, 6, '#A23E5A') + R(x - 14, y - 2, 28, 6, '#3B5BA9') + R(x - 16, y - 8, 26, 6, '#E3A72F');
const cups = (x, y) => R(x - 20, y + 2, 12, 12, '#FBF2E6') + R(x - 8, y + 5, 4, 5, '#FBF2E6') + R(x + 6, y + 2, 12, 12, '#FBF2E6') + R(x + 9, y + 3, 6, 3, '#6B3E1F');
const teapot = (x, y) => R(x - 14, y - 4, 28, 18, '#3E6B5A') + R(x - 6, y - 10, 12, 6, '#3E6B5A') + R(x + 14, y, 8, 4, '#3E6B5A') + R(x - 34, y + 6, 10, 8, '#FBF2E6') + R(x + 26, y + 6, 10, 8, '#FBF2E6');
const scope = (x, y) => R(x - 12, y + 10, 24, 6, '#3C4A5C') + R(x - 3, y - 18, 6, 30, '#3C4A5C') + R(x - 3, y - 26, 14, 10, '#3C4A5C') + R(x + 16, y - 2, 10, 16, '#9CCBDB') + R(x + 15, y - 6, 12, 4, '#7E97AD');
const monitor = (x, y) => R(x - 22, y - 30, 44, 30, '#2B2F36') + R(x - 18, y - 26, 36, 22, '#6FA8DC') + R(x - 3, y, 6, 10, '#2B2F36') + R(x - 12, y + 10, 24, 4, '#2B2F36');
const goods = (x, y) => R(x - 16, y - 6, 14, 20, '#F07F6A') + R(x + 2, y + 2, 16, 12, '#E3A72F');
const picnic = (x, y) => R(x - 24, y + 2, 18, 12, '#F07F6A') + R(x + 4, y + 4, 16, 10, '#8DBF73');
const shell = (x, y) => R(x - 20, y + 4, 14, 10, '#FBF2E6') + R(x + 4, y + 2, 16, 12, '#F07F6A');

/* ---------- 场景 scenes ---------- */
function shelves(y0, y1) {
  const cols = ['#A23E5A', '#3B5BA9', '#E3A72F', '#2E7D5B', '#6B4FA0', '#C94F3D', '#1F6F8B', '#D9A93B'];
  let s = R(0, y0, 1000, y1 - y0, '#6B3E1F');
  let k = 0;
  for (let sy = y0 + 14; sy + 40 <= y1; sy += 50) {
    for (let x = 14; x < 986; x += 12) {
      const h = 30 + ((k * 7) % 11);
      if ((k * 13) % 29 !== 0) s += R(x, sy + 40 - h, 10, h, cols[k % cols.length]);
      k++;
    }
    s += R(0, sy + 40, 1000, 8, '#4A2A17');
  }
  for (let x = 0; x <= 1000; x += 166) s += R(x - 4, y0, 8, y1 - y0, '#4A2A17');
  return s;
}
function trees(list, leaf = '#6FA85A', trunk = '#8C4F33') {
  return list.map(([x, y, s = 1]) => R(x - 6 * s, y, 12 * s, 26 * s, trunk) + R(x - 30 * s, y - 50 * s, 60 * s, 52 * s, leaf) + R(x - 20 * s, y - 64 * s, 40 * s, 16 * s, leaf)).join('');
}
function planks(y0, c1, c2) {
  let s = R(0, y0, 1000, 640 - y0, c1);
  for (let y = y0 + 34; y < 640; y += 34) s += R(0, y, 1000, 3, c2);
  return s;
}
function tiles(y0, c1, c2, size = 60) {
  let s = R(0, y0, 1000, 640 - y0, c1);
  for (let y = y0, r = 0; y < 640; y += size, r++) for (let x = (r % 2) * size; x < 1000; x += size * 2) s += R(x, y, size, size, c2);
  return s;
}
function windowSky(x, y, w, h) {
  let s = R(x, y, w, h, '#BFE3F0');
  const bs = [[0.05, 0.55], [0.18, 0.3], [0.3, 0.6], [0.42, 0.2], [0.55, 0.45], [0.67, 0.35], [0.8, 0.6], [0.9, 0.4]];
  bs.forEach(([fx, fh]) => { s += R(x + fx * w, y + fh * h, w * 0.1, h * (1 - fh), '#9AA7B4'); });
  for (let i = 1; i < 4; i++) s += R(x + (w * i) / 4 - 3, y, 6, h, '#5E6B78');
  return s + R(x, y, w, 8, '#5E6B78') + R(x, y + h - 8, w, 8, '#5E6B78');
}

/* ---------- 桌椅样式 table styles ---------- */
const LIB = { chair: chairOf('#6B3E1F', '#4A2A17'), top: '#8C4F33', apron: '#6B3E1F', leg: '#4A2A17', deco: lamp, legH: 30 };
const CAFE = { chair: chairOf('#B45309', '#8F4207'), top: '#D9A97A', apron: '#A26F43', leg: '#5E3523', deco: cups };
const TEA = { chair: chairOf('#5E3523', '#2B1D14'), top: '#7A3E2E', apron: '#5E2A1E', leg: '#2B1D14', deco: teapot, legH: 26 };
const TEA_LOW = { cushion: '#C94F3D', top: '#7A3E2E', leg: '#2B1D14', deco: (x, y) => R(x - 10, y - 4, 20, 14, '#3E6B5A') + R(x - 4, y - 9, 8, 5, '#3E6B5A') };
const SHOP_BAR = { stool: '#3C4A5C', top: '#F4F4F0', front: '#9AA7B4', deco: goods };
const SHOP = { chair: stoolOf('#3C4A5C'), top: '#F4F4F0', apron: '#9AA7B4', leg: '#5E6B78', deco: goods };
const LAB = { chair: stoolOf('#3C4A5C'), top: '#3C4A5C', apron: '#2B2F36', leg: '#7E97AD', deco: scope };
const OFFICE = { chair: chairOf('#2B2F36', '#1F2A24'), top: '#E8E2D6', apron: '#9AA7B4', leg: '#5E6B78', deco: monitor };
const STONE = { chair: stoolOf('#9AA7B4'), top: '#B9B2A4', apron: '#8C877C', leg: '#8C877C', deco: cups, legH: 30 };
const PICNIC = { chair: chairOf('#B07A4A', '#8C4F33'), top: '#C98B5E', apron: '#8C4F33', leg: '#6B3E1F', deco: picnic };
const DECK = { chair: chairOf('#8C4F33', '#6B3E1F'), top: '#E8D7AE', apron: '#B08A56', leg: '#6B3E1F', deco: cups };
const BEACH = { chair: chairOf('#3B7FC4', '#2B5E94'), top: '#FBF2E6', apron: '#D9C4A0', leg: '#B07A4A', deco: shell };

// 每种地点：背景 bg、家具 items（决定座位）、招牌 · per type: background, furniture (defines seats), sign
const SCENES = {
  library: {
    bg: () => R(0, 0, 1000, 640, '#C98B5E') + shelves(0, 210) + planks(210, '#B98252', '#A26F43') + R(470, 210, 60, 430, '#A23E3E') + R(478, 210, 4, 430, '#C25B4A') + R(518, 210, 4, 430, '#C25B4A'),
    items: () => [
      longTable([140, 260, 380], 290, LIB), longTable([620, 740, 860], 290, LIB),
      roundTable(220, 445, { ...LIB, deco: books }), roundTable(780, 445, { ...LIB, deco: books }),
      sofa(290, 598, '#3E6B5A'), sofa(710, 598, '#A23E5A'),
    ],
    sign: (n) => sign(n, 10),
  },
  cafe: {
    bg() {
      let s = R(0, 0, 1000, 220, '#F3E3CC') + tiles(220, '#E9DCC8', '#D8C6AC');
      s += R(40, 110, 440, 110, '#8C4F33') + R(40, 100, 440, 14, '#5E3523') + R(90, 52, 80, 48, '#9AA7B4') + R(100, 62, 60, 20, '#5E6B78') + R(200, 74, 26, 26, '#FBF2E6') + R(236, 74, 26, 26, '#FBF2E6') + R(300, 60, 120, 40, '#F6E7C8');
      s += R(620, 70, 320, 120, '#2B3A33') + R(630, 80, 300, 100, '#33463D') + [0, 1, 2, 3].map((i) => R(650, 96 + i * 20, 120 + (i % 2) * 80, 5, '#F6E7C8')).join('');
      s += [200, 500, 800].map((x) => R(x - 2, 0, 4, 40, '#3C4A5C') + R(x - 18, 40, 36, 16, '#E3A72F')).join('');
      return s + R(440, 540, 40, 60, '#6FA85A') + R(448, 600, 24, 40, '#B07A4A');
    },
    items: () => [
      roundTable(190, 330, CAFE), roundTable(500, 330, CAFE), roundTable(810, 330, CAFE),
      booth([200, 300], 525, '#A23E5A', CAFE),
      barCounter([640, 750, 860], 525, { stool: '#3C4A5C', top: '#8C4F33', front: '#5E3523', deco: cups }),
    ],
    sign: (n) => sign(n, 8, '#D9694B'),
  },
  teahouse: {
    bg() {
      let s = R(0, 0, 1000, 230, '#7A3E2E') + planks(230, '#C9A06A', '#B08A56') + R(60, 495, 880, 100, '#D9C48A') + R(60, 495, 880, 4, '#B8A06A');
      [[60, 70], [740, 70]].forEach(([x, y]) => { s += R(x, y, 200, 130, '#F6E7C8'); for (let i = 1; i < 4; i++) s += R(x + i * 50 - 3, y, 6, 130, '#5E3523') + R(x, y + i * 32 - 3, 200, 6, '#5E3523'); });
      return s + [320, 680].map((x) => R(x - 2, 0, 4, 60, '#2B1D14') + R(x - 22, 60, 44, 54, '#D94A3A') + R(x - 22, 70, 44, 6, '#D9A93B') + R(x - 22, 98, 44, 6, '#D9A93B')).join('');
    },
    items: () => [
      longTable([150, 250], 340, TEA), longTable([450, 550], 340, TEA), longTable([750, 850], 340, TEA),
      lowTable(200, 555, TEA_LOW), lowTable(500, 555, TEA_LOW), lowTable(800, 555, TEA_LOW),
    ],
    sign: (n) => sign(n, 120, '#2B1D14', '#D9A93B'),
  },
  shop: {
    bg() {
      const cols = ['#F07F6A', '#3B7FC4', '#E3A72F', '#2E9E5B', '#A23E5A', '#F4F4F0'];
      let s = R(0, 0, 1000, 240, '#F4F4F0') + tiles(240, '#E6EAEE', '#D5DCE3', 50);
      for (let r = 0; r < 3; r++) { s += R(30, 80 + r * 52, 940, 8, '#9AA7B4'); for (let x = 40, k = r; x < 960; x += 26, k++) s += R(x, 50 + r * 52, 20, 30, cols[k % cols.length]); }
      return s + R(0, 0, 1000, 26, '#3B7FC4') + R(0, 26, 1000, 8, '#2E9E5B');
    },
    items: () => [barCounter([150, 290, 430, 570, 710, 850], 320, SHOP_BAR), roundTable(260, 525, SHOP), roundTable(740, 525, SHOP)],
    sign: (n) => sign(n, 186, '#3B7FC4'),
  },
  lab: {
    bg() {
      let s = R(0, 0, 1000, 230, '#DCE6EE') + tiles(230, '#EEF2F5', '#E1E8EE', 70);
      s += R(40, 40, 260, 170, '#9AA7B4') + R(56, 56, 228, 110, '#C9D6E0') + R(56, 176, 228, 20, '#7E97AD');
      s += R(700, 40, 260, 150, '#FFFFFF') + R(700, 40, 260, 150, 'none', ' stroke="#9AA7B4" stroke-width="6"') + R(730, 80, 120, 5, '#3B5BA9') + R(730, 104, 170, 5, '#3B5BA9') + R(730, 128, 90, 5, '#A23E5A');
      return s + R(330, 90, 330, 10, '#9AA7B4') + [360, 420, 480, 560, 620].map((x, i) => R(x, 56, 20, 34, ['#9CCBDB', '#F2B6C6', '#A8D08D', '#F6E7A8', '#9CCBDB'][i])).join('');
    },
    items: () => [
      longTable([140, 260, 380], 320, LAB), longTable([620, 740, 860], 320, LAB),
      longTable([140, 260, 380], 525, LAB), roundTable(760, 525, { ...OFFICE, top: '#9CCBDB', apron: '#7E97AD', deco: books }),
    ],
    sign: (n) => sign(n, 140, '#7E97AD'),
  },
  tower: {
    bg: () => R(0, 0, 1000, 250, '#5E6B78') + windowSky(30, 20, 940, 210) + tiles(250, '#C9C2B4', '#BDB5A6', 80) + R(470, 470, 60, 120, '#6FA85A') + R(482, 590, 36, 40, '#9AA7B4'),
    items: () => [
      longTable([140, 260, 380], 335, OFFICE), longTable([620, 740, 860], 335, OFFICE),
      sofa(260, 560, '#3C4A5C'), roundTable(760, 545, { ...OFFICE, chair: chairOf('#C9705A', '#A2523F'), deco: cups }),
    ],
    sign: (n) => sign(n, 186, '#2E7D5B'),
  },
  temple: {
    bg() {
      let s = R(0, 0, 1000, 640, '#D8CDB8');
      for (let y = 250; y < 640; y += 40) for (let x = (y / 40) % 2 ? 0 : 40; x < 1000; x += 80) s += R(x, y, 76, 36, '#CDBFA6');
      s += R(0, 0, 1000, 120, '#BFE3F0') + R(0, 150, 1000, 100, '#C94F3D') + R(0, 120, 1000, 34, '#3C4A5C') + R(300, 70, 400, 30, '#C94F3D') + R(260, 56, 480, 18, '#3C4A5C') + R(440, 180, 120, 70, '#7A2E22');
      return s + trees([[70, 300, 1.2], [930, 300, 1.2]], '#3E6B5A', '#6B3E1F') + lawn(60, 520, 880, 116);
    },
    items: () => [
      roundTable(190, 370, STONE), roundTable(500, 370, STONE), roundTable(810, 370, STONE),
      blanket(280, 580, '#3E6B5A'), blanket(720, 580, '#C94F3D'),
    ],
    sign: (n) => sign(n, 186, '#3C4A5C', '#D9A93B'),
  },
  park: {
    bg() {
      let s = R(0, 0, 1000, 120, '#BFE3F0') + R(0, 120, 1000, 520, '#A8D08D');
      s += trees([[80, 190], [240, 170, 0.8], [760, 170, 0.8], [920, 190]]);
      return s + R(0, 250, 1000, 40, '#E8D7AE') + [[90, 620], [480, 625], [900, 620], [330, 470], [660, 470]].map(([x, y]) => R(x, y, 10, 10, '#F2B6C6') + R(x + 14, y + 4, 8, 8, '#F6E7A8')).join('');
    },
    items: () => [
      bench(190, 360), roundTable(500, 360, PICNIC), bench(810, 360),
      blanket(190, 565, '#C94F3D'), blanket(500, 565, '#3B7FC4'), blanket(810, 565, '#E3A72F'),
    ],
    sign: (n) => sign(n, 30, '#5E8F4A'),
  },
  lake: {
    bg() {
      let s = R(0, 0, 1000, 90, '#BFE3F0') + R(0, 90, 1000, 170, '#8EC5DA') + [[80, 140, 60], [400, 200, 80], [700, 130, 50], [860, 220, 70]].map(([x, y, w]) => R(x, y, w, 5, '#BFE3F0')).join('');
      s += trees([[60, 90, 0.7], [180, 80, 0.5], [880, 86, 0.6]], '#5E8F4A');
      s += planks(260, '#C9A06A', '#A9824F') + R(0, 252, 1000, 12, '#8C6A44') + [40, 960].map((x) => R(x, 120, 6, 70, '#5E8F4A') + R(x + 12, 140, 6, 50, '#5E8F4A')).join('');
      return s + R(0, 455, 1000, 185, '#A8D08D') + R(0, 455, 1000, 8, '#8C6A44') + [[120, 610], [470, 620], [860, 612]].map(([x, y]) => R(x, y, 10, 10, '#F2B6C6')).join('');
    },
    items: () => [
      roundTable(190, 370, DECK), roundTable(500, 370, DECK), roundTable(810, 370, DECK),
      blanket(190, 568, '#1F6F8B'), blanket(500, 568, '#C94F3D'), blanket(810, 568, '#6B4FA0'),
    ],
    sign: (n) => sign(n, 16, '#1F6F8B'),
  },
  beach: {
    bg: () => R(0, 0, 1000, 80, '#BFE3F0') + R(0, 80, 1000, 140, '#5FA8C9') + R(0, 200, 1000, 30, '#BFE3F0') + R(0, 220, 1000, 420, '#F2E3B3') + umbrella(250, 400) + umbrella(750, 400, '#2E9E5B'),
    items: () => [
      roundTable(250, 380, BEACH), roundTable(750, 380, BEACH),
      towels(190, 575), towels(500, 575, '#2E9E5B', '#E3A72F'), towels(810, 575, '#6B4FA0', '#3B7FC4'),
    ],
    sign: (n) => sign(n, 110, '#F07F6A'),
  },
};

/* ---------- 专属场景 place-specific scenes (key: city/place) ---------- */
// 林雪平市立图书馆：北欧风，落地玻璃墙正对林雪平大教堂，桦木地板，白色书架，长桌吊灯，扶手椅阅读角
// Linköping City Library: Scandinavian, glass wall facing Linköping Cathedral, birch floor,
// white shelves, a long shared table under pendant lamps, and an armchair reading corner.
const BIRCH = '#E9D3AE';
const SPECIAL = {
  'linkoping/lib': {
    seats: [
      { y: 330, seats: [220, 360, 500, 640, 780] },
      { y: 480, seats: [200, 340, 660, 800] },
      { y: 612, seats: [250, 400, 600, 750] },
    ],
    art(name) {
      let s = R(0, 0, 1000, 640, '#F4F1EA');
      // 落地玻璃墙 + 窗外：天空、树、大教堂 · glass wall with sky, trees and the cathedral
      s += R(0, 0, 1000, 250, '#CFE6F2') + R(0, 196, 1000, 54, '#A8D08D');
      s += trees([[150, 170, 0.9], [300, 180, 0.7], [470, 176, 0.8], [900, 172, 0.9]], '#7FB069', '#7A5A3A');
      // 大教堂：石砌教堂 + 铜绿尖塔 · cathedral: stone nave and a tall copper-green spire
      s += R(560, 140, 300, 70, '#D8CFC0') + R(552, 126, 316, 16, '#5E8F7A') + [585, 625, 785, 825].map((x) => R(x, 154, 14, 34, '#A9B7C6') + R(x + 3, 150, 8, 4, '#A9B7C6')).join('');
      s += R(675, 70, 70, 140, '#D8CFC0') + R(696, 92, 28, 40, '#A9B7C6') + R(700, 160, 20, 50, '#8C6A44');
      s += R(670, 58, 80, 14, '#5E8F7A') + R(680, 40, 60, 18, '#5E8F7A') + R(690, 22, 40, 18, '#5E8F7A') + R(698, 6, 24, 16, '#5E8F7A') + R(705, -6, 10, 12, '#5E8F7A') + R(708, -14, 4, 8, '#D9A93B');
      for (let x = 0; x <= 1000; x += 125) s += R(x - 4, 0, 8, 250, '#FFFFFF');
      s += R(0, 120, 1000, 6, '#FFFFFF') + R(0, 244, 1000, 10, '#FFFFFF');
      // 桦木地板 · birch floor
      s += R(0, 254, 1000, 386, '#E6D2B0');
      for (let y = 284; y < 640; y += 30) s += R(0, y, 1000, 2, '#D6BE96');
      // 两侧白色书架 · white shelves on both sides
      const cols = ['#1F6F8B', '#D9A93B', '#C94F3D', '#2E7D5B', '#6B4FA0', '#E8B48C', '#3B5BA9'];
      [[0, 96], [904, 96]].forEach(([x0, w]) => {
        s += R(x0, 254, w, 386, '#FFFFFF') + R(x0 + (x0 ? 0 : w - 6), 254, 6, 386, '#DDD8CE');
        let k = x0;
        for (let y = 274; y + 40 < 640; y += 56) {
          for (let x = x0 + 10; x < x0 + w - 14; x += 11, k++) if (k % 5) s += R(x, y + 40 - (28 + (k * 7) % 12), 9, 28 + (k * 7) % 12, cols[k % cols.length]);
          s += R(x0, y + 40, w, 6, '#DDD8CE');
        }
      });
      // 吊灯 · pendant lamps over the long table
      [290, 430, 570, 710].forEach((x) => { s += R(x - 1, 0, 2, 214, '#3C4A5C') + R(x - 22, 214, 44, 18, '#2B2F36') + R(x - 16, 232, 32, 4, '#F6E7A8'); });
      // 第一排：长桌，五个座位，彩色北欧椅 · row 1: long shared table, five seats, coloured chairs
      const chairCols = ['#D9A93B', '#1F6F8B', '#C9705A', '#2E7D5B', '#D9A93B'];
      [220, 360, 500, 640, 780].forEach((x, i) => { s += R(x - 20, 288, 40, 46, chairCols[i]) + R(x - 23, 282, 46, 8, '#FFFFFF33'); });
      s += R(180, 360, 10, 40, '#FFFFFF') + R(810, 360, 10, 40, '#FFFFFF') + R(160, 330, 680, 22, BIRCH) + R(160, 352, 680, 8, '#C9A97A');
      [290, 430, 570, 710].forEach((x, i) => { s += i % 2 ? R(x - 16, 332, 30, 6, '#C94F3D') + R(x - 12, 326, 26, 6, '#1F6F8B') : R(x - 18, 334, 14, 12, '#FFFFFF') + R(x + 2, 334, 18, 12, '#9CCBDB'); });
      // 第二排：两张小桌 + 中间大盆栽 · row 2: two tables with a big plant between
      [[270, [200, 340]], [730, [660, 800]]].forEach(([cx, seats]) => {
        seats.forEach((x, i) => { s += R(x - 20, 438, 40, 46, i ? '#1F6F8B' : '#C9705A') + R(x - 23, 432, 46, 8, '#FFFFFF33'); });
        s += R(cx - 135, 510, 10, 36, '#FFFFFF') + R(cx + 125, 510, 10, 36, '#FFFFFF') + R(cx - 150, 480, 300, 22, BIRCH) + R(cx - 150, 502, 300, 8, '#C9A97A');
        s += R(cx - 12, 466, 4, 20, '#3C4A5C') + R(cx - 24, 458, 28, 10, '#2B2F36') + R(cx + 6, 482, 26, 8, '#F4F1EA');
      });
      s += R(474, 480, 52, 54, '#FFFFFF') + R(478, 484, 44, 4, '#DDD8CE') + R(452, 430, 96, 52, '#5E8F4A') + R(466, 412, 68, 22, '#6FA85A') + R(488, 404, 26, 12, '#7FB069');
      // 第三排：地毯 + 扶手椅阅读角 · row 3: rug and armchair reading corner
      s += R(170, 560, 660, 80, '#D9C4A0') + R(180, 570, 640, 70, '#E8B48C');
      [250, 400, 600, 750].forEach((x, i) => {
        const c = ['#3E6B5A', '#C9705A', '#1F6F8B', '#3E6B5A'][i];
        s += R(x - 32, 560, 64, 56, c) + R(x - 40, 588, 14, 44, c) + R(x + 26, 588, 14, 44, c) + R(x - 40, 612, 80, 24, c) + R(x - 34, 614, 68, 6, '#FFFFFF33');
      });
      [325, 675].forEach((x) => { s += R(x - 22, 600, 44, 10, BIRCH) + R(x - 3, 610, 6, 30, '#C9A97A') + R(x - 12, 590, 14, 10, '#FFFFFF') + R(x + 4, 594, 12, 6, '#C94F3D'); });
      // 达拉木马 · a Dala horse on the shelf end
      s += R(930, 228, 22, 14, '#C94F3D') + R(948, 218, 8, 12, '#C94F3D') + R(932, 242, 4, 8, '#C94F3D') + R(946, 242, 4, 8, '#C94F3D') + R(936, 232, 10, 3, '#D9A93B');
      return s + sign(name, 14, '#1F2A24', '#FFFFFF');
    },
  },
};
const sceneFor = (kind, key) => SPECIAL[key] || SCENES[kind] || SCENES.library;

// 座位列表（扁平）· flat seat list; key = "city/place" picks a place-specific scene if there is one
export function seatsOf(kind, key) {
  const sc = sceneFor(kind, key);
  if (sc.items) return sc.items().flatMap((it) => it.seats);
  return sc.seats.flatMap((t) => t.seats.map((x) => seat(x, t.y, t.pose)));
}

export function interiorSVG(kind, name, key) {
  const sc = sceneFor(kind, key);
  const art = sc.items ? sc.bg() + sc.items().map((it) => it.svg).join('') + sc.sign(name) : sc.art(name);
  return `<g ${P}>${art}</g>`;
}
