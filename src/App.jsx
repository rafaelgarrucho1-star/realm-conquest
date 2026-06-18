import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// ⚔️ REALM CONQUEST — JOGO COMPLETO (single-player)
// Aldeia isométrica · edifícios clicáveis com funções próprias
// Recrutamento por edifício · Centro de Comando (tropas + envios)
// ============================================================

/* ---------------- PALETAS DE MATERIAL ---------------- */
const STONE = { l: '#d2c9b8', d: '#a89d88', rl: '#9e2b25', rd: '#7a211c' };
const KEEP = { l: '#c4bcab', d: '#968c79', rl: '#caa53a', rd: '#a07f20' };
const TIMBER = { l: '#caa15f', d: '#9a7340', rl: '#7a4f2e', rd: '#5b381f' };
const TIMBER2 = { l: '#caa15f', d: '#9a7340', rl: '#9c5a30', rd: '#794125' };
const THATCH = { l: '#c8a96a', d: '#9c7e46', rl: '#b08534', rd: '#876226' };
const DARK = { l: '#a3a8ad', d: '#787e83', rl: '#3f464b', rd: '#2b3033' };
const SMITHP = { l: '#a8a195', d: '#7d766a', rl: '#8a3b2f', rd: '#682b23' };
const WOODP = { l: '#bda36c', d: '#8f7a48', rl: '#4a7a30', rd: '#365c23' };
const MARKETP = { l: '#caa15f', d: '#9a7340', rl: '#2f7d8c', rd: '#205c68' };
const CHURCHP = { l: '#e4ded0', d: '#bdb5a1', rl: '#6b7d8c', rd: '#4d5b66' };

/* ---------------- EDIFÍCIOS ---------------- */
const BUILDINGS = {
  mainBuilding: { name: 'Edifício Principal', icon: '🏛️', cat: 'main', max: 30, w: 90, i: 80, h: 40, time: 25,
    desc: 'Coração da aldeia. Cada nível reduz o tempo de todas as construções.',
    viz: { cx: 500, cy: 285, s: 1.26, h: 72, roofH: 40, pal: STONE, banner: true } },
  commandCenter: { name: 'Centro de Comando', icon: '🏰', cat: 'command', max: 1, w: 0, i: 0, h: 0, time: 1,
    desc: 'Quartel-general. Veja todas as suas tropas, envie ataques e apoios por coordenadas.',
    viz: { cx: 492, cy: 402, s: 0.78, h: 86, roofH: 16, pal: KEEP, flag: true, tower: true } },
  church: { name: 'Igreja', icon: '⛪', cat: 'conquest', max: 1, w: 2000, i: 1500, h: 1000, time: 90,
    desc: 'Treina sacerdotes, que reduzem a lealdade de aldeias inimigas para conquistá-las.',
    viz: { cx: 690, cy: 224, s: 0.7, h: 54, roofH: 78, pal: CHURCHP, spire: true } },
  woodcutter: { name: 'Serraria', icon: '🪵', cat: 'resource', res: 'wood', max: 30, w: 50, i: 30, h: 30, time: 16,
    desc: 'Corta madeira da floresta.',
    viz: { cx: 320, cy: 224, s: 0.82, h: 40, roofH: 22, pal: WOODP } },
  mine: { name: 'Mina de Ferro', icon: '⛏️', cat: 'resource', res: 'iron', max: 30, w: 50, i: 30, h: 30, time: 16,
    desc: 'Extrai ferro para tropas pesadas.',
    viz: { cx: 500, cy: 196, s: 0.82, h: 36, roofH: 20, pal: DARK } },
  smithy: { name: 'Ferreiro', icon: '🔧', cat: 'research', max: 20, w: 240, i: 200, h: 150, time: 55,
    desc: 'Pesquisa novas tropas e melhorias de combate.',
    viz: { cx: 232, cy: 314, s: 0.86, h: 48, roofH: 26, pal: SMITHP } },
  market: { name: 'Mercado', icon: '🏪', cat: 'market', max: 20, w: 100, i: 50, h: 50, time: 22,
    desc: 'Troca recursos. Cada nível libera mais comerciantes.',
    viz: { cx: 768, cy: 318, s: 0.9, h: 42, roofH: 24, pal: MARKETP } },
  barracks: { name: 'Quartel', icon: '🎖️', cat: 'infantry', max: 25, w: 100, i: 50, h: 50, time: 22,
    desc: 'Treina a infantaria.', trains: ['spearman', 'swordsman', 'archer', 'barbarian'],
    viz: { cx: 352, cy: 396, s: 0.96, h: 46, roofH: 26, pal: TIMBER } },
  stable: { name: 'Estábulo', icon: '🐴', cat: 'cavalry', max: 20, w: 150, i: 100, h: 100, time: 34,
    desc: 'Cria cavalaria e espiões.', trains: ['spy', 'cavalry', 'archerCav', 'royalCav'],
    viz: { cx: 648, cy: 396, s: 0.96, h: 44, roofH: 24, pal: TIMBER2 } },
  warehouse: { name: 'Armazém', icon: '🏠', cat: 'storage', max: 30, w: 50, i: 30, h: 30, time: 16,
    desc: 'Guarda seus recursos.',
    viz: { cx: 286, cy: 484, s: 1.06, h: 40, roofH: 22, pal: THATCH } },
  farm: { name: 'Fazenda', icon: '🌾', cat: 'resource', res: 'wheat', max: 30, w: 50, i: 30, h: 30, time: 16,
    desc: 'Produz trigo e sustenta a população.',
    viz: { cx: 512, cy: 500, s: 1.0, h: 38, roofH: 22, pal: THATCH } },
  workshop: { name: 'Oficina', icon: '🔨', cat: 'siege', max: 20, w: 200, i: 150, h: 100, time: 46,
    desc: 'Constrói máquinas de cerco.', trains: ['ram', 'catapult'],
    viz: { cx: 712, cy: 484, s: 1.0, h: 46, roofH: 24, pal: TIMBER } }
};

