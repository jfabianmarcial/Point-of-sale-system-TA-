const express = require("express");
const router = express.Router();
const { getUsuarios, createUsuario, toggleEstado, resetPassword } = require("../controllers/usuarios.controller");
const verificarToken = require("../middleware/auth.middleware");
const { soloAdmin } = require("../middleware/roles.middleware");

router.get("/", verificarToken, soloAdmin, getUsuarios);
router.post("/", verificarToken, soloAdmin, createUsuario);
router.put("/:id/estado", verificarToken, soloAdmin, toggleEstado);
router.put("/:id/password", verificarToken, soloAdmin, resetPassword);

module.exports = router;