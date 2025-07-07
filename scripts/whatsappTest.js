require("dotenv").config();
const axios = require("axios");

// Replace these with your actual values or use environment variables
const TO_PHONE_NUMBER = process.env.TO_PHONE_NUMBER || "2349021316007"; // e.g., '2348012345678'
const WHATSAPP_TOKEN = `EAAcP0ao3ZA48BPIU9IcXvPECTdKsCnS5njkS09ZCfoMe4pZAcFtouALERoXyw9h9iKEMTm6tNtfd5MjYznRrfhMBj2PcJmZC5QYnFGco7XsGqKZBVI8lDxuxiXZCEGDl8qz83Kv0ZCRHcAwUCZAVw8YZAxQ8JjGVZAnsJ8APvHF7fOqN9KFzG0lfFDgggxu89vHkCxRAZDZD`;
const WHATSAPP_PHONE_NUMBER_ID = 686994027833525;
console.log("WHATSAPP_TOKEN:", WHATSAPP_TOKEN ? "[SET]" : "[NOT SET]");
console.log("WHATSAPP_PHONE_NUMBER_ID:", WHATSAPP_PHONE_NUMBER_ID);
console.log("TO_PHONE_NUMBER:", TO_PHONE_NUMBER);

const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

async function sendTestMessage() {
  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: TO_PHONE_NUMBER,
        type: "text",
        text: {
          body: "🚀 Hello from Decatron! This is a live WhatsApp Cloud API test message. If you received this, your API setup is working!",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Message sent! Response:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Error response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

sendTestMessage();
