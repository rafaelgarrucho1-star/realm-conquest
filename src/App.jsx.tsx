import React, { useState, useEffect } from 'react';

// ============================================================
// ⚔️ REALM CONQUEST — V6 (ARTE REAL — Texturas, sombras, detalhes)
// Cada prédio com textura realista · Aldeia medieval verdadeira
// ============================================================

const C = { gold: '#c9a961', darkGold: '#8a7a3a', parch: '#ece0c6', parchD: '#dcc9a4', w1: '#4a3a1a', w2: '#6a5a3a', w3: '#8a7a5a', border: '#b8a878', headerBg: '#2a2a2a', headerBorder: '#5a4a2a', green: '#3d6a22', greenLight: '#5a9a3a', blue: '#2a5a8a', blueLight: '#4a7aaa', purple: '#6a3a8a', purpleLight: '#8a5aaa', red: '#8a2a2a' };

const BUILDINGS = {
  mainBuilding: { name: 'Edifício Principal', icon: '🏛️', max: 30, w: 90, i: 80, h: 40, time: 25, desc: 'Coração da aldeia', viz: { cx: 500, cy: 286 } },
  commandCenter: { name: 'Centro de Comando', icon: '🏰', max: 1, w: 0, i: 0, h: 0, time: 1, desc: 'Quartel-general', viz: { cx: 492, cy: 402 } },
  church: { name: 'Igreja', icon: '⛪', max: 1, w: 2000, i: 1500, h: 1000, time: 90, desc: 'Treina sacerdotes', viz: { cx: 690, cy: 226 } },
  woodcutter: { name: 'Serraria', icon: '🪵', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Corta madeira', viz: { cx: 322, cy: 226 } },
  mine: { name: 'Mina de Ferro', icon: '⛏️', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Extrai ferro', viz: { cx: 500, cy: 198 } },
  smithy: { name: 'Ferreiro', icon: '🔧', max: 20, w: 240, i: 200, h: 150, time: 55, desc: 'Pesquisa tropas', viz: { cx: 234, cy: 316 } },
  market: { name: 'Mercado', icon: '🏪', max: 20, w: 100, i: 50, h: 50, time: 22, desc: 'Troca recursos', viz: { cx: 768, cy: 320 } },
  barracks: { name: 'Quartel', icon: '🎖️', max: 25, w: 100, i: 50, h: 50, time: 22, desc: 'Treina infantaria', viz: { cx: 352, cy: 398 } },
  stable: { name: 'Estábulo', icon: '🐴', max: 20, w: 150, i: 100, h: 100, time: 34, desc: 'Cria cavalaria', viz: { cx: 648, cy: 398 } },
  warehouse: { name: 'Armazém', icon: '🏠', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Guarda recursos', viz: { cx: 288, cy: 486 } },
  farm: { name: 'Fazenda', icon: '🌾', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Produz trigo', viz: { cx: 512, cy: 502 } },
  workshop: { name: 'Oficina', icon: '🔨', max: 20, w: 200, i: 150, h: 100, time: 46, desc: 'Máquinas de cerco', viz: { cx: 712, cy: 486 } },
  wall: { name: 'Muralha', icon: '🧱', max: 20, w: 100, i: 50, h: 50, time: 22, desc: 'Protege aldeia', viz: { wall: true } }
};

const TROOPS = {
  spearman: { name: 'Lanceiro', icon: '🔱', atk: 8, def: 12, pop: 1, h: 55, time: 6 },
  swordsman: { name: 'Espadachim', icon: '🗡️', atk: 10, def: 8, pop: 1, h: 50, time: 7 },
  archer: { name: 'Arqueiro', icon: '🏹', atk: 12, def: 4, pop: 1, h: 50, time: 9 },
  barbarian: { name: 'Bárbaro', icon: '🪓', atk: 15, def: 10, pop: 1, h: 80, time: 12 },
  spy: { name: 'Espião', icon: '🕵️', atk: 0, def: 0, pop: 1, h: 100, time: 8 },
  cavalry: { name: 'Cavalaria', icon: '🐴', atk: 25, def: 15, pop: 2, h: 200, time: 18 },
  archerCav: { name: 'Arq. a Cavalo', icon: '🐎', atk: 18, def: 10, pop: 2, h: 180, time: 15 },
  royalCav: { name: 'Cavalaria Real', icon: '👑', atk: 40, def: 25, pop: 3, h: 300, time: 25 },
  ram: { name: 'Aríete', icon: '⚒️', atk: 50, def: 8, pop: 4, h: 100, time: 22 },
  catapult: { name: 'Catapulta', icon: '💣', atk: 80, def: 2, pop: 5, h: 400, time: 30 },
  priest: { name: 'Sacerdote', icon: '✝️', atk: 0, def: 5, pop: 20, h: 5000, time: 60 }
};

const cost = (b, lvl) => { const m = Math.pow(1.26, Math.max(0, lvl - 1)); return { w: Math.floor(b.w * m), i: Math.floor(b.i * m), h: Math.floor(b.h * m) }; };
const production = (lvl) => 50 + Math.max(0, lvl - 1) * 145;
const warehouseCap = (lvl) => Math.floor(1500 * Math.pow(1.22, Math.max(0, lvl - 1)));
const maxPop = (lvl) => Math.min(30000, 240 + Math.max(0, lvl - 1) * 260);
const fmt = (n) => Math.floor(n).toLocaleString('pt-BR');
const buildingPoints = (lvl) => lvl > 0 ? 2 * lvl * (lvl + 1) : 0;
const villagePoints = (levels, conquered) => Object.values(levels).reduce((s, l) => s + buildingPoints(l), 0) + (conquered || 0) * 2500;

const startState = () => ({
  resources: { wood: 4000, iron: 3000, wheat: 4000 },
  levels: { mainBuilding: 3, commandCenter: 1, woodcutter: 5, mine: 5, farm: 5, warehouse: 5, smithy: 1, market: 0, barracks: 3, stable: 1, workshop: 0, church: 0, wall: 2 },
  troops: { spearman: 40, swordsman: 30, archer: 0, barbarian: 0, spy: 0, cavalry: 0, archerCav: 0, royalCav: 0, ram: 0, catapult: 0, priest: 0 },
  conquered: 0, isVip: true, questsClaimed: []
});

export default function App() {
  const [g, setG] = useState(startState());
  const [screen, setScreen] = useState('village');
  const [msg, setMsg] = useState('');
  const [tooltip, setTooltip] = useState(null);

  const L = g.levels;
  const R = g.resources;
  const T = g.troops;
  const points = villagePoints(L, g.conquered);
  const rates = { wood: Math.floor(production(L.woodcutter) * 1.2), iron: Math.floor(production(L.mine) * 1.2), wheat: Math.floor(production(L.farm) * 1.2) };
  const popUsed = Object.entries(T).reduce((s, [k, v]) => s + (TROOPS[k]?.pop || 0) * v, 0);
  const popMax = maxPop(L.farm);
  const whCap = warehouseCap(L.warehouse);

  const flash = (txt) => { setMsg(txt); setTimeout(() => setMsg(''), 3000); };
  const setScreen_safe = (s) => { if (s.startsWith('building_')) { setScreen(s); } else { setScreen(s); setTooltip(null); } };

  const NAV = [['village', '🏰', 'Aldeia', 0], ['mapa', '🗺️', 'Mapa', 0], ['missions', '🎯', 'Missões', 3], ['recrutar', '⚔️', 'Recrutar', 0], ['command', '🛡️', 'Tropas', 0], ['reports', '📜', 'Relatórios', 0], ['ranking', '🏆', 'Ranking', 0], ['tribo', '⚜️', 'Tribo', 0], ['amigos', '👥', 'Amigos', 0], ['perfil', '👤', 'Perfil', 0]];

  return (
    <div style={{ background: `linear-gradient(${C.parch}, ${C.parchD})`, minHeight: '100vh', fontFamily: 'Georgia, serif', color: C.w1, overflow: 'hidden' }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(${C.headerBg}, #1a1a1a)`, borderBottom: `3px solid ${C.headerBorder}`, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>⚔️ REALM CONQUEST</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'center', fontSize: 11 }}>
            <div style={{ color: C.gold, fontWeight: 700 }}>🪵 {fmt(R.wood)}</div>
            <div style={{ fontSize: 9, color: C.w3 }}>+{fmt(rates.wood)}/h</div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11 }}>
            <div style={{ color: C.gold, fontWeight: 700 }}>⛏️ {fmt(R.iron)}</div>
            <div style={{ fontSize: 9, color: C.w3 }}>+{fmt(rates.iron)}/h</div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11 }}>
            <div style={{ color: C.gold, fontWeight: 700 }}>🌾 {fmt(R.wheat)}</div>
            <div style={{ fontSize: 9, color: C.w3 }}>+{fmt(rates.wheat)}/h</div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11 }}>
            <div style={{ color: C.gold, fontWeight: 700 }}>🏅 {fmt(points)}</div>
            <div style={{ fontSize: 9, color: C.w3 }}>Pontos</div>
          </div>
          <button style={{ background: C.purple, color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 10 }}>👑 VIP</button>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background: C.headerBg, borderBottom: `2px solid ${C.gold}`, display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
        {NAV.map(([id, icon, label, badge]) => (
          <button key={id} onClick={() => setScreen_safe(id)} style={{ flex: 1, background: screen === id ? C.gold : 'transparent', color: screen === id ? '#000' : C.gold, border: 'none', padding: '10px', cursor: 'pointer', fontSize: 10, fontWeight: 700, position: 'relative' }}>
            <div style={{ fontSize: 16 }}>{icon}</div>
            {label}
            {badge > 0 && <div style={{ position: 'absolute', top: 2, right: 2, background: C.red, color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{badge}</div>}
          </button>
        ))}
      </div>

      {/* TELAS */}
      {screen === 'village' && <VillageScreen L={L} R={R} g={g} C={C} setScreen={setScreen_safe} tooltip={tooltip} setTooltip={setTooltip} points={points} rates={rates} popUsed={popUsed} popMax={popMax} whCap={whCap} />}
      {screen.startsWith('building_') && <BuildingPage buildingId={screen.replace('building_', '')} L={L} R={R} C={C} setScreen={setScreen_safe} g={g} setG={setG} flash={flash} />}
      {screen === 'mapa' && <div style={{ padding: 20, color: C.w1 }}>🗺️ Mapa (em breve)</div>}
      {screen === 'missions' && <div style={{ padding: 20, color: C.w1 }}>🎯 Missões (em breve)</div>}
      {screen === 'recrutar' && <div style={{ padding: 20, color: C.w1 }}>⚔️ Recrutar (em breve)</div>}
      {screen === 'command' && <div style={{ padding: 20, color: C.w1 }}>🛡️ Tropas (em breve)</div>}
      {screen === 'reports' && <div style={{ padding: 20, color: C.w1 }}>📜 Relatórios (em breve)</div>}
      {screen === 'ranking' && <div style={{ padding: 20, color: C.w1 }}>🏆 Ranking (em breve)</div>}
      {screen === 'tribo' && <div style={{ padding: 20, color: C.w1 }}>⚜️ Tribo (em breve)</div>}
      {screen === 'amigos' && <div style={{ padding: 20, color: C.w1 }}>👥 Amigos (em breve)</div>}
      {screen === 'perfil' && <div style={{ padding: 20, color: C.w1 }}>👤 Perfil (em breve)</div>}

      {msg && <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: C.headerBg, color: C.gold, padding: '10px 16px', borderRadius: 8, border: `2px solid ${C.gold}`, zIndex: 9999 }}>{msg}</div>}
    </div>
  );
}

