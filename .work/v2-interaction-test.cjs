const {chromium}=require('playwright');const fs=require('fs'),path=require('path');const {pathToFileURL}=require('url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});await context.route(/^https?:/,r=>r.abort());const page=await context.newPage(),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,1200));});
 const assert=(v,n)=>{results.push({name:n,pass:!!v});if(!v)throw Error(n);};const snap=()=>page.evaluate(()=>window.__atlas.snapshot());const click=s=>page.locator(s).click();const shot=n=>page.screenshot({path:path.join(__dirname,'screenshots',n+'.png')});
 try{
 await page.goto(pathToFileURL(path.join(__dirname,'..','cosmic_atlas_3_0.html')).href+'?test=1');await page.waitForFunction(()=>window.__atlas,null,{timeout:60000});await page.waitForTimeout(600);
 assert((await snap()).experimentCount===14,'fourteen experiment types in live page');
 const a=await snap();await page.waitForFunction(t=>window.__atlas.snapshot().solarYears>t+.0001,a.solarYears,{timeout:30000});const b=await snap();assert(JSON.stringify(a.sunWorld)!==JSON.stringify(b.sunWorld),'Sun advances in external reference');assert(b.solarYears>a.solarYears,'AU/year physical clock advances');assert(Math.hypot(...b.momentum)<1e-12,'solar N-body momentum conserved');await shot('v2-solar-external');
 await click('#transport-pause');const frozen=await snap();await page.waitForTimeout(350);assert(JSON.stringify(frozen.solar)===JSON.stringify((await snap()).solar),'pause freezes all physical bodies');
 await click('#transport-frame');const local=await snap();assert(local.frame==='local'&&Math.hypot(...local.sunWorld)<1e-8,'heliocentric view removes common translation');assert(JSON.stringify(local.solar)===JSON.stringify(frozen.solar),'reference switch preserves physical state');await shot('v2-solar-local');await click('#transport-frame');await click('#transport-pause');
 for(const key of ['L0','L2','L3','L4','L5']){await click(`[data-scale=${key}]`);await page.waitForTimeout(400);const before=await snap();await page.waitForFunction(({key,time})=>window.__atlas.snapshot().sceneTime[key]>time+.001,{key,time:before.sceneTime[key]},{timeout:30000});const after=await snap();
   if(key==='L2')assert(JSON.stringify(before.dust)!==JSON.stringify(after.dust),'accretion has independent motion');
   if(key==='L3')assert(before.galaxyTime!==after.galaxyTime,'galaxy time advances continuously');
   if(key==='L4')assert(JSON.stringify(before.clusterCenters)!==JSON.stringify(after.clusterCenters),'cluster nodes move, not just particles');
   if(key==='L5')assert(after.webScale>before.webScale,'physical cosmic web expands');
   await click('#transport-pause');const stop=await snap();await page.waitForTimeout(200);const still=await snap();assert(stop.time===still.time&&JSON.stringify(stop.clusterCenters)===JSON.stringify(still.clusterCenters)&&stop.webScale===still.webScale,key+' pause freezes model');await click('#transport-pause');
 }
 await click('[data-scale=L2]');await click('#transport-pause');const l2=await snap();await page.locator('#slider-gravity').fill('1.8');await page.waitForTimeout(200);assert(JSON.stringify(l2.dust)===JSON.stringify((await snap()).dust),'changing G while paused does not teleport dust');await page.locator('#slider-gravity').fill('1');await click('#transport-pause');
 await click('[data-scale=L5]');await click('#transport-pause');const scale=(await snap()).webScale;await click('#transport-frame');assert((await snap()).webScale===scale,'comoving view preserves cosmic evolution state');await click('#transport-frame');await click('#transport-pause');
 await page.setViewportSize({width:1000,height:680});
 await click('[data-scale=L1]');await click('[data-right-tab=lab]');await page.locator('#quick-body-list button').filter({hasText:'地球'}).click();
 for(const type of ['asteroid','comet','airburst','kinetic']){
   await click(`[data-exp=${type}]`);const count=(await snap()).reports.at(-1)?.id||0;await click('#btn-launch-exp');assert((await snap()).projectiles>0,type+' launch starts physical projectile');
   await page.waitForFunction(count=>window.__atlas.snapshot().reports.at(-1)?.id>count,count,{timeout:60000});const report=(await snap()).reports.at(-1);assert(report.energy>0,type+' produces impact report');if(type==='airburst')assert(report.airburst&&report.craterMeters===0,'small rock airbursts without false ground crater');
   await shot('v2-effect-'+type);await click('#btn-reset-target');
 }
 for(const type of ['nuclear','antimatter','laser','grb','dyson','photoid','tidal','singularity','foil','vacuum']){
   await click(`[data-exp=${type}]`);await click('#btn-launch-exp');await page.waitForTimeout(160);assert((await snap()).effects>0||(await snap()).legacyEffects>0,type+' starts its effect');await shot('v2-effect-'+type);await click('#btn-reset-target');
 }
 await click('[data-exp=laser]');await click('#btn-launch-exp');await page.waitForFunction(()=>window.__atlas.snapshot().effects===0,null,{timeout:60000});const beam=(await snap()).reports.at(-1);assert(Math.abs(beam.energy/4e18-1)<1e-6,'beam energy integrates power over four simulation seconds');await click('#btn-reset-target');
 await page.locator('#quick-body-list button').filter({hasText:'木星'}).click();await click('[data-exp=asteroid]');await click('#btn-launch-exp');const initialCount=(await snap()).reports.at(-1)?.id||0;await page.waitForFunction(n=>window.__atlas.snapshot().reports.at(-1)?.id>n,initialCount,{timeout:60000});assert((await snap()).reports.at(-1).craterMeters===0,'Jupiter live collision has no rock crater');await click('#btn-global-reset');
 await click('[data-lab-filter=energy]');assert(await page.locator('[data-exp=asteroid]').isHidden(),'type filter hides other categories');await click('[data-lab-filter=all]');
 await click('[data-layout-mode=mobile]');await page.setViewportSize({width:390,height:844});await page.waitForTimeout(600);assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),'390px mobile no horizontal overflow');await shot('v2-mobile-external');
 await click('#toggle-right-btn');await click('[data-right-tab=lab]');await shot('v2-mobile-types');await click('#btn-close-right');await click('#toggle-right-btn');await click('[data-right-tab=optics]');await shot('v2-mobile-motion');await click('#btn-close-right');
 await page.setViewportSize({width:320,height:568});await page.waitForTimeout(300);assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),'320px mobile no overflow');await shot('v2-mobile-small');
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(300);assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),'landscape mobile no overflow');await shot('v2-mobile-landscape');
 assert(errors.length===0,'no runtime or shader errors');fs.writeFileSync(path.join(__dirname,'v2-results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({passed:results.length,errors},null,2));
 }catch(e){console.error(e);console.error(errors);await shot('v2-test-failure').catch(()=>{});fs.writeFileSync(path.join(__dirname,'v2-failure.json'),JSON.stringify({results,errors,error:String(e)},null,2));process.exitCode=1;}finally{await browser.close();}
})();
