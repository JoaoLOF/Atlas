import { useEffect, useState } from "react";
import {
  deactivateSupplier,
  getSuppliers,
} from "../../services/supplierService";
import SupplierForm from "./SupplierForm";
import { AlertModal, useModal } from "../../components/Modal";

type Supplier = Awaited<ReturnType<typeof getSuppliers>>[number];

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);

  const { showModal, modalProps } = useModal();

  async function loadSuppliers() {
    try {
      const result = await getSuppliers();
      setSuppliers(result);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function handleDeactivate(id: number) {
    const confirmed = window.confirm(
      "Deseja realmente desativar este fornecedor?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deactivateSupplier(id);
      await loadSuppliers();
    } catch (error) {
      console.error("Erro ao desativar fornecedor:", error);

      showModal({
        title: "Atenção!",
        message: "Não foi possível desativar o fornecedor.",
      });
    }
  }

  return (
    <div>
      <h1>Fornecedores</h1>

      <button onClick={() => setShowForm(true)}>Novo fornecedor</button>

      {showForm && (
        <SupplierForm
          onCreated={() => {
            setShowForm(false);
            loadSuppliers();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <hr />

      {suppliers.length === 0 ? (
        <p>Nenhum fornecedor cadastrado.</p>
      ) : (
        suppliers.map((supplier) => (
          <div key={supplier.id}>
            <strong>{supplier.trade_name}</strong>

            <p>CPF/CNPJ: {supplier.tax_id}</p>

            <p>Status: {supplier.active ? "Ativo" : "Inativo"}</p>

            {supplier.active && (
              <button onClick={() => handleDeactivate(supplier.id)}>
                Desativar
              </button>
            )}

            <hr />
          </div>
        ))
      )}
      <AlertModal {...modalProps} />
    </div>
  );
}

export default SuppliersPage;
