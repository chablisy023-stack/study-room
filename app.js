import { STR } from './i18n.js';
import { createBackend, dayKey } from './backend.js';
import { CITIES, SLOTS, SOUND_OF, cityById, worldSVG, townSVG } from './cities.js';
import { SKINS, HAIRS, STYLES, SHIRTS, DEFAULT_AVATAR, spriteSVG } from './avatar.js';
import { playAmbient, stopAmbient, setVolume } from './sound.js';

const $ = (id) => document.getElementById(id);
const lsGet = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

const CHECKIN_SECS = 25 * 60;
const CHAT_COOLDOWN = 30;
const BAD_WORDS = ['傻逼', '操你', '草泥马', 'fuck', 'shit', 'bitch'];
const LOCK_SVG = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="5" width="8" height="6" rx="1" fill="#fff"/><path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="#fff" stroke-width="1.4" fill="none"/></svg>';

const savedProfile = lsGet('st-profile', {});
const state = {
  lang: lsGet('st-lang', (navigator.language || '').startsWith('zh') ? 'zh' : 'en'),
  profile: {
    name: '', subject: '', city: 'linkoping', place: 'lib', pomo: false,
    ...savedProfile,
    avatar: { ...DEFAULT_AVATAR, ...(savedProfile.avatar || {}) },
  },
  coins: lsGet('st-coins', 0),
  unlocked: lsGet('st-unlocked', ['linkoping']),
  cityFocus: lsGet('st-cityfocus', {}),
  coinAcc: 0,
  inTown: false,
  view: 'town',
  status: 'focus',
  sessionSecs: 0,
  pendingSecs: 0,
  presence: [],
  messages: [],
  tab: 'today',
  lastSent: 0,
  pomoPhase: null,
  sound: lsGet('st-sound', false),
  vol: lsGet('st-vol', 50),
  unlockTarget: null,
};
if (!state.unlocked.includes(state.profile.city)) state.profile.city = 'linkoping';
let backend = null;
const T = () => STR[state.lang];
const L = (o) => o[state.lang];
const curCity = () => cityById(state.profile.city);
const curPlace = () => curCity().places.find((p) => p.id === state.profile.place) || curCity().places[0];
const saveProfile = () => lsSet('st-profile', state.profile);

/* ---------------- helpers ---------------- */
function fmtHMS(s) {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
}
const fmtHours = (s) => (s < 3600 ? `${Math.round(s / 60)}m` : `${(s / 3600).toFixed(1)}h`);
function clean(text) {
  let t = text.trim().slice(0, 200);
  for (const w of BAD_WORDS) t = t.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '*'.repeat(w.length));
  return t;
}
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { el.hidden = true; }, 3500);
}
function pomoNow(now = Date.now()) {
  const P = 30 * 60e3, F = 25 * 60e3;
  const t = now % P;
  const focus = t < F;
  return { focus, left: Math.ceil(((focus ? F : P) - t) / 1000), round: (Math.floor(now / P) % 48) + 1 };
}
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

/* ---------------- daily record ---------------- */
const myDay = () => lsGet('st-days', {});
function addMyDay(secs) { const d = myDay(); const k = dayKey(); d[k] = (d[k] || 0) + secs; lsSet('st-days', d); }
function streak() {
  const d = myDay();
  let n = 0;
  let i = (d[dayKey()] || 0) >= CHECKIN_SECS ? 0 : 1;
  while ((d[dayKey(i)] || 0) >= CHECKIN_SECS) { n++; i++; }
  return n;
}

/* ---------------- sound ---------------- */
function syncSound() {
  const b = $('sound-btn');
  const t = T();
  const kind = SOUND_OF[curPlace().kind];
  b.textContent = state.sound ? `${t.soundOn} · ${t.soundNames[kind]}` : t.soundOff;
  b.setAttribute('aria-pressed', state.sound ? 'true' : 'false');
  $('vol').value = state.vol;
  if (state.inTown && state.sound) playAmbient(kind, state.vol / 100);
  else stopAmbient();
}

