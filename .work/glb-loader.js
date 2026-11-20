    // =========================================================================
    // 零依赖标准 glTF 2.0 (.glb) 高模加载器 + 3点棚拍 PBR 雕刻着色器 + 动态蒙皮管体
    // =========================================================================
    const GLB_CACHE = new Map();
    const GLB_LOADING = new Map();
    const GLB_MODEL_NAMES = [
      'worm_head', 'worm_segment', 'zerg_leviathan', 'zerg_mutalisk',
      'occ_ring', 'occ_tentacles', 'fleet_flagship', 'fleet_escort',
      'redfish', 'snake_head', 'dragon_head',
      'phoenix_body', 'phoenix_wing_l', 'phoenix_wing_r',
      'kraken_head', 'titan_body', 'titan_sword'
    ];

    function makeStudioSculptShader(cfg) {
      const base = cfg.base || [0.8, 0.8, 0.8, 1.0];
      const emi = cfg.emissive || [0, 0, 0];
      const metal = cfg.metallic ?? 0.3;
      const rough = cfg.roughness ?? 0.45;
      const isBlend = cfg.alphaMode === 'BLEND' || base[3] < 0.99;
      return new THREE.ShaderMaterial({
        uniforms: {
          uBase: { value: new THREE.Color(base[0], base[1], base[2]) },
          uAlpha: { value: base[3] ?? 1.0 },
          uEmissive: { value: new THREE.Color(emi[0], emi[1], emi[2]) },
          uMetal: { value: metal },
          uRough: { value: rough },
          uTime: { value: 0 }
        },
        vertexShader: `
          attribute vec3 color;
          varying vec3 vN, vV, vCol, vPos;
          void main() {
            vCol = color;
            vPos = position;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying vec3 vN, vV, vCol, vPos;
          uniform vec3 uBase, uEmissive;
          uniform float uAlpha, uMetal, uRough, uTime;
          void main() {
            vec3 N = normalize(vN);
            if (!gl_FrontFacing) N = -N;
            vec3 V = normalize(vV);
            vec3 Lkey = normalize(vec3(0.58, 0.72, 0.62));
            vec3 Lfill = normalize(vec3(-0.72, -0.25, 0.45));
            vec3 Lrim = normalize(vec3(-0.25, 0.65, -0.78));
            vec3 albedo = uBase * vCol;
            float diffKey = max(0.0, dot(N, Lkey));
            float diffFill = max(0.0, dot(N, Lfill));
            float diffRim = max(0.0, dot(N, Lrim));
            vec3 Hkey = normalize(Lkey + V);
            float shininess = mix(96.0, 14.0, clamp(uRough, 0.05, 1.0));
            float spec = pow(max(0.0, dot(N, Hkey)), shininess) * mix(0.28, 0.78, uMetal);
            float fres = pow(1.0 - max(0.0, dot(N, V)), 3.2);
            vec3 specCol = mix(vec3(0.92, 0.96, 1.0), albedo * 1.35, uMetal);
            // 严格控制基础表面漫反射/高光在 Bloom 阈值以下，避免泛白糊成一团；让每片鳞甲、炮塔、骨肋清晰锐利！
            vec3 lit = albedo * (0.10 + diffKey * 0.44 + diffFill * 0.12)
                     + specCol * spec * 0.36
                     + mix(albedo, vec3(0.55, 0.78, 1.0), 0.35) * (fres * 0.24 + diffRim * 0.12);
            lit = min(lit, vec3(0.54));
            float emiMag = length(uEmissive);
            float pulse = 0.92 + 0.08 * sin(uTime * 4.5 + length(vPos) * 2.5);
            // 仅对高自发光材质（引擎喷口/虫族绿孢囊/熔岩喉咙/反应堆/符文剑刃）放行进入辉光管线
            vec3 glowOut = (emiMag > 0.48) ? (uEmissive * 0.92 * pulse) : (uEmissive * 0.26);
            vec3 finalCol = lit + glowOut;
            gl_FragColor = vec4(finalCol, uAlpha);
          }
        `,
        side: cfg.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
        transparent: isBlend,
        depthWrite: !isBlend
      });
    }

    function parseGLB(buffer) {
      const dv = new DataView(buffer);
      if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('Invalid GLB header');
      const jsonLen = dv.getUint32(12, true);
      const jsonStr = new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLen));
      const gltf = JSON.parse(jsonStr);
      const binOff = 20 + jsonLen + 8;
      const compCtor = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
      const typeSize = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

      function readAccessor(idx) {
        const acc = gltf.accessors[idx];
        const bv = gltf.bufferViews[acc.bufferView];
        const Ctor = compCtor[acc.componentType];
        const itemLen = typeSize[acc.type];
        const byteOff = binOff + (bv.byteOffset || 0) + (acc.byteOffset || 0);
        return { arr: new Ctor(buffer, byteOff, acc.count * itemLen), itemLen };
      }

      const mats = (gltf.materials || []).map(m => {
        const pbr = m.pbrMetallicRoughness || {};
        return makeStudioSculptShader({
          base: pbr.baseColorFactor || [0.8, 0.8, 0.8, 1],
          emissive: m.emissiveFactor || [0, 0, 0],
          metallic: pbr.metallicFactor ?? 0.3,
          roughness: pbr.roughnessFactor ?? 0.45,
          doubleSided: !!m.doubleSided,
          alphaMode: m.alphaMode || 'OPAQUE'
        });
      });

      const template = new THREE.Group();
      for (const meshDef of (gltf.meshes || [])) {
        for (const prim of (meshDef.primitives || [])) {
          const geo = new THREE.BufferGeometry();
          const pos = readAccessor(prim.attributes.POSITION);
          geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos.arr), 3));
          if (prim.attributes.NORMAL !== undefined) {
            const nrm = readAccessor(prim.attributes.NORMAL);
            geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nrm.arr), 3));
          } else geo.computeVertexNormals();
          if (prim.attributes.COLOR_0 !== undefined) {
            const col = readAccessor(prim.attributes.COLOR_0);
            geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col.arr), col.itemLen));
          } else {
            const ones = new Float32Array(pos.arr.length).fill(1);
            geo.setAttribute('color', new THREE.BufferAttribute(ones, 3));
          }
          if (prim.indices !== undefined) {
            const idx = readAccessor(prim.indices);
            geo.setIndex(new THREE.BufferAttribute(new Uint32Array(idx.arr), 1));
          }
          const mat = mats[prim.material] || makeStudioSculptShader({});
          const mesh = new THREE.Mesh(geo, mat);
          mesh.userData.sharedGLB = true;
          template.add(mesh);
        }
      }
      return template;
    }

    async function loadGLBModel(name) {
      if (GLB_CACHE.has(name)) return GLB_CACHE.get(name);
      if (GLB_LOADING.has(name)) return GLB_LOADING.get(name);
      const p = fetch(`/models/${name}.glb`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); })
        .then(buf => { const grp = parseGLB(buf); GLB_CACHE.set(name, grp); return grp; })
        .catch(() => null);
      GLB_LOADING.set(name, p);
      return p;
    }

    function preloadMonsterModels() {
      GLB_MODEL_NAMES.forEach(n => loadGLBModel(n));
    }

    function instantiateGLB(name, scale = 1, fallbackFn = null) {
      const wrapper = new THREE.Group();
      const applyTemplate = (tpl) => {
        if (!tpl) { if (fallbackFn) wrapper.add(fallbackFn()); return; }
        tpl.children.forEach(ch => {
          const m = new THREE.Mesh(ch.geometry, ch.material);
          m.userData.sharedGLB = true;
          wrapper.add(m);
        });
      };
      if (GLB_CACHE.has(name)) applyTemplate(GLB_CACHE.get(name));
      else {
        loadGLBModel(name).then(tpl => {
          if (wrapper.parent) applyTemplate(tpl);
        });
      }
      wrapper.scale.setScalar(scale);
      return wrapper;
    }

    // 连续高模动态蒙皮管体（彻底取代“一串圆球”，用于宇宙吞世巨蛇、太古星穹神龙与虚空章鱼10条吸盘巨触）
    function createDynamicTube(nStations, nRing, mat, radiiFn, colorFn) {
      const vCount = nStations * nRing;
      const positions = new Float32Array(vCount * 3);
      const normals = new Float32Array(vCount * 3);
      const colors = new Float32Array(vCount * 3);
      const indices = [];
      for (let i = 0; i < nStations; i++) {
        const u = i / Math.max(1, nStations - 1);
        for (let j = 0; j < nRing; j++) {
          const th = (j / nRing) * Math.PI * 2;
          const col = colorFn ? colorFn(u, th) : [1, 1, 1];
          const k = (i * nRing + j) * 3;
          colors[k] = col[0]; colors[k + 1] = col[1]; colors[k + 2] = col[2];
        }
      }
      for (let i = 0; i < nStations - 1; i++) {
        for (let j = 0; j < nRing; j++) {
          const jn = (j + 1) % nRing;
          const a = i * nRing + j, b = (i + 1) * nRing + j, c = (i + 1) * nRing + jn, d = i * nRing + jn;
          indices.push(a, b, c, a, c, d);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setIndex(indices);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;

      const tan = new THREE.Vector3(), nPrev = new THREE.Vector3(), nCur = new THREE.Vector3(), bCur = new THREE.Vector3();
      const tmp = new THREE.Vector3(), axis = new THREE.Vector3();
      const prevTan = new THREE.Vector3();

      function update(spinePts, extraTwist = 0) {
        const posAttr = geo.attributes.position, nrmAttr = geo.attributes.normal;
        for (let i = 0; i < nStations; i++) {
          const p = spinePts[i];
          if (i === 0) tan.subVectors(spinePts[1], spinePts[0]);
          else if (i === nStations - 1) tan.subVectors(spinePts[i], spinePts[i - 1]);
          else tan.subVectors(spinePts[i + 1], spinePts[i - 1]);
          if (tan.lengthSq() < 1e-10) tan.set(0, 0, 1); else tan.normalize();

          if (i === 0) {
            tmp.set(Math.abs(tan.y) < 0.9 ? 0 : 1, Math.abs(tan.y) < 0.9 ? 1 : 0, 0);
            nCur.crossVectors(tan, tmp).normalize();
          } else {
            axis.crossVectors(prevTan, tan);
            const s = axis.length();
            if (s < 1e-6) nCur.copy(nPrev);
            else {
              axis.divideScalar(s);
              const ang = Math.acos(THREE.MathUtils.clamp(prevTan.dot(tan), -1, 1));
              nCur.copy(nPrev).applyAxisAngle(axis, ang).normalize();
            }
          }
          prevTan.copy(tan); nPrev.copy(nCur);
          bCur.crossVectors(tan, nCur).normalize();
          const u = i / Math.max(1, nStations - 1);
          const rad = radiiFn(u);
          for (let j = 0; j < nRing; j++) {
            const th = (j / nRing) * Math.PI * 2 + extraTwist * u;
            const cs = Math.cos(th), sn = Math.sin(th);
            const nx = nCur.x * cs + bCur.x * sn;
            const ny = nCur.y * cs + bCur.y * sn;
            const nz = nCur.z * cs + bCur.z * sn;
            const idx = i * nRing + j;
            posAttr.setXYZ(idx, p.x + nx * rad, p.y + ny * rad, p.z + nz * rad);
            nrmAttr.setXYZ(idx, nx, ny, nz);
          }
        }
        posAttr.needsUpdate = true;
        nrmAttr.needsUpdate = true;
      }
      return { mesh, update };
    }
