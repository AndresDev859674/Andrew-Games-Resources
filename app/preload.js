// preload.js
const { contextBridge, process } = require('electron');

// Exponemos las versiones mediante un canal seguro usando contextBridge
contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
});
