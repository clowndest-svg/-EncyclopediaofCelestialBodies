from pathlib import Path
import re
ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / '.work'
BASE_HTML = WORK / 'cosmic_atlas_3_0.original.html'
if not BASE_HTML.exists():
    BASE_HTML = ROOT / 'cosmic_atlas_3_0.original.html'
s = BASE_HTML.read_text(encoding='utf-8')
def replace(old, new):
    global s
    assert old in s, old[:100]
    s = s.replace(old, new, 1)
def section(start, end, value):
    global s
    a=s.index(start);b=s.index(end,a);s=s[:a]+value+'\n\n'+s[b:]
replace('initial-scale=1.0, maximum-scale=1.0, user-scalable=no','initial-scale=1.0, viewport-fit=cover')
replace('星海图鉴 3.0 | COSMIC ATLAS','星海图鉴 · 引力重制版 | COSMIC ATLAS')
replace('</style>', (WORK/'interface.css').read_text(encoding='utf-8')+'\n  </style>')
replace('<body>', '<body data-layout="desktop">\n<script>try{document.body.dataset.layout=localStorage.getItem("cosmic-layout")||(innerWidth<900?"mobile":"desktop");}catch{document.body.dataset.layout=innerWidth<900?"mobile":"desktop";}</script>')
replace('<header class="hud-layer', '<header id="observatory-header" class="hud-layer')
replace('class="glass-panel rounded-2xl px-3.5 py-2 flex items-center gap-3 pointer-events-auto"','class="brand-lockup glass-panel rounded-2xl px-3.5 py-2 flex items-center gap-3 pointer-events-auto"')
replace('class="text-[10px] font-mono-tech px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30">v3.0','class="brand-version text-[10px] font-mono-tech px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30">引力重制')
replace('class="flex items-center gap-2 text-[11px] text-slate-300/80 font-mono-tech mt-0.5"','class="scale-line flex items-center gap-2 text-[11px] text-slate-300/80 font-mono-tech mt-0.5"')
replace('class="glass-panel rounded-2xl px-2.5 py-1.5 flex items-center gap-1.5 pointer-events-auto"','class="header-tools glass-panel rounded-2xl px-2.5 py-1.5 flex items-center gap-1.5 pointer-events-auto"')
replace('      <button id="btn-audio"','      <div id="layout-switch" role="group" aria-label="页面布局"><button data-layout-mode="desktop" aria-pressed="true" title="电脑布局">电脑</button><button data-layout-mode="mobile" aria-pressed="false" title="手机布局">手机</button></div>\n      <button id="btn-audio"')
replace('<nav class="hud-layer','<nav id="scale-dock" aria-label="宇宙尺度选择" class="hud-layer')
replace('<div><span class="text-sky-300 font-mono-tech">H</span> 纯净录屏模式 · <span class="text-sky-300 font-mono-tech">S</span> 保存截图</div>', '<div><span class="text-sky-300 font-mono-tech">B</span> 打开星海百科 · <span class="text-sky-300 font-mono-tech">Ctrl+K</span> 百科搜索</div>\n          <div><span class="text-sky-300 font-mono-tech">H</span> 纯净录屏模式 · <span class="text-sky-300 font-mono-tech">S</span> 保存截图 · <span class="text-sky-300 font-mono-tech">Esc</span> 关闭面板</div>')
replace('    <!-- 顶部 3 标签 -->','    <button id="btn-close-right" class="right-close" aria-label="关闭控制实验室">关闭实验室 ✕</button>\n    <!-- 顶部 3 标签 -->')
replace('    <div id="right-tab-lab" class="flex-1 overflow-y-auto custom-scroll p-3.5 space-y-3">','    <div id="right-tab-lab" class="flex-1 overflow-y-auto custom-scroll p-3.5 space-y-3">\n      <div id="lab-scale-notice" class="hidden lab-scale-notice"><span>当前为深空大尺度场景，行星撞击实验仅在 L0 地月系 / L1 太阳系可用。</span><button id="btn-jump-l1" type="button">切换到 L1 太阳系</button></div>')
replace('''        <div class="grid grid-cols-3 gap-2">
          <button id="btn-launch-exp" class="col-span-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] transition active:scale-95">
            🚀 立即发射实验
          </button>
          <button id="btn-reset-target" class="glass-btn py-2.5 rounded-xl text-xs text-sky-200 font-medium">
            单目标重置
          </button>
        </div>''','''        <div class="grid grid-cols-2 gap-2">
          <button id="btn-launch-exp" class="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] transition active:scale-95">
            🚀 立即发射
          </button>
          <button id="btn-launch-salvo" class="glass-btn py-2.5 rounded-xl text-xs text-amber-200 font-semibold border-amber-400/40" title="连续发射 3 枚叠加撞击，观察冲击波与熔岩坑叠加">
            ⚡ 3连发叠加
          </button>
        </div>
        <button id="btn-reset-target" class="glass-btn w-full py-2 rounded-xl text-xs text-sky-200 font-medium">
          ↺ 单目标复原（清除撞击坑与尘埃环）
        </button>''')
