const User = require('../models/User');
const Expense = require('../models/Expense');
const DownloadedFile = require('../models/DownloadedFile');
const s3Service = require('../services/s3Service');

// Leaderboard logic (preserved to ensure existing features do not break)
const getPremiumLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: ['id', 'name', 'total_expenses'],
            order: [['total_expenses', 'DESC']]
        });
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const downloadReport = async (req, res) => {
    try {
        // 1. Premium Validation Check
        const user = await User.findByPk(req.userId);
        if (!user || user.isPremiumUser !== true) {
            return res.status(401).json({ message: "Unauthorized. Premium feature only." });
        }

        // 2. Fetch all expenses for this user
        const expenses = await Expense.findAll({ where: { UserId: req.userId } });
        
        // 3. Stringify the data for the text file
        const stringifiedExpenses = JSON.stringify(expenses);
        
        // 4. Create a dynamic filename to prevent S3 overwrites
        const filename = `Expenses_UserID_${req.userId}/${new Date().getTime()}.txt`;
        
        // 5. Upload to S3 (Awaiting the Promise)
        const fileURL = await s3Service.uploadToS3(stringifiedExpenses, filename);
        
        // 6. Save the resulting URL to our database to track history
        await DownloadedFile.create({
            fileUrl: fileURL,
            UserId: req.userId
        });
        
        // 7. Send the URL back to the frontend
        res.status(200).json({ fileURL, success: true });

    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

const getDownloadHistory = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user || user.isPremiumUser !== true) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const history = await DownloadedFile.findAll({ 
            where: { UserId: req.userId },
            order: [['downloadDate', 'DESC']]
        });

        res.status(200).json({ history, success: true });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { 
    getPremiumLeaderboard,
    downloadReport, 
    getDownloadHistory 
};