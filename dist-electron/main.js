import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerProductHandlers } from './ipc/productHandlers.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function createWindow() {
    const preloadPath = path.join(__dirname, 'preload.cjs');
    console.log('Preload:', preloadPath);
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
    }
    else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}
ipcMain.handle('app:test', () => {
    return 'Comunicação com o Electron funcionando!';
});
registerProductHandlers();
app.whenReady().then(() => {
    createWindow();
});
