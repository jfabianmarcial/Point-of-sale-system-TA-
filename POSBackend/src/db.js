const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
 
  port: process.env.DB_PORT, 
 
  ssl: {
    rejectUnauthorized: false
  }
});

connection.connect((err) => {
  if (err) {
    // Si ves este error, revisa que tu IP esté permitida o los datos del .env
    console.error("Error conectando a Aiven (MySQL):", err.message);
    return;
  }
  console.log("Conectado a la base de datos en la nube correctamente");
});

module.exports = connection;