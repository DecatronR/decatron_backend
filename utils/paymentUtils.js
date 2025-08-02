const axios = require("axios");
const SubscriptionPlan = require("../models/SubscriptionPlan");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

const initializeSubscriptionPayment = async (email, planName) => {
  try {
    // Normalize plan name to lowercase for consistency
    const normalizedPlanName = planName.toLowerCase();

    // Get subscription plan details dynamically
    const subscriptionPlan = await SubscriptionPlan.findOne({
      plan: { $regex: new RegExp(`^${normalizedPlanName}$`, "i") }, // Case-insensitive search
    });

    if (!subscriptionPlan) {
      throw new Error(`Subscription plan "${planName}" not found`);
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: subscriptionPlan.price * 100, // Convert to kobo
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
      subscriptionPlanID: subscriptionPlan._id,
      amount: subscriptionPlan.price,
      planName: subscriptionPlan.plan.toLowerCase(), // Return lowercase
      period: subscriptionPlan.period,
    };
  } catch (error) {
    console.error(`Error initializing ${planName} payment:`, error);
    throw error;
  }
};

// Get all available subscription plans
const getAvailableSubscriptionPlans = async () => {
  try {
    const plans = await SubscriptionPlan.find({}).select(
      "plan price period description"
    );
    return {
      success: true,
      plans: plans.map((plan) => ({
        name: plan.plan.toLowerCase(), // Return lowercase names
        displayName: plan.plan, // Keep original for display
        price: plan.price,
        period: plan.period,
        description: plan.description,
      })),
    };
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    throw error;
  }
};

// Validate if a subscription plan exists
const validateSubscriptionPlan = async (planName) => {
  try {
    const normalizedPlanName = planName.toLowerCase();
    const plan = await SubscriptionPlan.findOne({
      plan: { $regex: new RegExp(`^${normalizedPlanName}$`, "i") }, // Case-insensitive search
    });
    return {
      exists: !!plan,
      plan: plan
        ? {
            name: plan.plan.toLowerCase(), // Return lowercase
            displayName: plan.plan, // Keep original for display
            price: plan.price,
            period: plan.period,
            description: plan.description,
          }
        : null,
    };
  } catch (error) {
    console.error("Error validating subscription plan:", error);
    throw error;
  }
};

// Convenience function for Special Agent (backward compatibility)
const initializeSpecialAgentPayment = async (email) => {
  return await initializeSubscriptionPayment(email, "special agent");
};

module.exports = {
  initializeSubscriptionPayment,
  initializeSpecialAgentPayment,
  getAvailableSubscriptionPlans,
  validateSubscriptionPlan,
};
