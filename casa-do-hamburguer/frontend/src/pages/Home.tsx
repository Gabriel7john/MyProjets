import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/ProductCard';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [loading, setLoading] = useState(true);
  const { items, total } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/products')
      .then((response) => setProducts(response.data.products))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts =
    activeCategory === 'Todos' ? products : products.filter((p) => p.category === activeCategory);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-14 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mustard/80">
          Feito na brasa, pedido em segundos
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none tracking-wide text-cream sm:text-6xl">
          Casa do <span className="text-ember">Hamburguer</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-cream/60">
          Blends artesanais, pães fresquinhos e molhos da casa. Monte seu pedido abaixo.
        </p>
      </section>

      <div className="ticket-divider mx-auto max-w-6xl" />

      {/* Categorias */}
      <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 py-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              activeCategory === category
                ? 'border-ember bg-ember text-cream'
                : 'border-cream/15 text-cream/70 hover:border-cream/40'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grade de produtos */}
      <section className="mx-auto max-w-6xl px-6">
        {loading ? (
          <p className="font-mono text-cream/60">Carregando cardápio...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-cream/60">
            Nenhum item por aqui ainda. Assim que o cardápio for cadastrado, ele aparece nesta
            página.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Barra flutuante do carrinho */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 w-[min(92%,28rem)] -translate-x-1/2">
          <button
            onClick={() => navigate('/pedidos')}
            className="flex w-full items-center justify-between rounded-full bg-ember px-6 py-3.5 font-medium text-cream shadow-lg shadow-black/40 transition hover:bg-ember-dark"
          >
            <span>
              {itemCount} {itemCount === 1 ? 'item' : 'itens'} no carrinho
            </span>
            <span className="menu-price">R$ {total.toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
