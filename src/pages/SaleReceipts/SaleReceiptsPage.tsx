import { useEffect, useState } from 'react';
import { getSaleReceipts } from '../../services/saleReceiptService';
import SaleReceiptForm from './SaleReceiptForm';

type SaleReceipt = Awaited<
  ReturnType<typeof getSaleReceipts>
>[number];

function SaleReceiptsPage() {
  const [receipts, setReceipts] = useState<SaleReceipt[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function loadReceipts() {
    try {
      const result = await getSaleReceipts();
      setReceipts(result);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
  }

  useEffect(() => {
    loadReceipts();
  }, []);

  function formatDate(date: string) {
    const [year, month, day] = date.split('-');

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  }

  return (
    <div>
      <h1>Vendas</h1>

      <button onClick={() => setShowForm(true)}>
        Nova venda
      </button>

      {showForm && (
        <SaleReceiptForm
          onCreated={() => {
            setShowForm(false);
            loadReceipts();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <hr />

      {receipts.length === 0 ? (
        <p>Nenhuma venda cadastrada.</p>
      ) : (
        receipts.map((receipt) => (
          <div key={receipt.id}>
            <strong>Venda #{receipt.id}</strong>

            <p>
              Cliente: {receipt.client_name}
            </p>

            <p>
              Data: {formatDate(receipt.sale_date)}
            </p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default SaleReceiptsPage;