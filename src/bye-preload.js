const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('bye', { done: (code) => ipcRenderer.send('bye:done', code) });
