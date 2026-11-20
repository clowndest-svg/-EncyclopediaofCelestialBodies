import Fastify from 'fastify';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {gzipSync} from 'node:zlib';import {loadCatalog,enrichItem,normalizeQuery} from './catalog.mjs';import {createStorage} from './storage.mjs';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function createApp(options={}){
 const dataDir=options.dataDir||path.join(ROOT,'server/data'),catalog=options.catalog||await loadCatalog(dataDir);if(!catalog.items.length)throw new Error('目录为空，请先运行 npm run catalog:core 和 npm run catalog:pack');
 const storage=await createStorage(catalog,dataDir,options.storage||{}),app=Fastify({logger:false,bodyLimit:16384});
 app.addHook('onSend',async(req,reply,payload)=>{reply.header('X-Content-Type-Options','nosniff');reply.header('Referrer-Policy','same-origin');return payload;});
 app.get('/api/health',async()=>({ok:true,...storage.status()}));
 app.get('/api/catalog/stats',async()=>({...catalog.stats,storage:storage.mode}));
 app.get('/api/catalog/sources',async()=>catalog.sources);
 app.get('/api/objects',async req=>storage.list(normalizeQuery(req.query)));
 app.get('/api/objects/random',async req=>{const q=normalizeQuery(req.query),items=catalog.items.filter(i=>(!q.realm||i.realm===q.realm)&&(!q.kind||i.kind===q.kind));return items.length?enrichItem(items[Math.floor(Math.random()*items.length)]):{error:'未找到此类天体'};});
 app.get('/api/objects/:id',async(req,reply)=>{const id=String(req.params.id).slice(0,180),item=catalog.byId.get(id);if(!item)return reply.code(404).send({error:'未找到该天体',id});return storage.cached('detail:'+id,1800,async()=>enrichItem(item));});
 app.get('/api/compare',async(req,reply)=>{const ids=String(req.query.ids||'').split(',').slice(0,4),items=ids.map(id=>catalog.byId.get(id)).filter(Boolean);if(!items.length)return reply.code(400).send({error:'请指定有效的天体'});return {items:items.map(enrichItem),note:'只比较目录提供的已知参数；不同温度定义和未知数据不可直接等同。'};});
 const staticFiles={'/':'cosmic_atlas_3_0.html','/cosmic_atlas_3_0.html':'cosmic_atlas_3_0.html','/encyclopedia-catalog.js':'encyclopedia-catalog.js'};const buffers=new Map();
 for(const [url,file] of Object.entries(staticFiles))app.get(url,async(req,reply)=>{try{const full=path.join(ROOT,file),stat=await fs.stat(full);let cached=buffers.get(file);if(!cached||cached.mtime!==stat.mtimeMs){const bytes=await fs.readFile(full);cached={bytes,gzip:gzipSync(bytes),mtime:stat.mtimeMs};buffers.set(file,cached);}reply.type(file.endsWith('.html')?'text/html; charset=utf-8':'application/javascript; charset=utf-8');reply.header('Cache-Control',file.endsWith('.html')?'no-cache':'public, max-age=3600');if(String(req.headers['accept-encoding']||'').includes('gzip')){reply.header('Content-Encoding','gzip');return cached.gzip;}return cached.bytes;}catch(e){if(e.code==='ENOENT')return reply.code(404).send({error:'文件尚未生成'});throw e;}});
 app.setErrorHandler((error,req,reply)=>{reply.code(error.statusCode||500).send({error:error.statusCode===400?'请求参数无效':'服务暂时无法完成请求'});});
 app.addHook('onClose',async()=>storage.close());app.catalog=catalog;app.catalogStorage=storage;return app;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const app=await createApp(),host=process.argv.includes('--lan')?'0.0.0.0':process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||8090);await app.listen({host,port});console.log(`星海百科已启动：http://localhost:${port} · ${app.catalog.stats.total} 条 · ${app.catalogStorage.mode} · Redis ${app.catalogStorage.status().redis}`);console.log('访问无需账号、口令或API密钥。数据库只在服务器内部使用；不会修改现有数据库权限。');
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await app.close();process.exit(0);});
}
