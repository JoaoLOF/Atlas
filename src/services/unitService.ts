export async function getUnits() {
  return window.api.units.list();
}

export async function createUnit(data: {
  name: string;
  abbreviation: string;
}) {
  return window.api.units.create(data);
}

export async function deactivateUnit(id: number) {
  return window.api.units.deactivate(id);
}