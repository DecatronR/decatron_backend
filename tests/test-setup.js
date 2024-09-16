const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env.test" });

const mongoTestUri = process.env.MONGO_TEST_URI;

const setupDatabase = async () => {
  // Check if mongoose is already connected
  if (mongoose.connection.readyState === 0) {
    // Connect to the test database
    await mongoose.connect(mongoTestUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  // Clear database before each test runs
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
  }
};

const teardownDatabase = async () => {
  // Disconnect from the database if connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

module.exports = {
  setupDatabase,
  teardownDatabase,
};
