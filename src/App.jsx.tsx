import React, { useState } from 'react';

// ============================================================
// ⚔️ REALM CONQUEST — V8
// • URLs de imagens CORRETAS (confirmadas no OpenGameArt, CC0)
// • Rede de segurança: se imagem falhar, mostra ícone limpo (nunca quebra)
// • Sidebar corrigido de verdade (min-width:0 + largura fixa + box-sizing)
// ============================================================

const C = { gold: '#c9a961', darkGold: '#8a7a3a', parch: '#ece0c6', parchD: '#dcc9a4', w1: '#4a3a1a', w2: '#6a5a3a', w3: '#8a7a5a', border: '#b8a878', headerBg: '#2a2a2a', headerBorder: '#5a4a2a', green: '#3d6a22', blue: '#2a5a8a', purple: '#6a3a8a', red: '#8a2a2a' };

// Assets profissionais CC0 — URLs confirmadas direto do OpenGameArt
const IMG = {
  house1: 'https://opengameart.org/sites/default/files/house1_0.png',
  house1b: 'https://opengameart.org/sites/default/files/house1b.png',
  house1c: 'https://opengameart.org/sites/default/files/house1c.png',
  barracks: 'https://opengameart.org/sites/default/files/barracks_2.png',
  stable: 'https://opengameart.org/sites/default/files/stable.png',
  blacksmith: 'https://opengameart.org/sites/default/files/blacksmith.png',
  tower: 'https://opengameart.org/sites/default/files/watchtower_lvl2-exp_full_size.png'
};

