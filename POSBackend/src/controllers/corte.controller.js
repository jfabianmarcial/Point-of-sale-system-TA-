const Corte = require("../models/corte.model");

const getDatosCorte = (req, res) => {
  Corte.obtenerDatosCorte((err, resumen) => {
    if (err) return res.status(500).json({ error: err.message });
    Corte.obtenerVentasDelDia((err, ventas) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ resumen: resumen[0], ventas });
    });
  });
};

const getHistorial = (req, res) => {
  Corte.obtenerHistorial((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const realizarCorte = (req, res) => {
  Corte.obtenerDatosCorte((err, resumen) => {
    if (err) return res.status(500).json({ error: err.message });
    const datos = {
      cajero: req.body.cajero || "Cajero",
      fecha_inicio: req.body.fecha_inicio || new Date().toISOString().split("T")[0] + " 00:00:00",
      notas: req.body.notas || null,
      ...resumen[0],
    };
    Corte.guardarCorte(datos, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, id: result.insertId });
    });
  });
};

module.exports = { getDatosCorte, getHistorial, realizarCorte };