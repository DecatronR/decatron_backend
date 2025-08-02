const nodemailer = require("nodemailer");
const path = require("path");

const sendSpecialAgentWelcomeEmail = async (
  email,
  name,
  subscriptionDays,
  includesFreeTrial
) => {
  const frontendUrl = process.env.FRONTEND_URL;
  const transporter = nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const logoPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "images",
    "logo.png"
  );

  const mailOptions = {
    from: "Decatron <no-reply@decatron.com.ng>",
    to: email,
    subject: "🎉 Welcome Special Agent  - Unlock Unlimited Property Requests!",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="Decatron Logo" style="max-width: 150px;" />
          </div>
          
          <h2 style="color: #5a47fb; text-align: center;">🎉 Congratulations, ${name}! You're Now a Special Agent!</h2>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">✅ Your Premium Subscription is Active!</h3>
            <p style="margin-bottom: 10px; font-size: 16px;">
              You now have <strong>${subscriptionDays} days of premium access</strong> to Decatron's Special Agent features.
              ${
                includesFreeTrial
                  ? "This includes your 30-day free trial bonus!"
                  : ""
              }
            </p>
            <p style="margin: 0; font-size: 14px; color: #28a745;">
              🚀 Start receiving unlimited property requests immediately!
            </p>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⭐ Your Special Agent Benefits:</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 16px;">
              <li><strong>Unlimited Property Requests</strong> - No daily limits</li>
              <li><strong>Priority Listings</strong> - Your properties appear first</li>
              <li><strong>Advanced Analytics</strong> - Track your performance</li>
              <li><strong>Premium Support</strong> - Dedicated customer service</li>
              <li><strong>Exclusive Features</strong> - Access to beta features</li>
            </ul>
          </div>

          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #17a2b8;">
            <h3 style="color: #0c5460; margin-top: 0;">💡 Pro Tips to Maximize Your Subscription:</h3>
            <ol style="margin: 0; padding-left: 20px; font-size: 16px;">
              <li><strong>Complete Your Profile</strong> - Add photos and detailed descriptions</li>
              <li><strong>Respond Quickly</strong> - Speed increases your success rate</li>
              <li><strong>Use Premium Features</strong> - Explore all available tools</li>
              <li><strong>Track Analytics</strong> - Monitor your performance metrics</li>
              <li><strong>Share Referrals</strong> - Earn free days by inviting others</li>
            </ol>
          </div>

          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #dc3545;">
            <h3 style="color: #721c24; margin-top: 0;">🎁 Special Bonus: Referral Rewards Still Active!</h3>
            <p style="margin-bottom: 15px; font-size: 16px;">
              Even as a premium user, you can still earn <strong>30 days of free access</strong> for every 5 people you refer!
              This extends your premium subscription at no extra cost.
            </p>
            <div style="text-align: center;">
              <a href="${frontendUrl}/referrals" 
                 style="background-color: #dc3545; color: white; text-decoration: none; 
                 padding: 12px 25px; border-radius: 20px; font-size: 16px; font-weight: bold;">
                 🎯 View Your Referrals
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${frontendUrl}/dashboard" 
               style="background-color: #5a47fb; color: white; text-decoration: none; 
               padding: 15px 35px; border-radius: 25px; font-size: 18px; font-weight: bold;">
               🏠 Go to Premium Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="font-size: 14px; color: #6c757d; text-align: center; margin-bottom: 10px;">
              <strong>Need premium support?</strong> Contact our dedicated team at 
              <a href="mailto:premium@decatron.com.ng" style="color: #5a47fb; text-decoration: none;">premium@decatron.com.ng</a>
            </p>
            <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Decatron. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    `,
    attachments: [{ filename: "logo.png", path: logoPath, cid: "logo" }],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendSpecialAgentWelcomeEmail };
