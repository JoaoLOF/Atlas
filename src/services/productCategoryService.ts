export async function getProductCategories() {
  return window.api.productCategories.list();
}

export async function createProductCategory(data: {
  name: string;
  description: string;
}) {
  return window.api.productCategories.create(data);
}

export async function deactivateProductCategory(id: number) {
  return window.api.productCategories.deactivate(id);
}