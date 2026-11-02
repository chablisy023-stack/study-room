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

/* ---------- 座位布局 seat layouts ---------- */
// 长桌：每排两张，每张 3 个座位 · long tables: two per row, three seats each
function longTables(rows, seatGap = 120) {
  const tables = [];
  rows.forEach((y) => [260, 740].forEach((cx) => tables.push({ cx, y, w: 380, seats: [-seatGap, 0, seatGap].map((d) => cx + d) })));
  return tables;
}
// 小桌：每排三张，每张 2 个座位 · small tables: three per row, two seats each
function smallTables(rows) {
  const tables = [];
  rows.forEach((y) => [190, 500, 810].forEach((cx) => tables.push({ cx, y, w: 200, seats: [cx - 50, cx + 50] })));
  return tables;
}

// 画桌子和椅子 · draw tables + chairs; deco(x, y) puts things on the desk between seats
function drawTables(tables, st) {
  let back = '';
  let front = '';
  tables.forEach((t) => {
    t.seats.forEach((sx) => { back += st.chair(sx, t.y); });
    const x0 = t.cx - t.w / 2;
    front += R(x0 + 14, t.y + 30, 10, st.legH || 40, st.leg) + R(x0 + t.w - 24, t.y + 30, 10, st.legH || 40, st.leg);
    front += R(x0, t.y, t.w, 22, st.top) + R(x0, t.y + 22, t.w, 10, st.apron);
    if (st.deco) {
      const gaps = [];
      for (let i = 0; i < t.seats.length - 1; i++) gaps.push((t.seats[i] + t.seats[i + 1]) / 2);
      gaps.forEach((gx) => { front += st.deco(gx, t.y); });
    }
  });
  return back + front;
}
const chairOf = (c, top) => (x, y) => R(x - 20, y - 46, 40, 50, c) + R(x - 23, y - 52, 46, 9, top);
const stoolOf = (c) => (x, y) => R(x - 16, y - 10, 32, 12, c);

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

