const express = require("express");
const premiumFeatureControllers = require("../controllers/premiumFeatureControllers");
const userAuthentication = require("../middleware/auth"); 

const router = express.Router();

router.get("/leaderboard", userAuthentication.authenticate, premiumFeatureControllers.getPremiumLeaderboard);
router.get("/download", userAuthentication.authenticate, premiumFeatureControllers.downloadReport);
router.get("/download-history", userAuthentication.authenticate, premiumFeatureControllers.getDownloadHistory);

module.exports = router;