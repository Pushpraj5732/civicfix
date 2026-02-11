import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Zone from "./models/Zone.js";
import Complaint from "./models/Complaint.js";
import StatusLog from "./models/StatusLog.js";

dotenv.config();

// Helper: random date within last N days
const randomDate = (daysBack) => {
  const now = Date.now();
  return new Date(now - Math.random() * daysBack * 24 * 60 * 60 * 1000);
};

// Anand, Gujarat — real nearby locations mapped to zones
const locationsByZone = {
  "Zone A": [
    { lat: 22.5565, lng: 72.955, area: "Vallabh Vidyanagar" },
    { lat: 22.558, lng: 72.962, area: "Bhaikaka Statue" },
    { lat: 22.554, lng: 72.958, area: "GCET Campus Road" },
    { lat: 22.56, lng: 72.956, area: "Bakrol Road" },
    { lat: 22.553, lng: 72.961, area: "CVM Campus" },
    { lat: 22.559, lng: 72.954, area: "VV Nagar Bus Stand" },
  ],
  "Zone B": [
    { lat: 22.5645, lng: 72.928, area: "Anand Railway Station" },
    { lat: 22.567, lng: 72.931, area: "Station Road" },
    { lat: 22.563, lng: 72.925, area: "Ganesh Chowkdi" },
    { lat: 22.566, lng: 72.934, area: "Lambhvel Road" },
    { lat: 22.562, lng: 72.929, area: "Anand Town Hall" },
    { lat: 22.565, lng: 72.927, area: "Grid Char Rasta" },
  ],
  "Zone C": [
    { lat: 22.573, lng: 72.94, area: "Amul Dairy" },
    { lat: 22.571, lng: 72.943, area: "NDDB Chowk" },
    { lat: 22.575, lng: 72.938, area: "Amul Parlour Road" },
    { lat: 22.572, lng: 72.945, area: "IRMA Road" },
    { lat: 22.574, lng: 72.941, area: "AAU Campus" },
    { lat: 22.57, lng: 72.946, area: "Karamsad Road" },
  ],
  "Zone D": [
    { lat: 22.55, lng: 72.97, area: "Vidyanagar Main Road" },
    { lat: 22.548, lng: 72.973, area: "New Vidyanagar" },
    { lat: 22.552, lng: 72.968, area: "BVM College" },
    { lat: 22.549, lng: 72.975, area: "Borsad Chowkdi" },
    { lat: 22.551, lng: 72.971, area: "Mogri Road" },
    { lat: 22.547, lng: 72.976, area: "Vitthal Udyognagar" },
  ],
  "Zone E": [
    { lat: 22.58, lng: 72.915, area: "Gamdi" },
    { lat: 22.578, lng: 72.918, area: "Anand-Sojitra Road" },
    { lat: 22.582, lng: 72.913, area: "Sardar Patel Statue" },
    { lat: 22.579, lng: 72.92, area: "Milk Mandir Road" },
    { lat: 22.581, lng: 72.916, area: "Anand Vidhyalaya" },
    { lat: 22.577, lng: 72.922, area: "GIDC Anand" },
  ],
};

