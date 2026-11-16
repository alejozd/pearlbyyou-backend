module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cliente_nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cliente_whatsapp: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM("pendiente", "completado"),
        defaultValue: "pendiente",
        allowNull: false,
      },
      detalles: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      underscored: true,
    }
  );

  return Order;
};
