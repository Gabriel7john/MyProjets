import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';

export function Navbar() {
  const { user, logout } = useUser();
  const { items } = useCart();
  const navigate = useNavigate();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-10 border-b border-cream/10 bg-char/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl tracking-wide text-ember">
          Casa do Hamburguer
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-cream/80 transition hover:text-cream">
            Cardápio
          </Link>
          {user && (
            <Link to="/pedidos" className="relative text-cream/80 transition hover:text-cream">
              Pedidos
              {itemCount > 0 && (
                <span className="absolute -right-4 -top-3 rounded-full bg-mustard px-1.5 py-0.5 font-mono text-[10px] font-bold text-char">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-cream/80 transition hover:text-cream">
              Painel Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-full border border-cream/20 px-4 py-1.5 text-cream/80 transition hover:border-ember hover:text-ember"
            >
              Sair
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-ember px-4 py-1.5 font-medium text-cream transition hover:bg-ember-dark"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
