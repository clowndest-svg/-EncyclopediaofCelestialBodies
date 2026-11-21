import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { normalizeSandboxUniverse, normalizeSandboxBody } from '../../.work/sandbox-schema.mjs';

const source=new URL('../../.work/',import.meta.url);
const threeSource=fs.readFileSync(new URL('vendor-20261120/build_three.module.min.js',source),'utf8');
const THREE=await import('data:text/javascript;base64,'+Buffer.from(threeSource).toString('base64'));
const drawing=new Proxy({}, {get:()=>()=>{}});
function fixture() {
  const nodes=new Map(),stored=new Map(),windowEvents=new Map();
  class Node {
    constructor(){this.hidden=false;this.style={};this.value='';this.children=[];this.classList={toggle(){},add(){},remove(){}};}
    appendChild(n){this.children.push(n);return n;} append(...ns){this.children.push(...ns);} remove(){} replaceChildren(...ns){this.children=ns;}
    setAttribute(k,v){this[k]=v;} addEventListener(type,handler){this[type]=handler;} getContext(){return drawing;} querySelectorAll(){return [];} matches(){return false;} closest(){return null;}
    getBoundingClientRect(){return {left:0,top:0,width:1000,height:800};}
  }
  const document={getElementById:id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);},createElement:()=>new Node(),querySelectorAll:()=>[],addEventListener(){}};
  const context=vm.createContext({THREE,Math,Number,Set,Map,Array,Object,JSON,Date,Error,URLSearchParams,AbortController,performance,
    document,window:{addEventListener(type,handler){windowEvents.set(type,handler);}},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},
    innerWidth:1280,location:{search:'?test'},Option:class extends Node {constructor(text,value){super();this.textContent=text;this.value=value;}},
    setTimeout:()=>1,clearTimeout(){},cancelAnimationFrame(){},requestAnimationFrame:()=>1,
    audioEngine:{enabled:false,playImpact(){},playExplosion(){}},bookEscape:x=>String(x),
    deterministicRandom:seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},
    glowSprite:(color,size,opacity)=>{const sprite=new THREE.Sprite(new THREE.SpriteMaterial({color,opacity}));sprite.scale.set(size,size,1);return sprite;},
    glowPoints:(geo,size,opacity)=>new THREE.Points(geo,new THREE.PointsMaterial({size,opacity})),
    disposeTree:o=>{if(!o)return;o.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});o.removeFromParent();}
  });
  for(const file of ['sandbox-schema.mjs','sandbox2-science.js','sandbox2.js','sandbox2-universe.js','sandbox2-saves.js','sandbox2-telemetry.js','sandbox2-galaxies.js']) {
    vm.runInContext(fs.readFileSync(new URL(file,source),'utf8').replace(/\bexport\s+/g,''),context,{filename:file});
  }
  const run=script=>vm.runInContext(script,context);
  run("sb.open=true;sb.scene=new THREE.Scene();sb.camera=new THREE.PerspectiveCamera(48,1.6,.01,10000);sb.controls={target:new THREE.Vector3(),enabled:true,update(){}};sb.sizeMode='illustrative';sb.rocheEnabled=false;");
  const full=fs.readFileSync(new URL('sandbox2.js',source),'utf8');
  const toolStart=full.indexOf('      function setTool('),toolEnd=full.indexOf('      window._sbSetTool = setTool;',toolStart);
  run('const hints={};'+full.slice(toolStart,toolEnd));
  run("sb.laserLine=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0],3)),new THREE.LineBasicMaterial());");
  return {run,nodes,stored,windowEvents};
}