section('    <!-- 标签 2：彗星与地貌 -->','    <!-- 标签 3：光学与仿真参数 -->','''    <!-- 标签 2：按当前尺度上下文显示的专属观测与互动 -->
    <div id="right-tab-explore" class="hidden flex-1 overflow-y-auto custom-scroll p-3.5 space-y-3.5">
      <!-- 仅在 L0 / L1 显示：天体动力学事件 -->
      <div data-explore-scales="L0 L1" class="space-y-2">
        <div class="text-[10px] uppercase tracking-wider text-sky-300/80 font-mono-tech">天体动力学事件</div>
        <div class="grid grid-cols-2 gap-2">
          <button id="btn-launch-comet" class="glass-btn rounded-xl p-2.5 text-xs text-sky-100 flex flex-col items-center gap-1">
            <span class="text-base">☄️</span>
            <span>发射双尾彗星</span>
          </button>
          <button id="btn-meteor-shower" class="glass-btn rounded-xl p-2.5 text-xs text-amber-100 flex flex-col items-center gap-1 border-amber-400/30">
            <span class="text-base">🌠</span>
            <span>定向陨石雨</span>
          </button>
        </div>
        <p class="text-[10px] text-slate-400 leading-relaxed">
          提示：在太阳系或地月系中按住 <kbd class="px-1 py-0.5 rounded bg-slate-800 text-sky-300 font-mono-tech">Shift + 左键</kbd> 可朝任意方向发射双尾彗星。
        </p>
      </div>

      <!-- 仅在 L1 太阳系显示：太阳系视角与穿行巡览 -->
      <div data-explore-scales="L1" class="space-y-2 pt-2 border-t border-slate-800/80">
        <div class="text-[10px] uppercase tracking-wider text-amber-300/80 font-mono-tech">太阳系穿行视角</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button data-scene-view="l1-galactic" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200">✦ 银河穿行侧视</button>
          <button data-scene-view="l1-ecliptic" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200">◎ 黄道面俯瞰</button>
          <button data-scene-view="l1-inner" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200">☀ 内太阳系岩质带</button>
          <button data-scene-view="l1-outer" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200">🪐 外太阳系巨行星</button>
        </div>
        <p class="text-[10px] text-slate-400 leading-relaxed">
          切换“银河/外部参考”可直观看见太阳系拖着彩色螺旋尾迹、顶着弓形激波穿行于星际视差星流之中。
        </p>
      </div>

      <!-- 仅在 L0 / L0B 显示：地月系高精地貌与地表着陆 -->
      <div data-explore-scales="L0 L0B" class="space-y-2 pt-2 border-t border-slate-800/80">
        <div class="text-[10px] uppercase tracking-wider text-emerald-300/80 font-mono-tech">地月系高精地貌与地表着陆</div>
        <button id="btn-toggle-landing" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/85 to-teal-500/85 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(16,185,129,0.3)] transition">
          <span>🏔️</span>
          <span id="landing-btn-text">降落到地球地表 (3D微缩生态)</span>
        </button>
        <div class="grid grid-cols-2 gap-1.5" id="landmark-buttons">
          <button data-landmark="himalayas" class="glass-btn rounded-xl py-1.5 px-2 text-[11px] text-slate-200">🏔️ 喜马拉雅山脉</button>
          <button data-landmark="amazon" class="glass-btn rounded-xl py-1.5 px-2 text-[11px] text-slate-200">🌿 亚马逊雨林</button>
          <button data-landmark="pacific" class="glass-btn rounded-xl py-1.5 px-2 text-[11px] text-slate-200">🌊 太平洋深海</button>
          <button data-landmark="sahara" class="glass-btn rounded-xl py-1.5 px-2 text-[11px] text-slate-200">🏜️ 撒哈拉沙漠</button>
          <button data-landmark="poles" class="glass-btn rounded-xl py-1.5 px-2 text-[11px] text-slate-200 col-span-2">❄️ 南北极冰盖与极光区</button>
        </div>
      </div>

      <!-- 仅在 L2 黑洞视界显示：黑洞喷流与视角 -->
      <div data-explore-scales="L2" class="space-y-2">
        <div class="text-[10px] uppercase tracking-wider text-orange-300/80 font-mono-tech">黑洞吸积与相对论喷流</div>
        <button id="btn-toggle-jets" class="glass-btn active w-full py-2 rounded-xl text-xs text-sky-200">
          🌌 切换黑洞相对论极地喷流 (M87*)
        </button>
        <div class="grid grid-cols-2 gap-1.5 pt-1">
          <button data-scene-view="l2-equator" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200">◎ 赤道吸积盘侧视</button>
          <button data-scene-view="l2-polar" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200">◉ 极轴俯瞰光子环</button>
          <button data-scene-view="l2-close" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200 col-span-2">✦ 近事件视界掠过视角</button>
        </div>
      </div>

      <!-- 仅在 L3 星系尺度显示：L3 星系形态切换 -->
      <div data-explore-scales="L3" class="space-y-2">
        <div class="text-[10px] uppercase tracking-wider text-purple-300/80 font-mono-tech">L3 星系形态与视角</div>
        <div class="grid grid-cols-2 gap-1.5" id="galaxy-morph-btns">
          <button data-gal="milkyway" class="gal-btn glass-btn active rounded-xl py-1.5 px-2 text-[11px]">银河系棒旋</button>
          <button data-gal="andromeda" class="gal-btn glass-btn rounded-xl py-1.5 px-2 text-[11px]">仙女座 M31</button>
          <button data-gal="sombrero" class="gal-btn glass-btn rounded-xl py-1.5 px-2 text-[11px]">草帽星系 M104</button>
          <button data-gal="m87" class="gal-btn glass-btn rounded-xl py-1.5 px-2 text-[11px]">室女座 M87</button>
          <button data-gal="cartwheel" class="gal-btn glass-btn rounded-xl py-1.5 px-2 text-[11px] col-span-2">车轮碰撞星系 (Cartwheel)</button>
        </div>
        <div class="grid grid-cols-2 gap-1.5 pt-1">
          <button data-scene-view="l3-top" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200">◎ 俯瞰旋臂结构</button>
          <button data-scene-view="l3-edge" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200">━ 银盘侧视尘埃带</button>
        </div>
      </div>

      <!-- 仅在 L4 / L5 大尺度显示：深空结构巡览 -->
      <div data-explore-scales="L4 L5" class="space-y-2">
        <div class="text-[10px] uppercase tracking-wider text-indigo-300/80 font-mono-tech">大尺度宇宙结构巡览</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button data-scene-view="l4-attractor" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200">✦ 近距观察核心节点</button>
          <button data-scene-view="l5-overview" class="glass-btn rounded-xl py-2 px-2 text-[11px] text-slate-200">◎ 宇宙全景视角</button>
        </div>
        <p class="text-[10px] text-slate-400 leading-relaxed">
          在“光学与仿真”中可切换物理空间膨胀与共动参考，并释放引力探针追踪星系际物质流。
        </p>
      </div>
    </div>''')
