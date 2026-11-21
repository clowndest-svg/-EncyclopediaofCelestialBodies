    const SCENE_GUIDE = {
      L0:['地月系 · 潮汐相伴','月球在椭圆轨道上运行；点击地球或月球锁定跟随。','开普勒地月模型：椭圆轨道、轨道倾角与质心方向。半径和时间为展示比例。'],
      L0B:['地表生态 · 蓝色家园','拖动探索雪山与海岸，观察水流、飞鸟和鲸群。','地表生态为程序化微缩样区，不是地理测绘数据。'],
      L1:['太阳系 · 引力与轨道','内侧行星公转更快。点击行星跟随，释放探针观察引力弯曲。','开普勒椭圆轨道与实际偏心率；距离非线性压缩，角速度由归一化 GM / a³ 决定。'],
      L2:['黑洞视界 · 光的边界','观察吸积流、光子环与双极喷流。旋转视角查看光线弯曲。','史瓦西近似光线偏折 + 开普勒吸积盘。展示多普勒增亮，不是完整克尔度规数值解。'],
      L3:['星系 · 亿万恒星的旋舞','恒星差速绕核运动，尘埃暗带与恒星诞生区勾勒旋臂。','盘内差速旋转与近似平坦旋转曲线；星系形态是程序化示意，时间大幅加速。'],
      L4:['超星系团 · 汇向巨引源','追踪星系团间的物质流，观察引力汇聚与轨迹弯曲。','软化引力场下的测试粒子积分。星系团中心固定，忽略粒子自引力；不是全 N 体宇宙学模拟。'],
      L5:['宇宙纤维网 · 深空的骨架','物质沿纤维流向高密度节点，宇宙空洞在其间展开。','程序化密度网与引力流示意。纤维几何固定；粒子受节点引力与纤维约束，不代表实际观测数据。']
    };
    function safeStorageRead(key){try{return localStorage.getItem(key);}catch{return null;}}
    function setLayout(mode, remember=true) {
      document.body.dataset.layout=mode;
      if(remember){try{localStorage.setItem('cosmic-layout',mode);}catch{}}
      document.querySelectorAll('[data-layout-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layoutMode===mode)));
      const compact=mode==='mobile'||innerWidth<900;
      document.getElementById('left-panel').classList.toggle('left-collapsed',compact);
      document.getElementById('right-panel').classList.toggle('drawer-collapsed',compact);
      document.body.classList.remove('sheet-open');syncPanelAccessibility();
      resizeViewport(true);
    }
    function syncPanelAccessibility() {
      const left=document.getElementById('left-panel'),right=document.getElementById('right-panel');
      const l=!left.classList.contains('left-collapsed'),r=!right.classList.contains('drawer-collapsed');
      left.inert=!l;right.inert=!r;
      document.getElementById('toggle-left-btn').setAttribute('aria-expanded',String(l));
      document.getElementById('toggle-right-btn').setAttribute('aria-expanded',String(r));
      document.body.classList.toggle('sheet-open',document.body.dataset.layout==='mobile'&&(l||r));
    }
    function togglePanel(side, close=false) {
      const mobile=document.body.dataset.layout==='mobile',compact=mobile||innerWidth<900;
      const id=side==='left'?'left-panel':'right-panel',cls=side==='left'?'left-collapsed':'drawer-collapsed';
      const el=document.getElementById(id),opening=!close&&el.classList.contains(cls);
      el.classList.toggle(cls,!opening);
      if(opening&&compact)document.getElementById(side==='left'?'right-panel':'left-panel').classList.add(side==='left'?'drawer-collapsed':'left-collapsed');
      syncPanelAccessibility();
      if(opening)el.querySelector('button')?.focus({preventScroll:true});
      else document.getElementById(side==='left'?'toggle-left-btn':'toggle-right-btn').focus({preventScroll:true});
    }
    function syncDynamicsUI() {
      [['transport-trails','btn-layer-trails','trails'],['transport-gravity','btn-layer-gravity','vectors']].forEach(([a,b,key])=>{
        document.getElementById(a).setAttribute('aria-pressed',String(dynamics[key]));document.getElementById(b).setAttribute('aria-pressed',String(dynamics[key]));
      });
      document.getElementById('btn-layer-labels').setAttribute('aria-pressed',String(dynamics.labels));
      document.getElementById('btn-layer-jets').classList.toggle('hidden',state.currentScale!=='L2');
      document.getElementById('btn-layer-jets').setAttribute('aria-pressed',String(state.showBlackHoleJets));
      Object.values(dynamics.paths).forEach(g=>g.visible=dynamics.trails);Object.values(dynamics.forces).forEach(g=>g.visible=dynamics.vectors);
      celestialBodies.forEach(b=>{if(b.orbit){b.orbitPath.visible=dynamics.trails;b.orbitWake.visible=dynamics.trails;b.gravityArrow.visible=dynamics.vectors;}});
      document.getElementById('transport-pause').setAttribute('aria-pressed',String(state.paused));
      document.getElementById('transport-pause').textContent=state.paused?'▶ 继续':'Ⅱ 暂停';
      document.getElementById('transport-speed').textContent=state.timeScale.toFixed(1)+'×';
      document.getElementById('btn-pause-sim').textContent=state.paused?'▶️ 继续仿真':'⏸️ 暂停仿真';
    }
    function updateSceneGuide() {
      const guide=SCENE_GUIDE[state.currentScale];
      if(typeof syncMotionUI==='function')syncMotionUI();
      if(typeof updateLabParameters==='function')updateLabParameters();
      document.getElementById('hud-scale-name').textContent=SCALE_META[state.currentScale].name;
      document.getElementById('hud-scale-ruler').textContent=SCALE_META[state.currentScale].ruler;
      document.querySelectorAll('#right-tab-explore [data-explore-scales]').forEach(el=>{const ok=el.dataset.exploreScales.split(' ').includes(state.currentScale);el.classList.toggle('hidden',!ok);});
      const exploreTab=document.querySelector('[data-right-tab="explore"]');
      if(exploreTab)exploreTab.textContent=({L0:'地貌与彗星',L0B:'地球地貌',L1:'彗星与视角',L2:'黑洞观测',L3:'星系形态',L4:'超团巡览',L5:'深空巡览'})[state.currentScale]||'场景观测';
      const labNotice=document.getElementById('lab-scale-notice');if(labNotice)labNotice.classList.toggle('hidden',['L0','L1'].includes(state.currentScale));
      if(['L3','L4','L5'].includes(state.currentScale))renderLargeScaleFacts();
      document.getElementById('scene-title').textContent=guide[0];
      document.getElementById('scene-subtitle').textContent=document.body.dataset.layout==='mobile'?guide[1].replace('拖动','单指拖动').replace('滚轮','双指'):guide[1];
      document.getElementById('physics-description').textContent=guide[2];
      document.getElementById('lab-target-name').textContent=getActiveLabTarget()?(ENCYCLOPEDIA[getActiveLabTarget().id]?.name||'地球'):'当前尺度不可撞击';
      ['btn-launch-exp','btn-launch-salvo','btn-reset-target','btn-aim-surface'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=!['L0','L1'].includes(state.currentScale);});
      rebuildLabels();updateDynamicsValues();
      const active=document.querySelector('.scale-btn.active');
      if(document.body.dataset.layout==='mobile'&&active)active.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
    }
    function renderLargeScaleFacts() {
      const morph=state.galaxyMorph;
      const galaxy={
        milkyway:['银河系','棒旋星系','约 10.6 万光年','约 1,000–4,000 亿颗','约 4.3 百万太阳质量'],
        andromeda:['仙女座 M31','螺旋星系','约 22 万光年','约 1 万亿颗','约 1–2 亿太阳质量'],
        sombrero:['草帽星系 M104','透镜 / 螺旋过渡星系','约 5 万光年','约数千亿颗','约 10 亿太阳质量'],
        m87:['室女座 M87','巨型椭圆星系','可见部分约 12 万光年','约数万亿颗','约 65 亿太阳质量'],
        cartwheel:['车轮星系','碰撞环状星系','外环约 15 万光年','观测估计依模型而异','模型中未单独求解']
      }[morph];
      const facts=state.currentScale==='L3'?[['观测对象',galaxy[0]],['形态',galaxy[1]],['直径参考',galaxy[2]],['恒星数量参考',galaxy[3]],['中心黑洞参考',galaxy[4]],['示踪星',galaxyTracers.length+' 颗'],['运动模型','近似平坦旋转曲线'],['显示时间','大幅加速，非实时天文尺度']]:state.currentScale==='L4'?[['结构示意','拉尼亚凯亚超星系团'],['直径参考','约 5.2 亿光年'],['质量参考','约 10¹⁷ 太阳质量'],['星系数量参考','约 10 万个'],['引力中心','巨引源方向'],['绘制节点',clusterNodes.length+' 个示意节点'],['物质流','引力场下测试粒子'],['边界说明','并非整体引力束缚系统']]:[['宇宙年龄','约 138 亿年'],['可观测直径','约 930 亿光年'],['微波背景温度','约 2.725 K'],['节点数量',webNodes.length+' 个示意节点'],['纤维数量',webEdges.length+' 条'],['节点密度','影响沿纤维的汇聚速度'],['空洞','纤维之间的低密度区域'],['数据来源','程序化几何，非观测重建']];
      document.getElementById('info-title').textContent=state.currentScale==='L3'?galaxy[0]:SCALE_META[state.currentScale].name;
      document.getElementById('info-type-badge').textContent=state.currentScale==='L3'?galaxy[1]:'大尺度结构';
      document.getElementById('enc-grid').innerHTML=facts.map(([name,value])=>`<div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80"><div class="text-[10px] text-slate-400">${name}</div><div class="text-[11px] text-slate-100 font-medium mt-0.5">${value}</div></div>`).join('');
    }
    function updateDynamicsValues() {
      const key=state.currentScale, rows=[['动力学时间',Math.floor(dynamics.sceneTime[key])+' 模拟秒'],['归一化引力',dynamics.gravity.toFixed(2)+'×'],['当前探针',dynamics.probes.filter(p=>p.key===key).length+' 枚']];
      if(key==='L1'&&typeof motion!=='undefined')rows.push(['银河累计航程',(motion.years*SOLAR_TRAVEL_AU_YEAR).toFixed(1)+' AU'],['穿行参考系',motion.frame==='external'?'银河穿行 (230 km/s)':'日心参考']);
      if(key==='L0'&&typeof motion!=='undefined')rows.push(['地月演化天数',motion.lunarDays.toFixed(1)+' 天']);
      if(state.lockedBody?.orbit){const o=state.lockedBody.orbit;const r=state.lockedBody.meshGroup.position.length();rows.push(['轨道偏心率',o.e.toFixed(4)],['即时轨道半径',r.toFixed(2)+' 场景单位'],['轨道速度',Math.sqrt(o.mu*dynamics.gravity*(2/r-1/o.a)).toFixed(2)+' 单位 / 秒']);}
      if(key==='L3')rows.push(['星系形态',({milkyway:'银河系棒旋',andromeda:'仙女座',sombrero:'草帽星系',m87:'椭圆星系',cartwheel:'车轮星系'})[state.galaxyMorph]],['差速旋转','内侧快，外侧近似平坦曲线']);
      if(key==='L4')rows.push(['引力节点',clusterNodes.length+' 个'],['测试粒子',clusterParticles?.length||0]);
      if(key==='L5')rows.push(['宇宙尺度因子','a(t) = '+(typeof motion!=='undefined'?motion.webScale.toFixed(3):'1.000')],['密度节点',webNodes.length+' 个'],['连接纤维',webEdges.length+' 条']);
      document.getElementById('dynamics-values').innerHTML=rows.map(([label,value])=>`<tr><td>${label}</td><td>${value}</td></tr>`).join('');
    }
    function rebuildLabels() {
      const root=document.getElementById('body-labels');root.replaceChildren();dynamics.labelsDOM=[];
      const candidates=celestialBodies.filter(b=>b.scaleKey===state.currentScale&&b.id!=='moon');
      candidates.forEach(body=>{const el=document.createElement('span');el.className='body-label';el.textContent=ENCYCLOPEDIA[body.id]?.name||body.id;root.appendChild(el);dynamics.labelsDOM.push({el,body});});
      if(state.currentScale==='L1'&&motion.frame==='external'&&motion.sgrALabel){const el=document.createElement('span');el.className='body-label';el.style.borderColor='rgba(251,191,36,0.55)';el.style.color='#fde68a';el.textContent='人马座 A* · 银河系中心';root.appendChild(el);dynamics.labelsDOM.push({el,object:motion.sgrALabel,priority:true});}
      if(state.currentScale==='L4')clusterNodes.slice(0,6).forEach(node=>{const el=document.createElement('span');el.className='body-label';el.textContent=node.name;root.appendChild(el);dynamics.labelsDOM.push({el,position:node.center});});
    }
    function updateLabels() {
      const projected=new THREE.Vector3(),world=new THREE.Vector3(),occupied=[];
      const small=innerWidth<700;
      for(const item of dynamics.labelsDOM){
        if(item.body)item.body.mesh.getWorldPosition(world);else world.copy(item.position);
        projected.copy(world).project(camera);
        const x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight;
        const r=item.body?.radius||0;const hidden=!dynamics.labels||item.body?.isDestroyed||projected.z>1||projected.z<-1||x<12||x>innerWidth-64||y<180||y>innerHeight-190||(!small&&document.body.dataset.layout==='desktop'&&((x<295&&!document.getElementById('left-panel').classList.contains('left-collapsed'))||(x>innerWidth-310&&!document.getElementById('right-panel').classList.contains('drawer-collapsed'))))||occupied.some(p=>Math.abs(p.x-x)<65&&Math.abs(p.y-y)<22);
        item.el.hidden=hidden;if(!hidden){item.el.style.left=x+'px';item.el.style.top=(y-r*innerHeight/Math.max(20,camera.position.distanceTo(world))*.35)+'px';occupied.push({x,y});}
      }
    }
    let lastTooltip=0;
    function inspectPointer(now) {
      if(now-lastTooltip<.12)return;lastTooltip=now;
      const tip=document.getElementById('object-tooltip');
      if(dynamics.pointer.x>1||state.aimMode||document.body.dataset.layout==='mobile'){tip.hidden=true;return;}
      raycaster.setFromCamera(dynamics.pointer,camera);
      const hits=raycaster.intersectObjects(celestialBodies.filter(b=>b.scaleKey===state.currentScale&&!b.isDestroyed).map(b=>b.mesh));
      if(!hits.length){tip.hidden=true;return;}
      const body=hits[0].object.userData.bodyRef;
      tip.innerHTML=`${ENCYCLOPEDIA[body.id]?.name||body.id}<small>${body.orbit?'轨道偏心率 '+body.orbit.e.toFixed(4):'中心引力源'} · 点击锁定</small>`;
      tip.hidden=false;tip.style.left=Math.min(innerWidth-235,(dynamics.pointer.x+1)*.5*innerWidth+15)+'px';tip.style.top=Math.min(innerHeight-90,(1-dynamics.pointer.y)*.5*innerHeight+15)+'px';
    }
    function bindImprovedUI() {
      document.querySelectorAll('[data-layout-mode]').forEach(b=>b.onclick=()=>{setLayout(b.dataset.layoutMode);updateSceneGuide();});
      document.getElementById('toggle-left-btn').onclick=()=>togglePanel('left');
      document.getElementById('btn-close-left').onclick=()=>togglePanel('left',true);
      document.getElementById('toggle-right-btn').onclick=()=>togglePanel('right');
      document.getElementById('btn-close-right').onclick=()=>togglePanel('right',true);
      document.getElementById('sheet-backdrop').onclick=()=>{togglePanel('left',true);togglePanel('right',true);};
      ['transport-trails','btn-layer-trails'].forEach(id=>document.getElementById(id).onclick=()=>{dynamics.trails=!dynamics.trails;syncDynamicsUI();});
      ['transport-gravity','btn-layer-gravity'].forEach(id=>document.getElementById(id).onclick=()=>{dynamics.vectors=!dynamics.vectors;syncDynamicsUI();});
      document.getElementById('btn-layer-labels').onclick=()=>{dynamics.labels=!dynamics.labels;syncDynamicsUI();};
      document.getElementById('btn-layer-jets').onclick=()=>{document.getElementById('btn-toggle-jets').click();syncDynamicsUI();};
      document.getElementById('slider-gravity').oninput=e=>{dynamics.gravity=+e.target.value;document.getElementById('val-gravity').textContent=dynamics.gravity.toFixed(2)+'×';updateDynamicsValues();};
      document.getElementById('btn-orbit-probe').onclick=releaseProbe;
      document.getElementById('btn-reset-dynamics').onclick=()=>{resetDynamics();showToast('轨道、探针和物质流已重置');};
      document.getElementById('transport-pause').onclick=togglePause;
      document.getElementById('transport-speed').onclick=()=>{const speeds=[.5,1,2,5];state.timeScale=speeds[(speeds.indexOf(state.timeScale)+1)%speeds.length];document.getElementById('slider-time-scale').value=state.timeScale;document.getElementById('val-time-scale').textContent=state.timeScale.toFixed(1)+'x';syncDynamicsUI();};
      document.getElementById('transport-home').onclick=frameOverview;
      document.querySelectorAll('[data-scene-view]').forEach(b=>b.onclick=()=>{
        const v=b.dataset.sceneView;
        state.lockedBody=null;lockRingGroup.visible=false;document.getElementById('btn-unlock-cam').classList.add('hidden');
        if(v==='l1-galactic'){
          if(motion.frame!=='external')setReferenceFrame('external');
          motion.galacticOverview=false;
          const {cam,look}=l1VortexCamera();
          startCamTransition(cam,look);
          return;
        }
        if(v==='l1-galactic-year'){
          if(motion.frame!=='external')setReferenceFrame('external');
          motion.galacticOverview=true;
          const k=innerWidth<innerHeight?1.45:1;
          startCamTransition(new THREE.Vector3(0,2950*k,1320*k),new THREE.Vector3(0,0,0));
          showToast('银河年全景：太阳系每 2.25 亿年绕人马座 A* 公转一周');
          return;
        }
        if(state.currentScale==='L1'&&motion.frame==='external'&&['l1-ecliptic','l1-inner','l1-outer'].includes(v)){
          motion.galacticOverview=false;
          const gf=galacticFrameAt(motion.years);
          const k=innerWidth<innerHeight?1.35:1;
          let cam;
          if(v==='l1-ecliptic')cam=gf.pos.clone().addScaledVector(gf.Ey,390*k).addScaledVector(gf.Ez,48*k);
          else if(v==='l1-inner')cam=gf.pos.clone().addScaledVector(gf.Ey,82*k).addScaledVector(gf.Ez,118*k).addScaledVector(gf.Ex,35*k);
          else cam=gf.pos.clone().addScaledVector(gf.Ey,210*k).addScaledVector(gf.Ez,330*k).addScaledVector(gf.Ex,180*k);
          startCamTransition(cam,gf.pos.clone());
          return;
        }
        motion.galacticOverview=false;
        const c=frameCenter();
        const views={
          'l1-ecliptic':[[0,380,42],[0,0,0]],
          'l1-inner':[[0,72,115],[0,0,0]],
          'l1-outer':[[220,175,330],[0,0,0]],
          'l2-equator':[[0,9,62],[0,0,0]],
          'l2-polar':[[0,74,10],[0,0,0]],
          'l2-close':[[16,7,32],[0,0,0]],
          'l3-top':[[0,215,24],[0,0,0]],
          'l3-edge':[[0,24,225],[0,0,0]],
          'l4-attractor':[[0,48,95],[0,0,0]],
          'l5-overview':[[0,155,315],[0,0,0]]
        }[v];
        if(views)startCamTransition(c.clone().add(fittedCameraPosition(views[0])),c.clone().add(new THREE.Vector3(...views[1])));
      });
      const goL1=document.getElementById('btn-jump-l1');if(goL1)goL1.onclick=()=>switchScale('L1');
      const homeSendSb=document.getElementById('btn-home-send-sandbox');
      if(homeSendSb)homeSendSb.onclick=()=>{
        const b=state.lockedBody||getActiveLabTarget();
        if(!b){if(typeof window.openSandbox2==='function')window.openSandbox2();return;}
        const info=ENCYCLOPEDIA[b.id]||{};
        const isStar=b.id==='sun';
        const isGas=['jupiter','saturn','uranus','neptune'].includes(b.id);
        const obj={id:b.id,name:info.name||b.id,subtype:info.type||(isStar?'恒星':'行星'),kind:isStar?'star':'planet',visual:{preset:isStar?'star':b.id==='saturn'?'ring':isGas?'gas':'planet'},facts:{tempK:isStar?5778:b.id==='venus'?737:b.id==='mars'?210:288}};
        if(typeof window.openSandbox2==='function')window.openSandbox2(obj);
      };
      const homeOpenBook=document.getElementById('btn-home-open-book');
      if(homeOpenBook)homeOpenBook.onclick=async()=>{
        const b=state.lockedBody||getActiveLabTarget();
        await cosmicBook.show();
        if(b){const found=cosmicBook.data.find(i=>i.id===b.id);if(found)bookSelect(found);}
      };
      renderer.domElement.addEventListener('dblclick',e=>{
        if(state.aimMode||sb?.open||cosmicBook?.open)return;
        const ndc=new THREE.Vector2(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);
        raycaster.setFromCamera(ndc,camera);
        const hits=raycaster.intersectObjects(celestialBodies.filter(b=>b.scaleKey===state.currentScale&&!b.isDestroyed).map(b=>b.mesh));
        if(hits.length){const body=hits[0].object.userData.bodyRef;if(body){lockToBody(body,true);showToast('🎯 双击锁定：'+(ENCYCLOPEDIA[body.id]?.name||body.id));}}
      });
      renderer.domElement.addEventListener('pointermove',e=>{dynamics.pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);});
      renderer.domElement.addEventListener('pointerleave',()=>{dynamics.pointer.set(9,9);document.getElementById('object-tooltip').hidden=true;});
      if(window.cosmicDesktop?.isDesktop){
        const tools=document.querySelector('.header-tools');
        if(tools){
          const fsBtn=document.createElement('button');fsBtn.className='glass-btn rounded-xl px-2.5 py-1.5 text-xs flex items-center gap-1 text-sky-200';fsBtn.title='切换全屏 / 窗口模式 (F11)';fsBtn.textContent='🖥️ F11全屏';
          fsBtn.onclick=()=>window.cosmicDesktop.toggleFullscreen();
          const qBtn=document.createElement('button');qBtn.className='glass-btn rounded-xl px-2.5 py-1.5 text-xs flex items-center gap-1 text-rose-200 border-rose-500/35';qBtn.title='退出桌面程序 (Alt+F4)';qBtn.textContent='✕ 退出';
          qBtn.onclick=()=>window.cosmicDesktop.quit();
          tools.append(fsBtn,qBtn);
        }
      }
      window.addEventListener('keydown',e=>{if(e.key==='Escape'){togglePanel('left',true);togglePanel('right',true);} });
      setLayout(safeStorageRead('cosmic-layout')||(innerWidth<900?'mobile':'desktop'),false);bindMotionUI();bindLabUI();syncDynamicsUI();updateSceneGuide();
    }
    function fittedCameraPosition(pos) {
      const p=new THREE.Vector3(...pos),aspect=innerWidth/innerHeight;
      const factor=aspect<1?Math.min(2.25,1/Math.sqrt(aspect)*1.13):1;
      return p.multiplyScalar(factor);
    }
    let previousAspect=innerWidth/innerHeight;
    function resizeViewport(reframe=false) {
      const w=container.clientWidth,h=container.clientHeight;
      camera.aspect=w/h;camera.updateProjectionMatrix();
      const ratio=Math.min(devicePixelRatio,document.body.dataset.layout==='mobile'?1.4:2);
      renderer.setPixelRatio(ratio);renderer.setSize(w,h);composer.setPixelRatio(ratio);composer.setSize(w,h);
      if(reframe||Math.abs(camera.aspect-previousAspect)>.2){
        if(!state.lockedBody){const meta=SCALE_META[state.currentScale];startCamTransition(fittedCameraPosition(meta.camPos),new THREE.Vector3(...meta.target));}
      }
      previousAspect=camera.aspect;
    }