/* ---------------- avatar builder ---------------- */
function renderBuilder() {
  const a = state.profile.avatar;
  $('avatar-preview').innerHTML = spriteSVG(a);
  const groups = [['sw-skin', 'skin', SKINS], ['sw-hair', 'hair', HAIRS], ['sw-shirt', 'shirt', SHIRTS]];
  for (const [id, key, list] of groups) {
    const box = $(id);
    box.innerHTML = '';
    list.forEach((c, i) => {
      const b = el('button', 'sw');
      b.type = 'button';
      b.style.background = c;
      b.setAttribute('aria-label', `${T()[key]} ${i + 1}`);
      b.setAttribute('aria-pressed', a[key] === i ? 'true' : 'false');
      b.addEventListener('click', () => { a[key] = i; saveProfile(); renderBuilder(); });
      box.appendChild(b);
    });
  }
  const sb = $('sw-style');
  sb.innerHTML = '';
  STYLES.forEach((s, i) => {
    const b = el('button', 'sw txt', T().styleNames[i]);
    b.type = 'button';
    b.setAttribute('aria-pressed', a.style === i ? 'true' : 'false');
    b.addEventListener('click', () => { a.style = i; saveProfile(); renderBuilder(); });
    sb.appendChild(b);
  });
}

/* ---------------- i18n ---------------- */
function applyLang() {
  const t = T();
  document.documentElement.lang = state.lang === 'zh' ? 'zh' : 'en';
  document.title = state.lang === 'zh' ? '自习小镇 Study Town' : 'Study Town 自习小镇';
  document.querySelectorAll('[data-i18n]').forEach((e) => { const v = t[e.dataset.i18n]; if (typeof v === 'string') e.textContent = v; });
  document.querySelectorAll('[data-i18n-ph]').forEach((e) => { e.placeholder = t[e.dataset.i18nPh]; });
  document.querySelectorAll('[data-i18n-aria]').forEach((e) => { e.setAttribute('aria-label', t[e.dataset.i18nAria]); });
  document.querySelectorAll('.lang-btn').forEach((b) => { b.textContent = t.lang; b.setAttribute('aria-label', t.langAria); });
  $('mode-tag').textContent = backend && backend.mode === 'demo' ? t.demoTag : '';
  renderBuilder();
  renderAll();
}

/* ---------------- render ---------------- */
function renderAll() {
  renderOnline();
  if (!state.inTown) return;
  renderSession();
  renderCoins();
  renderPomo();
  renderMap();
  renderUnlock();
  renderMessages();
  renderCheckin();
  renderBoard();
  syncSound();
}

function renderOnline() {
  const n = state.presence.length;
  $('online-count').textContent = n;
  $('join-online').textContent = T().nowOnline(n);
}

function renderCoins(pop) {
  $('coin-count').textContent = state.coins;
  $('coin-pill').setAttribute('aria-label', T().coinsAria(state.coins));
  if (pop) { const p = $('coin-pill'); p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); }
}

function renderSession() {
  const t = T();
  $('s-where').textContent = t.at(L(curCity()), L(curPlace()));
  $('s-subject').textContent = state.profile.subject;
  $('s-timer').textContent = fmtHMS(state.sessionSecs);
  $('s-status').textContent = state.status === 'focus' ? t.focus : t.rest;
  $('pause-btn').textContent = state.status === 'focus' ? t.pause : t.resume;
  const pt = $('pomo-toggle');
  pt.textContent = `${t.pomo} · ${state.profile.pomo ? t.on : t.off}`;
  pt.setAttribute('aria-pressed', state.profile.pomo ? 'true' : 'false');
}

function renderPomo() {
  const panel = $('pomo-panel');
  panel.hidden = !state.profile.pomo;
  if (!state.profile.pomo) return;
  const p = pomoNow();
  $('pomo-title').textContent = T().pomoTitle(p.round, p.focus);
  $('pomo-clock').textContent = `${String(Math.floor(p.left / 60)).padStart(2, '0')}:${String(p.left % 60).padStart(2, '0')}`;
}

function renderMap() {
  const t = T();
  const world = state.view === 'world';
  const map = $('map');
  map.classList.toggle('world', world);
  const svg = $('map-svg');
  svg.setAttribute('viewBox', world ? '0 0 1000 560' : '0 0 1000 640');
  svg.innerHTML = world ? worldSVG() : townSVG(curCity());
  $('world-btn').hidden = world;
  $('world-btn').textContent = `← ${t.world}`;
  $('map-title').textContent = world ? t.world : L(curCity());
  $('map-hint').textContent = world ? t.worldHint : t.townHint;
  if (world) renderWorld(); else renderTown();
}

function cityCounts() {
  const c = {};
  state.presence.forEach((u) => { c[u.city || 'linkoping'] = (c[u.city || 'linkoping'] || 0) + 1; });
  return c;
}

