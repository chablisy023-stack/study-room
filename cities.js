// 城市、地点与地图美术 · Cities, places and map art
// 地点种类 kind 决定建筑画法和背景音
export const SOUND_OF = {
  library: 'rain', cafe: 'cafe', teahouse: 'cafe', shop: 'cafe',
  lake: 'waves', beach: 'waves', park: 'wind', temple: 'wind', lab: 'hum', tower: 'hum',
};

// 小镇里 4 个地点的位置（1000 × 640 画布）
export const SLOTS = [
  { x: 220, y: 170 }, { x: 780, y: 165 }, { x: 225, y: 470 }, { x: 775, y: 470 },
];

// 解锁顺序 = 数组顺序；cost 金币，hours = 在上一座城累计专注小时数（「通关」）
export const CITIES = [
  { id: 'linkoping', zh: '林雪平', en: 'Linköping', wx: 520, wy: 98, lbl: 'top', ground: '#BFD9A8', landmark: 'spire', cost: 0, hours: 0,
    places: [
      { id: 'lib', kind: 'library', zh: '林雪平市立图书馆', en: 'Linköping City Library' },
      { id: 'fika', kind: 'cafe', zh: 'Kårallen 学生会馆', en: 'Kårallen Student Union' },
      { id: 'roxen', kind: 'lake', zh: '罗克森湖', en: 'Lake Roxen' },
      { id: 'lab', kind: 'lab', zh: 'Campus US 医学院', en: 'Campus US (Medicine)' },
    ] },
  { id: 'beijing', zh: '北京', en: 'Beijing', wx: 760, wy: 178, lbl: 'left', ground: '#CCD8A4', landmark: 'gate', cost: 30, hours: 1,
    places: [
      { id: 'lib', kind: 'library', zh: '国家图书馆', en: 'National Library' },
      { id: 'tea', kind: 'teahouse', zh: '老舍茶馆', en: 'Lao She Teahouse' },
      { id: 'lake', kind: 'lake', zh: '北大未名湖', en: 'Weiming Lake (PKU)' },
      { id: 'temple', kind: 'temple', zh: '天坛公园', en: 'Temple of Heaven Park' },
    ] },
  { id: 'london', zh: '伦敦', en: 'London', wx: 450, wy: 140, lbl: 'left', ground: '#B6D2A3', landmark: 'clock', cost: 50, hours: 1.5,
    places: [
      { id: 'lib', kind: 'library', zh: '大英图书馆', en: 'British Library' },
      { id: 'cafe', kind: 'shop', zh: '博罗市场', en: 'Borough Market' },
      { id: 'thames', kind: 'lake', zh: '泰晤士河南岸', en: 'South Bank' },
      { id: 'park', kind: 'park', zh: '海德公园', en: 'Hyde Park' },
    ] },
  { id: 'paris', zh: '巴黎', en: 'Paris', wx: 505, wy: 185, lbl: 'bottom', ground: '#C4DBA9', landmark: 'eiffel', cost: 80, hours: 2,
    places: [
      { id: 'lib', kind: 'library', zh: '圣日内维耶图书馆', en: 'Ste-Geneviève Library' },
      { id: 'cafe', kind: 'cafe', zh: '花神咖啡馆', en: 'Café de Flore' },
      { id: 'seine', kind: 'lake', zh: '塞纳河新桥', en: 'Pont Neuf' },
      { id: 'garden', kind: 'park', zh: '卢森堡公园', en: 'Luxembourg Gardens' },
    ] },
  { id: 'tokyo', zh: '东京', en: 'Tokyo', wx: 886, wy: 212, lbl: 'bottom', ground: '#C7DDB0', landmark: 'torii', cost: 120, hours: 2.5,
    places: [
      { id: 'lib', kind: 'library', zh: '国立国会图书馆', en: 'National Diet Library' },
      { id: 'cat', kind: 'cafe', zh: '神保町咖啡馆', en: 'Jimbocho Kissaten' },
      { id: 'shrine', kind: 'temple', zh: '明治神宫', en: 'Meiji Jingu' },
      { id: 'konbini', kind: 'shop', zh: '秋叶原', en: 'Akihabara' },
    ] },
  { id: 'seoul', zh: '首尔', en: 'Seoul', wx: 836, wy: 168, lbl: 'top', ground: '#C2D9A6', landmark: 'palace', cost: 160, hours: 3,
    places: [
      { id: 'lib', kind: 'library', zh: 'COEX 星空图书馆', en: 'Starfield Library (COEX)' },
      { id: 'cafe', kind: 'cafe', zh: '延南洞咖啡街', en: 'Yeonnam-dong Cafés' },
      { id: 'palace', kind: 'temple', zh: '景福宫', en: 'Gyeongbokgung Palace' },
      { id: 'han', kind: 'lake', zh: '汝矣岛汉江公园', en: 'Yeouido Hangang Park' },
    ] },
  { id: 'newyork', zh: '纽约', en: 'New York', wx: 292, wy: 190, lbl: 'bottom', ground: '#BCD6A6', landmark: 'skyline', cost: 200, hours: 3.5,
    places: [
      { id: 'lib', kind: 'library', zh: '纽约公共图书馆', en: 'NY Public Library' },
      { id: 'cafe', kind: 'cafe', zh: '格林威治村咖啡馆', en: 'Greenwich Village Café' },
      { id: 'park', kind: 'park', zh: '中央公园', en: 'Central Park' },
      { id: 'roof', kind: 'tower', zh: '洛克菲勒中心', en: 'Rockefeller Center' },
    ] },
  { id: 'sydney', zh: '悉尼', en: 'Sydney', wx: 890, wy: 440, lbl: 'bottom', ground: '#C9DDA8', landmark: 'opera', cost: 250, hours: 4,
    places: [
      { id: 'lib', kind: 'library', zh: '新州州立图书馆', en: 'State Library of NSW' },
      { id: 'cafe', kind: 'cafe', zh: '环形码头咖啡馆', en: 'Circular Quay Café' },
      { id: 'bondi', kind: 'beach', zh: '邦迪海滩', en: 'Bondi Beach' },
      { id: 'garden', kind: 'park', zh: '皇家植物园', en: 'Royal Botanic Garden' },
    ] },
];
export const cityById = (id) => CITIES.find((c) => c.id === id) || CITIES[0];

