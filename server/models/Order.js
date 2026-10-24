const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Order = sequelize.define("Order", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    paymentId: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "PENDING"
    }
}, {
    tableName: "Orders",
});

module.exports = Order;