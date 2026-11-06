import { useEffect, useState } from "react";
import { getPurchaseAccountById } from "../../services/purchaseAccountService";
import { deleteFinancialPayment } from "../../services/financialPaymentService";
import FinancialPaymentForm from "./FinancialPaymentForm";
import { AlertModal, useModal } from "../../components/Modal";

type PurchaseAccountDetailsPageProps = {
  accountId: number;
  onBack: () => void;
};

type Payment = {
  id: number;
  payment_date: string;
  paid_amount: number;
  interest_amount: number;
  discount_amount: number;
  payment_method: string;
  notes: string | null;
  created_by: number;
  created_at: string;
};

type Account = {
  id: number;
  supplier_name: string;
  invoice_number: string;
  description: string;
  original_amount: number;
  due_date: string;
  status: string;
  payments: Payment[];
};

function PurchaseAccountDetailsPage({
  accountId,
  onBack,
}: PurchaseAccountDetailsPageProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const { showModal, modalProps } = useModal();
  
  function handleDeletePayment(paymentId: number) {
    showModal({
      title: "Excluir pagamento",
      message: "Deseja realmente excluir este pagamento?",
      showCancel: true,
      onConfirm: async () => {
        try {
          await deleteFinancialPayment(paymentId);

          const result = await getPurchaseAccountById(accountId);

          setAccount(result);

          showModal({
            title: "Pagamento excluído",
            message: "O pagamento foi excluído com sucesso.",
          });
        } catch (error) {
          console.error("Erro ao excluir pagamento:", error);

          const message =
            error instanceof Error
              ? error.message
              : "Não foi possível excluir o pagamento.";

          showModal({ title: "Erro", message: message });
        }
      },
    });
  }

  useEffect(() => {
    async function loadAccount() {
      try {
        const result = await getPurchaseAccountById(accountId);

        setAccount(result);
      } catch (error) {
        console.error("Erro ao carregar conta a pagar:", error);

        showModal({
          title: "Atenção!",
          message: "Não foi possível carregar a conta a pagar.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [accountId]);

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
    return <p>Carregando conta...</p>;
  }

  if (!account) {
    return (
      <div>
        <p>Conta a pagar não encontrada.</p>

        <button type="button" onClick={onBack}>
          Voltar
        </button>
      </div>
    );
  }

  const totalPaid = account.payments.reduce(
    (total, payment) =>
      total +
      payment.paid_amount -
      payment.discount_amount +
      payment.interest_amount,
    0,
  );

  const balance = account.original_amount - totalPaid;

  return (
    <div>
      <button type="button" onClick={onBack}>
        Voltar
      </button>

      <h1>Detalhes da conta a pagar</h1>

      <hr />

      <h2>{account.description || `Conta #${account.id}`}</h2>

      <p>
        <strong>Fornecedor:</strong> {account.supplier_name}
      </p>

      <p>
        <strong>Nota:</strong> {account.invoice_number}
      </p>

      <p>
        <strong>Valor original:</strong>{" "}
        {formatCurrency(account.original_amount)}
      </p>

      <p>
        <strong>Vencimento:</strong> {formatDate(account.due_date)}
      </p>

      <p>
        <strong>Status:</strong> {getStatusLabel(account.status)}
      </p>

      <hr />

      <h2>Resumo financeiro</h2>

      <p>Valor original: {formatCurrency(account.original_amount)}</p>

      <p>Total pago: {formatCurrency(totalPaid)}</p>

      <p>
        <strong>Saldo restante:</strong> {formatCurrency(balance)}
      </p>

      <hr />

      <hr />

      <div>
        <h2>Registrar pagamento</h2>

        {!showPaymentForm ? (
          <button
            type="button"
            onClick={() => {
              setShowPaymentForm(true);

              setTimeout(() => {
                const input = document.querySelector(
                  'input[name="paidAmount"]',
                ) as HTMLInputElement | null;

                input?.focus();
              }, 100);
            }}
          >
            Novo pagamento
          </button>
        ) : (
          <FinancialPaymentForm
            key={account.payments.length}
            purchaseAccountId={account.id}
            onSuccess={async () => {
              const result = await getPurchaseAccountById(account.id);

              setAccount(result);
            }}
            onCancel={() => setShowPaymentForm(false)}
          />
        )}
      </div>

      <h2>Pagamentos</h2>

      {account.payments.length === 0 ? (
        <p>Nenhum pagamento realizado.</p>
      ) : (
        account.payments.map((payment) => (
          <div key={payment.id}>
            <p>
              <strong>Data:</strong> {formatDate(payment.payment_date)}
            </p>

            <p>
              <strong>Valor pago:</strong> {formatCurrency(payment.paid_amount)}
            </p>

            <p>
              <strong>Juros:</strong> {formatCurrency(payment.interest_amount)}
            </p>

            <p>
              <strong>Desconto:</strong>{" "}
              {formatCurrency(payment.discount_amount)}
            </p>

            <p>
              <strong>Forma de pagamento:</strong> {payment.payment_method}
            </p>

            {payment.notes && (
              <p>
                <strong>Observações:</strong> {payment.notes}
              </p>
            )}

            <button
              type="button"
              onClick={() => handleDeletePayment(payment.id)}
            >
              Excluir pagamento
            </button>

            <hr />
          </div>
        ))
      )}
      <AlertModal {...modalProps} />
    </div>
  );
}

export default PurchaseAccountDetailsPage;
