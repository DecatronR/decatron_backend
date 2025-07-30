const { MongoClient } = require("mongodb");
const path = require("path");

async function normalizePhoneNumbers() {
  // Load .env from the project root (parent directory of scripts)
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

  // Check if the environment variable exists
  const mongoUri = process.env.MONGO_DB_URI;
  if (!mongoUri) {
    console.error("MONGO_DB_URI environment variable is not set");
    console.error(
      "Make sure you're running this from the project root directory"
    );
    console.error("Current directory:", process.cwd());
    console.error("Looking for .env at:", path.join(__dirname, "..", ".env"));
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully");

    // List all databases
    const adminDb = client.db("admin");
    const databases = await adminDb.admin().listDatabases();
    console.log("Available databases:");
    databases.databases.forEach((db) => {
      console.log(`  - ${db.name} (${db.sizeOnDisk} bytes)`);
    });

    const db = client.db("test");

    // List all collections in the test database
    const collections = await db.listCollections().toArray();
    console.log("\nCollections in 'test' database:");
    collections.forEach((col) => {
      console.log(`  - ${col.name}`);
    });

    const users = db.collection("users");

    console.log("Starting phone number normalization...");

    // First, let's see how many users we have
    const totalUsers = await users.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);

    const usersWithPhone = await users.countDocuments({
      phone: { $exists: true, $ne: null },
    });
    console.log(`Users with phone numbers: ${usersWithPhone}`);

    // Show some sample phone numbers
    const sampleUsers = await users
      .find({ phone: { $exists: true, $ne: null } })
      .limit(5)
      .toArray();
    console.log("Sample phone numbers:");
    sampleUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.phone} (${typeof user.phone})`);
    });

    const cursor = users.find({ phone: { $exists: true, $ne: null } });

    let updatedCount = 0;
    let totalProcessed = 0;

    for await (const user of cursor) {
      totalProcessed++;
      const originalPhone = user.phone;
      const normalized = normalizePhone(originalPhone);

      if (normalized && normalized !== originalPhone) {
        await users.updateOne(
          { _id: user._id },
          {
            $set: { phone: normalized },
          }
        );
        console.log(`Updated: ${originalPhone} -> ${normalized}`);
        updatedCount++;
      }
    }

    console.log(`\nNormalization complete!`);
    console.log(`Total users processed: ${totalProcessed}`);
    console.log(`Phone numbers updated: ${updatedCount}`);
  } catch (error) {
    console.error("Error during normalization:", error);
    throw error;
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

function normalizePhone(phone) {
  if (!phone) return null;

  let normalized = phone.replace(/^whatsapp:/i, "");
  normalized = normalized.replace(/\s+/g, "").replace(/[^\d]/g, "");

  if (normalized.startsWith("0")) {
    normalized = "234" + normalized.slice(1);
  }

  if (normalized.startsWith("+234")) {
    normalized = normalized.slice(1);
  }

  if (normalized.startsWith("234") && normalized.length === 13) {
    return normalized;
  }

  // fallback
  return normalized;
}

normalizePhoneNumbers().catch(console.error);
