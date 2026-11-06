import { useState } from "react";
import { createFinancialPayment } from "../../services/financialPaymentService";
import { AlertModal, useModal } from "../../components/Modal";

type FinancialPaymentFormProps = {
  purchaseAccountId: number;
  onSuccess: () => Promise<void>;
  onCancel: () => void;
};

function FinancialPaymentForm({
  purchaseAccountId,
  onSuccess,
  onCancel,
}: FinancialPaymentFormProps) {
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [paidAmount, setPaidAmount] = useState("");
  const [interestAmount, setInterestAmount] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  const { showModal, modalProps } = useModal();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const paid = Number(paidAmount.replace(",", "."));
    const interest = Number(interestAmount.replace(",", "."));
    const discount = Number(discountAmount.replace(",", "."));

    if (!paymentDate) {
      showModal({ title: "Atenção!", message: "Informe a data do pagamento." });
      return;
    }

    if (!Number.isFinite(paid) || paid <= 0) {
      showModal({
        title: "Atenção!",
        message: "Informe um valor pago válido.",
      });
      return;
    }

    if (!Number.isFinite(interest) || interest < 0) {
      showModal({
        title: "Atenção!",
        message: "Informe um valor de juros válido.",
      });
      return;
    }

    if (!Number.isFinite(discount) || discount < 0) {
      showModal({
        title: "Atenção!",
        message: "Informe um valor de desconto válido.",
      });
      return;
    }

    if (!paymentMethod.trim()) {
      showModal({
        title: "Atenção!",
        message: "Informe a forma de pagamento.",
      });
      return;
    }

    try {
      setSaving(true);

      await createFinancialPayment({
        purchaseAccountId,
        paymentDate,
        paidAmount: paid,
        interestAmount: interest,
        discountAmount: discount,
        paymentMethod,
        notes,
        createdBy: 1,
      });

      showModal({
        title: "Pagamento cadastrado",
        message: "Pagamento cadastrado com sucesso.",
        onConfirm: async () => {
          await onSuccess();
        },
      });

      setPaidAmount("");
      setInterestAmount("0");
      setDiscountAmount("0");
      setPaymentMethod("");
      setNotes("");
    } catch (error) {
      console.error("Erro ao cadastrar pagamento:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o pagamento.";

      showModal({ title: "Erro", message: message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2>Novo pagamento</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Data do pagamento</label>

          <input
            type="date"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
          />
        </div>

        <div>
          <label>Valor pago</label>

          <input
            type="text"
            value={paidAmount}
            onChange={(event) => {
              setPaidAmount(event.target.value);
            }}
            placeholder="0,00"
          />
          <p>Valor atual: {paidAmount}</p>
        </div>

        <div>
          <label>Juros</label>

          <input
            type="text"
            inputMode="decimal"
            value={interestAmount}
            onChange={(event) => setInterestAmount(event.target.value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <label>Desconto</label>

          <input
            type="text"
            inputMode="decimal"
            value={discountAmount}
            onChange={(event) => setDiscountAmount(event.target.value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <label>Forma de pagamento</label>

          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
          >
            <option value="">Selecione</option>

            <option value="DINHEIRO">Dinheiro</option>

            <option value="PIX">PIX</option>

            <option value="DEBITO">Cartão de débito</option>

            <option value="CREDITO">Cartão de crédito</option>

            <option value="TRANSFERENCIA">Transferência</option>

            <option value="BOLETO">Boleto</option>
          </select>
        </div>

        <div>
          <label>Observações</label>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div>
          <button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Cadastrar pagamento"}
          </button>

          <button type="button" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
        </div>
      </form>

      <AlertModal {...modalProps} />
    </div>
  );
}

export default FinancialPaymentForm;
