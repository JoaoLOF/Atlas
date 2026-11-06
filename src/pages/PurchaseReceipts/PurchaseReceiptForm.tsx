import { useEffect, useState } from "react";
import { createPurchaseReceipt } from "../../services/purchaseReceiptService";
import { getSuppliers } from "../../services/supplierService";
import { getProducts } from "../../services/productService";
import { AlertModal, useModal } from "../../components/Modal";

type Supplier = Awaited<ReturnType<typeof getSuppliers>>[number];
type Product = Awaited<ReturnType<typeof getProducts>>[number];

type ReceiptItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitCost: number;
};

type PurchaseReceiptFormProps = {
  onCreated: () => void;
  onCancel: () => void;
};

function PurchaseReceiptForm({
  onCreated,
  onCancel,
}: PurchaseReceiptFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [notes, setNotes] = useState("");

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");

  const [items, setItems] = useState<ReceiptItem[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showModal, modalProps } = useModal();

  useEffect(() => {
    async function loadOptions() {
      try {
        const [suppliersResult, productsResult] = await Promise.all([
          getSuppliers(),
          getProducts(),
        ]);

        setSuppliers(suppliersResult.filter((supplier) => supplier.active));

        setProducts(productsResult.filter((product) => product.active));
      } catch (error) {
        console.error("Erro ao carregar fornecedores e produtos:", error);
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
    setReceiptDate(today);
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

    if (!unitCost) {
      showModal({ title: "Atenção!", message: "Informe o custo unitário." });
      return;
    }

    const quantityValue = Number(quantity.replace(",", "."));

    const unitCostValue = Number(unitCost.replace(",", "."));

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      showModal({
        title: "Atenção!",
        message: "Informe uma quantidade válida maior que zero.",
      });
      return;
    }

    if (!Number.isFinite(unitCostValue) || unitCostValue < 0) {
      showModal({
        title: "Atenção!",
        message: "Informe um custo unitário válido.",
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

    const existingItem = items.find(
      (item) => item.productId === Number(productId),
    );

    if (existingItem) {
      showModal({
        title: "Atenção!",
        message: "Esse produto já foi adicionado à entrada.",
      });
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: quantityValue,
        unitCost: unitCostValue,
      },
    ]);

    setProductId("");
    setQuantity("");
    setUnitCost("");
  }

  function handleRemoveItem(productIdToRemove: number) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productIdToRemove),
    );
  }

  function calculateItemTotal(item: ReceiptItem) {
    return item.quantity * item.unitCost;
  }

  function calculateTotal() {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supplierId) {
      showModal({ title: "Atenção!", message: "Selecione um fornecedor." });
      return;
    }

    if (!invoiceNumber.trim()) {
      showModal({ title: "Atenção!", message: "Informe o número da nota." });
      return;
    }

    if (!receiptDate) {
      showModal({ title: "Atenção!", message: "Informe a data da entrada." });
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
        !Number.isFinite(item.unitCost) ||
        item.unitCost < 0,
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

      await createPurchaseReceipt({
        supplierId: Number(supplierId),
        invoiceNumber: invoiceNumber.trim(),
        receiptDate,
        notes: notes.trim(),
        createdBy: 1,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
      });

      onCreated();
    } catch (error) {
      console.error("Erro ao cadastrar entrada:", error);
      showModal({
        title: "Atenção!",
        message: "Não foi possível cadastrar a entrada.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loadingOptions) {
    return <p>Carregando dados...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nova entrada de mercadorias</h2>
      <div>
        <label>Fornecedor</label>
        <br />

        <select
          value={supplierId}
          onChange={(event) => setSupplierId(event.target.value)}
        >
          <option value="">Selecione um fornecedor</option>

          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.trade_name}
            </option>
          ))}
        </select>
      </div>
      <br />
      <div>
        <label>Número da nota</label>
        <br />

        <input
          type="text"
          value={invoiceNumber}
          onChange={(event) => setInvoiceNumber(event.target.value)}
          placeholder="Ex.: 12345"
        />
      </div>
      <br />
      <div>
        <label>Data da entrada</label>
        <br />

        <input
          type="date"
          value={receiptDate}
          onChange={(event) => setReceiptDate(event.target.value)}
        />
      </div>
      <br />
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
              {product.name}
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
        <label>Custo unitário</label>
        <br />

        <input
          type="text"
          inputMode="decimal"
          value={unitCost}
          onChange={(event) => setUnitCost(event.target.value)}
          placeholder="0,00"
        />
      </div>
      <br />
      <button type="button" onClick={handleAddItem}>
        Adicionar produto
      </button>
      <hr />
      <h3>Itens da entrada</h3>
      {items.length === 0 ? (
        <p>Nenhum produto adicionado.</p>
      ) : (
        <div>
          {items.map((item) => (
            <div key={item.productId}>
              <strong>{item.productName}</strong>

              <p>Quantidade: {item.quantity}</p>

              <p>Custo unitário: R$ {item.unitCost.toFixed(2)}</p>

              <p>Total: R$ {calculateItemTotal(item).toFixed(2)}</p>

              <button
                type="button"
                onClick={() => handleRemoveItem(item.productId)}
              >
                Remover
              </button>

              <hr />
            </div>
          ))}
        </div>
      )}
      <h3>Total da entrada: R$ {calculateTotal().toFixed(2)}</h3>
      <div>
        <label>Observações</label>
        <br />

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
        />
      </div>
      <br />
      <button type="button" onClick={onCancel} disabled={saving}>
        Cancelar
      </button>{" "}
      <button type="submit" disabled={saving || items.length === 0}>
        {saving ? "Salvando..." : "Salvar entrada"}
      </button>
      <AlertModal {...modalProps} />
    </form>
  );
}

export default PurchaseReceiptForm;
