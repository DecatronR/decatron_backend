const axios = require("axios");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

const verifyNIN = async (req, res) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        responseCode: 400,
        responseMessage: errors.array(),
      });
    }

    const { id, nin, firstname, lastname } = req.body;
    const objectId = new ObjectId(id);
    const existing = await User.findOne({ _id: objectId });

    if (existing.nin_verified_at !== null) {
      return res.status(406).json({
        responseMessage: "NIN for this user has been confirmed. Thank you",
        responseCode: 405,
      });
    }

    // Step 1: Get Bearer token
    const authResponse = await axios.post("https://api.qoreid.com/token", {
      clientId: process.env.QORE_CLIENT_ID,
      secret: process.env.QORE_SECRET_KEY,
    });

    const token = authResponse.data.accessToken;

    // Step 2: Use token to verify NIN
    const ninResponse = await axios.post(
      `https://api.qoreid.com/v1/ng/identities/nin/${nin}`,
      {
        firstname,
        lastname,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    //   console.log(ninResponse.data.summary.nin_check.fieldMatches.firstname);
    if (
      ninResponse.data.summary.nin_check.fieldMatches.firstname &&
      ninResponse.data.summary.nin_check.fieldMatches.lastname
    ) {
      // Get the base64 passport image
      const passportBase64 = ninResponse.data.nin.photo; // assuming this is the base64 string

      // Create a unique filename
      const uniqueFileName = `${Date.now()}-${
        ninResponse.data.nin.nin
      }-passport.jpg`;
      const uploadPath = path.join(
        __dirname,
        "../uploads/passports",
        uniqueFileName
      );

      // Make sure the directory exists
      const dirPath = path.dirname(uploadPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Convert base64 to buffer and save to file
      try {
        // Remove data:image/jpeg;base64, prefix if it exists
        const base64Data = passportBase64.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        fs.writeFileSync(uploadPath, Buffer.from(base64Data, "base64"));

        // Create the NIN data object with passport path
        const ninData = {
          nin: ninResponse.data.nin.nin,
          firstname: ninResponse.data.nin.firstname,
          lastname: ninResponse.data.nin.lastname,
          middlename: ninResponse.data.nin.middlename,
          phone: ninResponse.data.nin.phone,
          gender: ninResponse.data.nin.gender,
          dob: ninResponse.data.nin.birthdate,
          address: ninResponse.data.nin.residence.address1,
          lga: ninResponse.data.nin.residence.lga,
          state: ninResponse.data.nin.residence.state,
          photo: `/uploads/passports/${uniqueFileName}`, // Store the relative path
        };

        const nin_verified_at = new Date();
        const nin_verified = true;

        // Update the user document with both nin_verified_at AND push the ninData
        const updatedUser = await User.findOneAndUpdate(
          { _id: objectId },
          {
            nin_verified_at,
            nin_verified,
            $push: { nin: ninData },
          },
          { new: true }
        );

        return res.json({
          success: true,
          responseCode: 200,
          responseMessage: "NIN verification completed",
          data: ninResponse.data,
        });
      } catch (fileError) {
        console.error("Error saving passport image:", fileError);
        return res.status(500).json({
          success: false,
          responseCode: 500,
          responseMessage: "Error processing passport image",
          error: fileError.message,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        responseCode: 400,
        responseMessage:
          "Firstname and Lastname do not match with NIN credentials",
      });
    }
  } catch (error) {
    // Handle API errors with a consistent structure
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;

    return res.status(statusCode).json({
      success: false,
      responseCode: statusCode,
      responseMessage: errorMessage,
      // error: error.response?.data || null
    });
  }
};

module.exports = {
  verifyNIN,
};