test('schema rejects invalid body entries and nonfinite or mistyped values',()=>{
  for(const data of [{bodies:[null]},{gravity:'1',bodies:[]},{bodies:[{mass:Infinity}]},{bodies:[{pos:[0,NaN,0]}]},{bodies:[{vel:[1,2]}]},{bodies:[{temp:-274}]},{bodies:Array(261).fill({})}]) assert.throws(()=>normalizeSandboxUniverse(data));
  const b=normalizeSandboxBody({temp:-273.15,water:0,atmo:0,color:[0,0,0],spin:0});
  assert.equal(b.temp,-273.15);assert.equal(b.spin,0);assert.deepEqual(b.color,[0,0,0]);
});
test('schema round trips every setting, original state and cosmological progress',()=>{
  const input={preset:'big_crunch',gravity:0,speed:3,lumMult:2,paused:true,simYears:42,sizeMode:'proportional',collideMode:'bounce',rocheEnabled:false,camera:[1,2,3],target:[4,5,6],cosmos:{mode:'big_crunch',time:2,scale:.8},bodies:[{kind:'planet',initialKind:'gas',spin:4,baseRadius:2,radius:3,physicalRadiusKm:6000,manualTempLock:8,initState:{mass:1,radius:2,temp:15,ring:true}}]};
  const normalized=normalizeSandboxUniverse(input);
  assert.deepEqual(normalizeSandboxUniverse(JSON.parse(JSON.stringify(normalized))),normalized);
  assert.equal(normalized.bodies[0].initialKind,'gas');assert.equal(normalized.bodies[0].initState.temp,15);
});
test('solar template has eight planets and correct Earth/Sun mass and radius ratios',()=>{
  const {run}=fixture();run("sbLoadPreset('solar')");
  assert.equal(run('sb.bodies.length'),9);
  assert(Math.abs(run('SB_EARTH_M/SB_SOLAR_M')-3.0034e-6)<1e-10);
  assert(Math.abs(run('sbPhysicalRadius(sb.bodies[3])/sbPhysicalRadius(sb.bodies[0])')-6371/695700)<1e-12);
  assert(Math.abs(run('sbPhysicalDensity(sb.bodies[3])')-5.51)<.02);
  assert(Math.abs(run('sbEscapeKms(sb.bodies[3])')-11.186)<.03);
});
test('zero and negative gravity do not invent circular speed',()=>{
  const {run}=fixture();
  for(const g of [0,-1]) {run(`sb.gravity=${g}`);assert.equal(run('sbCircularVel(new THREE.Vector3(20,0,0),{pos:new THREE.Vector3(),vel:new THREE.Vector3(),mass:120}).length()'),0);}
});
test('binary initial states conserve momentum and scale circular speed with G',()=>{
  const {run}=fixture();
  assert(run('(()=>{const p=sbBinaryStates(120,95,26,1.25,new THREE.Vector3(),new THREE.Vector3());return p[0].vel.clone().multiplyScalar(120).addScaledVector(p[1].vel,95).length();})()')<1e-12);
  assert(Math.abs(run('sbBinaryStates(120,95,26,5,new THREE.Vector3(),new THREE.Vector3())[0].vel.length()/sbBinaryStates(120,95,26,1.25,new THREE.Vector3(),new THREE.Vector3())[0].vel.length()')-2)<1e-12);
});
test('stable binary and hierarchical triple survive repeated integration',()=>{
  for(const preset of ['binary','triple']) {
    const {run}=fixture();
    run(preset==='binary'?"sbStampSystem('sys_binary',new THREE.Vector3())":"sbLoadPreset('three_body')");
    run('for(let i=0;i<20000;i++)sbStepPhysics(.0125)');
    assert.equal(run("sb.bodies.filter(b=>b.kind==='star').length"),preset==='binary'?2:3);
    assert.equal(run('sb.bodies.length'),preset==='binary'?3:4);
    assert(run('sb.bodies.every(b=>b.pos.toArray().every(Number.isFinite)&&b.vel.toArray().every(Number.isFinite))'));
  }
});
test('continuous swept contact detects bodies crossing within one step',()=>{
  const {run}=fixture();run("sb.gravity=0;sb.collideMode='scientific';sbCreateBody({mass:1,radius:1,pos:[-3,0,0],vel:[100,0,0],isDebris:true});sbCreateBody({mass:1,radius:1,pos:[3,0,0],vel:[-100,0,0],isDebris:true});sbStepPhysics(.0675)");
  assert.equal(run('sb.bodies.length'),1);assert.equal(run('sb.bodies[0].mass'),2);
});
test('shattering conserves total mass and momentum',()=>{
  const {run}=fixture();run("sb.gravity=0;sb.collideMode='shatter';sbCreateBody({mass:10,radius:3,pos:[0,0,0]});sbCreateBody({mass:1,radius:1,pos:[1,0,0]});sbStepPhysics(.001)");
  assert.equal(run('sb.bodies.length'),5);
  assert(Math.abs(run('sb.bodies.reduce((s,b)=>s+b.mass,0)')-11)<1e-12);
  assert(run('sb.bodies.reduce((v,b)=>v.addScaledVector(b.vel,b.mass),new THREE.Vector3()).length()')<1e-12);
});
test('elastic contact separates overlapping bodies without NaN',()=>{
  const {run}=fixture();run("sb.gravity=0;sb.collideMode='bounce';sbCreateBody({mass:1,radius:1,pos:[0,0,0],vel:[1,0,0]});sbCreateBody({mass:1,radius:1,pos:[0,0,0],vel:[-1,0,0]});sbStepPhysics(.001)");
  assert.equal(run('sb.bodies.length'),2);assert(run('sb.bodies[0].pos.distanceTo(sb.bodies[1].pos)')>=1.72);
  assert(run('sb.bodies.every(b=>b.vel.toArray().every(Number.isFinite))'));
});
test('continuous accretion immediately checks the neutron-star collapse threshold',()=>{
  const {run}=fixture();run("sb.gravity=0;sb.rocheEnabled=true;sbCreateBody({name:'near-TOV',kind:'ns',mass:335.99,radius:1.45});sbCreateBody({mass:10,radius:2,pos:[6,0,0]});sbStepPhysics(.0225)");
  assert.equal(run("sb.bodies.filter(b=>b.kind==='ns').length"),0);
  assert.equal(run("sb.bodies.filter(b=>b.kind==='bh').length"),1);
});
test('scene reset cancels all outstanding tools and gestures',()=>{
  const {run}=fixture();run("sb.dragState={};sb.pointerDownBeam=true;sb.barrageActive=true;sb.autoBeamTimer=1;sb.controls.enabled=false;sb.keys.add('w');sbLoadPreset('blank')");
  assert(run('sb.controls.enabled'));assert.equal(run('sb.dragState'),null);assert.equal(run('sb.pointerDownBeam'),false);assert.equal(run('sb.barrageActive'),false);assert.equal(run('sb.keys.size'),0);
});
test('bad legacy saves leave the current scene unchanged',()=>{
  const {run}=fixture();run("sbLoadPreset('solar')");
  assert.throws(()=>run('sbApplyUniverse({bodies:[null]})'));
  assert.equal(run('sb.bodies.length'),9);
});
test('save loading restores speed, luminosity, preset, spin and temperature lock',()=>{
  const {run}=fixture();run("sbLoadPreset('solar');sb.speed=3;sb.lumMult=2;sb.bodies[3].spin=4.75;sb.bodies[3].manualTempLock=8;globalThis.saved=sbSerializeUniverse();sbLoadPreset('blank');sb.speed=1;sbApplyUniverse(saved)");
  assert.equal(run('sb.speed'),3);assert.equal(run('sb.lumMult'),2);assert.equal(run('sb.preset'),'solar');assert.equal(run('sb.bodies[3].spin'),4.75);assert.equal(run('sb.bodies[3].manualTempLock'),8);
});
test('new presets generate finite bounded scenes and event reset cancels evolution',()=>{
  for(const preset of ['galaxy_cluster','cosmic_web','whitehole','big_bang','big_crunch','big_rip','heat_death']) {
    const {run}=fixture();run(`sbLoadPreset('${preset}');sbUpdateCosmos(.5)`);
    assert(run('sb.bodies.length<=260&&sb.bodies.length>0'));
    assert(run('sb.bodies.every(b=>b.pos.toArray().every(Number.isFinite))'));
    run("sbLoadPreset('solar');sbUpdateCosmos(100)");assert.equal(run('sb.bodies.length'),9);assert.equal(run('sb.cosmos'),null);
  }
});
test('real-size mode preserves physical radius ratios and distant focus removes range limits',()=>{
  const {run}=fixture();run("sbLoadPreset('solar');sb.sizeMode='proportional';sbApplySizeMode()");
  assert(Math.abs(run('sbVisualRadius(sb.bodies[3])/sbVisualRadius(sb.bodies[0])')-6371/695700)<1e-12);
  run('sb.bodies[3].pos.set(100000,4000,-3000);sbFocusBody(sb.bodies[3])');
  assert.equal(run('sb.controls.target.x'),100000);assert(run('sb.camera.far>=10000'));assert.equal(run('sb.controls.maxDistance'),1e7);
});
test('every celestial template and compound model can be generated within the budget',()=>{
  const {run}=fixture();
  const templates=run('SB_TEMPLATES.map(t=>t.id)');assert.equal(templates.length,31);
  for(const id of templates) {run(`sbLoadPreset('blank');sb.spawnId='${id}';sbSpawnAt(new THREE.Vector3(40,0,0))`);assert(run('sb.bodies.length>0&&sb.bodies.length<=260'));}
  const models=run('SB_SYSTEM_MODELS.map(m=>m.id)');assert.equal(models.length,14);
  for(const id of models) {run(`sbLoadPreset('blank');sbStampSystem('${id}',new THREE.Vector3())`);assert(run('sb.bodies.length>0&&sb.bodies.length<=260'));}
});
test('high-gravity stable binary retains its stars and planet',()=>{
  const {run}=fixture();run("sb.gravity=4;sbStampSystem('sys_binary',new THREE.Vector3());for(let i=0;i<15000;i++)sbStepPhysics(.00625)");
  assert.equal(run('sb.bodies.length'),3);
});
test('stellar heating and deep cooling are monotonic and pause freezes tools',()=>{
  const {run}=fixture();run("sbLoadPreset('solar');sb.activeBeamTarget=sb.bodies[0];sb.tool='laser';sbTickActiveTool(.02)");
  assert(run('sb.bodies[0].temp')>5505);
  run("sb.selected.temp=-270;sb.activeBeamTarget=sb.selected;sb.tool='freeze';sbTickActiveTool(.02)");assert(run('sb.selected.temp')<=-270);
  run('globalThis.frozenTemp=sb.selected.temp;sbTickActiveTool(0)');assert.equal(run('sb.selected.temp'),run('frozenTemp'));
});
test('switching tools cancels automatic barrage and releasing a destroyed target unlocks controls',()=>{
  const {run,windowEvents}=fixture();run("sbLoadPreset('solar');setTool('barrage',true);setTool('select')");
  assert.equal(run('sb.barrageActive'),false);assert.equal(run('sb.autoBeamTimer'),0);
  run('sb.renderer={domElement:document.createElement(\'canvas\')};sbBindCanvasEvents();sb.pointerDownBeam=true;sb.activeBeamTarget=null;sb.controls.enabled=false;');
  windowEvents.get('pointerup')();assert(run('sb.controls.enabled'));assert.equal(run('sb.pointerDownBeam'),false);
});
test('explicit toolbar heating works once while natural evolution is paused',()=>{
  const {run}=fixture();run("sbLoadPreset('solar');sb.paused=true;globalThis.before=sb.selected.temp;setTool('laser',true)");
  assert(run('sb.selected.temp')>run('before'));assert.equal(run('sb.autoBeamTimer'),0);assert.equal(run('sb.activeBeamTarget'),null);
});
test('sandbox navigation captures S before unrelated shortcuts',()=>{
  const {run,windowEvents}=fixture();run('sbBindExtendedControls()');
  let prevented=false,stopped=false;
  windowEvents.get('keydown')({key:'s',target:{matches:()=>false,closest:()=>null},preventDefault:()=>{prevented=true;},stopImmediatePropagation:()=>{stopped=true;}});
  assert(prevented&&stopped);assert(run("sb.keys.has('s')"));
});
test('neutron mergers below the chosen TOV threshold remain neutron stars',()=>{
  const {run}=fixture();run("sb.gravity=0;sbCreateBody({kind:'ns',mass:120,radius:1,pos:[0,0,0]});sbCreateBody({kind:'ns',mass:120,radius:1,pos:[1,0,0]});sbStepPhysics(.001)");
  assert.equal(run('sb.bodies.length'),1);assert.equal(run('sb.bodies[0].kind'),'ns');
});
test('galaxy collision merges aggregate models while conserving their weight and momentum',()=>{
  const {run}=fixture();run("sbLoadPreset('galaxy_merge');for(let i=0;i<12000;i++)sbStepPhysics(.0125)");
  assert.equal(run('sb.bodies.length'),1);assert.equal(run('sb.bodies[0].kind'),'galaxy');assert.equal(run('sb.bodies[0].mass'),920);
  assert(run('sb.bodies[0].vel.length()')<1e-10);
});
test('body and transient effect budgets remain bounded under repeated creation',()=>{
  const {run}=fixture();run('for(let i=0;i<260;i++)sbCreateBody({name:"test",isDebris:true});');
  assert.throws(()=>run('sbCreateBody({})'));assert.equal(run('sb.bodies.length'),260);
  run('for(let i=0;i<40;i++)sbSpawnExplosion(new THREE.Vector3(),0xabcdef,1)');assert.equal(run('sb.effects.length'),24);
});
