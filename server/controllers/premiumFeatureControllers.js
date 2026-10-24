const User = require("../models/User");
const Expense = require("../models/Expense");
const sequelize = require("../config/database");
const { Op } = require("sequelize");

const getUserLeaderboard = async (req, res) => {
    try {
        const leaderboardData = await User.findAll({
            attributes: ['id', 'name', 'total_expenses'],
            order: [['total_expenses', 'DESC']]
        });
        res.status(200).json(leaderboardData);
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getExpenseReports = async (req, res) => {
    try {
        const { timeframe } = req.query;
        let dateFilter = {};
        const now = new Date();

        if (timeframe === "daily") {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            dateFilter = { createdAt: { [Op.gte]: startOfDay } };
        } else if (timeframe === "weekly") {
            const startOfWeek = new Date(now.setDate(now.getDate() - 7));
            dateFilter = { createdAt: { [Op.gte]: startOfWeek } };
        } else if (timeframe === "monthly") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { createdAt: { [Op.gte]: startOfMonth } };
        }

        const expenses = await Expense.findAll({
            where: {
                UserId: req.userId,
                ...dateFilter
            },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ expenses });
    } catch (error) {
        console.error("Report Fetch Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const downloadReport = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: { UserId: req.userId },
            order: [['createdAt', 'DESC']]
        });

        let total = 0;

        const expenseRows = expenses.map(exp => {
            total += Number(exp.amount);
            const date = new Date(exp.createdAt).toLocaleDateString();
            
            // Pad each column to a fixed character width using spaces
            const colDate = date.padEnd(15, ' ');
            const colCategory = String(exp.category).padEnd(20, ' ');
            const colAmount = String(exp.amount).padEnd(12, ' ');
            const colDesc = String(exp.description);

            return `${colDate}${colCategory}${colAmount}${colDesc}`;
        }).join('\n');

        // Align the headers using the exact same spacing
        const headerDate = "Date".padEnd(15, ' ');
        const headerCategory = "Category".padEnd(20, ' ');
        const headerAmount = "Amount".padEnd(12, ' ');
        const headerDesc = "Description";
        
        // Pad the total label to match the combined width of Date (15) + Category (20)
        const totalLabel = "Total Expenses:".padEnd(35, ' ');
        
        const fileContent = `Expense Report
===============================================================

${headerDate}${headerCategory}${headerAmount}${headerDesc}
---------------------------------------------------------------
${expenseRows || "No expenses recorded."}
---------------------------------------------------------------
${totalLabel}${total}
`;

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename="Expense_Report.txt"');
        
        res.status(200).send(fileContent);
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Failed to generate report" });
    }
};

module.exports = { getUserLeaderboard, getExpenseReports, downloadReport };