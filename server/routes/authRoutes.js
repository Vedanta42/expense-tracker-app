const express = require("express");
const route = express.Router();

const authController = require("../controllers/authControllers");

route.post("/signup",authController.addUser);
route.post("/login",authController.login);


module.exports = route;