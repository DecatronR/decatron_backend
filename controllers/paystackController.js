const axios = require("axios");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { validationResult } = require("express-validator");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const initializePayment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { email, amount, subscriptionPlanID } = req.body;
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Convert to kobo
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
    const userdb = await User.findOne({ email });
    if (!userdb) {
      return res.status(404).json({
        responseMessage: `User with email ${email} not found on our system`,
        responseCode: 404,
      });
    }
    const transaction = await Transaction.create({
      userId: userdb._id,
      subscriptionPlanID: subscriptionPlanID,
      paymentReference: response.data.data.reference,
      amount,
      customerName: userdb.name,
      customerEmail: email,
      status: "PENDING",
      paymentDescription: "Payment for subscription plan",
    });
    // console.log(subscriptionPlanID);
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Transaction initialized successfully",
      data: response.data.data,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({
      responseCode: 500,
      responseMessage: "Payment initialization failed",
      data: error.response?.data || error.message,
    });
  }
};

const verifyPayment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }
  const { referenceId } = req.body;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );
    const status = response.data.data.status;
    const userdb = await Transaction.findOne({ paymentReference: referenceId });
    const getSubscriptionLifeSpan = await SubscriptionPlan.findOne({
      _id: userdb.subscriptionPlanID,
    });
    console.log(getSubscriptionLifeSpan);

    if (status == "success") {
      //get successful transaction and insert subscription into Subscription Table
      await Subscription.create({
        userId: userdb.userId,
        SubscriptionPlanId: userdb.subscriptionPlanID,
        expiring: new Date(
          Date.now() + getSubscriptionLifeSpan.period * 24 * 60 * 60 * 1000
        ), // Assuming a 30-day subscription
      });
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Payment verified successfully",
        data: response.data.data,
      });
    } else {
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Payment verified successfully",
        data: response.data.data,
      });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({
      status: false,
      message: "Verification failed",
      error: error.response?.data || error.message,
    });
  }
};
module.exports = {
  initializePayment,
  verifyPayment,
};
