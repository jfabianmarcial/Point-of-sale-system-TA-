const db = require("../db");

const buscarPorEmail = (email, callback) => {
  db.query("SELECT * FROM usuarios WHERE email = ? AND activo = 1", [email], callback);
};

module.exports = { buscarPorEmail };