const PropertyRequest = require("../models/PropertyRequest");

const WhatsAppUserState = require("../models/WhatsAppUserState");
const User = require("../models/User");
const State = require("../models/State");
const LGA = require("../models/LGA");
const PropertyUsage = require("../models/PropertyUsage");
const PropertyType = require("../models/PropertyType");
const ListingType = require("../models/ListingType");
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
async function setUserState(phone, step, data = {}, previousStep = null) {
  console.log("setUserState called with phone:", phone, "step:", step);
  const existing = (await WhatsAppUserState.findOne({ phone })) || {};
  const previous = existing._doc || {};
  const mergedData = { ...previous, ...data, step, updatedAt: new Date() };
  console.log("setUserState: saving merged data for phone:", phone, mergedData);
  await WhatsAppUserState.findOneAndUpdate({ phone }, mergedData, {
    upsert: true,
  });
  return previousStep;
}

async function getUserData(phone) {
  console.log("getUserData called with phone:", phone);
  const record = await WhatsAppUserState.findOne({ phone });
  console.log("getUserData: found record for phone:", phone, record);
  return record || {};
}

// Dynamic data fetching functions
async function getStates() {
  try {
    const states = await State.find().select("state slug").sort("state");
    return states.map((state) => state.state);
  } catch (error) {
    console.error("Error fetching states:", error);
    return ["Abuja", "Lagos"]; // Fallback to hardcoded values
  }
}

async function getLGAsByState(stateName) {
  try {
    // First find the state to get its ObjectId
    const state = await State.findOne({ state: stateName });
    if (!state) {
      console.error(`State not found: ${stateName}`);
      return [];
    }

    console.log(
      `Found state: ${stateName}, ID: ${state._id}, Slug: ${state.slug}`
    );

    // Find LGAs for this state using the state's ObjectId
    // Try both ObjectId and string representation
    const lgas = await LGA.find({
      $or: [{ stateId: state._id.toString() }, { stateId: state._id }],
    })
      .select("lga slug stateId")
      .sort("lga");

    console.log(
      `Found ${lgas.length} LGAs for state ${stateName}:`,
      lgas.map((l) => ({ lga: l.lga, stateId: l.stateId }))
    );

    return lgas.map((lga) => lga.lga);
  } catch (error) {
    console.error("Error fetching LGAs:", error);
    return []; // Return empty array as fallback
  }
}

async function getPropertyUsages() {
  try {
    const usages = await PropertyUsage.find()
      .select("propertyUsage slug")
      .sort("propertyUsage");
    return usages.map((usage) => usage.propertyUsage);
  } catch (error) {
    console.error("Error fetching property usages:", error);
    return ["Residential", "Office Space", "Warehouse", "Shop"]; // Fallback
  }
}

async function getPropertyTypes() {
  try {
    const types = await PropertyType.find()
      .select("propertyType slug")
      .sort("propertyType");
    return types.map((type) => type.propertyType);
  } catch (error) {
    console.error("Error fetching property types:", error);
    return [
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
    ]; // Fallback
  }
}

async function getPropertyCategories() {
  try {
    const categories = await ListingType.find()
      .select("listingType slug")
      .sort("listingType");
    return categories.map((category) => category.listingType);
  } catch (error) {
    console.error("Error fetching property categories:", error);
    return ["Rent", "Sale", "Shortlet"]; // Fallback
  }
}

const TOTAL_STEPS = 8;

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

