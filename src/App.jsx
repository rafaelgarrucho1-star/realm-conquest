import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================
// ⚔️ REALM CONQUEST - VERSÃO COMPLETA SINGLE-PLAYER
// 12 edifícios • 11 tropas • Pesquisa • Combate IA • Conquista
// Save automático no navegador
// ============================================================

const BUILDINGS = {
  mainBuilding: { name: 'Edifício Principal', icon: '🏛️', maxLevel: 30, popCost: 5, w: 100, i: 100, h: 50, time: 180, desc: 'Reduz tempo de construção' },
  farm: { name: 'Fazenda', icon: '🌾', maxLevel: 30, popCost: 2, w: 50, i: 30, h: 30, time: 90, produces: 'wheat', desc: 'Produz trigo + população' },
  woodcutter: { name: 'Serraria', icon: '🪵', maxLevel: 30, popCost: 2, w: 50, i: 30, h: 30, time: 90, produces: 'wood', desc: 'Produz madeira' },
  mine: { name: 'Mina', icon: '⛏️', maxLevel: 30, popCost: 2, w: 50, i: 30, h: 30, time: 90, produces: 'iron', desc: 'Produz ferro' },
  warehouse: { name: 'Armazém', icon: '🏠', maxLevel: 30, popCost: 2, w: 50, i: 30, h: 30, time: 90, desc: 'Capacidade de recursos' },
  barracks: { name: 'Quartel', icon: '🎖️', maxLevel: 25, popCost: 3, w: 100, i: 50, h: 50, time: 180, desc: 'Treina infantaria' },
  stable: { name: 'Estábulo', icon: '🐴', maxLevel: 20, popCost: 3, w: 150, i: 100, h: 100, time: 300, desc: 'Treina cavalaria/espião' },
  workshop: { name: 'Oficina', icon: '🔨', maxLevel: 20, popCost: 3, w: 200, i: 150, h: 100, time: 600, desc: 'Treina aríete/catapulta' },
  smithy: { name: 'Ferreiro', icon: '🔧', maxLevel: 20, popCost: 3, w: 500, i: 400, h: 300, time: 1800, desc: 'Pesquisa tropas/bônus' },
  market: { name: 'Mercado', icon: '🏪', maxLevel: 20, popCost: 3, w: 100, i: 50, h: 50, time: 180, desc: 'Comércio' },
  wall: { name: 'Muralha', icon: '🧱', maxLevel: 20, popCost: 2, w: 100, i: 50, h: 50, time: 180, desc: 'Defesa +5%/nível' },
  church: { name: 'Igreja', icon: '⛪', maxLevel: 1, popCost: 30, w: 200000, i: 150000, h: 100000, time: 86400, desc: 'Treina sacerdotes', req: { mainBuilding: 10, smithy: 20, barracks: 15 } }
};

const TROOPS = {
  spearman: { name: 'Lanceiro', icon: '🔱', atk: 8, def: 12, speed: 6, pop: 1, carry: 45, w: 0, i: 5, h: 55, time: 420, building: 'barracks', research: 1500, smithyReq: 1, desc: 'DOMINA cavalaria!' },
  swordsman: { name: 'Espadachim', icon: '🗡️', atk: 10, def: 8, speed: 6, pop: 1, carry: 50, w: 0, i: 0, h: 50, time: 540, building: 'barracks', research: 1000, smithyReq: 1, desc: 'Versátil e barato' },
  archer: { name: 'Arqueiro', icon: '🏹', atk: 12, def: 4, speed: 6, pop: 1, carry: 40, w: 100, i: 0, h: 50, time: 660, building: 'barracks', research: 3000, smithyReq: 3, desc: 'Mata infantaria' },
  barbarian: { name: 'Bárbaro', icon: '🪓', atk: 15, def: 10, speed: 6, pop: 1, carry: 60, w: 0, i: 20, h: 80, time: 840, building: 'barracks', research: 5000, smithyReq: 5, desc: 'Bruto forte' },
  spy: { name: 'Espião', icon: '🕵️', atk: 0, def: 0, speed: 12, pop: 1, carry: 0, w: 50, i: 25, h: 100, time: 720, building: 'stable', research: 4000, smithyReq: 5, desc: 'Reconhecimento' },
  cavalry: { name: 'Cavalaria', icon: '🐴', atk: 25, def: 15, speed: 18, pop: 2, carry: 100, w: 0, i: 20, h: 200, time: 2100, building: 'stable', research: 10000, smithyReq: 8, desc: 'Rápida e forte' },
  archerCav: { name: 'Arq.Cavalo', icon: '🐎', atk: 18, def: 10, speed: 15, pop: 2, carry: 80, w: 100, i: 30, h: 180, time: 1680, building: 'stable', research: 15000, smithyReq: 10, desc: 'Rápido + distância' },
  ram: { name: 'Aríete', icon: '⚒️', atk: 50, def: 8, speed: 6, pop: 4, carry: 0, w: 300, i: 150, h: 100, time: 2700, building: 'workshop', research: 20000, smithyReq: 12, desc: 'Destrói muralhas' },
  royalCav: { name: 'Cav.Real', icon: '👑', atk: 40, def: 25, speed: 16, pop: 3, carry: 120, w: 100, i: 100, h: 300, time: 3000, building: 'stable', research: 30000, smithyReq: 15, desc: 'Elite suprema' },
  catapult: { name: 'Catapulta', icon: '💣', atk: 80, def: 2, speed: 4, pop: 5, carry: 0, w: 100, i: 100, h: 400, time: 3600, building: 'workshop', research: 35000, smithyReq: 18, desc: 'Destrói tudo' },
  priest: { name: 'Sacerdote', icon: '✝️', atk: 0, def: 5, speed: 6, pop: 50, carry: 0, w: 30000, i: 30000, h: 30000, time: 14400, building: 'church', research: 0, smithyReq: 0, desc: 'Conquista aldeias' }
};

