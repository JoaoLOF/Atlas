import { useEffect, useState } from "react";
import { getPurchaseReceipts } from "../../services/purchaseReceiptService";
import PurchaseReceiptForm from "./PurchaseReceiptForm";
import PurchaseReceiptDetailsPage from "./PurchaseReceiptDetailsPage";

type PurchaseReceipt = Awaited<ReturnType<typeof getPurchaseReceipts>>[number];

function PurchaseReceiptsPage() {
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(
    null,
  );

  async function loadReceipts() {
    try {
      const result = await getPurchaseReceipts();
      setReceipts(result);
    } catch (error) {
      console.error("Erro ao carregar entradas:", error);
    }
  }

  useEffect(() => {
    loadReceipts();
  }, []);

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  }

  if (selectedReceiptId !== null) {
    return (
      <PurchaseReceiptDetailsPage
        receiptId={selectedReceiptId}
        onBack={() => setSelectedReceiptId(null)}
      />
    );
  }

  return (
    <div>
      <h1>Entrada de mercadorias</h1>

      <button onClick={() => setShowForm(true)}>Nova entrada</button>

      {showForm && (
        <PurchaseReceiptForm
          onCreated={() => {
            setShowForm(false);
            loadReceipts();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <hr />

      {receipts.length === 0 ? (
        <p>Nenhuma entrada cadastrada.</p>
      ) : (
        receipts.map((receipt) => (
          <div key={receipt.id}>
            <strong>Nota: {receipt.invoice_number}</strong>

            <p>Fornecedor: {receipt.supplier_name}</p>

            <p>Data: {formatDate(receipt.receipt_date)}</p>

            {receipt.notes && <p>Observações: {receipt.notes}</p>}

            <button onClick={() => setSelectedReceiptId(receipt.id)}>
              Ver detalhes
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default PurchaseReceiptsPage;
