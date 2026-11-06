export async function getPurchaseReceipts() {
  return window.api.purchaseReceipts.list();
}

export async function getPurchaseReceiptById(id: number) {
  return window.api.purchaseReceipts.getById(id);
}

export async function createPurchaseReceipt(data: {
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
}) {
  return window.api.purchaseReceipts.create(data);
}