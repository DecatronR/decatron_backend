const nodemailer = require("nodemailer");
const path = require("path");

const sendPaymentNotification = async (payment, contract) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL;

  const logoPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "images",
    "logo.png"
  );

  const ownerEmail = contract.ownerEmail;
  const ownerName = contract.ownerName;
  const adminEmail = process.env.ADMIN_EMAIL;

  const subject = `Payment Received for ${contract.propertyName}`;

  // Function to send branded email to a specific recipient with personalized greeting
  const sendMailToRecipient = async (to, recipientName) => {
    const mailOptions = {
      from: "Decatron <no-reply@decatron.com.ng>",
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="cid:logo" alt="Decatron Logo" style="max-width: 150px;" />
            </div>
            <h2 style="color: #5a47fb; text-align: center;">Hello ${recipientName},</h2>
            <p style="font-size: 16px;">
              A payment has just been confirmed for the property "<strong>${
                contract.propertyName
              }</strong>".
            </p>

            <ul style="font-size: 16px; line-height: 1.8;">
              <li><strong>Amount:</strong> ₦${payment.amount}</li>
              <li><strong>Paid by:</strong> ${payment.userName} (${
        payment.userEmail
      })</li>
            </ul>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${frontendUrl}/contracts/${contract._id}" 
                 style="background-color: #5a47fb; color: white; text-decoration: none; 
                 padding: 12px 30px; border-radius: 20px; font-size: 16px; font-weight: bold;">
                 View Contract Details
              </a>
            </div>

            <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
              Need assistance? <a href="mailto:contact@decatron.com" style="color: #5a47fb; text-decoration: none;">Contact us</a>.
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

  // Send to property owner
  await sendMailToRecipient(ownerEmail, ownerName);

  // Send to admin
  await sendMailToRecipient(adminEmail, "Admin");
};

module.exports = {
  sendPaymentNotification,
};
