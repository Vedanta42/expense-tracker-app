const crypto = require('crypto'); // Replaced uuid with native crypto
const bcrypt = require('bcrypt');
const path = require('path');
const User = require("../models/User");
const ForgotPasswordRequest = require("../models/ForgotPasswordRequests");
const brevoService = require("../services/brevoService");
const sequelize = require("../config/database");

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const t = await sequelize.transaction();

    try {
        const user = await User.findOne({ where: { email }, transaction: t });
        
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: "User with this email does not exist." });
        }

        // Use the native Node.js UUID generator
        const id = crypto.randomUUID(); 
        
        await ForgotPasswordRequest.create({ id, UserId: user.id }, { transaction: t });
        
        const resetLink = `http://localhost:${process.env.PORT || 3000}/password/resetpassword/${id}`;
        
        await brevoService.sendResetMail(email, resetLink);
        
        await t.commit();
        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error) {
        await t.rollback();
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Internal server error while processing request." });
    }
};

const resetPasswordForm = async (req, res) => {
    const id = req.params.id;

    try {
        const resetRequest = await ForgotPasswordRequest.findOne({ where: { id, isActive: true } });
        
        if (!resetRequest) {
            return res.status(401).send(`
                <html><body>
                    <h2>Link Expired or Invalid</h2>
                    <p>This password reset link has already been used or does not exist.</p>
                </body></html>
            `);
        }

        res.status(200).sendFile(path.join(__dirname, "../../public/reset-password.html"));
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};

const updatePassword = async (req, res) => {
    const id = req.params.id;
    const { newPassword } = req.body;
    
    const t = await sequelize.transaction();

    try {
        const resetRequest = await ForgotPasswordRequest.findOne({ where: { id, isActive: true }, transaction: t });
        
        if (!resetRequest) {
            await t.rollback();
            return res.status(401).json({ message: "Link has expired or is invalid." });
        }

        const user = await User.findByPk(resetRequest.UserId, { transaction: t });
        
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: "User not found." });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await user.update({ password: hashedPassword }, { transaction: t });
        await resetRequest.update({ isActive: false }, { transaction: t });

        await t.commit();
        res.status(200).json({ message: "Password updated successfully." });

    } catch (error) {
        await t.rollback();
        console.error("Update Password Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { forgotPassword, resetPasswordForm, updatePassword };