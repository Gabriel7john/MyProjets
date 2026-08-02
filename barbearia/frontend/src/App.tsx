import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminSettings } from "./pages/AdminSettings";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { MyAppointments } from "./pages/MyAppointments";
import { Register } from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-charcoal-950">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route
              path="/meus-agendamentos"
              element={
                <ProtectedRoute>
                  <MyAppointments />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/configuracoes" element={<AdminSettings />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