const descriptions = {
  ROAD: [
    "Large pothole on the main road causing traffic issues",
    "Road surface completely damaged after heavy rains",
    "Deep crack across the road near school zone — dangerous for kids",
    "Multiple potholes on the connecting road, bikes skidding daily",
    "Road caved in near the drainage — half the lane is blocked",
    "Broken speed breaker creating accidents at night",
    "Uneven road surface near the market area, very bumpy",
    "Road collapsed near construction site, needs urgent repair",
  ],
  GARBAGE: [
    "Garbage pile on the street corner for 3 days, stinking badly",
    "Overflowing dustbin near the park, attracting stray animals",
    "Construction debris dumped on the roadside illegally",
    "Plastic waste accumulated near the nala, blocking water flow",
    "Open garbage dump near residential area, health hazard",
    "Waste not collected for a week in our society",
    "Garbage burning happening openly causing air pollution",
    "Dead animal carcass lying on the road, not cleared",
  ],
  DRAINAGE: [
    "Open drain overflowing onto the road, dirty water everywhere",
    "Blocked drainage causing waterlogging in the entire street",
    "Sewer line broken, sewage water mixing with road",
    "Manhole cover missing on the main road — very dangerous",
    "Storm drain blocked with trash, floods during every rain",
    "Drainage water seeping into basement of houses",
  ],
  STREET_LIGHT: [
    "Street light not working for 2 weeks, entire stretch is dark at night",
    "Broken street light pole leaning dangerously over the road",
    "Flickering street light near the intersection causing visibility issues",
    "No street light in the new society lane, unsafe at night",
    "All 4 lights in our area went out after the storm",
    "Street light stays on during day, wasting electricity",
  ],
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear everything
    await Complaint.deleteMany({});
    await StatusLog.deleteMany({});
    await Zone.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️  Cleared all data (users, zones, complaints, status logs)");

    // Create 5 zones (Anand city areas)
    const zones = await Zone.insertMany([
      { name: "Zone A", description: "Vallabh Vidyanagar Area" },
      { name: "Zone B", description: "Anand Station & Town Area" },
      { name: "Zone C", description: "Amul Dairy & NDDB Area" },
      { name: "Zone D", description: "Vidyanagar & Borsad Road" },
      { name: "Zone E", description: "Gamdi & Sojitra Road Area" },
    ]);
    console.log("🏙️  Created 5 zones (Anand city)");

    // Create 1 Admin
    const admin = await User.create({
      name: "Admin",
      email: "admin@civicfix.com",
      password: "admin123",
      role: "ADMIN",
    });
    console.log("👤 Admin: admin@civicfix.com / admin123");

    // Create 5 Zone Heads (one per zone)
    const zoneHeadData = [
      {
        name: "Zone A Head",
        email: "zonea@civicfix.com",
        password: "zone123",
        zone: zones[0]._id,
      },
      {
        name: "Zone B Head",
        email: "zoneb@civicfix.com",
        password: "zone123",
        zone: zones[1]._id,
      },
      {
        name: "Zone C Head",
        email: "zonec@civicfix.com",
        password: "zone123",
        zone: zones[2]._id,
      },
      {
        name: "Zone D Head",
        email: "zoned@civicfix.com",
        password: "zone123",
        zone: zones[3]._id,
      },
      {
        name: "Zone E Head",
        email: "zonee@civicfix.com",
        password: "zone123",
        zone: zones[4]._id,
      },
    ];

    const zoneHeads = [];
    for (const zh of zoneHeadData) {
      const head = await User.create({
        name: zh.name,
        email: zh.email,
        password: zh.password,
        role: "ZONE_HEAD",
        zone: zh.zone,
      });
      await Zone.findByIdAndUpdate(zh.zone, { head: head._id });
      zoneHeads.push(head);
    }
    console.log("📍 Zone Heads: zonea@ to zonee@civicfix.com / zone123");

    // Create 5 citizen users
    const citizens = [];
    const citizenData = [
      { name: "Test User", email: "user@civicfix.com" },
      { name: "Rahul Patel", email: "rahul@civicfix.com" },
      { name: "Priya Shah", email: "priya@civicfix.com" },
      { name: "Amit Desai", email: "amit@civicfix.com" },
      { name: "Sneha Modi", email: "sneha@civicfix.com" },
    ];

    for (const cd of citizenData) {
      const c = await User.create({
        name: cd.name,
        email: cd.email,
        password: "user123",
        role: "USER",
      });
      citizens.push(c);
    }
    console.log(
      "👤 Citizens: user@, rahul@, priya@, amit@, sneha@civicfix.com / user123",
    );

    // ================================
    // Generate 30 complaints
    // ================================

    const issueTypes = ["ROAD", "GARBAGE", "DRAINAGE", "STREET_LIGHT"];

    // Status distribution: 4 PENDING, 5 APPROVED, 3 REJECTED, 8 IN_PROGRESS, 10 RESOLVED
    const statusDistribution = [
      ...Array(4).fill("PENDING"),
      ...Array(5).fill("APPROVED"),
      ...Array(3).fill("REJECTED"),
      ...Array(8).fill("IN_PROGRESS"),
      ...Array(10).fill("RESOLVED"),
    ];

    // Shuffle statuses
    for (let i = statusDistribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [statusDistribution[i], statusDistribution[j]] = [
        statusDistribution[j],
        statusDistribution[i],
      ];
    }

    const zoneNames = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E"];
    let complaintCount = 0;

    for (let i = 0; i < 30; i++) {
      const zoneIdx = i % 5;
      const zone = zones[zoneIdx];
      const zoneName = zoneNames[zoneIdx];
      const issueType = issueTypes[i % 4];
      const targetStatus = statusDistribution[i];
      const citizen = citizens[i % 5];
      const zoneHead = zoneHeads[zoneIdx];

      // Pick a location
      const locs = locationsByZone[zoneName];
      const loc = locs[i % locs.length];

      // Pick a description
      const descs = descriptions[issueType];
      const desc = descs[i % descs.length];

      // Random date in last 60 days
      const createdAt = randomDate(60);

      const complaint = await Complaint.create({
        user: citizen._id,
        issueType,
        description: `${desc} (near ${loc.area})`,
        latitude: loc.lat + (Math.random() - 0.5) * 0.003,
        longitude: loc.lng + (Math.random() - 0.5) * 0.003,
        zone: zone._id,
        status: targetStatus,
        aiVerified: targetStatus !== "PENDING",
        aiConfidence:
          targetStatus !== "PENDING" ? 0.72 + Math.random() * 0.25 : 0,
        aiDetectedIssue:
          targetStatus !== "PENDING"
            ? issueType.toLowerCase().replace("_", " ")
            : null,
        createdAt,
        updatedAt: createdAt,
      });

      // Create status logs (realistic timeline)
      await StatusLog.create({
        complaint: complaint._id,
        oldStatus: "NONE",
        newStatus: "PENDING",
        changedBy: citizen._id,
        createdAt,
      });

      if (targetStatus !== "PENDING") {
        const approvedAt = new Date(createdAt.getTime() + 1000 * 60 * 5);
        const isApproved = targetStatus !== "REJECTED";

        await StatusLog.create({
          complaint: complaint._id,
          oldStatus: "PENDING",
          newStatus: isApproved ? "APPROVED" : "REJECTED",
          changedBy: citizen._id,
          note: isApproved
            ? `AI verified (confidence: ${(complaint.aiConfidence * 100).toFixed(1)}%)`
            : `AI rejected (confidence: ${(complaint.aiConfidence * 100).toFixed(1)}%)`,
          createdAt: approvedAt,
        });

        if (targetStatus === "IN_PROGRESS" || targetStatus === "RESOLVED") {
          const inProgressAt = new Date(
            approvedAt.getTime() + 1000 * 60 * 60 * 12,
          );
          await StatusLog.create({
            complaint: complaint._id,
            oldStatus: "APPROVED",
            newStatus: "IN_PROGRESS",
            changedBy: zoneHead._id,
            note: "Zone head started work on this issue",
            createdAt: inProgressAt,
          });

          if (targetStatus === "RESOLVED") {
            const resolvedAt = new Date(
              inProgressAt.getTime() + 1000 * 60 * 60 * 48,
            );
            await StatusLog.create({
              complaint: complaint._id,
              oldStatus: "IN_PROGRESS",
              newStatus: "RESOLVED",
              changedBy: zoneHead._id,
              note: "Issue has been fixed and verified on site",
              createdAt: resolvedAt,
            });
          }
        }
      }

      complaintCount++;
    }

    console.log(`\n� Created ${complaintCount} complaints with status logs:`);
    console.log(
      "   4 PENDING | 5 APPROVED | 3 REJECTED | 8 IN_PROGRESS | 10 RESOLVED",
    );
    console.log(
      "   6 per zone | All issue types | Locations around Anand, Gujarat",
    );

    console.log("\n✅ Seed completed! Database ready for analytics.");
    console.log("\n🔑 Credentials:");
    console.log("   Admin:     admin@civicfix.com / admin123");
    console.log("   Zone A-E:  zone[a-e]@civicfix.com / zone123");
    console.log("   Citizens:  user@civicfix.com / user123");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seed();
