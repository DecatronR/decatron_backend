require('dotenv').config();
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const crypto = require('crypto');


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
    service: 'gmail', // or any other email service you're using
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS, // your email password or app password
    },
  });

  const mailOptions = {
    from: 'DECATRON',
    to: email,
    subject: 'Your OTP for Email Verification',
    text: `Your OTP for email verification is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  hashPassword,
  comparePassword,
  formatRoleId,
  generateOTP,
  sendOTPEmail
};
