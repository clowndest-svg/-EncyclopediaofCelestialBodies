    // =========================================================================
    // 高精度 3D 地球地貌（真实 3D 凹凸起伏 + 多元地质 + 动态流动海洋/河流/湖泊 + 极光）
    // 与地月系精准地标定位系统
    // =========================================================================
    const EARTH_HD_VERT = `
      uniform sampler2D uEarthMap;
      uniform float uUseTex;
      uniform float uTime;
      uniform vec3 uImpactPoints[16];
      uniform float uImpactRadii[16];
      varying vec3 vNormalWorld;
      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      varying float vElev;
      varying float vOcean;
      ${GLSL_NOISE}
      float ridgeNoise(vec3 p) {
        float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);
        return n * n;
      }
      float beltMask(float lat, float lon, float cLat, float cLon, float rLat, float rLon) {
        float dLat = (lat - cLat) / rLat;
        float dLon = mod(lon - cLon + 540.0, 360.0) - 180.0;
        dLon /= rLon;
        return exp(-(dLat * dLat + dLon * dLon));
      }
      void main() {
        vUv = uv;
        vec3 p = normalize(position);
        vLocalPos = p;
        vec3 tex = texture2D(uEarthMap, uv).rgb;
        float lum = dot(tex, vec3(0.299, 0.587, 0.114));
        float isOcean = (uUseTex > 0.5)
          ? smoothstep(0.02, 0.12, (tex.b - max(tex.r * 1.25, tex.g * 1.02))) * (1.0 - smoothstep(0.22, 0.36, tex.r))
          : (1.0 - smoothstep(0.49, 0.53, fbm(p * 2.6 + vec3(1.4, -0.5, 2.1))));
        vOcean = isOcean;
        float lat = asin(clamp(p.y, -1.0, 1.0)) * 57.29578;
        float lon = (uv.x - 0.5) * 360.0;
        float mtnBelt =
          beltMask(lat, lon, 31.0, 86.0, 7.5, 16.0) * 1.35 +   // 喜马拉雅与青藏高原
          beltMask(lat, lon, -18.0, -70.0, 26.0, 5.5) * 1.05 + // 安第斯山脉
          beltMask(lat, lon, 45.0, -114.0, 14.0, 8.0) * 0.85 + // 落基山脉
          beltMask(lat, lon, 46.5, 10.5, 3.2, 6.5) * 0.85 +    // 阿尔卑斯山脉
          beltMask(lat, lon, 2.0, 36.0, 14.0, 6.5) * 0.65;     // 东非高原与裂谷
        float r1 = ridgeNoise(p * 14.0 + vec3(2.1, -1.3, 0.7));
        float r2 = ridgeNoise(p * 30.0 - vec3(1.4, 2.7, -0.9));
        float landElev = (1.0 - isOcean) * (0.009 + lum * 0.016 + mtnBelt * (0.024 + r1 * 0.028 + r2 * 0.012) + r1 * 0.010);
        // Solar Smash 风格 3D 实时几何挖空与隆起撞击坑缘！
        float carveDisp = 0.0;
        for (int i = 0; i < 16; i++) {
          float rad = uImpactRadii[i];
          if (rad > 0.001) {
            float d = acos(clamp(dot(p, normalize(uImpactPoints[i])), -1.0, 1.0));
            float jag = rad * (0.86 + 0.28 * r1);
            if (d < jag * 1.48) {
              float bowl = smoothstep(jag * 1.04, jag * 0.12, d);
              float rimBump = smoothstep(jag * 1.45, jag * 1.08, d) * smoothstep(jag * 0.78, jag * 1.08, d);
              carveDisp -= bowl * min(0.24, rad * 0.62);
              carveDisp += rimBump * min(0.045, rad * 0.14);
            }
          }
        }
        vElev = landElev;
        vec3 displaced = position + normal * (length(position) * (landElev + carveDisp));
        vec4 wp = modelMatrix * vec4(displaced, 1.0);
        vWorldPos = wp.xyz;
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `;

    const EARTH_HD_FRAG = `
      precision highp float;
      uniform int uPlanetType;
      uniform float uTime;
      uniform vec3 uSunPos;
      uniform float uDamage;
      uniform float uHeatGlow;
      uniform float uSunGlare;
      uniform sampler2D uEarthMap;
      uniform float uUseTex;
      uniform vec3 uImpactPoints[16];
      uniform float uImpactRadii[16];
      uniform float uImpactHeat[16];

      varying vec3 vNormalWorld;
      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      varying float vElev;
      varying float vOcean;

      ${GLSL_NOISE}

      float ridge(vec3 p) {
        float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);
        return n * n;
      }
      float belt(float lat, float lon, float cLat, float cLon, float rLat, float rLon) {
        float dLat = (lat - cLat) / rLat;
        float dLon = mod(lon - cLon + 540.0, 360.0) - 180.0;
        dLon /= rLon;
        return exp(-(dLat * dLat + dLon * dLon));
      }
      float terrainHeight(vec3 p, float landMask, float mtnMask, float aridMask) {
        float macro = fbm(p * 7.5 + vec3(1.2, -0.7, 2.4));
        float r1 = ridge(p * 18.0 + vec3(3.1, -1.7, 0.9));
        float r2 = ridge(p * 42.0 - vec3(1.2, 4.3, 2.1));
        float dunes = sin(p.x * 130.0 + vnoise(p * 16.0) * 8.0) * 0.5 + 0.5;
        return landMask * (macro * 0.25 + (r1 * 0.6 + r2 * 0.35) * (0.28 + mtnMask * 1.65) + aridMask * dunes * 0.14);
      }

      void main() {
        vec3 p = normalize(vLocalPos);
        vec3 N = normalize(vNormalWorld);
        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 L = normalize(uSunPos - vWorldPos);

        vec3 tex = texture2D(uEarthMap, vUv).rgb;
        float lum = dot(tex, vec3(0.299, 0.587, 0.114));
        float lat = asin(clamp(p.y, -1.0, 1.0)) * 57.29578;
        float lon = (vUv.x - 0.5) * 360.0;

        float isOcean = (uUseTex > 0.5)
          ? smoothstep(0.015, 0.10, (tex.b - max(tex.r * 1.24, tex.g * 1.01))) * (1.0 - smoothstep(0.21, 0.34, tex.r))
          : vOcean;
        float landMask = 1.0 - isOcean;
        float polarIce = smoothstep(69.0, 81.0, abs(lat) + (vnoise(p * 9.0) - 0.5) * 8.0);
        float greenland = belt(lat, lon, 72.0, -42.0, 11.0, 16.0);
        float iceMask = clamp(max(polarIce, greenland * landMask * 0.95), 0.0, 1.0);

        float himalaya = belt(lat, lon, 30.5, 86.5, 7.0, 15.0);
        float andes = belt(lat, lon, -18.0, -70.0, 25.0, 5.2);
        float rockies = belt(lat, lon, 45.0, -114.0, 13.0, 8.0);
        float alps = belt(lat, lon, 46.5, 10.5, 3.0, 6.0);
        float mtnMask = clamp(himalaya * 1.35 + andes + rockies * 0.8 + alps * 0.85, 0.0, 1.6);

        float aridMask = landMask * smoothstep(0.04, 0.20, tex.r - tex.b) * smoothstep(0.26, 0.48, tex.r) * (1.0 - iceMask);
        float lushMask = landMask * smoothstep(0.01, 0.12, tex.g - tex.b * 0.95) * (1.0 - aridMask) * (1.0 - iceMask);

        // 构建局部切空间用于精细凹凸法线扰动
        vec3 up = abs(N.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 T = normalize(cross(up, N));
        vec3 B = cross(N, T);
        float eps = 0.0038;

        vec3 col = tex;
        float spec = 0.0;
        vec3 emissive = vec3(0.0);
        vec3 Np = N;

        if (isOcean > 0.5) {
          // 海洋：多层动态海浪、洋流条纹与浅海珊瑚礁
          float coastProbe = 0.0;
          coastProbe += texture2D(uEarthMap, vUv + vec2(0.004, 0.0)).r;
          coastProbe += texture2D(uEarthMap, vUv - vec2(0.004, 0.0)).r;
          coastProbe += texture2D(uEarthMap, vUv + vec2(0.0, 0.004)).r;
          coastProbe += texture2D(uEarthMap, vUv - vec2(0.0, 0.004)).r;
          float coastal = smoothstep(0.32, 0.85, coastProbe);

          // 动态流动洋流 + 细密海浪波纹
          float gyreDir = sign(lat + 0.01) * (abs(lat) < 30.0 ? -1.0 : 1.0);
          vec3 flowCoord = p * 18.0 + vec3(uTime * 0.28 * gyreDir, uTime * 0.08, -uTime * 0.22 * gyreDir);
          float swell = fbm(flowCoord * 0.55);
          float w1 = sin(p.x * 95.0 + p.z * 75.0 - uTime * 2.6 + swell * 5.0);
          float w2 = cos(p.y * 110.0 - p.x * 85.0 + uTime * 2.1 + swell * 4.0);
          float waveH = (w1 * 0.5 + w2 * 0.5) * 0.5 + 0.5;
          float currentStream = smoothstep(0.68, 0.94, vnoise(p * 11.0 + vec3(uTime * 0.22 * gyreDir, 0.0, uTime * 0.14))) *
                                smoothstep(0.56, 0.88, sin(p.y * 42.0 + swell * 6.5 - uTime * 1.4) * 0.5 + 0.5);

          vec3 deepSea = mix(vec3(0.018, 0.095, 0.27), tex * vec3(0.75, 1.05, 1.35), 0.55);
          vec3 shelfSea = vec3(0.04, 0.48, 0.64);
          col = mix(deepSea, shelfSea, clamp(coastal * 0.78 + smoothstep(0.16, 0.34, tex.g) * 0.35, 0.0, 1.0));
          col += vec3(0.10, 0.42, 0.58) * currentStream * 0.42;
          // 海岸浪花
          float foam = smoothstep(0.72, 0.92, coastal) * smoothstep(0.45, 0.85, waveH);
          col = mix(col, vec3(0.86, 0.96, 1.0), foam * 0.45);

          Np = normalize(N + T * (w1 * 0.085) + B * (w2 * 0.085));
          float NdotL0 = max(dot(Np, L), 0.0);
          vec3 H = normalize(L + V);
          spec = pow(max(dot(Np, H), 0.0), 56.0) * (0.78 + 0.35 * waveH) * smoothstep(0.0, 0.25, NdotL0);
        } else {
          // 陆地：精细地质地貌（高山岩壁、雪峰冰川、风蚀沙丘、雨林、动态流动河流与内陆湖泊）
          float h0 = terrainHeight(p, landMask, mtnMask, aridMask);
          float bumpScale = 0.28 + mtnMask * 1.65;
          float bumpBase = ridge(p * 18.0 + vec3(3.1, -1.7, 0.9)) * bumpScale;
          float hT = ridge(normalize(p + T * eps) * 18.0 + vec3(3.1, -1.7, 0.9)) * bumpScale;
          float hB = ridge(normalize(p + B * eps) * 18.0 + vec3(3.1, -1.7, 0.9)) * bumpScale;
          float bumpStrength = 2.6 + mtnMask * 2.2 + aridMask * 0.9;
          Np = normalize(N + T * ((bumpBase - hT) * bumpStrength) + B * ((bumpBase - hB) * bumpStrength));

          float rDetail = ridge(p * 34.0 + vec3(1.7));
          float strata = sin(h0 * 48.0 + vnoise(p * 26.0) * 3.0) * 0.5 + 0.5;
          // 增强真实地质色阶
          vec3 baseLand = mix(tex * 1.15, vec3(0.10, 0.34, 0.14), lushMask * 0.28);
          vec3 granite = mix(vec3(0.32, 0.29, 0.27), vec3(0.56, 0.50, 0.44), strata);
          vec3 sandDune = mix(vec3(0.72, 0.54, 0.30), vec3(0.88, 0.72, 0.46), sin(p.x * 145.0 + vnoise(p * 18.0) * 6.0) * 0.5 + 0.5);
          vec3 glacierSnow = vec3(0.74, 0.80, 0.87);

          col = mix(baseLand, sandDune, aridMask * 0.46);
          float rockMask = smoothstep(0.32, 0.68, h0) * (0.45 + mtnMask * 0.55);
          col = mix(col, granite, clamp(rockMask * 0.82, 0.0, 0.88));
          float snowLine = smoothstep(0.68, 0.94, h0 + mtnMask * 0.16 + rDetail * 0.14);
          col = mix(col, glacierSnow, clamp(snowLine * (0.55 + mtnMask * 0.30), 0.0, 0.82));

          // 动态流动河流与内陆湖泊（亚马逊河、雅鲁藏布/长江、尼罗河、密西西比、内陆淡水湖）
          float amazonZone = belt(lat, lon, -4.0, -61.0, 12.0, 16.0);
          float asiaRivers = belt(lat, lon, 27.0, 96.0, 11.0, 18.0);
          float nileZone = belt(lat, lon, 16.0, 31.5, 16.0, 3.2);
          float riverZone = clamp(lushMask * 0.95 + amazonZone * 1.4 + asiaRivers * 1.15 + nileZone * 1.25, 0.0, 1.5);

          vec3 warp = vec3(vnoise(p * 7.0), vnoise(p * 7.0 + 4.2), vnoise(p * 7.0 - 3.1)) * 0.22;
          float riverNoise = abs(fbm(p * 12.5 + warp) - 0.5);
          float riverWidth = 0.011 + amazonZone * 0.014 + nileZone * 0.010;
          float riverMask = (1.0 - smoothstep(riverWidth * 0.45, riverWidth, riverNoise)) * smoothstep(0.15, 0.65, riverZone) * (1.0 - snowLine * 0.8) * (1.0 - iceMask);

          float lakeNoise = vnoise(p * 16.0 - vec3(2.8, 1.1, 4.5));
          float lakeMask = smoothstep(0.755, 0.785, lakeNoise) * smoothstep(0.25, 0.7, lushMask + asiaRivers * 0.8) * (1.0 - mtnMask * 0.5) * (1.0 - iceMask);
          float freshWater = clamp(max(riverMask, lakeMask), 0.0, 1.0);

          if (freshWater > 0.02) {
            // 沿河道与湖面可见的动态水流波光
            float flowRipple = sin((p.x + p.z - p.y) * 140.0 - uTime * 4.5 + vnoise(p * 24.0) * 6.0) * 0.5 + 0.5;
            vec3 waterCol = mix(vec3(0.05, 0.46, 0.68), vec3(0.28, 0.82, 0.94), flowRipple * 0.65 + riverMask * 0.25);
            col = mix(col, waterCol, freshWater * 0.92);
            Np = normalize(mix(Np, normalize(N + T * (flowRipple - 0.5) * 0.14), freshWater));
            vec3 H = normalize(L + V);
            spec = max(spec, pow(max(dot(Np, H), 0.0), 48.0) * freshWater * (0.85 + flowRipple * 0.45));
          }
        }

        // 极地冰盖细节（冰川裂隙微起伏）
        if (iceMask > 0.05) {
          float iceCrack = ridge(p * 24.0);
          vec3 polarCol = mix(vec3(0.80, 0.91, 0.98), vec3(0.96, 0.99, 1.0), iceCrack);
          col = mix(col, polarCol, iceMask);
        }

        float NdotL = dot(Np, L);
        float diffuse = max(NdotL, 0.0);
        float ambient = 0.22;

        // 夜面城市灯火
        float nightMask = smoothstep(0.08, -0.22, dot(N, L));
        float cityNoise = vnoise(p * 42.0) * vnoise(p * 19.0);
        float city = smoothstep(0.42, 0.72, cityNoise) * landMask * (1.0 - iceMask) * (1.0 - aridMask * 0.7) * (1.0 - smoothstep(0.03, 0.06, vElev));
        emissive += vec3(1.0, 0.74, 0.34) * city * nightMask * 0.95 * (1.0 - uDamage * 0.85);

        // 瑞利大气边缘光
        float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
        emissive += vec3(0.18, 0.60, 1.0) * rim * (0.30 + 0.58 * diffuse);

        // 16 槽位 Solar Smash 级 3D 凿穿挖空 + 焦黑裂缘 + 炽热熔岩裂谷
        float craterEmissive = 0.0;
        float jagBase = vnoise(p * 14.0);
        float crackNoise = vnoise(p * 28.0) * 0.65 + vnoise(p * 56.0) * 0.35;
        float rayNoise = vnoise(p * 11.0);
        for (int i = 0; i < 16; i++) {
          float rad = uImpactRadii[i];
          if (rad > 0.001) {
            vec3 cDir = normalize(uImpactPoints[i]);
            float d = acos(clamp(dot(p, cDir), -1.0, 1.0));
            float jagRad = rad * (0.78 + 0.44 * jagBase);
            // 重击/大坑直接穿透地壳挖出参差不齐的立体缺口，露出星球内部的炽热地幔与白热内核！
            if (rad > 0.13 && d < jagRad * 0.68) discard;
            if (d < rad * 2.55) {
              float core = smoothstep(jagRad * 1.15, jagRad * 0.55, d);
              float lipHot = (rad > 0.13) ? smoothstep(jagRad * 0.92, jagRad * 0.68, d) * 1.85 : 0.0;
              float rimC = smoothstep(jagRad * 1.72, jagRad * 1.02, d) * smoothstep(jagRad * 0.68, jagRad * 1.02, d);
              float rays = smoothstep(0.54, 0.78, rayNoise) * smoothstep(rad * 2.45, rad * 0.92, d) * 0.45;
              col = mix(col, vec3(0.05, 0.04, 0.045), clamp(core * 0.95 + rimC * 0.72 + rays, 0.0, 1.0));
              col += vec3(0.32, 0.24, 0.18) * rimC * 0.55;
              float lava = (core * 1.05 + lipHot + smoothstep(0.42, 0.70, crackNoise) * smoothstep(rad * 2.05, rad * 0.25, d) * 0.95) * uImpactHeat[i];
              craterEmissive += lava;
            }
          }
        }
        if (!gl_FrontFacing) {
          // 缺口内侧呈现炽热熔岩地壳断面
          gl_FragColor = vec4(vec3(1.0, 0.36, 0.06) * (0.9 + 0.5 * fbm(p * 18.0 + uTime * 0.3)), 1.0);
          return;
        }
        if (uDamage > 0.08) {
          float gCrack = smoothstep(0.54, 0.72, fbm(p * 12.0 + vec3(uTime * 0.03)));
          col = mix(col, vec3(0.14, 0.09, 0.08), uDamage * 0.62);
          craterEmissive += gCrack * pow(uDamage, 1.35) * 1.65;
        }
        if (craterEmissive > 0.01) {
          vec3 lavaCol = mix(vec3(1.0, 0.20, 0.02), vec3(1.0, 0.92, 0.52), clamp(craterEmissive * 0.65, 0.0, 1.0));
          emissive += lavaCol * min(craterEmissive * 1.95, 3.2);
        }
        if (uHeatGlow > 0.01) {
          float crack = smoothstep(0.45, 0.72, fbm(p * 14.0 + uTime * 0.15));
          emissive += vec3(1.0, 0.36, 0.05) * crack * uHeatGlow * 2.2;
        }

        vec3 finalCol = col * (ambient + diffuse * 1.08) + vec3(spec) + emissive;
        gl_FragColor = vec4(finalCol, 1.0);
      }
    `;

    let earthTextureShared = null;
    let l0AuroraGroup = null;
    let earthLandmarkPin = null;
    let l0bRiverStream = null;

    function getSharedEarthTexture() {
      if (earthTextureShared) return earthTextureShared;
      const data = typeof BOOK_TEXTURES !== 'undefined' && BOOK_TEXTURES['earth_blue_marble.jpg'];
      if (!data) return null;
      const tex = new THREE.TextureLoader().load(data, () => {
        if (l0Earth?.uniforms?.uUseTex) l0Earth.uniforms.uUseTex.value = 1;
        if (l1Earth?.uniforms?.uUseTex) l1Earth.uniforms.uUseTex.value = 1;
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      earthTextureShared = tex;
      return tex;
    }

    function latLonToSphereLocal(lat, lon) {
      // 与 Three.js SphereGeometry 的等距柱状投影 UV 完全对齐：u = 0.5 + lon/360, v = 0.5 + lat/180
      const phi = THREE.MathUtils.degToRad(lon + 180);
      const theta = THREE.MathUtils.degToRad(90 - lat);
      return new THREE.Vector3(
        -Math.cos(phi) * Math.sin(theta),
        Math.cos(theta),
        Math.sin(phi) * Math.sin(theta)
      ).normalize();
    }

    function addPolarAuroras(body) {
      const grp = new THREE.Group();
      const auroraMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uVfx: { value: 1.0 } },
        vertexShader: `
          varying vec2 vUv;
          uniform float uTime;
          void main() {
            vUv = uv;
            vec3 p = position;
            float wave = sin(uv.x * 38.0 + uTime * 1.4) * 0.25 + cos(uv.x * 22.0 - uTime * 1.1) * 0.2;
            p.x += normalize(p.xz).x * wave;
            p.z += normalize(p.xz).y * wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uVfx;
          void main() {
            float curtain = pow(0.5 + 0.5 * sin(vUv.x * 50.0 + uTime * 1.8 + sin(vUv.x * 16.0 - uTime) * 2.0), 2.2);
            float vert = smoothstep(0.0, 0.28, vUv.y) * (1.0 - smoothstep(0.32, 1.0, vUv.y));
            vec3 green = vec3(0.15, 0.96, 0.62);
            vec3 cyan = vec3(0.22, 0.85, 1.0);
            vec3 violet = vec3(0.68, 0.35, 1.0);
            vec3 col = mix(mix(green, cyan, smoothstep(0.2, 0.6, vUv.y)), violet, smoothstep(0.55, 0.95, vUv.y));
            float a = min(1.0, curtain * vert * 0.72 * uVfx);
            if (a < 0.01) discard;
            gl_FragColor = vec4(col * (0.65 + 0.45 * uVfx), a);
          }
        `,
        transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
      });
      for (const sign of [1, -1]) {
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(body.radius * 0.46, body.radius * 0.42, body.radius * 0.24, 112, 1, true), auroraMat);
        ring.position.y = sign * body.radius * 0.905;
        if (sign < 0) ring.rotation.x = Math.PI;
        grp.add(ring);
      }
      grp.userData.mat = auroraMat;
      body.meshGroup.add(grp);
      l0AuroraGroup = grp;
    }

    function upgradeHighResEarth(body, highGeo = true) {
      if (!body) return;
      const tex = getSharedEarthTexture();
      body.uniforms.uEarthMap = { value: tex };
      body.uniforms.uUseTex = { value: tex ? 1 : 0 };
      if (highGeo) {
        const segW = document.body.dataset.layout === 'mobile' ? 128 : 192;
        const segH = document.body.dataset.layout === 'mobile' ? 96 : 128;
        body.mesh.geometry.dispose();
        body.mesh.geometry = new THREE.SphereGeometry(body.radius, segW, segH);
        if (body.cloudsMesh) {
          body.cloudsMesh.geometry.dispose();
          body.cloudsMesh.geometry = new THREE.SphereGeometry(body.radius * 1.058, 72, 48);
        }
        if (body.atmoMesh) {
          body.atmoMesh.geometry.dispose();
          body.atmoMesh.geometry = new THREE.SphereGeometry(body.radius * 1.115, 64, 48);
        }
      }
      body.mesh.material.dispose();
      body.mesh.material = new THREE.ShaderMaterial({
        vertexShader: EARTH_HD_VERT,
        fragmentShader: EARTH_HD_FRAG,
        uniforms: body.uniforms,
        side: THREE.DoubleSide
      });
      if (highGeo && body.scaleKey === 'L0') addPolarAuroras(body);
    }

    function showEarthLandmarkPin(localDir, label) {
      if (!l0Earth) return;
      if (earthLandmarkPin) { disposeTree(earthLandmarkPin); earthLandmarkPin = null; }
      const pin = new THREE.Group();
      const surfaceR = l0Earth.radius * 1.048;
      pin.position.copy(localDir).multiplyScalar(surfaceR);
      pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), localDir);
      const ring1 = new THREE.Mesh(
        new THREE.RingGeometry(0.45, 0.62, 48),
        new THREE.MeshBasicMaterial({ color: 0x38e8ff, side: THREE.DoubleSide, transparent: true, opacity: 0.92, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      ring1.rotation.x = -Math.PI / 2;
      const ring2 = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 1.02, 48),
        new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.68, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      ring2.rotation.x = -Math.PI / 2;
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.09, 2.1, 12, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      beam.position.y = 1.05;
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      tip.position.y = 2.12;
      pin.add(ring1, ring2, beam, tip);
      pin.userData = { ring2, label };
      l0Earth.mesh.add(pin);
      earthLandmarkPin = pin;
    }

    function focusEarthLandmarkHD(landmark) {
      if (state.currentScale !== 'L0') switchScale('L0');
      const coords = {
        himalayas: { lat: 28.6, lon: 86.9, label: '喜马拉雅山脉与青藏高原', detail: '3D 隆起雪峰山脊、冰川谷地与亚洲大河源头' },
        amazon:    { lat: -3.4, lon: -62.2, label: '亚马逊雨林流域', detail: '翠绿热带雨林冠层与动态流淌的亚马逊河水系' },
        pacific:   { lat: 14.0, lon: -158.0, label: '太平洋深海与洋流', detail: '动态起伏海浪、赤道洋流流纹与珊瑚岛链浅海' },
        sahara:    { lat: 23.4, lon: 13.0, label: '撒哈拉沙漠与尼罗河', detail: '风蚀沙丘波纹、岩质高原与流向地中海的尼罗河绿洲' },
        poles:     { lat: 76.5, lon: -24.0, label: '北极冰盖与极光椭圆带', detail: '极地冰原裂隙与高空舞动的绿紫极光帷幕' }
      }[landmark];
      if (!coords || !l0Earth) return;

      // 确保 L0 运动根与地球最新世界矩阵已同步（彻底修复此前定位到世界原点黑屏的 Bug）
      simulationRoot('L0').updateWorldMatrix(true, true);
      const worldCenter = l0Earth.mesh.getWorldPosition(new THREE.Vector3());
      const earthQuat = l0Earth.mesh.getWorldQuaternion(new THREE.Quaternion());
      const localDir = latLonToSphereLocal(coords.lat, coords.lon);
      const worldDir = localDir.clone().applyQuaternion(earthQuat).normalize();

      // 将 L0 光源微调至地标斜侧 38° 黄金光照角，让山脉凹凸阴影与河流海洋波光清晰立体
      const rootQuatInv = simulationRoot('L0').getWorldQuaternion(new THREE.Quaternion()).invert();
      const side = new THREE.Vector3(0, 1, 0).cross(worldDir);
      if (side.lengthSq() < 0.05) side.set(1, 0, 0);
      side.normalize();
      const litWorldDir = worldDir.clone().multiplyScalar(0.78).addScaledVector(side, 0.55).add(new THREE.Vector3(0, 0.28, 0)).normalize();
      motion.l0SunLocal = litWorldDir.applyQuaternion(rootQuatInv).multiplyScalar(180);
      const sunW = simulationToWorld(motion.l0SunLocal, 'L0');
      [l0Earth, l0Moon].forEach(b => {
        b.uniforms.uSunPos.value.copy(sunW);
        if (b.cloudsMesh) b.cloudsMesh.material.uniforms.uSunPos.value.copy(sunW);
        if (b.atmoMesh) b.atmoMesh.material.uniforms.uSunPos.value.copy(sunW);
      });

      showEarthLandmarkPin(localDir, coords.label);
      document.querySelectorAll('#landmark-buttons button').forEach(b => b.classList.toggle('active', b.dataset.landmark === landmark));
      lockToBody(l0Earth, false);
      state.lastTrackedWorldPos.copy(worldCenter);
      if (l0Earth.cloudsMesh) l0Earth.cloudsMesh.material.uniforms.uOpacity.value = Math.min(0.24, l0Earth.atmoPct / 100);

      // 计算精准近距立体观测机位（保证可见地球曲面地平线、3D山脉剪影、河流与海洋）
      const camOffset = worldDir.clone().multiplyScalar(25.2).addScaledVector(side, 3.4);
      const lookOffset = worldDir.clone().multiplyScalar(2.6);
      const targetCamPos = worldCenter.clone().add(camOffset);
      const targetLook = worldCenter.clone().add(lookOffset);

      // 若当前相机位于地球另一侧（直线插值会穿过地心导致内部画面），先沿地球外球面绕切到安全起始角
      const curRel = camera.position.clone().sub(worldCenter);
      if (curRel.length() < l0Earth.radius * 3.8 && curRel.normalize().dot(worldDir) < 0.25) {
        const arcStart = curRel.add(worldDir).normalize().multiplyScalar(28.5);
        camera.position.copy(worldCenter).add(arcStart);
      }
      startCamTransition(targetCamPos, targetLook);
      document.getElementById('scene-title').textContent = '地球地标 · ' + coords.label;
      document.getElementById('scene-subtitle').textContent = coords.detail + '（可拖动旋转或滚轮拉近细看凹凸与水流）';
      showToast(`已精准定位地球地标：${coords.label}`);
    }

    function enhanceL0BWaterFlow() {
      const g = scaleGroups.L0B;
      if (!g) return;
      // 沿蜿蜒河道注入 280 颗持续顺流而下的清澈水流波光粒子（瀑布 -> 峡谷河道 -> 入海口）
      const cnt = 280, pos = new Float32Array(cnt * 3), col = new Float32Array(cnt * 3), seeds = new Float32Array(cnt);
      const rng = deterministicRandom(773);
      for (let i = 0; i < cnt; i++) {
        seeds[i] = rng();
        new THREE.Color(i % 3 === 0 ? 0xe0f7ff : 0x38d9f5).toArray(col, i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const pts = glowPoints(geo, 0.85, 0.88);
      pts.frustumCulled = false;
      g.add(pts);
      l0bRiverStream = { pts, seeds, cnt };
    }

    function updateEarthHD(dt, elapsed) {
      if (l0AuroraGroup?.userData?.mat) l0AuroraGroup.userData.mat.uniforms.uTime.value = elapsed;
      if (earthLandmarkPin?.userData?.ring2) {
        const s = 1 + 0.35 * Math.sin(elapsed * 3.8);
        earthLandmarkPin.userData.ring2.scale.setScalar(s);
        earthLandmarkPin.userData.ring2.material.opacity = 0.72 - 0.35 * Math.sin(elapsed * 3.8);
      }
      if (state.currentScale === 'L0B' && l0bRiverStream) {
        const arr = l0bRiverStream.pts.geometry.attributes.position.array;
        for (let i = 0; i < l0bRiverStream.cnt; i++) {
          const u = (l0bRiverStream.seeds[i] + elapsed * 0.16) % 1;
          const z = -10.5 + u * 27.0;
          const cx = -4 + Math.sin(z * 0.16) * 4.5 + Math.sin(i * 19.3) * 1.15;
          const y = 0.42 + Math.sin(z * 0.8 - elapsed * 4.0) * 0.08 + (z < -7 ? (-7 - z) * 0.25 : 0);
          arr[i * 3] = cx;
          arr[i * 3 + 1] = y;
          arr[i * 3 + 2] = z;
        }
        l0bRiverStream.pts.geometry.attributes.position.needsUpdate = true;
      }
    }
