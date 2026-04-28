import { useRef } from "react";
import "./Ticket.css";

export default function Ticket({ venta, onCerrar, onNuevaVenta }) {
  const ticketRef = useRef();

  const imprimir = () => {
    const contenido = ticketRef.current.innerHTML;
    const ventana = window.open("", "_blank", "width=400,height=600");
    ventana.document.write(`
      <html>
        <head>
          <title>Ticket ${venta.folio}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; padding: 10px; }
            .ticket-header { text-align: center; margin-bottom: 10px; }
            .ticket-header h2 { font-size: 16px; font-weight: bold; }
            .ticket-header p { font-size: 11px; }
            .ticket-divider { border-top: 1px dashed #000; margin: 8px 0; }
            .ticket-row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 11px; }
            .ticket-productos { margin: 8px 0; }
            .ticket-producto { margin: 4px 0; }
            .ticket-producto-nombre { font-size: 11px; }
            .ticket-producto-detalle { display: flex; justify-content: space-between; font-size: 11px; color: #333; }
            .ticket-totales { margin-top: 8px; }
            .ticket-total-final { font-size: 14px; font-weight: bold; }
            .ticket-footer { text-align: center; margin-top: 10px; font-size: 11px; }
          </style>
        </head>
        <body>${contenido}</body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
  };

  return (
    <div className="ticket-overlay">
      <div className="ticket-modal">

        {/* Botones arriba */}
        <div className="ticket-acciones">
          <h3 className="ticket-modal__titulo">Vista previa del ticket</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-cancelar" onClick={onCerrar}>✕ Cerrar</button>
            <button className="btn-imprimir" onClick={imprimir}>🖨️ Imprimir</button>
            <button className="btn-primary" onClick={onNuevaVenta}>+ Nueva venta</button>
          </div>
        </div>

        {/* Vista previa del ticket */}
        <div className="ticket-preview">
          <div ref={ticketRef} className="ticket">

            {/* Encabezado */}
            <div className="ticket-header">
              <h2>Abarrotes El Buen Precio</h2>
              <p>Calle Morelos #123, Col. Centro</p>
              <p>Tel: 222-555-0100</p>
            </div>

            <div className="ticket-divider" />

            {/* Folio y fecha */}
            <div className="ticket-row">
              <span>Folio:</span>
              <span>{venta.folio}</span>
            </div>
            <div className="ticket-row">
              <span>Fecha:</span>
              <span>{new Date().toLocaleDateString("es-MX")}</span>
            </div>
            <div className="ticket-row">
              <span>Hora:</span>
              <span>{new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {venta.cliente_nombre && (
              <div className="ticket-row">
                <span>Cliente:</span>
                <span>{venta.cliente_nombre}</span>
              </div>
            )}

            <div className="ticket-divider" />

            {/* Productos */}
            <div className="ticket-productos">
              {venta.detalle.map((item, i) => (
                <div key={i} className="ticket-producto">
                  <p className="ticket-producto-nombre">{item.nombre}</p>
                  <div className="ticket-producto-detalle">
                    <span>{item.cantidad} x ${parseFloat(item.precio).toFixed(2)}</span>
                    <span>${(item.cantidad * item.precio).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ticket-divider" />

            {/* Totales */}
            <div className="ticket-totales">
              <div className="ticket-row">
                <span>Subtotal:</span>
                <span>${parseFloat(venta.subtotal).toFixed(2)}</span>
              </div>
              <div className="ticket-row ticket-total-final">
                <span>TOTAL:</span>
                <span>${parseFloat(venta.total).toFixed(2)}</span>
              </div>
              <div className="ticket-row">
                <span>Pago ({venta.metodo_pago}):</span>
                <span>${parseFloat(venta.monto_pagado).toFixed(2)}</span>
              </div>
              {venta.metodo_pago === "efectivo" && (
                <div className="ticket-row">
                  <span>Cambio:</span>
                  <span>${parseFloat(venta.cambio).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="ticket-divider" />

            {/* Footer */}
            <div className="ticket-footer">
              <p>¡Gracias por su compra!</p>
              <p>Vuelva pronto</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}