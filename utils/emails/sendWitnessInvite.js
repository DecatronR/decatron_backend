const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
const WitnessSignatureInvite = require("../../models/WitnessSignatureInvite");

const sendWitnessSignatureInviteEmail = async (
  witnessName,
  witnessEmail,
  contractId,
  role,
  inviterName,
  inviterId
) => {
  const frontendUrl = process.env.FRONTEND_URL;
  const signingToken = crypto.randomBytes(20).toString("hex");
  const signingLink = `${frontendUrl}/sign-contract?contractId=${contractId}&signingToken=${signingToken}&role=${role}`;

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
    from: "Decatron <no-reply@decatron.com.ng>",
    to: witnessEmail,
    subject: `You're invited to sign a contract by ${inviterName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:logo" alt="Decatron Logo" style="max-width: 150px;" />
          </div>
          <h2 style="color: #5a47fb; text-align: center;">Hi ${witnessName}!</h2>
          <p style="font-size: 16px;">
            ${inviterName} has invited you to sign a contract as a <strong>${role}</strong>.
          </p>
          <p style="font-size: 16px;">Click the button below to access and sign the contract:</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${signingLink}" 
               style="background-color: #5a47fb; color: white; text-decoration: none; 
               padding: 12px 30px; border-radius: 20px; font-size: 16px; font-weight: bold;">
               Sign Contract Now
            </a>
          </div>
          <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
            If you didn’t expect this, you can safely ignore this email.
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

  // Save invite to DB
  const invite = new WitnessSignatureInvite({
    contractId,
    witnessEmail,
    witnessName,
    role,
    inviterName,
    inviterId,
    signingToken,
    tokenExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
  });

  await invite.save();

  return signingToken;
};

module.exports = { sendWitnessSignatureInviteEmail };
