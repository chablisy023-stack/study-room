import { STR, PLACES } from './i18n.js';
import { createBackend, dayKey } from './backend.js';

const $ = (id) => document.getElementById(id);
const lsGet = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

const CHECKIN_SECS = 25 * 60;
const CHAT_COOLDOWN = 30;
const BAD_WORDS = ['傻逼', '操你', '草泥马', 'fuck', 'shit', 'bitch'];
const COLORS = ['#2E7D5B', '#3B5BA9', '#8A4FB0', '#9A5B12', '#A23E5A', '#1F6F8B', '#5B6B1E', '#7A3E2E'];

const state = {
  lang: lsGet('st-lang', (navigator.language || '').startsWith('zh') ? 'zh' : 'en'),
  profile: lsGet('st-profile', { name: '', subject: '', place: 'library', pomo: false }),
  inTown: false,
  status: 'focus',
  sessionSecs: 0,
  pendingSecs: 0,
  presence: [],
  messages: [],
  tab: 'today',
  lastSent: 0,
  pomoPhase: null,
};
let backend = null;
const T = () => STR[state.lang];
const placeName = (id) => (PLACES.find((p) => p.id === id) || PLACES[0])[state.lang];

/* ---------------- helpers ---------------- */
function fmtHMS(s) {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
}
function fmtHours(s) {
  if (s < 3600) return `${Math.round(s / 60)}m`;
  return `${(s / 3600).toFixed(1)}h`;
}
function colorFor(id) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}
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

/* ---------------- daily record (check-in & streak) ---------------- */
function myDay() { return lsGet('st-days', {}); }
function addMyDay(secs) {
  const d = myDay();
  const k = dayKey();
  d[k] = (d[k] || 0) + secs;
  lsSet('st-days', d);
}
function streak() {
  const d = myDay();
  let n = 0;
  let i = (d[dayKey()] || 0) >= CHECKIN_SECS ? 0 : 1;
  while ((d[dayKey(i)] || 0) >= CHECKIN_SECS) { n++; i++; }
  return n;
}

/* ---------------- i18n ---------------- */
function applyLang() {
  const t = T();
  document.documentElement.lang = state.lang === 'zh' ? 'zh' : 'en';
  document.title = state.lang === 'zh' ? '自习小镇 Study Town' : 'Study Town 自习小镇';
  document.querySelectorAll('[data-i18n]').forEach((el) => { const v = t[el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t[el.dataset.i18nPh]; });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t[el.dataset.i18nAria]); });
  document.querySelectorAll('.lang-btn').forEach((b) => { b.textContent = t.lang; b.setAttribute('aria-label', t.langAria); });
  const sel = $('f-place');
  const cur = sel.value || state.profile.place;
  sel.innerHTML = '';
  PLACES.forEach((p) => { const o = document.createElement('option'); o.value = p.id; o.textContent = p[state.lang]; sel.appendChild(o); });
  sel.value = cur;
  $('mode-tag').textContent = backend && backend.mode === 'demo' ? t.demoTag : '';
  renderAll();
}

/* ---------------- render ---------------- */
function renderAll() {
  renderOnline();
  if (!state.inTown) return;
  renderSession();
  renderPomo();
  renderPlaces();
  renderAvatars();
  renderMessages();
  renderCheckin();
  renderBoard();
}

function renderOnline() {
  const n = state.presence.length;
  $('online-count').textContent = n;
  $('join-online').textContent = T().nowOnline(n);
}

function renderSession() {
  const t = T();
  $('s-where').textContent = t.at(placeName(state.profile.place));
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

function renderPlaces() {
  const box = $('places');
  box.innerHTML = '';
  const counts = {};
  state.presence.forEach((u) => { counts[u.place] = (counts[u.place] || 0) + 1; });
  PLACES.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'place-btn' + (p.id === state.profile.place ? ' here' : '');
    b.style.left = `${p.x / 10}%`;
    b.style.top = `${(p.y + 58) / 6.4}%`;
    b.textContent = `${p[state.lang]} · ${counts[p.id] || 0}`;
    b.addEventListener('click', () => moveTo(p.id));
    box.appendChild(b);
  });
}

function renderAvatars() {
  const box = $('avatars');
  box.innerHTML = '';
  const t = T();
  const byPlace = {};
  state.presence.forEach((u) => { (byPlace[u.place] = byPlace[u.place] || []).push(u); });
  for (const [placeId, users] of Object.entries(byPlace)) {
    const p = PLACES.find((x) => x.id === placeId);
    if (!p) continue;
    users.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    users.forEach((u, i) => {
      const ring = Math.floor(i / 8);
      const ang = (i % 8) / 8 * Math.PI * 2 - Math.PI / 2 + ring * 0.4;
      const r = 80 + ring * 36;
      const x = p.x + Math.cos(ang) * r * 1.35;
      const y = p.y + Math.sin(ang) * r * 0.75;
      const isMe = (u.uid || u.id) === backend.uid;
      const el = document.createElement('div');
      el.className = 'avatar' + (isMe ? ' me' : '') + (u.status === 'break' ? ' rest' : '');
      el.tabIndex = 0;
      el.style.left = `${Math.max(3, Math.min(97, x / 10))}%`;
      el.style.top = `${Math.max(5, Math.min(95, y / 6.4))}%`;
      el.style.background = colorFor(u.uid || u.id);
      el.textContent = (u.name || '?').charAt(0).toUpperCase();
      const label = `${u.name}${u.bot ? ` (${t.demoBadge})` : ''} · ${u.subject} · ${u.status === 'break' ? t.rest : t.focus} · ${fmtHMS(u.focusSecs || 0)}`;
      el.setAttribute('aria-label', label);
      const tip = document.createElement('span');
      tip.className = 'tip';
      tip.textContent = label;
      el.appendChild(tip);
      if (u.status === 'break') {
        const z = document.createElement('span');
        z.className = 'zz';
        z.textContent = 'zz';
        el.appendChild(z);
      }
      box.appendChild(el);
    });
  }
}

