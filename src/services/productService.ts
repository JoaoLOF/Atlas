export async function getProducts() {
  return window.api.products.list();
}

export async function createProduct(data: {
  internalCode: string;
  categoryId: number;
  unitId: number;
  name: string;
  description: string;
  barcode: string | null;
  salePrice: number;
  minimumStock: number;
}) {
  return window.api.products.create(data);
}