# Expand planet impact shader from 6 slots to 16 slots + cumulative lava/scorch stacking
replace('uniform vec3 uImpactPoints[6];\n      uniform float uImpactRadii[6];\n      uniform float uImpactHeat[6];','uniform vec3 uImpactPoints[16];\n      uniform float uImpactRadii[16];\n      uniform float uImpactHeat[16];')
replace('''        for (int i = 0; i < 6; i++) {
          float rad = uImpactRadii[i];
          if (rad > 0.001) {
            float d = acos(clamp(dot(p, normalize(uImpactPoints[i])), -1.0, 1.0));
            if (d < rad * 1.9) {
              float crackNoise = fbm(p * 26.0);
              float core = smoothstep(rad * 1.15, rad * 0.15, d);
              float rim = smoothstep(rad * 1.75, rad * 1.05, d) * smoothstep(rad * 0.65, rad * 1.05, d);
              // 焦黑环形山基底
              col = mix(col, vec3(0.06, 0.05, 0.05), clamp(core * 0.92 + rim * 0.55, 0.0, 1.0));
              // 熔岩核心与辐射裂纹
              float lava = (core * 0.9 + smoothstep(0.46, 0.72, crackNoise) * smoothstep(rad * 1.7, rad * 0.3, d)) * uImpactHeat[i];
              craterEmissive += lava;
            }
          }
        }
        if (craterEmissive > 0.01) {
          vec3 lavaCol = mix(vec3(1.0, 0.22, 0.02), vec3(1.0, 0.88, 0.45), clamp(craterEmissive * 0.75, 0.0, 1.0));
          emissive += lavaCol * min(craterEmissive * 1.8, 2.6);
        }''','''        for (int i = 0; i < 16; i++) {
          float rad = uImpactRadii[i];
          if (rad > 0.001) {
            vec3 cDir = normalize(uImpactPoints[i]);
            float d = acos(clamp(dot(p, cDir), -1.0, 1.0));
            if (d < rad * 2.45) {
              float crackNoise = fbm(p * 28.0);
              float rayNoise = fbm(p * 11.0 + cDir * 5.0);
              float core = smoothstep(rad * 1.12, rad * 0.12, d);
              float rim = smoothstep(rad * 1.68, rad * 1.02, d) * smoothstep(rad * 0.62, rad * 1.02, d);
              float rays = smoothstep(0.55, 0.78, rayNoise) * smoothstep(rad * 2.4, rad * 0.9, d) * 0.42;
              col = mix(col, vec3(0.05, 0.04, 0.045), clamp(core * 0.95 + rim * 0.65 + rays, 0.0, 1.0));
              col += vec3(0.28, 0.22, 0.18) * rim * 0.5;
              float lava = (core * 1.05 + smoothstep(0.42, 0.70, crackNoise) * smoothstep(rad * 1.95, rad * 0.25, d) * 0.85) * uImpactHeat[i];
              craterEmissive += lava;
            }
          }
        }
        if (uDamage > 0.08) {
          float gCrack = smoothstep(0.54, 0.72, fbm(p * 12.0 + vec3(uTime * 0.03)));
          col = mix(col, vec3(0.14, 0.09, 0.08), uDamage * 0.62);
          craterEmissive += gCrack * pow(uDamage, 1.35) * 1.65;
        }
        if (craterEmissive > 0.01) {
          vec3 lavaCol = mix(vec3(1.0, 0.20, 0.02), vec3(1.0, 0.92, 0.52), clamp(craterEmissive * 0.65, 0.0, 1.0));
          emissive += lavaCol * min(craterEmissive * 1.95, 3.2);
        }''')