function renderWorld() {
  const box = $('places');
  box.innerHTML = '';
  $('avatars').innerHTML = '';
  const counts = cityCounts();
  CITIES.forEach((c) => {
    const unlocked = state.unlocked.includes(c.id);
    const b = el('button', 'city-pin' + (unlocked ? '' : ' locked') + (c.id === state.profile.city ? ' here' : ''));
    b.type = 'button';
    b.classList.add(`lbl-${c.lbl || 'bottom'}`);
    b.style.left = `${c.wx / 10}%`;
    b.style.top = `${c.wy / 5.6}%`;
    const pin = el('span', 'pin');
    if (!unlocked) pin.innerHTML = LOCK_SVG;
    const lbl = el('span', 'lbl', unlocked ? `${L(c)} · ${counts[c.id] || 0}` : `${L(c)} · ${t_locked()}`);
    b.append(pin, lbl);
    b.setAttribute('aria-label', unlocked ? `${L(c)}, ${counts[c.id] || 0} ${T().online}` : `${L(c)}, ${T().locked}`);
    b.addEventListener('click', () => (unlocked ? goCity(c.id) : openUnlock(c.id)));
    box.appendChild(b);
  });
}
const t_locked = () => T().locked;

function renderTown() {
  const city = curCity();
  const t = T();
  const box = $('places');
  box.innerHTML = '';
  const here = state.presence.filter((u) => (u.city || 'linkoping') === city.id);
  const counts = {};
  here.forEach((u) => { counts[u.place] = (counts[u.place] || 0) + 1; });
  const mobile = isMobile();
  city.places.forEach((p, i) => {
    const b = el('button', 'place-btn' + (p.id === state.profile.place ? ' here' : ''), `${L(p)} · ${counts[p.id] || 0}`);
    b.type = 'button';
    b.style.left = `${SLOTS[i].x / 10}%`;
    // 手机上地名放在建筑上方，给人物留出下方空间 · on phones the label sits above the building
    b.style.top = `${(SLOTS[i].y + (mobile ? -72 : 50)) / 6.4}%`;
    b.addEventListener('click', () => moveTo(p.id));
    box.appendChild(b);
  });

  const av = $('avatars');
  av.innerHTML = '';
  const byPlace = {};
  here.forEach((u) => { (byPlace[u.place] = byPlace[u.place] || []).push(u); });
  for (const [pid, users] of Object.entries(byPlace)) {
    const idx = city.places.findIndex((p) => p.id === pid);
    if (idx < 0) continue;
    const s = SLOTS[idx];
    users.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const spots = mobile ? mobileSpots(idx, users) : null;
    users.forEach((u, i) => {
      let left;
      let top;
      if (mobile) {
        if (i >= spots.shown) return;
        [left, top] = spots.pos(i);
      } else {
        // 站在建筑前面一排排开 · line up in front of the building
        const row = Math.floor(i / 5);
        const col = i % 5;
        const x = s.x + (col - 2) * 46 + (row % 2) * 23;
        const y = s.y + 165 + row * 30;
        left = `${Math.max(3, Math.min(97, x / 10))}%`;
        top = `${Math.max(10, Math.min(99, y / 6.4))}%`;
      }
      const isMe = (u.uid || u.id) === backend.uid;
      const a = el('div', `avatar ${u.status === 'break' ? 'rest' : 'focus'}${isMe ? ' me' : ''}`);
      a.tabIndex = 0;
      a.style.left = left;
      a.style.top = top;
      a.innerHTML = spriteSVG(u.avatar || DEFAULT_AVATAR);
      const label = `${u.name}${u.bot ? ` (${t.demoBadge})` : ''} · ${u.subject} · ${u.status === 'break' ? t.rest : t.focus} · ${fmtHMS(u.focusSecs || 0)}`;
      a.setAttribute('aria-label', label);
      a.appendChild(el('span', 'nm', u.name));
      a.appendChild(el('span', 'tip', label));
      if (u.status === 'break') a.appendChild(el('span', 'zz', 'zz'));
      av.appendChild(a);
    });
    if (mobile && spots.hidden > 0) {
      const more = el('div', 'avatar-more', `+${spots.hidden}`);
      [more.style.left, more.style.top] = spots.morePos();
      av.appendChild(more);
    }
  }
}

// ---- 手机布局 · phone layout ----
function isMobile() { return window.matchMedia('(max-width: 560px)').matches; }

