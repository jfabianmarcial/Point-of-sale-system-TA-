const express = require("express");
const router = express.Router();
const { getProductos, getProducto, createProducto, updateProducto, deleteProducto } = require("../controllers/productos.controller");
const verificarToken = require("../middleware/auth.middleware");
const { soloAdmin } = require("../middleware/roles.middleware");

router.get("/", verificarToken, getProductos);
router.get("/:id", verificarToken, getProducto);
router.post("/", verificarToken, soloAdmin, createProducto);
router.put("/:id", verificarToken, soloAdmin, updateProducto);
router.delete("/:id", verificarToken, soloAdmin, deleteProducto);

module.exports = router;