/* ---------------- 世界地图 World map (1000 × 560, cartoon, not to scale) ---------------- */
export function worldSVG() {
  return `
  <rect width="1000" height="560" fill="#8EC5DA"/>
  <g fill="#7FB9CF" opacity="0.6"><circle cx="160" cy="420" r="3"/><circle cx="640" cy="500" r="3"/><circle cx="380" cy="300" r="3"/><circle cx="720" cy="360" r="3"/><circle cx="960" cy="300" r="3"/></g>
  <g fill="#A9D08E" stroke="#7FAF66" stroke-width="4" stroke-linejoin="round">
    <path d="M70 90 L150 55 L260 50 L340 80 L360 130 L320 170 L330 215 L280 250 L250 300 L210 290 L170 240 L120 220 L90 170 Z"/>
    <path d="M250 315 L320 320 L350 370 L330 440 L295 515 L265 500 L250 430 L230 370 Z"/>
    <path d="M425 80 L480 60 L555 55 L585 90 L570 150 L545 205 L505 215 L460 200 L430 165 L438 125 Z"/>
    <path d="M440 230 L520 222 L585 240 L610 300 L585 380 L545 455 L505 460 L480 390 L455 320 Z"/>
    <path d="M580 70 L680 45 L800 50 L900 85 L935 140 L900 195 L855 230 L800 260 L720 285 L650 260 L610 220 L590 160 Z"/>
    <path d="M860 190 L885 185 L905 215 L895 245 L872 240 Z"/>
    <path d="M820 400 L890 385 L945 410 L950 460 L905 490 L840 480 L810 445 Z"/>
    <path d="M420 120 L438 112 L445 150 L430 165 L415 150 Z"/>
  </g>
  <g fill="#8DBF73"><circle cx="190" cy="120" r="14"/><circle cx="215" cy="135" r="10"/><circle cx="700" cy="130" r="14"/><circle cx="730" cy="150" r="10"/><circle cx="520" cy="320" r="12"/><circle cx="300" cy="400" r="11"/></g>
  <g fill="#F2E3B3"><path d="M480 250 h70 v30 h-70z" opacity="0.7"/><path d="M850 430 h50 v20 h-50z" opacity="0.7"/></g>`;
}

