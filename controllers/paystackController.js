const axios = require("axios");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { validationResult } = require("express-validator");
const { getUserSubscriptionStatus } = require("../utils/referralRewardService");
const {
  sendSpecialAgentWelcomeEmail,
} = require("../utils/emails/specialAgentWelcome");
const { initializeSubscriptionPayment } = require("../utils/paymentUtils");

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
    const userdb = await User.findOne({ email });
    if (!userdb) {
      return res.status(404).json({
        responseMessage: `User with email ${email} not found on our system`,
        responseCode: 404,
      });
    }

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

// Separate function for existing user upgrades
const initializeUpgradePayment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { userId, planName } = req.body;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "User not found",
      });
    }

    // Validate the subscription plan
    const { validateSubscriptionPlan } = require("../utils/paymentUtils");
    const planValidation = await validateSubscriptionPlan(
      planName.toLowerCase()
    );

    if (!planValidation.exists) {
      return res.status(400).json({
        responseCode: 400,
        responseMessage: `Subscription plan "${planName}" not found. Please choose a valid plan.`,
      });
    }

    // Check if user is trying to upgrade to free trial (not allowed for existing users)
    if (planName.toLowerCase() === "free trial") {
      return res.status(400).json({
        responseCode: 400,
        responseMessage: "Free trial is only available for new registrations.",
      });
    }

    // Initialize payment for the subscription plan
    const paymentData = await initializeSubscriptionPayment(
      user.email,
      planName.toLowerCase()
    );

    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      subscriptionPlanID: paymentData.subscriptionPlanID,
      paymentReference: paymentData.data.reference,
      amount: paymentData.amount,
      customerName: user.name,
      customerEmail: user.email,
      status: "PENDING",
      paymentDescription: `Upgrade to ${planName}`,
      isUpgrade: true, // Flag to indicate this is an upgrade
    });

    return res.status(200).json({
      responseCode: 200,
      responseMessage: `Payment initialized for ${planName} upgrade`,
      data: {
        ...paymentData.data,
        planDetails: {
          name: paymentData.planName,
          displayName: planValidation.plan.displayName,
          amount: paymentData.amount,
          period: paymentData.period,
        },
        transactionId: transaction._id,
      },
    });
  } catch (error) {
    console.error("Error initializing upgrade payment:", error);
    return res.status(500).json({
      responseCode: 500,
      responseMessage: "Failed to initialize upgrade payment",
      error: error.message,
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
      // Get user details to check free trial status
      const user = await User.findById(userdb.userId);
      if (!user) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "User not found",
        });
      }

      // Check if this is an upgrade transaction
      const isUpgrade = userdb.isUpgrade || false;

      // Calculate subscription duration
      let subscriptionDays = getSubscriptionLifeSpan.period;

      // If user hasn't used free trial and this is NOT an upgrade, give them 30 extra days
      if (!user.hasUsedFreeTrial && !isUpgrade) {
        subscriptionDays += 30;
        // Mark user as having used free trial
        await User.findByIdAndUpdate(userdb.userId, {
          hasUsedFreeTrial: true,
          freeTrialStartedAt: new Date(),
        });
      }

      // Create subscription with calculated duration
      await Subscription.create({
        userId: userdb.userId,
        SubscriptionPlanId: userdb.subscriptionPlanID,
        expiring: new Date(Date.now() + subscriptionDays * 24 * 60 * 60 * 1000),
        isFreeTrial: false, // This is a paid subscription
      });

      // Send appropriate email based on whether it's an upgrade or new subscription
      if (isUpgrade) {
        // Send upgrade confirmation email
        try {
          await sendSpecialAgentWelcomeEmail(
            user.email,
            user.name,
            subscriptionDays,
            false // No free trial bonus for upgrades
          );
        } catch (emailError) {
          console.error("Error sending upgrade welcome email:", emailError);
        }
      } else {
        // Send new subscription welcome email
        try {
          await sendSpecialAgentWelcomeEmail(
            user.email,
            user.name,
            subscriptionDays,
            !user.hasUsedFreeTrial
          );
        } catch (emailError) {
          console.error(
            "Error sending Special Agent welcome email:",
            emailError
          );
        }
      }

      return res.status(200).json({
        responseCode: 200,
        responseMessage: isUpgrade
          ? "Payment verified successfully. Your subscription has been upgraded!"
          : "Payment verified successfully",
        data: {
          ...response.data.data,
          subscriptionDays: subscriptionDays,
          includesFreeTrial: !user.hasUsedFreeTrial && !isUpgrade,
          isUpgrade: isUpgrade,
        },
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
