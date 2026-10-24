require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const sequelize = require("./config/database");
const authRoute = require("./routes/authRoutes");
const expenseRoute = require("./routes/expenseRoutes");
const purchaseRoute = require("./routes/purchaseRoutes"); 
const premiumFeatureRoute = require("./routes/premiumFeatureRoutes"); 
const passwordRoute = require("./routes/passwordRoutes");

const User = require("./models/User");
const Expense = require("./models/Expense");
const Order = require("./models/Order"); 
const ForgotPasswordRequest = require("./models/ForgotPasswordRequests"); // Added

const app = express();

// Database Associations
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordRequest); // Added
ForgotPasswordRequest.belongsTo(User); // Added

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/user", authRoute);
app.use("/expense", expenseRoute);
app.use("/purchase", purchaseRoute); 
app.use("/premium", premiumFeatureRoute); 
app.use("/password", passwordRoute); 

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.sync();
        console.log("Database connected successfully!");
        
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}/login.html`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
    }
};

startServer();