const SCENES = {
  library: {
    seats: longTables([280, 450, 610 - 20]),
    art(name) {
      return R(0, 0, 1000, 640, '#C98B5E') + shelves(0, 210) + planks(210, '#B98252', '#A26F43') + R(470, 210, 60, 430, '#A23E3E') + R(478, 210, 4, 430, '#C25B4A') + R(518, 210, 4, 430, '#C25B4A')
        + drawTables(this.seats, { chair: chairOf('#6B3E1F', '#4A2A17'), top: '#8C4F33', apron: '#6B3E1F', leg: '#4A2A17', deco: lamp, legH: 30 })
        + sign(name, 10);
    },
  },
  cafe: {
    seats: smallTables([330, 520]),
    art(name) {
      let s = R(0, 0, 1000, 220, '#F3E3CC') + tiles(220, '#E9DCC8', '#D8C6AC');
      s += R(40, 110, 440, 110, '#8C4F33') + R(40, 100, 440, 14, '#5E3523') + R(90, 52, 80, 48, '#9AA7B4') + R(100, 62, 60, 20, '#5E6B78') + R(200, 74, 26, 26, '#FBF2E6') + R(236, 74, 26, 26, '#FBF2E6') + R(300, 60, 120, 40, '#F6E7C8');
      s += R(620, 70, 320, 120, '#2B3A33') + R(630, 80, 300, 100, '#33463D') + [0, 1, 2, 3].map((i) => R(650, 96 + i * 20, 120 + (i % 2) * 80, 5, '#F6E7C8')).join('');
      s += [200, 500, 800].map((x) => R(x - 2, 0, 4, 40, '#3C4A5C') + R(x - 18, 40, 36, 16, '#E3A72F')).join('');
      s += R(10, 520, 40, 60, '#6FA85A') + R(18, 580, 24, 40, '#B07A4A') + R(950, 520, 40, 60, '#6FA85A') + R(958, 580, 24, 40, '#B07A4A');
      return s + drawTables(this.seats, { chair: chairOf('#B45309', '#8F4207'), top: '#D9A97A', apron: '#A26F43', leg: '#5E3523', deco: cups }) + sign(name, 8, '#D9694B');
    },
  },
  teahouse: {
    seats: smallTables([330, 520]),
    art(name) {
      let s = R(0, 0, 1000, 230, '#7A3E2E') + planks(230, '#C9A06A', '#B08A56');
      [[60, 70], [740, 70]].forEach(([x, y]) => { s += R(x, y, 200, 130, '#F6E7C8'); for (let i = 1; i < 4; i++) s += R(x + i * 50 - 3, y, 6, 130, '#5E3523') + R(x, y + i * 32 - 3, 200, 6, '#5E3523'); });
      s += [320, 680].map((x) => R(x - 2, 0, 4, 60, '#2B1D14') + R(x - 22, 60, 44, 54, '#D94A3A') + R(x - 22, 70, 44, 6, '#D9A93B') + R(x - 22, 98, 44, 6, '#D9A93B')).join('');
      return s + drawTables(this.seats, { chair: chairOf('#5E3523', '#2B1D14'), top: '#7A3E2E', apron: '#5E2A1E', leg: '#2B1D14', deco: teapot, legH: 26 }) + sign(name, 120, '#2B1D14', '#D9A93B');
    },
  },
  shop: {
    seats: [{ cx: 500, y: 320, w: 860, seats: [150, 290, 430, 570, 710, 850] }, ...longTables([520])],
    art(name) {
      const cols = ['#F07F6A', '#3B7FC4', '#E3A72F', '#2E9E5B', '#A23E5A', '#F4F4F0'];
      let s = R(0, 0, 1000, 240, '#F4F4F0') + tiles(240, '#E6EAEE', '#D5DCE3', 50);
      for (let r = 0; r < 3; r++) { s += R(30, 80 + r * 52, 940, 8, '#9AA7B4'); for (let x = 40, k = r; x < 960; x += 26, k++) s += R(x, 50 + r * 52, 20, 30, cols[k % cols.length]); }
      s += R(0, 0, 1000, 26, '#3B7FC4') + R(0, 26, 1000, 8, '#2E9E5B');
      return s + drawTables(this.seats, { chair: stoolOf('#3C4A5C'), top: '#F4F4F0', apron: '#9AA7B4', leg: '#5E6B78', deco: goods }) + sign(name, 186, '#3B7FC4');
    },
  },
  lab: {
    seats: longTables([320, 520]),
    art(name) {
      let s = R(0, 0, 1000, 230, '#DCE6EE') + tiles(230, '#EEF2F5', '#E1E8EE', 70);
      s += R(40, 40, 260, 170, '#9AA7B4') + R(56, 56, 228, 110, '#C9D6E0') + R(56, 176, 228, 20, '#7E97AD');
      s += R(700, 40, 260, 150, '#FFFFFF') + R(700, 40, 260, 150, 'none', ' stroke="#9AA7B4" stroke-width="6"') + R(730, 80, 120, 5, '#3B5BA9') + R(730, 104, 170, 5, '#3B5BA9') + R(730, 128, 90, 5, '#A23E5A');
      s += R(330, 90, 330, 10, '#9AA7B4') + [360, 420, 480, 560, 620].map((x, i) => R(x, 56, 20, 34, ['#9CCBDB', '#F2B6C6', '#A8D08D', '#F6E7A8', '#9CCBDB'][i])).join('');
      return s + drawTables(this.seats, { chair: stoolOf('#3C4A5C'), top: '#3C4A5C', apron: '#2B2F36', leg: '#7E97AD', deco: scope }) + sign(name, 140, '#7E97AD');
    },
  },
  tower: {
    seats: longTables([340, 530]),
    art(name) {
      let s = R(0, 0, 1000, 250, '#5E6B78') + windowSky(30, 20, 940, 210) + tiles(250, '#C9C2B4', '#BDB5A6', 80);
      return s + drawTables(this.seats, { chair: chairOf('#2B2F36', '#1F2A24'), top: '#E8E2D6', apron: '#9AA7B4', leg: '#5E6B78', deco: monitor }) + sign(name, 186, '#2E7D5B');
    },
  },
  temple: {
    seats: smallTables([360, 540]),
    art(name) {
      let s = R(0, 0, 1000, 640, '#D8CDB8');
      for (let y = 250; y < 640; y += 40) for (let x = (y / 40) % 2 ? 0 : 40; x < 1000; x += 80) s += R(x, y, 76, 36, '#CDBFA6');
      s += R(0, 0, 1000, 120, '#BFE3F0') + R(0, 150, 1000, 100, '#C94F3D') + R(0, 120, 1000, 34, '#3C4A5C') + R(300, 70, 400, 30, '#C94F3D') + R(260, 56, 480, 18, '#3C4A5C') + R(440, 180, 120, 70, '#7A2E22');
      s += trees([[70, 300, 1.2], [930, 300, 1.2]], '#3E6B5A', '#6B3E1F');
      return s + drawTables(this.seats, { chair: stoolOf('#9AA7B4'), top: '#B9B2A4', apron: '#8C877C', leg: '#8C877C', deco: teapot, legH: 30 }) + sign(name, 186, '#3C4A5C', '#D9A93B');
    },
  },
  park: {
    seats: smallTables([360, 540]),
    art(name) {
      let s = R(0, 0, 1000, 120, '#BFE3F0') + R(0, 120, 1000, 520, '#A8D08D');
      s += trees([[80, 190], [240, 170, 0.8], [760, 170, 0.8], [920, 190]]);
      s += R(0, 250, 1000, 40, '#E8D7AE') + [[120, 600], [480, 610], [880, 600], [300, 450], [700, 440]].map(([x, y]) => R(x, y, 10, 10, '#F2B6C6') + R(x + 14, y + 4, 8, 8, '#F6E7A8')).join('');
      return s + drawTables(this.seats, { chair: chairOf('#B07A4A', '#8C4F33'), top: '#C98B5E', apron: '#8C4F33', leg: '#6B3E1F', deco: picnic, legH: 30 }) + sign(name, 30, '#5E8F4A');
    },
  },
  lake: {
    seats: smallTables([370, 545]),
    art(name) {
      let s = R(0, 0, 1000, 90, '#BFE3F0') + R(0, 90, 1000, 170, '#8EC5DA') + [[80, 140, 60], [400, 200, 80], [700, 130, 50], [860, 220, 70]].map(([x, y, w]) => R(x, y, w, 5, '#BFE3F0')).join('');
      s += trees([[60, 90, 0.7], [180, 80, 0.5], [880, 86, 0.6]], '#5E8F4A');
      s += planks(260, '#C9A06A', '#A9824F') + R(0, 252, 1000, 12, '#8C6A44') + [40, 960].map((x) => R(x, 120, 6, 70, '#5E8F4A') + R(x + 12, 140, 6, 50, '#5E8F4A')).join('');
      return s + drawTables(this.seats, { chair: chairOf('#8C4F33', '#6B3E1F'), top: '#E8D7AE', apron: '#B08A56', leg: '#6B3E1F', deco: cups, legH: 30 }) + sign(name, 16, '#1F6F8B');
    },
  },
  beach: {
    seats: smallTables([380, 550]),
    art(name) {
      let s = R(0, 0, 1000, 80, '#BFE3F0') + R(0, 80, 1000, 140, '#5FA8C9') + R(0, 200, 1000, 30, '#BFE3F0') + R(0, 220, 1000, 420, '#F2E3B3');
      [190, 500, 810].forEach((x) => { s += R(x - 3, 240, 6, 130, '#8C4F33') + R(x - 90, 226, 180, 16, '#F07F6A') + R(x - 66, 212, 132, 16, '#F07F6A') + R(x - 30, 212, 30, 30, '#FBF2E6'); });
      return s + drawTables(this.seats, { chair: chairOf('#3B7FC4', '#2B5E94'), top: '#FBF2E6', apron: '#D9C4A0', leg: '#B07A4A', deco: shell, legH: 30 }) + sign(name, 110, '#F07F6A');
    },
  },
};

// 座位列表（扁平）· flat seat list for a kind
export function seatsOf(kind) {
  const sc = SCENES[kind] || SCENES.library;
  const out = [];
  sc.seats.forEach((t) => t.seats.forEach((x) => out.push({ x, y: t.y })));
  return out;
}

export function interiorSVG(kind, name) {
  const sc = SCENES[kind] || SCENES.library;
  return `<g ${P}>${sc.art(name)}</g>`;
}
