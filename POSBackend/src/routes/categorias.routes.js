const express = require("express");
const router = express.Router();
const { getCategorias, createCategoria } = require("../controllers/categorias.controller");
const verificarToken = require("../middleware/auth.middleware");
const { soloAdmin } = require("../middleware/roles.middleware");

router.get("/", verificarToken, getCategorias);
router.post("/", verificarToken, soloAdmin, createCategoria);

module.exports = router;