import Complaint from "../models/Complaint.js";
import StatusLog from "../models/StatusLog.js";
import Zone from "../models/Zone.js";

// POST /api/complaints — Create complaint
export const createComplaint = async (req, res) => {
  try {
    const { issueType, description, latitude, longitude, zoneName } = req.body;

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
      latitude,
      longitude,
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

    if (type === "BEFORE") {
      complaint.beforeImage = imagePath;

      // Try AI analysis
      try {
        const aiUrl = process.env.AI_SERVICE_URL || "http://localhost:5001";
        const formData = new FormData();
        const fs = await import("fs");
        const path = await import("path");
        const { fileURLToPath } = await import("url");
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          req.file.filename,
        );

        const response = await fetch(`${aiUrl}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imagePath: filePath,
            issueType: complaint.issueType,
          }),
        });

        if (response.ok) {
          const aiResult = await response.json();
          complaint.aiVerified = aiResult.isReal;
          complaint.aiConfidence = aiResult.confidence;
          complaint.aiDetectedIssue = aiResult.detectedIssue;

          if (aiResult.isReal) {
            complaint.status = "APPROVED";
            await StatusLog.create({
              complaint: complaint._id,
              oldStatus: "PENDING",
              newStatus: "APPROVED",
              changedBy: req.user._id,
              note: `AI verified (confidence: ${(aiResult.confidence * 100).toFixed(1)}%)`,
            });
          } else {
            complaint.status = "REJECTED";
            await StatusLog.create({
              complaint: complaint._id,
              oldStatus: "PENDING",
              newStatus: "REJECTED",
              changedBy: req.user._id,
              note: `AI rejected (confidence: ${(aiResult.confidence * 100).toFixed(1)}%)`,
            });
          }
        } else {
          // AI service not available – auto-approve
          complaint.status = "APPROVED";
          complaint.aiVerified = false;
          await StatusLog.create({
            complaint: complaint._id,
            oldStatus: "PENDING",
            newStatus: "APPROVED",
            changedBy: req.user._id,
            note: "Auto-approved (AI service unavailable)",
          });
        }
      } catch (aiErr) {
        // AI service error – auto-approve
        console.warn("AI service unavailable:", aiErr.message);
        complaint.status = "APPROVED";
        complaint.aiVerified = false;
        await StatusLog.create({
          complaint: complaint._id,
          oldStatus: "PENDING",
          newStatus: "APPROVED",
          changedBy: req.user._id,
          note: "Auto-approved (AI service unavailable)",
        });
      }
    } else if (type === "AFTER") {
      complaint.afterImage = imagePath;
    }

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error("Upload image error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/complaints — Get all complaints (with optional filters)
export const getComplaints = async (req, res) => {
  try {
    const { status, issueType, zone, range } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (issueType) filter.issueType = issueType;
    if (zone) filter.zone = zone;

    // Time range filter
    if (range) {
      const now = new Date();
      let startDate;
      switch (range) {
        case "1w":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "1m":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "6m":
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
      }
      if (startDate) filter.createdAt = { $gte: startDate };
    }

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
