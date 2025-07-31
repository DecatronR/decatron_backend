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

// Helper: Check if property request is relevant to a user based on their interests
function isPropertyRequestRelevantToUser(user, propertyRequest) {
  // Check if user has the required arrays
  if (!user.state || !user.lga || !user.listingType) {
    console.log(`User ${user.email} missing interest arrays, skipping`);
    return false;
  }

  // Check state match
  const stateMatch = user.state.includes(propertyRequest.state);
  if (!stateMatch) {
    console.log(
      `State mismatch: User has ${user.state}, request is for ${propertyRequest.state}`
    );
    return false;
  }

  // Check LGA match
  const lgaMatch = user.lga.includes(propertyRequest.lga);
  if (!lgaMatch) {
    console.log(
      `LGA mismatch: User has ${user.lga}, request is for ${propertyRequest.lga}`
    );
    return false;
  }

  // Check listing type match
  const listingTypeMatch = user.listingType.includes(propertyRequest.category);
  if (!listingTypeMatch) {
    console.log(
      `Listing type mismatch: User has ${user.listingType}, request is for ${propertyRequest.category}`
    );
    return false;
  }

  // All conditions met
  console.log(
    `Perfect match for ${user.email}: State=${propertyRequest.state}, LGA=${propertyRequest.lga}, Category=${propertyRequest.category}`
  );
  return true;
}

module.exports = {
  formatNumberedOptions,
  getOptionByNumber,
  wordToNumber,
  isPropertyRequestRelevantToUser,
};