/* ===== VILLAGE SCREEN ===== */
function VillageScreen(p) {
  const { L, R, g, C, setScreen, tooltip, setTooltip, points, rates, popUsed, popMax, whCap } = p;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 0 }}>
      {/* ALDEIA (70%) */}
      <div style={{ flex: '0 0 70%', background: '#4a7a30', overflow: 'auto' }}>
        <svg viewBox="0 0 1000 700" style={{ width: '100%', height: '100%', minHeight: 500, background: '#4a7a30' }}>
          <defs>
            {/* Textura de grama */}
            <pattern id="grassTexture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="#4a8a2a" />
              <circle cx="20" cy="20" r="2" fill="#2a5a1a" opacity="0.3" />
              <circle cx="60" cy="40" r="2" fill="#2a5a1a" opacity="0.3" />
              <circle cx="80" cy="70" r="2" fill="#2a5a1a" opacity="0.3" />
            </pattern>

            {/* Gradientes para prédios */}
            <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d9a962" />
              <stop offset="50%" stopColor="#c89450" />
              <stop offset="100%" stopColor="#a67c3a" />
            </linearGradient>

            <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c8c0b8" />
              <stop offset="50%" stopColor="#b8a8a0" />
              <stop offset="100%" stopColor="#988880" />
            </linearGradient>

            <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a84a2a" />
              <stop offset="50%" stopColor="#883a1a" />
              <stop offset="100%" stopColor="#682a0a" />
            </linearGradient>
          </defs>

          {/* Grama com textura */}
          <ellipse cx="500" cy="350" rx="480" ry="260" fill="#3a6a1a" />
          <ellipse cx="500" cy="350" rx="460" ry="240" fill="url(#grassTexture)" />
          <ellipse cx="500" cy="340" rx="450" ry="230" fill="#4a8a2a" opacity="0.6" />

          {/* Sombras do terreno */}
          <ellipse cx="280" cy="250" rx="120" ry="50" fill="rgba(0,0,0,0.08)" />
          <ellipse cx="720" cy="450" rx="140" ry="60" fill="rgba(0,0,0,0.1)" />

          {/* PRÉDIOS COM ARTE REAL */}
          {Object.entries(BUILDINGS).map(([bid, b]) => {
            if (!b.viz || !b.viz.cx) return null;
            const lvl = L[bid] || 0;
            const isHovered = tooltip === bid;

            return (
              <g key={bid} onClick={() => setScreen(`building_${bid}`)} onMouseEnter={() => setTooltip(bid)} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}>
                {/* Sombra de contato */}
                <ellipse cx={b.viz.cx} cy={b.viz.cy + 45} rx="55" ry="20" fill="rgba(0,0,0,0.25)" />

                {/* PRÉDIO COM DETALHES */}
                <RealBuilding bid={bid} lvl={lvl} cx={b.viz.cx} cy={b.viz.cy} C={C} />

                {/* Nível destacado */}
                <circle cx={b.viz.cx} cy={b.viz.cy - 60} r="20" fill="rgba(0,0,0,0.9)" stroke={C.gold} strokeWidth="2" />
                <text x={b.viz.cx} y={b.viz.cy - 53} textAnchor="middle" fontSize="18" fill={C.gold} fontWeight="700">{lvl}</text>

                {/* TOOLTIP */}
                {isHovered && (
                  <foreignObject x={b.viz.cx - 100} y={b.viz.cy - 150} width="200" height="130">
                    <div style={{ background: 'rgba(0,0,0,0.95)', color: C.gold, padding: '12px', borderRadius: 8, fontSize: 12, border: `2px solid ${C.gold}`, fontFamily: 'Georgia, serif', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 6 }}>
                        {BUILDINGS[bid].name}
                      </div>
                      <div style={{ fontSize: 11, color: C.gold, marginBottom: 6 }}>
                        Nível {lvl}/{BUILDINGS[bid].max}
                      </div>
                      <div style={{ fontSize: 10, color: '#ddd', lineHeight: 1.4, marginBottom: 8 }}>
                        {BUILDINGS[bid].desc}
                      </div>
                      <div style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}>
                        → Clique para upgrade
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* SIDEBAR (30%) */}
      <div style={{ flex: '0 0 30%', background: `linear-gradient(${C.parch}, ${C.parchD})`, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <MiniPanel title="📊 Resumo" bg={C.blue}>
          <Line k="🏅 Pontos" v={fmt(points)} />
          <Line k="👥 População" v={`${fmt(popUsed)}/${fmt(popMax)}`} />
          <Line k="📦 Armazém" v={`${fmt(R.wood + R.iron + R.wheat)}/${fmt(whCap * 3)}`} />
        </MiniPanel>

        <MiniPanel title="⚒️ Produção/h" bg={C.green}>
          <Line k="🪵 Madeira" v={`+${fmt(rates.wood)}`} />
          <Line k="⛏️ Ferro" v={`+${fmt(rates.iron)}`} />
          <Line k="🌾 Trigo" v={`+${fmt(rates.wheat)}`} />
        </MiniPanel>

        <MiniPanel title="✨ Efeitos" bg={C.purple}>
          <Line k="👑" v="VIP +20% prod" />
          <Line k="🧱" v={`+${L.wall * 5}% def`} />
          <Line k="📍" v={`${1 + g.conquered} aldeias`} />
        </MiniPanel>

        <MiniPanel title="🎯 Missões" bg={C.darkGold}>
          <Line k="✅" v="3 prontas" />
          <Line k="⏳" v="7 em progresso" />
        </MiniPanel>
      </div>
    </div>
  );
}

/* ===== PRÉDIOS COM ARTE REAL ===== */
function RealBuilding({ bid, lvl, cx, cy, C }) {
  // Cada prédio tem arte customizada com texturas reais

  if (bid === 'mainBuilding') {
    return (
      <g>
        {/* Parede com textura de pedra */}
        <rect x={cx - 45} y={cy - 55} width="90" height="70" fill="url(#stoneGrad)" stroke="#7a6850" strokeWidth="2" />
        {/* Detalhes: janelas */}
        <rect x={cx - 30} y={cy - 45} width="12" height="12" fill="#4a3a2a" stroke="#2a1a0a" strokeWidth="1" />
        <rect x={cx + 18} y={cy - 45} width="12" height="12" fill="#4a3a2a" stroke="#2a1a0a" strokeWidth="1" />
        {/* Telhado 3D */}
        <polygon points={`${cx - 45},${cy - 55} ${cx},${cy - 90} ${cx + 45},${cy - 55}`} fill="url(#roofGrad)" stroke="#502010" strokeWidth="2" />
        {/* Sombra do telhado */}
        <polygon points={`${cx},${cy - 90} ${cx + 45},${cy - 55} ${cx + 35},${cy - 45}`} fill="rgba(0,0,0,0.2)" />
        {/* Porta */}
        <rect x={cx - 12} y={cy - 5} width="24" height="30" fill="#6a4a2a" stroke="#3a2a0a" strokeWidth="2" rx="2" />
      </g>
    );
  }

  if (bid === 'farm') {
    return (
      <g>
        {/* Estrutura de madeira */}
        <rect x={cx - 40} y={cy - 35} width="80" height="45" fill="url(#woodGrad)" stroke="#8a6a40" strokeWidth="2" />
        {/* Telhado palha */}
        <polygon points={`${cx - 40},${cy - 35} ${cx},${cy - 65} ${cx + 40},${cy - 35}`} fill="#c9a540" stroke="#9a7a20" strokeWidth="2" />
        {/* Textura palha */}
        <path d={`M ${cx - 30},${cy - 50} Q ${cx - 15},${cy - 60} ${cx},${cy - 55}`} stroke="#8a6a20" strokeWidth="1" fill="none" opacity="0.5" />
        <path d={`M ${cx},${cy - 55} Q ${cx + 15},${cy - 60} ${cx + 30},${cy - 50}`} stroke="#8a6a20" strokeWidth="1" fill="none" opacity="0.5" />
        {/* Janelas */}
        <circle cx={cx - 20} cy={cy - 15} r="6" fill="#3a2a1a" />
        <circle cx={cx + 20} cy={cy - 15} r="6" fill="#3a2a1a" />
        {/* Sombra interna */}
        <rect x={cx - 40} y={cy - 35} width="80" height="45" fill="rgba(0,0,0,0.1)" opacity="0.3" />
      </g>
    );
  }

  if (bid === 'barracks') {
    return (
      <g>
        {/* Parede de madeira escura */}
        <rect x={cx - 40} y={cy - 45} width="80" height="55" fill="#8a6a4a" stroke="#5a4a2a" strokeWidth="2" />
        {/* Padrão de tábuas */}
        <line x1={cx - 40} y1={cy - 35} x2={cx + 40} y2={cy - 35} stroke="#5a4a2a" strokeWidth="1" opacity="0.5" />
        <line x1={cx - 40} y1={cy - 20} x2={cx + 40} y2={cy - 20} stroke="#5a4a2a" strokeWidth="1" opacity="0.5" />
        {/* Telhado de madeira */}
        <polygon points={`${cx - 40},${cy - 45} ${cx},${cy - 75} ${cx + 40},${cy - 45}`} fill="url(#roofGrad)" stroke="#502010" strokeWidth="2" />
        {/* Porta grande (quartel) */}
        <rect x={cx - 18} y={cy - 15} width="36" height="40" fill="#4a3a2a" stroke="#2a1a0a" strokeWidth="2" rx="2" />
        {/* Maçaneta */}
        <circle cx={cx + 14} cy={cy + 5} r="3" fill="#c9a961" />
      </g>
    );
  }

  if (bid === 'stable') {
    return (
      <g>
        {/* Parede de madeira clara (celeiro) */}
        <rect x={cx - 45} y={cy - 50} width="90" height="60" fill="#c89450" stroke="#9a6a30" strokeWidth="2" />
        {/* Padrão cruzado (X bracing) */}
        <line x1={cx - 45} y1={cy - 50} x2={cx + 45} y2={cy + 10} stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
        <line x1={cx + 45} y1={cy - 50} x2={cx - 45} y2={cy + 10} stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
        {/* Telhado grande */}
        <polygon points={`${cx - 45},${cy - 50} ${cx},${cy - 85} ${cx + 45},${cy - 50}`} fill="url(#roofGrad)" stroke="#502010" strokeWidth="2" />
        {/* Duas aberturas grandes (para cavalos) */}
        <rect x={cx - 35} y={cy - 25} width="28" height="35" fill="#3a2a1a" stroke="#1a0a0a" strokeWidth="2" />
        <rect x={cx + 7} y={cy - 25} width="28" height="35" fill="#3a2a1a" stroke="#1a0a0a" strokeWidth="2" />
      </g>
    );
  }

  // Default para outros prédios
  return (
    <g>
      <rect x={cx - 40} y={cy - 40} width="80" height="50" fill="url(#woodGrad)" stroke="#8a6a40" strokeWidth="2" />
      <polygon points={`${cx - 40},${cy - 40} ${cx},${cy - 70} ${cx + 40},${cy - 40}`} fill="url(#roofGrad)" stroke="#502010" strokeWidth="2" />
      <rect x={cx - 12} y={cy - 10} width="24" height="30" fill="#4a3a2a" stroke="#2a1a0a" strokeWidth="2" rx="2" />
    </g>
  );
}

function MiniPanel({ title, bg, children }) {
  const C = { parch: '#ece0c6', parchD: '#dcc9a4', border: '#b8a878' };
  return (
    <div style={{ background: `linear-gradient(${C.parch}, ${C.parchD})`, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: bg, color: '#fff', fontSize: 11, fontWeight: 700, padding: '6px 10px' }}>{title}</div>
      <div style={{ padding: '8px 10px', fontSize: 10 }}>{children}</div>
    </div>
  );
}

function Line({ k, v }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span>{k}</span><b>{v}</b></div>;
}

/* ===== BUILDING PAGE ===== */
function BuildingPage({ buildingId, L, R, C, setScreen, g, setG, flash }) {
  const b = BUILDINGS[buildingId];
  if (!b) return null;

  const lvl = L[buildingId] || 0;
  const c = cost(b, lvl + 1);
  const canBuild = lvl < b.max;
  const canAfford = R.wood >= c.w && R.iron >= c.i && R.wheat >= c.h;

  const upgrade = () => {
    if (!canBuild) { flash('❌ Máximo'); return; }
    if (!canAfford) { flash('❌ Recursos'); return; }
    setG(p => ({ ...p, resources: { wood: p.resources.wood - c.w, iron: p.resources.iron - c.i, wheat: p.resources.wheat - c.h } }));
    flash('✅ Construindo!');
    setScreen('village');
  };

  return (
    <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto', fontFamily: 'Georgia, serif' }}>
      <button onClick={() => setScreen('village')} style={{ background: 'transparent', color: C.gold, border: `2px solid ${C.gold}`, padding: '8px 16px', marginBottom: 16, borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>← Voltar</button>

      <div style={{ background: `linear-gradient(${C.parch}, ${C.parchD})`, border: `3px solid ${C.border}`, borderRadius: 12, padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{b.icon}</div>
        <h1 style={{ fontSize: 28, margin: 0, marginBottom: 8, color: C.w1 }}>{b.name}</h1>
        <p style={{ fontSize: 13, color: C.w2, margin: 0, marginBottom: 16 }}>{b.desc}</p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 13 }}>
          <div style={{ flex: 1 }}><div style={{ color: C.w2 }}>Nível Atual</div><div style={{ fontSize: 24, fontWeight: 700, color: C.gold }}>{lvl}</div></div>
          <div style={{ fontSize: 28, color: C.border }}>→</div>
          <div style={{ flex: 1 }}><div style={{ color: C.w2 }}>Próximo</div><div style={{ fontSize: 24, fontWeight: 700, color: canBuild ? C.gold : '#999' }}>{canBuild ? lvl + 1 : 'Max'}</div></div>
        </div>

        {canBuild && (
          <>
            <div style={{ background: canAfford ? 'rgba(61,106,34,.15)' : 'rgba(138,42,42,.15)', borderRadius: 8, padding: '12px', marginBottom: 16, fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: C.w1 }}>Custo:</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <div>🪵 {fmt(c.w)}</div>
                <div>⛏️ {fmt(c.i)}</div>
                <div>🌾 {fmt(c.h)}</div>
              </div>
            </div>
            <button onClick={upgrade} style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, background: canAfford ? C.green : '#999', color: '#fff', border: 'none', borderRadius: 8, cursor: canAfford ? 'pointer' : 'not-allowed' }}>
              {canAfford ? '🔨 Construir' : '❌ Insuficiente'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
