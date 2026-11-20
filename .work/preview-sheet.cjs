const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1450,height:1050},deviceScaleFactor:1});
 await page.setContent('<style>html,body{margin:0;background:#02040a}canvas{display:block}</style><canvas width="1450" height="1050"></canvas>');
 const source=name=>'data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'screenshots',name)).toString('base64');
 const tiles=[['desktop-L2.png','黑洞 · 吸积流与光子环'],['desktop-L3.png','星系 · 差速恒星与尘埃'],['desktop-L4.png','超星系团 · 引力汇聚'],['desktop-L5.png','宇宙纤维网 · 物质流']].map(([file,label])=>({src:source(file),label}));
 await page.evaluate(async({tiles,phone})=>{
   const c=document.querySelector('canvas'),ctx=c.getContext('2d');ctx.fillStyle='#02040a';ctx.fillRect(0,0,1450,1050);ctx.fillStyle='#e9f1fc';ctx.font='bold 27px "Microsoft YaHei",sans-serif';ctx.fillText('星海图鉴 · 引力重制',30,42);ctx.font='14px "Microsoft YaHei",sans-serif';ctx.fillStyle='#a7bad3';ctx.fillText('实际浏览器画面 · 电脑双侧栏 / 手机底部抽屉 / 离线单文件',30,69);
   const image=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
   for(let i=0;i<tiles.length;i++){const img=await image(tiles[i].src),x=25+(i%2)*555,y=96+Math.floor(i/2)*445;ctx.strokeStyle='#28415d';ctx.strokeRect(x,y,537,420);ctx.drawImage(img,295,157,833,550,x+1,y+1,535,355);ctx.fillStyle='#e9f1fc';ctx.font='17px "Microsoft YaHei",sans-serif';ctx.fillText(tiles[i].label,x+15,y+388);}
   const img=await image(phone);ctx.drawImage(img,1155,96,270,584);ctx.fillStyle='#e9f1fc';ctx.font='17px "Microsoft YaHei",sans-serif';ctx.fillText('手机布局 · 390px',1155,713);ctx.font='14px "Microsoft YaHei",sans-serif';ctx.fillStyle='#a7bad3';['单指旋转，双指缩放','轨迹 / 引力快捷开关','抽屉面板不遮挡整屏','电脑 / 手机随时切换'].forEach((t,i)=>ctx.fillText(t,1155,751+i*30));ctx.fillText('物理与时间采用展示尺度。',30,1022);
 },{tiles,phone:source('mobile-L2.png')});
 await page.screenshot({path:path.join(__dirname,'..','星海图鉴_优化预览.png')});await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
