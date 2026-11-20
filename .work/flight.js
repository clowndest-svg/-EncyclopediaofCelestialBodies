    function visualAltitude(altitude,planet) {return .45*Math.log1p(Math.max(0,altitude)/Math.max(planet.upper,Math.min(500000,planet.radius*.1)));}
    function physicalProjectilePoint(p) {
      const center=worldToSimulation(p.body.mesh.getWorldPosition(new THREE.Vector3()),p.key),radius=p.realPosition.length();
      return p.realPosition.clone().normalize().multiplyScalar(p.body.radius*(1+visualAltitude(radius-p.physical.planet.radius,p.physical.planet))).add(center);
    }
    function spawnProjectile({startPos,targetPos,targetBody=null,speed=55,type='asteroid',diamKm=state.astDiamKm,velKms=state.astVelKms,label='小天体'}) {
      if(lab.projectiles.length>=16){showToast('最多同时运行 16 个入射体，请等待当前实验完成','amber');return;}
      const body=targetBody||getActiveLabTarget();if(!body)return;
      const key=body.scaleKey,root=simulationRoot(key),settings={...selectedSettings(type),diamKm,velKms};if(type==='kinetic')Object.assign(settings,selectedSettings(type));
      const physical=scientificImpact(settings,body.id),planet=physical.planet,center=body.mesh.getWorldPosition(new THREE.Vector3());
      const normal=targetPos.clone().sub(center).normalize();if(normal.lengthSq()<.1)normal.copy(startPos).sub(center).normalize();
      const approach=startPos.clone().sub(targetPos).normalize(),height=Math.max(900000,planet.upper*3);
      const realPosition=normal.clone().multiplyScalar(planet.radius).addScaledVector(approach,height/Math.max(.2,approach.dot(normal)));
      const realVelocity=approach.clone().multiplyScalar(-physical.initialSpeed);
      const grp=new THREE.Group();root.add(grp);
      const radius=THREE.MathUtils.clamp(body.radius*Math.pow(physical.diameter/(2*planet.radius),.3),.035,body.radius*.10);
      const mesh=type==='kinetic'?new THREE.Mesh(new THREE.CylinderGeometry(radius*.35,radius*.35,radius*5,10),new THREE.MeshStandardMaterial({color:0x92aaba,metalness:.75,roughness:.32})):new THREE.Mesh(new THREE.DodecahedronGeometry(radius,1),new THREE.MeshStandardMaterial({color:type==='comet'?0x96b7c0:0x827569,roughness:.93,emissive:0x4c200a,emissiveIntensity:.12,flatShading:true}));if(type==='kinetic')mesh.rotation.x=Math.PI/2;grp.add(mesh);
      const entryGlow=glowSprite(type==='comet'?0x78bade:0xffa25a,radius*6,0);grp.add(entryGlow);
      const p={body,key,grp,mesh,entryGlow,physical,settings,realPosition,realVelocity,type,age:0,maxAge:20,entered:false,fragmented:false,spread:1,mass:physical.initialMass,initialMass:physical.initialMass,airEnergy:0,entryEnergy:physical.initialEnergy,peakAltitude:0,peakPower:0,radius};
      p.position=physicalProjectilePoint(p);grp.position.copy(p.position);p.history=Array.from({length:150},()=>p.position.clone());p.line=makeLine(p.history,TRAJECTORY_COLOR,.5);root.add(p.line);lab.projectiles.push(p);
      document.getElementById('lab-phase').textContent=`${EXPERIMENTS.find(e=>e[0]===type)?.[2]||label} · 接近目标`;
    }
    function advancePhysicalProjectile(p,dt) {
      const planet=p.physical.planet,material=MATERIALS[p.settings.material],mu=REAL_G*planet.mass;
      let remaining=dt*80;
      for(let i=0;i<10000&&remaining>1e-8;i++){
        const r=p.realPosition.length(),alt=r-planet.radius,atmosphere=planet.atmosphere&&p.settings.atmosphere&&alt<=planet.upper;
        const h=Math.min(remaining,atmosphere?.025:2);remaining-=h;
        if(atmosphere&&!p.entered){p.entered=true;p.entryEnergy=.5*p.mass*p.realVelocity.lengthSq();const sinAngle=Math.max(.1,-p.realVelocity.dot(p.realPosition)/(p.realVelocity.length()*r));p.physical=scientificImpact({...p.settings,massKg:p.mass,velKms:p.realVelocity.length()/1000,angle:Math.asin(Math.min(1,sinAngle))*180/Math.PI},p.body.id);}
        p.realVelocity.addScaledVector(p.realPosition,-mu/Math.pow(r,3)*h*.5);
        if(atmosphere){const rho=planet.rho*Math.exp(-Math.max(0,alt)/planet.H),v=p.realVelocity.length(),pressure=.5*rho*v*v;
          if(pressure>material.strength){p.fragmented=true;p.spread=Math.min(60,p.spread+h*2.2*Math.sqrt(pressure/material.strength));}
          const physicalRadius=Math.cbrt(3*p.mass/(4*Math.PI*material.density)),area=Math.PI*physicalRadius*physicalRadius*p.spread,energyBefore=.5*p.mass*p.realVelocity.lengthSq();
          p.realVelocity.multiplyScalar(1/(1+.5*rho*area*v*h/Math.max(1,p.mass)));p.mass=Math.max(0,p.mass-.035*.5*rho*p.realVelocity.length()**3*area/material.Q*h);
          const loss=Math.max(0,energyBefore-.5*p.mass*p.realVelocity.lengthSq());p.airEnergy+=loss;
          if(loss/h>p.peakPower){p.peakPower=loss/h;p.peakAltitude=alt;}
        }
        p.realPosition.addScaledVector(p.realVelocity,h);const rNext=p.realPosition.length();p.realVelocity.addScaledVector(p.realPosition,-mu/Math.pow(rNext,3)*h*.5);
        if(p.entered&&p.fragmented&&(p.airEnergy>p.entryEnergy*.7||p.mass<p.initialMass*.05))return 'airburst';
        if(rNext<=planet.radius+p.physical.diameter*.5)return 'impact';
      }
      return null;
    }
    function tickLabProjectiles(dt) {
      for(let i=lab.projectiles.length-1;i>=0;i--){const p=lab.projectiles[i];if(p.key!==state.currentScale){p.grp.visible=false;p.line.visible=false;continue;}p.grp.visible=true;p.line.visible=dynamics.trails;p.age+=dt;
        const outcome=advancePhysicalProjectile(p,dt);p.position.copy(physicalProjectilePoint(p));p.grp.position.copy(p.position);p.grp.lookAt(p.position.clone().add(p.realVelocity.clone().normalize()));p.mesh.rotation.z+=dt;
        p.entryGlow.material.opacity=p.entered?.7:0;p.mesh.material.emissiveIntensity=p.entered?.75:.12;p.mesh.scale.setScalar(Math.max(.22,Math.cbrt(p.mass/p.initialMass)));
        if(dt>0){p.history.shift();p.history.push(p.position.clone());const a=p.line.geometry.attributes.position;p.history.forEach((v,j)=>a.setXYZ(j,v.x,v.y,v.z));a.needsUpdate=true;p.line.geometry.computeBoundingSphere();}
        document.getElementById('lab-phase').textContent=`${EXPERIMENTS.find(e=>e[0]===p.type)?.[2]||p.type} · ${p.entered?'大气减速 / 烧蚀':'入射飞行'}`;
        if(outcome){p.physical.mass=p.mass;p.physical.speed=p.realVelocity.length();p.physical.airEnergy=p.airEnergy;p.physical.groundEnergy=outcome==='airburst'?0:.5*p.mass*p.realVelocity.lengthSq();p.physical.retained=p.mass/p.initialMass;p.physical.airburst=outcome==='airburst';p.physical.burstAltitude=p.peakAltitude;
          if(outcome==='impact'){const final=scientificImpact({...p.settings,massKg:p.mass,velKms:p.realVelocity.length()/1000,atmosphere:false},p.body.id);p.physical.craterMeters=final.craterMeters;}else p.physical.craterMeters=0;
          finishProjectile(p,new THREE.Vector3(),p.physical.airburst);lab.projectiles.splice(i,1);
        }else if(p.age>p.maxAge){disposeTree(p.grp);disposeTree(p.line);lab.projectiles.splice(i,1);showToast('入射体掠过目标或进入缓慢降落阶段，未触发撞击','amber');}
      }
    }
