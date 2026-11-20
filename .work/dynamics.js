    const dynamics = {
      gravity: 1, trails: true, vectors: false, labels: true,
      time: 0, sceneTime: { L0:0, L0B:0, L1:0, L2:0, L3:0, L4:0, L5:0 },
      paths: {}, forces: {}, probes: [], labelsDOM: [], pointer: new THREE.Vector2(9,9)
    };
    const TRAJECTORY_COLOR = 0x3987e5, FORCE_COLOR = 0xd95926, FLOW_COLOR = 0x199e70;
    const ORBIT_ELEMENTS = {
      mercury:[.2056,7.0,.51], venus:[.0068,3.39,1.02], earth:[.0167,0,1.80],
      mars:[.0934,1.85,2.10], jupiter:[.0489,1.30,.24], saturn:[.0565,2.49,1.64],
      uranus:[.0457,.77,2.99], neptune:[.0113,1.77,.78], moon:[.0549,5.14,.3]
    };
    function layerGroup(key, kind) {
      const store = kind === 'paths' ? dynamics.paths : dynamics.forces;
      if (!store[key]) { store[key] = new THREE.Group(); scaleGroups[key].add(store[key]); }
      return store[key];
    }
    function orbitPoint(orbit, mean, out = new THREE.Vector3()) {
      mean = ((mean % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
      let eccentric = mean;
      for (let i=0;i<6;i++) eccentric -= (eccentric-orbit.e*Math.sin(eccentric)-mean)/(1-orbit.e*Math.cos(eccentric));
      const x = orbit.a*(Math.cos(eccentric)-orbit.e), z = orbit.a*Math.sqrt(1-orbit.e*orbit.e)*Math.sin(eccentric);
      const c = Math.cos(orbit.argument), s = Math.sin(orbit.argument);
      out.set(x*c-z*s, (x*s+z*c)*Math.sin(orbit.inclination), (x*s+z*c)*Math.cos(orbit.inclination));
      return out;
    }
    function makeLine(points, color, opacity=.4, dashed=false) {
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = dashed ? new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:1.2,gapSize:.7,depthWrite:false}) : new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false});
      const line = new THREE.Line(geo,mat);
      if (dashed) line.computeLineDistances();
      return line;
    }
    function setupBodyOrbit(body, config) {
      body.meshGroup.userData.bodyRef=body;
      body.orbitParentBody=config.orbitParent?.userData.bodyRef||null;
      if (!body.orbitRadius) return;
      const elements = ORBIT_ELEMENTS[body.id] || [.03,0,0];
      const mu = body.id === 'moon' ? Math.pow(body.orbitSpeed,2)*Math.pow(body.orbitRadius,3) : 7700;
      body.orbit = { a:body.orbitRadius, e:elements[0], inclination:THREE.MathUtils.degToRad(elements[1]), argument:elements[2], mu, mean:body.angle, initialMean:body.angle };
      body.orbitSpeed = Math.sqrt(mu/Math.pow(body.orbitRadius,3));
      const parent = config.orbitParent || config.parentGroup;
      const path = makeLine(Array.from({length:193},(_,i)=>orbitPoint(body.orbit,i/192*Math.PI*2)),TRAJECTORY_COLOR,.24);
      parent.add(path);
      body.orbitPath = path;
      body.orbitWake = makeLine(Array.from({length:48},()=>new THREE.Vector3()),TRAJECTORY_COLOR,.9);
      parent.add(body.orbitWake);
      body.gravityArrow = new THREE.ArrowHelper(new THREE.Vector3(-1,0,0),new THREE.Vector3(),4,FORCE_COLOR,.8,.4);
      parent.add(body.gravityArrow);
      body.gravityArrow.visible = false;
      orbitPoint(body.orbit,body.orbit.mean,body.meshGroup.position);
      updateBodyOrbit(body,0);
    }
    function updateBodyOrbit(body, dt) {
      if (!body.orbit) return;
      if(typeof motion!=='undefined'&&motion.roots[body.scaleKey]&&['L0','L1'].includes(body.scaleKey))return;
      const o=body.orbit;
      o.mean += body.orbitSpeed*dt*Math.sqrt(dynamics.gravity);
      orbitPoint(o,o.mean,body.meshGroup.position);
      const arr=body.orbitWake.geometry.attributes.position;
      const p=new THREE.Vector3();
      for(let i=0;i<48;i++){ orbitPoint(o,o.mean-(47-i)*.009,p); arr.setXYZ(i,p.x,p.y,p.z); }
      arr.needsUpdate=true;
      body.orbitWake.geometry.computeBoundingSphere();
      body.orbitPath.visible=dynamics.trails; body.orbitWake.visible=dynamics.trails;
      const inward=body.meshGroup.position.clone().negate().normalize();
      body.gravityArrow.position.copy(body.meshGroup.position);
      body.gravityArrow.setDirection(inward);
      body.gravityArrow.setLength(Math.min(o.a*.16,9)*Math.sqrt(dynamics.gravity),1,.45);
      body.gravityArrow.visible=dynamics.vectors;
    }
    function predictedBodyPosition(body, seconds, out=new THREE.Vector3()) {
      body.mesh.updateWorldMatrix(true,false);
      if(body.orbit){orbitPoint(body.orbit,body.orbit.mean+body.orbitSpeed*seconds*Math.sqrt(dynamics.gravity),out);out.applyMatrix4(body.meshGroup.parent.matrixWorld);}
      else body.mesh.getWorldPosition(out);
      if(body.orbitParentBody){const parent=body.orbitParentBody,now=parent.mesh.getWorldPosition(new THREE.Vector3());out.add(predictedBodyPosition(parent,seconds).sub(now));}
      return out;
    }
    function interceptionDirection(start,target,body,speed,type) {
      const center=body.mesh.getWorldPosition(new THREE.Vector3()),offset=target.clone().sub(center);
      let travel=start.distanceTo(target)/speed;
      for(let i=0;i<6;i++)travel=start.distanceTo(predictedBodyPosition(body,travel).add(offset))/speed;
      const future=predictedBodyPosition(body,travel).add(offset),velocity=future.clone().sub(start).normalize().multiplyScalar(speed);
      const ballistic=['asteroid','comet','kinetic'].includes(type),sources=gravitySources(state.currentScale);
      for(let iteration=0;iteration<5;iteration++){
        const p=start.clone(),v=velocity.clone(),steps=Math.max(1,Math.ceil(travel*120)),h=travel/steps;
        for(let j=0;j<steps;j++){if(ballistic)v.addScaledVector(accelerationAt(p,sources),h*.5);p.addScaledVector(v,h);if(ballistic)v.addScaledVector(accelerationAt(p,sources),h*.5);}
        velocity.addScaledVector(future.clone().sub(p),1/Math.max(.01,travel)).normalize().multiplyScalar(speed);
      }
      return velocity.normalize();
    }
    function disposeTree(object) {
      object.traverse(o=>{ if(o.userData?.sharedGLB)return; if(o.geometry)o.geometry.dispose(); if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());} });
      object.removeFromParent();
    }
    function makeGlowTexture() {
      const c=document.createElement('canvas'); c.width=c.height=64;
      const ctx=c.getContext('2d'), grad=ctx.createRadialGradient(32,32,0,32,32,32);
      grad.addColorStop(0,'rgba(255,255,255,1)'); grad.addColorStop(.10,'rgba(255,255,255,.95)'); grad.addColorStop(.28,'rgba(255,255,255,.35)'); grad.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);
    }
    let particleGlow;
    function glowPoints(geometry,size,opacity=1) {
      particleGlow ||= makeGlowTexture();
      return new THREE.Points(geometry,new THREE.PointsMaterial({map:particleGlow,size,vertexColors:!!geometry.attributes.color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false}));
    }
    function glowSprite(color, size, opacity=.6) {
      particleGlow ||= makeGlowTexture();
      const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:particleGlow,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false}));
      sprite.scale.set(size,size,1);return sprite;
    }
    function deterministicRandom(seed=42) {
      return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
    }
    function gravitySources(key) {
      if(key==='L0')return [{pos:typeof l0Earth!=='undefined'&&l0Earth?l0Earth.meshGroup.position.clone():new THREE.Vector3(),mu:566,radius:12}];
      if(key==='L1')return [{pos:typeof l1Sun!=='undefined'&&l1Sun?l1Sun.meshGroup.position.clone():new THREE.Vector3(),mu:7700,radius:13.5}];
      if(key==='L2')return [{pos:new THREE.Vector3(),mu:2700,radius:3.5}];
      if(key==='L3')return [{pos:new THREE.Vector3(),mu:4200,radius:1.8}];
      if(key==='L4')return clusterNodes.map(n=>({pos:n.center,mu:n.mass*95,radius:1,softening:n.mass>100?64:144}));
      return webNodes.map(n=>({pos:n.pos,mu:n.mass*30,radius:1}));
    }
    function accelerationAt(pos,sources,out=new THREE.Vector3()) {
      out.set(0,0,0);
      for(const source of sources){const x=source.pos.x-pos.x,y=source.pos.y-pos.y,z=source.pos.z-pos.z;const r2=x*x+y*y+z*z+(source.softening||4),f=source.mu*dynamics.gravity/(r2*Math.sqrt(r2));out.x+=x*f;out.y+=y*f;out.z+=z*f;}
      return out;
    }
    function releaseProbe() {
      const key=state.currentScale;
      if(key==='L0B'){showToast('引力探针可在地月系和深空尺度释放','amber');return;}
      if(dynamics.probes.length>=8){showToast('最多同时观测 8 枚探针，请先重置动力学','amber');return;}
      const sources=gravitySources(key), primary=sources[0];
      const radius={L0:24,L1:54,L2:23,L3:34,L4:24,L5:30}[key];
      const position=primary.pos.clone().add(new THREE.Vector3(radius,2,0));
      const speed=Math.sqrt(primary.mu*dynamics.gravity/radius)*.83;
      const sphere=new THREE.Mesh(new THREE.SphereGeometry(key==='L1'? .65:.45,12,12),new THREE.MeshBasicMaterial({color:0xe9f4ff}));
      sphere.position.copy(position);simulationRoot(key).add(sphere);
      const history=Array.from({length:160},()=>position.clone());
      const line=makeLine(history,TRAJECTORY_COLOR,.85);layerGroup(key,'paths').add(line);
      const arrow=new THREE.ArrowHelper(new THREE.Vector3(-1,0,0),position,3,FORCE_COLOR,.7,.3);simulationRoot(key).add(arrow);
      dynamics.probes.push({key,sphere,line,arrow,history,historyTime:Array(160).fill(key==='L0'?motion.lunarDays/365.25:motion.years),historyScale:Array(160).fill(motion.webScale),position,velocity:new THREE.Vector3(0,speed*.12,speed),age:0,sample:0});
      showToast('探针已释放：速度 Verlet 积分，轨迹随引力实时改变');
    }
    function updateProbes(dt) {
      for(let i=dynamics.probes.length-1;i>=0;i--){
        const p=dynamics.probes[i];if(p.key!==state.currentScale)continue;
        const sources=gravitySources(p.key), steps=Math.max(1,Math.ceil(dt/(1/120))), h=dt/steps;
        for(let j=0;j<steps;j++){
          const a=accelerationAt(p.position,sources);p.velocity.addScaledVector(a,h*.5);p.position.addScaledVector(p.velocity,h);
          p.velocity.addScaledVector(accelerationAt(p.position,sources),h*.5);
        }
        p.age+=dt;p.sample+=dt;p.sphere.position.copy(p.position);
        updateProbeHistory(p,dt);p.arrow.visible=dynamics.vectors;p.line.visible=dynamics.trails;
        const a=accelerationAt(p.position,sources);p.arrow.position.copy(p.position);p.arrow.setDirection(a.normalize());p.arrow.setLength(5,.9,.4);
        if(p.age>120 || p.position.length()>450 || sources.some(s=>p.position.distanceTo(s.pos)<s.radius)){
          disposeTree(p.sphere);disposeTree(p.line);disposeTree(p.arrow);dynamics.probes.splice(i,1);
        }
      }
    }
    function resetDynamics() {
      dynamics.probes.forEach(p=>{disposeTree(p.sphere);disposeTree(p.line);disposeTree(p.arrow);});dynamics.probes=[];
      celestialBodies.forEach(b=>{if(b.orbit){b.orbit.mean=b.orbit.initialMean;updateBodyOrbit(b,0);}});
      Object.keys(dynamics.sceneTime).forEach(k=>dynamics.sceneTime[k]=0);dynamics.time=0;
      if(typeof resetClusterDynamics==='function')resetClusterDynamics();
      if(typeof resetWebDynamics==='function')resetWebDynamics();
      if(typeof motion!=='undefined'&&motion.solar.length)resetMotion();
      syncDynamicsUI();
    }
