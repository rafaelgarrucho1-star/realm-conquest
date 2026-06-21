import React, { useState } from 'react';

// ============================================================
// ⚔️ REALM CONQUEST — V10 "Aldeia Viva"
// • Personagens animados: soldados treinando, cavalo, operários,
//   fumaça do ferreiro, bandeiras, pássaros, fogueira
// • Estrada de terra + portão + caminhos internos + montinho
// ============================================================

const C = { gold: '#c9a961', darkGold: '#8a7a3a', parch: '#ece0c6', parchD: '#dcc9a4', w1: '#4a3a1a', w2: '#6a5a3a', w3: '#8a7a5a', border: '#b8a878', headerBg: '#2a2a2a', headerBorder: '#5a4a2a', green: '#3d6a22', blue: '#2a5a8a', purple: '#6a3a8a', red: '#8a2a2a', stone: '#9a8f78', stoneD: '#6f6553', stoneL: '#bcb29a', dirt: '#b8966a', dirtD: '#a07c4f' };

const IMG = {
  house1: 'https://opengameart.org/sites/default/files/house1_0.png',
  house1b: 'https://opengameart.org/sites/default/files/house1b.png',
  house1c: 'https://opengameart.org/sites/default/files/house1c.png',
  barracks: 'https://opengameart.org/sites/default/files/barracks_2.png',
  stable: 'https://opengameart.org/sites/default/files/stable.png',
  blacksmith: 'https://opengameart.org/sites/default/files/blacksmith.png',
  towerStone: 'https://opengameart.org/sites/default/files/watchtower_lvl2-exp_full_size.png',
  towerWood: 'https://opengameart.org/sites/default/files/watchtower_wooden_full_size.png'
};

