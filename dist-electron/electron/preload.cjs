"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log("Preload carregado");
electron_1.contextBridge.exposeInMainWorld("api", {
    test: () => electron_1.ipcRenderer.invoke("app:test"),
    products: {
        list: () => electron_1.ipcRenderer.invoke("products:list"),
        create: (data) => electron_1.ipcRenderer.invoke("products:create", data),
    },
    productCategories: {
        list: () => electron_1.ipcRenderer.invoke("product-categories:list"),
        create: (data) => electron_1.ipcRenderer.invoke("product-categories:create", data),
        deactivate: (id) => electron_1.ipcRenderer.invoke("product-categories:deactivate", id),
    },
    units: {
        list: () => electron_1.ipcRenderer.invoke("units:list"),
        create: (data) => electron_1.ipcRenderer.invoke("units:create", data),
        deactivate: (id) => electron_1.ipcRenderer.invoke("units:deactivate", id),
    },
    suppliers: {
        list: () => electron_1.ipcRenderer.invoke("suppliers:list"),
        create: (data) => electron_1.ipcRenderer.invoke("suppliers:create", data),
        deactivate: (id) => electron_1.ipcRenderer.invoke("suppliers:deactivate", id),
    },
    purchaseReceipts: {
        list: () => electron_1.ipcRenderer.invoke("purchase-receipts:list"),
        getById: (id) => electron_1.ipcRenderer.invoke("purchase-receipts:get-by-id", id),
        create: (data) => electron_1.ipcRenderer.invoke("purchase-receipts:create", data),
    },
    stockMovements: {
        list: () => electron_1.ipcRenderer.invoke("stock-movements:list"),
        listByProduct: (productId) => electron_1.ipcRenderer.invoke("stock-movements:list-by-product", productId),
    },
    clients: {
        list: () => electron_1.ipcRenderer.invoke("clients:list"),
        create: (data) => electron_1.ipcRenderer.invoke("clients:create", data),
        deactivate: (id) => electron_1.ipcRenderer.invoke("clients:deactivate", id),
    },
    saleReceipts: {
        list: () => electron_1.ipcRenderer.invoke("sale-receipts:list"),
        create: (data) => electron_1.ipcRenderer.invoke("sale-receipts:create", data),
    },
    purchaseAccounts: {
        list: () => electron_1.ipcRenderer.invoke("purchase-accounts:list"),
        getById: (id) => electron_1.ipcRenderer.invoke("purchase-accounts:get-by-id", id),
        create: (data) => electron_1.ipcRenderer.invoke("purchase-accounts:create", data),
    },
    financialPayments: {
        create: (data) => electron_1.ipcRenderer.invoke("financial-payments:create", data),
        delete: (paymentId) => electron_1.ipcRenderer.invoke("financial-payments:delete", {
            paymentId,
        }),
    },
});
