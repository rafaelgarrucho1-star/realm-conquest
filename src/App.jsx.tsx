import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// ⚔️ REALM CONQUEST — V4 (PROFISSIONAL — Tribal Wars style)
// Header tipo Tribal · Badges com contadores · Tooltips nos prédios
// Sidebar colorida e organizada · Visual muito melhor
// ============================================================

/* ---------- CORES PROFISSIONAIS ---------- */
const C = {
  gold: '#c9a961',
  darkGold: '#8a7a3a',
  parch: '#ece0c6',
  parchD: '#dcc9a4',
  w1: '#4a3a1a',
  w2: '#6a5a3a',
  w3: '#8a7a5a',
  border: '#b8a878',
  headerBg: '#2a2a2a',
  headerBorder: '#5a4a2a',
  green: '#3d6a22',
  greenLight: '#5a9a3a',
  blue: '#2a5a8a',
  blueLight: '#4a7aaa',
  purple: '#6a3a8a',
  purpleLight: '#8a5aaa',
  red: '#8a2a2a',
  redLight: '#aa4a4a',
};

/* ---------- EDIFÍCIOS ---------- */
const BUILDINGS = {
  mainBuilding: { name: 'Edifício Principal', icon: '🏛️', cat: 'main', max: 30, w: 90, i: 80, h: 40, time: 25, desc: 'Coração da aldeia. Cada nível reduz o tempo de todas as construções.', viz: { cx: 500, cy: 286, s: 1.26, h: 72, roofH: 40, pal: { l: '#d2c9b8', d: '#a89d88' }, banner: true } },
  commandCenter: { name: 'Centro de Comando', icon: '🏰', cat: 'command', max: 1, w: 0, i: 0, h: 0, time: 1, desc: 'Quartel-general. Veja todas as suas tropas e envie ataques.', viz: { cx: 492, cy: 402, s: 0.8, h: 88, roofH: 14, pal: { l: '#c4bcab', d: '#968c79' }, flag: true, tower: true } },
  church: { name: 'Igreja', icon: '⛪', cat: 'conquest', max: 1, w: 2000, i: 1500, h: 1000, time: 90, desc: 'Treina sacerdotes, que reduzem lealdade de inimigos.', viz: { cx: 690, cy: 226, s: 0.7, h: 54, roofH: 78, pal: { l: '#e4ded0', d: '#bdb5a1' }, spire: true } },
  woodcutter: { name: 'Serraria', icon: '🪵', cat: 'resource', res: 'wood', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Corta madeira da floresta.', viz: { cx: 322, cy: 226, s: 0.82, h: 40, roofH: 22, pal: { l: '#bda36c', d: '#8f7a48' } } },
  mine: { name: 'Mina de Ferro', icon: '⛏️', cat: 'resource', res: 'iron', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Extrai ferro para tropas pesadas.', viz: { cx: 500, cy: 198, s: 0.82, h: 36, roofH: 20, pal: { l: '#a3a8ad', d: '#787e83' } } },
  smithy: { name: 'Ferreiro', icon: '🔧', cat: 'research', max: 20, w: 240, i: 200, h: 150, time: 55, desc: 'Pesquisa novas tropas e melhorias de combate.', viz: { cx: 234, cy: 316, s: 0.86, h: 48, roofH: 26, pal: { l: '#a8a195', d: '#7d766a' } } },
  market: { name: 'Mercado', icon: '🏪', cat: 'market', max: 20, w: 100, i: 50, h: 50, time: 22, desc: 'Troca recursos. Cada nível libera mais comerciantes.', viz: { cx: 768, cy: 320, s: 0.9, h: 42, roofH: 24, pal: { l: '#caa15f', d: '#9a7340' } } },
  barracks: { name: 'Quartel', icon: '🎖️', cat: 'infantry', max: 25, w: 100, i: 50, h: 50, time: 22, desc: 'Treina infantaria (espadachim, lanceiro, arqueiro, bárbaro).', trains: ['spearman', 'swordsman', 'archer', 'barbarian'], viz: { cx: 352, cy: 398, s: 0.96, h: 46, roofH: 26, pal: { l: '#caa15f', d: '#9a7340' } } },
  stable: { name: 'Estábulo', icon: '🐴', cat: 'cavalry', max: 20, w: 150, i: 100, h: 100, time: 34, desc: 'Cria cavalaria, espiões e unidades montadas.', trains: ['spy', 'cavalry', 'archerCav', 'royalCav'], viz: { cx: 648, cy: 398, s: 0.96, h: 44, roofH: 24, pal: { l: '#caa15f', d: '#9a7340' } } },
  warehouse: { name: 'Armazém', icon: '🏠', cat: 'storage', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Guarda seus recursos. Maior capacidade a cada nível.', viz: { cx: 288, cy: 486, s: 1.06, h: 40, roofH: 22, pal: { l: '#c8a96a', d: '#9c7e46' } } },
  farm: { name: 'Fazenda', icon: '🌾', cat: 'resource', res: 'wheat', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Produz trigo e sustenta a população.', viz: { cx: 512, cy: 502, s: 1.0, h: 38, roofH: 22, pal: { l: '#c8a96a', d: '#9c7e46' } } },
  workshop: { name: 'Oficina', icon: '🔨', cat: 'siege', max: 20, w: 200, i: 150, h: 100, time: 46, desc: 'Constrói máquinas de cerco (aríete, catapulta).', trains: ['ram', 'catapult'], viz: { cx: 712, cy: 486, s: 1.0, h: 46, roofH: 24, pal: { l: '#caa15f', d: '#9a7340' } } },
  wall: { name: 'Muralha', icon: '🧱', cat: 'wall', max: 20, w: 100, i: 50, h: 50, time: 22, desc: 'Protege a aldeia. +5% defesa por nível, ergue em volta.', viz: { wall: true } }
};

/* ---------- TROPAS ---------- */
const TROOPS = {
  spearman: { name: 'Lanceiro', icon: '🔱', build: 'barracks', atk: 8, def: 12, speed: 6, pop: 1, carry: 25, w: 0, i: 5, h: 55, time: 6, req: null, desc: 'Domina cavalaria' },
  swordsman: { name: 'Espadachim', icon: '🗡️', build: 'barracks', atk: 10, def: 8, speed: 6, pop: 1, carry: 25, w: 0, i: 0, h: 50, time: 7, req: null, desc: 'Versátil e barato' },
  archer: { name: 'Arqueiro', icon: '🏹', build: 'barracks', atk: 12, def: 4, speed: 6, pop: 1, carry: 20, w: 60, i: 0, h: 50, time: 9, req: { smithy: 3 }, desc: 'Mata infantaria, morre p/ cavalaria' },
  barbarian: { name: 'Bárbaro', icon: '🪓', build: 'barracks', atk: 15, def: 10, speed: 6, pop: 1, carry: 60, w: 0, i: 20, h: 80, time: 12, req: { smithy: 5 }, desc: 'Bruto e forte' },
  spy: { name: 'Espião', icon: '🕵️', build: 'stable', atk: 0, def: 0, speed: 12, pop: 1, carry: 0, w: 50, i: 25, h: 100, time: 8, req: { smithy: 5 }, desc: 'Reconhecimento super rápido' },
  cavalry: { name: 'Cavalaria', icon: '🐴', build: 'stable', atk: 25, def: 15, speed: 18, pop: 2, carry: 100, w: 0, i: 20, h: 200, time: 18, req: { smithy: 8 }, desc: 'Rápida e forte' },
  archerCav: { name: 'Arq. a Cavalo', icon: '🐎', build: 'stable', atk: 18, def: 10, speed: 15, pop: 2, carry: 80, w: 100, i: 30, h: 180, time: 15, req: { smithy: 10 }, desc: 'Veloz à distância' },
  royalCav: { name: 'Cavalaria Real', icon: '👑', build: 'stable', atk: 40, def: 25, speed: 16, pop: 3, carry: 120, w: 100, i: 100, h: 300, time: 25, req: { smithy: 15 }, desc: 'Elite suprema' },
  ram: { name: 'Aríete', icon: '⚒️', build: 'workshop', atk: 50, def: 8, speed: 6, pop: 4, carry: 0, w: 300, i: 150, h: 100, time: 22, req: { smithy: 12 }, desc: 'Quebra muralhas' },
  catapult: { name: 'Catapulta', icon: '💣', build: 'workshop', atk: 80, def: 2, speed: 4, pop: 5, carry: 0, w: 100, i: 100, h: 400, time: 30, req: { smithy: 18 }, desc: 'Destrói edifícios' },
  priest: { name: 'Sacerdote', icon: '✝️', build: 'church', atk: 0, def: 5, speed: 6, pop: 20, carry: 0, w: 5000, i: 5000, h: 5000, time: 60, req: null, desc: 'Reduz lealdade (conquista)' }
};

const BONUS = {
  steel: { name: 'Aço Temperado', icon: '⚔️', cost: 6000, smithy: 7, effect: '+5% ataque infantaria', tgt: ['spearman', 'swordsman', 'barbarian'] },
  longbow: { name: 'Arco Longo', icon: '🏹', cost: 5000, smithy: 6, effect: '+5% ataque arqueiros', tgt: ['archer', 'archerCav'] },
  warhorse: { name: 'Corcel de Guerra', icon: '🐴', cost: 7000, smithy: 8, effect: '+5% ataque cavalaria', tgt: ['cavalry', 'royalCav', 'archerCav'] },
  siege: { name: 'Engenharia de Cerco', icon: '💥', cost: 9000, smithy: 12, effect: '+10% cerco', tgt: ['ram', 'catapult'] }
};

/* ---------- FÓRMULAS ---------- */
const cost = (b, lvl) => { const m = Math.pow(1.26, Math.max(0, lvl - 1)); return { w: Math.floor(b.w * m), i: Math.floor(b.i * m), h: Math.floor(b.h * m) }; };
const buildTime = (b, lvl, mainLvl) => { const base = b.time + Math.max(0, lvl - 1) * b.time * 0.22; const red = Math.min(0.5, Math.max(0, (mainLvl - 1) * 0.02)); return Math.max(2, Math.floor(base * (1 - red))); };
const recruitTime = (t, bl) => Math.max(2, Math.floor(t.time * (1 - Math.min(0.5, (bl - 1) * 0.02))));
const production = (lvl) => 50 + Math.max(0, lvl - 1) * 145;
const warehouseCap = (lvl) => Math.floor(1500 * Math.pow(1.22, Math.max(0, lvl - 1)));
const maxPop = (lvl) => Math.min(30000, 240 + Math.max(0, lvl - 1) * 260);
const fmt = (n) => Math.floor(n).toLocaleString('pt-BR');
const fmtTime = (s) => s < 60 ? `${Math.ceil(s)}s` : s < 3600 ? `${Math.floor(s / 60)}m${String(Math.floor(s % 60)).padStart(2, '0')}` : `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;
const dist = (a, b) => Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 10) / 10;
const HOME = { x: 500, y: 350 };

const buildingPoints = (lvl) => lvl > 0 ? 2 * lvl * (lvl + 1) : 0;
const villagePoints = (levels, conquered) => Object.values(levels).reduce((s, l) => s + buildingPoints(l), 0) + (conquered || 0) * 2500;

const MISSIONS = [
  { id: 'm1', t: 'Construir o Quartel', d: 'Tenha um Quartel para treinar infantaria.', chk: (g) => g.levels.barracks >= 1, r: { w: 300, i: 200, h: 300 } },
  { id: 'm2', t: 'Edifício Principal nível 5', d: 'Suba o Edifício Principal ao nível 5.', chk: (g) => g.levels.mainBuilding >= 5, r: { w: 800, i: 600, h: 800 } },
  { id: 'm3', t: 'Treinar 50 tropas', d: 'Tenha 50 tropas no total.', chk: (g) => Object.values(g.troops).reduce((a, b) => a + b, 0) >= 50, r: { w: 600, i: 600, h: 600 } },
  { id: 'm4', t: 'Muralha nível 5', d: 'Suba a Muralha ao nível 5.', chk: (g) => g.levels.wall >= 5, r: { w: 1000, i: 500, h: 500 } },
  { id: 'm5', t: 'Ferreiro nível 5', d: 'Suba o Ferreiro ao nível 5 para liberar tropas.', chk: (g) => g.levels.smithy >= 5, r: { w: 1000, i: 1000, h: 800 } },
  { id: 'm6', t: 'Construir Estábulo', d: 'Tenha um Estábulo para criar cavalaria.', chk: (g) => g.levels.stable >= 1, r: { w: 800, i: 800, h: 600 } },
  { id: 'm7', t: 'Armazém nível 10', d: 'Aumente o Armazém ao nível 10.', chk: (g) => g.levels.warehouse >= 10, r: { w: 1500, i: 1000, h: 1000 } },
  { id: 'm8', t: 'Primeira conquista', d: 'Conquiste uma aldeia com sacerdotes.', chk: (g) => g.conquered >= 1, r: { w: 3000, i: 3000, h: 3000 } },
  { id: 'm9', t: 'Economia forte', d: 'Serraria, Mina e Fazenda no nível 10.', chk: (g) => g.levels.woodcutter >= 10 && g.levels.mine >= 10 && g.levels.farm >= 10, r: { w: 2000, i: 2000, h: 2000 } },
  { id: 'm10', t: 'Exército de 500', d: 'Tenha 500 tropas no total.', chk: (g) => Object.values(g.troops).reduce((a, b) => a + b, 0) >= 500, r: { w: 4000, i: 4000, h: 4000 } }
];

const startState = () => ({
  resources: { wood: 4000, iron: 3000, wheat: 4000 },
  levels: { mainBuilding: 3, commandCenter: 1, woodcutter: 5, mine: 5, farm: 5, warehouse: 5, smithy: 1, market: 0, barracks: 3, stable: 1, workshop: 0, church: 0, wall: 2 },
  troops: { spearman: 40, swordsman: 30, archer: 0, barbarian: 0, spy: 0, cavalry: 0, archerCav: 0, royalCav: 0, ram: 0, catapult: 0, priest: 0 },
  research: {}, bonus: {}, isVip: true, questsClaimed: [], buildQueue: [], recruit: { barracks: [], stable: [], workshop: [], church: [] },
  movements: [], reports: [], conquered: 0
});

const genTargets = () => {
  const names = ['Forte Negro', 'Vale Sombrio', 'Pico Gelado', 'Campo Rubro', 'Ermo Cinza', 'Bastião', 'Posto Caído', 'Ruína Velha'];
  return names.map((n, i) => {
    const diff = i < 4 ? 'fraco' : i < 7 ? 'médio' : 'forte';
    const m = diff === 'fraco' ? 1 : diff === 'médio' ? 3 : 7;
    const angle = (i / 8) * 2 * Math.PI;
    const r = 8 + (i % 4) * 4;
    return { name: n, x: HOME.x + r * Math.cos(angle), y: HOME.y + r * Math.sin(angle), diff, troops: { spearman: 10 * m, archer: 5 * m, cavalry: 3 * m }, resources: { wood: 1000 * m, iron: 800 * m, wheat: 1200 * m }, wall: 3 * m, loyalty: 100 };
  });
};

/* ========== MAIN COMPONENT ========== */
export default function App() {
  const [g, setG] = useState(startState());
  const [screen, setScreen] = useState('village');
  const [targets, setTargets] = useState(genTargets());
  const [msg, setMsg] = useState('');
  const [tooltip, setTooltip] = useState(null);

  const L = g.levels;
  const R = g.resources;
  const T = g.troops;
  const whCap = warehouseCap(L.warehouse);
  const popMax = maxPop(L.farm);
  const popUsed = Object.entries(T).reduce((s, [k, v]) => s + (TROOPS[k]?.pop || 0) * v, 0);
  const isVip = g.isVip !== false;
  const points = villagePoints(L, g.conquered);
  const rates = { wood: Math.floor(production(L.woodcutter) * (isVip ? 1.2 : 1)), iron: Math.floor(production(L.mine) * (isVip ? 1.2 : 1)), wheat: Math.floor(production(L.farm) * (isVip ? 1.2 : 1)) };
  const afford = (b, lvl = 0) => { const c = cost(b, lvl + 1); return R.wood >= c.w && R.iron >= c.i && R.wheat >= c.h; };
  const flash = (txt) => { setMsg(txt); setTimeout(() => setMsg(''), 3000); };
  
  const upgrade = (bid) => {
    const b = BUILDINGS[bid];
    if (!b || L[bid] >= b.max) { flash('❌ Máximo nível atingido'); return; }
    if (!afford(b, L[bid])) { flash('❌ Recursos insuficientes'); return; }
    const c = cost(b, L[bid] + 1);
    setG(p => ({ ...p, resources: { wood: p.resources.wood - c.w, iron: p.resources.iron - c.i, wheat: p.resources.wheat - c.h }, buildQueue: [...p.buildQueue, { building: bid, level: L[bid] + 1, progress: 0 }] }));
    flash(`🔨 Construindo ${b.name}...`);
  };

  const recruit = (tid, qty) => {
    const t = TROOPS[tid];
    if (!t) return;
    const totalCost = { w: t.w * qty, i: t.i * qty, h: t.h * qty };
    if (R.wood < totalCost.w || R.iron < totalCost.i || R.wheat < totalCost.h) { flash('❌ Recursos insuficientes'); return; }
    if (popUsed + t.pop * qty > popMax) { flash('❌ População insuficiente'); return; }
    setG(p => ({ ...p, resources: { wood: p.resources.wood - totalCost.w, iron: p.resources.iron - totalCost.i, wheat: p.resources.wheat - totalCost.h }, troops: { ...p.troops, [tid]: p.troops[tid] + qty } }));
    flash(`⚔️ Treinando ${qty}x ${t.name}...`);
  };

  const claimQuest = (id) => {
    const m = MISSIONS.find(x => x.id === id);
    if (!m || (g.questsClaimed || []).includes(id)) return;
    if (!m.chk(g)) { flash('🎯 Missão não concluída'); return; }
    setG(p => ({ ...p, questsClaimed: [...(p.questsClaimed || []), id], resources: { wood: Math.min(whCap, p.resources.wood + m.r.w), iron: Math.min(whCap, p.resources.iron + m.r.i), wheat: Math.min(whCap, p.resources.wheat + m.r.h) } }));
    flash(`🎁 Recompensa: 🪵${fmt(m.r.w)} ⛏️${fmt(m.r.i)} 🌾${fmt(m.r.h)}`);
  };

  const reset = () => { if (window.confirm('Reiniciar tudo?')) { setG(startState()); setTargets(genTargets()); setScreen('village'); } };

  const shared = { g, L, C, targets, popUsed, popMax, afford, upgrade, recruit, setScreen, flash, rates, isVip, points, whCap, claimQuest, setTooltip, tooltip };

  const NAV = [['village', '🏰', 'Aldeia', 0], ['mapa', '🗺️', 'Mapa', 0], ['missions', '🎯', 'Missões', (g.questsClaimed || []).length < MISSIONS.length ? MISSIONS.length - (g.questsClaimed || []).length : 0], ['recrutar', '⚔️', 'Recrutar', 0], ['command', '🛡️', 'Tropas', 0], ['reports', '📜', 'Relatórios', 2], ['ranking', '🏆', 'Classificação', 0], ['tribo', '⚜️', 'Tribo', 0], ['amigos', '👥', 'Amigos', 1], ['perfil', '👤', 'Perfil', 0]];

  return (
    <div style={{ background: `linear-gradient(${C.parch}, ${C.parchD})`, minHeight: '100vh', fontFamily: 'Georgia, serif', color: C.w1, overflow: 'hidden' }}>
      {/* ===== HEADER PROFISSIONAL ===== */}
      <div style={{ background: `linear-gradient(${C.headerBg}, #1a1a1a)`, borderBottom: `3px solid ${C.headerBorder}`, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        {/* Logo + Capital */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>⚔️ REALM CONQUEST</div>
          <div style={{ fontSize: 12, color: C.w3 }}>Minha Capital (500|350)</div>
        </div>

        {/* Recursos */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ textAlign: 'center', fontSize: 13 }}>
            <div style={{ color: C.gold, fontWeight: 700 }}>🪵 {fmt(R.wood)}</div>
            <div style={{ fontSize: 11, color: C.w3 }}>+{fmt(rates.wood)}/h</div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 13 }}>
            <div style={{ color: C.gold, fontWeight: 700 }}>⛏️ {fmt(R.iron)}</div>
            <div style={{ fontSize: 11, color: C.w3 }}>+{fmt(rates.iron)}/h</div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 13 }}>
            <div style={{ color: C.gold, fontWeight: 700 }}>🌾 {fmt(R.wheat)}</div>
            <div style={{ fontSize: 11, color: C.w3 }}>+{fmt(rates.wheat)}/h</div>
          </div>
        </div>

        {/* Pontos, Pop, VIP */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: C.gold, fontWeight: 700 }}>🏅 {fmt(points)}</div>
            <div style={{ fontSize: 11, color: C.w3 }}>Pontos</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: C.gold, fontWeight: 700 }}>👥 {fmt(popUsed)}/{fmt(popMax)}</div>
            <div style={{ fontSize: 11, color: C.w3 }}>População</div>
          </div>
          <button onClick={() => setG(p => ({ ...p, isVip: !p.isVip }))} style={{ background: isVip ? C.purple : C.w3, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>👑 {isVip ? 'VIP' : 'FREE'}</button>
        </div>
      </div>

      {/* ===== NAVEGAÇÃO COM BADGES ===== */}
      <div style={{ background: C.headerBg, borderBottom: `2px solid ${C.gold}`, display: 'flex', justifyContent: 'center', gap: 0, padding: '6px 0' }}>
        {NAV.map(([id, icon, label, badge]) => (
          <button key={id} onClick={() => setScreen(id)} style={{ flex: 1, background: screen === id ? C.gold : 'transparent', color: screen === id ? '#000' : C.gold, border: 'none', padding: '12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: .5, transition: 'all 0.2s', position: 'relative', fontFamily: 'Georgia, serif' }}>
            <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
            {label}
            {badge > 0 && <div style={{ position: 'absolute', top: 4, right: 4, background: C.red, color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</div>}
          </button>
        ))}
      </div>

      {/* ===== TELAS ===== */}
      {screen === 'village' && <VillageScreen {...shared} />}
      {screen === 'mapa' && <MapScreen {...shared} />}
      {screen === 'missions' && <MissionsScreen {...shared} />}
      {screen === 'recrutar' && <RecruitScreen {...shared} />}
      {screen === 'command' && <CommandScreen {...shared} />}
      {screen === 'reports' && <ReportsScreen {...shared} />}
      {screen === 'ranking' && <RankingScreen {...shared} />}
      {screen === 'tribo' && <TribeScreen {...shared} />}
      {screen === 'amigos' && <FriendsScreen {...shared} />}
      {screen === 'perfil' && <ProfileScreen {...shared} />}

      {/* ===== MENSAGENS ===== */}
      {msg && <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: C.headerBg, color: C.gold, padding: '12px 20px', borderRadius: 8, fontSize: 14, border: `2px solid ${C.gold}`, fontWeight: 700, zIndex: 9999 }}>{msg}</div>}
    </div>
  );
}

/* ===== TELA VILLAGE (PRINCIPAL) ===== */
function VillageScreen(p) {
  const { g, L, C, popUsed, popMax, upgrade, setScreen, setTooltip, tooltip } = p;
  const whCap = warehouseCap(L.warehouse);

  return (
    <div style={{ display: 'flex', gap: 16, padding: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {/* ALDEIA À ESQUERDA */}
      <div style={{ flex: '1 1 600px', minWidth: 300, background: '#4a7a30', border: `3px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,.4)' }}>
        <svg viewBox="0 0 1000 700" style={{ display: 'block', width: '100%', background: `linear-gradient(${C.parch}, ${C.parchD})` }}>
          {/* Grama */}
          <ellipse cx="500" cy="350" rx="478" ry="252" fill="#34571f" />
          <ellipse cx="500" cy="342" rx="458" ry="238" fill={`url(#grass)`} />
          <defs>
            <radialGradient id="grass" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#5a9a3a" />
              <stop offset="100%" stopColor="#2a5a1a" />
            </radialGradient>
          </defs>
          <ellipse cx="330" cy="280" rx="130" ry="58" fill="rgba(255,255,255,0.06)" />
          <ellipse cx="660" cy="430" rx="150" ry="64" fill="rgba(0,0,0,0.08)" />

          {/* Prédios com TOOLTIPS */}
          {Object.entries(BUILDINGS).map(([bid, b]) => {
            if (!b.viz || !b.viz.cx) return null;
            const lvl = L[bid] || 0;
            const isHovered = tooltip === bid;
            return (
              <g key={bid} onMouseEnter={() => setTooltip(bid)} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }} onClick={() => setScreen(bid)}>
                {/* Sombra */}
                <ellipse cx={b.viz.cx} cy={b.viz.cy + 8} rx={b.viz.s * 40} ry={b.viz.s * 24} fill="rgba(0,0,0,0.25)" />
                {/* Prédio SVG simplificado */}
                <rect x={b.viz.cx - b.viz.s * 30} y={b.viz.cy - b.viz.s * (b.viz.h || 40)} width={b.viz.s * 60} height={b.viz.s * (b.viz.h || 40)} fill={b.viz.pal?.l || '#caa15f'} stroke={b.viz.pal?.d || '#9a7340'} strokeWidth="2" rx="4" />
                <polygon points={`${b.viz.cx - b.viz.s * 30},${b.viz.cy - b.viz.s * (b.viz.h || 40)} ${b.viz.cx},${b.viz.cy - b.viz.s * ((b.viz.h || 40) + (b.viz.roofH || 20))} ${b.viz.cx + b.viz.s * 30},${b.viz.cy - b.viz.s * (b.viz.h || 40)}`} fill={b.viz.pal?.rl || '#8a3b2f'} />
                {/* Nível do prédio */}
                <circle cx={b.viz.cx} cy={b.viz.cy - b.viz.s * (b.viz.h || 40) - 15} r="18" fill="rgba(0,0,0,0.8)" />
                <text x={b.viz.cx} y={b.viz.cy - b.viz.s * (b.viz.h || 40) - 8} textAnchor="middle" fontSize="16" fill="#fff" fontWeight="700">{lvl}</text>
                {/* TOOLTIP */}
                {isHovered && (
                  <foreignObject x={b.viz.cx - 80} y={b.viz.cy - 120} width="160" height="100">
                    <div style={{ background: '#000', color: '#fff', padding: '8px', borderRadius: 6, fontSize: 11, border: `2px solid ${C.gold}`, fontFamily: 'Georgia, serif', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{b.icon} {b.name}</div>
                      <div style={{ fontSize: 10, color: C.gold }}>Nível {lvl}/{b.max}</div>
                      <div style={{ fontSize: 10, marginTop: 4, lineHeight: 1.3 }}>{b.desc}</div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* BARRA LATERAL COLORIDA */}
      <div style={{ flex: '1 1 280px', minWidth: 240, maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Resumo */}
        <SidePanel title="📊 Resumo" titleBg={C.blue} titleBgLight={C.blueLight}>
          <Line k="🏅 Pontos" v={fmt(p.points)} />
          <Line k="👥 População" v={`${fmt(popUsed)} / ${fmt(popMax)}`} />
          <Line k="📦 Armazém" v={`${fmt(g.resources.wood + g.resources.iron + g.resources.wheat)} / ${fmt(whCap * 3)}`} />
        </SidePanel>

        {/* Produção */}
        <SidePanel title="⚒️ Produção/h" titleBg={C.green} titleBgLight={C.greenLight}>
          <Line k="🪵 Madeira" v={`+${fmt(p.rates.wood)}`} />
          <Line k="⛏️ Ferro" v={`+${fmt(p.rates.iron)}`} />
          <Line k="🌾 Trigo" v={`+${fmt(p.rates.wheat)}`} />
        </SidePanel>

        {/* Efeitos */}
        <SidePanel title="✨ Efeitos ativos" titleBg={C.purple} titleBgLight={C.purpleLight}>
          {p.isVip && <Line k="👑" v="VIP +20% produção" />}
          {L.wall > 0 && <Line k="🧱" v={`+${L.wall * 5}% defesa`} />}
          <Line k="📍" v={`${1 + g.conquered} aldeias`} />
        </SidePanel>

        {/* Próximas Missões */}
        <SidePanel title="🎯 Próximas Missões" titleBg={C.darkGold} titleBgLight={C.gold}>
          {MISSIONS.slice(0, 3).map(m => {
            const done = (g.questsClaimed || []).includes(m.id);
            const ready = !done && m.chk(g);
            return (
              <div key={m.id} style={{ padding: '6px 0', borderBottom: `1px solid ${C.parchD}`, fontSize: 11 }}>
                <div style={{ fontWeight: 700, color: done ? C.green : ready ? C.gold : C.w2 }}>{done ? '✅' : ready ? '🎁' : '⏳'} {m.t}</div>
              </div>
            );
          })}
          <button onClick={() => p.setScreen('missions')} style={{ marginTop: 8, background: C.blue, color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700, width: '100%' }}>Ver todas →</button>
        </SidePanel>
      </div>
    </div>
  );
}

function SidePanel({ title, titleBg, titleBgLight, children }) {
  const C = { parch: '#ece0c6', parchD: '#dcc9a4' };
  return (
    <div style={{ background: `linear-gradient(${C.parch}, ${C.parchD})`, border: `2px solid #b8a878`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,.2)' }}>
      <div style={{ background: `linear-gradient(${titleBg}, ${titleBgLight})`, color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 12px', letterSpacing: 0.5 }}>{title}</div>
      <div style={{ padding: '10px', fontFamily: 'Georgia, serif', fontSize: 12 }}>{children}</div>
    </div>
  );
}

function Line({ k, v }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#3a2a1a' }}><span>{k}</span><b>{v}</b></div>;
}

/* ===== OUTRAS TELAS (PLACEHOLDER) ===== */
function MapScreen(p) {
  return <Panel C={p.C} title="🗺️ Mapa" onBack={() => p.setScreen('village')}><div style={{ padding: 16, color: p.C.w1 }}>Mapa do mundo (aldeias, bárbaros, jogadores)</div></Panel>;
}

function MissionsScreen(p) {
  const { g, C, claimQuest } = p;
  const claimed = g.questsClaimed || [];
  return (
    <Panel C={C} title="🎯 Missões" onBack={() => p.setScreen('village')}>
      <div style={{ padding: 16 }}>
        <div style={{ background: 'rgba(63,113,134,.12)', border: `1px solid ${C.parchD}`, borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12, color: C.w1 }}>
          📌 As missões são da sua <b>conta</b> — valem para o jogador, não por aldeia.
        </div>
        {MISSIONS.map(m => {
          const done = claimed.includes(m.id);
          const ready = !done && m.chk(g);
          return (
            <div key={m.id} style={{ display: 'flex', gap: 10, background: done ? 'rgba(94,138,62,.15)' : '#fff', border: `1px solid ${done ? '#3d6a22' : '#b8a878'}`, borderRadius: 8, padding: 12, marginBottom: 8, fontFamily: 'Georgia, serif' }}>
              <div style={{ fontSize: 24 }}>{done ? '✅' : ready ? '🎁' : '⏳'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.w1 }}>{m.t}</div>
                <div style={{ fontSize: 11, color: C.w2 }}>{m.d}</div>
                <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>Prêmio: 🪵{fmt(m.r.w)} ⛏️{fmt(m.r.i)} 🌾{fmt(m.r.h)}</div>
              </div>
              {!done && ready && <button onClick={() => claimQuest(m.id)} style={{ background: C.green, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Receber</button>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function RecruitScreen(p) {
  return <Panel C={p.C} title="⚔️ Recrutar" onBack={() => p.setScreen('village')}><div style={{ padding: 16, color: p.C.w1 }}>Recrute tropas aqui</div></Panel>;
}

function CommandScreen(p) {
  return <Panel C={p.C} title="🛡️ Tropas" onBack={() => p.setScreen('village')}><div style={{ padding: 16, color: p.C.w1 }}>Suas tropas em campo</div></Panel>;
}

function ReportsScreen(p) {
  return <Panel C={p.C} title="📜 Relatórios" onBack={() => p.setScreen('village')}><div style={{ padding: 16, color: p.C.w1 }}>Histórico de batalhas</div></Panel>;
}

function RankingScreen(p) {
  return <Panel C={p.C} title="🏆 Classificação" onBack={() => p.setScreen('village')}><div style={{ padding: 16, color: p.C.w1 }}>Ranking de jogadores</div></Panel>;
}

function TribeScreen(p) {
  return <Panel C={p.C} title="⚜️ Tribo" onBack={() => p.setScreen('village')}><div style={{ padding: 16, color: p.C.w1 }}>Chat e coordenação tribal</div></Panel>;
}

function FriendsScreen(p) {
  return <Panel C={p.C} title="👥 Amigos" onBack={() => p.setScreen('village')}><div style={{ padding: 16, color: p.C.w1 }}>Seus amigos online</div></Panel>;
}

function ProfileScreen(p) {
  return <Panel C={p.C} title="👤 Perfil" onBack={() => p.setScreen('village')}><div style={{ padding: 16, color: p.C.w1 }}>Seu perfil e configurações</div></Panel>;
}

function Panel({ C, title, onBack, children }) {
  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'transparent', color: C.gold, border: `2px solid ${C.gold}`, padding: '6px 12px', cursor: 'pointer', marginBottom: 12, borderRadius: 6, fontWeight: 700 }}>← {title}</button>
      <div style={{ background: `linear-gradient(${C.parch}, ${C.parchD})`, border: `3px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
