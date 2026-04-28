const Reporte = require("../models/reportes.model");

const getVentas = (req, res) => {
  const periodo = req.query.periodo || "semana";
  Reporte.ventasPorPeriodo(periodo, (err, grafica) => {
    if (err) return res.status(500).json({ error: err.message });
    Reporte.resumenPeriodo(periodo, (err, resumen) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ grafica, resumen: resumen[0] });
    });
  });
};

const getProductosEstrella = (req, res) => {
  Reporte.productosEstrella((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getCuentasPorCobrar = (req, res) => {
  Reporte.cuentasPorCobrar((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

module.exports = { getVentas, getProductosEstrella, getCuentasPorCobrar };