const BUILDINGS = {
  mainBuilding: { name: 'Edifício Principal', emoji: '🏰', max: 30, w: 90, i: 80, h: 40, time: 25, desc: 'Coração da aldeia', img: IMG.towerStone },
  church: { name: 'Igreja', emoji: '⛪', max: 1, w: 2000, i: 1500, h: 1000, time: 90, desc: 'Treina sacerdotes', img: IMG.towerWood },
  smithy: { name: 'Ferreiro', emoji: '🔧', max: 20, w: 240, i: 200, h: 150, time: 55, desc: 'Pesquisa de tropas', img: IMG.blacksmith },
  barracks: { name: 'Quartel', emoji: '🎖️', max: 25, w: 100, i: 50, h: 50, time: 22, desc: 'Treina infantaria', img: IMG.barracks },
  stable: { name: 'Estábulo', emoji: '🐴', max: 20, w: 150, i: 100, h: 100, time: 34, desc: 'Cria cavalaria', img: IMG.stable },
  woodcutter: { name: 'Serraria', emoji: '🪵', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Produz madeira', img: IMG.house1 },
  mine: { name: 'Mina de Ferro', emoji: '⛏️', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Produz ferro', img: IMG.house1b },
  farm: { name: 'Fazenda', emoji: '🌾', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Produz trigo', img: IMG.house1c },
  warehouse: { name: 'Armazém', emoji: '🏠', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Guarda recursos', img: IMG.house1 },
  market: { name: 'Mercado', emoji: '🏪', max: 20, w: 100, i: 50, h: 50, time: 22, desc: 'Troca recursos', img: IMG.house1b },
  workshop: { name: 'Oficina', emoji: '🔨', max: 20, w: 200, i: 150, h: 100, time: 46, desc: 'Máquinas de cerco', img: IMG.house1c },
  wall: { name: 'Muralha', emoji: '🧱', max: 20, w: 100, i: 50, h: 50, time: 22, desc: 'Protege a aldeia', img: null }
};

const TROOPS = { spearman: { pop: 1 }, swordsman: { pop: 1 }, archer: { pop: 1 }, barbarian: { pop: 1 }, spy: { pop: 1 }, cavalry: { pop: 2 }, archerCav: { pop: 2 }, royalCav: { pop: 3 }, ram: { pop: 4 }, catapult: { pop: 5 }, priest: { pop: 20 } };

const cost = (b, lvl) => { const m = Math.pow(1.26, Math.max(0, lvl - 1)); return { w: Math.floor(b.w * m), i: Math.floor(b.i * m), h: Math.floor(b.h * m) }; };
const production = (lvl) => 50 + Math.max(0, lvl - 1) * 145;
const warehouseCap = (lvl) => Math.floor(1500 * Math.pow(1.22, Math.max(0, lvl - 1)));
const maxPop = (lvl) => Math.min(30000, 240 + Math.max(0, lvl - 1) * 260);
const fmt = (n) => Math.floor(n).toLocaleString('pt-BR');
const buildingPoints = (lvl) => lvl > 0 ? 2 * lvl * (lvl + 1) : 0;
const villagePoints = (levels, conquered) => Object.values(levels).reduce((s, l) => s + buildingPoints(l), 0) + (conquered || 0) * 2500;

const startState = () => ({
  resources: { wood: 4000, iron: 3000, wheat: 4000 },
  levels: { mainBuilding: 3, woodcutter: 5, mine: 5, farm: 5, warehouse: 5, smithy: 1, market: 0, barracks: 3, stable: 1, workshop: 0, church: 0, wall: 2 },
  troops: { spearman: 40, swordsman: 30 },
  conquered: 0, isVip: true
});

function Sprite({ img, emoji, size }) {
  const [err, setErr] = useState(false);
  if (err || !img) return <div style={{ fontSize: size, lineHeight: 1, filter: 'drop-shadow(0 5px 6px rgba(0,0,0,.45))' }}>{emoji}</div>;
  return <img src={img} alt="" onError={() => setErr(true)} style={{ width: size * 1.55, height: 'auto', display: 'block', filter: 'drop-shadow(0 6px 7px rgba(0,0,0,.5))' }} />;
}

// personagem/efeito animado (wrapper posiciona, inner anima — sem conflito de transform)
function Life({ x, y, e, anim, size, z, origin }) {
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', zIndex: z, pointerEvents: 'none' }}>
      <div style={{ fontSize: size, lineHeight: 1, animation: anim, transformOrigin: origin || 'center', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.45))' }}>{e}</div>
    </div>
  );
}

export default function App() {
  const [g, setG] = useState(startState());
  const [screen, setScreen] = useState('village');
  const [msg, setMsg] = useState('');
  const [hover, setHover] = useState(null);

  const L = g.levels, R = g.resources;
  const points = villagePoints(L, g.conquered);
  const rates = { wood: Math.floor(production(L.woodcutter) * 1.2), iron: Math.floor(production(L.mine) * 1.2), wheat: Math.floor(production(L.farm) * 1.2) };
  const popUsed = Object.entries(g.troops).reduce((s, [k, v]) => s + (TROOPS[k]?.pop || 0) * v, 0);
  const popMax = maxPop(L.farm), whCap = warehouseCap(L.warehouse);

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2500); };
  const go = (s) => { setScreen(s); setHover(null); };

  const NAV = [['village', '🏰', 'Aldeia', 0], ['mapa', '🗺️', 'Mapa', 0], ['missions', '🎯', 'Missões', 3], ['recrutar', '⚔️', 'Recrutar', 0], ['command', '🛡️', 'Tropas', 0], ['reports', '📜', 'Relatórios', 0], ['ranking', '🏆', 'Ranking', 0], ['tribo', '⚜️', 'Tribo', 0], ['amigos', '👥', 'Amigos', 0], ['perfil', '👤', 'Perfil', 0]];

  return (
    <div style={{ background: `linear-gradient(${C.parch}, ${C.parchD})`, minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', fontFamily: 'Georgia, serif', color: C.w1 }}>
      <style>{`
        * { box-sizing: border-box; } body { margin: 0; }
        @keyframes rcBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes rcBob2 { 0%,100%{transform:translateY(-2px)} 50%{transform:translateY(1px)} }
        @keyframes rcTrot { 0%,100%{transform:translateX(-9px)} 50%{transform:translateX(9px)} }
        @keyframes rcSway { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(12deg)} }
        @keyframes rcSmoke { 0%{opacity:.55;transform:translateY(0) scale(.7)} 100%{opacity:0;transform:translateY(-26px) scale(1.6)} }
        @keyframes rcSpark { 0%,100%{opacity:.12} 50%{opacity:1} }
        @keyframes rcFlap { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
        @keyframes rcFly { 0%{transform:translate(0,0)} 100%{transform:translate(320px,-26px)} }
      `}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(${C.headerBg}, #1a1a1a)`, borderBottom: `3px solid ${C.headerBorder}`, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, whiteSpace: 'nowrap' }}>⚔️ REALM CONQUEST</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['🪵', R.wood, rates.wood], ['⛏️', R.iron, rates.iron], ['🌾', R.wheat, rates.wheat]].map(([ic, val, rt], i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 11, whiteSpace: 'nowrap' }}>
              <div style={{ color: C.gold, fontWeight: 700 }}>{ic} {fmt(val)}</div>
              <div style={{ fontSize: 9, color: C.w3 }}>+{fmt(rt)}/h</div>
            </div>
          ))}
          <div style={{ textAlign: 'center', fontSize: 11, whiteSpace: 'nowrap' }}>
            <div style={{ color: C.gold, fontWeight: 700 }}>🏅 {fmt(points)}</div>
            <div style={{ fontSize: 9, color: C.w3 }}>Pontos</div>
          </div>
          <button style={{ background: C.purple, color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 10 }}>👑 VIP</button>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background: C.headerBg, borderBottom: `2px solid ${C.gold}`, display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {NAV.map(([id, icon, label, badge]) => (
          <button key={id} onClick={() => go(id)} style={{ flex: '1 1 auto', minWidth: 64, background: screen === id ? C.gold : 'transparent', color: screen === id ? '#000' : C.gold, border: 'none', padding: '8px 4px', cursor: 'pointer', fontSize: 10, fontWeight: 700, position: 'relative' }}>
            <div style={{ fontSize: 16 }}>{icon}</div>
            {label}
            {badge > 0 && <span style={{ position: 'absolute', top: 2, right: 8, background: C.red, color: '#fff', borderRadius: '50%', width: 15, height: 15, fontSize: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{badge}</span>}
          </button>
        ))}
      </div>

      {screen === 'village' && <Village L={L} R={R} g={g} go={go} hover={hover} setHover={setHover} points={points} rates={rates} popUsed={popUsed} popMax={popMax} whCap={whCap} />}
      {screen.startsWith('building_') && <BuildingPage buildingId={screen.replace('building_', '')} L={L} R={R} go={go} setG={setG} flash={flash} />}
      {!screen.startsWith('building_') && screen !== 'village' && (
        <div style={{ padding: 30, textAlign: 'center', color: C.w2, fontSize: 15 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{(NAV.find(n => n[0] === screen) || [])[1]}</div>
          {(NAV.find(n => n[0] === screen) || [])[2]} — em breve
        </div>
      )}

      {msg && <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: C.headerBg, color: C.gold, padding: '10px 16px', borderRadius: 8, border: `2px solid ${C.gold}`, zIndex: 9999 }}>{msg}</div>}
    </div>
  );
}

/* ===== MURALHA (anel + ameias + torres + portão) ===== */
function Wall({ level }) {
  const R = 38;
  const thickness = 6 + level * 1.2;
  const gateA = Math.PI / 2;          // portão embaixo
  const gateHalf = 0.24;
  const merlons = [];
  const N = 30;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    if (Math.abs(a - gateA) < gateHalf) continue; // abre espaço pro portão
    const x = 50 + R * Math.cos(a);
    const y = 50 + R * Math.sin(a);
    merlons.push(<div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 13, height: 11, background: `linear-gradient(${C.stoneL}, ${C.stoneD})`, border: `1px solid ${C.stoneD}`, borderRadius: 2, transform: `translate(-50%,-50%) rotate(${(a * 180) / Math.PI + 90}deg)`, boxShadow: '0 1px 2px rgba(0,0,0,.4)' }} />);
  }
  const towers = [45, 135, 225, 315].map((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const x = 50 + R * Math.cos(a), y = 50 + R * Math.sin(a);
    return <div key={`t${i}`} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-65%)', zIndex: 500, filter: 'drop-shadow(0 4px 5px rgba(0,0,0,.5))' }}><img src={IMG.towerStone} alt="" style={{ width: 46, display: 'block' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} /></div>;
  });
  // postes do portão (nas pontas da abertura)
  const posts = [gateA - gateHalf, gateA + gateHalf].map((a, i) => {
    const x = 50 + R * Math.cos(a), y = 50 + R * Math.sin(a);
    return <div key={`p${i}`} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 8, height: 22, background: `linear-gradient(#7a5a36,#4a3014)`, border: '1px solid #3a2410', borderRadius: 2, transform: 'translate(-50%,-70%)', zIndex: 520 }} />;
  });
  // portas de madeira
  const gx = 50 + R * Math.cos(gateA), gy = 50 + R * Math.sin(gateA);
  const gate = <div style={{ position: 'absolute', left: `${gx}%`, top: `${gy}%`, width: 34, height: 16, transform: 'translate(-50%,-70%)', zIndex: 510, display: 'flex', gap: 2 }}>
    <div style={{ flex: 1, background: 'repeating-linear-gradient(90deg,#6a4a28,#6a4a28 3px,#5a3a1e 3px,#5a3a1e 6px)', border: '1px solid #3a2410', borderRadius: '2px 0 0 2px' }} />
    <div style={{ flex: 1, background: 'repeating-linear-gradient(90deg,#6a4a28,#6a4a28 3px,#5a3a1e 3px,#5a3a1e 6px)', border: '1px solid #3a2410', borderRadius: '0 2px 2px 0' }} />
  </div>;

  return (
    <>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: `${R * 2}%`, height: `${R * 2}%`, transform: 'translate(-50%,-50%)', borderRadius: '50%', borderStyle: 'solid', borderWidth: `${thickness}px`, borderColor: `${C.stoneL} ${C.stone} ${C.stoneD} ${C.stone}`, boxShadow: 'inset 0 0 12px rgba(0,0,0,.45), 0 3px 8px rgba(0,0,0,.35)' }} />
      {merlons}{posts}{gate}{towers}
    </>
  );
}

