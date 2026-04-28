const db = require("../db");

const obtenerMovimientos = (callback) => {
  const sql = `
    SELECT m.*, p.nombre AS producto, p.stock AS stock_actual,
           pv.nombre AS proveedor
    FROM movimientos_inventario m
    JOIN productos p ON m.producto_id = p.id
    LEFT JOIN proveedores pv ON m.proveedor_id = pv.id
    ORDER BY m.fecha DESC
  `;
  db.query(sql, callback);
};

const obtenerAlertas = (callback) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM productos WHERE stock <= 5) AS productos_por_agotarse,
      (SELECT ROUND(SUM(stock * precio), 2) FROM productos) AS valor_inventario,
      (SELECT COUNT(*) FROM productos WHERE stock = 0) AS productos_agotados
  `;
  db.query(sql, callback);
};

const obtenerProveedores = (callback) => {
  db.query("SELECT * FROM proveedores WHERE activo = 1 ORDER BY nombre", callback);
};

const registrarMovimiento = (datos, callback) => {
  const { producto_id, tipo, cantidad, costo_unitario, proveedor_id, nota } = datos;

  db.query("SELECT stock FROM productos WHERE id = ?", [producto_id], (err, results) => {
    if (err) return callback(err);

    const stock_anterior = results[0].stock;
    let stock_nuevo;

    if (tipo === "entrada") {
      stock_nuevo = stock_anterior + parseInt(cantidad);
    } else if (tipo === "salida") {
      stock_nuevo = stock_anterior - parseInt(cantidad);
    } else {
      stock_nuevo = stock_anterior + parseInt(cantidad);
    }

    if (stock_nuevo < 0) return callback(new Error("Stock insuficiente"));

    db.query("UPDATE productos SET stock = ? WHERE id = ?", [stock_nuevo, producto_id], (err) => {
      if (err) return callback(err);

      const sql = `
        INSERT INTO movimientos_inventario 
        (producto_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, costo_unitario, proveedor_id, nota)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(sql, [producto_id, tipo, cantidad, stock_anterior, stock_nuevo, costo_unitario || 0, proveedor_id || null, nota || null], callback);
    });
  });
};

module.exports = { obtenerMovimientos, obtenerAlertas, obtenerProveedores, registrarMovimiento };