const Categoria = require("../models/categorias.model");

const getCategorias = (req, res) => {
  Categoria.obtenerTodas((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const createCategoria = (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "Nombre requerido" });
  Categoria.crear(nombre, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ error: "La categoría ya existe" });
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, nombre });
  });
};

module.exports = { getCategorias, createCategoria };