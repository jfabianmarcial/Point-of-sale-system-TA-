const db = require("../db");

const obtenerTodos = (callback) => {
  const sql = `
    SELECT c.*,
      CASE WHEN c.saldo_deuda > 0 THEN 'pendiente' ELSE 'al_corriente' END AS estado
    FROM clientes c
    WHERE c.activo = 1
    ORDER BY c.nombre
  `;
  db.query(sql, callback);
};

const obtenerResumen = (callback) => {
  const sql = `
    SELECT
      COUNT(*) AS total_clientes,
      SUM(saldo_deuda) AS total_deuda,
      SUM(CASE WHEN es_vip = 1 THEN 1 ELSE 0 END) AS total_vip,
      SUM(CASE WHEN saldo_deuda > 0 THEN 1 ELSE 0 END) AS clientes_con_deuda
    FROM clientes WHERE activo = 1
  `;
  db.query(sql, callback);
};

const obtenerPorId = (id, callback) => {
  db.query("SELECT * FROM clientes WHERE id = ?", [id], callback);
};

const obtenerAbonos = (cliente_id, callback) => {
  db.query(
    "SELECT * FROM abonos WHERE cliente_id = ? ORDER BY fecha DESC",
    [cliente_id],
    callback
  );
};

const crear = (datos, callback) => {
  const { nombre, telefono, direccion, limite_credito, es_vip } = datos;
  db.query(
    "INSERT INTO clientes (nombre, telefono, direccion, limite_credito, es_vip) VALUES (?, ?, ?, ?, ?)",
    [nombre, telefono, direccion, limite_credito || 500, es_vip || false],
    callback
  );
};

const actualizar = (id, datos, callback) => {
  const { nombre, telefono, direccion, limite_credito, es_vip } = datos;
  db.query(
    "UPDATE clientes SET nombre=?, telefono=?, direccion=?, limite_credito=?, es_vip=? WHERE id=?",
    [nombre, telefono, direccion, limite_credito, es_vip, id],
    callback
  );
};

const registrarAbono = (cliente_id, monto, nota, callback) => {
  db.query("SELECT saldo_deuda FROM clientes WHERE id = ?", [cliente_id], (err, results) => {
    if (err) return callback(err);
    const saldo_actual = parseFloat(results[0].saldo_deuda);
    const nuevo_saldo = Math.max(0, saldo_actual - parseFloat(monto));

    db.query("UPDATE clientes SET saldo_deuda = ? WHERE id = ?", [nuevo_saldo, cliente_id], (err) => {
      if (err) return callback(err);
      db.query(
        "INSERT INTO abonos (cliente_id, monto, nota) VALUES (?, ?, ?)",
        [cliente_id, monto, nota || null],
        callback
      );
    });
  });
};

const eliminar = (id, callback) => {
  db.query("UPDATE clientes SET activo = 0 WHERE id = ?", [id], callback);
};

const agregarDeuda = (cliente_id, monto, nota, callback) => {
  db.query("SELECT saldo_deuda FROM clientes WHERE id = ?", [cliente_id], (err, results) => {
    if (err) return callback(err);
    const saldo_actual = parseFloat(results[0].saldo_deuda);
    const nuevo_saldo = saldo_actual + parseFloat(monto);

    db.query("UPDATE clientes SET saldo_deuda = ? WHERE id = ?", [nuevo_saldo, cliente_id], (err) => {
      if (err) return callback(err);
      db.query(
        "INSERT INTO abonos (cliente_id, monto, nota) VALUES (?, ?, ?)",
        [cliente_id, monto, nota || "Fiado"],
        callback
      );
    });
  });
};

module.exports = { obtenerTodos, obtenerResumen, obtenerPorId, obtenerAbonos, crear, actualizar, registrarAbono, agregarDeuda, eliminar };