/* ---------------- TROPAS ---------------- */
const TROOPS = {
  spearman: { name: 'Lanceiro', icon: '🔱', build: 'barracks', atk: 8, def: 12, speed: 6, pop: 1, carry: 25, w: 0, i: 5, h: 55, time: 6, req: null, desc: 'Domina cavalaria' },
  swordsman: { name: 'Espadachim', icon: '🗡️', build: 'barracks', atk: 10, def: 8, speed: 6, pop: 1, carry: 25, w: 0, i: 0, h: 50, time: 7, req: null, desc: 'Versátil e barato' },
  archer: { name: 'Arqueiro', icon: '🏹', build: 'barracks', atk: 12, def: 4, speed: 6, pop: 1, carry: 20, w: 60, i: 0, h: 50, time: 9, req: { smithy: 3 }, desc: 'Mata infantaria' },
  barbarian: { name: 'Bárbaro', icon: '🪓', build: 'barracks', atk: 15, def: 10, speed: 6, pop: 1, carry: 60, w: 0, i: 20, h: 80, time: 12, req: { smithy: 5 }, desc: 'Bruto forte' },
  spy: { name: 'Espião', icon: '🕵️', build: 'stable', atk: 0, def: 0, speed: 12, pop: 1, carry: 0, w: 50, i: 25, h: 100, time: 8, req: { smithy: 5 }, desc: 'Reconhecimento veloz' },
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

/* ---------------- FÓRMULAS ---------------- */
const cost = (b, lvl) => { const m = Math.pow(1.26, Math.max(0, lvl - 1)); return { w: Math.floor(b.w * m), i: Math.floor(b.i * m), h: Math.floor(b.h * m) }; };
const buildTime = (b, lvl, mainLvl) => { const base = b.time + Math.max(0, lvl - 1) * b.time * 0.22; const red = Math.min(0.5, Math.max(0, (mainLvl - 1) * 0.02)); return Math.max(2, Math.floor(base * (1 - red))); };
const recruitTime = (t, buildLvl) => Math.max(2, Math.floor(t.time * (1 - Math.min(0.5, (buildLvl - 1) * 0.02))));
const production = (lvl) => 50 + Math.max(0, lvl - 1) * 145;
const warehouseCap = (lvl) => Math.floor(1500 * Math.pow(1.22, Math.max(0, lvl - 1)));
const maxPop = (lvl) => Math.min(30000, 240 + Math.max(0, lvl - 1) * 260);
const fmt = (n) => Math.floor(n).toLocaleString('pt-BR');
const fmtTime = (s) => s < 60 ? `${Math.ceil(s)}s` : s < 3600 ? `${Math.floor(s / 60)}m${String(Math.floor(s % 60)).padStart(2, '0')}` : `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;
const dist = (a, b) => Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 10) / 10;

const HOME = { x: 500, y: 350 };

const startState = () => ({
  resources: { wood: 4000, iron: 3000, wheat: 4000 },
  levels: { mainBuilding: 3, commandCenter: 1, woodcutter: 5, mine: 5, farm: 5, warehouse: 5, smithy: 1, market: 0, barracks: 3, stable: 1, workshop: 0, church: 0 },
  troops: { spearman: 40, swordsman: 30, archer: 0, barbarian: 0, spy: 0, cavalry: 0, archerCav: 0, royalCav: 0, ram: 0, catapult: 0, priest: 0 },
  research: {}, bonus: {}, wall: 2,
  buildQueue: [],
  recruit: { barracks: [], stable: [], workshop: [], church: [] },
  movements: [],
  reports: [],
  conquered: 0
});

const genTargets = () => {
  const names = ['Forte Negro', 'Vale Sombrio', 'Pico Gelado', 'Campo Rubro', 'Ermo Cinza', 'Bastião', 'Posto Caído', 'Ruína Velha'];
  return names.map((n, i) => {
    const diff = i < 4 ? 'fraco' : i < 7 ? 'médio' : 'forte';
    const m = diff === 'fraco' ? 1 : diff === 'médio' ? 3 : 7;
    const ang = (i / names.length) * Math.PI * 2;
    const r = 8 + (i % 4) * 4;
    return {
      id: i + 1, name: n, owner: 'Bárbaros', diff,
      x: Math.round(HOME.x + Math.cos(ang) * r), y: Math.round(HOME.y + Math.sin(ang) * r),
      loyalty: 100, conquered: false,
      troops: { spearman: Math.floor((12 + Math.random() * 14) * m), swordsman: Math.floor((8 + Math.random() * 10) * m), archer: Math.floor((6 + Math.random() * 8) * m) },
      wall: Math.min(20, Math.round(m * 1.5)),
      resources: { wood: Math.floor((1500 + Math.random() * 3000) * m), iron: Math.floor((800 + Math.random() * 1500) * m), wheat: Math.floor((1500 + Math.random() * 3000) * m) }
    };
  });
};

/* ---------------- EDIFÍCIO ISOMÉTRICO (SVG) ---------------- */
function pts(a) { return a.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '); }
function IsoBuilding({ id, cfg, level, hovered, selected, building, progress, onHover, onClick }) {
  const v = cfg.viz, s = v.s, w2 = 56 * s, h2 = w2 / 2;
  const grow = 1 + Math.min(0.4, level * 0.022);
  const H = v.h * s * grow, roofH = v.roofH * s, cx = v.cx, cy = v.cy, pal = v.pal;
  const dim = level === 0 ? 0.42 : 1;
  const B = [cx, cy + h2], R = [cx + w2, cy], L = [cx - w2, cy];
  const Bt = [cx, cy + h2 - H], Rt = [cx + w2, cy - H], Lt = [cx - w2, cy - H], Tt = [cx, cy - h2 - H];
  const apex = [cx, cy - H - roofH];
  const glow = hovered || selected;
  const labelY = cy - H - roofH - (v.banner || v.flag ? 40 : v.spire ? 30 : 18);
  return (
    <g style={{ cursor: 'pointer', opacity: dim, transition: 'opacity .3s' }}
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
      onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)}
      filter={glow ? 'url(#glow)' : 'url(#soft)'}>
      <ellipse cx={cx} cy={cy + h2 + 3} rx={w2 * 1.05} ry={h2 * 0.7} fill="rgba(0,0,0,0.22)" />
      <polygon points={pts([B, L, Lt, Bt])} fill={pal.d} />
      <polygon points={pts([R, B, Bt, Rt])} fill={pal.l} />
      {!v.spire && <polygon points={pts([[cx + w2 * 0.34, cy + h2 * 0.5], [cx + w2 * 0.04, cy + h2 * 0.82], [cx + w2 * 0.04, cy + h2 * 0.82 - H * 0.42], [cx + w2 * 0.34, cy + h2 * 0.5 - H * 0.42]])} fill="rgba(40,26,14,0.5)" />}
      {/* ameias para a torre (centro de comando) */}
      {v.tower && [-0.6, -0.2, 0.2, 0.6].map((o, k) => (
        <rect key={k} x={cx + o * w2 - 3} y={cy - H - 8} width={6} height={9} fill={pal.d} />
      ))}
      {v.spire ? (<>
        <polygon points={pts([Rt, Bt, apex])} fill={pal.rl} /><polygon points={pts([Bt, Lt, apex])} fill={pal.rd} />
        <polygon points={pts([Lt, Tt, apex])} fill={pal.rd} /><polygon points={pts([Tt, Rt, apex])} fill={pal.rl} />
        <line x1={apex[0]} y1={apex[1]} x2={apex[0]} y2={apex[1] - 16} stroke="#caa53a" strokeWidth={3} />
        <line x1={apex[0] - 6} y1={apex[1] - 11} x2={apex[0] + 6} y2={apex[1] - 11} stroke="#caa53a" strokeWidth={3} />
      </>) : v.tower ? (
        <polygon points={pts([[cx - w2, cy - H], [cx + w2, cy - H], [cx, cy - h2 - H]])} fill="none" />
      ) : (<>
        <polygon points={pts([Tt, Rt, apex])} fill={pal.rd} /><polygon points={pts([Lt, Tt, apex])} fill={pal.rd} />
        <polygon points={pts([Rt, Bt, apex])} fill={pal.rl} /><polygon points={pts([Bt, Lt, apex])} fill={pal.rl} />
      </>)}
      {v.banner && (<><line x1={apex[0]} y1={apex[1]} x2={apex[0]} y2={apex[1] - 30} stroke="#5a4326" strokeWidth={2.5} />
        <polygon points={`${apex[0]},${apex[1] - 30} ${apex[0] + 22},${apex[1] - 25} ${apex[0]},${apex[1] - 18}`} fill="#9e2b25" /></>)}
      {v.flag && (<><line x1={cx} y1={cy - H - 4} x2={cx} y2={cy - H - 34} stroke="#5a4326" strokeWidth={2.5} />
        <polygon points={`${cx},${cy - H - 34} ${cx + 20},${cy - H - 29} ${cx},${cy - H - 22}`} fill="#caa53a" /></>)}
      {building && (<g>
        <polygon points={pts([R, B, Bt, Rt])} fill="rgba(202,160,90,0.18)" />
        <line x1={R[0]} y1={R[1]} x2={Rt[0]} y2={Rt[1]} stroke="#caa15f" strokeWidth={2} />
        <line x1={B[0]} y1={B[1]} x2={Bt[0]} y2={Bt[1]} stroke="#caa15f" strokeWidth={2} /></g>)}
      <g transform={`translate(${cx}, ${labelY})`}>
        {building ? (<>
          <rect x={-26} y={-13} width={52} height={20} rx={10} fill="rgba(20,14,8,0.9)" stroke="#caa15f" />
          <text x={0} y={2} textAnchor="middle" fontSize={11} fill="#f0d98a" fontWeight="bold">🔨 {Math.floor(progress)}%</text>
        </>) : level > 0 ? (<>
          <circle r={13} fill="rgba(20,14,8,0.92)" stroke={glow ? '#f0d98a' : '#caa15f'} strokeWidth={glow ? 2 : 1.2} />
          <text x={0} y={4} textAnchor="middle" fontSize={13} fill="#f0d98a" fontWeight="bold">{level}</text>
        </>) : (<>
          <circle r={11} fill="rgba(20,14,8,0.55)" stroke="#6b5d3f" strokeDasharray="2 2" />
          <text x={0} y={3} textAnchor="middle" fontSize={11} fill="#9a8a5f">+</text>
        </>)}
      </g>
    </g>
  );
}
function Tree({ x, y, s = 1 }) { return (<g filter="url(#soft)"><ellipse cx={x} cy={y + 2} rx={13 * s} ry={6 * s} fill="rgba(0,0,0,0.18)" /><rect x={x - 2 * s} y={y - 14 * s} width={4 * s} height={16 * s} fill="#6b4a2b" rx={1} /><circle cx={x} cy={y - 22 * s} r={13 * s} fill="#4f7d33" /><circle cx={x - 7 * s} cy={y - 16 * s} r={9 * s} fill="#46712c" /><circle cx={x + 7 * s} cy={y - 17 * s} r={9 * s} fill="#588a3a" /></g>); }
function Rock({ x, y, s = 1 }) { return (<g filter="url(#soft)"><ellipse cx={x} cy={y + 1} rx={11 * s} ry={5 * s} fill="rgba(0,0,0,0.16)" /><polygon points={`${x - 10 * s},${y} ${x - 3 * s},${y - 9 * s} ${x + 6 * s},${y - 7 * s} ${x + 10 * s},${y}`} fill="#9aa0a6" /></g>); }

/* ================= APP ================= */
export default function RealmConquest() {
  const [g, setG] = useState(() => { try { const s = localStorage.getItem('rcFullSave'); return s ? JSON.parse(s) : startState(); } catch { return startState(); } });
  const [targets, setTargets] = useState(() => { try { const s = localStorage.getItem('rcFullTargets'); return s ? JSON.parse(s) : genTargets(); } catch { return genTargets(); } });
  const [hovered, setHovered] = useState(null);
  const [open, setOpen] = useState(null);       // edifício aberto
  const [toast, setToast] = useState('');
  const [report, setReport] = useState(null);   // relatório de combate em foco
  const tick = useRef(Date.now());

  const L = g.levels;
  const whCap = warehouseCap(L.warehouse);
  const popMax = maxPop(L.farm);
  const buildingsPop = Object.entries(L).reduce((s, [k, l]) => s + (l > 0 ? 4 : 0), 0);
  const homeTroopsPop = Object.entries(g.troops).reduce((s, [k, c]) => s + c * TROOPS[k].pop, 0);
  const awayPop = g.movements.reduce((s, m) => s + Object.entries(m.troops).reduce((a, [k, c]) => a + c * TROOPS[k].pop, 0), 0);
  const queuePop = Object.values(g.recruit).flat().reduce((s, it) => s + it.remaining * TROOPS[it.key].pop, 0);
  const popUsed = buildingsPop + homeTroopsPop + awayPop + queuePop;
  const rates = { wood: production(L.woodcutter), iron: production(L.mine), wheat: production(L.farm) };

  useEffect(() => { const t = setTimeout(() => { try { localStorage.setItem('rcFullSave', JSON.stringify(g)); localStorage.setItem('rcFullTargets', JSON.stringify(targets)); } catch {} }, 600); return () => clearTimeout(t); }, [g, targets]);

  const flash = useCallback((m) => { setToast(m); setTimeout(() => setToast(''), 3200); }, []);

  /* ----- LOOP PRINCIPAL ----- */
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now(), dt = (now - tick.current) / 1000; tick.current = now;
      setG(prev => {
        let st = { ...prev, resources: { ...prev.resources } };
        // produção
        st.resources.wood = Math.min(whCap, st.resources.wood + rates.wood / 3600 * dt);
        st.resources.iron = Math.min(whCap, st.resources.iron + rates.iron / 3600 * dt);
        st.resources.wheat = Math.min(whCap, st.resources.wheat + rates.wheat / 3600 * dt);
        // fila de construção
        if (st.buildQueue.length) {
          const q = [...st.buildQueue]; q[0] = { ...q[0], left: q[0].left - dt };
          if (q[0].left <= 0) { st.levels = { ...st.levels, [q[0].key]: q[0].level }; flash(`✅ ${BUILDINGS[q[0].key].name} nível ${q[0].level}!`); q.shift(); }
          st.buildQueue = q;
        }
        // filas de recrutamento (por edifício)
        const rec = { ...st.recruit }; let troopsChanged = false; const nt = { ...st.troops };
        ['barracks', 'stable', 'workshop', 'church'].forEach(bk => {
          if (rec[bk] && rec[bk].length) {
            const q = [...rec[bk]]; q[0] = { ...q[0], left: q[0].left - dt };
            if (q[0].left <= 0) { nt[q[0].key] += 1; troopsChanged = true; if (q[0].remaining > 1) q[0] = { ...q[0], remaining: q[0].remaining - 1, left: q[0].unitTime }; else q.shift(); }
            rec[bk] = q;
          }
        });
        st.recruit = rec; if (troopsChanged) st.troops = nt;
        // movimentos de tropas
        if (st.movements.length) {
          const remaining = []; let resGain = { w: 0, i: 0, h: 0 }; const back = { ...st.troops };
          st.movements.forEach(m => {
            if (m.phase === 'stationed') { remaining.push(m); return; }
            const left = m.left - dt;
            if (left > 0) { remaining.push({ ...m, left }); return; }
            if (m.phase === 'out' && m.mode === 'attack') {
              const res = resolveCombat(m, targets, setTargets, flash);
              if (res.survivors && Object.values(res.survivors).some(v => v > 0)) remaining.push({ ...m, phase: 'back', troops: res.survivors, loot: res.loot, left: m.total, total: m.total });
              else { /* todos mortos */ }
              st.reports = [{ id: Date.now() + Math.random(), ...res.report }, ...st.reports].slice(0, 20);
            } else if (m.phase === 'out' && m.mode === 'support') {
              remaining.push({ ...m, phase: 'stationed', left: 0 });
            } else if (m.phase === 'back') {
              Object.entries(m.troops).forEach(([k, c]) => { back[k] = (back[k] || 0) + c; });
              if (m.loot) { resGain.w += m.loot.w; resGain.i += m.loot.i; resGain.h += m.loot.h; }
              flash(`🏠 Tropas voltaram de ${m.target.name}.`);
            }
          });
          st.movements = remaining; st.troops = back;
          st.resources.wood = Math.min(whCap, st.resources.wood + resGain.w);
          st.resources.iron = Math.min(whCap, st.resources.iron + resGain.i);
          st.resources.wheat = Math.min(whCap, st.resources.wheat + resGain.h);
        }
        return st;
      });
      // recupera lealdade dos alvos
      setTargets(ts => ts.map(t => t.loyalty < 100 && !t.conquered ? { ...t, loyalty: Math.min(100, t.loyalty + 2 / 3600 * dt) } : t));
    }, 100);
    return () => clearInterval(iv);
  }, [whCap, rates.wood, rates.iron, rates.wheat, targets, flash]);

  /* ----- COMBATE ----- */
  function resolveCombat(m, ts, setTs, flashFn) {
    const enemy = ts.find(t => t.id === m.target.id);
    if (!enemy) return { survivors: m.troops, loot: { w: 0, i: 0, h: 0 }, report: { name: m.target.name, win: true, text: 'Alvo não existe mais.' } };
    const rams = m.troops.ram || 0; const effWall = Math.max(0, enemy.wall - rams); const wallB = 1 + effWall * 0.05;
    let atk = 0; Object.entries(m.troops).forEach(([k, c]) => { if (TROOPS[k].atk > 0) atk += TROOPS[k].atk * c * bonusMult(k); });
    let def = 0; Object.entries(enemy.troops).forEach(([k, c]) => { def += (TROOPS[k]?.def || 0) * c * wallB; });
    const win = atk > def;
    const survivors = {}; let loot = { w: 0, i: 0, h: 0 }; let conquered = false;
    if (win) {
      const ratio = Math.min(0.85, def / Math.max(1, atk));
      Object.entries(m.troops).forEach(([k, c]) => { survivors[k] = Math.max(0, c - Math.floor(c * ratio)); });
      const carry = Object.entries(survivors).reduce((s, [k, c]) => s + TROOPS[k].carry * c, 0);
      const tot = enemy.resources.wood + enemy.resources.iron + enemy.resources.wheat;
      const pct = Math.min(0.5, carry / Math.max(1, tot));
      loot = { w: Math.floor(enemy.resources.wood * pct), i: Math.floor(enemy.resources.iron * pct), h: Math.floor(enemy.resources.wheat * pct) };
      const priests = survivors.priest || 0; let newLoy = enemy.loyalty;
      if (priests > 0) { newLoy = Math.max(0, enemy.loyalty - priests * 25); if (newLoy <= 0) conquered = true; }
      setTs(prev => prev.map(t => t.id !== enemy.id ? t : conquered ? { ...t, conquered: true, loyalty: 100, owner: 'Você', troops: { spearman: 0, swordsman: 0, archer: 0 } } : { ...t, loyalty: newLoy, troops: { spearman: 0, swordsman: 0, archer: 0 }, resources: { wood: t.resources.wood - loot.w, iron: t.resources.iron - loot.i, wheat: t.resources.wheat - loot.h } }));
      if (conquered) { setG(p => ({ ...p, conquered: p.conquered + 1 })); flashFn(`👑 Você conquistou ${enemy.name}!`); }
      else flashFn(`🏆 Vitória em ${enemy.name}! Saque a caminho.`);
    } else {
      Object.keys(m.troops).forEach(k => survivors[k] = 0);
      const r = atk / Math.max(1, def);
      setTs(prev => prev.map(t => t.id !== enemy.id ? t : { ...t, troops: Object.fromEntries(Object.entries(t.troops).map(([k, c]) => [k, Math.floor(c * (1 - r * 0.5))])) }));
      flashFn(`💀 Derrota em ${enemy.name}.`);
    }
    return { survivors, loot, report: { name: enemy.name, win, conquered, atk: Math.floor(atk), def: Math.floor(def), loot, losses: Object.fromEntries(Object.entries(m.troops).map(([k, c]) => [k, c - (survivors[k] || 0)])) } };
  }
  const bonusMult = (k) => { let b = 1; Object.entries(BONUS).forEach(([bk, r]) => { if (g.bonus[bk] && r.tgt.includes(k)) b += (bk === 'siege' ? 0.1 : 0.05); }); return b; };

  /* ----- AÇÕES ----- */
  const afford = (c) => g.resources.wood >= c.w && g.resources.iron >= c.i && g.resources.wheat >= c.h;
  const pay = (c) => setG(p => ({ ...p, resources: { wood: p.resources.wood - c.w, iron: p.resources.iron - c.i, wheat: p.resources.wheat - c.h } }));

  const upgrade = (key) => {
    const b = BUILDINGS[key], cur = L[key], inQ = g.buildQueue.filter(q => q.key === key).length, next = cur + inQ + 1;
    if (next > b.max) { flash('✨ Nível máximo.'); return; }
    if (g.buildQueue.length >= 2) { flash('⚠️ Fila de construção cheia (2).'); return; }
    const c = cost(b, next); if (!afford(c)) { flash('⚠️ Recursos insuficientes.'); return; }
    pay(c); const time = buildTime(b, next, L.mainBuilding);
    setG(p => ({ ...p, buildQueue: [...p.buildQueue, { key, level: next, left: time, total: time }] }));
    flash(`🔨 ${b.name} nível ${next} na fila.`);
  };

  const recruit = (key, amt) => {
    const t = TROOPS[key]; amt = Math.max(0, Math.floor(amt)); if (!amt) return;
    if (t.req && L[t.build] < (t.req[Object.keys(t.req)[0]] || 0)) {}
    if (t.req && Object.entries(t.req).some(([rk, rl]) => L[rk] < rl)) { flash(`🔒 Requer Ferreiro nível ${t.req.smithy}.`); return; }
    if (t.req == null && key !== 'priest' && key !== 'spearman' && key !== 'swordsman') {}
    if (TROOPS[key].req == null) {} // ok
    const needRes = key !== 'spearman' && key !== 'swordsman' && key !== 'priest' && t.req && Object.entries(t.req).some(([rk, rl]) => L[rk] < rl);
    if (needRes) { return; }
    if (t.req && key === 'archer' && L.smithy < 3) { }
    const popPer = t.pop, c = { w: t.w * amt, i: t.i * amt, h: t.h * amt };
    if (popUsed + popPer * amt > popMax) { flash('⚠️ População insuficiente (suba a Fazenda).'); return; }
    if (!afford(c)) { flash('⚠️ Recursos insuficientes.'); return; }
    pay(c); const ut = recruitTime(t, L[t.build]);
    setG(p => ({ ...p, recruit: { ...p.recruit, [t.build]: [...p.recruit[t.build], { key, remaining: amt, total: amt, unitTime: ut, left: ut }] } }));
    flash(`⚔️ ${amt}× ${t.name} em treinamento.`);
  };

  const researchTroop = (key) => {
    const t = TROOPS[key]; if (!t.req) { flash('Já disponível.'); return; }
    if (L.smithy < t.req.smithy) { flash(`🔒 Ferreiro nível ${t.req.smithy}.`); return; }
    if (g.research[key]) return;
    const c = { w: 2000, i: 2000, h: 2000 }; if (!afford(c)) { flash('⚠️ Recursos insuficientes.'); return; }
    pay(c); setG(p => ({ ...p, research: { ...p.research, [key]: true } })); flash(`🔬 ${t.name} liberado!`);
  };
  const researchBonus = (key) => {
    const r = BONUS[key]; if (L.smithy < r.smithy) { flash(`🔒 Ferreiro nível ${r.smithy}.`); return; }
    if (g.bonus[key]) return; const c = { w: r.cost, i: r.cost, h: r.cost };
    if (!afford(c)) { flash('⚠️ Recursos insuficientes.'); return; }
    pay(c); setG(p => ({ ...p, bonus: { ...p.bonus, [key]: true } })); flash(`⚡ ${r.effect}!`);
  };

  const sendTroops = (targetId, sel, mode) => {
    const target = targets.find(t => t.id === targetId); if (!target) { flash('Selecione um alvo.'); return; }
    const entries = Object.entries(sel).filter(([k, v]) => v > 0);
    if (!entries.length) { flash('Selecione ao menos uma tropa.'); return; }
    for (const [k, v] of entries) if (v > g.troops[k]) { flash(`Você não tem ${v} ${TROOPS[k].name}.`); return; }
    const slow = Math.min(...entries.map(([k]) => TROOPS[k].speed));
    const d = dist(HOME, target); const travel = Math.max(6, Math.round(d * 24 / slow));
    const troops = {}; entries.forEach(([k, v]) => troops[k] = v);
    setG(p => {
      const nt = { ...p.troops }; entries.forEach(([k, v]) => nt[k] -= v);
      return { ...p, troops: nt, movements: [...p.movements, { id: Date.now() + Math.random(), troops, target: { id: target.id, name: target.name, x: target.x, y: target.y }, mode, phase: 'out', left: travel, total: travel }] };
    });
    flash(`${mode === 'attack' ? '⚔️ Ataque' : '🛡️ Apoio'} enviado a ${target.name} (chega em ${fmtTime(travel)}).`);
  };
  const recall = (movId) => {
    setG(p => ({ ...p, movements: p.movements.map(m => m.id === movId && m.phase === 'stationed' ? { ...m, phase: 'back', left: m.total, total: m.total } : m) }));
    flash('↩️ Tropas voltando para casa.');
  };

  const reset = () => { if (window.confirm('Reiniciar tudo? O progresso será perdido.')) { setG(startState()); setTargets(genTargets()); setOpen(null); } };

  const order = Object.entries(BUILDINGS).sort((a, b) => a[1].viz.cy - b[1].viz.cy);
  const C = { ink: '#efe3c8', sub: '#b6a373', gold: '#d4af37', w1: '#2a1f12', w2: '#3a2c1b', border: '#5a4426', green: '#3d5a2d', greenB: '#5e8a3e', red: '#7c2820', redB: '#a0463e', blue: '#274a5a', blueB: '#3f7186' };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(1200px 600px at 50% -10%, #2f2a1d 0%, #1a1610 60%, #120f0a 100%)', fontFamily: "'Cinzel', Georgia, serif", color: C.ink, padding: '10px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&display=swap');`}</style>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>

        {/* BARRA SUPERIOR */}
        <div style={{ background: `linear-gradient(${C.w2}, ${C.w1})`, border: `2px solid ${C.border}`, borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', boxShadow: '0 6px 20px rgba(0,0,0,.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>⚔️</span>
            <div><div style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '1px', color: C.gold }}>Minha Capital</div>
              <div style={{ fontSize: '11px', color: C.sub, fontFamily: 'Georgia, serif' }}>(500|350) · 🏰 {1 + g.conquered} aldeia(s)</div></div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', fontFamily: 'Georgia, serif' }}>
            <Res icon="🪵" val={g.resources.wood} cap={whCap} color="#b9893f" />
            <Res icon="⛏️" val={g.resources.iron} cap={whCap} color="#9aa0a6" />
            <Res icon="🌾" val={g.resources.wheat} cap={whCap} color="#c8a13a" />
            <div style={{ background: 'rgba(0,0,0,.3)', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '4px 10px', fontSize: '12px' }}>
              <span style={{ color: C.sub }}>👥 </span><b style={{ color: popUsed >= popMax ? '#d0453a' : C.ink }}>{fmt(popUsed)}</b><span style={{ color: C.sub }}>/{fmt(popMax)}</span></div>
            <button onClick={reset} title="Reiniciar" style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.sub, borderRadius: '8px', padding: '4px 8px', cursor: 'pointer' }}>🔄</button>
          </div>
        </div>

        {toast && <div style={{ position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 60, background: 'rgba(26,18,8,.96)', border: `2px solid ${C.gold}`, borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontFamily: 'Georgia, serif', boxShadow: '0 6px 20px rgba(0,0,0,.6)', maxWidth: '92%' }}>{toast}</div>}

        {/* FILAS resumo */}
        {(g.buildQueue.length > 0 || Object.values(g.recruit).some(q => q.length) || g.movements.length > 0) && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', fontFamily: 'Georgia, serif', fontSize: '12px' }}>
            {g.buildQueue[0] && <Pill C={C}>🔨 {BUILDINGS[g.buildQueue[0].key].name} {g.buildQueue[0].level} · {fmtTime(g.buildQueue[0].left)}</Pill>}
            {Object.entries(g.recruit).map(([bk, q]) => q[0] && <Pill key={bk} C={C}>{TROOPS[q[0].key].icon} {q[0].remaining}× {TROOPS[q[0].key].name} · {fmtTime(q[0].left)}</Pill>)}
            {g.movements.slice(0, 3).map(m => <Pill key={m.id} C={C}>{m.phase === 'stationed' ? '🛡️ em' : m.mode === 'attack' ? (m.phase === 'back' ? '🏠 de' : '⚔️ →') : '🛡️ →'} {m.target.name}{m.phase !== 'stationed' ? ' · ' + fmtTime(m.left) : ''}</Pill>)}
          </div>
        )}

        {/* ALDEIA */}
        <div style={{ marginTop: '10px', background: '#152613', border: `3px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: 'inset 0 0 60px rgba(0,0,0,.4), 0 6px 20px rgba(0,0,0,.5)' }}>
          <svg viewBox="0 0 1000 660" style={{ width: '100%', display: 'block' }} onClick={() => setOpen(null)}>
            <defs>
              <radialGradient id="grass" cx="50%" cy="42%" r="62%"><stop offset="0%" stopColor="#6fa84a" /><stop offset="55%" stopColor="#5b8f3c" /><stop offset="100%" stopColor="#3f6a2a" /></radialGradient>
              <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.25)" /></filter>
              <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f0d98a" floodOpacity="0.9" /></filter>
            </defs>
            <ellipse cx="500" cy="350" rx="470" ry="250" fill="#34571f" />
            <ellipse cx="500" cy="340" rx="450" ry="235" fill="url(#grass)" />
            <ellipse cx="350" cy="300" rx="120" ry="55" fill="rgba(255,255,255,0.04)" />
            <ellipse cx="650" cy="420" rx="140" ry="60" fill="rgba(0,0,0,0.05)" />
            <g stroke="#c4a86f" strokeOpacity="0.5" strokeLinecap="round" fill="none">
              {order.map(([id, cfg]) => <line key={'p' + id} x1={492} y1={402} x2={cfg.viz.cx} y2={cfg.viz.cy + 26 * cfg.viz.s} strokeWidth={14 * cfg.viz.s} />)}
            </g>
            {g.wall > 0 && <ellipse cx="500" cy="345" rx={448} ry={236} fill="none" stroke="#8b8170" strokeWidth={4 + g.wall * 0.6} strokeOpacity="0.85" />}
            <Tree x={150} y={420} s={1.1} /><Tree x={860} y={250} s={1} /><Tree x={130} y={300} s={0.9} />
            <Tree x={880} y={470} s={1.05} /><Tree x={430} y={585} s={0.95} /><Tree x={600} y={585} s={0.9} />
            <Rock x={210} y={520} s={1} /><Rock x={820} y={560} s={0.9} /><Rock x={760} y={205} s={0.8} />
            {order.map(([id, cfg]) => (
              <IsoBuilding key={id} id={id} cfg={cfg} level={L[id]} hovered={hovered === id} selected={open === id}
                building={g.buildQueue[0]?.key === id}
                progress={g.buildQueue[0]?.key === id ? ((g.buildQueue[0].total - g.buildQueue[0].left) / g.buildQueue[0].total) * 100 : 0}
                onHover={setHovered} onClick={setOpen} />
            ))}
          </svg>
        </div>
        <div style={{ textAlign: 'center', fontSize: '11px', color: C.sub, marginTop: '6px', fontFamily: 'Georgia, serif' }}>👆 Clique em um edifício para abrir suas funções · 🏰 Centro de Comando = todas as suas tropas</div>
      </div>

      {/* MODAL DO EDIFÍCIO */}
      {open && (
        <Modal C={C} title={`${BUILDINGS[open].icon}  ${BUILDINGS[open].name}`} subtitle={`Nível ${L[open]}${BUILDINGS[open].max > 1 ? ' / ' + BUILDINGS[open].max : ''}`} onClose={() => setOpen(null)}>
          <BuildingContent bid={open} g={g} L={L} C={C} targets={targets} popUsed={popUsed} popMax={popMax}
            afford={afford} upgrade={upgrade} recruit={recruit} researchTroop={researchTroop} researchBonus={researchBonus}
            sendTroops={sendTroops} recall={recall} setReport={setReport} />
        </Modal>
      )}

      {/* RELATÓRIO */}
      {report && (
        <Modal C={C} title={report.win ? (report.conquered ? '👑 Conquista!' : '🏆 Vitória') : '💀 Derrota'} subtitle={`Ataque a ${report.name}`} onClose={() => setReport(null)}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>⚔️ Seu poder</span><b style={{ color: C.gold }}>{fmt(report.atk)}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>🛡️ Defesa inimiga</span><b style={{ color: C.gold }}>{fmt(report.def)}</b></div>
            {report.win && <div style={{ marginTop: 8, background: 'rgba(61,90,45,.25)', borderRadius: 8, padding: 10 }}>💰 Saque: 🪵 {fmt(report.loot.w)} · ⛏️ {fmt(report.loot.i)} · 🌾 {fmt(report.loot.h)}</div>}
            {Object.values(report.losses).some(v => v > 0) && <div style={{ marginTop: 8, color: '#d68f88' }}>☠️ Baixas: {Object.entries(report.losses).filter(([k, v]) => v > 0).map(([k, v]) => `${v} ${TROOPS[k].name}`).join(', ')}</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- CONTEÚDO POR EDIFÍCIO ---------- */
function BuildingContent(p) {
  const { bid, g, L, C } = p; const b = BUILDINGS[bid]; const cat = b.cat;
  const next = L[bid] + g.buildQueue.filter(q => q.key === bid).length + 1;
  const nextCost = next <= b.max ? cost(b, next) : null;
  const upBtn = next > b.max ? <div style={s.maxed(C)}>✨ Nível máximo</div> : (
    <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
      <div style={{ fontSize: 11, color: C.sub, fontFamily: 'Georgia, serif' }}>Evoluir para nível {next}:</div>
      <div style={{ display: 'flex', gap: 10, fontSize: 13, margin: '4px 0', fontFamily: 'Georgia, serif' }}>
        <span style={{ color: p.afford(nextCost) ? C.ink : '#c0564e' }}>🪵 {fmt(nextCost.w)}</span>
        <span style={{ color: p.afford(nextCost) ? C.ink : '#c0564e' }}>⛏️ {fmt(nextCost.i)}</span>
        <span style={{ color: p.afford(nextCost) ? C.ink : '#c0564e' }}>🌾 {fmt(nextCost.h)}</span>
        <span style={{ color: C.sub }}>⏱️ {fmtTime(buildTime(b, next, L.mainBuilding))}</span>
      </div>
      <button onClick={() => p.upgrade(bid)} disabled={!p.afford(nextCost)} style={s.btn(C, p.afford(nextCost) ? 'green' : 'off')}>{L[bid] === 0 ? '🔨 Construir' : '⬆️ Evoluir edifício'}</button>
    </div>
  );

  if (cat === 'command') return <CommandCenter {...p} />;

  if (cat === 'infantry' || cat === 'cavalry' || cat === 'siege' || cat === 'conquest') {
    const list = cat === 'conquest' ? ['priest'] : b.trains;
    const queue = g.recruit[bid] || [];
    return (<div>
      <p style={s.desc(C)}>{b.desc}</p>
      {L[bid] === 0 ? <div style={s.lock(C)}>🔒 Construa este edifício para treinar tropas.</div> : (
        <div>
          {list.map(k => <RecruitRow key={k} k={k} g={g} L={L} C={C} afford={p.afford} recruit={p.recruit} popUsed={p.popUsed} popMax={p.popMax} />)}
          {queue.length > 0 && (
            <div style={{ marginTop: 10, background: 'rgba(0,0,0,.25)', borderRadius: 8, padding: 8, fontFamily: 'Georgia, serif', fontSize: 12 }}>
              <div style={{ color: C.gold, marginBottom: 4 }}>⏳ Treinando:</div>
              {queue.map((it, i) => (<div key={i} style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{TROOPS[it.key].icon} {it.remaining}× {TROOPS[it.key].name}</span><span style={{ color: C.sub }}>{fmtTime(it.left + (it.remaining - 1) * it.unitTime)}</span></div>
                {i === 0 && <div style={{ height: 5, background: '#241a0c', borderRadius: 3, marginTop: 2 }}><div style={{ height: '100%', width: `${((it.unitTime - it.left) / it.unitTime) * 100}%`, background: C.gold, borderRadius: 3 }} /></div>}
              </div>))}
            </div>
          )}
        </div>
      )}
      {upBtn}
    </div>);
  }

  if (cat === 'research') return (<div>
    <p style={s.desc(C)}>{b.desc}</p>
    {L.smithy === 0 ? <div style={s.lock(C)}>🔒 Construa o Ferreiro primeiro.</div> : (<>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, margin: '6px 0' }}>🔬 Liberar tropas</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 6 }}>
        {Object.entries(TROOPS).filter(([k, t]) => t.req).map(([k, t]) => {
          const done = g.research[k], can = L.smithy >= t.req.smithy;
          return (<div key={k} style={{ background: done ? 'rgba(61,90,45,.3)' : 'rgba(0,0,0,.2)', border: `1px solid ${done ? C.greenB : C.border}`, borderRadius: 8, padding: 8, fontFamily: 'Georgia, serif' }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{t.icon} {t.name}</div>
            <div style={{ fontSize: 10, color: C.sub }}>Ferreiro nv{t.req.smithy}</div>
            {done ? <div style={{ fontSize: 11, color: C.greenB }}>✓ Liberado</div> : <button onClick={() => p.researchTroop(k)} disabled={!can || !p.afford({ w: 2000, i: 2000, h: 2000 })} style={{ ...s.btn(C, can && p.afford({ w: 2000, i: 2000, h: 2000 }) ? 'blue' : 'off'), padding: 6, marginTop: 4, fontSize: 11 }}>2.000 cada</button>}
          </div>);
        })}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, margin: '12px 0 6px' }}>⚡ Melhorias</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 6 }}>
        {Object.entries(BONUS).map(([k, r]) => {
          const done = g.bonus[k], can = L.smithy >= r.smithy;
          return (<div key={k} style={{ background: done ? 'rgba(212,175,55,.18)' : 'rgba(0,0,0,.2)', border: `1px solid ${done ? C.gold : C.border}`, borderRadius: 8, padding: 8, fontFamily: 'Georgia, serif' }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{r.icon} {r.name}</div>
            <div style={{ fontSize: 10, color: '#9fd06a' }}>{r.effect}</div>
            {done ? <div style={{ fontSize: 11, color: C.gold }}>⚡ Ativo</div> : <button onClick={() => p.researchBonus(k)} disabled={!can || !p.afford({ w: r.cost, i: r.cost, h: r.cost })} style={{ ...s.btn(C, can && p.afford({ w: r.cost, i: r.cost, h: r.cost }) ? 'blue' : 'off'), padding: 6, marginTop: 4, fontSize: 11 }}>{fmt(r.cost)} cada</button>}
          </div>);
        })}
      </div>
    </>)}
    {upBtn}
  </div>);

  if (cat === 'resource') return (<div>
    <p style={s.desc(C)}>{b.desc}</p>
    <div style={{ background: 'rgba(0,0,0,.2)', borderRadius: 8, padding: 10, fontFamily: 'Georgia, serif', fontSize: 13 }}>
      📈 Produção atual: <b style={{ color: '#9fd06a' }}>{fmt(production(L[bid]))}/h</b>{next <= b.max && <> → próximo: <b style={{ color: C.gold }}>{fmt(production(next))}/h</b></>}
    </div>
    {upBtn}
  </div>);

  if (cat === 'storage') return (<div>
    <p style={s.desc(C)}>{b.desc}</p>
    <div style={{ background: 'rgba(0,0,0,.2)', borderRadius: 8, padding: 10, fontFamily: 'Georgia, serif', fontSize: 13 }}>
      📦 Capacidade: <b style={{ color: C.gold }}>{fmt(warehouseCap(L[bid]))}</b>{next <= b.max && <> → <b style={{ color: '#9fd06a' }}>{fmt(warehouseCap(next))}</b></>}
    </div>
    {upBtn}
  </div>);

  if (cat === 'main') return (<div>
    <p style={s.desc(C)}>{b.desc}</p>
    <div style={{ background: 'rgba(0,0,0,.2)', borderRadius: 8, padding: 10, fontFamily: 'Georgia, serif', fontSize: 13 }}>
      ⏱️ Redução de tempo de construção: <b style={{ color: C.gold }}>{Math.min(50, (L[bid] - 1) * 2)}%</b>
    </div>
    {upBtn}
  </div>);

  // market & wall
  return (<div>
    <p style={s.desc(C)}>{b.desc}</p>
    {cat === 'wall' && <div style={{ background: 'rgba(0,0,0,.2)', borderRadius: 8, padding: 10, fontFamily: 'Georgia, serif', fontSize: 13 }}>🛡️ Bônus de defesa: <b style={{ color: C.gold }}>+{L[bid] * 5}%</b></div>}
    {upBtn}
  </div>);
}

/* ---------- LINHA DE RECRUTAMENTO ---------- */
function RecruitRow({ k, g, L, C, afford, recruit, popUsed, popMax }) {
  const t = TROOPS[k]; const [qty, setQty] = useState('');
  const locked = t.req && Object.entries(t.req).some(([rk, rl]) => L[rk] < rl);
  const maxByRes = Math.min(t.w ? Math.floor(g.resources.wood / t.w) : 9999, t.i ? Math.floor(g.resources.iron / t.i) : 9999, t.h ? Math.floor(g.resources.wheat / t.h) : 9999);
  const maxByPop = Math.floor((popMax - popUsed) / t.pop);
  const maxRec = Math.max(0, Math.min(maxByRes, maxByPop));
  return (
    <div style={{ background: 'rgba(0,0,0,.2)', border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, marginBottom: 6, opacity: locked ? 0.6 : 1, fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>{t.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name} <span style={{ fontSize: 11, color: C.sub, fontWeight: 400 }}>· tem {fmt(g.troops[k])}</span></div>
          <div style={{ fontSize: 10, color: C.sub }}>⚔️{t.atk} 🛡️{t.def} 🏃{t.speed} 👤{t.pop} · 🪵{t.w} ⛏️{t.i} 🌾{t.h}</div>
        </div>
      </div>
      {locked ? <div style={{ fontSize: 11, color: '#d68f88', marginTop: 4 }}>🔒 Requer Ferreiro nível {t.req.smithy} (libere na aba do Ferreiro)</div> : (
        <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
          <input type="number" min="0" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" style={{ width: 70, background: '#1a130a', border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px', color: C.ink, fontFamily: 'inherit', fontSize: 13 }} />
          <button onClick={() => setQty(String(maxRec))} style={{ ...s.btn(C, 'ghost'), padding: '6px 8px', fontSize: 11, width: 'auto' }}>máx {maxRec}</button>
          <button onClick={() => { recruit(k, parseInt(qty) || 0); setQty(''); }} disabled={!qty || (parseInt(qty) || 0) <= 0} style={{ ...s.btn(C, qty && (parseInt(qty) || 0) > 0 ? 'red' : 'off'), padding: '6px', fontSize: 12, flex: 1 }}>⚔️ Recrutar</button>
        </div>
      )}
    </div>
  );
}

/* ---------- CENTRO DE COMANDO ---------- */
function CommandCenter(p) {
  const { g, C, targets } = p;
  const [view, setView] = useState('tropas'); // tropas | enviar | movimentos
  const [tid, setTid] = useState(targets.find(t => !t.conquered)?.id || targets[0]?.id);
  const [mode, setMode] = useState('attack');
  const [sel, setSel] = useState({});
  const awayByVillage = {};
  g.movements.forEach(m => { const key = m.target.name + (m.phase === 'stationed' ? ' (apoio)' : m.mode === 'attack' ? (m.phase === 'back' ? ' (voltando)' : ' (atacando)') : ' (a caminho)'); awayByVillage[key] = awayByVillage[key] || {}; Object.entries(m.troops).forEach(([k, c]) => awayByVillage[key][k] = (awayByVillage[key][k] || 0) + c); });
  const target = targets.find(t => t.id === tid);
  const selEntries = Object.entries(sel).filter(([k, v]) => v > 0);
  const slow = selEntries.length ? Math.min(...selEntries.map(([k]) => TROOPS[k].speed)) : 0;
  const travel = target && slow ? Math.max(6, Math.round(dist(HOME, target) * 24 / slow)) : 0;

  return (<div>
    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
      {[['tropas', '🛡️ Tropas'], ['enviar', '📤 Enviar'], ['movimentos', '🧭 Movimentos']].map(([v, l]) => (
        <button key={v} onClick={() => setView(v)} style={{ ...s.btn(C, view === v ? 'gold' : 'ghost'), flex: 1, padding: 8, fontSize: 12 }}>{l}</button>
      ))}
    </div>

    {view === 'tropas' && (<div style={{ fontFamily: 'Georgia, serif' }}>
      <div style={{ fontSize: 12, color: C.gold, marginBottom: 6 }}>🏠 Em casa</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 6 }}>
        {Object.entries(g.troops).filter(([k, c]) => c > 0).length === 0 && <div style={{ fontSize: 12, color: C.sub }}>Nenhuma tropa em casa.</div>}
        {Object.entries(g.troops).filter(([k, c]) => c > 0).map(([k, c]) => (
          <div key={k} style={{ background: 'rgba(0,0,0,.2)', border: `1px solid ${C.border}`, borderRadius: 8, padding: 6, fontSize: 12 }}>{TROOPS[k].icon} {TROOPS[k].name}<br /><b style={{ color: C.ink }}>{fmt(c)}</b></div>
        ))}
      </div>
      {Object.keys(awayByVillage).length > 0 && (<>
        <div style={{ fontSize: 12, color: C.gold, margin: '12px 0 6px' }}>🌍 Fora da aldeia</div>
        {Object.entries(awayByVillage).map(([place, tr]) => (
          <div key={place} style={{ background: 'rgba(0,0,0,.2)', border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, marginBottom: 6, fontSize: 12 }}>
            <div style={{ color: C.gold, marginBottom: 2 }}>📍 {place}</div>
            {Object.entries(tr).map(([k, c]) => `${TROOPS[k].icon} ${fmt(c)} ${TROOPS[k].name}`).join(' · ')}
          </div>
        ))}
      </>)}
    </div>)}

    {view === 'enviar' && (<div style={{ fontFamily: 'Georgia, serif' }}>
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Alvo (coordenadas):</div>
      <select value={tid} onChange={e => setTid(parseInt(e.target.value))} style={{ width: '100%', background: '#1a130a', color: C.ink, border: `1px solid ${C.border}`, borderRadius: 6, padding: 8, fontFamily: 'inherit', fontSize: 13, marginBottom: 8 }}>
        {targets.map(t => <option key={t.id} value={t.id}>{t.conquered ? '✅ ' : ''}{t.name} ({t.x}|{t.y}) — {t.owner} · {t.diff}</option>)}
      </select>
      {target && <div style={{ fontSize: 11, color: C.sub, marginBottom: 8 }}>📏 Distância {dist(HOME, target)} · 🛡️ defesa ~{fmt(Object.values(target.troops).reduce((a, b) => a + b, 0))} tropas · 🧱 muralha nv{target.wall} · lealdade {Math.floor(target.loyalty)}%{travel ? ` · ⏱️ viagem ${fmtTime(travel)}` : ''}</div>}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button onClick={() => setMode('attack')} style={{ ...s.btn(C, mode === 'attack' ? 'red' : 'ghost'), flex: 1, padding: 8 }}>⚔️ Atacar</button>
        <button onClick={() => setMode('support')} style={{ ...s.btn(C, mode === 'support' ? 'blue' : 'ghost'), flex: 1, padding: 8 }}>🛡️ Apoiar</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 6, marginBottom: 8 }}>
        {Object.entries(g.troops).filter(([k, c]) => c > 0).map(([k, c]) => (
          <div key={k} style={{ background: 'rgba(0,0,0,.2)', border: `1px solid ${C.border}`, borderRadius: 6, padding: 6 }}>
            <div style={{ fontSize: 11 }}>{TROOPS[k].icon} {TROOPS[k].name} ({c})</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <input type="number" min="0" max={c} value={sel[k] || ''} onChange={e => setSel(o => ({ ...o, [k]: Math.min(c, Math.max(0, parseInt(e.target.value) || 0)) }))} placeholder="0" style={{ width: '100%', background: '#1a130a', border: `1px solid ${C.border}`, borderRadius: 4, padding: 4, color: C.ink, fontFamily: 'inherit', fontSize: 12 }} />
              <button onClick={() => setSel(o => ({ ...o, [k]: c }))} style={{ ...s.btn(C, 'ghost'), padding: '2px 6px', fontSize: 10, width: 'auto' }}>tudo</button>
            </div>
          </div>
        ))}
        {Object.values(g.troops).every(c => c === 0) && <div style={{ fontSize: 12, color: '#d68f88' }}>Você não tem tropas em casa. Recrute no Quartel/Estábulo.</div>}
      </div>
      <button onClick={() => { p.sendTroops(tid, sel, mode); setSel({}); }} style={{ ...s.btn(C, mode === 'attack' ? 'red' : 'blue'), padding: 11, fontSize: 14 }}>{mode === 'attack' ? '⚔️ Enviar ataque' : '🛡️ Enviar apoio'}</button>
    </div>)}

    {view === 'movimentos' && (<div style={{ fontFamily: 'Georgia, serif', fontSize: 12 }}>
      {g.movements.length === 0 && <div style={{ color: C.sub }}>Nenhum movimento ativo.</div>}
      {g.movements.map(m => (
        <div key={m.id} style={{ background: 'rgba(0,0,0,.2)', border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: C.gold }}>{m.phase === 'stationed' ? '🛡️ Apoiando' : m.mode === 'attack' ? (m.phase === 'back' ? '🏠 Voltando de' : '⚔️ Atacando') : '🛡️ Apoio a'} {m.target.name}</span>
            {m.phase !== 'stationed' && <span style={{ color: C.sub }}>{fmtTime(m.left)}</span>}
          </div>
          <div style={{ color: C.sub, marginTop: 2 }}>{Object.entries(m.troops).map(([k, c]) => `${TROOPS[k].icon}${fmt(c)}`).join(' ')}</div>
          {m.phase === 'stationed' && <button onClick={() => p.recall(m.id)} style={{ ...s.btn(C, 'ghost'), padding: 6, fontSize: 11, marginTop: 4 }}>↩️ Trazer de volta</button>}
        </div>
      ))}
      {g.reports.length > 0 && (<>
        <div style={{ color: C.gold, margin: '12px 0 6px' }}>📜 Relatórios</div>
        {g.reports.slice(0, 6).map(r => (
          <button key={r.id} onClick={() => p.setReport(r)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'rgba(0,0,0,.2)', border: `1px solid ${r.win ? C.greenB : C.redB}`, borderRadius: 8, padding: 8, marginBottom: 4, color: C.ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
            {r.win ? (r.conquered ? '👑' : '🏆') : '💀'} {r.name} — toque para ver
          </button>
        ))}
      </>)}
    </div>)}
  </div>);
}

/* ---------- COMPONENTES BASE ---------- */
function Modal({ C, title, subtitle, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, padding: 12 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(#221a0f,#191309)', border: `2px solid ${C.gold}`, borderRadius: 14, padding: 16, maxWidth: 560, width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,.7)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div><div style={{ fontSize: 18, fontWeight: 700, color: C.gold, letterSpacing: '.5px' }}>{title}</div>
            <div style={{ fontSize: 12, color: C.sub, fontFamily: 'Georgia, serif' }}>{subtitle}</div></div>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 6, padding: '2px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Res({ icon, val, cap, color }) {
  const pct = Math.min(100, (val / cap) * 100);
  return (<div style={{ background: 'rgba(0,0,0,.3)', border: '1px solid #5a4426', borderRadius: 8, padding: '4px 10px', minWidth: 92, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: `${pct}%`, background: pct > 95 ? '#d0453a' : color }} />
    <div style={{ fontSize: 13, fontWeight: 'bold' }}>{icon} {Math.floor(val).toLocaleString('pt-BR')}</div>
  </div>);
}
function Pill({ C, children }) { return <span style={{ background: 'rgba(0,0,0,.3)', border: `1px solid ${C.border}`, borderRadius: 14, padding: '4px 10px', color: C.ink }}>{children}</span>; }

const s = {
  desc: (C) => ({ fontSize: 12.5, color: C.ink, lineHeight: 1.5, fontFamily: 'Georgia, serif', margin: '0 0 10px' }),
  lock: (C) => ({ background: 'rgba(220,38,38,.12)', borderRadius: 8, padding: 12, textAlign: 'center', fontSize: 12, color: '#d68f88', fontFamily: 'Georgia, serif' }),
  maxed: (C) => ({ marginTop: 12, textAlign: 'center', padding: 10, background: 'rgba(212,175,55,.15)', borderRadius: 8, color: C.gold, fontSize: 13 }),
  btn: (C, kind) => {
    const m = {
      green: { bg: `linear-gradient(${C.green},#2d4521)`, bd: C.greenB, col: C.ink },
      red: { bg: `linear-gradient(${C.red},#5e1d17)`, bd: C.redB, col: C.ink },
      blue: { bg: `linear-gradient(${C.blue},#1d3744)`, bd: C.blueB, col: C.ink },
      gold: { bg: C.gold, bd: C.gold, col: '#1a1208' },
      ghost: { bg: 'transparent', bd: C.border, col: C.sub },
      off: { bg: '#241a0c', bd: C.border, col: '#6b5d3f' }
    }[kind];
    return { width: '100%', padding: 9, borderRadius: 8, border: `1px solid ${m.bd}`, background: m.bg, color: m.col, cursor: kind === 'off' ? 'not-allowed' : 'pointer', fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 13, letterSpacing: '.3px' };
  }
};




