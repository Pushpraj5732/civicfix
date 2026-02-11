import mongoose from "mongoose";
import dotenv from "dotenv";
import Zone from "./models/Zone.js";
import User from "./models/User.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Zone.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️  Cleared existing zones and users");

    // Create zones
    const zones = await Zone.insertMany([
      { name: "Zone A", description: "North City Area" },
      { name: "Zone B", description: "South City Area" },
      { name: "Zone C", description: "East City Area" },
      { name: "Zone D", description: "West City Area" },
      { name: "Zone E", description: "Central City Area" },
    ]);
    console.log("🏙️  Created 5 zones");

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@civicfix.com",
      password: "admin123",
      role: "ADMIN",
    });
    console.log("👤 Created admin: admin@civicfix.com / admin123");

    // Create zone heads
    const zoneHead1 = await User.create({
      name: "Zone A Head",
      email: "zonea@civicfix.com",
      password: "zone123",
      role: "ZONE_HEAD",
      zone: zones[0]._id,
    });
    await Zone.findByIdAndUpdate(zones[0]._id, { head: zoneHead1._id });

    const zoneHead2 = await User.create({
      name: "Zone B Head",
      email: "zoneb@civicfix.com",
      password: "zone123",
      role: "ZONE_HEAD",
      zone: zones[1]._id,
    });
    await Zone.findByIdAndUpdate(zones[1]._id, { head: zoneHead2._id });

    console.log(
      "👤 Created zone heads: zonea@civicfix.com, zoneb@civicfix.com / zone123",
    );

    // Create a test user
    await User.create({
      name: "Test User",
      email: "user@civicfix.com",
      password: "user123",
      role: "USER",
    });
    console.log("👤 Created test user: user@civicfix.com / user123");

    console.log("\n✅ Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
