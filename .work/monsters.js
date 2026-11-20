    // =========================================================================
    // 怪物异兽与星际舰队毁灭实验室 (10 种电影级 GLSL 着色 3D 科幻/玄幻生物与舰队)
    // =========================================================================
    const MONSTER_EXPERIMENTS = [
      ['worm',    '🪱', '超巨型噬星蠕虫', '钻穿地壳·双面熔岩贯通', 'monster'],
      ['zerg',    '🪲', '星际虫族利维坦', '母巢蜂群俯冲·菌毯蚀星', 'monster'],
      ['occ',     '👁️', 'OCC 混沌旧日巨眼', '虚空裂缝·混沌歼星凝视', 'monster'],
      ['fleet',   '🚀', '星际灭世舰队', '曲率跃迁·轨道灭绝令齐射', 'monster'],
      ['redfish', '🐟', '宇宙深红巨鲲', '星海红鱼·赤炎引力吞噬', 'monster'],
      ['snake',   '🐍', '宇宙吞世巨蛇', '盘星绞杀·赤道熔岩断层', 'monster'],
      ['dragon',  '🐉', '太古星穹神龙', '御雷盘霄·星河龙炎吐息', 'monster'],
      ['phoenix', '🔥', '焚天星凰', '恒星火雨·超新星涅槃俯冲', 'monster'],
      ['cthulhu', '🐙', '虚空章鱼魔神', '十触锁星·地核能量虹吸', 'monster'],
      ['titan',   '⚔️', '灭星泰坦星神', '星穹巨刃·一剑劈裂半球', 'monster']
    ];
    const MONSTER_IDS = new Set(MONSTER_EXPERIMENTS.map(e => e[0]));
    const MONSTER_NOTES = {
      worm:    '超巨型噬星蠕虫：28 节熔岩脉络装甲虫躯与三层旋转锯齿口器，从侧前方破空扭动俯冲并贯通钻穿星球地壳，引发双面熔岩喷泉与震波。',
      zerg:    '星际虫族利维坦：巨型生物母巢率领 48 只异虫蜂群螺旋轰炸地表，并播撒发光紫绿孢子菌毯持续侵蚀大气与地壳。',
      occ:     'OCC 混沌旧日巨眼（Outer Cosmic Chaos）：撕裂虚空现身，三层禁锢眼轮逆向旋转，炽热竖瞳蓄能释放混沌紫红歼星射线与暗影触须压迫。',
      fleet:   '星际灭世舰队：超无畏级旗舰与 12 艘战列护卫舰曲率跃迁就位，先以密集轨道电磁炮饱和轰炸，再由旗舰主炮轰出「灭绝令」光柱。',
      redfish: '宇宙深红巨鲲（红鱼）：赤金流光鱼鳞与动态波动半透明凤尾鳍，环绕星球优雅摆尾掀起大气激波，张口引动赤红引力漩涡吞噬物质。',
      snake:   '宇宙吞世巨蛇（耶梦加得级）：38 节翡翠暗金龙鳞巨躯精准缠绕星球赤道并剧烈绞杀挤压，震裂整条赤道熔岩带并喷吐毁灭龙息。',
      dragon:  '太古星穹神龙：34 节金青龙鳞巨躯伴随龙角、龙须与雷光盘旋九霄，召唤紫金天劫雷柱劈落行星，并倾泻星河龙炎吐息。',
      phoenix: '焚天星凰：双翼展幅逾越星球的恒星烈焰神鸟，振翅降下烈焰羽箭雨，终结阶段化作超新星涅槃俯冲引爆全局火海。',
      cthulhu: '虚空章鱼魔神：发光深蓝星云伞盖、六重深渊魔眼与 10 条柔性吸盘巨触，死死扣住行星表面疯狂虹吸地核能量。',
      titan:   '灭星泰坦星神：星穹重甲巨像降临轨道，胸口方舟反应堆超载，双手挥舞横跨星球的巨型等离子光剑自上而下一剑劈裂半球地壳。'
    };

    const monsterLab = { active: [], scale: 1.15, power: 3 };

    // 电影级程序化生物鳞甲/甲壳 GLSL 着色器（自带三维照明、鳞片起伏、高光、生物荧光脉络与边缘光，不依赖外部场景灯）
    function makeBioShader(baseHex, veinHex, rimHex, scaleFreq = 16.0, veinAmt = 0.65) {
      return new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uBase: { value: new THREE.Color(baseHex) },
          uVein: { value: new THREE.Color(veinHex) },
          uRim:  { value: new THREE.Color(rimHex) },
          uFreq: { value: scaleFreq },
          uVeinAmt: { value: veinAmt }
        },
        vertexShader: `
          varying vec3 vN, vV, vP;
          void main() {
            vP = position;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying vec3 vN, vV, vP;
          uniform float uTime, uFreq, uVeinAmt;
          uniform vec3 uBase, uVein, uRim;
          float hash3(vec3 p){p=fract(p*0.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
          float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
          void main() {
            vec3 N = normalize(vN), V = normalize(vV);
            vec3 L1 = normalize(vec3(0.65, 0.72, 0.55));
            vec3 L2 = normalize(vec3(-0.7, -0.3, 0.5));
            float sc = sin(vP.x * uFreq + sin(vP.z * uFreq * 0.7)) * cos(vP.y * uFreq * 1.15);
            float n = noise3(normalize(vP + vec3(0.001)) * 7.5 + vec3(0.0, uTime * 0.35, 0.0));
            float bump = sc * 0.22 + (n - 0.5) * 0.35;
            vec3 Nb = normalize(N + vec3(bump * 0.25, bump * 0.25, 0.0));
            float diff = max(0.0, dot(Nb, L1)) * 0.92 + max(0.0, dot(Nb, L2)) * 0.32 + 0.26;
            float spec = pow(max(0.0, dot(reflect(-L1, Nb), V)), 26.0) * 0.65;
            float fres = pow(1.0 - max(0.0, dot(N, V)), 2.5);
            float vein = smoothstep(0.58, 0.84, n + sc * 0.14) * (0.78 + 0.22 * sin(uTime * 4.5 + n * 10.0));
            vec3 col = uBase * (0.72 + 0.35 * sc) * diff + vec3(1.0, 0.95, 0.88) * spec;
            col += uVein * vein * uVeinAmt * 1.35 + uRim * fres * 0.95;
            gl_FragColor = vec4(col, 1.0);
          }
        `
      });
    }

    // 电影级科幻金属舰体/星神装甲着色器（含装甲板接缝、舷窗灯带、高光金属与能量槽）
    function makeArmorShader(baseHex, trimHex, glowHex) {
      return new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uBase: { value: new THREE.Color(baseHex) },
          uTrim: { value: new THREE.Color(trimHex) },
          uGlow: { value: new THREE.Color(glowHex) }
        },
        vertexShader: `
          varying vec3 vN, vV, vP;
          void main() {
            vP = position;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying vec3 vN, vV, vP;
          uniform float uTime;
          uniform vec3 uBase, uTrim, uGlow;
          void main() {
            vec3 N = normalize(vN), V = normalize(vV);
            vec3 L = normalize(vec3(0.55, 0.78, 0.65));
            float gx = step(0.90, fract(vP.x * 12.0));
            float gz = step(0.92, fract(vP.z * 9.0));
            float seam = max(gx, gz);
            float win = step(0.82, fract(vP.z * 26.0)) * step(0.75, fract(vP.x * 22.0)) * step(0.25, sin(vP.y * 19.0 + vP.z * 11.0));
            float diff = max(0.0, dot(N, L)) * 0.95 + 0.34;
            float spec = pow(max(0.0, dot(reflect(-L, N), V)), 34.0) * 0.85;
            float fres = pow(1.0 - max(0.0, dot(N, V)), 2.8);
            vec3 col = mix(uBase, uTrim, seam * 0.75) * diff + vec3(0.9, 0.96, 1.0) * spec;
            col += uGlow * (win * 1.45 + fres * 0.85 * (0.85 + 0.15 * sin(uTime * 5.0)));
            gl_FragColor = vec4(col, 1.0);
          }
        `
      });
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
      const dist = vec.length(), minDist = body.radius * 6.4;
      if (dist < minDist) {
        const dir = dist > 1e-3 ? vec.normalize() : new THREE.Vector3(0, 0.25, 1).normalize();
        const dest = center.clone().addScaledVector(dir, minDist);
        startCamTransition(dest, center.clone());
      }
    }

    function localGroupDirToMeshLocal(body, dirInGroup) {
      const invMeshQ = body.mesh.quaternion.clone().invert();
      return dirInGroup.clone().normalize().applyQuaternion(invMeshQ).normalize();
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

    function triggerPlanetShatter(body, accentHex = 0xff6b2b) {
      if (!body || body.shatterGroup) return;
      const g = new THREE.Group(), R = body.radius, rng = deterministicRandom(Math.floor(dynamics.time * 100) + 777);
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(R * 0.56, 32, 24),
        new THREE.MeshBasicMaterial({ color: 0xffe4a0 })
      );
      const coreGlow = glowSprite(accentHex, R * 4.5, 0.95);
      g.add(core, coreGlow);
      const chunks = [];
      const chunkMat = makeBioShader(0x4a3128, accentHex, 0xffaa44, 14.0, 0.95);
      const nChunks = document.body.dataset.layout === 'mobile' ? 48 : 96;
      for (let i = 0; i < nChunks; i++) {
        const a = rng() * Math.PI * 2, ph = Math.acos(2 * rng() - 1);
        const dir = new THREE.Vector3(Math.sin(ph) * Math.cos(a), Math.cos(ph), Math.sin(ph) * Math.sin(a));
        const sz = R * (0.075 + rng() * 0.145);
        const m = new THREE.Mesh(new THREE.DodecahedronGeometry(sz, 0), chunkMat);
        m.position.copy(dir).multiplyScalar(R * (0.85 + rng() * 0.25));
        m.rotation.set(rng() * 6.28, rng() * 6.28, rng() * 6.28);
        g.add(m);
        chunks.push({ mesh: m, dir, speed: R * (0.34 + rng() * 0.78), rot: new THREE.Vector3(rng() - .5, rng() - .5, rng() - .5).multiplyScalar(2.6) });
      }
      body.mesh.visible = false;
      if (body.cloudsMesh) body.cloudsMesh.visible = false;
      if (body.atmoMesh) body.atmoMesh.visible = false;
      body.meshGroup.add(g);
      body.shatterGroup = g;
      body.shatterChunks = chunks;
      body.shatterAge = 0;
      body.statusText = '💥 星体已被爆星级怪物彻底粉碎（可点单目标复原）';
      updateLeftPanelTelemetry(body);
      triggerScreenFlash(0.72);
      audioEngine.playImpact(1.5);
      showToast(`💥 ${ENCYCLOPEDIA[body.id]?.name || body.id} 在怪物终极破坏下碎裂崩解！`, 'amber');
    }

    function monsterStrike(body, type, dirInGroup, energyScale = 1, craterFrac = 0.13, colorHex = 0xff7b29, labelPhase = '毁灭打击') {
      if (!body || body.isDestroyed) return;
      const planet = PLANET_PHYSICS[body.id] || PLANET_PHYSICS.earth;
      const powerMult = Math.pow(10, (monsterLab.power - 1) * 0.95) * (0.65 + monsterLab.scale * 0.45);
      const energy = 1.8e24 * energyScale * powerMult;
      const physical = scientificImpact({ diamKm: 20 * monsterLab.scale, velKms: 52, material: 'iron', atmosphere: lab.atmosphere }, body.id);
      const meshNormal = localGroupDirToMeshLocal(body, dirInGroup);
      const report = impactReport(body, type, physical, energy);
      report.phase = labelPhase;
      const craterR = planet.radius * THREE.MathUtils.clamp(craterFrac * (0.72 + monsterLab.power * 0.28), 0.06, 0.36);
      if (planet.solid) craterScar(body, meshNormal, { ...physical, craterMeters: craterR * 2 });

      const shock = makeSurfaceShock(body, meshNormal, colorHex, energy, 1.05, 0.038);
      const shock2 = makeSurfaceShock(body, meshNormal, 0xfff0c8, energy, 0.65, 0.058);
      const root = new THREE.Group();
      body.mesh.add(root);
      root.position.copy(meshNormal).multiplyScalar(body.radius * 1.015);
      root.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), meshNormal);
      const sz = body.radius * (0.075 + monsterLab.power * 0.020) * state.vfxIntensity;
      const hot = glowSprite(colorHex, sz * 6.8, 0.96);
      const flash = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(0.02, sz * 1.3), 18, 14),
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
      audioEngine.playImpact(Math.min(1.45, 0.55 + monsterLab.power * 0.15));
      triggerScreenFlash(Math.min(0.42, 0.16 + monsterLab.power * 0.04));
      if ((monsterLab.power >= 6 || (monsterLab.power >= 5 && body.integrity <= 35)) && planet.solid) {
        triggerPlanetShatter(body, colorHex);
      }
      renderLabReport();
    }

    // -------------------------------------------------------------------------
    // 10 种电影级怪物 3D 构造器
    // -------------------------------------------------------------------------
    function buildWorm(R, S) {
      const grp = new THREE.Group();
      const segs = [], N = 26, mats = [];
      const armorMat = makeBioShader(0x6b3a24, 0xff5a18, 0xff9a44, 15.0, 0.85);
      const ridgeMat = makeBioShader(0x3a1c12, 0xff7b29, 0xffc166, 20.0, 0.95);
      const toothMat = new THREE.MeshBasicMaterial({ color: 0xfff3d1 });
      mats.push(armorMat, ridgeMat);
      const head = new THREE.Group();
      const headShell = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.24 * S, R * 0.30 * S, R * 0.44 * S, 18, 1, true), armorMat);
      headShell.rotation.x = Math.PI / 2;
      const throat = new THREE.Mesh(new THREE.SphereGeometry(R * 0.21 * S, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff7824 }));
      throat.position.z = R * 0.06 * S;
      const mawGlow = glowSprite(0xff5a18, R * 1.25 * S, 0.9);
      mawGlow.position.z = R * 0.22 * S;
      head.add(headShell, throat, mawGlow);
      const fangRings = [];
      for (let ring = 0; ring < 3; ring++) {
        const rg = new THREE.Group();
        rg.position.z = R * (0.22 - ring * 0.055) * S;
        const rad = R * (0.22 - ring * 0.045) * S, cnt = 14 - ring * 2;
        for (let k = 0; k < cnt; k++) {
          const a = k / cnt * Math.PI * 2;
          const fang = new THREE.Mesh(new THREE.ConeGeometry(R * 0.028 * S, R * 0.15 * S, 5), toothMat);
          fang.position.set(Math.cos(a) * rad, Math.sin(a) * rad, 0);
          fang.lookAt(0, 0, R * 0.14 * S);
          fang.rotateX(Math.PI / 2);
          rg.add(fang);
        }
        head.add(rg); fangRings.push(rg);
      }
      grp.add(head); segs.push(head);
      for (let i = 1; i < N; i++) {
        const t = i / (N - 1);
        const rad = R * S * (0.28 * Math.sin(Math.pow(1 - t, 0.72) * Math.PI * 0.85) + 0.05);
        const sg = new THREE.Group();
        const bodySeg = new THREE.Mesh(new THREE.SphereGeometry(rad, 14, 10), armorMat);
        bodySeg.scale.set(1, 0.94, 1.38);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(rad * 0.96, rad * 0.14, 8, 16), ridgeMat);
        sg.add(bodySeg, ring);
        if (i % 2 === 0 && i < N - 3) {
          for (const side of [-1, 1]) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.18, rad * 0.9, 5), ridgeMat);
            spike.position.set(side * rad * 0.44, rad * 0.88, 0);
            spike.rotation.z = -side * 0.45;
            sg.add(spike);
          }
        }
        grp.add(sg); segs.push(sg);
      }
      return { grp, segs, fangRings, mats };
    }

    function buildZerg(R, S) {
      const grp = new THREE.Group(), mats = [];
      const chitinMat = makeBioShader(0x4a1d68, 0x22c55e, 0xa855f7, 16.0, 0.85);
      const sacMat = makeBioShader(0x22c55e, 0xd9f99d, 0x4ade80, 12.0, 1.15);
      mats.push(chitinMat, sacMat);
      const leviathan = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.SphereGeometry(R * 0.42 * S, 20, 16), chitinMat);
      hull.scale.set(1.1, 0.62, 1.85);
      leviathan.add(hull);
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        const sac = new THREE.Mesh(new THREE.SphereGeometry(R * (0.11 + (i % 2) * 0.04) * S, 12, 10), sacMat);
        sac.position.set(Math.cos(a) * R * 0.34 * S, Math.sin(a) * R * 0.16 * S, (i - 3.5) * R * 0.12 * S);
        leviathan.add(sac);
      }
      const tentacles = [];
      for (let t = 0; t < 6; t++) {
        const tg = new THREE.Group();
        const a = (t / 6) * Math.PI * 2;
        tg.position.set(Math.cos(a) * R * 0.24 * S, Math.sin(a) * R * 0.14 * S, R * 0.62 * S);
        const nodes = [];
        for (let k = 0; k < 6; k++) {
          const n = new THREE.Mesh(new THREE.SphereGeometry(R * (0.058 - k * 0.007) * S, 8, 8), k === 5 ? sacMat : chitinMat);
          n.position.z = k * R * 0.13 * S;
          tg.add(n); nodes.push(n);
        }
        leviathan.add(tg); tentacles.push({ tg, nodes, phase: a });
      }
      leviathan.add(glowSprite(0x4ade80, R * 1.9 * S, 0.62));
      grp.add(leviathan);

      const flyers = [];
      const flyerGeo = new THREE.ConeGeometry(R * 0.036 * S, R * 0.14 * S, 4);
      flyerGeo.rotateX(Math.PI / 2);
      const wingGeo = new THREE.BoxGeometry(R * 0.18 * S, R * 0.014 * S, R * 0.055 * S);
      const rng = deterministicRandom(404);
      const count = document.body.dataset.layout === 'mobile' ? 28 : 48;
      for (let i = 0; i < count; i++) {
        const fg = new THREE.Group();
        const b = new THREE.Mesh(flyerGeo, chitinMat), w = new THREE.Mesh(wingGeo, sacMat);
        fg.add(b, w);
        grp.add(fg);
        flyers.push({ grp: fg, wing: w, angle: rng() * Math.PI * 2, elev: (rng() - 0.5) * 1.8, speed: 1.9 + rng() * 1.8, rad: R * (1.28 + rng() * 0.9), phase: rng() * 6.28 });
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
      const creepShell = new THREE.Mesh(new THREE.SphereGeometry(R * 1.022, 48, 32), creepMat);
      grp.add(creepShell);
      return { grp, leviathan, tentacles, flyers, creepShell, creepMat, mats };
    }

    function buildOCC(R, S) {
      const grp = new THREE.Group(), entity = new THREE.Group(), mats = [];
      const riftMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `varying vec2 vUv;uniform float uTime;void main(){vec2 p=(vUv-.5)*2.;float r=length(p),a=atan(p.y,p.x);float sw=sin(a*6.-r*10.+uTime*4.)*.5+.5;float ring=exp(-pow((r-.55)/.22,2.))*sw;float core=exp(-r*r*5.);vec3 col=mix(vec3(.55,.06,.88),vec3(1.,.16,.32),sw)+vec3(1.,.72,.28)*core;float al=clamp(ring*.85+core*.7,0.,1.)*smoothstep(1.,.32,r);if(al<.01)discard;gl_FragColor=vec4(col,al);}`,
        transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
      });
      const rift = new THREE.Mesh(new THREE.PlaneGeometry(R * 2.8 * S, R * 2.8 * S), riftMat);
      rift.position.z = -R * 0.25 * S;
      entity.add(rift);

      // 炽热竖瞳旧日巨眼：用视角方向保证无论正面还是 3/4 侧面都能直视那颗令人战栗的炽红竖瞳！
      const eyeMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uCharge: { value: 0 } },
        vertexShader: `varying vec3 vN, vV, vP;void main(){vP=normalize(position);vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
        fragmentShader: `varying vec3 vN, vV, vP;uniform float uTime,uCharge;void main(){
          vec3 N=normalize(vN),V=normalize(vV);
          float facing=max(0.,dot(N,V));
          vec3 rightV=normalize(cross(vec3(0.,1.,0.),V));
          vec3 upV=normalize(cross(V,rightV));
          float ex=dot(N,rightV), ey=dot(N,upV);
          float irisR=length(vec2(ex,ey));
          float slitW=0.055+uCharge*0.035;
          float slit=smoothstep(slitW,slitW+0.09,abs(ex)/max(0.08,0.62-abs(ey)*1.1));
          float irisMask=smoothstep(0.66,0.44,irisR);
          float fiber=0.72+0.28*sin(atan(ey,ex)*28.+uTime*4.+irisR*18.);
          vec3 sclera=vec3(0.09,0.02,0.14);
          vec3 iris=mix(vec3(1.0,0.10,0.22),vec3(1.0,0.78,0.18),smoothstep(0.50,0.16,irisR))*fiber*(1.1+uCharge*0.9);
          vec3 col=mix(sclera,iris,irisMask);
          col=mix(vec3(0.02,0.0,0.04),col,slit);
          col+=vec3(0.92,0.25,1.0)*pow(1.0-facing,2.6)*1.15;
          gl_FragColor=vec4(col,1.);
        }`
      });
      const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(R * 0.42 * S, 36, 28), eyeMat);
      entity.add(eyeBall);

      const rings = [];
      const ringMat = makeArmorShader(0xf59e0b, 0xfde047, 0xd946ef);
      mats.push(ringMat);
      const miniEyeMat = new THREE.MeshBasicMaterial({ color: 0xff2a55 });
      for (let i = 0; i < 3; i++) {
        const rg = new THREE.Group();
        const rad = R * (0.64 + i * 0.22) * S;
        const torus = new THREE.Mesh(new THREE.TorusGeometry(rad, R * 0.032 * S, 10, 48), ringMat);
        rg.add(torus);
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * Math.PI * 2;
          const me = new THREE.Mesh(new THREE.SphereGeometry(R * 0.045 * S, 8, 8), miniEyeMat);
          me.position.set(Math.cos(a) * rad, Math.sin(a) * rad, 0);
          rg.add(me);
        }
        entity.add(rg); rings.push(rg);
      }

      const tentacles = [];
      const tentMat = makeBioShader(0x2e0848, 0xc026d3, 0xf43f5e, 14.0, 0.9);
      mats.push(tentMat);
      for (let t = 0; t < 12; t++) {
        const a = t / 12 * Math.PI * 2;
        const nodes = [];
        for (let k = 0; k < 9; k++) {
          const m = new THREE.Mesh(new THREE.SphereGeometry(R * (0.072 - k * 0.0062) * S, 8, 8), tentMat);
          entity.add(m); nodes.push(m);
        }
        tentacles.push({ a, nodes });
      }

      const beamMat = new THREE.MeshBasicMaterial({ color: 0xe879f9, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.08 * S, R * 0.20 * S, R * 4.2, 16, 1, true), beamMat);
      beam.rotation.x = Math.PI / 2; beam.position.z = R * 2.1;
      const beamCore = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.032 * S, R * 0.07 * S, R * 4.2, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      beamCore.rotation.x = Math.PI / 2; beamCore.position.z = R * 2.1;
      entity.add(beam, beamCore);
      entity.add(glowSprite(0xd946ef, R * 2.1 * S, 0.65));
      grp.add(entity);
      return { grp, entity, riftMat, eyeMat, rings, tentacles, beam, beamCore, mats };
    }

    function buildFleet(R, S) {
      const grp = new THREE.Group(), mats = [];
      const hullMat = makeArmorShader(0x64748b, 0x94a3b8, 0x38bdf8);
      const darkMat = makeArmorShader(0x1e293b, 0x475569, 0x7dd3fc);
      const engMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
      mats.push(hullMat, darkMat);

      function makeShip(sc, isFlagship = false) {
        const sg = new THREE.Group();
        const bodyLen = R * (isFlagship ? 1.15 : 0.36) * sc;
        const bodyW = R * (isFlagship ? 0.42 : 0.14) * sc;
        const wedge = new THREE.Mesh(new THREE.ConeGeometry(bodyW, bodyLen, 4), hullMat);
        wedge.rotation.x = Math.PI / 2; wedge.rotation.y = Math.PI / 4; wedge.scale.set(1.3, 1, 0.36);
        sg.add(wedge);
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.46, bodyW * 0.28, bodyLen * 0.26), darkMat);
        bridge.position.set(0, bodyW * 0.22, -bodyLen * 0.16);
        sg.add(bridge);
        for (const sx of [-1, 0, 1]) {
          if (!isFlagship && sx === 0) continue;
          const eng = new THREE.Mesh(new THREE.SphereGeometry(bodyW * (isFlagship ? 0.13 : 0.15), 8, 8), engMat);
          eng.position.set(sx * bodyW * 0.38, 0, -bodyLen * 0.48);
          sg.add(eng);
        }
        sg.add(glowSprite(0x38bdf8, bodyLen * 0.95, isFlagship ? 0.72 : 0.48));
        return sg;
      }

      const flagship = makeShip(S, true);
      const mainBeamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      const mainBeam = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.065 * S, R * 0.18 * S, R * 4.4, 16, 1, true), mainBeamMat);
      mainBeam.rotation.x = Math.PI / 2; mainBeam.position.z = R * 2.3;
      const mainCore = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.025 * S, R * 0.068 * S, R * 4.4, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      mainCore.rotation.x = Math.PI / 2; mainCore.position.z = R * 2.3;
      flagship.add(mainBeam, mainCore);
      grp.add(flagship);

      const escorts = [];
      for (let i = 0; i < 12; i++) {
        const ship = makeShip(S, false);
        const a = (i / 12 - 0.5) * 1.45;
        const row = i % 2;
        grp.add(ship);
        escorts.push({ ship, a, row, elev: (row ? 0.52 : -0.45) + Math.sin(i * 1.7) * 0.25, warpDelay: 0.02 + i * 0.015 });
      }
      const bolts = [];
      return { grp, flagship, escorts, mainBeam, mainCore, bolts, mats };
    }

    function buildRedFish(R, S) {
      const grp = new THREE.Group(), segs = [], N = 22, mats = [];
      const scaleMat = makeBioShader(0xe11d48, 0xfbbf24, 0xff6b57, 18.0, 0.9);
      const goldMat = makeBioShader(0xf59e0b, 0xfff3a8, 0xff5a36, 16.0, 0.95);
      mats.push(scaleMat, goldMat);
      const finMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv;uniform float uTime;void main(){vUv=uv;vec3 p=position;p.y+=sin(uv.x*9.-uTime*7.)*uv.x*.18*length(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
        fragmentShader: `varying vec2 vUv;void main(){float vein=.65+.35*sin(vUv.y*34.);vec3 col=mix(vec3(1.,.14,.22),vec3(1.,.84,.28),vUv.x);float a=(1.-vUv.x*.48)*vein*.86;gl_FragColor=vec4(col,a);}`,
        transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
      });

      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const profile = Math.sin(Math.pow(t, 0.58) * Math.PI) * 0.30 + 0.035;
        const sg = new THREE.Group();
        const m = new THREE.Mesh(new THREE.SphereGeometry(R * profile * S, 16, 12), i % 3 === 0 ? goldMat : scaleMat);
        m.scale.set(0.72, 1.15, 1.38);
        sg.add(m);
        if (i === 1) {
          for (const side of [-1, 1]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(R * 0.052 * S, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfff3a8 }));
            eye.position.set(side * R * 0.14 * S, R * 0.07 * S, R * 0.07 * S);
            sg.add(eye);
            const pec = new THREE.Mesh(new THREE.PlaneGeometry(R * 1.05 * S, R * 0.50 * S, 12, 4), finMat);
            pec.position.set(side * R * 0.56 * S, -R * 0.06 * S, -R * 0.14 * S);
            pec.rotation.y = side * 0.55; pec.rotation.z = -side * 0.35;
            sg.add(pec);
          }
          sg.add(glowSprite(0xff3b2f, R * 1.55 * S, 0.72));
        }
        if (i === 5) {
          const dorsal = new THREE.Mesh(new THREE.PlaneGeometry(R * 1.0 * S, R * 0.42 * S, 10, 3), finMat);
          dorsal.position.set(0, R * 0.38 * S, 0); dorsal.rotation.y = Math.PI / 2;
          sg.add(dorsal);
        }
        if (i === N - 1) {
          for (const tilt of [-0.42, 0.42]) {
            const tail = new THREE.Mesh(new THREE.PlaneGeometry(R * 1.35 * S, R * 0.56 * S, 14, 4), finMat);
            tail.position.set(0, tilt * R * 0.42 * S, -R * 0.65 * S);
            tail.rotation.y = Math.PI / 2; tail.rotation.x = tilt;
            sg.add(tail);
          }
        }
        grp.add(sg); segs.push(sg);
      }
      return { grp, segs, finMat, mats };
    }

    function buildSnakeOrDragon(R, S, isDragon = false) {
      const grp = new THREE.Group(), segs = [], N = isDragon ? 34 : 38, mats = [];
      const bodyMat = isDragon
        ? makeBioShader(0xd97706, 0x38bdf8, 0xfde047, 18.0, 0.9)
        : makeBioShader(0x047857, 0x34d399, 0xfbbf24, 20.0, 0.88);
      const bellyMat = makeBioShader(0xf59e0b, 0xfff3a8, 0x38bdf8, 16.0, 0.85);
      mats.push(bodyMat, bellyMat);
      const head = new THREE.Group();
      const snout = new THREE.Mesh(new THREE.ConeGeometry(R * 0.19 * S, R * 0.54 * S, 6), bodyMat);
      snout.rotation.x = Math.PI / 2; snout.scale.set(1.1, 1, 0.72);
      head.add(snout);
      for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(R * 0.045 * S, 8, 8), new THREE.MeshBasicMaterial({ color: isDragon ? 0x38bdf8 : 0xfde047 }));
        eye.position.set(side * R * 0.12 * S, R * 0.065 * S, R * 0.05 * S);
        head.add(eye);
        if (isDragon) {
          const antler = new THREE.Mesh(new THREE.ConeGeometry(R * 0.025 * S, R * 0.36 * S, 6), bellyMat);
          antler.position.set(side * R * 0.11 * S, R * 0.21 * S, -R * 0.15 * S);
          antler.rotation.z = -side * 0.45; antler.rotation.x = -0.35;
          head.add(antler);
          const whisker = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.008 * S, R * 0.004 * S, R * 0.42 * S, 6), bellyMat);
          whisker.position.set(side * R * 0.17 * S, -R * 0.04 * S, R * 0.16 * S);
          whisker.rotation.z = side * 1.15;
          head.add(whisker);
        }
      }
      const breathMat = new THREE.MeshBasicMaterial({ color: isDragon ? 0x38bdf8 : 0x34d399, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      const breath = new THREE.Mesh(new THREE.ConeGeometry(R * 0.22 * S, R * 2.3 * S, 14, 1, true), breathMat);
      breath.rotation.x = -Math.PI / 2; breath.position.z = R * 1.35 * S;
      head.add(breath);
      head.add(glowSprite(isDragon ? 0xfbbf24 : 0x10b981, R * 1.25 * S, 0.72));
      grp.add(head); segs.push(head);

      for (let i = 1; i < N; i++) {
        const t = i / (N - 1);
        const rad = R * S * (0.155 * (1 - t * 0.74) + 0.028);
        const sg = new THREE.Group();
        const m = new THREE.Mesh(new THREE.SphereGeometry(rad, 12, 10), i % 4 === 0 ? bellyMat : bodyMat);
        m.scale.set(1, 0.9, 1.45);
        sg.add(m);
        if (i % 2 === 0) {
          const crest = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.25, rad * 1.25, 4), bellyMat);
          crest.position.y = rad * 0.95; crest.rotation.x = -0.3;
          sg.add(crest);
        }
        grp.add(sg); segs.push(sg);
      }
      return { grp, segs, breath, mats };
    }

    function buildPhoenix(R, S) {
      const grp = new THREE.Group(), bird = new THREE.Group(), mats = [];
      const coreMat = makeBioShader(0xff5a1f, 0xfff3a8, 0xffaa22, 14.0, 1.25);
      mats.push(coreMat);
      const goldMat = new THREE.MeshBasicMaterial({ color: 0xfff3a8, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xff4518, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(R * 0.22 * S, 16, 12), coreMat);
      bodyMesh.scale.set(0.75, 0.75, 1.9);
      const crest = new THREE.Mesh(new THREE.ConeGeometry(R * 0.095 * S, R * 0.40 * S, 6), coreMat);
      crest.position.set(0, R * 0.15 * S, R * 0.32 * S); crest.rotation.x = 0.65;
      bird.add(bodyMesh, crest);

      const wings = [];
      for (const side of [-1, 1]) {
        const wg = new THREE.Group();
        wg.position.set(side * R * 0.14 * S, 0, R * 0.04 * S);
        for (let f = 0; f < 9; f++) {
          const len = R * (0.88 + Math.sin(f / 8 * Math.PI) * 0.72) * S;
          const feather = new THREE.Mesh(new THREE.PlaneGeometry(len, R * 0.18 * S), f % 2 === 0 ? goldMat : flameMat);
          feather.position.set(side * len * 0.5, 0, -f * R * 0.075 * S);
          feather.rotation.x = Math.PI / 2; feather.rotation.z = side * (-0.15 - f * 0.08);
          wg.add(feather);
        }
        bird.add(wg); wings.push({ wg, side });
      }
      const tails = [];
      for (let t = -1; t <= 1; t++) {
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(R * 0.20 * S, R * 1.85 * S), t === 0 ? goldMat : flameMat);
        pl.position.set(t * R * 0.15 * S, 0, -R * 1.05 * S);
        pl.rotation.x = Math.PI / 2; pl.rotation.z = t * 0.16;
        bird.add(pl); tails.push(pl);
      }
      bird.add(glowSprite(0xff8c1a, R * 2.3 * S, 0.88));
      grp.add(bird);
      return { grp, bird, wings, tails, mats };
    }

    function buildCthulhu(R, S) {
      const grp = new THREE.Group(), kraken = new THREE.Group(), mats = [];
      const domeMat = makeBioShader(0x312e81, 0x22d3ee, 0xc084fc, 12.0, 0.9);
      mats.push(domeMat);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      const mantle = new THREE.Mesh(new THREE.SphereGeometry(R * 0.48 * S, 24, 18), domeMat);
      mantle.scale.set(0.95, 1.35, 0.95); mantle.position.y = R * 0.36 * S;
      kraken.add(mantle);
      for (let e = 0; e < 6; e++) {
        const a = (e - 2.5) * 0.42;
        const eye = new THREE.Mesh(new THREE.SphereGeometry(R * 0.062 * S, 10, 10), new THREE.MeshBasicMaterial({ color: e % 2 ? 0xf43f5e : 0x22d3ee }));
        eye.position.set(Math.sin(a) * R * 0.40 * S, R * 0.05 * S, Math.cos(a) * R * 0.42 * S);
        kraken.add(eye);
      }
      const tentacles = [];
      for (let t = 0; t < 10; t++) {
        const a = t / 10 * Math.PI * 2;
        const nodes = [];
        for (let k = 0; k < 12; k++) {
          const rad = R * (0.085 - k * 0.0052) * S;
          const m = new THREE.Mesh(new THREE.SphereGeometry(rad, 8, 8), k % 3 === 0 ? glowMat : domeMat);
          kraken.add(m); nodes.push(m);
        }
        tentacles.push({ a, nodes });
      }
      kraken.add(glowSprite(0x6366f1, R * 2.1 * S, 0.72));
      grp.add(kraken);
      return { grp, kraken, tentacles, mats };
    }

    function buildTitan(R, S) {
      const grp = new THREE.Group(), titan = new THREE.Group(), mats = [];
      const armorMat = makeArmorShader(0x334155, 0x64748b, 0x38bdf8);
      const goldTrim = makeArmorShader(0xd97706, 0xfde047, 0xfbbf24);
      mats.push(armorMat, goldTrim);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.42 * S, R * 0.26 * S, R * 0.88 * S, 8), armorMat);
      const helm = new THREE.Mesh(new THREE.OctahedronGeometry(R * 0.20 * S, 1), goldTrim);
      helm.position.y = R * 0.62 * S;
      const reactor = new THREE.Mesh(new THREE.SphereGeometry(R * 0.15 * S, 16, 16), coreMat);
      reactor.position.set(0, R * 0.10 * S, R * 0.32 * S);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(R * 0.64 * S, R * 0.03 * S, 10, 48), goldTrim);
      halo.position.set(0, R * 0.34 * S, -R * 0.22 * S);
      titan.add(torso, helm, reactor, halo);
      for (const side of [-1, 1]) {
        const pauldron = new THREE.Mesh(new THREE.BoxGeometry(R * 0.34 * S, R * 0.30 * S, R * 0.36 * S), goldTrim);
        pauldron.position.set(side * R * 0.54 * S, R * 0.32 * S, 0);
        pauldron.rotation.z = -side * 0.25;
        titan.add(pauldron);
      }
      const swordPivot = new THREE.Group();
      swordPivot.position.set(0, R * 0.18 * S, R * 0.32 * S);
      const hilt = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.045 * S, R * 0.045 * S, R * 0.40 * S, 8), goldTrim);
      const bladeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false });
      const blade = new THREE.Mesh(new THREE.BoxGeometry(R * 0.15 * S, R * 2.95 * S, R * 0.04 * S), bladeMat);
      blade.position.y = R * 1.65 * S;
      const bladeEdge = new THREE.Mesh(new THREE.BoxGeometry(R * 0.05 * S, R * 3.0 * S, R * 0.06 * S), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      bladeEdge.position.y = R * 1.65 * S;
      swordPivot.add(hilt, blade, bladeEdge);
      titan.add(swordPivot);
      titan.add(glowSprite(0x38bdf8, R * 2.2 * S, 0.72));
      grp.add(titan);
      return { grp, titan, halo, swordPivot, blade, mats };
    }

    function spawnMonsterExperiment(type, body, worldPoint = null) {
      if (!body || body.isDestroyed) { showToast('请先选择一个完整的目标行星或卫星', 'amber'); return; }
      const limit = document.body.dataset.layout === 'mobile' ? 4 : 7;
      if (monsterLab.active.length >= limit) {
        cleanupMonster(monsterLab.active.shift());
      }
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
        if (b.shatterGroup && b.shatterChunks) {
          b.shatterAge = (b.shatterAge || 0) + dt;
          const damp = Math.exp(-b.shatterAge * 0.25);
          for (const c of b.shatterChunks) {
            c.mesh.position.addScaledVector(c.dir, c.speed * dt * damp);
            c.mesh.rotation.x += c.rot.x * dt;
            c.mesh.rotation.y += c.rot.y * dt;
          }
          b.shatterGroup.rotation.y += dt * 0.14;
        }
      }
      if (!monsterLab.active.length) return;

      for (let i = monsterLab.active.length - 1; i >= 0; i--) {
        const m = monsterLab.active[i];
        if (m.scaleKey !== state.currentScale) { m.data.grp.visible = false; continue; }
        m.data.grp.visible = true;
        m.age += dt;
        if (m.data.mats) m.data.mats.forEach(mat => { if (mat.uniforms?.uTime) mat.uniforms.uTime.value = m.age; });
        const u = Math.min(1, m.age / m.duration), { F, R: Rt, U } = m.basis, rad = m.R;
        const posAt = (f, r, up) => new THREE.Vector3().addScaledVector(F, f * rad).addScaledVector(Rt, r * rad).addScaledVector(U, up * rad);

        if (m.type === 'worm') {
          // 侧前方 3/4 电影级机位：巨虫从右上方扭动扑下钻穿星球，再从左下方破壳而出！
          const wormPt = (s) => {
            const prog = -2.8 + s * 6.0;
            const wave = Math.sin(s * 18 - m.age * 5.5) * 0.26 * Math.min(1, Math.abs(prog) * 0.75 + 0.15);
            return posAt(0.75 - Math.abs(prog) * 0.18, -prog * 0.92 + wave, -prog * 0.45 + Math.cos(s * 14) * 0.18);
          };
          m.data.segs.forEach((sg, idx) => {
            const s = u - idx * 0.016;
            const p = wormPt(s), pAhead = wormPt(s + 0.012);
            sg.position.copy(p); sg.lookAt(m.body.meshGroup.localToWorld(pAhead.clone()));
            sg.visible = p.length() > rad * 0.85 || idx < 2;
          });
          m.data.fangRings.forEach((rg, k) => { rg.rotation.z += dt * (k % 2 ? 6.0 : -7.0); });
          if (u > 0.30 && !m.struck.has('in')) { m.struck.add('in'); monsterStrike(m.body, 'worm', posAt(0.55, 0.76, 0.35), 1.7, 0.18, 0xff5a1f, '噬星钻入地壳'); }
          if (u > 0.56 && !m.struck.has('out')) { m.struck.add('out'); monsterStrike(m.body, 'worm', posAt(0.45, -0.78, -0.35), 2.3, 0.22, 0xff3b14, '贯通破壳钻出'); }
        }
        else if (m.type === 'zerg') {
          const d = m.data;
          // 利维坦母巢居于右上方 3/4 英雄视角（完整落于中屏视野内），48 只虫群环绕俯冲
          const levPos = posAt(0.75, 1.38 + Math.sin(u * 3.8) * 0.25, 0.85 + Math.cos(u * 2.8) * 0.18);
          d.leviathan.position.copy(levPos);
          d.leviathan.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
          d.tentacles.forEach(t => t.nodes.forEach((n, k) => { n.position.x = Math.sin(m.age * 4.5 + t.phase + k * 0.7) * rad * 0.04 * k; n.position.y = Math.cos(m.age * 3.8 + t.phase + k * 0.6) * rad * 0.04 * k; }));
          d.flyers.forEach((fl, idx) => {
            const a = fl.angle + m.age * fl.speed;
            const dive = 1.0 + 0.28 * Math.sin(m.age * 3.5 + fl.phase);
            const rr = rad * (1.08 + (fl.rad / rad - 1.0) * dive * (1 - u * 0.2));
            const p = posAt(Math.sin(a) * rr / rad * 0.85, Math.cos(a) * rr / rad, Math.sin(a * 1.7 + fl.elev) * 0.75);
            fl.grp.position.copy(p);
            const pNext = posAt(Math.sin(a + 0.14) * rr / rad * 0.85, Math.cos(a + 0.14) * rr / rad, Math.sin((a + 0.14) * 1.7 + fl.elev) * 0.75);
            fl.grp.lookAt(m.body.meshGroup.localToWorld(pNext));
            fl.wing.rotation.z = Math.sin(m.age * 24 + idx) * 0.55;
          });
          d.creepMat.uniforms.uTime.value = m.age;
          d.creepMat.uniforms.uSpread.value = Math.min(1, u * 1.6) * (u > 0.86 ? (1 - u) / 0.14 : 1);
          for (let k = 0; k < 4; k++) {
            if (u > 0.18 + k * 0.18 && !m.struck.has(k)) {
              m.struck.add(k);
              monsterStrike(m.body, 'zerg', posAt(0.82, (k - 1.5) * 0.42, Math.sin(k * 2.1) * 0.4), 0.9, 0.12, 0x4ade80, `虫群生物等离子轰炸 #${k + 1}`);
            }
          }
        }
        else if (m.type === 'occ') {
          const d = m.data;
          // 左上方 3/4 侧前悬停（完整展现炽红竖瞳与三层炽天使眼轮）
          const hover = posAt(0.75, -1.32 + Math.sin(u * 2.4) * 0.14, 0.82 + Math.cos(u * 2.2) * 0.10);
          d.entity.position.copy(hover);
          d.entity.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
          const appear = Math.min(1, u * 6.0) * (u > 0.88 ? (1 - u) / 0.12 : 1);
          d.entity.scale.setScalar(Math.max(0.01, appear));
          d.riftMat.uniforms.uTime.value = m.age;
          d.eyeMat.uniforms.uTime.value = m.age;
          const firing = u > 0.24 && u < 0.82;
          d.eyeMat.uniforms.uCharge.value = firing ? 1.0 : Math.min(1, u / 0.24);
          d.rings.forEach((rg, k) => {
            rg.rotation.z += dt * (k % 2 ? 2.6 : -3.1) * (firing ? 2.1 : 1);
            rg.rotation.x = Math.sin(m.age * (1.2 + k * 0.5)) * 0.55;
            rg.rotation.y = Math.cos(m.age * (1.0 + k * 0.4)) * 0.55;
          });
          d.tentacles.forEach(t => {
            t.nodes.forEach((n, k) => {
              const frac = (k + 1) / t.nodes.length;
              const spread = rad * (0.45 + frac * 0.48) * m.S;
              const sway = Math.sin(m.age * 4.8 + t.a * 2 + k * 0.6) * rad * 0.15 * frac;
              n.position.set(Math.cos(t.a) * spread + sway, Math.sin(t.a) * spread + sway * 0.7, frac * rad * (firing ? 1.7 : 0.65));
            });
          });
          d.beam.material.opacity = firing ? 0.68 + 0.24 * Math.sin(m.age * 30) : 0;
          d.beamCore.material.opacity = firing ? 0.94 : 0;
          if (u > 0.28 && !m.struck.has(1)) { m.struck.add(1); monsterStrike(m.body, 'occ', posAt(0.65, -0.65, 0.35), 1.8, 0.18, 0xe879f9, 'OCC 混沌歼星凝视'); }
          if (u > 0.58 && !m.struck.has(2)) { m.struck.add(2); monsterStrike(m.body, 'occ', posAt(0.72, -0.42, 0.12), 2.3, 0.22, 0xff2a55, '旧日虚空裂隙撕裂'); }
        }
        else if (m.type === 'fleet') {
          const d = m.data;
          // 舰队在右上方 3/4 弧形轨道排开，整支无畏舰队完整呈现在中屏画面内
          const warpIn = Math.min(1, u * 7.5);
          const depart = u > 0.86 ? (u - 0.86) / 0.14 : 0;
          const shift = (1 - warpIn) * 3.0 + depart * 4.5;
          d.flagship.position.copy(posAt(0.75 + shift * 0.35, 1.52 + shift, 0.88));
          d.flagship.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
          d.escorts.forEach(e => {
            const w = THREE.MathUtils.clamp((u - e.warpDelay) * 8, 0, 1);
            const es = (1 - w) * 2.8 + depart * 4.5;
            const rr = 1.68 + e.row * 0.34 + es;
            e.ship.position.copy(posAt(Math.sin(e.a) * rr * 0.85 + 0.45, Math.cos(e.a) * rr, e.elev + 0.32));
            e.ship.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
            e.ship.visible = w > 0.02;
          });
          if (u > 0.14 && u < 0.72 && Math.floor(m.age * 9.0) > d.bolts.length) {
            const shooter = d.escorts[d.bolts.length % d.escorts.length].ship;
            const bMesh = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.022, rad * 0.022, rad * 0.42, 6), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
            bMesh.rotation.x = Math.PI / 2;
            const bg = new THREE.Group(); bg.add(bMesh);
            const start = shooter.position.clone();
            const target = posAt(0.65 + Math.sin(d.bolts.length * 1.9) * 0.25, 0.65, Math.cos(d.bolts.length * 2.1) * 0.45);
            bg.position.copy(start); bg.lookAt(m.body.meshGroup.localToWorld(target.clone()));
            d.grp.add(bg);
            d.bolts.push({ grp: bg, start, target, t: 0 });
          }
          for (const b of d.bolts) {
            if (b.t < 1) {
              b.t = Math.min(1, b.t + dt * 2.8);
              b.grp.position.lerpVectors(b.start, b.target, b.t);
              if (b.t >= 1) b.grp.visible = false;
            }
          }
          const beamOn = u > 0.50 && u < 0.84;
          d.mainBeam.material.opacity = beamOn ? 0.74 + 0.22 * Math.sin(m.age * 32) : 0;
          d.mainCore.material.opacity = beamOn ? 0.96 : 0;
          for (let k = 0; k < 3; k++) {
            if (u > 0.22 + k * 0.12 && !m.struck.has(k)) {
              m.struck.add(k);
              monsterStrike(m.body, 'fleet', posAt(0.65, 0.68, (k - 1) * 0.38), 0.95, 0.11, 0x38bdf8, `护卫舰轨道饱和齐射 #${k + 1}`);
            }
          }
          if (u > 0.54 && !m.struck.has('main')) { m.struck.add('main'); monsterStrike(m.body, 'fleet', posAt(0.55, 0.78, 0.25), 2.7, 0.24, 0x38bdf8, '旗舰主炮 · 灭绝令打击'); }
        }
        else if (m.type === 'redfish') {
          const d = m.data;
          d.finMat.uniforms.uTime.value = m.age;
          // 在行星正前方至侧翼划出大弧线优雅游弋并猛扑吞噬
          const swimPt = (s) => {
            const ang = -1.2 + s * Math.PI * 2.6;
            const orbitR = 2.15 - Math.sin(THREE.MathUtils.clamp(s, 0, 1) * Math.PI) * 0.72;
            const undul = Math.sin(s * 24 - m.age * 4.0) * 0.12;
            return posAt(Math.sin(ang) * orbitR * 0.78 + 0.32, Math.cos(ang) * orbitR + undul, Math.sin(ang * 1.5) * 0.82);
          };
          d.segs.forEach((sg, idx) => {
            const s = u - idx * 0.013;
            const p = swimPt(s), pNext = swimPt(s + 0.01);
            sg.position.copy(p); sg.lookAt(m.body.meshGroup.localToWorld(pNext));
          });
          if (u > 0.30 && !m.struck.has(1)) { m.struck.add(1); monsterStrike(m.body, 'redfish', posAt(0.75, 0.55, 0.25), 1.4, 0.15, 0xff3b2f, '巨鲲摆尾 · 大气撕裂'); }
          if (u > 0.60 && !m.struck.has(2)) { m.struck.add(2); monsterStrike(m.body, 'redfish', posAt(0.85, -0.42, -0.18), 2.2, 0.21, 0xfbbf24, '宇宙红鱼 · 赤炎引力吞噬'); }
        }
        else if (m.type === 'snake') {
          const d = m.data;
          // 紧贴星球赤道 2.5 圈缠绕（绕 U 轴，绝不冲撞镜头！）并剧烈绞杀
          const squeeze = u > 0.46 && u < 0.82 ? Math.sin(((u - 0.46) / 0.36) * Math.PI) : 0;
          if (!m.body.shatterGroup) {
            m.body.mesh.scale.copy(m.initialScale).multiply(new THREE.Vector3(1 - squeeze * 0.18, 1 + squeeze * 0.24, 1 - squeeze * 0.18));
          }
          const coilPt = (s) => {
            const clamped = Math.max(-0.4, s);
            const ang = clamped * Math.PI * 4.8;
            const rr = clamped < 0.18 ? 2.4 - (clamped / 0.18) * 1.15 : (clamped > 0.84 ? 1.22 + ((clamped - 0.84) / 0.16) * 2.2 : 1.24 - squeeze * 0.12);
            const yBand = Math.sin(ang * 0.55) * 0.58;
            return posAt(Math.sin(ang) * rr, Math.cos(ang) * rr, yBand);
          };
          d.segs.forEach((sg, idx) => {
            const s = u - idx * 0.0068;
            const p = coilPt(s), pNext = coilPt(s + 0.008);
            sg.position.copy(p); sg.lookAt(m.body.meshGroup.localToWorld(pNext));
          });
          d.breath.material.opacity = (u > 0.60 && u < 0.84) ? 0.76 : 0;
          for (let k = 0; k < 4; k++) {
            if (u > 0.38 + k * 0.10 && !m.struck.has(k)) {
              m.struck.add(k);
              const a = k * Math.PI * 0.5;
              monsterStrike(m.body, 'snake', posAt(Math.max(0.25, Math.sin(a)), Math.cos(a), (k % 2 ? 0.22 : -0.22)), 1.35, 0.15, 0x10b981, `巨蛇绞杀 · 赤道断层崩裂 #${k + 1}`);
            }
          }
        }
        else if (m.type === 'dragon') {
          const d = m.data;
          const dragPt = (s) => {
            const ang = -0.8 + s * Math.PI * 3.4;
            const rr = 2.05 - Math.sin(THREE.MathUtils.clamp(s, 0, 1) * Math.PI) * 0.52;
            return posAt(Math.sin(ang) * rr * 0.85, Math.cos(ang) * rr, 0.55 + Math.sin(ang * 2.0) * 0.68);
          };
          d.segs.forEach((sg, idx) => {
            const s = u - idx * 0.0075;
            const p = dragPt(s), pNext = dragPt(s + 0.009);
            sg.position.copy(p); sg.lookAt(m.body.meshGroup.localToWorld(pNext));
          });
          const breathe = u > 0.30 && u < 0.78;
          d.breath.material.opacity = breathe ? 0.80 + 0.18 * Math.sin(m.age * 24) : 0;
          for (let k = 0; k < 4; k++) {
            if (u > 0.22 + k * 0.15 && !m.struck.has(k)) {
              m.struck.add(k);
              monsterStrike(m.body, 'dragon', posAt(0.85, Math.sin(k * 1.9) * 0.52, Math.cos(k * 1.5) * 0.42), 1.4, 0.15, k % 2 ? 0x38bdf8 : 0xfbbf24, `星穹神龙 · 龙炎天雷 #${k + 1}`);
            }
          }
        }
        else if (m.type === 'phoenix') {
          const d = m.data;
          let p, pNext;
          if (u < 0.52) {
            const s = u / 0.52, ang = -0.9 + s * Math.PI * 1.9;
            p = posAt(Math.sin(ang) * 1.8, Math.cos(ang) * 2.1, 0.95 + Math.sin(s * Math.PI) * 0.55);
            pNext = posAt(Math.sin(ang + 0.12) * 1.8, Math.cos(ang + 0.12) * 2.1, 0.95 + Math.sin((s + 0.05) * Math.PI) * 0.55);
          } else {
            const s = (u - 0.52) / 0.48;
            const dive = s < 0.36 ? 2.1 - (s / 0.36) * 1.15 : 0.95 + ((s - 0.36) / 0.64) * 3.5;
            p = posAt(0.65, (0.36 - s) * 2.4, dive);
            pNext = posAt(0.55, (0.31 - s) * 2.4, dive - 0.18);
          }
          d.bird.position.copy(p); d.bird.lookAt(m.body.meshGroup.localToWorld(pNext));
          d.wings.forEach(w => { w.wg.rotation.z = w.side * Math.sin(m.age * 12.0) * 0.58; });
          if (u > 0.24 && !m.struck.has(1)) { m.struck.add(1); monsterStrike(m.body, 'phoenix', posAt(0.82, 0.45, 0.38), 1.2, 0.13, 0xff8c1a, '焚天星凰 · 烈焰羽箭雨'); }
          if (u > 0.66 && !m.struck.has(2)) { m.struck.add(2); monsterStrike(m.body, 'phoenix', posAt(0.88, 0.1, 0.32), 2.8, 0.25, 0xff4518, '超新星涅槃俯冲'); }
        }
        else if (m.type === 'cthulhu') {
          const d = m.data;
          const grab = u > 0.18 && u < 0.84 ? Math.sin(THREE.MathUtils.clamp((u - 0.18) / 0.66, 0, 1) * Math.PI) : 0;
          const dist = 2.25 - grab * 0.72;
          d.kraken.position.copy(posAt(0.55, 0.12, dist));
          d.kraken.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
          d.kraken.rotateX(-Math.PI / 2);
          d.tentacles.forEach(t => {
            t.nodes.forEach((n, k) => {
              const frac = (k + 1) / t.nodes.length;
              const openR = rad * (0.42 + Math.sin(frac * Math.PI) * (0.85 - grab * 0.16)) * m.S;
              const yDown = -frac * rad * (1.2 + grab * 1.25);
              const wriggle = Math.sin(m.age * 5.2 + t.a * 2 + k * 0.65) * rad * 0.08;
              n.position.set(Math.cos(t.a) * openR + wriggle, yDown, Math.sin(t.a) * openR + wriggle);
            });
          });
          for (let k = 0; k < 3; k++) {
            if (u > 0.28 + k * 0.18 && !m.struck.has(k)) {
              m.struck.add(k);
              const a = k * 2.1;
              monsterStrike(m.body, 'cthulhu', posAt(0.55, Math.sin(a) * 0.55, 0.65), 1.5, 0.16, 0x6366f1, `虚空魔神 · 触手虹吸地核 #${k + 1}`);
            }
          }
        }
        else if (m.type === 'titan') {
          const d = m.data;
          // 泰坦悬停于右上方 3/4 英雄机位（完整展现星神皇冠、方舟核心与星穹光剑劈斩）
          const appear = Math.min(1, u * 6.0) * (u > 0.88 ? (1 - u) / 0.12 : 1);
          d.titan.position.copy(posAt(0.75, 1.38, 0.72));
          d.titan.lookAt(m.body.meshGroup.localToWorld(new THREE.Vector3()));
          d.titan.scale.setScalar(Math.max(0.01, appear));
          d.halo.rotation.z += dt * 2.0;
          const slashU = THREE.MathUtils.clamp((u - 0.34) / 0.24, 0, 1);
          const easeSlash = slashU * slashU * (3 - 2 * slashU);
          d.swordPivot.rotation.x = -0.65 + easeSlash * 2.45;
          d.swordPivot.rotation.z = -0.3 + easeSlash * 0.6;
          const glowBoost = u > 0.20 && u < 0.78 ? 1.0 + Math.sin(m.age * 20) * 0.18 : 0.72;
          d.blade.scale.set(glowBoost, Math.min(1.25, 0.25 + u * 2.4), 1);
          for (let k = 0; k < 4; k++) {
            if (u > 0.40 + k * 0.055 && !m.struck.has(k)) {
              m.struck.add(k);
              const yLine = 0.62 - k * 0.42;
              monsterStrike(m.body, 'titan', posAt(0.75, 0.35 - k * 0.18, yLine), 1.75, 0.17, 0x38bdf8, `灭星泰坦 · 光剑裂星斩 #${k + 1}`);
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
        if (b.shatterGroup) {
          disposeTree(b.shatterGroup);
          b.shatterGroup = null;
          b.shatterChunks = null;
          b.mesh.visible = true;
          if (b.cloudsMesh) b.cloudsMesh.visible = true;
          if (b.atmoMesh) b.atmoMesh.visible = true;
        }
      });
    }
