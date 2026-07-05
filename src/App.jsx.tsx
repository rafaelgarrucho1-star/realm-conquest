import React, { useState, useEffect } from 'react';

// ============================================================
// ⚔️ REALM CONQUEST — V13 "Motor Tribal"
// • Produção em tempo real + ganho offline
// • Fila de construção (2 free / 5 VIP) com tempos reais
// • Recrutamento com fila e tempos do documento mestre
// • Pesquisa obrigatória no Ferreiro + bônus de combate
// • Mapa com aldeias bárbaras (IA em 4 níveis que cresce e ataca)
// • Combate: matriz completa, muralha, aríete, catapulta, saque
// • Sacerdotes: conquista por lealdade
// • Relatórios + Missões (reembolso de 10% por nível novo)
// ============================================================
const VERSION = 'v13';

const C = {
  gold: '#e8c877', darkGold: '#8a6a2a', parch: '#f4ead0', parchD: '#e6d6b0',
  w1: '#4a3a1a', w2: '#6a5a3a', w3: '#8a7a5a',
  wood: '#5f4526', woodD: '#3b2b17', woodL: '#8a6a3c',
  border: '#8a6a42', green: '#3d6a22', red: '#8a2a2a',
  dirt: '#b08a5e', dirtL: '#c9a878', dirtD: '#8a6a42'
};

const IMG = {
  castle: 'https://opengameart.org/sites/default/files/castle_8.png',
  house1: 'https://opengameart.org/sites/default/files/house1_0.png',
  house1b: 'https://opengameart.org/sites/default/files/house1b.png',
  house1c: 'https://opengameart.org/sites/default/files/house1c.png',
  barracks: 'https://opengameart.org/sites/default/files/barracks_2.png',
  stable: 'https://opengameart.org/sites/default/files/stable.png',
  blacksmith: 'https://opengameart.org/sites/default/files/blacksmith.png',
  archery: 'https://opengameart.org/sites/default/files/archery_range.png',
  towerStone: 'https://opengameart.org/sites/default/files/watchtower_lvl2-exp_full_size.png',
  towerWood: 'https://opengameart.org/sites/default/files/watchtower_wooden_full_size.png'
};

const BUILDINGS = {
  mainBuilding: { name: 'Edifício Principal', emoji: '🏰', max: 30, w: 90, i: 80, h: 40, bt: 50, desc: 'Reduz tempo de todas as construções', img: IMG.castle },
  church: { name: 'Igreja', emoji: '⛪', max: 1, w: 2000, i: 1500, h: 1000, bt: 1200, desc: 'Treina sacerdotes (conquista)', img: IMG.towerStone },
  smithy: { name: 'Ferreiro', emoji: '🔧', max: 20, w: 240, i: 200, h: 150, bt: 45, desc: 'Pesquisa de tropas e bônus', img: IMG.blacksmith },
  barracks: { name: 'Quartel', emoji: '🎖️', max: 25, w: 100, i: 50, h: 50, bt: 40, desc: 'Treina infantaria', img: IMG.barracks },
  stable: { name: 'Estábulo', emoji: '🐴', max: 20, w: 150, i: 100, h: 100, bt: 45, desc: 'Cria cavalaria', img: IMG.stable },
  workshop: { name: 'Oficina', emoji: '🔨', max: 20, w: 200, i: 150, h: 100, bt: 50, desc: 'Máquinas de cerco', img: IMG.archery },
  woodcutter: { name: 'Serraria', emoji: '🪵', max: 30, w: 50, i: 30, h: 30, bt: 25, desc: 'Produz madeira', img: IMG.towerWood },
  mine: { name: 'Mina de Ferro', emoji: '⛏️', max: 30, w: 50, i: 30, h: 30, bt: 25, desc: 'Produz ferro', img: IMG.house1b },
  farm: { name: 'Fazenda', emoji: '🌾', max: 30, w: 50, i: 30, h: 30, bt: 25, desc: 'Produz trigo e população', img: IMG.house1c },
  warehouse: { name: 'Armazém', emoji: '📦', max: 30, w: 50, i: 30, h: 30, bt: 25, desc: 'Guarda recursos', img: IMG.house1 },
  hideout: { name: 'Esconderijo', emoji: '🕳️', max: 10, w: 80, i: 60, h: 40, bt: 30, desc: 'Esconde recursos dos saqueadores', img: IMG.house1b },
  market: { name: 'Mercado', emoji: '🏪', max: 20, w: 100, i: 50, h: 50, bt: 35, desc: 'Troca recursos', img: IMG.house1c },
  wall: { name: 'Muralha', emoji: '🧱', max: 20, w: 100, i: 50, h: 50, bt: 30, desc: '+5% defesa por nível', img: null }
};

const PREREQ = {
  woodcutter: { mainBuilding: 1 }, mine: { mainBuilding: 1 }, farm: { mainBuilding: 1 }, warehouse: { mainBuilding: 1 }, hideout: { mainBuilding: 1 },
  barracks: { mainBuilding: 3 }, wall: { barracks: 1 }, smithy: { mainBuilding: 5, barracks: 3 },
  stable: { smithy: 5, barracks: 10 }, workshop: { smithy: 10, barracks: 12 },
  market: { mainBuilding: 5, warehouse: 5 }, church: { mainBuilding: 10, smithy: 20, barracks: 15 }
};

// tempo em minutos (documento mestre) · speed = campos por "hora de jogo"
const TROOPS = {
  spearman: { name: 'Lanceiro', icon: '🔱', atk: 8, def: 12, pop: 1, carry: 25, spd: 6, tmin: 7, by: 'barracks', cost: { w: 0, i: 5, h: 55 }, res: { c: 1500, s: 1 } },
  swordsman: { name: 'Espadachim', icon: '🗡️', atk: 10, def: 8, pop: 1, carry: 20, spd: 6, tmin: 9, by: 'barracks', cost: { w: 0, i: 0, h: 50 }, res: { c: 1000, s: 1 } },
  archer: { name: 'Arqueiro', icon: '🏹', atk: 12, def: 4, pop: 1, carry: 10, spd: 6, tmin: 11, by: 'barracks', cost: { w: 100, i: 0, h: 50 }, res: { c: 3000, s: 3 } },
  barbarian: { name: 'Bárbaro', icon: '🪓', atk: 15, def: 10, pop: 1, carry: 30, spd: 6, tmin: 14, by: 'barracks', cost: { w: 0, i: 20, h: 80 }, res: { c: 5000, s: 5 } },
  spy: { name: 'Espião', icon: '🕵️', atk: 0, def: 0, pop: 1, carry: 0, spd: 12, tmin: 12, by: 'stable', cost: { w: 50, i: 25, h: 0 }, res: { c: 4000, s: 5 } },
  cavalry: { name: 'Cavalaria', icon: '🐴', atk: 25, def: 15, pop: 2, carry: 100, spd: 18, tmin: 35, by: 'stable', cost: { w: 0, i: 20, h: 200 }, res: { c: 10000, s: 8 } },
  archerCav: { name: 'Arq. a Cavalo', icon: '🐎', atk: 18, def: 10, pop: 2, carry: 50, spd: 15, tmin: 28, by: 'stable', cost: { w: 100, i: 30, h: 0 }, res: { c: 15000, s: 10 } },
  royalCav: { name: 'Cavalaria Real', icon: '👑', atk: 40, def: 25, pop: 3, carry: 120, spd: 16, tmin: 50, by: 'stable', cost: { w: 100, i: 100, h: 0 }, res: { c: 30000, s: 15 } },
  ram: { name: 'Aríete', icon: '⚒️', atk: 50, def: 8, pop: 4, carry: 0, spd: 6, tmin: 45, by: 'workshop', cost: { w: 300, i: 150, h: 0 }, res: { c: 20000, s: 12 } },
  catapult: { name: 'Catapulta', icon: '💣', atk: 80, def: 2, pop: 5, carry: 0, spd: 4, tmin: 60, by: 'workshop', cost: { w: 100, i: 100, h: 0 }, res: { c: 35000, s: 18 } }
};

// matriz ataque × defesa (documento mestre)
const MROW = ['swordsman', 'archer', 'spearman', 'barbarian', 'cavalry', 'archerCav', 'royalCav'];
const MATRIX = {
  swordsman: [1.0, 1.5, 1.5, 0.7, 0.5, 0.7, 0.4],
  archer: [1.5, 1.0, 1.5, 1.5, 0.5, 0.6, 0.5],
  spearman: [0.7, 0.7, 1.0, 0.6, 2.0, 1.8, 1.5],
  barbarian: [1.5, 0.6, 1.5, 1.0, 1.5, 1.2, 0.8],
  cavalry: [1.5, 2.0, 0.4, 0.6, 1.0, 1.0, 0.7],
  archerCav: [1.5, 1.5, 0.5, 0.8, 1.0, 1.0, 0.6],
  royalCav: [2.0, 2.0, 0.6, 1.2, 1.5, 1.7, 1.0]
};

const BONUS = {
  corcel: { name: 'Corcel de Guerra', icon: '🐴', desc: '+5% ataque cavalaria', cost: 50000 },
  arco: { name: 'Arco Longo', icon: '🏹', desc: '+5% ataque arqueiros', cost: 40000 },
  aco: { name: 'Aço Temperado', icon: '⚔️', desc: '+5% ataque infantaria', cost: 45000 },
  armadura: { name: 'Armadura Reforçada', icon: '🛡️', desc: '+5% defesa de todas', cost: 60000 },
  cerco: { name: 'Engenharia de Cerco', icon: '💥', desc: '+10% aríete e catapulta', cost: 80000 }
};
const CAV = ['cavalry', 'archerCav', 'royalCav'], ARC = ['archer', 'archerCav'], INF = ['swordsman', 'spearman', 'barbarian'], SIEGE = ['ram', 'catapult'];

const TIERS = { 1: { n: 'Bandidos', e: '🛖', c: '#7a6a3a' }, 2: { n: 'Saqueadores', e: '🪓', c: '#8a5a2a' }, 3: { n: 'Horda', e: '🛡️', c: '#7a3a2a' }, 4: { n: 'Império Bárbaro', e: '👹', c: '#5a1a1a' } };
const HOME = { x: 50, y: 50 };
const MINPF = 12; // minutos por campo = MINPF / velocidade

