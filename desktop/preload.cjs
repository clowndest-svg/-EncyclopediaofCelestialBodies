const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cosmicDesktop', {
  isDesktop: true,
  toggleFullscreen: () => ipcRenderer.invoke('desktop:toggle-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('desktop:is-fullscreen'),
  quit: () => ipcRenderer.invoke('desktop:quit')
});
