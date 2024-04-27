const { validationResult } = require("express-validator");
const { hashPassword, comparePassword } = require("../utils/helpers");
const User = require("../models/user");
const Role = require("../models/role");
const jwt = require("jsonwebtoken");


const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "h8BHWDXuW1IPcUHNcCNdsDKucaqHgLzN6ZZT4DMm0LM", {
    expiresIn: maxAge
  });
}

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { name, phone, email, password, roleId } = req.body;
  const hashedPassword = hashPassword(password);
  try {

     const roledb = await Role.findOne({ roleId });
     if (!roledb) {
       return res.status(404).json({
         responseMessage: "Role doesnt exist",
         responseCode: 404,
       });
    }
    
    const newUser = await User.create({
      name,
      phone,
      email,
      roleId,
      password: hashedPassword,
    });
    const token = createToken(newUser._id);
    res.cookie('auth_jwt', token, { maxAge: maxAge * 1000, httpOnly: true });
    return res
      .status(201).json({
        responseMessage: "User created successfully",
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
  const token = createToken(userdb._id);
  res.cookie("auth_jwt", token, { maxAge: maxAge * 1000, httpOnly: true });
  const isValid = comparePassword(password, userdb.password);
  if (isValid) {
    // req.session.user = userdb;
    return res
      .status(200)
      .json({
        responseMessage: "Login Successful",
        responseCode: 200,
        user: userdb._id,
      });
    //   res.sendStatus(200);
  } else {
    // res.sendStatus(401);
    return res.status(401).send({
      responseMessage: "Password is incorrect",
      responseCode: 401,
    });
  }
}

const logoutUser = (req, res) => { 
  res.cookie('auth_jwt', '', { maxAge: 1 });
  res.redirect('/register');
}



module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
