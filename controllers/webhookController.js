const PropertyRequest = require("../models/PropertyRequest");
const WhatsAppUserState = require("../models/WhatsAppUserState");
const User = require("../models/User");
const {
  sendPropertyRequestNotification,
} = require("../utils/emails/propertyRequestNotification");
const axios = require("axios");

// WhatsApp Cloud API configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = "v18.0"; // Update to latest version
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

// Helper: Send WhatsApp Cloud API reply
async function sendWhatsAppReply(to, body) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: body },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp message sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error sending WhatsApp message:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Helper: Get/set user state in MongoDB
async function getUserState(phone) {
  const record = await WhatsAppUserState.findOne({ phone });
  return record ? record.state : "menu";
}

async function setUserState(phone, state, data = {}) {
  await WhatsAppUserState.findOneAndUpdate(
    { phone },
    { state, updatedAt: new Date(), ...data },
    { upsert: true }
  );
}

async function getUserData(phone) {
  const record = await WhatsAppUserState.findOne({ phone });
  return record || {};
}

// Main webhook handler
const whatsappWebhook = async (req, res) => {
  // Log all incoming webhook requests for debugging
  console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));
  // Handle webhook verification
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log("Webhook verified");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  // Handle incoming messages
  if (req.method === "POST") {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const from = message.from; // Phone number without 'whatsapp:' prefix
        const bodyText = (message.text?.body || "").trim();

        // Get user state from MongoDB
        let state = await getUserState(from);
        let userData = await getUserData(from);

        if (/^(hi|hello)$/i.test(bodyText)) {
          state = "menu";
        }

        if (state === "menu") {
          await sendWhatsAppReply(
            from,
            `Hi! Welcome to Decatron.\nTo make a property request, type 1.\nTo see all recent property requests, type 2.`
          );
          await setUserState(from, "awaiting_menu_selection", {
            name: "",
            email: "",
            role: "",
            tempRequest: {},
          });
          return res.sendStatus(200);
        }

        if (state === "awaiting_menu_selection") {
          if (bodyText === "1") {
            await sendWhatsAppReply(from, `Please enter your full name:`);
            await setUserState(from, "awaiting_name");
            return res.sendStatus(200);
          } else if (bodyText === "2") {
            // Optionally, fetch and show recent requests (limit to 3 for brevity)
            const recent = await PropertyRequest.find({ source: "whatsapp" })
              .sort({ createdAt: -1 })
              .limit(3);
            if (recent.length === 0) {
              await sendWhatsAppReply(
                from,
                "No recent property requests found."
              );
            } else {
              const msg = recent
                .map(
                  (r) =>
                    `${r.propertyType}, ${r.category}, ₦${r.budget}, ${r.state}, ${r.lga}, ${r.neighbourhood}`
                )
                .join("\n");
              await sendWhatsAppReply(
                from,
                `Recent property requests:\n${msg}`
              );
            }
            await setUserState(from, "menu");
            return res.sendStatus(200);
          } else {
            await sendWhatsAppReply(
              from,
              "Invalid option. Please type 1 to make a request or 2 to see recent requests."
            );
            return res.sendStatus(200);
          }
        }

        if (state === "awaiting_name") {
          if (!bodyText) {
            await sendWhatsAppReply(
              from,
              "Name cannot be empty. Please enter your full name:"
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(from, "Please enter your email address:");
          await setUserState(from, "awaiting_email", { name: bodyText });
          return res.sendStatus(200);
        }

        if (state === "awaiting_email") {
          // Basic email validation
          if (!/^\S+@\S+\.\S+$/.test(bodyText)) {
            await sendWhatsAppReply(
              from,
              "Invalid email. Please enter a valid email address:"
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `What best describes you? Reply with the number:\n1. Agent\n2. Buyer/Renter\n3. Owner\n4. Property Manager`
          );
          await setUserState(from, "awaiting_role", { email: bodyText });
          return res.sendStatus(200);
        }

        if (state === "awaiting_role") {
          let role = "";
          switch (bodyText) {
            case "1":
              role = "agent";
              break;
            case "2":
              role = "buyer"; // Store as 'buyer' in DB
              break;
            case "3":
              role = "owner";
              break;
            case "4":
              role = "property manager";
              break;
            default:
              await sendWhatsAppReply(
                from,
                `Invalid option. Please reply with the number:\n1. Agent\n2. Buyer/Renter\n3. Owner\n4. Property Manager`
              );
              return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Please enter your property request in the following format:\n[Property Type], [Category], [Budget], [State], [LGA], [Neighbourhood], [Any notes]\nExample: Apartment, Rent, 5000000, Lagos, Ikeja, Ikeja GRA, 2-bedroom, close to mall`
          );
          await setUserState(from, "awaiting_request_details", { role });
          return res.sendStatus(200);
        }

        if (state === "awaiting_request_details") {
          // Parse request details
          const parts = bodyText.split(",").map((s) => s.trim());
          if (parts.length < 6) {
            await sendWhatsAppReply(
              from,
              "Invalid format. Please use the format: [Property Type], [Category], [Budget], [State], [LGA], [Neighbourhood], [Any notes]"
            );
            return res.sendStatus(200);
          }
          // Save to DB
          const [
            propertyType,
            category,
            budget,
            stateVal,
            lga,
            neighbourhood,
            ...noteArr
          ] = parts;
          const note = noteArr.join(", ");
          // Get user data from state
          userData = await getUserData(from);
          const newRequest = await PropertyRequest.create({
            propertyType,
            category,
            budget: Number(budget),
            state: stateVal,
            lga,
            neighbourhood,
            note,
            phone: from,
            source: "whatsapp",
            status: "open",
            name: userData.name,
            email: userData.email,
            role: userData.role,
          });

          // Send email notifications to property managers, owners, and caretakers
          try {
            const eligibleUsers = await User.find({
              role: { $in: ["property_manager", "owner", "caretaker"] },
            });

            for (const user of eligibleUsers) {
              await sendPropertyRequestNotification(
                user.email,
                user.name,
                newRequest
              );
            }
          } catch (emailError) {
            console.error(
              "Error sending property request notifications:",
              emailError
            );
            // Don't fail the request if email sending fails
          }
          await sendWhatsAppReply(
            from,
            `Thank you! Your request has been received. We'll share it with our large network of property developers, managers, and owners. You can follow up or see more properties at decatron.com.ng.`
          );
          await setUserState(from, "menu", {
            name: "",
            email: "",
            role: "",
            tempRequest: {},
          });
          return res.sendStatus(200);
        }

        // Fallback
        await sendWhatsAppReply(
          from,
          `Sorry, I didn't understand that. Please type 'Hello' to start.`
        );
        await setUserState(from, "menu", {
          name: "",
          email: "",
          role: "",
          tempRequest: {},
        });
      }
    }

    return res.sendStatus(200);
  }
};

module.exports = { whatsappWebhook };
