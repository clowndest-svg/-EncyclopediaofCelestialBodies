    const REAL_G=6.67430e-11,C_LIGHT=299792458;
    const PLANET_PHYSICS={
      earth:{radius:6371000,mass:5.972e24,g:9.81,atmosphere:true,rho:1.225,H:7500,upper:100000,atmoMass:5.15e18,solid:true},
      moon:{radius:1737400,mass:7.342e22,g:1.62,atmosphere:false,rho:0,H:1,upper:0,atmoMass:0,solid:true},
      mercury:{radius:2439700,mass:3.301e23,g:3.7,atmosphere:false,rho:0,H:1,upper:0,atmoMass:0,solid:true},
      venus:{radius:6051800,mass:4.867e24,g:8.87,atmosphere:true,rho:65,H:15900,upper:180000,atmoMass:4.8e20,solid:true},
      mars:{radius:3389500,mass:6.417e23,g:3.71,atmosphere:true,rho:.02,H:11100,upper:100000,atmoMass:2.5e16,solid:true},
      jupiter:{radius:69911000,mass:1.898e27,g:24.79,atmosphere:true,rho:.16,H:27000,upper:600000,atmoMass:1e25,solid:false},
      saturn:{radius:58232000,mass:5.683e26,g:10.44,atmosphere:true,rho:.19,H:59000,upper:900000,atmoMass:3e24,solid:false},
      uranus:{radius:25362000,mass:8.681e25,g:8.69,atmosphere:true,rho:.42,H:27000,upper:500000,atmoMass:8e23,solid:false},
      neptune:{radius:24622000,mass:1.024e26,g:11.15,atmosphere:true,rho:.45,H:20000,upper:400000,atmoMass:9e23,solid:false},
      sun:{radius:696340000,mass:1.989e30,g:274,atmosphere:true,rho:.0001,H:200000,upper:2000000,atmoMass:1e26,solid:false}
    };
    const MATERIALS={rock:{density:3000,strength:1e6,Q:8e6,name:'岩石'},ice:{density:600,strength:1e5,Q:2.8e6,name:'冰尘'},iron:{density:7800,strength:8e7,Q:1e7,name:'铁镍'}};
    const EXPERIMENTS=[
      ['asteroid','☄','小行星撞击','大气减速与地表挖掘','impact'],['comet','✦','彗星撞击','冰尘烧蚀与碎裂','impact'],['airburst','◌','大气空爆','小天体碎裂，空中释能','impact'],['kinetic','▾','动能撞击器','按质量与速度计算','impact'],
      ['nuclear','☢','核能量释放','指定当量，不模拟装置','energy'],['antimatter','⊕','反物质湮灭','理想模型 E = 2mc²','energy'],['laser','⌁','激光烧蚀','持续加热与熔融喷发','energy'],['grb','✧','伽马暴照射','迎光半球辐射沉积','energy'],
      ['dyson','☀','戴森恒星光束','科幻装置，功率积分','fiction'],['photoid','⋄','相对论撞击体','洛伦兹动能模型','energy'],['tidal','≈','潮汐掠过','近场拉伸与碎屑剥离','fiction'],['singularity','◉','微型黑洞','艺术化吸积吞噬','fiction'],['foil','▱','二向箔','科幻降维演出','fiction'],['vacuum','○','真空相变泡','假说的艺术化表达','fiction'],
      ...(typeof MONSTER_EXPERIMENTS!=='undefined'?MONSTER_EXPERIMENTS:[])
    ];
    const lab={projectiles:[],effects:[],scars:[],reports:[],salvoTimers:[],material:'rock',angle:45,massKg:100000,energyMt:20,powerW:1e18,antimatterKg:.01,beta:.8,tidalMass:10,atmosphere:true,surface:'rock',sequence:0,lastReport:null};
    function scientificImpact(settings,planetId='earth') {
      const planet=PLANET_PHYSICS[planetId]||PLANET_PHYSICS.earth,material=MATERIALS[settings.material]||MATERIALS.rock;
      const diameter=settings.massKg?Math.cbrt(6*settings.massKg/(Math.PI*material.density)):Math.max(.001,settings.diamKm||1)*1000;
      const initialMass=settings.massKg||Math.PI/6*diameter**3*material.density;
      const velocity=(settings.velKms||20)*1000,angle=Math.max(15,Math.min(90,settings.angle||45))*Math.PI/180;
      const initialEnergy=.5*initialMass*velocity*velocity;
      let mass=initialMass,v=velocity,altitude=planet.upper,fragmented=false,spread=1,peakAltitude=0,peakDeposit=0,airEnergy=0,elapsed=0;
      const profile=[];let lastAltitude=Infinity;
      if(planet.atmosphere&&settings.atmosphere!==false){
        for(let i=0;i<14000&&altitude>0&&mass>initialMass*1e-5;i++){
          const dt=.025,rho=planet.rho*Math.exp(-altitude/planet.H),r=Math.cbrt(3*mass/(4*Math.PI*material.density));
          const pressure=.5*rho*v*v;
          if(pressure>material.strength){fragmented=true;spread=Math.min(60,spread+dt*2.2*Math.sqrt(pressure/material.strength));}
          const area=Math.PI*r*r*spread,before=.5*mass*v*v;
          v=(v+planet.g*Math.sin(angle)*dt)/(1+.5*rho*area*v*dt/Math.max(1,mass));
          mass=Math.max(0,mass-.035*.5*rho*v**3*area/material.Q*dt);
          const loss=Math.max(0,before-.5*mass*v*v);airEnergy+=loss;
          if(loss/dt>peakDeposit){peakDeposit=loss/dt;peakAltitude=altitude;}
          altitude-=v*Math.sin(angle)*dt;elapsed+=dt;
          if(lastAltitude-altitude>planet.upper/16){profile.push({altitude:Math.max(0,altitude),speed:v,mass});lastAltitude=altitude;}
          if(v<450){altitude=0;break;}
        }
      }else{v=Math.sqrt(velocity*velocity+2*planet.g*planet.upper);altitude=0;}
      const groundEnergy=.5*mass*v*v,retained=mass/initialMass;
      const airburst=planet.atmosphere&&settings.atmosphere!==false&&fragmented&&(airEnergy>initialEnergy*.7||retained<.05);
      const transition=planet.g>5?3200:10000;
      const transient=planet.solid&&retained>.0001&&v>450?1.161*Math.pow(material.density/2700,1/3)*Math.pow(diameter*Math.cbrt(retained),.78)*Math.pow(v,.44)*Math.pow(planet.g,-.22)*Math.pow(Math.sin(angle),1/3):0;
      const crater=transient>transition?1.25*transient*Math.pow(transient/transition,.13):1.25*transient;
      const binding=.6*REAL_G*planet.mass*planet.mass/planet.radius;
      return {planet,diameter,initialMass,mass,speed:v,initialSpeed:velocity,initialEnergy,groundEnergy,airEnergy,angle:angle*180/Math.PI,retained,fragmented,airburst,burstAltitude:peakAltitude,craterMeters:crater,escapeSpeed:Math.sqrt(2*REAL_G*planet.mass/planet.radius),binding,profile,entrySeconds:elapsed};
    }
    function selectedSettings(type=state.selectedExperiment) {
      const material=type==='comet'?'ice':type==='kinetic'?'iron':lab.material;
      const settings={type,material,diamKm:state.astDiamKm,velKms:state.astVelKms,angle:lab.angle,atmosphere:lab.atmosphere};
      if(type==='kinetic'){settings.massKg=lab.massKg;settings.diamKm=Math.cbrt(6*lab.massKg/(Math.PI*7800))/1000;}
      return settings;
    }
    function energyForType(type) {
      if(type==='nuclear')return lab.energyMt*4.184e15;
      if(type==='antimatter')return 2*lab.antimatterKg*C_LIGHT*C_LIGHT;
      if(type==='photoid')return (1/Math.sqrt(1-lab.beta*lab.beta)-1)*lab.massKg*C_LIGHT*C_LIGHT;
      if(type==='laser'||type==='dyson'||type==='grb')return lab.powerW*4;
      return 0;
    }
    function ensureStackedVisuals(body,planet) {
      const hits=body.stackedHits||0,damage=1-body.integrity/100;
      if(planet.solid&&hits>=1){
        if(!body.ashShroud){
          const mat=new THREE.ShaderMaterial({
            vertexShader:`varying vec3 vP,vN,vV;void main(){vP=normalize(position);vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
            fragmentShader:`varying vec3 vP,vN,vV;uniform float uTime,uDensity,uHeat;float h(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}void main(){float w=n(vP*4.5+vec3(uTime*.08,0.,-uTime*.05))*.65+n(vP*11.-vec3(uTime*.12))*.35;float rim=pow(1.-max(0.,dot(vN,vV)),2.2);vec3 ash=mix(vec3(.18,.13,.11),vec3(.88,.34,.09),clamp(uHeat*w,0.,1.));float a=smoothstep(.3,.82,w)*uDensity*(.38+rim*.62);if(a<.01)discard;gl_FragColor=vec4(ash,clamp(a,0.,.78));}`,
            uniforms:{uTime:{value:0},uDensity:{value:0},uHeat:{value:0}},transparent:true,depthWrite:false
          });
          body.ashShroud=new THREE.Mesh(new THREE.SphereGeometry(body.radius*1.028,48,32),mat);
          body.mesh.add(body.ashShroud);
        }
        body.ashShroud.material.uniforms.uDensity.value=Math.min(.92,.14+hits*.11+damage*.6);
        body.ashShroud.material.uniforms.uHeat.value=Math.min(1.1,damage*1.25+hits*.08);
      }
      if(planet.solid&&(hits>=3||damage>=.45)){
        if(!body.debrisRing){
          const cnt=document.body.dataset.layout==='mobile'?260:560,pos=new Float32Array(cnt*3),col=new Float32Array(cnt*3),rng=deterministicRandom(hits*7919+31);
          for(let i=0;i<cnt;i++){
            const r=body.radius*(1.45+rng()*1.05),a=rng()*Math.PI*2,y=(rng()-.5)*body.radius*.18;
            pos[i*3]=Math.cos(a)*r;pos[i*3+1]=y;pos[i*3+2]=Math.sin(a)*r;
            new THREE.Color(i%4===0?0xff944d:i%3===0?0xd8b493:0x7d726c).multiplyScalar(.6+rng()*.55).toArray(col,i*3);
          }
          const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
          body.debrisRing=glowPoints(g,Math.max(.035,body.radius*.022),.72);
          body.debrisRing.rotation.x=.22;body.debrisRing.rotation.z=.14;
          body.meshGroup.add(body.debrisRing);
        }
        body.debrisRing.material.opacity=Math.min(.9,.32+hits*.1+damage*.45);
      }
    }
    function impactReport(body,type,physical,energy=null) {
      const deposited=energy??(physical.groundEnergy+physical.airEnergy),planet=physical.planet;
      body.stackedHits=(body.stackedHits||0)+1;body.stackedEnergy=(body.stackedEnergy||0)+deposited;
      const report={id:++lab.sequence,target:body.id,type,energy:deposited,airEnergy:energy===null?physical.airEnergy:0,groundEnergy:energy===null?physical.groundEnergy:deposited,speed:physical.speed,retained:physical.retained,airburst:energy===null&&physical.airburst,craterMeters:energy===null&&!physical.airburst&&planet.solid&&lab.surface!=='ocean'?physical.craterMeters:0,burstAltitude:physical.burstAltitude,escapeSpeed:physical.escapeSpeed,solid:planet.solid,noMass:energy!==null,atmosphere:planet.atmosphere&&lab.atmosphere,phase:'完成',stackedHits:body.stackedHits,stackedEnergy:body.stackedEnergy};
      lab.reports.push(report);lab.reports=lab.reports.slice(-30);lab.lastReport=report;
      const bindingRatio=deposited/physical.binding;
      const logScale=Math.max(0,Math.log10(Math.max(1e14,deposited))-15.5)/8.5;
      const crustLoss=Math.min(55,Math.max(bindingRatio*100,Math.pow(logScale,1.65)*30*(planet.solid?1:.35)));
      body.integrity=Math.max(0,body.integrity-crustLoss);
      const heatedMass=planet.atmosphere?planet.atmoMass:planet.mass*.001;
      const tempRise=Math.max(Math.min(2600,(.015*report.groundEnergy+.12*report.airEnergy)/Math.max(1,heatedMass*1000)),Math.pow(logScale,1.5)*280);
      body.currentTemp+=Math.min(3500,tempRise);
      const escapeAtmo=.5*planet.atmoMass*physical.escapeSpeed**2;
      if(planet.atmosphere)body.atmoPct=Math.max(0,body.atmoPct-Math.max(100*deposited*.008/Math.max(1,escapeAtmo),crustLoss*.55));
      if(report.craterMeters>0)body.craterCount++;
      body.statusText=!planet.solid?'云层 / 光球剧烈扰动':body.integrity<25?'地壳崩裂 · 全球岩浆海':body.integrity<55?'剧烈叠加损伤 · 尘埃核冬':report.airburst?'大气空爆 · 冲击波横扫':lab.surface==='ocean'?'巨型海啸与水汽羽流':`累计 ${body.stackedHits} 次撞击 · 熔岩裂谷扩散`;
      if(body.cloudsMesh)body.cloudsMesh.material.uniforms.uOpacity.value=Math.max(0,body.atmoPct/100);
      if(body.atmoMesh)body.atmoMesh.material.uniforms.uIntensity.value=Math.max(0,body.atmoPct/100)*.85;
      body.uniforms.uDamage.value=1-body.integrity/100;
      body.uniforms.uHeatGlow.value=Math.min(1.5,Math.max(body.uniforms.uHeatGlow.value,(1-body.integrity/100)*.95));
      if(typeof ensurePlanetInterior==='function')ensurePlanetInterior(body);
      ensureStackedVisuals(body,planet);
      if(typeof syncSmashMeter==='function')syncSmashMeter(body);
      const isBuster=typeof PLANET_BUSTER_IDS!=='undefined'&&PLANET_BUSTER_IDS.has(type);
      const bigImpact=type==='asteroid'&&state.astDiamKm>=60;
      if(planet.solid&&!MONSTER_IDS.has(type)&&((monsterLab.autoBust&&(isBuster||bigImpact))||body.integrity<=10)){
        const bustCol=type==='antimatter'?0xe879f9:type==='photoid'?0x60a5fa:type==='dyson'?0xfbbf24:0xff5a1f;
        if(typeof triggerPlanetShatter==='function')triggerPlanetShatter(body,bustCol);
      }
      document.getElementById('stat-last-energy').textContent=`${ENCYCLOPEDIA[body.id]?.name||body.id} · ${deposited.toExponential(2)} J (累计 ${body.stackedHits} 次)`;
      document.getElementById('stat-last-mt').textContent=`当量 ${(deposited/4.184e15).toExponential(2)} Mt TNT · ${report.airburst?'空爆':planet.solid?'地表叠加熔蚀':'云层沉积'}`;
      appendLog(`[叠加 #${body.stackedHits}] ${EXPERIMENTS.find(e=>e[0]===type)?.[2]||type} · ${(deposited/4.184e15).toExponential(2)} Mt · ${report.airburst?'空爆 '+(report.burstAltitude/1000).toFixed(1)+' km':report.craterMeters?'撞击坑 '+(report.craterMeters/1000).toFixed(1)+' km':'高能沉积'}`,'amber');
      updateLeftPanelTelemetry(body);renderLabReport();return report;
    }
    function renderLabReport() {
      const r=lab.lastReport;if(!r)return;
      document.getElementById('lab-phase').textContent=`${EXPERIMENTS.find(e=>e[0]===r.type)?.[2]||r.type} · ${r.phase}`;
      const rows=[['本次沉积能量',r.energy.toExponential(2)+' J'],['累计叠加次数 / 总能',`${r.stackedHits||1} 次 · ${(r.stackedEnergy||r.energy).toExponential(2)} J`],['大气沉积',r.airEnergy.toExponential(2)+' J'],['地表 / 云层沉积',r.groundEnergy.toExponential(2)+' J'],['撞击坑标度估计',r.craterMeters?(r.craterMeters/1000).toFixed(2)+' km':'无固体撞击坑'],['剩余质量',r.noMass?'不适用':(r.retained*100).toFixed(1)+'%'],[r.airburst?'空爆时速度':'撞击速度',r.noMass?'不适用':(r.speed/1000).toFixed(2)+' km/s'],['逃逸速度',(r.escapeSpeed/1000).toFixed(2)+' km/s']];
      document.getElementById('lab-report-values').innerHTML=rows.map(([key,val])=>`<div class="dynamics-row"><span>${key}</span><output>${val}</output></div>`).join('');
    }
    function surfaceNormal(body,worldPoint) {
      const center=body.mesh.getWorldPosition(new THREE.Vector3()),world=worldPoint.clone().sub(center).normalize();
      const local=body.mesh.worldToLocal(center.clone().add(world)).normalize();return {world,local};
    }
    function makeSurfaceShock(body,normal,color,energy,speed=.82,width=.032) {
      const material=new THREE.ShaderMaterial({
        vertexShader:`varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader:`varying vec3 vP;uniform vec3 uCenter,uColor;uniform float uAge,uAlpha,uBroad,uSpeed,uWidth;void main(){float angle=acos(clamp(dot(normalize(vP),uCenter),-1.,1.));float front=uAge*uSpeed;float ring=exp(-pow((angle-front)/uWidth,2.));float second=exp(-pow((angle-front*.68)/(uWidth*1.7),2.))*.42;float wake=exp(-pow((angle-front)/(uWidth*4.2),2.))*.18;float a=(ring+second+wake+uBroad*pow(max(0.,dot(normalize(vP),uCenter)),2.)*.35)*uAlpha;if(a<.008)discard;vec3 col=mix(uColor,vec3(1.,.96,.88),ring*.65);gl_FragColor=vec4(col,min(1.,a));}`,
        uniforms:{uCenter:{value:normal.clone()},uColor:{value:new THREE.Color(color)},uAge:{value:0},uAlpha:{value:.88},uBroad:{value:0},uSpeed:{value:speed},uWidth:{value:width}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
      });
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(body.radius*1.012,64,40),material);body.mesh.add(mesh);
      return {mesh,material};
    }
    function craterScar(body,normal,physical) {
      if(!physical.planet.solid||lab.surface==='ocean'||physical.craterMeters<=0)return;
      if(typeof ensurePlanetInterior==='function')ensurePlanetInterior(body);
      const angular=THREE.MathUtils.clamp(physical.craterMeters/(2*physical.planet.radius)*5.2,.055,.78);
      const pts=body.uniforms.uImpactPoints.value,rads=body.uniforms.uImpactRadii.value,heats=body.uniforms.uImpactHeat.value,maxSlots=pts.length;
      let merged=-1;
      for(let i=0;i<maxSlots;i++){
        if(rads[i]>0.001){
          const d=Math.acos(THREE.MathUtils.clamp(pts[i].dot(normal),-1,1));
          if(d<Math.max(rads[i],angular)*1.35){merged=i;break;}
        }
      }
      if(merged>=0){
        pts[merged].lerp(normal,.35).normalize();
        rads[merged]=Math.min(.82,Math.hypot(rads[merged],angular*.85));
        heats[merged]=Math.min(2.4,heats[merged]+1.2);
      }else{
        const slot=body.craterSlot++%maxSlots;
        pts[slot].copy(normal);rads[slot]=angular;heats[slot]=1.65;
      }
      const scarGroup=new THREE.Group();
      scarGroup.position.copy(normal).multiplyScalar(body.radius*Math.cos(angular*.72)*1.002);
      scarGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(body.radius*Math.sin(angular)*.78,Math.max(.004,body.radius*angular*.042),10,48),new THREE.MeshStandardMaterial({color:0x4a3830,emissive:0xe65c19,emissiveIntensity:.35,roughness:.92}));
      const pool=new THREE.Mesh(new THREE.CircleGeometry(body.radius*Math.sin(angular)*.56,32),new THREE.MeshBasicMaterial({color:0xff7b29,transparent:true,opacity:.52,depthWrite:false,blending:THREE.AdditiveBlending}));
      pool.position.z=body.radius*.003;
      scarGroup.add(rim,pool);body.mesh.add(scarGroup);lab.scars.push({body,mesh:scarGroup,pool});
      if(lab.scars.length>48)disposeTree(lab.scars.shift().mesh);
    }
    function spawnImpactEffects(body,normal,type,physical,report) {
      const root=new THREE.Group();body.mesh.add(root);const height=report.airburst?visualAltitude(report.burstAltitude,physical.planet):0;root.position.copy(normal).multiplyScalar(body.radius*(1.006+height));root.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
      const strength=THREE.MathUtils.clamp(Math.log10(Math.max(1,report.energy))-13,.5,9),size=body.radius*(.024+strength*.012)*state.vfxIntensity;
      const hot=glowSprite(type==='comet'?0x93e4ff:type==='photoid'?0x9ac5ff:type==='antimatter'?0xe9b8ff:0xffb86c,size*6.5,.95);root.add(hot);
      const flash=new THREE.Mesh(new THREE.SphereGeometry(Math.max(.015,size*1.15),20,16),new THREE.MeshBasicMaterial({color:type==='photoid'?0xdbeafe:type==='antimatter'?0xf5d0fe:0xfff1c9,transparent:true,opacity:.92,depthWrite:false,blending:THREE.AdditiveBlending}));root.add(flash);
      const shock=makeSurfaceShock(body,normal,type==='comet'?0x7dd3fc:type==='antimatter'?0xd8b4fe:0xffb454,report.energy,.92,.028);
      const shock2=makeSurfaceShock(body,normal,type==='comet'?0xe0f2fe:0xff6b35,report.energy,.54,.05);
      const count=document.body.dataset.layout==='mobile'?140:340,positions=new Float32Array(count*3),colors=new Float32Array(count*3),parts=[],rng=deterministicRandom(report.id*19+117),planet=physical.planet;
      const t1=new THREE.Vector3(0,1,0).cross(normal).normalize();if(t1.lengthSq()<.1)t1.set(1,0,0);const t2=normal.clone().cross(t1).normalize();
      for(let i=0;i<count;i++){
        const a=rng()*Math.PI*2,isCurtain=i<count*.65,cone=isCurtain?(.45+rng()*.65):(.15+rng()*1.15);
        const spd=physical.speed*(isCurtain?(.04+rng()*.18):(.12+rng()*.32));
        const v=normal.clone().multiplyScalar(1).addScaledVector(t1,Math.cos(a)*cone).addScaledVector(t2,Math.sin(a)*cone).normalize().multiplyScalar(spd);
        parts.push({p:normal.clone().multiplyScalar(planet.radius*1.00001+(report.airburst?report.burstAltitude:0)),v,landed:false});
        const colHex=type==='comet'?(i%3?0xbae6fd:0xf8fafc):type==='antimatter'?(i%3?0xe879f9:0xfff1f2):(i%5===0?0xfff3c4:i%2===0?0xff8c3a:0xd95b26);
        new THREE.Color(colHex).toArray(colors,i*3);
      }
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
      const debris=glowPoints(geo,Math.max(.025,body.radius*.011),.92);body.mesh.add(debris);debris.frustumCulled=false;
      let plume=null;if(planet.atmosphere&&lab.atmosphere){plume=new THREE.Group();root.add(plume);for(let i=0;i<22;i++){const isCap=i>13,puff=new THREE.Sprite(new THREE.SpriteMaterial({map:particleGlow,color:i<6?0xff9442:report.airburst?0xcbd5e1:0x786258,transparent:true,opacity:i<6?.52:.34,depthWrite:false,blending:i<6?THREE.AdditiveBlending:THREE.NormalBlending}));const spread=isCap?size*2.4:size*.8;puff.position.set((rng()-.5)*spread,(rng()-.5)*spread,.05+i*size*.18);puff.scale.setScalar(size*(isCap?(1.8+rng()*1.2):(1+i*.07)));plume.add(puff);}}
      lab.effects.push({kind:'blast',body,root,hot,flash,shock,shock2,debris,parts,planet,plume,age:0,duration:9.5,size,report});audioEngine.playImpact(Math.min(1.4,.45+strength*.11));triggerScreenFlash(.24+strength*.045);
    }
    function spawnProjectile({startPos,targetPos,targetBody=null,speed=55,type='asteroid',diamKm=state.astDiamKm,velKms=state.astVelKms,label='小天体'}) {
      if(lab.projectiles.length>=24){showToast('最多同时运行 24 个入射体，请稍候','amber');return;}
      const body=targetBody||getActiveLabTarget();if(!body)return;
      const key=body.scaleKey,root=simulationRoot(key),start=worldToSimulation(startPos,key),target=worldToSimulation(targetPos,key),settings={...selectedSettings(type),diamKm,velKms};
      if(type==='kinetic')Object.assign(settings,selectedSettings(type));
      const physical=scientificImpact(settings,body.id),normal=surfaceNormal(body,targetPos.distanceTo(body.mesh.getWorldPosition(new THREE.Vector3()))<.001?startPos:targetPos).local;
      const grp=new THREE.Group();root.add(grp);grp.position.copy(start);
      const radius=THREE.MathUtils.clamp(body.radius*Math.pow(physical.diameter/(2*physical.planet.radius),.3),.045,body.radius*.12);
      const mesh=type==='kinetic'?new THREE.Mesh(new THREE.CylinderGeometry(radius*.35,radius*.35,radius*5.5,10),new THREE.MeshStandardMaterial({color:0xa8c5d9,metalness:.8,roughness:.28})):new THREE.Mesh(new THREE.DodecahedronGeometry(radius,1),new THREE.MeshStandardMaterial({color:type==='comet'?0x96c9dc:0x8c7b6d,roughness:.9,emissive:0x66290c,emissiveIntensity:.18,flatShading:true}));if(type==='kinetic')mesh.rotation.x=Math.PI/2;grp.add(mesh);
      const entryGlow=glowSprite(type==='comet'?0x7dd3fc:0xffb259,radius*8.5,0);grp.add(entryGlow);
      const entryCone=new THREE.Mesh(new THREE.ConeGeometry(radius*2.2,radius*9,16,1,true),new THREE.MeshBasicMaterial({color:type==='comet'?0x7dd3fc:0xff7f32,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
      entryCone.rotation.x=Math.PI/2;entryCone.position.z=-radius*3.8;grp.add(entryCone);
      const history=Array.from({length:150},()=>start.clone()),line=makeLine(history,type==='comet'?0x7dd3fc:0xffa952,.7);root.add(line);
      const center=worldToSimulation(body.mesh.getWorldPosition(new THREE.Vector3()),key),distance=start.distanceTo(center);
      const direction=target.clone().sub(start).normalize(),velocity=direction.clone().multiplyScalar(speed);
      const duration=Math.max(.5,distance/speed),sources=[{pos:center,mu:Math.max(2,body.radius**3*2),softening:.001}];
      const aim=target.clone().sub(center).length()>body.radius*.8?target.clone():center.clone();
      for(let iter=0;iter<5;iter++){const p=start.clone(),v=velocity.clone(),steps=120,h=duration/steps;for(let j=0;j<steps;j++){v.addScaledVector(accelerationAt(p,sources),h*.5);p.addScaledVector(v,h);v.addScaledVector(accelerationAt(p,sources),h*.5);}velocity.addScaledVector(aim.clone().sub(p),1/duration).normalize().multiplyScalar(speed);}
      lab.projectiles.push({body,key,grp,mesh,entryGlow,entryCone,physical,settings,normal,velocity,position:start,history,line,age:0,maxAge:8,distance,startCenter:center,initialVelocity:velocity.clone(),type,entered:false,burst:false,collisionRadius:body.radius*physical.diameter/(2*physical.planet.radius),radius});
      document.getElementById('lab-phase').textContent=`${EXPERIMENTS.find(e=>e[0]===type)?.[2]||label} · 接近目标`;
    }
    function spawnRadiation(body,type,worldPoint=null) {
      const planet=PLANET_PHYSICS[body.id]||PLANET_PHYSICS.earth,energy=energyForType(type),point=worldPoint||body.mesh.getWorldPosition(new THREE.Vector3()).add(camera.position.clone().sub(body.mesh.getWorldPosition(new THREE.Vector3())).normalize().multiplyScalar(body.radius)),n=surfaceNormal(body,point).local;
      const physical=scientificImpact({diamKm:.02,velKms:20,material:'rock',atmosphere:lab.atmosphere},body.id),report=impactReport(body,type,physical,['laser','dyson','grb'].includes(type)?0:energy);report.phase='释能中';
      const root=new THREE.Group();body.mesh.add(root);root.position.copy(n).multiplyScalar(body.radius*1.012);root.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);
      const size=body.radius*.042,hot=glowSprite(type==='antimatter'?0xe9b8ff:type==='grb'?0x93c5fd:0xffcc70,size*8,.85);root.add(hot);
      if(type==='laser'||type==='dyson'||type==='grb'){
        const beam=new THREE.Mesh(new THREE.CylinderGeometry(size*.22,size*.34,body.radius*5.5,16,1,true),new THREE.MeshBasicMaterial({color:type==='grb'?0x7dd3fc:0xffbe5c,transparent:true,opacity:.68,depthWrite:false,blending:THREE.AdditiveBlending}));beam.rotation.x=Math.PI/2;beam.position.z=body.radius*2.75;root.add(beam);
        const footprint=makeSurfaceShock(body,n,type==='grb'?0x83a6db:0xffa94d,energy,.5,.05);if(type==='grb')footprint.material.uniforms.uBroad.value=1;
        craterScar(body,n,{...physical,craterMeters:planet.radius*.08});
        lab.effects.push({kind:'beam',body,root,hot,shock:footprint,age:0,duration:4,power:lab.powerW,report,physical,type});
      }else{disposeTree(root);craterScar(body,n,{...physical,craterMeters:Math.max(40000,planet.radius*.12)});spawnImpactEffects(body,n,type,physical,report);}
      audioEngine.playLaser();renderLabReport();
    }
    function tidalEncounter(body) {
      const physical=scientificImpact(selectedSettings(),body.id),n=camera.position.clone().sub(body.mesh.getWorldPosition(new THREE.Vector3())).normalize();
      const local=body.mesh.worldToLocal(body.mesh.getWorldPosition(new THREE.Vector3()).add(n)).normalize();
      const flyby=glowSprite(0x9dbce8,body.radius*.6,.75);simulationRoot(body.scaleKey).add(flyby);
      lab.effects.push({kind:'tidal',body,flyby,local,age:0,duration:6,initialScale:body.mesh.scale.clone(),massRatio:lab.tidalMass,physical});showToast('潮汐掠过：拉伸为放大演示，非流体 Roche 极限求解','amber');
    }
    function executeExoticExperiment(type,body,point=null) {
      if(typeof MONSTER_IDS!=='undefined'&&MONSTER_IDS.has(type)){spawnMonsterExperiment(type,body,point);return;}
      if(lab.effects.length+lab.projectiles.length+activeExoticEffects.length>=(document.body.dataset.layout==='mobile'?12:24)){showToast('当前并发实验较多，请稍候片刻','amber');return;}
      if(!body||body.isDestroyed){showToast('请先选择一个完整的天体','amber');return;}
      if(['singularity','foil','vacuum'].includes(type)){showToast('此类型为科幻爆星演出，支持一键复原','amber');lab.lastReport=null;document.getElementById('lab-phase').textContent=EXPERIMENTS.find(e=>e[0]===type)[2]+' · 💥 爆星演出';document.getElementById('lab-report-values').textContent='高能科幻爆星演出：可随时点击“单目标复原”还原。';if(type==='foil')flattenBodyTo2D(body);else{legacyExecuteExoticExperiment(type,body,point);if(monsterLab.autoBust&&PLANET_PHYSICS[body.id]?.solid)setTimeout(()=>{if(!body.isDestroyed&&!body.shatterGroup)triggerPlanetShatter(body,type==='singularity'?0xa855f7:0x38bdf8);},1800);}return;}
      if(type==='tidal'){tidalEncounter(body);return;}
      if(['nuclear','antimatter','laser','dyson','grb','photoid'].includes(type)){spawnRadiation(body,type,point);return;}
      const center=body.mesh.getWorldPosition(new THREE.Vector3()),radial=camera.position.clone().sub(center).normalize(),side=new THREE.Vector3(0,1,0).cross(radial).normalize();
      const target=point||center.clone().addScaledVector(radial,body.radius*.95);
      const approach=radial.clone().multiplyScalar(Math.sin(lab.angle*Math.PI/180)).addScaledVector(side,Math.cos(lab.angle*Math.PI/180)).normalize();
      const start=target.clone().addScaledVector(approach,Math.max(body.radius*2.8,10));
      spawnProjectile({startPos:start,targetPos:target,targetBody:body,speed:Math.max(10,body.radius*2.8)/1.55,type,diamKm:state.astDiamKm,velKms:state.astVelKms,label:EXPERIMENTS.find(e=>e[0]===type)?.[2]});
      if(document.body.dataset.layout==='mobile')togglePanel('right',true);
    }
    function launchSalvo(type,body) {
      if(!body||body.isDestroyed){showToast('请先选择可撞击的行星或卫星','amber');return;}
      const center=body.mesh.getWorldPosition(new THREE.Vector3()),radial=camera.position.clone().sub(center).normalize();
      const t1=new THREE.Vector3(0,1,0).cross(radial).normalize(),t2=radial.clone().cross(t1).normalize();
      const offsets=[[0,0],[.34,.22],[-.32,.25]];
      offsets.forEach(([ox,oy],idx)=>{
        const timer=setTimeout(()=>{
          if(body.isDestroyed||!['L0','L1'].includes(state.currentScale))return;
          const c=body.mesh.getWorldPosition(new THREE.Vector3()),dir=radial.clone().addScaledVector(t1,ox).addScaledVector(t2,oy).normalize();
          executeExoticExperiment(type,body,c.addScaledVector(dir,body.radius*.96));
        },idx*380);
        lab.salvoTimers.push(timer);
      });
      showToast(`已启动 3 连发叠加撞击：${ENCYCLOPEDIA[body.id]?.name||body.id}`,'amber');
    }
    function finishProjectile(p,center,airburst=false) {
      const world=p.grp.getWorldPosition(new THREE.Vector3()),n=surfaceNormal(p.body,world).local,report=impactReport(p.body,p.type,p.physical);
      if(airburst){report.airburst=true;report.craterMeters=p.physical.craterMeters<1000?0:report.craterMeters;}
      if(!report.airburst)craterScar(p.body,n,p.physical);spawnImpactEffects(p.body,n,p.type,p.physical,report);
      disposeTree(p.grp);disposeTree(p.line);renderLabReport();
    }
    function updateLab(dt) {
      if(typeof updateMonsters==='function')updateMonsters(dt);
      for(const b of celestialBodies){
        if(b.ashShroud?.material?.uniforms?.uTime)b.ashShroud.material.uniforms.uTime.value+=dt;
        if(b.debrisRing)b.debrisRing.rotation.y+=dt*.22;
      }
      for(const s of lab.scars){if(s.pool&&s.pool.material.opacity>.14)s.pool.material.opacity=Math.max(.14,s.pool.material.opacity-dt*.03);}
      for(let i=lab.projectiles.length-1;i>=0;i--){const p=lab.projectiles[i];if(p.key!==state.currentScale){p.grp.visible=false;p.line.visible=false;continue;}p.grp.visible=true;p.line.visible=dynamics.trails;
        const center=worldToSimulation(p.body.mesh.getWorldPosition(new THREE.Vector3()),p.key);p.startCenter.copy(center);
        p.age+=dt;const previous=p.position.clone(),sources=[{pos:center,mu:Math.max(2,p.body.radius**3*2),softening:.001}],steps=Math.max(1,Math.ceil(dt*120)),h=dt/steps;
        for(let j=0;j<steps;j++){p.velocity.addScaledVector(accelerationAt(p.position,sources),h*.5);p.position.addScaledVector(p.velocity,h);p.velocity.addScaledVector(accelerationAt(p.position,sources),h*.5);}
        const dist=p.position.distanceTo(center),relative=dist/p.body.radius;
        p.entered=p.physical.planet.atmosphere&&p.settings.atmosphere&&relative<1.42;
        if(p.entered){const altitude=Math.max(0,(relative-1)/.42*p.physical.planet.upper);let sample=p.physical.profile.find(s=>s.altitude<=altitude)||p.physical.profile.at(-1);if(sample){const ratio=Math.max(.035,sample.speed/p.physical.initialSpeed),oldRatio=p.entryRatio||1;p.velocity.multiplyScalar(Math.min(1,ratio/oldRatio));p.entryRatio=ratio;p.mesh.scale.setScalar(Math.max(.28,Math.cbrt(sample.mass/p.physical.initialMass)));}}
        p.entryGlow.material.opacity=p.entered?.92:.18;if(p.entryCone)p.entryCone.material.opacity=p.entered?.58:0;p.mesh.material.emissiveIntensity=p.entered?1.4:.18;
        p.grp.position.copy(p.position);p.grp.lookAt(p.position.clone().add(p.velocity));p.mesh.rotation.z+=dt*2.4;
        if(dt>0){p.history.shift();p.history.push(p.position.clone());const a=p.line.geometry.attributes.position;p.history.forEach((v,j)=>a.setXYZ(j,v.x,v.y,v.z));a.needsUpdate=true;p.line.geometry.computeBoundingSphere();}
        document.getElementById('lab-phase').textContent=`${EXPERIMENTS.find(e=>e[0]===p.type)?.[2]||p.type} · ${p.entered?'大气再入 / 等离子烧蚀':'高速入射中'}`;
        const segment=p.position.clone().sub(previous),u=segment.lengthSq()?THREE.MathUtils.clamp(center.clone().sub(previous).dot(segment)/segment.lengthSq(),0,1):0,closest=previous.clone().addScaledVector(segment,u),hit=closest.distanceTo(center)<=p.body.radius+p.collisionRadius;
        if((p.entered&&p.physical.airburst&&relative<1+.35*p.physical.burstAltitude/Math.max(1,p.physical.planet.upper))||hit){if(hit)p.position.copy(closest);p.grp.position.copy(p.position);finishProjectile(p,center,p.physical.airburst);lab.projectiles.splice(i,1);}
        else if(p.age>p.maxAge){disposeTree(p.grp);disposeTree(p.line);lab.projectiles.splice(i,1);showToast('入射体掠过目标，未发生碰撞','amber');}
      }
      for(let i=lab.effects.length-1;i>=0;i--){const e=lab.effects[i];if(e.body.scaleKey!==state.currentScale)continue;e.age+=dt;const u=Math.min(1,e.age/e.duration);
        if(e.kind==='blast'){
          e.hot.scale.setScalar(Math.max(.01,e.size*6.5*(1+u*1.8)));e.hot.material.opacity=.92*Math.max(0,1-e.age/2.2);e.flash.scale.setScalar(1+u*2.8);e.flash.material.opacity=.88*Math.max(0,1-e.age/1.1);
          e.shock.material.uniforms.uAge.value=e.age;e.shock.material.uniforms.uAlpha.value=.9*(1-u);
          if(e.shock2){e.shock2.material.uniforms.uAge.value=e.age;e.shock2.material.uniforms.uAlpha.value=.75*Math.pow(1-u,.85);}
          const steps=Math.max(1,Math.ceil(dt*300/5)),h=dt*300/steps,mu=REAL_G*e.planet.mass;
          for(let j=0;j<e.parts.length;j++){const p=e.parts[j];if(!p.landed){for(let k=0;k<steps;k++){const r=p.p.length(),acc=p.p.clone().multiplyScalar(-mu/Math.pow(r,3));p.v.addScaledVector(acc,h*.5);p.p.addScaledVector(p.v,h);p.v.addScaledVector(p.p.clone().multiplyScalar(-mu/Math.pow(p.p.length(),3)),h*.5);if(p.p.length()<=e.planet.radius){p.landed=true;p.p.normalize().multiplyScalar(e.planet.radius);break;}}}
            const r=p.p.length(),visual=p.p.clone().normalize().multiplyScalar(e.body.radius*(1+Math.max(0,r/e.planet.radius-1)*5.8));e.debris.geometry.attributes.position.setXYZ(j,visual.x,visual.y,visual.z);}
          e.debris.geometry.attributes.position.needsUpdate=true;e.debris.material.opacity=.88*(1-u*.85);if(e.plume)e.plume.children.forEach((p,j)=>{p.material.opacity=(j<6?.48:.3)*(1-u);p.scale.multiplyScalar(1+dt*.12);p.position.z+=dt*e.size*.22;});
        }else if(e.kind==='beam'){const deposited=e.power*Math.max(0,Math.min(dt,e.duration-(e.age-dt)));e.report.energy+=deposited;e.report.groundEnergy+=deposited;e.body.currentTemp+=deposited*.01/Math.max(1,(e.physical.planet.atmosphere?e.physical.planet.atmoMass:e.physical.planet.mass*.001)*1000);renderLabReport();e.hot.material.opacity=.5+.2*Math.sin(e.age*14);e.shock.material.uniforms.uAge.value=e.age;e.shock.material.uniforms.uAlpha.value=.55*(1-u);e.body.uniforms.uHeatGlow.value=Math.max(e.body.uniforms.uHeatGlow.value,.45*Math.sin(u*Math.PI));}
        else if(e.kind==='tidal'){const center=worldToSimulation(e.body.mesh.getWorldPosition(new THREE.Vector3()),e.body.scaleKey),distance=3+Math.pow((u-.5)*10,2),ratio=2*e.massRatio/distance**3;
          e.flyby.position.copy(center).add(new THREE.Vector3((u-.5)*e.body.radius*14,e.body.radius*3,0));e.body.mesh.scale.copy(e.initialScale).multiply(new THREE.Vector3(1+Math.min(.42,ratio),1-Math.min(.22,ratio*.5),1-Math.min(.22,ratio*.5)));}
        if(u>=1){if(e.root)disposeTree(e.root);if(e.shock)disposeTree(e.shock.mesh);if(e.shock2)disposeTree(e.shock2.mesh);if(e.debris)disposeTree(e.debris);if(e.flyby){disposeTree(e.flyby);e.body.mesh.scale.copy(e.initialScale);}e.body.uniforms.uHeatGlow.value=Math.min(1.2,(1-e.body.integrity/100)*.85);lab.effects.splice(i,1);if(e.report){e.report.phase='完成';renderLabReport();}}
      }
    }
    function resetLab(body=null) {
      if(typeof resetMonsters==='function')resetMonsters(body);
      lab.salvoTimers.forEach(clearTimeout);lab.salvoTimers=[];
      for(let i=lab.projectiles.length-1;i>=0;i--){const p=lab.projectiles[i];if(!body||p.body===body){disposeTree(p.grp);disposeTree(p.line);lab.projectiles.splice(i,1);}}
      for(let i=lab.effects.length-1;i>=0;i--){const e=lab.effects[i];if(!body||e.body===body){for(const o of [e.root,e.shock?.mesh,e.shock2?.mesh,e.debris,e.flyby])if(o)disposeTree(o);if(e.initialScale)e.body.mesh.scale.copy(e.initialScale);lab.effects.splice(i,1);}}
      for(let i=lab.scars.length-1;i>=0;i--){if(!body||lab.scars[i].body===body){disposeTree(lab.scars[i].mesh);lab.scars.splice(i,1);}}
      const targets=body?[body]:celestialBodies;
      targets.forEach(b=>{b.stackedHits=0;b.stackedEnergy=0;if(b.ashShroud){disposeTree(b.ashShroud);b.ashShroud=null;}if(b.debrisRing){disposeTree(b.debrisRing);b.debrisRing=null;}});
      if(!body){lab.lastReport=null;lab.reports=[];document.getElementById('lab-report-values').replaceChildren();document.getElementById('lab-phase').textContent='等待实验';}
      syncSmashMeter(body||getActiveLabTarget());
    }
    function updateLabParameters(type=state.selectedExperiment) {
      const isMonster=typeof MONSTER_IDS!=='undefined'&&MONSTER_IDS.has(type);
      const impact=['asteroid','comet','airburst','kinetic'].includes(type),energy=['nuclear','antimatter','laser','dyson','grb','photoid','tidal'].includes(type);
      document.querySelector('.lab-physics-controls').classList.toggle('hidden',!impact);
      document.getElementById('asteroid-params').classList.toggle('hidden',!impact);document.getElementById('lab-energy-params').classList.toggle('hidden',!energy&&type!=='kinetic');
      const monsterBox=document.getElementById('lab-monster-params');if(monsterBox)monsterBox.classList.toggle('hidden',!isMonster);
      document.querySelectorAll('[data-parameter]').forEach(el=>el.classList.toggle('hidden',!el.dataset.parameter.split(' ').includes(type)));
      document.getElementById('slider-ast-diam').parentElement.classList.toggle('hidden',type==='kinetic');
      const materialSelect=document.getElementById('lab-material');materialSelect.disabled=['kinetic','comet'].includes(type);materialSelect.value=type==='kinetic'?'iron':type==='comet'?'ice':lab.material;
      document.getElementById('val-ast-vel').textContent=state.astVelKms+' km/s';
      const body=getActiveLabTarget(),physics=scientificImpact(selectedSettings(type),body?.id||'earth');
      if(typeof syncSmashMeter==='function')syncSmashMeter(body);
      document.getElementById('val-ast-diam').textContent=state.astDiamKm<1?(state.astDiamKm*1000).toFixed(0)+' m':state.astDiamKm.toFixed(2)+' km';
      const monsterEst=isMonster?(1.6e24*Math.pow(10,(monsterLab.power-1)*.95)*(.65+monsterLab.scale*.45)):0;
      document.getElementById('val-est-mt').textContent=((isMonster?monsterEst:impact?physics.initialEnergy:energyForType(type))/4.184e15).toExponential(2)+' Mt TNT';
      document.getElementById('lab-physical-note').textContent=isMonster?(MONSTER_NOTES[type]||'科幻/玄幻巨兽与舰队毁灭演出，支持体型/破坏力调节与 3 连发叠加，Lv.5+ 破坏力可将固体行星彻底粉碎。'):impact?`${physics.planet.solid?'固体表面 · 支持最多 16 处熔岩坑与尘埃环叠加':'气态目标，无岩石撞击坑'}；${physics.planet.atmosphere&&lab.atmosphere?'指数大气 + 阻力 + 等离子烧蚀 + 碎裂近似':'无大气减速'}。`:['singularity','foil','vacuum'].includes(type)?'科幻 / 假说的艺术演出，不对应经过验证的物理模型。':type==='tidal'?'点质量潮汐比例与放大的形变示意，不是流体解。':'理想能量沉积模型。支持连续多次发射，观察热融裂纹与冲击波叠加。';
    }
    function syncSmashMeter(body=getActiveLabTarget()) {
      const lbl=document.getElementById('smash-target-label'),val=document.getElementById('smash-integrity-val'),bar=document.getElementById('smash-bar-fill');
      if(!lbl||!val||!bar)return;
      if(!body){lbl.textContent='无目标';val.textContent='--';bar.style.width='0%';return;}
      lbl.textContent=ENCYCLOPEDIA[body.id]?.name||body.id;
      const pct=body.shatterGroup?0:Math.max(0,Math.round(body.integrity));
      val.textContent=body.shatterGroup?'💥 已爆星':pct+'%';
      bar.style.width=pct+'%';
    }
    function bindLabUI() {
      const selector=document.getElementById('experiment-selector');selector.innerHTML=EXPERIMENTS.map(([id,icon,name,desc,category])=>{
        const isBust=typeof PLANET_BUSTER_IDS!=='undefined'&&PLANET_BUSTER_IDS.has(id);
        const isCarve=typeof CARVE_HEAVY_IDS!=='undefined'&&CARVE_HEAVY_IDS.has(id);
        const badge=isBust?'<span class="tier-pill tier-bust">💥 可爆星</span>':isCarve?'<span class="tier-pill tier-carve">☄ 挖空</span>':'<span class="tier-pill tier-surf">⚡ 毁伤</span>';
        return `<button data-exp="${id}" data-category="${category}" class="exp-btn glass-btn ${id===state.selectedExperiment?'active':''} rounded-xl p-2 text-left"><div class="text-xs font-semibold text-white"><span>${icon} ${name}</span>${badge}</div><div class="text-[10px] text-slate-400 mt-0.5">${desc}</div></button>`;
      }).join('');
      selector.querySelectorAll('button').forEach(b=>b.onclick=()=>{state.selectedExperiment=b.dataset.exp;selector.querySelectorAll('button').forEach(el=>el.classList.toggle('active',el===b));if(state.selectedExperiment==='airburst'){state.astDiamKm=.02;state.astVelKms=20;document.getElementById('slider-ast-diam').value=.02;document.getElementById('slider-ast-vel').value=20;}updateLabParameters();});
      document.querySelectorAll('[data-lab-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-lab-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));selector.querySelectorAll('button').forEach(el=>el.classList.toggle('hidden',b.dataset.labFilter!=='all'&&el.dataset.category!==b.dataset.labFilter));});
      document.getElementById('slider-ast-diam').min=.02;document.getElementById('slider-ast-diam').max=100;document.getElementById('slider-ast-diam').step=.02;state.astDiamKm=10;document.getElementById('slider-ast-diam').value=10;state.astVelKms=20;document.getElementById('slider-ast-vel').value=20;
      document.getElementById('slider-ast-diam').oninput=e=>{state.astDiamKm=+e.target.value;updateLabParameters();};document.getElementById('slider-ast-vel').oninput=e=>{state.astVelKms=+e.target.value;document.getElementById('val-ast-vel').textContent=state.astVelKms+' km/s';updateLabParameters();};
      document.getElementById('lab-angle').oninput=e=>{lab.angle=+e.target.value;document.getElementById('lab-angle-value').textContent=lab.angle+'°';updateLabParameters();};
      document.getElementById('lab-material').onchange=e=>{lab.material=e.target.value;updateLabParameters();};document.getElementById('lab-atmosphere').onchange=e=>{lab.atmosphere=e.target.checked;updateLabParameters();};document.getElementById('lab-surface').onchange=e=>{lab.surface=e.target.value;updateLabParameters();};
      const sliders=[['lab-mass','massKg',true,' kg'],['lab-yield','energyMt',true,' Mt TNT'],['lab-power','powerW',true,' W'],['lab-antimatter','antimatterKg',true,' kg'],['lab-beta','beta',false,' c'],['lab-tidal','tidalMass',false,' 倍目标质量']];
      sliders.forEach(([id,key,log,unit])=>document.getElementById(id).oninput=e=>{lab[key]=log?10**(+e.target.value):+e.target.value;document.getElementById(id+'-value').textContent=lab[key].toPrecision(3)+unit;updateLabParameters();});
      document.querySelectorAll('[data-impact-preset]').forEach(b=>b.onclick=()=>{const [d,v]=b.dataset.impactPreset.split(',').map(Number);state.astDiamKm=d;state.astVelKms=v;document.getElementById('slider-ast-diam').value=d;document.getElementById('slider-ast-vel').value=v;document.getElementById('val-ast-vel').textContent=v+' km/s';updateLabParameters();});
      const mScale=document.getElementById('lab-monster-scale'),mPower=document.getElementById('lab-monster-power');
      const powerNames=['','Lv.1 灭城级','Lv.2 灭国级','Lv.3 灭世级','Lv.4 裂壳级','Lv.5 爆星级','Lv.6 终极湮灭'];
      if(mScale)mScale.oninput=e=>{monsterLab.scale=+e.target.value;document.getElementById('lab-monster-scale-value').textContent=monsterLab.scale.toFixed(1)+'× 巨兽尺度';updateLabParameters();};
      if(mPower)mPower.oninput=e=>{monsterLab.power=+e.target.value;document.getElementById('lab-monster-power-value').textContent=powerNames[monsterLab.power]||('Lv.'+monsterLab.power);updateLabParameters();};
      const autoBust=document.getElementById('lab-auto-bust');
      if(autoBust)autoBust.onchange=e=>{monsterLab.autoBust=e.target.checked;showToast(monsterLab.autoBust?'💥 一键爆星模式已开启：可爆星武器与怪兽将一击碎星！':'已切回常规累积破坏模式','amber');};
      const salvoBtn=document.getElementById('btn-launch-salvo');if(salvoBtn)salvoBtn.onclick=()=>launchSalvo(state.selectedExperiment,getActiveLabTarget());
      updateLabParameters();syncSmashMeter();
    }