const RESEARCH_BONUS = {
  warhorse: { name: 'Corcel de Guerra', icon: '🐴', cost: 50000, effect: '+5% atk cavalaria', target: ['cavalry', 'royalCav', 'archerCav'], smithyReq: 8 },
  longbow: { name: 'Arco Longo', icon: '🏹', cost: 40000, effect: '+5% atk arqueiros', target: ['archer', 'archerCav'], smithyReq: 6 },
  steel: { name: 'Aço Temperado', icon: '⚔️', cost: 45000, effect: '+5% atk infantaria', target: ['swordsman', 'spearman', 'barbarian'], smithyReq: 7 },
  siege: { name: 'Engenharia de Cerco', icon: '💥', cost: 80000, effect: '+10% aríete/catapulta', target: ['ram', 'catapult'], smithyReq: 12 }
};

const buildCost = (key, lvl) => { const b = BUILDINGS[key], m = Math.pow(1.18, Math.max(0, lvl - 1)); return { w: Math.floor(b.w * m), i: Math.floor(b.i * m), h: Math.floor(b.h * m) }; };
const buildTime = (key, lvl, main) => { const b = BUILDINGS[key], base = b.time + Math.max(0, lvl - 1) * 1200, r = Math.max(0, (main - 1) * 0.01); return Math.floor(base * (1 - r)); };
const production = (lvl) => 50 + Math.max(0, lvl - 1) * 145;
const warehouseCap = (lvl) => Math.floor(1000 * Math.pow(1.25, Math.max(0, lvl - 1)));
const maxPop = (lvl) => Math.min(30000, 300 + Math.max(0, lvl - 1) * 1024);
const troopTime = (key, lvl) => { const r = Math.max(0, (lvl - 1) * 0.01); return Math.floor(TROOPS[key].time * (1 - r)); };
const priestCost = (n) => { const c = Math.floor(30000 * Math.pow(1.10, n)); return { w: c, i: c, h: c }; };
const fmt = (n) => Math.floor(n).toLocaleString('pt-BR');
const fmtTime = (s) => { if (s < 60) return `${Math.ceil(s)}s`; if (s < 3600) return `${Math.floor(s/60)}m`; const h = Math.floor(s/3600), m = Math.floor((s%3600)/60); return `${h}h${m}m`; };

const initialState = () => ({
  resources: { wood: 1000, iron: 500, wheat: 1000 },
  buildings: { mainBuilding: 1, farm: 1, woodcutter: 1, mine: 1, warehouse: 1, barracks: 0, stable: 0, workshop: 0, smithy: 0, market: 0, wall: 0, church: 0 },
  troops: { spearman: 0, swordsman: 0, archer: 0, barbarian: 0, spy: 0, cavalry: 0, archerCav: 0, ram: 0, royalCav: 0, catapult: 0, priest: 0 },
  research: {}, researchBonus: {}, gold: 500, isVip: false, villagesOwned: 1
});

const genEnemies = () => {
  const list = [], names = ['Forte Negro', 'Vale Sombrio', 'Pico Gelado', 'Campo Vermelho', 'Ermo Cinza', 'Bastião', 'Covil', 'Ruínas'];
  for (let i = 0; i < 12; i++) {
    const diff = i < 5 ? 'easy' : i < 9 ? 'medium' : 'hard';
    const m = diff === 'easy' ? 1 : diff === 'medium' ? 4 : 10;
    list.push({
      id: i + 1, name: names[i % names.length] + ' ' + (Math.floor(i / names.length) + 1),
      x: 380 + Math.floor(Math.random() * 240), y: 380 + Math.floor(Math.random() * 240),
      diff, loyalty: 100, conquered: false,
      troops: { spearman: Math.floor((15 + Math.random() * 20) * m), swordsman: Math.floor((10 + Math.random() * 15) * m), archer: Math.floor((8 + Math.random() * 12) * m) },
      wallLevel: Math.min(20, Math.floor(m * 1.5)),
      resources: { wood: Math.floor((2000 + Math.random() * 4000) * m), iron: Math.floor((1000 + Math.random() * 2000) * m), wheat: Math.floor((2000 + Math.random() * 4000) * m) }
    });
  }
  return list;
};

