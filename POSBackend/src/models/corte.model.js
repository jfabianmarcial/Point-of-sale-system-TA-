const db = require("../db");

const obtenerDatosCorte = (callback) => {
  const sql = `
    SELECT
      COUNT(*) AS total_ventas,
      COALESCE(SUM(total), 0) AS total_ingresos,
      COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END), 0) AS total_efectivo,
      COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END), 0) AS total_tarjeta,
      COALESCE(AVG(total), 0) AS ticket_promedio,
      COALESCE(SUM(dv.cantidad_total), 0) AS total_productos
    FROM ventas v
    LEFT JOIN (
      SELECT venta_id, SUM(cantidad) AS cantidad_total
      FROM detalle_ventas GROUP BY venta_id
    ) dv ON v.id = dv.venta_id
    WHERE DATE(v.fecha) = CURDATE() AND v.estado = 'completada'
  `;
  db.query(sql, callback);
};

const obtenerVentasDelDia = (callback) => {
  const sql = `
    SELECT v.folio, v.cajero, v.total, v.metodo_pago, v.fecha,
           c.nombre AS cliente_nombre
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    WHERE DATE(v.fecha) = CURDATE() AND v.estado = 'completada'
    ORDER BY v.fecha DESC
  `;
  db.query(sql, callback);
};

const guardarCorte = (datos, callback) => {
  const { cajero, fecha_inicio, total_ventas, total_efectivo, total_tarjeta, total_ingresos, ticket_promedio, total_productos, notas } = datos;
  db.query(
    `INSERT INTO cortes_caja 
     (cajero, fecha_inicio, total_ventas, total_efectivo, total_tarjeta, total_ingresos, ticket_promedio, total_productos, notas)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [cajero, fecha_inicio, total_ventas, total_efectivo, total_tarjeta, total_ingresos, ticket_promedio, total_productos, notas || null],
    callback
  );
};

const obtenerHistorial = (callback) => {
  db.query("SELECT * FROM cortes_caja ORDER BY fecha_corte DESC LIMIT 30", callback);
};

module.exports = { obtenerDatosCorte, obtenerVentasDelDia, guardarCorte, obtenerHistorial };