require("dotenv").config();
const axios = require("axios");

const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL;
const CLIENT_ID = process.env.MONNIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.MONNIFY_CLIENT_SECRET;

// get monify authentication code
async function getAuthToken() {
  try {
    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/auth/login`,
      {},
      { auth: { username: CLIENT_ID, password: CLIENT_SECRET } }
    );
    console.log(
      "Monnify access token: ",
      response.data.responseBody.accessToken
    );
    return response.data.responseBody.accessToken;
  } catch (error) {
    console.error(
      "Error getting Monnify token:",
      error.response?.data || error
    );
    throw new Error("Authentication failed");
  }
}

module.exports = { getAuthToken, MONNIFY_BASE_URL };
