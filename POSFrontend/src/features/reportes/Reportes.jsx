import { useState, useEffect } from "react";
import "./Reportes.css";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { apiFetch } from "../../services/api";

export default function Reportes() {
  const [periodo, setPeriodo] = useState("semana");
  const [ventasData, setVentasData] = useState(null);
  const [productosEstrella, setProductosEstrella] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  const cargarDatos = () => {
  setCargando(true);
  Promise.all([
    apiFetch(`/reportes/ventas?periodo=${periodo}`),
    apiFetch("/reportes/productos-estrella"),
    apiFetch("/reportes/cuentas-por-cobrar"),
  ]).then(([ventas, productos, deudas]) => {
    setVentasData(ventas);
    setProductosEstrella(productos);
    setCuentas(deudas);
    setCargando(false);
  });
};

  if (cargando) return <p style={{ padding: "24px" }}>Cargando reportes...</p>;

  const totalDeuda = cuentas.reduce((acc, c) => acc + parseFloat(c.saldo_deuda), 0);

  return (
    <div className="reportes">
      
      {/* ── REPORTE 1: Productos mas vendidos ── */}
      <div className="reporte-seccion">
        <h2 className="reporte-seccion__titulo">Productos mas vendidos</h2>
        <div className="reportes__dos-columnas">

          {/* Tabla */}
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  {["#", "Producto", "Cantidad", "Total generado"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!productosEstrella.length ? (
                  <tr><td colSpan="4" className="tabla-vacia">Sin datos</td></tr>
                ) : (
                  productosEstrella.map((p, i) => (
                    <tr key={i}>
                      <td className="text-muted text-bold">{i + 1}</td>
                      <td className="text-bold">{p.nombre_producto}</td>
                      <td>
                        <span className="badge badge--blue">{p.cantidad_vendida} pzas</span>
                      </td>
                      <td className="text-green text-bold">${parseFloat(p.total_generado).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Gráfica de barras */}
          <div className="card">
            {!productosEstrella.length ? (
              <p className="tabla-vacia">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={productosEstrella.slice(0, 6)}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 80, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis
                    type="category"
                    dataKey="nombre_producto"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) => [value, "Piezas vendidas"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                  />
                  <Bar dataKey="cantidad_vendida" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      </div>

      {/* ── REPORTE 2: Cuentas por cobrar ── */}
      <div className="reporte-seccion">
        <h2 className="reporte-seccion__titulo">Cuentas por cobrar</h2>

        <div className="reportes__cards">
          <div className="reporte-card reporte-card--red">
            <p className="reporte-card__label">Total por cobrar</p>
            <p className="reporte-card__value">${totalDeuda.toFixed(2)}</p>
          </div>
          <div className="reporte-card reporte-card--amber">
            <p className="reporte-card__label">Clientes con deuda</p>
            <p className="reporte-card__value">{cuentas.length}</p>
          </div>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                {["Cliente", "Teléfono", "Deuda"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!cuentas.length ? (
                <tr><td colSpan="5" className="tabla-vacia">¡Sin deudas pendientes! ✅</td></tr>
              ) : (
                cuentas.map((c, i) => (
                  <tr key={i}>
                    <td className="text-bold">{c.nombre}</td>
                    <td className="text-muted">{c.telefono || "-"}</td>
                    <td className="text-red text-bold">${parseFloat(c.saldo_deuda).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}