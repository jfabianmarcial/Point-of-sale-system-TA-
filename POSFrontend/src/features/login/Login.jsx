import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Completa todos los campos");

    setCargando(true);
    fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else onLogin(data);
      })
      .catch(() => setError("Error de conexión con el servidor"))
      .finally(() => setCargando(false));
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "360px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🛒</div>
          <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 600, color: "#0f172a" }}>POS Abarrotes</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tienda.com"
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "9px 12px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "9px 12px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: "13px", color: "#ef4444", background: "#fee2e2", padding: "8px 12px", borderRadius: "8px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{ background: cargando ? "#94a3b8" : "#0f172a", color: "white", border: "none", borderRadius: "8px", padding: "10px", fontSize: "15px", fontWeight: 500, cursor: cargando ? "not-allowed" : "pointer", marginTop: "4px" }}
          >
            {cargando ? "Verificando..." : "Entrar"}
          </button>
        </form>

      </div>
    </div>
  );
}