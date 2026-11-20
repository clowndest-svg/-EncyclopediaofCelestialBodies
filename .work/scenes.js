    let bhShaderMat, bhMesh, bhJetsGroup, bhDust, bhDustData, bhJetPoints;
    let l3Points, l3M87Jet, galaxyDust, galaxyNebula, galaxyCoreSprite, galaxyKnots=[], galaxyTracers=[];
    let clusterNodes=[], clusterParticles=[], clusterFlow, clusterTails=[], clusterOrbits=[];
    let webNodes=[], webEdges=[], webParticles=[], webFlow, webTails=[];
    const SOFT_PARTICLE_FRAG = `
      varying vec3 vColor; varying float vAlpha;
      void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float core=exp(-r*r*19.);float halo=pow(1.-r,2.)*.26;gl_FragColor=vec4(vColor,(core+halo)*vAlpha);}
    `;
    const JET_VERT = `
      attribute float aPhase; attribute float aSide; attribute float aSeed; uniform float uTime; uniform float uVfx;
      varying vec3 vColor; varying float vAlpha;
      void main(){float t=fract(aPhase+uTime*(.14+aSeed*.085));float y=4.+t*88.;float angle=aSeed*96.+t*16.-uTime*2.6;float r=(.15+t*3.1)*(.25+aSeed*.75);vec3 p=vec3(cos(angle)*r,aSide*y,sin(angle)*r);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((1.2+aSeed)*240.*(0.6+0.45*uVfx)/max(1.,-mv.z),1.2,22.);vColor=mix(vec3(.82,.94,1.),vec3(.25,.55,1.),t);vAlpha=min(1.,(1.-t)*.92*uVfx);}
    `;
    function makeJets(count=2400) {
      const rng=deterministicRandom(89),geo=new THREE.BufferGeometry();
      geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3));
      for(const attr of ['aPhase','aSide','aSeed']){const a=new Float32Array(count);for(let i=0;i<count;i++)a[i]=attr==='aSide'?(i%2?1:-1):rng();geo.setAttribute(attr,new THREE.BufferAttribute(a,1));}
      const pts=new THREE.Points(geo,new THREE.ShaderMaterial({vertexShader:JET_VERT,fragmentShader:SOFT_PARTICLE_FRAG,uniforms:{uTime:{value:0},uVfx:{value:1}},transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));pts.frustumCulled=false;return pts;
    }
    function buildL2BlackHole() {
      const g=scaleGroups.L2;
      bhShaderMat=new THREE.ShaderMaterial({vertexShader:BLACKHOLE_VERT,fragmentShader:BLACKHOLE_FRAG,uniforms:{uLocalCam:{value:new THREE.Vector3(0,13,64)},uTime:{value:0},uBoundRadius:{value:40},uEventRadius:{value:3.5},uDiskInner:{value:6.8},uDiskOuter:{value:28},uBrightness:{value:.82}},side:THREE.BackSide,transparent:true,depthWrite:false});
      bhMesh=new THREE.Mesh(new THREE.SphereGeometry(40,48,32),bhShaderMat);bhMesh.renderOrder=2;g.add(bhMesh);
      bhJetsGroup=new THREE.Group();bhJetPoints=makeJets(2400);bhJetsGroup.add(bhJetPoints);g.add(bhJetsGroup);
      const count=2600,rng=deterministicRandom(21),pos=new Float32Array(count*3),col=new Float32Array(count*3);bhDustData=[];
      for(let i=0;i<count;i++){const r=28+rng()*11,a=rng()*Math.PI*2;bhDustData.push({r,phase:a,seed:rng(),initialR:r,initialPhase:a});const hot=i%5===0;const c=hot?new THREE.Color().setRGB(.78,.88,1.):new THREE.Color().setRGB(.98,.46+rng()*.32,.14);c.toArray(col,i*3);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));bhDust=glowPoints(geo,.62,.74);bhDust.frustumCulled=false;g.add(bhDust);
      [8,14,23,34].forEach((r,i)=>{const o={a:r,e:.04,inclination:.025,argument:0};layerGroup('L2','paths').add(makeLine(Array.from({length:161},(_,j)=>orbitPoint(o,j/160*Math.PI*2)),TRAJECTORY_COLOR,i===3?.28:.1));});
      for(let i=0;i<10;i++){const a=i/10*Math.PI*2,p=new THREE.Vector3(Math.cos(a)*33,0,Math.sin(a)*33);layerGroup('L2','forces').add(new THREE.ArrowHelper(p.clone().negate().normalize(),p,6,FORCE_COLOR,1,.4));}
      updateL2(0);
    }
    function updateL2(dt) {
      motion.phase.L2+=dt*1.55*Math.sqrt(dynamics.gravity);const time=motion.phase.L2;bhShaderMat.uniforms.uTime.value=time;bhJetPoints.material.uniforms.uTime.value=time*1.35;
      const pos=bhDust.geometry.attributes.position;
      bhDustData.forEach((d,i)=>{
        const period=(d.initialR-6.9)/.55,age=(time+d.seed*period)%period;d.r=d.initialR-age*.55;
        d.phase=d.initialPhase+Math.sqrt(3100)*2/.55*(1/Math.sqrt(d.r)-1/Math.sqrt(d.initialR));
        pos.setXYZ(i,Math.cos(d.phase)*d.r,Math.sin(d.phase*3+d.seed*19)*.18*(d.r/20),Math.sin(d.phase)*d.r);
      });pos.needsUpdate=true;
    }
    const GALAXY_VERT = `
      attribute vec3 color;attribute float aOmega;attribute float aSize;attribute vec3 aAxis;
      uniform float uTime;uniform float uPixelRatio;uniform float uRing;uniform float uStardust;
      varying vec3 vColor;varying float vAlpha;
      void main(){float a=uTime*aOmega;vec3 axis=normalize(aAxis);vec3 p=position*cos(a)+cross(axis,position)*sin(a)+axis*dot(axis,position)*(1.-cos(a));float r=length(p.xz);p+=axis*sin(uTime*aOmega*2.3+position.x)*(.3+r*.015);if(uRing>.5&&r>55.)p.xz*=1.+min(.2,uTime*.0025);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uPixelRatio*290.*(0.65+0.42*uStardust)/max(1.,-mv.z),1.15,14.);vColor=color;vAlpha=clamp(.82*uStardust,0.12,1.0);}
    `;
    function generateGalaxyData(morph) {
      const count=document.body.dataset.layout==='mobile'?50000:85000;
      const rng=deterministicRandom(154),pos=new Float32Array(count*3),col=new Float32Array(count*3),omega=new Float32Array(count),size=new Float32Array(count),axis=new Float32Array(count*3);
      const core=new THREE.Color(0xffdeb0),blue=new THREE.Color(0x9ebdea),outer=new THREE.Color(0x7084b9),pink=new THREE.Color(0xe6a6be),tmp=new THREE.Color();
      for(let i=0;i<count;i++){
        let r,a,y,x,z,spherical=false;
        const u=rng(),v=rng();
        if(morph==='m87'||(morph==='sombrero'&&i<count*.52)||(i<count*.16&&morph!=='cartwheel')){
          spherical=true;r=Math.pow(u,1.6)*(morph==='m87'?78:morph==='sombrero'?34:15);a=v*Math.PI*2;const ph=Math.acos(2*rng()-1);x=r*Math.sin(ph)*Math.cos(a);z=r*Math.sin(ph)*Math.sin(a);y=r*Math.cos(ph)*(morph==='m87'?.75:.65);if(morph==='m87')x*=1.15;
        }else if(morph==='cartwheel'){
          if(i<count*.16){r=Math.pow(u,1.6)*18;a=v*6.283;}else if(i<count*.37){r=18+u*54;a=(i%10)/10*6.283+r*.017+(v-.5)*.10;}else{r=73+(u+v-1)*9;a=rng()*6.283;}x=Math.cos(a)*r;z=Math.sin(a)*r;y=(rng()-.5)*2;
        }else{
          r=8+Math.pow(u,.78)*86;
          if(morph==='sombrero')a=v*6.283;
          else{const arms=morph==='andromeda'?2:4;a=(i%arms)/arms*6.283+Math.log(r/12)*(morph==='andromeda'?3.4:3.1)+(v-.5)*(.40+r*.0045);if(i%6===0)a=rng()*6.283;}
          x=Math.cos(a)*r;z=Math.sin(a)*r;y=(rng()-.5)*(2.0+6*Math.exp(-r/20));
          if(morph==='milkyway'&&r<24)z*=.42;
        }
        pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;
        const t=Math.min(1,r/90);tmp.copy(core).lerp(morph==='sombrero'||morph==='m87'?core:blue,Math.min(1,t*2)).lerp(outer,Math.max(0,t-.6)*1.3);
        if(morph==='cartwheel'&&r>65)tmp.copy(i%9===0?pink:blue);
        if(!spherical&&i%83===0)tmp.copy(pink);
        const brightness=.42+rng()*.6;tmp.multiplyScalar(brightness);tmp.toArray(col,i*3);
        const n=8/Math.sqrt(r*r+100);
        omega[i]=spherical?n*(rng()*.7+.3)*(i%2?1:-1):n;
        size[i]=i%97===0?1.6:.35+rng()*.55;
        const av=spherical?new THREE.Vector3(rng()-.5,rng()-.5,rng()-.5).normalize():new THREE.Vector3(0,1,0);av.toArray(axis,i*3);
      }
      return {pos,col,omega,size,axis};
    }
    function galaxyNebulaTexture(morph) {
      const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
      const ctx=canvas.getContext('2d'),image=ctx.createImageData(512,512),data=image.data;
      for(let y=0;y<512;y++)for(let x=0;x<512;x++){
        const px=(x-256)/2.45,pz=(y-256)/2.45,r=Math.hypot(px,pz),a=Math.atan2(pz,px);
        const noise=.5+.19*Math.sin(px*.39+Math.sin(pz*.21)*3)+.15*Math.sin(pz*.72-px*.24)+.12*Math.cos(px*.12+pz*.18);
        const fade=Math.exp(-Math.pow(r/85,4));let density=0;
        if(morph==='m87')density=.20*Math.exp(-r*r/950)+.025*Math.exp(-r*r/3800);
        else if(morph==='sombrero')density=.055*Math.exp(-Math.pow((r-56)/19,2))+.24*Math.exp(-r*r/230);
        else if(morph==='cartwheel'){
          density=.10*Math.exp(-Math.pow((r-73)/4.2,2));
          if(r>16&&r<72)density+=.024*Math.pow(.5+.5*Math.cos(a*10-r*.15),12);
          density+=.20*Math.exp(-r*r/85);
        }else{
          const arms=morph==='andromeda'?2:4,pitch=morph==='andromeda'?3.4:3.1;
          const arm=Math.pow(.5+.5*Math.cos(arms*(a-Math.log(Math.max(r,8)/12)*pitch)),6);
          density=(.014+arm*.095)*fade;
          density+=.18*Math.exp(-r*r/160);
          if(morph==='milkyway')density+=.09*Math.exp(-px*px/400-pz*pz/28);
        }
        density*=.34+.66*Math.max(0,noise)*Math.max(0,noise);
        const warm=Math.exp(-r*r/400),i=(y*512+x)*4;
        data[i]=Math.round(113+warm*111);data[i+1]=Math.round(153+warm*41);data[i+2]=Math.round(204-warm*59);data[i+3]=Math.round(Math.min(.3,density)*255);
      }
      ctx.putImageData(image,0,0);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
    }
    function setGalaxyData(morph) {
      const data=generateGalaxyData(morph),geo=l3Points.geometry;
      for(const [attr,key,n] of [['position','pos',3],['color','col',3],['aOmega','omega',1],['aSize','size',1],['aAxis','axis',3]])geo.setAttribute(attr,new THREE.BufferAttribute(data[key],n));
      geo.computeBoundingSphere();l3Points.frustumCulled=false;l3Points.material.uniforms.uRing.value=morph==='cartwheel'?1:0;
      if(galaxyNebula){galaxyNebula.material.map.dispose();galaxyNebula.material.map=galaxyNebulaTexture(morph);galaxyNebula.material.needsUpdate=true;}
    }
    function buildL3Galaxy() {
      const g=scaleGroups.L3;l3Points=new THREE.Points(new THREE.BufferGeometry(),new THREE.ShaderMaterial({vertexShader:GALAXY_VERT,fragmentShader:SOFT_PARTICLE_FRAG,uniforms:{uTime:{value:0},uPixelRatio:{value:renderer.getPixelRatio()},uRing:{value:0},uStardust:{value:1}},transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));g.add(l3Points);setGalaxyData('milkyway');
      galaxyNebula=new THREE.Mesh(new THREE.PlaneGeometry(216,216),new THREE.MeshBasicMaterial({map:galaxyNebulaTexture('milkyway'),transparent:true,opacity:.76,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));galaxyNebula.rotation.x=-Math.PI/2;galaxyNebula.position.y=-.8;galaxyNebula.renderOrder=-1;g.add(galaxyNebula);
      galaxyCoreSprite=glowSprite(0xffe2b4,26,.48);galaxyCoreSprite.position.y=.8;g.add(galaxyCoreSprite);
      const dustMat=new THREE.ShaderMaterial({vertexShader:BLACKHOLE_VERT,fragmentShader:`varying vec3 vLocalPos;uniform float uTime;uniform float uSombrero;void main(){float r=length(vLocalPos.xy);float a=atan(vLocalPos.y,vLocalPos.x);float spiral=.5+.5*sin(a*4.-log(max(r,1.))*11.-uTime*.13);float band=smoothstep(18.,35.,r)*(1.-smoothstep(79.,97.,r));float opacity=band*(uSombrero>.5?.57:pow(spiral,8.)*.20);gl_FragColor=vec4(.012,.009,.015,opacity);}`,uniforms:{uTime:{value:0},uSombrero:{value:0}},transparent:true,side:THREE.DoubleSide,depthWrite:false});
      galaxyDust=new THREE.Mesh(new THREE.RingGeometry(16,97,128),dustMat);galaxyDust.rotation.x=-Math.PI/2;galaxyDust.position.y=.9;galaxyDust.renderOrder=3;g.add(galaxyDust);
      l3M87Jet=makeJets(1200);l3M87Jet.rotation.z=-.48;l3M87Jet.visible=false;g.add(l3M87Jet);
      buildGalaxyKnots();
      buildGalaxyTracers();
    }
    function buildGalaxyKnots() {
      galaxyKnots.forEach(k=>disposeTree(k.sprite));galaxyKnots=[];
      if(state.galaxyMorph==='m87')return;
      const rng=deterministicRandom(311),arms=state.galaxyMorph==='andromeda'?2:4,pitch=state.galaxyMorph==='andromeda'?3.4:3.1;
      for(let i=0;i<32;i++){
        const r=state.galaxyMorph==='cartwheel'?70+(rng()-.5)*8:18+rng()*68;
        const a=(i%arms)/arms*Math.PI*2+Math.log(Math.max(r,8)/12)*pitch+(rng()-.5)*.28;
        const isPink=i%3!==0;
        const sprite=glowSprite(isPink?0xf472b6:0x7dd3fc,5.5+rng()*6.5,isPink?.36:.30);
        sprite.position.set(Math.cos(a)*r,(rng()-.5)*2.4,Math.sin(a)*r);
        scaleGroups.L3.add(sprite);
        galaxyKnots.push({sprite,r,phase:a,y:(rng()-.5)*2.4,baseScale:sprite.scale.x,seed:rng()*6.28});
      }
    }
    function buildGalaxyTracers() {
      galaxyTracers.forEach(t=>{disposeTree(t.dot);disposeTree(t.path);disposeTree(t.tail);disposeTree(t.arrow);});galaxyTracers=[];
      for(let i=0;i<10;i++){
        const isSun=i===5;
        const r=isSun?52:14+i*7.6,phase=i*2.3,axis=state.galaxyMorph==='m87'?new THREE.Vector3(Math.sin(i),.4,Math.cos(i)).normalize():new THREE.Vector3(0,1,0);
        const base=new THREE.Vector3(r,0,0);const point=a=>base.clone().multiplyScalar(1+.035*Math.cos(a*1.4+phase)).applyAxisAngle(axis,a).addScaledVector(axis,Math.sin(a*2.3+phase)*(.3+r*.015));
        const dot=new THREE.Mesh(new THREE.SphereGeometry(isSun?1.05:.48,12,12),new THREE.MeshBasicMaterial({color:isSun?0xffe082:0xf5f8ff}));
        if(isSun){const halo=glowSprite(0xffc966,11.5,.75);dot.add(halo);dot.userData.halo=halo;}
        scaleGroups.L3.add(dot);
        const path=makeLine(Array.from({length:161},(_,j)=>point(j/160*Math.PI*2)),isSun?0xfbbf24:TRAJECTORY_COLOR,isSun?.24:.045);layerGroup('L3','paths').add(path);
        const len=isSun?72:48;
        const tail=makeLine(Array.from({length:len},(_,j)=>point(phase-j*.01)),isSun?0xfde047:TRAJECTORY_COLOR,isSun?.95:.82);layerGroup('L3','paths').add(tail);
        const arrow=new THREE.ArrowHelper(new THREE.Vector3(-1,0,0),base,6,FORCE_COLOR,1,.45);layerGroup('L3','forces').add(arrow);
        galaxyTracers.push({r,phase,axis,point,dot,path,tail,arrow,isSun,len,history:Array.from({length:len},()=>point(phase))});
      }
    }
    function switchGalaxyMorph(morph) {
      state.galaxyMorph=morph;dynamics.sceneTime.L3=0;motion.phase.L3=0;setGalaxyData(morph);buildGalaxyKnots();buildGalaxyTracers();l3M87Jet.visible=morph==='m87';galaxyDust.visible=morph!=='m87';galaxyDust.material.uniforms.uSombrero.value=morph==='sombrero'?1:0;
      document.querySelectorAll('.gal-btn').forEach(b=>b.classList.toggle('active',b.dataset.gal===morph));
      const names={milkyway:'银河系棒旋',andromeda:'仙女座 M31',sombrero:'草帽星系 M104',m87:'室女座 M87',cartwheel:'车轮碰撞星系'};
      document.getElementById('scene-title').textContent=names[morph]+' · 恒星动力学';renderLargeScaleFacts();updateDynamicsValues();syncDynamicsUI();showToast('已切换到'+names[morph]);
    }
    function updateL3(dt) {
      motion.phase.L3+=dt*1.95*Math.sqrt(dynamics.gravity);const time=motion.phase.L3;galaxyNebula.rotation.z=-time*.058;l3Points.material.uniforms.uTime.value=time;l3Points.material.uniforms.uPixelRatio.value=renderer.getPixelRatio();galaxyDust.material.uniforms.uTime.value=time;l3M87Jet.material.uniforms.uTime.value=time*1.35;
      for(const k of galaxyKnots){const a=k.phase+time*8/Math.sqrt(k.r*k.r+100);k.sprite.position.set(Math.cos(a)*k.r,k.y+Math.sin(a*2.3+k.seed)*.55,Math.sin(a)*k.r);const s=k.baseScale*(.88+.2*Math.sin(time*2.2+k.seed));k.sprite.scale.set(s,s,1);}
      for(const t of galaxyTracers){const a=t.phase+time*8/Math.sqrt(t.r*t.r+100);t.dot.position.copy(t.point(a));if(t.dot.userData.halo){const p=10.5+2.6*Math.sin(time*3.4);t.dot.userData.halo.scale.set(p,p,1);}if(dt>0){t.history.shift();t.history.push(t.dot.position.clone());}const attr=t.tail.geometry.attributes.position;for(let j=0;j<t.len;j++){const p=t.history[j];attr.setXYZ(j,p.x,p.y,p.z);}attr.needsUpdate=true;t.tail.geometry.computeBoundingSphere();t.arrow.position.copy(t.dot.position);t.arrow.setDirection(t.dot.position.clone().negate().normalize());}
    }
    function galaxyStampTexture() {
      const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.translate(64,64);ctx.scale(1,.58);
      const grad=ctx.createRadialGradient(0,0,0,0,0,58);grad.addColorStop(0,'#fff6d7');grad.addColorStop(.09,'#c6d7f5cc');grad.addColorStop(.3,'#7c9dc044');grad.addColorStop(1,'#55779c00');ctx.fillStyle=grad;ctx.fillRect(-64,-110,128,220);
      for(let arm=0;arm<2;arm++){ctx.beginPath();for(let i=0;i<90;i++){const r=5+i*.55,a=i*.077+arm*Math.PI;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle='#b5d0f270';ctx.lineWidth=2;ctx.stroke();}return new THREE.CanvasTexture(c);
    }
    function buildL4Supercluster() {
      const g=scaleGroups.L4,rng=deterministicRandom(175),positions=[[0,0,0],[65,18,-35],[-72,-14,42],[42,-32,68],[-55,36,-60],[90,-10,25],[-25,48,55],[18,-58,-48]];
      const names=['巨引源','室女座星系团','本星系群','长蛇座星系团','英仙座方向','后发座方向','武仙座方向','半人马座方向'];
      clusterNodes=positions.map((p,i)=>({center:new THREE.Vector3(...p),mass:i===0?155:7+(i%3)*4,name:names[i]}));
      const count=26000,pos=new Float32Array(count*3),col=new Float32Array(count*3),tmp=new THREE.Color(),stamp=galaxyStampTexture();
      for(let i=0;i<count;i++){
        const node=clusterNodes[i%8],r=Math.pow(rng(),1.1)*(i%8===0?22:14),a=rng()*6.283,ph=Math.acos(2*rng()-1);
        const p=node.center.clone().add(new THREE.Vector3(r*Math.sin(ph)*Math.cos(a),r*Math.cos(ph),r*Math.sin(ph)*Math.sin(a)));p.toArray(pos,i*3);tmp.setRGB(i%8===0?.94:.5,i%8===0?.63:.66,i%8===0?.34:.85).multiplyScalar(.25+rng()*.55);tmp.toArray(col,i*3);
        if(i<160){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:stamp,color:i%8===0?0xffcf8e:0xa8c9ff,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending}));s.position.copy(p);s.scale.set(2.8+rng()*3,2.2,1);s.material.rotation=rng()*6.28;g.add(s);}
      }
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));g.add(glowPoints(geo,.48,.48));
      clusterNodes.forEach((n,i)=>{const glow=glowSprite(i===0?0xffbf74:0x87b8ee,i===0?20:8,.48);glow.position.copy(n.center);g.add(glow);if(i){const inward=n.center.clone().negate().normalize();layerGroup('L4','forces').add(new THREE.ArrowHelper(inward,n.center,13,FORCE_COLOR,2,.9));}});
      const sources=gravitySources('L4');
      for(let i=1;i<8;i++){
        const start=clusterNodes[i].center.clone().add(new THREE.Vector3(5,3,-3)),velocity=start.clone().negate().normalize().multiplyScalar(1.9);velocity.add(new THREE.Vector3(-start.z,0,start.x).normalize().multiplyScalar(1.5));
        const p=start.clone(),v=velocity.clone(),points=[];
        for(let j=0;j<720;j++){points.push(p.clone());const a=accelerationAt(p,sources);v.addScaledVector(a,.04);p.addScaledVector(v,.08);v.addScaledVector(accelerationAt(p,sources),.04);if(p.length()<7||p.length()>126)break;}
        layerGroup('L4','paths').add(makeLine(points,TRAJECTORY_COLOR,.32));
      }
      const flowN=1200,flowGeo=new THREE.BufferGeometry();flowGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(flowN*3),3));flowGeo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(flowN*3),3));clusterFlow=glowPoints(flowGeo,1.55,.94);clusterFlow.frustumCulled=false;g.add(clusterFlow);
      for(let i=0;i<flowN;i++){
        const node=clusterNodes[1+i%7],p=node.center.clone().multiplyScalar(.2+rng()*.85).add(new THREE.Vector3((rng()-.5)*9,(rng()-.5)*9,(rng()-.5)*9));
        const v=p.clone().negate().normalize().multiplyScalar(2.4).add(new THREE.Vector3(-p.z,0,p.x).normalize().multiplyScalar(1.2));
        clusterParticles.push({p,v,initial:p.clone(),initialV:v.clone()});
        if(i%4===0)flowGeo.attributes.color.setXYZ(i,.98,.78,.36);else if(i%2===0)flowGeo.attributes.color.setXYZ(i,.24,.82,.98);else flowGeo.attributes.color.setXYZ(i,.18,.86,.62);
      }
      for(let i=0;i<40;i++){const p=clusterParticles[i].p,history=Array.from({length:76},()=>p.clone()),line=makeLine(history,i%3===0?0xfbbf24:(i%2?0x38bdf8:FLOW_COLOR),.76);layerGroup('L4','paths').add(line);clusterTails.push({index:i,history,line});}
      updateL4(0);
    }
    function updateParticleTail(tail,p) {
      tail.history.shift();tail.history.push(p.clone());const attr=tail.line.geometry.attributes.position;tail.history.forEach((v,i)=>attr.setXYZ(i,v.x,v.y,v.z));attr.needsUpdate=true;tail.line.geometry.computeBoundingSphere();
    }
    let clusterTailClock=0;
    function updateL4(dt) {
      const sources=gravitySources('L4'),steps=Math.max(1,Math.ceil(dt/(1/60))),h=dt/steps;
      for(let i=0;i<clusterParticles.length;i++){
        const p=clusterParticles[i];for(let j=0;j<steps;j++){p.v.addScaledVector(accelerationAt(p.p,sources),h*.5);p.p.addScaledVector(p.v,h);p.v.addScaledVector(accelerationAt(p.p,sources),h*.5);}
        if(p.p.distanceTo(clusterNodes[0].center)<5||p.p.length()>250){p.p.copy(p.initial);p.v.copy(p.initialV);for(const tail of clusterTails)if(tail.index===i)tail.history.forEach(v=>v.copy(p.p));}
        clusterFlow.geometry.attributes.position.setXYZ(i,p.p.x,p.p.y,p.p.z);
      }clusterFlow.geometry.attributes.position.needsUpdate=true;clusterTailClock+=dt;
      if(clusterTailClock>.07){clusterTailClock=0;clusterTails.forEach(t=>updateParticleTail(t,clusterParticles[t.index].p));}
    }
    function resetClusterDynamics(){clusterParticles.forEach(p=>{p.p.copy(p.initial);p.v.copy(p.initialV);});clusterTails.forEach(t=>t.history.forEach(p=>p.copy(clusterParticles[t.index].p)));clusterTailClock=0;}
    function buildL5CosmicWeb() {
      const g=scaleGroups.L5,rng=deterministicRandom(582),count=42000;
      for(let i=0;i<38;i++){
        let p;for(let attempts=0;attempts<100;attempts++){const r=Math.cbrt(rng())*126,a=rng()*6.283,ph=Math.acos(2*rng()-1);p=new THREE.Vector3(r*Math.sin(ph)*Math.cos(a),r*Math.cos(ph)*.77,r*Math.sin(ph)*Math.sin(a));if(webNodes.every(n=>n.pos.distanceTo(p)>30))break;}
        webNodes.push({pos:p,mass:5+rng()*12});
      }
      const pairs=new Set(),addEdge=(a,b)=>{const key=Math.min(a,b)+'-'+Math.max(a,b);if(pairs.has(key))return;pairs.add(key);const start=webNodes[a].pos,end=webNodes[b].pos,mid=start.clone().lerp(end,.5).add(new THREE.Vector3((rng()-.5)*10,(rng()-.5)*10,(rng()-.5)*10));const curve=new THREE.CatmullRomCurve3([start,start.clone().lerp(mid,.5),mid,mid.clone().lerp(end,.5),end]);webEdges.push({a,b,curve,length:curve.getLength()});};
      const connected=new Set([0]);while(connected.size<webNodes.length){let best=null,distance=Infinity;for(const a of connected)for(let b=0;b<webNodes.length;b++)if(!connected.has(b)){const d=webNodes[a].pos.distanceTo(webNodes[b].pos);if(d<distance){distance=d;best=[a,b];}}addEdge(...best);connected.add(best[1]);}
      webNodes.forEach((node,a)=>{const near=webNodes.map((n,b)=>({b,d:n.pos.distanceTo(node.pos)})).filter(n=>n.b!==a).sort((x,y)=>x.d-y.d);near.slice(0,2).forEach(n=>addEdge(a,n.b));});
      const totalLength=webEdges.reduce((s,e)=>s+e.length,0),pos=new Float32Array(count*3),col=new Float32Array(count*3),tmp=new THREE.Color();
      let cursor=0;
      webEdges.forEach(edge=>{
        const n=Math.round(count*.8*edge.length/totalLength);
        for(let i=0;i<n&&cursor<count;i++,cursor++){
          const t=rng(),p=edge.curve.getPoint(t),spread=1.2+Math.pow(Math.abs(t-.5)*2,3)*3.6;
          p.add(new THREE.Vector3((rng()-.5)*spread,(rng()-.5)*spread,(rng()-.5)*spread));p.toArray(pos,cursor*3);tmp.setRGB(.42,.57,.80).multiplyScalar(.25+rng()*.62);tmp.toArray(col,cursor*3);
        }
        layerGroup('L5','paths').add(makeLine(edge.curve.getPoints(55),TRAJECTORY_COLOR,.20));
        const middle=edge.curve.getPoint(.52),target=webNodes[edge.a].mass>webNodes[edge.b].mass?webNodes[edge.a].pos:webNodes[edge.b].pos;
        if(webEdges.indexOf(edge)%3===0)layerGroup('L5','forces').add(new THREE.ArrowHelper(target.clone().sub(middle).normalize(),middle,9,FORCE_COLOR,1.4,.55));
      });
      while(cursor<count){const node=webNodes[cursor%webNodes.length],r=Math.pow(rng(),1.3)*7,a=rng()*6.283,ph=Math.acos(2*rng()-1);node.pos.clone().add(new THREE.Vector3(r*Math.sin(ph)*Math.cos(a),r*Math.cos(ph),r*Math.sin(ph)*Math.sin(a))).toArray(pos,cursor*3);tmp.setRGB(.9,.69,.42).multiplyScalar(.35+rng()*.5).toArray(col,cursor*3);cursor++;}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));g.add(glowPoints(geo,.65,.7));
      webNodes.forEach(n=>{const glow=glowSprite(0xffd0a0,3+n.mass*.4,.62);glow.position.copy(n.pos);g.add(glow);});
      const flowCount=1500,fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(flowCount*3),3));fg.setAttribute('color',new THREE.BufferAttribute(new Float32Array(flowCount*3),3));webFlow=glowPoints(fg,1.55,.94);webFlow.frustumCulled=false;g.add(webFlow);
      for(let i=0;i<flowCount;i++){const edge=webEdges[i%webEdges.length],t=.1+rng()*.8;webParticles.push({edge,t,initial:t,v:0,side:t<.5?-1:1});if(i%4===0)fg.attributes.color.setXYZ(i,.96,.72,.38);else if(i%2===0)fg.attributes.color.setXYZ(i,.38,.78,1.);else fg.attributes.color.setXYZ(i,.20,.88,.66);}
      for(let i=0;i<40;i++){const p=webParticles[i].edge.curve.getPoint(webParticles[i].t),history=Array.from({length:64},()=>p.clone()),line=makeLine(history,i%3===0?0xfbbf24:(i%2?0x60a5fa:FLOW_COLOR),.68);layerGroup('L5','paths').add(line);webTails.push({index:i,history,line});}
      const cmb=new THREE.Mesh(new THREE.SphereGeometry(1600,32,24),new THREE.ShaderMaterial({vertexShader:PLANET_VERT,fragmentShader:CMB_FRAG,side:THREE.BackSide,transparent:true,depthTest:false,depthWrite:false}));cmb.renderOrder=-10;g.add(cmb);updateL5(0);
    }
    let webTailClock=0;
    function updateL5(dt) {
      for(let i=0;i<webParticles.length;i++){
        const p=webParticles[i],edge=p.edge;
        const left=Math.max(6,p.t*edge.length),right=Math.max(6,(1-p.t)*edge.length);
        const acc=40*dynamics.gravity*(-webNodes[edge.a].mass/(left*left)+webNodes[edge.b].mass/(right*right))/(edge.length*motion.webScale**3);p.v*=Math.exp(-.017*dt);
        p.v+=acc*dt;p.v+=p.side*.0015*dt;p.t+=p.v*dt;
        if(p.t<.025||p.t>.975){p.t=p.initial;p.v=0;for(const tail of webTails)if(tail.index===i)tail.history.forEach(v=>v.copy(edge.curve.getPoint(p.t)));}
        const pos=edge.curve.getPoint(p.t);webFlow.geometry.attributes.position.setXYZ(i,pos.x,pos.y,pos.z);
      }webFlow.geometry.attributes.position.needsUpdate=true;webTailClock+=dt;
      if(webTailClock>.06){webTailClock=0;webTails.forEach(updateWebTail);}
    }
    function resetWebDynamics(){webParticles.forEach(p=>{p.t=p.initial;p.v=0;});webTails.forEach(t=>t.history.forEach(v=>v.copy(webParticles[t.index].edge.curve.getPoint(webParticles[t.index].t))));webTailClock=0;}
