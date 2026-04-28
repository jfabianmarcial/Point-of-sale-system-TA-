const express = require("express");
const router = express.Router();
const { getMovimientos, getAlertas, getProveedores, createMovimiento } = require("../controllers/inventario.controller");
const verificarToken = require("../middleware/auth.middleware");
const { soloAdmin } = require("../middleware/roles.middleware");

router.get("/movimientos", verificarToken, getMovimientos);
router.get("/alertas", verificarToken, getAlertas);
router.get("/proveedores", verificarToken, getProveedores);
router.post("/movimientos", verificarToken, soloAdmin, createMovimiento);

module.exports = router;