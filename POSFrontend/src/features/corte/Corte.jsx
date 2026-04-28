import { useState, useEffect } from "react";
import "./Corte.css";
import { apiFetch } from "../../services/api";

export default function Corte() {
  const [datos, setDatos] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState("corte");
  const [cajero, setCajero] = useState("Cajero");
  const [notas, setNotas] = useState("");
  const [cortRealizado, setCortRealizado] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

 const cargarDatos = () => {
  Promise.all([
    apiFetch("/corte"),
    apiFetch("/corte/historial"),
  ]).then(([d, h]) => {
    setDatos(d);
    setHistorial(h);
    setCargando(false);
  });
};

  const realizarCorte = () => {
  if (!window.confirm("¿Confirmas realizar el corte de caja?")) return;
  apiFetch("/corte/realizar", {
    method: "POST",
    body: JSON.stringify({ cajero, notas }),
  }).then((data) => {
    if (data.error) return alert("Error: " + data.error);
    setCortRealizado(true);
    cargarDatos();
  });
};

  if (cargando) return <p style={{ padding: "24px" }}>Cargando corte de caja...</p>;

  return (
    <div className="corte">

      {/* Header */}
      <div className="corte__header">
        <div>
          <h1 className="corte__titulo">Corte de caja</h1>
          <p className="corte__sub">{new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="corte__header-acciones">
          <button
            className={`cat-btn ${vista === "corte" ? "cat-btn--active" : ""}`}
            onClick={() => setVista("corte")}
          >
            Corte del día
          </button>
          <button
            className={`cat-btn ${vista === "historial" ? "cat-btn--active" : ""}`}
            onClick={() => setVista("historial")}
          >
            Historial
          </button>
        </div>
      </div>

      {vista === "corte" && (
        <>
          {/* Cards resumen */}
          <div className="corte__grid">
            <div className="corte-card corte-card--green">
              <p className="corte-card__label">Total ingresos</p>
              <p className="corte-card__value">${parseFloat(datos?.resumen?.total_ingresos || 0).toFixed(2)}</p>
              <p className="corte-card__sub">del día</p>
            </div>
            <div className="corte-card corte-card--blue">
              <p className="corte-card__label">Tickets emitidos</p>
              <p className="corte-card__value">{datos?.resumen?.total_ventas || 0}</p>
              <p className="corte-card__sub">ventas hoy</p>
            </div>
            <div className="corte-card corte-card--amber">
              <p className="corte-card__label">Ticket promedio</p>
              <p className="corte-card__value">${parseFloat(datos?.resumen?.ticket_promedio || 0).toFixed(2)}</p>
              <p className="corte-card__sub">por venta</p>
            </div>
            <div className="corte-card corte-card--purple">
              <p className="corte-card__label">Productos vendidos</p>
              <p className="corte-card__value">{datos?.resumen?.total_productos || 0}</p>
              <p className="corte-card__sub">piezas hoy</p>
            </div>
          </div>

          {/* Desglose por método de pago */}
          <div className="corte__desglose">
            <div className="desglose-card">
              <p className="desglose-card__icon">💵</p>
              <p className="desglose-card__label">Efectivo</p>
              <p className="desglose-card__value">${parseFloat(datos?.resumen?.total_efectivo || 0).toFixed(2)}</p>
            </div>
            <div className="desglose__separador">+</div>
            <div className="desglose-card">
              <p className="desglose-card__icon">💳</p>
              <p className="desglose-card__label">Tarjeta</p>
              <p className="desglose-card__value">${parseFloat(datos?.resumen?.total_tarjeta || 0).toFixed(2)}</p>
            </div>
            <div className="desglose__separador">=</div>
            <div className="desglose-card desglose-card--total">
              <p className="desglose-card__icon">🏦</p>
              <p className="desglose-card__label">Total</p>
              <p className="desglose-card__value">${parseFloat(datos?.resumen?.total_ingresos || 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Tabla ventas del día */}
          <div className="card">
            <h2 className="card__title">Ventas del día</h2>
            <table className="table">
              <thead>
                <tr>
                  {["Folio", "Hora", "Cajero", "Cliente", "Total", "Pago"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!datos?.ventas?.length ? (
                  <tr><td colSpan="6" className="tabla-vacia">No hay ventas hoy</td></tr>
                ) : (
                  datos.ventas.map((v, i) => (
                    <tr key={i}>
                      <td className="text-blue text-bold">{v.folio}</td>
                      <td className="text-muted">{new Date(v.fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</td>
                      <td>{v.cajero}</td>
                      <td className="text-muted">{v.cliente_nombre || "Público general"}</td>
                      <td className="text-bold">${parseFloat(v.total).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${v.metodo_pago === "efectivo" ? "badge--green" : "badge--blue"}`}>
                          {v.metodo_pago}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Realizar corte */}
          <div className="card corte__realizar">
            <h2 className="card__title">Cerrar turno</h2>
            {cortRealizado && (
              <div className="corte__exito">✅ Corte realizado correctamente</div>
            )}
            <div className="corte__form">
              <div className="form-group">
                <label>Cajero</label>
                <input
                  type="text"
                  value={cajero}
                  onChange={(e) => setCajero(e.target.value)}
                  placeholder="Nombre del cajero"
                />
              </div>
              <div className="form-group">
                <label>Notas (opcional)</label>
                <input
                  type="text"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej. Todo en orden, sin incidencias"
                />
              </div>
            </div>
            <button className="corte__btn-realizar" onClick={realizarCorte}>
              📊 Realizar corte de caja
            </button>
          </div>
        </>
      )}

      {vista === "historial" && (
        <div className="card">
          <h2 className="card__title">Historial de cortes</h2>
          <table className="table">
            <thead>
              <tr>
                {["Fecha", "Cajero", "Ventas", "Efectivo", "Tarjeta", "Total", "Notas"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!historial.length ? (
                <tr><td colSpan="7" className="tabla-vacia">No hay cortes registrados</td></tr>
              ) : (
                historial.map((c, i) => (
                  <tr key={i}>
                    <td className="text-muted">{new Date(c.fecha_corte).toLocaleDateString("es-MX")}</td>
                    <td>{c.cajero}</td>
                    <td className="text-bold">{c.total_ventas}</td>
                    <td className="text-green">${parseFloat(c.total_efectivo).toFixed(2)}</td>
                    <td className="text-blue">${parseFloat(c.total_tarjeta).toFixed(2)}</td>
                    <td className="text-bold">${parseFloat(c.total_ingresos).toFixed(2)}</td>
                    <td className="text-muted">{c.notas || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}