export const SANDBOX_MAX_BODIES = 260;
export const SANDBOX_KINDS = ['planet', 'gas', 'star', 'wd', 'ns', 'bh', 'whitehole', 'darkmatter', 'nebula', 'galaxy'];

function invalid(message) {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
}
function number(value, fallback, min, max, name) {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) invalid(name + '超出有效范围');
  return value;
}
function vector(value, fallback, min, max, name) {
  if (value === undefined) return [...fallback];
  if (!Array.isArray(value) || value.length !== 3) invalid(name + '必须包含三个数值');
  return value.map(v => number(v, 0, min, max, name));
}
function text(value, fallback, max) {
  return typeof value === 'string' ? value.slice(0, max) : fallback;
}
function flag(value, fallback = false) {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') invalid('开关必须是布尔值');
  return value;
}
export function normalizeSandboxBody(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('天体数据无效');
  const kind = value.kind ?? 'planet';
  if (!SANDBOX_KINDS.includes(kind)) invalid('天体类型无效');
  const radius = number(value.radius, 1.5, 0.001, 500, '模型半径');
  const body = {
    initialKind: SANDBOX_KINDS.includes(value.initialKind) ? value.initialKind : kind,
    name: text(value.name, '天体', 80), badge: text(value.badge, '自定义天体', 100), kind,
    mass: number(value.mass, 0.04, 1e-30, 1e9, '质量'), radius,
    baseRadius: number(value.baseRadius, radius, 0.001, 500, '初始半径'),
    density: number(value.density, 5, 0, 1e30, '密度'),
    pos: vector(value.pos, [0, 0, 0], -1e7, 1e7, '位置'),
    vel: vector(value.vel, [0, 0, 0], -1e5, 1e5, '速度'),
    color: vector(value.color, [0.5, 0.6, 0.7], 0, 1, '颜色'),
    temp: number(value.temp, 15, -273.15, 1e9, '温度'),
    water: number(value.water, 0, 0, 100, '水覆盖率'),
    atmo: number(value.atmo, 0, 0, 5, '大气'), spin: number(value.spin, kind === 'ns' ? 6.5 : 0.6, -1e4, 1e4, '自旋'),
    ring: flag(value.ring), pulsar: flag(value.pulsar), isDebris: flag(value.isDebris),
    realm: ['real', 'speculative', 'fiction'].includes(value.realm) ? value.realm : 'fiction',
    catalogId: text(value.catalogId, '', 180),
    physicalRadiusKm: number(value.physicalRadiusKm, 0, 0, 1e20, '物理半径'),
    sourceNote: text(value.sourceNote, '', 200),
    manualTempLock: number(value.manualTempLock, 0, 0, 1e5, '温度锁定时间')
  };
  if (value.initState !== undefined) {
    const initial = value.initState;
    if (!initial || typeof initial !== 'object' || Array.isArray(initial)) invalid('默认状态无效');
    body.initState = {
      mass: number(initial.mass, body.mass, 1e-30, 1e9, '初始质量'),
      radius: number(initial.radius, body.baseRadius, 0.001, 500, '初始半径'),
      physicalRadiusKm: number(initial.physicalRadiusKm, body.physicalRadiusKm, 0, 1e20, '初始物理半径'),
      density: number(initial.density, body.density, 0, 1e30, '初始密度'),
      temp: number(initial.temp, body.temp, -273.15, 1e9, '初始温度'),
      water: number(initial.water, body.water, 0, 100, '初始水覆盖'),
      atmo: number(initial.atmo, body.atmo, 0, 5, '初始大气'),
      spin: number(initial.spin, body.spin, -1e4, 1e4, '初始自旋'),
      color: vector(initial.color, body.color, 0, 1, '初始颜色'), ring: flag(initial.ring, body.ring)
    };
  }
  return body;
}
export function normalizeSandboxUniverse(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Array.isArray(value.bodies)) invalid('宇宙存档数据无效');
  if (value.bodies.length > SANDBOX_MAX_BODIES) invalid('天体数量超过上限');
  const collideMode = value.collideMode ?? 'scientific';
  if (!['scientific', 'shatter', 'bounce'].includes(collideMode)) invalid('碰撞模式无效');
  const sizeMode = value.sizeMode ?? 'illustrative';
  if (!['illustrative', 'proportional'].includes(sizeMode)) invalid('尺寸模式无效');
  let cosmos = null;
  if(value.cosmos != null) {
    if(!value.cosmos || !['big_bang','big_crunch','big_rip','heat_death','whitehole'].includes(value.cosmos.mode)) invalid('宇宙演化模式无效');
    cosmos={mode:value.cosmos.mode,time:number(value.cosmos.time,0,0,1e12,'演化时间'),scale:number(value.cosmos.scale,1,0.00001,100,'尺度因子')};
  }
  return {
    cosmos, version: 2, preset: text(value.preset, 'blank', 50),
    gravity: number(value.gravity, 1, -1, 4, '引力'), speed: number(value.speed, 1, 0.1, 10, '时间速度'),
    lumMult: number(value.lumMult, 1, 0.2, 4, '光度'), simYears: number(value.simYears, 0, 0, 1e12, '模拟时间'),
    rocheEnabled: flag(value.rocheEnabled, true), collideMode, sizeMode,
    showTrails: flag(value.showTrails, true), showHZ: flag(value.showHZ, true),
    showGrid: flag(value.showGrid), showVel: flag(value.showVel), showLabels: flag(value.showLabels, true),
    paused: flag(value.paused), camera: vector(value.camera, [0, 72, 108], -1e7, 1e7, '相机'),
    target: vector(value.target, [0, 0, 0], -1e7, 1e7, '观察中心'),
    bodies: value.bodies.map(normalizeSandboxBody)
  };
}
