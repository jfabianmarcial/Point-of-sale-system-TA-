const Producto = require("../models/productos.model");

const getProductos = (req, res) => {
  Producto.obtenerTodos((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getProducto = (req, res) => {
  Producto.obtenerPorId(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(results[0]);
  });
};

const createProducto = (req, res) => {
  const { nombre, precio, categoria, stock, codigo } = req.body;
  if (!nombre || !precio || !stock || !codigo) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  Producto.crear(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...req.body });
  });
};

const updateProducto = (req, res) => {
  Producto.actualizar(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, mensaje: "Producto actualizado" });
  });
};

const deleteProducto = (req, res) => {
  Producto.eliminar(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, mensaje: "Producto eliminado" });
  });
};

module.exports = { getProductos, getProducto, createProducto, updateProducto, deleteProducto };