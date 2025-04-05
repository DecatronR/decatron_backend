require("dotenv").config();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const twilio = require("twilio");

function hashPassword(password) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

function generateReferralCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase(); // Example: 'A1B2C3D4'
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
    from: "Decatron",
    to: email,
    subject: "Your OTP for Email Verification",
    text: `Your OTP for email verification is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

const sendWhatsappOTP = async (phoneNo, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twiliowhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  const client = twilio(accountSid, authToken);
  try {
    const message = await client.messages.create({
      from: `whatsapp:${twiliowhatsappNumber}`,
      to: `whatsapp:${phoneNo}`, // Example: whatsapp:+2348012345678
      body: `Your verification code is: ${otp}. Do not share this code with anyone.`,
    });
    console.log(message.sid);
    return true;
  } catch (error) {
    return false;
    // res.status(500).json({ error: error.message });
  }
};

const sendWhatsAppNotification = async ({
  browser,
  device,
  os,
  country,
  region,
  timestamp,
}) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  const destinationWhatsapp = process.env.ADMIN_NOTIFICATION_DESTINATION;

  const client = twilio(accountSid, authToken);
  try {
    const formattedTimestamp = new Date(timestamp).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const message = `You've got a new visitor on Decatron:\nBrowser: ${browser}\nDevice: ${device}\nOS: ${os}\nCountry: ${country}\nRegion: ${region}\nTimestamp: ${timestamp}`;

    await client.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${destinationWhatsapp}`,
      body: message,
    });

    console.log("WhatsApp notification sent!");
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  formatRoleId,
  generateOTP,
  sendOTPEmail,
  generateReferralCode,
  sendWhatsappOTP,
  sendWhatsAppNotification,
};
