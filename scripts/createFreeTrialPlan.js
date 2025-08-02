const mongoose = require("mongoose");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Import SubscriptionPlan model
const SubscriptionPlan = require("../models/SubscriptionPlan");

async function createFreeTrialPlan() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Connected to MongoDB");

    // Check if free trial plan already exists
    const existingFreeTrial = await SubscriptionPlan.findOne({
      plan: { $regex: /^free trial$/i },
    });

    if (existingFreeTrial) {
      console.log("Free trial plan already exists:", existingFreeTrial.plan);
      return;
    }

    // Create free trial plan
    const freeTrialPlan = await SubscriptionPlan.create({
      plan: "Free Trial",
      price: 0,
      period: 30,
      description: "30-day free trial with basic features",
    });

    console.log("Free trial plan created successfully:", freeTrialPlan.plan);

    // Display all plans
    const allPlans = await SubscriptionPlan.find({});
    console.log("\nAll subscription plans:");
    allPlans.forEach((plan) => {
      console.log(`- ${plan.plan}: ₦${plan.price} for ${plan.period} days`);
    });
  } catch (error) {
    console.error("Error creating free trial plan:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
createFreeTrialPlan();
