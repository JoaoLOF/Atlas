"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log('Preload carregado');
electron_1.contextBridge.exposeInMainWorld('api', {
    test: () => electron_1.ipcRenderer.invoke('app:test'),
    products: {
        list: () => electron_1.ipcRenderer.invoke('products:list'),
    },
});
