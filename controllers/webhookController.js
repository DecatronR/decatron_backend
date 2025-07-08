const PropertyRequest = require("../models/PropertyRequest");
const WhatsAppUserState = require("../models/WhatsAppUserState");
const User = require("../models/User");
const {
  sendPropertyRequestNotification,
} = require("../utils/emails/propertyRequestNotification");
const { normalizePhoneNumber } = require("../utils/phoneNumberUtils");
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
async function getUserStep(phone) {
  const record = await WhatsAppUserState.findOne({ phone });
  return record ? record.step : "menu";
}

// Updated setUserState to merge data and use 'step' for flow
async function setUserState(phone, step, data = {}) {
  console.log("setUserState called with phone:", phone, "step:", step);
  const existing = (await WhatsAppUserState.findOne({ phone })) || {};
  const previous = existing._doc || {};
  const mergedData = { ...previous, ...data, step, updatedAt: new Date() };
  console.log("setUserState: saving merged data for phone:", phone, mergedData);
  await WhatsAppUserState.findOneAndUpdate({ phone }, mergedData, {
    upsert: true,
  });
}

async function getUserData(phone) {
  console.log("getUserData called with phone:", phone);
  const record = await WhatsAppUserState.findOne({ phone });
  console.log("getUserData: found record for phone:", phone, record);
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
    "Gwarinpa, 5th Avenue)",
    "Wuse 2",
    "Asokoro",
    "Garki Area 11, Area 3",
    "Maitama Amazon St)",
  ],
  Lagos: [
    "Ikeja GRA, Oduduwa Crescent)",
    "Lekki Phase 1, Admiralty Way, Fola Osibo Rd",
    "Victoria Island, Akin Adesola St, Ahmadu Bello Way)",
    "Yaba",
    "Surulere, Bode Thomas St",
  ],
};

// Helper to format numbered options
function formatNumberedOptions(options) {
  return options.map((opt, idx) => `${idx + 1}. ${opt}`).join("\n");
}

