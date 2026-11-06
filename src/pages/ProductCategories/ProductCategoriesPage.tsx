import { useEffect, useState } from 'react';
import {
  createProductCategory,
  deactivateProductCategory,
  getProductCategories,
} from '../../services/productCategoryService';

type Category = Awaited<
  ReturnType<typeof getProductCategories>
>[number];

function ProductCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function loadCategories() {
    const result = await getProductCategories();
    setCategories(result);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    await createProductCategory({
      name: name.trim(),
      description: description.trim(),
    });

    setName('');
    setDescription('');

    await loadCategories();
  }

  async function handleDeactivate(id: number) {
    await deactivateProductCategory(id);
    await loadCategories();
  }

  return (
    <div>
      <h1>Categorias de produtos</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Descrição</label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />
        </div>

        <button type="submit">
          Cadastrar categoria
        </button>
      </form>

      <hr />

      <h2>Categorias cadastradas</h2>

      {categories.length === 0 ? (
        <p>Nenhuma categoria cadastrada.</p>
      ) : (
        categories.map((category) => (
          <div key={category.id}>
            <strong>{category.name}</strong>

            <p>
              {category.description || 'Sem descrição'}
            </p>

            <p>
              Status:{' '}
              {category.active ? 'Ativa' : 'Inativa'}
            </p>

            {category.active && (
              <button
                onClick={() =>
                  handleDeactivate(category.id)
                }
              >
                Desativar
              </button>
            )}

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default ProductCategoriesPage;