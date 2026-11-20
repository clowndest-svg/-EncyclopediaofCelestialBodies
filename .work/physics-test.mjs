import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('./vendor-20261120/build_three.module.min.js',import.meta.url),'utf8');
const THREE=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
const context=vm.createContext({THREE,Math});
vm.runInContext(fs.readFileSync(new URL('./dynamics.js',import.meta.url),'utf8'),context);
const run=source=>vm.runInContext(source,context);
const tests=[];
for(const e of [0,.0167,.2056,.7]){
  const peri=run(`orbitPoint({a:40,e:${e},inclination:.13,argument:.62},0).length()`);
  const apo=run(`orbitPoint({a:40,e:${e},inclination:.13,argument:.62},Math.PI).length()`);
  assert(Math.abs(peri-40*(1-e))<1e-8);assert(Math.abs(apo-40*(1+e))<1e-8);tests.push('Kepler eccentricity '+e+' periapsis/apoapsis');
}
const g1=run('accelerationAt(new THREE.Vector3(40,0,0),[{pos:new THREE.Vector3(),mu:7700}]).x');
run('dynamics.gravity=2');const g2=run('accelerationAt(new THREE.Vector3(40,0,0),[{pos:new THREE.Vector3(),mu:7700}]).x');
assert(g1<0);assert(Math.abs(g2/g1-2)<1e-12);tests.push('Gravity is attractive and scales linearly with G');run('dynamics.gravity=1');
const conservation=run(`(()=>{const sources=[{pos:new THREE.Vector3(),mu:7700}],p=new THREE.Vector3(54,2,0),v=new THREE.Vector3(0,0,Math.sqrt(7700/54)*.83),h=1/120;const energy=()=>.5*v.lengthSq()-7700/Math.sqrt(p.lengthSq()+4);const initial=energy();let max=0;for(let i=0;i<120*120;i++){v.addScaledVector(accelerationAt(p,sources),h*.5);p.addScaledVector(v,h);v.addScaledVector(accelerationAt(p,sources),h*.5);max=Math.max(max,Math.abs((energy()-initial)/initial));}return max;})()`);
assert(conservation<1e-4);tests.push('Velocity Verlet relative energy drift < 0.01% over 120 simulated seconds');
console.log(JSON.stringify({passed:tests.length,energyDrift:conservation,tests},null,2));
