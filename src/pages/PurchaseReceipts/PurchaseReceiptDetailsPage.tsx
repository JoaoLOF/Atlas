import { useEffect, useState } from 'react';
import { getPurchaseReceiptById } from '../../services/purchaseReceiptService';

type PurchaseReceiptDetails = Awaited<
  ReturnType<typeof getPurchaseReceiptById>
>;

type PurchaseReceiptDetailsPageProps = {
  receiptId: number;
  onBack: () => void;
};

function PurchaseReceiptDetailsPage({
  receiptId,
  onBack,
}: PurchaseReceiptDetailsPageProps) {
  const [receipt, setReceipt] =
    useState<PurchaseReceiptDetails>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReceipt() {
      try {
        const result = await getPurchaseReceiptById(receiptId);

        setReceipt(result);
      } catch (error) {
        console.error('Erro ao carregar entrada:', error);
      } finally {
        setLoading(false);
      }
    }

    loadReceipt();
  }, [receiptId]);

  if (loading) {
    return <p>Carregando entrada...</p>;
  }

  if (!receipt) {
    return (
      <div>
        <p>Entrada não encontrada.</p>

        <button onClick={onBack}>
          Voltar
        </button>
      </div>
    );
  }

  const total = receipt.items.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  return (
    <div>
      <button onClick={onBack}>
        Voltar
      </button>

      <h1>Entrada #{receipt.id}</h1>

      <p>
        <strong>Fornecedor:</strong>{' '}
        {receipt.supplier_name}
      </p>

      <p>
        <strong>Nota:</strong>{' '}
        {receipt.invoice_number}
      </p>

      <p>
        <strong>Data:</strong>{' '}
        {receipt.receipt_date}
      </p>

      {receipt.notes && (
        <p>
          <strong>Observações:</strong>{' '}
          {receipt.notes}
        </p>
      )}

      <hr />

      <h2>Itens</h2>

      {receipt.items.length === 0 ? (
        <p>Nenhum item encontrado.</p>
      ) : (
        receipt.items.map((item) => (
          <div key={item.id}>
            <strong>{item.product_name}</strong>

            <p>
              Quantidade: {item.quantity}
            </p>

            <p>
              Custo unitário: R${' '}
              {item.unit_cost.toFixed(2)}
            </p>

            <p>
              Total: R$ {item.total.toFixed(2)}
            </p>

            <hr />
          </div>
        ))
      )}

      <h2>
        Total da entrada: R$ {total.toFixed(2)}
      </h2>
    </div>
  );
}

export default PurchaseReceiptDetailsPage;