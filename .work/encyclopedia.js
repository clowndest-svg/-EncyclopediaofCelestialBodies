    const BOOK_TEXTURES=JSON.parse(document.getElementById('book-texture-data').textContent);
    const BOOK_CORE=JSON.parse(document.getElementById('book-core-data').textContent);
    const cosmicBook={open:false,ready:false,mode:'core',data:BOOK_CORE.items,stats:BOOK_CORE.stats,q:'',realm:'',kind:'',page:1,limit:24,sort:'featured',items:[],selected:null,queryTicket:0,detailTicket:0,favorites:new Set(),savedCache:new Map(),stages:[],stageIndex:0,stageTimer:null,qaList:[],qaIndex:0,compareIds:[]};
    const book$=id=>document.getElementById(id);
    const bookEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function bookStored(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}}
    function bookSetStored(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
    function bookThumbnail(item){
      const id='cb-'+String(item.id).replace(/[^a-z0-9]/gi,'-'),preset=item.visual?.preset||'rocky',seed=Math.abs(item.visual?.seed||17),temp=Number(item.facts?.tempK)||5772;
      let body='',a='#93c5fd',b='#3b6ea5';
      if(['spiral','elliptical'].includes(preset)){
        const rot=-50+(seed%100),ry=preset==='elliptical'?(14+seed%7):(8+seed%8);
        const palettes=[['#fff1c2','#60a5fa'],['#ffe4b5','#a78bfa'],['#e0f2fe','#f472b6'],['#fde68a','#38bdf8'],['#ffd8a8','#fb923c']];
        [a,b]=palettes[seed%palettes.length];
        body=`<ellipse cx="30" cy="30" rx="25" ry="${ry}" fill="url(#${id})" transform="rotate(${rot} 30 30)" opacity=".92"/><ellipse cx="30" cy="30" rx="14" ry="${Math.max(4,ry-4)}" fill="none" stroke="${a}" stroke-width="1" opacity=".55" transform="rotate(${rot} 30 30)"/><circle cx="30" cy="30" r="4.5" fill="#fff7dc"/>`;
        for(let i=0;i<7;i++){const x=8+(seed*3+i*17)%44,y=9+(seed*5+i*23)%42;body+=`<circle cx="${x}" cy="${y}" r="${i%3?.7:1.1}" fill="${i%2?a:'#fff'}" opacity=".85"/>`;}
      }else if(preset==='nebula'){
        const npals=[['#f472b6','#38bdf8'],['#22d3ee','#a78bfa'],['#fbbf24','#f43f5e']];
        [a,b]=npals[seed%npals.length];
        body=`<circle cx="26" cy="28" r="17" fill="url(#${id})" opacity=".85"/><circle cx="36" cy="33" r="14" fill="${b}" opacity=".32"/><circle cx="30" cy="30" r="2.2" fill="#fff"/><path d="M30 22v16M22 30h16" stroke="#fff" stroke-width=".9" opacity=".75"/>`;
      }else if(preset==='cluster'){
        a='#e0f2fe';b='#60a5fa';
        body=`<circle cx="30" cy="30" r="18" fill="url(#${id})" opacity=".45"/>`;
        for(let i=0;i<14;i++){const ang=i*2.399+seed,rad=3+(i/14)*17,x=30+Math.cos(ang)*rad,y=30+Math.sin(ang)*rad;body+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i<3?1.8:1}" fill="${i%3===0?'#fde68a':i%2?'#93c5fd':'#fff'}"/>`;}
      }else if(preset==='blackhole'){
        a='#ffe4b5';b='#ea580c';
        body=`<ellipse cx="30" cy="32" rx="26" ry="8" fill="none" stroke="#ffae52" stroke-width="4" opacity=".82"/><path d="M30 5v50" stroke="#7dd3fc" stroke-width="1.4" opacity=".55"/><circle cx="30" cy="29" r="11" fill="#02050d" stroke="#ffe7b8" stroke-width="2.2"/>`;
      }else if(preset==='pulsar'){
        a='#a5f3fc';b='#38bdf8';
        body=`<path d="M12 10L48 50" stroke="#7dd3fc" stroke-width="3" opacity=".55"/><circle cx="30" cy="30" r="9" fill="url(#${id})"/><circle cx="30" cy="30" r="4" fill="#fff"/>`;
      }else if(preset==='binary'){
        a='#fde68a';b='#f59e0b';
        body=`<ellipse cx="30" cy="30" rx="25" ry="14" fill="none" stroke="#60a5fa" stroke-width=".8" opacity=".45"/><circle cx="21" cy="29" r="11" fill="url(#${id})"/><circle cx="43" cy="32" r="7" fill="#7dd3fc"/>`;
      }else if(preset==='comet'){
        a='#bae6fd';b='#38bdf8';
        body=`<path d="M22 24L52 14L47 36Z" fill="#38bdf8" opacity=".32"/><path d="M22 24L50 28L40 44Z" fill="#fcd34d" opacity=".28"/><circle cx="21" cy="24" r="7" fill="url(#${id})"/>`;
      }else if(preset==='star'||preset==='dyson'){
        [a,b]=temp>14000?['#e0f2fe','#38bdf8']:temp>8000?['#ffffff','#93c5fd']:temp>4800?['#fff3b0','#f59e0b']:['#fed7aa','#dc2626'];
        body=`<circle cx="30" cy="30" r="21" fill="${b}" opacity=".25"/><path d="M30 7v46M7 30h46" stroke="${a}" stroke-width="1.1" opacity=".6"/><circle cx="30" cy="30" r="14" fill="url(#${id})"/>`;
        if(preset==='dyson')body+=`<ellipse cx="30" cy="30" rx="23" ry="9" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-dasharray="4 3" transform="rotate(-24 30 30)"/>`;
      }else if(preset==='lava'){
        a='#ff9f43';b='#7c1d12';
        body=`<circle cx="30" cy="30" r="18" fill="url(#${id})"/><path d="M18 26Q28 31 41 24 M20 36Q31 33 42 39" stroke="#fde047" stroke-width="1.6" fill="none" opacity=".85"/>`;
      }else{
        const pp=preset==='earth'||preset==='ocean'?['#67e8f9','#1d4ed8']:preset==='ice'?['#e0f2fe','#38bdf8']:preset==='gas'||preset==='ring'?['#fde68a','#b45309']:[['#fdba74','#9a3412'],['#cbd5e1','#475569'],['#fde68a','#854d0e']][seed%3];
        [a,b]=pp;
        body=`<circle cx="30" cy="30" r="17" fill="url(#${id})"/>`;
        if(['ring','ringworld'].includes(preset))body+=`<ellipse cx="30" cy="32" rx="27" ry="8" fill="none" stroke="#e6d3b0" stroke-width="3" opacity=".78" transform="rotate(-24 30 32)"/>`;
        if(preset==='gas'||preset==='ring')body+=`<path d="M15 25Q30 30 45 25 M13 33Q30 38 47 33" stroke="#fef3c7" stroke-width="2.5" fill="none" opacity=".5"/>`;
      }
      return `<svg viewBox="0 0 60 60" aria-hidden="true"><defs><radialGradient id="${id}" cx="32%" cy="28%"><stop stop-color="${a}"/><stop offset=".52" stop-color="${b}"/><stop offset="1" stop-color="#071220"/></radialGradient></defs>${body}</svg>`;
    }
    async function bookFetch(url,timeout=6000){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});if(!response.ok)throw new Error('HTTP '+response.status);return await response.json();}finally{clearTimeout(timer);}}
    async function bookLoadCatalog(){if(cosmicBook.ready)return;cosmicBook.ready=true;
      if(location.protocol!=='file:'){try{const stats=await bookFetch('/api/catalog/stats',2200);if(stats.total){cosmicBook.mode='api';cosmicBook.stats=stats;book$('book-source-status').textContent='本地数据库 · '+numberText(stats.total)+' 条';await bookQuery();return;}}catch{}}
      try{if(!window.CosmicCatalog)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='encyclopedia-catalog.js';script.onload=resolve;script.onerror=reject;document.head.appendChild(script);});if(window.CosmicCatalog?.items){cosmicBook.mode='offline';cosmicBook.data=window.CosmicCatalog.items;cosmicBook.stats=window.CosmicCatalog.stats;book$('book-source-status').textContent='离线完整目录 · '+numberText(cosmicBook.stats.total)+' 条';}}
      catch{cosmicBook.mode='core';book$('book-source-status').textContent='离线精选 · '+cosmicBook.data.length+' 条';book$('book-data-note').textContent='当前是内置精选。把百科目录文件放在同一文件夹，或启动本地服务，即可浏览完整目录。';}
      await bookQuery();
    }
    function bookLocalQuery(){let data=cosmicBook.data;if(cosmicBook.realm==='saved'){data=data.filter(i=>cosmicBook.favorites.has(i.id));for(const [id,item]of cosmicBook.savedCache)if(cosmicBook.favorites.has(id)&&!data.some(i=>i.id===id))data=data.concat(item);}
      return queryMemory({items:data.map(i=>i.searchText?i:{...i,searchText:[i.name,...(i.aliases||[]),i.subtype,...(i.tags||[])].join(' ').toLowerCase()}),version:cosmicBook.stats.version},{q:cosmicBook.q,realm:cosmicBook.realm==='saved'?'':cosmicBook.realm,kind:cosmicBook.kind,page:cosmicBook.page,limit:cosmicBook.limit,sort:cosmicBook.sort});
    }
    async function bookQuery(){const ticket=++cosmicBook.queryTicket;book$('book-count').textContent='正在寻找…';book$('book-results').innerHTML='<p class="book-loading">正在整理匹配的天体…</p>';let result;
      try{if(cosmicBook.mode==='api'&&cosmicBook.realm!=='saved'){const p=new URLSearchParams({q:cosmicBook.q,realm:cosmicBook.realm,kind:cosmicBook.kind,page:cosmicBook.page,limit:cosmicBook.limit,sort:cosmicBook.sort});result=await bookFetch('/api/objects?'+p);}else result=bookLocalQuery();}
      catch{cosmicBook.mode='core';result=bookLocalQuery();book$('book-source-status').textContent='连接中断 · 已切换本地精选';}
      if(ticket!==cosmicBook.queryTicket)return;cosmicBook.items=result.items;cosmicBook.pages=result.pages||1;book$('book-count').textContent=`${numberText(result.total)} 条${cosmicBook.realm==='saved'?'收藏':'结果'}`;book$('book-mobile-count').textContent=numberText(result.total)+' 条';
      const root=book$('book-results');root.replaceChildren();for(const item of result.items){const button=document.createElement('button');button.className='book-object-card';button.dataset.bookId=item.id;button.setAttribute('aria-current',String(item.id===cosmicBook.selected?.id));button.innerHTML=bookThumbnail(item)+`<div><h4>${bookEscape(item.name)}</h4><p>${bookEscape(item.subtype||KIND_NAMES[item.kind])}</p><small data-realm="${bookEscape(item.realm)}">${bookEscape(REALM_NAMES[item.realm])}${item.facts?.distanceLy?' · '+numberText(item.facts.distanceLy)+' 光年':''}</small></div>`;button.onclick=()=>bookSelect(item);root.appendChild(button);}
      book$('book-empty').hidden=result.items.length>0;book$('book-page-info').textContent=`${result.page} / ${Math.max(1,result.pages)}`;book$('book-page-prev').disabled=result.page<=1;book$('book-page-next').disabled=result.page>=result.pages;root.scrollTop=0;
    }
    function bookStopStagePlay(){if(cosmicBook.stageTimer){clearInterval(cosmicBook.stageTimer);cosmicBook.stageTimer=null;}const btn=book$('book-stage-play');if(btn){btn.setAttribute('aria-pressed','false');btn.textContent='▶ 自动演化';}}
    function bookSelectStage(idx){
      const stages=cosmicBook.stages;if(!stages.length||!cosmicBook.selected)return;
      cosmicBook.stageIndex=((idx%stages.length)+stages.length)%stages.length;
      const st=stages[cosmicBook.stageIndex];
      const wrap=book$('book-stage-buttons');
      if(wrap)[...wrap.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===cosmicBook.stageIndex)));
      const desc=book$('book-stage-desc');
      if(desc)desc.innerHTML=`<strong>${bookEscape(st.era)}</strong>：${bookEscape(st.desc)}`;
      cosmicBook.viewer?.select(cosmicBook.selected,st.mode);
    }
    function bookRenderStages(item){
      bookStopStagePlay();
      const stages=getEvolutionStages(item);
      cosmicBook.stages=stages;
      const defIdx=Math.max(0,stages.findIndex(s=>s.mode==='default'));
      cosmicBook.stageIndex=defIdx;
      const panel=book$('book-stage-panel'),wrap=book$('book-stage-buttons');
      if(!panel||!wrap)return;
      panel.hidden=!stages.length;
      wrap.replaceChildren();
      stages.forEach((st,i)=>{
        const b=document.createElement('button');
        b.type='button';b.textContent=st.label;b.setAttribute('aria-pressed',String(i===defIdx));
        b.onclick=()=>{bookStopStagePlay();bookSelectStage(i);};
        wrap.appendChild(b);
      });
      const st=stages[defIdx];
      if(st&&book$('book-stage-desc'))book$('book-stage-desc').innerHTML=`<strong>${bookEscape(st.era)}</strong>：${bookEscape(st.desc)}`;
    }
    async function bookSelect(value){const id=typeof value==='string'?value:value.id,ticket=++cosmicBook.detailTicket;let item=typeof value==='string'?cosmicBook.data.find(i=>i.id===id)||cosmicBook.savedCache.get(id):value;
      try{if(cosmicBook.mode==='api'&&!item?.sections)item=await bookFetch('/api/objects/'+encodeURIComponent(id));if(!item)return;if(ticket!==cosmicBook.detailTicket)return;item=enrichItem(item);cosmicBook.selected=item;cosmicBook.savedCache.set(id,item);if(cosmicBook.open){bookRenderDetail(item);bookMobilePane('detail');}}catch{book$('book-object-summary').textContent='这条资料暂时无法加载，请再选一个条目。';}
    }
    function bookCloseQAModal(){const m=book$('book-qa-modal');if(m)m.hidden=true;}
    function bookCloseCompareModal(){const m=book$('book-compare-modal');if(m)m.hidden=true;}
    function bookSyncCompareUI(){
      const ids=cosmicBook.compareIds,bar=book$('book-compare-bar'),chips=book$('book-compare-chips'),btn=book$('book-compare-toggle'),openBtn=book$('book-compare-open');
      if(btn&&cosmicBook.selected){
        const has=ids.includes(cosmicBook.selected.id);
        btn.setAttribute('aria-pressed',String(has));
        btn.textContent=has?'⚖ 已在对比':'⚖ 对比';
      }
      if(!bar||!chips)return;
      bar.hidden=!ids.length;
      chips.replaceChildren();
      ids.forEach(id=>{
        const it=cosmicBook.savedCache.get(id)||cosmicBook.data.find(x=>x.id===id);
        const chip=document.createElement('span');chip.className='book-compare-chip';
        chip.innerHTML=`<span>${bookEscape(it?.name||id)}</span><button type="button" aria-label="移出对比">✕</button>`;
        chip.querySelector('button').onclick=()=>{cosmicBook.compareIds=cosmicBook.compareIds.filter(x=>x!==id);bookSyncCompareUI();};
        chips.appendChild(chip);
      });
      if(openBtn)openBtn.disabled=ids.length<2;
      if(openBtn)openBtn.textContent=ids.length<2?`⚖ 再选 ${2-ids.length} 颗开始对比`:`⚖ 横向对比 (${ids.length})`;
    }
    async function bookOpenCompareModal(){
      const ids=cosmicBook.compareIds;if(ids.length<2)return;
      const modal=book$('book-compare-modal'),grid=book$('book-compare-grid');if(!modal||!grid)return;
      grid.innerHTML='<p class="book-loading">正在读取天体对比数据…</p>';modal.hidden=false;
      let items=[];
      try{
        if(cosmicBook.mode==='api'){const res=await bookFetch('/api/compare?ids='+encodeURIComponent(ids.join(',')));items=res.items||[];}
      }catch{}
      if(!items.length)items=ids.map(id=>cosmicBook.savedCache.get(id)||cosmicBook.data.find(x=>x.id===id)).filter(Boolean).map(enrichItem);
      const keys=[['类别',i=>i.subtype||KIND_NAMES[i.kind]],['资料范围',i=>REALM_NAMES[i.realm]],['距离（光年）',i=>i.facts.distanceLy?numberText(i.facts.distanceLy)+' 光年':'未知'],['半径 / 直径',i=>i.facts.radiusSolar?numberText(i.facts.radiusSolar)+' 太阳半径':i.facts.radiusEarth?numberText(i.facts.radiusEarth)+' 地球半径':i.facts.diameterKm?numberText(i.facts.diameterKm)+' km':'未知'],['质量',i=>i.facts.massSolar?numberText(i.facts.massSolar)+' 太阳质量':i.facts.massEarth?numberText(i.facts.massEarth)+' 地球质量':i.facts.massEarthUpperLimit?'≤ '+numberText(i.facts.massEarthUpperLimit)+' 地球质量':'未知'],['公转周期',i=>i.facts.periodDays?numberText(i.facts.periodDays)+' 天':'未知'],['温度参考',i=>i.facts.tempK?numberText(i.facts.tempK)+' K':'未知'],['发现 / 提出',i=>i.dossier?.discoverer||'—']];
      grid.innerHTML=`<table class="book-facts-table book-compare-table"><thead><tr><th>维度</th>${items.map(i=>`<th>${bookEscape(i.name)}</th>`).join('')}</tr></thead><tbody>${keys.map(([label,fn])=>`<tr><td>${bookEscape(label)}</td>${items.map(i=>`<td>${bookEscape(fn(i))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    }
    function bookOpenQAModal(idx){
      const list=cosmicBook.qaList||[];if(!list.length)return;
      cosmicBook.qaIndex=((idx%list.length)+list.length)%list.length;
      const item=list[cosmicBook.qaIndex];
      const m=book$('book-qa-modal');if(!m)return;
      book$('book-qa-modal-tag').textContent=item.tag||'科学解答';
      book$('book-qa-modal-q').textContent=item.q;
      book$('book-qa-modal-a').textContent=item.a;
      book$('book-qa-modal-idx').textContent=`第 ${cosmicBook.qaIndex+1} / ${list.length} 题`;
      const btn=book$('book-qa-list')?.children[cosmicBook.qaIndex];if(btn)btn.dataset.read='true';
      m.hidden=false;
    }
    function bookRenderDetail(item){
      bookCloseQAModal();
      book$('book-object-name').textContent=item.name;book$('book-object-alias').textContent=(item.aliases||[]).filter(a=>a!==item.name).slice(0,3).join(' / ')||item.id;
      book$('book-badges').innerHTML=`<span data-realm="${bookEscape(item.realm)}">${bookEscape(REALM_NAMES[item.realm])}</span><span>${bookEscape(item.subtype||KIND_NAMES[item.kind])}</span>`;
      book$('book-object-summary').textContent=item.summary;book$('book-model-note').textContent=item.id==='earth'?'NASA Blue Marble 底图 · 动态光照与演化推演':item.realm==='real'?'参数化动态特效模型 · 可调节亮度与演化时期':'原创设定的动态特效展示 · 不是观测记录';
      const preferred=item.kind==='star'?['massSolar','radiusSolar','tempK']:item.kind==='galaxy'||item.kind==='nebula'||item.kind==='cluster'?['distanceLy','magnitude','angularMajorArcmin']:item.kind==='blackhole'?['massSolar','distanceLy']:['radiusEarth','periodDays','distanceLy','diameterKm','massEarth'];const rows=item.factRows||makeFactRows(item),highlights=preferred.map(k=>rows.find(r=>r.key===k)).filter(Boolean).slice(0,3);while(highlights.length<3)highlights.push({label:highlights.length===0?'记录类型':highlights.length===1?'资料范围':'图像性质',formatted:highlights.length===0?KIND_NAMES[item.kind]:highlights.length===1?REALM_NAMES[item.realm]:'动态示意',unit:''});
      book$('book-fact-highlights').innerHTML=highlights.map(r=>`<div><dt>${bookEscape(r.label)}</dt><dd>${bookEscape(r.formatted)}<small>${bookEscape(r.unit)}</small></dd></div>`).join('');
      const d=item.dossier||{};
      const dossierEl=book$('book-dossier');
      if(dossierEl)dossierEl.innerHTML=[['发现者 / 提出者',d.discoverer],['起源与形成机制',d.origin],['空间位置与归属',d.location],['观测与探测来源',d.observation]].filter(([,v])=>v).map(([k,v])=>`<div class="book-dossier-card"><span>${bookEscape(k)}</span><p>${bookEscape(v)}</p></div>`).join('');
      book$('book-sections').innerHTML=item.sections.map(section=>`<section><h3>${bookEscape(section.title)}</h3>${section.body.split(/\n\n/).map(p=>`<p>${bookEscape(p)}</p>`).join('')}</section>`).join('');
      cosmicBook.qaList=item.qa||[];
      const qaSec=book$('book-qa-section'),qaListEl=book$('book-qa-list');
      if(qaSec&&qaListEl){
        qaSec.hidden=!cosmicBook.qaList.length;
        qaListEl.replaceChildren();
        cosmicBook.qaList.forEach((qa,idx)=>{
          const card=document.createElement('button');card.type='button';card.className='book-qa-card';
          card.innerHTML=`<div class="book-qa-card-top"><span class="book-qa-tag">${bookEscape(qa.tag||'科普问答')}</span><span class="book-qa-hint">点击查看答案 ↗</span></div><div class="book-qa-q">${bookEscape(qa.q)}</div>`;
          card.onclick=()=>bookOpenQAModal(idx);
          qaListEl.appendChild(card);
        });
      }
      book$('book-takeaway-text').textContent=item.realm==='real'?(item.kind==='exoplanet'?'像地球一样大，不等于拥有地球一样的环境。':item.kind==='star'?'看见的亮度、温度、质量与大小，是四件需要分别理解的事。':item.kind==='blackhole'?'我们观测的是黑洞附近的物质和引力效应，而不是视界内部。':'外观帮助我们提出问题，观测和数据才能帮助我们验证答案。'):'想象可以大胆，事实需要证据；这里的名称和设定不属于已观测天体。';
      book$('book-fact-rows').innerHTML=rows.length?rows.map(r=>`<tr><td>${bookEscape(r.label)}</td><td>${bookEscape(r.formatted)}</td><td>${bookEscape(r.unit)}</td></tr>`).join(''):'<tr><td colspan="3">当前目录没有可展示的定量参数，保持未知。</td></tr>';
      book$('book-facts-note').textContent=item.realm==='real'?'未知数据保持未知；≤ / ≥ 分别表示上限与下限，不是精确测量值。系外行星平衡温度也不等于地表温度。':'以下是原创设定值，不是现实观测，也不是经过工程或气候验证的结果。';
      const radius=item.facts.radiusEarth??(item.facts.radiusSolar?item.facts.radiusSolar*109.2:null);const comparison=book$('book-comparison');comparison.hidden=!radius||['ringworld','dyson'].includes(item.visual?.preset);book$('book-comparison-values').innerHTML=radius?`<div class="dynamics-row"><span>半径 / 地球</span><output>${numberText(radius)} 倍</output></div><div class="dynamics-row"><span>球形体积 / 地球</span><output>${numberText(radius**3)} 倍</output></div>`:'';
      book$('book-sources').innerHTML=(item.sources||[]).map(s=>/^https:\/\//.test(s.url)?`<a class="book-source-link" href="${bookEscape(s.url)}" target="_blank" rel="noopener noreferrer">${bookEscape(s.name)}${s.license?`<small>${bookEscape(s.license)}</small>`:''}</a>`:`<div class="book-source-link">${bookEscape(s.name)}<small>本项目原创设定，非观测数据</small></div>`).join('');
      book$('book-boundary-text').textContent=item.realm==='real'?'天体存在与其类型来自目录或精选资料；这幅三维画面按类型和已知参数程序化生成。对于没有表面照片或完整结构资料的对象，不应从模型推断真实颜色、地貌、生命或精确运动。':'这不是现实天体。科学设想只说明使用了一些科学概念，不确认具体对象存在；原创想象则可包含更多叙事性夸张。';
      book$('book-save').setAttribute('aria-pressed',String(cosmicBook.favorites.has(item.id)));book$('book-save').textContent=cosmicBook.favorites.has(item.id)?'★ 已收藏':'☆ 收藏';
      bookSyncCompareUI();
      book$('book-back-simulation').hidden=!['sun','earth','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','blackhole-m87','milky-way','ngc-0224','ngc-4486','ngc-4594','galaxy-cartwheel'].includes(item.id);
      book$('book-detail').scrollTop=0;bookSetTab('story');for(const b of book$('book-results').children)b.setAttribute('aria-current',String(b.dataset.bookId===item.id));
      bookRenderStages(item);
      cosmicBook.viewer.select(item,'default');book$('book-viewer-pause').setAttribute('aria-pressed',String(cosmicBook.viewer.paused));book$('book-viewer-pause').textContent=cosmicBook.viewer.paused?'▶ 演示':'Ⅱ 暂停';
    }
    function bookSetTab(tab){document.querySelectorAll('[data-book-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.bookTab===tab)));for(const name of ['story','facts','sources'])book$('book-tab-'+name).hidden=name!==tab;}
    function bookMobilePane(pane){document.querySelector('#cosmic-book .book-shell').dataset.mobilePane=pane;book$('book-show-list').setAttribute('aria-pressed',String(pane==='list'));book$('book-show-detail').setAttribute('aria-pressed',String(pane==='detail'));if(pane==='detail')cosmicBook.viewer?.resize();}
    cosmicBook.show=async()=>{if(cosmicBook.open)return;cosmicBook.open=true;cosmicBook.oldFocus=document.activeElement;book$('cosmic-book').showModal();cosmicBook.viewer ||=new CatalogViewer(book$('book-viewer'));const first=cosmicBook.selected||cosmicBook.data.find(i=>i.id==='sun')||cosmicBook.data[0];await bookSelect(first);bookQuery();bookLoadCatalog();if(innerWidth>760)setTimeout(()=>book$('book-search').focus({preventScroll:true}),20);};
    cosmicBook.hide=()=>{cosmicBook.open=false;cosmicBook.detailTicket++;bookStopStagePlay();book$('cosmic-book').close();cosmicBook.oldFocus?.focus({preventScroll:true});};
    cosmicBook.frame=dt=>cosmicBook.viewer?.frame(dt);
    cosmicBook.bind=()=>{
      cosmicBook.favorites=new Set(bookStored('cosmic-book-favorites',[]));cosmicBook.savedCache=new Map(bookStored('cosmic-book-cache',[]));book$('btn-cosmic-book').onclick=cosmicBook.show;book$('book-close').onclick=cosmicBook.hide;
      book$('cosmic-book').addEventListener('cancel',e=>{e.preventDefault();cosmicBook.hide();});
      let timer;const clearSearchBtn=book$('book-search-clear');
      book$('book-search').oninput=e=>{cosmicBook.q=e.target.value;cosmicBook.page=1;if(clearSearchBtn)clearSearchBtn.hidden=!cosmicBook.q;clearTimeout(timer);timer=setTimeout(bookQuery,160);};
      if(clearSearchBtn)clearSearchBtn.onclick=()=>{cosmicBook.q='';cosmicBook.page=1;book$('book-search').value='';clearSearchBtn.hidden=true;book$('book-search').focus();bookQuery();};
      book$('book-kinds').innerHTML='<button data-book-kind="" aria-pressed="true">全部</button>'+Object.entries(KIND_NAMES).map(([id,name])=>`<button data-book-kind="${id}" aria-pressed="false">${name}</button>`).join('');
      document.querySelectorAll('[data-book-kind]').forEach(b=>b.onclick=()=>{cosmicBook.kind=b.dataset.bookKind;cosmicBook.page=1;document.querySelectorAll('[data-book-kind]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));bookQuery();bookMobilePane('list');});
      document.querySelectorAll('[data-book-realm]').forEach(b=>b.onclick=()=>{cosmicBook.realm=b.dataset.bookRealm;cosmicBook.page=1;document.querySelectorAll('[data-book-realm]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));bookQuery();bookMobilePane('list');});
      book$('book-sort').onchange=e=>{cosmicBook.sort=e.target.value;cosmicBook.page=1;bookQuery();};book$('book-page-prev').onclick=()=>{cosmicBook.page--;bookQuery();};book$('book-page-next').onclick=()=>{cosmicBook.page++;bookQuery();};
      book$('book-clear-filters').onclick=()=>{cosmicBook.q='';cosmicBook.kind='';cosmicBook.realm='';cosmicBook.page=1;book$('book-search').value='';document.querySelectorAll('[data-book-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bookKind==='')));document.querySelectorAll('[data-book-realm]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bookRealm==='')));bookQuery();};
      document.querySelectorAll('[data-book-tab]').forEach(b=>b.onclick=()=>bookSetTab(b.dataset.bookTab));book$('book-show-list').onclick=()=>bookMobilePane('list');book$('book-show-detail').onclick=()=>bookMobilePane('detail');
      book$('book-viewer-pause').onclick=()=>{const v=cosmicBook.viewer;v.paused=!v.paused;book$('book-viewer-pause').setAttribute('aria-pressed',String(v.paused));book$('book-viewer-pause').textContent=v.paused?'▶ 演示':'Ⅱ 暂停';};
      book$('book-viewer-reset').onclick=()=>cosmicBook.viewer.reset();
      const expandBtn=book$('book-viewer-expand');
      if(expandBtn)expandBtn.onclick=()=>{const stage=book$('book-visual-stage'),on=stage.classList.toggle('expanded');expandBtn.setAttribute('aria-pressed',String(on));expandBtn.textContent=on?'✕ 还原':'⛶ 放大';setTimeout(()=>cosmicBook.viewer?.resize(),60);};
      const bBright=book$('bvc-brightness'),bVfx=book$('bvc-vfx'),bSpin=book$('bvc-spin'),bLight=book$('bvc-lighting'),bStars=book$('bvc-stars'),bPlay=book$('book-stage-play');
      if(bBright)bBright.oninput=e=>{const v=+e.target.value;book$('bvc-brightness-val').textContent=v.toFixed(2)+'×';if(cosmicBook.viewer){cosmicBook.viewer.brightness=v;cosmicBook.viewer.applyVisualSettings();}};
      if(bVfx)bVfx.oninput=e=>{const v=+e.target.value;book$('bvc-vfx-val').textContent=v.toFixed(2)+'×';if(cosmicBook.viewer){cosmicBook.viewer.vfx=v;cosmicBook.viewer.applyVisualSettings();}};
      if(bSpin)bSpin.oninput=e=>{const v=+e.target.value;book$('bvc-spin-val').textContent=v.toFixed(1)+'×';if(cosmicBook.viewer){cosmicBook.viewer.spin=v;cosmicBook.viewer.frame(0);}};
      if(bLight)bLight.onclick=()=>{const v=cosmicBook.viewer;if(!v)return;v.studioLight=!v.studioLight;v.applyVisualSettings();bLight.setAttribute('aria-pressed',String(v.studioLight));bLight.textContent=v.studioLight?'☀ 全景展示':'◐ 深空实境';};
      if(bStars)bStars.onclick=()=>{const v=cosmicBook.viewer;if(!v)return;v.showStars=!v.showStars;v.applyVisualSettings();bStars.setAttribute('aria-pressed',String(v.showStars));bStars.textContent=v.showStars?'✦ 星空：开':'✦ 星空：关';};
      if(bPlay)bPlay.onclick=()=>{
        if(cosmicBook.stageTimer){bookStopStagePlay();return;}
        if(!cosmicBook.stages.length)return;
        bPlay.setAttribute('aria-pressed','true');bPlay.textContent='Ⅱ 停止演化';
        bookSelectStage(0);
        cosmicBook.stageTimer=setInterval(()=>bookSelectStage(cosmicBook.stageIndex+1),4200);
      };
      book$('book-save').onclick=()=>{const item=cosmicBook.selected;if(!item)return;if(cosmicBook.favorites.has(item.id))cosmicBook.favorites.delete(item.id);else cosmicBook.favorites.add(item.id);bookSetStored('cosmic-book-favorites',[...cosmicBook.favorites]);bookSetStored('cosmic-book-cache',[...cosmicBook.savedCache].filter(([id])=>cosmicBook.favorites.has(id)));book$('book-save').setAttribute('aria-pressed',String(cosmicBook.favorites.has(item.id)));book$('book-save').textContent=cosmicBook.favorites.has(item.id)?'★ 已收藏':'☆ 收藏';if(cosmicBook.realm==='saved')bookQuery();};
      book$('book-random').onclick=async()=>{let item;if(cosmicBook.mode==='api'&&cosmicBook.realm!=='saved'){try{item=await bookFetch('/api/objects/random?'+new URLSearchParams({realm:cosmicBook.realm,kind:cosmicBook.kind}));}catch{}}if(!item){const pool=cosmicBook.realm==='saved'?[...cosmicBook.savedCache.values()]:cosmicBook.data;const candidates=pool.filter(i=>(cosmicBook.realm==='saved'?cosmicBook.favorites.has(i.id):(!cosmicBook.realm||i.realm===cosmicBook.realm))&&(!cosmicBook.kind||i.kind===cosmicBook.kind));item=candidates[Math.floor(Math.random()*candidates.length)];}if(item?.id)bookSelect(item);};
      book$('book-back-simulation').onclick=()=>{const item=cosmicBook.selected;cosmicBook.hide();if(item.id==='blackhole-m87'){switchScale('L2');return;}const morph={'milky-way':'milkyway','ngc-0224':'andromeda','ngc-4486':'m87','ngc-4594':'sombrero','galaxy-cartwheel':'cartwheel'}[item.id];if(morph){switchScale('L3');switchGalaxyMorph(morph);return;}switchScale(item.id==='moon'?'L0':'L1');const body=celestialBodies.find(b=>b.id===item.id&&b.scaleKey===state.currentScale);if(body)lockToBody(body,true);};
      const qaModal=book$('book-qa-modal');
      if(qaModal)qaModal.onclick=e=>{if(e.target===qaModal)bookCloseQAModal();};
      const qaClose=book$('book-qa-modal-close'),qaOk=book$('book-qa-modal-ok'),qaNext=book$('book-qa-modal-next');
      if(qaClose)qaClose.onclick=bookCloseQAModal;if(qaOk)qaOk.onclick=bookCloseQAModal;
      if(qaNext)qaNext.onclick=()=>bookOpenQAModal(cosmicBook.qaIndex+1);
      const sendSbBtn=book$('book-send-sandbox');
      if(sendSbBtn)sendSbBtn.onclick=()=>{const it=cosmicBook.selected;if(!it)return;cosmicBook.hide();if(typeof window.openSandbox2==='function')window.openSandbox2(it);};
      const cmpToggle=book$('book-compare-toggle'),cmpOpen=book$('book-compare-open'),cmpClear=book$('book-compare-clear'),cmpModal=book$('book-compare-modal'),cmpClose=book$('book-compare-close');
      if(cmpToggle)cmpToggle.onclick=()=>{const it=cosmicBook.selected;if(!it)return;const idx=cosmicBook.compareIds.indexOf(it.id);if(idx>=0)cosmicBook.compareIds.splice(idx,1);else{if(cosmicBook.compareIds.length>=3)cosmicBook.compareIds.shift();cosmicBook.compareIds.push(it.id);}bookSyncCompareUI();};
      if(cmpOpen)cmpOpen.onclick=bookOpenCompareModal;
      if(cmpClear)cmpClear.onclick=()=>{cosmicBook.compareIds=[];bookSyncCompareUI();};
      if(cmpClose)cmpClose.onclick=bookCloseCompareModal;
      if(cmpModal)cmpModal.onclick=e=>{if(e.target===cmpModal)bookCloseCompareModal();};
      window.addEventListener('keydown',e=>{if(cosmicBook.open){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(book$('book-qa-modal')&&!book$('book-qa-modal').hidden)bookCloseQAModal();else if(book$('book-compare-modal')&&!book$('book-compare-modal').hidden)bookCloseCompareModal();else cosmicBook.hide();}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();book$('book-search').focus();}}else if(e.key.toLowerCase()==='b'&&!e.target.matches('input,textarea,select'))cosmicBook.show();},{capture:true});
    };
