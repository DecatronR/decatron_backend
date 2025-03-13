const axios = require("axios");
const Transaction = require("../models/Transaction"); // Import the Transaction model
const { getAuthToken, MONNIFY_BASE_URL } = require("../config/monnifyConfig");

const CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
const CALLBACK_URL = process.env.CALLBACK_URL;

/**
 * @desc    Initialize a Payment Transaction
 * @route   POST /api/payments/initiate-payment
 * @access  Protected (Requires Auth)
 */
exports.initiatePayment = async (req, res) => {
  try {
    const {
      amount,
      customerName,
      customerEmail,
      paymentReference,
      paymentDescription,
    } = req.body;
    const token = await getAuthToken();

    // Save transaction to the database before calling Monnify
    const transaction = await Transaction.create({
      paymentReference,
      amount,
      customerName,
      customerEmail,
      status: "PENDING",
      paymentDescription: paymentDescription || "Real Estate Payment",
    });

    // Data to send to Monnify
    const paymentData = {
      amount,
      customerName,
      customerEmail,
      paymentReference,
      contractCode: CONTRACT_CODE,
      paymentDescription: transaction.paymentDescription,
      currencyCode: "NGN",
      redirectUrl: CALLBACK_URL,
    };

    // Send request to Monnify API
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

/**
 * @desc    Handle Payment Webhook
 * @route   POST /api/payments/webhook
 * @access  Public (Monnify Calls This)
 */
exports.webhookHandler = async (req, res) => {
  try {
    const { paymentReference, paymentStatus } = req.body;

    if (!paymentReference) {
      return res.status(400).json({ error: "Payment Reference is required" });
    }

    let updateData = { status: paymentStatus === "PAID" ? "PAID" : "FAILED" };

    // Update transaction status in the database
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { paymentReference },
      updateData,
      { new: true }
    );

    if (!updatedTransaction) {
      console.warn(`Transaction with reference ${paymentReference} not found.`);
      return res.status(404).json({ error: "Transaction not found" });
    }

    console.log(`Payment ${paymentStatus}: ${paymentReference}`);
    res.sendStatus(200); // Respond to Monnify
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

/**
 * @desc    Verify Payment Transaction
 * @route   GET /api/payments/verify-payment/:paymentReference
 * @access  Public
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentReference } = req.params;
    const token = await getAuthToken();

    // First, check the transaction in the database
    const transaction = await Transaction.findOne({ paymentReference });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // If the transaction is already marked as PAID, return it
    if (transaction.status === "PAID") {
      return res.json({ message: "Transaction already verified", transaction });
    }

    // Call Monnify API to verify the transaction
    const response = await axios.get(
      `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/query?paymentReference=${paymentReference}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // If the transaction is successful, update it in our database
    if (response.data?.responseBody?.paymentStatus === "PAID") {
      await Transaction.findOneAndUpdate(
        { paymentReference },
        { status: "PAID" },
        { new: true }
      );
    }

    res.json(response.data);
  } catch (error) {
    console.error("Payment verification error:", error.response?.data || error);
    res.status(500).json({ error: "Verification failed" });
  }
};
