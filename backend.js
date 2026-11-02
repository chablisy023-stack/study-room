// 数据层 · Data layer
// - live 模式：填好 firebase-config.js 后，用 Firebase Realtime Database 实现真正的多人在线
// - demo 模式：没有配置时自动启用；同一浏览器多个标签页之间互通，并有几位"演示同学"
import { firebaseConfig } from './firebase-config.js';
import { cityById } from './cities.js';
import { randomAvatar } from './avatar.js';

export function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ }
}

export async function createBackend() {
  if (firebaseConfig && firebaseConfig.databaseURL) {
    try { return await createLive(firebaseConfig); }
    catch (err) { console.warn('[study-town] Firebase unavailable, falling back to demo mode', err); }
  }
  return createDemo();
}

/* ------------------------------------------------------------------ */
/* live: Firebase                                                      */
/* ------------------------------------------------------------------ */
async function createLive(cfg) {
  const V = '10.12.2';
  const base = `https://www.gstatic.com/firebasejs/${V}`;
  const [{ initializeApp }, A, D] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-database.js`),
  ]);
  const app = initializeApp(cfg);
  const cred = await A.signInAnonymously(A.getAuth(app));
  const uid = cred.user.uid;
  const db = D.getDatabase(app);
  const presRef = D.ref(db, `presence/${uid}`);
  let joined = false;

  return {
    mode: 'live',
    uid,
    async join(profile) {
      joined = true;
      await D.onDisconnect(presRef).remove();
      await D.set(presRef, { ...profile, lastSeen: D.serverTimestamp() });
    },
    async update(part) {
      if (!joined) return;
      await D.update(presRef, { ...part, lastSeen: D.serverTimestamp() });
    },
    async leave() {
      joined = false;
      await D.remove(presRef);
    },
    onPresence(cb) {
      return D.onValue(D.ref(db, 'presence'), (snap) => {
        const v = snap.val() || {};
        cb(Object.entries(v).map(([id, u]) => ({ id, ...u })));
      });
    },
    async send(text, name) {
      await D.push(D.ref(db, 'messages'), { uid, name, text, ts: D.serverTimestamp() });
    },
    onMessages(cb) {
      const q = D.query(D.ref(db, 'messages'), D.limitToLast(50));
      return D.onValue(q, (snap) => {
        const out = [];
        snap.forEach((c) => { out.push({ id: c.key, ...c.val() }); });
        cb(out);
      });
    },
    async addStudy(secs, name) {
      if (secs <= 0) return;
      await D.update(D.ref(db, `stats/${dayKey()}/${uid}`), { name, secs: D.increment(secs) });
    },
    async leaderboard(days) {
      const totals = {};
      const snaps = await Promise.all(
        Array.from({ length: days }, (_, i) => D.get(D.ref(db, `stats/${dayKey(i)}`)))
      );
      for (const snap of snaps) {
        for (const [id, u] of Object.entries(snap.val() || {})) {
          totals[id] = totals[id] || { id, name: u.name, secs: 0 };
          totals[id].secs += u.secs || 0;
        }
      }
      return Object.values(totals).sort((a, b) => b.secs - a.secs).slice(0, 10);
    },
  };
}

/* ------------------------------------------------------------------ */
/* demo: local only                                                    */
/* ------------------------------------------------------------------ */
const BOTS = [
  { id: 'bot-lin', name: '小林', subject: '考研英语 · Grad English', city: 'beijing', place: 'lib', base: 5.2 },
  { id: 'bot-erik', name: 'Erik', subject: 'Statistics · 统计学', city: 'london', place: 'cafe', base: 3.1 },
  { id: 'bot-mei', name: 'Mei', subject: '免疫学笔记 · Immunology', city: 'linkoping', place: 'lab', base: 2.6 },
  { id: 'bot-zhe', name: '阿哲', subject: '论文写作 · Thesis', city: 'beijing', place: 'tea', base: 4.4 },
  { id: 'bot-sara', name: 'Sara', subject: 'Svenska · 瑞典语', city: 'linkoping', place: 'fika', base: 1.8 },
  { id: 'bot-qing', name: '晴天', subject: 'Python 入门 · Intro Python', city: 'tokyo', place: 'cat', base: 2.2 },
  { id: 'bot-minji', name: 'Min-ji', subject: 'TOPIK · 韩语', city: 'seoul', place: 'cafe', base: 3.6 },
  { id: 'bot-liv', name: 'Olivia', subject: 'Marine biology · 海洋生物', city: 'sydney', place: 'bondi', base: 1.4 },
];

function createDemo() {
  let uid = lsGet('st-uid', null);
  if (!uid) { uid = 'u-' + Math.random().toString(36).slice(2, 10); lsSet('st-uid', uid); }
  const tabId = uid + '-' + Math.random().toString(36).slice(2, 6);
  const ch = 'BroadcastChannel' in window ? new BroadcastChannel('study-town-demo') : null;
  const peers = new Map();
  const presenceCbs = [];
  const msgCbs = [];
  let me = null;
  let messages = lsGet('st-demo-msgs', null) || [
    { id: 'm1', uid: 'bot-mei', name: 'Mei', text: '休息 5 分钟，大家记得喝水～', ts: Date.now() - 20 * 60e3, bot: true },
    { id: 'm2', uid: 'bot-erik', name: 'Erik', text: 'Third round today, keep going!', ts: Date.now() - 8 * 60e3, bot: true },
  ];

  const start = Date.now();
  const bots = BOTS.map((b, i) => ({
    ...b, bot: true, status: 'focus', focusSecs: Math.round(b.base * 600) + i * 97, startedAt: start, avatar: randomAvatar(b.id),
  }));

  function presenceList() {
    const now = Date.now();
    for (const [id, p] of peers) if (now - p.seen > 15000) peers.delete(id);
    const list = [...bots, ...peers.values()];
    if (me) list.push({ id: tabId, uid, ...me });
    return list;
  }
  const emitPresence = () => { const l = presenceList(); presenceCbs.forEach((cb) => cb(l)); };
  const emitMessages = () => msgCbs.forEach((cb) => cb(messages.slice()));

  if (ch) {
    ch.onmessage = (e) => {
      const m = e.data || {};
      if (m.type === 'presence') { peers.set(m.id, { ...m.p, id: m.id, seen: Date.now() }); emitPresence(); }
      else if (m.type === 'leave') { peers.delete(m.id); emitPresence(); }
      else if (m.type === 'msg') { messages = [...messages, m.msg].slice(-50); emitMessages(); }
    };
  }

  setInterval(() => {
    bots.forEach((b) => {
      if (b.status === 'focus') b.focusSecs += 5;
      if (Math.random() < 0.04) b.status = b.status === 'focus' ? 'break' : 'focus';
      if (Math.random() < 0.02) {
        const ps = cityById(b.city).places;
        b.place = ps[Math.floor(Math.random() * ps.length)].id;
      }
    });
    if (me && ch) ch.postMessage({ type: 'presence', id: tabId, p: { uid, ...me } });
    emitPresence();
  }, 5000);

  window.addEventListener('beforeunload', () => { if (me && ch) ch.postMessage({ type: 'leave', id: tabId }); });

  function stats() { return lsGet('st-demo-stats', {}); }

  return {
    mode: 'demo',
    uid,
    async join(profile) {
      me = { ...profile };
      if (ch) ch.postMessage({ type: 'presence', id: tabId, p: { uid, ...me } });
      emitPresence();
    },
    async update(part) {
      if (!me) return;
      Object.assign(me, part);
      if (ch) ch.postMessage({ type: 'presence', id: tabId, p: { uid, ...me } });
      emitPresence();
    },
    async leave() {
      me = null;
      if (ch) ch.postMessage({ type: 'leave', id: tabId });
      emitPresence();
    },
    onPresence(cb) { presenceCbs.push(cb); cb(presenceList()); },
    async send(text, name) {
      const msg = { id: 'm' + Date.now(), uid, name, text, ts: Date.now() };
      messages = [...messages, msg].slice(-50);
      lsSet('st-demo-msgs', messages);
      if (ch) ch.postMessage({ type: 'msg', msg });
      emitMessages();
    },
    onMessages(cb) { msgCbs.push(cb); cb(messages.slice()); },
    async addStudy(secs, name) {
      if (secs <= 0) return;
      const s = stats();
      const k = dayKey();
      s[k] = s[k] || {};
      s[k][uid] = { name, secs: ((s[k][uid] && s[k][uid].secs) || 0) + secs };
      lsSet('st-demo-stats', s);
    },
    async leaderboard(days) {
      const s = stats();
      const totals = {};
      for (let i = 0; i < days; i++) {
        for (const [id, u] of Object.entries(s[dayKey(i)] || {})) {
          totals[id] = totals[id] || { id, name: u.name, secs: 0 };
          totals[id].secs += u.secs;
        }
      }
      bots.forEach((b, i) => {
        const secs = days === 1 ? b.focusSecs : Math.round(b.base * 3600 * (4 + (i % 3)));
        totals[b.id] = { id: b.id, name: b.name, secs, bot: true };
      });
      return Object.values(totals).sort((a, b) => b.secs - a.secs).slice(0, 10);
    },
  };
}
