const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const db = mysql.createConnection({
  host: "pearlbyyou.sytes.net",
  user: "pearl",
  password: "Pearl2025*",
  database: "pearl_store",
});

const email = "alejozd79@gmail.com";
const password = "el password"; // Esta es la contraseña en texto plano que queremos hashear Pascal año 25
const saltRounds = 10; // Nivel de seguridad del hash

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error al hashear la contraseña:", err);
    db.end();
    return;
  }

  const query = "INSERT INTO admins (email, password_hash) VALUES (?, ?)";
  db.execute(query, [email, hash], (err, result) => {
    if (err) {
      console.error("Error al insertar el administrador:", err);
    } else {
      console.log("✅ Primer administrador creado con éxito!");
      console.log("ID del administrador:", result.insertId);
    }
    db.end();
  });
});

//se ejecuta con node createAdmin.js
