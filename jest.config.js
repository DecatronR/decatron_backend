module.exports = {
  // Other Jest configuration options
  setupFilesAfterEnv: ["./tests/test-setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/public/assets/libs/"],
  //   globalTeardown: "./tests/teardown.js",
};
