const express = require("express");
const axios = require("axios");
const router = express.Router();

// Endpoint to store the long-lived token in an HttpOnly cookie
router.post("/set-token", (req, res) => {
  const { longLivedToken } = req.body;

  if (!longLivedToken) {
    return res.status(400).json({ error: "Token is required" });
  }

  // Set the token in an HttpOnly cookie
  res.cookie("fb_token", longLivedToken, {
    httpOnly: true, // Prevents client-side JavaScript access
    secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
    sameSite: "Strict", // Mitigates CSRF attacks
    maxAge: 60 * 60 * 24 * 60 * 1000, // 60 days
  });

  res.status(200).json({ message: "Token stored successfully" });
});

// Endpoint to get Facebook data using the stored token
router.get("/get-token", async (req, res) => {
  const token = req.cookies.fb_token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token is missing" });
  }

  try {
    // Use Axios to call Facebook's Graph API
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/me?access_token=${token}`
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching Facebook data:", error.message);
    res.status(500).json({ error: "Failed to fetch Facebook data" });
  }
});

module.exports = router;
