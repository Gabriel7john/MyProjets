import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useUser } from '../contexts/UserContext';

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-char">
        <p className="font-mono text-cream/70">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
