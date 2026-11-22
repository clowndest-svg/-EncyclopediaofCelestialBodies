    const AU_KM=149597870.7, YEAR_SECONDS=31557600, SOLAR_GM=4*Math.PI*Math.PI;
    const SOLAR_ELEMENTS={mercury:[.3871,.2056,1.6601e-7,7],venus:[.7233,.0068,2.4478e-6,3.39],earth:[1,.0167,3.0035e-6,0],mars:[1.5237,.0934,3.2272e-7,1.85],jupiter:[5.2028,.0489,.0009543,1.30],saturn:[9.5388,.0565,.0002857,2.49],uranus:[19.1914,.0472,.00004365,.77],neptune:[30.0611,.0086,.00005149,1.77]};
    const PLANET_TRAIL_COLORS={sun:0xffe49c,mercury:0xe2e8f0,venus:0xf8c978,earth:0x38d0ff,mars:0xff5a43,jupiter:0xff9c38,saturn:0xffe066,uranus:0x2ee8d4,neptune:0x3b82f6};
    const PLANET_HELIX_SPAN={sun:36,mercury:3.2,venus:5.5,earth:9.5,mars:14.5,jupiter:28,saturn:44,uranus:72,neptune:105};
    const GAL_R=1280, GAL_OMEGA=0.042, ECLIPTIC_TILT=THREE.MathUtils.degToRad(60);
    const motion={frame:'external',follow:true,guides:false,nbody:true,stream:true,daysPerSecond:55,historyYears:12,roots:{},solar:[],histories:[],years:0,lunarDays:0,lastHistory:0,phase:{L2:0,L3:0},webScale:1,webGyr:0,clusterLines:[],labClock:false,parallax:{},bowShock:null,webGrid:null,milkyWayL1:null,sgrALabel:null,galacticOverview:false,galacticRibbon:null,planetHalos:[],kuiperBelt:null};
    const GALACTIC_DIRECTION=new THREE.Vector3(.494109,.86229,-.11095).normalize();
    const SOLAR_TRAVEL_AU_YEAR=230*YEAR_SECONDS/AU_KM;

    const COS_TILT = Math.cos(ECLIPTIC_TILT), SIN_TILT = Math.sin(ECLIPTIC_TILT);
    const SOLAR_AU_ANCHORS = [[0,0],[.3871,24],[.7233,34],[1,46],[1.5237,60],[5.2028,92],[9.5388,128],[19.1914,162],[30.0611,192],[50,246]];
    const _gfPos = new THREE.Vector3(), _gfEx = new THREE.Vector3(), _gfEy = new THREE.Vector3(), _gfEz = new THREE.Vector3();
    const _tmpLocal = new THREE.Vector3(), _tmpWorld = new THREE.Vector3(), _tmpRel = new THREE.Vector3(), _tmpKepler = new THREE.Vector3(), _tmpExact = new THREE.Vector3(), _tmpOff = new THREE.Vector3(), _tmpOrbit = new THREE.Vector3();

    function galacticFrameInto(years, pos, ex, ey, ez) {
      const theta=years*GAL_OMEGA, c=Math.cos(theta), s=Math.sin(theta);
      pos.set(GAL_R*c,0,-GAL_R*s);
      ex.set(c,0,-s);
      const tx=-s, tz=-c;
      ey.set(tx*SIN_TILT, COS_TILT, tz*SIN_TILT).normalize();
      ez.set(-tx*COS_TILT, SIN_TILT, -tz*COS_TILT).normalize();
    }

    function galacticFrameAt(years) {
      const theta=years*GAL_OMEGA, c=Math.cos(theta), s=Math.sin(theta);
      const pos=new THREE.Vector3(GAL_R*c,0,-GAL_R*s);
      const R=new THREE.Vector3(c,0,-s);         // 径向向外
      const T=new THREE.Vector3(-s,0,-c);        // 前进切向（逆时针绕银心）
      const U=new THREE.Vector3(0,1,0);          // 银道北极
      const ct=COS_TILT, st=SIN_TILT;
      const Ex=R.clone();
      const Ey=U.clone().multiplyScalar(ct).addScaledVector(T,st).normalize();
      const Ez=U.clone().multiplyScalar(st).addScaledVector(T,-ct).normalize();
      const m=new THREE.Matrix4().makeBasis(Ex,Ey,Ez);
      const quat=new THREE.Quaternion().setFromRotationMatrix(m);
      return {theta,pos,R,T,U,Ex,Ey,Ez,quat};
    }

    function gravitationalStep(states,h,gm=SOLAR_GM,mutual=true,softening=1e-10) {
      const accelerations=()=>states.map((b,i)=>{const a=new THREE.Vector3();for(let j=0;j<states.length;j++)if(i!==j&&(mutual||states[j].id==='sun'||b.id==='sun')){const d=states[j].p.clone().sub(b.p),r2=d.lengthSq()+softening;a.addScaledVector(d,gm*states[j].mass/(r2*Math.sqrt(r2)));}return a;});
      let acc=accelerations();states.forEach((b,i)=>{b.v.addScaledVector(acc[i],h*.5);b.p.addScaledVector(b.v,h);});
      acc=accelerations();states.forEach((b,i)=>b.v.addScaledVector(acc[i],h*.5));
    }
    function orbitalVelocity(orbit,mean,mu,out=new THREE.Vector3()) {
      let E=mean;for(let i=0;i<8;i++)E-=(E-orbit.e*Math.sin(E)-mean)/(1-orbit.e*Math.cos(E));
      const rate=Math.sqrt(mu/Math.pow(orbit.a,3))/(1-orbit.e*Math.cos(E));
      const x=-orbit.a*Math.sin(E)*rate,z=orbit.a*Math.sqrt(1-orbit.e*orbit.e)*Math.cos(E)*rate,c=Math.cos(orbit.argument),s=Math.sin(orbit.argument);
      return out.set(x*c-z*s,(x*s+z*c)*Math.sin(orbit.inclination),(x*s+z*c)*Math.cos(orbit.inclination));
    }
    function mapSolarAU(p,out=new THREE.Vector3()) {
      const r=p.length(),anchors=SOLAR_AU_ANCHORS;
      let mapped=246+(r-50)*2;for(let i=1;i<anchors.length;i++)if(r<=anchors[i][0]){const [a,x]=anchors[i-1],[b,y]=anchors[i];mapped=x+(y-x)*(r-a)/(b-a);break;}
      return out.copy(p).multiplyScalar(r>0?mapped/r:0);
    }
    function simulationRoot(key=state.currentScale){return motion.roots[key]||scaleGroups[key];}
    function worldToSimulation(v,key=state.currentScale){simulationRoot(key).updateWorldMatrix(true,false);return simulationRoot(key).worldToLocal(v.clone());}
    function simulationToWorld(v,key=state.currentScale){simulationRoot(key).updateWorldMatrix(true,false);return simulationRoot(key).localToWorld(v.clone());}
    function travelAt(years,key='L1') {
      if(motion.frame==='local')return new THREE.Vector3();
      if(key==='L1')return galacticFrameAt(years).pos;
      const travel=GALACTIC_DIRECTION.clone().multiplyScalar(SOLAR_TRAVEL_AU_YEAR*2.4*years);
      if(key==='L0'){const angle=years*Math.PI*2;travel.add(new THREE.Vector3((Math.cos(angle)-1)*175,0,Math.sin(angle)*175));}
      return travel;
    }
    function makeHistoryLine(key,color=TRAJECTORY_COLOR,opacity=.8,count=420) {
      const line=makeLine(Array.from({length:count},()=>new THREE.Vector3()),color,opacity);
      const colors=new Float32Array(count*3),c=new THREE.Color(color);for(let i=0;i<count;i++)c.clone().multiplyScalar(.08+.92*Math.pow(i/(count-1),1.35)).toArray(colors,i*3);
      line.geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));line.material.vertexColors=true;line.frustumCulled=false;scaleGroups[key].add(line);line.userData.realHistory=true;return line;
    }

    // 构建 L1 场景中真实可见的 3D 银河系旋臂与人马座 A* 银心（对标银河年穿行奇观）
    function buildL1MilkyWay() {
      const grp=new THREE.Group(), mobile=document.body.dataset.layout==='mobile', rng=deterministicRandom(2026);
      const count=mobile?9000:22000, pos=new Float32Array(count*3), col=new Float32Array(count*3);
      const cCore=new THREE.Color(0xffdfa0), cArm=new THREE.Color(0x9bc5ff), cOuter=new THREE.Color(0x6d84d8), cPink=new THREE.Color(0xf48fb1);
      for(let i=0;i<count;i++){
        let x,y,z,c;
        if(i<count*.16){
          // 银心核球
          const r=Math.pow(rng(),1.5)*210, a=rng()*6.283, ph=Math.acos(2*rng()-1);
          x=r*Math.sin(ph)*Math.cos(a)*1.25; y=r*Math.cos(ph)*.48; z=r*Math.sin(ph)*Math.sin(a)*.85;
          c=cCore.clone().multiplyScalar(.75+rng()*.5);
        }else{
          // 2 条主旋臂 + 2 条次旋臂（与视频中恢弘发光星河旋臂一致）
          const primary=i%4<2, armIdx=primary?(i%2):(i%2+.5);
          const r=140+Math.pow(rng(),.82)*1020;
          const twist=Math.log(r/110)*2.65;
          const spread=(primary?26:48)+r*.045;
          const ang=armIdx*Math.PI+twist+(rng()-.5)*(spread/Math.max(120,r))*2.8;
          x=Math.cos(ang)*r; z=-Math.sin(ang)*r;
          y=(rng()-.5)*(18+55*Math.exp(-r/320));
          const t=Math.min(1,(r-140)/980);
          c=cCore.clone().lerp(cArm,Math.min(1,t*1.6)).lerp(cOuter,Math.max(0,t-.5)*1.5);
          if(i%37===0)c.copy(cPink);
          c.multiplyScalar(primary?(.62+rng()*.58):(.35+rng()*.45));
        }
        pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
        c.toArray(col,i*3);
      }
      const geo=new THREE.BufferGeometry();
      geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
      geo.setAttribute('color',new THREE.BufferAttribute(col,3));
      const stars=glowPoints(geo,mobile?7.5:9.5,.92);
      stars.frustumCulled=false;
      grp.add(stars);
      // 人马座 A* 炽热金色银心辉光
      const coreGlow1=glowSprite(0xfff1c4,360,.95), coreGlow2=glowSprite(0xffa938,720,.46);
      grp.add(coreGlow1,coreGlow2);
      // 太阳系 2.25 亿年银河公转轨道参考细环（半径 GAL_R）+ 360° 淡金编织螺旋轨
      const ringPts=[];for(let i=0;i<=256;i++){const a=i/256*Math.PI*2;ringPts.push(new THREE.Vector3(Math.cos(a)*GAL_R,0,-Math.sin(a)*GAL_R));}
      const galRing=makeLine(ringPts,0xffc970,.24);
      grp.add(galRing);
      const fullHelixPts=[];
      for(let i=0;i<=720;i++){const f=i/720,a=f*Math.PI*2,ph=f*Math.PI*2*56,rad=58;const cx=Math.cos(a)*GAL_R,cz=-Math.sin(a)*GAL_R,rx=Math.cos(a),rz=-Math.sin(a);fullHelixPts.push(new THREE.Vector3(cx+rx*Math.cos(ph)*rad,Math.sin(ph)*rad*.9,cz+rz*Math.cos(ph)*rad));}
      const galFullHelix=makeLine(fullHelixPts,0xfbbf24,.36);
      grp.add(galFullHelix);
      // 银河年全景可见的巨型编织螺旋光带（太阳系身后绵延的 160° 银道螺旋尾迹）
      const ribN=512, ribGeo=new THREE.BufferGeometry();
      ribGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(ribN*3),3));
      const ribCol=new Float32Array(ribN*3), rc=new THREE.Color(0xffbe6b);
      for(let i=0;i<ribN;i++)rc.clone().multiplyScalar(.08+.92*Math.pow(i/(ribN-1),1.4)).toArray(ribCol,i*3);
      ribGeo.setAttribute('color',new THREE.BufferAttribute(ribCol,3));
      const ribbon=new THREE.Line(ribGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.82,blending:THREE.AdditiveBlending,depthWrite:false}));
      ribbon.frustumCulled=false;
      grp.add(ribbon);
      motion.galacticRibbon=ribbon;
      motion.sgrALabel=new THREE.Object3D();motion.sgrALabel.position.set(0,95,0);grp.add(motion.sgrALabel);
      grp.userData={stars,core:coreGlow1,halo:coreGlow2,coreGlow1,coreGlow2,galRing,galFullHelix};
      scaleGroups.L1.add(grp);
      return grp;
    }

    function buildParallaxField(key,boxSize,starCount,streakCount,streakLen,seed,tintA,tintB) {
      const rng=deterministicRandom(seed),group=new THREE.Group();
      const base=new Float32Array(starCount*3),pos=new Float32Array(starCount*3),col=new Float32Array(starCount*3),cA=new THREE.Color(tintA),cB=new THREE.Color(tintB);
      for(let i=0;i<starCount;i++){
        const x=(rng()-.5)*boxSize,y=(rng()-.5)*boxSize,z=(rng()-.5)*boxSize;
        base[i*3]=pos[i*3]=x;base[i*3+1]=pos[i*3+1]=y;base[i*3+2]=pos[i*3+2]=z;
        cA.clone().lerp(cB,rng()).multiplyScalar(.45+rng()*.7).toArray(col,i*3);
      }
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
      const stars=glowPoints(geo,key==='L0'?1.35:2.2,.82);stars.frustumCulled=false;group.add(stars);
      let streaks=null,streakBase=null;
      if(streakCount>0){
        streakBase=new Float32Array(streakCount*3);const sPos=new Float32Array(streakCount*6),sCol=new Float32Array(streakCount*6);
        for(let i=0;i<streakCount;i++){
          const x=(rng()-.5)*boxSize,y=(rng()-.5)*boxSize,z=(rng()-.5)*boxSize;
          streakBase[i*3]=x;streakBase[i*3+1]=y;streakBase[i*3+2]=z;
          const c=cA.clone().lerp(cB,rng());
          c.clone().multiplyScalar(.72).toArray(sCol,i*6);c.clone().multiplyScalar(.04).toArray(sCol,i*6+3);
        }
        const sGeo=new THREE.BufferGeometry();sGeo.setAttribute('position',new THREE.BufferAttribute(sPos,3));sGeo.setAttribute('color',new THREE.BufferAttribute(sCol,3));
        streaks=new THREE.LineSegments(sGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false}));
        streaks.frustumCulled=false;group.add(streaks);
      }
      scaleGroups[key].add(group);
      return {group,stars,base,streaks,streakBase,boxSize,streakLen,starCount,streakCount};
    }
    function updateParallaxField(field,center,velDir,visible) {
      if(!field)return;
      field.group.visible=visible;
      if(!visible)return;
      const half=field.boxSize*.5,wrap=(v,c)=>{let d=((v-c)%field.boxSize+field.boxSize)%field.boxSize;return d>half?c+d-field.boxSize:c+d;};
      const pAttr=field.stars.geometry.attributes.position,base=field.base;
      for(let i=0;i<field.starCount;i++){
        pAttr.setXYZ(i,wrap(base[i*3],center.x),wrap(base[i*3+1],center.y),wrap(base[i*3+2],center.z));
      }
      pAttr.needsUpdate=true;
      if(field.streaks){
        const sAttr=field.streaks.geometry.attributes.position,sb=field.streakBase,L=field.streakLen;
        for(let i=0;i<field.streakCount;i++){
          const x=wrap(sb[i*3],center.x),y=wrap(sb[i*3+1],center.y),z=wrap(sb[i*3+2],center.z);
          sAttr.setXYZ(i*2,x,y,z);
          sAttr.setXYZ(i*2+1,x-velDir.x*L,y-velDir.y*L,z-velDir.z*L);
        }
        sAttr.needsUpdate=true;
      }
    }
    function buildHeliosphereBowShock() {
      const grp=new THREE.Group();
      const mat=new THREE.ShaderMaterial({
        vertexShader:`varying vec3 vN,vV,vP;void main(){vP=normalize(position);vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
        fragmentShader:`varying vec3 vN,vV,vP;uniform float uTime,uVfx;void main(){float front=smoothstep(.42,.95,vP.y);float edge=pow(1.-abs(dot(vN,vV)),6.2);float arc=exp(-pow((vP.y-.58)/.04,2.))*.09;float ripple=.88+.12*sin(vP.y*30.-uTime*2.8);float a=front*(edge*.15+arc)*ripple*uVfx;if(a<.006)discard;vec3 col=mix(vec3(.32,.72,1.),vec3(.88,.96,1.),edge);gl_FragColor=vec4(col,min(.55,a*.35));}`,
        uniforms:{uTime:{value:0},uVfx:{value:1}},transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending
      });
      const dome=new THREE.Mesh(new THREE.SphereGeometry(225,48,28,0,Math.PI*2,0,Math.PI*.38),mat);
      dome.scale.set(1.02,.56,1.02);
      grp.add(dome);
      // 在 L1 本地坐标系中，太阳前进切向 T = (0, sin60°, -cos60°)
      const localForward=new THREE.Vector3(0,Math.sin(ECLIPTIC_TILT),-Math.cos(ECLIPTIC_TILT)).normalize();
      grp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),localForward);
      grp.userData.mat=mat;
      return grp;
    }

    function solarSample(t,states=motion.solar){return {t,p:states.map(b=>b.p.clone())};}
    function initSolarPhysics() {
      const bodies=celestialBodies.filter(b=>b.scaleKey==='L1'&&b.id!=='moon');
      motion.solar=bodies.map(body=>{
        if(body.id==='sun')return {id:'sun',body,mass:1,p:new THREE.Vector3(),v:new THREE.Vector3()};
        const [a,e,mass,inclination]=SOLAR_ELEMENTS[body.id],orbit={a,e,inclination:inclination*Math.PI/180,argument:body.orbit.argument};
        const p=orbitPoint(orbit,body.orbit.mean),v=orbitalVelocity(orbit,body.orbit.mean,SOLAR_GM);
        return {id:body.id,body,mass,p,v,orbit,initialMean:body.orbit.mean};
      });
      // 为八大行星增添电影级柔光晕轮，让太阳系在深空中色彩鲜明如宝石
      motion.solar.forEach(b=>{
        if(b.id!=='sun'){
          const halo=glowSprite(PLANET_TRAIL_COLORS[b.id]||0x93c5fd,b.body.radius*4.4,.42);
          b.body.meshGroup.add(halo);
          motion.planetHalos.push(halo);
        }
      });
      const center=new THREE.Vector3(),velocity=new THREE.Vector3(),mass=motion.solar.reduce((s,b)=>s+b.mass,0);
      motion.solar.forEach(b=>{center.addScaledVector(b.p,b.mass/mass);velocity.addScaledVector(b.v,b.mass/mass);});
      motion.solar.forEach(b=>{b.p.sub(center);b.v.sub(velocity);b.initialP=b.p.clone();b.initialV=b.v.clone();b.body.physical=b;});
      seedSolarHistory();renderSolarState();
    }
    function orbitMeanFromPos(orbit, pos) {
      const c = Math.cos(orbit.argument), s = Math.sin(orbit.argument);
      const uProj = pos.y * Math.sin(orbit.inclination) + pos.z * Math.cos(orbit.inclination);
      const x = pos.x * c + uProj * s;
      const z = -pos.x * s + uProj * c;
      const bSemi = orbit.a * Math.sqrt(Math.max(1e-6, 1 - orbit.e * orbit.e));
      const E = Math.atan2(z / bSemi, x / orbit.a + orbit.e);
      return E - orbit.e * Math.sin(E);
    }

    function seedSolarHistory() {
      const span=Math.min(10,motion.historyYears),copy=motion.solar.map(b=>({id:b.id,mass:b.mass,p:b.p.clone(),v:b.v.clone()})),samples=[solarSample(motion.years,copy)],steps=140,interval=span/steps;
      for(let i=1;i<=steps;i++){const n=Math.max(1,Math.min(14,Math.ceil(interval*365.25))),h=-interval/n;for(let k=0;k<n;k++)gravitationalStep(copy,h,SOLAR_GM*dynamics.gravity,motion.nbody);samples.push(solarSample(motion.years-i*interval,copy));}
      motion.histories=samples.reverse();motion.lastHistory=motion.years;
      motion.solar.forEach(b=>{b.historyLine ||= makeHistoryLine('L1',PLANET_TRAIL_COLORS[b.id]||TRAJECTORY_COLOR,b.id==='earth'?.96:b.id==='sun'?.88:.82,420);});
      renderSolarHistory();
    }
    function renderSolarState() {
      const sun=motion.solar[0],root=simulationRoot('L1'),ext=motion.frame==='external';
      const reflex=ext?sun.p.clone().multiplyScalar(46):new THREE.Vector3();
      const gf=galacticFrameAt(motion.years);
      if(ext){root.position.copy(gf.pos);root.quaternion.copy(gf.quat);}
      else{root.position.set(0,0,0);root.quaternion.identity();}
      if(motion.milkyWayL1){
        motion.milkyWayL1.visible=ext;
        const wideView=ext&&(motion.galacticOverview||camera.position.distanceTo(gf.pos)>980);
        if(motion.milkyWayL1.userData?.galFullHelix)motion.milkyWayL1.userData.galFullHelix.visible=wideView&&dynamics.trails;
        if(motion.galacticRibbon)motion.galacticRibbon.visible=wideView&&dynamics.trails;
      }
      if(motion.forwardArrow)motion.forwardArrow.visible=ext;
      if(motion.bowShock)motion.bowShock.visible=ext&&motion.stream&&!motion.galacticOverview;
      if(motion.kuiperBelt)motion.kuiperBelt.visible=!ext||motion.guides;
      if(sunCoronaSprite)sunCoronaSprite.position.copy(reflex);if(sunPointLight)sunPointLight.position.copy(reflex);
      motion.solar.forEach(b=>{
        if(b.id==='sun')b.body.meshGroup.position.copy(reflex);
        else{b.body.meshGroup.position.copy(mapSolarAU(b.p.clone().sub(sun.p))).add(reflex);b.body.orbit.mean=b.initialMean+motion.years*Math.sqrt(SOLAR_GM/Math.pow(b.orbit.a,3));}
        if(b.body.orbit){b.body.orbitPath.visible=dynamics.trails&&motion.guides;b.body.orbitWake.visible=false;b.body.gravityArrow.position.copy(b.body.meshGroup.position);b.body.gravityArrow.setDirection(reflex.clone().sub(b.body.meshGroup.position).normalize());b.body.gravityArrow.visible=dynamics.vectors;}
      });
      const moon=celestialBodies.find(b=>b.scaleKey==='L1'&&b.id==='moon');
      if(moon){moon.orbit.mean=moon.orbit.initialMean+motion.years*365.25/27.32166*Math.PI*2;orbitPoint(moon.orbit,moon.orbit.mean,moon.meshGroup.position);moon.mesh.rotation.y=-Math.atan2(moon.meshGroup.position.z,moon.meshGroup.position.x);moon.orbitPath.visible=motion.guides&&dynamics.trails;moon.orbitWake.visible=false;}
      root.updateWorldMatrix(true,true);
      const sunWorld=l1Sun.mesh.getWorldPosition(new THREE.Vector3());
      celestialBodies.filter(b=>b.scaleKey==='L1').forEach(b=>{b.uniforms.uSunPos.value.copy(sunWorld);if(b.cloudsMesh)b.cloudsMesh.material.uniforms.uSunPos.value.copy(sunWorld);if(b.atmoMesh)b.atmoMesh.material.uniforms.uSunPos.value.copy(sunWorld);});
      updateParallaxField(motion.parallax.L1,gf.pos,gf.T,ext&&motion.stream&&!motion.galacticOverview);
    }
    function renderSolarHistory() {
      if(!motion.solar.length)return;
      const sunNow=motion.solar[0],scaleFactor=motion.historyYears/12,N=420,ext=motion.frame==='external';
      const samples=motion.histories.concat(solarSample(motion.years));
      // 更新银河年大尺度编织光带（远景/银河年全景下沿太阳身后 150° 银道圆弧延伸）
      if(motion.galacticRibbon&&motion.galacticRibbon.visible){
        if(ext&&dynamics.trails){
          const rAttr=motion.galacticRibbon.geometry.attributes.position, rn=rAttr.count, arcSpan=2.65/GAL_OMEGA;
          for(let i=0;i<rn;i++){
            const u=i/(rn-1), t=motion.years-(1-u)*arcSpan;
            galacticFrameInto(t,_gfPos,_gfEx,_gfEy,_gfEz);
            const swirl=t*3.8, rad=32*(1-u*.15), cs=Math.cos(swirl)*rad, ss=Math.sin(swirl)*rad;
            rAttr.setXYZ(i,_gfPos.x+_gfEx.x*cs+_gfEz.x*ss,_gfPos.y+_gfEx.y*cs+_gfEz.y*ss,_gfPos.z+_gfEx.z*cs+_gfEz.z*ss);
          }
          rAttr.needsUpdate=true;
        }
      }
      motion.solar.forEach((b,index)=>{
        const attr=b.historyLine.geometry.attributes.position;
        if(ext&&b.orbit){
          // 沿弯曲银河公转大圆实时绘制丝滑高精度 3D 螺旋轨道（以实测日心相位对齐，永不漂移歪斜）
          const span=(PLANET_HELIX_SPAN[b.id]||12)*Math.max(.35,scaleFactor);
          const omega=Math.sqrt(SOLAR_GM*Math.max(0.05,dynamics.gravity)/Math.pow(b.orbit.a,3));
          _tmpRel.copy(b.p).sub(sunNow.p);
          const curMean=orbitMeanFromPos(b.orbit,_tmpRel);
          mapSolarAU(_tmpRel,_tmpExact);
          mapSolarAU(orbitPoint(b.orbit,curMean,_tmpOrbit),_tmpKepler);
          _tmpOff.copy(_tmpExact).sub(_tmpKepler);
          for(let i=0;i<N;i++){
            const u=i/(N-1),dtBack=(1-u)*span,t=motion.years-dtBack;
            galacticFrameInto(t,_gfPos,_gfEx,_gfEy,_gfEz);
            mapSolarAU(orbitPoint(b.orbit,curMean-omega*dtBack,_tmpOrbit),_tmpLocal).addScaledVector(_tmpOff,u);
            attr.setXYZ(
              i,
              _gfPos.x+_gfEx.x*_tmpLocal.x+_gfEy.x*_tmpLocal.y+_gfEz.x*_tmpLocal.z,
              _gfPos.y+_gfEx.y*_tmpLocal.x+_gfEy.y*_tmpLocal.y+_gfEz.y*_tmpLocal.z,
              _gfPos.z+_gfEx.z*_tmpLocal.x+_gfEy.z*_tmpLocal.y+_gfEz.z*_tmpLocal.z
            );
          }
          attr.needsUpdate=true;b.historyLine.geometry.setDrawRange(0,N);b.historyLine.visible=dynamics.trails;
          return;
        }
        if(ext&&b.id==='sun'){
          const span=36*Math.max(.4,scaleFactor);
          for(let i=0;i<N;i++){
            const u=i/(N-1), t=motion.years-(1-u)*span;
            galacticFrameInto(t,_gfPos,_gfEx,_gfEy,_gfEz);
            attr.setXYZ(i,_gfPos.x,_gfPos.y,_gfPos.z);
          }
          attr.needsUpdate=true;b.historyLine.geometry.setDrawRange(0,N);b.historyLine.visible=dynamics.trails;
          return;
        }
        const wantSpan=Math.min(Math.max(.8,(PLANET_HELIX_SPAN[b.id]||3)*Math.max(.4,scaleFactor)),Math.max(1,motion.years-(samples[0]?.t??motion.years)));
        const startT=motion.years-wantSpan;
        let firstIdx=0;while(firstIdx<samples.length-2&&samples[firstIdx].t<startT)firstIdx++;
        const slice=samples.slice(firstIdx),count=Math.min(N,slice.length);
        for(let i=0;i<count;i++){
          const s=slice[Math.min(slice.length-1,Math.floor(i*(slice.length-1)/Math.max(1,count-1)))],sun=s.p[0];
          if(b.id==='sun'){_tmpLocal.set(0,0,0);}else{_tmpRel.copy(s.p[index]).sub(sun);mapSolarAU(_tmpRel,_tmpLocal);}
          attr.setXYZ(i,_tmpLocal.x,_tmpLocal.y,_tmpLocal.z);
        }
        attr.needsUpdate=true;b.historyLine.geometry.setDrawRange(0,count);b.historyLine.visible=dynamics.trails&&b.id!=='sun';
      });
    }
    function physicalMomentum(){const out=new THREE.Vector3();motion.solar.forEach(b=>out.addScaledVector(b.v,b.mass));return out;}
    function advanceSolar(dt) {
      const years=dt*(motion.labClock?80/YEAR_SECONDS:motion.daysPerSecond/365.25),n=Math.max(1,Math.ceil(years*365.25*2)),h=years/n;
      for(let i=0;i<n;i++)gravitationalStep(motion.solar,h,SOLAR_GM*dynamics.gravity,motion.nbody);
      motion.years+=years;
      if(motion.bowShock?.userData?.mat)motion.bowShock.userData.mat.uniforms.uTime.value=dynamics.time;
      if(motion.milkyWayL1?.userData?.stars)motion.milkyWayL1.userData.stars.rotation.y=motion.years*GAL_OMEGA*.22;
      const histSpan=Math.min(10,motion.historyYears);
      if(motion.years-motion.lastHistory>=histSpan/260){motion.histories.push(solarSample(motion.years));while(motion.histories.length>340||motion.histories[0].t<motion.years-histSpan)motion.histories.shift();motion.lastHistory=motion.years;}
      renderSolarState();renderSolarHistory();
    }
    function lunarPositionAt(days,bodyId) {
      const o={a:34,e:.0549,inclination:5.14*Math.PI/180,argument:.3},mean=.65+days/27.32166*Math.PI*2,rel=orbitPoint(o,mean);
      return bodyId==='earth'?rel.multiplyScalar(-.01215):rel.multiplyScalar(.98785);
    }
    function renderLunar(dt) {
      motion.lunarDays+=dt*(motion.labClock?80/86400:4.5);
      const y=motion.lunarDays/365.25,posNow=travelAt(y,'L0'),posNext=travelAt(y+0.002,'L0'),velDir=posNext.sub(posNow).normalize();
      simulationRoot('L0').position.copy(posNow);
      l0Earth.meshGroup.position.copy(lunarPositionAt(motion.lunarDays,'earth'));l0Moon.meshGroup.position.copy(lunarPositionAt(motion.lunarDays,'moon'));
      l0Moon.orbit.mean=.65+motion.lunarDays/27.32166*Math.PI*2;l0Moon.mesh.rotation.y=-Math.atan2(l0Moon.meshGroup.position.z,l0Moon.meshGroup.position.x);
      l0Moon.orbitPath.visible=dynamics.trails&&motion.guides;l0Moon.orbitWake.visible=false;
      for(const body of [l0Earth,l0Moon]){
        const attr=body.historyLine.geometry.attributes.position;for(let i=0;i<240;i++){const day=motion.lunarDays-78*(239-i)/239,pos=lunarPositionAt(day,body.id);pos.add(travelAt(day/365.25,'L0'));attr.setXYZ(i,pos.x,pos.y,pos.z);}attr.needsUpdate=true;body.historyLine.geometry.setDrawRange(0,240);body.historyLine.visible=dynamics.trails&&(motion.frame==='external'||body.id==='moon');
      }
      simulationRoot('L0').updateWorldMatrix(true,true);
      const sunLocal=motion.l0SunLocal||new THREE.Vector3(160,45,90);
      const sun=simulationToWorld(sunLocal,'L0');[l0Earth,l0Moon].forEach(b=>{b.uniforms.uSunPos.value.copy(sun);if(b.cloudsMesh)b.cloudsMesh.material.uniforms.uSunPos.value.copy(sun);if(b.atmoMesh)b.atmoMesh.material.uniforms.uSunPos.value.copy(sun);});
      updateParallaxField(motion.parallax.L0,posNow,velDir.lengthSq()?velDir:GALACTIC_DIRECTION,motion.frame==='external'&&motion.stream);
    }
    function frameCenter(key=state.currentScale){return motion.roots[key]?.position.clone()||new THREE.Vector3();}
    function l1VortexCamera(gf=galacticFrameAt(motion.years)) {
      const k=innerWidth<innerHeight?Math.min(1.65,1/Math.sqrt(innerWidth/innerHeight)*1.08):1;
      const cam=gf.pos.clone().addScaledVector(gf.R,265*k).addScaledVector(gf.T,-315*k).addScaledVector(gf.U,188*k);
      const look=gf.pos.clone().addScaledVector(gf.R,-22).addScaledVector(gf.T,-42).addScaledVector(gf.U,10);
      return {cam,look};
    }
    function frameOverview() {
      state.lockedBody=null;lockRingGroup.visible=false;document.getElementById('btn-unlock-cam').classList.add('hidden');
      motion.l0SunLocal=null;motion.galacticOverview=false;
      if(l0Earth?.cloudsMesh)l0Earth.cloudsMesh.material.uniforms.uOpacity.value=Math.max(0,l0Earth.atmoPct/100);
      const key=state.currentScale,center=frameCenter(key);
      if(key==='L1'&&motion.frame==='external'){
        const {cam,look}=l1VortexCamera();
        startCamTransition(cam,look);
      }else if(key==='L0'&&motion.frame==='external')startCamTransition(center.clone().add(fittedCameraPosition([100,120,265])),center.clone().add(new THREE.Vector3(-32,-24,-20)));
      else{const meta=SCALE_META[key];startCamTransition(center.clone().add(fittedCameraPosition(meta.camPos)),center.clone().add(new THREE.Vector3(...meta.target)));}
    }
    function setReferenceFrame(frame) {
      const old=frameCenter();motion.frame=frame;motion.galacticOverview=false;
      renderSolarState();renderSolarHistory();renderLunar(0);simulationRoot('L5').scale.setScalar(frame==='external'?motion.webScale:1);
      const delta=frameCenter().sub(old);camera.position.add(delta);controls.target.add(delta);if(state.lockedBody)state.lockedBody.mesh.getWorldPosition(state.lastTrackedWorldPos);
      syncMotionUI();updateSceneGuide();frameOverview();
    }
    function initMotion() {
      for(const key of ['L0','L1','L5']){const root=new THREE.Group();const group=scaleGroups[key];[...group.children].forEach(child=>root.add(child));group.add(root);motion.roots[key]=root;}
      // 记录 L1 柯伊伯带引用以便在银河螺旋视图中保持背景澄澈
      motion.kuiperBelt=simulationRoot('L1').children.find(c=>c.isPoints&&c.userData?.rotSpeed);
      if(motion.kuiperBelt)motion.kuiperBelt.material.opacity=.28;
      const mobile=document.body.dataset.layout==='mobile';
      motion.milkyWayL1=buildL1MilkyWay();
      motion.parallax.L1=buildParallaxField('L1',1200,mobile?700:1400,mobile?90:180,30,401,0x93c5fd,0xfef08a);
      motion.parallax.L0=buildParallaxField('L0',680,mobile?600:1200,mobile?80:160,18,402,0x7dd3fc,0xe2e8f0);
      motion.parallax.L3=buildParallaxField('L3',520,mobile?400:800,mobile?60:110,14,403,0x93c5fd,0xd8b4fe);
      motion.bowShock=buildHeliosphereBowShock();simulationRoot('L1').add(motion.bowShock);
      initSolarPhysics();
      const localForward=new THREE.Vector3(0,Math.sin(ECLIPTIC_TILT),-Math.cos(ECLIPTIC_TILT)).normalize();
      motion.forwardArrow=new THREE.ArrowHelper(localForward,new THREE.Vector3(),95,0xffe49c,9,4);simulationRoot('L1').add(motion.forwardArrow);
      motion.forwardLabel=new THREE.Object3D();motion.forwardLabel.position.copy(localForward).multiplyScalar(108);simulationRoot('L1').add(motion.forwardLabel);
      l0Earth.historyLine=makeHistoryLine('L0',0x38bdf8,.88,240);l0Moon.historyLine=makeHistoryLine('L0',0xfbbf24,.92,240);
      const bary=new THREE.Mesh(new THREE.RingGeometry(1.1,1.55,32),new THREE.MeshBasicMaterial({color:0xfbbf24,side:THREE.DoubleSide,transparent:true,opacity:.6}));bary.rotation.x=-Math.PI/2;simulationRoot('L0').add(bary);
      renderLunar(0);
      const webRings=new THREE.Group();for(const r of [90,145]){const ring=new THREE.Mesh(new THREE.RingGeometry(r,r+.7,96),new THREE.MeshBasicMaterial({color:0x60a5fa,transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;webRings.add(ring);}simulationRoot('L5').add(webRings);motion.webGrid=webRings;
      webTails.forEach(t=>{scaleGroups.L5.add(t.line);t.scaleHistory=Array(t.history.length).fill(1);});
      clusterNodes.forEach((n,i)=>{n.initialCenter=n.center.clone();n.velocity=n.center.clone().negate().normalize().multiplyScalar(i?1.35:0).add(new THREE.Vector3(-n.center.z,0,n.center.x).normalize().multiplyScalar(i?.72:0));n.initialVelocity=n.velocity.clone();n.history=Array.from({length:120},()=>n.center.clone());n.line=makeHistoryLine('L4',0x38bdf8,.56,120);});
      const momentum=new THREE.Vector3();clusterNodes.slice(1).forEach(n=>momentum.addScaledVector(n.velocity,n.mass));clusterNodes[0].velocity.copy(momentum).multiplyScalar(-1/clusterNodes[0].mass);clusterNodes[0].initialVelocity.copy(clusterNodes[0].velocity);
      scaleGroups.L4.children.forEach(o=>{if(o.isPoints&&o!==clusterFlow){o.userData.clusterBackground=true;o.userData.basePositions=o.geometry.attributes.position.array.slice();}if(o.isSprite){let nearest=0,min=Infinity;clusterNodes.forEach((n,i)=>{const d=o.position.distanceTo(n.center);if(d<min){min=d;nearest=i;}});o.userData.clusterNode=nearest;o.userData.initialPosition=o.position.clone();}});
      const paths=dynamics.paths.L4;if(paths)[...paths.children].filter(o=>!clusterTails.some(t=>t.line===o)).forEach(disposeTree);
      motion.blackTrails=Array.from({length:24},(_,i)=>({index:i*11,history:Array.from({length:80},()=>new THREE.Vector3()),line:makeHistoryLine('L2',i%3?0xffb85c:0x7dd3fc,.68,80)}));
      motion.phase.L2=motion.phase.L3=0;
    }
    function updateClusterCenters(dt) {
      if(dt>0){const states=clusterNodes.map((n,i)=>({id:String(i),mass:n.mass,p:n.center,v:n.velocity})),steps=Math.max(1,Math.ceil(dt*60));for(let i=0;i<steps;i++)gravitationalStep(states,dt/steps,115*dynamics.gravity,true,144);}
      clusterNodes.forEach(n=>{if(dt>0){n.history.shift();n.history.push(n.center.clone());}const a=n.line.geometry.attributes.position;n.history.forEach((p,i)=>a.setXYZ(i,p.x,p.y,p.z));a.needsUpdate=true;n.line.visible=dynamics.trails;});
      dynamics.forces.L4?.children.forEach((arrow,i)=>{const node=clusterNodes[i+1];if(node&&arrow.setDirection){arrow.position.copy(node.center);arrow.setDirection(clusterNodes[0].center.clone().sub(node.center).normalize());}});
      const deltas=clusterNodes.map(n=>n.center.clone().sub(n.initialCenter));
      scaleGroups.L4.children.forEach(o=>{if(o.userData.clusterBackground){const a=o.geometry.attributes.position,base=o.userData.basePositions;for(let i=0;i<a.count;i++){const d=deltas[i%8];a.setXYZ(i,base[i*3]+d.x,base[i*3+1]+d.y,base[i*3+2]+d.z);}a.needsUpdate=true;}if(o.userData.clusterNode!==undefined){const n=clusterNodes[o.userData.clusterNode];o.position.copy(o.userData.initialPosition).add(n.center).sub(n.initialCenter);}});
    }
    function advanceCosmology(dt) {
      const gyr=dt*.22;motion.webGyr+=gyr;const H0=.0716,a=motion.webScale;
      const adot=x=>H0*x*Math.sqrt(.315/Math.pow(x,3)+.685);motion.webScale+=gyr*adot(a+.5*gyr*adot(a));
      const display=motion.frame==='external'?motion.webScale:1;simulationRoot('L5').scale.setScalar(display);
      simulationRoot('L5').children.forEach(o=>{if(o.isSprite){o.userData.baseScale ||= o.scale.clone();o.scale.copy(o.userData.baseScale).multiplyScalar(1/display);}});
    }
    function updateWebTail(t) {
      const p=webParticles[t.index].edge.curve.getPoint(webParticles[t.index].t);t.history.shift();t.history.push(p);t.scaleHistory.shift();t.scaleHistory.push(motion.webScale);
      const a=t.line.geometry.attributes.position;t.history.forEach((p,i)=>{const k=motion.frame==='external'?t.scaleHistory[i]:1;a.setXYZ(i,p.x*k,p.y*k,p.z*k);});a.needsUpdate=true;t.line.geometry.computeBoundingSphere();
    }
    function recordBlackHoleTrails(dt) {
      if(!motion.blackTrails)return;const attr=bhDust.geometry.attributes.position;
      motion.blackTrails.forEach(t=>{const p=new THREE.Vector3().fromBufferAttribute(attr,t.index);if(dt>0){if(!t.started){t.history.forEach(q=>q.copy(p));t.started=true;}t.history.shift();t.history.push(p);}const a=t.line.geometry.attributes.position;t.history.forEach((q,i)=>a.setXYZ(i,q.x,q.y,q.z));a.needsUpdate=true;t.line.visible=dynamics.trails;});
    }
    function updateProbeHistory(p,dt) {
      if(p.sample>.04){p.sample=0;p.history.shift();p.history.push(p.position.clone());p.historyTime.shift();p.historyTime.push(p.key==='L0'?motion.lunarDays/365.25:motion.years);p.historyScale.shift();p.historyScale.push(motion.webScale);}
      const attr=p.line.geometry.attributes.position;p.history.forEach((v,i)=>{let q=v.clone();if(motion.frame==='external'&&p.key==='L1'){const gf=galacticFrameAt(p.historyTime[i]);q=gf.pos.clone().addScaledVector(gf.Ex,v.x).addScaledVector(gf.Ey,v.y).addScaledVector(gf.Ez,v.z);}else if(motion.frame==='external'&&p.key==='L0')q.add(travelAt(p.historyTime[i],'L0'));if(motion.frame==='external'&&p.key==='L5')q.multiplyScalar(p.historyScale[i]);attr.setXYZ(i,q.x,q.y,q.z);});attr.needsUpdate=true;p.line.geometry.computeBoundingSphere();
    }
    function updateMotion(dt) {
      motion.labClock=typeof lab!=='undefined'&&(lab.projectiles.length>0||lab.effects.length>0||(typeof monsterLab!=='undefined'&&monsterLab.active.length>0)||activeExoticEffects.some(e=>['dyson','singularity','vacuum'].includes(e.type)));
      const key=state.currentScale,old=frameCenter(key),oldTheta=motion.years*GAL_OMEGA;
      if(key==='L1')advanceSolar(dt);if(key==='L0')renderLunar(dt);if(key==='L4')updateClusterCenters(dt);if(key==='L5')advanceCosmology(dt);
      if(key==='L3'){const drift=new THREE.Vector3(motion.phase.L3*22,motion.phase.L3*7,-motion.phase.L3*11);updateParallaxField(motion.parallax.L3,drift,new THREE.Vector3(.85,.27,-.43),motion.stream);}
      if(key==='L1'&&motion.frame==='external'){
        const farFromSun=camera.position.distanceTo(frameCenter('L1'))>980;
        if(motion.follow&&!state.lockedBody&&!motion.galacticOverview&&!farFromSun){
          const dTheta=motion.years*GAL_OMEGA-oldTheta, yAxis=new THREE.Vector3(0,1,0);
          camera.position.applyAxisAngle(yAxis,dTheta);controls.target.applyAxisAngle(yAxis,dTheta);
          if(state.camTransition)for(const field of ['startPos','endPos','startLook','endLook'])state.camTransition[field].applyAxisAngle(yAxis,dTheta);
        }
      }else{
        const delta=frameCenter(key).sub(old);
        if(motion.follow&&!state.lockedBody){camera.position.add(delta);controls.target.add(delta);if(state.camTransition)for(const field of ['startPos','endPos','startLook','endLook'])state.camTransition[field].add(delta);}
      }
    }
    function resetMotion() {
      motion.years=motion.lunarDays=0;motion.phase.L2=motion.phase.L3=0;motion.webScale=1;motion.webGyr=0;motion.galacticOverview=false;
      motion.blackTrails?.forEach(t=>{t.started=false;t.history.forEach(p=>p.set(0,0,0));});
      motion.solar.forEach(b=>{b.p.copy(b.initialP);b.v.copy(b.initialV);});seedSolarHistory();renderSolarState();renderLunar(0);simulationRoot('L5').scale.setScalar(1);
      clusterNodes.forEach(n=>{n.center.copy(n.initialCenter);n.velocity.copy(n.initialVelocity);n.history.forEach(p=>p.copy(n.center));});webTails.forEach(t=>t.scaleHistory.fill(1));updateClusterCenters(0);frameOverview();
    }
    function syncMotionUI() {
      const supported=['L0','L1','L5'].includes(state.currentScale);
      document.querySelectorAll('[data-reference]').forEach(b=>{b.disabled=!supported;b.setAttribute('aria-pressed',String(b.dataset.reference===motion.frame));});
      document.getElementById('transport-frame').disabled=!supported;
      document.getElementById('transport-frame').textContent=supported?(motion.frame==='external'?'银河/外部参考':'日心/共动参考'):({L2:'黑洞参考',L3:'星系参考',L4:'团质心'})[state.currentScale]||'地表参考';
      document.getElementById('motion-nbody').checked=motion.nbody;document.getElementById('motion-follow').checked=motion.follow;document.getElementById('motion-guides').checked=motion.guides;
      const streamCb=document.getElementById('motion-stream');if(streamCb)streamCb.checked=motion.stream;
      const explanations={L0:'外部参考显示地月系绕共同质心旋转并沿绕日轨道穿行太阳风与深空视差星场；跟随参考显示地月相对运动。',L1:'银河参考展示太阳系以约 230 km/s（82.8 万 km/h）绕银心人马座 A* 公转、黄道面倾角 60° 拖曳八大行星三维螺旋穿行的真实宇宙图景；点击“银河年全景”可鸟瞰整座银河公转大圆。',L2:'黑洞观测采用黑洞局部参考系；24 条吸积等离子流线沿螺旋加速落向视界，两极喷射高能相对论喷流。',L3:'星系以核区为参考：恒星与玫瑰红诞星团块差速绕核旋转，太阳位置高亮标示并带星系际穿行视差。',L4:'星系团节点在相互引力下位移，星系群与 40 条高亮物质河流沿引力势阱汇聚向巨引源。',L5:'外部参考显示物理空间随 ΛCDM 尺度因子膨胀（见参考环扩大）；共动参考固定网格尺度，突出物质沿纤维汇聚。'};
      document.getElementById('reference-explanation').textContent=explanations[state.currentScale];
      document.getElementById('motion-clock').textContent=motion.labClock?'实验时钟：80 秒 / 模拟秒':state.currentScale==='L1'?`轨道时钟：${motion.daysPerSecond} 天 / 模拟秒`:state.currentScale==='L0'?'地月时钟：4.5 天 / 模拟秒':state.currentScale==='L5'?`宇宙膨胀 a(t) = ${motion.webScale.toFixed(2)}`:'当前尺度采用独立加速时钟';
    }
    function syncMotionTrailVisibility() {
      celestialBodies.forEach(b=>{if(b.orbit&&['L0','L1'].includes(b.scaleKey)){b.orbitPath.visible=motion.guides&&dynamics.trails;b.orbitWake.visible=false;}if(b.historyLine)b.historyLine.visible=dynamics.trails;});
      for(const key of ['L2','L5'])if(dynamics.paths[key])dynamics.paths[key].visible=motion.guides&&dynamics.trails;
      galaxyTracers.forEach(t=>{t.path.visible=motion.guides&&dynamics.trails;});
    }
    function bindMotionUI() {
      document.querySelectorAll('[data-reference]').forEach(b=>b.onclick=()=>setReferenceFrame(b.dataset.reference));document.getElementById('transport-frame').onclick=()=>setReferenceFrame(motion.frame==='external'?'local':'external');
      document.getElementById('motion-nbody').onchange=e=>{motion.nbody=e.target.checked;};document.getElementById('motion-follow').onchange=e=>{motion.follow=e.target.checked;};document.getElementById('motion-guides').onchange=e=>{motion.guides=e.target.checked;renderSolarState();syncDynamicsUI();};
      const streamCb=document.getElementById('motion-stream');if(streamCb)streamCb.onchange=e=>{motion.stream=e.target.checked;renderSolarState();renderLunar(0);};
      document.getElementById('motion-days').value=motion.daysPerSecond;
      document.getElementById('motion-days').oninput=e=>{motion.daysPerSecond=+e.target.value;syncMotionUI();};document.getElementById('motion-history').onchange=e=>{motion.historyYears=+e.target.value;seedSolarHistory();};syncMotionUI();frameOverview();
    }
