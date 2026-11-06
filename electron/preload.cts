import { contextBridge, ipcRenderer } from "electron";

console.log("Preload carregado");

contextBridge.exposeInMainWorld("api", {
  test: () => ipcRenderer.invoke("app:test"),

  products: {
    list: () => ipcRenderer.invoke("products:list"),

    create: (data: {
      internalCode: string;
      categoryId: number;
      unitId: number;
      name: string;
      description: string;
      barcode: string | null;
      salePrice: number;
      minimumStock: number;
    }) => ipcRenderer.invoke("products:create", data),
  },

  productCategories: {
    list: () => ipcRenderer.invoke("product-categories:list"),

    create: (data: { name: string; description: string }) =>
      ipcRenderer.invoke("product-categories:create", data),

    deactivate: (id: number) =>
      ipcRenderer.invoke("product-categories:deactivate", id),
  },

  units: {
    list: () => ipcRenderer.invoke("units:list"),

    create: (data: { name: string; abbreviation: string }) =>
      ipcRenderer.invoke("units:create", data),

    deactivate: (id: number) => ipcRenderer.invoke("units:deactivate", id),
  },

  suppliers: {
    list: () => ipcRenderer.invoke("suppliers:list"),

    create: (data: { tradeName: string; taxId: string }) =>
      ipcRenderer.invoke("suppliers:create", data),

    deactivate: (id: number) => ipcRenderer.invoke("suppliers:deactivate", id),
  },

  purchaseReceipts: {
    list: () => ipcRenderer.invoke("purchase-receipts:list"),

    getById: (id: number) =>
      ipcRenderer.invoke("purchase-receipts:get-by-id", id),

    create: (data: {
      supplierId: number;
      invoiceNumber: string;
      receiptDate: string;
      notes: string;
      createdBy: number;
      items: {
        productId: number;
        quantity: number;
        unitCost: number;
      }[];
    }) => ipcRenderer.invoke("purchase-receipts:create", data),
  },

  stockMovements: {
    list: () => ipcRenderer.invoke("stock-movements:list"),

    listByProduct: (productId: number) =>
      ipcRenderer.invoke("stock-movements:list-by-product", productId),
  },

  clients: {
    list: () => ipcRenderer.invoke("clients:list"),

    create: (data: { name: string; identification: string }) =>
      ipcRenderer.invoke("clients:create", data),

    deactivate: (id: number) => ipcRenderer.invoke("clients:deactivate", id),
  },

  saleReceipts: {
    list: () => ipcRenderer.invoke("sale-receipts:list"),

    create: (data: {
      clientId: number;
      saleDate: string;
      createdBy: number;
      items: {
        productId: number;
        quantity: number;
        unitPrice: number;
      }[];
    }) => ipcRenderer.invoke("sale-receipts:create", data),
  },

  purchaseAccounts: {
    list: () => ipcRenderer.invoke("purchase-accounts:list"),

    getById: (id: number) =>
      ipcRenderer.invoke("purchase-accounts:get-by-id", id),

    create: (data: {
      supplierId: number;
      purchaseReceiptId: number;
      description: string;
      originalAmount: number;
      dueDate: string;
      createdBy: number;
    }) => ipcRenderer.invoke("purchase-accounts:create", data),
  },

  financialPayments: {
    create: (data: {
      purchaseAccountId: number;
      paymentDate: string;
      paidAmount: number;
      interestAmount: number;
      discountAmount: number;
      paymentMethod: string;
      notes: string;
      createdBy: number;
    }) => ipcRenderer.invoke("financial-payments:create", data),

    delete: (paymentId: number) =>
      ipcRenderer.invoke("financial-payments:delete", {
        paymentId,
      }),
  },
});
