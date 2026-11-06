import { useEffect, useState } from "react";
import { getPurchaseAccounts } from "../../services/purchaseAccountService";
import PurchaseAccountForm from "./PurchaseAccountForm";
import PurchaseAccountDetailsPage from "./PurchaseAccountDetailsPage";
import { AlertModal, useModal } from "../../components/Modal";

type PurchaseAccount = Awaited<ReturnType<typeof getPurchaseAccounts>>[number];

function PurchaseAccountsPage() {
  const [accounts, setAccounts] = useState<PurchaseAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );

  const { showModal, modalProps } = useModal();

  async function loadAccounts() {
    try {
      setLoading(true);

      const result = await getPurchaseAccounts();

      setAccounts(result);
    } catch (error) {
      console.error("Erro ao carregar contas a pagar:", error);

      showModal({
        title: "Atenção!",
        message: "Não foi possível carregar as contas a pagar.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "OPEN":
        return "Em aberto";

      case "PARTIALLY_PAID":
        return "Parcialmente paga";

      case "PAID":
        return "Paga";

      case "CANCELLED":
        return "Cancelada";

      default:
        return status;
    }
  }

  if (loading) {
    if (selectedAccountId !== null) {
      return (
        <PurchaseAccountDetailsPage
          accountId={selectedAccountId}
          onBack={() => setSelectedAccountId(null)}
        />
      );
    }
    return <p>Carregando contas a pagar...</p>;
  }

  if (selectedAccountId !== null) {
    return (
      <PurchaseAccountDetailsPage
        accountId={selectedAccountId}
        onBack={() => setSelectedAccountId(null)}
      />
    );
  }

  return (
    <div>
      <h1>Contas a pagar</h1>

      {!showForm && (
        <button type="button" onClick={() => setShowForm(true)}>
          Nova conta a pagar
        </button>
      )}

      {showForm && (
        <PurchaseAccountForm
          onCreated={() => {
            setShowForm(false);
            loadAccounts();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <hr />

      {accounts.length === 0 ? (
        <p>Nenhuma conta a pagar cadastrada.</p>
      ) : (
        accounts.map((account) => (
          <div key={account.id}>
            <h3>{account.description || `Conta #${account.id}`}</h3>

            <p>Fornecedor: {account.supplier_name}</p>

            <p>Nota: {account.invoice_number}</p>

            <p>Valor total: {formatCurrency(account.original_amount)}</p>

            <p>Vencimento: {formatDate(account.due_date)}</p>

            <p>Status: {getStatusLabel(account.status)}</p>

            <button
              type="button"
              onClick={() => setSelectedAccountId(account.id)}
            >
              Ver detalhes
            </button>

            <hr />
          </div>
        ))
      )}
      <AlertModal {...modalProps} />
    </div>
  );
}

export default PurchaseAccountsPage;
