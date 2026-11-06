export async function getSaleReceipts() {
  return window.api.saleReceipts.list();
}

export async function createSaleReceipt(data: {
  clientId: number;
  saleDate: string;
  createdBy: number;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}) {
  return window.api.saleReceipts.create(data);
}