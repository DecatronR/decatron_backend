const axios = require("axios");
const { getAuthToken, MONNIFY_BASE_URL } = require("../config/monnifyConfig");

const CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
const CALLBACK_URL = process.env.CALLBACK_URL;

// Initialize a Payment Transaction
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, customerName, customerEmail, paymentReference } = req.body;
    const token = await getAuthToken();

    const paymentData = {
      amount,
      customerName,
      customerEmail,
      paymentReference,
      contractCode: CONTRACT_CODE,
      paymentDescription: "Real Estate Payment",
      currencyCode: "NGN",
      redirectUrl: CALLBACK_URL,
    };

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/initiate`,
      paymentData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Payment initiation error:", error.response?.data || error);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};

// Handle Payment Webhook
exports.webhookHandler = async (req, res) => {
  try {
    const { paymentReference, paymentStatus } = req.body;

    if (paymentStatus === "PAID") {
      console.log(`Payment successful: ${paymentReference}`);
      // Update transaction status in your database (if using a model)
    } else {
      console.log(`Payment failed: ${paymentReference}`);
    }

    res.sendStatus(200); // Acknowledge webhook receipt
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
};

// Verify Payment Transaction
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentReference } = req.params;
    const token = await getAuthToken();

    const response = await axios.get(
      `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/query?paymentReference=${paymentReference}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Payment verification error:", error.response?.data || error);
    res.status(500).json({ error: "Verification failed" });
  }
};
