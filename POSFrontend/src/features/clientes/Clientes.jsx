import { useState, useEffect } from "react";
import "./Clientes.css";
import { apiFetch } from "../../services/api";

const formVacio = {
  nombre: "",
  telefono: "",
  direccion: "",
};

export default function Clientes({ usuario }) {
  const [clientes, setClientes] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalAbono, setModalAbono] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalFiar, setModalFiar] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [montoAbono, setMontoAbono] = useState("");
  const [notaAbono, setNotaAbono] = useState("");
  const [montoFiar, setMontoFiar] = useState("");
  const [notaFiar, setNotaFiar] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    Promise.all([
      apiFetch("/clientes"),
      apiFetch("/clientes/resumen"),
    ]).then(([cls, res]) => {
      setClientes(cls);
      setResumen(res);
      setCargando(false);
    });
  };

  const clientesFiltrados = clientes.filter((c) => {
    const coincideBusqueda =
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.telefono && c.telefono.includes(busqueda));
    const coincideFiltro =
      filtro === "todos" ? true :
      filtro === "deuda" ? c.saldo_deuda > 0 :
      filtro === "vip" ? c.es_vip : true;
    return coincideBusqueda && coincideFiltro;
  });

  const guardarCliente = () => {
    if (!form.nombre) return;
    const url = modalEditar ? `/clientes/${modalEditar.id}` : "/clientes";
    const method = modalEditar ? "PUT" : "POST";
    apiFetch(url, { method, body: JSON.stringify(form) }).then(() => {
      setModalNuevo(false);
      setModalEditar(null);
      setForm(formVacio);
      cargarDatos();
    });
  };

  const registrarAbono = () => {
    if (!montoAbono || montoAbono <= 0) return;
    apiFetch(`/clientes/${modalAbono.id}/abonar`, {
      method: "POST",
      body: JSON.stringify({ monto: montoAbono, nota: notaAbono }),
    }).then(() => {
      setModalAbono(null);
      setMontoAbono("");
      setNotaAbono("");
      cargarDatos();
    });
  };

  const registrarFiado = () => {
    if (!montoFiar || montoFiar <= 0) return;
    apiFetch(`/clientes/${modalFiar.id}/fiar`, {
      method: "POST",
      body: JSON.stringify({ monto: montoFiar, nota: notaFiar }),
    }).then(() => {
      setModalFiar(null);
      setMontoFiar("");
      setNotaFiar("");
      cargarDatos();
    });
  };

  const abrirEditar = (cliente) => {
    setForm({
      nombre: cliente.nombre,
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
    });
    setModalEditar(cliente);
  };
  
  const eliminarCliente = (id) => {
  if (!window.confirm("¿Eliminar este cliente?")) return;
  apiFetch(`/clientes/${id}`, { method: "DELETE" })
    .then(() => cargarDatos());
  };

  if (cargando) return <p style={{ padding: "24px" }}>Cargando clientes...</p>;

  return (
    <div className="clientes">
      <div className="clientes__header">
        <div>
          <h1 className="clientes__titulo">Gestión de Clientes</h1>
          <p className="clientes__sub">{clientes.length} clientes registrados</p>
        </div>
        {usuario?.rol === "admin" && (
          <button className="btn-primary" onClick={() => { setForm(formVacio); setModalNuevo(true); }}>
            + Nuevo Cliente
          </button>
        )}
      </div>

      {resumen && (
        <div className="resumen-grid">
          <div className="resumen-card resumen-card--blue">
            <p className="resumen-card__label">Total clientes</p>
            <p className="resumen-card__value">{resumen.total_clientes}</p>
          </div>
          <div className="resumen-card resumen-card--red">
            <p className="resumen-card__label">Total por cobrar</p>
            <p className="resumen-card__value">${parseFloat(resumen.total_deuda || 0).toFixed(2)}</p>
          </div>
          <div className="resumen-card resumen-card--amber">
            <p className="resumen-card__label">Con deuda</p>
            <p className="resumen-card__value">{resumen.clientes_con_deuda}</p>
          </div>
         
        </div>
      )}

      <div className="clientes__filtros">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="clientes__buscador"
        />
        <div className="filtros__botones">
          {[
            { id: "todos", label: "Todos" },
            { id: "deuda", label: "Con Deuda" },
            
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`cat-btn ${filtro === f.id ? "cat-btn--active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              {["Nombre", "Teléfono", "Fecha registro", "Estado", "Saldo", "Acciones"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr><td colSpan="6" className="tabla-vacia">No se encontraron clientes</td></tr>
            ) : (
              clientesFiltrados.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="text-bold">{c.nombre}</span>
                  </td>
                  <td className="text-muted">{c.telefono || "-"}</td>
                  <td className="text-muted">{new Date(c.created_at).toLocaleDateString("es-MX")}</td>
                  <td>
                    <span className={`badge ${c.saldo_deuda > 0 ? "badge--red" : "badge--green"}`}>
                      {c.saldo_deuda > 0 ? "Pendiente" : "Al corriente"}
                    </span>
                  </td>
                  <td className={`text-bold ${c.saldo_deuda > 0 ? "text-red" : ""}`}>
                    ${parseFloat(c.saldo_deuda).toFixed(2)}
                  </td>
                  <td>
                     <div className="acciones">
                       {usuario?.rol === "admin" && (
                       <button className="btn-editar" onClick={() => abrirEditar(c)}>✏️ Editar</button>
                       )}
                       <button className="btn-fiar" onClick={() => setModalFiar(c)}>📋 Fiar</button>
                       {c.saldo_deuda > 0 && (
                       <button className="btn-abonar" onClick={() => setModalAbono(c)}>💰 Abonar</button>
                       )}
                       {usuario?.rol === "admin" && (
                       <button className="btn-eliminar" onClick={() => eliminarCliente(c.id)}>🗑️ Eliminar</button>
                       )}
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(modalNuevo || modalEditar) && (
        <div className="modal-overlay" onClick={() => { setModalNuevo(false); setModalEditar(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__titulo">{modalEditar ? "Editar cliente" : "Nuevo cliente"}</h2>
            <div className="modal__form">
              <div className="form-group">
                <label>Nombre completo</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Juan Pérez" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Ej. 222-555-0101" />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Ej. Calle Morelos 12" />
              </div>
            </div>
            <div className="modal__acciones">
              <button className="btn-cancelar" onClick={() => { setModalNuevo(false); setModalEditar(null); }}>Cancelar</button>
              <button className="btn-primary" onClick={guardarCliente}>
                {modalEditar ? "Guardar cambios" : "Agregar cliente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAbono && (
        <div className="modal-overlay" onClick={() => setModalAbono(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__titulo">Registrar abono</h2>
            <p className="modal__desc">
              Cliente: <strong>{modalAbono.nombre}</strong><br />
              Deuda actual: <span className="text-red">${parseFloat(modalAbono.saldo_deuda).toFixed(2)}</span>
            </p>
            <div className="modal__form">
              <div className="form-group">
                <label>Monto del abono</label>
                <input type="number" value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Nota (opcional)</label>
                <input type="text" value={notaAbono} onChange={(e) => setNotaAbono(e.target.value)} placeholder="Ej. Abono en efectivo" />
              </div>
            </div>
            <div className="modal__acciones">
              <button className="btn-cancelar" onClick={() => setModalAbono(null)}>Cancelar</button>
              <button className="btn-primary" onClick={registrarAbono}>Registrar abono</button>
            </div>
          </div>
        </div>
      )}

      {modalFiar && (
        <div className="modal-overlay" onClick={() => setModalFiar(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__titulo">Registrar fiado</h2>
            <p className="modal__desc">
              Cliente: <strong>{modalFiar.nombre}</strong><br />
              Deuda actual: <span className="text-red">${parseFloat(modalFiar.saldo_deuda).toFixed(2)}</span>
            </p>
            <div className="modal__form">
              <div className="form-group">
                <label>Monto a fiar</label>
                <input type="number" value={montoFiar} onChange={(e) => setMontoFiar(e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Nota</label>
                <input type="text" value={notaFiar} onChange={(e) => setNotaFiar(e.target.value)} placeholder="Ej. Coca Cola y pan" />
              </div>
            </div>
            <div className="modal__acciones">
              <button className="btn-cancelar" onClick={() => setModalFiar(null)}>Cancelar</button>
              <button className="btn-primary" onClick={registrarFiado}>Registrar fiado</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}