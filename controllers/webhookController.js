const PropertyRequest = require("../models/PropertyRequest");

const User = require("../models/User");
const {
  sendPropertyRequestNotification,
} = require("../utils/emails/propertyRequestNotification");
const { normalizePhoneNumber } = require("../utils/phoneNumberUtils");

// Import extracted utilities
const { sendWhatsAppReply } = require("../utils/whatsapp/whatsappUtils");
const {
  getUserStep,
  setUserState,
  getUserData,
} = require("../utils/webhook/userStateUtils");
const {
  getStates,
  getLGAsByState,
  getPropertyUsages,
  getPropertyTypes,
  getPropertyCategories,
} = require("../utils/webhook/dataFetchers");
const {
  formatNumberedOptions,
  getOptionByNumber,
  wordToNumber,
  isPropertyRequestRelevantToUser,
} = require("../utils/webhook/inputProcessors");

const TOTAL_STEPS = 8;

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
            "Self Contain",
            "Flat",
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
              // Check if user's interests match the property request
              const isRelevant = isPropertyRequestRelevantToUser(
                user,
                newRequest
              );

              if (isRelevant) {
                await sendPropertyRequestNotification(
                  user.email,
                  user.name,
                  newRequest
                );
                console.log(
                  `Sent notification to ${user.email} - Request matches their interests`
                );
              } else {
                console.log(
                  `Skipped ${user.email} - Request doesn't match their interests`
                );
              }
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
            `Thank you, ${userData.name}! Your request has been received. We'll share it with our network of property developers, managers, agents, and owners.\n\n            You can follow up or see more properties at https://decatron.com.ng\n\n            If you need help, email us at contact@decatron.com.ng`
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
