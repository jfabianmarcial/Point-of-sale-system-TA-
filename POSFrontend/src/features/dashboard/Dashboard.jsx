import { useState, useEffect } from "react";
import "./Dashboard.css";
import Productos from "../productos/Productos";
import Inventario from "../inventory/Inventario";
import Clientes from "../clientes/Clientes";
import Ventas from "../sales/Ventas";
import Corte from "../corte/Corte";
import Reportes from "../reportes/Reportes";
import Configuracion from "../configuracion/Configuracion";

const menuItems = [
  { id: "ventas", label: "Ventas" },
  { id: "productos", label: "Productos" },
  { id: "inventario", label: "Inventario" },
  { id: "clientes", label: "Clientes" },
  { id: "reportes", label: "Reportes" },
  { id: "corte", label: "Corte de caja" },
  { id: "configuracion", label: "Configuración" },
];

const titulos = {
  ventas: "Dashboard",
  productos: "Productos",
  inventario: "Inventario",
  clientes: "Clientes",
  reportes: "Reportes",
  corte: "Corte de caja",
  configuracion: "Configuración",
};

const menuPorRol = {
  admin: ["ventas", "productos", "inventario", "clientes", "reportes", "corte", "configuracion"],
  cajero: ["ventas", "productos", "clientes"],
};

export default function Dashboard({ usuario, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("ventas");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ventasAbierto, setVentasAbierto] = useState(false);
  const [dashData, setDashData] = useState(null);
  const [modalLogout, setModalLogout] = useState(false);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/ventas/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setDashData(data))
      .catch((err) => console.error("Error cargando dashboard:", err));
  };

  const menuFiltrado = menuItems.filter((item) =>
    menuPorRol[usuario?.rol]?.includes(item.id)
  );

  return (
    <div className="dashboard-wrapper">

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : "sidebar--closed"}`}>
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">🛒</div>
          {sidebarOpen && <span className="sidebar__logo-text">POS Abarrotes</span>}
        </div>

        <nav className="sidebar__nav">
          {menuFiltrado.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`sidebar__item ${activeMenu === item.id ? "sidebar__item--active" : ""}`}
            >
              <span className="sidebar__icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Info usuario en sidebar */}
        {sidebarOpen && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid #1e293b" }}>
            <p style={{ margin: "0 0 2px", fontSize: "13px", color: "white", fontWeight: 500 }}>{usuario?.nombre}</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", textTransform: "capitalize" }}>{usuario?.rol}</p>
          </div>
        )}

        <button className="sidebar__toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "◀ Cerrar" : "▶"}
        </button>
      </aside>

      {/* Main */}
      <div className="main">

        {/* Topbar */}
        <header className="topbar">
          <div>
            <h1 className="topbar__title">{titulos[activeMenu]}</h1>
            <p className="topbar__date">{new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="topbar__actions">
            <button className="btn-primary" onClick={() => setVentasAbierto(true)}>
              + Nueva Venta
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
             <span style={{ fontSize: "13px", color: "#64748b" }}>{usuario?.nombre}</span>
             <div
             className="topbar__avatar"
             onClick={() => setModalLogout(true)}
             style={{ cursor: "pointer" }}
             title="Cerrar sesión"
          >
             👤
          </div> 
            </div>
         </div>
        </header>

        {/* Contenido */}
        <div className="main__content">

          {activeMenu === "ventas" && (
            <div className="content">

              <div className="stats-grid">
                <div className="stat-card stat-card--green">
                  <p className="stat-card__label">Ventas hoy</p>
                  <p className="stat-card__value">${parseFloat(dashData?.resumen?.ingresos_totales || 0).toFixed(2)}</p>
                  <p className="stat-card__sub">del día</p>
                </div>
                <div className="stat-card stat-card--blue">
                  <p className="stat-card__label">Tickets emitidos</p>
                  <p className="stat-card__value">{dashData?.resumen?.total_ventas || 0}</p>
                  <p className="stat-card__sub">hoy</p>
                </div>
                <div className="stat-card stat-card--amber">
                  <p className="stat-card__label">Stock bajo</p>
                  <p className="stat-card__value">{dashData?.stockBajo?.length || 0}</p>
                  <p className="stat-card__sub">productos con 5 o menos</p>
                </div>
                <div className="stat-card stat-card--purple">
                  <p className="stat-card__label">Clientes atendidos</p>
                  <p className="stat-card__value">{dashData?.resumen?.clientes_atendidos || 0}</p>
                  <p className="stat-card__sub">hoy</p>
                </div>
              </div>

              <div className="tables-grid">
                <div className="card">
                  <h2 className="card__title">Últimas ventas</h2>
                  <table className="table">
                    <thead>
                      <tr>
                        {["Folio", "Cajero", "Cliente", "Total", "Pago"].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {!dashData?.ultimasVentas?.length ? (
                        <tr><td colSpan="5" className="tabla-vacia">No hay ventas hoy</td></tr>
                      ) : (
                        dashData.ultimasVentas.map((v, i) => (
                          <tr key={i}>
                            <td className="text-blue text-bold">{v.folio}</td>
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

                <div className="card">
                  <h2 className="card__title">Stock bajo</h2>
                  <table className="table">
                    <thead>
                      <tr>
                        {["Producto", "Stock"].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {!dashData?.stockBajo?.length ? (
                        <tr><td colSpan="2" className="tabla-vacia">Todo el stock está bien</td></tr>
                      ) : (
                        dashData.stockBajo.map((p, i) => (
                          <tr key={i}>
                            <td>{p.nombre}</td>
                            <td><span className="badge badge--red">{p.stock}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h2 className="card__title">Productos más vendidos hoy</h2>
                <table className="table">
                  <thead>
                    <tr>
                      {["#", "Producto", "Cantidad vendida", "Total generado"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!dashData?.masVendidos?.length ? (
                      <tr><td colSpan="4" className="tabla-vacia">No hay ventas hoy</td></tr>
                    ) : (
                      dashData.masVendidos.map((p, i) => (
                        <tr key={i}>
                          <td className="text-muted text-bold">{i + 1}</td>
                          <td className="text-bold">{p.nombre_producto}</td>
                          <td className="text-muted">{p.cantidad} piezas</td>
                          <td className="text-green text-bold">${parseFloat(p.total).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {activeMenu === "productos" && <Productos usuario={usuario} />}
          {activeMenu === "inventario" && <Inventario />}
          {activeMenu === "clientes" && <Clientes usuario={usuario} />}
          {activeMenu === "corte" && <Corte />}
          {activeMenu === "reportes" && <Reportes />}
          {activeMenu === "configuracion" && <Configuracion usuario={usuario} />}
          
        </div>
      </div>

      {ventasAbierto && <Ventas usuario={usuario} onCerrar={() => { setVentasAbierto(false); cargarDashboard(); }} />}
     

     {modalLogout && (
  <div className="modal-overlay" onClick={() => setModalLogout(false)}>
    <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
      <h2 className="modal__titulo">Cerrar sesión</h2>
      <p className="modal__desc">
        ¿Estás seguro que deseas cerrar sesión, <strong>{usuario?.nombre}</strong>?
      </p>
      <div className="modal__acciones">
        <button className="btn-cancelar" onClick={() => setModalLogout(false)}>Cancelar</button>
        <button className="btn-danger" onClick={onLogout}>Sí, cerrar sesión</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}