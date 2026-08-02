import { useEffect, useState } from 'react';
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
  user: { name: string; email: string };
  items: OrderItem[];
}

const statusFlow = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] as const;

const statusLabels: Record<string, string> = {
  PENDING: 'Aguardando confirmação',
  PREPARING: 'Preparando',
  READY: 'Pronto para retirada',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

const statusColors: Record<string, string> = {
  PENDING: 'text-mustard',
  PREPARING: 'text-ember',
  READY: 'text-basil',
  DELIVERED: 'text-cream/50',
  CANCELLED: 'text-cream/30',
};

export function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('TODOS');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function loadOrders() {
    setLoading(true);
    api
      .get('/orders')
      .then((response) => setOrders(response.data.orders))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = filter === 'TODOS' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide text-cream">Painel de pedidos</h1>
        <button
          onClick={loadOrders}
          className="rounded-full border border-cream/20 px-4 py-1.5 text-sm text-cream/70 transition hover:border-ember hover:text-ember"
        >
          Atualizar
        </button>
      </div>

      {/* Filtro por status */}
      <div className="mt-6 flex flex-wrap gap-2">
        {['TODOS', ...statusFlow].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filter === status
                ? 'border-ember bg-ember text-cream'
                : 'border-cream/15 text-cream/70 hover:border-cream/40'
            }`}
          >
            {status === 'TODOS' ? 'Todos' : statusLabels[status]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 font-mono text-cream/60">Carregando pedidos...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="mt-8 text-cream/60">Nenhum pedido por aqui ainda.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-cream/10 bg-char-light p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-cream">{order.user.name}</p>
                  <p className="text-xs text-cream/50">{order.user.email}</p>
                </div>
                <span className={`font-mono text-xs uppercase tracking-wide ${statusColors[order.status]}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              <ul className="mt-3 text-sm text-cream/70">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.product.name}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="menu-price text-mustard">
                  R$ {order.total.toFixed(2).replace('.', ',')}
                </span>

                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="rounded-lg border border-cream/15 bg-char px-3 py-1.5 text-sm text-cream outline-none focus:border-ember disabled:opacity-50"
                >
                  {statusFlow.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>

              <p className="mt-2 text-xs text-cream/30">
                {new Date(order.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