replace('for (let i = 0; i < 6; i++) {\n        pts.push(new THREE.Vector3(0, 1, 0));','for (let i = 0; i < 16; i++) {\n        pts.push(new THREE.Vector3(0, 1, 0));')
replace('for (let i = 0; i < 6; i++) {\n        body.uniforms.uImpactRadii.value[i] = 0;','for (let i = 0; i < 16; i++) {\n        body.uniforms.uImpactRadii.value[i] = 0;')
replace('for (let i = 0; i < 6; i++) {\n          if (b.uniforms.uImpactHeat.value[i] > 0.32) {','for (let i = 0; i < 16; i++) {\n          if (b.uniforms.uImpactHeat.value[i] > 0.38) {')
replace('    <div id="right-tab-optics" class="hidden flex-1 overflow-y-auto custom-scroll p-3.5 space-y-3.5">','    <div id="right-tab-optics" class="hidden flex-1 overflow-y-auto custom-scroll p-3.5 space-y-3.5">\n'+(WORK/'dynamics-panel.html').read_text(encoding='utf-8'))
replace('  <!-- ==================== 核心 Three.js', (WORK/'interface.html').read_text(encoding='utf-8')+'\n  <!-- ==================== 核心 Three.js')
replace('      万象寰宇 · 3.0','      万象寰宇 · 星海图鉴')
replace('COSMIC ATLAS // INITIALIZING ASTROPHYSICS ENGINE','引力、光与亿万星辰')
replace('正在编译相对论着色器与星系粒子场...','正在准备引力模型与观测场景…')
replace('      const count = 9000;','      const count = document.body.dataset.layout === "mobile" ? 3800 : 6500;')
replace('      const kbCount = 40000;','      const kbCount = document.body.dataset.layout === "mobile" ? 10000 : 22000;')
replace("      L1:  { name: 'L1 太阳系', ruler: '标尺: 1 AU ≈ 1.496×10⁸ km', camPos: [0, 75, 165]", "      L1:  { name: 'L1 太阳系', ruler: '1 AU = 1.496 亿 km · 比例压缩', camPos: [0, 175, 315]")
replace('camPos: [0, 12, 52]', 'camPos: [0, 15, 70]')
replace('camPos: [0, 88, 155]', 'camPos: [0, 100, 200]')
replace('camPos: [0, 110, 210]', 'camPos: [0, 120, 255]')
replace('camPos: [0, 130, 250]', 'camPos: [0, 150, 310]')
replace('renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));','renderer.setPixelRatio(Math.min(window.devicePixelRatio, document.body.dataset.layout === "mobile" ? 1.4 : 2));')
replace('      landingPromptShown: false','      landingPromptShown: false')
replace('      paused: false,', "      paused: matchMedia('(prefers-reduced-motion: reduce)').matches,")
replace('    // 尺度分组容器', (WORK/'dynamics.js').read_text(encoding='utf-8')+'\n\n    // 尺度分组容器')
section('      // 轨道环线','      const enc = ENCYCLOPEDIA[id]', '')
replace('      celestialBodies.push(bodyObj);','      celestialBodies.push(bodyObj);\n      setupBodyOrbit(bodyObj, config);')
section('    let bhShaderMat, bhMesh, bhJetsGroup;','    // =========================================================================\n    // 14.',(WORK/'scenes.js').read_text(encoding='utf-8'))
replace('      precision highp float;\n      uniform vec3 uLocalCam;', '      precision highp float;\n      uniform vec3 uLocalCam;')
replace('          if ((p.y > 0.0 && nextP.y <= 0.0) || (p.y < 0.0 && nextP.y >= 0.0)) {','          if ((p.y > 0.0 && nextP.y <= 0.0) || (p.y < 0.0 && nextP.y >= 0.0) || (abs(p.y)<0.16 && abs(nextP.y)<0.16)) {')
replace('              float angle = atan(hitP.z, hitP.x);','              float angle = atan(hitP.z, hitP.x);')
replace('float spin = angle + uTime * (1.8 / (0.35 + rn));','float spin = angle - uTime * (1.8 / (0.35 + rn));')
replace('float rings = diskFbm(vec2(rn * 12.0, spin * 1.8));','float rings = diskFbm(vec2(cos(spin),sin(spin)) * (3.0+rn*10.0));')
replace('float streaks = diskFbm(vec2(rn * 28.0 - uTime * 0.4, spin * 3.5));','float streaks = diskFbm(vec2(cos(spin*3.0),sin(spin*3.0))*(6.0+rn*18.0)-uTime*.1);')
replace('float photonRingDist = abs(minR - uEventRadius * 1.32);','float photonRingDist = abs(minR - uEventRadius * 1.5);')
replace('float photonGlow = exp(-photonRingDist * 2.2) * 1.35 * uBrightness;', 'float photonGlow = hitHorizon ? 0.0 : exp(-pow(photonRingDist / 0.25, 2.0)) * 0.8 * uBrightness;')
replace('pow(clamp(1.0 + doppler * 0.55, 0.35, 1.95), 2.1)', 'pow(clamp(1.0 + doppler * 0.48, 0.35, 1.95), 1.8)')
replace('        gl_FragColor = vec4(accumColor, finalAlpha);','''        if (!hitHorizon) {
          vec3 skyDir=normalize(v); vec2 skyUv=vec2(atan(skyDir.z,skyDir.x),asin(skyDir.y))*140.;
          vec2 cell=floor(skyUv);float star=step(.996,hash21(cell))*pow(max(0.,1.-length(fract(skyUv)-.5)*2.),8.);
          accumColor+=vec3(.48,.61,.84)*star*(1.-accumAlpha)*.65;
          finalAlpha=max(finalAlpha,star*.5);
        }
        gl_FragColor = vec4(accumColor, finalAlpha);''')
