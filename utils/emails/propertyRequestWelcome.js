const nodemailer = require("nodemailer");
const path = require("path");

const sendPropertyRequestWelcomeEmail = async (email, name, referralCode) => {
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
  const referralLink = `${frontendUrl}/property-requests/register?ref=${referralCode}`;

  const mailOptions = {
    from: "Decatron <no-reply@decatron.com.ng>",
    to: email,
    subject:
      "🎉 Welcome to Decatron Property Requests - Your 30-Day Free Trial is Active!",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="Decatron Logo" style="max-width: 150px;" />
          </div>
          
          <h2 style="color: #5a47fb; text-align: center;">Welcome to Decatron Property Requests, ${name}! 🎉</h2>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">✅ Your 30-Day Free Trial is Active!</h3>
            <p>You now have <strong>30 days of free access</strong> to receive property requests from buyers and renters in your area.</p>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⭐ Upgrade to "Special Agent" Premium</h3>
            <p>Unlock unlimited property requests, priority listings, and advanced features.</p>
            <div style="text-align: center;">
              <a href="${frontendUrl}/subscription/special-agent" 
                 style="background-color: #ffc107; color: #000; text-decoration: none; 
                 padding: 12px 25px; border-radius: 20px; font-size: 16px; font-weight: bold;">
                 🚀 Upgrade to Special Agent
              </a>
            </div>
          </div>

          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #17a2b8;">
            <h3 style="color: #0c5460; margin-top: 0;">🎁 Earn 30 Days Free for Every 5 Referrals!</h3>
            <p>Invite other agents and earn <strong>30 days of free access</strong> for every 5 people who register.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <p style="margin: 0 0 10px 0; font-weight: bold;">Your Referral Link:</p>
              <div style="background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #dee2e6; word-break: break-all;">
                <a href="${referralLink}" style="color: #5a47fb;">${referralLink}</a>
              </div>
            </div>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
              <p style="margin: 0 0 10px 0; font-weight: bold;">Your Referral Code:</p>
              <div style="background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #dee2e6; text-align: center; font-family: monospace; font-size: 18px; font-weight: bold; color: #5a47fb;">
                ${referralCode}
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${frontendUrl}/dashboard" 
               style="background-color: #5a47fb; color: white; text-decoration: none; 
               padding: 15px 35px; border-radius: 25px; font-size: 18px; font-weight: bold;">
               🏠 Go to Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; font-size: 12px; color: #6c757d;">
            © ${new Date().getFullYear()} Decatron. All Rights Reserved.
          </div>
        </div>
      </div>
    `,
    attachments: [{ filename: "logo.png", path: logoPath, cid: "logo" }],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPropertyRequestWelcomeEmail };
