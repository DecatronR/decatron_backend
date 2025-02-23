require("dotenv").config();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const twilio = require('twilio');

function hashPassword(password) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

function generateReferralCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // Example: 'A1B2C3D4'
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

const sendWhatsappOTP = async(phoneNo, otp) =>{

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  const client = twilio(accountSid, authToken);
  try{
    const message = await client.messages.create({
        from: whatsappNumber, 
        to: `whatsapp:${phoneNo}`, // Example: whatsapp:+2348012345678
        body: `Your verification code is: ${otp}. Do not share this code with anyone.`
    });
    console.log(message.sid);
    return true;
  } catch (error) {
    return false;
      // res.status(500).json({ error: error.message });
  }

};

module.exports = {
  hashPassword,
  comparePassword,
  formatRoleId,
  generateOTP,
  sendOTPEmail,
  generateReferralCode,
  sendWhatsappOTP
};
