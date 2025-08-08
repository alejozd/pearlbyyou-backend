const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "tu_usuario_mysql", // ej: 'root'
  password: "tu_contraseña", // tu contraseña
  database: "tienda_bolsos",
});

connection.connect((err) => {
  if (err) {
    console.error("Error conectando a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL");
});

module.exports = connection;
