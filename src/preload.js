// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onLog: (callback) => ipcRenderer.on('log', (_, msg) => callback(msg)),
  onSendMessage: (callback) =>
    ipcRenderer.on('send-message', (_, msg) => callback(msg)),
});

contextBridge.exposeInMainWorld('env', {
  BOT_API: process.env.BOT_API,
  CHAT_ID: process.env.CHAT_ID,
});
