const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");

const Expense = sequelize.define("Expense", {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    amount:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    category:{
        type: DataTypes.STRING,
        allowNull: false
    },
    note: { // NEW COLUMN
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    tableName: "Expenses",
});

module.exports = Expense;