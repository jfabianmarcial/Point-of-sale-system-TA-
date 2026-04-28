const db = require("../db");
const bcrypt = require("bcryptjs");

const obtenerTodos = (callback) => {
  db.query(
    "SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY created_at DESC",
    callback
  );
};

const crear = (datos, callback) => {
  const { nombre, email, password, rol } = datos;
  const hash = bcrypt.hashSync(password, 10);
  db.query(
    "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
    [nombre, email, hash, rol || "cajero"],
    callback
  );
};

const cambiarEstado = (id, activo, callback) => {
  db.query("UPDATE usuarios SET activo = ? WHERE id = ?", [activo, id], callback);
};

const cambiarPassword = (id, password, callback) => {
  const hash = bcrypt.hashSync(password, 10);
  db.query("UPDATE usuarios SET password = ? WHERE id = ?", [hash, id], callback);
};

module.exports = { obtenerTodos, crear, cambiarEstado, cambiarPassword };