import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";
import adminRoutes from "./routes/admin.js";
import zoneRoutes from "./routes/zone.js";
import Zone from "./models/Zone.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false // Set to false to allow local dev assets
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
});
app.use("/api/", limiter);

// Other Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/zone", zoneRoutes);

// PUBLIC: Get all zones (no auth required — used by Register & File Complaint)
app.get("/api/zones", async (req, res) => {
  try {
    const zones = await Zone.find().select("name description");
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ globalError: err.message, stack: err.stack });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
