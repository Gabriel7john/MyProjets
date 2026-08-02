import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-20">
      <h1 className="font-display text-3xl font-semibold text-bone-100">Entrar</h1>
      <p className="mt-1 font-body text-sm text-bone-200/60">
        Acesse sua conta para gerenciar seus horários.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-bone-200/50">
            E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-sm border border-charcoal-700 bg-charcoal-900 px-3 py-2.5 text-bone-100 outline-none focus:border-brass-400"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-bone-200/50">
            Senha
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm border border-charcoal-700 bg-charcoal-900 px-3 py-2.5 text-bone-100 outline-none focus:border-brass-400"
          />
        </div>

        {error && <p className="font-mono text-sm text-barber-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-sm bg-brass-500 py-3 font-medium text-charcoal-950 transition hover:bg-brass-400 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 font-body text-sm text-bone-200/60">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="text-brass-400 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
