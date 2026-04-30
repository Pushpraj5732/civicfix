import axios from "axios";
import Complaint from "../models/Complaint.js";

import StatusLog from "../models/StatusLog.js";
import Zone from "../models/Zone.js";
import { validationResult } from "express-validator";
import { getDateFilter } from "../utils/dateFilter.js";

// POST /api/complaints — Create complaint
export const createComplaint = async (req, res) => {
  // Check express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { issueType, description, address, zoneName } = req.body;

    // Find zone if provided
    let zoneId = null;
    if (zoneName) {
      const zone = await Zone.findOne({ name: zoneName });
      if (zone) zoneId = zone._id;
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      issueType,
      description,
      address,
      zone: zoneId,
      status: "PENDING",
    });

    // Create initial status log
    await StatusLog.create({
      complaint: complaint._id,
      oldStatus: "NONE",
      newStatus: "PENDING",
      changedBy: req.user._id,
    });

    res.status(201).json(complaint);
  } catch (err) {
    console.error("Create complaint error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/complaints/:id/upload-image — Upload before/after image + AI analysis
export const uploadImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'BEFORE' or 'AFTER'

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (type === "BEFORE" || type === "AFTER") {
      if (type === "BEFORE") complaint.beforeImage = imagePath;
      if (type === "AFTER") complaint.afterImage = imagePath;

      // AI analysis
      try {
        const aiUrl = process.env.AI_SERVICE_URL || "http://localhost:5001";
        const path = await import("path");
        const { fileURLToPath } = await import("url");
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join(__dirname, "..", "uploads", req.file.filename);

        const response = await axios.post(`${aiUrl}/analyze`, {
          imagePath: filePath,
          issueType: complaint.issueType,
          checkFix: type === "AFTER",
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': process.env.AI_SERVICE_SECRET || 'civic-fix-ai-top-secret'
          }
        });

        const aiResult = response.data;

        if (response.status === 200) { // Check for successful response
          if (type === "BEFORE") {
            complaint.aiVerified = aiResult.isReal;
            complaint.aiConfidence = aiResult.confidence;
            complaint.status = aiResult.isReal ? "APPROVED" : "REJECTED";
            await StatusLog.create({
              complaint: complaint._id,
              oldStatus: "PENDING",
              newStatus: complaint.status,
              changedBy: req.user._id,
              note: `AI ${aiResult.isReal ? "verified" : "rejected"} (conf: ${(aiResult.confidence * 100).toFixed(0)}%)`,
            });
          } else {
            // "AFTER" image - only log it, status update is usually manual but we can hint
            await StatusLog.create({
              complaint: complaint._id,
              oldStatus: complaint.status,
              newStatus: complaint.status,
              changedBy: req.user._id,
              note: `After-image AI check: ${aiResult.isReal ? "Resolution confirmed" : "Issue may still be present"}`,
            });
          }
        }
      } catch (aiErr) {
        console.warn("AI service failure, proceeding without AI flags");
        if (type === "BEFORE") complaint.status = "APPROVED"; // Fallback
      }
    }

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error("Upload image error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/complaints/stats — Get basic city-wide stats for all users
export const getPublicStats = async (req, res) => {
  try {
    const [total, pending, approved, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "PENDING" }),
      Complaint.countDocuments({ status: "APPROVED" }),
      Complaint.countDocuments({ status: "IN_PROGRESS" }),
      Complaint.countDocuments({ status: "RESOLVED" }),
    ]);

    res.json({
      total,
      pending,
      approved,
      inProgress,
      resolved,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/complaints — Get all complaints (with optional filters)
export const getComplaints = async (req, res) => {
  try {
    const { status, issueType, zone, range, startDate, endDate, search } = req.query;
    const filter = {};

    if (status && status !== "ALL") filter.status = status;
    if (issueType && issueType !== "ALL") filter.issueType = issueType;
    if (zone && zone !== "ALL") filter.zone = zone;

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const dateFilter = getDateFilter(range, startDate, endDate);
    Object.assign(filter, dateFilter);

    const complaints = await Complaint.find(filter)
      .populate("user", "name email")
      .populate("zone", "name")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/complaints/my — Get current user's complaints
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate("zone", "name")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/complaints/:id — Get single complaint
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("user", "name email")
      .populate("zone", "name");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Get status logs
    const statusLogs = await StatusLog.find({ complaint: complaint._id })
      .populate("changedBy", "name role")
      .sort({ createdAt: 1 });

    res.json({ complaint, statusLogs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/complaints/:id/status — Update complaint status
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, note } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const oldStatus = complaint.status;
    complaint.status = newStatus;
    await complaint.save();

    await StatusLog.create({
      complaint: complaint._id,
      oldStatus,
      newStatus,
      changedBy: req.user._id,
      note: note || "",
    });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/complaints/images/:id — Get complaint images
export const getComplaintImages = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const images = [];
    if (complaint.beforeImage) {
      images.push({ imageType: "BEFORE", imageUrl: complaint.beforeImage });
    }
    if (complaint.afterImage) {
      images.push({ imageType: "AFTER", imageUrl: complaint.afterImage });
    }

    res.json(images);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