// Helper to get option by number
function getOptionByNumber(options, input) {
  const idx = Number(input) - 1;
  if (!isNaN(idx) && idx >= 0 && idx < options.length) {
    return options[idx];
  }
  return null;
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
        const rawFrom = message.from; // Phone number without 'whatsapp:' prefix
        const from = normalizePhoneNumber(rawFrom); // Normalize the phone number
        const bodyText = (message.text?.body || "").trim();

        // Debug: Log phone number format
        console.log("=== PHONE NUMBER DEBUG ===");
        console.log("Raw phone number from WhatsApp:", rawFrom);
        console.log("Normalized phone number:", from);
        console.log("Phone number type:", typeof from);
        console.log("Phone number length:", from.length);
        console.log("==========================");

        // Get user step from MongoDB
        let step = await getUserStep(from);
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
            category: "",
            propertyType: "",
            bedrooms: null,
            propertyUsage: "",
            minBudget: null,
            maxBudget: null,
            state: "",
            lga: "",
            neighbourhood: "",
            note: "",
            tempRequest: {},
          });
          return res.sendStatus(200);
        }

        if (/^(hi|hello)$/i.test(bodyText)) {
          step = "menu";
        }

        if (step === "menu") {
          await sendWhatsAppReply(
            from,
            `Hi! Welcome to Decatron.\nLet's help you make a property request.\nTo begin, please enter your full name:`
          );
          await setUserState(from, "awaiting_name", {
            name: "",
            email: "",
            role: "",
            category: "",
            propertyType: "",
            bedrooms: null,
            propertyUsage: "",
            minBudget: null,
            maxBudget: null,
            state: "",
            lga: "",
            neighbourhood: "",
            note: "",
            tempRequest: {},
          });
          return res.sendStatus(200);
        }

        if (step === "awaiting_name") {
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

        if (step === "awaiting_email") {
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

        if (step === "awaiting_role") {
          const roleOptions = ["agent", "buyer", "owner", "property manager"];
          const roleInput = getOptionByNumber(roleOptions, bodyText);
          if (!roleInput) {
            await sendWhatsAppReply(
              from,
              `Invalid option. Please reply with the number:\n${formatNumberedOptions(
                ["Agent", "Buyer/Renter", "Owner", "Property Manager"]
              )}`
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Awesome, ${userName}! Step 3 of ${TOTAL_STEPS}: What is the category of the property?\n${formatNumberedOptions(
              PROPERTY_CATEGORIES
            )}\n(Reply with the number)`
          );
          await setUserState(from, "awaiting_category", { role: roleInput });
          return res.sendStatus(200);
        }

        if (step === "awaiting_category") {
          const categoryInput = getOptionByNumber(
            PROPERTY_CATEGORIES,
            bodyText
          );
          if (!categoryInput) {
            await sendWhatsAppReply(
              from,
              `Invalid category. Please reply with the number:\n${formatNumberedOptions(
                PROPERTY_CATEGORIES
              )}`
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Great! Step 4 of ${TOTAL_STEPS}: What type of property are you interested in?\n${formatNumberedOptions(
              PROPERTY_TYPES
            )}\n(Reply with the number)`
          );
          await setUserState(from, "awaiting_property_type", {
            category: categoryInput,
          });
          return res.sendStatus(200);
        }

        if (step === "awaiting_property_type") {
          const propertyTypeInput = getOptionByNumber(PROPERTY_TYPES, bodyText);
          if (!propertyTypeInput) {
            await sendWhatsAppReply(
              from,
              `Invalid property type. Please reply with the number:\n${formatNumberedOptions(
                PROPERTY_TYPES
              )}`
            );
            return res.sendStatus(200);
          }
          // Determine if property type is residential
          const residentialTypes = [
            "Fully Detached Duplex",
            "Semi Detached Duplex",
            "Terrace Duplex",
            "Fully Detached Bungalow",
            "Semi Detached Bungalow",
            "Apartment",
            "Villa",
          ];
          if (residentialTypes.includes(propertyTypeInput)) {
            await sendWhatsAppReply(
              from,
              `How many bedrooms do you want? (Reply with a number, or type 'skip' if not applicable)`
            );
            await setUserState(from, "awaiting_bedrooms", {
              propertyType: propertyTypeInput,
            });
            return res.sendStatus(200);
          } else {
            // Non-residential, skip bedrooms
            await sendWhatsAppReply(
              from,
              `Thanks! Step 5 of ${TOTAL_STEPS}: What is the intended usage?\n${formatNumberedOptions(
                PROPERTY_USAGES
              )}\n(Reply with the number)`
            );
            await setUserState(from, "awaiting_property_usage", {
              propertyType: propertyTypeInput,
              bedrooms: null,
            });
            return res.sendStatus(200);
          }
        }

        if (step === "awaiting_bedrooms") {
          let bedrooms = null;
          if (/^skip$/i.test(bodyText)) {
            bedrooms = null;
          } else if (/^\d+$/.test(bodyText)) {
            bedrooms = Number(bodyText);
          } else {
            await sendWhatsAppReply(
              from,
              `Invalid input. Please reply with a number for bedrooms, or type 'skip' if not applicable.`
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Thanks! Step 5 of ${TOTAL_STEPS}: What is the intended usage?\n${formatNumberedOptions(
              PROPERTY_USAGES
            )}\n(Reply with the number)`
          );
          await setUserState(from, "awaiting_property_usage", {
            bedrooms,
          });
          return res.sendStatus(200);
        }

        if (step === "awaiting_property_usage") {
          const propertyUsageInput = getOptionByNumber(
            PROPERTY_USAGES,
            bodyText
          );
          if (!propertyUsageInput) {
            await sendWhatsAppReply(
              from,
              `Invalid usage. Please reply with the number:\n${formatNumberedOptions(
                PROPERTY_USAGES
              )}`
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Step 6 of ${TOTAL_STEPS}:\nWhat is your budget for this property?\n\n- If you have a maximum budget, just type the amount (e.g., 5000000).\n- If you have a range, type both amounts separated by a dash (e.g., 3000000 - 5000000).\n\n(Tip: If you enter one amount, we'll use it as your maximum budget.)`
          );
          await setUserState(from, "awaiting_budget_range", {
            propertyUsage: propertyUsageInput,
          });
          return res.sendStatus(200);
        }

        if (step === "awaiting_budget_range") {
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
              `Invalid budget format. Please reply with a single amount (e.g., 5000000) or a range (e.g., 3000000 - 5000000).`
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Almost done! Step 7 of ${TOTAL_STEPS}: Which state are you looking for a property in?\n${formatNumberedOptions(
              STATES
            )}\n(Reply with the number)`
          );
          await setUserState(from, "awaiting_state", { minBudget, maxBudget });
          return res.sendStatus(200);
        }

        if (step === "awaiting_state") {
          const stateInput = getOptionByNumber(STATES, bodyText);
          if (!stateInput) {
            await sendWhatsAppReply(
              from,
              `Invalid state. Please reply with the number:\n${formatNumberedOptions(
                STATES
              )}`
            );
            return res.sendStatus(200);
          }
          // Show LGAs for the selected state
          const selectedState = stateInput;
          const lgaOptions = LGAS[selectedState] || [];
          await sendWhatsAppReply(
            from,
            `Great! Step 8 of ${TOTAL_STEPS}: Which Local Government Area (LGA)?\n${formatNumberedOptions(
              lgaOptions
            )}\n(Reply with the number)`
          );
          await setUserState(from, "awaiting_lga", { state: selectedState });
          return res.sendStatus(200);
        }

        if (step === "awaiting_lga") {
          const userState = await getUserData(from);
          const selectedState = userState.state;
          const lgaOptions = LGAS[selectedState] || [];
          // Debug logs for investigation
          console.log("userState in LGA step:", userState);
          console.log("selectedState in LGA step:", selectedState);
          console.log("lgaOptions in LGA step:", lgaOptions);
          const lgaInput = getOptionByNumber(lgaOptions, bodyText);
          if (!lgaInput) {
            await sendWhatsAppReply(
              from,
              `Invalid LGA. Please reply with the number:\n${formatNumberedOptions(
                lgaOptions
              )}\n(If you want to start over, type 'restart')`
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
          await setUserState(from, "awaiting_neighbourhood", { lga: lgaInput });
          return res.sendStatus(200);
        }

        if (step === "awaiting_neighbourhood") {
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

        if (step === "awaiting_notes") {
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
            bedrooms: userData.bedrooms,
            note,
            phone: from, // This is now the normalized phone number
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
          category: "",
          propertyType: "",
          bedrooms: null,
          propertyUsage: "",
          minBudget: null,
          maxBudget: null,
          state: "",
          lga: "",
          neighbourhood: "",
          note: "",
          tempRequest: {},
        });
      }
    }

    return res.sendStatus(200);
  }
};

module.exports = { whatsappWebhook };
