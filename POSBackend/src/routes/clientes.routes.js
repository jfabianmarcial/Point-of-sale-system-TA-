const express = require("express");
const router = express.Router();
const { getClientes, getResumen, getCliente, getAbonos, createCliente, updateCliente, abonar, fiar, deleteCliente } = require("../controllers/clientes.controller");
const verificarToken = require("../middleware/auth.middleware");
const { soloAdmin } = require("../middleware/roles.middleware");

router.get("/", verificarToken, getClientes);
router.get("/resumen", verificarToken, getResumen);
router.get("/:id", verificarToken, getCliente);
router.get("/:id/abonos", verificarToken, getAbonos);
router.post("/", verificarToken, soloAdmin, createCliente);
router.put("/:id", verificarToken, soloAdmin, updateCliente);
router.post("/:id/abonar", verificarToken, abonar);
router.post("/:id/fiar", verificarToken, fiar);
router.delete("/:id", verificarToken, soloAdmin, deleteCliente);

module.exports = router;