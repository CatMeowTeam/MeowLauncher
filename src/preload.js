const { contextBridge, ipcRenderer, webUtils } = require('electron');
const inv = (ch) => (...a) => ipcRenderer.invoke(ch, ...a);
const chans = ['state', 'config:set', 'lib:set', 'apps:add', 'apps:pick', 'apps:pickFolder', 'apps:launch', 'apps:folder', 'apps:remove', 'apps:refreshIcon',
  'desktop:clean', 'desktop:restore', 'desktop:openBackup', 'scan:startmenu', 'files:search', 'files:open', 'files:reveal', 'files:icon',
  'sys:stats', 'sys:procs', 'sys:kill', 'sys:explorer', 'sys:startup', 'sys:startupToggle', 'sys:installed', 'sys:uninstall', 'sys:junkScan', 'sys:junkClean',
  'sys:fix', 'sys:info', 'sys:ip', 'sys:wintool', 'sys:power', 'clips:set', 'clips:copy', 'copy', 'config:export', 'config:import', 'data:open',
  'win:hide', 'win:min', 'win:max', 'win:quit', 'open:url', 'dialog:open', 'ov:toggle', 'update:check', 'update:install', 'update:skip', 'update:page'];
const api = {};
for (const c of chans) api[c] = inv(c);
api.on = (ch, fn) => ipcRenderer.on(ch, (_e, d) => fn(d));
api.pathOf = (file) => { try { return webUtils.getPathForFile(file); } catch { return file.path || ''; } };
contextBridge.exposeInMainWorld('meow', api);
