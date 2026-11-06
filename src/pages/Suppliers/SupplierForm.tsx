import { useState } from "react";
import { createSupplier } from "../../services/supplierService";
import { AlertModal, useModal } from "../../components/Modal";

type SupplierFormProps = {
  onCreated: () => void;
  onCancel: () => void;
};

function SupplierForm({ onCreated, onCancel }: SupplierFormProps) {
  const [tradeName, setTradeName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [saving, setSaving] = useState(false);

  const { showModal, modalProps } = useModal();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tradeName.trim()) {
      showModal({
        title: "Atenção!",
        message: "Informe o nome do fornecedor.",
      });
      return;
    }

    if (!taxId.trim()) {
      showModal({
        title: "Atenção!",
        message: "Informe o CPF/CNPJ do fornecedor.",
      });
      return;
    }

    try {
      setSaving(true);

      await createSupplier({
        tradeName: tradeName.trim(),
        taxId: taxId.trim(),
      });

      onCreated();
    } catch (error) {
      console.error("Erro ao cadastrar fornecedor:", error);
      showModal({
        title: "Atenção!",
        message: "Não foi possível cadastrar o fornecedor.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Novo fornecedor</h2>

      <div>
        <label>Nome / Razão social</label>

        <input
          value={tradeName}
          onChange={(event) => setTradeName(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label>CPF / CNPJ</label>

        <input
          value={taxId}
          onChange={(event) => setTaxId(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>

        <button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Cadastrar"}
        </button>
      </div>
      <AlertModal {...modalProps} />
    </form>
  );
}

export default SupplierForm;
