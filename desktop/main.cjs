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

function resolveAppRoot() {
  const candidates = [
    path.resolve(__dirname, '..'),
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
    backgroundColor: '#020611',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'cosmos.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  mainWindow.loadURL(serverUrl);

  // Inject clean fullscreen/exit shortcuts + optional subtle desktop pill once loaded
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) {
      event.preventDefault();
      if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  session.defaultSession.on('will-download', (event, item) => {
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

app.whenReady().then(async () => {
  try {
    await startEmbeddedServer();
    createWindow();
  } catch (err) {
    dialog.showErrorBox('启动失败', `无法启动本地宇宙引擎：\n${err?.stack || err?.message || err}`);
    app.quit();
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