replace('gl_FragColor = vec4(col, 0.22);','gl_FragColor = vec4(col * 0.18, 0.16);')
replace("        desc: '基于广义相对论零测地线实时光线弯曲着色器构建：中心为纯黑事件视界与极亮光子环，高速吸积盘呈现相对论多普勒聚束（迎面蓝白耀眼、背离深红暗淡）。'", "        desc: '黑洞吸积盘、光子环与双极等离子体喷流的程序化观测模型。光线以史瓦西近似弯曲，盘面具有差速旋转和多普勒增亮；不是完整克尔度规求解，也不是实际望远镜图像。'")
replace("rotation: '0.92c (近极值自旋)'", "rotation: '自旋依赖模型，未测定'")
replace("gravity: '视界处逃逸速度 > c'", "gravity: '视界处逃逸速度 = c'")
replace('      l0Moon.angle = 0.65;','      l0Moon.angle = 0.65;\n      l0Moon.orbit.mean=l0Moon.orbit.initialMean=.65;\n      updateBodyOrbit(l0Moon,0);')
replace('      state.currentScale = scaleKey;', '''      if (!SCALE_META[scaleKey]) return;
      state.currentScale = scaleKey;
      setAimMode(false);
      activeProjectiles.forEach(p=>{p.mesh.visible=p.scaleKey===scaleKey;if(p.trail)p.trail.visible=p.scaleKey===scaleKey&&dynamics.trails;});
      document.getElementById('object-tooltip').hidden=true;''')
replace('startCamTransition(new THREE.Vector3(...meta.camPos), new THREE.Vector3(...meta.target));','startCamTransition(fittedCameraPosition(meta.camPos), new THREE.Vector3(...meta.target));')
replace('      audioEngine.playChime();\n    }\n\n    function lockToBody', "      updateSceneGuide();\n      syncDynamicsUI();\n      if(['L2','L4','L5'].includes(scaleKey))document.querySelector('[data-right-tab=optics]').click();\n      else if(scaleKey==='L3')document.querySelector('[data-right-tab=explore]').click();\n      audioEngine.playChime();\n    }\n\n    function lockToBody")
replace('      if (moveCamera) {\n        const offsetDir', '      updateDynamicsValues();\n      if (document.body.dataset.layout === "mobile") togglePanel("left",true);\n      if (moveCamera) {\n        const offsetDir')
replace("        document.getElementById('enc-desc').textContent = '当前处于大尺度深空观测模式，支持 360° 自由旋转、滚轮推进穿透星系纤维与超星系团结构。';", "        document.getElementById('enc-desc').textContent = SCENE_GUIDE[scaleKey][2];")
replace('    // 绑定所有按钮与滑块事件', (WORK/'ui.js').read_text(encoding='utf-8')+'\n\n    // 绑定所有按钮与滑块事件')
replace('`right-tab-btn py-1.5', "`right-tab-btn ${act ? 'active' : ''} py-1.5")
replace('`left-tab-btn py-1.5', "`left-tab-btn ${act ? 'active' : ''} py-1.5")
replace("        document.getElementById('val-time-scale').textContent = state.timeScale.toFixed(1) + 'x';", "        document.getElementById('val-time-scale').textContent = state.timeScale.toFixed(1) + 'x';\n        syncDynamicsUI();")
replace("        document.getElementById('btn-pause-sim').textContent = '⏸️ 暂停仿真';", "        document.getElementById('btn-pause-sim').textContent = '⏸️ 暂停仿真';\n        syncDynamicsUI();")
replace("      document.getElementById('btn-pause-sim').textContent = state.paused ? '▶️ 继续仿真' : '⏸️ 暂停仿真';", "      document.getElementById('btn-pause-sim').textContent = state.paused ? '▶️ 继续仿真' : '⏸️ 暂停仿真';\n      syncDynamicsUI();")
replace("      window.addEventListener('keydown', (e) => {\n        if (e.code", "      window.addEventListener('keydown', (e) => {\n        if (e.target.matches('input,textarea,select,button')) return;\n        if (e.code")
replace('      });\n    }\n\n    function togglePause', "      });\n      bindImprovedUI();\n      controls.addEventListener('start',()=>{state.camTransition=null;});\n    }\n\n    function togglePause")
replace('      const elapsed = clock.elapsedTime;', '''      dynamics.time += dt;
      dynamics.sceneTime[state.currentScale] += dt;
      const elapsed = dynamics.time;
      const timestamp = clock.elapsedTime;''')
