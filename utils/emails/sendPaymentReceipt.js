const nodemailer = require("nodemailer");
const path = require("path");

const sendReceiptEmail = async (payment, receiptPath) => {
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

  const mailOptions = {
    from: "Decatron Payments <no-reply@decatron.com.ng>",
    to: payment.userEmail,
    subject: `Your Payment Receipt for Contract ${payment.contractId}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:logo" alt="Decatron Logo" style="max-width: 150px;" />
          </div>

          <h2 style="color: #5a47fb; text-align: center;">Payment Confirmation</h2>

          <p style="font-size: 16px;">
            Hi there, <br/><br/>
            We're happy to let you know that your payment for Contract <strong>${
              payment.contractId
            }</strong> has been confirmed.
            Please find your official receipt attached to this email for your records.
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/contract-dashboard/${
      payment.contractId
    }" 
               style="background-color: #5a47fb; color: white; text-decoration: none; 
               padding: 12px 30px; border-radius: 20px; font-size: 16px; font-weight: bold;">
               View Contract Details
            </a>
          </div>

          <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
            Need assistance? <a href="mailto:contact@decatron.com" style="color: #5a47fb; text-decoration: none;">Contact our support team</a>.
          </p>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
          © ${new Date().getFullYear()} Decatron. All Rights Reserved.
        </div>
      </div>
    `,
    attachments: [
      {
        filename: "receipt.pdf",
        path: receiptPath,
      },
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
  sendReceiptEmail,
};
