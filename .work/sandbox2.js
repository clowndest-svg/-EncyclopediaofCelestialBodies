    // =========================================================================
    // 宇宙沙盘 2 v2.0 — 科学天体物理引擎（洛希极限/黑洞意大利面化撕裂/引力波/创世造物主）
    // =========================================================================
    const SB_SOLAR_M = 120;
    const SB_EARTH_M = SB_SOLAR_M * SB_EARTH_KG / SB_SUN_KG;

    const SB_TEMPLATES = [
      { id: 'asteroid',  icon: '☄️', name: '小行星',       badge: '岩质小天体', kind: 'planet', mass: 0.0005, radius: 0.58, temp: -40,   water: 0,   atmo: 0,   density: 3.1,  color: [0.55, 0.50, 0.45] },
      { id: 'moon',      icon: '🌙', name: '月球',         badge: '天然卫星',   kind: 'planet', mass: 0.004,  radius: 1.02, temp: -20,   water: 0,   atmo: 0,   density: 3.34, color: [0.72, 0.72, 0.74] },
      { id: 'mars',      icon: '🔴', name: '火星',         badge: '荒漠岩质星', kind: 'planet', mass: 0.015,  radius: 1.32, temp: -55,   water: 12,  atmo: 0.2, density: 3.93, color: [0.78, 0.36, 0.20] },
      { id: 'earth',     icon: '🌍', name: '地球',         badge: '宜居岩质星', kind: 'planet', mass: 0.045,  radius: 1.72, temp: 15,    water: 71,  atmo: 1.0, density: 5.51, color: [0.22, 0.52, 0.26] },
      { id: 'jupiter',   icon: '🟠', name: '木星',         badge: '气态巨行星', kind: 'gas',    mass: 0.95,   radius: 3.35, temp: -110,  water: 0,   atmo: 3.5, density: 1.33, color: [0.85, 0.64, 0.44] },
      { id: 'saturn',    icon: '🪐', name: '土星（带环）', badge: '环状巨行星', kind: 'gas',    mass: 0.62,   radius: 2.95, temp: -140,  water: 0,   atmo: 3.2, density: 0.69, color: [0.88, 0.78, 0.56], ring: true },
      { id: 'hotjup',    icon: '🔥', name: '热木星',       badge: '炽热气态星', kind: 'gas',    mass: 1.25,   radius: 3.20, temp: 1450,  water: 0,   atmo: 4.0, density: 0.95, color: [0.95, 0.38, 0.16] },
      { id: 'comet',     icon: '💫', name: '冰晶彗星',     badge: '冰尘彗星',   kind: 'planet', mass: 0.0004, radius: 0.68, temp: -190,  water: 95,  atmo: 0.3, density: 0.60, color: [0.68, 0.88, 1.0] },
      { id: 'reddwarf',  icon: '🔴', name: '红矮星',       badge: 'M 型红矮星', kind: 'star',   mass: 42,     radius: 4.0,  temp: 3200,  water: 0,   atmo: 0,   density: 4.5,  color: [1.0, 0.34, 0.16] },
      { id: 'sun',       icon: '☀️', name: '类日恒星',     badge: 'G 型主序星', kind: 'star',   mass: 120,    radius: 5.5,  temp: 5505,  water: 0,   atmo: 0,   density: 1.41, color: [1.0, 0.82, 0.36] },
      { id: 'bluegiant', icon: '💠', name: '蓝超巨星',     badge: 'O 型超巨星', kind: 'star',   mass: 480,    radius: 8.0,  temp: 26000, water: 0,   atmo: 0,   density: 0.015,color: [0.55, 0.84, 1.0] },
      { id: 'whitedwarf',icon: '⚪', name: '白矮星',       badge: '简并致密星', kind: 'wd',     mass: 126,    radius: 1.85, temp: 18000, water: 0,   atmo: 0,   density: 1.0e6,color: [0.90, 0.96, 1.0] },
      { id: 'neutron',   icon: '⚡', name: '脉冲中子星',   badge: '中子简并星', kind: 'ns',     mass: 216,    radius: 1.45, temp: 50000, water: 0,   atmo: 0,   density: 4.0e14,color: [0.42, 0.94, 1.0], pulsar: true },
      { id: 'blackhole', icon: '🕳️', name: '恒星级黑洞',   badge: '恒星级黑洞', kind: 'bh',     mass: 720,    radius: 3.1,  temp: 0,     water: 0,   atmo: 0,   density: 1.0e16,color: [0.02, 0.02, 0.04] },
      { id: 'smbh',      icon: '🌀', name: '超大质量黑洞', badge: '星系核黑洞', kind: 'bh',     mass: 2400,   radius: 5.4,  temp: 0,     water: 0,   atmo: 0,   density: 1.0e17,color: [0.01, 0.01, 0.03], smbh: true },
      { id: 'belt',      icon: '🪨', name: '小行星环群',   badge: '12 颗星子',  kind: 'belt',   mass: 0.0004, radius: 0.55, temp: -70,   water: 5,   atmo: 0,   density: 2.8,  color: [0.62, 0.56, 0.50] }
    ];

    const SB_ACHIEVEMENTS = [
      { id: 'cradle',   icon: '🌱', title: '生命摇篮造物主',   desc: '在沙盘中孕育或改造出宜居概率 ≥ 85% 的蓝色星球' },
      { id: 'tde',      icon: '🕳️', title: '潮汐撕裂目击者',   desc: '亲眼目睹黑洞或中子星将恒星/行星意大利面化撕裂吞噬' },
      { id: 'roche',    icon: '🪐', title: '洛希极限造环大师', desc: '让卫星或行星闯入巨行星洛希极限并碎裂成行星环' },
      { id: 'gw',       icon: '〰️', title: '引力波观测者',     desc: '触发双黑洞或双中子星并合，激起时空网格引力波涟漪' },
      { id: 'kilonova', icon: '⚡', title: '千新星炼金术师',   desc: '触发双中子星并合千新星爆发并坍缩诞生新黑洞' },
      { id: 'chandra',  icon: '💥', title: '超新星引爆者',     desc: '触发恒星超新星或白矮星钱德拉塞卡极限 Ia 型爆发' },
      { id: 'genesis',  icon: '✨', title: '创世奇点神明',     desc: '使用「大爆炸创世」或「星系锻造炉」创造全新宇宙' },
      { id: 'grab',     icon: '🧲', title: '执掌星辰之手',     desc: '使用「引力牵引」亲手拖拽并甩动一颗天体改变轨道' },
      { id: 'wormhole', icon: '🌀', title: '爱因斯坦-罗森桥',  desc: '让黑洞与白洞相遇形成虫洞光桥或触发视界湮灭' },
      { id: 'impact',   icon: '☄️', title: '造月大撞击',       desc: '引发两颗行星剧烈碰撞并喷射炽热熔岩碎片羽流' }
    ];

    // 科学致密天体层级：高致密层级永远潮汐撕裂并吸积低致密层级（蓝超巨星绝不可吞噬黑洞或中子星！）
    function sbCompactRank(kind) {
      return ({ bh: 4, whitehole: 4, ns: 3, wd: 2, star: 1, gas: 0.5, planet: 0 })[kind] ?? 0;
    }

    function sbRankLabel(b) {
      if (b.kind === 'bh') return b.mass > 1500 ? 'SMBH 黑洞' : '恒星级黑洞';
      if (b.kind === 'whitehole') return '白洞（科学设想）';
      if (b.kind === 'darkmatter') return '暗物质晕';
      if (b.kind === 'galaxy') return '螺旋星系集合';
      if (b.kind === 'nebula') return '分子星云';
      if (b.kind === 'ns') return '中子星 / 脉冲星';
      if (b.kind === 'wd') return '简并白矮星';
      if (b.kind === 'star') {
        const m = b.mass / SB_SOLAR_M;
        return m >= 3 ? 'O/B 蓝超巨星' : m >= 1.5 ? 'A/F 蓝白星' : m >= 0.7 ? 'G 类日恒星' : 'M 型红矮星';
      }
      return b.kind === 'gas' ? '气态巨行星' : '岩质行星';
    }

    function sbDensityText(b) {
      const d = b.density ?? 5.5;
      if (d >= 1e12) return '10¹⁴+ g/cm³';
      if (d >= 1e5) return '10⁶ g/cm³';
      return d < 0.1 ? `${d.toFixed(3)} g/cm³` : `${d.toFixed(2)} g/cm³`;
    }

    const SB_SYSTEM_MODELS = [
      { id: 'sys_solar',      icon: '☀️', name: '完整太阳系',   badge: '恒星+八大行星' },
      { id: 'sys_earth_moon', icon: '🌍', name: '地月双星系',   badge: '地球+月球轨道' },
      { id: 'sys_saturn',     icon: '🪐', name: '土星卫星环系', badge: '带环土星+3卫星' },
      { id: 'sys_jupiter',    icon: '🟠', name: '木星伽利略系', badge: '木星+4大卫星' },
      { id: 'sys_binary',     icon: '⭐', name: '稳定双星系',   badge: '双恒星+环双星行星' },
      { id: 'sys_trinary',    icon: '✨', name: '三体混沌系',   badge: '3恒星+三体行星' },
      { id: 'sys_bh',         icon: '🕳️', name: '黑洞吸积系',   badge: '黑洞+被撕裂伴星' },
      { id: 'sys_galaxy',     icon: '🌀', name: '迷你螺旋星系', badge: '多旋臂恒星群集合' },
      { id: 'sys_pulsar',     icon: '⚡', name: '双脉冲中子星', badge: '引力波旋进千新星' },
      { id: 'sys_cluster',    icon: '☄️', name: '彗星星云团',   badge: '16颗3D冰晶彗星' }
    ];

    const sb = {
      open: false, inited: false, rafId: 0, wasMainPaused: false,
      scene: null, camera: null, renderer: null, controls: null,
      bodies: [], effects: [], tidalStreams: [], waves: [],
      selected: null, followBody: null,
      preset: 'solar', tool: 'select', launchMode: 'orbit', spawnId: 'earth',
      customTemplate: null,
      paused: false, speed: 1.0, gravity: 1.0, lumMult: 1.0,
      rocheEnabled: true, collideMode: 'scientific',
      simYears: 0,
      showTrails: true, showHZ: true, showGrid: false, showVel: false, showLabels: true,
      gridMesh: null, gridBasePos: null, hzMesh: null,
      dragState: null, grabBody: null, grabPrevPos: new THREE.Vector3(), grabVel: new THREE.Vector3(),
      barrageActive: false, barrageTimer: 0, barragePos: new THREE.Vector3(),
      previewLine: null, laserLine: null, activeBeamTarget: null,
      raycaster: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      G_CONST: 1.25, nextId: 1, fpsFrames: 0, fpsLast: 0, fpsVal: 60,
      keys: new Set(),
      achievements: new Set()
    };

    try {
      const savedAch = JSON.parse(localStorage.getItem('cosmic-sb-ach') || '[]');
      if (Array.isArray(savedAch)) savedAch.forEach(a => sb.achievements.add(a));
    } catch {}

    const sb$ = id => document.getElementById(id);

    function sbToast(msg) {
      const el = sb$('sb-toast'); if (!el) return;
      el.textContent = msg; el.hidden = false;
      clearTimeout(sb._toastTimer);
      sb._toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
    }

    function sbUnlockAch(id) {
      if (sb.achievements.has(id)) return;
      sb.achievements.add(id);
      try { localStorage.setItem('cosmic-sb-ach', JSON.stringify([...sb.achievements])); } catch {}
      const meta = SB_ACHIEVEMENTS.find(a => a.id === id);
      if (meta) sbToast(`🏆 解锁宇宙成就：${meta.icon} ${meta.title}！`);
      sbRenderAchievements();
    }

    function sbRenderAchievements() {
      const cnt = sb$('sb-ach-count');
      if (cnt) cnt.textContent = `${sb.achievements.size}/${SB_ACHIEVEMENTS.length}`;
      const list = sb$('sb-ach-list'); if (!list) return;
      list.innerHTML = SB_ACHIEVEMENTS.map(a => {
        const ok = sb.achievements.has(a.id);
        return `<div class="sb-ach-item ${ok ? 'unlocked' : ''}"><span>${a.icon}</span><div><strong>${a.title} ${ok ? '✓' : ''}</strong><small>${a.desc}</small></div></div>`;
      }).join('');
    }

    function sbMakePlanetMat(body) {
      if (body.kind === 'star' || body.kind === 'wd' || body.kind === 'ns') {
        return new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(...body.color) }, uTemp: { value: body.temp } },
          vertexShader: `varying vec3 vP,vN,vV;void main(){vP=normalize(position);vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
          fragmentShader: `varying vec3 vP,vN,vV;uniform float uTime,uTemp;uniform vec3 uColor;
            float h(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
            float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
            void main(){
              float g=n(vP*7.+vec3(uTime*.6,-uTime*.4,uTime*.3))*.6+n(vP*16.-vec3(uTime*.9))*.4;
              float rim=pow(1.-max(0.,dot(normalize(vN),normalize(vV))),2.2);
              vec3 hot=mix(uColor,vec3(1.,0.98,0.94),smoothstep(0.42,0.88,g));
              gl_FragColor=vec4(hot*(0.94+0.36*g)+uColor*rim*0.72,1.);
            }`
        });
      }
      if (body.kind === 'bh') {
        return new THREE.MeshBasicMaterial({ color: 0x000103 });
      }
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
      if (sb.bodies.length >= SANDBOX_MAX_BODIES) throw new Error('已达到 260 颗天体上限');
      const original = cfg;
      cfg = normalizeSandboxBody(cfg);
      const id = 'b' + (sb.nextId++);
      const kind = cfg.kind || 'planet';
      const defDens = kind === 'bh' ? 1e16 : kind === 'ns' ? 4e14 : kind === 'wd' ? 1e6 : kind === 'star' ? 1.4 : kind === 'gas' ? 1.2 : 5.0;
      const body = {
        id, name: cfg.name || '天体', badge: cfg.badge || '自定义天体',
        kind, initialKind:cfg.initialKind,
        mass: cfg.mass,
        radius: cfg.radius,
        baseRadius: cfg.baseRadius,
        density: original.density ?? defDens,
        physicalRadiusKm: cfg.physicalRadiusKm, realm: cfg.realm, catalogId: cfg.catalogId, sourceNote: cfg.sourceNote,
        pos: new THREE.Vector3(...(cfg.pos || [0, 0, 0])),
        vel: new THREE.Vector3(...(cfg.vel || [0, 0, 0])),
        acc: new THREE.Vector3(),
        temp: cfg.temp ?? 15,
        water: cfg.water ?? 0,
        atmo: cfg.atmo ?? 0,
        spin: cfg.spin ?? (kind === 'ns' ? 6.5 : 0.6),
        color: cfg.color || [0.5, 0.6, 0.7],
        hasRing: !!cfg.ring,
        pulsar: !!cfg.pulsar || kind === 'ns',
        isDebris: !!cfg.isDebris,
        tidalStress: 0,
        tidalTarget: null,
        diskFlare: 0,
        manualTempLock: cfg.manualTempLock,
        alive: true,
        tempHist: [],
        velHist: []
      };
      body.initState = cfg.initState || {
        mass: body.mass, radius: body.baseRadius, physicalRadiusKm: body.physicalRadiusKm, density: body.density, temp: body.temp,
        water: body.water, atmo: body.atmo, spin: body.spin, color: [...body.color], ring: body.hasRing
      };

      const grp = new THREE.Group();
      grp.position.copy(body.pos);
      const mat = sbMakePlanetMat(body);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(body.baseRadius, body.isDebris ? 12 : 28, body.isDebris ? 8 : 20), mat);
      mesh.userData.sbBody = body;
      grp.add(mesh);

      if (kind === 'star' || kind === 'wd' || kind === 'ns') {
        const glow = glowSprite(new THREE.Color(...body.color).getHex(), body.radius * (kind === 'ns' ? 5.2 : 4.2), 0.76);
        grp.add(glow); body.glow = glow;
        if (body.pulsar || kind === 'ns') {
          const jetGeo = new THREE.CylinderGeometry(body.radius * 0.12, body.radius * 0.55, body.radius * 22, 12, 1, true);
          const jet = new THREE.Mesh(jetGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
          jet.rotation.z = 0.32; grp.add(jet); body.jetMesh = jet;
        }
      } else if (kind === 'bh') {
        // 真实多普勒增亮黑洞吸积盘着色器 + 光子环 + 相对论双极喷流
        const diskMat = new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uFlare: { value: 0.0 } },
          vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
          fragmentShader: `varying vec2 vUv;uniform float uTime,uFlare;
            void main(){
              vec2 p=(vUv-0.5)*2.0;float r=length(p);
              if(r<0.32||r>1.0)discard;
              float ang=atan(p.y,p.x);
              float spiral=sin(ang*4.0-r*18.0+uTime*5.5)*0.5+0.5;
              float ring=smoothstep(0.32,0.44,r)*smoothstep(1.0,0.48,r);
              float doppler=0.72+0.42*cos(ang+0.6);
              vec3 cInner=vec3(1.0,0.92,0.72);
              vec3 cMid=vec3(1.0,0.52,0.14);
              vec3 cOuter=vec3(0.65,0.18,0.85);
              vec3 col=mix(cInner,cMid,smoothstep(0.34,0.64,r));
              col=mix(col,cOuter,smoothstep(0.68,0.98,r));
              col*=(0.75+0.55*spiral)*doppler*(1.0+uFlare*1.4);
              gl_FragColor=vec4(col,clamp(ring*(0.85+uFlare*0.15),0.0,1.0));
            }`,
          transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const disk = new THREE.Mesh(new THREE.PlaneGeometry(body.radius * 8.6, body.radius * 8.6), diskMat);
        disk.rotation.x = Math.PI * 0.43; grp.add(disk);
        body.diskMesh = disk; body.diskMat = diskMat;
        // 亮金色光子环
        const photonRing = new THREE.Mesh(
          new THREE.RingGeometry(body.radius * 1.08, body.radius * 1.28, 64),
          new THREE.MeshBasicMaterial({ color: 0xffe4a0, transparent: true, opacity: 0.92, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        grp.add(photonRing); body.photonRing = photonRing;
        // 相对论双极喷流（吸积吞噬时暴涨！）
        const bhJet = new THREE.Mesh(
          new THREE.CylinderGeometry(body.radius * 0.14, body.radius * 0.85, body.radius * 22, 14, 1, true),
          new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.24, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        grp.add(bhJet); body.jetMesh = bhJet;
        const halo = glowSprite(0xff8c24, body.radius * 5.2, 0.52); grp.add(halo);
      }
      if (body.hasRing) sbAttachRing(grp, body);

      // 轨迹线与速度矢量
      const trailMax = body.isDebris ? 40 : 150;
      const trailPos = new Float32Array(trailMax * 3);
      for (let i = 0; i < trailMax; i++) { trailPos[i * 3] = body.pos.x; trailPos[i * 3 + 1] = body.pos.y; trailPos[i * 3 + 2] = body.pos.z; }
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
      const trailCol = kind === 'star' ? 0xfbbf24 : kind === 'bh' ? 0xc084fc : kind === 'ns' ? 0x38bdf8 : new THREE.Color(...body.color).lerp(new THREE.Color(0x7dd3fc), 0.45).getHex();
      const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: trailCol, transparent: true, opacity: body.isDebris ? 0.28 : 0.58, depthWrite: false }));
      trail.frustumCulled = false;
      sb.scene.add(trail);

      const velArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), body.pos, 4, 0x38bdf8, 1.1, 0.55);
      velArrow.visible = sb.showVel && !body.isDebris;
      sb.scene.add(velArrow);

      const labelEl = document.createElement('span');
      labelEl.className = 'sb-label';
      labelEl.textContent = body.name;
      sb$('sb-labels').appendChild(labelEl);

      body.grp = grp; body.mesh = mesh; body.mat = mat; body.trail = trail; body.trailCount = 0; body.velArrow = velArrow; body.labelEl = labelEl;
      sb.scene.add(grp);
      sb.bodies.push(body);
      sbDecorateBody(body);
      return body;
    }

    function sbAttachRing(grp, body, tint = 0xe6d2a2) {
      if (body.ringMesh) {
        body.ringMesh.scale.multiplyScalar(1.08);
        return;
      }
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(body.radius * 1.42, body.radius * 2.65, 72),
        new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.68, side: THREE.DoubleSide, depthWrite: false })
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
      sbDisposeVelocityArrow(body.velArrow);
      if (sb.activeBeamTarget === body || sb.grabBody === body) sbCancelInteraction();
      body.labelEl?.remove();
      const idx = sb.bodies.indexOf(body);
      if (idx >= 0) sb.bodies.splice(idx, 1);
      if (sb.selected === body) {if(sb.barrageActive)sbCancelInteraction();sbSelectBody(sb.bodies.find(x => !x.isDebris) || sb.bodies[0] || null);}
      if (sb.followBody === body) { sb.followBody = null; sb$('sb-follow-btn')?.setAttribute('aria-pressed', 'false'); }
      if (sb.grabBody === body) sb.grabBody = null;
    }

    function sbClearAll() {
      sbCancelInteraction();
      sb.sceneVersion=(sb.sceneVersion||0)+1;
      sbClearCosmos();
      [...sb.bodies].forEach(sbRemoveBody);
      sb.effects.forEach(e => disposeTree(e.grp));
      sb.tidalStreams.forEach(t => disposeTree(t.mesh));
      sb.effects = []; sb.tidalStreams = []; sb.waves = [];
      if (sb.tidalRibbonLine) sb.tidalRibbonLine.visible = false;
      if (sb.wormholeLine) sb.wormholeLine.visible = false;
      if (sb.hoverRing) sb.hoverRing.visible = false;
      sb.simYears = 0;
    }

    // -------------------------------------------------------------------------
    // 3D 广义相对论时空弯曲网格（支持引力波时空震荡！）+ 动态 3 带宜居带
    // -------------------------------------------------------------------------
    function sbBuildEnvironment() {
      // 360° 全景 3D 深空星空（4,600 颗多光谱恒星，上下左右前后全方位沉浸宇宙！）
      const nS = 4600, pos = new Float32Array(nS * 3), col = new Float32Array(nS * 3), rng = deterministicRandom(2027);
      for (let i = 0; i < nS; i++) {
        const r = 380 + rng() * 680, a = rng() * Math.PI * 2, ph = Math.acos(2 * rng() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(a); pos[i * 3 + 1] = r * Math.cos(ph); pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(a);
        const hue = rng() < 0.2 ? 0.08 + rng() * 0.08 : 0.54 + (rng() - 0.5) * 0.22;
        const c = new THREE.Color().setHSL(hue, 0.45 + rng() * 0.3, 0.70 + rng() * 0.28);
        c.toArray(col, i * 3);
      }
      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      sGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      sb.backgroundStars = new THREE.Group();
      sb.backgroundStars.add(glowPoints(sGeo, 2.35, 0.88));
      sb.scene.add(sb.backgroundStars);

      // 360° 立体银河星云尘埃带（环绕整个球形天穹，打破平面感！）
      const nM = 3400, mPos = new Float32Array(nM * 3), mCol = new Float32Array(nM * 3);
      for (let i = 0; i < nM; i++) {
        const ang = rng() * Math.PI * 2, rad = 460 + rng() * 320;
        const bandY = (rng() - 0.5) * 150 * Math.exp(-Math.pow((rng() - 0.5) * 2.2, 2));
        const x0 = Math.cos(ang) * rad, y0 = bandY, z0 = Math.sin(ang) * rad;
        // 倾斜 34° 横贯深空
        const tilt = 0.58;
        mPos[i * 3] = x0;
        mPos[i * 3 + 1] = y0 * Math.cos(tilt) - z0 * Math.sin(tilt);
        mPos[i * 3 + 2] = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);
        const c = new THREE.Color().setHSL(0.60 + (rng() - 0.5) * 0.28, 0.65, 0.42 + rng() * 0.32);
        c.toArray(mCol, i * 3);
      }
      const mGeo = new THREE.BufferGeometry();
      mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
      mGeo.setAttribute('color', new THREE.BufferAttribute(mCol, 3));
      sb.backgroundStars.add(glowPoints(mGeo, 5.2, 0.34));

      // 6 处深空体积星云辉光团（上下左右各方位均有层次感）
      [
        [[320, 140, -280], 0x3b82f6, 260, 0.16],
        [[-340, -120, 260], 0x8b5cf6, 280, 0.16],
        [[260, -190, 310], 0x06b6d4, 240, 0.14],
        [[-280, 210, -260], 0xec4899, 250, 0.13],
        [[0, 360, 120], 0x6366f1, 290, 0.12],
        [[80, -340, -180], 0xf59e0b, 220, 0.11]
      ].forEach(([p, colHex, sz, op]) => {
        const sp = glowSprite(colHex, sz, op); sp.position.set(...p); sb.scene.add(sp);
      });

      const gGeo = new THREE.PlaneGeometry(250, 250, 48, 48);
      gGeo.rotateX(-Math.PI / 2);
      const gCount = gGeo.attributes.position.count;
      gGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(gCount * 3), 3));
      sb.gridBasePos = new Float32Array(gGeo.attributes.position.array);
      sb.gridMesh = new THREE.Mesh(gGeo, new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: true, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending }));
      sb.gridMesh.position.y = -6.5;
      sb.scene.add(sb.gridMesh);

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

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(80 * 3), 3));
      sb.previewLine = new THREE.Line(pGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.92 }));
      sb.previewLine.visible = false; sb.previewLine.frustumCulled = false;
      sb.scene.add(sb.previewLine);

      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      sb.laserLine = new THREE.Line(lGeo, new THREE.LineBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.95 }));
      sb.laserLine.visible = false;
      sb.laserLine.frustumCulled = false;
      sb.scene.add(sb.laserLine);

      // 3D 黑洞潮汐撕裂连续螺旋光带（肉眼可见的恒星拉丝吸积纽带）
      const trGeo = new THREE.BufferGeometry();
      trGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(42 * 3), 3));
      sb.tidalRibbonLine = new THREE.Line(trGeo, new THREE.LineBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending }));
      sb.tidalRibbonLine.visible = false; sb.tidalRibbonLine.frustumCulled = false;
      sb.scene.add(sb.tidalRibbonLine);

      // 爱因斯坦-罗森桥（黑洞 ↔ 白洞时空虫洞光桥）
      const whGeo = new THREE.BufferGeometry();
      whGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(36 * 3), 3));
      sb.wormholeLine = new THREE.Line(whGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending }));
      sb.wormholeLine.visible = false; sb.wormholeLine.frustumCulled = false;
      sb.scene.add(sb.wormholeLine);

      // 3D 悬停瞄准锁定圈（选择右下角工具后滑过任意星球高亮提示，指哪打哪！）
      sb.hoverRing = new THREE.Mesh(
        new THREE.RingGeometry(1.18, 1.38, 48),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.88, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      sb.hoverRing.visible = false;
      sb.scene.add(sb.hoverRing);
    }

    function sbSpawnGravWave(centerPos, amp = 5.5) {
      sb.waves.push({ pos: centerPos.clone(), r: 2, amp, age: 0, maxAge: 4.2 });
      sbSpawnExplosion(centerPos, 0xa855f7, 8.5, true);
      sbUnlockAch('gw');
    }

    function sbUpdateGravityGridAndHZ(dt) {
      for (let i = sb.waves.length - 1; i >= 0; i--) {
        const w = sb.waves[i];
        w.age += dt; w.r += dt * 46;
        if (w.age >= w.maxAge) sb.waves.splice(i, 1);
      }
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
            let ripple = 0;
            for (let w = 0; w < sb.waves.length; w++) {
              const gw = sb.waves[w], d = Math.hypot(bx - gw.pos.x, bz - gw.pos.z);
              const env = Math.exp(-Math.pow((d - gw.r) * 0.14, 2)) * (1 - gw.age / gw.maxAge);
              ripple += Math.sin((d - gw.r) * 0.85) * gw.amp * env;
            }
            const depth = THREE.MathUtils.clamp(well * 0.95, -18, 32);
            pos.setXYZ(i, bx, -depth + ripple, bz);
            const t = Math.min(1, Math.abs(depth) / 18);
            const wt = Math.min(1, Math.abs(ripple) * 0.35);
            col.setXYZ(i, Math.min(1, 0.14 + t * 0.72 + wt * 0.5), Math.min(1, 0.56 - t * 0.22 + wt * 0.35), 0.96);
          }
          pos.needsUpdate = true; col.needsUpdate = true;
        }
      }
      if (sb.hzMesh) {
        const star = sb.bodies.filter(b => b.kind === 'star').sort((a, b) => b.mass - a.mass)[0];
        sb.hzMesh.visible = sb.showHZ && !!star;
        if (star && sb.showHZ) {
          sb.hzMesh.position.set(star.pos.x, star.pos.y - 0.4, star.pos.z);
          const lumScale = Math.pow(Math.max(0.15, (star.mass / SB_SOLAR_M) * sb.lumMult), 0.65);
          const sc = THREE.MathUtils.clamp(lumScale, 0.38, 2.5);
          sb.hzMesh.scale.set(sc, sc, 1);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 电影级黑洞/中子星潮汐撕裂流（长条丝状等离子撕裂带 + 螺旋吸入视界，绝非直接炸碎！）
    // -------------------------------------------------------------------------
    function sbSpawnTidalStream(victim, primary) {
      if (sb.tidalStreams.length >= 160) return;
      const toP = primary.pos.clone().sub(victim.pos).normalize();
      const up = Math.abs(toP.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const side = new THREE.Vector3().crossVectors(toP, up).normalize();
      const side2 = new THREE.Vector3().crossVectors(toP, side).normalize();
      // 从受害天体朝向黑洞的 L1 拉格朗日点剥离细长发光等离子丝！
      const start = victim.pos.clone()
        .addScaledVector(toP, victim.radius * (0.45 + Math.random() * 0.85))
        .addScaledVector(side, (Math.random() - 0.5) * victim.radius * 0.55)
        .addScaledVector(side2, (Math.random() - 0.5) * victim.radius * 0.45);
      const colHex = victim.kind === 'star' ? new THREE.Color(...victim.color).lerp(new THREE.Color(0xffffff), 0.32).getHex()
        : victim.kind === 'gas' ? 0xf59e0b : 0xff7a29;
      const len = Math.max(0.8, Math.min(2.6, victim.radius * 0.55));
      const thickness = Math.max(0.14, Math.min(0.45, victim.radius * 0.11));
      const mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(thickness, len, 4, 6),
        new THREE.MeshBasicMaterial({ color: colHex, transparent: true, opacity: 0.94, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      mesh.position.copy(start);
      sb.scene.add(mesh);
      // 带角动量的切向+向内螺旋流，形成真实潮汐吸积漩涡丝带！
      const vel = victim.vel.clone().multiplyScalar(0.55)
        .addScaledVector(toP, 5.5 + Math.random() * 4.5)
        .addScaledVector(side, 7.2 + Math.random() * 3.8);
      sb.tidalStreams.push({ mesh, pos: start, vel, target: primary, age: 0, maxAge: 3.2 });
    }

    function sbUpdateTidalStreams(dt) {
      const yAxis = new THREE.Vector3(0, 1, 0);
      for (let i = sb.tidalStreams.length - 1; i >= 0; i--) {
        const s = sb.tidalStreams[i];
        s.age += dt;
        if (!s.target || !s.target.alive || s.age >= s.maxAge) {
          disposeTree(s.mesh); sb.tidalStreams.splice(i, 1); continue;
        }
        const toT = s.target.pos.clone().sub(s.pos);
        const d = toT.length();
        // 真正被吸入黑洞事件视界内部！
        if (d < s.target.radius * 1.05) {
          s.target.diskFlare = Math.min(2.6, (s.target.diskFlare || 0) + 0.12);
          disposeTree(s.mesh); sb.tidalStreams.splice(i, 1); continue;
        }
        toT.normalize();
        const up = Math.abs(toT.y) < 0.9 ? yAxis : new THREE.Vector3(1, 0, 0);
        const swirl = new THREE.Vector3().crossVectors(toT, up).normalize();
        s.vel.addScaledVector(toT, dt * (68 + s.target.mass * 0.09) / Math.max(1.2, d * 0.28));
        s.vel.addScaledVector(swirl, dt * 11.0);
        s.vel.multiplyScalar(Math.pow(0.93, dt * 10));
        s.pos.addScaledVector(s.vel, dt);
        s.mesh.position.copy(s.pos);
        // 沿速度方向拉长，呈现极致的丝状撕裂拖尾感！
        if (s.vel.lengthSq() > 0.01) {
          s.mesh.quaternion.setFromUnitVectors(yAxis, s.vel.clone().normalize());
          const stretch = Math.min(3.4, 1.0 + s.vel.length() * 0.12);
          s.mesh.scale.set(0.85, stretch, 0.85);
        }
        s.mesh.material.opacity = Math.max(0, 0.94 * (1 - s.age / s.maxAge));
      }
    }

    // -------------------------------------------------------------------------
    // 科学洛希极限 & 潮汐瓦解半径计算
    // -------------------------------------------------------------------------
    function sbRocheRadius(primary, victim) {
      const pRank = sbCompactRank(primary.kind), vRank = sbCompactRank(victim.kind);
      if (pRank <= vRank && primary.mass < victim.mass * 2.5) return 0;
      if (['bh','ns','wd'].includes(primary.kind)) {
        return sbInteractionRadius(victim)*Math.cbrt(2*primary.mass/Math.max(1e-12,victim.mass));
      }
      if(primary.kind==='gas'&&victim.kind==='planet') {
        const dp=sbPhysicalDensity(primary)??primary.density,dv=sbPhysicalDensity(victim)??victim.density;
        return 2.44*sbInteractionRadius(primary)*Math.cbrt(Math.max(1e-12,dp)/Math.max(1e-12,dv));
      }
      return 0;
    }

    // -------------------------------------------------------------------------
    // 全 3D 精确圆轨速度计算（无论放在上下左右任意立体位置都能完美公转！）
    // -------------------------------------------------------------------------
    function sbCircularVel(pos, star, tiltAxis = null) {
      const rVec = pos.clone().sub(star.pos);
      const r = Math.max(1e-6, rVec.length());
      const soft=star.kind==='darkmatter'?Math.max(.0001,star.radius*star.radius):['planet','gas'].includes(star.kind)?.0001:1.4;
      const vMag=sb.gravity>0?Math.sqrt(sb.G_CONST*sb.gravity*star.mass*r*r/Math.pow(r*r+soft,1.5)):0;
      const axis = tiltAxis ? tiltAxis.clone().normalize() : (Math.abs(rVec.y / r) > 0.88 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0));
      const tang = new THREE.Vector3().crossVectors(axis, rVec);
      if (tang.lengthSq() < 1e-4) tang.set(-rVec.z, 0, rVec.x);
      return tang.normalize().multiplyScalar(vMag).add(star.vel);
    }

    function sbLoadPreset(name) {
      sbClearAll();
      sb.preset = name;
      sb.followBody = null;
      sb$('sb-preset-select').value = name;
      sb$('sb-follow-btn')?.setAttribute('aria-pressed', 'false');

      if (['galaxy_cluster','cosmic_web','whitehole','big_bang','big_crunch','big_rip','heat_death'].includes(name)) { sbStartCosmos(name); return; }
      if (name === 'three_body') { sbCreateHierarchical(); sbSelectBody(sb.bodies[3]); sbOverview(); sbToast('层级三恒星采用近双星与远伴星的初始轨道；改变引力或投放新天体仍可能破坏稳定性。'); return; }
      if (name === 'solar') {
        sbCreateSolar();
        sbSelectBody(sb.bodies[3]);
      } else if (name === 'bh_tde') {
        // 专属展示：黑洞潮汐撕裂蓝超巨星（TDE 意大利面化 + 螺旋吸积！）
        const bh = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'smbh'), name: '潮汐实验黑洞（15 M☉）', mass: 1800, radius: 4.4, pos: [0, 0, 0], vel: [0, 0, 0] });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'bluegiant'), name: '蓝超巨星', mass: 360, radius: 6.4, pos: [34, 0, 8], vel: [-1.4, 0, -4.6] });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'earth'), name: '伴随行星', pos: [46, 0, 14], vel: [-1.2, 0, -4.4] });
        sbSelectBody(sb.bodies[1]);
        sbToast('🕳️ 观察蓝超巨星进入黑洞潮汐半径后被实时拉长撕裂并螺旋吸入吸积盘！');
      } else if (name === 'roche_ring') {
        // 专属展示：卫星闯入巨行星洛希极限被潮汐撕碎成光环！
        const jup = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'jupiter'), name: '巨行星', radius: .55, pos: [0, 0, 0], vel: [0, 0, 0] });
        const m1 = new THREE.Vector3(1.1, 0, 0);
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'moon'), name: '洛希厄运卫星', radius: .027, pos: m1.toArray(), vel: sbCircularVel(m1, jup).multiplyScalar(0.86).toArray() });
        const m2 = new THREE.Vector3(-2.5, 0, .4);
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'earth'), name: '外围安全卫星', radius:.10, pos: m2.toArray(), vel: sbCircularVel(m2, jup).toArray() });
        sbSelectBody(sb.bodies[1]);
        sbToast('🪐 洛希厄运卫星正螺旋逼近巨行星洛希极限，即将被潮汐撕碎化作壮丽行星环！');
      } else if (name === 'kilonova') {
        // 专属展示：双中子星旋进并合 -> 千新星爆发 + 引力波涟漪 + 坍缩为黑洞！
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'neutron'), name: '中子星 PSR-A', mass: 220, radius: 1.55, pos: [-11, 0, 0], vel: [0.35, 0, 2.7] });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'neutron'), name: '中子星 PSR-B', mass: 215, radius: 1.55, pos: [11, 0, 0], vel: [-0.35, 0, -2.7] });
        sbSelectBody(sb.bodies[0]);
        sbToast('⚡ 双脉冲中子星正在相互旋进，碰撞瞬间将触发千新星爆发、时空引力波并坍缩成黑洞！');
      } else if (name === 'earth_moon') {
        const earth = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'earth'), name: '原始地球', mass: SB_EARTH_M, radius: .1, pos: [0, 0, 0], vel: [0, 0, 0] });
        const mPos = new THREE.Vector3(.15, 0, 0);
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'moon'), name: '月球', radius: .027, pos: mPos.toArray(), vel: sbCircularVel(mPos, earth).toArray() });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'mars'), name: '忒伊亚原行星', mass: SB_EARTH_M*.1, radius: .046, physicalRadiusKm:2950, pos: [-.45, 0, .04], vel: [.10, 0, -.008] });
        sbSelectBody(earth);
      } else if (name === 'three_chaos') {
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'sun'), name: '恒星 α', mass: 135, radius: 5.0, pos: [-26, 0, -14], vel: [0.65, 0, 1.55], color: [1.0, 0.84, 0.35] });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'reddwarf'), name: '恒星 β', mass: 115, radius: 4.4, pos: [26, 0, -10], vel: [-0.85, 0, -1.25], color: [1.0, 0.36, 0.18] });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'bluegiant'), name: '恒星 γ', mass: 165, radius: 5.2, pos: [0, 0, 26], vel: [0.25, 0, -0.35], color: [0.55, 0.86, 1.0] });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'earth'), name: '三体行星', mass: 0.05, radius: 1.65, pos: [-26, 0, 5], vel: [3.1, 0, 1.6] });
        sbSelectBody(sb.bodies[3]);
      } else if (name === 'bh_eat') {
        const sun = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'sun'), name: '太阳', pos: [0, 0, 0], vel: [0, 0, 0] });
        [20, 32, 46, 62].forEach((d, i) => {
          const p = new THREE.Vector3(Math.cos(i * 1.5) * d, 0, Math.sin(i * 1.5) * d);
          const tpl = SB_TEMPLATES[i === 1 ? 3 : i === 2 ? 4 : i === 3 ? 5 : 2];
          sbCreateBody({ ...tpl, name: ['金星', '地球', '木星', '土星'][i], pos: p.toArray(), vel: sbCircularVel(p, sun).toArray() });
        });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'blackhole'), name: '流浪黑洞', mass: 780, radius: 3.6, pos: [-82, 0, 22], vel: [2.7, 0, -0.55] });
        sbSelectBody(sb.bodies[sb.bodies.length - 1]);
      } else if (name === 'galaxy_merge') {
        sbLoadGalaxyCollision();
        return;
      } else {
        sbSelectBody(null);
      }
      sb.camera.position.set(0, 72, 108);
      sb.controls.target.set(0, 0, 0);
      sb.controls.update();
      if(name==='earth_moon'||name==='roche_ring')sbOverview();
      sbSyncInspector();
    }

    // -------------------------------------------------------------------------
    // ✨ 创世造物主：大爆炸奇点创世 & 自定义星系锻造炉
    // -------------------------------------------------------------------------
    function sbRunBigBang() { sbStartCosmos('big_bang'); }

    function sbForgeUniverse(guaranteeCradle = false, fromBigBang = false) {
      if (!fromBigBang) sbClearAll();
      const centerType = sb$('sb-gen-center')?.value || 'sun';
      const numPlanets = Number(sb$('sb-gen-planets')?.value || 7);
      const beltCount = Number(sb$('sb-gen-belt')?.value || 24);
      const chaos = Number(sb$('sb-gen-chaos')?.value || 0.15);

      let primary = null;
      if (centerType === 'binary') {
        const states=sbBinaryStates(120,95,26,sb.G_CONST*sb.gravity,new THREE.Vector3(),new THREE.Vector3());
        primary=sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='sun'),name:'双星主星 A',mass:120,radius:4.8,pos:states[0].pos.toArray(),vel:states[0].vel.toArray()});
        sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='reddwarf'),name:'双星伴星 B',mass:95,radius:4,pos:states[1].pos.toArray(),vel:states[1].vel.toArray()});
      } else if (centerType === 'trinary') {
        primary=sbCreateHierarchical(new THREE.Vector3(),new THREE.Vector3(),false);
      } else if (centerType === 'smbh') {
        primary = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'smbh'), name: '创世超大质量黑洞', mass: 1400, radius: 4.8, pos: [0, 0, 0], vel: [0, 0, 0] });
      } else if (centerType === 'bluegiant') {
        primary = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'bluegiant'), name: '创世蓝超巨星', mass: 320, radius: 7.2, pos: [0, 0, 0], vel: [0, 0, 0] });
      } else {
        primary = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'sun'), name: '创世主序星', mass: 125, radius: 5.5, pos: [0, 0, 0], vel: [0, 0, 0] });
      }

      const centerProxy = { pos: new THREE.Vector3(0, 0, 0), vel: new THREE.Vector3(0, 0, 0), mass: centerType === 'binary' ? 215 : centerType === 'trinary' ? 275 : primary.mass };
      const names = ['曦光', '赤岩', '蔚蓝', '翠微', '琉璃', '苍岚', '玄冰', '星环', '霜降', '紫微', '天枢', '玉衡'];
      let cradleBody = null;

      for (let i = 0; i < numPlanets; i++) {
        const dist = (centerType === 'trinary' ? 440 : centerType === 'binary' ? 80 : centerType === 'smbh' ? 24 : 18) + i * (76 / Math.max(1, numPlanets));
        const ang = Math.random() * Math.PI * 2;
        const p = new THREE.Vector3(Math.cos(ang) * dist, (Math.random() - 0.5) * chaos * 8, Math.sin(ang) * dist);
        const v = sbCircularVel(p, centerProxy).multiplyScalar(1 + (Math.random() - 0.5) * chaos * 0.55);
        const isHabSlot = guaranteeCradle && i === Math.min(2, numPlanets - 1);
        const isGas = !isHabSlot && i >= Math.floor(numPlanets * 0.55);
        const body = sbCreateBody({
          name: isHabSlot ? '生命摇篮·新地球' : `${names[i % names.length]}-${i + 1}`,
          manualTempLock: isHabSlot ? 60 : 0,
          sourceNote: isHabSlot ? '造物主设定的宜居气候，暂时维持温度；并非自然生命概率或永久稳定保证。' : '原创参数系统，质量遵循统一单位，轨道距离与时间压缩。',
          badge: isHabSlot ? '生命摇篮' : isGas ? '气态巨行星' : '创世岩质星',
          kind: isGas ? 'gas' : 'planet',
          mass: isHabSlot ? SB_EARTH_M : isGas ? SB_EARTH_M * (50 + Math.random() * 300) : SB_EARTH_M * (0.3 + Math.random() * 3),
          physicalRadiusKm: isGas ? 60000 : isHabSlot ? 6371 : 8000, realm:'fiction',
          radius: isHabSlot ? 1.85 : isGas ? (2.6 + Math.random() * 1.1) : (1.0 + Math.random() * 0.9),
          density: isGas ? 1.1 : 5.2,
          pos: p.toArray(), vel: v.toArray(),
          temp: isHabSlot ? 18 : Math.max(-180, 320 - dist * 4.5),
          water: isHabSlot ? 74 : (dist > 28 && dist < 52 ? 55 : 5),
          atmo: isHabSlot ? 1.1 : isGas ? 3.4 : (0.3 + Math.random() * 1.2),
          color: isHabSlot ? [0.20, 0.54, 0.28] : isGas ? [0.75 + Math.random() * 0.2, 0.55 + Math.random() * 0.3, 0.35 + Math.random() * 0.3] : [0.45 + Math.random() * 0.4, 0.35 + Math.random() * 0.35, 0.30 + Math.random() * 0.35],
          ring: isGas && Math.random() < 0.45
        });
        if (isHabSlot) {
          cradleBody = body;
          const mP = p.clone().add(new THREE.Vector3(0.18, 0, 0));
          sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'moon'), name: '摇篮伴月', radius:0.2, pos: mP.toArray(), vel: sbCircularVel(mP, body).toArray() });
        }
      }

      // 真实受引力扰动的星子/小行星带
      const beltR = centerType === 'trinary' ? 540 : centerType === 'binary' ? 160 : 54;
      for (let k = 0; k < Math.min(60, beltCount); k++) {
        const r = beltR + (Math.random() - 0.5) * 14, ang = (k / Math.max(1, beltCount)) * Math.PI * 2 + Math.random() * 0.2;
        const p = new THREE.Vector3(Math.cos(ang) * r, (Math.random() - 0.5) * 2.4, Math.sin(ang) * r);
        const v = sbCircularVel(p, centerProxy);
        sbCreateBody({ name: `星子-${k + 1}`, badge: '小行星带', kind: 'planet', mass: SB_EARTH_M*1e-6, physicalRadiusKm:100, radius: 0.42, pos: p.toArray(), vel: v.toArray(), temp: -90, color: [0.58, 0.54, 0.48], isDebris: true });
      }

      sbSelectBody(cradleBody || sb.bodies[1] || sb.bodies[0]);
      sbUnlockAch('genesis');
      if (cradleBody) sbUnlockAch('cradle');
      sb.camera.position.set(0, 78, 114);
      sb.controls.target.set(0, 0, 0);
      sb.controls.update();
      sbOverview();
      sbToast(`✨ 已创世生成 ${sb.bodies.length} 颗天体的全新星系！`);
    }

    // -------------------------------------------------------------------------
    // 爆炸 / 超新星 / 千新星 / 霍金喷流过载特效
    // -------------------------------------------------------------------------
    function sbSpawnExplosion(pos, colorHex, scale = 5, isSupernova = false) {
      const budget=innerWidth<760?12:24;
      if(sb.effects.length>=budget) {disposeTree(sb.effects.shift().grp);}
      const grp = new THREE.Group(); grp.position.copy(pos);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(scale * 0.2, scale * 1.15, 56),
        new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.92, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      ring.rotation.x = Math.PI * 0.48; grp.add(ring);
      const flash = glowSprite(colorHex, scale * (isSupernova ? 13 : 6), 0.96); grp.add(flash);
      const cnt = isSupernova ? 280 : 95;
      const pPos = new Float32Array(cnt * 3), pVel = new Float32Array(cnt * 3);
      for (let i = 0; i < cnt; i++) {
        const a = Math.random() * Math.PI * 2, el = (Math.random() - 0.5) * Math.PI;
        const sp = (isSupernova ? 26 : 12) * (0.3 + Math.random());
        pVel[i * 3] = Math.cos(a) * Math.cos(el) * sp; pVel[i * 3 + 1] = Math.sin(el) * sp; pVel[i * 3 + 2] = Math.sin(a) * Math.cos(el) * sp;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: colorHex, size: isSupernova ? 2.6 : 1.5, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
      grp.add(pts);
      sb.scene.add(grp);
      sb.effects.push({ grp, ring, flash, pts, pVel, age: 0, duration: isSupernova ? 2.8 : 1.35, isSupernova });
    }

    function sbTriggerSupernova(body) {
      if (!body || !body.alive) return;
      const p = body.pos.clone(), v = body.vel.clone();
      // 黑洞绝不会被炸成石头！而是激发相对论喷流过载脉冲！
      if (['whitehole','darkmatter','galaxy','nebula'].includes(body.kind)) {sbToast('集合天体/设想对象不按岩质星球爆破。');return;}
      if (body.kind === 'bh') {
        body.diskFlare = 2.6;
        sbSpawnExplosion(p, 0x93c5fd, body.radius * 3.5, true);
        sbToast(`🌀 ${body.name} 爆发相对论喷流过载脉冲！（黑洞受事件视界保护，不会被常规爆破粉碎）`);
        return;
      }
      if (body.kind === 'star' || body.kind === 'wd' || body.kind === 'ns') {
        const isIa = body.kind === 'wd';
        sbSpawnExplosion(p, isIa ? 0xe0f2fe : 0x7dd3fc, body.radius * 2.8, true);
        sbSpawnExplosion(p, 0xff9a2e, body.radius * 1.9, true);
        sb.bodies.forEach(o => {
          if (o === body || !o.alive) return;
          const d = Math.max(4, o.pos.distanceTo(p));
          const push = o.pos.clone().sub(p).normalize().multiplyScalar(220 / (d + 8));
          o.vel.add(push);
          if (o.kind !== 'bh') o.temp = Math.min(1e9, o.temp + 14000 / d);
        });
        sbUnlockAch('chandra');
        if (isIa) {
          sbRemoveBody(body);
          sbToast(`💥 Ia 型超新星爆发！${body.name} 突破 1.44 M☉ 钱德拉塞卡极限彻底热核瓦解！`);
          return;
        }
        const becomeBH = body.mass >= SB_SOLAR_M * 20 || body.kind === 'ns';
        sbRemoveBody(body);
        const rem=sbCreateBody(becomeBH
          ? {...SB_TEMPLATES.find(t=>t.id==='blackhole'),name:`${body.name}·坍缩黑洞`,mass:body.mass*.72,radius:3.1,pos:p.toArray(),vel:v.toArray()}
          : body.mass>=SB_SOLAR_M*8
            ? {...SB_TEMPLATES.find(t=>t.id==='neutron'),name:`${body.name}·中子星残骸`,mass:Math.min(body.mass*.2,SB_SOLAR_M*2.2),radius:1.5,pos:p.toArray(),vel:v.toArray()}
            : {...SB_TEMPLATES.find(t=>t.id==='whitedwarf'),name:`${body.name}·白矮星残骸`,mass:body.mass*.54,radius:1.2,pos:p.toArray(),vel:v.toArray()}
        );
        sbSelectBody(rem);
        sbToast(body.kind==='star'&&body.mass<SB_SOLAR_M*8?`⭐ 晚期恒星演化演示，外层脱离后留下「${rem.name}」。`:`💥 强制演化演示，核心残骸变为「${rem.name}」。`);
      } else {
        sbSpawnExplosion(p, 0xff6b2b, body.radius * 3.2, false);
        const fragments=Math.min(6,SANDBOX_MAX_BODIES-sb.bodies.length+1);
        sbRemoveBody(body);
        for (let i = 0; i < fragments; i++) {
          const ang = (i / fragments) * Math.PI * 2;
          const dir = new THREE.Vector3(Math.cos(ang), (Math.random() - 0.5) * 0.45, Math.sin(ang)).normalize();
          sbCreateBody({
            name: `${body.name.replace(/碎片+$/g, '').slice(0, 6)}碎片`, badge: '撞击碎片', kind: 'planet',
            mass: body.mass / fragments, radius: Math.max(0.42, body.radius * 0.34),
            pos: p.clone().addScaledVector(dir, body.radius * 1.4).toArray(),
            vel: v.clone().addScaledVector(dir, 3.6 + Math.random() * 2.2).toArray(),
            temp: 1600, water: 0, atmo: 0, color: [0.52, 0.28, 0.18], isDebris: true
          });
        }
        sbToast(`💥 ${body.name} 核心爆破粉碎成炽热熔岩碎片！`);
      }
      if (typeof audioEngine !== 'undefined' && audioEngine.enabled) audioEngine.playExplosion(true);
    }

    // -------------------------------------------------------------------------
    // 生命宜居度 & 表面生态状态
    // -------------------------------------------------------------------------
    function sbLifeLikelihood(b) {
      if (!b || b.kind !== 'planet') return 0;
      const tScore = Math.max(0, 1 - Math.abs(b.temp - 18) / 62);
      const wScore = b.water <= 0 ? 0 : b.water > 96 ? 0.72 : Math.min(1, b.water / 45);
      const aScore = b.atmo < 0.15 ? 0.1 : b.atmo > 3.5 ? 0.25 : 1 - Math.abs(b.atmo - 1.0) / 3.0;
      const mScore = b.mass >= 0.008 && b.mass <= 0.25 ? 1 : 0.45;
      return Math.round(THREE.MathUtils.clamp(tScore * 0.45 + wScore * 0.30 + aScore * 0.15 + mScore * 0.10, 0, 1) * 100);
    }

    function sbSurfaceStateText(b) {
      if (!b) return '—';
      if (b.tidalStress > 0.15) return '⚠️ 洛希极限内：剧烈潮汐撕裂（意大利面化）';
      if (b.kind === 'bh') return '奇点视界 · 光子环与多普勒吸积盘';
      if (b.kind === 'whitehole') return '时间反演喷流奇点 · 物质单向外流概念示意';
      if (b.kind === 'darkmatter') return '不可见引力势阱 · 维系星系与星系群旋转结构';
      if (b.kind === 'galaxy') return '多旋臂恒星群引力节点 · 集合尺度模拟';
      if (b.kind === 'nebula') return '低温分子气体与尘埃云 · 恒星诞生地';
      if (b.kind === 'ns') return '中子简并超流体 · 强磁场相对论喷流';
      if (b.kind === 'wd') return '电子简并碳氧核（>1.44 M☉ 将引发 Ia 超新星）';
      if (b.kind === 'star') return b.mass > SB_SOLAR_M * 3 ? 'O 型大质量聚变（寿命极短，易超新星爆发）' : '主序星核聚变稳定期';
      if (b.kind === 'gas') return b.temp > 600 ? '炽热膨胀气态包层（热木星）' : '厚重氢氦大气与高速风暴带';
      if (b.temp > 650) return '全球熔岩海与炽热岩浆裂谷';
      if (b.temp > 110) return '海洋完全沸腾汽化 · 失控温室炼狱';
      if (b.temp < -18) return b.water > 15 ? '全球冰封雪球世界（冰川覆盖）' : '极寒荒漠岩质表面';
      if (b.water >= 20 && b.atmo >= 0.3) return '黄金宜居带 · 液态海洋与生命繁荣';
      return '温和干燥岩质荒漠（补充液态水可孕育生命）';
    }

    // -------------------------------------------------------------------------
    // Velocity-Verlet N体引力积分 + 洛希极限意大利面化撕裂 + 致密天体科学碰撞
    // -------------------------------------------------------------------------
    function sbUpdateTrails() {
      for(const b of sb.bodies) {
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
        b.velArrow.visible = sb.showVel && !b.isDebris;
        if (b.velArrow.visible && b.vel.lengthSq() > 1e-4) {
          b.velArrow.position.copy(b.pos);
          b.velArrow.setDirection(b.vel.clone().normalize());
          b.velArrow.setLength(Math.min(18, b.vel.length() * 3.2 + 2.4));
        }
      }
    }

    function sbComputeAcc(G) {
      const n = sb.bodies.length;
      for (let i = 0; i < n; i++) sb.bodies[i].acc.set(0, 0, 0);
      for (let i = 0; i < n; i++) {
        const a = sb.bodies[i];
        for (let j = i + 1; j < n; j++) {
          const b = sb.bodies[j];
          const dx = b.pos.x - a.pos.x, dy = b.pos.y - a.pos.y, dz = b.pos.z - a.pos.z;
          const compact=['star','bh','ns','wd'].includes(a.kind)||['star','bh','ns','wd'].includes(b.kind);
          const soft = Math.max(compact?1.4:0.0001,a.kind==='darkmatter'?a.radius*a.radius:0,b.kind==='darkmatter'?b.radius*b.radius:0);
          const distSq = dx * dx + dy * dy + dz * dz + soft;
          const invD = 1 / Math.sqrt(distSq);
          const f = G * invD * invD * invD;
          a.acc.x += dx * f * b.mass; a.acc.y += dy * f * b.mass; a.acc.z += dz * f * b.mass;
          b.acc.x -= dx * f * a.mass; b.acc.y -= dy * f * a.mass; b.acc.z -= dz * f * a.mass;
        }
      }
    }

    function sbStepPhysics(dt) {
      const n = sb.bodies.length;
      if (!n) return;
      const G = sb.G_CONST * sb.gravity;

      // Velocity-Verlet 辛积分（比普通欧拉法更精确守恒椭圆轨道能量！）
      sbComputeAcc(G);
      for (let i = 0; i < n; i++) {
        const b = sb.bodies[i];
        if (b === sb.grabBody) continue;
        b.previousPos ||= new THREE.Vector3();b.previousPos.copy(b.pos);
        b.vel.addScaledVector(b.acc, dt * 0.5);
        b.pos.addScaledVector(b.vel, dt);
      }
      sbComputeAcc(G);
      for (let i = 0; i < n; i++) {
        const b = sb.bodies[i];
        if (b === sb.grabBody) continue;
        b.vel.addScaledVector(b.acc, dt * 0.5);
        b.grp.position.copy(b.pos);
        b.mesh.rotation.y += b.spin * dt;
        // 渐进重置潮汐拉伸状态
        b.tidalStress = Math.max(0, b.tidalStress - dt * 1.6);
        b.tidalTarget = null;
        if (b.diskFlare > 0) b.diskFlare = Math.max(0, b.diskFlare - dt * 0.55);


      }

      // 1. 广义相对论致密双星引力波旋进阻尼（双中子星/双黑洞近距离辐射引力波导致轨道收缩旋进！）
      for (let i = 0; i < sb.bodies.length; i++) {
        const a = sb.bodies[i];
        if (a.kind !== 'ns' && a.kind !== 'bh') continue;
        for (let j = i + 1; j < sb.bodies.length; j++) {
          const b = sb.bodies[j];
          if (b.kind !== 'ns' && b.kind !== 'bh') continue;
          const d = a.pos.distanceTo(b.pos);
          if (d < 34 && d > 1) {
            const damp = Math.max(0.92, 1 - dt * (1.8 / Math.max(2, d * 0.25)));
            const vcm = a.vel.clone().multiplyScalar(a.mass).addScaledVector(b.vel, b.mass).divideScalar(a.mass + b.mass);
            a.vel.sub(vcm).multiplyScalar(damp).add(vcm);
            b.vel.sub(vcm).multiplyScalar(damp).add(vcm);
          }
        }
      }

      // 2. 真实洛希极限 & 黑洞/中子星意大利面化潮汐撕裂 (TDE Spaghettification)
      if (sb.rocheEnabled) {
        const tidalBodies=[...sb.bodies];
        for (let i = tidalBodies.length - 1; i >= 0; i--) {
          const a = tidalBodies[i]; if (!a || !a.alive) continue;
          for (let j = i - 1; j >= 0; j--) {
            const b = tidalBodies[j]; if (!b || !b.alive) continue;
            if(['galaxy','nebula','darkmatter','whitehole'].includes(a.kind)||['galaxy','nebula','darkmatter','whitehole'].includes(b.kind))continue;
            const rA = sbCompactRank(a.kind), rB = sbCompactRank(b.kind);
            if (rA === rB && (a.kind === 'bh' || a.kind === 'ns')) continue;
            const primary = rA > rB ? a : rB > rA ? b : (a.mass >= b.mass ? a : b);
            const victim = primary === a ? b : a;
            if (victim.kind === 'bh') continue;
            const rRoche = sbRocheRadius(primary, victim);
            if (rRoche <= 0) continue;
            const dist = primary.pos.distanceTo(victim.pos);
            if (dist < rRoche) {
              const stress = THREE.MathUtils.clamp((rRoche - dist) / Math.max(1.5, rRoche - primary.radius), 0.08, 1.0);
              victim.tidalStress = Math.max(victim.tidalStress, stress);
              victim.tidalTarget = primary;
              // 潮汐摩擦剧烈升温 + 每帧连续撕裂剥离多股炽热螺旋丝带（而非炸碎！）
              victim.temp = Math.min(1e9, victim.temp + dt * stress * 1650);
              victim.tidalEmission=(victim.tidalEmission||0)+dt*(20+stress*35);
              const streamCount=Math.min(4,Math.floor(victim.tidalEmission));
              victim.tidalEmission-=streamCount;
              for(let sc=0;sc<streamCount;sc++)sbSpawnTidalStream(victim,primary);
              const drainRate = primary.kind === 'gas' ? (0.28 + stress * 0.72) : (0.16 + stress * 0.42);
              const dm = victim.mass * dt * drainRate;
              victim.mass -= dm;
              primary.vel.multiplyScalar(primary.mass).addScaledVector(victim.vel,dm).divideScalar(primary.mass+dm);
              primary.mass += dm;
              sbCheckCompactCollapse(primary);
              if(!primary.alive) break;
              primary.diskFlare = Math.min(2.8, (primary.diskFlare || 0) + dt * 2.6);
              const shrink = Math.max(0.20, Math.cbrt(Math.max(0.04, 1 - dt * drainRate * 0.92)));
              victim.radius *= shrink;

              // 如果闯入气态巨行星的洛希极限且已被撕碎大半 -> 凝聚成壮丽行星光环！
              if (primary.kind === 'gas' && victim.kind === 'planet' && (victim.radius < victim.baseRadius * 0.52 || dist < primary.radius * 1.45)) {
                sbAttachRing(primary.grp, primary, new THREE.Color(...victim.color).lerp(new THREE.Color(0xfde68a), 0.45).getHex());
                sbSpawnExplosion(victim.pos, 0xfbbf24, victim.radius * 2.4, false);
                sbToast(`🪐 洛希极限瓦解！${victim.name} 已被 ${primary.name} 潮汐撕碎并凝聚为全新行星光环！`);
                sbUnlockAch('roche');
                primary.vel.multiplyScalar(primary.mass).addScaledVector(victim.vel,victim.mass).divideScalar(primary.mass+victim.mass);
                primary.mass += victim.mass;
                sbRemoveBody(victim);
                break;
              }
              // 黑洞 / 中子星 / 白矮星持续意大利面化撕裂抽干（绝不炸碎，最后化作密集螺旋等离子丝带彻底吸入视界！）
              if ((primary.kind === 'bh' || primary.kind === 'ns' || primary.kind === 'wd') && victim.radius < victim.baseRadius * 0.28) {
                for (let s = 0; s < 18; s++) sbSpawnTidalStream(victim, primary);
                primary.diskFlare = 2.8;
                sbToast(`🕳️ 潮汐瓦解事件 (TDE)！${victim.name} 已被 ${primary.name} 彻底拉成等离子丝带螺旋吞入事件视界！`);
                sbUnlockAch('tde');
                primary.vel.multiplyScalar(primary.mass).addScaledVector(victim.vel,victim.mass).divideScalar(primary.mass+victim.mass);
                primary.mass += victim.mass;
                sbRemoveBody(victim);
                sbCheckCompactCollapse(primary);
                break;
              }
            }
          }
        }
      }

      // 2.5 黑洞 × 白洞理论物理联动：爱因斯坦-罗森桥（虫洞光桥）与视界奇点湮灭！
      let activeWormhole = null;
      for (let i = sb.bodies.length - 1; i >= 0; i--) {
        const a = sb.bodies[i]; if (!a || !a.alive) continue;
        for (let j = i - 1; j >= 0; j--) {
          const b = sb.bodies[j]; if (!b || !b.alive) continue;
          const isBHWH = (a.kind === 'bh' && b.kind === 'whitehole') || (a.kind === 'whitehole' && b.kind === 'bh');
          if (!isBHWH) continue;
          const bh = a.kind === 'bh' ? a : b, wh = a.kind === 'whitehole' ? a : b;
          const d = bh.pos.distanceTo(wh.pos);
          // 视界直接对撞 -> 虫洞坍缩奇点湮灭爆发 + 诞生新生原初恒星！
          if (d < (sbInteractionRadius(bh) + sbInteractionRadius(wh)) * 1.15) {
            const mid = bh.pos.clone().lerp(wh.pos, 0.5);
            sbSpawnGravWave(mid, 8.5);
            sbSpawnExplosion(mid, 0x38bdf8, 13, true);
            sbSpawnExplosion(mid, 0xfde047, 9, true);
            sbUnlockAch('wormhole');
            sbRemoveBody(bh); sbRemoveBody(wh);
            for (let k = 0; k < 5 && sb.bodies.length < SANDBOX_MAX_BODIES; k++) {
              const ang = (k / 5) * Math.PI * 2;
              const dir = new THREE.Vector3(Math.cos(ang), (Math.random() - 0.5) * 0.45, Math.sin(ang)).normalize();
              const tpl = k === 0 ? SB_TEMPLATES.find(t => t.id === 'sun') : SB_TEMPLATES.find(t => t.id === (k % 2 ? 'earth' : 'crystal_world'));
              sbCreateBody({ ...tpl, name: k === 0 ? '湮灭新生恒星' : `虫洞喷射星-${k}`, pos: mid.clone().addScaledVector(dir, 9 + k * 2.5).toArray(), vel: dir.multiplyScalar(4.5 + k * 0.8).toArray() });
            }
            sbToast('🌀 黑洞 × 白洞视界对撞湮灭！爱因斯坦-罗森桥坍缩并喷射出新生恒星与行星！');
            break;
          }
          // 近距形成爱因斯坦-罗森虫洞光桥（黑洞吸积能量经虫洞传输给白洞加速外流喷发！）
          if (d < 46) {
            activeWormhole = { bh, wh };
            bh.diskFlare = Math.min(2.6, (bh.diskFlare || 0) + dt * 1.8);
            sbUnlockAch('wormhole');
            // 虫洞相互弱引力/斥力平衡并激发白洞喷射发光物质流
            if (Math.random() < 0.35) sbSpawnTidalStream(wh, bh);
          }
        }
      }
      if (sb.wormholeLine) {
        if (activeWormhole && activeWormhole.bh.alive && activeWormhole.wh.alive) {
          const { bh, wh } = activeWormhole;
          const attr = sb.wormholeLine.geometry.attributes.position, cnt = attr.count;
          const dir = wh.pos.clone().sub(bh.pos), len = dir.length();
          const up = Math.abs(dir.y / Math.max(0.1, len)) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
          const s1 = new THREE.Vector3().crossVectors(dir, up).normalize();
          const s2 = new THREE.Vector3().crossVectors(dir, s1).normalize();
          const phase = sb.simYears * 26;
          for (let k = 0; k < cnt; k++) {
            const u = k / (cnt - 1);
            const waist = Math.sin(u * Math.PI) * 1.6 + 0.35;
            const ang = u * Math.PI * 6 + phase;
            const p = bh.pos.clone().lerp(wh.pos, u).addScaledVector(s1, Math.cos(ang) * waist).addScaledVector(s2, Math.sin(ang) * waist);
            attr.setXYZ(k, p.x, p.y, p.z);
          }
          attr.needsUpdate = true;
          sb.wormholeLine.visible = true;
        } else {
          sb.wormholeLine.visible = false;
        }
      }

      // 3. 严格遵循致密天体物理层级的直接碰撞处理（1.0 真实表面接触，不再互相穿模！）
      const collisionBodies=[...sb.bodies];
      for (let i = collisionBodies.length - 1; i >= 0; i--) {
        const a = collisionBodies[i]; if (!a || !a.alive) continue;
        for (let j = i - 1; j >= 0; j--) {
          const b = collisionBodies[j]; if (!b || !b.alive) continue;
          if(['galaxy','nebula','darkmatter','whitehole'].includes(a.kind)||['galaxy','nebula','darkmatter','whitehole'].includes(b.kind))continue;
          const contactRadius=(sbInteractionRadius(a)+sbInteractionRadius(b))*1.0;
          const contact=sbSegmentContact(a.previousPos||a.pos,a.pos,b.previousPos||b.pos,b.pos,contactRadius);
          if (contact !== null) {
            if(contact>0) {a.pos.lerpVectors(a.previousPos,a.pos,contact);b.pos.lerpVectors(b.previousPos,b.pos,contact);}
            const relV = a.vel.distanceTo(b.vel);
            // 弹性碰撞模式
            if (sb.collideMode === 'bounce' && a.kind !== 'bh' && b.kind !== 'bh') {
              const norm = b.pos.clone().sub(a.pos).normalize();
              if(!norm.lengthSq()) norm.set(1,0,0);
              const penetration=Math.max(0,contactRadius-a.pos.distanceTo(b.pos))+.00001;
              a.pos.addScaledVector(norm,-penetration*b.mass/(a.mass+b.mass));b.pos.addScaledVector(norm,penetration*a.mass/(a.mass+b.mass));
              const rv = b.vel.clone().sub(a.vel).dot(norm);
              if (rv < 0) {
                const imp = (-(1 + 1) * rv) / (1 / a.mass + 1 / b.mass);
                a.vel.addScaledVector(norm, -imp / a.mass);
                b.vel.addScaledVector(norm, imp / b.mass);
              }
              continue;
            }
            // 双黑洞并合 -> 引力波涟漪！
            if (a.kind === 'bh' && b.kind === 'bh') {
              const big = a.mass >= b.mass ? a : b, small = big === a ? b : a;
              const totM = (big.mass + small.mass) * 0.95; // 5% 质量转化为引力波能量辐射！
              big.pos.multiplyScalar(big.mass).addScaledVector(small.pos,small.mass).divideScalar(big.mass+small.mass);
              big.vel.multiplyScalar(big.mass).addScaledVector(small.vel, small.mass).divideScalar(big.mass + small.mass);
              big.mass = totM;
              big.radius = Math.min(9.5, Math.hypot(big.radius, small.radius));
              big.mesh.scale.setScalar(big.radius / big.baseRadius);
              big.diskFlare = 2.8;
              sbSpawnGravWave(big.pos, 7.2);
              sbToast(`〰️ 双黑洞并合！5% 质量转化为引力波震荡时空网格！`);
              sbRemoveBody(small);
              break;
            }
            // 双中子星并合 -> 千新星爆发 (Kilonova) + 引力波 + 坍缩成新黑洞！
            if (a.kind === 'ns' && b.kind === 'ns') {
              const totM = a.mass + b.mass;
              const mid = a.pos.clone().multiplyScalar(a.mass).addScaledVector(b.pos,b.mass).divideScalar(totM);
              const newVel = a.vel.clone().multiplyScalar(a.mass).addScaledVector(b.vel, b.mass).divideScalar(totM);
              sbSpawnGravWave(mid, 6.2);
              sbSpawnExplosion(mid, 0xfbbf24, 9.5, true);
              sbUnlockAch('kilonova');
              sbRemoveBody(a); sbRemoveBody(b);
              const remnantMass=totM*.94,collapsed=remnantMass>SB_SOLAR_M*2.8;
              const remnant=sbCreateBody({...SB_TEMPLATES.find(t=>t.id===(collapsed?'blackhole':'neutron')),name:collapsed?'千新星新生黑洞':'千新星中子星残骸',mass:remnantMass,radius:collapsed?3.1:1.55,pos:mid.toArray(),vel:newVel.toArray()});
              sbSelectBody(remnant);
              sbToast(collapsed?'⚡ 双中子星并合，残骸超过假设 TOV 阈值并坍缩成黑洞。':'⚡ 双中子星并合，留下阈值以下的中子星残骸。');
              break;
            }
            // 致密天体严格优先级：BH > NS > WD > Star > Gas > Planet（蓝超巨星绝不能吃黑洞或中子星！）
            const rA = sbCompactRank(a.kind), rB = sbCompactRank(b.kind);
            const big = rA > rB ? a : rB > rA ? b : (a.mass >= b.mass ? a : b);
            const small = big === a ? b : a;
            const totalM = big.mass + small.mass;
            big.pos.multiplyScalar(big.mass).addScaledVector(small.pos,small.mass).divideScalar(totalM);
            big.vel.multiplyScalar(big.mass).addScaledVector(small.vel, small.mass).divideScalar(totalM);
            big.mass = totalM;

            if (big.kind === 'bh') {
              big.radius = Math.min(10.5, big.radius * Math.cbrt(totalM / Math.max(1, totalM - small.mass)));
              big.mesh.scale.setScalar(big.radius / big.baseRadius);
              big.diskFlare = 2.8;
              // 绝不炸碎，全部化作 22 股炽热螺旋等离子流被黑洞视界直接吸入！
              for (let s = 0; s < 22; s++) sbSpawnTidalStream(small, big);
              sbToast(`🕳️ ${big.name} 将 ${small.name} 彻底撕裂拉丝并吞入事件视界！（视界质量 ${(big.mass / SB_SOLAR_M).toFixed(1)} M☉）`);
              sbUnlockAch('tde');
            } else if (big.kind === 'ns' || big.kind === 'wd') {
              big.diskFlare = 2.2;
              for (let s = 0; s < 16; s++) sbSpawnTidalStream(small, big);
              sbToast(`⚡ 致密天体潮汐吸积！${big.name} 将低密度的 ${small.name} 撕裂成螺旋吸积流吞噬！`);
              sbUnlockAch('tde');
            } else {
              const newRad = Math.min(12, Math.cbrt(big.radius ** 3 + small.radius ** 3 * 0.65));
              big.radius = newRad;
              big.mesh.scale.setScalar(newRad / big.baseRadius);
              big.temp = Math.min(4000, big.temp + Math.min(2400, (small.mass / Math.max(0.01, big.mass)) * 1800 + relV * 240));
              // 冰彗星撞击岩质行星 -> 为荒漠行星送水造海！
              if (big.kind === 'planet' && small.water > 50) {
                big.water = Math.min(100, big.water + 18);
                big.atmo = Math.min(5, big.atmo + 0.15);
              }
              const hitPos = small.pos.clone().lerp(big.pos, 0.45);
              sbSpawnExplosion(hitPos, 0xff7b29, Math.max(4.8, (small.radius + big.radius) * 2.2), false);
              sbSpawnExplosion(hitPos, 0xfef08a, Math.max(3.2, small.radius * 1.8), false);
              big.manualTempLock = 8.0;
              if (big.kind === 'planet' && small.kind === 'planet' && !small.isDebris) sbUnlockAch('impact');
              if ((sb.collideMode === 'shatter' || (relV > 1.8 && small.mass > big.mass * 0.08)) && !small.isDebris && !big.isDebris && sb.bodies.length < 48) {
                const baseName = small.name.replace(/(残骸|碎片)+$/g, '').slice(0, 6) || '天体';
                const ejectAngle=Math.random()*Math.PI*2;
                for (let f = 0; f < 4; f++) {
                  const ang = ejectAngle+f*Math.PI/2;
                  const d = new THREE.Vector3(Math.cos(ang),0,Math.sin(ang));
                  const fragmentMass=small.mass*.05;big.mass-=fragmentMass;
                  sbCreateBody({
                    name: `${baseName}碎片`, badge: '撞击碎片', kind: 'planet',
                    mass: fragmentMass, radius: Math.max(0.42, small.radius * 0.28),
                    pos: hitPos.clone().addScaledVector(d, big.radius * 1.45).toArray(),
                    vel: big.vel.clone().addScaledVector(d, relV * 0.55 + 0.8).toArray(),
                    temp: 1500, water: 0, atmo: 0, color: [0.48, 0.28, 0.20], isDebris: true
                  });
                }
              }
              sbToast(`💥 碰撞合并！${big.name} 吸积了 ${small.name}（温度升至 ${Math.round(big.temp)}°C）`);
            }
            sbRemoveBody(small);
            sbCheckCompactCollapse(big);
            break;
          }
        }
      }

      // 3. 实时热力学辐射平衡 + 意大利面化几何形变渲染 + 黑洞连续螺旋撕裂光带 + 吸积盘更新
      const stars = sb.bodies.filter(b => b.kind === 'star');
      const keyStar = stars[0];
      let tidalLead = null;
      for (const b of sb.bodies) {
        if (b.tidalStress > 0.12 && b.tidalTarget && b.tidalTarget.alive && (b.tidalTarget.kind === 'bh' || b.tidalTarget.kind === 'ns')) {
          if (!tidalLead || b.tidalStress > tidalLead.tidalStress) tidalLead = b;
        }
        b.grp.position.copy(b.pos);
        if (b.cloud) b.cloud.rotation.y += dt*.035;
        if (b.mat?.uniforms?.uTime) b.mat.uniforms.uTime.value += dt;
        if (b.diskMat) {
          b.diskMat.uniforms.uTime.value += dt * (1 + (b.diskFlare || 0) * 1.5);
          b.diskMat.uniforms.uFlare.value = b.diskFlare || 0;
        }
        if (b.photonRing && sb.camera) b.photonRing.lookAt(sb.camera.position);
        if (b.jetMesh && b.kind === 'bh') {
          const fl = b.diskFlare || 0;
          b.jetMesh.scale.set(1 + fl * 0.35, 1 + fl * 0.9, 1 + fl * 0.35);
          b.jetMesh.material.opacity = Math.min(0.95, 0.22 + fl * 0.35);
        }
        // 应用极限意大利面化拉伸形变（沿指向黑洞/中子星的径向最高拉长至 4.2 倍！）
        const baseSc = b.radius / b.baseRadius;
        if (b.tidalStress > 0.05 && b.tidalTarget && b.tidalTarget.alive) {
          const dir = b.tidalTarget.pos.clone().sub(b.pos).normalize();
          const stretch = 1 + b.tidalStress * 3.2;
          const squash = 1 / Math.sqrt(stretch);
          b.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
          b.mesh.scale.set(baseSc * stretch, baseSc * squash, baseSc * squash);
        } else {
          b.mesh.scale.setScalar(baseSc);
        }

        if (b.kind === 'planet' || b.kind === 'gas') {
          if (b.manualTempLock > 0) {
            b.manualTempLock = Math.max(0, b.manualTempLock - dt);
          } else {
            let flux = 0;
            for (const st of stars) {
              const d = Math.max(st.radius + 2, b.pos.distanceTo(st.pos));
              const lum = Math.pow(Math.max(0.15, st.mass / SB_SOLAR_M), 1.5) * sb.lumMult;
              flux += lum * (36 * 36) / (d * d);
            }
            const eqK = Math.max(25, 255 * Math.pow(Math.max(0.001, flux), 0.25) * (1 + b.atmo * 0.14));
            const targetC = eqK - 273.15;
            b.temp += (targetC - b.temp) * Math.min(1, dt * 0.14);
          }
          if (b.mat?.uniforms) {
            b.mat.uniforms.uTemp.value = b.temp;
            b.mat.uniforms.uWater.value = b.water / 100;
            b.mat.uniforms.uAtmo.value = b.atmo;
            if (keyStar) b.mat.uniforms.uLightDir.value.copy(keyStar.pos).sub(b.pos).normalize();
          }
        }
      }
      sbUpdateGalaxyMergers(dt);
      sb.simYears += dt * 0.045;
      // 更新黑洞连续 3D 对数螺旋撕裂光带
      if (sb.tidalRibbonLine) {
        if (tidalLead) {
          const pri = tidalLead.tidalTarget, attr = sb.tidalRibbonLine.geometry.attributes.position, cnt = attr.count;
          const v2p = pri.pos.clone().sub(tidalLead.pos), dist = v2p.length();
          const up = Math.abs(v2p.y / Math.max(0.1, dist)) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
          const s1 = new THREE.Vector3().crossVectors(v2p, up).normalize();
          const s2 = new THREE.Vector3().crossVectors(v2p, s1).normalize();
          const phase = sb.simYears * 22;
          for (let k = 0; k < cnt; k++) {
            const u = k / (cnt - 1);
            const r = dist * Math.pow(1 - u, 1.35) + pri.radius * 0.9;
            const ang = u * Math.PI * 3.6 + phase;
            const center = pri.pos.clone().lerp(tidalLead.pos, Math.pow(1 - u, 1.5));
            const swirl = Math.sin(u * Math.PI) * (pri.radius * 1.65);
            const p = center.addScaledVector(s1, Math.cos(ang) * swirl).addScaledVector(s2, Math.sin(ang) * swirl * 0.35);
            attr.setXYZ(k, p.x, p.y, p.z);
          }
          attr.needsUpdate = true;
          sb.tidalRibbonLine.material.color.setRGB(...(tidalLead.kind === 'star' ? tidalLead.color : [1, 0.58, 0.22]));
          sb.tidalRibbonLine.visible = true;
        } else {
          sb.tidalRibbonLine.visible = false;
        }
      }
    }

    function sbCheckCompactCollapse(b) {
      if (!b || !b.alive) return;
      if (b.kind === 'wd' && b.mass >= SB_SOLAR_M * 1.44) {
        sbTriggerSupernova(b);
      } else if (b.kind === 'ns' && b.mass >= SB_SOLAR_M * 2.8) {
        const p = b.pos.clone(), v = b.vel.clone(), m = b.mass;
        sbSpawnGravWave(p, 5.5);
        sbRemoveBody(b);
        const bh = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'blackhole'), name: `${b.name}·TOV坍缩黑洞`, mass: m, radius: 3.1, pos: p.toArray(), vel: v.toArray() });
        sbSelectBody(bh);
        sbToast(`🕳️ 突破 2.8 M☉ TOV 极限！中子星发生引力坍缩成为全新黑洞！`);
      }
    }

    // -------------------------------------------------------------------------
    // 8 大交互神之工具（含引力牵引抓星甩飞 & 流星雨轰炸）
    // -------------------------------------------------------------------------
    function sbPointerNDC(e) {
      const rect = sb.renderer.domElement.getBoundingClientRect();
      return new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    }

    function sbPickBody(e) {
      sb.raycaster.setFromCamera(sbPointerNDC(e), sb.camera);
      const hits = sb.raycaster.intersectObjects(sb.bodies.map(b => b.mesh), false);
      if (hits.length) return hits[0].object.userData.sbBody;
      // 38px 屏幕磁吸拾取容错：避免行星高速移动或体积较小时点不中！
      const rect = sb.renderer.domElement.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const proj = new THREE.Vector3();
      let best = null, bestD = 38;
      for (const b of sb.bodies) {
        proj.copy(b.pos).project(sb.camera);
        if (proj.z > 1 || proj.z < -1) continue;
        const sx = (proj.x * 0.5 + 0.5) * rect.width, sy = (-proj.y * 0.5 + 0.5) * rect.height;
        const d = Math.hypot(sx - mx, sy - my);
        if (d < bestD) { bestD = d; best = b; }
      }
      return best;
    }

    function sbPlanePoint(e) {
      sb.raycaster.setFromCamera(sbPointerNDC(e), sb.camera);
      // 3D 星空模式：当关闭平面网格且视角偏平视时，使用穿过相机焦点的三维视线平面，允许上下左右任意立体投放！
      const camDir = new THREE.Vector3();
      sb.camera.getWorldDirection(camDir);
      if (sb.showGrid || Math.abs(camDir.y) > 0.65) {
        sb.plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), sb.controls ? sb.controls.target : new THREE.Vector3(0, 0, 0));
      } else {
        sb.plane.setFromNormalAndCoplanarPoint(camDir.clone().negate(), sb.controls ? sb.controls.target : new THREE.Vector3(0, 0, 0));
      }
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
          const dSq = d.lengthSq() + 1.8;
          acc.addScaledVector(d, (G * b.mass) / (dSq * Math.sqrt(dSq)));
        }
        v.addScaledVector(acc, h); p.addScaledVector(v, h);
      }
      attr.needsUpdate = true;
      sb.previewLine.visible = true;
    }

    function sbGetSpawnTemplate() {
      if (sb.spawnId === '__custom__' && sb.customTemplate) return sb.customTemplate;
      return SB_TEMPLATES.find(t => t.id === sb.spawnId) || SB_TEMPLATES[3];
    }

    // -------------------------------------------------------------------------
    // 📦 10 大完整复合星系模型一键投放（可直接在 3D 星空任意位置放下整个太阳系/地月系/螺旋星系！）
    // -------------------------------------------------------------------------
    function sbStampSystem(modelId, centerPos, baseVel = new THREE.Vector3()) {
      const needed=({sys_solar:9,sys_galaxy:1,sys_supercluster:25,sys_galaxy_cluster:10,sys_cluster:16})[modelId]||8;
      if(sb.bodies.length+needed>SANDBOX_MAX_BODIES) {sbToast('天体已接近 260 颗预算，先移除部分天体。');return;}
      const c = centerPos.clone();
      const v0 = baseVel.clone();
      const addOrbiting = (tpl, name, offsetVec, parent, extra = {}) => {
        const p = parent.pos.clone().add(offsetVec);
        const v = sbCircularVel(p, parent);
        return sbCreateBody({ ...tpl, name, pos: p.toArray(), vel: v.toArray(), ...extra });
      };
      let main = null;
      if (modelId === 'sys_solar') {
        main=sbCreateSolar(c,v0);
      } else if (modelId === 'sys_earth_moon') {
        main = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'earth'), name: '地球', radius: .1, pos: c.toArray(), vel: v0.toArray() });
        addOrbiting(SB_TEMPLATES.find(t => t.id === 'moon'), '月球', new THREE.Vector3(.24, .01, 0), main, {radius:.027});
      } else if (modelId === 'sys_saturn') {
        main = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'saturn'), name: '土星', radius: .46, pos: c.toArray(), vel: v0.toArray() });
        [['土卫六·泰坦',1.4,2574.7,.02252,[.92,.76,.38]],['土卫二·冰星',1,252.1,.00001808,[.88,.95,1]],['土卫五·瑞亚',1.9,763.8,.0003861,[.76,.76,.78]]].forEach(([name,d,r,mass,color],i)=>{
          const a=i*2.1;
          addOrbiting(SB_TEMPLATES.find(t=>t.id==='moon'),name,new THREE.Vector3(Math.cos(a)*d,0,Math.sin(a)*d),main,{mass:SB_EARTH_M*mass,physicalRadiusKm:r,radius:r/695700*5.5,color});
        });
      } else if (modelId === 'sys_jupiter') {
        main = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'jupiter'), name: '木星', radius: .55, pos: c.toArray(), vel: v0.toArray() });
        [['木卫一·艾奥',1.1,1821.6,.014956,[.95,.82,.28]],['木卫二·欧罗巴',1.5,1560.8,.008035,[.85,.92,.98]],['木卫三·盖尼米得',2,2634.1,.02482,[.68,.64,.6]],['木卫四·卡利斯托',2.6,2410.3,.018016,[.52,.50,.48]]].forEach(([name,d,r,mass,color],i)=>{
          const a=i*1.6;
          addOrbiting(SB_TEMPLATES.find(t=>t.id==='moon'),name,new THREE.Vector3(Math.cos(a)*d,0,Math.sin(a)*d),main,{mass:SB_EARTH_M*mass,physicalRadiusKm:r,radius:r/695700*5.5,color});
        });
      } else if (modelId === 'sys_binary') {
        const pair=sbBinaryStates(120,95,26,sb.G_CONST*sb.gravity,c,v0);
        main=sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='sun'),name:'双星 A',mass:120,radius:4.5,pos:pair[0].pos.toArray(),vel:pair[0].vel.toArray()});
        sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='reddwarf'),name:'双星 B',mass:95,radius:3.8,pos:pair[1].pos.toArray(),vel:pair[1].vel.toArray()});
        addOrbiting(SB_TEMPLATES.find(t=>t.id==='earth'),'环双星行星',new THREE.Vector3(0,2,80),{pos:c,vel:v0,mass:215});
      } else if (modelId === 'sys_trinary') {
        main=sbCreateHierarchical(c,v0);
      } else if (modelId === 'sys_bh') {
        main = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'smbh'), name: '吸积黑洞', mass: 1400, radius: 4.0, pos: c.toArray(), vel: v0.toArray() });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'bluegiant'), name: '被撕裂蓝巨星', mass: 320, radius: 5.8, pos: c.clone().add(new THREE.Vector3(28, 3, 6)).toArray(), vel: v0.clone().add(new THREE.Vector3(-1.2, 0, -4.4)).toArray() });
      } else if (modelId === 'sys_galaxy') {
        main=sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='galaxy'),name:'迷你螺旋星系',pos:c.toArray(),vel:v0.toArray()});
      } else if (modelId === 'sys_pulsar') {
        main = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'neutron'), name: '脉冲星 A', mass: 220, radius: 1.5, pos: c.clone().add(new THREE.Vector3(-9, 0, 0)).toArray(), vel: v0.clone().add(new THREE.Vector3(0.3, 0, 2.7)).toArray() });
        sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'neutron'), name: '脉冲星 B', mass: 215, radius: 1.5, pos: c.clone().add(new THREE.Vector3(9, 0, 0)).toArray(), vel: v0.clone().add(new THREE.Vector3(-0.3, 0, -2.7)).toArray() });
      } else if (modelId === 'sys_cluster') {
        for (let i = 0; i < 16; i++) {
          const a = Math.random() * Math.PI * 2, el = (Math.random() - 0.5) * Math.PI, r = 4 + Math.random() * 14;
          const off = new THREE.Vector3(Math.cos(a) * Math.cos(el) * r, Math.sin(el) * r, Math.sin(a) * Math.cos(el) * r);
          const b = sbCreateBody({ ...SB_TEMPLATES.find(t => t.id === 'comet'), name: `星云彗星-${i + 1}`, pos: c.clone().add(off).toArray(), vel: v0.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2)).toArray(), isDebris: i > 0 });
          if (!main) main = b;
        }
      }
      if (!main) main=sbExtraModel(modelId,c,v0);
      if (main) sbSelectBody(main);
      const meta = SB_SYSTEM_MODELS.find(m => m.id === modelId);
      sbToast(`📦 已在 3D 星空投放完整模型：「${meta?.name || modelId}」！`);
    }

    function sbSpawnAt(pos, velOverride = null) {
      if(sb.bodies.length+(sb.spawnId==='belt'?12:1)>SANDBOX_MAX_BODIES) {sbToast('已达到 260 颗天体上限。');return;}
      // 科学尺度隔离：防止在「恒星/行星尺度（如太阳系）」直接投放十万光年的「螺旋星系/星系群」导致太阳比星系还大！
      const macroIds = ['galaxy', 'darkmatter', 'sys_galaxy', 'sys_galaxy_cluster', 'sys_supercluster'];
      const isSpawningMacro = macroIds.includes(sb.spawnId);
      const hasStellarScene = sb.bodies.some(b => ['planet', 'gas', 'star'].includes(b.kind) && !b.isDebris);
      const hasMacroScene = sb.bodies.some(b => ['galaxy', 'darkmatter'].includes(b.kind));
      if (isSpawningMacro && hasStellarScene) {
        sbClearAll();
        pos = new THREE.Vector3(0, 0, 0);
        velOverride = new THREE.Vector3(0, 0, 0);
        sbToast('🌌 尺度自动切换：星系直径达十万光年（比太阳大万亿倍），已切换至「星系宏尺度」投放！');
      } else if (!isSpawningMacro && hasMacroScene && !['bh', 'whitehole'].includes(sbGetSpawnTemplate().kind)) {
        sbClearAll();
        pos = new THREE.Vector3(0, 0, 0);
        velOverride = new THREE.Vector3(0, 0, 0);
        sbToast('🪐 尺度自动切换：已从「星系宏尺度」切换回「恒星系尺度」以保持科学比例！');
      }
      if (String(sb.spawnId).startsWith('sys_')) {
        const dominant = sb.bodies.filter(b => !b.isDebris && ['star','bh','ns','wd','darkmatter'].includes(b.kind)).sort((a, b) => b.mass - a.mass)[0];
        const baseV = velOverride || (sb.launchMode === 'orbit' && dominant && dominant.pos.distanceTo(pos) > 25 ? sbCircularVel(pos, dominant) : new THREE.Vector3());
        sbStampSystem(sb.spawnId, pos, baseV);
        if (isSpawningMacro && typeof sbOverview === 'function') sbOverview();
        return;
      }
      const tpl = sbGetSpawnTemplate();
      const dominant = sb.bodies.filter(b => !b.isDebris).sort((a, b) => b.mass - a.mass)[0];
      if (tpl.kind === 'belt') {
        const center = dominant || { pos: new THREE.Vector3(0, 0, 0), vel: new THREE.Vector3(0, 0, 0), mass: 120 };
        const baseR = Math.max(12, pos.distanceTo(center.pos));
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2 + Math.random() * 0.2;
          const r = baseR + (Math.random() - 0.5) * 4;
          const p = center.pos.clone().add(new THREE.Vector3(Math.cos(ang) * r, (Math.random() - 0.5) * 1.5, Math.sin(ang) * r));
          sbCreateBody({ name: `环群星子`, badge: '小行星带', kind: 'planet', mass: SB_EARTH_M*1e-6, physicalRadiusKm:100, radius: 0.45, pos: p.toArray(), vel: sbCircularVel(p, center).toArray(), temp: -80, color: [0.62, 0.56, 0.48], isDebris: true });
        }
        sbToast('🪨 已投放 12 颗受引力扰动的轨道小行星环群！');
        return;
      }
      let vel = new THREE.Vector3(0, 0, 0);
      if (velOverride) vel.copy(velOverride);
      else if (sb.launchMode === 'orbit' && dominant && dominant.pos.distanceTo(pos) > 3) vel.copy(sbCircularVel(pos, dominant));
      const body = sbCreateBody({ ...tpl, pos: pos.toArray(), vel: vel.toArray() });
      sbSelectBody(body);
      sbToast(`🚀 已投放「${body.name}」（${sbRankLabel(body)}）`);
    }

    function sbBindCanvasEvents() {
      const dom = sb.renderer.domElement;
      dom.addEventListener('dblclick', e => {
        const hit = sbPickBody(e);
        if (hit) {
          sbSelectBody(hit);
          sb.followBody = hit;
          sb$('sb-follow-btn')?.setAttribute('aria-pressed', 'true');
          sbToast(`🎯 双击锁定跟踪：${hit.name}`);
        }
      });
      dom.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        const hit = sbPickBody(e);
        if (sb.tool === 'select') {
          if (hit) sbSelectBody(hit);
          return;
        }
        if (sb.tool === 'grab') {
          if (hit) {
            sbSelectBody(hit);
            sb.grabBody = hit;
            const normal=new THREE.Vector3();sb.camera.getWorldDirection(normal);
            sb.grabPlane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,hit.pos);
            sb.grabPrevPos.copy(hit.pos);sb.grabTime=performance.now();
            sb.grabVel.set(0, 0, 0);
            sb.controls.enabled = false;
            sbUnlockAch('grab');
          }
          return;
        }
        if (sb.tool === 'barrage') {
          const pt = hit ? hit.pos.clone() : sbPlanePoint(e);
          if (pt) { sb.barrageActive = true; sb.pointerDownBeam = true; sb.barragePos.copy(pt); sb.controls.enabled = false; }
          return;
        }
        if (sb.tool === 'explode') {
          const tgt = hit;
          if (tgt && tgt.alive) sbTriggerSupernova(tgt);
          else sbToast('请先选择或点击一颗天体进行脉冲引爆 / 超新星坍缩');
          return;
        }
        if (['laser', 'freeze', 'spin'].includes(sb.tool)) {
          if (hit && hit.alive) { sbSelectBody(hit); sb.activeBeamTarget = hit; sb.pointerDownBeam = true; sb.controls.enabled = false; }
          else sbToast('请直接点击或按住画布中的目标星球以施放光束！');
          return;
        }
        if (sb.tool === 'launch') {
          const pt = sbPlanePoint(e); if (!pt) return;
          if (sb.launchMode === 'drag') {
            sb.dragState = { start: pt.clone(), cur: pt.clone(), x:e.clientX,y:e.clientY,moved:false };
            sb.controls.enabled = false;
          } else {
            sbSpawnAt(pt);
          }
        }
      });

      dom.addEventListener('pointermove', e => {
        if (sb.grabBody && sb.grabBody.alive) {
          sb.raycaster.setFromCamera(sbPointerNDC(e),sb.camera);
          const pt=sb.raycaster.ray.intersectPlane(sb.grabPlane,new THREE.Vector3());
          if (pt) {
            const now=performance.now(),elapsed=Math.max(.001,(now-sb.grabTime)/1000);sb.grabTime=now;
            sb.grabVel.copy(pt).sub(sb.grabPrevPos).multiplyScalar(1/elapsed).clampLength(0,14);
            sb.grabPrevPos.copy(pt);
            sb.grabBody.pos.copy(pt);
            sb.grabBody.grp.position.copy(pt);
            sb.grabBody.vel.copy(sb.grabVel);
          }
          return;
        }
        if (sb.barrageActive) {
          const pt = sbPlanePoint(e);
          if (pt) sb.barragePos.copy(pt);
          return;
        }
        if (!sb.dragState) {
          // 悬停瞄准锁定圈：当选中任意交互工具时滑过星球实时高亮显示瞄准圈
          if (sb.hoverRing) {
            const h = sb.tool !== 'select' && sb.tool !== 'launch' ? sbPickBody(e) : null;
            if (h && h.alive) {
              sb.hoverRing.visible = true;
              sb.hoverRing.position.copy(h.pos);
              sb.hoverRing.scale.setScalar(Math.max(1.2, sbVisualRadius(h)));
              sb.hoverRing.lookAt(sb.camera.position);
              sb.hoverRing.material.color.setHex(sb.tool === 'explode' ? 0xfb7185 : sb.tool === 'freeze' ? 0x38bdf8 : sb.tool === 'laser' ? 0xf97316 : 0xfde047);
            } else {
              sb.hoverRing.visible = false;
            }
          }
          return;
        }
        const pt = sbPlanePoint(e); if (!pt) return;
        sb.dragState.cur.copy(pt);
        if(Math.hypot(e.clientX-sb.dragState.x,e.clientY-sb.dragState.y)>5)sb.dragState.moved=true;
        const vel = sb.dragState.start.clone().sub(pt).multiplyScalar(0.32);
        sbUpdatePreviewOrbit(sb.dragState.start, vel);
      });

      window.addEventListener('pointerup', () => {
        if(!sb.open) {sbCancelInteraction();return;}
        if (sb.grabBody) {
          sb.grabBody.vel.copy(sb.grabVel.clampLength(0, 14));
          sb.grabBody = null; sb.controls.enabled = true;
        }
        if (sb.barrageActive && sb.pointerDownBeam) { sb.barrageActive = false; sb.pointerDownBeam = false; sb.controls.enabled = true; }
        if (sb.dragState) {

          // 物理容错优化：如果用户在「拖拽弹射」模式下只是单击未拖动，自动按精确圆轨公转速度投放，避免静止坠入恒星！
          if (!sb.dragState.moved) {
            const dominant = sb.bodies.filter(b => !b.isDebris).sort((a, b) => b.mass - a.mass)[0];
            const autoV = dominant && dominant.pos.distanceTo(sb.dragState.start) > 3 ? sbCircularVel(sb.dragState.start, dominant) : new THREE.Vector3();
            sbSpawnAt(sb.dragState.start, autoV);
          } else {
            const vel = sb.dragState.start.clone().sub(sb.dragState.cur).multiplyScalar(0.32);
            sbSpawnAt(sb.dragState.start, vel);
          }
          sb.dragState = null; sb.previewLine.visible = false; sb.controls.enabled = true;
        }
        sbCancelInteraction();
      });
    }

    function sbTickActiveTool(dt) {
      if(dt<=0)return;
      if (sb.autoBeamTimer > 0) {
        sb.autoBeamTimer = Math.max(0, sb.autoBeamTimer - dt);
        if (sb.autoBeamTimer === 0 && !sb.pointerDownBeam) {
          sb.activeBeamTarget = null;
          sb.barrageActive = false;
          sb.laserLine.visible = false;
        }
      }
      if (sb.barrageActive) {
        if (sb.selected && sb.selected.alive && !sb.pointerDownBeam) sb.barragePos.copy(sb.selected.pos);
        sb.barrageTimer += dt;
        if (sb.barrageTimer > 0.12 && sb.bodies.length < 76) {
          sb.barrageTimer = 0;
          const off = new THREE.Vector3((Math.random() - 0.5) * 24, 10 + Math.random() * 8, (Math.random() - 0.5) * 24);
          const start = sb.barragePos.clone().add(off);
          const dir = sb.barragePos.clone().sub(start).normalize();
          const isIce = Math.random() < 0.45;
          sbCreateBody({
            name: isIce ? '冰晶陨彗' : '陨石', badge: '撞击碎片', kind: 'planet',
            mass: SB_EARTH_M * 1e-6, radius: 0.48, physicalRadiusKm:100, realm:'fiction', sourceNote:'神之工具的撞击与送水演示，覆盖率增量不等同于真实送水量。', pos: start.toArray(), vel: dir.multiplyScalar(15).toArray(),
            temp: isIce ? -180 : 120, water: isIce ? 95 : 0, color: isIce ? [0.65, 0.88, 1] : [0.65, 0.52, 0.40], isDebris: true
          });
        }
      }
      const t = sb.activeBeamTarget;
      if (!t || !t.alive) { sb.laserLine.visible = false; return; }
      const src = sb.camera.position.clone().lerp(t.pos, 0.18).add(new THREE.Vector3(0, -3, 0));
      const attr = sb.laserLine.geometry.attributes.position;
      attr.setXYZ(0, src.x, src.y, src.z); attr.setXYZ(1, t.pos.x, t.pos.y, t.pos.z);
      attr.needsUpdate = true; sb.laserLine.visible = true;

      if (sb.tool === 'laser') {
        sb.laserLine.material.color.setHex(0xff4d1a);
        if (t.kind !== 'bh' && dt>0) {
          t.temp = Math.min(1e9, t.temp + dt * 1150);
          t.manualTempLock = 8.0;
          if (t.temp > 180) t.water = Math.max(0, t.water - dt * 28);
        }
      } else if (sb.tool === 'freeze') {
        sb.laserLine.material.color.setHex(0x38bdf8);
        if (t.kind !== 'bh' && dt>0) {
          t.temp = Math.max(-273.15, t.temp - dt * 980);
          t.manualTempLock = 8.0;
        }
      } else if (sb.tool === 'spin') {
        sb.laserLine.material.color.setHex(0xc084fc);
        t.spin += dt * 18;
        if (t.spin > 21 && t.kind !== 'bh') {
          sbToast(`🌀 离心力超过引力结合能！${t.name} 被高速自旋彻底甩裂！`);
          sbTriggerSupernova(t);
          sb.activeBeamTarget = null;
          sb.autoBeamTimer = 0;
        }
      }
      sbSyncInspector();
    }

    // -------------------------------------------------------------------------
    // 检视器同步 + 实时温度/速率遥测 Sparkline + SQLite 存档
    // -------------------------------------------------------------------------
    function sbSelectBody(body) {
      sb.selected = body;
      sbSyncInspector();
    }


    function sbSyncInspector() {
      const b = sb.selected;
      const warn = sb$('sb-roche-warn');
      if (!b || !b.alive) {
        sb$('sb-sel-name').textContent = '未选中天体';
        sb$('sb-sel-badge').textContent = '点击画布中任意天体';
        sb$('sb-life-pct').textContent = '0%';
        sb$('sb-life-bar').style.width = '0%';
        if (warn) warn.hidden = true;
        return;
      }
      if (warn) warn.hidden = !(b.tidalStress > 0.12);
      sb$('sb-sel-name').textContent = b.name;
      sb$('sb-sel-badge').textContent = b.badge;
      const life = sbLifeLikelihood(b);
      if (life >= 85 && b.kind === 'planet') sbUnlockAch('cradle');
      sb$('sb-life-pct').textContent = life + '%';
      sb$('sb-life-bar').style.width = life + '%';
      sb$('sb-surface-state').textContent = sbSurfaceStateText(b);
      sb$('sb-m-mass').textContent = ['galaxy','darkmatter','nebula'].includes(b.kind)?`${sbNumberText(b.mass)} 模型权重`:b.mass >= 20 ? `${sbNumberText(b.mass / SB_SOLAR_M)} M☉` : `${sbNumberText(b.mass / SB_EARTH_M)} M⊕`;
      sb$('sb-m-temp').textContent = ['bh','whitehole','darkmatter','galaxy'].includes(b.kind) ? '不适用' : `${Math.round(b.temp)} °C`;
      const density=sbPhysicalDensity(b);sb$('sb-m-dens').textContent = b.kind==='bh'?'非实体密度':density===null?'未知':`${sbNumberText(density)} g/cm³`;
      sb$('sb-m-vel').textContent = `${b.vel.length().toFixed(2)} 单位/s`;
      sb$('sb-m-radius').textContent=sbPhysicalRadius(b)?sbNumberText(sbPhysicalRadius(b))+' km':'未知 / 集合节点';
      sb$('sb-science-note').textContent=(b.sourceNote||'真实质量比；距离与时间压缩，非高精度天文预报。')+(sb.sizeMode==='proportional'?' 当前按共同半径比例显示。':' 小天体放大显示，不是实际大小比。');
      const escape=sbEscapeKms(b);sb$('sb-m-esc').textContent=b.kind==='bh'?'299,792 km/s':escape===null?'未知':sbNumberText(escape)+' km/s';
      sb$('sb-m-rank').textContent = sbRankLabel(b);
      sb$('sb-ed-temp').value = String(Math.round(THREE.MathUtils.clamp(b.temp, -250, 4000)));
      sb$('sb-ed-temp-val').textContent = `${Math.round(b.temp)} °C`;
      sb$('sb-ed-water').value = String(Math.round(b.water));
      sb$('sb-ed-water-val').textContent = `${Math.round(b.water)}%`;
      sb$('sb-ed-atmo').value = String(Number(b.atmo).toFixed(1));
      sb$('sb-ed-atmo-val').textContent = `${Number(b.atmo).toFixed(1)}×`;
      const rScale = THREE.MathUtils.clamp(b.radius / b.baseRadius, 0.4, 3.0);
      sb$('sb-ed-radius').value = rScale.toFixed(2);
      sb$('sb-ed-radius-val').textContent = `${rScale.toFixed(2)}×`;
      sb$('sb-supernova-btn').textContent = b.kind==='bh'?'🌀 喷流脉冲':b.kind==='star'&&b.mass<SB_SOLAR_M*8?'⭐ 晚期演化演示':b.kind==='ns'?'⚡ 强制坍缩（设想）':b.kind==='wd'?'💥 热核爆发演示':b.kind==='star'?'💥 超新星演示':'💥 粉碎星球';
      // 即使处于暂停状态也立即同步 3D 球体着色器参数！
      if (b.mat?.uniforms) {
        if (b.mat.uniforms.uTemp) b.mat.uniforms.uTemp.value = b.temp;
        if (b.mat.uniforms.uWater) b.mat.uniforms.uWater.value = b.water / 100;
        if (b.mat.uniforms.uAtmo) b.mat.uniforms.uAtmo.value = b.atmo;
        if (b.mat.uniforms.uBase) b.mat.uniforms.uBase.value.setRGB(...b.color);
        if (b.mat.uniforms.uColor) b.mat.uniforms.uColor.value.setRGB(...b.color);
      }
      sbDrawSparkline(b);
    }

    function sbSerializeUniverse() {
      return normalizeSandboxUniverse({
        ...Object.fromEntries(['preset','gravity','speed','lumMult','simYears','rocheEnabled','collideMode','sizeMode','showTrails','showHZ','showGrid','showVel','showLabels','paused'].map(key=>[key,sb[key]])),
        camera:sb.camera.position.toArray(),target:sb.controls.target.toArray(),cosmos:sb.cosmos,
        bodies:sb.bodies.filter(b=>b.alive).map(b=>({...b,pos:b.pos.toArray(),vel:b.vel.toArray(),ring:b.hasRing}))
      });
    }

    // -------------------------------------------------------------------------
    // 主循环 & 初始化 / 开关生命周期
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

      const simDt=sb.paused?0:rawDt*sb.speed*1.35;
      if(simDt>0) {
        const sub=Math.max(1,Math.min(sb.bodies.length>128?16:32,Math.ceil(simDt/.0125)));
        for(let k=0;k<sub;k++) sbStepPhysics(simDt/sub);
        sbUpdateTrails();
      }
      sbTickActiveTool(simDt);
      sbUpdateTidalStreams(simDt);
      sbUpdateCosmos(simDt);

      for (let i = sb.effects.length - 1; i >= 0; i--) {
        const e = sb.effects[i]; e.age += simDt;
        const u = Math.min(1, e.age / e.duration);
        e.ring.scale.setScalar(1 + u * (e.isSupernova ? 11 : 4.5));
        e.ring.material.opacity = 0.9 * (1 - u);
        e.flash.material.opacity = 0.95 * Math.max(0, 1 - u * 1.4);
        const pa = e.pts.geometry.attributes.position, pv = e.pVel;
        for (let k = 0; k < pa.count; k++) pa.setXYZ(k, pa.getX(k) + pv[k * 3] * simDt, pa.getY(k) + pv[k * 3 + 1] * simDt, pa.getZ(k) + pv[k * 3 + 2] * simDt);
        pa.needsUpdate = true; e.pts.material.opacity = 0.95 * (1 - u);
        if (u >= 1) { disposeTree(e.grp); sb.effects.splice(i, 1); }
      }

      sbUpdateGravityGridAndHZ(simDt);

      // 3D 自由空间漫游：WASD / 方向键前后左右 + Q/E 上下升降！
      if (sb.keys.size > 0 && sb.controls) {
        const moveSpd = rawDt * Math.max(.02, sb.camera.position.distanceTo(sb.controls.target) * 0.72);
        const fwd = new THREE.Vector3(); sb.camera.getWorldDirection(fwd);
        const right = new THREE.Vector3().crossVectors(fwd, sb.camera.up).normalize();
        const up = sb.camera.up.clone().normalize();
        const delta = new THREE.Vector3();
        if (sb.keys.has('w') || sb.keys.has('arrowup')) delta.addScaledVector(fwd, moveSpd);
        if (sb.keys.has('s') || sb.keys.has('arrowdown')) delta.addScaledVector(fwd, -moveSpd);
        if (sb.keys.has('a') || sb.keys.has('arrowleft')) delta.addScaledVector(right, -moveSpd);
        if (sb.keys.has('d') || sb.keys.has('arrowright')) delta.addScaledVector(right, moveSpd);
        if (sb.keys.has('q')) delta.addScaledVector(up, moveSpd);
        if (sb.keys.has('e')) delta.addScaledVector(up, -moveSpd);
        if (delta.lengthSq() > 0) {
          sb.followBody = null; sb$('sb-follow-btn')?.setAttribute('aria-pressed', 'false');
          sb.camera.position.add(delta); sb.controls.target.add(delta);
        }
      }

      if (sb.followBody && sb.followBody.alive) {
        const d = sb.followBody.pos.clone().sub(sb.controls.target);
        sb.controls.target.add(d); sb.camera.position.add(d);
      }
      sbUpdateCameraRange();sbApplySizeMode();
      sb.controls.update();
      sb.renderer.render(sb.scene, sb.camera);

      const wrap = sb$('sb-canvas-wrap'), w = wrap.clientWidth, h = wrap.clientHeight;
      const proj = new THREE.Vector3();
      // 智能标签防重叠与数量上限：按重要性排序，避免几十个彗星/碎片标签框满屏乱飞互相遮挡！
      const priority = b => (b === sb.selected ? 1000 : 0) + (b.kind === 'bh' || b.kind === 'whitehole' ? 400 : b.kind === 'star' ? 300 : b.kind === 'galaxy' ? 250 : b.kind === 'gas' ? 120 : b.isDebris ? -100 : 40) + Math.min(50, b.radius * 4);
      const sortedLabels = [...sb.bodies].sort((a, b) => priority(b) - priority(a));
      const occupiedLabels = [];
      let shownLabels = 0;
      for (const b of sortedLabels) {
        if (!sb.showLabels || (b.isDebris && b !== sb.selected) || shownLabels >= 18) { b.labelEl.hidden = true; continue; }
        proj.copy(b.pos).project(sb.camera);
        const x = (proj.x * 0.5 + 0.5) * w, y = (-proj.y * 0.5 + 0.5) * h;
        const off = proj.z > 1 || proj.z < -1 || x < 34 || x > w - 34 || y < 56 || y > h - 28;
        const clash = !off && b !== sb.selected && occupiedLabels.some(p => Math.abs(p.x - x) < 76 && Math.abs(p.y - y) < 24);
        b.labelEl.hidden = off || clash;
        if (!off && !clash) {
          b.labelEl.style.left = x + 'px'; b.labelEl.style.top = y + 'px';
          b.labelEl.classList.toggle('selected', b === sb.selected);
          occupiedLabels.push({ x, y });
          shownLabels++;
        }
      }

      sbUiTick += rawDt;
      if (sbUiTick > 0.25) {
        sbUiTick = 0;
        if (sb.selected && sb.selected.alive) {
          sb.selected.tempHist.push(sb.selected.temp);
          sb.selected.velHist.push(sb.selected.vel.length());
          if (sb.selected.tempHist.length > 48) { sb.selected.tempHist.shift(); sb.selected.velHist.shift(); }
        }
        sb$('sb-stats-line').textContent = `天体 ${sb.bodies.length} 颗 · 模拟历元 ${sb.simYears.toFixed(2)}（压缩时间） · ${sb.fpsVal} FPS`;
        sbSyncInspector();sbUpdateLocator();
      }
    }

    function sbSwitchLeftTab(tab) {
      ['spawn', 'genesis', 'saves'].forEach(t => { sb$('sb-tab-' + t).hidden = (t !== tab); });
      document.querySelectorAll('[data-sb-left-tab]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.sbLeftTab === tab)));
      sb$('sb-save-toggle')?.setAttribute('aria-pressed', String(tab === 'saves'));
      if (tab === 'saves') sbRefreshSaves();
    }

    function sbInit() {
      if (sb.inited) return;
      const wrap = sb$('sb-canvas-wrap');
      sb.scene = new THREE.Scene();
      sb.scene.background = new THREE.Color(0x020611);
      sb.camera = new THREE.PerspectiveCamera(48, Math.max(1, wrap.clientWidth) / Math.max(1, wrap.clientHeight), 0.2, 2400);
      sb.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      sb.renderer.domElement.tabIndex=0;
      sb.renderer.domElement.setAttribute('aria-label','3D 星空：WASD 移动，QE 升降，F 定位，Home 全景');
      sb.renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth<760?1.25:1.75));
      sb.renderer.setSize(wrap.clientWidth, wrap.clientHeight);
      wrap.insertBefore(sb.renderer.domElement, wrap.firstChild);
      sb.controls = new OrbitControls(sb.camera, sb.renderer.domElement);
      sb.controls.enableDamping = true; sb.controls.dampingFactor = 0.08;
      sb.controls.screenSpacePanning = true;
      sb.controls.minDistance = .001; sb.controls.maxDistance = 1e7;

      sbBuildEnvironment();
      sbBindCanvasEvents();sbBindExtendedControls();
      sbRenderAchievements();

      const modelGrid = sb$('sb-model-grid');
      const grid = sb$('sb-spawn-grid');
      const selectSpawnBtn = (id, clickedBtn) => {
        sb.spawnId = id;
        document.querySelectorAll('#sb-model-grid .sb-spawn-item, #sb-spawn-grid .sb-spawn-item').forEach(b => b.setAttribute('aria-pressed', String(b === clickedBtn)));
        setTool('launch');
      };
      if (modelGrid) {
        SB_SYSTEM_MODELS.forEach(m => {
          const btn = document.createElement('button');
          btn.className = 'sb-spawn-item';
          btn.dataset.spawnId = m.id;
          btn.setAttribute('aria-pressed', 'false');
          btn.innerHTML = `<strong>${m.icon} ${m.name}</strong><small>${m.badge}</small>`;
          btn.onclick = () => selectSpawnBtn(m.id, btn);
          modelGrid.appendChild(btn);
        });
      }
      SB_TEMPLATES.forEach(tpl => {
        const btn = document.createElement('button');
        btn.className = 'sb-spawn-item';
        btn.dataset.spawnId = tpl.id;
        btn.setAttribute('aria-pressed', String(tpl.id === sb.spawnId));
        btn.innerHTML = `<strong>${tpl.icon} ${tpl.name}</strong><small>${tpl.badge}</small>`;
        btn.onclick = () => selectSpawnBtn(tpl.id, btn);
        grid.appendChild(btn);
      });

      window.addEventListener('keydown', e => {
        if (!sb.open || e.target.matches('input,textarea,select')) return;
        const k = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) sb.keys.add(k);
      });
      window.addEventListener('keyup', e => { sb.keys.delete(e.key.toLowerCase()); });
      window.addEventListener('blur', () => { sb.keys.clear(); });

      const hints = {
        select: '3D 星空模式：左键 360° 旋转 · 右键上下左右平移 · WASD/QE 自由漫游 · 双击锁定天体',
        launch: '发射模式：点击 3D 星空自动圆轨投放（或投放完整星系模型），拖拽可拉出 80 步引力预测轨',
        grab:   '当前工具：引力牵引神手 · 按住并拖拽任意星球/黑洞直接移动或甩飞！',
        barrage:'当前工具：流星轰炸 · 在画布任意位置按住连发高能陨石/冰晶彗星雨（可为荒漠星球送水）',
        laser:  '当前工具：高能激光 · 按住天体持续加热，汽化海洋并熔化地壳',
        freeze: '当前工具：冰冻射线 · 按住天体迅速降温至冰封雪球世界',
        spin:   '当前工具：强制自旋 · 按住天体加速旋转直至离心力超过引力结合能而甩裂！',
        explode:'当前工具：脉冲引爆 · 点击恒星引发超新星坍缩，点击黑洞激发相对论喷流过载！'
      };
      function setTool(t, fromBtnClick = false) {
        sbCancelInteraction();
        sb.tool = t;
        document.querySelectorAll('[data-sb-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sbTool === t)));
        sb$('sb-tool-hint').textContent = hints[t] || '';
        const dom = sb.renderer?.domElement;
        if (dom) dom.style.cursor = t === 'select' ? 'default' : t === 'grab' ? 'grab' : 'crosshair';
        // 严格遵循「先选工具 → 再点击画布中任意目标星球执行」，绝不误伤当前默认选中的地球！
        if (fromBtnClick && ['laser', 'freeze', 'spin', 'barrage', 'explode', 'grab'].includes(t)) {
          const names = { laser: '🔥 高能激光', freeze: '❄️ 冰冻射线', spin: '🌀 强制甩裂', barrage: '☄️ 流星轰炸', explode: '💥 脉冲引爆', grab: '🧲 引力牵引' };
          sbToast(`已切换「${names[t]}」工具：请在 3D 星空点击或按住目标星球执行！`);
        }
      }
      window._sbSetTool = setTool;

      document.querySelectorAll('[data-sb-tool]').forEach(b => b.onclick = () => setTool(b.dataset.sbTool, true));
      document.querySelectorAll('[data-sb-launch]').forEach(b => b.onclick = () => {
        sb.launchMode = b.dataset.sbLaunch;
        document.querySelectorAll('[data-sb-launch]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        setTool('launch');
      });

      sb$('sb-preset-select').onchange = e => sbLoadPreset(e.target.value);
      sb$('sb-reset-scene').onclick = () => sbLoadPreset(sb.preset);
      [['sb-tog-trails', 'showTrails'], ['sb-tog-hz', 'showHZ'], ['sb-tog-grid', 'showGrid'], ['sb-tog-vel', 'showVel'], ['sb-tog-labels', 'showLabels']].forEach(([id, key]) => {
        sb$(id).onclick = () => { sb[key] = !sb[key]; sb$(id).setAttribute('aria-pressed', String(sb[key])); };
      });

      document.querySelectorAll('[data-sb-left-tab]').forEach(b => b.onclick = () => sbSwitchLeftTab(b.dataset.sbLeftTab));
      sb$('sb-save-toggle').onclick = () => sbSwitchLeftTab(sb$('sb-tab-saves').hidden ? 'saves' : 'spawn');
      sb$('sb-save-btn').onclick = sbSaveUniverse;

      // 成就弹窗
      sb$('sb-ach-btn').onclick = () => { sbRenderAchievements(); sb$('sb-ach-pop').hidden = !sb$('sb-ach-pop').hidden; };
      sb$('sb-ach-close').onclick = () => { sb$('sb-ach-pop').hidden = true; };

      // 创世造物主与宇宙法则绑定
      sb$('sb-bigbang-btn').onclick = sbRunBigBang;
      sb$('sb-forge-btn').onclick = () => sbForgeUniverse(false, false);
      sb$('sb-forge-cradle').onclick = () => sbForgeUniverse(true, false);
      sb$('sb-gen-planets').oninput = e => { sb$('sb-gen-planets-val').textContent = e.target.value + ' 颗'; };
      sb$('sb-gen-belt').oninput = e => { sb$('sb-gen-belt-val').textContent = e.target.value + ' 颗'; };
      sb$('sb-gen-chaos').oninput = e => { sb$('sb-gen-chaos-val').textContent = Number(e.target.value).toFixed(2); };
      sb$('sb-law-lum').oninput = e => { sb.lumMult = +e.target.value; sb$('sb-law-lum-val').textContent = sb.lumMult.toFixed(1) + '×'; };
      sb$('sb-law-collide').onchange = e => { sb.collideMode = e.target.value; };
      sb$('sb-law-roche').onchange = e => { sb.rocheEnabled = e.target.checked; };

      // 时间与引力常数（支持负引力暗能量排斥！）
      sb$('sb-pause-btn').onclick = () => {
        sb.paused = !sb.paused;
        sb$('sb-pause-btn').setAttribute('aria-pressed', String(sb.paused));
        sb$('sb-pause-btn').textContent = sb.paused ? '▶ 继续' : 'Ⅱ 暂停';
      };
      sb$('sb-speed').oninput = e => { sb.speed = +e.target.value; sb$('sb-speed-val').textContent = sb.speed.toFixed(1) + '×'; };
      sb$('sb-speed').ondblclick = () => { sb.speed = 1.0; sb$('sb-speed').value = '1'; sb$('sb-speed-val').textContent = '1.0×'; sbToast('↺ 时间流速已恢复默认 1.0×'); };
      sb$('sb-gravity').oninput = e => {
        sb.gravity = +e.target.value;
        sb$('sb-gravity-val').textContent = sb.gravity < 0 ? `${sb.gravity.toFixed(1)}× 反引力` : `${sb.gravity.toFixed(1)}×`;
      };
      sb$('sb-gravity').ondblclick = () => { sb.gravity = 1.0; sb$('sb-gravity').value = '1'; sb$('sb-gravity-val').textContent = '1.0×'; sbToast('↺ 引力常数 G 已恢复默认 1.0×'); };
      const resetSimBtn = sb$('sb-reset-sim-params');
      if (resetSimBtn) resetSimBtn.onclick = () => {
        sb.speed = 1.0; sb$('sb-speed').value = '1'; sb$('sb-speed-val').textContent = '1.0×';
        sb.gravity = 1.0; sb$('sb-gravity').value = '1'; sb$('sb-gravity-val').textContent = '1.0×';
        sb.lumMult = 1.0; if (sb$('sb-law-lum')) { sb$('sb-law-lum').value = '1.0'; sb$('sb-law-lum-val').textContent = '1.0×'; }
        sbToast('↺ 已将时间流速 (1.0×) 与引力常数 G (1.0×) 恢复为默认值！');
      };

      // 右侧检视器
      const resetBodyBtn = sb$('sb-reset-body-btn');
      if (resetBodyBtn) resetBodyBtn.onclick = () => {
        const b = sb.selected; if (!b || !b.initState) return;
        sbCancelInteraction();
        b.mass = b.initState.mass; b.radius = b.initState.radius; b.temp = b.initState.temp;
        b.water = b.initState.water; b.atmo = b.initState.atmo; b.spin = b.initState.spin;
        b.color = [...b.initState.color]; b.manualTempLock = 8;
        b.physicalRadiusKm=b.initState.physicalRadiusKm;b.density=b.initState.density;
        b.kind=b.initialKind;b.mat.uniforms.uIsGas&&(b.mat.uniforms.uIsGas.value=b.kind==='gas'?1:0);
        if(b.ringMesh) {disposeTree(b.ringMesh);b.ringMesh=null;b.hasRing=false;}
        if(b.initState.ring)sbAttachRing(b.grp,b);
        b.mesh.scale.setScalar(b.radius / b.baseRadius);
        sbSyncInspector();
        sbToast(`↺ 已恢复「${b.name}」的初始默认物理属性！`);
      };
      sb$('sb-follow-btn').onclick = () => {
        sb.followBody = sb.followBody === sb.selected ? null : sb.selected;
        sb$('sb-follow-btn').setAttribute('aria-pressed', String(!!sb.followBody));
      };
      sb$('sb-delete-btn').onclick = () => { if (sb.selected) sbRemoveBody(sb.selected); };
      sb$('sb-supernova-btn').onclick = () => { if (sb.selected) sbTriggerSupernova(sb.selected); };
      document.querySelectorAll('[data-sb-mass]').forEach(btn => btn.onclick = () => {
        const b = sb.selected; if (!b) return;
        b.mass = THREE.MathUtils.clamp(b.mass * (+btn.dataset.sbMass), 1e-30, 1e9);
        if (b.kind === 'star') {
          const col = b.mass > 320 ? [0.55, 0.84, 1.0] : b.mass < 55 ? [1.0, 0.34, 0.16] : [1.0, 0.82, 0.36];
          b.color = col; b.mat.uniforms.uColor.value.setRGB(...col);
          b.sourceNote='手动改变质量的参数实验，不表示恒星会立即自然爆炸。';
        }
        sbCheckCompactCollapse(b);
        sbSyncInspector();
      });
      sb$('sb-ed-temp').oninput = e => { if (!sb.selected) return; sb.selected.temp = +e.target.value; sb.selected.manualTempLock = 8.0; sbSyncInspector(); };
      sb$('sb-ed-water').oninput = e => { if (!sb.selected) return; sb.selected.water = +e.target.value; sbSyncInspector(); };
      sb$('sb-ed-atmo').oninput = e => { if (!sb.selected) return; sb.selected.atmo = +e.target.value; sbSyncInspector(); };
      sb$('sb-ed-radius').oninput = e => {
        if (!sb.selected) return;
        const sc = +e.target.value; sb.selected.radius = sb.selected.baseRadius * sc;
        sb.selected.mesh.scale.setScalar(sc); sbSyncInspector();
      };

      document.querySelectorAll('[data-sb-tf]').forEach(btn => btn.onclick = () => {
        const b = sb.selected; if (!b) return;
        const m = btn.dataset.sbTf;
        if (m === 'ring') { sbAttachRing(b.grp, b); sbToast(`🪐 已为 ${b.name} 生成壮丽行星环！`); return; }
        if (!['planet','gas','star','wd','ns'].includes(b.kind)) { sbToast('该天体没有可改造的实体表面。'); return; }
        b.manualTempLock = 10.0;
        if (b.kind === 'star' || b.kind === 'wd' || b.kind === 'ns') {
          if (m === 'snowball' || m === 'ocean') { b.temp = 3100; b.color = [1.0, 0.36, 0.16]; }
          else if (m === 'lava' || m === 'venus') { b.temp = 26000; b.color = [0.55, 0.84, 1.0]; }
          else { b.temp = 5778; b.color = [1.0, 0.82, 0.36]; }
          sbSyncInspector();
          sbToast(`⭐ 已将恒星 ${b.name} 的表面温度调整为 ${b.temp} °C！`);
          return;
        }
        if (b.mat?.uniforms?.uIsGas && m !== 'lava' && m !== 'venus') {
          b.kind = 'planet'; b.mat.uniforms.uIsGas.value = 0.0;
        }
        if (m === 'earth') { b.temp = 18; b.water = 72; b.atmo = 1.1; b.color = [0.22, 0.54, 0.26]; sbUnlockAch('cradle'); }
        else if (m === 'snowball') { b.temp = -95; b.water = 92; b.atmo = 0.5; b.color = [0.75, 0.88, 0.98]; }
        else if (m === 'lava') { b.temp = 1380; b.water = 0; b.atmo = 0.6; b.color = [0.35, 0.16, 0.12]; }
        else if (m === 'ocean') { b.temp = 24; b.water = 98; b.atmo = 1.3; b.color = [0.10, 0.46, 0.82]; }
        else if (m === 'venus') { b.temp = 470; b.water = 0; b.atmo = 4.6; b.color = [0.88, 0.72, 0.38]; }
        sbSyncInspector();
        sbToast(`🧪 已将 ${b.name} 改造为「${btn.textContent}」！`);
      });

      window.addEventListener('resize', () => {
        if (!sb.open || !sb.renderer) return;
        const w = wrap.clientWidth, h = wrap.clientHeight;
        if (w > 10 && h > 10) { sb.camera.aspect = w / h; sb.camera.updateProjectionMatrix(); sb.renderer.setSize(w, h); }
      });

      sbLoadPreset('solar');
      sb.inited = true;
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
      try { sbInit(); } catch {
        sb.inited=false;sb.controls?.dispose();sb.renderer?.dispose();sb.renderer?.domElement.remove();
        if(sb.scene)disposeTree(sb.scene);sb.bodies=[];sb.scene=null;
        closeSandbox2();showToast('无法启动沙盘 3D 渲染，请使用支持 WebGL 的浏览器。','amber');return;
      }
      const wrap = sb$('sb-canvas-wrap');
      sb.camera.aspect = Math.max(1, wrap.clientWidth) / Math.max(1, wrap.clientHeight);
      sb.camera.updateProjectionMatrix();
      sb.renderer.setSize(wrap.clientWidth, wrap.clientHeight);

      if (importObj) {
        sb.customTemplate=sbImportTemplate(importObj);
        sb.spawnId = '__custom__';
        sbSwitchLeftTab('spawn');
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
      sbCancelInteraction();
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