/* ---------------- 小镇 Town scene (1000 × 640) ---------------- */
const P = 'shape-rendering="crispEdges"';

function building(kind) {
  switch (kind) {
    case 'library': return `<g ${P}><rect x="-80" y="-30" width="160" height="72" fill="#C98B5E"/><rect x="-90" y="-42" width="180" height="12" fill="#8C4F33"/><rect x="-70" y="-56" width="140" height="14" fill="#8C4F33"/><rect x="-46" y="-68" width="92" height="12" fill="#8C4F33"/><g fill="#F6E7C8"><rect x="-64" y="-18" width="14" height="52"/><rect x="-34" y="-18" width="14" height="52"/><rect x="20" y="-18" width="14" height="52"/><rect x="50" y="-18" width="14" height="52"/></g><rect x="-10" y="6" width="20" height="36" fill="#5E3523"/></g>`;
    case 'cafe': return `<g ${P}><rect x="-72" y="-34" width="144" height="76" fill="#F3C9A1"/><rect x="-82" y="-52" width="164" height="18" fill="#D9694B"/><g fill="#FBF2E6"><rect x="-62" y="-52" width="18" height="18"/><rect x="-26" y="-52" width="18" height="18"/><rect x="10" y="-52" width="18" height="18"/><rect x="46" y="-52" width="18" height="18"/></g><rect x="-14" y="2" width="28" height="40" fill="#8C4F33"/><rect x="-58" y="-16" width="30" height="24" fill="#FBF2E6"/><rect x="28" y="-16" width="30" height="24" fill="#FBF2E6"/></g>`;
    case 'teahouse': return `<g ${P}><rect x="-70" y="-24" width="140" height="66" fill="#E6C79C"/><rect x="-92" y="-40" width="184" height="16" fill="#7A3E2E"/><rect x="-76" y="-52" width="152" height="12" fill="#7A3E2E"/><rect x="-96" y="-44" width="8" height="8" fill="#7A3E2E"/><rect x="88" y="-44" width="8" height="8" fill="#7A3E2E"/><rect x="-12" y="4" width="24" height="38" fill="#A23E2E"/><rect x="-54" y="-10" width="26" height="22" fill="#FBF2E6"/><rect x="28" y="-10" width="26" height="22" fill="#FBF2E6"/></g>`;
    case 'shop': return `<g ${P}><rect x="-66" y="-30" width="132" height="72" fill="#F4F4F0"/><rect x="-66" y="-46" width="132" height="16" fill="#3B7FC4"/><rect x="-66" y="-30" width="132" height="6" fill="#2E9E5B"/><rect x="-56" y="-14" width="112" height="30" fill="#BFE3F0"/><rect x="-12" y="16" width="24" height="26" fill="#9AA7B4"/></g>`;
    case 'lab': return `<g ${P}><rect x="-74" y="-40" width="148" height="82" fill="#DCE6EE"/><rect x="-74" y="-52" width="148" height="12" fill="#7E97AD"/><rect x="40" y="-76" width="16" height="24" fill="#7E97AD"/><g fill="#9CCBDB"><rect x="-58" y="-24" width="24" height="18"/><rect x="-12" y="-24" width="24" height="18"/><rect x="34" y="-24" width="24" height="18"/></g><rect x="-14" y="6" width="28" height="36" fill="#7E97AD"/></g>`;
    case 'tower': return `<g ${P}><rect x="-44" y="-96" width="88" height="138" fill="#9AA7B4"/><g fill="#E8F1F6">${[-80, -56, -32, -8, 16].map((y) => `<rect x="-32" y="${y}" width="16" height="12"/><rect x="-8" y="${y}" width="16" height="12"/><rect x="16" y="${y}" width="16" height="12"/>`).join('')}</g><rect x="-52" y="-104" width="104" height="8" fill="#5E6B78"/><rect x="-30" y="-120" width="60" height="16" fill="#2E7D5B"/></g>`;
    case 'temple': return `<g ${P}><rect x="-50" y="-6" width="100" height="48" fill="#C94F3D"/><rect x="-74" y="-22" width="148" height="16" fill="#3C4A5C"/><rect x="-40" y="-46" width="80" height="24" fill="#C94F3D"/><rect x="-60" y="-58" width="120" height="12" fill="#3C4A5C"/><rect x="-6" y="-74" width="12" height="16" fill="#D9A93B"/><rect x="-12" y="10" width="24" height="32" fill="#7A2E22"/></g>`;
    case 'park': return `<g ${P}><rect x="-84" y="-52" width="168" height="104" fill="#A8D08D"/><rect x="-60" y="-40" width="34" height="34" fill="#6FA85A"/><rect x="-48" y="-6" width="10" height="16" fill="#8C4F33"/><rect x="26" y="-30" width="30" height="30" fill="#6FA85A"/><rect x="36" y="0" width="10" height="14" fill="#8C4F33"/><rect x="-30" y="24" width="60" height="8" fill="#B07A4A"/><rect x="-26" y="32" width="6" height="10" fill="#8C4F33"/><rect x="20" y="32" width="6" height="10" fill="#8C4F33"/><rect x="4" y="-44" width="10" height="10" fill="#F2B6C6"/></g>`;
    case 'lake': return `<g ${P}><rect x="-90" y="-40" width="180" height="80" fill="#8EC5DA"/><rect x="-80" y="-48" width="160" height="8" fill="#8EC5DA"/><rect x="-80" y="40" width="160" height="8" fill="#8EC5DA"/><g fill="#BFE3F0"><rect x="-50" y="-16" width="30" height="4"/><rect x="20" y="10" width="36" height="4"/></g><rect x="40" y="-30" width="40" height="10" fill="#B07A4A"/><g fill="#5E8F4A"><rect x="-88" y="-60" width="6" height="22"/><rect x="-78" y="-56" width="6" height="18"/></g></g>`;
    case 'beach': return `<g ${P}><rect x="-90" y="-10" width="180" height="56" fill="#F2E3B3"/><rect x="-90" y="20" width="180" height="26" fill="#8EC5DA"/><rect x="-3" y="-60" width="6" height="64" fill="#8C4F33"/><rect x="-40" y="-64" width="80" height="12" fill="#F07F6A"/><rect x="-28" y="-74" width="56" height="10" fill="#F07F6A"/><rect x="-60" y="0" width="34" height="10" fill="#3B7FC4"/></g>`;
    default: return '';
  }
}

