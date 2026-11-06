import { contextBridge, ipcRenderer } from 'electron';
console.log('Preload carregado');
contextBridge.exposeInMainWorld('api', {
    test: () => ipcRenderer.invoke('app:test'),
});