section('        if (b.orbitRadius > 0) {','        b.uniforms.uTime.value += dt;', '''        updateBodyOrbit(b,dt);
        b.mesh.rotation.y += b.rotSpeed * dt * 60;''')
replace('b.cloudsMesh.rotation.y += b.rotSpeed * 1.35 * (state.paused ? 0 : state.timeScale);','b.cloudsMesh.rotation.y += b.rotSpeed * 1.35 * dt * 60;')
section('      // 3. 更新 L2 黑洞','      // 5. 弹体飞行', '''      if(state.currentScale==='L2')updateL2(dt);
      if(state.currentScale==='L3')updateL3(dt);
      if(state.currentScale==='L4')updateL4(dt);
      if(state.currentScale==='L5')updateL5(dt);
      updateProbes(dt);
      if(typeof updateEarthHD==='function')updateEarthHD(dt, elapsed);
      const activeGroup=scaleGroups[state.currentScale];
      if(state.currentScale==='L1')activeGroup.children.forEach(ch=>{if(ch.userData.rotSpeed)ch.rotation.y+=ch.userData.rotSpeed*dt;});
''')
# All simulated effects share the pause/time controls; camera interaction remains in real time.
a=s.index('      // 2. 更新 L0-B');b=s.index('      // 8. 相机平滑过渡',a)
s=s[:a]+s[a:b].replace('rawDt','dt')+s[b:]
replace('      controls.update();\n      composer.render();', '''      controls.update();
      if(state.currentScale==='L2' && bhShaderMat)bhShaderMat.uniforms.uLocalCam.value.copy(bhMesh.worldToLocal(camera.position.clone()));
      updateLabels();inspectPointer(timestamp);
      document.getElementById('transport-time').textContent=String(Math.floor(dynamics.time/60)).padStart(2,'0')+':'+String(Math.floor(dynamics.time%60)).padStart(2,'0');
      if(fpsTimer===0)updateDynamicsValues();
      composer.render();''')
section('    // 响应式窗口缩放','    // =========================================================================\n    // 18.', '''    window.addEventListener('resize',()=>resizeViewport());
    document.addEventListener('visibilitychange',()=>{clock.getDelta();});
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();state.paused=true;syncDynamicsUI();showToast('图形上下文已丢失，请刷新页面恢复','amber');});
''')
replace("        status.textContent = '正在构建 380,000+ 星系与宇宙纤维网粒子...';", "        status.textContent = '正在构建差速恒星、引力节点和宇宙纤维…';")
replace("        status.textContent = '万象寰宇 3.0 已就绪';", "        status.textContent = '观测台已就绪 · 引力与轨迹已启用';")
replace('      celestialBodies.forEach(resetBody);','      resetDynamics();\n      celestialBodies.forEach(resetBody);')
replace('      const pointerDownPos', '      const pointerDownPos') if '      const pointerDownPos' in s else None
replace('    const pointerDownPos = new THREE.Vector2();','    const pointerDownPos = new THREE.Vector2();\n    const activePointers = new Set();\n    let wasMultiTouch = false;')
replace('      pointerDownPos.set(e.clientX, e.clientY);','      activePointers.add(e.pointerId);\n      if(activePointers.size>1)wasMultiTouch=true;\n      else {wasMultiTouch=false;pointerDownPos.set(e.clientX,e.clientY);}')
replace("      if (e.button !== 0) return;", "      activePointers.delete(e.pointerId);\n      if(wasMultiTouch || e.button !== 0) return;")
replace("    renderer.domElement.addEventListener('pointerup', (e) => {", "    renderer.domElement.addEventListener('pointercancel',e=>{activePointers.delete(e.pointerId);wasMultiTouch=true;});\n    renderer.domElement.addEventListener('pointerup', (e) => {")
replace('      vfxGroup.add(grp);\n      activeProjectiles.push({', '''      if(type!=='asteroid')grp.lookAt(startPos.clone().add(dir));
      if(activeProjectiles.length>=40){disposeTree(grp);showToast('请等待当前弹体完成飞行','amber');return;}
      vfxGroup.add(grp);
      const history=Array.from({length:100},()=>startPos.clone());
      const trail=makeLine(history,TRAJECTORY_COLOR,.65);vfxGroup.add(trail);
      activeProjectiles.push({
        scaleKey:state.currentScale,trail,history,visualRadius,''')
