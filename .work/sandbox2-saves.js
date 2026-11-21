    function sbLocalSaves() {
      try {const data=JSON.parse(localStorage.getItem('cosmic-sb-saves')||'[]');return Array.isArray(data)?data.filter(x=>x&&typeof x.id==='string'&&x.data):[];} catch {return [];}
    }
    async function sbSaveRequest(url,options={}) {
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
      try {
        const response=await fetch(url,{...options,signal:controller.signal});
        if(!response.ok) throw Object.assign(new Error('HTTP '+response.status),{status:response.status});
        return await response.json();
      } finally {clearTimeout(timer);}
    }
    async function sbRefreshSaves() {
      const box=sb$('sb-saves-list');if(!box)return;
      const ticket=sb.saveListTicket=(sb.saveListTicket||0)+1;
      let list=[],offline=false;
      try {const data=await sbSaveRequest('/api/sandbox/saves');list=Array.isArray(data.saves)?data.saves:[];} catch {offline=true;}
      if(ticket!==sb.saveListTicket)return;
      const local=sbLocalSaves().map(x=>({...x,local:true}));
      list=[...local,...list];box.replaceChildren();
      if(offline) {const note=document.createElement('p');note.className='sb-muted';note.textContent='服务器暂不可用；本地存档仍可载入。';box.appendChild(note);}
      if(!list.length) {const note=document.createElement('p');note.className='sb-muted';note.textContent='暂无存档。输入名称保存你的宇宙。';box.appendChild(note);return;}
      for(const item of list) {
        const row=document.createElement('div');row.className='sb-save-row';
        const description=document.createElement('div'),name=document.createElement('strong'),meta=document.createElement('small');
        name.textContent=String(item.name||'我的宇宙');meta.textContent=`${item.body_count??item.data?.bodies?.length??0} 颗天体${item.local?' · 本地离线':''}`;description.append(name,meta);
        const buttons=document.createElement('div'),load=document.createElement('button'),remove=document.createElement('button');
        load.className='sb-mini-btn';load.textContent='载入';remove.className='sb-mini-btn sb-danger';remove.textContent='删除';
        load.onclick=async()=>{
          const generation=sb.sceneVersion||0,request=sb.saveLoadTicket=(sb.saveLoadTicket||0)+1;
          load.disabled=true;
          try {
            const payload=item.local?item.data:(await sbSaveRequest('/api/sandbox/saves/'+encodeURIComponent(item.id))).data;
            if(!sb.open||request!==sb.saveLoadTicket||generation!==(sb.sceneVersion||0))return;
            sbApplyUniverse(payload);sbToast(`已载入「${item.name}」，恢复全部模拟参数。`);
          } catch {sbToast('存档无效或读取失败，当前宇宙没有被清空。');} finally {load.disabled=false;}
        };
        remove.onclick=async()=>{
          remove.disabled=true;
          try {
            if(item.local) localStorage.setItem('cosmic-sb-saves',JSON.stringify(sbLocalSaves().filter(x=>x.id!==item.id)));
            else await sbSaveRequest('/api/sandbox/saves/'+encodeURIComponent(item.id),{method:'DELETE'});
            await sbRefreshSaves();
          } catch {sbToast('删除未成功，存档仍被保留。');remove.disabled=false;}
        };
        buttons.append(load,remove);row.append(description,buttons);box.appendChild(row);
      }
    }
    async function sbSaveUniverse() {
      const input=sb$('sb-save-name'),name=input.value.trim()||'我的宇宙 '+new Date().toLocaleTimeString('zh-CN',{hour12:false}),button=sb$('sb-save-btn');
      if(button.disabled)return;button.disabled=true;
      try {
        const data=sbSerializeUniverse();
        try {
          await sbSaveRequest('/api/sandbox/saves',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,preset:sb.preset,data})});
          sbToast(`已保存到数据库：「${name}」`);
        } catch(error) {
          if(error.status&&error.status<500)throw error;
          const saved=sbLocalSaves();saved.unshift({id:'loc-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),name,preset:sb.preset,body_count:data.bodies.length,data});
          localStorage.setItem('cosmic-sb-saves',JSON.stringify(saved.slice(0,30)));
          sbToast(`服务器暂不可用，已保存本地离线副本：「${name}」`);
        }
        input.value='';await sbRefreshSaves();
      } catch {sbToast('保存失败：请检查天体参数、数量或浏览器存储空间。现有存档未被修改。');} finally {button.disabled=false;}
    }
