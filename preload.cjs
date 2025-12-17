const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  importImage: () => ipcRenderer.invoke('import-image'),
  exportPng: (dataUrl) => ipcRenderer.invoke('export-png', dataUrl),
  exportIcns: (dataUrl) => ipcRenderer.invoke('export-icns', dataUrl),
  // AI Logo Generator APIs
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  readProjectInfo: (projectPath) => ipcRenderer.invoke('read-project-info', projectPath)
})

