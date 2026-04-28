const express = require("express");
const router = express.Router();
const { getVentas, getProductosEstrella, getCuentasPorCobrar } = require("../controllers/reportes.controller");
const verificarToken = require("../middleware/auth.middleware");
const { soloAdmin } = require("../middleware/roles.middleware");

router.get("/ventas", verificarToken, soloAdmin, getVentas);
router.get("/productos-estrella", verificarToken, soloAdmin, getProductosEstrella);
router.get("/cuentas-por-cobrar", verificarToken, soloAdmin, getCuentasPorCobrar);

module.exports = router;