function landmark(kind) {
  switch (kind) {
    case 'spire': return `<g ${P}><rect x="-40" y="-20" width="80" height="60" fill="#D9C4A0"/><rect x="-14" y="-90" width="28" height="70" fill="#C9B08A"/><rect x="-8" y="-120" width="16" height="30" fill="#4F7A6B"/><rect x="-2" y="-134" width="4" height="14" fill="#D9A93B"/><rect x="-10" y="10" width="20" height="30" fill="#7A5A3A"/></g>`;
    case 'gate': return `<g ${P}><rect x="-80" y="-10" width="160" height="50" fill="#C94F3D"/><rect x="-96" y="-30" width="192" height="20" fill="#D9A93B"/><rect x="-70" y="-56" width="140" height="26" fill="#C94F3D"/><rect x="-86" y="-70" width="172" height="14" fill="#D9A93B"/><rect x="-16" y="6" width="32" height="34" fill="#7A2E22"/><rect x="-60" y="10" width="20" height="30" fill="#7A2E22"/><rect x="40" y="10" width="20" height="30" fill="#7A2E22"/></g>`;
    case 'clock': return `<g ${P}><rect x="-22" y="-120" width="44" height="160" fill="#C9B08A"/><rect x="-30" y="-130" width="60" height="12" fill="#8C6A44"/><rect x="-14" y="-160" width="28" height="30" fill="#8C6A44"/><rect x="-4" y="-176" width="8" height="16" fill="#3C4A5C"/><rect x="-16" y="-104" width="32" height="32" fill="#F6E7C8"/><rect x="-2" y="-98" width="4" height="14" fill="#3C4A5C"/><rect x="-2" y="-88" width="10" height="4" fill="#3C4A5C"/></g>`;
    case 'eiffel': return `<g ${P} fill="#8C6A44"><rect x="-60" y="20" width="22" height="20"/><rect x="38" y="20" width="22" height="20"/><rect x="-60" y="10" width="120" height="10"/><rect x="-44" y="-30" width="20" height="40"/><rect x="24" y="-30" width="20" height="40"/><rect x="-44" y="-40" width="88" height="10"/><rect x="-26" y="-100" width="18" height="60"/><rect x="8" y="-100" width="18" height="60"/><rect x="-26" y="-108" width="52" height="8"/><rect x="-8" y="-170" width="16" height="62"/><rect x="-2" y="-186" width="4" height="16"/></g>`;
    case 'torii': return `<g ${P} fill="#D94A3A"><rect x="-90" y="-80" width="180" height="16"/><rect x="-100" y="-88" width="200" height="10" fill="#2B1D14"/><rect x="-70" y="-50" width="140" height="10"/><rect x="-60" y="-64" width="16" height="104"/><rect x="44" y="-64" width="16" height="104"/></g>`;
    case 'palace': return `<g ${P}><rect x="-70" y="-6" width="140" height="46" fill="#C94F3D"/><rect x="-96" y="-26" width="192" height="20" fill="#3E6B5A"/><rect x="-56" y="-50" width="112" height="24" fill="#C94F3D"/><rect x="-80" y="-62" width="160" height="12" fill="#3E6B5A"/><rect x="-14" y="8" width="28" height="32" fill="#7A2E22"/></g>`;
    case 'skyline': return `<g ${P}><rect x="-90" y="-40" width="40" height="80" fill="#9AA7B4"/><rect x="-46" y="-110" width="36" height="150" fill="#7E8C99"/><rect x="-36" y="-130" width="16" height="20" fill="#7E8C99"/><rect x="-30" y="-150" width="4" height="20" fill="#5E6B78"/><rect x="-6" y="-70" width="44" height="110" fill="#A9B5C1"/><rect x="42" y="-30" width="48" height="70" fill="#8C9AA7"/><g fill="#F6E7A8">${[-100, -80, -60, -40, -20, 0].map((y) => `<rect x="-40" y="${y}" width="6" height="8"/><rect x="-24" y="${y}" width="6" height="8"/>`).join('')}</g></g>`;
    case 'opera': return `<g ${P}><rect x="-100" y="20" width="200" height="20" fill="#D9C4A0"/><g fill="#FBF7EE" stroke="#C9C2B4" stroke-width="2"><path d="M-80 20 L-60 -40 L-30 20Z"/><path d="M-40 20 L-10 -70 L20 20Z"/><path d="M10 20 L40 -50 L70 20Z"/><path d="M50 20 L70 -20 L90 20Z"/></g></g>`;
    default: return '';
  }
}

export function townSVG(city) {
  const paths = SLOTS.map((s) => `<path d="M500 330 L${s.x} ${s.y + 40}" stroke="#E8D7AE" stroke-width="30" stroke-linecap="round"/>`).join('');
  const trees = [[70, 80], [940, 90], [60, 340], [940, 320], [400, 60], [610, 70], [380, 600], [640, 600]]
    .map(([x, y]) => `<rect x="${x - 16}" y="${y - 16}" width="32" height="32" fill="#8DBF73" ${P}/><rect x="${x - 4}" y="${y + 16}" width="8" height="10" fill="#8C4F33" ${P}/>`).join('');
  const blds = city.places.map((p, i) => `<g transform="translate(${SLOTS[i].x} ${SLOTS[i].y})">${building(p.kind)}</g>`).join('');
  return `<rect width="1000" height="640" fill="${city.ground}"/>
    <g fill="${city.ground}" opacity="0.5"><rect x="0" y="0" width="1000" height="640"/></g>
    ${paths}
    <rect x="440" y="290" width="120" height="80" fill="#E8D7AE" ${P}/>
    ${trees}
    <g transform="translate(500 300)">${landmark(city.landmark)}</g>
    ${blds}`;
}