// 用真实的地名按钮位置算出人物可站的区域，保证不重叠
// Work out, in pixels, where sprites can stand below a place without touching any place label.
function mobileSpots(idx, users) {
  const STEP_X = 19; // 精灵宽 16px + 间隔 · sprite width + gap (keep in sync with style.css)
  const STEP_Y = 27; // 精灵高 24px + 间隔 · sprite height + gap
  const MAX_ROWS = 2;
  const map = $('map');
  const W = map.clientWidth;
  const H = map.clientHeight;
  const mapTop = map.getBoundingClientRect().top;
  const labels = [...$('places').children].map((b) => b.getBoundingClientRect());
  const s = SLOTS[idx];
  const own = labels[idx];
  let limit = H - 2;
  SLOTS.forEach((o, j) => {
    if (j !== idx && o.y > s.y && Math.abs(o.x - s.x) < 300) limit = Math.min(limit, labels[j].top - mapTop - 3);
  });
  const ownBottom = own ? own.bottom - mapTop + 3 : 0;
  const rows = Math.max(1, Math.min(MAX_ROWS, Math.floor((limit - ownBottom) / STEP_Y)));
  const cx = (s.x / 1000) * W;
  const half = Math.min(0.2 * W, cx - 2, W - cx - 2);
  const perRow = Math.max(1, Math.floor((half * 2) / STEP_X));
  const cap = rows * perRow;
  // 人多时把自己排在最前 · when crowded, make sure "me" is among those shown
  if (users.length > cap) {
    const mi = users.findIndex((u) => (u.uid || u.id) === backend.uid);
    if (mi > 0) users.unshift(...users.splice(mi, 1));
  }
  // 放不下时最后两格留给「+N」标签 · when crowded, the last two slots hold the "+N" chip
  const reserve = perRow >= 2 ? 2 : 1;
  const shown = users.length > cap ? cap - reserve : users.length;
  const slots = Math.min(cap, users.length);
  const px = (i) => {
    const row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, slots - row * perRow);
    const col = i % perRow;
    const x = cx + (col - (inRow - 1) / 2) * STEP_X;
    const y = limit - (rows - 1 - row) * STEP_Y; // 第 0 行在后 · row 0 at the back, last row at the front
    return [x, y];
  };
  const pct = ([x, y]) => [`${(x / W) * 100}%`, `${(y / H) * 100}%`];
  return {
    shown,
    hidden: users.length - shown,
    pos: (i) => pct(px(i)),
    morePos: () => {
      const [x1, y] = px(shown);
      const [x2] = px(shown + reserve - 1);
      return pct([(x1 + x2) / 2, y]);
    },
  };
}

let lastMapW = 0;
window.addEventListener('resize', () => {
  const w = $('map').clientWidth;
  if (!state.inTown || state.view !== 'town' || w === lastMapW) return;
  lastMapW = w;
  clearTimeout(window.__townResize);
  window.__townResize = setTimeout(renderTown, 150);
});

function renderUnlock() {
  const box = $('unlock');
  const id = state.unlockTarget;
  if (!id || state.view !== 'world') { box.hidden = true; return; }
  const t = T();
  const i = CITIES.findIndex((c) => c.id === id);
  const c = CITIES[i];
  const prev = CITIES[i - 1];
  box.hidden = false;
  $('unlock-title').textContent = t.unlockTitle(L(c));
  const prevOk = state.unlocked.includes(prev.id);
  const buy = $('buy-btn');
  buy.textContent = t.unlockCoins(c.cost);
  buy.disabled = !prevOk || state.coins < c.cost;
  $('buy-note').textContent = !prevOk ? t.needPrev(L(prev)) : (state.coins < c.cost ? t.notEnough(c.cost - state.coins) : '');
  const need = Math.round(c.hours * 60);
  const done = Math.min(need, Math.floor((state.cityFocus[prev.id] || 0) / 60));
  $('quest-text').textContent = t.unlockQuest(L(prev), c.hours);
  $('quest-bar').style.width = `${(done / need) * 100}%`;
  $('quest-progress').textContent = t.questProgress(done, need);
  $('quest-btn').disabled = !prevOk || done < need;
}

function renderMessages() {
  const box = $('messages');
  const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
  box.innerHTML = '';
  state.messages.forEach((m) => {
    const wrap = el('div');
    const head = el('div', 'msg-head');
    const d = new Date(typeof m.ts === 'number' ? m.ts : Date.now());
    head.append(
      el('strong', '', m.name + (m.bot ? ` (${T().demoBadge})` : '')),
      el('time', '', `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`),
    );
    wrap.append(head, el('div', 'msg-text', m.text));
    box.appendChild(wrap);
  });
  if (atBottom || !renderMessages.done) { box.scrollTop = box.scrollHeight; renderMessages.done = true; }
}

