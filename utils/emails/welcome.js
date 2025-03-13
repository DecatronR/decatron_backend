const nodemailer = require("nodemailer");
const path = require("path");

const sendWelcomeEmail = async (email, name, role) => {
  const frontendUrl = process.env.FRONTEND_URL;
  const transporter = nodemailer.createTransport({
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

  let actionText, actionUrl;

  if (role === "owner" || role === "property_manager") {
    actionText = "List Your First Property Now";
    actionUrl = `${frontendUrl}/properties/add/for-rent`;
  } else {
    actionText = "Start Exploring Properties";
    actionUrl = frontendUrl;
  }

  const mailOptions = {
    from: "Decatron <no-reply@decatron.com.ng>",
    to: email,
    subject:
      "Welcome to Decatron – Real estate transactions like online shopping!",
    html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:logo" alt="Decatron Logo" style="max-width: 150px;" />
          </div>
            <h2 style="color: #5a47fb; text-align: center;">Welcome to Decatron, ${name}!</h2>
            <p style="font-size: 16px;">
              Hi <strong>${name}</strong>, <br /><br />
              We're thrilled to have you on board! With Decatron, real estate transactions need not be stressful.
              <br /><br />
              Whether you're a property owner, manager, agent, or looking to rent, Decatron was built with you in mind. We're here to make the process seamless, transparent, and hassle-free.
            </p>
  
            <div style="text-align: center; margin-top: 30px;">
              <a href="${actionUrl}" 
                 style="background-color: #5a47fb; color: white; text-decoration: none; 
                 padding: 12px 30px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                 ${actionText}
              </a>
            </div>
  
            <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
              Need help? Feel free to <a href="mailto:contact@decatron.com" style="color: #5a47fb; text-decoration: none;">contact us</a>.
            </p>
          </div>
  
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
            © ${new Date().getFullYear()} Decatron. All Rights Reserved.
          </div>
        </div>
      `,
    attachments: [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "logo",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomeEmail,
};
