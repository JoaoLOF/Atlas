export async function getStockMovements() {
  return window.api.stockMovements.list();
}

export async function getStockMovementsByProduct(productId: number) {
  return window.api.stockMovements.listByProduct(productId);
}
