const express = require("express");
const route = express.Router();
const purchaseController = require("../controllers/purchaseControllers");
const { authenticate } = require("../middleware/auth");

route.get("/premiummembership", authenticate, purchaseController.purchasePremium);
route.post("/updatetransactionstatus", authenticate, purchaseController.updateTransactionStatus);

module.exports = route;