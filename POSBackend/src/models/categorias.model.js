const db = require("../db");

const obtenerTodas = (callback) => {
  db.query("SELECT * FROM categorias WHERE activo = 1 ORDER BY nombre", callback);
};

const crear = (nombre, callback) => {
  db.query("INSERT INTO categorias (nombre) VALUES (?)", [nombre], callback);
};

module.exports = { obtenerTodas, crear };