function renderMessages() {
  const box = $('messages');
  const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
  box.innerHTML = '';
  state.messages.forEach((m) => {
    const wrap = document.createElement('div');
    const head = document.createElement('div');
    head.className = 'msg-head';
    const n = document.createElement('strong');
    n.textContent = m.name + (m.bot ? ` (${T().demoBadge})` : '');
    const tm = document.createElement('time');
    const d = new Date(typeof m.ts === 'number' ? m.ts : Date.now());
    tm.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    head.append(n, tm);
    const tx = document.createElement('div');
    tx.className = 'msg-text';
    tx.textContent = m.text;
    wrap.append(head, tx);
    box.appendChild(wrap);
  });
  if (atBottom || renderMessages.first !== false) { box.scrollTop = box.scrollHeight; renderMessages.first = false; }
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
  if (!rows.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = t.empty;
    ol.appendChild(li);
    return;
  }
  rows.forEach((r, i) => {
    const li = document.createElement('li');
    const me = r.id === backend.uid;
    if (me) li.className = 'me';
    const rank = document.createElement('span'); rank.className = 'rank'; rank.textContent = i + 1;
    const name = document.createElement('span'); name.className = 'name';
    name.textContent = r.name + (me ? t.me : '') + (r.bot ? ` (${t.demoBadge})` : '');
    const h = document.createElement('span'); h.className = 'mono'; h.textContent = fmtHours(r.secs);
    li.append(rank, name, h);
    ol.appendChild(li);
  });
}

/* ---------------- actions ---------------- */
async function enterTown(e) {
  e.preventDefault();
  const name = $('f-nick').value.trim().slice(0, 16);
  const subject = $('f-subj').value.trim().slice(0, 30);
  if (!name || !subject) return;
  state.profile = { name, subject, place: $('f-place').value, pomo: $('f-pomo').checked };
  lsSet('st-profile', state.profile);
  state.inTown = true;
  state.sessionSecs = 0;
  state.pendingSecs = 0;
  state.status = state.profile.pomo && !pomoNow().focus ? 'break' : 'focus';
  state.pomoPhase = pomoNow().focus;
  await backend.join({ name, subject, place: state.profile.place, status: state.status, focusSecs: 0, startedAt: Date.now() });
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
    try { await backend.addStudy(s, state.profile.name); } catch (e) { console.warn(e); }
  }
}

async function endSession(silent) {
  await flush();
  const mins = Math.floor(state.sessionSecs / 60);
  state.inTown = false;
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
}

function moveTo(placeId) {
  if (placeId === state.profile.place) return;
  state.profile.place = placeId;
  lsSet('st-profile', state.profile);
  backend.update({ place: placeId });
  toast(T().moved(placeName(placeId)));
  renderAll();
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
  if (!btn) return;
  const a = btn.dataset.action;
  if (a === 'lang') { state.lang = state.lang === 'zh' ? 'en' : 'zh'; lsSet('st-lang', state.lang); applyLang(); }
  else if (a === 'pomo') {
    state.profile.pomo = !state.profile.pomo;
    lsSet('st-profile', state.profile);
    state.pomoPhase = pomoNow().focus;
    renderSession(); renderPomo();
  }
  else if (a === 'leave' || a === 'end') endSession(false);
  else if (a === 'pause') setStatus(state.status === 'focus' ? 'break' : 'focus');
  else if (a === 'tab-today') { state.tab = 'today'; renderBoard(); }
  else if (a === 'tab-week') { state.tab = 'week'; renderBoard(); }
});

/* ---------------- clock ---------------- */
setInterval(() => {
  if (!state.inTown) return;
  if (state.status === 'focus') { state.sessionSecs++; state.pendingSecs++; }
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
    flush().then(() => { renderCheckin(); });
    backend.update({ focusSecs: state.sessionSecs });
  }
}, 1000);
setInterval(() => { if (state.inTown) renderBoard(); }, 60000);
window.addEventListener('pagehide', () => { if (state.inTown) { addMyDay(state.pendingSecs); backend.addStudy(state.pendingSecs, state.profile.name); state.pendingSecs = 0; } });

/* ---------------- boot ---------------- */
(async function boot() {
  backend = await createBackend();
  $('f-nick').value = state.profile.name || '';
  $('f-subj').value = state.profile.subject || '';
  $('f-pomo').checked = !!state.profile.pomo;
  applyLang();
  $('f-place').value = state.profile.place || 'library';
  backend.onPresence((list) => {
    state.presence = list;
    renderOnline();
    if (state.inTown) { renderPlaces(); renderAvatars(); }
  });
  backend.onMessages((msgs) => { state.messages = msgs; if (state.inTown) renderMessages(); });
  $('join-form').addEventListener('submit', enterTown);
  $('chat-form').addEventListener('submit', sendChat);
})();
