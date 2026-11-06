import { useEffect, useState } from "react";
import { createProduct } from "../../services/productService";
import { getProductCategories } from "../../services/productCategoryService";
import { getUnits } from "../../services/unitService";
import { AlertModal, useModal } from "../../components/Modal";

type ProductCategory = Awaited<ReturnType<typeof getProductCategories>>[number];

type Unit = Awaited<ReturnType<typeof getUnits>>[number];

type ProductFormProps = {
  onCreated: () => void;
  onCancel: () => void;
};

function ProductForm({ onCreated, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [internalCode, setInternalCode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [barcode, setBarcode] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [minimumStock, setMinimumStock] = useState("");

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showModal, modalProps } = useModal();

  useEffect(() => {
    async function loadOptions() {
      try {
        const [categoriesResult, unitsResult] = await Promise.all([
          getProductCategories(),
          getUnits(),
        ]);

        setCategories(categoriesResult.filter((category) => category.active));

        setUnits(unitsResult.filter((unit) => unit.active));
      } catch (error) {
        console.error("Erro ao carregar categorias e unidades:", error);
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!internalCode.trim()) {
      showModal({ title: "Atenção!", message: "Informe o código interno." });
      return;
    }

    if (!name.trim()) {
      showModal({ title: "Atenção!", message: "Informe o nome do produto." });
      return;
    }

    if (!categoryId) {
      showModal({ title: "Atenção!", message: "Selecione uma categoria." });
      return;
    }

    if (!unitId) {
      showModal({ title: "Atenção!", message: "Selecione uma unidade." });
      return;
    }

    if (!salePrice) {
      showModal({ title: "Atenção!", message: "Informe o preço de venda." });
      return;
    }

    if (!minimumStock) {
      showModal({ title: "Atenção!", message: "Informe o estoque mínimo." });
      return;
    }

    try {
      setSaving(true);

      await createProduct({
        internalCode: internalCode.trim(),
        categoryId: Number(categoryId),
        unitId: Number(unitId),
        name: name.trim(),
        description: description.trim(),
        barcode: barcode.trim() || null,
        salePrice: Number(salePrice),
        minimumStock: Number(minimumStock),
      });

      onCreated();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      showModal({
        title: "Atenção!",
        message: "Não foi possível cadastrar o produto.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Novo produto</h2>

      <div>
        <label>Código interno</label>
        <input
          value={internalCode}
          onChange={(event) => setInternalCode(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label>Nome</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label>Categoria</label>

        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          disabled={loadingOptions || saving}
        >
          <option value="">
            {loadingOptions ? "Carregando..." : "Selecione uma categoria"}
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Unidade</label>

        <select
          value={unitId}
          onChange={(event) => setUnitId(event.target.value)}
          disabled={loadingOptions || saving}
        >
          <option value="">
            {loadingOptions ? "Carregando..." : "Selecione uma unidade"}
          </option>

          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name} ({unit.abbreviation})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Descrição</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label>Código de barras</label>
        <input
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label>Preço de venda</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={salePrice}
          onChange={(event) => setSalePrice(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label>Estoque mínimo</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={minimumStock}
          onChange={(event) => setMinimumStock(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>

        <button type="submit" disabled={loadingOptions || saving}>
          {saving ? "Salvando..." : "Cadastrar"}
        </button>
      </div>
      <AlertModal {...modalProps} />
    </form>
  );
}

export default ProductForm;
