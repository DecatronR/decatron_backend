const { validationResult } = require("express-validator");
const {
  hashPassword,
  comparePassword,
  generateOTP,
  sendOTPEmail,
  generateReferralCode,
  sendWhatsappOTP,
} = require("../utils/helpers");
const { sendWhatsAppReply } = require("./webhookController");
const { normalizePhoneNumber } = require("../utils/phoneNumberUtils");
const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../utils/emails/welcome");
const {
  sendPropertyRequestWelcomeEmail,
} = require("../utils/emails/propertyRequestWelcome");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const { handleNewUserWithReferral } = require("../utils/referralRewardService");

const secretKey = process.env.JWT_SECURITY_KEY;

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, secretKey, {
    expiresIn: maxAge,
  });
};
const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }
  const { password, confirmPassword, email } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({
        responseCode: 400,
        responseMessage: "Password and Confirm Password do not match",
      });
    }
    const hashedPassword = hashPassword(password);
    const email_verified_at = new Date();
    const otp = null;
    const updateData = { password: hashedPassword, email_verified_at, otp };

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      updateData,
      {
        new: true,
      }
    ).select("-password");
    if (updatedUser) {
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Password Changed Successfully",
        data: updatedUser,
      });
    } else {
      return res.status(401).json({
        responseMessage: "An error occurred changing password",
        responseCode: 401,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      responseMessage: "oops an error occurred",
      responseCode: 500,
    });
  }
};

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { name, phone, email, password, role, referrer } = req.body;

  // Normalize phone number
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) {
    return res.status(400).json({
      responseCode: 400,
      responseMessage: "Invalid phone number format",
    });
  }

  // Validate referrer code if provided
  if (referrer) {
    const referrerExists = await User.findOne({ referralCode: referrer });
    if (!referrerExists) {
      return res.status(400).json({
        responseCode: 400,
        responseMessage: "Invalid referral code",
      });
    }
  }

  const hashedPassword = hashPassword(password);
  try {
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage:
          "Email already exists. kindly provide a different email",
      });
    }

    // Check for existing phone number with normalized format
    const existingPhone = await User.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage:
          "Phone number already exists. kindly provide a different phone number",
      });
    }

    const slug = role.toLowerCase().replace(/\s+/g, "-");
    const roledb = await Role.findOne({ slug });
    if (!roledb) {
      return res.status(404).json({
        responseMessage: "Role doesnt exist",
        responseCode: 404,
      });
    }

    const otp = generateOTP();
    const agentReferralCode = generateReferralCode();
    const referralCode = generateReferralCode();

    const newUser = await User.create({
      name,
      phone: normalizedPhone,
      email,
      role: slug,
      otp,
      agentReferralCode,
      referralCode,
      referrer,
      email_verified_at: null,
      password: hashedPassword,
    });

    // Grant free trial and handle referral rewards
    try {
      await handleNewUserWithReferral(newUser._id, referrer);
    } catch (referralError) {
      console.error("Error handling referral rewards:", referralError);
      // Don't fail the registration if referral processing fails
    }

    await sendOTPEmail(email, otp);

    const token = createToken(newUser._id);
    res.cookie("auth_jwt", token, {
      maxAge: maxAge * 1000,
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
    });
    return res.status(201).json({
      responseMessage:
        "User created successfully. OTP has been sent to your email for verification.",
      responseCode: 201,
      user: newUser._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      responseMessage: `Failed to register user. ${error.message}`,
      responseCode: 401,
    });
  }
};

async function sendOTP(phone, otp) {
  try {
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const TEMPLATE_NAME = process.env.WHATSAPP_OTP_TEMPLATE_NAME;
    const LANGUAGE_CODE = "en_US"; // Adjust as needed
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: TEMPLATE_NAME,
          language: { code: LANGUAGE_CODE },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
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
    console.log("OTP sent successfully:", response.data);
  } catch (error) {
    console.error("Failed to send OTP:", error.response?.data || error.message);
  }
}

const resendOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }
  try {
    const { email } = req.body;
    const existing = await User.findOne({ email });
    if (!existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Email does not exist",
      });
    }
    const otp = generateOTP();
    const updateData = { otp };
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      updateData,
      {
        new: true,
      }
    ).select("-password");
    await sendOTPEmail(email, otp);
    if (updatedUser) {
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "OTP Sent Successfully",
        data: updatedUser,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      responseMessage: "oops an error occurred",
      responseCode: 401,
    });
  }
};

const sendWPOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }
  try {
    const { phoneNo } = req.body;
    const existing = await User.findOne({ phone: phoneNo });
    if (!existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Phone Number does not exist",
      });
    }
    const otp = generateOTP();
    const updateData = { phoneOTP: otp };
    const updatedUser = await User.findOneAndUpdate(
      { phone: phoneNo },
      updateData,
      {
        new: true,
      }
    ).select("-password");
    const sendOTP = await sendWhatsappOTP(phoneNo, otp);
    if (sendOTP) {
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "OTP Sent Successfully",
        data: updatedUser,
      });
    } else {
      return res.status(401).json({
        responseMessage: "An error occurred sending OTP",
        responseCode: 401,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      responseMessage: "oops an error occurred",
      responseCode: 401,
    });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }
  const { email, password } = req.body;
  const userdb = await User.findOne({ email });

  if (!userdb)
    return res.status(401).send({
      responseMessage: "Email not registered",
      responseCode: 401,
    });
  if (userdb.otp !== null) {
    return res.status(410).send({
      responseMessage: "Kindly confirm your account to proceed",
      responseCode: 410,
    });
  }
  const token = createToken(userdb._id);
  res.cookie("auth_jwt", token, { maxAge: maxAge * 1000 });
  const isValid = comparePassword(password, userdb.password);
  if (isValid) {
    // req.session.user = userdb;
    return res.status(200).json({
      responseMessage: "Login Successful",
      responseCode: 200,
      user: userdb._id,
      token,
      referralCode: userdb.agentReferralCode,
    });
    //   res.sendStatus(200);
  } else {
    // res.sendStatus(401);
    return res.status(401).send({
      responseMessage: "Password is incorrect",
      responseCode: 401,
    });
  }
};

const logoutUser = (req, res) => {
  res.cookie("auth_jwt", "", { maxAge: 1 });
  res.redirect("/register");
};

const confirmOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { email, otp } = req.body;
  const existing = await User.findOne({ email });

  if (!existing) {
    return res.status(404).json({
      responseMessage: "User not found",
      responseCode: 404,
    });
  }

  // Check if OTP matches for this specific user
  if (existing.otp !== otp) {
    return res.status(401).json({
      responseMessage: "Invalid OTP provided",
      responseCode: 401,
    });
  }

  // OTP is correct, proceed with verification
  const email_verified_at = new Date();
  const updatedUser = await User.findOneAndUpdate(
    { email: email },
    { otp: null, email_verified_at },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    return res.status(401).json({
      responseCode: 401,
      responseMessage: "An error occurred confirming OTP",
    });
  }

  // Send welcome email
  await sendWelcomeEmail(email, updatedUser.name);

  // Generate JWT Token
  const token = createToken(updatedUser._id, updatedUser.role);

  // Set auth cookie for automatic login
  res.cookie("auth_jwt", token, {
    maxAge: maxAge * 1000,
    httpOnly: true,
    sameSite: "Lax",
    secure: true,
  });

  return res.status(200).json({
    responseCode: 200,
    responseMessage: "OTP Confirmed Successfully. You are now logged in.",
    token, // Send token in response if frontend needs it
    user: updatedUser._id,
  });
};

