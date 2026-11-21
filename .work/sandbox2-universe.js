    SB_TEMPLATES.push(
      {id:'mercury',icon:'☿',name:'水星',badge:'现实 · 岩质行星',kind:'planet',mass:SB_EARTH_M*0.0553,radius:0.85,temp:167,water:0,atmo:0,density:5.43,color:[0.65,0.62,0.58],physicalRadiusKm:2439.7,realm:'real'},
      {id:'venus',icon:'♀',name:'金星',badge:'现实 · 失控温室',kind:'planet',mass:SB_EARTH_M*0.815,radius:1.5,temp:464,water:0,atmo:4.2,density:5.24,color:[0.90,0.74,0.42],physicalRadiusKm:6051.8,realm:'real'},
      {id:'uranus',icon:'♅',name:'天王星',badge:'现实 · 冰巨星',kind:'gas',mass:SB_EARTH_M*14.536,radius:2.25,temp:-195,water:0,atmo:2.6,density:1.27,color:[0.48,0.86,0.94],physicalRadiusKm:25362,realm:'real',ring:true},
      {id:'neptune',icon:'♆',name:'海王星',badge:'现实 · 冰巨星',kind:'gas',mass:SB_EARTH_M*17.147,radius:2.2,temp:-201,water:0,atmo:2.8,density:1.64,color:[0.22,0.46,0.92],physicalRadiusKm:24622,realm:'real'},
      {id:'redgiant',icon:'⭐',name:'红巨星',badge:'现实类型 · 参数化',kind:'star',mass:120,radius:12,temp:3200,water:0,atmo:0,density:0.00001,color:[1,0.36,0.12],physicalRadiusKm:69570000,realm:'real'},
      {id:'super_earth',icon:'◉',name:'超级地球',badge:'现实类型 · 参数化',kind:'planet',mass:SB_EARTH_M*5,radius:2.4,temp:30,water:50,atmo:1.8,density:5.5,color:[0.4,0.7,0.3],physicalRadiusKm:10500,realm:'real'},
      {id:'ocean_world',icon:'🌊',name:'深海世界',badge:'科学设想 · 全球海洋',kind:'planet',mass:SB_EARTH_M*1.8,radius:2,temp:20,water:100,atmo:1.2,density:3.8,color:[0.16,0.45,0.76],physicalRadiusKm:8500,realm:'speculative'},
      {id:'rogue_world',icon:'❄️',name:'流浪冰星',badge:'现实类型 · 无恒星照明',kind:'planet',mass:SB_EARTH_M*2,radius:2,temp:-220,water:80,atmo:0.4,density:3.5,color:[0.7,0.83,0.95],physicalRadiusKm:8500,realm:'real'},
      {id:'whitehole',icon:'✧',name:'白洞',badge:'科学设想 · 只出不入',kind:'whitehole',mass:720,radius:3.1,temp:0,water:0,atmo:0,density:0,color:[0.88,0.96,1],realm:'speculative',sourceNote:'广义相对论时间反演解的概念演示，尚无观测证据。喷流为视觉示意。'},
      {id:'darkmatter',icon:'◌',name:'暗物质晕',badge:'推断存在 · 分布引力模型',kind:'darkmatter',mass:2400,radius:24,temp:0,water:0,atmo:0,density:0,color:[0.36,0.5,0.86],realm:'speculative',sourceNote:'暗物质由引力证据推断，晕的轮廓是辅助显示，不是可见物质。'},
      {id:'nebula',icon:'☁',name:'分子星云',badge:'现实类型 · 气体云示意',kind:'nebula',mass:60,radius:12,temp:-240,water:0,atmo:0,density:0,color:[0.6,0.4,0.75],realm:'real'},
      {id:'crystal_world',icon:'💎',name:'晶体星球',badge:'原创想象 · 晶体地壳',kind:'planet',mass:SB_EARTH_M*3,radius:2.2,temp:-30,water:10,atmo:0.6,density:6,color:[0.57,0.35,0.83],physicalRadiusKm:9000,realm:'fiction'},
      {id:'ember_world',icon:'🌋',name:'永燃熔岩星',badge:'原创想象 · 永久热源',kind:'planet',mass:SB_EARTH_M*1.4,radius:1.9,temp:1800,water:0,atmo:0.4,density:5.8,color:[0.9,0.25,0.08],physicalRadiusKm:7000,realm:'fiction'},
      {id:'ring_world',icon:'◎',name:'人工环世界',badge:'原创想象 · 环形巨构',kind:'planet',mass:SB_EARTH_M*2,radius:2.1,temp:22,water:60,atmo:1,color:[0.32,0.72,0.5],density:5,ring:true,physicalRadiusKm:8000,realm:'fiction'},
      {id:'galaxy',icon:'🌌',name:'螺旋星系',badge:'现实类型 · 集合示意',kind:'galaxy',mass:460,radius:18,temp:0,water:0,atmo:0,density:0,color:[0.5,0.7,0.95],realm:'real',sourceNote:'粒子代表恒星群；一个引力节点代表整座星系，不是单个球形恒星。'}
    );
    const SB_MASS_EARTH = {asteroid:1e-6,moon:0.0123,mars:0.1074,earth:1,jupiter:317.83,saturn:95.159,hotjup:400,comet:1e-10,belt:1e-6};
    for (const template of SB_TEMPLATES) {
      if (SB_MASS_EARTH[template.id] !== undefined) template.mass = SB_EARTH_M * SB_MASS_EARTH[template.id];
      template.physicalRadiusKm ??= SB_REAL_RADII[template.id] || 0;
      template.realm ??= 'real';
      if (template.id === 'smbh') {template.name='黑洞示意核';template.badge='20 M☉ · 非真实超大质量';}
    }
    SB_SYSTEM_MODELS.find(m=>m.id==='sys_trinary').name='层级三恒星系';
    SB_SYSTEM_MODELS.find(m=>m.id==='sys_trinary').badge='近双星+远伴星+外围行星';
    SB_SYSTEM_MODELS.push(
      {id:'sys_galaxy_cluster',icon:'🌌',name:'星系群',badge:'9星系+暗物质晕'},
      {id:'sys_supercluster',icon:'🕸️',name:'超星系团',badge:'24星系+宇宙纤维'},
      {id:'sys_whitehole',icon:'✧',name:'白洞喷发系',badge:'科学设想 · 双极外流'},
      {id:'sys_imagined',icon:'💎',name:'想象世界群',badge:'恒星+4原创星球'}
    );

    function sbCreateSolar(center=new THREE.Vector3(),drift=new THREE.Vector3()) {
      const sun=sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='sun'),name:'太阳',pos:center.toArray(),vel:drift.toArray()});
      ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'].forEach((id,i)=>{
        const radius=[14,22,32,42,56,72,88,104][i],angle=i*.85+.35;
        const pos=center.clone().add(new THREE.Vector3(Math.cos(angle)*radius,0,Math.sin(angle)*radius));
        sbCreateBody({...SB_TEMPLATES.find(t=>t.id===id),pos:pos.toArray(),vel:sbCircularVel(pos,sun).toArray()});
      });
      return sun;
    }
    function sbCancelInteraction() {
      sb.dragState=null; sb.grabBody=null; sb.activeBeamTarget=null; sb.pointerDownBeam=false;
      sb.barrageActive=false; sb.autoBeamTimer=0; sb.barrageTimer=0; sb.keys.clear();
      if(sb.controls) sb.controls.enabled=true;
      if(sb.previewLine) sb.previewLine.visible=false;
      if(sb.laserLine) sb.laserLine.visible=false;
    }
    function sbVisualRadius(b) {
      if(sb.sizeMode !== 'proportional' || !sbPhysicalRadius(b)) return b.radius;
      const largest=sb.bodies.reduce((r,x)=>Math.max(r,sbPhysicalRadius(x)),SB_SUN_RADIUS_KM);
      return sbPhysicalRadius(b) / largest * 12;
    }
    function sbApplySizeMode() {
      for(const b of sb.bodies) b.grp.scale.setScalar(sbVisualRadius(b)/Math.max(1e-12,b.radius));
    }
    function sbFocusBody(body=sb.selected) {
      if(!body?.alive) {sbToast('先选中一个天体，或用「定位天体」列表选择。');return;}
      sbCancelInteraction(); sbSelectBody(body); sb.followBody=body;
      sb$('sb-follow-btn')?.setAttribute('aria-pressed','true');
      const r=Math.max(sbVisualRadius(body),0.003), distance=r*(body.kind==='galaxy'?7:6);
      const dir=sb.camera.position.clone().sub(sb.controls.target).normalize();
      if(!dir.lengthSq()) dir.set(0,0.55,1).normalize();
      sb.controls.target.copy(body.pos);sb.camera.position.copy(body.pos).addScaledVector(dir,distance);
      sbUpdateCameraRange();sb.controls.update();
    }
    function sbOverview() {
      sbCancelInteraction();sb.followBody=null;sb$('sb-follow-btn')?.setAttribute('aria-pressed','false');
      const center=new THREE.Vector3();
      if(sb.bodies.length) {for(const b of sb.bodies) center.add(b.pos);center.divideScalar(sb.bodies.length);}
      let r=sb.bodies.length?.1:30;for(const b of sb.bodies) r=Math.max(r,b.pos.distanceTo(center)+sbVisualRadius(b)*3);
      const half=Math.min(sb.camera.fov*Math.PI/360,Math.atan(Math.tan(sb.camera.fov*Math.PI/360)*sb.camera.aspect));
      const dist=r/Math.sin(half)*1.15;
      sb.controls.target.copy(center);sb.camera.position.copy(center).add(new THREE.Vector3(0,0.55,1).normalize().multiplyScalar(dist));
      sbUpdateCameraRange();sb.controls.update();
    }
    function sbUpdateCameraRange() {
      if(!sb.camera) return;
      let reach=1000;for(const b of sb.bodies) reach=Math.max(reach,sb.camera.position.distanceTo(b.pos)+sbVisualRadius(b)*30);
      const distance=sb.camera.position.distanceTo(sb.controls.target);
      const near=Math.max(0.00001,Math.min(0.1,distance*0.0001)), far=Math.max(10000,reach*1.3);
      if(Math.abs(sb.camera.far-far)>far*.05 || sb.camera.near!==near) {sb.camera.near=near;sb.camera.far=far;sb.camera.updateProjectionMatrix();}
      sb.controls.minDistance=0.001;sb.controls.maxDistance=1e7;
      if(sb.backgroundStars) sb.backgroundStars.position.copy(sb.camera.position);
    }
    function sbUpdateLocator() {
      const list=sb$('sb-body-locator');if(!list) return;
      const key=sb.bodies.map(b=>b.id).join(',');
      if(key!==sb.locatorKey) {
        sb.locatorKey=key;list.replaceChildren(new Option('定位天体…',''));
        for(const b of sb.bodies.filter(x=>!x.isDebris)) list.appendChild(new Option(b.name,b.id));
      }
      const p=new THREE.Vector3();let off=0;
      for(const b of sb.bodies) {p.copy(b.pos).project(sb.camera);if(p.z< -1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1) off++;}
      sb$('sb-offscreen-status').textContent=off?`${off} 颗在视野外，可定位`:'所有天体在视野内';
      sbApplySizeMode();
    }
    function sbMakeCloud(body,count=600) {
      const positions=new Float32Array(count*3),colors=new Float32Array(count*3),rng=deterministicRandom(Number(body.id.slice(1))+1409);
      for(let i=0;i<count;i++) {
        const a=i*2.399963,rad=body.radius*(0.08+Math.sqrt(rng())*.92),arm=i%3;
        const theta=body.kind==='galaxy'?arm*Math.PI*2/3+rad/body.radius*5+rng()*.28:a;
        positions[i*3]=Math.cos(theta)*rad;positions[i*3+2]=Math.sin(theta)*rad;
        positions[i*3+1]=(rng()-.5)*body.radius*(body.kind==='galaxy'?.18:1.2);
        const color=new THREE.Color(...body.color).lerp(new THREE.Color(0xffe6b7),i<count*.15?.85:.1);
        color.toArray(colors,i*3);
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
      const cloud=glowPoints(geometry,body.radius*.12,body.kind==='darkmatter'?.18:.85);body.grp.add(cloud);body.cloud=cloud;
      body.mesh.visible=false;
      if(body.kind==='darkmatter') {
        const ring=new THREE.Mesh(new THREE.TorusGeometry(body.radius,.07,6,80),new THREE.MeshBasicMaterial({color:0x7395dc,transparent:true,opacity:.3}));
        ring.rotation.x=Math.PI/2;body.grp.add(ring);
      }
    }
    function sbDecorateBody(body) {
      if(['galaxy','nebula','darkmatter'].includes(body.kind)) sbMakeCloud(body,innerWidth<760?320:700);
      if(body.kind==='whitehole') {
        body.mat.dispose();body.mat=new THREE.MeshBasicMaterial({color:0xe7f6ff});body.mesh.material=body.mat;
        const jet=new THREE.Mesh(new THREE.CylinderGeometry(body.radius*.1,body.radius*.9,body.radius*16,12,1,true),new THREE.MeshBasicMaterial({color:0x9accff,transparent:true,opacity:.34,depthWrite:false,blending:THREE.AdditiveBlending}));body.grp.add(jet);body.jetMesh=jet;
        body.grp.add(glowSprite(0xeaf6ff,body.radius*5,.7));
      }
    }
    function sbCreateHierarchical(center=new THREE.Vector3(),drift=new THREE.Vector3(),withPlanet=true) {
      const G=sb.G_CONST*sb.gravity,inner=sbBinaryStates(120,95,26,G,center,drift);
      const total=215,thirdMass=60,separation=180;
      const outer=sbBinaryStates(total,thirdMass,separation,G,center,drift),offset=outer[0].pos.clone().sub(center),dv=outer[0].vel.clone().sub(drift);
      const a=sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='sun'),name:'近双星 α',mass:120,radius:4.5,pos:inner[0].pos.add(offset).toArray(),vel:inner[0].vel.add(dv).toArray()});
      sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='reddwarf'),name:'近双星 β',mass:95,radius:3.8,pos:inner[1].pos.add(offset).toArray(),vel:inner[1].vel.add(dv).toArray()});
      sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='reddwarf'),name:'远伴星 γ',mass:thirdMass,radius:4,pos:outer[1].pos.toArray(),vel:outer[1].vel.toArray()});
      if(withPlanet) {const p=center.clone().add(new THREE.Vector3(440,0,0));sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='earth'),name:'外围三体行星',pos:p.toArray(),vel:sbCircularVel(p,{pos:center,vel:drift,mass:275}).toArray()});}
      return a;
    }
    function sbCreateGalaxyGroup(center,count=9,drift=new THREE.Vector3()) {
      const halo=sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='darkmatter'),name:'星系群暗物质晕',mass:3000,radius:75,pos:center.toArray(),vel:drift.toArray(),isDebris:true});
      for(let i=0;i<count;i++) {
        const r=45+Math.sqrt(i/count)*200,a=i*2.399963,p=center.clone().add(new THREE.Vector3(Math.cos(a)*r,Math.sin(a*1.7)*40,Math.sin(a)*r));
        sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='galaxy'),name:`成员星系 ${i+1}`,mass:20,radius:7+i%4,pos:p.toArray(),vel:sbCircularVel(p,halo).toArray()});
      }
      return halo;
    }
    function sbBuildCosmicWeb() {
      const positions=[],nodes=sb.bodies.filter(b=>b.kind==='galaxy');
      for(let i=0;i<nodes.length;i++) {
        const nearest=nodes.map((b,j)=>({b,j,d:b.pos.distanceToSquared(nodes[i].pos)})).filter(x=>x.j!==i).sort((a,b)=>a.d-b.d).slice(0,2);
        for(const n of nearest) if(n.j>i) {positions.push(...nodes[i].pos.toArray(),...n.b.pos.toArray());}
      }
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
      const lines=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x6e8ebd,transparent:true,opacity:.28}));
      sb.scene.add(lines);sb.cosmicLines=lines;
    }
    function sbStartCosmos(mode) {
      sbClearAll();sb.preset=mode;sb$('sb-preset-select').value=mode;
      if(mode==='galaxy_cluster'||mode==='cosmic_web'||mode==='big_crunch'||mode==='big_rip'||mode==='heat_death') {
        sbCreateGalaxyGroup(new THREE.Vector3(),mode==='cosmic_web'?24:12);if(mode==='cosmic_web') sbBuildCosmicWeb();
      } else if(mode==='whitehole') {
        const white=sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='whitehole'),pos:[0,0,0]});
        for(let i=0;i<18;i++) {const a=i*2.399963,r=18+i*1.6,p=new THREE.Vector3(Math.cos(a)*r,(i%2?1:-1)*r*.5,Math.sin(a)*r);sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='comet'),name:'白洞外流示意',pos:p.toArray(),vel:p.clone().normalize().multiplyScalar(2+i*.12).toArray(),isDebris:true});}
        sbSelectBody(white);
      } else if(mode==='big_bang') {
        sbCreateGalaxyGroup(new THREE.Vector3(),12);for(const b of sb.bodies) {b.pos.multiplyScalar(.08);b.grp.position.copy(b.pos);b.vel.multiplyScalar(.08);}
        sbUnlockAch('genesis');
      }
      if(['big_bang','big_crunch','big_rip','heat_death','whitehole'].includes(mode)) sb.cosmos={mode,time:0,scale:mode==='big_bang'?.08:1};
      sbSelectBody(sb.bodies.find(b=>!b.isDebris)||sb.bodies[0]||null);sbOverview();sbUpdateCosmos(0);
    }
    function sbUpdateCosmos(dt) {
      const event=sb.cosmos,status=sb$('sb-event-status');
      if(!event) {if(status) status.hidden=true;return;}
      event.time+=dt;const t=event.time,old=event.scale;
      let scale=old,description='';
      if(event.mode==='big_bang') {scale=.08+Math.min(1,t/14)*1.42;description=t<3?'早期热宇宙：空间膨胀':t<8?'冷却与物质结构形成（时间压缩）':'星系结构成长：共动节点示意';}
      if(event.mode==='big_crunch') {scale=Math.max(.06,Math.exp(-t*.10));description=scale>.2?'假设性收缩：大尺度结构汇聚':'高密度终态示意：不求解奇点内部';}
      if(event.mode==='big_rip') {scale=Math.min(12,Math.exp(t*.08));description='假设性大撕裂：增强的空间膨胀分离结构';}
      if(event.mode==='heat_death') {description='热寂远景：恒星活动渐弱，能量趋于均匀';for(const b of sb.bodies) {if(b.cloud) b.cloud.material.opacity=Math.max(.035,.85*Math.exp(-t*.08));}}
      if(event.mode==='whitehole') description='白洞外流示意；尚无观测证据，不代表已发现的天体';
      if(old>0&&scale!==old) {
        const factor=scale/old;for(const b of sb.bodies) {if(!['galaxy','darkmatter','nebula'].includes(b.kind)&&event.mode!=='big_rip')continue;b.pos.multiplyScalar(factor);b.vel.multiplyScalar(factor);b.grp.position.copy(b.pos);}
        event.scale=scale;
      }
      if(status) {status.hidden=false;status.textContent=description+(['big_bang','big_crunch','big_rip'].includes(event.mode)?` · 尺度因子 ${scale.toFixed(2)}`:'');}
    }
    function sbClearCosmos() {
      sb.cosmos=null;if(sb.cosmicLines) {disposeTree(sb.cosmicLines);sb.cosmicLines=null;}
      sb$('sb-event-status')?.setAttribute('hidden','');
    }
    function sbExtraModel(id,center,drift) {
      if(id==='sys_galaxy_cluster'||id==='sys_supercluster') return sbCreateGalaxyGroup(center,id==='sys_supercluster'?24:9,drift);
      if(id==='sys_whitehole') return sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='whitehole'),pos:center.toArray(),vel:drift.toArray()});
      if(id==='sys_imagined') {
        const sun=sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='sun'),name:'想象世界主星',pos:center.toArray(),vel:drift.toArray()});
        ['crystal_world','ember_world','ring_world','ocean_world'].forEach((id,i)=>{const p=center.clone().add(new THREE.Vector3(Math.cos(i*1.7)*(26+i*12),0,Math.sin(i*1.7)*(26+i*12)));sbCreateBody({...SB_TEMPLATES.find(t=>t.id===id),pos:p.toArray(),vel:sbCircularVel(p,sun).toArray()});});return sun;
      }
      return null;
    }
    function sbImportTemplate(item) {
      if(SB_TEMPLATES.some(t=>t.id===item.id)) return {...SB_TEMPLATES.find(t=>t.id===item.id),id:'__custom__',name:item.name,catalogId:item.id};
      const preset=item.visual?.preset,sub=item.subtype||'',facts=item.facts||{};
      const kind=/白洞/.test(item.name+' '+sub)?'whitehole':/暗物质/.test(item.name+' '+sub)?'darkmatter':item.kind==='galaxy'||item.kind==='cluster'?'galaxy':item.kind==='nebula'?'nebula':item.kind==='blackhole'||preset==='blackhole'?'bh':preset==='pulsar'?'ns':/白矮星/.test(sub)?'wd':item.kind==='star'?'star':['gas','ring'].includes(preset)?'gas':'planet';
      const base=SB_TEMPLATES.find(t=>t.id===(kind==='planet'?'earth':kind==='star'?'sun':kind))||SB_TEMPLATES.find(t=>t.kind===kind)||SB_TEMPLATES.find(t=>t.id==='earth');
      const solar=Number.isFinite(facts.massSolar)&&facts.massSolar>0?facts.massSolar:null,earth=Number.isFinite(facts.massEarth)&&facts.massEarth>0?facts.massEarth:null;
      const physicalR=Number.isFinite(facts.radiusSolar)&&facts.radiusSolar>0?facts.radiusSolar*SB_SUN_RADIUS_KM:Number.isFinite(facts.radiusEarth)&&facts.radiusEarth>0?facts.radiusEarth*6371:0;
      return {...base,id:'__custom__',name:item.name||'百科天体',badge:sub||base.badge,kind,
        mass:Math.max(1e-30,Math.min(1e9,solar!==null?solar*SB_SOLAR_M:earth!==null?earth*SB_EARTH_M:base.mass)),
        physicalRadiusKm:physicalR,realm:item.realm||'speculative',catalogId:item.id||'',
        temp:Number.isFinite(facts.tempK)?Math.max(-273.15,facts.tempK-273.15):base.temp,
        sourceNote:solar!==null&&solar*SB_SOLAR_M>1e9?`目录质量 ${sbNumberText(solar)} M☉，已缩放至模拟质量预算。`:solar===null&&earth===null?'质量未知，使用模板演示值；不把目录上/下限当作精确质量。':'质量采用目录已知值；轨道和渲染仍是压缩演示模型。'};
    }
    function sbApplyUniverse(raw) {
      const data=normalizeSandboxUniverse(raw);
      sbClearAll();
      for(const key of ['preset','gravity','speed','lumMult','simYears','rocheEnabled','collideMode','sizeMode','showTrails','showHZ','showGrid','showVel','showLabels','paused']) sb[key]=data[key];
      for(const b of data.bodies) sbCreateBody(b);
      sb.cosmos=data.cosmos;
      sb.camera.position.fromArray(data.camera);sb.controls.target.fromArray(data.target);sbSyncSettings();sbUpdateCameraRange();sb.controls.update();sbSelectBody(sb.bodies[0]||null);
    }
    function sbSyncSettings() {
      for(const [id,key] of [['sb-gravity','gravity'],['sb-speed','speed'],['sb-law-lum','lumMult']]) {sb$(id).value=String(sb[key]);sb$(id+'-val').textContent=sb[key].toFixed(1)+'×';}
      sb$('sb-preset-select').value=sb.preset;sb$('sb-law-roche').checked=sb.rocheEnabled;sb$('sb-law-collide').value=sb.collideMode;sb$('sb-size-mode').value=sb.sizeMode||'illustrative';
      for(const [id,key] of [['sb-tog-trails','showTrails'],['sb-tog-hz','showHZ'],['sb-tog-grid','showGrid'],['sb-tog-vel','showVel'],['sb-tog-labels','showLabels']]) sb$(id).setAttribute('aria-pressed',String(sb[key]));
      sb$('sb-pause-btn').setAttribute('aria-pressed',String(sb.paused));sb$('sb-pause-btn').textContent=sb.paused?'▶ 继续':'Ⅱ 暂停';
    }
    function sbBindExtendedControls() {
      sb.sizeMode='illustrative';sb.flightMode=true;sbBindTelemetry();
      sb$('sb-overview').onclick=sbOverview;sb$('sb-focus-selected').onclick=()=>sbFocusBody();
      sb$('sb-body-locator').onchange=e=>{sbFocusBody(sb.bodies.find(b=>b.id===e.target.value));e.target.value='';};
      sb$('sb-nav-mode').onclick=()=>{sb.flightMode=!sb.flightMode;sb$('sb-nav-mode').setAttribute('aria-pressed',String(sb.flightMode));sb$('sb-nav-mode').textContent=sb.flightMode?'🕹️ 方向遥控':'🕹️ 打开遥控';sb$('sb-flight-pad').hidden=!sb.flightMode;};
      const topBtn=sb$('sb-view-top'),sideBtn=sb$('sb-view-side'),clrBtn=sb$('sb-clear-canvas');
      if(topBtn) topBtn.onclick=()=>{sbCancelInteraction();sb.followBody=null;sb$('sb-follow-btn')?.setAttribute('aria-pressed','false');const d=Math.max(40,sb.camera.position.distanceTo(sb.controls.target));sb.camera.position.copy(sb.controls.target).add(new THREE.Vector3(0,d,0.01));sb.controls.update();};
      if(sideBtn) sideBtn.onclick=()=>{sbCancelInteraction();sb.followBody=null;sb$('sb-follow-btn')?.setAttribute('aria-pressed','false');const d=Math.max(40,sb.camera.position.distanceTo(sb.controls.target));sb.camera.position.copy(sb.controls.target).add(new THREE.Vector3(0,d*0.14,d));sb.controls.update();};
      if(clrBtn) clrBtn.onclick=()=>{sbLoadPreset('blank');sbToast('🧹 已清空画布，可以自由创造全新宇宙！');};
      sb$('sb-size-mode').onchange=e=>{sb.sizeMode=e.target.value;sbApplySizeMode();sbSyncInspector();};
      for(const [id,panel] of [['sb-mobile-library','library'],['sb-mobile-inspector','inspector']]) sb$(id).onclick=()=>{const shell=sb$('sandbox-modal');const next=shell.dataset.mobilePanel===panel?'':panel;shell.dataset.mobilePanel=next;sb$('sb-mobile-library').setAttribute('aria-pressed',String(next==='library'));sb$('sb-mobile-inspector').setAttribute('aria-pressed',String(next==='inspector'));};
      document.querySelectorAll('[data-sb-cosmos]').forEach(button=>button.onclick=()=>sbLoadPreset(button.dataset.sbCosmos));
      document.querySelectorAll('[data-sb-fly]').forEach(button=>{
        const stepOnce=()=>{
          if(!sb.camera||!sb.controls)return;
          const k=button.dataset.sbFly,spd=Math.max(3,sb.camera.position.distanceTo(sb.controls.target)*0.12);
          const fwd=new THREE.Vector3();sb.camera.getWorldDirection(fwd);
          const right=new THREE.Vector3().crossVectors(fwd,sb.camera.up).normalize();
          const up=sb.camera.up.clone().normalize(),d=new THREE.Vector3();
          if(k==='w')d.addScaledVector(fwd,spd);else if(k==='s')d.addScaledVector(fwd,-spd);else if(k==='a')d.addScaledVector(right,-spd);else if(k==='d')d.addScaledVector(right,spd);else if(k==='q')d.addScaledVector(up,spd);else if(k==='e')d.addScaledVector(up,-spd);
          sb.followBody=null;sb$('sb-follow-btn')?.setAttribute('aria-pressed','false');
          sb.camera.position.add(d);sb.controls.target.add(d);sb.controls.update();
        };
        button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);stepOnce();sb.keys.add(button.dataset.sbFly);};
        const end=()=>sb.keys.delete(button.dataset.sbFly);button.onpointerup=end;button.onpointercancel=end;button.onlostpointercapture=end;
      });
      window.addEventListener('keydown',e=>{
        if(!sb.open||e.target.matches('#sb-sparkline,#sb-speed-sparkline')||e.target.closest('input,textarea,select,[contenteditable="true"]')||e.ctrlKey||e.metaKey||e.altKey)return;
        const key=e.key.toLowerCase();
        if(key===' '&&e.target.closest('button'))return;
        if(['w','a','s','d','q','e','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) {e.preventDefault();e.stopImmediatePropagation();sb.keys.add(key);}
        if(key==='f'||key==='home'||key===' ') {e.preventDefault();e.stopImmediatePropagation();if(key==='f')sbFocusBody();else if(key==='home')sbOverview();else if(!e.repeat)sb$('sb-pause-btn').click();}
      },{capture:true});
      window.addEventListener('pointercancel',sbCancelInteraction);
      window.addEventListener('blur',sbCancelInteraction);
      document.addEventListener('visibilitychange',()=>{sbCancelInteraction();sbPrevTime=0;});
      if(new URLSearchParams(location.search).has('test')) window.__sandboxDebug={snapshot:()=>({open:sb.open,preset:sb.preset,paused:sb.paused,gravity:sb.gravity,speed:sb.speed,lumMult:sb.lumMult,tool:sb.tool,sizeMode:sb.sizeMode,cosmos:sb.cosmos&&{...sb.cosmos},camera:sb.camera?.position.toArray(),target:sb.controls?.target.toArray(),controlsEnabled:sb.controls?.enabled,keys:[...sb.keys],effects:sb.effects.length,streams:sb.tidalStreams.length,memory:sb.renderer?.info.memory,bodies:sb.bodies.map(b=>({id:b.id,name:b.name,kind:b.kind,mass:b.mass,radius:b.radius,visualRadius:sbVisualRadius(b),physicalRadiusKm:sbPhysicalRadius(b),pos:b.pos.toArray(),vel:b.vel.toArray()}))}),serialize:sbSerializeUniverse};
    }
