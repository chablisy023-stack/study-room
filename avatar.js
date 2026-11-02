// 像素小人 · Pixel characters
export const SKINS = ['#F6D2B5', '#E8B48C', '#C68A5E', '#8D5A3B'];
export const HAIRS = ['#2B1D14', '#6B3E1F', '#C9A15A', '#A8432C', '#3A3F5C'];
export const STYLES = ['short', 'long', 'bun'];
export const SHIRTS = ['#2E7D5B', '#3B5BA9', '#B45309', '#A23E5A', '#6B4FA0', '#1F6F8B'];

export const DEFAULT_AVATAR = { skin: 0, hair: 0, style: 0, shirt: 0 };

export function randomAvatar(seed) {
  let h = 0;
  for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { skin: h % SKINS.length, hair: (h >> 3) % HAIRS.length, style: (h >> 6) % STYLES.length, shirt: (h >> 9) % SHIRTS.length };
}

export function spriteSVG(a = DEFAULT_AVATAR) {
  const skin = SKINS[a.skin] || SKINS[0];
  const hair = HAIRS[a.hair] || HAIRS[0];
  const shirt = SHIRTS[a.shirt] || SHIRTS[0];
  const style = STYLES[a.style] || 'short';
  const r = (x, y, w, h, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;
  let back = '', top = '';
  if (style === 'long') back = r(2, 2, 8, 9, hair);
  if (style === 'bun') top = r(4, 0, 4, 2, hair);
  if (style === 'short') top = r(2, 3, 1, 2, hair) + r(9, 3, 1, 2, hair);
  return `<svg viewBox="0 0 12 18" shape-rendering="crispEdges" aria-hidden="true">
    ${back}
    ${r(3, 2, 6, 6, skin)}
    ${r(2, 1, 8, 2, hair)}${r(3, 3, 6, 1, hair)}${top}
    ${r(4, 5, 1, 1, '#1F2A24')}${r(7, 5, 1, 1, '#1F2A24')}
    ${r(5, 7, 2, 0.6, '#C25B4A')}
    ${r(3, 8, 6, 5, shirt)}${r(2, 9, 1, 3, shirt)}${r(9, 9, 1, 3, shirt)}
    ${r(2, 12, 1, 1, skin)}${r(9, 12, 1, 1, skin)}
    ${r(4, 13, 1.8, 3.5, '#3C4A5C')}${r(6.2, 13, 1.8, 3.5, '#3C4A5C')}
    ${r(3.6, 16.5, 2.4, 1.5, '#1F2A24')}${r(6, 16.5, 2.4, 1.5, '#1F2A24')}
  </svg>`;
}
