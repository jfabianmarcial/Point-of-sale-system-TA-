const express = require("express");
const router = express.Router();
const { login, verificar } = require("../controllers/auth.controller");

router.post("/login", login);
router.get("/verificar", verificar);

module.exports = router;