export default function RealmConquest() {
  const [game, setGame] = useState(() => { try { const s = localStorage.getItem('rcSave'); return s ? JSON.parse(s) : initialState(); } catch { return initialState(); } });
  const [enemies, setEnemies] = useState(() => { try { const s = localStorage.getItem('rcEnemies'); return s ? JSON.parse(s) : genEnemies(); } catch { return genEnemies(); } });
  const [bQueue, setBQueue] = useState([]);
  const [tQueue, setTQueue] = useState([]);
  const [tab, setTab] = useState('buildings');
  const [notif, setNotif] = useState('');
  const [combatLog, setCombatLog] = useState(null);
  const [selEnemy, setSelEnemy] = useState(null);
  const [atkTroops, setAtkTroops] = useState({});
  const tick = useRef(Date.now());

  const whCap = warehouseCap(game.buildings.warehouse);
  const maxP = maxPop(game.buildings.farm);
  const usedP = Object.entries(game.troops).reduce((s, [k, c]) => s + c * (TROOPS[k]?.pop || 0), 0) + Object.entries(game.buildings).reduce((s, [k, l]) => s + (l > 0 ? (BUILDINGS[k]?.popCost || 0) : 0), 0);
  const vip = game.isVip ? 1.2 : 1;
  const rates = { wood: production(game.buildings.woodcutter) * vip, iron: production(game.buildings.mine) * vip, wheat: production(game.buildings.farm) * vip };

  useEffect(() => { const t = setTimeout(() => { try { localStorage.setItem('rcSave', JSON.stringify(game)); localStorage.setItem('rcEnemies', JSON.stringify(enemies)); } catch {} }, 800); return () => clearTimeout(t); }, [game, enemies]);

  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now(), dt = (now - tick.current) / 1000; tick.current = now;
      setGame(g => ({ ...g, resources: { wood: Math.min(whCap, g.resources.wood + rates.wood / 3600 * dt), iron: Math.min(whCap, g.resources.iron + rates.iron / 3600 * dt), wheat: Math.min(whCap, g.resources.wheat + rates.wheat / 3600 * dt) } }));
      setBQueue(q => { if (!q.length) return q; const u = [...q]; u[0] = { ...u[0], left: u[0].left - dt }; if (u[0].left <= 0) { const d = u[0]; setGame(g => ({ ...g, buildings: { ...g.buildings, [d.key]: d.level } })); notify(`✅ ${BUILDINGS[d.key].name} nv${d.level}!`); return u.slice(1); } return u; });
      setTQueue(q => { if (!q.length) return q; const u = [...q]; u[0] = { ...u[0], left: u[0].left - dt }; if (u[0].left <= 0) { const d = u[0]; setGame(g => ({ ...g, troops: { ...g.troops, [d.key]: g.troops[d.key] + 1 } })); if (d.remaining > 1) { u[0] = { ...d, remaining: d.remaining - 1, left: d.unitTime }; return u; } notify(`⚔️ ${TROOPS[d.key].name} pronto!`); return u.slice(1); } return u; });
      setEnemies(es => es.map(e => e.loyalty < 100 && !e.conquered ? { ...e, loyalty: Math.min(100, e.loyalty + 1.75 / 3600 * dt) } : e));
    }, 100);
    return () => clearInterval(iv);
  }, [whCap, rates.wood, rates.iron, rates.wheat]);

  const notify = useCallback((m) => { setNotif(m); setTimeout(() => setNotif(''), 3500); }, []);
  const afford = (c) => game.resources.wood >= c.w && game.resources.iron >= c.i && game.resources.wheat >= c.h;
  const spend = (c) => setGame(g => ({ ...g, resources: { wood: g.resources.wood - c.w, iron: g.resources.iron - c.i, wheat: g.resources.wheat - c.h } }));
  const checkReq = (key) => { const b = BUILDINGS[key]; if (!b.req) return true; return Object.entries(b.req).every(([k, l]) => game.buildings[k] >= l); };

  const startBuild = (key) => {
    const b = BUILDINGS[key], cur = game.buildings[key], inQ = bQueue.filter(q => q.key === key).length, next = cur + inQ + 1;
    if (next > b.maxLevel) { notify(`⚠️ No máximo!`); return; }
    if (!checkReq(key)) { notify(`🔒 Requer: ${Object.entries(b.req).map(([k, l]) => `${BUILDINGS[k].name} nv${l}`).join(', ')}`); return; }
    const maxQ = game.isVip ? 5 : 2;
    if (bQueue.length >= maxQ) { notify(`⚠️ Fila cheia (${maxQ})!${!game.isVip ? ' Vire VIP!' : ''}`); return; }
    const cost = buildCost(key, next); let mult = 1; const lim = game.isVip ? 5 : 2;
    if (bQueue.length >= lim) mult = 1 + Math.min(1, (bQueue.length - lim + 1) * 0.1);
    const fc = { w: Math.floor(cost.w * mult), i: Math.floor(cost.i * mult), h: Math.floor(cost.h * mult) };
    if (!afford(fc)) { notify(`⚠️ Sem recursos!`); return; }
    spend(fc);
    setBQueue(q => [...q, { key, level: next, left: buildTime(key, next, game.buildings.mainBuilding) * (game.isVip ? 0.9 : 1), total: buildTime(key, next, game.buildings.mainBuilding) * (game.isVip ? 0.9 : 1) }]);
    notify(`🔨 ${b.name} nv${next}`);
  };

  const train = (key, amt) => {
    const t = TROOPS[key], bl = game.buildings[t.building];
    if (bl === 0) { notify(`⚠️ Construa ${BUILDINGS[t.building].name}!`); return; }
    if (t.research > 0 && !game.research[key]) { notify(`🔬 Pesquise no Ferreiro!`); return; }
    let cost, pop;
    if (key === 'priest') { const n = game.troops.priest + tQueue.filter(q => q.key === 'priest').reduce((s, q) => s + q.remaining, 0); cost = priestCost(n); pop = 50; amt = 1; }
    else { cost = { w: t.w * amt, i: t.i * amt, h: t.h * amt }; pop = t.pop; }
    if (usedP + pop * amt > maxP) { notify(`⚠️ Sem população!`); return; }
    if (!afford(cost)) { notify(`⚠️ Sem recursos!`); return; }
    spend(cost);
    const ut = troopTime(key, bl);
    setTQueue(q => [...q, { key, remaining: amt, unitTime: ut, left: ut, total: amt }]);
    notify(`⚔️ ${amt}x ${t.name}`);
  };

  const research = (key) => {
    const t = TROOPS[key];
    if (game.buildings.smithy < t.smithyReq) { notify(`🔒 Ferreiro nv${t.smithyReq}!`); return; }
    const c = { w: t.research, i: t.research, h: t.research };
    if (!afford(c)) { notify(`⚠️ Sem recursos!`); return; }
    spend(c); setGame(g => ({ ...g, research: { ...g.research, [key]: true } })); notify(`🔬 ${t.name} liberado!`);
  };

  const researchBonus = (key) => {
    const r = RESEARCH_BONUS[key];
    if (game.buildings.smithy < r.smithyReq) { notify(`🔒 Ferreiro nv${r.smithyReq}!`); return; }
    if (game.researchBonus[key]) return;
    const c = { w: r.cost, i: r.cost, h: r.cost };
    if (!afford(c)) { notify(`⚠️ Sem recursos!`); return; }
    spend(c); setGame(g => ({ ...g, researchBonus: { ...g.researchBonus, [key]: true } })); notify(`⚡ ${r.effect}!`);
  };

  const atkBonus = (k) => { let b = 1; Object.entries(RESEARCH_BONUS).forEach(([rk, r]) => { if (game.researchBonus[rk] && r.target.includes(k)) b += 0.05; }); return b; };

  const attack = () => {
    if (!selEnemy) return;
    const sending = Object.entries(atkTroops).filter(([k, v]) => v > 0);
    if (!sending.length) { notify(`⚠️ Selecione tropas!`); return; }
    for (const [k, v] of sending) if (v > game.troops[k]) { notify(`⚠️ Sem ${TROOPS[k].name} suficiente!`); return; }
    const enemy = enemies.find(e => e.id === selEnemy.id);
    const rams = atkTroops.ram || 0, effWall = Math.max(0, enemy.wallLevel - rams), wallB = 1 + effWall * 0.05;
    let atkP = 0; sending.forEach(([k, v]) => { if (TROOPS[k].atk > 0) atkP += TROOPS[k].atk * v * atkBonus(k); });
    let defP = 0; Object.entries(enemy.troops).forEach(([k, v]) => { defP += (TROOPS[k]?.def || 0) * v * wallB; });
    const won = atkP > defP;
    const log = { name: enemy.name, atkP: Math.floor(atkP), defP: Math.floor(defP), effWall, rams, won, losses: {}, loot: { w: 0, i: 0, h: 0 }, conquered: false, loyaltyRed: 0, enemyKilled: {} };
    const nt = { ...game.troops };

    if (won) {
      const ratio = Math.min(0.8, defP / Math.max(1, atkP));
      sending.forEach(([k, v]) => { const l = Math.floor(v * ratio); log.losses[k] = l; nt[k] -= l; });
      const carry = sending.reduce((s, [k, v]) => s + TROOPS[k].carry * (v - (log.losses[k] || 0)), 0);
      const tot = enemy.resources.wood + enemy.resources.iron + enemy.resources.wheat;
      const pct = Math.min(0.5, carry / Math.max(1, tot));
      log.loot = { w: Math.floor(enemy.resources.wood * pct), i: Math.floor(enemy.resources.iron * pct), h: Math.floor(enemy.resources.wheat * pct) };
      Object.keys(enemy.troops).forEach(k => log.enemyKilled[k] = enemy.troops[k]);

      const priests = atkTroops.priest || 0;
      if (priests > 0) {
        const red = priests * (20 + Math.random() * 15);
        log.loyaltyRed = Math.floor(red);
        const newLoy = Math.max(0, enemy.loyalty - red);
        if (newLoy <= 0) {
          if (game.villagesOwned >= 10) { notify(`⚠️ Máximo 10 aldeias!`); }
          else { log.conquered = true; setEnemies(es => es.map(e => e.id === enemy.id ? { ...e, conquered: true } : e)); setGame(g => ({ ...g, villagesOwned: g.villagesOwned + 1 })); }
        } else setEnemies(es => es.map(e => e.id === enemy.id ? { ...e, loyalty: newLoy } : e));
        nt.priest -= priests;
      }
      setGame(g => ({ ...g, troops: nt, resources: { wood: Math.min(whCap, g.resources.wood + log.loot.w), iron: Math.min(whCap, g.resources.iron + log.loot.i), wheat: Math.min(whCap, g.resources.wheat + log.loot.h) } }));
      if (!log.conquered) setEnemies(es => es.map(e => e.id !== enemy.id ? e : { ...e, troops: { spearman: 0, swordsman: 0, archer: 0 }, resources: { wood: e.resources.wood - log.loot.w, iron: e.resources.iron - log.loot.i, wheat: e.resources.wheat - log.loot.h } }));
    } else {
      sending.forEach(([k, v]) => { log.losses[k] = v; nt[k] -= v; });
      const ratio = atkP / Math.max(1, defP);
      Object.keys(enemy.troops).forEach(k => log.enemyKilled[k] = Math.floor(enemy.troops[k] * ratio * 0.5));
      setEnemies(es => es.map(e => e.id !== enemy.id ? e : { ...e, troops: Object.fromEntries(Object.entries(e.troops).map(([k, v]) => [k, Math.floor(v * (1 - ratio * 0.5))])) }));
      setGame(g => ({ ...g, troops: nt }));
    }
    setCombatLog(log); setSelEnemy(null); setAtkTroops({});
  };

  const reset = () => { if (window.confirm('Recomeçar? Todo progresso perdido!')) { setGame(initialState()); setEnemies(genEnemies()); setBQueue([]); setTQueue([]); notify('🔄 Reiniciado!'); } };

  const C = {
    bg: '#1a1410', panel: 'rgba(45,36,22,0.6)', border: '#4a3f28', gold: '#d4af37', text: '#e8dcc8', sub: '#a89968',
    green: '#3d5a2d', greenB: '#5a8040', red: '#5a2d2d', redB: '#804040', blue: '#2d4a5a', blueB: '#406080'
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${C.bg} 0%, #2d2416 50%, ${C.bg} 100%)`, color: C.text, fontFamily: 'Georgia, serif', padding: '12px' }}>
      <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{ fontSize: '28px', margin: 0, color: C.gold, letterSpacing: '1px' }}>⚔️ REALM CONQUEST</h1>
            <span style={{ fontSize: '12px', color: C.sub }}>🏰 {game.villagesOwned}/10 aldeias</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: C.gold }}>💰 {fmt(game.gold)}</span>
            <button onClick={() => setGame(g => ({ ...g, isVip: !g.isVip }))} style={{ background: game.isVip ? C.gold : C.panel, color: game.isVip ? C.bg : C.sub, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', fontFamily: 'inherit' }}>{game.isVip ? '👑 VIP' : 'VIP off'}</button>
            <button onClick={reset} style={{ background: 'transparent', color: '#a85', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>🔄</button>
          </div>
        </div>

        {notif && <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(45,36,22,0.97)', border: `2px solid ${C.gold}`, borderRadius: '8px', padding: '10px 20px', zIndex: 1000, fontSize: '14px', maxWidth: '90%', boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>{notif}</div>}

        {/* RECURSOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '12px' }}>
          {[['🪵', 'Madeira', game.resources.wood, rates.wood, '#8b6914'], ['⛏️', 'Ferro', game.resources.iron, rates.iron, '#6b7280'], ['🌾', 'Trigo', game.resources.wheat, rates.wheat, '#b8860b']].map(([ic, nm, val, rt, col]) => (
            <div key={nm} style={{ background: C.panel, border: `2px solid ${C.border}`, borderRadius: '8px', padding: '8px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', width: `${Math.min(100, (val / whCap) * 100)}%`, background: (val / whCap) > 0.95 ? '#dc2626' : col }} />
              <div style={{ fontSize: '11px', color: C.sub }}>{ic} {nm}</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{fmt(val)}</div>
              <div style={{ fontSize: '10px', color: '#7a8f5a' }}>+{fmt(rt)}/h · {fmt(whCap)}</div>
            </div>
          ))}
          <div style={{ background: C.panel, border: `2px solid ${C.border}`, borderRadius: '8px', padding: '8px' }}>
            <div style={{ fontSize: '11px', color: C.sub }}>👥 População</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: usedP >= maxP ? '#dc2626' : C.text }}>{fmt(usedP)}</div>
            <div style={{ fontSize: '10px', color: C.sub }}>de {fmt(maxP)}</div>
          </div>
        </div>

        {/* FILAS */}
        {(bQueue.length > 0 || tQueue.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <Queue title="🔨 Construção" q={bQueue} type="b" C={C} />
            <Queue title="⚔️ Treino" q={tQueue} type="t" C={C} />
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {[['buildings', '🏛️ Edifícios'], ['troops', '⚔️ Tropas'], ['research', '🔬 Pesquisa'], ['map', '🗺️ Mapa']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: '1 1 auto', background: tab === t ? C.gold : C.panel, color: tab === t ? C.bg : C.sub, border: `2px solid ${C.border}`, borderRadius: '8px', padding: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit', fontSize: '13px' }}>{l}</button>
          ))}
        </div>

        {/* BUILDINGS */}
        {tab === 'buildings' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
            {Object.entries(BUILDINGS).map(([key, b]) => {
              const lvl = game.buildings[key], inQ = bQueue.filter(q => q.key === key).length, next = lvl + inQ + 1;
              const isMax = next > b.maxLevel, locked = !checkReq(key);
              const cost = isMax ? null : buildCost(key, next);
              return (
                <div key={key} style={{ background: C.panel, border: `2px solid ${locked ? '#5a2d2d' : C.border}`, borderRadius: '8px', padding: '10px', opacity: locked ? 0.7 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '24px' }}>{b.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{b.name}</div>
                      <div style={{ fontSize: '11px', color: C.sub }}>Nv {lvl}/{b.maxLevel}{inQ > 0 ? ` (+${inQ})` : ''}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '10px', color: C.sub, marginBottom: '6px', minHeight: '24px' }}>{b.desc}{b.produces ? ` · ${fmt(production(lvl))}/h` : ''}</div>
                  {locked ? <div style={{ background: 'rgba(220,38,38,0.15)', borderRadius: '6px', padding: '6px', textAlign: 'center', fontSize: '10px', color: '#dc7777' }}>🔒 {Object.entries(b.req).map(([k, l]) => `${BUILDINGS[k].name.split(' ')[0]} ${l}`).join(', ')}</div>
                    : isMax ? <div style={{ background: 'rgba(212,175,55,0.2)', borderRadius: '6px', padding: '6px', textAlign: 'center', fontSize: '11px', color: C.gold }}>✨ Máximo</div>
                      : <>
                        <div style={{ fontSize: '10px', color: C.sub, marginBottom: '4px' }}>🪵{fmt(cost.w)} ⛏️{fmt(cost.i)} 🌾{fmt(cost.h)}</div>
                        <button onClick={() => startBuild(key)} disabled={!afford(cost)} style={{ width: '100%', background: afford(cost) ? C.green : '#3a3128', color: afford(cost) ? C.text : '#6b5d3f', border: `1px solid ${afford(cost) ? C.greenB : C.border}`, borderRadius: '6px', padding: '7px', cursor: afford(cost) ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold' }}>{lvl === 0 ? '🔨 Construir' : '⬆️ Evoluir'} ({fmtTime(buildTime(key, next, game.buildings.mainBuilding))})</button>
                      </>}
                </div>
              );
            })}
          </div>
        )}

        {/* TROOPS */}
        {tab === 'troops' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
            {Object.entries(TROOPS).map(([key, t]) => {
              const bl = game.buildings[t.building], avail = bl > 0;
              const needRes = t.research > 0 && !game.research[key];
              let cost; if (key === 'priest') { const n = game.troops.priest + tQueue.filter(q => q.key === 'priest').reduce((s, q) => s + q.remaining, 0); cost = priestCost(n); } else cost = { w: t.w, i: t.i, h: t.h };
              return (
                <div key={key} style={{ background: C.panel, border: `2px solid ${C.border}`, borderRadius: '8px', padding: '10px', opacity: avail ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '24px' }}>{t.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{t.name}</div>
                      <div style={{ fontSize: '11px', color: C.sub }}>Tem: {fmt(game.troops[key])}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '10px', color: C.sub, marginBottom: '4px' }}>
                    <span>⚔️{t.atk}</span><span>🛡️{t.def}</span><span>🏃{t.speed}</span><span>👤{t.pop}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#7a8f5a', marginBottom: '6px', minHeight: '14px' }}>{t.desc}</div>
                  {!avail ? <div style={{ background: 'rgba(220,38,38,0.15)', borderRadius: '6px', padding: '6px', textAlign: 'center', fontSize: '10px', color: '#dc7777' }}>🔒 Requer {BUILDINGS[t.building].name}</div>
                    : needRes ? <div style={{ background: 'rgba(96,80,180,0.2)', borderRadius: '6px', padding: '6px', textAlign: 'center', fontSize: '10px', color: '#a0a0e0' }}>🔬 Pesquise primeiro (aba Pesquisa)</div>
                      : <>
                        <div style={{ fontSize: '10px', color: C.sub, marginBottom: '4px' }}>🪵{fmt(cost.w)} ⛏️{fmt(cost.i)} 🌾{fmt(cost.h)}</div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {(key === 'priest' ? [1] : [1, 10, 50]).map(a => (
                            <button key={a} onClick={() => train(key, a)} disabled={!afford(key === 'priest' ? cost : { w: t.w * a, i: t.i * a, h: t.h * a })} style={{ flex: 1, background: afford(key === 'priest' ? cost : { w: t.w * a, i: t.i * a, h: t.h * a }) ? C.red : '#3a3128', color: afford(key === 'priest' ? cost : { w: t.w * a, i: t.i * a, h: t.h * a }) ? C.text : '#6b5d3f', border: `1px solid ${C.redB}`, borderRadius: '6px', padding: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>+{a}</button>
                          ))}
                        </div>
                      </>}
                </div>
              );
            })}
          </div>
        )}

        {/* RESEARCH */}
        {tab === 'research' && (
          <div>
            <h3 style={{ color: C.gold, fontSize: '16px', marginBottom: '8px' }}>🔬 Pesquisa de Tropas {game.buildings.smithy === 0 && <span style={{ fontSize: '12px', color: '#dc7777' }}>(Construa o Ferreiro!)</span>}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px' }}>
              {Object.entries(TROOPS).filter(([k, t]) => t.research > 0).map(([key, t]) => {
                const done = game.research[key], canDo = game.buildings.smithy >= t.smithyReq;
                return (
                  <div key={key} style={{ background: done ? 'rgba(61,90,45,0.3)' : C.panel, border: `2px solid ${done ? C.greenB : C.border}`, borderRadius: '8px', padding: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{t.icon} {t.name}</div>
                    <div style={{ fontSize: '10px', color: C.sub, margin: '2px 0' }}>Ferreiro nv{t.smithyReq}</div>
                    {done ? <div style={{ fontSize: '11px', color: C.greenB, fontWeight: 'bold' }}>✓ Liberado</div>
                      : <button onClick={() => research(key)} disabled={!canDo || !afford({ w: t.research, i: t.research, h: t.research })} style={{ width: '100%', background: canDo && afford({ w: t.research, i: t.research, h: t.research }) ? C.blue : '#3a3128', color: C.text, border: `1px solid ${C.blueB}`, borderRadius: '6px', padding: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>🔬 {fmt(t.research)} cada</button>}
                  </div>
                );
              })}
            </div>
            <h3 style={{ color: C.gold, fontSize: '16px', marginBottom: '8px' }}>⚡ Melhorias de Combate (acumulativas!)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {Object.entries(RESEARCH_BONUS).map(([key, r]) => {
                const done = game.researchBonus[key], canDo = game.buildings.smithy >= r.smithyReq;
                return (
                  <div key={key} style={{ background: done ? 'rgba(212,175,55,0.2)' : C.panel, border: `2px solid ${done ? C.gold : C.border}`, borderRadius: '8px', padding: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{r.icon} {r.name}</div>
                    <div style={{ fontSize: '10px', color: '#7a8f5a', margin: '2px 0' }}>{r.effect}</div>
                    <div style={{ fontSize: '10px', color: C.sub, marginBottom: '4px' }}>Ferreiro nv{r.smithyReq}</div>
                    {done ? <div style={{ fontSize: '11px', color: C.gold, fontWeight: 'bold' }}>⚡ Ativo</div>
                      : <button onClick={() => researchBonus(key)} disabled={!canDo || !afford({ w: r.cost, i: r.cost, h: r.cost })} style={{ width: '100%', background: canDo && afford({ w: r.cost, i: r.cost, h: r.cost }) ? C.blue : '#3a3128', color: C.text, border: `1px solid ${C.blueB}`, borderRadius: '6px', padding: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>⚡ {fmt(r.cost)} cada</button>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MAP */}
        {tab === 'map' && (
          <div>
            <h3 style={{ color: C.gold, fontSize: '16px', marginBottom: '8px' }}>🗺️ Aldeias Inimigas (ataque para saquear/conquistar)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {enemies.map(e => {
                const diffColor = e.diff === 'easy' ? '#5a8040' : e.diff === 'medium' ? '#b8860b' : '#804040';
                const totalTroops = Object.values(e.troops).reduce((s, v) => s + v, 0);
                return (
                  <div key={e.id} style={{ background: e.conquered ? 'rgba(61,90,45,0.3)' : C.panel, border: `2px solid ${e.conquered ? C.greenB : diffColor}`, borderRadius: '8px', padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{e.conquered ? '✅' : e.diff === 'hard' ? '💀' : e.diff === 'medium' ? '⚔️' : '🪓'} {e.name}</span>
                      <span style={{ fontSize: '9px', color: diffColor, textTransform: 'uppercase' }}>{e.conquered ? 'SUA' : e.diff}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: C.sub, margin: '4px 0' }}>📍 ({e.x}|{e.y}) · 🧱 Muralha nv{e.wallLevel}</div>
                    {!e.conquered && <>
                      <div style={{ fontSize: '10px', color: C.sub }}>🛡️ Defesa: {fmt(totalTroops)} tropas</div>
                      <div style={{ fontSize: '10px', color: C.sub, marginBottom: '4px' }}>💰 ~{fmt(e.resources.wood + e.resources.iron + e.resources.wheat)} recursos</div>
                      <div style={{ marginBottom: '6px' }}>
                        <div style={{ fontSize: '9px', color: C.sub }}>Lealdade: {Math.floor(e.loyalty)}%</div>
                        <div style={{ height: '4px', background: '#2d2416', borderRadius: '2px' }}><div style={{ height: '100%', width: `${e.loyalty}%`, background: e.loyalty > 50 ? '#dc2626' : C.gold, borderRadius: '2px' }} /></div>
                      </div>
                      <button onClick={() => { setSelEnemy(e); setAtkTroops({}); }} style={{ width: '100%', background: C.red, color: C.text, border: `1px solid ${C.redB}`, borderRadius: '6px', padding: '7px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold' }}>⚔️ Atacar</button>
                    </>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL ATAQUE */}
        {selEnemy && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '12px' }} onClick={() => setSelEnemy(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: C.bg, border: `2px solid ${C.gold}`, borderRadius: '12px', padding: '16px', maxWidth: '500px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
              <h3 style={{ color: C.gold, fontSize: '18px', margin: '0 0 4px' }}>⚔️ Atacar {selEnemy.name}</h3>
              <p style={{ fontSize: '12px', color: C.sub, margin: '0 0 12px' }}>🧱 Muralha nv{selEnemy.wallLevel} · 🛡️ {fmt(Object.values(selEnemy.troops).reduce((s, v) => s + v, 0))} defensores · Lealdade {Math.floor(selEnemy.loyalty)}%</p>
              <div style={{ fontSize: '11px', color: '#a0a0e0', background: 'rgba(96,80,180,0.15)', borderRadius: '6px', padding: '8px', marginBottom: '12px' }}>💡 Dica: Leve Aríetes para quebrar muralha. Leve 4 Sacerdotes para conquistar de uma vez!</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px', marginBottom: '12px' }}>
                {Object.entries(TROOPS).filter(([k]) => game.troops[k] > 0).map(([key, t]) => (
                  <div key={key} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '6px' }}>
                    <div style={{ fontSize: '11px', marginBottom: '2px' }}>{t.icon} {t.name} ({game.troops[key]})</div>
                    <input type="number" min="0" max={game.troops[key]} value={atkTroops[key] || ''} onChange={e => { const v = Math.min(game.troops[key], Math.max(0, parseInt(e.target.value) || 0)); setAtkTroops(p => ({ ...p, [key]: v })); }} placeholder="0" style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '4px', padding: '4px', color: C.text, fontFamily: 'inherit', fontSize: '12px' }} />
                    <button onClick={() => setAtkTroops(p => ({ ...p, [key]: game.troops[key] }))} style={{ width: '100%', marginTop: '2px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '4px', padding: '2px', color: C.sub, fontSize: '9px', cursor: 'pointer', fontFamily: 'inherit' }}>Tudo</button>
                  </div>
                ))}
              </div>
              {Object.keys(game.troops).every(k => game.troops[k] === 0) && <p style={{ fontSize: '12px', color: '#dc7777', textAlign: 'center' }}>⚠️ Você não tem tropas! Treine primeiro.</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={attack} style={{ flex: 1, background: C.red, color: C.text, border: `1px solid ${C.redB}`, borderRadius: '8px', padding: '10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold' }}>⚔️ ATACAR!</button>
                <button onClick={() => setSelEnemy(null)} style={{ background: 'transparent', color: C.sub, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL RESULTADO */}
        {combatLog && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '12px' }} onClick={() => setCombatLog(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: C.bg, border: `2px solid ${combatLog.won ? C.greenB : C.redB}`, borderRadius: '12px', padding: '16px', maxWidth: '440px', width: '100%' }}>
              <h3 style={{ color: combatLog.won ? C.greenB : C.redB, fontSize: '20px', margin: '0 0 8px', textAlign: 'center' }}>{combatLog.conquered ? '👑 CONQUISTADO!' : combatLog.won ? '🏆 VITÓRIA!' : '💀 DERROTA!'}</h3>
              <p style={{ fontSize: '13px', color: C.text, textAlign: 'center', margin: '0 0 12px' }}>Ataque a {combatLog.name}</p>
              <div style={{ background: C.panel, borderRadius: '8px', padding: '10px', marginBottom: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>⚔️ Seu poder:</span><span style={{ color: C.gold }}>{fmt(combatLog.atkP)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🛡️ Defesa inimiga:</span><span style={{ color: C.gold }}>{fmt(combatLog.defP)}</span></div>
                {combatLog.rams > 0 && <div style={{ fontSize: '11px', color: '#7a8f5a', marginTop: '4px' }}>⚒️ {combatLog.rams} aríetes → muralha reduzida p/ nv{combatLog.effWall}</div>}
              </div>
              {combatLog.won && (
                <div style={{ background: 'rgba(61,90,45,0.2)', borderRadius: '8px', padding: '10px', marginBottom: '10px', fontSize: '12px' }}>
                  <div style={{ color: C.greenB, fontWeight: 'bold', marginBottom: '4px' }}>💰 Saque:</div>
                  <div>🪵 {fmt(combatLog.loot.w)} · ⛏️ {fmt(combatLog.loot.i)} · 🌾 {fmt(combatLog.loot.h)}</div>
                  {combatLog.loyaltyRed > 0 && <div style={{ marginTop: '4px', color: C.gold }}>✝️ Lealdade -{combatLog.loyaltyRed}%</div>}
                </div>
              )}
              {Object.keys(combatLog.losses).some(k => combatLog.losses[k] > 0) && (
                <div style={{ fontSize: '11px', color: '#dc7777', marginBottom: '10px' }}>☠️ Suas baixas: {Object.entries(combatLog.losses).filter(([k, v]) => v > 0).map(([k, v]) => `${v} ${TROOPS[k].name}`).join(', ')}</div>
              )}
              <button onClick={() => setCombatLog(null)} style={{ width: '100%', background: C.gold, color: C.bg, border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold' }}>Continuar</button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#6b5d3f', fontSize: '11px' }}>
          💾 Salvamento automático · Recursos crescem mesmo offline · Feche e volte quando quiser
        </div>
      </div>
    </div>
  );
}

function Queue({ title, q, type, C }) {
  return (
    <div style={{ background: C.panel, border: `2px solid ${C.border}`, borderRadius: '8px', padding: '8px' }}>
      <div style={{ fontSize: '12px', color: C.gold, marginBottom: '4px', fontWeight: 'bold' }}>{title}</div>
      {!q.length ? <div style={{ fontSize: '11px', color: '#6b5d3f' }}>Vazia</div> : q.slice(0, 3).map((it, i) => {
        const d = type === 'b' ? BUILDINGS[it.key] : TROOPS[it.key];
        const tot = type === 'b' ? it.total : it.unitTime;
        const pct = ((tot - it.left) / tot) * 100;
        return (
          <div key={i} style={{ marginBottom: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span>{d.icon} {d.name}{type === 'b' ? ` ${it.level}` : ` (${it.remaining})`}</span>
              <span style={{ color: C.sub }}>{fmtTime(it.left)}</span>
            </div>
            {i === 0 && <div style={{ height: '3px', background: '#2d2416', borderRadius: '2px', marginTop: '2px' }}><div style={{ height: '100%', width: `${pct}%`, background: C.gold, borderRadius: '2px' }} /></div>}
          </div>
        );
      })}
    </div>
  );
}
