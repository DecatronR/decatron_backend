const User = require("../models/User");
const Subscription = require("../models/Subscription");
const ReferralReward = require("../models/ReferralReward");

/**
 * Grant free trial to new user
 */
const grantFreeTrial = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already has free trial
    if (user.hasUsedFreeTrial) {
      return { success: false, message: "User already used free trial" };
    }

    // Grant 30 days free trial
    const freeTrialExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Subscription.create({
      userId: user._id.toString(),
      SubscriptionPlanId: "free-trial", // Special ID for free trial
      expiring: freeTrialExpiry.toISOString(),
      isFreeTrial: true,
    });

    // Update user
    await User.findByIdAndUpdate(userId, {
      hasUsedFreeTrial: true,
      freeTrialStartedAt: new Date(),
    });

    return {
      success: true,
      message: "Free trial granted successfully",
      expiresAt: freeTrialExpiry,
    };
  } catch (error) {
    console.error("Error granting free trial:", error);
    throw error;
  }
};

/**
 * Check and grant referral rewards
 */
const checkAndGrantReferralReward = async (referralCode) => {
  try {
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      throw new Error("Referrer not found");
    }

    // Count current referrals
    const referralCount = await User.countDocuments({ referrer: referralCode });

    // Calculate how many rewards they should have earned
    const expectedRewards = Math.floor(referralCount / 5);

    // Check if they need a new reward
    if (expectedRewards > referrer.referralRewardsEarned) {
      const newRewards = expectedRewards - referrer.referralRewardsEarned;

      for (let i = 0; i < newRewards; i++) {
        // Create referral reward record
        const rewardExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const referralReward = await ReferralReward.create({
          userId: referrer._id,
          referralCount: referralCount,
          daysAwarded: 30,
          status: "ACTIVE",
          expiresAt: rewardExpiry,
        });

        // Grant 30 days subscription
        await Subscription.create({
          userId: referrer._id.toString(),
          SubscriptionPlanId: "referral-reward",
          expiring: rewardExpiry.toISOString(),
          isReferralReward: true,
          referralRewardId: referralReward._id,
        });
      }

      // Update user's reward count
      await User.findByIdAndUpdate(referrer._id, {
        referralRewardsEarned: expectedRewards,
        lastReferralRewardAt: new Date(),
      });

      return {
        success: true,
        message: `Granted ${newRewards} referral reward(s)`,
        totalRewardsEarned: expectedRewards,
        referralCount: referralCount,
      };
    }

    return {
      success: false,
      message: "No new rewards to grant",
      totalRewardsEarned: referrer.referralRewardsEarned,
      referralCount: referralCount,
    };
  } catch (error) {
    console.error("Error checking referral rewards:", error);
    throw error;
  }
};

/**
 * Handle new user registration with referral
 */
const handleNewUserWithReferral = async (userId, referrerCode) => {
  try {
    // Grant free trial to new user
    await grantFreeTrial(userId);

    // Check if referrer gets a reward
    if (referrerCode) {
      await checkAndGrantReferralReward(referrerCode);
    }

    return {
      success: true,
      message: "User registration processed successfully",
    };
  } catch (error) {
    console.error("Error handling new user with referral:", error);
    throw error;
  }
};

/**
 * Get user's subscription status including free trial and referral rewards
 */
const getUserSubscriptionStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const subscriptions = await Subscription.find({
      userId: userId.toString(),
    });

    // Find the latest subscription
    const latestSubscription = subscriptions.sort(
      (a, b) => new Date(b.expiring) - new Date(a.expiring)
    )[0];

    const now = new Date();
    const isActive =
      latestSubscription && new Date(latestSubscription.expiring) > now;

    return {
      userId: user._id,
      hasUsedFreeTrial: user.hasUsedFreeTrial,
      referralRewardsEarned: user.referralRewardsEarned,
      isSubscriptionActive: isActive,
      currentSubscription: latestSubscription
        ? {
            expiresAt: latestSubscription.expiring,
            isFreeTrial: latestSubscription.isFreeTrial,
            isReferralReward: latestSubscription.isReferralReward,
            daysRemaining: Math.ceil(
              (new Date(latestSubscription.expiring) - now) /
                (1000 * 60 * 60 * 24)
            ),
          }
        : null,
      allSubscriptions: subscriptions.map((sub) => ({
        expiresAt: sub.expiring,
        isFreeTrial: sub.isFreeTrial,
        isReferralReward: sub.isReferralReward,
        createdAt: sub.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error getting user subscription status:", error);
    throw error;
  }
};

module.exports = {
  grantFreeTrial,
  checkAndGrantReferralReward,
  handleNewUserWithReferral,
  getUserSubscriptionStatus,
};
