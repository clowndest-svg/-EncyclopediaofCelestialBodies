    function getEvolutionStages(item) {
      if(!item)return [];
      const id=item.id||'',kind=item.kind,sub=item.subtype||'',preset=item.visual?.preset||'rocky';
      const massSolar=Number(item.facts?.massSolar)||0,tempK=Number(item.facts?.tempK)||0;
      const isMassiveStar=kind==='star'&&(massSolar>=8||/超巨星|特超巨星|沃尔夫|蓝变星|脉冲星|磁星/.test(sub)||preset==='pulsar');
      const isWhiteDwarf=kind==='star'&&(/白矮星/.test(sub)||id==='star-sirius-b');
      if(id==='sun'||(kind==='star'&&!isMassiveStar&&!isWhiteDwarf&&preset!=='dyson')){
        const isSun=id==='sun';
        return [
          {id:'proto',label:'原恒星 / 形成期',era:isSun?'约 46 亿年前':'诞生初期',mode:'protostar',desc:isSun?'巨大星际分子云在引力下坍塌，中心形成炽热原恒星并包裹在旋转的原行星吸积盘中，两极喷出原恒星喷流，核心逐步升温并点燃氢核聚变。':'致密分子云在自身引力下坍缩旋转，形成吸积盘与双极原恒星喷流，核心温度持续攀升直至启动核聚变。'},
          {id:'current',label:'主序星时期（当前）',era:isSun?'当前 · 约 46 亿岁（持续约 100 亿年）':'稳定主序期',mode:'default',desc:isSun?'核心持续稳定地将氢聚变为氦，释放光和热，内部辐射压与自身引力精妙平衡。太阳目前处于主序星中期，也是地球生命繁荣的黄金时代。':'核心稳定进行氢聚变，释放持久光热，表面翻涌炽热对流米粒、耀斑磁环与日冕。'},
          {id:'redgiant',label:'红巨星时期',era:isSun?'约 50 亿年后（75 亿年前后大幅膨胀）':'恒星晚年膨胀期',mode:'redgiant',desc:isSun?'核心氢燃料耗尽后氦核收缩、外层氢壳剧烈燃烧，外层极度膨胀且表面降温呈深橘红，体积可能扩大至逼近甚至吞没地球轨道（图中虚线环示意）。':'核心氢耗尽导致外层剧烈膨胀数倍至数十倍，表面温度降低而泛红，强劲恒星风开始向外抛射外层物质。'},
          {id:'wd',label:'行星状星云与白矮星',era:isSun?'约 78 亿年后 · 晚年与残骸阶段':'残骸冷却阶段',mode:'planetary_wd',desc:isSun?'外层膨胀气体彻底抛向深空，被中心残核紫外线激发为绚丽的行星状星云；核心留下地球大小的致密炽热白矮星，随后在数百亿年中缓慢冷却。':'外层物质形成瑰丽的膨胀行星状星云壳层，中心留下高密度简并白矮星核心并逐渐冷却黯淡。'}
        ];
      }
      if(isMassiveStar){
        return [
          {id:'proto',label:'巨分子云坍缩期',era:'诞生最初数十万年',mode:'protostar',desc:'大质量原恒星在浓密分子云中疯狂吸积物质，发出猛烈辐射风与双极喷流，极快点燃核心聚变。'},
          {id:'current',label:preset==='pulsar'?'超新星前身巨星期':'蓝 / 红超巨星期（当前）',era:'数百万至数千万年',mode:preset==='pulsar'?'redgiant':'default',desc:'大质量恒星消耗燃料极快，核心依次聚变氢、氦、碳、氧直至生成铁核，体积极端庞大或光度极其耀眼。'},
          {id:'sn',label:'超新星爆发',era:'核心坍缩瞬间 · 仅数秒至数月',mode:'supernova',desc:'铁核失去核聚变支撑瞬间坍缩反弹，外层以每秒上万公里速度轰然炸裂，瞬间亮度堪比整座星系，并锻造出金、铀等重元素。'},
          {id:'remnant',label:preset==='pulsar'?'脉冲星 / 磁星（当前）':'中子星 / 恒星级黑洞',era:'爆发后的致密残骸',mode:'pulsar',desc:'坍缩核心压缩为直径约 20 公里的高速旋转中子星（射出强磁场脉冲波束），若质量更大则直接坍缩为黑洞。'}
        ];
      }
      if(isWhiteDwarf){
        return [
          {id:'proto',label:'前身主序星时期',era:'数十亿年前',mode:'star_blue',desc:'在成为白矮星之前，它曾是一颗明亮炽热的中等质量主序星，稳定燃烧核心氢燃料。'},
          {id:'redgiant',label:'红巨星与星云抛射',era:'演化末期',mode:'planetary_wd',desc:'外层剧烈膨胀并最终抛离形成行星状星云，裸露出极其炽热的碳氧核心。'},
          {id:'current',label:'白矮星时期（当前）',era:'当前阶段',mode:'default',desc:'不再进行核聚变，仅靠电子简并压抵抗引力与余热发光，半径接近地球却压缩着整个太阳级质量。'}
        ];
      }
      if(kind==='planet'||kind==='exoplanet'||kind==='moon'){
        if(preset==='ringworld'||preset==='dyson')return [
          {id:'build',label:'初期构筑阶段',era:'设想构筑期',mode:'protostar',desc:'围绕恒星汇聚原始轨道建材与能源节点，逐步拼接巨构骨架的科幻设想阶段。'},
          {id:'current',label:'巅峰运行态（当前）',era:'稳定运行期',mode:'default',desc:'巨构环带与能量阵列完整运转，高效捕获恒星辐射并维持内部设定生态。'},
          {id:'aged',label:'恒星晚年变迁',era:'数十亿年后远景',mode:'redgiant',desc:'随着中心恒星演化膨胀，轨道结构面临剧烈热辐射与引力扰动挑战。'}
        ];
        if(preset==='gas'||preset==='ring')return [
          {id:'proto',label:'原行星盘吸积期',era:'约 45 亿年前',mode:'protostar',desc:'岩石与冰核迅速形成后，凭借强大引力从原始星盘中疯狂捕获海量氢和氦气体包层。'},
          {id:'current',label:'活跃风暴期（当前）',era:'当前阶段',mode:'default',desc:'内部热流驱动高速带状喷流、巨型反气旋风暴与壮丽星环系统。'},
          {id:'hot',label:'恒星膨胀炙烤期',era:'遥远未来',mode:'lava',desc:'当宿主恒星步入红巨星阶段，巨行星外层大气被强烈加热膨胀甚至缓慢剥离。'}
        ];
        return [
          {id:'hadean',label:'冥古宙熔岩期',era:id==='earth'?'约 45 亿年前':'行星诞生初期',mode:'lava',desc:id==='earth'?'刚聚合成形的早期地球遭受密集星子与大撞击轰炸，地表覆盖炽热翻涌的全球岩浆海与原始火山气体。':'天体聚合释放巨量引力势能与剧烈撞击热，表面处于高温熔融岩浆海与强烈火山喷发状态。'},
          {id:'early',label:'冷却与海洋/壳层凝结',era:id==='earth'?'约 40–38 亿年前':'早期稳定期',mode:'ocean',desc:id==='earth'?'地表逐渐冷却形成固体地壳，水汽凝结降下漫长暴雨，原始海洋诞生并孕育出最早的生命火种。':'表面冷却固化形成原始地壳与大气层，水或挥发物在适宜条件下开始凝结聚集。'},
          {id:'current',label:'当前演化态（当前）',era:'当前阶段',mode:'default',desc:item.summary||'当前观测或目录记录的天体面貌与大气地貌结构。'},
          {id:'future',label:'红巨星炙烤远景',era:'约 50 亿年后',mode:'scorched',desc:id==='earth'?'随着太阳光度增强并步入红巨星阶段，地球海洋蒸发、大气失控温室化，最终沦为干涸焦土甚至濒临被太阳吞没。':'随着宿主恒星步入晚年膨胀，近距行星表面被极端辐射炙烤、挥发物散失。'}
        ];
      }
      if(kind==='galaxy'){
        return [
          {id:'proto',label:'原星系气体盘形成',era:'宇宙大爆炸后数亿年',mode:'galaxy_proto',desc:'暗物质晕引力吸引原始氢氦气体坍缩汇聚，形成剧烈诞星的年轻蓝白原星系团块。'},
          {id:'current',label:'成熟星系形态（当前）',era:'当前观测时代',mode:'default',desc:'恒星、气体与尘埃组织出壮丽的中央核球、旋臂或巨型椭圆结构，平稳上演恒星生灭循环。'},
          {id:'merger',label:'星系碰撞与并合',era:id==='milky-way'||id==='ngc-0224'?'约 45 亿年后（银河-仙女座并合）':'星系相互作用期',mode:'galaxy_merger',desc:'两大星系在引力牵引下交错穿越、甩出绵延数十万光年的潮汐星尾，并引爆璀璨的星暴高潮。'},
          {id:'late',label:'晚年巨型椭圆星系',era:'百亿年之后',mode:'elliptical',desc:'碰撞尘埃落定、星际气体耗尽后，旋臂消散，最终融合为温和金黄的巨型椭圆星系。'}
        ];
      }
      if(kind==='blackhole'){
        return [
          {id:'collapse',label:'引力坍缩诞生期',era:'形成瞬间',mode:'supernova',desc:'超大质量恒星核或致密星团核心在引力下不可逆坍缩，突破史瓦西半径形成事件视界。'},
          {id:'quasar',label:'类星体狂暴吸积期',era:'高能活跃期',mode:'quasar',desc:'大量星际气体高速旋入形成极度炽热的吸积盘，并以近光速从两极喷射贯穿星系的耀眼喷流。'},
          {id:'current',label:'当前观测态（当前）',era:'当前阶段',mode:'default',desc:'强引力弯曲周围光线形成明亮光子环与非对称多普勒吸积盘，视界内部光无法逃逸。'},
          {id:'dormant',label:'遥远未来休眠期',era:'极遥远宇宙纪元',mode:'dormant_bh',desc:'周边物质消耗殆尽后吸积盘黯淡熄灭，黑洞归于沉寂，只在量子尺度以极其微弱的霍金辐射缓慢演化。'}
        ];
      }
      if(kind==='nebula'){
        return [
          {id:'collapse',label:'分子云聚集期',era:'早期阶段',mode:'protostar',desc:'寒冷致密的星际尘埃与分子氢云在引力扰动或冲击波挤压下开始局部坍缩。'},
          {id:'current',label:'璀璨电离发光期（当前）',era:'当前观测态',mode:'default',desc:'新生大质量恒星或中心白矮星的强紫外线激发氢、氧、硫气体，绽放出瑰丽的星云辉光。'},
          {id:'disperse',label:'星云消散与新生星团',era:'数百万至数千万年后',mode:'cluster',desc:'强劲辐射风逐渐吹散残余气体与尘埃，云中诞生的年轻恒星群脱颖而出成为疏散星团。'}
        ];
      }
      if(kind==='cluster'){
        return [
          {id:'birth',label:'星云育婴诞生期',era:'形成初期',mode:'nebula',desc:'同一团巨分子云孕育出成百上千颗年龄相近的恒星，星群尚包裹在炽热发光星云之中。'},
          {id:'current',label:'璀璨星团期（当前）',era:'当前阶段',mode:'default',desc:'气体已散去，不同质量的恒星以蓝白、金黄等丰富光谱色彩齐聚闪耀。'},
          {id:'evolved',label:'年老恒星演化期',era:'数十亿年后',mode:'elliptical',desc:'短寿蓝星相继演化谢幕，留下大量温润金橙色的年老红巨星与致密残骸。'}
        ];
      }
      return [
        {id:'far',label:'远日点冰封期',era:'远离恒星时',mode:'asteroid',desc:'远离太阳时表面被深寒冰封，几乎没有气体升华，如同一块静默的原始冰岩。'},
        {id:'current',label:'近日点活跃期（当前）',era:'接近恒星时',mode:'default',desc:'太阳辐射加热挥发物喷涌而出，形成明亮彗发、直指背日的蓝色离子尾与弯曲尘埃尾。'}
      ];
    }

    class CatalogViewer {
      constructor(container){
        this.container=container;this.ready=false;
        this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.time=0;this.materials=[];this.animations=[];this.ownedTextures=[];this.vfxNodes=[];
        this.brightness=1.35;this.vfx=1.25;this.spin=1.0;this.studioLight=true;this.showStars=true;
        this.currentItem=null;this.currentStageMode='default';
      }
      init(){
        if(this.ready)return;
        try{
          this.scene=new THREE.Scene();
          this.camera=new THREE.PerspectiveCamera(38,1,.1,150);
          this.camera.position.set(0,.45,7.2);
          this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
          this.renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.2:1.6));
          this.renderer.setClearColor(0x000000,0);
          this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
          this.renderer.toneMappingExposure=this.brightness;
          this.container.replaceChildren(this.renderer.domElement);
          this.controls=new OrbitControls(this.camera,this.renderer.domElement);
          this.controls.enableDamping=true;this.controls.dampingFactor=.075;this.controls.enablePan=false;
          this.controls.minDistance=2.8;this.controls.maxDistance=16;
          this.hemiLight=new THREE.HemisphereLight(0xdbeeff,0x1e2b4a,1.75);
          this.keyLight=new THREE.DirectionalLight(0xfff1d6,3.4);this.keyLight.position.set(-3.2,2.4,5.2);
          this.rimLight=new THREE.DirectionalLight(0x7cc4ff,1.65);this.rimLight.position.set(4.5,-1.5,-3.8);
          this.fillLight=new THREE.DirectionalLight(0xa5b4fc,.85);this.fillLight.position.set(2.5,3.5,2);
          this.scene.add(this.hemiLight,this.keyLight,this.rimLight,this.fillLight);
          this.group=new THREE.Group();this.scene.add(this.group);
          this.glow=this.glowTexture();this.spikeTex=this.spikeTexture();
          this.starfield=this.makeBackdropStars();this.scene.add(this.starfield);
          this.applyVisualSettings();
          this.ready=true;
          this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.container);this.resize();
        }catch(e){this.container.innerHTML='<div class="book-art-poster"></div>';this.error=e;}
      }
      resize(){if(!this.ready)return;const w=this.container.clientWidth,h=this.container.clientHeight;if(w<1||h<1)return;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h,false);}
      glowTexture(){
        const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);
        g.addColorStop(0,'#ffffff');g.addColorStop(.12,'#fffffff2');g.addColorStop(.32,'#ffffff88');g.addColorStop(.62,'#ffffff22');g.addColorStop(1,'#ffffff00');
        ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);
      }
      spikeTexture(){
        const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
        const g=ctx.createRadialGradient(64,64,0,64,64,64);
        g.addColorStop(0,'#ffffff');g.addColorStop(.12,'#ffffffdd');g.addColorStop(.35,'#ffffff44');g.addColorStop(1,'#ffffff00');
        ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
        ctx.fillStyle='rgba(255,255,255,0.85)';
        for(const rot of [0,Math.PI/2]){ctx.save();ctx.translate(64,64);ctx.rotate(rot);const lg=ctx.createLinearGradient(-62,0,62,0);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.45,'rgba(255,255,255,.55)');lg.addColorStop(.5,'rgba(255,255,255,1)');lg.addColorStop(.55,'rgba(255,255,255,.55)');lg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=lg;ctx.fillRect(-62,-1.5,124,3);ctx.restore();}
        return new THREE.CanvasTexture(c);
      }
      makeBackdropStars(){
        const grp=new THREE.Group(),rng=deterministicRandom(9001);
        const pal=[0xe0f2fe,0xffffff,0xfef3c7,0xc7d2fe,0xfecdd3,0x93c5fd];
        // 1) 主深空背景星场（肉眼清晰可见的多光谱闪烁繁星）
        const n=1400,pos=new Float32Array(n*3),col=new Float32Array(n*3);
        for(let i=0;i<n;i++){
          const r=18+rng()*34,a=rng()*Math.PI*2,ph=Math.acos(2*rng()-1);
          pos[i*3]=r*Math.sin(ph)*Math.cos(a);pos[i*3+1]=r*Math.cos(ph);pos[i*3+2]=r*Math.sin(ph)*Math.sin(a);
          new THREE.Color(pal[i%pal.length]).multiplyScalar(.6+rng()*.55).toArray(col,i*3);
        }
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
        grp.add(new THREE.Points(g,new THREE.PointsMaterial({map:this.glow,size:.95,vertexColors:true,transparent:true,opacity:.92,depthWrite:false,blending:THREE.AdditiveBlending})));
        // 2) 36 颗带光学十字星芒的明亮背景恒星
        const bn=36,bPos=new Float32Array(bn*3),bCol=new Float32Array(bn*3);
        for(let i=0;i<bn;i++){
          const r=20+rng()*24,a=rng()*Math.PI*2,ph=Math.acos(2*rng()-1);
          bPos[i*3]=r*Math.sin(ph)*Math.cos(a);bPos[i*3+1]=r*Math.cos(ph);bPos[i*3+2]=r*Math.sin(ph)*Math.sin(a);
          new THREE.Color(pal[i%pal.length]).toArray(bCol,i*3);
        }
        const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(bPos,3));bg.setAttribute('color',new THREE.BufferAttribute(bCol,3));
        grp.add(new THREE.Points(bg,new THREE.PointsMaterial({map:this.spikeTex,size:2.1,vertexColors:true,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending})));
        return grp;
      }
      sprite(color,size,alpha=.55,useSpike=false){
        const s=new THREE.Sprite(new THREE.SpriteMaterial({map:useSpike?this.spikeTex:this.glow,color,transparent:true,opacity:alpha,depthWrite:false,blending:THREE.AdditiveBlending}));
        s.scale.set(size,size,1);s.userData.baseOpacity=alpha;s.userData.baseScale=size;this.vfxNodes.push(s);return s;
      }
      applyVisualSettings(){
        if(!this.renderer)return;
        const modeScale=this.studioLight?1.08:.72;
        this.renderer.toneMappingExposure=this.brightness*modeScale;
        const stage=this.container?.parentElement;
        if(stage)stage.classList.toggle('real-space',!this.studioLight);
        if(this.hemiLight){
          this.hemiLight.intensity=(this.studioLight?2.1:.16)*this.brightness;
          this.keyLight.intensity=(this.studioLight?3.0:4.6)*this.brightness;
          this.rimLight.intensity=(this.studioLight?1.85:.28)*this.vfx;
          this.fillLight.intensity=(this.studioLight?1.15:0)*this.brightness;
        }
        if(this.starfield)this.starfield.visible=this.showStars;
        for(const m of this.materials){
          if(m.uniforms?.uBright)m.uniforms.uBright.value=this.brightness*(this.studioLight?1.05:.76);
          if(m.uniforms?.uVfx)m.uniforms.uVfx.value=this.vfx;
          if(m.uniforms?.uStudio)m.uniforms.uStudio.value=this.studioLight?1:0;
        }
        for(const s of this.vfxNodes){
          if(s.material&&s.userData.baseOpacity!==undefined)s.material.opacity=Math.min(1,s.userData.baseOpacity*this.vfx*(this.studioLight?1:.72));
          if(s.userData.baseScale!==undefined){const k=.72+.28*this.vfx;s.scale.set(s.userData.baseScale*k,s.userData.baseScale*k,1);}
        }
        if(this.ready)this.renderer.render(this.scene,this.camera);
      }
      clear(){
        if(!this.ready)return;
        for(const c of [...this.group.children]){c.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});this.group.remove(c);}
        this.ownedTextures.forEach(t=>t.dispose());this.ownedTextures=[];this.animations=[];this.materials=[];this.vfxNodes=[];this.time=0;this.group.rotation.set(0,0,0);
      }
      surface(mode,colorA,colorB,colorC,seed){
        // mode: 1=rocky, 2=gas, 3=earth/ocean, 4=star plasma, 5=lava/molten, 6=ice cryo, 7=scorched
        const material=new THREE.ShaderMaterial({
          vertexShader:`varying vec3 vP,vN,vV;void main(){vP=normalize(position);vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
          fragmentShader:`precision highp float;
            varying vec3 vP,vN,vV;
            uniform vec3 uA,uB,uC;uniform float uMode,uSeed,uTime,uBright,uVfx,uStudio;
            float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
            float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
            float fbm(vec3 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=a*noise(p);p=p*2.05+3.7;a*=.5;}return n;}
            void main(){
              vec3 p=vP;float n=fbm(p*3.6+uSeed),n2=fbm(p*9.5-uSeed*1.3);
              float ndl=dot(normalize(vN),normalize(vec3(-.45,.38,1.)));
              float lit=max(0.,ndl),amb=mix(.14,.44,uStudio),rim=pow(1.-max(0.,dot(vN,vV)),2.6);
              if(uMode>3.5&&uMode<4.5){
                float gran=fbm(p*9.5+vec3(uTime*.12,-uTime*.08,uTime*.06)+uSeed);
                float cells=fbm(p*22.-vec3(uTime*.20));
                float spots=smoothstep(.64,.82,fbm(p*4.8+vec3(uTime*.025)+uSeed));
                float hotSpots=smoothstep(.68,.92,gran*.55+cells*.45);
                vec3 col=mix(uA,uB,smoothstep(.22,.82,gran*.6+cells*.4));
                col=mix(col,uC,hotSpots*.72);
                col*=1.-spots*.58;
                float limb=pow(max(0.,dot(vN,vV)),.48);
                col*=.58+.68*limb;
                col+=uA*rim*.35*uVfx;
                gl_FragColor=vec4(col*(.88+.34*uBright),1.);return;
              }
              vec3 col=mix(uA,uB,smoothstep(.22,.78,n));
              vec3 em=vec3(0.);
              if(uMode>1.5&&uMode<2.5){
                float swirl=fbm(vec3(p.x*4.,p.y*9.,p.z*4.)+vec3(uTime*.04,0.,0.)+uSeed);
                float band=.5+.5*sin(p.y*30.+swirl*7.5);
                col=mix(mix(uA,uB,band),uC,smoothstep(.58,.86,n2)*.55);
                float spot=exp(-pow(length(p-normalize(vec3(.25,-.28,.92)))/.19,2.));
                col=mix(col,uC*1.25,spot*.75);
              }else if(uMode>2.5&&uMode<3.5){
                float land=smoothstep(.47,.52,fbm(p*3.1+vec3(uSeed)));
                vec3 ocean=mix(vec3(.04,.20,.46),vec3(.09,.44,.72),n2);
                vec3 terra=mix(uA,uB,smoothstep(.35,.8,n2));
                col=mix(ocean,terra,land);
                float ice=smoothstep(.80,.93,abs(p.y)+n*.08);
                col=mix(col,vec3(.88,.95,1.),ice);
                float spec=pow(max(0.,dot(reflect(-normalize(vec3(-.45,.38,1.)),normalize(vN)),vV)),28.)*(1.-land)*.55;
                em+=vec3(.65,.88,1.)*spec;
              }else if(uMode>4.5&&uMode<5.5){
                float crack=smoothstep(.52,.66,abs(fbm(p*7.5+vec3(uTime*.05)+uSeed)-.5)*2.6);
                float magma=1.-crack;
                col=mix(vec3(.13,.09,.09),vec3(.28,.17,.14),n2);
                em+=mix(vec3(1.,.24,.03),vec3(1.,.82,.28),smoothstep(.2,.9,magma))*magma*(1.25+.6*uVfx);
              }else if(uMode>5.5&&uMode<6.5){
                float crack=1.-smoothstep(.02,.12,abs(fbm(p*8.5+uSeed)-.5));
                col=mix(uA,uB,smoothstep(.2,.82,n));
                col=mix(col,uC,crack*.75);
                em+=uC*crack*.45*uVfx;
              }else if(uMode>6.5){
                col=mix(vec3(.32,.14,.08),vec3(.68,.30,.12),n);
                float crack=smoothstep(.64,.82,n2);
                em+=vec3(1.,.36,.08)*crack*(.75+.4*uVfx);
              }else{
                float crater=smoothstep(.64,.74,n2);
                col=mix(col,uC,crater*.45);
                float ice=smoothstep(.88,.96,abs(p.y));
                col=mix(col,vec3(.82,.87,.92),ice*.45);
              }
              col=col*(amb+lit*(1.05-amb*.35))+uC*rim*(.22*uVfx)+em;
              gl_FragColor=vec4(col*(.85+.25*uBright),1.);
            }`,
          uniforms:{uA:{value:new THREE.Color(colorA)},uB:{value:new THREE.Color(colorB)},uC:{value:new THREE.Color(colorC)},uMode:{value:mode},uSeed:{value:(seed%997)/37},uTime:{value:0},uBright:{value:this.brightness},uVfx:{value:this.vfx},uStudio:{value:this.studioLight?1:0}}
        });
        this.materials.push(material);return material;
      }
      atmosphere(radius=1.58,color=0x7cc4ff,strength=.58){
        const m=new THREE.ShaderMaterial({
          vertexShader:`varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
          fragmentShader:`varying vec3 vN,vV;uniform vec3 uColor;uniform float uVfx,uStr;void main(){float a=pow(1.-max(0.,dot(vN,vV)),2.5);gl_FragColor=vec4(uColor,min(1.,a*uStr*uVfx));}`,
          uniforms:{uColor:{value:new THREE.Color(color)},uVfx:{value:this.vfx},uStr:{value:strength}},
          transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
        });
        this.materials.push(m);return new THREE.Mesh(new THREE.SphereGeometry(radius,48,32),m);
      }
      rings(seed,colorA=0xe6d3b0,colorB=0x9ec5e6){
        const m=new THREE.ShaderMaterial({
          vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
          fragmentShader:`varying vec3 vP;uniform vec3 uA,uB;uniform float uBright;void main(){float r=length(vP.xy);float stripes=.68+.18*sin(r*85.)+.12*sin(r*170.);float gap=1.-smoothstep(.018,.052,abs(r-2.46));float gap2=1.-smoothstep(.01,.025,abs(r-2.88));float a=stripes*(1.-gap*.85)*(1.-gap2*.6)*smoothstep(1.82,1.98,r)*(1.-smoothstep(3.02,3.28,r));vec3 col=mix(uA,uB,smoothstep(2.0,3.1,r));gl_FragColor=vec4(col*(.85+.25*uBright),a*.82);}`,
          uniforms:{uA:{value:new THREE.Color(colorA)},uB:{value:new THREE.Color(colorB)},uBright:{value:this.brightness}},
          transparent:true,side:THREE.DoubleSide,depthWrite:false
        });
        this.materials.push(m);const ring=new THREE.Mesh(new THREE.RingGeometry(1.85,3.3,180),m);ring.rotation.x=-Math.PI/2+.22;this.group.add(ring);
      }
      solarFlares(radius,color,seed){
        const grp=new THREE.Group(),rng=deterministicRandom(seed+55);
        for(let i=0;i<6;i++){
          const loopR=radius*(.14+rng()*.16);
          const m=new THREE.ShaderMaterial({
            vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
            fragmentShader:`varying vec2 vUv;uniform vec3 uColor;uniform float uVfx;void main(){float fade=sin(vUv.x*3.14159)*sin(vUv.y*3.14159);gl_FragColor=vec4(uColor,fade*.52*uVfx);}`,
            uniforms:{uColor:{value:new THREE.Color(color)},uVfx:{value:this.vfx}},transparent:true,blending:THREE.AdditiveBlending,depthWrite:false
          });
          this.materials.push(m);
          const loop=new THREE.Mesh(new THREE.TorusGeometry(loopR,radius*.026,10,36,Math.PI),m);
          const a=i/6*6.283+(rng()-.5)*.4,b=(rng()-.5)*1.2;
          const n=new THREE.Vector3(Math.cos(a)*Math.cos(b),Math.sin(b),Math.sin(a)*Math.cos(b)).normalize();
          loop.position.copy(n).multiplyScalar(radius*.92);
          loop.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);
          loop.rotateY(rng()*6.283);
          grp.add(loop);
        }
        this.group.add(grp);
        this.animations.push(t=>{grp.rotation.y=t*.07;grp.children.forEach((l,i)=>{l.scale.setScalar(.9+.14*Math.sin(t*1.5+i*1.6));});});
      }
      buildStar(temp,seed,radius=1.45,opts={}){
        const pal=opts.palette||(temp>22000?[0x3b82f6,0x93d5ff,0xffffff]:temp>11000?[0x60a5fa,0xdbeafe,0xffffff]:temp>7200?[0xbad8ff,0xf8fafc,0xfff7d6]:temp>5000?[0xd9480f,0xffa928,0xfff3b0]:temp>3800?[0xb8330a,0xf58220,0xffd68a]:[0x821309,0xe64517,0xffa64d]);
        const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,64,42),this.surface(4,pal[0],pal[1],pal[2],seed));
        this.group.add(mesh);
        this.group.add(this.sprite(pal[1],radius*3.9,.68));
        this.group.add(this.sprite(pal[0],radius*5.8,.38));
        this.group.add(this.sprite(pal[2],radius*2.8,.32,true));
        if(!opts.noFlares)this.solarFlares(radius,pal[1],seed);
        this.animations.push(t=>{mesh.rotation.y=t*.07;if(opts.pulse)mesh.scale.setScalar(1+.035*Math.sin(t*2.1));});
        return mesh;
      }
      buildProtostar(seed){
        this.buildStar(3400,seed,.75,{palette:[0x9e2a11,0xff7f32,0xffe0a3],noFlares:true,pulse:true});
        const disk=new THREE.Mesh(new THREE.RingGeometry(.95,3.25,180),new THREE.ShaderMaterial({
          vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
          fragmentShader:`varying vec3 vP;uniform float uTime,uBright;
            float h(vec2 p){p=fract(p*.1031);p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
            float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
            float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.1+3.7;a*=.5;}return v;}
            void main(){
              float r=length(vP.xy),a=atan(vP.y,vP.x),t=(r-.95)/2.3;
              float spin=a-uTime*(1.2/(.35+t));
              float swirl=fbm(vec2(cos(spin)*2.8,sin(spin)*2.8)+r*2.2);
              float dust=fbm(vec2(r*7.-uTime*.25,sin(spin*3.)*2.));
              vec3 col=mix(vec3(1.,.80,.42),vec3(.52,.18,.08),smoothstep(0.,1.,t));
              float alpha=smoothstep(.95,1.22,r)*(1.-smoothstep(2.45,3.25,r))*(.42+swirl*.65)*(.7+dust*.35);
              gl_FragColor=vec4(col*(.85+.35*uBright),min(1.,alpha*.92));
            }`,
          uniforms:{uTime:{value:0},uBright:{value:this.brightness}},side:THREE.DoubleSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
        }));
        this.materials.push(disk.material);disk.rotation.x=-Math.PI/2+.22;this.group.add(disk);
        const jetMat=new THREE.ShaderMaterial({
          vertexShader:`varying vec2 vUv;varying vec3 vN,vV;void main(){vUv=uv;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
          fragmentShader:`varying vec2 vUv;varying vec3 vN,vV;uniform float uTime,uVfx;void main(){float edge=pow(abs(dot(vN,vV)),1.6);float tip=smoothstep(0.,.18,vUv.y)*(1.-smoothstep(.35,1.,vUv.y));float pulse=.72+.28*sin(vUv.y*14.-uTime*4.0);vec3 col=mix(vec3(.92,.96,1.),vec3(.38,.76,1.),vUv.y);gl_FragColor=vec4(col,min(1.,edge*tip*pulse*.62*uVfx));}`,
          uniforms:{uTime:{value:0},uVfx:{value:this.vfx}},transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending
        });
        this.materials.push(jetMat);
        for(const s of [-1,1]){
          const jet=new THREE.Mesh(new THREE.CylinderGeometry(.32,.07,3.2,24,1,true),jetMat);
          jet.position.y=s*1.95;if(s<0)jet.rotation.z=Math.PI;this.group.add(jet);
        }
        const rng=deterministicRandom(seed+12);
        for(let i=0;i<16;i++){const sp=this.sprite(i%2?0xd96b38:0x6087c2,2.4+rng()*2,.22);sp.position.set((rng()-.5)*4.4,(rng()-.5)*1.4,(rng()-.5)*3.4);this.group.add(sp);}
        this.group.rotation.x=.22;
      }
      buildRedGiant(seed){
        this.buildStar(3100,seed,2.08,{palette:[0x8c160b,0xf9571c,0xffc978],pulse:true});
        // 地球轨道被逼近/吞没参考环
        const orbitGeo=new THREE.RingGeometry(2.38,2.43,128);
        const orbit=new THREE.Mesh(orbitGeo,new THREE.MeshBasicMaterial({color:0x7dd3fc,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));
        orbit.rotation.x=-Math.PI/2+.26;this.group.add(orbit);
        // 抛射恒星风粒子
        const rng=deterministicRandom(seed+88),cnt=700,pos=new Float32Array(cnt*3),col=new Float32Array(cnt*3);
        for(let i=0;i<cnt;i++){const r=2.15+rng()*1.7,a=rng()*6.283,ph=Math.acos(2*rng()-1);pos[i*3]=r*Math.sin(ph)*Math.cos(a);pos[i*3+1]=r*Math.cos(ph);pos[i*3+2]=r*Math.sin(ph)*Math.sin(a);new THREE.Color(i%2?0xff7a33:0xffcc80).toArray(col,i*3);}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
        const wind=new THREE.Points(g,new THREE.PointsMaterial({map:this.glow,size:.11,vertexColors:true,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending}));
        this.group.add(wind);this.animations.push(t=>{wind.rotation.y=t*.12;orbit.rotation.z=t*.05;});
      }
      buildPlanetaryWhiteDwarf(seed){
        this.buildStar(28000,seed,.26,{palette:[0xa5e8ff,0xffffff,0xffffff],noFlares:true});
        const shellIn=this.atmosphere(1.55,0x38e4ff,.95);shellIn.scale.set(1.08,.92,1.08);
        const shellOut=this.atmosphere(2.35,0xf472b6,.72);shellOut.scale.set(1.18,.88,1.12);
        this.group.add(shellIn,shellOut);
        const rng=deterministicRandom(seed+303),cnt=1800,pos=new Float32Array(cnt*3),col=new Float32Array(cnt*3);
        for(let i=0;i<cnt;i++){
          const outer=i%3!==0,r=(outer?1.85:1.2)+(rng()-.5)*.45,a=rng()*6.283,ph=Math.acos(2*rng()-1);
          pos[i*3]=r*Math.sin(ph)*Math.cos(a)*1.15;pos[i*3+1]=r*Math.cos(ph)*.88;pos[i*3+2]=r*Math.sin(ph)*Math.sin(a)*1.08;
          new THREE.Color(outer?(i%2?0xf472b6:0xa78bfa):(i%2?0x22d3ee:0x7dd3fc)).multiplyScalar(.7+rng()*.5).toArray(col,i*3);
        }
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
        const cloud=new THREE.Points(g,new THREE.PointsMaterial({map:this.glow,size:.15,vertexColors:true,transparent:true,opacity:.82,depthWrite:false,blending:THREE.AdditiveBlending}));
        this.group.add(cloud);
        for(let i=0;i<18;i++){const a=i/18*6.283;const sp=this.sprite(i%2?0x38bdf8:0xf472b6,1.6+rng()*1.2,.24);sp.position.set(Math.cos(a)*1.6,(rng()-.5)*1.2,Math.sin(a)*1.6);this.group.add(sp);}
        this.animations.push(t=>{cloud.rotation.y=t*.09;shellOut.rotation.y=-t*.05;const s=1+.04*Math.sin(t*1.2);shellIn.scale.set(1.08*s,.92*s,1.08*s);});
      }
      buildSupernova(seed){
        this.group.add(this.sprite(0xffffff,3.8,.95,true),this.sprite(0x60c8ff,5.5,.7));
        const s1=this.atmosphere(1.65,0x7dd3fc,1.1),s2=this.atmosphere(2.45,0xff8a3d,.85);this.group.add(s1,s2);
        const rng=deterministicRandom(seed+77),cnt=1600,pos=new Float32Array(cnt*3),col=new Float32Array(cnt*3);
        for(let i=0;i<cnt;i++){
          const r=.4+Math.pow(rng(),.6)*2.6,a=rng()*6.283,ph=Math.acos(2*rng()-1);
          pos[i*3]=r*Math.sin(ph)*Math.cos(a);pos[i*3+1]=r*Math.cos(ph);pos[i*3+2]=r*Math.sin(ph)*Math.sin(a);
          new THREE.Color(r<1.3?0xffffff:r<2.0?0x7dd3fc:0xff7b39).toArray(col,i*3);
        }
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
        const pts=new THREE.Points(g,new THREE.PointsMaterial({map:this.glow,size:.14,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending}));
        this.group.add(pts);
        this.animations.push(t=>{const p=1+.14*Math.sin(t*2.4);s1.scale.setScalar(p);s2.scale.setScalar(1+.18*Math.sin(t*2.4-.6));pts.rotation.y=t*.16;});
      }
      points(preset,seed,item){
        const rng=deterministicRandom(seed),isCluster=preset==='cluster',isMerger=preset==='galaxy_merger',isProto=preset==='galaxy_proto';
        const count=isCluster?2600:innerWidth<760?6800:12500;
        const pos=new Float32Array(count*3),col=new Float32Array(count*3),sz=new Float32Array(count);
        const coreCol=new THREE.Color(isProto?0x93c5fd:0xffe4a8),armCol=new THREE.Color(0x68b5ff),pinkCol=new THREE.Color(0xff6db3),outerCol=new THREE.Color(0x818cf8);
        const arms=preset==='spiral'?(item?.id==='ngc-0224'||item?.id==='ngc-5194'?2:4):3;
        const isBarred=item?.id==='milky-way'||(item?.subtype||'').includes('棒旋');
        for(let i=0;i<count;i++){
          let x,y,z,c;
          if(isMerger){
            const side=i%2?1:-1,r=Math.pow(rng(),.72)*2.1,ang=(i%2)*Math.PI+Math.log(r+.22)*3.1+(rng()-.5)*.45;
            const tail=i>count*.72;
            if(tail){const u=rng(),ta=u*3.6+(side>0?0:Math.PI),tr=1.4+u*2.4;x=Math.cos(ta)*tr;z=Math.sin(ta)*tr;y=(rng()-.5)*.35;}
            else{x=side*1.05+Math.cos(ang)*r*.75;z=side*.45+Math.sin(ang)*r*.75;y=(rng()-.5)*(.14+.5*Math.exp(-r*1.8));}
            c=tail?armCol.clone().lerp(pinkCol,rng()):coreCol.clone().lerp(i%11===0?pinkCol:armCol,Math.min(1,r/1.8));
          }else if(preset==='spiral'||isProto){
            const isCore=i<count*.18,r=isCore?Math.pow(rng(),1.5)*.9:(.28+Math.pow(rng(),.74)*2.85);
            if(isCore){
              const a=rng()*6.283,ph=Math.acos(2*rng()-1);
              x=Math.cos(a)*Math.sin(ph)*r*(isBarred?1.45:1);y=Math.cos(ph)*r*.45;z=Math.sin(a)*Math.sin(ph)*r*(isBarred?.58:1);
              c=coreCol.clone().multiplyScalar(.9+rng()*.4);
            }else{
              const armIdx=i%arms,twist=isProto?1.6:3.25;
              const angle=armIdx/arms*6.283+Math.log(r+.28)*twist+(rng()-.5)*(isProto?.95:.38+r*.06);
              x=Math.cos(angle)*r;z=Math.sin(angle)*r;y=(rng()-.5)*(.12+.48*Math.exp(-r*1.2));
              c=coreCol.clone().lerp(armCol,Math.min(1,r/1.9)).lerp(outerCol,Math.max(0,(r-1.8)/1.4));
              if(i%19===0)c.copy(pinkCol).multiplyScalar(1.25);
            }
          }else{
            const r=Math.pow(rng(),isCluster?1.45:1.25)*(isCluster?2.3:2.8),a=rng()*6.283,ph=Math.acos(2*rng()-1);
            x=Math.cos(a)*Math.sin(ph)*r*(preset==='elliptical'?1.2:1);y=Math.cos(ph)*r*(preset==='elliptical'?.72:1);z=Math.sin(a)*Math.sin(ph)*r;
            c=isCluster?(i%7===0?new THREE.Color(0x6ecbff):i%5===0?new THREE.Color(0xffcf77):new THREE.Color(0xeef6ff)):coreCol.clone().lerp(new THREE.Color(0xf6b878),r/2.8);
          }
          pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;
          c.multiplyScalar(.65+rng()*.65).toArray(col,i*3);
          sz[i]=i%47===0?(2.6+rng()*1.4):(1.0+rng()*1.25);
        }
        const g=new THREE.BufferGeometry();
        g.setAttribute('position',new THREE.BufferAttribute(pos,3));
        g.setAttribute('color',new THREE.BufferAttribute(col,3));
        g.setAttribute('aSize',new THREE.BufferAttribute(sz,1));
        const mat=new THREE.ShaderMaterial({
          vertexShader:`attribute vec3 color;attribute float aSize;varying vec3 vColor;uniform float uTime,uBright;void main(){float r=length(position.xz),a=uTime*.18/(.45+r);vec3 p=position;float c=cos(a),s=sin(a);p.xz=mat2(c,-s,s,c)*p.xz;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*22./max(1.,-mv.z),1.5,9.5);vColor=color*(.85+.35*uBright);}`,
          fragmentShader:`varying vec3 vColor;uniform float uVfx;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float core=exp(-r*r*9.);float halo=pow(1.-r,2.2)*.48*uVfx;gl_FragColor=vec4(vColor,min(1.,core+halo));}`,
          uniforms:{uTime:{value:0},uBright:{value:this.brightness},uVfx:{value:this.vfx}},
          transparent:true,blending:THREE.AdditiveBlending,depthWrite:false
        });
        this.materials.push(mat);this.group.add(new THREE.Points(g,mat));
        if(isMerger){
          const c1=this.sprite(0xffe0a3,1.8,.85);c1.position.set(1.05,0,.45);
          const c2=this.sprite(0x93c5fd,1.6,.8);c2.position.set(-1.05,0,-.45);
          this.group.add(c1,c2);
        }else if(preset==='spiral'||isProto){
          this.group.add(this.sprite(0xfff1cc,2.2,.88),this.sprite(0x60a5fa,4.8,.28));
          // 旋臂发光星云团块
          for(let i=0;i<24;i++){
            const r=.8+rng()*2.1,ang=(i%arms)/arms*6.283+Math.log(r+.28)*(isProto?1.6:3.25);
            const sp=this.sprite(i%3===0?0xf472b6:0x60a5fa,.9+rng()*.8,.24);
            sp.position.set(Math.cos(ang)*r,(rng()-.5)*.18,Math.sin(ang)*r);
            this.group.add(sp);
          }
        }else if(isCluster){
          this.group.add(this.sprite(0xffe8b8,2.6,.55),this.sprite(0x60a5fa,4.2,.24));
          for(let i=0;i<14;i++){const sp=this.sprite(i%3?0xe0f2fe:0xffd98a,.55+rng()*.55,.85,true);sp.position.set((rng()-.5)*2.4,(rng()-.5)*2.2,(rng()-.5)*2.4);this.group.add(sp);}
        }else{
          this.group.add(this.sprite(0xffe1a8,3.2,.75),this.sprite(0xf59e0b,5.2,.26));
        }
        this.group.rotation.x=preset==='spiral'?.48:.18;
      }
      nebula(seed,item){
        const rng=deterministicRandom(seed),sub=item?.subtype||'';
        const isPlanetary=/行星状/.test(sub),isSNR=/超新星/.test(sub);
        const pal=isPlanetary?[0x22d3ee,0xf472b6,0xa78bfa]:isSNR?[0x38bdf8,0xff7849,0xfef08a]:[0xf472b6,0x38bdf8,0xfbbf24];
        for(let i=0;i<36;i++){
          const rad=isPlanetary?1.35+rng()*.7:rng()*2.4,a=rng()*6.283,ph=Math.acos(2*rng()-1);
          const s=this.sprite(pal[i%pal.length],1.6+rng()*2.2,.26);
          s.position.set(Math.cos(a)*Math.sin(ph)*rad*1.2,Math.cos(ph)*rad*.85,Math.sin(a)*Math.sin(ph)*rad);
          this.group.add(s);
        }
        const g=new THREE.BufferGeometry(),n=2400,p=new Float32Array(n*3),c=new Float32Array(n*3);
        for(let i=0;i<n;i++){
          const rad=isPlanetary?(1.45+(rng()-.5)*.65):(Math.pow(rng(),.7)*2.9),a=rng()*6.283,ph=Math.acos(2*rng()-1);
          p[i*3]=Math.cos(a)*Math.sin(ph)*rad*1.2;p[i*3+1]=Math.cos(ph)*rad*.82;p[i*3+2]=Math.sin(a)*Math.sin(ph)*rad;
          new THREE.Color(pal[i%pal.length]).multiplyScalar(.65+rng()*.6).toArray(c,i*3);
        }
        g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
        const cloud=new THREE.Points(g,new THREE.PointsMaterial({map:this.glow,size:.11,vertexColors:true,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending}));
        this.group.add(cloud);
        for(let i=0;i<10;i++){const st=this.sprite(i===0?0xffffff:0xdbeafe,i===0?1.35:.65,.92,true);st.position.set((rng()-.5)*2.2,(rng()-.5)*1.6,(rng()-.5)*1.8);this.group.add(st);}
        this.animations.push(t=>{this.group.rotation.y=t*.06;});
      }
      blackhole(mode='default'){
        const isQuasar=mode==='quasar',isDormant=mode==='dormant_bh';
        const hole=new THREE.Mesh(new THREE.SphereGeometry(.82,64,42),new THREE.MeshBasicMaterial({color:0x000000}));
        this.group.add(hole);
        const photonRing=new THREE.Mesh(new THREE.TorusGeometry(.88,.024,16,180),new THREE.MeshBasicMaterial({color:isDormant?0x93c5fd:0xfff3d1,transparent:true,opacity:isDormant?.55:.95,blending:THREE.AdditiveBlending}));
        this.group.add(photonRing);
        this.group.add(this.sprite(isDormant?0x60a5fa:0xff9f43,isQuasar?4.8:3.4,isDormant?.22:.38));
        if(!isDormant){
          const diskShader=new THREE.ShaderMaterial({
            vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
            fragmentShader:`varying vec3 vP;uniform float uTime,uBright,uBoost;
              float h(vec2 p){p=fract(p*.1031);p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
              float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
              float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.1+4.3;a*=.5;}return v;}
              void main(){
                float r=length(vP.xy),a=atan(vP.y,vP.x),t=(r-.95)/2.25;
                float spin=a-uTime*(1.6/(.28+t));
                float swirl=fbm(vec2(cos(spin)*3.2,sin(spin)*3.2)+r*2.4);
                float wisps=fbm(vec2(r*9.-uTime*.4,sin(spin*2.)*2.5+cos(spin*2.)*2.5));
                float doppler=.68+.55*cos(a-.45);
                vec3 hot=vec3(.92,.96,1.),mid=vec3(1.,.62,.20),cool=vec3(.65,.14,.03);
                vec3 col=mix(mix(hot,mid,smoothstep(0.,.42,t)),cool,smoothstep(.32,1.,t));
                col*=doppler*uBoost*(.55+swirl*.75+wisps*.4);
                float alpha=smoothstep(.95,1.18,r)*(1.-smoothstep(2.25,3.18,r))*(.52+swirl*.58);
                gl_FragColor=vec4(col*(.85+.3*uBright),min(1.,alpha*.95));
              }`,
            uniforms:{uTime:{value:0},uBright:{value:this.brightness},uBoost:{value:isQuasar?1.45:1.08}},
            side:THREE.DoubleSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
          });
          this.materials.push(diskShader);
          const disk=new THREE.Mesh(new THREE.RingGeometry(.95,3.18,192),diskShader);disk.rotation.x=-Math.PI/2+.16;this.group.add(disk);
          const lensMat=diskShader.clone();lensMat.uniforms={uTime:{value:0},uBright:{value:this.brightness},uBoost:{value:.68}};this.materials.push(lensMat);
          const lens=new THREE.Mesh(new THREE.RingGeometry(.92,1.58,160),lensMat);lens.rotation.x=.08;this.group.add(lens);
          const jetMat=new THREE.ShaderMaterial({
            vertexShader:`varying vec2 vUv;varying vec3 vN,vV;void main(){vUv=uv;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
            fragmentShader:`varying vec2 vUv;varying vec3 vN,vV;uniform float uTime,uVfx,uBoost;void main(){float edge=pow(abs(dot(vN,vV)),1.5);float tip=smoothstep(0.,.18,vUv.y)*(1.-smoothstep(.35,1.,vUv.y));float pulse=.72+.28*sin(vUv.y*16.-uTime*4.5);vec3 col=mix(vec3(.88,.96,1.),vec3(.35,.72,1.),vUv.y);gl_FragColor=vec4(col,min(1.,edge*tip*pulse*uBoost*uVfx));}`,
            uniforms:{uTime:{value:0},uVfx:{value:this.vfx},uBoost:{value:isQuasar?.92:.58}},transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending
          });
          this.materials.push(jetMat);
          for(const s of [-1,1]){
            const jetH=isQuasar?4.4:3.2,jetR=isQuasar?.42:.24;
            const jet=new THREE.Mesh(new THREE.CylinderGeometry(jetR,jetR*.18,jetH,24,1,true),jetMat);
            jet.position.y=s*(jetH*.5+.65);if(s<0)jet.rotation.z=Math.PI;this.group.add(jet);
          }
        }
        this.group.rotation.x=.22;
        this.animations.push(t=>{photonRing.rotation.z=t*.2;});
      }
      buildPulsar(seed){
        this.buildStar(45000,seed,.42,{palette:[0x7dd3fc,0xe0f7ff,0xffffff],noFlares:true});
        const jets=new THREE.Group();
        for(const side of [-1,1]){
          const jet=new THREE.Mesh(new THREE.ConeGeometry(.28,3.8,24,1,true),new THREE.MeshBasicMaterial({color:0x60d5ff,transparent:true,opacity:.52,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
          jet.position.y=side*2.1;if(side<0)jet.rotation.z=Math.PI;jet.userData.baseOpacity=.52;this.vfxNodes.push(jet);jets.add(jet);
        }
        for(let i=0;i<6;i++){
          const loop=new THREE.Mesh(new THREE.TorusGeometry(1.05,.014,8,64),new THREE.MeshBasicMaterial({color:0x93c5fd,transparent:true,opacity:.35,blending:THREE.AdditiveBlending}));
          loop.rotation.y=i/6*Math.PI;loop.position.x=Math.cos(i/6*Math.PI)*.45;loop.position.z=Math.sin(i/6*Math.PI)*.45;jets.add(loop);
        }
        jets.rotation.z=.48;this.group.add(jets);this.animations.push(t=>{jets.rotation.y=t*1.25;});
      }
      select(item,stageMode='default'){
        this.init();if(!this.ready)return;
        this.currentItem=item;this.currentStageMode=stageMode;
        this.clear();this.controls.reset();this.camera.position.set(0,.45,7.2);this.controls.target.set(0,0,0);
        const preset=item.visual?.preset||'rocky',seed=item.visual?.seed||17;
        const mode=stageMode==='default'?preset:stageMode;
        this.defaultDistance=['earth','rocky','gas','ice','ocean','lava','scorched','star','star_blue','asteroid'].includes(mode)?5.9:['elliptical','cluster','redgiant','planetary_wd'].includes(mode)?8.4:7.4;
        this.camera.position.z=this.defaultDistance;

        if(mode==='protostar')this.buildProtostar(seed);
        else if(mode==='redgiant')this.buildRedGiant(seed);
        else if(mode==='planetary_wd')this.buildPlanetaryWhiteDwarf(seed);
        else if(mode==='supernova')this.buildSupernova(seed);
        else if(mode==='star_blue')this.buildStar(18000,seed,1.42);
        else if(['spiral','elliptical','cluster','galaxy_proto','galaxy_merger'].includes(mode))this.points(mode,seed,item);
        else if(mode==='nebula')this.nebula(seed,item);
        else if(['blackhole','quasar','dormant_bh'].includes(mode))this.blackhole(mode==='blackhole'?'default':mode);
        else if(mode==='pulsar')this.buildPulsar(seed);
        else if(mode==='binary'){
          const a=new THREE.Mesh(new THREE.SphereGeometry(.76,48,32),this.surface(4,0xf59e0b,0xffe8a3,0xffffff,seed));
          const b=new THREE.Mesh(new THREE.SphereGeometry(.50,48,32),this.surface(4,0x60b6ff,0xe0f2fe,0xffffff,seed+1));
          const ha=this.sprite(0xffcf77,2.4,.55),hb=this.sprite(0x7dd3fc,1.7,.55);
          this.group.add(a,b,ha,hb);
          this.animations.push(t=>{a.position.set(Math.cos(t*.45)*.95,0,Math.sin(t*.45)*.95);b.position.set(-Math.cos(t*.45)*1.65,0,-Math.sin(t*.45)*1.65);ha.position.copy(a.position);hb.position.copy(b.position);});
        }else if(mode==='ringworld'){
          const ring=new THREE.Mesh(new THREE.TorusGeometry(2.25,.12,18,192),new THREE.MeshStandardMaterial({color:0x93d5e6,emissive:0x1b4f6e,emissiveIntensity:.5,metalness:.6,roughness:.32}));
          ring.rotation.x=.48;this.group.add(ring);this.buildStar(5800,seed,.36,{noFlares:true});
          for(let i=0;i<56;i++){const tower=new THREE.Mesh(new THREE.BoxGeometry(.055,.07,.16),new THREE.MeshStandardMaterial({color:0xb8e6ff,emissive:0x38bdf8,emissiveIntensity:.8}));const a=i/56*6.283;tower.position.set(Math.cos(a)*2.25,Math.sin(a)*2.25,0);ring.add(tower);}
          this.animations.push(t=>{ring.rotation.z=t*.16;});
        }else if(mode==='comet'){
          const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.42,1),new THREE.MeshStandardMaterial({color:0xb8d4e3,roughness:.85,emissive:0x1e3a5f,emissiveIntensity:.3}));
          this.group.add(rock,this.sprite(0x7dd3fc,1.7,.68));
          for(let i=0;i<2;i++){
            const tail=new THREE.Mesh(new THREE.ConeGeometry(.55+i*.25,4.6-i*.6,28,1,true),new THREE.MeshBasicMaterial({color:i?0xfcd34d:0x38bdf8,transparent:true,opacity:i?.28:.42,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
            tail.rotation.x=Math.PI/2+i*.14;tail.position.set(i*.35,0,-2.2+i*.25);tail.userData.baseOpacity=i?.28:.42;this.vfxNodes.push(tail);this.group.add(tail);
          }
          this.group.rotation.y=-.55;this.animations.push(t=>{rock.rotation.x=t*.4;rock.rotation.y=t*.55;});
        }else if(mode==='dyson'){
          this.buildStar(5900,seed,.92);
          const swarm=new THREE.Group(),rng=deterministicRandom(seed);
          for(let i=0;i<140;i++){
            const a=rng()*6.283,p=Math.acos(2*rng()-1),r=1.85+(i%3)*.22;
            const sat=new THREE.Mesh(new THREE.BoxGeometry(.12,.03,.20),new THREE.MeshStandardMaterial({color:0x7cc4ff,emissive:0x2563eb,emissiveIntensity:.55,metalness:.7,roughness:.3}));
            sat.position.set(Math.sin(p)*Math.cos(a)*r,Math.cos(p)*r,Math.sin(p)*Math.sin(a)*r);sat.lookAt(0,0,0);swarm.add(sat);
          }
          this.group.add(swarm);this.animations.push(t=>{swarm.rotation.y=t*.16;swarm.rotation.x=Math.sin(t*.12)*.15;});
        }else if(mode==='star'){
          const temp=Number(item.facts?.tempK)||5772;
          const isWD=/白矮星/.test(item.subtype||'');
          this.buildStar(temp,seed,isWD?.78:1.45,{noFlares:isWD});
        }else{
          const temp=Number(item.facts?.tempK)||280;
          const isHotLava=mode==='lava'||(mode==='rocky'&&temp>950);
          const isGas=['gas','ring'].includes(mode),isEarth=mode==='earth'||mode==='ocean',isIce=mode==='ice',isScorched=mode==='scorched';
          const textureKey=stageMode==='default'?{earth:'earth_blue_marble.jpg',moon:'moon_regolith.jpg',jupiter:'jupiter.jpg',saturn:'saturn.jpg',mars:'mars.jpg'}[item.id]:null;
          const rng=deterministicRandom(seed+17);
          const gasPalettes=[[0xd99b66,0xf4e1c1,0xc95f3c],[0x3b82f6,0x93c5fd,0x1d4ed8],[0xc08457,0xf5d6a7,0x8b4513],[0x7c3aed,0xc4b5fd,0xf472b6]];
          const rockyPalettes=[[0x8a5a44,0xd69f7e,0xe6ccb2],[0x64748b,0xcbd5e1,0xf1f5f9],[0x9a6b38,0xe8c382,0xfff3d1],[0x5b6b5d,0xa3b18a,0xdad7cd]];
          let cA,cB,cC,surfMode;
          if(isHotLava){surfMode=5;cA=0x261414;cB=0xff5a1f;cC=0xffc857;}
          else if(isScorched){surfMode=7;cA=0x4a2010;cB=0xc45a28;cC=0xff9248;}
          else if(isGas){surfMode=2;const gp=item.id==='exo-hd-189733-b'?gasPalettes[1]:gasPalettes[Math.floor(rng()*gasPalettes.length)];[cA,cB,cC]=gp;}
          else if(isEarth){surfMode=3;cA=0x2d7d46;cB=0xc2b280;cC=0x7cc4ff;}
          else if(isIce){surfMode=6;cA=item.id==='neptune'?0x1d4ed8:0x4b8fb3;cB=item.id==='neptune'?0x60a5fa:0xdaf4ff;cC=0x67e8f9;}
          else{surfMode=1;const rp=item.id==='venus'?rockyPalettes[2]:item.id==='mars'?rockyPalettes[0]:rockyPalettes[Math.floor(rng()*rockyPalettes.length)];[cA,cB,cC]=rp;}
          const material=this.surface(surfMode,cA,cB,cC,seed);
          const geo=mode==='asteroid'?new THREE.DodecahedronGeometry(1.25,2):new THREE.SphereGeometry(1.5,64,42);
          const mesh=new THREE.Mesh(geo,material);
          this.group.add(mesh);
          if(textureKey&&BOOK_TEXTURES[textureKey]){
            const texture=new THREE.TextureLoader().load(BOOK_TEXTURES[textureKey],()=>this.frame(0));
            texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());
            this.ownedTextures.push(texture);mesh.material.dispose();
            mesh.material=new THREE.MeshStandardMaterial({map:texture,roughness:.85,metalness:.04});
          }
          this.animations.push(t=>{mesh.rotation.y=t*.12;});
          if(isEarth)this.group.add(this.atmosphere(1.58,0x6ecbff,.72));
          else if(isGas)this.group.add(this.atmosphere(1.57,cB,.48));
          else if(isIce)this.group.add(this.atmosphere(1.57,0x7dd3fc,.62));
          else if(isHotLava||isScorched){this.group.add(this.atmosphere(1.58,0xff6b2b,.68));this.group.add(this.sprite(0xff6b2b,4.0,.28));}
          else if(item.id==='venus'||item.id==='mars')this.group.add(this.atmosphere(1.57,item.id==='venus'?0xfbbf24:0xfb923c,.52));
          if(mode==='ring'||item.id==='uranus'){this.rings(seed,item.id==='uranus'?0x93c5fd:0xe6d3b0,item.id==='uranus'?0xe0f2fe:0xa8c5e6);this.group.rotation.z=item.id==='uranus'?1.2:.24;}
          if(isEarth){
            const clouds=new THREE.Mesh(new THREE.SphereGeometry(1.518,48,32),new THREE.ShaderMaterial({
              vertexShader:`varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
              fragmentShader:`varying vec3 vP;uniform float uTime,uVfx;void main(){float n=.5+.18*sin(vP.x*22.+sin(vP.z*14.)*3.+uTime*.06)+.16*sin(vP.y*29.+vP.z*16.)+.1*cos(vP.x*44.-vP.y*20.);float a=smoothstep(.64,.85,n)*.52*min(1.3,uVfx);gl_FragColor=vec4(.95,.98,1.,a);}`,
              uniforms:{uTime:{value:0},uVfx:{value:this.vfx}},transparent:true,depthWrite:false
            }));
            this.materials.push(clouds.material);this.group.add(clouds);
          }
        }
        this.applyVisualSettings();this.resize();this.frame(0);
      }
      frame(dt){
        if(!this.ready)return;
        if(!this.paused)this.time+=dt*this.spin;
        for(const m of this.materials)if(m.uniforms?.uTime)m.uniforms.uTime.value=this.time;
        for(const a of this.animations)a(this.time);
        this.controls.update();this.renderer.render(this.scene,this.camera);
      }
      reset(){if(!this.ready)return;this.controls.reset();this.camera.position.set(0,.45,this.defaultDistance||7.2);this.controls.target.set(0,0,0);this.frame(0);}
    }
