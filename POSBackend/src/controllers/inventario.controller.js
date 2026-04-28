const Inventario = require("../models/inventario.model");

const getMovimientos = (req, res) => {
  Inventario.obtenerMovimientos((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getAlertas = (req, res) => {
  Inventario.obtenerAlertas((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

const getProveedores = (req, res) => {
  Inventario.obtenerProveedores((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const createMovimiento = (req, res) => {
  const { producto_id, tipo, cantidad } = req.body;
  if (!producto_id || !tipo || !cantidad) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  Inventario.registrarMovimiento(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: result.insertId });
  });
};

module.exports = { getMovimientos, getAlertas, getProveedores, createMovimiento };