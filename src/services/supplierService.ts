export async function getSuppliers() {
  return window.api.suppliers.list();
}

export async function createSupplier(data: {
  tradeName: string;
  taxId: string;
}) {
  return window.api.suppliers.create(data);
}

export async function deactivateSupplier(id: number) {
  return window.api.suppliers.deactivate(id);
}