import { useEffect, useState } from "react";
import { createPurchaseAccount } from "../../services/purchaseAccountService";
import { getPurchaseReceipts } from "../../services/purchaseReceiptService";
import { AlertModal, useModal } from "../../components/Modal";

type PurchaseReceipt = Awaited<ReturnType<typeof getPurchaseReceipts>>[number];

type PurchaseAccountFormProps = {
  onCreated: () => void;
  onCancel: () => void;
};

function PurchaseAccountForm({
  onCreated,
  onCancel,
}: PurchaseAccountFormProps) {
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);

  const [purchaseReceiptId, setPurchaseReceiptId] = useState("");
  const [description, setDescription] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showModal, modalProps } = useModal();

  useEffect(() => {
    async function loadReceipts() {
      try {
        const result = await getPurchaseReceipts();

        setReceipts(result);
      } catch (error) {
        console.error("Erro ao carregar entradas:", error);

        showModal({
          title: "Atenção!",
          message: "Não foi possível carregar as entradas.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadReceipts();

    const today = new Date().toISOString().split("T")[0];
    setDueDate(today);
  }, []);

  const selectedReceipt = receipts.find(
    (receipt) => receipt.id === Number(purchaseReceiptId),
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!purchaseReceiptId) {
      showModal({
        title: "Atenção!",
        message: "Selecione uma entrada de mercadorias.",
      });
      return;
    }

    if (!originalAmount) {
      showModal({ title: "Atenção!", message: "Informe o valor da conta." });
      return;
    }

    const amount = Number(originalAmount.replace(",", "."));

    if (!Number.isFinite(amount) || amount <= 0) {
      showModal({
        title: "Atenção!",
        message: "O valor deve ser maior que zero.",
      });
      return;
    }

    if (!dueDate) {
      showModal({
        title: "Atenção!",
        message: "Informe a data de vencimento.",
      });
      return;
    }

    if (!selectedReceipt) {
      showModal({
        title: "Atenção!",
        message: "Entrada de mercadorias não encontrada.",
      });
      return;
    }

    try {
      setSaving(true);

      await createPurchaseAccount({
        supplierId: selectedReceipt.supplier_id,
        purchaseReceiptId: selectedReceipt.id,
        description: description.trim(),
        originalAmount: amount,
        dueDate,
        createdBy: 1,
      });

      onCreated();
    } catch (error) {
      console.error("Erro ao cadastrar conta a pagar:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a conta.";

      showModal({ title: "Erro", message: message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Carregando entradas...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nova conta a pagar</h2>
      <div>
        <label>Entrada de mercadorias</label>
        <br />

        <select
          value={purchaseReceiptId}
          onChange={(event) => setPurchaseReceiptId(event.target.value)}
        >
          <option value="">Selecione uma entrada</option>

          {receipts.map((receipt) => (
            <option key={receipt.id} value={receipt.id}>
              NF {receipt.invoice_number} — {receipt.supplier_name}
            </option>
          ))}
        </select>
      </div>
      {selectedReceipt && (
        <>
          <p>
            Fornecedor: <strong>{selectedReceipt.supplier_name}</strong>
          </p>

          <p>
            Nota: <strong>{selectedReceipt.invoice_number}</strong>
          </p>
        </>
      )}
      <br />
      <div>
        <label>Descrição</label>
        <br />

        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex.: Compra de mercadorias"
        />
      </div>
      <br />
      <div>
        <label>Valor original</label>
        <br />

        <input
          type="text"
          inputMode="decimal"
          value={originalAmount}
          onChange={(event) => setOriginalAmount(event.target.value)}
          placeholder="0,00"
        />
      </div>
      <br />
      <div>
        <label>Data de vencimento</label>
        <br />

        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>
      <br />
      <button type="button" onClick={onCancel} disabled={saving}>
        Cancelar
      </button>{" "}
      <button type="submit" disabled={saving}>
        {saving ? "Salvando..." : "Salvar conta"}
      </button>
      <AlertModal {...modalProps} />
    </form>
  );
}

export default PurchaseAccountForm;
