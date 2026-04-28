import { useState, useEffect } from "react";
import "./Inventario.css";
import { apiFetch } from "../../services/api";

const tipoLabels = {
  entrada: { label: "Entrada", color: "badge--green" },
  salida: { label: "Salida", color: "badge--red" },
  ajuste: { label: "Ajuste", color: "badge--amber" },
};

const formVacio = {
  producto_id: "",
  tipo: "entrada",
  cantidad: "",
  costo_unitario: "",
  proveedor_id: "",
  nota: "",
};

export default function Inventario() {
  const [movimientos, setMovimientos] = useState([]);
  const [alertas, setAlertas] = useState(null);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
  Promise.all([
    apiFetch("/inventario/movimientos"),
    apiFetch("/inventario/alertas"),
    apiFetch("/productos"),
    apiFetch("/inventario/proveedores"),
  ]).then(([movs, alts, prods, provs]) => {
    setMovimientos(movs);
    setAlertas(alts);
    setProductos(prods);
    setProveedores(provs);
    setCargando(false);
  });
};

  const movimientosFiltrados = movimientos.filter((m) =>
    filtroTipo === "todos" ? true : m.tipo === filtroTipo
  );

 const guardar = () => {
  if (!form.producto_id || !form.cantidad) return;
  apiFetch("/inventario/movimientos", {
    method: "POST",
    body: JSON.stringify(form),
  }).then((data) => {
    if (data.error) return alert("Error: " + data.error);
    setModalAbierto(false);
    setForm(formVacio);
    cargarDatos();
  });
};

  if (cargando) return <p style={{ padding: "24px" }}>Cargando inventario...</p>;

  return (
    <div className="inventario">

      {/* Header */}
      <div className="inventario__header">
        <div>
          <h1 className="inventario__titulo">Inventario</h1>
          <p className="inventario__sub">Control de entradas, salidas y ajustes</p>
        </div>
        <button className="btn-primary" onClick={() => setModalAbierto(true)}>
          + Registrar movimiento
        </button>
      </div>

      {/* Cards alertas */}
      {alertas && (
        <div className="alertas-grid">
          <div className="alerta-card alerta-card--red">
            <p className="alerta-card__label">Productos por agotarse</p>
            <p className="alerta-card__value">{alertas.productos_por_agotarse}</p>
            <p className="alerta-card__sub">con 5 o menos unidades</p>
          </div>
          <div className="alerta-card alerta-card--green">
            <p className="alerta-card__label">Valor del inventario</p>
            <p className="alerta-card__value">${parseFloat(alertas.valor_inventario).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
            <p className="alerta-card__sub">costo total en tienda</p>
          </div>
          <div className="alerta-card alerta-card--amber">
            <p className="alerta-card__label">Productos agotados</p>
            <p className="alerta-card__value">{alertas.productos_agotados}</p>
            <p className="alerta-card__sub">sin stock disponible</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="inventario__filtros">
        {["todos", "entrada", "salida", "ajuste"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`cat-btn ${filtroTipo === tipo ? "cat-btn--active" : ""}`}
          >
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabla movimientos */}
      <div className="card">
        <h2 className="card__title">Historial de movimientos</h2>
        <table className="table">
          <thead>
            <tr>
              {["Fecha", "Producto", "Tipo", "Cantidad", "Stock anterior", "Stock nuevo", "Costo", "Proveedor", "Nota"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" className="tabla-vacia">No hay movimientos</td>
              </tr>
            ) : (
              movimientosFiltrados.map((m) => (
                <tr key={m.id}>
                  <td className="text-muted">{new Date(m.fecha).toLocaleDateString("es-MX")}</td>
                  <td className="text-bold">{m.producto}</td>
                  <td><span className={`badge ${tipoLabels[m.tipo].color}`}>{tipoLabels[m.tipo].label}</span></td>
                  <td className="text-bold">{m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}</td>
                  <td className="text-muted">{m.cantidad_anterior}</td>
                  <td className="text-bold">{m.cantidad_nueva}</td>
                  <td>{m.costo_unitario > 0 ? `$${parseFloat(m.costo_unitario).toFixed(2)}` : "-"}</td>
                  <td className="text-muted">{m.proveedor || "-"}</td>
                  <td className="text-muted">{m.nota || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal registrar movimiento */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__titulo">Registrar movimiento</h2>
            <div className="modal__form">

              <div className="form-group">
                <label>Producto</label>
                <select value={form.producto_id} onChange={(e) => setForm({ ...form, producto_id: e.target.value })}>
                  <option value="">Selecciona un producto</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de movimiento</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <option value="entrada">Entrada — llegó mercancía</option>
                  <option value="salida">Salida — salió mercancía</option>
                  <option value="ajuste">Ajuste — corrección manual</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    placeholder={form.tipo === "ajuste" ? "Ej. -3 o +5" : "0"}
                  />
                </div>
                <div className="form-group">
                  <label>Costo unitario</label>
                  <input
                    type="number"
                    value={form.costo_unitario}
                    onChange={(e) => setForm({ ...form, costo_unitario: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {form.tipo === "entrada" && (
                <div className="form-group">
                  <label>Proveedor</label>
                  <select value={form.proveedor_id} onChange={(e) => setForm({ ...form, proveedor_id: e.target.value })}>
                    <option value="">Sin proveedor</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Nota {form.tipo === "ajuste" && <span className="label-required">* requerida en ajustes</span>}</label>
                <input
                  type="text"
                  value={form.nota}
                  onChange={(e) => setForm({ ...form, nota: e.target.value })}
                  placeholder={form.tipo === "ajuste" ? "Ej. Ajuste por merma o robo" : "Opcional"}
                />
              </div>

            </div>
            <div className="modal__acciones">
              <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardar}>Registrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}