import { useState, useEffect } from "react";
import "./Configuracion.css";

const formVacio = { nombre: "", email: "", password: "", rol: "cajero" };

export default function Configuracion({ usuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalPassword, setModalPassword] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {
    fetch("http://localhost:3001/api/usuarios", { headers })
      .then((r) => r.json())
      .then((data) => {
        setUsuarios(data);
        setCargando(false);
      });
  };

  const guardarUsuario = () => {
    setError("");
    if (!form.nombre || !form.email || !form.password) {
      setError("Todos los campos son requeridos");
      return;
    }
    fetch("http://localhost:3001/api/usuarios", {
      method: "POST",
      headers,
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return setError(data.error);
        setModalNuevo(false);
        setForm(formVacio);
        setMensaje("Usuario creado correctamente");
        cargarUsuarios();
        setTimeout(() => setMensaje(""), 3000);
      });
  };

  const toggleEstado = (u) => {
    fetch(`http://localhost:3001/api/usuarios/${u.id}/estado`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ activo: !u.activo }),
    }).then(() => cargarUsuarios());
  };

  const cambiarPassword = () => {
    if (!nuevaPassword) return;
    fetch(`http://localhost:3001/api/usuarios/${modalPassword.id}/password`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ password: nuevaPassword }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return setError(data.error);
        setModalPassword(null);
        setNuevaPassword("");
        setMensaje("Contraseña actualizada correctamente");
        setTimeout(() => setMensaje(""), 3000);
      });
  };

  if (cargando) return <p style={{ padding: "24px" }}>Cargando configuración...</p>;

  return (
    <div className="configuracion">

      {/* Header */}
      <div className="configuracion__header">
        <div>
          <h1 className="configuracion__titulo">Configuración</h1>
          <p className="configuracion__sub">Gestión de usuarios del sistema</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(formVacio); setError(""); setModalNuevo(true); }}>
          + Nuevo usuario
        </button>
      </div>

      {/* Mensaje éxito */}
      {mensaje && (
        <div className="config__mensaje">✅ {mensaje}</div>
      )}

      {/* Cards resumen */}
      <div className="config__cards">
        <div className="config-card config-card--blue">
          <p className="config-card__label">Total usuarios</p>
          <p className="config-card__value">{usuarios.length}</p>
        </div>
        <div className="config-card config-card--green">
          <p className="config-card__label">Activos</p>
          <p className="config-card__value">{usuarios.filter((u) => u.activo).length}</p>
        </div>
        <div className="config-card config-card--amber">
          <p className="config-card__label">Cajeros</p>
          <p className="config-card__value">{usuarios.filter((u) => u.rol === "cajero").length}</p>
        </div>
        <div className="config-card config-card--purple">
          <p className="config-card__label">Administradores</p>
          <p className="config-card__value">{usuarios.filter((u) => u.rol === "admin").length}</p>
        </div>
      </div>

      {/* Tabla usuarios */}
      <div className="card">
        <h2 className="card__title">Usuarios registrados</h2>
        <table className="table">
          <thead>
            <tr>
              {["Nombre", "Email", "Rol", "Estado", "Fecha registro", "Acciones"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="text-bold">{u.nombre}</td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <span className={`badge ${u.rol === "admin" ? "badge--purple" : "badge--blue"}`}>
                    {u.rol}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.activo ? "badge--green" : "badge--red"}`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="text-muted">
                  {new Date(u.created_at).toLocaleDateString("es-MX")}
                </td>
                <td>
                  <div className="acciones">
                    {u.id !== usuario?.id && (
                      <button
                        className={u.activo ? "btn-eliminar" : "btn-editar"}
                        onClick={() => toggleEstado(u)}
                      >
                        {u.activo ? "🔒 Desactivar" : "🔓 Activar"}
                      </button>
                    )}
                    <button className="btn-editar" onClick={() => { setModalPassword(u); setNuevaPassword(""); }}>
                      🔑 Contraseña
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo usuario */}
      {modalNuevo && (
        <div className="modal-overlay" onClick={() => setModalNuevo(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__titulo">Nuevo usuario</h2>
            <div className="modal__form">
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="juan@tienda.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <option value="cajero">Cajero</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {error && <p className="config__error">{error}</p>}
            </div>
            <div className="modal__acciones">
              <button className="btn-cancelar" onClick={() => setModalNuevo(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarUsuario}>Crear usuario</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cambiar contraseña */}
      {modalPassword && (
        <div className="modal-overlay" onClick={() => setModalPassword(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__titulo">Cambiar contraseña</h2>
            <p className="modal__desc">Usuario: <strong>{modalPassword.nombre}</strong></p>
            <div className="modal__form">
              <div className="form-group">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="modal__acciones">
              <button className="btn-cancelar" onClick={() => setModalPassword(null)}>Cancelar</button>
              <button className="btn-primary" onClick={cambiarPassword}>Guardar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}