const Venta = require("../models/ventas.model");

const getVentas = (req, res) => {
  Venta.obtenerTodas((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getVenta = (req, res) => {
  Venta.obtenerPorId(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result) return res.status(404).json({ error: "Venta no encontrada" });
    res.json(result);
  });
};

const getResumen = (req, res) => {
  Venta.obtenerResumen((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

const getFolio = (req, res) => {
  Venta.generarFolio((err, folio) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ folio });
  });
};

const createVenta = (req, res) => {
  const { detalle, total } = req.body;
  if (!detalle || detalle.length === 0) return res.status(400).json({ error: "El carrito está vacío" });
  if (!total || total <= 0) return res.status(400).json({ error: "Total inválido" });

  Venta.generarFolio((err, folio) => {
    if (err) return res.status(500).json({ error: err.message });
    Venta.crear({ ...req.body, folio }, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, ...result });
    });
  });
};

const cancelarVenta = (req, res) => {
  Venta.cancelar(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

const getDashboard = (req, res) => {
  Venta.obtenerDashboard((err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
};

module.exports = { getVentas, getVenta, getResumen, getFolio, createVenta, cancelarVenta, getDashboard };