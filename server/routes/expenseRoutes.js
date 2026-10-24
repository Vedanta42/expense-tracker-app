const express = require("express");
const route = express.Router();

const expenseController = require("../controllers/expenseControllers");
const {authenticate} = require('../middleware/auth')

route.post("/add", authenticate, expenseController.addExpense);
route.get("/get-expenses", authenticate, expenseController.getExpenses);
// Add the DELETE route parameterized with the expense ID
route.delete("/delete-expense/:id", authenticate, expenseController.deleteExpense);

module.exports = route;