const db = require("../db");

const ventasPorPeriodo = (periodo, callback) => {
  let sql;
  if (periodo === "dia") {
  sql = `
    SELECT 
      DATE_FORMAT(fecha, '%H:00') AS etiqueta,
      COUNT(*) AS total_ventas,
      COALESCE(SUM(total), 0) AS ingresos
    FROM ventas
    WHERE DATE(CONVERT_TZ(fecha, '+00:00', '-06:00')) = CURDATE() 
    AND estado = 'completada'
    GROUP BY DATE_FORMAT(fecha, '%H')
    ORDER BY DATE_FORMAT(fecha, '%H')
  `;
} else if (periodo === "semana") {
  sql = `
    SELECT
      DATE_FORMAT(fecha, '%a %d') AS etiqueta,
      COUNT(*) AS total_ventas,
      COALESCE(SUM(total), 0) AS ingresos
    FROM ventas
    WHERE fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND estado = 'completada'
    GROUP BY DATE(fecha)
    ORDER BY DATE(fecha)
  `;
} else {
  sql = `
    SELECT
      DATE_FORMAT(fecha, '%d %b') AS etiqueta,
      COUNT(*) AS total_ventas,
      COALESCE(SUM(total), 0) AS ingresos
    FROM ventas
    WHERE fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND estado = 'completada'
    GROUP BY DATE(fecha)
    ORDER BY DATE(fecha)
  `;
}
  db.query(sql, callback);
};

const resumenPeriodo = (periodo, callback) => {
  let condicion;
  if (periodo === "dia") condicion = "DATE(fecha) = CURDATE()";
else if (periodo === "semana") condicion = "fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
else condicion = "fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)";

  const sql = `
    SELECT
      COUNT(*) AS total_tickets,
      COALESCE(SUM(total), 0) AS total_vendido,
      COALESCE(AVG(total), 0) AS ticket_promedio,
      COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END), 0) AS total_efectivo,
      COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END), 0) AS total_tarjeta
    FROM ventas
    WHERE ${condicion} AND estado = 'completada'
  `;
  db.query(sql, callback);
};

const productosEstrella = (callback) => {
  const sql = `
    SELECT
      dv.nombre_producto,
      SUM(dv.cantidad) AS cantidad_vendida,
      SUM(dv.subtotal) AS total_generado,
      COUNT(DISTINCT dv.venta_id) AS aparece_en_ventas
    FROM detalle_ventas dv
    JOIN ventas v ON dv.venta_id = v.id
    WHERE v.estado = 'completada'
    GROUP BY dv.nombre_producto
    ORDER BY cantidad_vendida DESC
    LIMIT 10
  `;
  db.query(sql, callback);
};

const cuentasPorCobrar = (callback) => {
  const sql = `
    SELECT
      id, nombre, telefono, saldo_deuda, limite_credito,
      created_at,
      ROUND((saldo_deuda / limite_credito) * 100, 1) AS porcentaje_usado
    FROM clientes
    WHERE saldo_deuda > 0 AND activo = 1
    ORDER BY saldo_deuda DESC
  `;
  db.query(sql, callback);
};

module.exports = { ventasPorPeriodo, resumenPeriodo, productosEstrella, cuentasPorCobrar };