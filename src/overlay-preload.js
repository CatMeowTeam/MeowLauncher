const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ov', { on: (fn) => ipcRenderer.on('ov', (_e, d) => fn(d)), onLang: (fn) => ipcRenderer.on('ov-lang', (_e, l) => fn(l)) });
