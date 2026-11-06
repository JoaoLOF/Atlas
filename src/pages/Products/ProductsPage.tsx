import { useEffect, useState } from 'react';
import { getProducts } from '../../services/productService';
import ProductForm from './ProductForm';

type Product = Awaited<ReturnType<typeof getProducts>>[number];

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function loadProducts() {
    const result = await getProducts();
    setProducts(result);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div>
      <h1>Produtos</h1>

      <button onClick={() => setShowForm(true)}>
        Novo produto
      </button>

      {showForm && (
        <ProductForm
          onCreated={() => {
            setShowForm(false);
            loadProducts();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <hr />

      {products.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        products.map((product) => (
          <div key={product.id}>
            <strong>{product.name}</strong>

            <p>
              Código: {product.internal_code}
            </p>

            <p>
              Estoque: {product.current_stock}
            </p>

            <p>
              Preço: R$ {product.sale_price.toFixed(2)}
            </p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default ProductsPage;