/* ===== VILLAGE ===== */
function Village(p) {
  const { L, R, g, go, hover, setHover, points, rates, popUsed, popMax, whCap } = p;

  const layout = [
    ['mainBuilding', 50, 28, 74],
    ['smithy', 36, 37, 60], ['church', 64, 37, 60],
    ['woodcutter', 27, 47, 58], ['barracks', 43, 47, 58], ['stable', 57, 47, 58], ['mine', 73, 47, 58],
    ['market', 35, 58, 58], ['warehouse', 50, 58, 60], ['workshop', 65, 58, 58],
    ['farm', 50, 68, 58]
  ];
  const B = {}; layout.forEach(([id, x, y, s]) => { B[id] = { x, y, s }; });
  const gz = (y) => 820 + Math.round(y); // z de personagens de chão

  // personagens e efeitos que dão VIDA
  const life = [
    // bandeiras nas torres
    { x: B.mainBuilding.x, y: B.mainBuilding.y - 9, e: '🚩', anim: 'rcSway 1.6s ease-in-out infinite', size: 18, z: 1600, origin: 'bottom left' },
    { x: B.church.x, y: B.church.y - 8, e: '🚩', anim: 'rcSway 1.9s ease-in-out infinite', size: 13, z: 1600, origin: 'bottom left' },
    // ferreiro: fumaça + faíscas
    { x: B.smithy.x + 3, y: B.smithy.y - 6, e: '💨', anim: 'rcSmoke 2.4s ease-out infinite', size: 15, z: 1500 },
    { x: B.smithy.x + 3, y: B.smithy.y - 6, e: '💨', anim: 'rcSmoke 2.4s ease-out infinite 1.2s', size: 13, z: 1500 },
    { x: B.smithy.x - 1, y: B.smithy.y + 2, e: '✨', anim: 'rcSpark 0.9s ease-in-out infinite', size: 12, z: 1500 },
    // quartel: dois soldados treinando + clangor + fogueira do acampamento
    { x: B.barracks.x - 4, y: B.barracks.y + 7, e: '💂', anim: 'rcBob 0.7s ease-in-out infinite', size: 19, z: gz(B.barracks.y + 7) },
    { x: B.barracks.x + 4, y: B.barracks.y + 7, e: '🤺', anim: 'rcBob 0.7s ease-in-out infinite 0.35s', size: 19, z: gz(B.barracks.y + 7) },
    { x: B.barracks.x, y: B.barracks.y + 5, e: '⚔️', anim: 'rcSpark 0.7s ease-in-out infinite', size: 13, z: 1500 },
    { x: B.barracks.x - 9, y: B.barracks.y + 10, e: '🔥', anim: 'rcFlap 0.5s ease-in-out infinite', size: 15, z: gz(B.barracks.y + 10) },
    // estábulo: cavalo trotando
    { x: B.stable.x + 1, y: B.stable.y + 7, e: '🐎', anim: 'rcTrot 1.5s ease-in-out infinite', size: 22, z: gz(B.stable.y + 7) },
    // oficina: operário martelando + madeira (catapulta sendo montada)
    { x: B.workshop.x - 4, y: B.workshop.y + 7, e: '👷', anim: 'rcBob 0.55s ease-in-out infinite', size: 19, z: gz(B.workshop.y + 7) },
    { x: B.workshop.x + 4, y: B.workshop.y + 7, e: '🪵', anim: 'none', size: 17, z: gz(B.workshop.y + 7) },
    { x: B.workshop.x, y: B.workshop.y + 4, e: '✨', anim: 'rcSpark 1s ease-in-out infinite', size: 11, z: 1500 },
    // fazenda: camponês
    { x: B.farm.x - 5, y: B.farm.y + 6, e: '🧑‍🌾', anim: 'rcBob 0.9s ease-in-out infinite', size: 19, z: gz(B.farm.y + 6) },
    { x: B.farm.x + 6, y: B.farm.y + 5, e: '🌾', anim: 'rcSway 2.2s ease-in-out infinite', size: 14, z: gz(B.farm.y + 5), origin: 'bottom center' },
    // mercado: comerciante
    { x: B.market.x - 4, y: B.market.y + 7, e: '🧍', anim: 'rcBob2 1.2s ease-in-out infinite', size: 17, z: gz(B.market.y + 7) },
    // serraria/mina: trabalhadores
    { x: B.woodcutter.x - 2, y: B.woodcutter.y + 7, e: '🪓', anim: 'rcBob 0.6s ease-in-out infinite', size: 15, z: gz(B.woodcutter.y + 7) },
    { x: B.mine.x + 2, y: B.mine.y + 7, e: '⛏️', anim: 'rcBob 0.65s ease-in-out infinite', size: 15, z: gz(B.mine.y + 7) },
    // pássaros no céu
    { x: 12, y: 16, e: '🐦', anim: 'rcFly 9s linear infinite', size: 13, z: 1550 },
    { x: 16, y: 12, e: '🐦', anim: 'rcFly 12s linear infinite 3s', size: 11, z: 1550 }
  ];

  // detalhes estáticos (gramado, flores, pedras) — atrás dos prédios
  const props = [[32, 62, '🌿', 16], [68, 41, '🌼', 14], [46, 40, '🪨', 15], [59, 63, '🌿', 15], [40, 66, '🌼', 13], [62, 68, '🪨', 14], [30, 53, '🌿', 14], [70, 56, '🌼', 13], [44, 53, '🌼', 12]];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 132px)', minHeight: 440 }}>
      <div style={{ flex: '1 1 0', minWidth: 0, background: 'linear-gradient(160deg,#5f9f3d 0%,#356315 100%)', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '96%', maxWidth: 820, aspectRatio: '4 / 3' }}>
          {/* grama externa */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '46%', background: 'radial-gradient(ellipse at 50% 45%, #4a8a2a 0%, #2f5a16 90%)' }} />
          {/* terreno claro com vinheta */}
          <div style={{ position: 'absolute', inset: '8%', borderRadius: '50%', background: 'radial-gradient(ellipse at 46% 36%, #7cbb4d 0%, #5d9d34 45%, #41761f 100%)', boxShadow: 'inset 0 -22px 50px rgba(0,0,0,.35), inset 0 14px 30px rgba(255,255,255,.12)' }} />

          {/* estrada de terra chegando na aldeia (entra pelo portão de baixo) */}
          <div style={{ position: 'absolute', left: '50%', top: '85%', width: '30%', height: '20%', transform: 'translateX(-50%)', background: `repeating-linear-gradient(0deg,${C.dirt},${C.dirt} 6px,${C.dirtD} 6px,${C.dirtD} 12px)`, clipPath: 'polygon(36% 0,64% 0,84% 100%,16% 100%)', boxShadow: 'inset 0 0 8px rgba(0,0,0,.3)' }} />
          {/* caminhos internos de terra */}
          <div style={{ position: 'absolute', left: '50%', top: '30%', width: 14, height: '56%', background: C.dirt, borderRadius: 8, transform: 'translateX(-50%)', boxShadow: 'inset 0 0 6px rgba(0,0,0,.25)' }} />
          <div style={{ position: 'absolute', left: '24%', top: '52%', width: '52%', height: 12, background: C.dirt, borderRadius: 8, transform: 'translateY(-50%)', boxShadow: 'inset 0 0 6px rgba(0,0,0,.25)' }} />

          {/* montinho (elevação) sob o Edifício Principal */}
          <div style={{ position: 'absolute', left: '50%', top: '30%', width: '22%', height: '11%', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 40%, #86c455 0%, #5d9d34 80%)', boxShadow: '0 6px 12px rgba(0,0,0,.3)' }} />

          {/* MURALHA */}
          <Wall level={L.wall || 0} />

          {/* árvores fora da muralha */}
          {[[12, 22], [88, 24], [10, 78], [90, 76], [50, 8]].map(([x, y], i) => (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', fontSize: 24, zIndex: 400, filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.4))' }}>🌲</div>
          ))}

          {/* detalhes estáticos */}
          {props.map(([x, y, e, s], i) => (
            <div key={`pr${i}`} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', fontSize: s, zIndex: 500 + Math.round(y), pointerEvents: 'none', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.3))' }}>{e}</div>
          ))}

          {/* PRÉDIOS */}
          {layout.map(([bid, x, y, size]) => {
            const b = BUILDINGS[bid];
            if (!b) return null;
            const lvl = L[bid] || 0;
            const isH = hover === bid;
            const below = y < 42;
            return (
              <div key={bid} onClick={() => go(`building_${bid}`)} onMouseEnter={() => setHover(bid)} onMouseLeave={() => setHover(null)}
                style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) scale(${isH ? 1.1 : 1})`, transition: 'transform .15s', cursor: 'pointer', zIndex: isH ? 1200 : 600 + Math.round(y) }}>
                <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: size * 0.95, height: size * 0.28, background: 'rgba(0,0,0,.3)', borderRadius: '50%', filter: 'blur(3px)' }} />
                <Sprite img={b.img} emoji={b.emoji} size={size} />
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: C.gold, minWidth: 26, height: 26, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, border: `2px solid ${C.gold}`, padding: '0 4px' }}>{lvl}</div>
                <div style={{ position: 'absolute', bottom: 2, right: -2, background: 'rgba(255,255,255,.92)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: `1.5px solid ${C.darkGold}`, boxShadow: '0 1px 3px rgba(0,0,0,.4)' }}>{b.emoji}</div>
                {isH && (
                  <div style={{ position: 'absolute', [below ? 'top' : 'bottom']: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.95)', color: '#fff', padding: '9px 11px', borderRadius: 8, border: `2px solid ${C.gold}`, width: 168, textAlign: 'center', zIndex: 2000 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>{b.name}</div>
                    <div style={{ fontSize: 10, color: C.gold, marginBottom: 4 }}>Nível {lvl}/{b.max}</div>
                    <div style={{ fontSize: 10, color: '#ddd', marginBottom: 6 }}>{b.desc}</div>
                    <div style={{ fontSize: 9, color: C.gold, fontWeight: 700 }}>Clique para melhorar ▸</div>
                  </div>
                )}
              </div>
            );
          })}

          {/* VIDA (personagens animados) */}
          {life.map((l, i) => <Life key={`l${i}`} {...l} />)}
        </div>
      </div>

      {/* SIDEBAR */}
      <div style={{ width: 300, flexShrink: 0, background: `linear-gradient(${C.parch}, ${C.parchD})`, borderLeft: `3px solid ${C.border}`, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Panel title="📊 Resumo" bg={C.blue}>
          <Row k="🏅 Pontos" v={fmt(points)} />
          <Row k="👥 População" v={`${fmt(popUsed)} / ${fmt(popMax)}`} />
          <Row k="📦 Armazém" v={`${fmt(R.wood + R.iron + R.wheat)} / ${fmt(whCap * 3)}`} />
        </Panel>
        <Panel title="⚒️ Produção / h" bg={C.green}>
          <Row k="🪵 Madeira" v={`+${fmt(rates.wood)}`} />
          <Row k="⛏️ Ferro" v={`+${fmt(rates.iron)}`} />
          <Row k="🌾 Trigo" v={`+${fmt(rates.wheat)}`} />
        </Panel>
        <Panel title="✨ Efeitos" bg={C.purple}>
          <Row k="👑 VIP" v="+20% prod" />
          <Row k="🧱 Muralha" v={`+${(L.wall || 0) * 5}% def`} />
          <Row k="📍 Aldeias" v={`${1 + g.conquered}`} />
        </Panel>
        <Panel title="🎯 Missões" bg={C.darkGold}>
          <Row k="✅ Prontas" v="3" />
          <Row k="⏳ Em progresso" v="7" />
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, bg, children }) {
  return (
    <div style={{ width: '100%', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: bg, color: '#fff', fontSize: 12, fontWeight: 700, padding: '7px 11px' }}>{title}</div>
      <div style={{ padding: '7px 11px' }}>{children}</div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 12 }}>
      <span style={{ color: C.w2, whiteSpace: 'nowrap' }}>{k}</span>
      <b style={{ color: C.w1, whiteSpace: 'nowrap', textAlign: 'right' }}>{v}</b>
    </div>
  );
}

/* ===== PÁGINA DO PRÉDIO ===== */
function BuildingPage({ buildingId, L, R, go, setG, flash }) {
  const b = BUILDINGS[buildingId];
  if (!b) return null;
  const lvl = L[buildingId] || 0;
  const c = cost(b, lvl + 1);
  const canBuild = lvl < b.max;
  const canAfford = R.wood >= c.w && R.iron >= c.i && R.wheat >= c.h;

  const upgrade = () => {
    if (!canBuild) { flash('❌ Nível máximo'); return; }
    if (!canAfford) { flash('❌ Recursos insuficientes'); return; }
    setG(prev => ({ ...prev, resources: { wood: prev.resources.wood - c.w, iron: prev.resources.iron - c.i, wheat: prev.resources.wheat - c.h }, levels: { ...prev.levels, [buildingId]: lvl + 1 } }));
    flash(`✅ ${b.name} → nível ${lvl + 1}!`);
    go('village');
  };

  return (
    <div style={{ padding: 20, maxWidth: 640, margin: '0 auto' }}>
      <button onClick={() => go('village')} style={{ background: 'transparent', color: C.darkGold, border: `2px solid ${C.border}`, padding: '8px 16px', marginBottom: 16, borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>← Voltar à aldeia</button>
      <div style={{ background: '#fff', border: `3px solid ${C.border}`, borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,.15)' }}>
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><Sprite img={b.img} emoji={b.emoji} size={92} /></div>
        <h1 style={{ fontSize: 26, margin: '0 0 6px', color: C.w1 }}>{b.name}</h1>
        <p style={{ fontSize: 13, color: C.w2, margin: '0 0 18px' }}>{b.desc}</p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 18, alignItems: 'center', justifyContent: 'center' }}>
          <div><div style={{ fontSize: 12, color: C.w2 }}>Nível atual</div><div style={{ fontSize: 26, fontWeight: 700, color: C.darkGold }}>{lvl}</div></div>
          <div style={{ fontSize: 26, color: C.border }}>→</div>
          <div><div style={{ fontSize: 12, color: C.w2 }}>Próximo</div><div style={{ fontSize: 26, fontWeight: 700, color: canBuild ? C.green : '#aaa' }}>{canBuild ? lvl + 1 : 'Máx'}</div></div>
        </div>
        {canBuild ? (
          <>
            <div style={{ background: canAfford ? 'rgba(61,106,34,.12)' : 'rgba(138,42,42,.12)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: C.w1, fontSize: 13 }}>Custo da melhoria</div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                <span style={{ color: R.wood >= c.w ? C.green : C.red }}>🪵 {fmt(c.w)}</span>
                <span style={{ color: R.iron >= c.i ? C.green : C.red }}>⛏️ {fmt(c.i)}</span>
                <span style={{ color: R.wheat >= c.h ? C.green : C.red }}>🌾 {fmt(c.h)}</span>
              </div>
            </div>
            <button onClick={upgrade} disabled={!canAfford} style={{ width: '100%', padding: 13, fontSize: 15, fontWeight: 700, background: canAfford ? C.green : '#aaa', color: '#fff', border: 'none', borderRadius: 8, cursor: canAfford ? 'pointer' : 'not-allowed' }}>
              {canAfford ? '🔨 Construir' : '❌ Recursos insuficientes'}
            </button>
          </>
        ) : <div style={{ padding: 12, color: C.w2, fontWeight: 700 }}>✅ Nível máximo atingido</div>}
      </div>
    </div>
  );
}
