const { validationResult } = require("express-validator");
const {
  hashPassword,
  comparePassword,
  generateOTP,
  sendOTPEmail,
} = require("../utils/helpers");
const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "h8BHWDXuW1IPcUHNcCNdsDKucaqHgLzN6ZZT4DMm0LM", {
    expiresIn: maxAge,
  });
};

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { name, phone, email, password, role } = req.body;
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
    const slug = role.toLowerCase().replace(/\s+/g, "-");
    const roledb = await Role.findOne({ slug });
    if (!roledb) {
      return res.status(404).json({
        responseMessage: "Role doesnt exist",
        responseCode: 404,
      });
    }

    const otp = generateOTP();

    const newUser = await User.create({
      name,
      phone,
      email,
      role: slug,
      otp,
      email_verified_at: null,
      password: hashedPassword,
    });

    await sendOTPEmail(email, otp);

    const token = createToken(newUser._id);
    res.cookie("auth_jwt", token, { maxAge: maxAge * 1000, httpOnly: true });
    return res.status(201).json({
      responseMessage:
        "User created successfully. OTP has been sent to your email for verification.",
      responseCode: 201,
      user: newUser._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      responseMessage: "Failed to register user",
      responseCode: 401,
    });
  }
};

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
    return res.status(401).send({
      responseMessage: "Kindly confirm your account to proceed",
      responseCode: 401,
    });
  }
  const token = createToken(userdb._id);
  // res.cookie("auth_jwt", token, { maxAge: maxAge * 1000, httpOnly: true });
  res.cookie("auth_jwt", token, {
    maxAge: maxAge * 1000,
    sameSite: "none",
    secure: true,
    httpOnly: false,
  });
  const isValid = comparePassword(password, userdb.password);
  if (isValid) {
    // req.session.user = userdb;
    return res.status(200).json({
      responseMessage: "Login Successful",
      responseCode: 200,
      user: userdb._id,
      token,
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
  const otpExisting = await User.findOne({ otp });
  if (otpExisting) {
    const newotp = null;
    const email_verified_at = new Date();
    const updateData = { otp: newotp, email_verified_at };
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      updateData,
      {
        new: true,
      }
    ).select("-password");
    if (!updatedUser) {
      return res.status(401).json({
        responseCode: 401,
        responseMessage: "An error ocurred confirming OTP",
      });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "OTP Confirmed Successfully",
      data: updatedUser,
    });
  } else {
    return res.status(401).json({
      responseMessage: "invalid OTP Passed",
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
};
