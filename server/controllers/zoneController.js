import Complaint from "../models/Complaint.js";
import StatusLog from "../models/StatusLog.js";

// Helper: get date range filter
const getDateFilter = (range) => {
  if (!range) return {};
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
    default:
      return {};
  }
  return { createdAt: { $gte: startDate } };
};

// GET /api/zone/my-stats — Zone head's own zone stats
export const getMyZoneStats = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range);
    const zoneId = req.user.zone;

    if (!zoneId) {
      return res.status(400).json({ message: "No zone assigned to this user" });
    }

    const filter = { zone: zoneId, ...dateFilter };

    const [total, pending, approved, inProgress, resolved, rejected] =
      await Promise.all([
        Complaint.countDocuments(filter),
        Complaint.countDocuments({ ...filter, status: "PENDING" }),
        Complaint.countDocuments({ ...filter, status: "APPROVED" }),
        Complaint.countDocuments({ ...filter, status: "IN_PROGRESS" }),
        Complaint.countDocuments({ ...filter, status: "RESOLVED" }),
        Complaint.countDocuments({ ...filter, status: "REJECTED" }),
      ]);

    // Issue type breakdown for this zone
    const issueBreakdown = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$issueType", count: { $sum: 1 } } },
    ]);

    // Status breakdown for this zone
    const statusBreakdown = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      pending,
      approved,
      inProgress,
      resolved,
      rejected,
      issueBreakdown,
      statusBreakdown,
    });
  } catch (err) {
    console.error("Zone stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/zone/complaints — Get only this zone's complaints
export const getZoneComplaints = async (req, res) => {
  try {
    const zoneId = req.user.zone;
    if (!zoneId) {
      return res.status(400).json({ message: "No zone assigned" });
    }

    const { status, range } = req.query;
    const filter = { zone: zoneId };
    if (status) filter.status = status;

    const dateFilter = getDateFilter(range);
    Object.assign(filter, dateFilter);

    const complaints = await Complaint.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/zone/complaints/:id/status — Zone head updates complaint status
export const updateZoneComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, note } = req.body;
    const zoneId = req.user.zone;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Ensure complaint belongs to this zone
    if (complaint.zone && complaint.zone.toString() !== zoneId.toString()) {
      return res
        .status(403)
        .json({ message: "This complaint does not belong to your zone" });
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
    console.error("Update zone complaint status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
