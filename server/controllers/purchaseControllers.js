const Order = require("../models/Order");
const User = require("../models/User");
const cashfreeService = require("../services/cashfreeService");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/database"); // Required for transactions

const purchasePremium = async (req, res) => {
    // Single queries don't strictly require a transaction, but it is safe practice
    try {
        const orderId = `ORDER_${req.userId}_${Date.now()}`;
        const amount = 500; 

        await Order.create({ 
            orderId: orderId, 
            status: "PENDING", 
            UserId: req.userId 
        });

        const cfResponse = await cashfreeService.createOrder(orderId, amount, {
            id: req.userId
        });

        res.status(201).json({ 
            payment_session_id: cfResponse.payment_session_id, 
            order_id: orderId 
        });

    } catch (error) {
        console.error("Purchase Premium Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const updateTransactionStatus = async (req, res) => {
    const { order_id } = req.body;
    
    // 1. Initialize transaction
    const t = await sequelize.transaction();
    
    try {
        // AI/External API calls should always happen BEFORE the transaction starts
        const status = await cashfreeService.verifyPayment(order_id);
        
        // 2. Pass transaction object
        const order = await Order.findOne({ where: { orderId: order_id }, transaction: t });

        if (status === "Success") {
            // 3. Link multiple updates to the same transaction
            await order.update({ status: "SUCCESSFUL" }, { transaction: t });
            await User.update({ isPremiumUser: true }, { where: { id: req.userId }, transaction: t });
            
            // 4. Commit transaction before responding
            await t.commit();

            const token = jwt.sign(
                { userId: req.userId, isPremiumUser: true }, 
                process.env.JWT_SECRET
            );
            
            return res.status(200).json({ 
                message: "Transaction successful", 
                token: token,
                isPremiumUser: true
            });
        } else if (status === "Pending") {
            await t.rollback(); // Rollback if pending as we didn't alter db
            return res.status(202).json({ message: "Transaction pending" });
        } else {
            await order.update({ status: "FAILED" }, { transaction: t });
            await t.commit(); // Commit the FAILED status update
            return res.status(400).json({ message: "TRANSACTION FAILED" });
        }
    } catch (error) {
        // 5. Rollback on failure
        await t.rollback();
        console.error("Verify Transaction Error:", error);
        
        // Attempt a fallback failure update without throwing another error
        try {
            const order = await Order.findOne({ where: { orderId: order_id } });
            if (order) await order.update({ status: "FAILED" });
        } catch (fallbackError) {
             console.error("Critical fallback update failed:", fallbackError);
        }
        
        res.status(500).json({ message: "Transaction verification failed" });
    }
};

module.exports = { purchasePremium, updateTransactionStatus };