/* ===== helpers ===== */
const cost = (b, lvl) => { const m = Math.pow(1.26, Math.max(0, lvl - 1)); return { w: Math.floor(b.w * m), i: Math.floor(b.i * m), h: Math.floor(b.h * m) }; };
const production = (lvl) => lvl > 0 ? 50 + (lvl - 1) * 145 : 0;
const warehouseCap = (lvl) => Math.floor(1500 * Math.pow(1.22, Math.max(0, lvl - 1)));
const maxPop = (lvl) => Math.min(30000, 240 + Math.max(0, lvl - 1) * 260);
const hideAmount = (lvl) => lvl * 5000;
const fmt = (n) => Math.floor(n).toLocaleString('pt-BR');
const bPoints = (lvl) => lvl > 0 ? 2 * lvl * (lvl + 1) : 0;
const vPoints = (g) => Object.values(g.levels).reduce((s, l) => s + bPoints(l), 0) + (g.conquered || 0) * 2500;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const travelMs = (d, troops) => {
  let slow = 99; Object.entries(troops).forEach(([k, v]) => { if (v > 0 && TROOPS[k]) slow = Math.min(slow, TROOPS[k].spd); });
  if (slow === 99) slow = 6;
  return Math.max(20000, Math.round(d * (MINPF / slow) * 60000));
};
const buildMs = (bid, lvl, mainLvl) => {
  const red = Math.min(0.29, Math.max(0, (mainLvl - 1) * 0.01));
  return Math.round(BUILDINGS[bid].bt * Math.pow(1.3, Math.max(0, lvl - 1)) * (1 - red)) * 1000;
};
const trainMs = (tid, L) => {
  const t = TROOPS[tid]; const bl = L[t.by] || 1;
  const pct = t.by === 'barracks' ? 0.01 : t.by === 'stable' ? 0.015 : 0.012;
  const red = Math.min(t.by === 'barracks' ? 0.24 : t.by === 'stable' ? 0.285 : 0.228, Math.max(0, (bl - 1) * pct));
  return Math.round(t.tmin * 60000 * (1 - red));
};
const priestCost = (n) => Math.floor(30000 * Math.pow(1.1, n));
const fmtT = (ms) => {
  if (ms < 0) ms = 0; const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const barbTroops = (tier, lvl) => {
  const t = { spearman: 6 * lvl, swordsman: 5 * lvl, archer: 2 * lvl };
  if (tier >= 2) { t.barbarian = 3 * lvl; t.cavalry = 1 * lvl; }
  if (tier >= 3) { t.cavalry = 3 * lvl; t.archerCav = 2 * lvl; }
  if (tier >= 4) { t.royalCav = 2 * lvl; t.ram = Math.floor(lvl / 2); }
  return t;
};
const atkInterval = (tier) => ({ 1: [5, 8], 2: [3.5, 6], 3: [2.5, 5], 4: [6, 10] }[tier].map(h => h * 3600e3));
const nextAtkAt = (tier, now) => { const [a, b] = atkInterval(tier); return now + a + Math.random() * (b - a); };

function genBarbs(seed, now) {
  const r = mulberry32(seed); const arr = []; const used = new Set(['50,50']);
  const mk = (x, y, tier, lvl, i) => ({
    id: 'b' + i, x, y, tier, lvl, name: `${TIERS[tier].n} #${i + 1}`,
    troops: barbTroops(tier, lvl), wall: Math.min(20, tier * 2 + Math.floor(lvl / 3)),
    res: { wood: 350 * lvl * tier, iron: 260 * lvl * tier, wheat: 350 * lvl * tier },
    loyalty: 100, owner: null, grewAt: now, atkAt: nextAtkAt(tier, now)
  });
  // 6 aldeias fáceis perto de casa (pra começar a farmar)
  const near = [[46, 47], [54, 46], [56, 52], [45, 54], [50, 44], [44, 50]];
  near.forEach(([x, y], i) => { used.add(x + ',' + y); arr.push(mk(x, y, 1, 2 + Math.floor(r() * 3), i)); });
  for (let i = 6; i < 55; i++) {
    let x, y, k = 0;
    do { x = 3 + Math.floor(r() * 95); y = 3 + Math.floor(r() * 95); k++; } while (used.has(x + ',' + y) && k < 60);
    used.add(x + ',' + y);
    const d = Math.hypot(x - 50, y - 50); const corner = (x < 14 || x > 86) && (y < 14 || y > 86);
    const tier = corner ? 4 : d > 32 ? (r() < 0.5 ? 3 : 2) : d > 15 ? (r() < 0.6 ? 2 : 1) : 1;
    const lvl = tier * 2 + Math.floor(r() * 4) + (tier === 1 ? 1 : 2);
    arr.push(mk(x, y, tier, lvl, i));
  }
  return arr;
}

/* ===== combate (fórmulas do documento mestre) ===== */
function resolveBattle(att, def, wallLvl, rams, attBonus, defBonus) {
  const defList = MROW.filter(k => (def[k] || 0) > 0);
  const defTotal = defList.reduce((s, k) => s + def[k], 0);
  const multFor = (aid) => {
    if (!MATRIX[aid] || defTotal === 0) return 1;
    return defList.reduce((s, k) => s + MATRIX[aid][MROW.indexOf(k)] * def[k], 0) / defTotal;
  };
  let attP = 0;
  Object.entries(att).forEach(([k, v]) => {
    if (v <= 0 || !TROOPS[k]) return;
    let bon = 1;
    if (attBonus.corcel && CAV.includes(k)) bon += 0.05;
    if (attBonus.arco && ARC.includes(k)) bon += 0.05;
    if (attBonus.aco && INF.includes(k)) bon += 0.05;
    if (attBonus.cerco && SIEGE.includes(k)) bon += 0.10;
    attP += TROOPS[k].atk * v * multFor(k) * bon;
  });
  const wallEff = Math.max(0, wallLvl - (rams || 0));
  const wallBon = 1 + wallEff * 0.05;
  let defP = 0;
  Object.entries(def).forEach(([k, v]) => {
    if (v <= 0 || !TROOPS[k]) return;
    defP += TROOPS[k].def * v * wallBon * (defBonus.armadura ? 1.05 : 1);
  });
  const attWins = attP > defP;
  const ratio = attWins ? (attP > 0 ? defP / attP : 1) : (defP > 0 ? attP / defP : 1);
  const cut = (obj, r) => { const o = {}; Object.entries(obj).forEach(([k, v]) => { o[k] = Math.max(0, v - Math.ceil(v * r)); }); return o; };
  return {
    attWins, attP: Math.round(attP), defP: Math.round(defP), wallEff,
    attSurv: attWins ? cut(att, ratio) : {},
    defSurv: attWins ? {} : cut(def, ratio)
  };
}
const tSum = (t) => Object.values(t || {}).reduce((s, v) => s + v, 0);
const tLines = (t) => Object.entries(t || {}).filter(([, v]) => v > 0).map(([k, v]) => `${TROOPS[k].icon}${fmt(v)}`).join(' ') || '—';

/* ===== estado ===== */
const startState = () => {
  const now = Date.now();
  return {
    resources: { wood: 4000, iron: 3000, wheat: 4000 },
    levels: { mainBuilding: 3, woodcutter: 5, mine: 5, farm: 5, warehouse: 5, smithy: 1, market: 0, barracks: 3, stable: 1, workshop: 0, church: 0, hideout: 0, wall: 2 },
    troops: { spearman: 40, swordsman: 30, archer: 0, barbarian: 0, spy: 2, cavalry: 0, archerCav: 0, royalCav: 0, ram: 0, catapult: 0 },
    research: { spearman: true, swordsman: true, spy: true },
    bonuses: {}, priests: 0, priestsTotal: 0, priestQ: null,
    buildQ: [], recruitQ: { barracks: [], stable: [], workshop: [] },
    commands: [], incoming: [], reports: [], missions: [], claimedLevels: {},
    profile: { name: 'Senhor da Guerra', photo: '', desc: 'Conquistador destemido das terras de Realm.' },
    conquered: 0, isVip: true, seed: Math.floor(Math.random() * 1e9), barbs: null,
    createdAt: now, savedAt: now, cmdSeq: 1
  };
};

function loadState() {
  try {
    const raw = localStorage.getItem('rc_save');
    if (raw) {
      const s = JSON.parse(raw); const base = startState();
      const g = {
        ...base, ...s,
        resources: { ...base.resources, ...s.resources }, levels: { ...base.levels, ...s.levels },
        troops: { ...base.troops, ...s.troops }, research: { ...base.research, ...(s.research || {}) },
        recruitQ: { ...base.recruitQ, ...(s.recruitQ || {}) }, profile: { ...base.profile, ...(s.profile || {}) }
      };
      if (!g.barbs) g.barbs = genBarbs(g.seed, Date.now());
      return g;
    }
  } catch (e) { }
  const g = startState(); g.barbs = genBarbs(g.seed, Date.now()); return g;
}

/* ===== motor do jogo (roda a cada segundo e no ganho offline) ===== */
function advance(g0, now) {
  const g = { ...g0, resources: { ...g0.resources }, levels: { ...g0.levels }, troops: { ...g0.troops } };
  const dt = Math.max(0, now - (g.savedAt || now));
  g.savedAt = now;
  const rep = (r) => { g.reports = [{ id: now + '_' + Math.random().toString(36).slice(2, 6), at: now, ...r }, ...g.reports].slice(0, 30); };
  const whC = warehouseCap(g.levels.warehouse);
  const colBon = 1 + (g.conquered || 0) * 0.10;
  const addRes = (k, v) => { g.resources[k] = Math.min(whC, g.resources[k] + v); };

  // 1) produção (VIP +20%, +10% por colônia conquistada)
  const hrs = dt / 3600e3;
  addRes('wood', production(g.levels.woodcutter) * 1.2 * colBon * hrs);
  addRes('iron', production(g.levels.mine) * 1.2 * colBon * hrs);
  addRes('wheat', production(g.levels.farm) * 1.2 * colBon * hrs);

  // 2) fila de construção (sequencial)
  g.buildQ = [...(g.buildQ || [])];
  let guard = 0;
  while (g.buildQ.length && guard++ < 20) {
    const head = g.buildQ[0];
    if (!head.endsAt) head.endsAt = now + head.dur;
    if (now < head.endsAt) break;
    g.levels[head.bid] = head.lvl;
    const key = head.bid + '_' + head.lvl;
    if (!g.claimedLevels[key]) {
      g.claimedLevels = { ...g.claimedLevels, [key]: 1 };
      const rw = { w: Math.floor(head.cost.w * 0.1), i: Math.floor(head.cost.i * 0.1), h: Math.floor(head.cost.h * 0.1) };
      g.missions = [{ id: key, bid: head.bid, lvl: head.lvl, reward: rw, claimed: false, at: now }, ...(g.missions || [])].slice(0, 60);
    }
    const done = g.buildQ.shift();
    if (g.buildQ[0]) g.buildQ[0].endsAt = done.endsAt + g.buildQ[0].dur;
  }

  // 3) filas de recrutamento (unidade por unidade)
  g.recruitQ = { barracks: [...g.recruitQ.barracks], stable: [...g.recruitQ.stable], workshop: [...g.recruitQ.workshop] };
  Object.keys(g.recruitQ).forEach(by => {
    let q = g.recruitQ[by]; guard = 0;
    while (q.length && guard++ < 500) {
      const h = q[0];
      if (!h.nextAt) h.nextAt = now + h.unitMs;
      if (now < h.nextAt) break;
      g.troops[h.tid] = (g.troops[h.tid] || 0) + 1; h.qty--;
      if (h.qty > 0) h.nextAt += h.unitMs; else { q.shift(); if (q[0]) q[0].nextAt = h.nextAt + q[0].unitMs; }
    }
  });

  // 4) sacerdotes
  if (g.priestQ) {
    const pq = { ...g.priestQ }; guard = 0;
    while (pq.qty > 0 && now >= pq.nextAt && guard++ < 20) { g.priests++; pq.qty--; pq.nextAt += 4 * 3600e3; }
    g.priestQ = pq.qty > 0 ? pq : null;
  }

  // 5) bárbaros: crescimento + lealdade + agendar ataques
  g.barbs = (g.barbs || []).map(b => {
    const nb = { ...b, troops: { ...b.troops }, res: { ...b.res } };
    const gh = Math.floor((now - (nb.grewAt || now)) / 3600e3);
    if (gh >= 1) {
      nb.grewAt = (nb.grewAt || now) + gh * 3600e3;
      if (!nb.owner) {
        if (Math.random() < 0.2 * gh) nb.lvl = Math.min(30, nb.lvl + 1);
        const inc = barbTroops(nb.tier, 1);
        Object.entries(inc).forEach(([k, v]) => { nb.troops[k] = (nb.troops[k] || 0) + Math.ceil(v * gh * 0.4); });
        const cap = nb.lvl * nb.tier * 3000;
        ['wood', 'iron', 'wheat'].forEach(k => { nb.res[k] = Math.min(cap, (nb.res[k] || 0) + 90 * nb.lvl * nb.tier * gh); });
        nb.wall = Math.min(20, Math.max(nb.wall, nb.tier * 2 + Math.floor(nb.lvl / 3)));
      }
      nb.loyalty = Math.min(100, (nb.loyalty ?? 100) + 2 * gh);
    }
    return nb;
  });
  g.incoming = [...(g.incoming || [])];
  if (now > g.createdAt + 25 * 60000 && g.incoming.length < 2) {
    g.barbs.forEach(b => {
      if (b.owner || now < b.atkAt) return;
      if (dist(b, HOME) > 14 || g.incoming.length >= 2) { b.atkAt = nextAtkAt(b.tier, now); return; }
      const sent = {}; Object.entries(b.troops).forEach(([k, v]) => { const n = Math.floor(v * 0.5); if (n > 0) sent[k] = n; });
      if (tSum(sent) < 5) { b.atkAt = nextAtkAt(b.tier, now); return; }
      Object.entries(sent).forEach(([k, v]) => { b.troops[k] -= v; });
      b.atkAt = nextAtkAt(b.tier, now);
      g.incoming.push({ id: 'in' + (g.cmdSeq++), from: b.id, name: b.name, troops: sent, arriveAt: now + travelMs(dist(b, HOME), sent) });
    });
  }

  // 6) ataques bárbaros chegando
  g.incoming = g.incoming.filter(inc => {
    if (now < inc.arriveAt) return true;
    const b = g.barbs.find(x => x.id === inc.from);
    const r = resolveBattle(inc.troops, g.troops, g.levels.wall, inc.troops.ram || 0, {}, g.bonuses);
    if (r.attWins) {
      const hide = hideAmount(g.levels.hideout);
      const carry = Object.entries(r.attSurv).reduce((s, [k, v]) => s + (TROOPS[k]?.carry || 0) * v, 0);
      let loot = { wood: 0, iron: 0, wheat: 0 }; let left = carry;
      ['wood', 'iron', 'wheat'].forEach(k => {
        const av = Math.max(0, g.resources[k] - hide); const take = Math.min(av, Math.floor(left / 3) + 1, left);
        loot[k] = Math.floor(Math.min(av, take)); g.resources[k] -= loot[k]; left -= loot[k];
      });
      g.troops = { spearman: 0, swordsman: 0, archer: 0, barbarian: 0, spy: 0, cavalry: 0, archerCav: 0, royalCav: 0, ram: 0, catapult: 0 };
      if (b) Object.entries(r.attSurv).forEach(([k, v]) => { b.troops[k] = (b.troops[k] || 0) + v; });
      rep({ type: 'def', ok: false, title: `⚠️ ${inc.name} saqueou sua aldeia!`, lines: [`Atacantes: ${tLines(inc.troops)}`, `Suas tropas foram derrotadas (poder ${fmt(r.defP)} vs ${fmt(r.attP)})`, `Roubaram: 🪵${fmt(loot.wood)} ⛏️${fmt(loot.iron)} 🌾${fmt(loot.wheat)}`, `🕳️ Esconderijo protegeu ${fmt(hideAmount(g.levels.hideout))} de cada recurso`] });
    } else {
      g.troops = { ...g.troops, ...r.defSurv };
      rep({ type: 'def', ok: true, title: `🛡️ Defendeu ataque de ${inc.name}!`, lines: [`Atacantes: ${tLines(inc.troops)} — todos eliminados`, `Poder: ${fmt(r.attP)} (eles) vs ${fmt(r.defP)} (você, muralha nv ${g.levels.wall})`, `Suas perdas: sobraram ${tLines(r.defSurv)}`] });
    }
    return false;
  });

  // 7) seus comandos (espionagem / ataque) — ida e volta
  g.commands = (g.commands || []).map(c => ({ ...c })).filter(c => {
    const b = g.barbs.find(x => x.id === c.targetId);
    if (c.phase === 'going' && now >= c.arriveAt) {
      if (!b) return false;
      if (c.kind === 'spy') {
        const lost = b.tier >= 3 && !b.owner ? Math.min(c.troops.spy, b.tier - 2) : 0;
        c.troops = { spy: c.troops.spy - lost };
        rep({ type: 'spy', ok: true, title: `🕵️ Espionagem: ${b.name}`, lines: [`Tropas: ${tLines(b.troops)}`, `Recursos: 🪵${fmt(b.res.wood)} ⛏️${fmt(b.res.iron)} 🌾${fmt(b.res.wheat)}`, `Muralha nv ${b.wall} · Lealdade ${Math.round(b.loyalty)}%`, lost ? `Perdeu ${lost} espião(ões)` : 'Nenhuma perda'] });
        if (c.troops.spy <= 0) return false;
        c.phase = 'returning'; c.returnAt = now + (c.arriveAt - c.startAt); return true;
      }
      // ataque
      const r = resolveBattle(c.troops, b.owner ? {} : b.troops, b.owner ? 0 : b.wall, c.troops.ram || 0, g.bonuses, {});
      const lines = [`Seu exército: ${tLines(c.troops)}`, `Defesa: ${tLines(b.troops)} + muralha nv ${b.wall}`, `Poder: ${fmt(r.attP)} vs ${fmt(r.defP)}`];
      if (r.attWins) {
        b.troops = {}; b.wall = r.wallEff;
        const cats = c.troops.catapult || 0;
        if (cats > 0) { b.lvl = Math.max(1, b.lvl - Math.max(1, Math.floor(cats / 15))); lines.push(`💣 Catapultas reduziram a aldeia para nível ${b.lvl}`); }
        const carry = Object.entries(r.attSurv).reduce((s, [k, v]) => s + (TROOPS[k]?.carry || 0) * v, 0);
        let loot = { wood: 0, iron: 0, wheat: 0 }; let left = carry;
        ['wood', 'iron', 'wheat'].forEach(k => { const take = Math.min(b.res[k] || 0, Math.ceil(left / 3), left); loot[k] = Math.floor(take); b.res[k] -= loot[k]; left -= loot[k]; });
        c.loot = loot;
        lines.push(`🎒 Saque: 🪵${fmt(loot.wood)} ⛏️${fmt(loot.iron)} 🌾${fmt(loot.wheat)} (capacidade ${fmt(carry)})`);
        if (c.priests > 0 && !b.owner) {
          let drop = 0; for (let i = 0; i < c.priests; i++) drop += 20 + Math.random() * 15;
          b.loyalty -= drop; lines.push(`✝️ ${c.priests} sacerdote(s): lealdade -${Math.round(drop)}% → ${Math.max(0, Math.round(b.loyalty))}%`);
          if (b.loyalty <= 0) {
            b.owner = 'player'; b.loyalty = 25; g.conquered = (g.conquered || 0) + 1; c.priests = 0;
            lines.push(`👑 ALDEIA CONQUISTADA! Colônia sua no mapa (+10% produção). Total: ${g.conquered}`);
            rep({ type: 'conq', ok: true, title: `👑 Conquistou ${b.name}!`, lines: [...lines] });
          }
        }
        c.troops = r.attSurv;
        rep({ type: 'atk', ok: true, title: `⚔️ Vitória contra ${b.name}!`, lines });
        if (tSum(c.troops) + c.priests <= 0) return false;
        c.phase = 'returning'; c.returnAt = now + (c.arriveAt - c.startAt); return true;
      } else {
        Object.entries(r.defSurv).forEach(([k, v]) => { b.troops[k] = v; });
        rep({ type: 'atk', ok: false, title: `☠️ Derrota contra ${b.name}`, lines: [...lines, 'Todo o exército enviado foi perdido.'] });
        return false;
      }
    }
    if (c.phase === 'returning' && now >= c.returnAt) {
      Object.entries(c.troops).forEach(([k, v]) => { g.troops[k] = (g.troops[k] || 0) + v; });
      g.priests += c.priests || 0;
      if (c.loot) { addRes('wood', c.loot.wood); addRes('iron', c.loot.iron); addRes('wheat', c.loot.wheat); }
      return false;
    }
    return true;
  });

  return g;
}

/* ===== população (inclui filas e comandos) ===== */
function popUsedOf(g) {
  let p = 0;
  Object.entries(g.troops).forEach(([k, v]) => { p += (TROOPS[k]?.pop || 0) * v; });
  g.commands.forEach(c => { Object.entries(c.troops).forEach(([k, v]) => { p += (TROOPS[k]?.pop || 0) * v; }); p += (c.priests || 0) * 50; });
  Object.values(g.recruitQ).forEach(q => q.forEach(it => { p += (TROOPS[it.tid]?.pop || 0) * it.qty; }));
  p += g.priests * 50 + (g.priestQ ? g.priestQ.qty * 50 : 0);
  return p;
}

/* ===== componentes base ===== */
function Sprite({ img, emoji, size }) {
  const [err, setErr] = useState(false);
  if (err || !img) return <div style={{ fontSize: size, lineHeight: 1, filter: 'drop-shadow(0 5px 6px rgba(0,0,0,.45))' }}>{emoji}</div>;
  return <img src={img} alt="" onError={() => setErr(true)} style={{ width: size * 1.55, height: 'auto', display: 'block', filter: 'drop-shadow(0 6px 7px rgba(0,0,0,.5))' }} />;
}
function NavIcon({ img, emoji }) {
  const [err, setErr] = useState(false);
  if (err || !img) return <div style={{ fontSize: 17, lineHeight: 1 }}>{emoji}</div>;
  return <img src={img} alt="" onError={() => setErr(true)} style={{ height: 20, display: 'block', margin: '0 auto', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.5))' }} />;
}
function Life({ x, y, e, anim, size, z, origin }) {
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', zIndex: z, pointerEvents: 'none' }}>
      <div style={{ fontSize: size, lineHeight: 1, animation: anim, transformOrigin: origin || 'center', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.45))' }}>{e}</div>
    </div>
  );
}
function Panel({ title, children, tone }) {
  return (
    <div style={{ width: '100%', background: C.parch, border: `2px solid ${tone || C.wood}`, borderRadius: 8, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px #efe2c2, 0 3px 6px rgba(0,0,0,.25)' }}>
      <div style={{ background: `linear-gradient(${tone ? tone : C.woodL}, ${C.wood})`, color: C.gold, fontSize: 12, fontWeight: 700, padding: '7px 11px', textShadow: '0 1px 2px rgba(0,0,0,.6)', letterSpacing: .5 }}>{title}</div>
      <div style={{ padding: '7px 11px' }}>{children}</div>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 12, borderBottom: '1px dotted rgba(0,0,0,.12)' }}>
      <span style={{ color: C.w2 }}>{k}</span><b style={{ color: C.w1, textAlign: 'right' }}>{v}</b>
    </div>
  );
}
function Bar({ pct, color }) {
  return (
    <div style={{ height: 7, background: 'rgba(0,0,0,.18)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0,0,0,.2)' }}>
      <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', background: color || C.green, transition: 'width 1s linear' }} />
    </div>
  );
}
const btnMini = { background: 'linear-gradient(#fffdf6,#efe4c8)', border: `1px solid ${C.border}`, borderRadius: 5, padding: '6px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: C.w1 };
const btnGreen = { background: `linear-gradient(#5a8a3a,${C.green})`, color: '#fff', border: '1px solid #7ab85a', borderRadius: 8, fontWeight: 700, cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,.4)' };
const btnRed = { background: `linear-gradient(#a84a3a,${C.red})`, color: '#fff', border: '1px solid #c87a6a', borderRadius: 8, fontWeight: 700, cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,.4)' };
const inp = { width: '100%', padding: '9px 11px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif', color: C.w1, background: '#fffdf6' };

/* ===== APP ===== */
export default function App() {
  const [g, setG] = useState(loadState);
  const [screen, setScreen] = useState('village');
  const [msg, setMsg] = useState('');
  const [hover, setHover] = useState(null);
  const [mapC, setMapC] = useState({ x: 50, y: 50 });
  const [sel, setSel] = useState(null);

  useEffect(() => {
    setG(prev => advance(prev, Date.now()));
    const t = setInterval(() => setG(prev => advance(prev, Date.now())), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { try { localStorage.setItem('rc_save', JSON.stringify(g)); } catch (e) { } }, [g]);

  const now = Date.now();
  const L = g.levels, R = g.resources;
  const points = vPoints(g);
  const colBon = 1 + (g.conquered || 0) * 0.10;
  const rates = { wood: Math.floor(production(L.woodcutter) * 1.2 * colBon), iron: Math.floor(production(L.mine) * 1.2 * colBon), wheat: Math.floor(production(L.farm) * 1.2 * colBon) };
  const popUsed = popUsedOf(g), popMax = maxPop(L.farm), whCap = warehouseCap(L.warehouse);
  const claimable = (g.missions || []).filter(m => !m.claimed).length;

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2600); };
  const go = (s) => { setScreen(s); setHover(null); };
  const shared = { g, setG, L, R, go, flash, points, rates, popUsed, popMax, whCap, now, mapC, setMapC, sel, setSel };

  const NAV = [
    ['village', IMG.house1, '🏰', 'Aldeia'], ['mapa', null, '🗺️', 'Mapa'], ['missions', null, '🎯', 'Missões'],
    ['recrutar', IMG.barracks, '⚔️', 'Recrutar'], ['command', null, '🛡️', 'Tropas'], ['reports', null, '📜', 'Relatórios'],
    ['ranking', null, '🏆', 'Ranking'], ['tribo', null, '⚜️', 'Tribo'], ['amigos', null, '👥', 'Amigos'], ['perfil', null, '👤', 'Perfil']
  ];
  const badge = (id) => id === 'missions' && claimable > 0 ? claimable : id === 'village' && g.incoming.length > 0 ? '⚠️' : null;

  return (
    <div style={{ background: `linear-gradient(${C.parch}, ${C.parchD})`, minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', fontFamily: 'Georgia, "Times New Roman", serif', color: C.w1 }}>
      <style>{`
        * { box-sizing: border-box; } body { margin: 0; }
        @keyframes rcBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes rcBob2 { 0%,100%{transform:translateY(-2px)} 50%{transform:translateY(1px)} }
        @keyframes rcTrot { 0%,100%{transform:translateX(-9px)} 50%{transform:translateX(9px)} }
        @keyframes rcSway { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(12deg)} }
        @keyframes rcSmoke { 0%{opacity:.55;transform:translateY(0) scale(.7)} 100%{opacity:0;transform:translateY(-26px) scale(1.6)} }
        @keyframes rcSpark { 0%,100%{opacity:.12} 50%{opacity:1} }
        @keyframes rcFlap { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
        @keyframes rcFly { 0%{transform:translate(0,0)} 100%{transform:translate(340px,-28px)} }
        @keyframes rcPulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes rcHammer { 0%,100%{transform:rotate(-18deg)} 50%{transform:rotate(14deg)} }
      `}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(#3a2a18, #241708)`, borderBottom: `3px solid ${C.woodL}`, boxShadow: 'inset 0 2px 0 rgba(255,255,255,.08), 0 3px 8px rgba(0,0,0,.4)', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: C.gold, whiteSpace: 'nowrap', textShadow: '0 2px 3px rgba(0,0,0,.7)', letterSpacing: 1 }}>⚔️ REALM CONQUEST</div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: C.green, padding: '1px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,.25)' }}>{VERSION}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['🪵', R.wood, rates.wood], ['⛏️', R.iron, rates.iron], ['🌾', R.wheat, rates.wheat]].map(([ic, val, rt], i) => (
            <div key={i} style={{ background: 'linear-gradient(#f4ead0,#e2d0a8)', border: `2px solid ${C.darkGold}`, borderRadius: 14, padding: '2px 10px', textAlign: 'center', boxShadow: 'inset 0 1px 0 #fff, 0 2px 3px rgba(0,0,0,.4)', minWidth: 78 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.w1, whiteSpace: 'nowrap' }}>{ic} {fmt(val)}</div>
              <div style={{ fontSize: 9, color: C.green, fontWeight: 700 }}>+{fmt(rt)}/h</div>
            </div>
          ))}
          <div style={{ background: 'linear-gradient(#f4ead0,#e2d0a8)', border: `2px solid ${C.darkGold}`, borderRadius: 14, padding: '2px 10px', textAlign: 'center', boxShadow: 'inset 0 1px 0 #fff, 0 2px 3px rgba(0,0,0,.4)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.w1, whiteSpace: 'nowrap' }}>👥 {fmt(popUsed)}/{fmt(popMax)}</div>
            <div style={{ fontSize: 9, color: C.w2, fontWeight: 700 }}>🏅 {fmt(points)} pts</div>
          </div>
          <button style={{ background: 'linear-gradient(#8a5aaa,#5a2a7a)', color: '#fff', border: '1px solid #b08ad0', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 11, textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>👑 VIP</button>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background: C.woodD, borderBottom: `3px solid ${C.woodL}`, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', boxShadow: '0 3px 6px rgba(0,0,0,.35)' }}>
        {NAV.map(([id, img, emoji, label]) => {
          const active = screen === id || (id === 'village' && screen.startsWith('building_')) || (id === 'mapa' && screen.startsWith('attack_'));
          const bd = badge(id);
          return (
            <button key={id} onClick={() => go(id)} style={{ position: 'relative', flex: '1 1 auto', minWidth: 62, background: active ? `linear-gradient(${C.parch},${C.parchD})` : 'transparent', color: active ? C.w1 : C.gold, border: 'none', borderTop: active ? `3px solid ${C.gold}` : '3px solid transparent', borderRight: '1px solid rgba(0,0,0,.35)', padding: '7px 4px 6px', cursor: 'pointer', fontSize: 10, fontWeight: 700, textShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,.6)' }}>
              <NavIcon img={img} emoji={emoji} />
              <div style={{ marginTop: 2 }}>{label}</div>
              {bd && <span style={{ position: 'absolute', top: 3, right: 6, background: C.red, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '0 5px', border: '1px solid #fff', animation: 'rcPulse 1.2s infinite' }}>{bd}</span>}
            </button>
          );
        })}
      </div>

      {screen === 'village' && <Village {...shared} hover={hover} setHover={setHover} />}
      {screen.startsWith('building_') && <BuildingPage buildingId={screen.replace('building_', '')} {...shared} />}
      {screen.startsWith('attack_') && <AttackPage barbId={screen.replace('attack_', '')} {...shared} />}
      {screen === 'mapa' && <MapPage {...shared} />}
      {screen === 'missions' && <MissionsPage {...shared} />}
      {screen === 'command' && <TroopsPage {...shared} />}
      {screen === 'recrutar' && <RecruitPage {...shared} />}
      {screen === 'reports' && <ReportsPage {...shared} />}
      {screen === 'perfil' && <ProfilePage {...shared} />}
      {['ranking', 'tribo', 'amigos'].includes(screen) && (
        <div style={{ padding: 40, textAlign: 'center', color: C.w2 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>{(NAV.find(n => n[0] === screen) || [])[2]}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.w1, marginBottom: 6 }}>{(NAV.find(n => n[0] === screen) || [])[3]}</div>
          <div style={{ fontSize: 13 }}>Chega na V14 (online com contas): ranking real, tribos com chat e amigos.</div>
        </div>
      )}

      {msg && <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#241708', color: C.gold, padding: '10px 16px', borderRadius: 8, border: `2px solid ${C.gold}`, zIndex: 9999, boxShadow: '0 4px 10px rgba(0,0,0,.5)', maxWidth: '92vw' }}>{msg}</div>}
    </div>
  );
}

/* ===== ALDEIA ===== */
function Village(p) {
  const { L, R, g, go, hover, setHover, points, rates, popUsed, popMax, whCap, now } = p;
  const layout = [
    ['mainBuilding', 50, 27, 100],
    ['smithy', 29, 33, 62], ['church', 71, 33, 60],
    ['woodcutter', 16, 46, 54], ['barracks', 35, 45, 64], ['stable', 65, 45, 64], ['mine', 84, 46, 54],
    ['market', 21, 61, 56], ['warehouse', 37, 63, 58], ['hideout', 63, 63, 52], ['workshop', 79, 60, 66],
    ['farm', 50, 66, 56]
  ];
  const B = {}; layout.forEach(([id, x, y, s]) => { B[id] = { x, y, s }; });
  const gz = (y) => 820 + Math.round(y);
  const W = { left: 9, right: 91, top: 14, bottom: 76, gateL: 44, gateR: 56 };
  const wallH = Math.min(26, 14 + (L.wall || 0));
  const inQ = (bid) => g.buildQ.find(q => q.bid === bid);

  const life = [
    { x: B.mainBuilding.x + 4, y: B.mainBuilding.y - 12, e: '🚩', anim: 'rcSway 1.6s ease-in-out infinite', size: 18, z: 1600, origin: 'bottom left' },
    { x: B.smithy.x + 3, y: B.smithy.y - 7, e: '💨', anim: 'rcSmoke 2.4s ease-out infinite', size: 15, z: 1500 },
    { x: B.smithy.x - 1, y: B.smithy.y + 3, e: '✨', anim: 'rcSpark 0.9s ease-in-out infinite', size: 12, z: 1500 },
    { x: B.barracks.x - 4, y: B.barracks.y + 7, e: '💂', anim: 'rcBob 0.7s ease-in-out infinite', size: 19, z: gz(B.barracks.y + 7) },
    { x: B.barracks.x + 4, y: B.barracks.y + 7, e: '🤺', anim: 'rcBob 0.7s ease-in-out infinite 0.35s', size: 19, z: gz(B.barracks.y + 7) },
    { x: B.stable.x + 1, y: B.stable.y + 7, e: '🐎', anim: 'rcTrot 1.5s ease-in-out infinite', size: 22, z: gz(B.stable.y + 7) },
    { x: B.workshop.x - 4, y: B.workshop.y + 7, e: '👷', anim: 'rcBob 0.55s ease-in-out infinite', size: 19, z: gz(B.workshop.y + 7) },
    { x: B.farm.x - 6, y: B.farm.y + 6, e: '🧑‍🌾', anim: 'rcBob 0.9s ease-in-out infinite', size: 19, z: gz(B.farm.y + 6) },
    { x: B.woodcutter.x - 2, y: B.woodcutter.y + 7, e: '🪓', anim: 'rcBob 0.6s ease-in-out infinite', size: 15, z: gz(B.woodcutter.y + 7) },
    { x: B.mine.x + 2, y: B.mine.y + 7, e: '⛏️', anim: 'rcBob 0.65s ease-in-out infinite', size: 15, z: gz(B.mine.y + 7) },
    { x: 50, y: W.bottom + 3.5, e: '💂', anim: 'rcBob2 1.4s ease-in-out infinite', size: 17, z: 1650 },
    { x: 14, y: 8, e: '🐦', anim: 'rcFly 10s linear infinite', size: 13, z: 1550 }
  ];
  const trees = [[5, 10, 26], [95, 9, 24], [4, 40, 22], [96, 42, 24], [5, 88, 26], [95, 88, 26], [22, 86, 22], [78, 87, 23], [35, 7, 20], [65, 7, 21], [12, 62, 20, '🌳'], [88, 25, 20, '🌳']];
  const plaza = [500, 400];
  const px = (x) => x * 10, py = (y) => y * 7.5;
  const branch = (bid) => { const b = B[bid]; const bx = px(b.x), by = py(b.y + 5); const mx = (plaza[0] + bx) / 2, my = (plaza[1] + by) / 2 - 18; return `M ${plaza[0]} ${plaza[1]} Q ${mx} ${my} ${bx} ${by}`; };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 138px)', minHeight: 500 }}>
      <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden', position: 'relative', background: ['repeating-linear-gradient(100deg, rgba(255,255,255,.045) 0 34px, rgba(0,0,0,.035) 34px 68px)', 'radial-gradient(ellipse at 50% 20%, #7cba50 0%, #63a23c 55%, #4e872c 100%)'].join(',') }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .5, background: 'radial-gradient(rgba(0,0,0,.07) 1px, transparent 1.6px)', backgroundSize: '14px 14px' }} />
        {g.incoming.length > 0 && (
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: 'linear-gradient(#a83a2a,#7a1a0a)', color: '#fff', padding: '7px 14px', borderRadius: 9, border: '2px solid #ffb0a0', fontWeight: 700, fontSize: 13, animation: 'rcPulse 1s infinite', boxShadow: '0 4px 10px rgba(0,0,0,.5)' }}>
            ⚠️ ATAQUE A CAMINHO! {g.incoming[0].name} chega em {fmtT(g.incoming[0].arriveAt - now)}
          </div>
        )}
        <svg viewBox="0 0 1000 750" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d={`M 500 760 L 500 ${py(W.bottom)}`} stroke={C.dirtD} strokeWidth="46" fill="none" strokeLinecap="round" />
          <path d={`M 500 760 L 500 ${py(W.bottom)}`} stroke={C.dirt} strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d={`M 500 ${py(W.bottom)} Q 500 ${py(61)} ${plaza[0]} ${plaza[1]}`} stroke={C.dirt} strokeWidth="30" fill="none" strokeLinecap="round" />
          {layout.map(([bid]) => <path key={bid + 'o'} d={branch(bid)} stroke={C.dirt} strokeWidth="20" fill="none" strokeLinecap="round" opacity=".95" />)}
          {layout.map(([bid]) => <path key={bid + 'i'} d={branch(bid)} stroke={C.dirtL} strokeWidth="9" fill="none" strokeLinecap="round" opacity=".9" />)}
          <ellipse cx={plaza[0]} cy={plaza[1]} rx="80" ry="34" fill={C.dirt} stroke={C.dirtD} strokeWidth="5" />
          {layout.map(([bid, x, y, s]) => (
            <ellipse key={bid + 'p'} cx={px(x)} cy={py(y) + s * 0.42} rx={s * 0.85} ry={s * 0.3} fill={C.dirt} stroke={C.dirtD} strokeWidth="4" opacity=".95" />
          ))}
        </svg>
        {[[40.5, 70, -4], [59.5, 70, 4]].map(([x, y, rot], i) => (
          <div key={`wf${i}`} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 90, height: 54, transform: `translate(-50%,-50%) rotate(${rot}deg)`, background: 'repeating-linear-gradient(0deg, #d8b84e 0 5px, #c2a238 5px 10px)', border: '3px solid #8a6a28', borderRadius: 6, boxShadow: 'inset 0 0 10px rgba(0,0,0,.25), 0 3px 5px rgba(0,0,0,.3)', zIndex: 560 }} />
        ))}
        <WallSeg style={{ left: `${W.left}%`, right: `${100 - W.right}%`, top: `${W.top}%`, height: wallH }} horiz />
        <WallSeg style={{ left: `${W.left}%`, top: `${W.top}%`, bottom: `${100 - W.bottom}%`, width: wallH - 3 }} />
        <WallSeg style={{ right: `${100 - W.right}%`, top: `${W.top}%`, bottom: `${100 - W.bottom}%`, width: wallH - 3 }} />
        <WallSeg style={{ left: `${W.left}%`, width: `${W.gateL - W.left}%`, top: `${W.bottom}%`, height: wallH }} horiz />
        <WallSeg style={{ left: `${W.gateR}%`, width: `${W.right - W.gateR}%`, top: `${W.bottom}%`, height: wallH }} horiz />
        <div style={{ position: 'absolute', left: '50%', top: `${W.bottom}%`, transform: 'translate(-50%,-28%)', zIndex: 1620, display: 'flex', gap: 3 }}>
          {[0, 1].map(i => <div key={i} style={{ width: 26, height: 34, background: 'repeating-linear-gradient(90deg,#7a5630 0 4px,#64431f 4px 8px)', border: '2px solid #3a2410', borderRadius: i === 0 ? '4px 0 0 4px' : '0 4px 4px 0', boxShadow: '0 3px 5px rgba(0,0,0,.4)' }} />)}
        </div>
        {[[W.left, W.top], [W.right, W.top], [W.left, W.bottom], [W.right, W.bottom]].map(([x, y], i) => (
          <div key={`tw${i}`} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-72%)', zIndex: 1610, filter: 'drop-shadow(0 5px 6px rgba(0,0,0,.5))' }}>
            <img src={IMG.towerStone} alt="" style={{ width: 54, display: 'block' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
        ))}
        <div onClick={() => go('building_wall')} style={{ position: 'absolute', left: `${W.gateR + 4}%`, top: `${W.bottom + 4}%`, transform: 'translate(-50%,-50%)', zIndex: 1640, background: 'linear-gradient(#f4ead0,#e0cda2)', border: `2px solid ${C.darkGold}`, borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: C.w1, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,.4)' }}>🧱 Muralha nv {L.wall || 0}</div>
        {trees.map(([x, y, s, e], i) => (
          <div key={`t${i}`} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', fontSize: s, zIndex: y > W.bottom ? 1700 : 420, filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.4))', pointerEvents: 'none' }}>{e || '🌲'}</div>
        ))}
        {layout.map(([bid, x, y, size]) => {
          const b = BUILDINGS[bid]; const lvl = L[bid] || 0, isH = hover === bid, below = y < 40, q = inQ(bid);
          return (
            <div key={bid} onClick={() => go(`building_${bid}`)} onMouseEnter={() => setHover(bid)} onMouseLeave={() => setHover(null)}
              style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) scale(${isH ? 1.09 : 1})`, transition: 'transform .15s', cursor: 'pointer', zIndex: isH ? 1200 : 600 + Math.round(y), opacity: lvl === 0 && !q ? 0.55 : 1 }}>
              <Sprite img={b.img} emoji={b.emoji} size={size} />
              <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(#2a1c0c,#120a02)', color: C.gold, minWidth: 27, height: 27, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, border: `2px solid ${C.gold}`, padding: '0 5px', boxShadow: '0 2px 4px rgba(0,0,0,.5)' }}>{lvl}</div>
              <div style={{ position: 'absolute', bottom: 2, right: -3, background: 'linear-gradient(#fff,#efe4c8)', borderRadius: '50%', width: 23, height: 23, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: `2px solid ${C.darkGold}`, boxShadow: '0 2px 3px rgba(0,0,0,.4)' }}>{b.emoji}</div>
              {q && (
                <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', zIndex: 1900, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, animation: 'rcHammer .6s ease-in-out infinite', display: 'inline-block' }}>🔨</div>
                  {q.endsAt && <div style={{ fontSize: 9, fontWeight: 700, background: '#241708', color: C.gold, borderRadius: 6, padding: '1px 6px', border: `1px solid ${C.gold}` }}>{fmtT(q.endsAt - now)}</div>}
                </div>
              )}
              {isH && (
                <div style={{ position: 'absolute', [below ? 'top' : 'bottom']: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(#2f2010,#1a1006)', color: '#fff', padding: '9px 11px', borderRadius: 8, border: `2px solid ${C.gold}`, width: 172, textAlign: 'center', zIndex: 2000, boxShadow: '0 5px 12px rgba(0,0,0,.5)' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3, color: C.gold }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: '#e8d8ae', marginBottom: 4 }}>Nível {lvl}/{b.max}</div>
                  <div style={{ fontSize: 10, color: '#ccbbaa', marginBottom: 6 }}>{b.desc}</div>
                  <div style={{ fontSize: 9, color: C.gold, fontWeight: 700 }}>Clique para melhorar ▸</div>
                </div>
              )}
            </div>
          );
        })}
        {life.map((l, i) => <Life key={`l${i}`} {...l} />)}
      </div>

      {/* SIDEBAR */}
      <div style={{ width: 300, flexShrink: 0, background: `linear-gradient(${C.parch}, ${C.parchD})`, borderLeft: `4px solid ${C.wood}`, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {g.incoming.length > 0 && (
          <Panel title="⚠️ ATAQUES CHEGANDO" tone="#8a2a2a">
            {g.incoming.map(inc => (
              <div key={inc.id} style={{ marginBottom: 6 }}>
                <Row k={inc.name} v={fmtT(inc.arriveAt - now)} />
                <div style={{ fontSize: 10, color: C.w2 }}>{tLines(inc.troops)}</div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>Suas tropas em casa defendem automaticamente!</div>
          </Panel>
        )}
        <Panel title="🔨 Construções">
          {g.buildQ.length === 0 && <div style={{ fontSize: 11, color: C.w3 }}>Nenhuma obra. Clique num prédio pra melhorar.</div>}
          {g.buildQ.map((q, i) => (
            <div key={i} style={{ marginBottom: 7 }}>
              <Row k={`${BUILDINGS[q.bid].emoji} ${BUILDINGS[q.bid].name} → nv ${q.lvl}`} v={q.endsAt ? fmtT(q.endsAt - now) : `fila (${fmtT(q.dur)})`} />
              {q.endsAt && <Bar pct={100 - ((q.endsAt - now) / q.dur) * 100} />}
            </div>
          ))}
          <div style={{ fontSize: 10, color: C.w3, marginTop: 4 }}>Fila: {g.buildQ.length}/{g.isVip ? 5 : 2} {g.isVip ? '(VIP)' : ''}</div>
        </Panel>
        <Panel title="⚔️ Recrutando">
          {Object.entries(g.recruitQ).every(([, q]) => q.length === 0) && !g.priestQ && <div style={{ fontSize: 11, color: C.w3 }}>Nenhuma tropa em treino.</div>}
          {Object.entries(g.recruitQ).map(([by, q]) => q.map((it, i) => (
            <div key={by + i} style={{ marginBottom: 6 }}>
              <Row k={`${TROOPS[it.tid].icon} ${it.qty}x ${TROOPS[it.tid].name}`} v={it.nextAt ? fmtT(it.nextAt - now) : 'na fila'} />
              {it.nextAt && <Bar pct={100 - ((it.nextAt - now) / it.unitMs) * 100} color="#8a6a2a" />}
            </div>
          )))}
          {g.priestQ && <Row k={`✝️ ${g.priestQ.qty}x Sacerdote`} v={fmtT(g.priestQ.nextAt - now)} />}
        </Panel>
        {g.commands.length > 0 && (
          <Panel title="🏹 Seus Comandos">
            {g.commands.map(c => {
              const b = g.barbs.find(x => x.id === c.targetId);
              return <Row key={c.id} k={`${c.kind === 'spy' ? '🕵️' : '⚔️'} ${c.phase === 'going' ? '→' : '←'} ${b ? b.name : '?'}`} v={fmtT((c.phase === 'going' ? c.arriveAt : c.returnAt) - now)} />;
            })}
          </Panel>
        )}
        <Panel title="📊 Resumo">
          <Row k="🏅 Pontos" v={fmt(points)} />
          <Row k="👥 População" v={`${fmt(popUsed)} / ${fmt(popMax)}`} />
          <Row k="📦 Armazém (por rec.)" v={fmt(whCap)} />
          <Row k="🕳️ Protegido" v={`${fmt(hideAmount(L.hideout || 0))}/rec.`} />
          <Row k="👑 Colônias" v={`${g.conquered} (+${g.conquered * 10}% prod)`} />
        </Panel>
      </div>
    </div>
  );
}

function WallSeg({ style, horiz }) {
  return (
    <div style={{
      position: 'absolute', zIndex: 1600, borderRadius: 4,
      background: horiz ? 'repeating-linear-gradient(90deg, #97744c 0 6px, #7a5630 6px 12px)' : 'repeating-linear-gradient(0deg, #97744c 0 6px, #7a5630 6px 12px)',
      borderTop: horiz ? '2px solid #b8905e' : '1px solid #b8905e', borderBottom: horiz ? '4px solid #4a3116' : '1px solid #4a3116',
      borderLeft: horiz ? 'none' : '2px solid #b8905e', borderRight: horiz ? 'none' : '4px solid #4a3116',
      boxShadow: '0 5px 8px rgba(0,0,0,.35)', ...style
    }} />
  );
}

/* ===== PÁGINA DO PRÉDIO ===== */
function BuildingPage({ buildingId, L, R, go, setG, flash, g, now, popUsed, popMax }) {
  const b = BUILDINGS[buildingId]; if (!b) return null;
  const queuedForThis = g.buildQ.filter(q => q.bid === buildingId).length;
  const lvl = (L[buildingId] || 0) + queuedForThis;
  const c = cost(b, lvl + 1);
  const canBuild = lvl < b.max;
  const canAfford = R.wood >= c.w && R.iron >= c.i && R.wheat >= c.h;
  const slots = g.isVip ? 5 : 2;
  const slotFree = g.buildQ.length < slots;
  const miss = Object.entries(PREREQ[buildingId] || {}).filter(([rb, rl]) => (L[rb] || 0) < rl);
  const dur = buildMs(buildingId, lvl + 1, L.mainBuilding);

  const upgrade = () => {
    if (!canBuild) { flash('❌ Nível máximo'); return; }
    if (miss.length && (L[buildingId] || 0) === 0) { flash('❌ Falta pré-requisito'); return; }
    if (!slotFree) { flash(`❌ Fila cheia (${slots} obras)`); return; }
    if (!canAfford) { flash('❌ Recursos insuficientes'); return; }
    setG(prev => ({
      ...prev,
      resources: { wood: prev.resources.wood - c.w, iron: prev.resources.iron - c.i, wheat: prev.resources.wheat - c.h },
      buildQ: [...prev.buildQ, { bid: buildingId, lvl: lvl + 1, dur, cost: c, endsAt: prev.buildQ.length === 0 ? Date.now() + dur : null }]
    }));
    flash(`🔨 ${b.name} nv ${lvl + 1} na fila (${fmtT(dur)})`);
  };
  const cancel = (idx) => {
    setG(prev => {
      const q = [...prev.buildQ]; const it = q[idx]; q.splice(idx, 1);
      if (idx === 0 && q[0]) q[0].endsAt = Date.now() + q[0].dur;
      return { ...prev, buildQ: q, resources: { wood: prev.resources.wood + it.cost.w, iron: prev.resources.iron + it.cost.i, wheat: prev.resources.wheat + it.cost.h } };
    });
    flash('↩️ Obra cancelada, recursos devolvidos');
  };

  return (
    <div style={{ padding: 20, maxWidth: 680, margin: '0 auto' }}>
      <button onClick={() => go('village')} style={{ ...btnMini, padding: '8px 16px', marginBottom: 16 }}>← Voltar à aldeia</button>
      <div style={{ background: C.parch, border: `3px solid ${C.wood}`, borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: 'inset 0 0 0 2px #efe2c2, 0 5px 16px rgba(0,0,0,.25)' }}>
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><Sprite img={b.img} emoji={b.emoji} size={92} /></div>
        <h1 style={{ fontSize: 26, margin: '0 0 6px', color: C.w1 }}>{b.name}</h1>
        <p style={{ fontSize: 13, color: C.w2, margin: '0 0 8px' }}>{b.desc}</p>
        {buildingId === 'hideout' && <p style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>🛡️ Protege {fmt(hideAmount(L.hideout || 0))} de cada recurso</p>}
        {buildingId === 'wall' && <p style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>🛡️ Defesa atual: +{(L.wall || 0) * 5}% (máx +100%)</p>}
        {miss.length > 0 && (L[buildingId] || 0) === 0 && (
          <div style={{ background: 'rgba(138,42,42,.12)', border: '1px solid rgba(138,42,42,.3)', borderRadius: 8, padding: 10, margin: '8px 0', fontSize: 12, color: C.red, fontWeight: 700 }}>
            🔒 Requisitos: {miss.map(([rb, rl]) => `${BUILDINGS[rb].name} nv ${rl}`).join(' · ')}
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, margin: '10px 0 16px', alignItems: 'center', justifyContent: 'center' }}>
          <div><div style={{ fontSize: 12, color: C.w2 }}>Nível {queuedForThis > 0 ? '(com fila)' : 'atual'}</div><div style={{ fontSize: 26, fontWeight: 700, color: C.darkGold }}>{lvl}</div></div>
          <div style={{ fontSize: 26, color: C.border }}>→</div>
          <div><div style={{ fontSize: 12, color: C.w2 }}>Próximo</div><div style={{ fontSize: 26, fontWeight: 700, color: canBuild ? C.green : '#aaa' }}>{canBuild ? lvl + 1 : 'Máx'}</div></div>
        </div>
        {canBuild ? (<>
          <div style={{ background: canAfford ? 'rgba(61,106,34,.12)' : 'rgba(138,42,42,.12)', borderRadius: 8, padding: 12, marginBottom: 12, border: '1px solid rgba(0,0,0,.12)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>Custo · ⏱️ {fmtT(dur)}</div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
              <span style={{ color: R.wood >= c.w ? C.green : C.red }}>🪵 {fmt(c.w)}</span>
              <span style={{ color: R.iron >= c.i ? C.green : C.red }}>⛏️ {fmt(c.i)}</span>
              <span style={{ color: R.wheat >= c.h ? C.green : C.red }}>🌾 {fmt(c.h)}</span>
            </div>
          </div>
          <button onClick={upgrade} disabled={!canAfford || !slotFree || (miss.length > 0 && (L[buildingId] || 0) === 0)} style={{ ...btnGreen, width: '100%', padding: 13, fontSize: 15, opacity: (!canAfford || !slotFree) ? .55 : 1 }}>
            {!slotFree ? `⏳ Fila cheia (${g.buildQ.length}/${slots})` : canAfford ? `🔨 Construir (${fmtT(dur)})` : '❌ Recursos insuficientes'}
          </button>
        </>) : <div style={{ padding: 12, color: C.w2, fontWeight: 700 }}>✅ Nível máximo atingido</div>}
        {g.buildQ.length > 0 && (
          <div style={{ marginTop: 14, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Fila de construção:</div>
            {g.buildQ.map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '4px 0', borderBottom: '1px dotted rgba(0,0,0,.15)' }}>
                <span style={{ flex: 1 }}>{BUILDINGS[q.bid].emoji} {BUILDINGS[q.bid].name} → nv {q.lvl}</span>
                <b>{q.endsAt ? fmtT(q.endsAt - now) : fmtT(q.dur)}</b>
                <button onClick={() => cancel(i)} style={{ ...btnMini, color: C.red, padding: '3px 7px' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
      {buildingId === 'smithy' && (L.smithy || 0) >= 1 && <SmithyExtra g={g} setG={setG} L={L} R={R} flash={flash} />}
      {buildingId === 'church' && <ChurchExtra g={g} setG={setG} L={L} R={R} flash={flash} now={now} popUsed={popUsed} popMax={popMax} />}
    </div>
  );
}

function SmithyExtra({ g, setG, L, R, flash }) {
  const pay = (total) => {
    const w = Math.floor(total * 0.4), i = Math.floor(total * 0.4), h = total - w - i;
    if (R.wood < w || R.iron < i || R.wheat < h) return null;
    return { w, i, h };
  };
  const research = (tid) => {
    const t = TROOPS[tid];
    if ((L.smithy || 0) < t.res.s) { flash(`❌ Precisa Ferreiro nv ${t.res.s}`); return; }
    const p = pay(t.res.c); if (!p) { flash('❌ Recursos insuficientes'); return; }
    setG(prev => ({ ...prev, resources: { wood: prev.resources.wood - p.w, iron: prev.resources.iron - p.i, wheat: prev.resources.wheat - p.h }, research: { ...prev.research, [tid]: true } }));
    flash(`✅ ${t.name} pesquisado!`);
  };
  const buyBonus = (bid) => {
    const bo = BONUS[bid]; const p = pay(bo.cost); if (!p) { flash('❌ Recursos insuficientes'); return; }
    setG(prev => ({ ...prev, resources: { wood: prev.resources.wood - p.w, iron: prev.resources.iron - p.i, wheat: prev.resources.wheat - p.h }, bonuses: { ...prev.bonuses, [bid]: true } }));
    flash(`✅ ${bo.name} ativado!`);
  };
  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Panel title="📖 Pesquisa de Tropas (obrigatória antes de treinar)">
        {Object.entries(TROOPS).map(([k, t]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '5px 0', borderBottom: '1px dotted rgba(0,0,0,.15)' }}>
            <span style={{ flex: 1 }}>{t.icon} {t.name}</span>
            <span style={{ fontSize: 10, color: C.w3 }}>Ferreiro nv {t.res.s}</span>
            {g.research[k] ? <b style={{ color: C.green }}>✅</b> :
              <button onClick={() => research(k)} style={{ ...btnMini, padding: '4px 9px' }}>Pesquisar ({fmt(t.res.c)})</button>}
          </div>
        ))}
      </Panel>
      <Panel title="⭐ Bônus de Combate (acumulativos)">
        {Object.entries(BONUS).map(([k, bo]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '5px 0', borderBottom: '1px dotted rgba(0,0,0,.15)' }}>
            <span style={{ flex: 1 }}>{bo.icon} <b>{bo.name}</b> — {bo.desc}</span>
            {g.bonuses[k] ? <b style={{ color: C.green }}>✅ Ativo</b> :
              <button onClick={() => buyBonus(k)} style={{ ...btnMini, padding: '4px 9px' }}>Comprar ({fmt(bo.cost)})</button>}
          </div>
        ))}
      </Panel>
    </div>
  );
}

function ChurchExtra({ g, setG, L, R, flash, now, popUsed, popMax }) {
  if ((L.church || 0) < 1) return (
    <div style={{ marginTop: 14 }}>
      <Panel title="✝️ Sacerdotes">
        <div style={{ fontSize: 12, color: C.w2 }}>Construa a Igreja para treinar Sacerdotes. Cada um reduz 20–35% da lealdade inimiga. Lealdade a 0% = <b>aldeia conquistada</b>. 4 sacerdotes juntos = conquista em 1 ataque!</div>
      </Panel>
    </div>
  );
  const n = g.priestsTotal; const pc = priestCost(n);
  const p = { w: Math.floor(pc * 0.4), i: Math.floor(pc * 0.3), h: pc - Math.floor(pc * 0.4) - Math.floor(pc * 0.3) };
  const can = R.wood >= p.w && R.iron >= p.i && R.wheat >= p.h && popUsed + 50 <= popMax;
  const train = () => {
    if (!can) { flash('❌ Recursos ou população insuficiente (50 pop)'); return; }
    setG(prev => ({
      ...prev,
      resources: { wood: prev.resources.wood - p.w, iron: prev.resources.iron - p.i, wheat: prev.resources.wheat - p.h },
      priestsTotal: prev.priestsTotal + 1,
      priestQ: prev.priestQ ? { ...prev.priestQ, qty: prev.priestQ.qty + 1 } : { qty: 1, nextAt: Date.now() + 4 * 3600e3 }
    }));
    flash(`✝️ Sacerdote em treinamento (4h)`);
  };
  return (
    <div style={{ marginTop: 14 }}>
      <Panel title="✝️ Sacerdotes (conquista)">
        <Row k="Prontos na aldeia" v={`${g.priests}`} />
        {g.priestQ && <Row k={`Em treino (${g.priestQ.qty})`} v={fmtT(g.priestQ.nextAt - now)} />}
        <Row k={`Custo do ${n + 1}º`} v={`🪵${fmt(p.w)} ⛏️${fmt(p.i)} 🌾${fmt(p.h)}`} />
        <Row k="Tempo / População" v="4h · 50 pop" />
        <button onClick={train} style={{ ...btnGreen, width: '100%', padding: 10, marginTop: 8, opacity: can ? 1 : .55 }}>✝️ Treinar Sacerdote</button>
        <div style={{ fontSize: 10, color: C.w3, marginTop: 6 }}>Mande sacerdotes junto no ataque: cada um tira 20–35% de lealdade. A 0%, a aldeia é sua! 4 = conquista garantida.</div>
      </Panel>
    </div>
  );
}

/* ===== MAPA ===== */
function MapPage({ g, setG, go, flash, mapC, setMapC, sel, setSel, now }) {
  const SIZE = 13, half = 6;
  const lookup = {}; g.barbs.forEach(b => { lookup[b.x + ',' + b.y] = b; });
  const pan = (dx, dy) => setMapC(c => ({ x: Math.max(half, Math.min(99 - half, c.x + dx)), y: Math.max(half, Math.min(99 - half, c.y + dy)) }));
  const selB = sel ? g.barbs.find(b => b.id === sel) : null;
  const sendSpies = (b) => {
    const n = Math.min(3, g.troops.spy);
    if (n < 1) { flash('❌ Sem espiões (treine no Estábulo)'); return; }
    const tm = travelMs(dist(b, HOME), { spy: n });
    setG(prev => ({
      ...prev, troops: { ...prev.troops, spy: prev.troops.spy - n },
      commands: [...prev.commands, { id: 'c' + (prev.cmdSeq), targetId: b.id, kind: 'spy', troops: { spy: n }, priests: 0, startAt: Date.now(), arriveAt: Date.now() + tm, phase: 'going' }],
      cmdSeq: prev.cmdSeq + 1
    }));
    flash(`🕵️ ${n} espião(ões) → ${b.name} (${fmtT(tm)})`);
  };
  const tile = (wx, wy) => {
    const isHome = wx === HOME.x && wy === HOME.y;
    const b = lookup[wx + ',' + wy];
    const isSel = b && sel === b.id;
    return (
      <div key={wx + '_' + wy} onClick={() => { if (b) setSel(b.id); else if (isHome) setSel(null); }}
        style={{
          width: '100%', aspectRatio: '1', borderRadius: 4, position: 'relative', cursor: b || isHome ? 'pointer' : 'default',
          background: isHome ? 'radial-gradient(#8ac860,#5a9a3a)' : b ? (b.owner ? 'radial-gradient(#7ab0e0,#3a6a9a)' : `radial-gradient(${TIERS[b.tier].c}cc, ${TIERS[b.tier].c})`) : ((wx + wy) % 2 ? '#6aa844' : '#5f9c3e'),
          border: isSel ? `2px solid ${C.gold}` : isHome ? '2px solid #fff' : '1px solid rgba(0,0,0,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: b || isHome ? 'inset 0 0 6px rgba(0,0,0,.3)' : 'none'
        }}>
        {isHome ? '🏰' : b ? (b.owner ? '🏰' : TIERS[b.tier].e) : ''}
        {b && !b.owner && <span style={{ position: 'absolute', bottom: 0, right: 2, fontSize: 8, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px #000' }}>{b.lvl}</span>}
      </div>
    );
  };
  const rows = [];
  for (let dy = -half; dy <= half; dy++) { for (let dx = -half; dx <= half; dx++) rows.push(tile(mapC.x + dx, mapC.y + dy)); }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: 16, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ flex: '1 1 380px', minWidth: 300 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>🗺️ Mundo ({mapC.x}|{mapC.y})</h2>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={btnMini} onClick={() => pan(-4, 0)}>◀</button>
            <button style={btnMini} onClick={() => pan(0, -4)}>▲</button>
            <button style={btnMini} onClick={() => pan(0, 4)}>▼</button>
            <button style={btnMini} onClick={() => pan(4, 0)}>▶</button>
            <button style={btnMini} onClick={() => setMapC({ x: 50, y: 50 })}>🏰 Casa</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 2, background: '#3d6a22', padding: 6, borderRadius: 10, border: `3px solid ${C.wood}` }}>{rows}</div>
        <div style={{ fontSize: 10, color: C.w3, marginTop: 6 }}>🛖 Bandidos · 🪓 Saqueadores · 🛡️ Horda · 👹 Império · 🏰 azul = sua colônia</div>
      </div>
      <div style={{ flex: '1 1 260px', minWidth: 260, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {selB ? (
          <Panel title={`${selB.owner ? '🏰' : TIERS[selB.tier].e} ${selB.name}`} tone={selB.owner ? '#2a5a8a' : undefined}>
            <Row k="Tipo" v={selB.owner ? 'Sua colônia 👑' : TIERS[selB.tier].n} />
            <Row k="Nível" v={selB.lvl} />
            <Row k="Coordenadas" v={`${selB.x}|${selB.y}`} />
            <Row k="Distância" v={`${dist(selB, HOME).toFixed(1)} campos`} />
            {!selB.owner && <Row k="Lealdade" v={`${Math.round(selB.loyalty)}%`} />}
            {selB.owner ? (
              <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginTop: 6 }}>Gera +10% de produção pra você.</div>
            ) : (
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button onClick={() => sendSpies(selB)} style={{ ...btnMini, flex: 1, padding: '8px 6px' }}>🕵️ Espionar</button>
                <button onClick={() => go('attack_' + selB.id)} style={{ ...btnRed, flex: 1, padding: '8px 6px', fontSize: 12 }}>⚔️ Atacar</button>
              </div>
            )}
          </Panel>
        ) : (
          <Panel title="🧭 Selecione uma aldeia">
            <div style={{ fontSize: 12, color: C.w2 }}>Clique numa aldeia bárbara pra espionar, atacar, saquear e conquistar. As mais fáceis (🛖) estão perto de você. A IA cresce e ataca sozinha — fique de olho!</div>
          </Panel>
        )}
        {g.commands.length > 0 && (
          <Panel title="🏹 Comandos em andamento">
            {g.commands.map(c => {
              const b = g.barbs.find(x => x.id === c.targetId);
              return <Row key={c.id} k={`${c.kind === 'spy' ? '🕵️' : '⚔️'} ${c.phase === 'going' ? 'indo' : 'voltando'} · ${b ? b.name : '?'}`} v={fmtT((c.phase === 'going' ? c.arriveAt : c.returnAt) - now)} />;
            })}
          </Panel>
        )}
        {g.incoming.length > 0 && (
          <Panel title="⚠️ Chegando em você" tone="#8a2a2a">
            {g.incoming.map(inc => <Row key={inc.id} k={inc.name} v={fmtT(inc.arriveAt - now)} />)}
          </Panel>
        )}
      </div>
    </div>
  );
}

/* ===== ATAQUE ===== */
function AttackPage({ barbId, g, setG, go, flash, now }) {
  const [q, setQ] = useState({});
  const [pr, setPr] = useState(0);
  const b = g.barbs.find(x => x.id === barbId);
  if (!b) return <div style={{ padding: 30 }}>Aldeia não encontrada. <button style={btnMini} onClick={() => go('mapa')}>Voltar</button></div>;
  const d = dist(b, HOME);
  const setQty = (k, v) => setQ(p => ({ ...p, [k]: Math.max(0, Math.min(g.troops[k] || 0, v)) }));
  const selTroops = Object.fromEntries(Object.entries(q).filter(([, v]) => v > 0));
  const total = tSum(selTroops);
  const tm = travelMs(d, total > 0 ? selTroops : { spearman: 1 });
  const carry = Object.entries(selTroops).reduce((s, [k, v]) => s + TROOPS[k].carry * v, 0);
  const send = () => {
    if (total + pr <= 0) { flash('❌ Selecione tropas'); return; }
    if (pr > 0 && total === 0) { flash('❌ Sacerdotes precisam de escolta'); return; }
    setG(prev => {
      const nt = { ...prev.troops };
      Object.entries(selTroops).forEach(([k, v]) => { nt[k] -= v; });
      return {
        ...prev, troops: nt, priests: prev.priests - pr,
        commands: [...prev.commands, { id: 'c' + prev.cmdSeq, targetId: b.id, kind: 'attack', troops: selTroops, priests: pr, startAt: Date.now(), arriveAt: Date.now() + tm, phase: 'going' }],
        cmdSeq: prev.cmdSeq + 1
      };
    });
    flash(`⚔️ Exército enviado → ${b.name} (chega em ${fmtT(tm)})`);
    go('mapa');
  };
  return (
    <div style={{ padding: 20, maxWidth: 680, margin: '0 auto' }}>
      <button onClick={() => go('mapa')} style={{ ...btnMini, padding: '8px 16px', marginBottom: 14 }}>← Voltar ao mapa</button>
      <div style={{ background: C.parch, border: `3px solid ${C.wood}`, borderRadius: 12, padding: 20, boxShadow: 'inset 0 0 0 2px #efe2c2' }}>
        <h1 style={{ fontSize: 21, marginTop: 0 }}>⚔️ Atacar {TIERS[b.tier].e} {b.name}</h1>
        <div style={{ fontSize: 12, color: C.w2, marginBottom: 12 }}>Nível {b.lvl} · {TIERS[b.tier].n} · {d.toFixed(1)} campos · Lealdade {Math.round(b.loyalty)}% · 💡 Espione antes pra ver a defesa!</div>
        {Object.entries(TROOPS).map(([k, t]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 0', borderBottom: '1px dotted rgba(0,0,0,.15)' }}>
            <span style={{ flex: 1 }}>{t.icon} {t.name} <span style={{ color: C.w3, fontSize: 11 }}>(tem {fmt(g.troops[k] || 0)})</span></span>
            <button style={btnMini} onClick={() => setQty(k, (q[k] || 0) - 10)}>-10</button>
            <input value={q[k] || 0} onChange={e => setQty(k, parseInt(e.target.value) || 0)} style={{ width: 56, textAlign: 'center', padding: 5, border: `1px solid ${C.border}`, borderRadius: 5, fontWeight: 700, background: '#fffdf6' }} />
            <button style={btnMini} onClick={() => setQty(k, (q[k] || 0) + 10)}>+10</button>
            <button style={btnMini} onClick={() => setQty(k, g.troops[k] || 0)}>máx</button>
          </div>
        ))}
        {g.priests > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 0', background: 'rgba(106,58,138,.08)', borderRadius: 6, marginTop: 6, paddingLeft: 8 }}>
            <span style={{ flex: 1 }}>✝️ <b>Sacerdotes</b> <span style={{ color: C.w3, fontSize: 11 }}>(tem {g.priests}) — reduzem lealdade 20-35% cada</span></span>
            <button style={btnMini} onClick={() => setPr(Math.max(0, pr - 1))}>-1</button>
            <b style={{ width: 26, textAlign: 'center' }}>{pr}</b>
            <button style={btnMini} onClick={() => setPr(Math.min(g.priests, pr + 1))}>+1</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 12, fontWeight: 700, flexWrap: 'wrap' }}>
          <span>⏱️ Viagem: {fmtT(tm)} (ida)</span>
          <span>🎒 Capacidade: {fmt(carry)}</span>
          <span>👥 {total + pr > 0 ? total + (pr > 0 ? ` +${pr}✝️` : '') : 0} unidades</span>
        </div>
        <button onClick={send} style={{ ...btnRed, width: '100%', padding: 13, fontSize: 15, marginTop: 12 }}>⚔️ ENVIAR ATAQUE</button>
      </div>
    </div>
  );
}

/* ===== MISSÕES ===== */
function MissionsPage({ g, setG, flash, whCap }) {
  const claim = (id) => {
    setG(prev => {
      const ms = prev.missions.map(m => m.id === id ? { ...m, claimed: true } : m);
      const m = prev.missions.find(x => x.id === id);
      const cap = warehouseCap(prev.levels.warehouse);
      return {
        ...prev, missions: ms,
        resources: {
          wood: Math.min(cap, prev.resources.wood + m.reward.w),
          iron: Math.min(cap, prev.resources.iron + m.reward.i),
          wheat: Math.min(cap, prev.resources.wheat + m.reward.h)
        }
      };
    });
    flash('🎁 Recompensa coletada!');
  };
  const open = (g.missions || []).filter(m => !m.claimed);
  const done = (g.missions || []).filter(m => m.claimed);
  return (
    <div style={{ padding: 20, maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginTop: 0 }}>🎯 Missões</h1>
      <div style={{ fontSize: 12, color: C.w2, marginBottom: 14 }}>Cada nível novo de edifício construído devolve <b>10% dos recursos</b>. Colete aqui!</div>
      {open.length === 0 && <div style={{ fontSize: 13, color: C.w3, padding: 20, textAlign: 'center' }}>Nenhuma recompensa pendente — construa pra ganhar!</div>}
      {open.map(m => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.parch, border: `2px solid ${C.darkGold}`, borderRadius: 10, padding: '10px 14px', marginBottom: 8, boxShadow: 'inset 0 0 0 1px #efe2c2' }}>
          <span style={{ fontSize: 22 }}>{BUILDINGS[m.bid].emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{BUILDINGS[m.bid].name} nível {m.lvl} ✅</div>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>🎁 🪵{fmt(m.reward.w)} ⛏️{fmt(m.reward.i)} 🌾{fmt(m.reward.h)}</div>
          </div>
          <button onClick={() => claim(m.id)} style={{ ...btnGreen, padding: '8px 14px', fontSize: 12 }}>Coletar</button>
        </div>
      ))}
      {done.length > 0 && <div style={{ fontSize: 11, color: C.w3, marginTop: 14 }}>✅ {done.length} recompensa(s) já coletada(s)</div>}
    </div>
  );
}

/* ===== RELATÓRIOS ===== */
function ReportsPage({ g }) {
  const [openId, setOpenId] = useState(null);
  const icons = { atk: '⚔️', def: '🛡️', spy: '🕵️', conq: '👑' };
  return (
    <div style={{ padding: 20, maxWidth: 680, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginTop: 0 }}>📜 Relatórios</h1>
      {(g.reports || []).length === 0 && <div style={{ fontSize: 13, color: C.w3, padding: 20, textAlign: 'center' }}>Nenhum relatório ainda. Ataque uma aldeia bárbara no mapa!</div>}
      {(g.reports || []).map(r => (
        <div key={r.id} onClick={() => setOpenId(openId === r.id ? null : r.id)} style={{ background: C.parch, border: `2px solid ${r.ok ? C.green : C.red}`, borderRadius: 10, padding: '10px 14px', marginBottom: 8, cursor: 'pointer', boxShadow: 'inset 0 0 0 1px #efe2c2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: r.ok ? C.green : C.red, flexShrink: 0 }} />
            <span style={{ fontSize: 16 }}>{icons[r.type] || '📄'}</span>
            <b style={{ flex: 1, fontSize: 13 }}>{r.title}</b>
            <span style={{ fontSize: 10, color: C.w3 }}>{new Date(r.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {openId === r.id && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dotted rgba(0,0,0,.2)' }}>
              {r.lines.map((ln, i) => <div key={i} style={{ fontSize: 12, color: C.w1, padding: '2px 0' }}>{ln}</div>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ===== TROPAS ===== */
function TroopsPage({ g, go, popUsed, popMax }) {
  const T = g.troops;
  const out = {};
  g.commands.forEach(c => Object.entries(c.troops).forEach(([k, v]) => { out[k] = (out[k] || 0) + v; }));
  const totAtk = Object.entries(T).reduce((s, [k, v]) => s + (TROOPS[k]?.atk || 0) * v, 0);
  const totDef = Object.entries(T).reduce((s, [k, v]) => s + (TROOPS[k]?.def || 0) * v, 0);
  const totCarry = Object.entries(T).reduce((s, [k, v]) => s + (TROOPS[k]?.carry || 0) * v, 0);
  return (
    <div style={{ padding: 20, maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginTop: 0 }}>🛡️ Suas Tropas</h1>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <Stat label="⚔️ Ataque (em casa)" val={fmt(totAtk)} />
        <Stat label="🛡️ Defesa (em casa)" val={fmt(totDef)} />
        <Stat label="🎒 Carga" val={fmt(totCarry)} />
        <Stat label="✝️ Sacerdotes" val={g.priests} />
        <Stat label="👥 População" val={`${fmt(popUsed)}/${fmt(popMax)}`} />
      </div>
      <div style={{ background: C.parch, border: `2px solid ${C.wood}`, borderRadius: 10, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px #efe2c2' }}>
        <div style={{ display: 'flex', background: `linear-gradient(${C.woodL},${C.wood})`, color: C.gold, fontWeight: 700, fontSize: 11, padding: '8px 12px' }}>
          <div style={{ flex: 2 }}>Tropa</div><div style={{ flex: 1, textAlign: 'center' }}>Casa</div><div style={{ flex: 1, textAlign: 'center' }}>Fora</div><div style={{ flex: 1, textAlign: 'center' }}>⚔️</div><div style={{ flex: 1, textAlign: 'center' }}>🛡️</div><div style={{ flex: 1, textAlign: 'center' }}>🎒</div>
        </div>
        {Object.entries(TROOPS).map(([k, t], i) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', fontSize: 13, background: i % 2 ? '#eee2c4' : C.parch }}>
            <div style={{ flex: 2, fontWeight: 700 }}>{t.icon} {t.name}</div>
            <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: T[k] > 0 ? C.green : '#b6a988' }}>{fmt(T[k] || 0)}</div>
            <div style={{ flex: 1, textAlign: 'center', color: out[k] ? C.darkGold : '#b6a988', fontWeight: 700 }}>{fmt(out[k] || 0)}</div>
            <div style={{ flex: 1, textAlign: 'center', color: C.w2 }}>{t.atk}</div>
            <div style={{ flex: 1, textAlign: 'center', color: C.w2 }}>{t.def}</div>
            <div style={{ flex: 1, textAlign: 'center', color: C.w2 }}>{t.carry}</div>
          </div>
        ))}
      </div>
      <button onClick={() => go('recrutar')} style={{ ...btnGreen, marginTop: 12, padding: '10px 18px' }}>⚔️ Ir treinar tropas</button>
    </div>
  );
}
function Stat({ label, val }) {
  return (
    <div style={{ flex: '1 1 110px', background: C.parch, border: `2px solid ${C.wood}`, borderRadius: 8, padding: '8px 10px', textAlign: 'center', boxShadow: 'inset 0 0 0 1px #efe2c2' }}>
      <div style={{ fontSize: 10, color: C.w2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.darkGold }}>{val}</div>
    </div>
  );
}

/* ===== RECRUTAR ===== */
function RecruitPage({ g, setG, L, R, flash, popUsed, popMax, go, now }) {
  const [qty, setQty] = useState({});
  const setQ = (k, val) => setQty(p => ({ ...p, [k]: Math.max(0, val) }));
  const groups = { barracks: 'Quartel', stable: 'Estábulo', workshop: 'Oficina' };
  const train = (k) => {
    const t = TROOPS[k], n = qty[k] || 0;
    if (n <= 0) return;
    if ((L[t.by] || 0) < 1) { flash(`❌ Construa o ${BUILDINGS[t.by].name} primeiro`); return; }
    if (!g.research[k]) { flash('❌ Pesquise no Ferreiro primeiro'); return; }
    const need = { w: t.cost.w * n, i: t.cost.i * n, h: t.cost.h * n };
    if (R.wood < need.w || R.iron < need.i || R.wheat < need.h) { flash('❌ Recursos insuficientes'); return; }
    if (popUsed + t.pop * n > popMax) { flash('❌ População insuficiente (suba a Fazenda)'); return; }
    const um = trainMs(k, L);
    setG(prev => ({
      ...prev,
      resources: { wood: prev.resources.wood - need.w, iron: prev.resources.iron - need.i, wheat: prev.resources.wheat - need.h },
      recruitQ: { ...prev.recruitQ, [t.by]: [...prev.recruitQ[t.by], { tid: k, qty: n, unitMs: um, nextAt: prev.recruitQ[t.by].length === 0 ? Date.now() + um : null }] }
    }));
    flash(`⚔️ ${n}x ${t.name} na fila (${fmtT(um)} cada)`);
    setQ(k, 0);
  };
  return (
    <div style={{ padding: 20, maxWidth: 780, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginTop: 0 }}>⚔️ Recrutar Tropas</h1>
      <div style={{ fontSize: 12, color: C.w2, marginBottom: 16 }}>👥 <b>{fmt(popUsed)}/{fmt(popMax)}</b> · 🪵 {fmt(R.wood)} ⛏️ {fmt(R.iron)} 🌾 {fmt(R.wheat)} · treino leva tempo real (estilo Tribal)</div>
      {Object.entries(groups).map(([by, label]) => {
        const built = (L[by] || 0) >= 1;
        const queue = g.recruitQ[by];
        return (
          <div key={by} style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 15 }}>{BUILDINGS[by].emoji} {label} nv {L[by] || 0} {!built && <span style={{ color: C.red, fontSize: 12 }}>(construa primeiro)</span>}</div>
            {queue.length > 0 && (
              <div style={{ background: 'rgba(138,106,42,.12)', border: `1px solid ${C.darkGold}`, borderRadius: 8, padding: '6px 10px', marginBottom: 6, fontSize: 11 }}>
                ⏳ Treinando: {queue.map((it, i) => `${TROOPS[it.tid].icon}${it.qty}${it.nextAt ? ` (próx. ${fmtT(it.nextAt - now)})` : ''}`).join(' · ')}
              </div>
            )}
            <div style={{ background: C.parch, border: `2px solid ${C.wood}`, borderRadius: 10, overflow: 'hidden', opacity: built ? 1 : 0.55, boxShadow: 'inset 0 0 0 1px #efe2c2' }}>
              {Object.entries(TROOPS).filter(([, t]) => t.by === by).map(([k, t], i) => {
                const locked = !g.research[k];
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', fontSize: 13, flexWrap: 'wrap', background: i % 2 ? '#eee2c4' : C.parch }}>
                    <div style={{ flex: '1 1 130px', fontWeight: 700 }}>{t.icon} {t.name}</div>
                    <div style={{ fontSize: 11, color: C.w2, flex: '1 1 150px' }}>⚔️{t.atk} 🛡️{t.def} 🎒{t.carry} ⏱️{fmtT(trainMs(k, L))} · {[t.cost.w && `🪵${t.cost.w}`, t.cost.i && `⛏️${t.cost.i}`, t.cost.h && `🌾${t.cost.h}`].filter(Boolean).join(' ')}</div>
                    {locked ? (
                      <button onClick={() => go('building_smithy')} style={{ ...btnMini, background: 'rgba(138,42,42,.1)', color: C.red }}>🔒 Pesquisar no Ferreiro</button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button onClick={() => setQ(k, (qty[k] || 0) - 10)} style={btnMini}>-10</button>
                        <input value={qty[k] || 0} onChange={e => setQ(k, parseInt(e.target.value) || 0)} style={{ width: 50, textAlign: 'center', padding: 5, border: `1px solid ${C.border}`, borderRadius: 5, fontWeight: 700, background: '#fffdf6' }} />
                        <button onClick={() => setQ(k, (qty[k] || 0) + 10)} style={btnMini}>+10</button>
                        <button onClick={() => train(k)} disabled={!built} style={{ ...btnMini, ...btnGreen, borderRadius: 5, padding: '6px 12px' }}>Treinar</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== PERFIL ===== */
function ProfilePage({ g, setG, points, flash }) {
  const pr = g.profile || { name: '', photo: '', desc: '' };
  const [name, setName] = useState(pr.name);
  const [photo, setPhoto] = useState(pr.photo);
  const [desc, setDesc] = useState(pr.desc);
  const save = () => { setG(prev => ({ ...prev, profile: { name, photo, desc } })); flash('✅ Perfil salvo!'); };
  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginTop: 0 }}>👤 Perfil</h1>
      <div style={{ background: C.parch, border: `3px solid ${C.wood}`, borderRadius: 12, padding: 24, boxShadow: 'inset 0 0 0 2px #efe2c2' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: C.parchD, border: `3px solid ${C.darkGold}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>
            {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} /> : '🧑‍⚔️'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{name || 'Sem nome'}</div>
            <div style={{ fontSize: 12, color: C.darkGold, fontWeight: 700 }}>🏅 {fmt(points)} pontos · 👑 {g.conquered} colônias · VIP</div>
          </div>
        </div>
        <Field label="Nome do comandante"><input value={name} onChange={e => setName(e.target.value)} style={inp} maxLength={24} /></Field>
        <Field label="Foto (link de imagem)"><input value={photo} onChange={e => setPhoto(e.target.value)} placeholder="https://..." style={inp} /></Field>
        <Field label="Descrição"><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} maxLength={200} style={{ ...inp, resize: 'vertical' }} /></Field>
        <button onClick={save} style={{ ...btnGreen, width: '100%', padding: 12, fontSize: 15, marginTop: 6 }}>💾 Salvar perfil</button>
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: C.w2, marginBottom: 5 }}>{label}</div>{children}</div>;
}
