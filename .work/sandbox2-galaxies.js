    function sbLoadGalaxyCollision() {
      for(const [name,x,v,color] of [['旋涡星系 A',-80,1.4,[1,.78,.42]],['旋涡星系 B',80,-1.4,[.55,.78,1]]]) {
        sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='galaxy'),name,mass:460,radius:24,pos:[x,0,x*.2],vel:[v,0,0],color});
      }
      sbSelectBody(sb.bodies[0]);sbOverview();
    }
    function sbUpdateGalaxyMergers(dt) {
      if(sb.preset!=='galaxy_merge'||dt<=0)return;
      const galaxies=sb.bodies.filter(b=>b.kind==='galaxy');
      for(let i=0;i<galaxies.length;i++)for(let j=i+1;j<galaxies.length;j++) {
        const a=galaxies[i],b=galaxies[j],distance=a.pos.distanceTo(b.pos),radius=a.radius+b.radius;
        if(distance>radius*2)continue;
        const mass=a.mass+b.mass,velocity=a.vel.clone().multiplyScalar(a.mass).addScaledVector(b.vel,b.mass).divideScalar(mass);
        const damping=Math.exp(-dt*.16*(1-distance/(radius*2)));
        a.vel.sub(velocity).multiplyScalar(damping).add(velocity);b.vel.sub(velocity).multiplyScalar(damping).add(velocity);
        if(distance<radius*.45) {
          const position=a.pos.clone().multiplyScalar(a.mass).addScaledVector(b.pos,b.mass).divideScalar(mass);
          const color=new THREE.Color(...a.color).lerp(new THREE.Color(...b.color),b.mass/mass).toArray();
          sbRemoveBody(a);sbRemoveBody(b);
          const merged=sbCreateBody({...SB_TEMPLATES.find(t=>t.id==='galaxy'),name:'并合后的星系',badge:'参数化星系并合',mass,radius:Math.hypot(a.radius,b.radius),pos:position.toArray(),vel:velocity.toArray(),color,sourceNote:'动力学摩擦与星暴仅为现象演示，不求解星系气体流体力学。'});
          sbSelectBody(merged);sbToast('星系群已交错并合，形成更大的集合星系模型。');return;
        }
      }
    }