const BUILDINGS = {
  mainBuilding: { name: 'Edifício Principal', emoji: '🏰', max: 30, w: 90, i: 80, h: 40, time: 25, desc: 'Coração da aldeia', img: IMG.tower },
  church: { name: 'Igreja', emoji: '⛪', max: 1, w: 2000, i: 1500, h: 1000, time: 90, desc: 'Treina sacerdotes', img: IMG.house1c },
  woodcutter: { name: 'Serraria', emoji: '🪵', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Corta madeira', img: IMG.house1 },
  mine: { name: 'Mina de Ferro', emoji: '⛏️', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Extrai ferro', img: IMG.house1b },
  smithy: { name: 'Ferreiro', emoji: '🔧', max: 20, w: 240, i: 200, h: 150, time: 55, desc: 'Pesquisa tropas', img: IMG.blacksmith },
  market: { name: 'Mercado', emoji: '🏪', max: 20, w: 100, i: 50, h: 50, time: 22, desc: 'Troca recursos', img: IMG.house1b },
  barracks: { name: 'Quartel', emoji: '🎖️', max: 25, w: 100, i: 50, h: 50, time: 22, desc: 'Treina infantaria', img: IMG.barracks },
  stable: { name: 'Estábulo', emoji: '🐴', max: 20, w: 150, i: 100, h: 100, time: 34, desc: 'Cria cavalaria', img: IMG.stable },
  warehouse: { name: 'Armazém', emoji: '🏠', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Guarda recursos', img: IMG.house1 },
  farm: { name: 'Fazenda', emoji: '🌾', max: 30, w: 50, i: 30, h: 30, time: 16, desc: 'Produz trigo', img: IMG.house1c },
  workshop: { name: 'Oficina', emoji: '🔨', max: 20, w: 200, i: 150, h: 100, time: 46, desc: 'Máquinas de cerco', img: IMG.house1b },
  wall: { name: 'Muralha', emoji: '🧱', max: 20, w: 100, i: 50, h: 50, time: 22, desc: 'Protege aldeia', img: null }
};

const TROOPS = {
  spearman: { pop: 1 }, swordsman: { pop: 1 }, archer: { pop: 1 }, barbarian: { pop: 1 }, spy: { pop: 1 },
  cavalry: { pop: 2 }, archerCav: { pop: 2 }, royalCav: { pop: 3 }, ram: { pop: 4 }, catapult: { pop: 5 }, priest: { pop: 20 }
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
  levels: { mainBuilding: 3, woodcutter: 5, mine: 5, farm: 5, warehouse: 5, smithy: 1, market: 0, barracks: 3, stable: 1, workshop: 0, church: 0, wall: 2 },
  troops: { spearman: 40, swordsman: 30 },
  conquered: 0, isVip: true
});

// ===== SPRITE COM REDE DE SEGURANÇA =====
// Tenta carregar a imagem profissional; se falhar, mostra emoji grande (nunca quebra)
function Sprite({ img, emoji, size }) {
  const [err, setErr] = useState(false);
  if (err || !img) {
    return <div style={{ fontSize: size, lineHeight: 1, filter: 'drop-shadow(0 5px 6px rgba(0,0,0,.45))' }}>{emoji}</div>;
  }
  return <img src={img} alt="" onError={() => setErr(true)} style={{ width: size * 1.5, height: 'auto', display: 'block', filter: 'drop-shadow(0 5px 8px rgba(0,0,0,.45))' }} />;
}

export default function App() {
  const [g, setG] = useState(startState());
  const [screen, setScreen] = useState('village');
  const [msg, setMsg] = useState('');
  const [hover, setHover] = useState(null);

  const L = g.levels;
  const R = g.resources;
  const points = villagePoints(L, g.conquered);
  const rates = { wood: Math.floor(production(L.woodcutter) * 1.2), iron: Math.floor(production(L.mine) * 1.2), wheat: Math.floor(production(L.farm) * 1.2) };
  const popUsed = Object.entries(g.troops).reduce((s, [k, v]) => s + (TROOPS[k]?.pop || 0) * v, 0);
  const popMax = maxPop(L.farm);
  const whCap = warehouseCap(L.warehouse);

  const flash = (txt) => { setMsg(txt); setTimeout(() => setMsg(''), 2500); };
  const go = (s) => { setScreen(s); setHover(null); };

  const NAV = [['village', '🏰', 'Aldeia', 0], ['mapa', '🗺️', 'Mapa', 0], ['missions', '🎯', 'Missões', 3], ['recrutar', '⚔️', 'Recrutar', 0], ['command', '🛡️', 'Tropas', 0], ['reports', '📜', 'Relatórios', 0], ['ranking', '🏆', 'Ranking', 0], ['tribo', '⚜️', 'Tribo', 0], ['amigos', '👥', 'Amigos', 0], ['perfil', '👤', 'Perfil', 0]];

  return (
    <div style={{ background: `linear-gradient(${C.parch}, ${C.parchD})`, minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', fontFamily: 'Georgia, serif', color: C.w1 }}>
      {/* box-sizing global — impede estouro de largura */}
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>

      {/* HEADER (com wrap pra nunca estourar) */}
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
          <button style={{ background: C.purple, color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 10, whiteSpace: 'nowrap' }}>👑 VIP</button>
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

      {/* TELAS */}
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

/* ===== VILLAGE ===== */
function Village(p) {
  const { L, R, g, go, hover, setHover, points, rates, popUsed, popMax, whCap } = p;

  // ordem e posição (% dentro da cena), arrumadas dentro da elipse
  const layout = [
    ['mainBuilding', 50, 22],
    ['church', 76, 30], ['smithy', 24, 30],
    ['woodcutter', 14, 50], ['mine', 86, 50],
    ['barracks', 34, 46], ['stable', 66, 46],
    ['market', 50, 50],
    ['warehouse', 22, 70], ['workshop', 78, 70],
    ['farm', 40, 76], ['mine2', 60, 76]
  ];

  const wallThickness = 3 + (L.wall || 0) * 1.5;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 132px)', minHeight: 420 }}>
      {/* ALDEIA — flex:1 + minWidth:0 (ESSENCIAL pra não empurrar o sidebar) */}
      <div style={{ flex: '1 1 0', minWidth: 0, background: 'linear-gradient(160deg,#5a9a3a 0%,#3a6a1a 100%)', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Cena */}
        <div style={{ position: 'relative', width: '94%', maxWidth: 760, aspectRatio: '4 / 3' }}>
          {/* Terreno (elipse) */}
          <div style={{ position: 'absolute', inset: '4%', borderRadius: '50%', background: 'radial-gradient(ellipse at 45% 38%, #6aa83f 0%, #4a8a2a 55%, #3a6f1f 100%)', boxShadow: 'inset 0 0 50px rgba(0,0,0,.25)' }} />
          {/* Muralha (anel) */}
          <div style={{ position: 'absolute', inset: '2%', borderRadius: '50%', border: `${wallThickness}px solid #9a7a52`, boxShadow: 'inset 0 0 14px rgba(0,0,0,.35), 0 2px 6px rgba(0,0,0,.3)' }} />
          {/* Caminhos suaves */}
          <div style={{ position: 'absolute', left: '20%', top: '50%', width: '60%', height: 10, background: 'rgba(160,130,80,.35)', borderRadius: 10, transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: '22%', left: '50%', width: 10, height: '56%', background: 'rgba(160,130,80,.30)', borderRadius: 10, transform: 'translateX(-50%)' }} />

          {/* Árvores decorativas */}
          {[[10, 18], [90, 20], [8, 82], [92, 80], [50, 92]].map(([x, y], i) => (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', fontSize: 22, filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.4))' }}>🌲</div>
          ))}

          {/* PRÉDIOS */}
          {layout.map(([key, x, y]) => {
            const bid = key === 'mine2' ? 'mine' : key;
            const b = BUILDINGS[bid];
            if (!b) return null;
            const lvl = L[bid] || 0;
            const isH = hover === key;
            return (
              <div key={key}
                onClick={() => go(`building_${bid}`)}
                onMouseEnter={() => setHover(key)}
                onMouseLeave={() => setHover(null)}
                style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) scale(${isH ? 1.12 : 1})`, transition: 'transform .15s', cursor: 'pointer', zIndex: isH ? 999 : Math.round(y) }}>
                {/* base/sombra */}
                <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 54, height: 16, background: 'rgba(0,0,0,.28)', borderRadius: '50%', filter: 'blur(2px)' }} />
                <Sprite img={b.img} emoji={b.emoji} size={48} />
                {/* nível */}
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: C.gold, minWidth: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, border: `2px solid ${C.gold}`, padding: '0 4px' }}>{lvl}</div>
                {/* tooltip */}
                {isH && (
                  <div style={{ position: 'absolute', bottom: 'calc(100% + 14px)', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.95)', color: '#fff', padding: '9px 11px', borderRadius: 8, border: `2px solid ${C.gold}`, width: 170, textAlign: 'center', zIndex: 1000 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>{b.name}</div>
                    <div style={{ fontSize: 10, color: C.gold, marginBottom: 4 }}>Nível {lvl}/{b.max}</div>
                    <div style={{ fontSize: 10, color: '#ddd', marginBottom: 6 }}>{b.desc}</div>
                    <div style={{ fontSize: 9, color: C.gold, fontWeight: 700 }}>Clique para melhorar ▸</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SIDEBAR — largura FIXA + flexShrink:0 (não corta mais) */}
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
    flash(`✅ ${b.name} melhorado para nível ${lvl + 1}!`);
    go('village');
  };

  return (
    <div style={{ padding: 20, maxWidth: 640, margin: '0 auto' }}>
      <button onClick={() => go('village')} style={{ background: 'transparent', color: C.darkGold, border: `2px solid ${C.border}`, padding: '8px 16px', marginBottom: 16, borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>← Voltar à aldeia</button>

      <div style={{ background: '#fff', border: `3px solid ${C.border}`, borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,.15)' }}>
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><Sprite img={b.img} emoji={b.emoji} size={90} /></div>
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
        ) : (
          <div style={{ padding: 12, color: C.w2, fontWeight: 700 }}>✅ Nível máximo atingido</div>
        )}
      </div>
    </div>
  );
}
