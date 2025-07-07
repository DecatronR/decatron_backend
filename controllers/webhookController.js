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

const PROPERTY_CATEGORIES = ["Rent", "Sale", "Shortlet"];
const PROPERTY_TYPES = [
  "Fully Detached Duplex",
  "Semi Detached Duplex",
  "Terrace Duplex",
  "Fully Detached Bungalow",
  "Semi Detached Bungalow",
  "Apartment",
  "Mall/Plaza",
  "Villa",
  "Estate Land",
  "Non-Estate Land",
];
const PROPERTY_USAGES = ["Residential", "Office Space", "Warehouse", "Shop"];
const STATES = ["Abuja", "Lagos"];
const LGAS = {
  Abuja: ["Abaji", "Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali"],
  Lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere",
  ],
};
// You can expand STATES, and optionally add LGA/Neighbourhood options per state

const TOTAL_STEPS = 8;

// Add neighbourhood examples for each state (more detailed)
const NEIGHBOURHOOD_EXAMPLES = {
  Abuja: [
    "Gwarinpa (e.g., 6th Avenue, 7th Avenue)",
    "Maitama (e.g., Mississippi St, Amazon St)",
    "Wuse (e.g., Wuse 2, Wuse Zone 6)",
    "Asokoro (e.g., Yakubu Gowon Crescent)",
    "Garki (e.g., Area 11, Area 3)",
  ],
  Lagos: [
    "Ikeja GRA (e.g., Isaac John St, Oduduwa Crescent)",
    "Lekki Phase 1 (e.g., Admiralty Way, Fola Osibo Rd)",
    "Victoria Island (e.g., Akin Adesola St, Ahmadu Bello Way)",
    "Yaba (e.g., Alagomeji, Sabo)",
    "Surulere (e.g., Bode Thomas St, Ogunlana Dr)",
  ],
};

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
        const userName = userData.name || "there";

        if (/^(restart|start over)$/i.test(bodyText)) {
          await sendWhatsAppReply(
            from,
            `You've chosen to restart the property request process. Let's begin again!\nPlease enter your full name:`
          );
          await setUserState(from, "awaiting_name", {
            name: "",
            email: "",
            role: "",
            tempRequest: {},
          });
          return res.sendStatus(200);
        }

        if (/^(hi|hello)$/i.test(bodyText)) {
          state = "menu";
        }

        if (state === "menu") {
          await sendWhatsAppReply(
            from,
            `Hi! Welcome to Decatron.\nLet's help you make a property request.\nTo begin, please enter your full name:`
          );
          await setUserState(from, "awaiting_name", {
            name: "",
            email: "",
            role: "",
            tempRequest: {},
          });
          return res.sendStatus(200);
        }

        if (state === "awaiting_name") {
          if (!bodyText) {
            await sendWhatsAppReply(
              from,
              "Name cannot be empty. Please enter your full name:"
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Thanks, ${bodyText}!\nStep 1 of ${TOTAL_STEPS}: What is your email address?`
          );
          await setUserState(from, "awaiting_email", { name: bodyText });
          return res.sendStatus(200);
        }

        if (state === "awaiting_email") {
          if (!/^\S+@\S+\.\S+$/.test(bodyText)) {
            await sendWhatsAppReply(
              from,
              "Invalid email. Please enter a valid email address:"
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Great! Step 2 of ${TOTAL_STEPS}: What best describes you?\nReply with the number:\n1. Agent\n2. Buyer/Renter\n3. Owner\n4. Property Manager`
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
              role = "buyer";
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
            `Awesome, ${userName}! Step 3 of ${TOTAL_STEPS}: What is the category of the property?\nOptions: ${PROPERTY_CATEGORIES.join(
              ", "
            )}`
          );
          await setUserState(from, "awaiting_category", { role });
          return res.sendStatus(200);
        }

        if (state === "awaiting_category") {
          if (
            !PROPERTY_CATEGORIES.map((c) => c.toLowerCase()).includes(
              bodyText.toLowerCase()
            )
          ) {
            await sendWhatsAppReply(
              from,
              `Invalid category. Please reply with one of: ${PROPERTY_CATEGORIES.join(
                ", "
              )}`
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Great! Step 4 of ${TOTAL_STEPS}: What type of property are you interested in?\nOptions: ${PROPERTY_TYPES.join(
              ", "
            )}`
          );
          await setUserState(from, "awaiting_property_type", {
            category: bodyText,
          });
          return res.sendStatus(200);
        }

        if (state === "awaiting_property_type") {
          if (
            !PROPERTY_TYPES.map((t) => t.toLowerCase()).includes(
              bodyText.toLowerCase()
            )
          ) {
            await sendWhatsAppReply(
              from,
              `Invalid property type. Please reply with one of: ${PROPERTY_TYPES.join(
                ", "
              )}`
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Thanks! Step 5 of ${TOTAL_STEPS}: What is the intended usage?\nOptions: ${PROPERTY_USAGES.join(
              ", "
            )}`
          );
          await setUserState(from, "awaiting_property_usage", {
            propertyType: bodyText,
          });
          return res.sendStatus(200);
        }

        if (state === "awaiting_property_usage") {
          if (
            !PROPERTY_USAGES.map((u) => u.toLowerCase()).includes(
              bodyText.toLowerCase()
            )
          ) {
            await sendWhatsAppReply(
              from,
              `Invalid usage. Please reply with one of: ${PROPERTY_USAGES.join(
                ", "
              )}`
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Step 6 of ${TOTAL_STEPS}:
            What is your budget for this property?

            - If you have a maximum budget, just type the amount (e.g., 5000000).
            - If you have a range, type both amounts separated by a dash (e.g., 3000000 - 5000000).

            (Tip: If you enter one amount, we’ll use it as your maximum budget.)`
          );
          await setUserState(from, "awaiting_budget_range", {
            propertyUsage: bodyText,
          });
          return res.sendStatus(200);
        }

        if (state === "awaiting_budget_range") {
          // Parse budget or budget range
          let minBudget = null;
          let maxBudget = null;
          const rangeMatch = bodyText.match(/(\d{3,})(?:\s*-\s*(\d{3,}))?/);
          if (rangeMatch) {
            if (rangeMatch[2]) {
              minBudget = Number(rangeMatch[1]);
              maxBudget = Number(rangeMatch[2]);
              if (minBudget > maxBudget) {
                [minBudget, maxBudget] = [maxBudget, minBudget];
              }
            } else {
              maxBudget = Number(rangeMatch[1]);
            }
          }
          if (!maxBudget) {
            await sendWhatsAppReply(
              from,
              "Invalid budget format. Please reply with a single number (e.g., 5000000) or a range (e.g., 3000000 - 5000000)."
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Almost done! Step 7 of ${TOTAL_STEPS}: Which state is the property located in?\nOptions: ${STATES.join(
              ", "
            )}`
          );
          await setUserState(from, "awaiting_state", { minBudget, maxBudget });
          return res.sendStatus(200);
        }

        if (state === "awaiting_state") {
          if (
            !STATES.map((s) => s.toLowerCase()).includes(bodyText.toLowerCase())
          ) {
            await sendWhatsAppReply(
              from,
              `Invalid state. Please reply with one of: ${STATES.join(", ")}`
            );
            return res.sendStatus(200);
          }
          // Show LGAs for the selected state
          const selectedState = STATES.find(
            (s) => s.toLowerCase() === bodyText.toLowerCase()
          );
          const lgaOptions = LGAS[selectedState] || [];
          await sendWhatsAppReply(
            from,
            `Great! Step 8 of ${TOTAL_STEPS}: Which Local Government Area (LGA)?\nOptions for ${selectedState}: ${lgaOptions.join(
              ", "
            )}`
          );
          await setUserState(from, "awaiting_lga", { state: selectedState });
          return res.sendStatus(200);
        }

        if (state === "awaiting_lga") {
          const userState = await getUserData(from);
          const selectedState = userState.state;
          const lgaOptions = LGAS[selectedState] || [];
          // Normalize input and options for comparison
          const normalizedInput = bodyText.trim().toLowerCase();
          const normalizedLgas = lgaOptions.map((l) => l.trim().toLowerCase());
          if (!bodyText || !normalizedLgas.includes(normalizedInput)) {
            await sendWhatsAppReply(
              from,
              `Invalid LGA. Please reply with one of: ${lgaOptions.join(", ")}`
            );
            // Stay in the same state and let the user try again
            return res.sendStatus(200);
          }
          // Show neighbourhood examples for the selected state
          const neighbourhoodExamples =
            NEIGHBOURHOOD_EXAMPLES[selectedState] || [];
          await sendWhatsAppReply(
            from,
            `Thanks! Which neighbourhood?\nExamples for ${selectedState}: ${neighbourhoodExamples.join(
              ", "
            )}`
          );
          await setUserState(from, "awaiting_neighbourhood", { lga: bodyText });
          return res.sendStatus(200);
        }

        if (state === "awaiting_neighbourhood") {
          if (!bodyText) {
            await sendWhatsAppReply(
              from,
              "Neighbourhood cannot be empty. Please enter the neighbourhood:"
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Any additional notes or requirements? (You can reply 'none' if not)`
          );
          await setUserState(from, "awaiting_notes", {
            neighbourhood: bodyText,
          });
          return res.sendStatus(200);
        }

        if (state === "awaiting_notes") {
          // Save to DB
          userData = await getUserData(from);
          const note = bodyText.toLowerCase() === "none" ? "" : bodyText;
          const newRequest = await PropertyRequest.create({
            propertyType: userData.propertyType,
            category: userData.category,
            propertyUsage: userData.propertyUsage,
            minBudget: userData.minBudget,
            maxBudget: userData.maxBudget,
            state: userData.state,
            lga: userData.lga,
            neighbourhood: userData.neighbourhood,
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
              role: {
                $in: ["property_manager", "owner", "caretaker", "agent"],
              },
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
            `Thank you, ${userData.name}! Your request has been received. We'll share it with our network of property developers, managers, and owners.

            You can follow up or see more properties at https://decatron.com.ng

            If you need help, email us at contact@decatron.com.ng`
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
