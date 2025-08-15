module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define(
    "Setting",
    {
      // La clave de la configuración (ej. 'about_us_title', 'footer_text')
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true, // 'key' será la clave primaria
      },
      // El valor o contenido de la configuración (el texto real)
      value: {
        type: DataTypes.TEXT, // Usamos TEXT para permitir contenido largo
        allowNull: false,
      },
    },
    {
      tableName: "settings", // Nombre real de la tabla en la base de datos
      timestamps: true, // Habilita createdAt y updatedAt
      underscored: true, // Usa snake_case (created_at, updated_at) en la DB
    }
  );

  // No hay asociaciones para el modelo Setting, ya que es una tabla de configuración simple

  return Setting;
};