replace('      const dir = targetPos.clone().sub(startPos).normalize();','      const dir = targetBody ? interceptionDirection(startPos,targetPos,targetBody,speed,type) : targetPos.clone().sub(startPos).normalize();')
replace('        p.age += dt;\n        p.mesh.position.addScaledVector(p.vel, dt);', '''        if(p.scaleKey!==state.currentScale)continue;
        p.age += dt;
        p.trail.visible=dynamics.trails;
        const previous=p.mesh.position.clone();
        const ballistic=['asteroid','comet','kinetic'].includes(p.type),sources=gravitySources(p.scaleKey);
        const steps=Math.max(1,Math.ceil(dt*120)),h=dt/steps;
        for(let j=0;j<steps;j++){if(ballistic)p.vel.addScaledVector(accelerationAt(p.mesh.position,sources),h*.5);p.mesh.position.addScaledVector(p.vel,h);if(ballistic)p.vel.addScaledVector(accelerationAt(p.mesh.position,sources),h*.5);}
        if(dt>0){p.history.shift();p.history.push(p.mesh.position.clone());const attr=p.trail.geometry.attributes.position;p.history.forEach((v,j)=>attr.setXYZ(j,v.x,v.y,v.z));attr.needsUpdate=true;p.trail.geometry.computeBoundingSphere();}
        if(p.type==='comet')p.mesh.lookAt(p.mesh.position.clone().add(p.vel));''')
replace('          const dist = p.mesh.position.distanceTo(bWorld);\n          if (dist <= body.radius + 0.55) {', '''          const segment=p.mesh.position.clone().sub(previous),denom=segment.lengthSq();
          const u=denom?THREE.MathUtils.clamp(bWorld.clone().sub(previous).dot(segment)/denom,0,1):0;
          const closest=previous.clone().addScaledVector(segment,u);
          const dist=closest.distanceTo(bWorld);
          if (dist <= body.radius + p.visualRadius) {
            p.mesh.position.copy(closest);''')
replace('          vfxGroup.remove(p.mesh);\n          activeProjectiles.splice(i, 1);','          disposeTree(p.mesh);disposeTree(p.trail);\n          activeProjectiles.splice(i, 1);')
replace('        vfxGroup.remove(p.mesh);','        disposeTree(p.mesh);if(p.trail)disposeTree(p.trail);')
replace('          vfxGroup.remove(ex.group);','          disposeTree(ex.group);')
replace('        vfxGroup.remove(e.group);','        disposeTree(e.group);')
# Keep environmental labels and loading errors usable even when external modules fail.
replace('  <!-- 3D 渲染画布 -->','''  <script>
    const startupWatch=setTimeout(()=>{const status=document.getElementById('load-status');if(status){status.textContent='加载较久，请使用支持 WebGL 的较新浏览器，或点击重试。';const b=document.createElement('button');b.id='load-retry';b.textContent='重新加载';b.onclick=()=>location.reload();status.after(b);}},25000);
    window.addEventListener('error',e=>{if(document.getElementById('load-status')&&e.message)document.getElementById('load-status').textContent='启动失败：'+e.message;});
  </script>
  <!-- 3D 渲染画布 -->''')
replace('        animate();','''        clearTimeout(startupWatch);
        if(new URLSearchParams(location.search).has('test'))window.__atlas={
          snapshot:()=>({scale:state.currentScale,paused:state.paused,time:dynamics.time,sceneTime:{...dynamics.sceneTime},gravity:dynamics.gravity,morph:state.galaxyMorph,
            bodies:celestialBodies.filter(b=>b.scaleKey===state.currentScale).map(b=>({id:b.id,position:b.meshGroup.position.toArray(),mean:b.orbit?.mean})),
            dust:bhDustData.slice(0,2).map(p=>[p.r,p.phase]),galaxyTime:l3Points.material.uniforms.uTime.value,
            cluster:clusterParticles.slice(0,3).map(p=>p.p.toArray()),web:webParticles.slice(0,3).map(p=>p.t),probes:dynamics.probes.map(p=>({key:p.key,position:p.position.toArray()})),
            renderer:{calls:renderer.info.render.calls,points:renderer.info.render.points,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures},
            layout:document.body.dataset.layout,projectiles:activeProjectiles.length
          })
        };
        animate();''')
