import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const statusLabels: Record<string, string> = {
  PENDING: 'Aguardando confirmação',
  PREPARING: 'Preparando',
  READY: 'Pronto para retirada',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export function Pedidos() {
  const { items, addItem, decreaseItem, removeItem, total, clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  function loadOrders() {
    api.get('/orders/me').then((response) => setOrders(response.data.orders));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleCheckout() {
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/orders', {
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      });
      clearCart();
      setMessage('Pedido enviado com sucesso!');
      loadOrders();
    } catch {
      setMessage('Não foi possível enviar o pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl tracking-wide text-cream">Seu carrinho</h1>

      {items.length === 0 ? (
        <p className="mt-4 text-cream/60">Seu carrinho está vazio. Volte ao cardápio para adicionar itens.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between rounded-xl border border-cream/10 bg-char-light px-4 py-3"
            >
              <div>
                <p className="font-medium text-cream">{item.product.name}</p>
                <p className="menu-price text-sm text-mustard">
                  R$ {item.product.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => decreaseItem(item.product.id)}
                  className="h-7 w-7 rounded-full border border-cream/20 text-cream/80 hover:border-ember hover:text-ember"
                >
                  −
                </button>
                <span className="w-5 text-center font-mono">{item.quantity}</span>
                <button
                  onClick={() => addItem(item.product)}
                  className="h-7 w-7 rounded-full border border-cream/20 text-cream/80 hover:border-ember hover:text-ember"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="ml-2 text-xs text-cream/40 hover:text-ember"
                >
                  remover
                </button>
              </div>
            </div>
          ))}

          <div className="ticket-divider my-2" />

          <div className="flex items-center justify-between px-1">
            <span className="text-cream/70">Total</span>
            <span className="menu-price text-lg text-mustard">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {message && <p className="text-sm text-mustard">{message}</p>}

          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="mt-2 rounded-full bg-ember py-3 font-medium text-cream transition hover:bg-ember-dark disabled:opacity-60"
          >
            {submitting ? 'Enviando pedido...' : 'Confirmar pedido'}
          </button>
        </div>
      )}

      <h2 className="mt-14 font-display text-2xl tracking-wide text-cream">Histórico de pedidos</h2>

      {orders.length === 0 ? (
        <p className="mt-4 text-cream/60">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-cream/10 bg-char-light p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wide text-mustard">
                  {statusLabels[order.status] || order.status}
                </span>
                <span className="menu-price text-cream">
                  R$ {order.total.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <ul className="mt-2 text-sm text-cream/60">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.product.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
