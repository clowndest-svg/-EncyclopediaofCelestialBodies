from pathlib import Path

def apply(s, root, work):
    def replace(old,new):
        nonlocal s
        assert old in s, old[:120]
        s=s.replace(old,new,1)
    monsters_src = (work/'monsters.js').read_text(encoding='utf-8') + '\n' if (work/'monsters.js').exists() else ''
    replace('    // 尺度分组容器',(work/'motion.js').read_text(encoding='utf-8')+'\n'+monsters_src+(work/'lab.js').read_text(encoding='utf-8')+'\n    // 尺度分组容器')
    replace('  </style>','\n'+(work/'continuation.css').read_text(encoding='utf-8')+'\n  </style>')
    replace('<section class="dynamics-box" aria-label="引力与轨道设置">',(work/'motion-panel.txt').read_text(encoding='utf-8')+'\n<section class="dynamics-box" aria-label="引力与轨道设置">')
    replace('<div class="grid grid-cols-2 gap-1.5" id="experiment-selector">',(work/'lab-filters.txt').read_text(encoding='utf-8')+'\n<div class="grid grid-cols-2 gap-1.5" id="experiment-selector">')
    replace('      <!-- 瞄准模式与发射控制 -->',(work/'lab-controls.txt').read_text(encoding='utf-8')+'\n      <!-- 瞄准模式与发射控制 -->')
    replace('<button id="transport-home"','<button id="transport-frame" title="切换整体行进与随动参考">外部参考</button>\n      <button id="transport-home"')
    replace('function spawnProjectile({ startPos, targetPos, targetBody = null','function legacySpawnProjectile({ startPos, targetPos, targetBody = null')
    replace('function executeExoticExperiment(expType, body, customTargetWorldPos = null)','function legacyExecuteExoticExperiment(expType, body, customTargetWorldPos = null)')
    replace('        buildL5CosmicWeb();\n        bindUI();','        buildL5CosmicWeb();\n        initMotion();\n        bindUI();')
    replace('      const rawDt = Math.min(clock.getDelta(), 0.05);','      const actualFrameDt=clock.getDelta();\n      const rawDt = Math.min(actualFrameDt, 0.05);')
    replace('      fpsTimer += rawDt;','      fpsTimer += actualFrameDt;')
    replace('      for (const b of celestialBodies) {','      updateMotion(dt);\n      for (const b of celestialBodies) {')
    replace('      updateProbes(dt);','      updateProbes(dt);\n      updateLab(dt);\n      if(state.currentScale===\'L2\')recordBlackHoleTrails(dt);')
    replace('      syncDynamicsUI();\n    }\n\n    function toggleCleanHud','      syncDynamicsUI();\n    }\n\n    function toggleCleanHud')
    replace("      if(fpsTimer===0)updateDynamicsValues();","      if(fpsTimer===0){updateDynamicsValues();syncMotionUI();}\n      syncMotionTrailVisibility();\n      scene.children.forEach(o=>{if(o.userData.skyBackground)o.position.copy(camera.position);});")
    replace('      scene.add(stars);','      stars.userData.skyBackground=true;\n      scene.add(stars);')
    replace('      resetDynamics();\n      celestialBodies.forEach(resetBody);','      resetLab();\n      resetDynamics();\n      celestialBodies.forEach(resetBody);')
    replace('        const fx = activeExoticEffects[i];',"        const fx = activeExoticEffects[i];\n        const active=fx.body.scaleKey===state.currentScale;for(const key of ['miniBH','streamPts','bubble','cloud','beam'])if(fx[key])fx[key].visible=active;if(!active)continue;")
    replace('    function resetBody(body) {','    function resetBody(body) {\n      resetLab(body);')
    replace("      syncDynamicsUI();\n      if(['L2','L4','L5'].includes(scaleKey))","      syncDynamicsUI();\n      frameOverview();\n      if(['L2','L4','L5'].includes(scaleKey))")
    replace('startCamTransition(fittedCameraPosition(meta.camPos),new THREE.Vector3(...meta.target));','frameOverview();')
    replace('b.mesh.rotation.y += b.rotSpeed * dt * 60;',"if(b.id!=='moon')b.mesh.rotation.y += b.rotSpeed * dt * (motion.labClock?.02:60);")
    replace("      document.getElementById('btn-layer-labels').setAttribute('aria-pressed',String(dynamics.labels));","      syncMotionTrailVisibility();\n      document.getElementById('btn-layer-labels').setAttribute('aria-pressed',String(dynamics.labels));")
    replace("      if(state.lockedBody?.orbit){", "      rows.push(['参考系',motion.frame==='external'?'外部 / 银河':'随动 / 共动']);\n      if(key==='L1')rows.push(['太阳系历元',motion.years.toFixed(3)+' 年'],['太阳公转速度','约 230 km/s'],['全系统动量',physicalMomentum().length().toExponential(1)]);\n      if(key==='L5')rows.push(['空间尺度因子',motion.webScale.toFixed(3)],['微波背景温度',(2.725/motion.webScale).toFixed(3)+' K']);\n      if(state.lockedBody?.physical){const b=state.lockedBody.physical;rows.push(['相对日心速度',(b.v.clone().sub(motion.solar[0].v).length()*AU_KM/YEAR_SECONDS).toFixed(2)+' km/s']);}\n      else if(state.lockedBody?.orbit){")
    replace("      if(state.currentScale==='L4')clusterNodes", "      if(state.currentScale==='L1'&&motion.frame==='external'){const el=document.createElement('span');el.className='body-label';el.textContent='银河公转方向 · 约 230 km/s';root.appendChild(el);dynamics.labelsDOM.push({el,object:motion.forwardLabel});}\n      if(state.currentScale==='L3'){const star=galaxyTracers.find(t=>t.isSun);if(star){const el=document.createElement('span');el.className='body-label';el.textContent='太阳所在区域';root.appendChild(el);dynamics.labelsDOM.push({el,object:star.dot});}}\n      if(state.currentScale==='L4')clusterNodes")
    replace('if(item.body)item.body.mesh.getWorldPosition(world);else world.copy(item.position);','if(item.body)item.body.mesh.getWorldPosition(world);else if(item.object)item.object.getWorldPosition(world);else world.copy(item.position);')
    replace("L1:['太阳系 · 引力与轨道','内侧行星公转更快。点击行星跟随，释放探针观察引力弯曲。','开普勒椭圆轨道与实际偏心率；距离非线性压缩，角速度由归一化 GM / a³ 决定。']", "L1:['太阳系 · 穿行银河','太阳系整体向前，行星围绕移动的太阳运行。可切换银河与日心参考。','AU / 年 / 太阳质量的速度 Verlet 积分，太阳反射运动与行星摄动；显示距离压缩，非 JPL 历表。']") if "L1:['太阳系 · 引力与轨道'" in s else None
    replace("L4:['超星系团 · 汇向巨引源','追踪星系团间的物质流，观察引力汇聚与轨迹弯曲。','软化引力场下的测试粒子积分。星系团中心固定，忽略粒子自引力；不是全 N 体宇宙学模拟。']", "L4:['超星系团 · 引力流动','节点也在相互引力中运动，星系与物质流随移动引力场演化。','8 个归一化节点的软化 N 体模型与测试粒子；不是实测星系坐标或完整宇宙学模拟。']")
    replace("L5:['宇宙纤维网 · 深空的骨架','物质沿纤维流向高密度节点，宇宙空洞在其间展开。','程序化密度网与引力流示意。纤维几何固定；粒子受节点引力与纤维约束，不代表实际观测数据。']", "L5:['宇宙纤维网 · 空间的演化','空间膨胀与物质汇聚同时进行。切换物理坐标和共动坐标比较。','简化 ΛCDM 尺度因子与固定共动骨架；节点流动是约束示意，不代表实际观测重建。']")
    replace('      if (state.camTransition) {', "      if(state.camTransition&&state.lockedBody){const current=state.lockedBody.mesh.getWorldPosition(new THREE.Vector3()),delta=current.clone().sub(state.lastTrackedWorldPos);state.camTransition.endPos.add(delta);state.camTransition.endLook.add(delta);state.lastTrackedWorldPos.copy(current);}\n      if (state.camTransition) {")
    replace('function updateLeftPanelTelemetry(body) {','function updateLeftPanelTelemetry(body) {')
    replace('`${body.currentTemp} °C`','`${body.currentTemp.toFixed(1)} °C`')
    replace('`${body.atmoPct}%`','`${body.atmoPct.toFixed(2)}%`')
    replace('`${body.atmoPct.toFixed(2)}%`',"PLANET_PHYSICS[body.id]?.atmosphere?`${body.atmoPct.toFixed(2)}%`:'无大气'")
    replace('天体结构完整度','全球结构保留（能量尺度）')
    replace("projectiles:activeProjectiles.length", "projectiles:lab.projectiles.length+activeProjectiles.length,effects:lab.effects.length,activeMonsters:typeof monsterLab!=='undefined'?monsterLab.active.length:0,shattered:celestialBodies.filter(b=>!!b.shatterGroup).length,legacyEffects:activeExoticEffects.length,reports:lab.reports.slice(-3),frame:motion.frame,solarYears:motion.years,sunWorld:l1Sun.mesh.getWorldPosition(new THREE.Vector3()).toArray(),solar:motion.solar.map(b=>({id:b.id,p:b.p.toArray(),v:b.v.toArray(),mass:b.mass})),momentum:physicalMomentum().toArray(),clusterCenters:clusterNodes.map(n=>n.center.toArray()),webScale:motion.webScale,labClock:motion.labClock,experimentCount:EXPERIMENTS.length")
    replace('          })\n        };',"          }),predictImpact:(settings,id)=>scientificImpact(settings,id)\n        };")
    a=s.index('    function spawnProjectile({startPos,targetPos,targetBody=null')
    b=s.index('    function spawnRadiation(body,type,worldPoint=null)',a)
    s=s[:a]+(work/'flight.js').read_text(encoding='utf-8')+'\n'+s[b:]
    a=s.index('      for(let i=lab.projectiles.length-1;i>=0;i--){const p=lab.projectiles[i];if(p.key!==state.currentScale)',s.index('    function updateLab(dt)'))
    b=s.index('      for(let i=lab.effects.length-1;i>=0;i--)',a)
    s=s[:a]+'      tickLabProjectiles(dt);\n'+s[b:]
    if not s.rstrip().endswith('</html>'):s+='\n</html>\n'
    return s
