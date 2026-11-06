export async function getClients() {
  return window.api.clients.list();
}

export async function createClient(data: {
  name: string;
  identification: string;
}) {
  return window.api.clients.create(data);
}

export async function deactivateClient(id: number) {
  return window.api.clients.deactivate(id);
}