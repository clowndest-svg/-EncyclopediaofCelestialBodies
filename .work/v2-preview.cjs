const {chromium}=require('playwright');const fs=require('fs'),path=require('path');const {pathToFileURL}=require('url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const app=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});await app.goto(pathToFileURL(path.join(__dirname,'..','cosmic_atlas_3_0.html')).href+'?test=1');await app.waitForFunction(()=>window.__atlas,null,{timeout:60000});await app.waitForSelector('#loading-screen',{state:'detached',timeout:20000});await app.locator('#right-panel').screenshot({path:path.join(__dirname,'screenshots','v2-all-types-panel.png')});await app.close();
 const page=await browser.newPage({viewport:{width:1640,height:1120},deviceScaleFactor:1});await page.setContent('<style>html,body{margin:0;background:#02040a}canvas{display:block}</style><canvas width="1640" height="1120"></canvas>');
 const image=name=>'data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'screenshots',name)).toString('base64');
 const frames=[['v2-solar-external.png','银河参考 · 太阳系整体行进'],['v2-solar-local.png','日心参考 · 查看行星相对轨道'],['v2-effect-airburst.png','真实再入 · 烧蚀、碎裂与空爆'],['v2-L4.png','星系团 · 节点也在相互引力中移动']].map(([file,title],i)=>({src:image(file),title,kind:i===2?'planet':'wide'}));
 await page.evaluate(async({frames,types,phone})=>{
  const ctx=document.querySelector('canvas').getContext('2d');ctx.fillStyle='#02040a';ctx.fillRect(0,0,1640,1120);ctx.fillStyle='#ecf3fb';ctx.font='bold 29px "Microsoft YaHei",sans-serif';ctx.fillText('星海图鉴 · 运动参考系与 14 类实验',28,46);ctx.font='15px "Microsoft YaHei",sans-serif';ctx.fillStyle='#a8bfd8';ctx.fillText('实际浏览器画面 · 数值轨迹 / 独立实验时钟 / 分类型参数 / 手机适配',28,76);
  const load=src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.src=src;});
  const fit=(img,sx,sy,sw,sh,x,y,w,h)=>{const k=Math.min(w/sw,h/sh);ctx.drawImage(img,sx,sy,sw,sh,x+(w-sw*k)/2,y+(h-sh*k)/2,sw*k,sh*k);};
  for(let i=0;i<frames.length;i++){const img=await load(frames[i].src),x=28+(i%2)*565,y=104+Math.floor(i/2)*470;ctx.strokeStyle='#2a425b';ctx.strokeRect(x,y,540,445);if(frames[i].kind==='wide')fit(img,295,128,img.width-610,img.height-220,x+1,y+1,538,392);else fit(img,270,90,img.width-550,img.height-205,x+1,y+1,538,392);ctx.font='18px "Microsoft YaHei",sans-serif';ctx.fillStyle='#e5eef8';ctx.fillText(frames[i].title,x+14,y+422);}
  const panel=await load(types);ctx.font='18px "Microsoft YaHei",sans-serif';ctx.fillStyle='#e5eef8';ctx.fillText('实验分类与参数',1174,126);fit(panel,0,0,panel.width,panel.height,1162,145,286,810);
  const mobile=await load(phone);ctx.fillText('手机布局',1470,126);fit(mobile,0,0,mobile.width,mobile.height,1465,145,150,400);ctx.font='13px "Microsoft YaHei",sans-serif';ctx.fillStyle='#adc3d8';['单指旋转','双指缩放','底部抽屉','参考系切换'].forEach((s,i)=>ctx.fillText(s,1472,590+i*28));
  ctx.font='14px "Microsoft YaHei",sans-serif';ctx.fillText('显示比例有压缩与放大；轨道不是天文历表，实验不是灾害预测或武器工程模拟。',28,1090);
 },{frames,types:image('v2-all-types-panel.png'),phone:image('v2-mobile-types.png')});
 await page.screenshot({path:path.join(__dirname,'..','星海图鉴_运动与实验升级预览.png')});await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
