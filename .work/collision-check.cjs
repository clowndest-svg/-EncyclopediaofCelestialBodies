const {chromium}=require('playwright');const {pathToFileURL}=require('url');const path=require('path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});try{
const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto(pathToFileURL(path.join(__dirname,'..','cosmic_atlas_3_0.html')).href+'?test=1');await page.waitForFunction(()=>window.__atlas,{timeout:60000});
await page.locator('#quick-body-list button').filter({hasText:'地球'}).click();await page.locator('#btn-launch-exp').click();
try{await page.waitForFunction(()=>parseInt(document.querySelector('#stat-craters').textContent)>0,{timeout:12000});console.log('Targeted asteroid hit Earth');}catch{console.log('Targeted asteroid missed moving Earth');process.exitCode=2;}
console.log(await page.evaluate(()=>window.__atlas.snapshot()));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
