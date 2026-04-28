import { useState, useEffect } from "react";
import Dashboard from "./features/dashboard/Dashboard";
import Login from "./features/login/Login";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setVerificando(false);

    fetch("http://localhost:3001/api/auth/verificar", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valido) setUsuario(data.usuario);
        else localStorage.removeItem("token");
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setVerificando(false));
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);
    setUsuario(data.usuario);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };

  if (verificando) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI" }}>
      <p style={{ color: "#94a3b8" }}>Cargando...</p>
    </div>
  );

  return usuario
    ? <Dashboard usuario={usuario} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}