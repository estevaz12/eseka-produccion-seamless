// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onLog: (callback) => ipcRenderer.on('monitor-log', (_, msg) => callback(msg)),
  onPlayAlertSound: (callback) => ipcRenderer.on('play-alert-sound', callback),
});
