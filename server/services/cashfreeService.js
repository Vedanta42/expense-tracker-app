const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(CFEnvironment.SANDBOX, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);

const createOrder = async (orderId, orderAmount, customerDetails) => {
    const request = {
        order_amount: orderAmount,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
            customer_id: customerDetails.id.toString(),
            customer_phone: "9999999999"
        },
        order_meta: {
            return_url: "http://localhost:3000/dashboard.html" 
        }
    };

    try {
        const response = await cashfree.PGCreateOrder(request);
        return response.data; 
    } catch (error) {
        console.error("Cashfree Create Order Error:", error.response?.data || error.message);
        throw error;
    }
};

const verifyPayment = async (orderId) => {
    try {
        // Single parameter used here as well
        const response = await cashfree.PGOrderFetchPayments(orderId);
        let getOrderResponse = response.data; 
        let orderStatus;

        if (getOrderResponse.filter(transaction => transaction.payment_status === "SUCCESS").length > 0) {
            orderStatus = "Success";
        } else if (getOrderResponse.filter(transaction => transaction.payment_status === "PENDING").length > 0) {
            orderStatus = "Pending";
        } else {
            orderStatus = "Failure";
        }

        return orderStatus; 
    } catch (error) {
        console.error("Cashfree Fetch Payment Error:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = { createOrder, verifyPayment };