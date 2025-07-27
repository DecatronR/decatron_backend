require("dotenv").config();
require("dotenv").config();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const axios = require("axios");

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
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  await axios.post(
    `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: phoneNo,
      type: "template",
      template: {
        name: "otp_verification",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: otp }],
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
};

const sendWhatsAppNotification = async ({
  browser,
  device,
  os,
  country,
  region,
  timestamp,
}) => {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const WHATSAPP_API_VERSION = "v18.0";
  const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const destinationWhatsapp = process.env.ADMIN_NOTIFICATION_DESTINATION;

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

    await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: destinationWhatsapp,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp notification sent!");
  } catch (error) {
    console.error(
      "Error sending WhatsApp notification:",
      error.response?.data || error.message
    );
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