function renderCheckin() {
  const t = T();
  const today = myDay()[dayKey()] || 0;
  $('checkin-text').textContent = t.checkinText(Math.floor(today / 60), streak());
  const b = $('checkin-badge');
  const done = today >= CHECKIN_SECS;
  b.textContent = done ? t.checked : t.notYet;
  b.className = 'badge' + (done ? '' : ' todo');
}

async function renderBoard() {
  const t = T();
  $('tab-today').setAttribute('aria-pressed', state.tab === 'today' ? 'true' : 'false');
  $('tab-week').setAttribute('aria-pressed', state.tab === 'week' ? 'true' : 'false');
  const tab = state.tab;
  let rows = [];
  try { rows = await backend.leaderboard(tab === 'today' ? 1 : 7); } catch (e) { console.warn(e); }
  if (tab !== state.tab) return;
  const ol = $('board');
  ol.innerHTML = '';
  if (!rows.length) { ol.appendChild(el('li', 'empty', t.empty)); return; }
  rows.forEach((r, i) => {
    const me = r.id === backend.uid;
    const li = el('li', me ? 'me' : '');
    li.append(
      el('span', 'rank', String(i + 1)),
      el('span', 'name', r.name + (me ? t.me : '') + (r.bot ? ` (${t.demoBadge})` : '')),
      el('span', 'mono', fmtHours(r.secs)),
    );
    ol.appendChild(li);
  });
}

/* ---------------- actions ---------------- */
async function enterTown(e) {
  e.preventDefault();
  const name = $('f-nick').value.trim().slice(0, 16);
  const subject = $('f-subj').value.trim().slice(0, 30);
  if (!name || !subject) return;
  Object.assign(state.profile, { name, subject, pomo: $('f-pomo').checked });
  if (!curCity().places.some((p) => p.id === state.profile.place)) state.profile.place = curCity().places[0].id;
  saveProfile();
  state.inTown = true;
  state.view = 'town';
  state.sessionSecs = 0;
  state.pendingSecs = 0;
  state.status = state.profile.pomo && !pomoNow().focus ? 'break' : 'focus';
  state.pomoPhase = pomoNow().focus;
  const p = state.profile;
  await backend.join({ name, subject, city: p.city, place: p.place, avatar: p.avatar, status: state.status, focusSecs: 0, startedAt: Date.now() });
  $('join').hidden = true;
  $('town').hidden = false;
  window.scrollTo(0, 0);
  renderAll();
}

async function flush() {
  if (state.pendingSecs > 0) {
    const s = state.pendingSecs;
    state.pendingSecs = 0;
    addMyDay(s);
    lsSet('st-cityfocus', state.cityFocus);
    try { await backend.addStudy(s, state.profile.name); } catch (e) { console.warn(e); }
  }
}

async function endSession(silent) {
  await flush();
  const mins = Math.floor(state.sessionSecs / 60);
  state.inTown = false;
  stopAmbient();
  await backend.leave();
  $('town').hidden = true;
  $('join').hidden = false;
  if (!silent) toast(T().ended(mins));
  renderOnline();
}

function setStatus(s) {
  state.status = s;
  backend.update({ status: s });
  renderSession();
  if (state.view === 'town') renderTown();
}

function moveTo(placeId) {
  if (placeId === state.profile.place) return;
  state.profile.place = placeId;
  saveProfile();
  backend.update({ place: placeId });
  toast(T().moved(L(curPlace())));
  renderSession();
  renderTown();
  syncSound();
}

function goCity(cityId) {
  const c = cityById(cityId);
  state.unlockTarget = null;
  if (cityId !== state.profile.city) {
    state.profile.city = cityId;
    state.profile.place = c.places[0].id;
    saveProfile();
    backend.update({ city: cityId, place: state.profile.place });
    toast(T().moved(L(c)));
  }
  state.view = 'town';
  renderSession();
  renderMap();
  renderUnlock();
  syncSound();
}

