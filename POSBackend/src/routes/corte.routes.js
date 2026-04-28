const express = require("express");
const router = express.Router();
const { getDatosCorte, getHistorial, realizarCorte } = require("../controllers/corte.controller");
const verificarToken = require("../middleware/auth.middleware");
const { soloAdmin } = require("../middleware/roles.middleware");

router.get("/", verificarToken, soloAdmin, getDatosCorte);
router.get("/historial", verificarToken, soloAdmin, getHistorial);
router.post("/realizar", verificarToken, soloAdmin, realizarCorte);

module.exports = router;