// Helper: Convert number words to numbers (supports one to ten, can be expanded)
function wordToNumber(word) {
  const map = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };
  const normalized = word.trim().toLowerCase();
  return map[normalized] !== undefined ? map[normalized] : null;
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
            `Thanks, ${bodyText}!\nStep 1 of ${TOTAL_STEPS}: What is your email address? (Type 0 to go back)`
          );
          await setUserState(from, "awaiting_email", { name: bodyText }, step);
          return res.sendStatus(200);
        }

        if (step === "awaiting_email") {
          if (bodyText === "0") {
            await setUserState(from, "awaiting_name", { email: "" }, null);
            await sendWhatsAppReply(from, "Please enter your full name:");
            return res.sendStatus(200);
          }
          if (!/^\S+@\S+\.\S+$/.test(bodyText)) {
            await sendWhatsAppReply(
              from,
              "Invalid email. Please enter a valid email address: (Type 0 to go back)"
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Great! Step 2 of ${TOTAL_STEPS}: What best describes you?\nReply with the number:\n1. Agent\n2. Buyer/Renter\n3. Owner\n4. Property Manager\n(Type 0 to go back)`
          );
          await setUserState(from, "awaiting_role", { email: bodyText }, step);
          return res.sendStatus(200);
        }

        if (step === "awaiting_role") {
          if (bodyText === "0") {
            await setUserState(from, "awaiting_email", { role: "" }, null);
            await sendWhatsAppReply(
              from,
              `Step 1 of ${TOTAL_STEPS}: What is your email address? (Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          const roleOptions = ["agent", "buyer", "owner", "property manager"];
          const roleInput = getOptionByNumber(roleOptions, bodyText);
          if (!roleInput) {
            await sendWhatsAppReply(
              from,
              `Invalid option. Please reply with the number:\n${formatNumberedOptions(
                ["Agent", "Buyer/Renter", "Owner", "Property Manager"]
              )}\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          const propertyCategories = await getPropertyCategories();
          await sendWhatsAppReply(
            from,
            `Awesome, ${userName}! Step 3 of ${TOTAL_STEPS}: What is the category of the property?\n${formatNumberedOptions(
              propertyCategories
            )}\n(Reply with the number)\n(Type 0 to go back)`
          );
          await setUserState(
            from,
            "awaiting_category",
            { role: roleInput },
            step
          );
          return res.sendStatus(200);
        }

        if (step === "awaiting_category") {
          if (bodyText === "0") {
            await setUserState(from, "awaiting_role", { category: "" }, null);
            await sendWhatsAppReply(
              from,
              `Step 2 of ${TOTAL_STEPS}: What best describes you?\n${formatNumberedOptions(
                ["Agent", "Buyer/Renter", "Owner", "Property Manager"]
              )}\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          const propertyCategories = await getPropertyCategories();
          const categoryInput = getOptionByNumber(propertyCategories, bodyText);
          if (!categoryInput) {
            await sendWhatsAppReply(
              from,
              `Invalid category. Please reply with the number:\n${formatNumberedOptions(
                propertyCategories
              )}\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          const propertyTypes = await getPropertyTypes();
          await sendWhatsAppReply(
            from,
            `Great! Step 4 of ${TOTAL_STEPS}: What type of property are you interested in?\n${formatNumberedOptions(
              propertyTypes
            )}\n(Reply with the number)\n(Type 0 to go back)`
          );
          await setUserState(
            from,
            "awaiting_property_type",
            {
              category: categoryInput,
            },
            step
          );
          return res.sendStatus(200);
        }

        if (step === "awaiting_property_type") {
          if (bodyText === "0") {
            await setUserState(
              from,
              "awaiting_category",
              { propertyType: "" },
              null
            );
            await sendWhatsAppReply(
              from,
              `Step 3 of ${TOTAL_STEPS}: What is the category of the property?\n${formatNumberedOptions(
                await getPropertyCategories()
              )}\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          const propertyTypes = await getPropertyTypes();
          const propertyTypeInput = getOptionByNumber(propertyTypes, bodyText);
          if (!propertyTypeInput) {
            await sendWhatsAppReply(
              from,
              `Invalid property type. Please reply with the number:\n${formatNumberedOptions(
                propertyTypes
              )}\n(Type 0 to go back)`
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
              `How many bedrooms do you want? (Type a number, e.g., 2. This is required.)\n(Type 0 to go back)`
            );
            await setUserState(
              from,
              "awaiting_bedrooms",
              {
                propertyType: propertyTypeInput,
              },
              step
            );
            return res.sendStatus(200);
          } else {
            // Non-residential, skip bedrooms
            const propertyUsages = await getPropertyUsages();
            await sendWhatsAppReply(
              from,
              `Thanks! Step 5 of ${TOTAL_STEPS}: What is the intended usage?\n${formatNumberedOptions(
                propertyUsages
              )}\n(Reply with the number)\n(Type 0 to go back)`
            );
            await setUserState(
              from,
              "awaiting_property_usage",
              {
                propertyType: propertyTypeInput,
                bedrooms: null,
              },
              step
            );
            return res.sendStatus(200);
          }
        }

        if (step === "awaiting_bedrooms") {
          if (bodyText === "0") {
            await setUserState(
              from,
              "awaiting_property_type",
              { bedrooms: null },
              null
            );
            const propertyTypes = await getPropertyTypes();
            await sendWhatsAppReply(
              from,
              `Step 4 of ${TOTAL_STEPS}: What type of property are you interested in?\n${formatNumberedOptions(
                propertyTypes
              )}\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          let bedrooms = null;
          // Try to convert number word to number if not a digit
          let input = bodyText;
          if (!/^\d+$/.test(input)) {
            const wordNum = wordToNumber(input);
            if (wordNum !== null) {
              input = String(wordNum);
            }
          }
          if (/^\d+$/.test(input)) {
            bedrooms = Number(input);
          } else {
            await sendWhatsAppReply(
              from,
              `Invalid input. Please reply with a number for bedrooms. (Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          const propertyUsages = await getPropertyUsages();
          await sendWhatsAppReply(
            from,
            `Thanks! Step 5 of ${TOTAL_STEPS}: What is the intended usage?\n${formatNumberedOptions(
              propertyUsages
            )}\n(Reply with the number)\n(Type 0 to go back)`
          );
          await setUserState(
            from,
            "awaiting_property_usage",
            {
              bedrooms,
            },
            step
          );
          return res.sendStatus(200);
        }

        if (step === "awaiting_property_usage") {
          if (bodyText === "0") {
            // Determine previous step based on property type
            const residentialTypes = [
              "Fully Detached Duplex",
              "Semi Detached Duplex",
              "Terrace Duplex",
              "Fully Detached Bungalow",
              "Semi Detached Bungalow",
              "Apartment",
              "Villa",
              "Self Contain",
              "Flat",
            ];
            let prevStep = "awaiting_property_type";
            if (
              userData.propertyType &&
              residentialTypes.includes(userData.propertyType)
            ) {
              prevStep = "awaiting_bedrooms";
            }
            await setUserState(from, prevStep, { propertyUsage: "" }, null);
            if (prevStep === "awaiting_bedrooms") {
              await sendWhatsAppReply(
                from,
                `How many bedrooms do you want? (Reply with a number, or type 'skip' if not applicable)\n(Type 0 to go back)`
              );
            } else {
              const propertyTypes = await getPropertyTypes();
              await sendWhatsAppReply(
                from,
                `Step 4 of ${TOTAL_STEPS}: What type of property are you interested in?\n${formatNumberedOptions(
                  propertyTypes
                )}\n(Type 0 to go back)`
              );
            }
            return res.sendStatus(200);
          }
          const propertyUsages = await getPropertyUsages();
          const propertyUsageInput = getOptionByNumber(
            propertyUsages,
            bodyText
          );
          if (!propertyUsageInput) {
            await sendWhatsAppReply(
              from,
              `Invalid usage. Please reply with the number:\n${formatNumberedOptions(
                propertyUsages
              )}\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Step 6 of ${TOTAL_STEPS}:\nWhat is your budget for this property?\n\n- If you have a maximum budget, just type the amount (e.g., 5000000).\n- If you have a range, type both amounts separated by a dash (e.g., 3000000 - 5000000).\n\n(Tip: If you enter one amount, we'll use it as your maximum budget.)\n(Type 0 to go back)`
          );
          await setUserState(
            from,
            "awaiting_budget_range",
            {
              propertyUsage: propertyUsageInput,
            },
            step
          );
          return res.sendStatus(200);
        }

        if (step === "awaiting_budget_range") {
          if (bodyText === "0") {
            await setUserState(
              from,
              "awaiting_property_usage",
              { minBudget: null, maxBudget: null },
              null
            );
            const propertyUsages = await getPropertyUsages();
            await sendWhatsAppReply(
              from,
              `Step 5 of ${TOTAL_STEPS}: What is the intended usage?\n${formatNumberedOptions(
                propertyUsages
              )}\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
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
              `Invalid budget format. Please reply with a single amount (e.g., 5000000) or a range (e.g., 3000000 - 5000000). (Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          const states = await getStates();
          await sendWhatsAppReply(
            from,
            `Almost done! Step 7 of ${TOTAL_STEPS}: Which state are you looking for a property in?\n${formatNumberedOptions(
              states
            )}\n(Reply with the number)\n(Type 0 to go back)`
          );
          await setUserState(
            from,
            "awaiting_state",
            { minBudget, maxBudget },
            step
          );
          return res.sendStatus(200);
        }

        if (step === "awaiting_state") {
          if (bodyText === "0") {
            await setUserState(
              from,
              "awaiting_budget_range",
              { state: "" },
              null
            );
            await sendWhatsAppReply(
              from,
              `Step 6 of ${TOTAL_STEPS}: What is your budget for this property?\n- If you have a maximum budget, just type the amount (e.g., 5000000).\n- If you have a range, type both amounts separated by a dash (e.g., 3000000 - 5000000).\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          const states = await getStates();
          const stateInput = getOptionByNumber(states, bodyText);
          if (!stateInput) {
            await sendWhatsAppReply(
              from,
              `Invalid state. Please reply with the number:\n${formatNumberedOptions(
                states
              )}\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          // Show LGAs for the selected state
          const selectedState = stateInput;
          const lgaOptions = await getLGAsByState(selectedState);
          await sendWhatsAppReply(
            from,
            `Great! Step 8 of ${TOTAL_STEPS}: Which Local Government Area (LGA)?\n${formatNumberedOptions(
              lgaOptions
            )}\n(Reply with the number)\n(Type 0 to go back)`
          );
          await setUserState(
            from,
            "awaiting_lga",
            { state: selectedState },
            step
          );
          return res.sendStatus(200);
        }

        if (step === "awaiting_lga") {
          if (bodyText === "0") {
            await setUserState(from, "awaiting_state", { lga: "" }, null);
            const states = await getStates();
            await sendWhatsAppReply(
              from,
              `Step 7 of ${TOTAL_STEPS}: Which state are you looking for a property in?\n${formatNumberedOptions(
                states
              )}\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          const userState = await getUserData(from);
          const selectedState = userState.state;
          const lgaOptions = await getLGAsByState(selectedState);
          const lgaInput = getOptionByNumber(lgaOptions, bodyText);
          if (!lgaInput) {
            await sendWhatsAppReply(
              from,
              `Invalid LGA. Please reply with the number:\n${formatNumberedOptions(
                lgaOptions
              )}\n(If you want to start over, type 'restart' or 0 to go back)`
            );
            return res.sendStatus(200);
          }
          // Show neighbourhood prompt
          await sendWhatsAppReply(
            from,
            `Thanks! Which neighbourhood in ${selectedState}?\n(Please enter the specific neighbourhood or area)\n(Type 0 to go back)`
          );
          await setUserState(
            from,
            "awaiting_neighbourhood",
            { lga: lgaInput },
            step
          );
          return res.sendStatus(200);
        }

        if (step === "awaiting_neighbourhood") {
          if (bodyText === "0") {
            await setUserState(
              from,
              "awaiting_lga",
              { neighbourhood: "" },
              null
            );
            const userState = await getUserData(from);
            const selectedState = userState.state;
            const lgaOptions = await getLGAsByState(selectedState);
            await sendWhatsAppReply(
              from,
              `Step 8 of ${TOTAL_STEPS}: Which Local Government Area (LGA)?\n${formatNumberedOptions(
                lgaOptions
              )}\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
          if (!bodyText) {
            await sendWhatsAppReply(
              from,
              "Neighbourhood cannot be empty. Please enter the neighbourhood: (Type 0 to go back)"
            );
            return res.sendStatus(200);
          }
          await sendWhatsAppReply(
            from,
            `Any additional notes or requirements? (You can reply 'none' if not) (Type 0 to go back)`
          );
          await setUserState(
            from,
            "awaiting_notes",
            {
              neighbourhood: bodyText,
            },
            step
          );
          return res.sendStatus(200);
        }

        if (step === "awaiting_notes") {
          if (bodyText === "0") {
            await setUserState(
              from,
              "awaiting_neighbourhood",
              { note: "" },
              null
            );
            const userState = await getUserData(from);
            const selectedState = userState.state;
            await sendWhatsAppReply(
              from,
              `Which neighbourhood in ${selectedState}?\n(Please enter the specific neighbourhood or area)\n(Type 0 to go back)`
            );
            return res.sendStatus(200);
          }
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
            `Thank you, ${userData.name}! Your request has been received. We'll share it with our network of property developers, managers, and owners.\n\n            You can follow up or see more properties at https://decatron.com.ng\n\n            If you need help, email us at contact@decatron.com.ng`
          );
          await setUserState(
            from,
            "menu",
            {
              name: "",
              email: "",
              role: "",
              tempRequest: {},
            },
            step
          );
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

module.exports = { whatsappWebhook, sendWhatsAppReply };
