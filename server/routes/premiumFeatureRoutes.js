const express = require("express");
const route = express.Router();
const premiumFeatureController = require("../controllers/premiumFeatureControllers");

// FIX: Destructure the specific function from your auth middleware file
const { authenticate } = require("../middleware/auth");

// Pass the destructured 'authenticate' function into the routes
route.get("/leaderboard", authenticate, premiumFeatureController.getUserLeaderboard);
route.get("/reports", authenticate, premiumFeatureController.getExpenseReports);
route.get("/download", authenticate, premiumFeatureController.downloadReport);

module.exports = route;