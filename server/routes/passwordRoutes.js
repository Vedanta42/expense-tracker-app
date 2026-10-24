const express = require("express");
const route = express.Router();
const passwordController = require("../controllers/passwordControllers");

route.post("/forgotpassword", passwordController.forgotPassword);
route.get("/resetpassword/:id", passwordController.resetPasswordForm);
route.post("/updatepassword/:id", passwordController.updatePassword);

module.exports = route;