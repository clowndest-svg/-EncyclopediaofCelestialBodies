const { app, BrowserWindow, Menu, ipcMain, dialog, session } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-webgl');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let fastifyApp = null;
let serverUrl = '';

const BOOT_SPLASH_HTML = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:radial-gradient(ellipse 75% 60% at 50% 44%,#0e1d3a 0%,#050b18 58%,#02040a 100%);color:#eef3fb;font-family:"Segoe UI Variable Text","Segoe UI","Microsoft YaHei UI",system-ui,sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column}
.orb{position:relative;width:96px;height:96px;margin-bottom:24px;display:flex;align-items:center;justify-content:center}
.r1{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(56,189,248,.34);animation:spin 7s linear infinite}
.r1:before{content:"";position:absolute;top:-4px;left:50%;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:#38bdf8;box-shadow:0 0 12px #38bdf8}
.r2{position:absolute;inset:12px;border-radius:50%;border:1px solid rgba(251,191,36,.38);animation:spin 4.2s linear infinite reverse}
.r2:before{content:"";position:absolute;bottom:-3px;left:50%;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:#fbbf24;box-shadow:0 0 10px #fbbf24}
.core{width:34px;height:34px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#7dd3fc,#2563eb 60%,#1e1b4b);box-shadow:0 0 28px rgba(56,189,248,.65)}
h1{font-size:24px;font-weight:600;letter-spacing:.28em;background:linear-gradient(90deg,#bfe3ff,#fff 50%,#d9ccff);-webkit-background-clip:text;color:transparent;margin-bottom:8px}
p{font-size:12px;color:#91a3bd;letter-spacing:.12em}
.bar{width:220px;height:3px;border-radius:99px;background:rgba(148,163,184,.18);overflow:hidden;margin-top:18px}
.fill{width:38%;height:100%;border-radius:99px;background:linear-gradient(90deg,#7cc4ff,#a78bfa);animation:pulse 1.3s ease-in-out infinite alternate}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{from{transform:translateX(-20%)}to{transform:translateX(170%)}}
</style></head><body>
<div class="orb"><div class="r1"></div><div class="r2"></div><div class="core"></div></div>
<h1>万象寰宇 · 宇宙沙盘 2</h1>
<p>正在启动本地天体物理引擎与 25,262 条星海数据库…</p>
<div class="bar"><div class="fill"></div></div>
</body></html>`;

function resolveAppRoot() {
  const candidates = [
    path.resolve(__dirname, '..'),
    process.resourcesPath ? path.join(process.resourcesPath, 'app.asar') : '',
    process.resourcesPath ? path.join(process.resourcesPath, 'app') : ''
  ].filter(Boolean);
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'server', 'index.mjs'))) return dir;
  }
  return path.resolve(__dirname, '..');
}

async function startEmbeddedServer() {
  const appRoot = resolveAppRoot();
  const userDataDir = path.join(app.getPath('userData'), 'cosmic-data');
  fs.mkdirSync(userDataDir, { recursive: true });
  const modUrl = pathToFileURL(path.join(appRoot, 'server', 'index.mjs')).href;
  const { createApp } = await import(modUrl);
  fastifyApp = await createApp({
    dataDir: path.join(appRoot, 'server', 'data'),
    sandboxDataDir: userDataDir,
    preferRawLoopback: true,
    storage: {
      redis: false,
      sqlitePath: path.join(userDataDir, 'catalog.sqlite')
    }
  });
  await fastifyApp.listen({ host: '127.0.0.1', port: 0 });
  const addr = fastifyApp.server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 8090;
  serverUrl = `http://127.0.0.1:${port}/`;
}

function createWindow() {
  Menu.setApplicationMenu(null);
  mainWindow = new BrowserWindow({
    title: '万象寰宇 · 宇宙沙盘 2（桌面独立版）',
    width: 1440,
    height: 900,
    fullscreen: true,
    backgroundColor: '#02040a',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'cosmos.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  // 立即呈现深空启动帧，不等后端和 3D 编译完成
  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(BOOT_SPLASH_HTML));

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) {
      event.preventDefault();
      if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3 || !serverUrl || !validatedURL?.startsWith('http://127.0.0.1')) return;
    dialog.showErrorBox('页面加载失败', `无法连接本地引擎 (${errorCode}: ${errorDescription})`);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    if (details.reason !== 'clean-exit' && mainWindow && serverUrl) {
      mainWindow.loadURL(serverUrl);
    }
  });

  session.defaultSession.on('will-download', (_event, item) => {
    const pictures = app.getPath('desktop') || app.getPath('downloads');
    const filename = item.getFilename() || `cosmic-capture-${Date.now()}.png`;
    item.setSavePath(path.join(pictures, filename));
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

ipcMain.handle('desktop:toggle-fullscreen', () => {
  if (!mainWindow) return false;
  const next = !mainWindow.isFullScreen();
  mainWindow.setFullScreen(next);
  return next;
});
ipcMain.handle('desktop:is-fullscreen', () => !!mainWindow?.isFullScreen());
ipcMain.handle('desktop:quit', () => app.quit());

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function showFatalInWindow(title, detail) {
  try {
    const logDir = path.join(app.getPath('userData'), 'cosmic-data');
    fs.mkdirSync(logDir, { recursive: true });
    fs.writeFileSync(path.join(logDir, 'boot-error.log'), `[${new Date().toISOString()}] ${title}\n${detail}\n`, 'utf8');
  } catch {}
  if (mainWindow && !mainWindow.isDestroyed()) {
    const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>body{margin:0;background:#050a16;color:#eef3fb;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;padding:32px}.card{max-width:720px;background:rgba(15,23,42,.92);border:1px solid rgba(248,113,113,.45);border-radius:16px;padding:24px}h2{color:#fca5a5;margin:0 0 12px}pre{white-space:pre-wrap;word-break:break-all;font-size:12px;color:#cbd5e1;max-height:50vh;overflow:auto}</style></head><body><div class="card"><h2>${title}</h2><pre>${String(detail).replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</pre></div></body></html>`;
    mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html)).catch(() => {});
  }
}

app.whenReady().then(async () => {
  createWindow();
  try {
    await startEmbeddedServer();
    if (mainWindow && !mainWindow.isDestroyed()) {
      await mainWindow.loadURL(serverUrl);
    }
  } catch (err) {
    showFatalInWindow('本地宇宙引擎启动失败', err?.stack || err?.message || String(err));
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', async () => {
  if (fastifyApp) {
    try { await fastifyApp.close(); } catch {}
    fastifyApp = null;
  }
});
