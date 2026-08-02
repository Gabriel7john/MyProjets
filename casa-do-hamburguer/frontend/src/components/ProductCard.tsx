import { Product, useCart } from '../contexts/CartContext';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-cream/10 bg-char-light transition hover:border-ember/50">
      <div className="aspect-[4/3] w-full overflow-hidden bg-char">
        <img
          src={`/images/menu/${product.image}`}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg tracking-wide text-cream">{product.name}</h3>
        <p className="flex-1 text-sm text-cream/60">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="menu-price rounded bg-char px-2 py-1 text-mustard">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={() => addItem(product)}
            className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-cream transition hover:bg-ember-dark"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
