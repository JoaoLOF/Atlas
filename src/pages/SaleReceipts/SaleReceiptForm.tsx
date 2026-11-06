import { useEffect, useState } from "react";
import { createSaleReceipt } from "../../services/saleReceiptService";
import { getClients } from "../../services/clientService";
import { getProducts } from "../../services/productService";
import { AlertModal, useModal } from "../../components/Modal";

type Client = Awaited<ReturnType<typeof getClients>>[number];
type Product = Awaited<ReturnType<typeof getProducts>>[number];

type SaleItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type SaleReceiptFormProps = {
  onCreated: () => void;
  onCancel: () => void;
};

function SaleReceiptForm({ onCreated, onCancel }: SaleReceiptFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [clientId, setClientId] = useState("");
  const [saleDate, setSaleDate] = useState("");

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const [items, setItems] = useState<SaleItem[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showModal, modalProps } = useModal();

  useEffect(() => {
    async function loadOptions() {
      try {
        const [clientsResult, productsResult] = await Promise.all([
          getClients(),
          getProducts(),
        ]);

        setClients(clientsResult.filter((client) => client.active));

        setProducts(productsResult.filter((product) => product.active));
      } catch (error) {
        console.error("Erro ao carregar clientes e produtos:", error);

        showModal({
          title: "Atenção!",
          message: "Não foi possível carregar os dados.",
        });
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();

    const today = new Date().toISOString().split("T")[0];
    setSaleDate(today);
  }, []);

  function handleAddItem() {
    if (!productId) {
      showModal({ title: "Atenção!", message: "Selecione um produto." });
      return;
    }

    if (!quantity) {
      showModal({ title: "Atenção!", message: "Informe a quantidade." });
      return;
    }

    if (!unitPrice) {
      showModal({ title: "Atenção!", message: "Informe o preço unitário." });
      return;
    }

    const quantityValue = Number(quantity.replace(",", "."));

    const unitPriceValue = Number(unitPrice.replace(",", "."));

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      showModal({
        title: "Atenção!",
        message: "Informe uma quantidade válida maior que zero.",
      });
      return;
    }

    if (!Number.isFinite(unitPriceValue) || unitPriceValue < 0) {
      showModal({
        title: "Atenção!",
        message: "Informe um preço unitário válido.",
      });
      return;
    }

    const selectedProduct = products.find(
      (product) => product.id === Number(productId),
    );

    if (!selectedProduct) {
      showModal({ title: "Atenção!", message: "Produto não encontrado." });
      return;
    }

    if (selectedProduct.current_stock < quantityValue) {
      showModal({
        title: "Atenção!",
        message: `Estoque insuficiente. Estoque atual: ${selectedProduct.current_stock}.`,
      });
      return;
    }

    const existingItem = items.find(
      (item) => item.productId === Number(productId),
    );

    if (existingItem) {
      showModal({
        title: "Atenção!",
        message: "Esse produto já foi adicionado à venda.",
      });
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: quantityValue,
        unitPrice: unitPriceValue,
      },
    ]);

    setProductId("");
    setQuantity("");
    setUnitPrice("");
  }

  function handleRemoveItem(productIdToRemove: number) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productIdToRemove),
    );
  }

  function calculateItemTotal(item: SaleItem) {
    return item.quantity * item.unitPrice;
  }

  function calculateTotal() {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!clientId) {
      showModal({ title: "Atenção!", message: "Selecione um cliente." });
      return;
    }

    if (!saleDate) {
      showModal({ title: "Atenção!", message: "Informe a data da venda." });
      return;
    }

    if (items.length === 0) {
      showModal({
        title: "Atenção!",
        message: "Adicione pelo menos um produto.",
      });
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.unitPrice) ||
        item.unitPrice < 0,
    );

    if (invalidItem) {
      showModal({
        title: "Atenção!",
        message: "Existe um item com valores inválidos.",
      });
      return;
    }

    try {
      setSaving(true);

      await createSaleReceipt({
        clientId: Number(clientId),
        saleDate,
        createdBy: 1,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      onCreated();
    } catch (error) {
      console.error("Erro ao cadastrar venda:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a venda.";

      showModal({ title: "Erro", message: message });
    } finally {
      setSaving(false);
    }
  }

  if (loadingOptions) {
    return <p>Carregando dados...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nova venda</h2>
      <div>
        <label>Cliente</label>
        <br />

        <select
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
        >
          <option value="">Selecione um cliente</option>

          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>
      <br />
      <div>
        <label>Data da venda</label>
        <br />

        <input
          type="date"
          value={saleDate}
          onChange={(event) => setSaleDate(event.target.value)}
        />
      </div>
      <hr />
      <h3>Adicionar produto</h3>
      <div>
        <label>Produto</label>
        <br />

        <select
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
        >
          <option value="">Selecione um produto</option>

          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} — Estoque: {product.current_stock}
            </option>
          ))}
        </select>
      </div>
      <br />
      <div>
        <label>Quantidade</label>
        <br />

        <input
          type="text"
          inputMode="decimal"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          placeholder="0,00"
        />
      </div>
      <br />
      <div>
        <label>Preço unitário</label>
        <br />

        <input
          type="text"
          inputMode="decimal"
          value={unitPrice}
          onChange={(event) => setUnitPrice(event.target.value)}
          placeholder="0,00"
        />
      </div>
      <br />
      <button type="button" onClick={handleAddItem}>
        Adicionar produto
      </button>
      <hr />
      <h3>Itens da venda</h3>
      {items.length === 0 ? (
        <p>Nenhum produto adicionado.</p>
      ) : (
        items.map((item) => (
          <div key={item.productId}>
            <strong>{item.productName}</strong>

            <p>Quantidade: {item.quantity}</p>

            <p>Preço unitário: R$ {item.unitPrice.toFixed(2)}</p>

            <p>Total: R$ {calculateItemTotal(item).toFixed(2)}</p>

            <button
              type="button"
              onClick={() => handleRemoveItem(item.productId)}
            >
              Remover
            </button>

            <hr />
          </div>
        ))
      )}
      <h3>Total da venda: R$ {calculateTotal().toFixed(2)}</h3>
      <button type="button" onClick={onCancel} disabled={saving}>
        Cancelar
      </button>{" "}
      <button type="submit" disabled={saving || items.length === 0}>
        {saving ? "Salvando..." : "Salvar venda"}
      </button>
      <AlertModal {...modalProps} />
    </form>
  );
}

export default SaleReceiptForm;
