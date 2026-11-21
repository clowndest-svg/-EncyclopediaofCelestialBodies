    // =========================================================================
    // 宇宙沙盘 2 (Universe Sandbox 2 Mode) — 独立 N体引力/气候/宜居带/碰撞/超新星/时空网格引擎
    // =========================================================================
    const SB_TEMPLATES = [
      { id: 'asteroid',  icon: '☄️', name: '小行星',     badge: '岩质小天体', kind: 'planet', mass: 0.0005, radius: 0.65, temp: -40,  water: 0,   atmo: 0,   color: [0.55, 0.50, 0.45] },
      { id: 'moon',      icon: '🌙', name: '月球',       badge: '天然卫星',   kind: 'planet', mass: 0.004,  radius: 1.05, temp: -20,  water: 0,   atmo: 0,   color: [0.72, 0.72, 0.74] },
      { id: 'mars',      icon: '🔴', name: '火星',       badge: '荒漠岩质星', kind: 'planet', mass: 0.015,  radius: 1.35, temp: -55,  water: 12,  atmo: 0.2, color: [0.78, 0.36, 0.20] },
      { id: 'earth',     icon: '🌍', name: '地球',       badge: '宜居岩质星', kind: 'planet', mass: 0.045,  radius: 1.75, temp: 15,   water: 71,  atmo: 1.0, color: [0.22, 0.52, 0.26] },
      { id: 'jupiter',   icon: '🟠', name: '木星',       badge: '气态巨行星', kind: 'gas',    mass: 0.95,   radius: 3.45, temp: -110, water: 0,   atmo: 3.5, color: [0.85, 0.64, 0.44] },
      { id: 'saturn',    icon: '🪐', name: '土星（带环）',badge: '环状巨行星', kind: 'gas',    mass: 0.62,   radius: 3.05, temp: -140, water: 0,   atmo: 3.2, color: [0.88, 0.78, 0.56], ring: true },
      { id: 'hotjup',    icon: '🔥', name: '热木星',     badge: '炽热气态星', kind: 'gas',    mass: 1.25,   radius: 3.25, temp: 1450, water: 0,   atmo: 4.0, color: [0.95, 0.38, 0.16] },
      { id: 'comet',     icon: '💫', name: '冰晶彗星',   badge: '冰尘彗星',   kind: 'planet', mass: 0.0004, radius: 0.72, temp: -190, water: 95,  atmo: 0.3, color: [0.68, 0.88, 1.0] },
      { id: 'reddwarf',  icon: '🔴', name: '红矮星',     badge: 'M 型红矮星', kind: 'star',   mass: 42,     radius: 4.2,  temp: 3200, water: 0,   atmo: 0,   color: [1.0, 0.34, 0.16] },
      { id: 'sun',       icon: '☀️', name: '类日恒星',   badge: 'G 型主序星', kind: 'star',   mass: 120,    radius: 5.8,  temp: 5505, water: 0,   atmo: 0,   color: [1.0, 0.82, 0.36] },
      { id: 'bluegiant', icon: '💠', name: '蓝超巨星',   badge: 'O 型超巨星', kind: 'star',   mass: 360,    radius: 8.2,  temp: 24000,water: 0,   atmo: 0,   color: [0.58, 0.84, 1.0] },
      { id: 'whitedwarf',icon: '⚪', name: '白矮星',     badge: '致密简并核', kind: 'star',   mass: 150,    radius: 2.1,  temp: 18000,water: 0,   atmo: 0,   color: [0.88, 0.96, 1.0] },
      { id: 'neutron',   icon: '⚡', name: '脉冲中子星', badge: '极端致密星', kind: 'star',   mass: 240,    radius: 1.5,  temp: 40000,water: 0,   atmo: 0,   color: [0.45, 0.94, 1.0], pulsar: true },
      { id: 'blackhole', icon: '🕳️', name: '黑洞',       badge: '事件视界',   kind: 'bh',     mass: 520,    radius: 3.2,  temp: 0,    water: 0,   atmo: 0,   color: [0.02, 0.02, 0.04] }
    ];

    const sb = {
      open: false, inited: false, rafId: 0, wasMainPaused: false,
      scene: null, camera: null, renderer: null, controls: null,
      bodies: [], effects: [], selected: null, followBody: null,
      preset: 'solar', tool: 'select', launchMode: 'orbit', spawnId: 'earth',
      customTemplate: null,
      paused: false, speed: 1.0, gravity: 1.0, simYears: 0,
      showTrails: true, showHZ: true, showGrid: true, showVel: false, showLabels: true,
      gridMesh: null, gridBasePos: null, hzMesh: null,
      dragState: null, previewLine: null, laserLine: null, activeBeamTarget: null,
      raycaster: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      G_CONST: 1.25, nextId: 1, fpsFrames: 0, fpsLast: 0, fpsVal: 60
    };

    const sb$ = id => document.getElementById(id);

    function sbToast(msg) {
      const el = sb$('sb-toast'); if (!el) return;
      el.textContent = msg; el.hidden = false;
      clearTimeout(sb._toastTimer);
      sb._toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
    }

    function sbMakePlanetMat(body) {
      if (body.kind === 'star') {
        return new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(...body.color) }, uTemp: { value: body.temp } },
          vertexShader: `varying vec3 vP,vN,vV;void main(){vP=normalize(position);vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
          fragmentShader: `varying vec3 vP,vN,vV;uniform float uTime,uTemp;uniform vec3 uColor;
            float h(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
            float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
            void main(){
              float g=n(vP*7.+vec3(uTime*.6,-uTime*.4,uTime*.3))*.6+n(vP*16.-vec3(uTime*.9))*.4;
              float rim=pow(1.-max(0.,dot(normalize(vN),normalize(vV))),2.2);
              vec3 hot=mix(uColor,vec3(1.,0.98,0.92),smoothstep(0.45,0.88,g));
              gl_FragColor=vec4(hot*(0.92+0.35*g)+uColor*rim*0.65,1.);
            }`
        });
      }
      if (body.kind === 'bh') {
        return new THREE.MeshBasicMaterial({ color: 0x010205 });
      }
      // 实时气候/冰封/海洋/温室/熔岩自适应行星着色器（Universe Sandbox 2 核心特色！）
      return new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uBase: { value: new THREE.Color(...body.color) },
          uTemp: { value: body.temp },
          uWater: { value: body.water / 100 },
          uAtmo: { value: body.atmo },
          uIsGas: { value: body.kind === 'gas' ? 1.0 : 0.0 },
          uLightDir: { value: new THREE.Vector3(0.6, 0.5, 0.6).normalize() }
        },
        vertexShader: `varying vec3 vP,vN,vV;void main(){vP=normalize(position);vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
        fragmentShader: `varying vec3 vP,vN,vV;uniform float uTime,uTemp,uWater,uAtmo,uIsGas;uniform vec3 uBase,uLightDir;
          float h(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
          float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
          void main(){
            vec3 N=normalize(vN),V=normalize(vV);
            float diff=max(0.,dot(N,normalize(uLightDir)))*0.92+0.24;
            float fres=pow(1.-max(0.,dot(N,V)),2.8);
            vec3 col=uBase;
            vec3 emi=vec3(0.);
            if(uIsGas>0.5){
              float band=sin(vP.y*16.+n(vP*4.+vec3(uTime*.15,0.,0.))*3.2)*.5+.5;
              col=mix(uBase*0.62,uBase*1.28,band);
              float hotGas=smoothstep(650.,1400.,uTemp);
              emi+=vec3(1.,0.35,0.06)*hotGas*band*0.85;
            }else{
              float elev=n(vP*3.6)*.65+n(vP*8.5)*.35;
              float waterLine=uWater*0.76;
              float isOcean=smoothstep(waterLine+0.04,waterLine-0.04,elev)*step(0.02,uWater);
              float freeze=smoothstep(4.,-22.,uTemp);
              float boil=smoothstep(95.,240.,uTemp);
              float lava=smoothstep(580.,1150.,uTemp);
              float polar=smoothstep(0.72-freeze*0.75,0.92-freeze*0.65,abs(vP.y));
              vec3 land=mix(uBase*0.78,vec3(0.18,0.52,0.22),smoothstep(0.15,0.6,uWater)*(1.-freeze)*(1.-boil));
              vec3 ocean=mix(vec3(0.04,0.24,0.62),vec3(0.10,0.48,0.80),elev);
              col=mix(land,ocean,isOcean*(1.-boil));
              col=mix(col,vec3(0.84,0.93,1.0),clamp(max(polar,freeze*(0.65+0.35*isOcean)),0.,0.95));
              col=mix(col,vec3(0.20,0.12,0.10),lava*0.82);
              float crack=smoothstep(0.46,0.72,n(vP*11.+vec3(uTime*.15)));
              emi+=mix(vec3(1.,0.22,0.02),vec3(1.,0.85,0.35),crack)*lava*(0.45+crack*1.25);
              // 云层/温室雾霾
              float cloud=smoothstep(0.48,0.76,n(vP*5.2+vec3(uTime*.12,0.,-uTime*.08)))*min(1.,uAtmo*0.35)*(1.-lava*0.7);
              vec3 cloudCol=mix(vec3(0.92,0.96,1.),vec3(0.95,0.78,0.42),smoothstep(1.8,4.0,uAtmo));
              col=mix(col,cloudCol,cloud*0.75);
            }
            vec3 atmoTint=uTemp>500.?vec3(1.,0.45,0.15):uAtmo>2.5?vec3(0.95,0.72,0.32):vec3(0.32,0.72,1.);
            vec3 outCol=col*diff+atmoTint*fres*min(0.85,uAtmo*0.28)+emi;
            gl_FragColor=vec4(outCol,1.);
          }`
      });
    }

    function sbCreateBody(cfg) {
      const id = 'b' + (sb.nextId++);
      const body = {
        id, name: cfg.name || '天体', badge: cfg.badge || '自定义天体',
        kind: cfg.kind || 'planet',
        mass: Math.max(0.0001, Number(cfg.mass) || 0.04),
        radius: Math.max(0.35, Number(cfg.radius) || 1.5),
        baseRadius: Math.max(0.35, Number(cfg.radius) || 1.5),
        pos: new THREE.Vector3(...(cfg.pos || [0, 0, 0])),
        vel: new THREE.Vector3(...(cfg.vel || [0, 0, 0])),
        acc: new THREE.Vector3(),
        temp: cfg.temp ?? 15,
        water: cfg.water ?? 0,
        atmo: cfg.atmo ?? 0,
        spin: cfg.spin ?? 0.6,
        color: cfg.color || [0.5, 0.6, 0.7],
        hasRing: !!cfg.ring,
        pulsar: !!cfg.pulsar,
        alive: true,
        history: []
      };

      const grp = new THREE.Group();
      grp.position.copy(body.pos);
      const mat = sbMakePlanetMat(body);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(body.radius, 36, 26), mat);
      mesh.userData.sbBody = body;
      grp.add(mesh);

      if (body.kind === 'star') {
        const glow = glowSprite(new THREE.Color(...body.color).getHex(), body.radius * 4.2, 0.72);
        grp.add(glow); body.glow = glow;
        if (body.pulsar) {
          const jetGeo = new THREE.CylinderGeometry(body.radius * 0.14, body.radius * 0.5, body.radius * 18, 12, 1, true);
          const jet = new THREE.Mesh(jetGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
          jet.rotation.z = 0.35; grp.add(jet);
        }
      } else if (body.kind === 'bh') {
        const disk = new THREE.Mesh(
          new THREE.RingGeometry(body.radius * 1.45, body.radius * 4.2, 64),
          new THREE.MeshBasicMaterial({ color: 0xff9a3c, transparent: true, opacity: 0.78, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        disk.rotation.x = Math.PI * 0.44; grp.add(disk);
        const halo = glowSprite(0xff8c24, body.radius * 5.2, 0.55); grp.add(halo);
      }
      if (body.hasRing) sbAttachRing(grp, body);

      // 轨迹线与速度矢量
      const trailMax = 140;
      const trailPos = new Float32Array(trailMax * 3);
      for (let i = 0; i < trailMax; i++) { trailPos[i * 3] = body.pos.x; trailPos[i * 3 + 1] = body.pos.y; trailPos[i * 3 + 2] = body.pos.z; }
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
      const trailCol = body.kind === 'star' ? 0xfbbf24 : body.kind === 'bh' ? 0xc084fc : new THREE.Color(...body.color).lerp(new THREE.Color(0x7dd3fc), 0.45).getHex();
      const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: trailCol, transparent: true, opacity: 0.55, depthWrite: false }));
      trail.frustumCulled = false;
      sb.scene.add(trail);

      const velArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), body.pos, 4, 0x38bdf8, 1.1, 0.55);
      velArrow.visible = sb.showVel;
      sb.scene.add(velArrow);

      // 浮动标签
      const labelEl = document.createElement('span');
      labelEl.className = 'sb-label';
      labelEl.textContent = body.name;
      sb$('sb-labels').appendChild(labelEl);

      body.grp = grp; body.mesh = mesh; body.mat = mat; body.trail = trail; body.trailCount = 0; body.velArrow = velArrow; body.labelEl = labelEl;
      sb.scene.add(grp);
      sb.bodies.push(body);
      return body;
    }

    function sbAttachRing(grp, body) {
      if (body.ringMesh) return;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(body.radius * 1.45, body.radius * 2.55, 64),
        new THREE.MeshBasicMaterial({ color: 0xe6d2a2, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false })
      );
      ring.rotation.x = Math.PI * 0.44;
      grp.add(ring);
      body.ringMesh = ring; body.hasRing = true;
    }

    function sbRemoveBody(body) {
      if (!body || !body.alive) return;
      body.alive = false;
      disposeTree(body.grp);
      disposeTree(body.trail);
      sb.scene.remove(body.velArrow);
      body.labelEl?.remove();
      const idx = sb.bodies.indexOf(body);
      if (idx >= 0) sb.bodies.splice(idx, 1);
      if (sb.selected === body) sbSelectBody(sb.bodies[0] || null);
      if (sb.followBody === body) { sb.followBody = null; sb$('sb-follow-btn')?.setAttribute('aria-pressed', 'false'); }
    }

    function sbClearAll() {
      [...sb.bodies].forEach(sbRemoveBody);
      sb.effects.forEach(e => disposeTree(e.grp));
      sb.effects = [];
      sb.simYears = 0;
    }

    // -------------------------------------------------------------------------
    // 3D 广义相对论时空弯曲引力网格 (Spacetime Gravity Well Grid) + 3带宜居带
    // -------------------------------------------------------------------------
    function sbBuildEnvironment() {
      // 深空星空背景
      const nS = 2600, pos = new Float32Array(nS * 3), col = new Float32Array(nS * 3), rng = deterministicRandom(2027);
      for (let i = 0; i < nS; i++) {
        const r = 420 + rng() * 520, a = rng() * Math.PI * 2, ph = Math.acos(2 * rng() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(a); pos[i * 3 + 1] = r * Math.cos(ph); pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(a);
        const c = new THREE.Color().setHSL(0.56 + (rng() - 0.5) * 0.14, 0.45, 0.72 + rng() * 0.25);
        c.toArray(col, i * 3);
      }
      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      sGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      sb.scene.add(glowPoints(sGeo, 2.2, 0.82));

      // 3D 时空弯曲网格 (48x48 细平面，实时受全天体引力势向下弯曲！)
      const gGeo = new THREE.PlaneGeometry(240, 240, 48, 48);
      gGeo.rotateX(-Math.PI / 2);
      const gCount = gGeo.attributes.position.count;
      gGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(gCount * 3), 3));
      sb.gridBasePos = new Float32Array(gGeo.attributes.position.array);
      sb.gridMesh = new THREE.Mesh(gGeo, new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: true, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending }));
      sb.gridMesh.position.y = -6.5;
      sb.scene.add(sb.gridMesh);

      // 动态 3 带宜居带平面（内赤红过热 / 中翡翠绿液态水宜居带 / 外湛蓝冰冻区）
      const hzMat = new THREE.ShaderMaterial({
        uniforms: { uInner: { value: 0.28 }, uOuter: { value: 0.56 } },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `varying vec2 vUv;uniform float uInner,uOuter;void main(){
          float r=length((vUv-.5)*2.);
          if(r<0.06||r>0.98)discard;
          float hot=smoothstep(uInner,uInner*0.55,r)*0.18;
          float hab=smoothstep(uInner*0.88,uInner*1.04,r)*smoothstep(uOuter*1.12,uOuter*0.95,r)*0.28;
          float cold=smoothstep(uOuter*0.98,uOuter*1.25,r)*smoothstep(0.98,0.72,r)*0.12;
          vec3 col=vec3(1.,0.25,0.12)*hot+vec3(0.14,0.92,0.48)*hab+vec3(0.22,0.58,1.)*cold;
          float a=hot+hab+cold;
          if(a<0.01)discard;
          gl_FragColor=vec4(col,a);
        }`,
        transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
      });
      sb.hzMesh = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), hzMat);
      sb.hzMesh.rotation.x = -Math.PI / 2;
      sb.hzMesh.position.y = -0.35;
      sb.scene.add(sb.hzMesh);

      // 拖拽弹射轨道预览虚线
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(80 * 3), 3));
      sb.previewLine = new THREE.Line(pGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 }));
      sb.previewLine.visible = false;
      sb.previewLine.frustumCulled = false;
      sb.scene.add(sb.previewLine);

      // 激光 / 冰冻射线实时光束
      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      sb.laserLine = new THREE.Line(lGeo, new THREE.LineBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.92 }));
      sb.laserLine.visible = false;
      sb.scene.add(sb.laserLine);
    }

    function sbUpdateGravityGridAndHZ() {
      if (sb.gridMesh) {
        sb.gridMesh.visible = sb.showGrid;
        if (sb.showGrid) {
          const pos = sb.gridMesh.geometry.attributes.position, col = sb.gridMesh.geometry.attributes.color, base = sb.gridBasePos;
          const massive = sb.bodies.filter(b => b.mass >= 0.02);
          for (let i = 0; i < pos.count; i++) {
            const bx = base[i * 3], bz = base[i * 3 + 2];
            let well = 0;
            for (let j = 0; j < massive.length; j++) {
              const b = massive[j], dx = bx - b.pos.x, dz = bz - b.pos.z;
              const d = Math.sqrt(dx * dx + dz * dz + 36);
              well += (b.mass * sb.gravity) / d;
            }
            const depth = Math.min(28, well * 1.15);
            pos.setXYZ(i, bx, -depth, bz);
            const t = Math.min(1, depth / 16);
            col.setXYZ(i, 0.14 + t * 0.72, 0.56 - t * 0.24, 0.95);
          }
          pos.needsUpdate = true; col.needsUpdate = true;
        }
      }
      if (sb.hzMesh) {
        const star = sb.bodies.filter(b => b.kind === 'star').sort((a, b) => b.mass - a.mass)[0];
        sb.hzMesh.visible = sb.showHZ && !!star;
        if (star && sb.showHZ) {
          sb.hzMesh.position.set(star.pos.x, star.pos.y - 0.4, star.pos.z);
          const lumScale = Math.pow(Math.max(0.15, star.mass / 120), 0.75);
          const sc = THREE.MathUtils.clamp(lumScale, 0.4, 2.4);
          sb.hzMesh.scale.set(sc, sc, 1);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 8 大经典 Universe Sandbox 2 预设宇宙场景
    // -------------------------------------------------------------------------
    function sbCircularVel(pos, star) {
      const rVec = pos.clone().sub(star.pos);
      const r = Math.max(2, rVec.length());
      const vMag = Math.sqrt((sb.G_CONST * Math.max(0.1, sb.gravity) * star.mass) / r);
      return new THREE.Vector3(-rVec.z, 0, rVec.x).normalize().multiplyScalar(vMag).add(star.vel);
    }

    function sbLoadPreset(name) {
      sbClearAll();
      sb.preset = name;
      sb.followBody = null;
      sb$('sb-preset-select').value = name;
      sb$('sb-follow-btn')?.setAttribute('aria-pressed', 'false');

      if (name === 'solar') {
        const sun = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'sun'), name: '太阳', pos: [0, 0, 0], vel: [0, 0, 0] });
        const defs = [
          ['水星', 'planet', 0.008, 0.85, 16, 170, 0, 0, [0.65, 0.62, 0.58]],
          ['金星', 'planet', 0.038, 1.55, 24, 465, 0, 4.2, [0.90, 0.74, 0.42]],
          ['地球', 'planet', 0.045, 1.75, 36, 15, 71, 1.0, [0.22, 0.52, 0.26]],
          ['火星', 'planet', 0.015, 1.25, 48, -55, 10, 0.2, [0.80, 0.36, 0.20]],
          ['木星', 'gas', 0.95, 3.45, 68, -110, 0, 3.5, [0.85, 0.64, 0.44]],
          ['土星', 'gas', 0.62, 3.00, 88, -140, 0, 3.2, [0.88, 0.78, 0.56], true]
        ];
        defs.forEach(([nm, kind, mass, radius, dist, temp, water, atmo, color, ring], idx) => {
          const ang = idx * 1.15 + 0.4;
          const p = new THREE.Vector3(Math.cos(ang) * dist, 0, Math.sin(ang) * dist);
          const v = sbCircularVel(p, sun);
          sbCreateBody({ name: nm, badge: kind === 'gas' ? '气态巨行星' : '岩质行星', kind, mass, radius, pos: p.toArray(), vel: v.toArray(), temp, water, atmo, color, ring });
        });
        sbSelectBody(sb.bodies[3]); // 默认选中地球展示宜居率
        sb.camera.position.set(0, 88, 115); sb.controls.target.set(0, 0, 0);
      } else if (name === 'earth_moon') {
        const sun = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'sun'), name: '太阳', pos: [-95, 0, 0], vel: [0, 0, 0] });
        const earth = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'earth'), name: '地球', mass: 18, radius: 4.6, pos: [0, 0, 0], vel: [0, 0, 0] });
        const mp = new THREE.Vector3(24, 0, 0);
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'moon'), name: '月球', mass: 0.45, radius: 1.5, pos: mp.toArray(), vel: sbCircularVel(mp, earth).toArray() });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'mars'), name: '流浪忒伊亚', mass: 2.2, radius: 2.4, pos: [-38, 4, 28], vel: [1.35, -0.14, -0.92] });
        sbSelectBody(earth);
        sb.camera.position.set(0, 42, 62); sb.controls.target.set(0, 0, 0);
      } else if (name === 'three_body') {
        const m = 95, r = 24, v = 1.42;
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'sun'), name: '恒星 α', mass: m, radius: 4.8, pos: [r, 0, 0], vel: [0, 0.25, v] });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'reddwarf'), name: '恒星 β', mass: m * 0.9, radius: 4.2, pos: [-r * 0.5, 0, r * 0.86], vel: [-v * 0.86, -0.2, -v * 0.5] });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'bluegiant'), name: '恒星 γ', mass: m * 1.1, radius: 5.2, pos: [-r * 0.5, 0, -r * 0.86], vel: [v * 0.86, 0.1, -v * 0.5] });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'earth'), name: '三体行星', mass: 0.05, radius: 1.8, pos: [0, 2, 52], vel: [-2.15, 0, 0.2] });
        sbSelectBody(sb.bodies[3]);
        sb.camera.position.set(0, 78, 95); sb.controls.target.set(0, 0, 0);
      } else if (name === 'bh_eat') {
        const sun = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'sun'), name: '太阳', pos: [0, 0, 0], vel: [0, 0, 0] });
        [24, 38, 56, 74].forEach((dist, i) => {
          const p = new THREE.Vector3(Math.cos(i * 1.6) * dist, 0, Math.sin(i * 1.6) * dist);
          sbCreateBody({ ...SB_TEMPLATES[i === 1 ? 3 : i === 2 ? 4 : 2], name: ['金星', '地球', '木星', '土星'][i], pos: p.toArray(), vel: sbCircularVel(p, sun).toArray(), ring: i === 3 });
        });
        const bh = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'blackhole'), name: '流浪黑洞', mass: 680, radius: 4.2, pos: [-95, 10, -45], vel: [1.85, -0.18, 0.85] });
        sbSelectBody(bh);
        sb.camera.position.set(0, 96, 128); sb.controls.target.set(0, 0, 0);
      } else if (name === 'jupiter_slingshot') {
        const jup = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'jupiter'), name: '木星', mass: 85, radius: 6.2, pos: [0, 0, 0], vel: [0, 0, 0] });
        [['木卫一', 14, 1.1, [0.95, 0.82, 0.28]], ['木卫二', 21, 1.0, [0.85, 0.90, 0.95]], ['木卫三', 30, 1.4, [0.68, 0.65, 0.60]], ['木卫四', 42, 1.3, [0.52, 0.48, 0.45]]].forEach(([nm, d, rad, col], i) => {
          const p = new THREE.Vector3(Math.cos(i * 1.5) * d, 0, Math.sin(i * 1.5) * d);
          sbCreateBody({ name: nm, badge: '伽利略卫星', kind: 'planet', mass: 0.08, radius: rad, pos: p.toArray(), vel: sbCircularVel(p, jup).toArray(), temp: -135, water: i === 1 ? 95 : 10, atmo: 0.1, color: col });
        });
        for (let k = 0; k < 6; k++) {
          sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'comet'), name: `彗星 #${k + 1}`, pos: [-68 - k * 7, (k - 2.5) * 3, -18 + k * 4], vel: [2.6, 0, 0.45] });
        }
        sbSelectBody(jup);
        sb.camera.position.set(0, 62, 85); sb.controls.target.set(0, 0, 0);
      } else if (name === 'planet_crash') {
        const e1 = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'earth'), name: '原始地球', mass: 24, radius: 5.2, pos: [-24, 0, 0], vel: [0.95, 0, 0.22] });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'mars'), name: '忒伊亚行星', mass: 12, radius: 3.8, pos: [24, 1.5, -5], vel: [-1.45, -0.05, 0.12] });
        sbSelectBody(e1);
        sb.camera.position.set(0, 38, 58); sb.controls.target.set(0, 0, 0);
      } else if (name === 'galaxy_merge') {
        const c1 = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'blackhole'), name: '星系核 A', mass: 220, radius: 3.2, pos: [-38, 0, -14], vel: [0.85, 0, 0.35] });
        const c2 = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'blackhole'), name: '星系核 B', mass: 180, radius: 2.8, pos: [38, 4, 14], vel: [-0.95, -0.05, -0.35] });
        const rng = deterministicRandom(909);
        for (const [core, col] of [[c1, [0.55, 0.82, 1.0]], [c2, [1.0, 0.72, 0.42]]]) {
          for (let i = 0; i < 22; i++) {
            const r = 10 + rng() * 24, a = rng() * Math.PI * 2;
            const p = core.pos.clone().add(new THREE.Vector3(Math.cos(a) * r, (rng() - 0.5) * 3, Math.sin(a) * r));
            sbCreateBody({ name: '星团恒星', badge: '星团成员', kind: 'star', mass: 0.25, radius: 0.65 + rng() * 0.4, pos: p.toArray(), vel: sbCircularVel(p, core).toArray(), temp: 5800, color: col });
          }
        }
        sbSelectBody(c1);
        sb.camera.position.set(0, 92, 120); sb.controls.target.set(0, 0, 0);
      } else {
        sbSelectBody(null);
        sb.camera.position.set(0, 72, 95); sb.controls.target.set(0, 0, 0);
      }
      sbToast(`已载入预设场景：${sb$('sb-preset-select').selectedOptions[0]?.textContent || name}`);
    }

    // -------------------------------------------------------------------------
    // 特效：撞击爆炸、离心甩裂与超新星爆发！
    // -------------------------------------------------------------------------
    function sbSpawnExplosion(pos, colorHex, scale = 8, isSupernova = false) {
      const grp = new THREE.Group(); grp.position.copy(pos);
      const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
      const ring = new THREE.Mesh(new THREE.RingGeometry(scale * 0.4, scale * 1.15, 48), ringMat);
      ring.rotation.x = Math.PI * 0.45;
      const flash = glowSprite(colorHex, scale * (isSupernova ? 6.5 : 3.2), 0.95);
      grp.add(ring, flash);

      const pN = isSupernova ? 280 : 90, pPos = new Float32Array(pN * 3), pCol = new Float32Array(pN * 3), pVel = new Float32Array(pN * 3);
      const cA = new THREE.Color(colorHex), cB = new THREE.Color(0xfff4c2);
      for (let i = 0; i < pN; i++) {
        const a = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), spd = (isSupernova ? 18 : 7) * (0.35 + Math.random() * 0.9);
        pVel[i * 3] = Math.sin(ph) * Math.cos(a) * spd; pVel[i * 3 + 1] = Math.cos(ph) * spd; pVel[i * 3 + 2] = Math.sin(ph) * Math.sin(a) * spd;
        cA.clone().lerp(cB, Math.random() * 0.6).toArray(pCol, i * 3);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
      const pts = glowPoints(pGeo, isSupernova ? 1.8 : 0.95, 0.95);
      grp.add(pts);
      sb.scene.add(grp);
      sb.effects.push({ grp, ring, flash, pts, pVel, age: 0, duration: isSupernova ? 5.5 : 2.6, isSupernova });
      audioEngine?.playImpact?.(isSupernova ? 1.5 : 0.75);
    }

    function sbTriggerSupernova(body) {
      if (!body || !body.alive) return;
      const pos = body.pos.clone(), isStar = body.kind === 'star';
      sbSpawnExplosion(pos, isStar ? 0x7dd3fc : 0xff6b2b, body.radius * (isStar ? 3.8 : 2.2), true);
      // 冲击波推开并剧烈加热周围行星！
      sb.bodies.forEach(other => {
        if (other === body || !other.alive) return;
        const dir = other.pos.clone().sub(pos);
        const d = Math.max(4, dir.length());
        const impulse = (isStar ? 220 : 65) / (d * 0.6 + 4);
        other.vel.addScaledVector(dir.normalize(), impulse);
        other.temp = Math.min(4000, other.temp + (isStar ? 2800 : 1200) / (d * 0.08 + 1));
      });
      if (isStar) {
        // 恒星超新星爆发后坍缩为脉冲中子星或黑洞！
        const toBH = body.mass >= 240;
        const oldName = body.name;
        sbRemoveBody(body);
        const rem = sbCreateBody({
          ...(toBH ? SB_TEMPLATES.find(t => t.id === 'blackhole') : SB_TEMPLATES.find(t => t.id === 'neutron')),
          name: oldName + (toBH ? '（坍缩黑洞）' : '（中子星残骸）'),
          pos: pos.toArray(), vel: [0, 0, 0]
        });
        sbSelectBody(rem);
        sbToast(`💥 ${oldName} 发生超新星爆发，坍缩为${toBH ? '黑洞' : '脉冲中子星'}！`);
      } else {
        // 行星爆碎成 8 块飞散熔岩碎片
        const massPiece = Math.max(0.0004, body.mass / 10), radPiece = Math.max(0.45, body.radius * 0.34), vel0 = body.vel.clone();
        const oldName = body.name;
        sbRemoveBody(body);
        if (sb.bodies.length < 130) {
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2;
            const d = new THREE.Vector3(Math.cos(a), (Math.random() - 0.5) * 0.4, Math.sin(a)).normalize();
            sbCreateBody({
              name: `${oldName}残骸`, badge: '熔岩碎片', kind: 'planet',
              mass: massPiece, radius: radPiece,
              pos: pos.clone().addScaledVector(d, radPiece * 3.5).toArray(),
              vel: vel0.clone().addScaledVector(d, 1.6 + Math.random() * 1.4).toArray(),
              temp: 1650, water: 0, atmo: 0, color: [0.42, 0.25, 0.18]
            });
          }
        }
        sbToast(`💥 ${oldName} 已爆碎为 8 块炽热熔岩残骸！`);
      }
    }

    // -------------------------------------------------------------------------
    // N体速度 Verlet 积分 + 碰撞融合/碎片化 + 实时气候温度与宜居率计算
    // -------------------------------------------------------------------------
    function sbLifeLikelihood(body) {
      if (body.kind !== 'planet') return 0;
      const tempScore = Math.max(0, 1 - Math.abs(body.temp - 18) / 55);
      const waterScore = body.water > 5 ? Math.min(1, body.water / 55) * (body.water > 96 ? 0.85 : 1) : 0;
      const atmoScore = body.atmo > 0.15 ? Math.max(0, 1 - Math.abs(body.atmo - 1.1) / 2.6) : 0;
      return Math.round(tempScore * waterScore * atmoScore * 100);
    }

    function sbSurfaceStateText(body) {
      if (body.kind === 'star') return body.mass > 280 ? '蓝超巨星（接近超新星临界）' : body.mass < 60 ? '红矮星对流光球' : '主序星核聚变稳定期';
      if (body.kind === 'bh') return '奇点事件视界 · 吞噬一切物质';
      if (body.kind === 'gas') return body.temp > 700 ? '炽热膨胀热木星大气' : '氢氦巨行星风暴云带';
      if (body.temp > 700) return '🌋 全球熔岩火海（岩浆表面）';
      if (body.temp > 105) return '♨️ 高温沸腾 · 海洋蒸发为蒸汽';
      if (body.temp < -10) return body.water > 10 ? '❄️ 冰封雪球世界（全球冰盖）' : '🧊 极寒冰冻荒漠';
      const life = sbLifeLikelihood(body);
      return life >= 55 ? '🌱 黄金宜居带 · 液态海洋与生命繁荣' : body.water > 10 ? '🌊 存在液态水 · 具备生命潜力' : '🏜️ 温带干燥岩质地表';
    }

    function sbStepPhysics(dt) {
      const n = sb.bodies.length;
      const G = sb.G_CONST * sb.gravity;
      // 计算全部 N 体相互引力加速度
      for (let i = 0; i < n; i++) sb.bodies[i].acc.set(0, 0, 0);
      for (let i = 0; i < n; i++) {
        const a = sb.bodies[i];
        for (let j = i + 1; j < n; j++) {
          const b = sb.bodies[j];
          const dx = b.pos.x - a.pos.x, dy = b.pos.y - a.pos.y, dz = b.pos.z - a.pos.z;
          const distSq = dx * dx + dy * dy + dz * dz + 1.8;
          const invD = 1 / Math.sqrt(distSq);
          const f = G * invD * invD * invD;
          a.acc.x += dx * f * b.mass; a.acc.y += dy * f * b.mass; a.acc.z += dz * f * b.mass;
          b.acc.x -= dx * f * a.mass; b.acc.y -= dy * f * a.mass; b.acc.z -= dz * f * a.mass;
        }
      }
      // 推进位置与速度
      for (let i = 0; i < n; i++) {
        const b = sb.bodies[i];
        b.vel.addScaledVector(b.acc, dt);
        b.pos.addScaledVector(b.vel, dt);
        b.grp.position.copy(b.pos);
        b.mesh.rotation.y += b.spin * dt;
        // 轨迹更新
        const ta = b.trail.geometry.attributes.position, tc = ta.count;
        if (b.trailCount < tc) {
          for (let k = b.trailCount; k < tc; k++) ta.setXYZ(k, b.pos.x, b.pos.y, b.pos.z);
          b.trailCount++;
        } else {
          const arr = ta.array;
          arr.copyWithin(0, 3);
          arr[(tc - 1) * 3] = b.pos.x; arr[(tc - 1) * 3 + 1] = b.pos.y; arr[(tc - 1) * 3 + 2] = b.pos.z;
        }
        ta.needsUpdate = true;
        b.trail.visible = sb.showTrails;
        b.velArrow.visible = sb.showVel;
        if (sb.showVel && b.vel.lengthSq() > 1e-4) {
          b.velArrow.position.copy(b.pos);
          b.velArrow.setDirection(b.vel.clone().normalize());
          b.velArrow.setLength(Math.min(18, b.vel.length() * 3.5 + 2.5));
        }
      }

      // 实时碰撞检测（质量合并 + 温度飙升 + 碎片飞散）
      for (let i = sb.bodies.length - 1; i >= 0; i--) {
        const a = sb.bodies[i]; if (!a || !a.alive) continue;
        for (let j = i - 1; j >= 0; j--) {
          const b = sb.bodies[j]; if (!b || !b.alive) continue;
          const dist = a.pos.distanceTo(b.pos);
          if (dist < (a.radius + b.radius) * 0.88) {
            const big = a.mass >= b.mass ? a : b;
            const small = a.mass >= b.mass ? b : a;
            const relV = a.vel.distanceTo(b.vel);
            const totalM = big.mass + small.mass;
            big.vel.multiplyScalar(big.mass).addScaledVector(small.vel, small.mass).divideScalar(totalM);
            big.mass = totalM;
            const newRad = Math.min(12, Math.cbrt(big.radius ** 3 + small.radius ** 3 * 0.65));
            const ratio = newRad / big.radius;
            big.radius = newRad;
            big.mesh.scale.multiplyScalar(ratio);
            if (big.kind !== 'bh') big.temp = Math.min(4000, big.temp + Math.min(2400, (small.mass / Math.max(0.01, big.mass)) * 1800 + relV * 240));
            const hitPos = small.pos.clone().lerp(big.pos, 0.45);
            sbSpawnExplosion(hitPos, big.kind === 'bh' ? 0xc084fc : 0xff7b29, Math.max(3.5, small.radius * 2.8), false);
            // 高速撞击且两体质量接近时生成 4 块轨道熔岩碎片（不递归分裂碎片，保障 60 FPS）
            if (relV > 1.8 && small.mass > big.mass * 0.08 && small.badge !== '撞击碎片' && big.badge !== '撞击碎片' && sb.bodies.length < 48 && big.kind !== 'bh') {
              const baseName = small.name.replace(/(残骸|碎片)+$/g, '').slice(0, 8) || '天体';
              for (let f = 0; f < 4; f++) {
                const ang = Math.random() * Math.PI * 2;
                const d = new THREE.Vector3(Math.cos(ang), (Math.random() - 0.5) * 0.5, Math.sin(ang)).normalize();
                sbCreateBody({
                  name: `${baseName}碎片`, badge: '撞击碎片', kind: 'planet',
                  mass: Math.max(0.0003, small.mass * 0.06), radius: Math.max(0.45, small.radius * 0.28),
                  pos: hitPos.clone().addScaledVector(d, big.radius * 1.45).toArray(),
                  vel: big.vel.clone().addScaledVector(d, relV * 0.55 + 0.8).toArray(),
                  temp: 1500, water: 0, atmo: 0, color: [0.48, 0.28, 0.20]
                });
              }
            }
            sbToast(`💥 碰撞！${big.name} 吞并了 ${small.name}（温度升至 ${Math.round(big.temp)}°C）`);
            sbRemoveBody(small);
            break;
          }
        }
      }

      // 实时热力学气候平衡（受所有恒星辐射与温室效应影响）
      const stars = sb.bodies.filter(b => b.kind === 'star');
      const keyStar = stars[0];
      for (const b of sb.bodies) {
        if (b.mat?.uniforms?.uTime) b.mat.uniforms.uTime.value += dt;
        if (b.kind === 'planet' || b.kind === 'gas') {
          let flux = 0;
          for (const st of stars) {
            const d = Math.max(st.radius + 2, b.pos.distanceTo(st.pos));
            const lum = Math.pow(Math.max(0.15, st.mass / 120), 1.5);
            flux += lum * (36 * 36) / (d * d);
          }
          const eqK = Math.max(25, 255 * Math.pow(Math.max(0.001, flux), 0.25) * (1 + b.atmo * 0.14));
          const targetC = eqK - 273.15;
          b.temp += (targetC - b.temp) * Math.min(1, dt * 0.18);
          if (b.mat?.uniforms) {
            b.mat.uniforms.uTemp.value = b.temp;
            b.mat.uniforms.uWater.value = b.water / 100;
            b.mat.uniforms.uAtmo.value = b.atmo;
            if (keyStar) b.mat.uniforms.uLightDir.value.copy(keyStar.pos).sub(b.pos).normalize();
          }
        }
      }
      sb.simYears += dt * 0.045;
    }

    // -------------------------------------------------------------------------
    // 交互工具：点击选择、拖拽弹射与预测轨、激光加热/冰冻、强制自旋甩裂、一键脉冲引爆
    // -------------------------------------------------------------------------
    function sbPointerNDC(e) {
      const rect = sb.renderer.domElement.getBoundingClientRect();
      return new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    }

    function sbPickBody(e) {
      sb.raycaster.setFromCamera(sbPointerNDC(e), sb.camera);
      const hits = sb.raycaster.intersectObjects(sb.bodies.map(b => b.mesh), false);
      return hits.length ? hits[0].object.userData.sbBody : null;
    }

    function sbPlanePoint(e) {
      sb.raycaster.setFromCamera(sbPointerNDC(e), sb.camera);
      const out = new THREE.Vector3();
      return sb.raycaster.ray.intersectPlane(sb.plane, out) ? out : null;
    }

    function sbUpdatePreviewOrbit(startPos, startVel) {
      const attr = sb.previewLine.geometry.attributes.position, G = sb.G_CONST * sb.gravity;
      const p = startPos.clone(), v = startVel.clone(), h = 0.28;
      for (let i = 0; i < attr.count; i++) {
        attr.setXYZ(i, p.x, p.y, p.z);
        const acc = new THREE.Vector3();
        for (const b of sb.bodies) {
          const d = b.pos.clone().sub(p);
          const distSq = d.lengthSq() + 1.8;
          acc.addScaledVector(d, (G * b.mass) / (distSq * Math.sqrt(distSq)));
        }
        v.addScaledVector(acc, h); p.addScaledVector(v, h);
      }
      attr.needsUpdate = true;
      sb.previewLine.visible = true;
    }

    function sbActiveSpawnTemplate() {
      if (sb.spawnId === '__custom__' && sb.customTemplate) return sb.customTemplate;
      return SB_TEMPLATES.find(t => t.id === sb.spawnId) || SB_TEMPLATES[3];
    }

    function sbBindCanvasEvents() {
      const dom = sb.renderer.domElement;
      dom.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        const hit = sbPickBody(e);
        if (sb.tool === 'select') {
          if (hit) sbSelectBody(hit);
          return;
        }
        if (sb.tool === 'pulse') {
          if (hit) sbTriggerSupernova(hit);
          return;
        }
        if (['heat', 'freeze', 'spin'].includes(sb.tool)) {
          if (hit) {
            sbSelectBody(hit);
            sb.activeBeamTarget = hit;
            sb.controls.enabled = false;
          }
          return;
        }
        if (sb.tool === 'launch') {
          const pt = sbPlanePoint(e);
          if (!pt) return;
          const tpl = sbActiveSpawnTemplate();
          if (sb.launchMode === 'sling') {
            sb.dragState = { start: pt.clone(), cur: pt.clone(), tpl };
            sb.controls.enabled = false;
            sbUpdatePreviewOrbit(pt, new THREE.Vector3());
          } else {
            let vel = new THREE.Vector3();
            if (sb.launchMode === 'orbit') {
              const domBody = sb.bodies.filter(b => b.alive).sort((a, b) => b.mass - a.mass)[0];
              if (domBody && pt.distanceTo(domBody.pos) > domBody.radius + tpl.radius + 1) vel = sbCircularVel(pt, domBody);
            }
            const created = sbCreateBody({ ...tpl, pos: pt.toArray(), vel: vel.toArray() });
            sbSelectBody(created);
            sbToast(`🚀 已投放 ${created.name}（${sb.launchMode === 'orbit' ? '自动圆轨道' : '静止放置'}）`);
          }
        }
      });

      dom.addEventListener('pointermove', e => {
        if (sb.dragState) {
          const pt = sbPlanePoint(e);
          if (pt) {
            sb.dragState.cur.copy(pt);
            const vel = sb.dragState.start.clone().sub(pt).multiplyScalar(0.14);
            sbUpdatePreviewOrbit(sb.dragState.start, vel);
          }
        }
      });

      window.addEventListener('pointerup', () => {
        if (sb.dragState) {
          const vel = sb.dragState.start.clone().sub(sb.dragState.cur).multiplyScalar(0.14);
          const created = sbCreateBody({ ...sb.dragState.tpl, pos: sb.dragState.start.toArray(), vel: vel.toArray() });
          sbSelectBody(created);
          sb.previewLine.visible = false;
          sb.dragState = null;
          sb.controls.enabled = true;
          sbToast(`🏹 已弹射 ${created.name}（初速 ${(vel.length() * 14).toFixed(1)} km/s）`);
        }
        if (sb.activeBeamTarget) {
          sb.activeBeamTarget = null;
          sb.laserLine.visible = false;
          sb.controls.enabled = true;
        }
      });
    }

    function sbTickActiveTool(dt) {
      const target = sb.activeBeamTarget;
      if (!target || !target.alive) { sb.laserLine.visible = false; return; }
      const la = sb.laserLine.geometry.attributes.position;
      const origin = sb.camera.position.clone().add(new THREE.Vector3(0, -4, 0));
      la.setXYZ(0, origin.x, origin.y, origin.z);
      la.setXYZ(1, target.pos.x, target.pos.y, target.pos.z);
      la.needsUpdate = true;
      sb.laserLine.visible = true;
      if (sb.tool === 'heat') {
        sb.laserLine.material.color.setHex(0xff5a1f);
        target.temp = Math.min(4000, target.temp + dt * 680);
        target.water = Math.max(0, target.water - dt * 16);
      } else if (sb.tool === 'freeze') {
        sb.laserLine.material.color.setHex(0x7dd3fc);
        target.temp = Math.max(-250, target.temp - dt * 420);
      } else if (sb.tool === 'spin') {
        sb.laserLine.material.color.setHex(0xc084fc);
        target.spin += dt * 14;
        if (target.spin > 22) {
          sb.activeBeamTarget = null; sb.laserLine.visible = false; sb.controls.enabled = true;
          sbTriggerSupernova(target);
          sbToast(`🌀 ${target.name} 自转过快，已被离心力撕成碎片环！`);
        }
      }
      sbSyncInspector();
    }

    // -------------------------------------------------------------------------
    // 检视器同步 + 存档系统（SQLite /api/sandbox/saves + localStorage 降级）
    // -------------------------------------------------------------------------
    function sbSelectBody(body) {
      sb.selected = body;
      sbSyncInspector();
    }

    function sbSyncInspector() {
      const b = sb.selected;
      if (!b || !b.alive) {
        sb$('sb-sel-name').textContent = '未选中天体';
        sb$('sb-sel-badge').textContent = '点击画布中任意天体';
        sb$('sb-life-pct').textContent = '0%';
        sb$('sb-life-bar').style.width = '0%';
        return;
      }
      sb$('sb-sel-name').textContent = b.name;
      sb$('sb-sel-badge').textContent = b.badge;
      const life = sbLifeLikelihood(b);
      sb$('sb-life-pct').textContent = life + '%';
      sb$('sb-life-bar').style.width = life + '%';
      sb$('sb-surface-state').textContent = sbSurfaceStateText(b);
      sb$('sb-m-mass').textContent = b.mass >= 20 ? `${(b.mass / 120).toFixed(2)} M☉` : `${(b.mass / 0.045).toFixed(2)} M⊕`;
      sb$('sb-m-temp').textContent = `${Math.round(b.temp)} °C`;
      sb$('sb-m-vel').textContent = `${(b.vel.length() * 14.5).toFixed(1)} km/s`;
      sb$('sb-m-esc').textContent = `${(Math.sqrt(2 * sb.G_CONST * b.mass / Math.max(0.4, b.radius)) * 18).toFixed(1)} km/s`;
      sb$('sb-ed-temp').value = String(Math.round(THREE.MathUtils.clamp(b.temp, -250, 4000)));
      sb$('sb-ed-temp-val').textContent = `${Math.round(b.temp)} °C`;
      sb$('sb-ed-water').value = String(Math.round(b.water));
      sb$('sb-ed-water-val').textContent = `${Math.round(b.water)}%`;
      sb$('sb-ed-atmo').value = String(Number(b.atmo).toFixed(1));
      sb$('sb-ed-atmo-val').textContent = `${Number(b.atmo).toFixed(1)}×`;
      const rScale = THREE.MathUtils.clamp(b.radius / b.baseRadius, 0.4, 3.0);
      sb$('sb-ed-radius').value = rScale.toFixed(2);
      sb$('sb-ed-radius-val').textContent = `${rScale.toFixed(2)}×`;
      sb$('sb-supernova-btn').textContent = b.kind === 'star' ? '💥 引爆超新星' : '💥 粉碎星球';
    }

    function sbSerializeUniverse() {
      return {
        preset: sb.preset, gravity: sb.gravity, speed: sb.speed,
        bodies: sb.bodies.filter(b => b.alive).map(b => ({
          name: b.name, badge: b.badge, kind: b.kind, mass: b.mass, radius: b.radius,
          pos: b.pos.toArray(), vel: b.vel.toArray(), temp: b.temp, water: b.water, atmo: b.atmo,
          color: b.color, ring: b.hasRing, pulsar: b.pulsar
        }))
      };
    }

    async function sbRefreshSaves() {
      const box = sb$('sb-saves-list'); if (!box) return;
      let list = [];
      try {
        const res = await fetch('/api/sandbox/saves');
        if (res.ok) list = (await res.json()).saves || [];
      } catch {
        try { list = JSON.parse(localStorage.getItem('cosmic-sb-saves') || '[]'); } catch { list = []; }
      }
      if (!list.length) { box.innerHTML = '<p class="sb-muted">暂无存档，输入名称点击「保存」即可留存你的自定义宇宙。</p>'; return; }
      box.replaceChildren();
      list.forEach(item => {
        const row = document.createElement('div'); row.className = 'sb-save-row';
        row.innerHTML = `<div><strong>${bookEscape(item.name)}</strong><small>${item.body_count ?? item.data?.bodies?.length ?? 0} 颗天体</small></div><div style="display:flex;gap:4px"><button class="sb-mini-btn" data-load="${item.id}">载入</button><button class="sb-mini-btn sb-danger" data-del="${item.id}">✕</button></div>`;
        row.querySelector('[data-load]').onclick = async () => {
          let payload = item.data;
          if (!payload) {
            try { const r = await fetch('/api/sandbox/saves/' + encodeURIComponent(item.id)); if (r.ok) payload = (await r.json()).data; } catch {}
          }
          if (!payload?.bodies) return;
          sbClearAll();
          sb.gravity = payload.gravity ?? 1; sb$('sb-gravity').value = String(sb.gravity); sb$('sb-gravity-val').textContent = sb.gravity.toFixed(1) + '×';
          payload.bodies.forEach(b => sbCreateBody(b));
          sbSelectBody(sb.bodies[0] || null);
          sbToast(`🌌 已载入存档「${item.name}」（${sb.bodies.length} 颗天体）`);
        };
        row.querySelector('[data-del]').onclick = async () => {
          try { await fetch('/api/sandbox/saves/' + encodeURIComponent(item.id), { method: 'DELETE' }); } catch {
            const loc = JSON.parse(localStorage.getItem('cosmic-sb-saves') || '[]').filter(x => x.id !== item.id);
            localStorage.setItem('cosmic-sb-saves', JSON.stringify(loc));
          }
          sbRefreshSaves();
        };
        box.appendChild(row);
      });
    }

    async function sbSaveUniverse() {
      const name = (sb$('sb-save-name').value || '').trim() || `我的宇宙 #${Math.floor(Math.random() * 90 + 10)}`;
      const data = sbSerializeUniverse();
      try {
        const r = await fetch('/api/sandbox/saves', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, preset: sb.preset, data }) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        sb$('sb-save-name').value = '';
        sbToast(`💾 已保存到数据库：「${name}」`);
      } catch {
        const loc = JSON.parse(localStorage.getItem('cosmic-sb-saves') || '[]');
        loc.unshift({ id: 'loc_' + Date.now(), name, body_count: data.bodies.length, data });
        localStorage.setItem('cosmic-sb-saves', JSON.stringify(loc.slice(0, 20)));
        sbToast(`💾 已离线保存到本机：「${name}」`);
      }
      sbRefreshSaves();
    }

    // -------------------------------------------------------------------------
    // 渲染循环 + 浮动标签 + 初始化绑定
    // -------------------------------------------------------------------------
    let sbPrevTime = 0, sbUiTick = 0;
    function sbLoop(now) {
      if (!sb.open) return;
      sb.rafId = requestAnimationFrame(sbLoop);
      const rawDt = sbPrevTime ? Math.min(0.05, (now - sbPrevTime) / 1000) : 0.016;
      sbPrevTime = now;

      sb.fpsFrames++;
      if (now - sb.fpsLast > 600) {
        sb.fpsVal = Math.round(sb.fpsFrames * 1000 / Math.max(1, now - sb.fpsLast));
        sb.fpsFrames = 0; sb.fpsLast = now;
      }

      if (!sb.paused) {
        const simDt = rawDt * sb.speed * 1.4;
        const sub = Math.max(1, Math.min(8, Math.ceil(simDt / 0.04)));
        for (let k = 0; k < sub; k++) sbStepPhysics(simDt / sub);
      }
      sbTickActiveTool(rawDt);

      // 更新爆炸/超新星特效
      for (let i = sb.effects.length - 1; i >= 0; i--) {
        const e = sb.effects[i]; e.age += rawDt;
        const u = Math.min(1, e.age / e.duration);
        e.ring.scale.setScalar(1 + u * (e.isSupernova ? 11 : 4.5));
        e.ring.material.opacity = 0.9 * (1 - u);
        e.flash.material.opacity = 0.95 * Math.max(0, 1 - u * 1.4);
        const pa = e.pts.geometry.attributes.position, pv = e.pVel;
        for (let k = 0; k < pa.count; k++) pa.setXYZ(k, pa.getX(k) + pv[k * 3] * rawDt, pa.getY(k) + pv[k * 3 + 1] * rawDt, pa.getZ(k) + pv[k * 3 + 2] * rawDt);
        pa.needsUpdate = true; e.pts.material.opacity = 0.95 * (1 - u);
        if (u >= 1) { disposeTree(e.grp); sb.effects.splice(i, 1); }
      }

      sbUpdateGravityGridAndHZ();

      if (sb.followBody && sb.followBody.alive) {
        const d = sb.followBody.pos.clone().sub(sb.controls.target);
        sb.controls.target.add(d); sb.camera.position.add(d);
      }
      sb.controls.update();
      sb.renderer.render(sb.scene, sb.camera);

      // 投影标签
      const wrap = sb$('sb-canvas-wrap'), w = wrap.clientWidth, h = wrap.clientHeight;
      const proj = new THREE.Vector3();
      for (const b of sb.bodies) {
        if (!sb.showLabels || (b.badge === '撞击碎片' && b !== sb.selected)) { b.labelEl.hidden = true; continue; }
        proj.copy(b.pos).project(sb.camera);
        const x = (proj.x * 0.5 + 0.5) * w, y = (-proj.y * 0.5 + 0.5) * h;
        const off = proj.z > 1 || proj.z < -1 || x < 24 || x > w - 24 || y < 24 || y > h - 24;
        b.labelEl.hidden = off;
        if (!off) {
          b.labelEl.style.left = x + 'px'; b.labelEl.style.top = y + 'px';
          b.labelEl.classList.toggle('selected', b === sb.selected);
        }
      }

      sbUiTick += rawDt;
      if (sbUiTick > 0.25) {
        sbUiTick = 0;
        sb$('sb-stats-line').textContent = `天体 ${sb.bodies.length} 颗 · 模拟历元 ${sb.simYears.toFixed(2)} 年 · ${sb.fpsVal} FPS`;
        sbSyncInspector();
      }
    }

    function sbInit() {
      if (sb.inited) return;
      sb.inited = true;
      const wrap = sb$('sb-canvas-wrap');
      sb.scene = new THREE.Scene();
      sb.scene.background = new THREE.Color(0x02050d);
      sb.camera = new THREE.PerspectiveCamera(48, Math.max(1, wrap.clientWidth) / Math.max(1, wrap.clientHeight), 0.2, 3000);
      sb.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      sb.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
      sb.renderer.setSize(wrap.clientWidth, wrap.clientHeight);
      wrap.prepend(sb.renderer.domElement);
      sb.controls = new OrbitControls(sb.camera, sb.renderer.domElement);
      sb.controls.enableDamping = true; sb.controls.dampingFactor = 0.07; sb.controls.maxDistance = 680;
      sbBuildEnvironment();
      sbBindCanvasEvents();

      // 渲染 14 种天体发射库按钮
      const grid = sb$('sb-spawn-grid');
      grid.innerHTML = SB_TEMPLATES.map(t => `<button class="sb-spawn-item" data-sb-spawn="${t.id}" aria-pressed="${t.id === sb.spawnId}"><strong>${t.icon} ${t.name}</strong><small>${t.badge}</small></button>`).join('');
      grid.querySelectorAll('button').forEach(btn => btn.onclick = () => {
        sb.spawnId = btn.dataset.sbSpawn;
        grid.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        sbSetTool('launch');
      });

      // 工具切换
      function sbSetTool(tool) {
        sb.tool = tool;
        document.querySelectorAll('[data-sb-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sbTool === tool)));
        const hints = {
          select: '当前工具：选择 / 观察 · 点击任意天体编辑质量、温度、水覆盖率或进行一键行星改造',
          launch: '当前工具：发射天体 · 在空间任意位置点击（自动圆轨）或按住拖拽弹射（带实时引力轨迹预测！）',
          heat:   '当前工具：加热激光 · 按住左键照射任意行星或恒星，将海洋煮沸、地壳熔融成岩浆火海！',
          freeze: '当前工具：绝对零度冰冻射线 · 按住左键照射行星，瞬间将其冰封为雪球世界！',
          spin:   '当前工具：强制自旋 · 按住左键不断加速行星自转，直至离心力将其彻底甩裂成碎片环！',
          pulse:  '当前工具：脉冲引爆 · 点击恒星引爆超新星并坍缩为中子星/黑洞，点击行星直接炸成熔岩碎片！'
        };
        sb$('sb-hint').textContent = hints[tool] || '';
      }
      window._sbSetTool = sbSetTool;
      document.querySelectorAll('[data-sb-tool]').forEach(b => b.onclick = () => sbSetTool(b.dataset.sbTool));
      document.querySelectorAll('[data-sb-lmode]').forEach(b => b.onclick = () => {
        sb.launchMode = b.dataset.sbLmode;
        document.querySelectorAll('[data-sb-lmode]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        sbSetTool('launch');
      });

      // 预设与顶部开关
      sb$('sb-preset-select').onchange = e => sbLoadPreset(e.target.value);
      sb$('sb-reset-scene').onclick = () => sbLoadPreset(sb.preset);
      const togMap = [['sb-tog-trails', 'showTrails'], ['sb-tog-hz', 'showHZ'], ['sb-tog-grid', 'showGrid'], ['sb-tog-vel', 'showVel'], ['sb-tog-labels', 'showLabels']];
      togMap.forEach(([id, key]) => sb$(id).onclick = () => { sb[key] = !sb[key]; sb$(id).setAttribute('aria-pressed', String(sb[key])); });

      // 左侧标签与存档
      const setLeftTab = tab => {
        document.querySelectorAll('[data-sb-left]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sbLeft === tab)));
        sb$('sb-tab-spawn').hidden = tab !== 'spawn';
        sb$('sb-tab-saves').hidden = tab !== 'saves';
        sb$('sb-save-toggle').setAttribute('aria-pressed', String(tab === 'saves'));
        if (tab === 'saves') sbRefreshSaves();
      };
      document.querySelectorAll('[data-sb-left]').forEach(b => b.onclick = () => setLeftTab(b.dataset.sbLeft));
      sb$('sb-save-toggle').onclick = () => setLeftTab(sb$('sb-tab-saves').hidden ? 'saves' : 'spawn');
      sb$('sb-save-btn').onclick = sbSaveUniverse;

      // 时间与引力控制
      sb$('sb-pause-btn').onclick = () => {
        sb.paused = !sb.paused;
        sb$('sb-pause-btn').setAttribute('aria-pressed', String(sb.paused));
        sb$('sb-pause-btn').textContent = sb.paused ? '▶ 继续' : 'Ⅱ 暂停';
      };
      sb$('sb-speed').oninput = e => { sb.speed = +e.target.value; sb$('sb-speed-val').textContent = sb.speed.toFixed(1) + '×'; };
      sb$('sb-gravity').oninput = e => { sb.gravity = +e.target.value; sb$('sb-gravity-val').textContent = sb.gravity.toFixed(1) + '×'; };

      // 右侧属性实时编辑
      sb$('sb-follow-btn').onclick = () => {
        sb.followBody = sb.followBody === sb.selected ? null : sb.selected;
        sb$('sb-follow-btn').setAttribute('aria-pressed', String(!!sb.followBody));
      };
      sb$('sb-delete-btn').onclick = () => { if (sb.selected) sbRemoveBody(sb.selected); };
      sb$('sb-supernova-btn').onclick = () => { if (sb.selected) sbTriggerSupernova(sb.selected); };
      document.querySelectorAll('[data-sb-mass]').forEach(btn => btn.onclick = () => {
        const b = sb.selected; if (!b) return;
        b.mass = THREE.MathUtils.clamp(b.mass * (+btn.dataset.sbMass), 0.0002, 2000);
        if (b.kind === 'star') {
          const col = b.mass > 260 ? [0.55, 0.84, 1.0] : b.mass < 55 ? [1.0, 0.34, 0.16] : [1.0, 0.82, 0.36];
          b.color = col; b.mat.uniforms.uColor.value.setRGB(...col);
          if (b.mass > 960) sbTriggerSupernova(b);
        }
        sbSyncInspector();
      });
      sb$('sb-ed-temp').oninput = e => { if (!sb.selected) return; sb.selected.temp = +e.target.value; sbSyncInspector(); };
      sb$('sb-ed-water').oninput = e => { if (!sb.selected) return; sb.selected.water = +e.target.value; sbSyncInspector(); };
      sb$('sb-ed-atmo').oninput = e => { if (!sb.selected) return; sb.selected.atmo = +e.target.value; sbSyncInspector(); };
      sb$('sb-ed-radius').oninput = e => {
        if (!sb.selected) return;
        const sc = +e.target.value; sb.selected.radius = sb.selected.baseRadius * sc;
        sb.selected.mesh.scale.setScalar(sc); sbSyncInspector();
      };

      // 一键行星改造 (Terraform)
      document.querySelectorAll('[data-sb-tf]').forEach(btn => btn.onclick = () => {
        const b = sb.selected; if (!b) return;
        const m = btn.dataset.sbTf;
        if (m === 'ring') { sbAttachRing(b.grp, b); sbToast(`🪐 已为 ${b.name} 生成壮丽行星环！`); return; }
        if (b.kind !== 'planet') { sbToast('行星改造仅适用于岩质行星/卫星'); return; }
        if (m === 'earth') { b.temp = 18; b.water = 72; b.atmo = 1.1; b.color = [0.22, 0.54, 0.26]; }
        else if (m === 'snowball') { b.temp = -95; b.water = 92; b.atmo = 0.5; }
        else if (m === 'lava') { b.temp = 1380; b.water = 0; b.atmo = 0.6; }
        else if (m === 'ocean') { b.temp = 24; b.water = 98; b.atmo = 1.3; }
        else if (m === 'venus') { b.temp = 470; b.water = 0; b.atmo = 4.6; b.color = [0.88, 0.72, 0.38]; }
        b.mat.uniforms.uBase.value.setRGB(...b.color);
        sbSyncInspector();
        sbToast(`🧪 已将 ${b.name} 改造为「${btn.textContent}」！`);
      });

      window.addEventListener('resize', () => {
        if (!sb.open || !sb.renderer) return;
        const w = wrap.clientWidth, h = wrap.clientHeight;
        if (w > 10 && h > 10) { sb.camera.aspect = w / h; sb.camera.updateProjectionMatrix(); sb.renderer.setSize(w, h); }
      });

      sbLoadPreset('solar');
    }

    function openSandbox2(importObj = null) {
      const dlg = sb$('sandbox-modal'); if (!dlg) return;
      if (!sb.open) {
        sb.wasMainPaused = state.paused;
        state.paused = true;
        if (typeof syncDynamicsUI === 'function') syncDynamicsUI();
      }
      if (!dlg.open) dlg.showModal();
      sb.open = true;
      sbInit();
      const wrap = sb$('sb-canvas-wrap');
      sb.camera.aspect = Math.max(1, wrap.clientWidth) / Math.max(1, wrap.clientHeight);
      sb.camera.updateProjectionMatrix();
      sb.renderer.setSize(wrap.clientWidth, wrap.clientHeight);

      if (importObj) {
        // 支持从「星海百科」或「首页档案」直接把任意天体传送到宇宙沙盘中发射！
        const isStar = importObj.kind === 'star' || ['star', 'dyson', 'pulsar', 'binary'].includes(importObj.visual?.preset);
        const isBH = importObj.kind === 'blackhole' || importObj.visual?.preset === 'blackhole';
        const isGas = ['gas', 'ring', 'ringworld'].includes(importObj.visual?.preset);
        const tempC = importObj.facts?.tempK ? (Number(importObj.facts.tempK) - 273.15) : (isStar ? 5800 : 18);
        sb.customTemplate = {
          id: '__custom__', icon: isBH ? '🕳️' : isStar ? '⭐' : '🪐',
          name: importObj.name || '百科天体',
          badge: importObj.subtype || (isBH ? '黑洞' : isStar ? '恒星' : '百科行星'),
          kind: isBH ? 'bh' : isStar ? 'star' : isGas ? 'gas' : 'planet',
          mass: isBH ? 520 : isStar ? 160 : isGas ? 0.9 : 0.055,
          radius: isBH ? 3.4 : isStar ? 6.0 : isGas ? 3.2 : 1.85,
          temp: tempC,
          water: (!isStar && !isBH && !isGas && tempC > -50 && tempC < 90) ? 65 : 0,
          atmo: isGas ? 3.2 : 1.0,
          color: isStar ? (tempC > 9000 ? [0.6, 0.85, 1] : tempC < 4000 ? [1, 0.35, 0.18] : [1, 0.82, 0.36]) : [0.32, 0.62, 0.85],
          ring: importObj.visual?.preset === 'ring'
        };
        sb.spawnId = '__custom__';
        sb$('sb-tab-spawn').hidden = false;
        sb$('sb-tab-saves').hidden = true;
        document.querySelectorAll('[data-sb-left-tab]').forEach(t => t.setAttribute('aria-pressed', String(t.dataset.sbLeftTab === 'spawn')));
        sb$('sb-save-toggle')?.setAttribute('aria-pressed', 'false');
        sb$('sb-custom-import').hidden = false;
        sb$('sb-import-name').textContent = `${sb.customTemplate.icon} ${sb.customTemplate.name}`;
        sb$('sb-import-meta').textContent = `${sb.customTemplate.badge} · 已装填至发射器，点击画布即可投放！`;
        window._sbSetTool?.('launch');
        sbToast(`✧ 已将「${sb.customTemplate.name}」从星海百科传送至沙盘发射器！`);
      }

      sbPrevTime = 0;
      cancelAnimationFrame(sb.rafId);
      sb.rafId = requestAnimationFrame(sbLoop);
    }

    function closeSandbox2() {
      const dlg = sb$('sandbox-modal');
      sb.open = false;
      cancelAnimationFrame(sb.rafId);
      if (dlg?.open) dlg.close();
      state.paused = sb.wasMainPaused;
      if (typeof syncDynamicsUI === 'function') syncDynamicsUI();
    }

    window.openSandbox2 = openSandbox2;
    window.closeSandbox2 = closeSandbox2;

    function bindSandbox2Buttons() {
      const launchBtn = sb$('btn-sandbox-game');
      if (launchBtn) launchBtn.onclick = () => openSandbox2();
      const closeBtn = sb$('sb-close');
      if (closeBtn) closeBtn.onclick = closeSandbox2;
      const dlg = sb$('sandbox-modal');
      if (dlg) dlg.addEventListener('cancel', e => { e.preventDefault(); closeSandbox2(); });
      window.addEventListener('keydown', e => {
        if (e.target.matches('input,textarea,select')) return;
        if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey) {
          if (sb.open) closeSandbox2(); else openSandbox2();
        }
      });
    }
