const mongoose = require("mongoose");
const path = require("path");

// Import your migration script
const { migrateStatesAndLGAs } = require("./state_lga");

// Get MongoDB URI from environment or use default
const MONGODB_URI =
  process.env.MONGO_DB_URI ||
  process.env.MONGO_DB_URI ||
  "mongodb+srv://koladeolukoya:0MhzthGQfAcbxky3@cluster0.lw4z1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// "mongodb://localhost:27017/decatron";

async function runMigration() {
  try {
    console.log("🚀 Starting States and LGAs Migration...");
    console.log("📡 Connecting to MongoDB...");
    console.log(
      `🔗 Connection URL: ${MONGODB_URI.replace(/\/\/.*@/, "//*****@")}`
    );

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully!");

    // Run the migration
    console.log("📥 Running migration...");
    await migrateStatesAndLGAs();

    console.log("🎉 Migration completed successfully!");
    console.log("📊 Check your database for the new states and LGAs");
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error("Error:", error.message);

    if (error.code === 11000) {
      console.error(
        "💡 This looks like a duplicate key error. Some data might already exist."
      );
    }

    if (error.message.includes("ECONNREFUSED")) {
      console.error(
        "💡 Cannot connect to MongoDB. Make sure MongoDB is running and the connection string is correct."
      );
    }
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("🔌 Database connection closed.");
    }
    process.exit(0);
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n⚠️  Migration interrupted");
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Run the migration
runMigration();
