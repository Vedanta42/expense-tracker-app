const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const DownloadedFile = sequelize.define("DownloadedFile", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    downloadDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "DownloadedFiles",
});

module.exports = DownloadedFile;