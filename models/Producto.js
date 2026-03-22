module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define(
    "Producto",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      disponible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      creado_en: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "creado_en",
      },
      actualizado_en: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "actualizado_en",
      },
    },
    {
      tableName: "productos",
      timestamps: true,
      createdAt: "creado_en",
      updatedAt: "actualizado_en",
    }
  );

  // Asociación con el modelo ImagenProducto
  Producto.associate = (models) => {
    Producto.hasMany(models.ImagenProducto, {
      foreignKey: "producto_id",
      as: "imagenes",
    });
  };

  return Producto;
};