# Integrate the reference-frame and experimental models before embedding assets.
import runpy
s=runpy.run_path(str(WORK/'continuation.py'))['apply'](s,ROOT,WORK)
s=runpy.run_path(str(WORK/'encyclopedia-build.py'))['apply'](s,ROOT,WORK)
# High-detail 3D Earth geology, flowing ocean/rivers, polar auroras & fixed landmark targeting
if (WORK/'earth-hd.js').exists():
    replace('    // 尺度分组容器', (WORK/'earth-hd.js').read_text(encoding='utf-8')+'\n    // 尺度分组容器')
    replace('        buildL1SolarSystem();', '        buildL1SolarSystem();\n        upgradeHighResEarth(l0Earth, true);\n        upgradeHighResEarth(l1Earth, false);\n        enhanceL0BWaterFlow();')
    replace('btn.onclick = () => focusEarthLandmark(btn.dataset.landmark);', 'btn.onclick = () => focusEarthLandmarkHD(btn.dataset.landmark);')
    replace('const distToEarth = camera.position.distanceTo(l0Earth.mesh.position);', 'const distToEarth = camera.position.distanceTo(l0Earth.mesh.getWorldPosition(new THREE.Vector3()));')
    replace("        e.currentTarget.classList.toggle('active', state.showBlackHoleJets);", "        e.currentTarget.classList.toggle('active', state.showBlackHoleJets);\n        syncDynamicsUI();")
    replace("            const curPos = target ? target.mesh.getWorldPosition(new THREE.Vector3()) : tPos;", "            if (!['L0','L1'].includes(state.currentScale) || (target && target.scaleKey !== state.currentScale)) return;\n            const curPos = target ? target.mesh.getWorldPosition(new THREE.Vector3()) : tPos;")
    replace("        document.getElementById('btn-unlock-cam').classList.add('hidden');\n        showToast('已解除目标镜头锁定');", "        document.getElementById('btn-unlock-cam').classList.add('hidden');\n        if (earthLandmarkPin) { disposeTree(earthLandmarkPin); earthLandmarkPin = null; }\n        motion.l0SunLocal = null;\n        if (l0Earth?.cloudsMesh) l0Earth.cloudsMesh.material.uniforms.uOpacity.value = Math.max(0, l0Earth.atmoPct / 100);\n        showToast('已解除目标镜头锁定');")
    replace("      resetDynamics();\n      celestialBodies.forEach(resetBody);", "      if (earthLandmarkPin) { disposeTree(earthLandmarkPin); earthLandmarkPin = null; }\n      motion.l0SunLocal = null;\n      resetDynamics();\n      celestialBodies.forEach(resetBody);")
    replace('new THREE.PlaneGeometry(88, 88, 96, 96)', 'new THREE.PlaneGeometry(88, 88, 144, 144)')
    replace('''            float wave = sin(vW.x * 0.9 + uTime * 2.5) * cos(vW.z * 0.9 - uTime * 1.9);
            vec3 deep = vec3(0.03, 0.24, 0.48);
            vec3 shallow = vec3(0.08, 0.56, 0.72);
            vec3 col = mix(deep, shallow, 0.45 + 0.35 * wave);
            float sparkle = smoothstep(0.86, 0.99, wave);
            col += vec3(0.75, 0.92, 1.0) * sparkle * 0.55;
            gl_FragColor = vec4(col, 0.84);''','''            float riverX = -4.0 + sin(vW.z * 0.16) * 4.5;
            float inRiver = smoothstep(4.6, 1.0, abs(vW.x - riverX)) * step(-12.0, vW.z) * step(vW.z, 17.0);
            float w1 = sin(vW.x * 0.42 + vW.z * 0.31 + uTime * 1.9);
            float w2 = sin(vW.x * 0.78 - vW.z * 0.65 - uTime * 1.5);
            float w3 = cos((vW.x - vW.z) * 1.25 + uTime * 2.3);
            float wave = (w1 * 0.45 + w2 * 0.35 + w3 * 0.20) * 0.5 + 0.5;
            float stream1 = sin(vW.z * 1.45 - uTime * 4.6 + sin(vW.x * 0.9) * 1.8) * 0.5 + 0.5;
            float stream2 = sin(vW.z * 2.8 - uTime * 6.2 + cos(vW.x * 1.7) * 1.4) * 0.5 + 0.5;
            float flow = stream1 * 0.6 + stream2 * 0.4;
            float combined = mix(wave, flow, inRiver * 0.85);
            vec3 deep = vec3(0.025, 0.24, 0.48);
            vec3 shallow = vec3(0.06, 0.54, 0.74);
            vec3 riverCol = vec3(0.11, 0.68, 0.86);
            vec3 col = mix(deep, shallow, 0.32 + 0.45 * combined);
            col = mix(col, riverCol, inRiver * (0.45 + 0.35 * flow));
            float foam = smoothstep(0.80, 0.98, combined) * (0.35 + inRiver * 0.65);
            col += vec3(0.84, 0.96, 1.0) * foam * 0.58;
            gl_FragColor = vec4(col, 0.86);''')
# Final visual polish layer (icons + stylesheet injected last so it wins the cascade).
if (WORK/'polish.py').exists():
    s=runpy.run_path(str(WORK/'polish.py'))['apply'](s,ROOT,WORK)
# Static CSS and optional offline module maps are generated separately.
if (WORK/'tailwind.css').exists():
    replace('  <script src="https://cdn.tailwindcss.com"></script>', '<style>'+ (WORK/'tailwind.css').read_text(encoding='utf-8')+'</style>')
    s=re.sub(r'  <!-- Google Fonts -->.*?(?=\n\n)', '', s, count=1, flags=re.S)
if (WORK/'offline-imports.json').exists():
    imports=(WORK/'offline-imports.json').read_text(encoding='utf-8')
    s=re.sub(r'(<script type="importmap">).*?(</script>)',lambda m:m[1]+'\n'+imports+'\n  '+m[2],s,count=1,flags=re.S)
(ROOT/'cosmic_atlas_3_0.html').write_text(s,encoding='utf-8')
# Small source-only module for syntax checks, not a runtime dependency.
module=re.search(r'<script type="module">(.*?)</script>',s,re.S)[1]
(WORK/'runtime-check.mjs').write_text(module,encoding='utf-8')
print('Built cosmic_atlas_3_0.html:',len(s.encode('utf-8')),'bytes')
