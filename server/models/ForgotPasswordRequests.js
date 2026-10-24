const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ForgotPasswordRequest = sequelize.define("ForgotPasswordRequest", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: "ForgotPasswordRequests",
});

module.exports = ForgotPasswordRequest;