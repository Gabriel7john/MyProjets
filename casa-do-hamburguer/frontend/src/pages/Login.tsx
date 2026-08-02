import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-center text-3xl tracking-wide text-ember">
          Casa do Hamburguer
        </h1>
        <p className="mt-2 text-center text-sm text-cream/60">Entre para fazer seu pedido</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-cream/70">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-cream/15 bg-char-light px-4 py-2.5 text-cream outline-none focus:border-ember"
              placeholder="voce@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-cream/70">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-cream/15 bg-char-light px-4 py-2.5 text-cream outline-none focus:border-ember"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-ember">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-ember py-2.5 font-medium text-cream transition hover:bg-ember-dark disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-cream/60">
          Não tem conta?{' '}
          <Link to="/register" className="text-mustard hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
