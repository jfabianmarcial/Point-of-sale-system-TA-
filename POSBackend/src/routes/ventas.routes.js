const express = require("express");
const router = express.Router();
const { getVentas, getVenta, getResumen, getFolio, createVenta, cancelarVenta, getDashboard } = require("../controllers/ventas.controller");
const verificarToken = require("../middleware/auth.middleware");
const { soloAdmin } = require("../middleware/roles.middleware");

router.get("/", verificarToken, getVentas);
router.get("/resumen", verificarToken, getResumen);
router.get("/folio", verificarToken, getFolio);
router.get("/dashboard", verificarToken, getDashboard);
router.get("/:id", verificarToken, getVenta);
router.post("/", verificarToken, createVenta);
router.put("/:id/cancelar", verificarToken, soloAdmin, cancelarVenta);

module.exports = router;