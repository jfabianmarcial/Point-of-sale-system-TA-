import { useState, useEffect } from "react";
import "./Productos.css";
import { apiFetch } from "../../services/api";

const productoVacio = { nombre: "", precio: "", categoria: "", codigo: "", stock: "" };

export default function Productos({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [form, setForm] = useState(productoVacio);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);
  const [errorCategoria, setErrorCategoria] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    Promise.all([
      apiFetch("/productos"),
      apiFetch("/categorias"),
    ]).then(([prods, cats]) => {
      setProductos(prods);
      setCategorias(cats);
      setCargando(false);
    });
  };

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.includes(busqueda);
    const coincideCategoria = categoriaActiva === "Todas" || p.categoria === categoriaActiva;
    return coincideBusqueda && coincideCategoria;
  });

  const abrirAgregar = () => {
    setProductoEditando(null);
    setForm({ ...productoVacio, categoria: categorias[0]?.nombre || "" });
    setMostrarNuevaCategoria(false);
    setNuevaCategoria("");
    setModalAbierto(true);
  };

  const abrirEditar = (producto) => {
    setProductoEditando(producto.id);
    setForm({ ...producto });
    setMostrarNuevaCategoria(false);
    setNuevaCategoria("");
    setModalAbierto(true);
  };

  const guardarCategoria = () => {
    if (!nuevaCategoria.trim()) return;
    setErrorCategoria("");
    apiFetch("/categorias", {
      method: "POST",
      body: JSON.stringify({ nombre: nuevaCategoria.trim() }),
    }).then((data) => {
      if (data.error) return setErrorCategoria(data.error);
      setCategorias([...categorias, data]);
      setForm({ ...form, categoria: data.nombre });
      setMostrarNuevaCategoria(false);
      setNuevaCategoria("");
    });
  };

  const guardar = () => {
    if (!form.nombre || !form.precio || !form.stock || !form.codigo || !form.categoria) return;
    if (productoEditando) {
      apiFetch(`/productos/${productoEditando}`, {
        method: "PUT",
        body: JSON.stringify(form),
      }).then(() => {
        setProductos(productos.map((p) => p.id === productoEditando ? { ...form, id: productoEditando } : p));
        setModalAbierto(false);
      });
    } else {
      apiFetch("/productos", {
        method: "POST",
        body: JSON.stringify(form),
      }).then((nuevo) => {
        setProductos([...productos, nuevo]);
        setModalAbierto(false);
      });
    }
  };

  const eliminar = (id) => {
    apiFetch(`/productos/${id}`, { method: "DELETE" })
      .then(() => {
        setProductos(productos.filter((p) => p.id !== id));
        setConfirmEliminar(null);
      });
  };

  if (cargando) return <p style={{ padding: "24px" }}>Cargando productos...</p>;

  return (
    <div className="productos">
      <div className="productos__header">
        <div>
          <h1 className="productos__titulo">Productos</h1>
          <p className="productos__sub">{productos.length} productos registrados</p>
        </div>
        {usuario?.rol === "admin" && (
          <button className="btn-primary" onClick={abrirAgregar}>+ Agregar producto</button>
        )}
      </div>

      <div className="productos__filtros">
        <input
          type="text"
          placeholder="Buscar por nombre o código de barras..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="productos__buscador"
        />
        <div className="productos__categorias">
          <button
            onClick={() => setCategoriaActiva("Todas")}
            className={`cat-btn ${categoriaActiva === "Todas" ? "cat-btn--active" : ""}`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.nombre)}
              className={`cat-btn ${categoriaActiva === cat.nombre ? "cat-btn--active" : ""}`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              {["Nombre", "Código de barras", "Categoría", "Stock", "Precio", "Acciones"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr><td colSpan="6" className="tabla-vacia">No se encontraron productos</td></tr>
            ) : (
              productosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td className="text-bold">{p.nombre}</td>
                  <td className="text-muted text-mono">{p.codigo}</td>
                  <td><span className="badge badge--blue">{p.categoria}</span></td>
                  <td>
                    <span className={`badge ${p.stock <= 5 ? "badge--red" : "badge--green"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="text-bold">${parseFloat(p.precio).toFixed(2)}</td>
                  <td>
                    <div className="acciones">
                      {usuario?.rol === "admin" ? (
                        <>
                          <button className="btn-editar" onClick={() => abrirEditar(p)}>✏️ Editar</button>
                          <button className="btn-eliminar" onClick={() => setConfirmEliminar(p.id)}>🗑️ Eliminar</button>
                        </>
                      ) : (
                        <span className="text-muted" style={{ fontSize: "12px" }}>Solo lectura</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && usuario?.rol === "admin" && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__titulo">{productoEditando ? "Editar producto" : "Agregar producto"}</h2>
            <div className="modal__form">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Coca Cola 600ml" />
              </div>
              <div className="form-group">
                <label>Código de barras</label>
                <input type="text" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="Ej. 7501055300051" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio</label>
                  <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                </div>
              </div>

              {/* Categoría */}
              <div className="form-group">
                <label>Categoría</label>
                {!mostrarNuevaCategoria ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      value={form.categoria}
                      onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                      style={{ flex: 1 }}
                    >
                      {categorias.map((c) => (
                        <option key={c.id} value={c.nombre}>{c.nombre}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setMostrarNuevaCategoria(true)}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap" }}
                    >
                      + Nueva
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={nuevaCategoria}
                        onChange={(e) => setNuevaCategoria(e.target.value)}
                        placeholder="Ej. Carnes"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={guardarCategoria}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "none", background: "#3b82f6", color: "white", cursor: "pointer", fontSize: "13px" }}
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMostrarNuevaCategoria(false); setNuevaCategoria(""); setErrorCategoria(""); }}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: "13px" }}
                      >
                        Cancelar
                      </button>
                    </div>
                    {errorCategoria && <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{errorCategoria}</p>}
                  </div>
                )}
              </div>

            </div>
            <div className="modal__acciones">
              <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardar}>
                {productoEditando ? "Guardar cambios" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmEliminar && (
        <div className="modal-overlay" onClick={() => setConfirmEliminar(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__titulo">¿Eliminar producto?</h2>
            <p className="modal__desc">Esta acción no se puede deshacer.</p>
            <div className="modal__acciones">
              <button className="btn-cancelar" onClick={() => setConfirmEliminar(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => eliminar(confirmEliminar)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}