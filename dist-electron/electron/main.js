import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerProductHandlers } from "./ipc/productHandlers.js";
import { registerProductCategoryHandlers } from "./ipc/productCategoryHandlers.js";
import { registerUnitHandlers } from "./ipc/unitHandlers.js";
import { registerSupplierHandlers } from "./ipc/supplierHandlers.js";
import { registerPurchaseReceiptHandlers } from "./ipc/purchaseReceiptHandlers.js";
import { registerStockMovementHandlers } from "./ipc/stockMovementHandlers.js";
import { registerSaleReceiptHandlers } from "./ipc/saleReceiptHandlers.js";
import { registerClientHandlers } from "./ipc/clientHandlers.js";
import { registerPurchaseAccountHandlers } from "./ipc/purchaseAccountHandlers.js";
import { registerFinancialPaymentHandlers } from "./ipc/financialPaymentHandlers.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function createWindow() {
    const preloadPath = path.join(__dirname, "preload.cjs");
    console.log("Preload:", preloadPath);
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (process.env.NODE_ENV === "development") {
        win.loadURL("http://localhost:5173");
    }
    else {
        win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
}
ipcMain.handle("app:test", () => {
    return "Comunicação com o Electron funcionando!";
});
registerProductHandlers();
registerProductCategoryHandlers();
registerUnitHandlers();
registerSupplierHandlers();
registerPurchaseReceiptHandlers();
registerStockMovementHandlers();
registerSaleReceiptHandlers();
registerClientHandlers();
registerPurchaseAccountHandlers();
registerFinancialPaymentHandlers();
app.whenReady().then(() => {
    createWindow();
});
