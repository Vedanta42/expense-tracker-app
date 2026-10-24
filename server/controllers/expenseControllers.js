const Expense = require("../models/Expense");
const User = require("../models/User");
const sequelize = require("../config/database");
const geminiService = require("../services/geminiService"); 

const addExpense = async (req, res) => {
    // NEW: Extract note from req.body
    const { amount, description, category, note } = req.body;
    let finalCategory = category;

    if (!finalCategory || finalCategory === "auto") {
        finalCategory = await geminiService.categorizeExpense(description);
    }

    const t = await sequelize.transaction();

    try {
        await Expense.create(
            // NEW: Add note to the creation payload
            { amount, description, category: finalCategory, note, UserId: req.userId },
            { transaction: t }
        );

        const user = await User.findByPk(req.userId, { transaction: t });
        user.total_expenses += Number(amount);
        await user.save({ transaction: t });

        await t.commit();
        res.status(201).json({ message: `Expense added as ${finalCategory}` });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        if (limit > 100) limit = 100;
        
        const offset = (page - 1) * limit;

        const expensesData = await Expense.findAndCountAll({ 
            where: { UserId: req.userId },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']] 
        });

        const totalExpenses = expensesData.count;
        const lastPage = Math.ceil(totalExpenses / limit);

        res.status(200).json({ 
            expenses: expensesData.rows,
            currentPage: page,
            hasNextPage: page < lastPage,
            nextPage: page + 1,
            hasPreviousPage: page > 1,
            previousPage: page - 1,
            lastPage: lastPage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteExpense = async (req, res) => {
    const expenseId = req.params.id;
    const t = await sequelize.transaction();

    try {
        const expense = await Expense.findOne({ 
            where: { id: expenseId, UserId: req.userId }, 
            transaction: t 
        });
        
        if (!expense) {
            await t.rollback();
            return res.status(404).json({ message: "Expense not found" });
        }

        const user = await User.findByPk(req.userId, { transaction: t });
        user.total_expenses -= Number(expense.amount);
        await user.save({ transaction: t });

        await expense.destroy({ transaction: t });
        
        await t.commit();
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        await t.rollback();
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { addExpense, getExpenses, deleteExpense };