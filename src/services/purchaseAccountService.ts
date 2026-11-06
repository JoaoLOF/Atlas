export async function getPurchaseAccounts() {
  return window.api.purchaseAccounts.list();
}

export async function getPurchaseAccountById(id: number) {
  return window.api.purchaseAccounts.getById(id);
}

export async function createPurchaseAccount(data: {
  supplierId: number;
  purchaseReceiptId: number;
  description: string;
  originalAmount: number;
  dueDate: string;
  createdBy: number;
}) {
  return window.api.purchaseAccounts.create(data);
}