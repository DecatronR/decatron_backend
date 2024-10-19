require("dotenv").config();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

function hashPassword(password) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

function comparePassword(raw, hash) {
  return bcrypt.compareSync(raw, hash);
}

const formatRoleId = (roleId) => {
  return roleId.toString().padStart(3, "0"); // Ensures roleId is always three digits with leading zeros
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // Generates a 6-digit OTP
};

const sendOTPEmail = async (email, otp) => {
  // console.log(process.env.EMAIL_USER);
  // console.log(process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: "gmail", // or any other email service you're using
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS, // your email password or app password
    },
  });

  const mailOptions = {
    from: "DECATRON",
    to: email,
    subject: "Your OTP for Email Verification",
    text: `Your OTP for email verification is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

const inspectionScheduledEmail = async (
  email,
  name,
  agentName,
  agentContact,
  propertyTitle,
  propertyDescription,
  propertyLocation
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "DECATRON <no-reply@decatron.com>",
    to: email,
    subject: "Inspection Successfully Scheduled",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #5a47fb; text-align: center;">Inspection Scheduled Successfully</h2>
          <p style="font-size: 16px;">
            Hi <strong>${name}</strong>, <br /><br />
            We are pleased to inform you that your inspection has been successfully scheduled.
            <br /><br />
            <strong>Here are your inspection details:</strong>
          </p>
          
          <table style="width: 100%; font-size: 14px; margin-top: 10px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Agent Name:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${agentName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Agent Contact:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${agentContact}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Property Title:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${propertyTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Property Description:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${propertyDescription}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Location:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${propertyLocation}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://yourwebsite.com/tracking" 
               style="background-color: #5a47fb; color: white; text-decoration: none; 
               padding: 12px 30px; border-radius: 5px; font-size: 16px; font-weight: bold;">
               Start Tracking
            </a>
          </div>

          <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
            If you have any questions, feel free to <a href="mailto:support@decatron.com" style="color: #5a47fb; text-decoration: none;">contact us</a>.
          </p>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
          © 2024 Decatron. All Rights Reserved.
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  hashPassword,
  comparePassword,
  formatRoleId,
  generateOTP,
  sendOTPEmail,
  inspectionScheduledEmail,
};