function openUnlock(cityId) {
  state.unlockTarget = cityId;
  renderUnlock();
  $('unlock').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function unlock(cityId, viaCoins) {
  const c = cityById(cityId);
  if (state.unlocked.includes(cityId)) return;
  if (viaCoins) {
    if (state.coins < c.cost) return;
    state.coins -= c.cost;
    lsSet('st-coins', state.coins);
    renderCoins(true);
  }
  state.unlocked = [...state.unlocked, cityId];
  lsSet('st-unlocked', state.unlocked);
  toast(T().unlocked(L(c)));
  state.unlockTarget = null;
  renderMap();
  renderUnlock();
}

async function sendChat(e) {
  e.preventDefault();
  const input = $('chat-input');
  const hint = $('chat-hint');
  const text = clean(input.value);
  if (!text) { hint.textContent = T().emptyMsg; return; }
  const wait = CHAT_COOLDOWN - Math.floor((Date.now() - state.lastSent) / 1000);
  if (wait > 0) { hint.textContent = T().tooFast(wait); return; }
  state.lastSent = Date.now();
  hint.textContent = '';
  input.value = '';
  try { await backend.send(text, state.profile.name); } catch (err) { console.warn(err); }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.disabled) return;
  const a = btn.dataset.action;
  if (a === 'lang') { state.lang = state.lang === 'zh' ? 'en' : 'zh'; lsSet('st-lang', state.lang); applyLang(); }
  else if (a === 'pomo') {
    state.profile.pomo = !state.profile.pomo;
    saveProfile();
    state.pomoPhase = pomoNow().focus;
    renderSession(); renderPomo();
  }
  else if (a === 'leave' || a === 'end') endSession(false);
  else if (a === 'pause') setStatus(state.status === 'focus' ? 'break' : 'focus');
  else if (a === 'tab-today') { state.tab = 'today'; renderBoard(); }
  else if (a === 'tab-week') { state.tab = 'week'; renderBoard(); }
  else if (a === 'world') { state.view = 'world'; renderMap(); renderUnlock(); }
  else if (a === 'sound') { state.sound = !state.sound; lsSet('st-sound', state.sound); syncSound(); }
  else if (a === 'close-unlock') { state.unlockTarget = null; renderUnlock(); }
  else if (a === 'buy' && state.unlockTarget) unlock(state.unlockTarget, true);
  else if (a === 'quest' && state.unlockTarget) unlock(state.unlockTarget, false);
});
$('vol').addEventListener('input', (e) => { state.vol = Number(e.target.value); lsSet('st-vol', state.vol); setVolume(state.vol / 100); });

/* ---------------- clock ---------------- */
setInterval(() => {
  if (!state.inTown) return;
  if (state.status === 'focus') {
    state.sessionSecs++;
    state.pendingSecs++;
    state.cityFocus[state.profile.city] = (state.cityFocus[state.profile.city] || 0) + 1;
    state.coinAcc++;
    if (state.coinAcc >= 60) {
      state.coinAcc = 0;
      state.coins++;
      lsSet('st-coins', state.coins);
      renderCoins(true);
      if (state.unlockTarget) renderUnlock();
    }
  }
  if (state.profile.pomo) {
    const p = pomoNow();
    if (p.focus !== state.pomoPhase) {
      state.pomoPhase = p.focus;
      setStatus(p.focus ? 'focus' : 'break');
      toast(p.focus ? T().pomoToFocus : T().pomoToRest);
    }
    renderPomo();
  }
  $('s-timer').textContent = fmtHMS(state.sessionSecs);
  if (state.pendingSecs >= 30) {
    flush().then(() => { renderCheckin(); if (state.unlockTarget) renderUnlock(); });
    backend.update({ focusSecs: state.sessionSecs });
  }
}, 1000);
setInterval(() => { if (state.inTown) renderBoard(); }, 60000);
window.addEventListener('pagehide', () => {
  if (state.inTown && state.pendingSecs) {
    addMyDay(state.pendingSecs);
    lsSet('st-cityfocus', state.cityFocus);
    backend.addStudy(state.pendingSecs, state.profile.name);
    state.pendingSecs = 0;
  }
});

/* ---------------- boot ---------------- */
(async function boot() {
  backend = await createBackend();
  $('f-nick').value = state.profile.name || '';
  $('f-subj').value = state.profile.subject || '';
  $('f-pomo').checked = !!state.profile.pomo;
  applyLang();
  backend.onPresence((list) => {
    state.presence = list;
    renderOnline();
    if (state.inTown) { if (state.view === 'world') renderWorld(); else renderTown(); }
  });
  backend.onMessages((msgs) => { state.messages = msgs; if (state.inTown) renderMessages(); });
  $('join-form').addEventListener('submit', enterTown);
  $('chat-form').addEventListener('submit', sendChat);
})();
