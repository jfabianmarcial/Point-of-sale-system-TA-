import { useState, useEffect } from "react";
import "./Ventas.css";
import { apiFetch } from "../../services/api";
import Ticket from "./Ticket";

export default function Ventas({ onCerrar, usuario }) {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [montoPagado, setMontoPagado] = useState("");
  const [ventaExitosa, setVentaExitosa] = useState(null);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/productos"),
      apiFetch("/clientes"),
    ]).then(([prods, cls]) => {
      setProductos(prods);
      setClientes(cls);
    });
  }, []);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.includes(busqueda)
  );

  const agregarAlCarrito = (producto) => {
    if (producto.stock === 0) return;
    setCarrito((prev) => {
      const existe = prev.find((i) => i.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) return prev;
        return prev.map((i) => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setBusqueda("");
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) =>
      prev.map((i) => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i)
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const iva = 0;
  const total = subtotal + iva;
  const cambio = metodoPago === "efectivo" ? Math.max(0, parseFloat(montoPagado || 0) - total) : 0;

  const confirmarVenta = () => {
    if (carrito.length === 0) return;
    if (metodoPago === "efectivo" && parseFloat(montoPagado) < total) {
      alert("El monto pagado es menor al total");
      return;
    }
    const datos = {
      cliente_id: clienteSeleccionado?.id || null,
      cajero: usuario?.nombre || "Cajero",
      subtotal, iva, total,
      metodo_pago: metodoPago,
      monto_pagado: metodoPago === "efectivo" ? parseFloat(montoPagado) : total,
      cambio,
      detalle: carrito.map((i) => ({
        producto_id: i.id,
        nombre: i.nombre,
        precio: i.precio,
        cantidad: i.cantidad,
      })),
    };
    apiFetch("/ventas", {
      method: "POST",
      body: JSON.stringify(datos),
    }).then((data) => {
      if (data.error) return alert("Error: " + data.error);
      const ventaCompleta = {
        ...datos,
        folio: data.folio,
        cliente_nombre: clienteSeleccionado?.nombre || null,
        detalle: carrito.map((i) => ({
          nombre: i.nombre,
          precio: i.precio,
          cantidad: i.cantidad,
        })),
      };
      setVentaExitosa(ventaCompleta);
      setMostrarTicket(true);
      setCarrito([]);
      setMontoPagado("");
      setClienteSeleccionado(null);
    });
  };

  return (
    <div className="pos">

      {/* Header */}
      <div className="pos__header">
        <div className="pos__header-left">
          <span className="pos__logo">🛒</span>
          <span className="pos__titulo">Nueva Venta</span>
        </div>
        <button className="btn-cancelar" onClick={onCerrar}>✕ Cerrar</button>
      </div>

      <div className="pos__body">

        {/* Panel izquierdo — productos */}
        <div className="pos__productos">
          <input
            type="text"
            placeholder="Buscar producto por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pos__buscador"
            autoFocus
          />

          <div className="pos__lista-productos">
            {busqueda === "" ? (
              <p className="pos__hint">Escribe para buscar productos</p>
            ) : productosFiltrados.length === 0 ? (
              <p className="pos__hint">No se encontraron productos</p>
            ) : (
              productosFiltrados.map((p) => (
                <div
                  key={p.id}
                  className={`pos__producto-item ${p.stock === 0 ? "pos__producto-item--agotado" : ""}`}
                  onClick={() => agregarAlCarrito(p)}
                >
                  <div>
                    <p className="pos__producto-nombre">{p.nombre}</p>
                    <p className="pos__producto-codigo">{p.codigo}</p>
                  </div>
                  <div className="pos__producto-right">
                    <p className="pos__producto-precio">${parseFloat(p.precio).toFixed(2)}</p>
                    <p className={`pos__producto-stock ${p.stock <= 5 ? "text-red" : "text-muted"}`}>
                      Stock: {p.stock}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel derecho — carrito */}
        <div className="pos__carrito">

          {/* Cliente */}
          <div className="pos__seccion">
            <p className="pos__seccion-titulo">Cliente (opcional)</p>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              className="pos__buscador"
            />
            {busquedaCliente && (
              <div className="pos__clientes-lista">
                {clientes
                  .filter((c) => c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()))
                  .map((c) => (
                    <div
                      key={c.id}
                      className="pos__cliente-item"
                      onClick={() => { setClienteSeleccionado(c); setBusquedaCliente(""); }}
                    >
                      {c.nombre}
                    </div>
                  ))
                }
              </div>
            )}
            {clienteSeleccionado && (
              <div className="pos__cliente-seleccionado">
                <span>👤 {clienteSeleccionado.nombre}</span>
                <button onClick={() => setClienteSeleccionado(null)}>✕</button>
              </div>
            )}
          </div>

          {/* Items del carrito */}
          <div className="pos__seccion pos__items">
            <p className="pos__seccion-titulo">Carrito</p>
            {carrito.length === 0 ? (
              <p className="pos__hint">Agrega productos desde la izquierda</p>
            ) : (
              carrito.map((item) => (
                <div key={item.id} className="pos__item">
                  <div className="pos__item-info">
                    <p className="pos__item-nombre">{item.nombre}</p>
                    <p className="pos__item-precio">${parseFloat(item.precio).toFixed(2)} c/u</p>
                  </div>
                  <div className="pos__item-controles">
                    <button className="pos__btn-cantidad" onClick={() => cambiarCantidad(item.id, -1)}>−</button>
                    <span className="pos__cantidad">{item.cantidad}</span>
                    <button className="pos__btn-cantidad" onClick={() => cambiarCantidad(item.id, 1)}>+</button>
                    <span className="pos__item-subtotal">${(item.precio * item.cantidad).toFixed(2)}</span>
                    <button className="pos__btn-eliminar" onClick={() => eliminarDelCarrito(item.id)}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resumen y pago */}
          <div className="pos__pago">
            <div className="pos__totales">
              <div className="pos__total-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="pos__total-row pos__total-final">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pos__metodo-pago">
              <button
                className={`pos__metodo-btn ${metodoPago === "efectivo" ? "pos__metodo-btn--active" : ""}`}
                onClick={() => setMetodoPago("efectivo")}
              >
                💵 Efectivo
              </button>
              <button
                className={`pos__metodo-btn ${metodoPago === "tarjeta" ? "pos__metodo-btn--active" : ""}`}
                onClick={() => setMetodoPago("tarjeta")}
              >
                💳 Tarjeta
              </button>
            </div>

            {metodoPago === "efectivo" && (
              <div className="pos__efectivo">
                <input
                  type="number"
                  placeholder="Monto recibido"
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(e.target.value)}
                  className="pos__input-pago"
                />
                {montoPagado && (
                  <div className="pos__cambio">
                    <span>Cambio</span>
                    <span className="text-green text-bold">${cambio.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <button
              className="pos__btn-confirmar"
              onClick={confirmarVenta}
              disabled={carrito.length === 0}
            >
              ✅ Confirmar venta — ${total.toFixed(2)}
            </button>
          </div>

        </div>
      </div>

      {/* Ticket */}
      {mostrarTicket && ventaExitosa && (
        <Ticket
          venta={ventaExitosa}
          onCerrar={() => {
            setMostrarTicket(false);
            setVentaExitosa(null);
            onCerrar();
          }}
          onNuevaVenta={() => {
            setMostrarTicket(false);
            setVentaExitosa(null);
          }}
        />
      )}

    </div>
  );
}