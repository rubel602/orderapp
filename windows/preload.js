const { contextBridge, ipcRenderer } = require('electron');

// Used by the Data Backup page ("App version" + "Check for update")
contextBridge.exposeInMainWorld('DesktopBridge', {
  version: () => ipcRenderer.sendSync('app:version'),
  checkUpdate: () => ipcRenderer.send('app:check')
});
