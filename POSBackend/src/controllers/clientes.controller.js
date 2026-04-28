const Cliente = require("../models/clientes.model");

const getClientes = (req, res) => {
  Cliente.obtenerTodos((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getResumen = (req, res) => {
  Cliente.obtenerResumen((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

const getCliente = (req, res) => {
  Cliente.obtenerPorId(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(results[0]);
  });
};

const getAbonos = (req, res) => {
  Cliente.obtenerAbonos(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const createCliente = (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es requerido" });
  Cliente.crear(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...req.body });
  });
};

const updateCliente = (req, res) => {
  Cliente.actualizar(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

const abonar = (req, res) => {
  const { monto, nota } = req.body;
  if (!monto || monto <= 0) return res.status(400).json({ error: "Monto inválido" });
  Cliente.registrarAbono(req.params.id, monto, nota, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

const deleteCliente = (req, res) => {
  Cliente.eliminar(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

const fiar = (req, res) => {
  const { monto, nota } = req.body;
  console.log("Datos recibidos:", req.params.id, monto, nota); // <- agrega esta línea
  if (!monto || monto <= 0) return res.status(400).json({ error: "Monto inválido" });
  Cliente.agregarDeuda(req.params.id, monto, nota, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

module.exports = { getClientes, getResumen, getCliente, getAbonos, createCliente, updateCliente, abonar, fiar, deleteCliente };