const confirmPhoneNo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { id } = req.body;
  const objectId = new ObjectId(id);
  const existing = await User.findOne({ _id: objectId });

  if (!existing) {
    return res.status(404).json({
      responseMessage: "User not found",
      responseCode: 404,
    });
  }

  // OTP is correct, proceed with verification
  const phone_no_verified_at = new Date();
  const updatedUser = await User.findOneAndUpdate(
    { _id: objectId },
    { phone_no_verified_at },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    return res.status(401).json({
      responseCode: 401,
      responseMessage: "An error occurred confirming OTP",
    });
  }

  return res.status(200).json({
    responseCode: 200,
    responseMessage: "Phone Number Confirmed Successfully.",
    user: updatedUser._id,
  });
};

const propertyRequestRegistration = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const {
    name,
    phone,
    email,
    password,
    role,
    state,
    lga,
    listingType,
    referrer,
  } = req.body;

  // Normalize phone number
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) {
    return res.status(400).json({
      responseCode: 400,
      responseMessage: "Invalid phone number format",
    });
  }

  // Validate referrer code if provided
  if (referrer) {
    const referrerExists = await User.findOne({ referralCode: referrer });
    if (!referrerExists) {
      return res.status(400).json({
        responseCode: 400,
        responseMessage: "Invalid referral code",
      });
    }
  }

  // console.log(req.body);
  const hashedPassword = hashPassword(password);

  if (
    !Array.isArray(state) ||
    !Array.isArray(lga) ||
    !Array.isArray(listingType)
  ) {
    return res.status(400).json({
      responseCode: 400,
      responseMessage: "State, LGA, and Listing Type must be arrays.",
    });
  }

  // Validate that arrays are not empty
  if (state.length === 0 || lga.length === 0 || listingType.length === 0) {
    return res.status(400).json({
      responseCode: 400,
      responseMessage: "State, LGA, and Listing Type arrays cannot be empty.",
    });
  }

  try {
    const existing = await User.findOne({ phone: normalizedPhone });
    if (existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage:
          "Phone number already exists. kindly provide a different phone number",
      });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage:
          "Email already exists. kindly provide a different email address",
      });
    }
    const slug = role.toLowerCase().replace(/\s+/g, "-");
    const roledb = await Role.findOne({ slug });
    if (!roledb) {
      return res.status(404).json({
        responseMessage: "Role doesnt exist",
        responseCode: 404,
      });
    }

    const phoneOTP = generateOTP();
    const agentReferralCode = generateReferralCode();
    const referralCode = generateReferralCode();
    const otp = generateOTP();

    const newUser = await User.create({
      name,
      phone: normalizedPhone,
      email,
      role: slug,
      phoneOTP,
      otp,
      agentReferralCode,
      referralCode,
      referrer,
      state,
      lga,
      listingType,
      email_verified_at: null,
      password: hashedPassword,
    });

    // Grant free trial and handle referral rewards
    try {
      await handleNewUserWithReferral(newUser._id, referrer);
    } catch (referralError) {
      console.error("Error handling referral rewards:", referralError);
      // Don't fail the registration if referral processing fails
    }

    // const token = createToken(newUser._id);
    // res.cookie("auth_jwt", token, {
    //   maxAge: maxAge * 1000,
    //   httpOnly: true,
    //   sameSite: "Lax",
    //   secure: true,
    // });
    // await sendOTP(phone, phoneOTP);
    await sendOTPEmail(email, otp);

    // Send property request welcome email with referral information
    try {
      await sendPropertyRequestWelcomeEmail(email, name, referralCode);
    } catch (emailError) {
      console.error(
        "Error sending property request welcome email:",
        emailError
      );
      // Don't fail the registration if welcome email fails
    }

    return res.status(201).json({
      responseMessage:
        "User created successfully. OTP has been sent to your email for verification.",
      responseCode: 201,
      user: newUser._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      responseMessage: `Failed to register user. ${error.message}`,
      responseCode: 401,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  confirmOTP,
  resendOTP,
  sendWPOTP,
  confirmPhoneNo,
  changePassword,
  propertyRequestRegistration,
};
