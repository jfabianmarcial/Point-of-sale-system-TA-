const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./src/db");

const productosRoutes = require("./src/routes/productos.routes");
const inventarioRoutes = require("./src/routes/inventario.routes");
const clientesRoutes = require("./src/routes/clientes.routes");
const ventasRoutes = require("./src/routes/ventas.routes");
const corteRoutes = require("./src/routes/corte.routes");
const reportesRoutes = require("./src/routes/reportes.routes");
const authRoutes = require("./src/routes/auth.routes");
const usuariosRoutes = require("./src/routes/usuarios.routes");
const categoriasRoutes = require("./src/routes/categorias.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/productos", productosRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/clientes", clientesRoutes); 
app.use("/api/ventas", ventasRoutes);
app.use("/api/corte", corteRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/categorias", categoriasRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

