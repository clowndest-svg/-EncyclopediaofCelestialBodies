    // =========================================================================
    // Solar Smash 级 3D 立体挖空内核 + 爆星碎裂引擎 + 10 种高模 GLB 科幻/玄幻怪物实验室
    // =========================================================================
    const MONSTER_EXPERIMENTS = [
      ['worm',    '🪱', '超巨型噬星蠕虫', '钻穿地壳·双面熔岩挖空', 'monster'],
      ['zerg',    '🪲', '星际虫族利维坦', '骨肋母巢·48 飞龙菌毯蚀星', 'monster'],
      ['occ',     '👁️', 'OCC 混沌旧日巨眼', '三环眼轮·混沌歼星贯穿', 'monster'],
      ['fleet',   '🚀', '星际灭世舰队', '无畏舰队·灭绝令轨道齐射', 'monster'],
      ['redfish', '🐟', '宇宙深红巨鲲', '星海红鱼·赤金凤尾吞噬', 'monster'],
      ['snake',   '🐍', '宇宙吞世巨蛇', '连续巨躯·盘星赤道绞杀', 'monster'],
      ['dragon',  '🐉', '太古星穹神龙', '御雷盘霄·星河龙炎吐息', 'monster'],
      ['phoenix', '🔥', '焚天星凰', '双翼火雨·超新星涅槃俯冲', 'monster'],
      ['cthulhu', '🐙', '虚空章鱼魔神', '十条柔性巨触·锁星抽核', 'monster'],
      ['titan',   '⚔️', '灭星泰坦星神', '符文光剑·一剑劈裂半球', 'monster']
    ];
    const MONSTER_IDS = new Set(MONSTER_EXPERIMENTS.map(e => e[0]));
    // 明确标注哪些实验具备「💥 可爆星」毁灭级能力
    const PLANET_BUSTER_IDS = new Set([
      'antimatter', 'photoid', 'dyson', 'singularity', 'foil', 'vacuum',
      'worm', 'occ', 'fleet', 'snake', 'phoenix', 'titan'
    ]);
    const CARVE_HEAVY_IDS = new Set([
      'asteroid', 'comet', 'nuclear', 'laser', 'grb',
      'zerg', 'redfish', 'dragon', 'cthulhu'
    ]);
    const MONSTER_NOTES = {
      worm:    '【💥 可爆星】超巨型噬星蠕虫（4,600+面高模）：三瓣裂口锯齿颚与装甲背棘，直接钻穿星球地壳挖出立体熔岩孔洞并露出地幔内核！',
      zerg:    '【☄ 凿穿挖空】星际虫族利维坦（5,440面高模）：紫色叠层甲壳、骨质肋笼与发光绿孢囊，率领蝙蝠翼异虫飞龙群轰炸地表并播撒菌毯。',
      occ:     '【💥 可爆星】OCC 混沌旧日巨眼（5,900+面高模）：黑曜石炽红竖瞳 + 三层铭文古铜眼轮 + 10 条虚空触须，释放混沌紫红歼星射线击穿地壳！',
      fleet:   '【💥 可爆星】星际灭世舰队（高模无畏舰队）：1 艘六引擎双炮塔超级无畏舰率 12 艘战列护卫舰曲率跃迁，齐射轨道炮后轰出「灭绝令」爆星光柱！',
      redfish: '【☄ 凿穿挖空】宇宙深红巨鲲/红鱼（2,514面高模）：流线型赤金锦鲤鳞躯、飘逸鱼须与半透明发光分叉凤尾鳍，环绕摆尾撕裂大气并吞噬物质。',
      snake:   '【💥 可爆星】宇宙吞世巨蛇（高模蛇首+连续蒙皮巨躯）：双角毒牙蛇首衔接无缝翡翠暗金巨躯，缠绕赤道剧烈绞杀并震裂整条赤道熔岩带！',
      dragon:  '【☄ 凿穿挖空】太古星穹神龙（高模龙首+连续蒙皮龙躯）：鹿角龙须与金青龙鳞伴随实时 3D 蓝白雷电弧盘旋九霄，吐出星河龙炎！',
      phoenix: '【💥 可爆星】焚天星凰（4,944面高模）：金喙火冠与双侧 14 根独立羽翎挥舞，降下恒星火雨后发动超新星涅槃俯冲引爆整颗行星！',
      cthulhu: '【☄ 凿穿挖空】虚空章鱼魔神（高模巨首+10条连续柔性巨触）：深蓝紫星云伞盖、怒眉青瞳与 10 条带发光吸盘的柔性触手死死锁星抽核。',
      titan:   '【💥 可爆星】灭星泰坦星神（高模装甲巨像+符文光剑）：双角圣铠、方舟核心、四翼推进器，挥舞横跨星球的蓝白符文巨剑一剑劈裂半球！'
    };

    const monsterLab = { active: [], scale: 1.2, power: 4, autoBust: false };

    // -------------------------------------------------------------------------
    // Solar Smash 风格行星内部结构（沸腾岩浆地幔 0.84R + 白热液态核心 0.42R）
    // -------------------------------------------------------------------------
    function ensurePlanetInterior(body) {
      if (!body || body.interiorGroup) return;
      const planet = PLANET_PHYSICS[body.id];
      if (!planet || !planet.solid) return;
      const g = new THREE.Group(), R = body.radius;
      const mantleMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec3 vP,vN,vV;void main(){vP=normalize(position);vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
        fragmentShader: `varying vec3 vP,vN,vV;uniform float uTime;
          float h(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
          float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
          void main(){
            float m1=n(vP*7.+vec3(uTime*.35,-uTime*.22,uTime*.18));
            float m2=n(vP*16.-vec3(uTime*.55,uTime*.4,0.));
            float boil=m1*.62+m2*.38;
            float facing=max(0.,dot(normalize(vN),normalize(vV)));
            vec3 darkCrust=vec3(0.18,0.02,0.005);
            vec3 magma=vec3(0.88,0.24,0.02);
            vec3 hotCore=vec3(1.0,0.82,0.36);
            vec3 col=mix(darkCrust,magma,smoothstep(0.28,0.62,boil));
            col=mix(col,hotCore,smoothstep(0.62,0.90,boil+facing*.20));
            gl_FragColor=vec4(col*0.92,1.0);
          }`
      });
      const mantle = new THREE.Mesh(new THREE.SphereGeometry(R * 0.85, 48, 32), mantleMat);
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(R * 0.42, 32, 24),
        new THREE.MeshBasicMaterial({ color: 0xffeba0 })
      );
      const coreHalo = glowSprite(0xff6a12, R * 1.25, 0.45);
      g.add(mantle, core, coreHalo);
      g.userData.mantleMat = mantleMat;
      body.mesh.add(g);
      body.interiorGroup = g;
    }

    // -------------------------------------------------------------------------
    // Solar Smash 级爆星大解体（超新星冲击环 + 8 块弧形大陆壳 + 130 熔岩块 + 900 火花流 + 白热星核）
    // -------------------------------------------------------------------------
    function triggerPlanetShatter(body, accentHex = 0xff6b2b) {
      if (!body || body.shatterGroup) return;
      const g = new THREE.Group(), R = body.radius, rng = deterministicRandom(Math.floor(dynamics.time * 100) + 777);

      // 1. 暴露在宇宙中的白热沸腾行星核心（清晰层次不过曝）
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(R * 0.42, 36, 28),
        new THREE.MeshBasicMaterial({ color: 0xffe48c })
      );
      const coreGlow = glowSprite(accentHex, R * 3.1, 0.58);
      const coreGlow2 = glowSprite(0xffc966, R * 1.65, 0.52);
      g.add(core, coreGlow, coreGlow2);

      // 2. Solar Smash 标志性超巨型倾斜赤道爆星冲击波环！
      const shockRingMat = new THREE.ShaderMaterial({
        uniforms: { uAge: { value: 0 }, uColor: { value: new THREE.Color(accentHex) } },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `varying vec2 vUv;uniform float uAge;uniform vec3 uColor;void main(){
          float r=length((vUv-.5)*2.);
          float front=smoothstep(0.55,0.88,r)*smoothstep(1.0,0.88,r);
          float inner=smoothstep(0.32,0.84,r)*0.25;
          float a=(front+inner)*max(0.,1.-uAge*0.38)*0.78;
          if(a<0.01)discard;
          vec3 col=mix(uColor,vec3(1.,0.92,0.75),front*0.6);
          gl_FragColor=vec4(col*0.95,min(0.82,a));
        }`,
        transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
      });
      const shockRing = new THREE.Mesh(new THREE.PlaneGeometry(R * 2.4, R * 2.4), shockRingMat);
      shockRing.rotation.x = Math.PI * 0.42;
      shockRing.rotation.y = 0.25;
      g.add(shockRing);

      // 3. 8 块真实弧形球壳大陆板块碎片（外焦黑熔岩裂谷地壳 + 内炽热岩浆断面！）
      const shellMat = new THREE.ShaderMaterial({
        uniforms: { uAccent: { value: new THREE.Color(accentHex) } },
        vertexShader: `varying vec3 vN,vV,vP;void main(){vP=normalize(position);vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
        fragmentShader: `varying vec3 vN,vV,vP;uniform vec3 uAccent;
          void main(){
            if(!gl_FrontFacing){gl_FragColor=vec4(mix(uAccent,vec3(1.,.55,.15),0.5)*0.82,1.);return;}
            float f1=sin(vP.x*18.+sin(vP.y*11.)*2.4)*cos(vP.z*15.+cos(vP.x*9.)*2.0);
            float f2=sin((vP.x-vP.z)*26.+vP.y*19.)*0.5;
            float crack=smoothstep(0.68,0.92,abs(f1*0.65+f2*0.35));
            vec3 crust=mix(vec3(0.08,0.12,0.18),vec3(0.18,0.16,0.15),smoothstep(-0.3,0.4,f1));
            vec3 col=crust*(0.28+0.55*max(0.,dot(normalize(vN),normalize(vec3(.6,.7,.5)))))+mix(uAccent,vec3(1.,.55,.15),0.45)*crack*0.88;
            gl_FragColor=vec4(col,1.);
          }`,
        side: THREE.DoubleSide
      });
      const chunks = [];
      for (let i = 0; i < 8; i++) {
        const phi0 = (i % 4) * Math.PI * 0.5 + 0.08;
        const th0 = i < 4 ? 0.14 : Math.PI * 0.52;
        const capGeo = new THREE.SphereGeometry(R * 0.99, 14, 10, phi0, Math.PI * 0.41, th0, Math.PI * 0.38);
        const cap = new THREE.Mesh(capGeo, shellMat);
        const midPhi = phi0 + Math.PI * 0.2, midTh = th0 + Math.PI * 0.19;
        const dir = new THREE.Vector3(-Math.cos(midPhi) * Math.sin(midTh), Math.cos(midTh), Math.sin(midPhi) * Math.sin(midTh)).normalize();
        g.add(cap);
        chunks.push({ mesh: cap, dir, speed: R * (0.28 + rng() * 0.24), rot: new THREE.Vector3(rng() - .5, rng() - .5, rng() - .5).multiplyScalar(0.95) });
      }

      // 4. 130 块飞散旋转的深色熔岩裂纹岩块（轮廓锐利，拒绝泛白）
      const rockMat = makeStudioSculptShader({ base: [0.32, 0.22, 0.18, 1], emissive: [0.40, 0.12, 0.02], metallic: 0.18, roughness: 0.82 });
      const nChunks = document.body.dataset.layout === 'mobile' ? 56 : 130;
      const dGeo = new THREE.DodecahedronGeometry(1, 0);
      const dCols = new Float32Array(dGeo.attributes.position.count * 3).fill(1);
      dGeo.setAttribute('color', new THREE.BufferAttribute(dCols, 3));
      for (let i = 0; i < nChunks; i++) {
        const a = rng() * Math.PI * 2, ph = Math.acos(2 * rng() - 1);
        const dir = new THREE.Vector3(Math.sin(ph) * Math.cos(a), Math.cos(ph), Math.sin(ph) * Math.sin(a));
        const sz = R * (0.045 + rng() * 0.11);
        const m = new THREE.Mesh(dGeo, rockMat);
        m.scale.set(sz * (0.7 + rng() * 0.8), sz * (0.7 + rng() * 0.7), sz * (0.7 + rng() * 0.8));
        m.position.copy(dir).multiplyScalar(R * (0.68 + rng() * 0.42));
        m.rotation.set(rng() * 6.28, rng() * 6.28, rng() * 6.28);
        g.add(m);
        chunks.push({ mesh: m, dir, speed: R * (0.45 + rng() * 1.15), rot: new THREE.Vector3(rng() - .5, rng() - .5, rng() - .5).multiplyScalar(2.8) });
      }

      // 5. 900 颗四散爆发的炽热星尘火花流
      const pN = document.body.dataset.layout === 'mobile' ? 360 : 900;
      const pPos = new Float32Array(pN * 3), pCol = new Float32Array(pN * 3), pVel = new Float32Array(pN * 3);
      const cA = new THREE.Color(accentHex), cB = new THREE.Color(0xfff4c2);
      for (let i = 0; i < pN; i++) {
        const a = rng() * Math.PI * 2, ph = Math.acos(2 * rng() - 1);
        const dx = Math.sin(ph) * Math.cos(a), dy = Math.cos(ph), dz = Math.sin(ph) * Math.sin(a);
        const r0 = R * (0.55 + rng() * 0.55), spd = R * (0.75 + rng() * 2.2);
        pPos[i * 3] = dx * r0; pPos[i * 3 + 1] = dy * r0; pPos[i * 3 + 2] = dz * r0;
        pVel[i * 3] = dx * spd; pVel[i * 3 + 1] = dy * spd; pVel[i * 3 + 2] = dz * spd;
        cA.clone().lerp(cB, rng() * 0.65).toArray(pCol, i * 3);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
      const sparks = glowPoints(pGeo, Math.max(0.05, R * 0.032), 0.96);
      g.add(sparks);

      body.mesh.visible = false;
      if (body.cloudsMesh) body.cloudsMesh.visible = false;
      if (body.atmoMesh) body.atmoMesh.visible = false;
      body.meshGroup.add(g);
      body.shatterGroup = g;
      body.shatterChunks = chunks;
      body.shatterShock = shockRing;
      body.shatterSparks = { pts: sparks, vel: pVel };
      body.shatterAge = 0;
      body.integrity = 0;
      body.statusText = '💥 星体已彻底爆星解体（点击“单目标复原”可 100% 还原）';
      updateLeftPanelTelemetry(body);
      if (typeof syncSmashMeter === 'function') syncSmashMeter(body);
      triggerScreenFlash(0.85);
      audioEngine.playImpact(1.6);
      showToast(`💥 爆星达成！${ENCYCLOPEDIA[body.id]?.name || body.id} 已彻底裂解为熔岩星核与小行星碎带！`, 'amber');
    }

    function monsterBasis(body, worldPoint = null) {
      const center = body.mesh.getWorldPosition(new THREE.Vector3());
      const toCam = camera.position.clone().sub(center);
      const fwdWorld = worldPoint
        ? worldPoint.clone().sub(center).normalize()
        : (toCam.lengthSq() > 1e-4 ? toCam.normalize() : new THREE.Vector3(0, 0.25, 1).normalize());
      const invQ = body.meshGroup.getWorldQuaternion(new THREE.Quaternion()).invert();
      const F = fwdWorld.clone().applyQuaternion(invQ).normalize();
      let upRef = new THREE.Vector3(0, 1, 0);
      if (Math.abs(F.dot(upRef)) > 0.92) upRef.set(1, 0, 0);
      const R = new THREE.Vector3().crossVectors(upRef, F).normalize();
      const U = new THREE.Vector3().crossVectors(F, R).normalize();
      return { F, R, U };
    }

    function pullBackForBattle(body) {
      if (!body) return;
      const center = body.mesh.getWorldPosition(new THREE.Vector3());
      const vec = camera.position.clone().sub(center);
      const dist = vec.length(), minDist = body.radius * 6.2;
      if (dist < minDist) {
        const dir = dist > 1e-3 ? vec.normalize() : new THREE.Vector3(0, 0.25, 1).normalize();
        startCamTransition(center.clone().addScaledVector(dir, minDist), center.clone());
      }
    }

    function localGroupDirToMeshLocal(body, dirInGroup) {
      return dirInGroup.clone().normalize().applyQuaternion(body.mesh.quaternion.clone().invert()).normalize();
    }

    function playMonsterRoar(type) {
      if (!audioEngine || !audioEngine.enabled || !audioEngine.ctx) return;
      try {
        const ctx = audioEngine.ctx, now = ctx.currentTime;
        const osc = ctx.createOscillator(), osc2 = ctx.createOscillator(), g = ctx.createGain();
        const isHigh = ['phoenix', 'fleet', 'titan'].includes(type);
        const isEldritch = ['occ', 'cthulhu', 'zerg'].includes(type);
        osc.type = isEldritch ? 'sawtooth' : isHigh ? 'triangle' : 'sawtooth';
        osc2.type = 'sine';
        const f0 = isHigh ? 240 : isEldritch ? 68 : 92;
        osc.frequency.setValueAtTime(f0, now);
        osc.frequency.exponentialRampToValueAtTime(isHigh ? 88 : 34, now + 1.1);
        osc2.frequency.setValueAtTime(f0 * 1.48, now);
        osc2.frequency.exponentialRampToValueAtTime(28, now + 1.1);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.16, now + 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
        osc.connect(g); osc2.connect(g); g.connect(ctx.destination);
        osc.start(now); osc2.start(now); osc.stop(now + 1.2); osc2.stop(now + 1.2);
      } catch {}
    }

    function monsterStrike(body, type, dirInGroup, energyScale = 1, craterFrac = 0.22, colorHex = 0xff7b29, labelPhase = '毁灭打击') {
      if (!body || body.isDestroyed) return;
      const planet = PLANET_PHYSICS[body.id] || PLANET_PHYSICS.earth;
      const effPower = monsterLab.autoBust ? 6 : monsterLab.power;
      const powerMult = Math.pow(10, (effPower - 1) * 0.95) * (0.65 + monsterLab.scale * 0.45);
      const energy = 2.4e24 * energyScale * powerMult;
      const physical = scientificImpact({ diamKm: 28 * monsterLab.scale, velKms: 56, material: 'iron', atmosphere: lab.atmosphere }, body.id);
      const meshNormal = localGroupDirToMeshLocal(body, dirInGroup);
      ensurePlanetInterior(body);
      const report = impactReport(body, type, physical, energy);
      report.phase = labelPhase;
      // 挖出足够大而醒目的 Solar Smash 立体熔岩缺口！
      const craterR = planet.radius * THREE.MathUtils.clamp(craterFrac * (0.85 + effPower * 0.24), 0.10, 0.44);
      if (planet.solid) craterScar(body, meshNormal, { ...physical, craterMeters: craterR * 2 });

      const shock = makeSurfaceShock(body, meshNormal, colorHex, energy, 1.05, 0.038);
      const shock2 = makeSurfaceShock(body, meshNormal, 0xfff0c8, energy, 0.65, 0.058);
      const root = new THREE.Group();
      body.mesh.add(root);
      root.position.copy(meshNormal).multiplyScalar(body.radius * 1.015);
      root.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), meshNormal);
      const sz = body.radius * (0.08 + effPower * 0.018) * state.vfxIntensity;
      const hot = glowSprite(colorHex, sz * 6.5, 0.96);
      const flash = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(0.02, sz * 1.25), 18, 14),
        new THREE.MeshBasicMaterial({ color: 0xfff5d6, transparent: true, opacity: 0.92, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      root.add(hot, flash);

      const count = document.body.dataset.layout === 'mobile' ? 95 : 220;
      const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3), parts = [], rng = deterministicRandom(report.id * 37 + 91);
      const t1 = new THREE.Vector3(0, 1, 0).cross(meshNormal).normalize(); if (t1.lengthSq() < 0.1) t1.set(1, 0, 0);
      const t2 = meshNormal.clone().cross(t1).normalize();
      const cA = new THREE.Color(colorHex), cB = new THREE.Color(0xfff1c4);
      for (let i = 0; i < count; i++) {
        const a = rng() * Math.PI * 2, cone = 0.22 + rng() * 1.05, spd = physical.speed * (0.06 + rng() * 0.28);
        const v = meshNormal.clone().addScaledVector(t1, Math.cos(a) * cone).addScaledVector(t2, Math.sin(a) * cone).normalize().multiplyScalar(spd);
        parts.push({ p: meshNormal.clone().multiplyScalar(planet.radius * 1.0001), v, landed: false });
        cA.clone().lerp(cB, rng() * 0.55).toArray(colors, i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const debris = glowPoints(geo, Math.max(0.032, body.radius * 0.016), 0.95);
      body.mesh.add(debris); debris.frustumCulled = false;

      lab.effects.push({ kind: 'blast', body, root, hot, flash, shock, shock2, debris, parts, planet, plume: null, age: 0, duration: 7.0, size: sz, report });
      audioEngine.playImpact(Math.min(1.5, 0.6 + effPower * 0.15));
      triggerScreenFlash(Math.min(0.42, 0.16 + effPower * 0.04));
      if (typeof syncSmashMeter === 'function') syncSmashMeter(body);
      const canBust = PLANET_BUSTER_IDS.has(type) || effPower >= 5;
      if (canBust && planet.solid && (effPower >= 6 || (effPower >= 5 && body.integrity <= 38) || body.integrity <= 8)) {
        triggerPlanetShatter(body, colorHex);
      }
      renderLabReport();
    }

    // -------------------------------------------------------------------------
    // 10 种高模 GLB 怪物 & 动态连续蒙皮构造器
    // -------------------------------------------------------------------------
    function buildWorm(R, S) {
      const grp = new THREE.Group();
      const segs = [], N = 22;
      const head = new THREE.Group();
      const headModel = instantiateGLB('worm_head', R * 0.52 * S);
      head.add(headModel);
      head.add(glowSprite(0xff5a18, R * 0.95 * S, 0.36));
      grp.add(head); segs.push(head);
      for (let i = 1; i < N; i++) {
        const t = i / (N - 1);
        const sc = R * 0.52 * S * (Math.sin(Math.pow(1 - t, 0.68) * Math.PI * 0.85) * 0.85 + 0.22);
        const sg = new THREE.Group();
        sg.add(instantiateGLB('worm_segment', sc));
        grp.add(sg); segs.push(sg);
      }
      return { grp, segs };
    }

    function buildZerg(R, S) {
      const grp = new THREE.Group();
      const leviathan = new THREE.Group();
      leviathan.add(instantiateGLB('zerg_leviathan', R * 0.52 * S));
      leviathan.add(glowSprite(0x4ade80, R * 1.15 * S, 0.28));
      grp.add(leviathan);

      // 36 只高模蝙蝠翼异虫飞龙 (zerg_mutalisk.glb — 彻底告别圆锥+方块!)
      const flyers = [];
      const rng = deterministicRandom(404);
      const count = document.body.dataset.layout === 'mobile' ? 20 : 36;
      for (let i = 0; i < count; i++) {
        const fg = new THREE.Group();
        const model = instantiateGLB('zerg_mutalisk', R * (0.14 + rng() * 0.05) * S);
        fg.add(model);
        grp.add(fg);
        flyers.push({ grp: fg, model, angle: rng() * Math.PI * 2, elev: (rng() - 0.5) * 1.8, speed: 1.9 + rng() * 1.7, rad: R * (1.28 + rng() * 0.85), phase: rng() * 6.28 });
      }

      const creepMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uSpread: { value: 0 } },
        vertexShader: `varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `varying vec3 vP;uniform float uTime,uSpread;
          float h(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
          float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
          void main(){float w=n(vP*6.+vec3(uTime*.35))*.6+n(vP*14.-vec3(uTime*.5))*.4;float veins=smoothstep(.44,.70,w);float a=smoothstep(1.-uSpread,.96-uSpread*.45,w)*veins*.86;if(a<.02)discard;vec3 col=mix(vec3(.48,.14,.78),vec3(.32,1.,.52),smoothstep(.50,.76,w));gl_FragColor=vec4(col,a);}`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      });
      const creepShell = new THREE.Mesh(new THREE.SphereGeometry(R * 1.024, 48, 32), creepMat);
      grp.add(creepShell);
      return { grp, leviathan, flyers, creepShell, creepMat };
    }

    function buildOCC(R, S) {
      const grp = new THREE.Group(), entity = new THREE.Group();
      const riftMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `varying vec2 vUv;uniform float uTime;void main(){vec2 p=(vUv-.5)*2.;float r=length(p),a=atan(p.y,p.x);float sw=sin(a*6.-r*10.+uTime*4.)*.5+.5;float ring=exp(-pow((r-.55)/.22,2.))*sw;float core=exp(-r*r*5.);vec3 col=mix(vec3(.55,.06,.88),vec3(1.,.16,.32),sw)+vec3(1.,.72,.28)*core;float al=clamp(ring*.85+core*.7,0.,1.)*smoothstep(1.,.32,r);if(al<.01)discard;gl_FragColor=vec4(col,al);}`,
        transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
      });
      const rift = new THREE.Mesh(new THREE.PlaneGeometry(R * 2.7 * S, R * 2.7 * S), riftMat);
      rift.position.z = -R * 0.25 * S;
      entity.add(rift);

      // 高光黑曜石竖瞳旧日巨眼
      const eyeMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uCharge: { value: 0 } },
        vertexShader: `varying vec3 vN,vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
        fragmentShader: `varying vec3 vN,vV;uniform float uTime,uCharge;void main(){
          vec3 N=normalize(vN),V=normalize(vV);
          float facing=max(0.,dot(N,V));
          vec3 rightV=normalize(cross(vec3(0.,1.,0.),V));
          vec3 upV=normalize(cross(V,rightV));
          float ex=dot(N,rightV), ey=dot(N,upV);
          float irisR=length(vec2(ex,ey));
          float slitW=0.052+uCharge*0.032;
          float slit=smoothstep(slitW,slitW+0.085,abs(ex)/max(0.08,0.62-abs(ey)*1.12));
          float irisMask=smoothstep(0.64,0.42,irisR);
          float fiber=0.72+0.28*sin(atan(ey,ex)*32.+uTime*4.5+irisR*20.);
          vec3 sclera=vec3(0.04,0.02,0.06)+vec3(0.32,0.28,0.42)*pow(max(0.,dot(N,normalize(vec3(.5,.7,.6)))),24.);
          vec3 iris=mix(vec3(1.0,0.08,0.12),vec3(1.0,0.82,0.20),smoothstep(0.48,0.14,irisR))*fiber*(1.15+uCharge*0.95);
          vec3 col=mix(sclera,iris,irisMask);
          col=mix(vec3(0.01,0.0,0.02),col,slit);
          col+=vec3(0.88,0.28,1.0)*pow(1.0-facing,3.0)*0.95;
          gl_FragColor=vec4(col,1.);
        }`
      });
      entity.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.44 * S, 40, 32), eyeMat));

      // 三层高模铭文古铜炽天使眼轮 (occ_ring.glb) + 连续平滑暗影触须冠 (occ_tentacles.glb)
      const rings = [];
      for (let i = 0; i < 3; i++) {
        const rg = instantiateGLB('occ_ring', R * (0.66 + i * 0.20) * S);
        entity.add(rg); rings.push(rg);
      }
      const tentCrown = instantiateGLB('occ_tentacles', R * 0.72 * S);
      entity.add(tentCrown);

      const beamMat = new THREE.MeshBasicMaterial({ color: 0xe879f9, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.08 * S, R * 0.22 * S, R * 4.4, 16, 1, true), beamMat);
      beam.rotation.x = Math.PI / 2; beam.position.z = R * 2.2;
      const beamCore = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.032 * S, R * 0.075 * S, R * 4.4, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      beamCore.rotation.x = Math.PI / 2; beamCore.position.z = R * 2.2;
      entity.add(beam, beamCore);
      entity.add(glowSprite(0xd946ef, R * 2.0 * S, 0.58));
      grp.add(entity);
      return { grp, entity, riftMat, eyeMat, rings, tentCrown, beam, beamCore };
    }

    function buildFleet(R, S) {
      const grp = new THREE.Group();
      const flagship = new THREE.Group();
      flagship.add(instantiateGLB('fleet_flagship', R * 0.42 * S));
      flagship.add(glowSprite(0x38bdf8, R * 1.05 * S, 0.28));
      const mainBeamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      const mainBeam = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.065 * S, R * 0.20 * S, R * 4.5, 16, 1, true), mainBeamMat);
      mainBeam.rotation.x = Math.PI / 2; mainBeam.position.z = R * 2.4;
      const mainCore = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.025 * S, R * 0.072 * S, R * 4.5, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      mainCore.rotation.x = Math.PI / 2; mainCore.position.z = R * 2.4;
      flagship.add(mainBeam, mainCore);
      grp.add(flagship);

      const escorts = [];
      for (let i = 0; i < 12; i++) {
        const ship = new THREE.Group();
        ship.add(instantiateGLB('fleet_escort', R * 0.22 * S));
        ship.add(glowSprite(0x38bdf8, R * 0.55 * S, 0.42));
        const a = (i / 12 - 0.5) * 1.45, row = i % 2;
        grp.add(ship);
        escorts.push({ ship, a, row, elev: (row ? 0.52 : -0.45) + Math.sin(i * 1.7) * 0.25, warpDelay: 0.02 + i * 0.015 });
      }
      return { grp, flagship, escorts, mainBeam, mainCore, bolts: [] };
    }

    function buildRedFish(R, S) {
      const grp = new THREE.Group();
      const fish = new THREE.Group();
      fish.add(instantiateGLB('redfish', R * 0.72 * S));
      fish.add(glowSprite(0xff4433, R * 1.35 * S, 0.32));
      grp.add(fish);
      // 环绕巨鲲的赤金星海流萤粒子带
      const nP = 180, pPos = new Float32Array(nP * 3), pCol = new Float32Array(nP * 3), rng = deterministicRandom(520);
      for (let i = 0; i < nP; i++) {
        pPos[i * 3] = (rng() - .5) * R * 1.2; pPos[i * 3 + 1] = (rng() - .5) * R * 1.0; pPos[i * 3 + 2] = -rng() * R * 2.6;
        new THREE.Color(i % 2 ? 0xfbbf24 : 0xff3b2f).toArray(pCol, i * 3);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
      const trail = glowPoints(pGeo, R * 0.055, 0.85);
      fish.add(trail);
      return { grp, fish, trail };
    }

    function buildSnakeOrDragon(R, S, isDragon = false) {
      const grp = new THREE.Group();
      const head = new THREE.Group();
      head.add(instantiateGLB(isDragon ? 'dragon_head' : 'snake_head', R * 0.42 * S));
      head.add(glowSprite(isDragon ? 0x38bdf8 : 0x10b981, R * 0.95 * S, 0.32));
      const breathMat = new THREE.MeshBasicMaterial({ color: isDragon ? 0x38bdf8 : 0x34d399, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      const breath = new THREE.Mesh(new THREE.ConeGeometry(R * 0.24 * S, R * 2.5 * S, 16, 1, true), breathMat);
      breath.rotation.x = -Math.PI / 2; breath.position.z = R * 1.5 * S;
      head.add(breath);
      grp.add(head);

      // 单一连续高模平滑鳞甲巨躯 (DynamicTubeMesh — 彻底告别串珠感!)
      const tubeMat = makeStudioSculptShader(isDragon
        ? { base: [0.16, 0.58, 0.80, 1], emissive: [0.04, 0.16, 0.24], metallic: 0.48, roughness: 0.28 }
        : { base: [0.12, 0.50, 0.26, 1], emissive: [0.02, 0.10, 0.04], metallic: 0.38, roughness: 0.32 }
      );
      const nStations = 46, nRing = 14;
      const tube = createDynamicTube(
        nStations, nRing, tubeMat,
        (u) => R * S * (0.165 * Math.sin(Math.pow(1 - u, 0.62) * Math.PI * 0.85) + 0.025),
        (u, th) => {
          // 背部翡翠/天青龙鳞 + 腹部金色横纹龙腹！
          const isBelly = Math.max(0, -Math.sin(th));
          const sc = 0.78 + 0.22 * Math.sin(u * 80.0 + Math.cos(th * 8.0));
          return isDragon
            ? [0.45 * sc + 0.55 * isBelly, 0.85 * sc + 0.12 * isBelly, 1.0 * sc - 0.65 * isBelly]
            : [0.35 * sc + 0.62 * isBelly, 0.92 * sc - 0.12 * isBelly, 0.52 * sc - 0.32 * isBelly];
        }
      );
      grp.add(tube.mesh);

      // 神龙额外附带实时跃动 3D 闪电弧！
      let bolts = null;
      if (isDragon) {
        bolts = [];
        for (let b = 0; b < 5; b++) {
          const line = makeLine(Array.from({ length: 14 }, () => new THREE.Vector3()), 0x7dd3fc, 0.92);
          grp.add(line); bolts.push(line);
        }
      }
      return { grp, head, breath, tube, nStations, bolts, spineBuf: Array.from({ length: nStations }, () => new THREE.Vector3()) };
    }

    function buildPhoenix(R, S) {
      const grp = new THREE.Group(), bird = new THREE.Group();
      const sc = R * 0.68 * S;
      bird.add(instantiateGLB('phoenix_body', sc));
      const wingL = new THREE.Group(); wingL.position.set(-R * 0.10 * S, R * 0.08 * S, R * 0.05 * S); wingL.add(instantiateGLB('phoenix_wing_l', sc));
      const wingR = new THREE.Group(); wingR.position.set(R * 0.10 * S, R * 0.08 * S, R * 0.05 * S); wingR.add(instantiateGLB('phoenix_wing_r', sc));
      bird.add(wingL, wingR);
      bird.add(glowSprite(0xff8c1a, R * 2.4 * S, 0.82));
      grp.add(bird);
      return { grp, bird, wingL, wingR };
    }

    function buildCthulhu(R, S) {
      const grp = new THREE.Group(), kraken = new THREE.Group();
      kraken.add(instantiateGLB('kraken_head', R * 0.62 * S));
      kraken.add(glowSprite(0x6366f1, R * 2.0 * S, 0.65));

      // 10 条连续平滑锥形巨触 (DynamicTubeMesh + 内侧发光青色吸盘色带，彻底告别圆球串!)
      const tentMat = makeStudioSculptShader({ base: [0.42, 0.24, 0.78, 1], emissive: [0.22, 0.12, 0.52], metallic: 0.20, roughness: 0.32 });
      const tentacles = [];
      const nSt = 18;
      for (let t = 0; t < 10; t++) {
        const a = (t / 10) * Math.PI * 2;
        const tube = createDynamicTube(
          nSt, 10, tentMat,
          (u) => R * S * (0.115 * Math.pow(1 - u, 1.15) + 0.012),
          (u, th) => {
            const sucker = Math.sin(th) < -0.55 && Math.sin(u * 42.0) > 0.25;
            return sucker ? [0.45, 1.0, 1.0] : [0.75 + 0.25 * u, 0.48 + 0.25 * u, 1.0];
          }
        );
        kraken.add(tube.mesh);
        tentacles.push({ a, tube, pts: Array.from({ length: nSt }, () => new THREE.Vector3()) });
      }
      grp.add(kraken);
      return { grp, kraken, tentacles };
    }

    function buildTitan(R, S) {
      const grp = new THREE.Group(), titan = new THREE.Group();
      const sc = R * 0.52 * S;
      titan.add(instantiateGLB('titan_body', sc));
      const swordPivot = new THREE.Group();
      swordPivot.position.set(R * 0.34 * S, -R * 0.08 * S, R * 0.24 * S);
      swordPivot.add(instantiateGLB('titan_sword', sc * 1.10));
      swordPivot.add(glowSprite(0x38bdf8, R * 0.95 * S, 0.35));
      titan.add(swordPivot);
      titan.add(glowSprite(0x38bdf8, R * 1.25 * S, 0.28));
      grp.add(titan);
      return { grp, titan, swordPivot };
    }

    function spawnMonsterExperiment(type, body, worldPoint = null) {
      if (!body || body.isDestroyed) { showToast('请先选择一个完整的目标行星或卫星', 'amber'); return; }
      const limit = document.body.dataset.layout === 'mobile' ? 4 : 7;
      if (monsterLab.active.length >= limit) cleanupMonster(monsterLab.active.shift());
      pullBackForBattle(body);
      const R = body.radius, S = monsterLab.scale;
      const basis = monsterBasis(body, worldPoint);
      let data, duration = 9.5;
      if (type === 'worm') { data = buildWorm(R, S); duration = 9.0; }
      else if (type === 'zerg') { data = buildZerg(R, S); duration = 10.0; }
      else if (type === 'occ') { data = buildOCC(R, S); duration = 9.5; }
      else if (type === 'fleet') { data = buildFleet(R, S); duration = 9.8; }
      else if (type === 'redfish') { data = buildRedFish(R, S); duration = 9.5; }
      else if (type === 'snake') { data = buildSnakeOrDragon(R, S, false); duration = 10.5; }
      else if (type === 'dragon') { data = buildSnakeOrDragon(R, S, true); duration = 10.0; }
      else if (type === 'phoenix') { data = buildPhoenix(R, S); duration = 9.2; }
      else if (type === 'cthulhu') { data = buildCthulhu(R, S); duration = 10.0; }
      else { data = buildTitan(R, S); duration = 9.5; }

      body.meshGroup.add(data.grp);
      const entry = {
        type, body, scaleKey: body.scaleKey, R, S, basis, data,
        age: 0, duration, struck: new Set(), initialScale: body.mesh.scale.clone()
      };
      monsterLab.active.push(entry);
      const meta = MONSTER_EXPERIMENTS.find(e => e[0] === type);
      document.getElementById('lab-phase').textContent = `${meta?.[2] || type} · 降临战场`;
      playMonsterRoar(type);
      showToast(`${meta?.[1] || '👾'} ${meta?.[2] || type} 已降临 ${ENCYCLOPEDIA[body.id]?.name || body.id}！`, 'amber');
      if (document.body.dataset.layout === 'mobile') togglePanel('right', true);
    }

    function cleanupMonster(m) {
      if (!m) return;
      if (m.data?.grp) disposeTree(m.data.grp);
      if (m.body && m.initialScale && !m.body.shatterGroup) m.body.mesh.scale.copy(m.initialScale);
    }

    function updateMonsters(dt) {
      for (const b of celestialBodies) {
        if (b.interiorGroup?.userData?.mantleMat) b.interiorGroup.userData.mantleMat.uniforms.uTime.value += dt;
        if (b.shatterGroup && b.shatterChunks) {
          b.shatterAge = (b.shatterAge || 0) + dt;
          const damp = Math.exp(-b.shatterAge * 0.22);
          for (const c of b.shatterChunks) {
            c.mesh.position.addScaledVector(c.dir, c.speed * dt * damp);
            c.mesh.rotation.x += c.rot.x * dt;
            c.mesh.rotation.y += c.rot.y * dt;
          }
          if (b.shatterShock) {
            b.shatterShock.material.uniforms.uAge.value = b.shatterAge;
            const sc = 1.0 + b.shatterAge * 2.85;
            b.shatterShock.scale.set(sc, sc, 1);
          }
          if (b.shatterSparks) {
            const pa = b.shatterSparks.pts.geometry.attributes.position, vel = b.shatterSparks.vel;
            for (let k = 0; k < pa.count; k++) {
              pa.setXYZ(k, pa.getX(k) + vel[k * 3] * dt * damp, pa.getY(k) + vel[k * 3 + 1] * dt * damp, pa.getZ(k) + vel[k * 3 + 2] * dt * damp);
            }
            pa.needsUpdate = true;
            b.shatterSparks.pts.material.opacity = Math.max(0.18, 0.96 - b.shatterAge * 0.14);
          }
          b.shatterGroup.rotation.y += dt * 0.12;
        }
      }
      if (!monsterLab.active.length) return;

      for (let i = monsterLab.active.length - 1; i >= 0; i--) {
        const m = monsterLab.active[i];
        if (m.scaleKey !== state.currentScale) { m.data.grp.visible = false; continue; }
        m.data.grp.visible = true;
        m.age += dt;
        const u = Math.min(1, m.age / m.duration), { F, R: Rt, U } = m.basis, rad = m.R;
        const posAt = (f, r, up) => new THREE.Vector3().addScaledVector(F, f * rad).addScaledVector(Rt, r * rad).addScaledVector(U, up * rad);

        if (m.type === 'worm') {
          const wormPt = (s) => {
            const prog = -2.6 + s * 5.8;
            const wave = Math.sin(s * 16 - m.age * 5.0) * 0.24 * Math.min(1, Math.abs(prog) * 0.75 + 0.15);
            return posAt(0.72 - Math.abs(prog) * 0.18, -prog * 0.92 + wave, -prog * 0.44 + Math.cos(s * 12) * 0.16);
          };
          m.data.segs.forEach((sg, idx) => {
            const s = u - idx * 0.020;
            const p = wormPt(s), pAhead = wormPt(s + 0.015);
            sg.position.copy(p); sg.lookAt(m.body.meshGroup.localToWorld(pAhead.clone()));
            sg.visible = p.length() > rad * 0.86 || idx === 0;
          });
          if (u > 0.28 && !m.struck.has('in')) { m.struck.add('in'); monsterStrike(m.body, 'worm', posAt(0.55, 0.76, 0.35), 1.9, 0.28, 0xff5a1f, '噬星蠕虫 · 咬穿地壳'); }
          if (u > 0.54 && !m.struck.has('out')) { m.struck.add('out'); monsterStrike(m.body, 'worm', posAt(0.45, -0.78, -0.35), 2.5, 0.32, 0xff3b14, '贯通星核破壳钻出'); }
        }
        else if (m.type === 'zerg') {
          const d = m.data;
          const levPos = posAt(0.72, 1.48 + Math.sin(u * 3.8) * 0.24, 0.92 + Math.cos(u * 2.8) * 0.16);
          d.leviathan.position.copy(levPos);
          d.leviathan.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
          d.flyers.forEach((fl, idx) => {
            const a = fl.angle + m.age * fl.speed;
            const dive = 1.0 + 0.26 * Math.sin(m.age * 3.5 + fl.phase);
            const rr = rad * (1.08 + (fl.rad / rad - 1.0) * dive * (1 - u * 0.18));
            const p = posAt(Math.sin(a) * rr / rad * 0.82, Math.cos(a) * rr / rad, Math.sin(a * 1.7 + fl.elev) * 0.72);
            fl.grp.position.copy(p);
            const pNext = posAt(Math.sin(a + 0.14) * rr / rad * 0.82, Math.cos(a + 0.14) * rr / rad, Math.sin((a + 0.14) * 1.7 + fl.elev) * 0.72);
            fl.grp.lookAt(m.body.meshGroup.localToWorld(pNext));
            fl.model.rotation.z = Math.sin(m.age * 14 + idx) * 0.32;
          });
          d.creepMat.uniforms.uTime.value = m.age;
          d.creepMat.uniforms.uSpread.value = Math.min(1, u * 1.6) * (u > 0.86 ? (1 - u) / 0.14 : 1);
          for (let k = 0; k < 4; k++) {
            if (u > 0.18 + k * 0.18 && !m.struck.has(k)) {
              m.struck.add(k);
              monsterStrike(m.body, 'zerg', posAt(0.82, (k - 1.5) * 0.42, Math.sin(k * 2.1) * 0.4), 1.0, 0.18, 0x4ade80, `虫族飞龙酸液轰炸 #${k + 1}`);
            }
          }
        }
        else if (m.type === 'occ') {
          const d = m.data;
          const hover = posAt(0.75, -1.42 + Math.sin(u * 2.4) * 0.14, 0.82 + Math.cos(u * 2.2) * 0.10);
          d.entity.position.copy(hover);
          d.entity.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
          const appear = Math.min(1, u * 6.0) * (u > 0.88 ? (1 - u) / 0.12 : 1);
          d.entity.scale.setScalar(Math.max(0.01, appear));
          d.riftMat.uniforms.uTime.value = m.age;
          d.eyeMat.uniforms.uTime.value = m.age;
          const firing = u > 0.24 && u < 0.82;
          d.eyeMat.uniforms.uCharge.value = firing ? 1.0 : Math.min(1, u / 0.24);
          d.rings.forEach((rg, k) => {
            rg.rotation.z += dt * (k % 2 ? 2.4 : -2.9) * (firing ? 2.0 : 1);
            rg.rotation.x = Math.sin(m.age * (1.1 + k * 0.45)) * 0.62;
            rg.rotation.y = Math.cos(m.age * (0.9 + k * 0.4)) * 0.62;
          });
          d.tentCrown.rotation.z += dt * 0.65;
          d.beam.material.opacity = firing ? 0.68 + 0.24 * Math.sin(m.age * 30) : 0;
          d.beamCore.material.opacity = firing ? 0.95 : 0;
          if (u > 0.28 && !m.struck.has(1)) { m.struck.add(1); monsterStrike(m.body, 'occ', posAt(0.65, -0.65, 0.35), 2.0, 0.26, 0xe879f9, 'OCC 混沌歼星凝视'); }
          if (u > 0.56 && !m.struck.has(2)) { m.struck.add(2); monsterStrike(m.body, 'occ', posAt(0.72, -0.42, 0.12), 2.6, 0.32, 0xff2a55, '旧日虚空裂隙撕裂'); }
        }
        else if (m.type === 'fleet') {
          const d = m.data;
          const warpIn = Math.min(1, u * 7.5), depart = u > 0.86 ? (u - 0.86) / 0.14 : 0;
          const shift = (1 - warpIn) * 3.0 + depart * 4.5;
          d.flagship.position.copy(posAt(0.75 + shift * 0.35, 1.56 + shift, 0.92));
          d.flagship.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
          d.escorts.forEach(e => {
            const w = THREE.MathUtils.clamp((u - e.warpDelay) * 8, 0, 1);
            const es = (1 - w) * 2.8 + depart * 4.5, rr = 1.72 + e.row * 0.34 + es;
            e.ship.position.copy(posAt(Math.sin(e.a) * rr * 0.85 + 0.45, Math.cos(e.a) * rr, e.elev + 0.32));
            e.ship.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
            e.ship.visible = w > 0.02;
          });
          if (u > 0.14 && u < 0.72 && Math.floor(m.age * 9.0) > d.bolts.length) {
            const shooter = d.escorts[d.bolts.length % d.escorts.length].ship;
            const bMesh = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.022, rad * 0.022, rad * 0.44, 6), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
            bMesh.rotation.x = Math.PI / 2;
            const bg = new THREE.Group(); bg.add(bMesh);
            const start = shooter.position.clone();
            const target = posAt(0.65 + Math.sin(d.bolts.length * 1.9) * 0.25, 0.65, Math.cos(d.bolts.length * 2.1) * 0.45);
            bg.position.copy(start); bg.lookAt(m.body.meshGroup.localToWorld(target.clone()));
            d.grp.add(bg); d.bolts.push({ grp: bg, start, target, t: 0 });
          }
          for (const b of d.bolts) { if (b.t < 1) { b.t = Math.min(1, b.t + dt * 2.8); b.grp.position.lerpVectors(b.start, b.target, b.t); if (b.t >= 1) b.grp.visible = false; } }
          const beamOn = u > 0.48 && u < 0.84;
          d.mainBeam.material.opacity = beamOn ? 0.74 + 0.22 * Math.sin(m.age * 32) : 0;
          d.mainCore.material.opacity = beamOn ? 0.96 : 0;
          for (let k = 0; k < 3; k++) {
            if (u > 0.20 + k * 0.12 && !m.struck.has(k)) {
              m.struck.add(k); monsterStrike(m.body, 'fleet', posAt(0.65, 0.68, (k - 1) * 0.38), 1.1, 0.18, 0x38bdf8, `护卫舰轨道饱和齐射 #${k + 1}`);
            }
          }
          if (u > 0.52 && !m.struck.has('main')) { m.struck.add('main'); monsterStrike(m.body, 'fleet', posAt(0.55, 0.78, 0.25), 3.0, 0.34, 0x38bdf8, '旗舰主炮 · 灭绝令贯星'); }
        }
        else if (m.type === 'redfish') {
          const d = m.data;
          const swimPt = (s) => {
            const ang = -1.1 + s * Math.PI * 2.5;
            const orbitR = 2.05 - Math.sin(THREE.MathUtils.clamp(s, 0, 1) * Math.PI) * 0.65;
            return posAt(Math.sin(ang) * orbitR * 0.78 + 0.35, Math.cos(ang) * orbitR, Math.sin(ang * 1.5) * 0.78);
          };
          const p = swimPt(u), pNext = swimPt(u + 0.02);
          d.fish.position.copy(p);
          d.fish.lookAt(m.body.meshGroup.localToWorld(pNext.clone()));
          d.fish.rotation.z += Math.sin(m.age * 6.5) * 0.18;
          if (u > 0.30 && !m.struck.has(1)) { m.struck.add(1); monsterStrike(m.body, 'redfish', posAt(0.75, 0.55, 0.25), 1.5, 0.22, 0xff3b2f, '宇宙红鱼 · 凤尾撕裂大气'); }
          if (u > 0.58 && !m.struck.has(2)) { m.struck.add(2); monsterStrike(m.body, 'redfish', posAt(0.85, -0.42, -0.18), 2.3, 0.28, 0xfbbf24, '赤金巨鲲 · 引力漩涡吞噬'); }
        }
        else if (m.type === 'snake' || m.type === 'dragon') {
          const d = m.data, isDrag = m.type === 'dragon';
          const squeeze = !isDrag && u > 0.44 && u < 0.82 ? Math.sin(((u - 0.44) / 0.38) * Math.PI) : 0;
          if (squeeze > 0 && !m.body.shatterGroup) {
            m.body.mesh.scale.copy(m.initialScale).multiply(new THREE.Vector3(1 - squeeze * 0.18, 1 + squeeze * 0.24, 1 - squeeze * 0.18));
          }
          const pathPt = (s) => {
            const cl = Math.max(-0.45, s);
            if (!isDrag) {
              const ang = cl * Math.PI * 4.8;
              const rr = cl < 0.18 ? 2.35 - (cl / 0.18) * 1.1 : (cl > 0.84 ? 1.22 + ((cl - 0.84) / 0.16) * 2.1 : 1.24 - squeeze * 0.12);
              return posAt(Math.sin(ang) * rr, Math.cos(ang) * rr, Math.sin(ang * 0.55) * 0.58);
            } else {
              const ang = -0.8 + cl * Math.PI * 3.4;
              const rr = 2.0 - Math.sin(THREE.MathUtils.clamp(cl, 0, 1) * Math.PI) * 0.48;
              return posAt(Math.sin(ang) * rr * 0.85, Math.cos(ang) * rr, 0.52 + Math.sin(ang * 2.0) * 0.65);
            }
          };
          const headP = pathPt(u), headNext = pathPt(u + 0.015);
          d.head.position.copy(headP);
          d.head.lookAt(m.body.meshGroup.localToWorld(headNext.clone()));
          for (let k = 0; k < d.nStations; k++) {
            d.spineBuf[k].copy(pathPt(u - k * 0.0088));
          }
          d.tube.update(d.spineBuf, 0);
          d.breath.material.opacity = (u > 0.32 && u < 0.82) ? 0.78 + 0.18 * Math.sin(m.age * 24) : 0;
          // 更新神龙实时 3D 蓝白雷电弧！
          if (d.bolts) {
            d.bolts.forEach((line, bIdx) => {
              const attr = line.geometry.attributes.position, aPt = d.spineBuf[(bIdx * 7 + 4) % d.nStations];
              const tgt = aPt.clone().normalize().multiplyScalar(rad * 1.02);
              for (let j = 0; j < 14; j++) {
                const f = j / 13;
                const q = aPt.clone().lerp(tgt, f);
                if (j > 0 && j < 13) q.add(new THREE.Vector3(Math.sin(m.age * 45 + j * 3 + bIdx), Math.cos(m.age * 38 + j * 4), Math.sin(m.age * 52 - j * 2)).multiplyScalar(rad * 0.14));
                attr.setXYZ(j, q.x, q.y, q.z);
              }
              attr.needsUpdate = true;
            });
          }
          for (let k = 0; k < 4; k++) {
            if (u > (isDrag ? 0.22 : 0.36) + k * 0.11 && !m.struck.has(k)) {
              m.struck.add(k);
              const a = k * Math.PI * 0.5;
              monsterStrike(m.body, m.type, posAt(Math.max(0.35, Math.sin(a)), Math.cos(a), (k % 2 ? 0.22 : -0.22)), 1.5, 0.22, isDrag ? (k % 2 ? 0x38bdf8 : 0xfbbf24) : 0x10b981, isDrag ? `太古星穹神龙 · 龙炎天雷 #${k + 1}` : `吞世巨蛇 · 绞杀赤道断层 #${k + 1}`);
            }
          }
        }
        else if (m.type === 'phoenix') {
          const d = m.data;
          let p, pNext;
          if (u < 0.52) {
            const s = u / 0.52, ang = -0.9 + s * Math.PI * 1.9;
            p = posAt(Math.sin(ang) * 1.8, Math.cos(ang) * 2.05, 0.92 + Math.sin(s * Math.PI) * 0.5);
            pNext = posAt(Math.sin(ang + 0.12) * 1.8, Math.cos(ang + 0.12) * 2.05, 0.92 + Math.sin((s + 0.05) * Math.PI) * 0.5);
          } else {
            const s = (u - 0.52) / 0.48;
            const dive = s < 0.36 ? 2.05 - (s / 0.36) * 1.15 : 0.90 + ((s - 0.36) / 0.64) * 3.5;
            p = posAt(0.65, (0.36 - s) * 2.4, dive);
            pNext = posAt(0.55, (0.31 - s) * 2.4, dive - 0.18);
          }
          d.bird.position.copy(p); d.bird.lookAt(m.body.meshGroup.localToWorld(pNext));
          const flap = Math.sin(m.age * 11.5) * 0.55;
          d.wingL.rotation.z = -flap; d.wingR.rotation.z = flap;
          if (u > 0.24 && !m.struck.has(1)) { m.struck.add(1); monsterStrike(m.body, 'phoenix', posAt(0.82, 0.45, 0.38), 1.35, 0.20, 0xff8c1a, '焚天星凰 · 烈焰羽箭雨'); }
          if (u > 0.64 && !m.struck.has(2)) { m.struck.add(2); monsterStrike(m.body, 'phoenix', posAt(0.88, 0.1, 0.32), 3.1, 0.36, 0xff4518, '超新星涅槃俯冲'); }
        }
        else if (m.type === 'cthulhu') {
          const d = m.data;
          const grab = u > 0.18 && u < 0.84 ? Math.sin(THREE.MathUtils.clamp((u - 0.18) / 0.66, 0, 1) * Math.PI) : 0;
          const dist = 2.2 - grab * 0.68;
          d.kraken.position.copy(posAt(0.55, 0.10, dist));
          d.kraken.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
          d.kraken.rotateX(-Math.PI / 2);
          d.tentacles.forEach(t => {
            const n = t.pts.length;
            for (let k = 0; k < n; k++) {
              const frac = k / (n - 1);
              const openR = rad * (0.36 + Math.sin(frac * Math.PI) * (0.95 - grab * 0.18)) * m.S;
              const yDown = -0.18 * rad - frac * rad * (1.25 + grab * 1.35);
              const wriggle = Math.sin(m.age * 5.2 + t.a * 2 + frac * 6.5) * rad * 0.10 * frac;
              t.pts[k].set(Math.cos(t.a) * openR + wriggle, yDown, Math.sin(t.a) * openR + wriggle);
            }
            t.tube.update(t.pts, 0);
          });
          for (let k = 0; k < 3; k++) {
            if (u > 0.28 + k * 0.18 && !m.struck.has(k)) {
              m.struck.add(k);
              const a = k * 2.1;
              monsterStrike(m.body, 'cthulhu', posAt(0.55, Math.sin(a) * 0.55, 0.65), 1.65, 0.24, 0x6366f1, `虚空章鱼魔神 · 触手虹吸地核 #${k + 1}`);
            }
          }
        }
        else if (m.type === 'titan') {
          const d = m.data;
          const appear = Math.min(1, u * 6.0) * (u > 0.88 ? (1 - u) / 0.12 : 1);
          d.titan.position.copy(posAt(0.75, 1.48, 0.72));
          d.titan.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
          d.titan.scale.setScalar(Math.max(0.01, appear));
          const slashU = THREE.MathUtils.clamp((u - 0.34) / 0.24, 0, 1);
          const easeSlash = slashU * slashU * (3 - 2 * slashU);
          d.swordPivot.rotation.x = -0.75 + easeSlash * 2.55;
          d.swordPivot.rotation.z = -0.35 + easeSlash * 0.65;
          for (let k = 0; k < 4; k++) {
            if (u > 0.40 + k * 0.055 && !m.struck.has(k)) {
              m.struck.add(k);
              const yLine = 0.62 - k * 0.42;
              monsterStrike(m.body, 'titan', posAt(0.75, 0.35 - k * 0.18, yLine), 1.95, 0.26, 0x38bdf8, `灭星泰坦 · 符文巨剑裂星斩 #${k + 1}`);
            }
          }
        }

        if (u >= 1) {
          cleanupMonster(m);
          monsterLab.active.splice(i, 1);
          document.getElementById('lab-phase').textContent = `${MONSTER_EXPERIMENTS.find(e => e[0] === m.type)?.[2] || m.type} · 破坏完成`;
        }
      }
    }

    function resetMonsters(body = null) {
      for (let i = monsterLab.active.length - 1; i >= 0; i--) {
        if (!body || monsterLab.active[i].body === body) {
          cleanupMonster(monsterLab.active[i]);
          monsterLab.active.splice(i, 1);
        }
      }
      const targets = body ? [body] : celestialBodies;
      targets.forEach(b => {
        if (b.interiorGroup) {
          disposeTree(b.interiorGroup);
          b.interiorGroup = null;
        }
        if (b.shatterGroup) {
          disposeTree(b.shatterGroup);
          b.shatterGroup = null;
          b.shatterChunks = null;
          b.shatterShock = null;
          b.shatterSparks = null;
          b.mesh.visible = true;
          if (b.cloudsMesh) b.cloudsMesh.visible = true;
          if (b.atmoMesh) b.atmoMesh.visible = true;
        }
      });
    }
