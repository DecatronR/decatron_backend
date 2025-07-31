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

module.exports = {
  formatNumberedOptions,
  getOptionByNumber,
  wordToNumber,
};
