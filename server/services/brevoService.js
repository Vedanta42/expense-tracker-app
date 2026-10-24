const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({ 
    apiKey: process.env.BREVO_API_KEY 
});

const sendResetMail = async (receiverEmail, resetLink) => {
    try {
        const response = await brevo.transactionalEmails.sendTransacEmail({
            subject: "Password Reset Link - Expense Tracker",
            htmlContent: `
                <html>
                    <body>
                        <h2>Password Reset Request</h2>
                        <p>Click the link below to securely reset your password. This link will expire after one use.</p>
                        <a href="${resetLink}">Reset My Password</a>
                    </body>
                </html>
            `,
            sender: { 
                name: "Expense Tracker", 
                email: "vedanta420@gmail.com" 
            },
            to: [{ 
                email: receiverEmail 
            }]
        });
        
        return response;
    } catch (error) {
        console.error("Brevo Email Error:", error);
        throw error;
    }
};

module.exports = { sendResetMail };