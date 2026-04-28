const Usuario = require("../models/usuarios.model");

const getUsuarios = (req, res) => {
  Usuario.obtenerTodos((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const createUsuario = (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: "Nombre, email y contraseña son requeridos" });
  Usuario.crear(req.body, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ error: "El email ya está registrado" });
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ success: true, id: result.insertId });
  });
};

const toggleEstado = (req, res) => {
  const { activo } = req.body;
  Usuario.cambiarEstado(req.params.id, activo, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

const resetPassword = (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Contraseña requerida" });
  Usuario.cambiarPassword(req.params.id, password, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

module.exports = { getUsuarios, createUsuario, toggleEstado, resetPassword };