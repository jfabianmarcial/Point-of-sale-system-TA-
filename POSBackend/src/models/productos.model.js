const db = require("../db");

const obtenerTodos = (callback) => {
  db.query("SELECT * FROM productos ORDER BY nombre", callback);
};

const obtenerPorId = (id, callback) => {
  db.query("SELECT * FROM productos WHERE id = ?", [id], callback);
};

const crear = (datos, callback) => {
  const { nombre, precio, categoria, stock, codigo } = datos;
  db.query(
    "INSERT INTO productos (nombre, precio, categoria, stock, codigo) VALUES (?, ?, ?, ?, ?)",
    [nombre, precio, categoria, stock, codigo],
    callback
  );
};

const actualizar = (id, datos, callback) => {
  const { nombre, precio, categoria, stock, codigo } = datos;
  db.query(
    "UPDATE productos SET nombre=?, precio=?, categoria=?, stock=?, codigo=? WHERE id=?",
    [nombre, precio, categoria, stock, codigo, id],
    callback
  );
};

const eliminar = (id, callback) => {
  db.query("DELETE FROM productos WHERE id=?", [id], callback);
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };