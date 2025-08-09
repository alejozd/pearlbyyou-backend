const fs = require("fs");
const path = require("path");
const sequelize = require("../config/database");
const basename = path.basename(__filename);
const db = {};

// Cargar modelos
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      require("sequelize").DataTypes
    );
    db[model.name] = model;
  });

// Establecer asociaciones
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sincronizar (solo en desarrollo)
// sequelize.sync({ alter: true }); // ¡Cuidado en producción!

db.sequelize = sequelize;
module.exports = db;
