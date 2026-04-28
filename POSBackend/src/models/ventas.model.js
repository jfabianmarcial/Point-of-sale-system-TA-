const db = require("../db");

const obtenerTodas = (callback) => {
  const sql = `
    SELECT v.*, c.nombre AS cliente_nombre
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    ORDER BY v.fecha DESC
  `;
  db.query(sql, callback);
};

const obtenerPorId = (id, callback) => {
  db.query(`
    SELECT v.*, c.nombre AS cliente_nombre
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    WHERE v.id = ?
  `, [id], (err, venta) => {
    if (err) return callback(err);
    db.query(
      "SELECT * FROM detalle_ventas WHERE venta_id = ?",
      [id],
      (err, detalle) => {
        if (err) return callback(err);
        callback(null, { ...venta[0], detalle });
      }
    );
  });
};

const obtenerResumen = (callback) => {
  const sql = `
    SELECT
      COUNT(*) AS total_ventas,
      SUM(total) AS ingresos_totales,
      SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END) AS total_efectivo,
      SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END) AS total_tarjeta
    FROM ventas
    WHERE DATE(fecha) = CURDATE() AND estado = 'completada'
  `;
  db.query(sql, callback);
};

const generarFolio = (callback) => {
  db.query("SELECT COUNT(*) AS total FROM ventas", (err, results) => {
    if (err) return callback(err);
    const folio = `VTA-${String(results[0].total + 1).padStart(4, "0")}`;
    callback(null, folio);
  });
};

const crear = (datos, callback) => {
  const { folio, cliente_id, cajero, subtotal, iva, total, metodo_pago, monto_pagado, cambio, detalle } = datos;

  db.query(
    "INSERT INTO ventas (folio, cliente_id, cajero, subtotal, iva, total, metodo_pago, monto_pagado, cambio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [folio, cliente_id || null, cajero || "Cajero", subtotal, iva, total, metodo_pago, monto_pagado, cambio],
    (err, result) => {
      if (err) return callback(err);
      const venta_id = result.insertId;

      const detalleValues = detalle.map((d) => [
        venta_id, d.producto_id, d.nombre, d.precio, d.cantidad, d.precio * d.cantidad
      ]);

      db.query(
        "INSERT INTO detalle_ventas (venta_id, producto_id, nombre_producto, precio_unitario, cantidad, subtotal) VALUES ?",
        [detalleValues],
        (err) => {
          if (err) return callback(err);

          // Actualizar stock de cada producto
          const updates = detalle.map((d) => new Promise((resolve, reject) => {
            db.query(
              "UPDATE productos SET stock = stock - ? WHERE id = ?",
              [d.cantidad, d.producto_id],
              (err) => err ? reject(err) : resolve()
            );
          }));

          Promise.all(updates)
            .then(() => callback(null, { venta_id, folio }))
            .catch(callback);
        }
      );
    }
  );
};

const cancelar = (id, callback) => {
  db.query("UPDATE ventas SET estado = 'cancelada' WHERE id = ?", [id], callback);
};

const obtenerDashboard = (callback) => {
  const resumen = `
    SELECT
      COUNT(*) AS total_ventas,
      COALESCE(SUM(total), 0) AS ingresos_totales,
      COUNT(DISTINCT cliente_id) AS clientes_atendidos
    FROM ventas
    WHERE DATE(fecha) = CURDATE() AND estado = 'completada'
  `;

  const ultimasVentas = `
    SELECT v.folio, v.total, v.metodo_pago, v.cajero, v.fecha,
           c.nombre AS cliente_nombre
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    WHERE estado = 'completada'
    ORDER BY v.fecha DESC
    LIMIT 5
  `;

  const masVendidos = `
    SELECT dv.nombre_producto, 
           SUM(dv.cantidad) AS cantidad,
           SUM(dv.subtotal) AS total
    FROM detalle_ventas dv
    JOIN ventas v ON dv.venta_id = v.id
    WHERE DATE(v.fecha) = CURDATE() AND v.estado = 'completada'
    GROUP BY dv.nombre_producto
    ORDER BY cantidad DESC
    LIMIT 5
  `;

  const stockBajo = `
    SELECT nombre, stock
    FROM productos
    WHERE stock <= 5
    ORDER BY stock ASC
    LIMIT 5
  `;

  db.query(resumen, (err, res1) => {
    if (err) return callback(err);
    db.query(ultimasVentas, (err, res2) => {
      if (err) return callback(err);
      db.query(masVendidos, (err, res3) => {
        if (err) return callback(err);
        db.query(stockBajo, (err, res4) => {
          if (err) return callback(err);
          callback(null, {
            resumen: res1[0],
            ultimasVentas: res2,
            masVendidos: res3,
            stockBajo: res4,
          });
        });
      });
    });
  });
};

module.exports = { obtenerTodas, obtenerPorId, obtenerResumen, generarFolio, crear, cancelar, obtenerDashboard };