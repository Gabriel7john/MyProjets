import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="border-b border-charcoal-700">
      <div className="stripe-rule" />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-bone-100">
            Barbearia
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass-400">
            Nº 01
          </span>
        </Link>

        <nav className="flex items-center gap-6 font-body text-sm">
          {user && (
            <Link to="/meus-agendamentos" className="text-bone-200/80 transition hover:text-brass-400">
              Meus horários
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-sm border border-charcoal-700 px-4 py-1.5 text-bone-200/80 transition hover:border-brass-400 hover:text-brass-400"
            >
              Sair
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/entrar" className="text-bone-200/80 transition hover:text-brass-400">
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="rounded-sm bg-brass-500 px-4 py-1.5 font-medium text-charcoal-950 transition hover:bg-brass-400"
              >
                Criar conta
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
