import StatusLog from "../models/StatusLog.js";
import Complaint from "../models/Complaint.js";
import { getDateFilter } from "../utils/dateFilter.js";
import { fillTrendGaps } from "../utils/chartHelper.js";

// GET /api/zone/my-stats — Zone head's own zone stats
export const getMyZoneStats = async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;
    const dateFilter = getDateFilter(range, startDate, endDate);
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

    // Daily trend (last 30 days, always fixed 30d window scoped to zone)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trendFilter = { zone: zoneId, createdAt: { $gte: thirtyDaysAgo } };
    const rawTrend = await Complaint.aggregate([
      { $match: trendFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyTrend = fillTrendGaps(rawTrend, 30);

    res.json({
      total,
      pending,
      approved,
      inProgress,
      resolved,
      rejected,
      issueBreakdown,
      statusBreakdown,
      dailyTrend,
    });
  } catch (err) {
    console.error("Zone stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/zone/complaints — Get only this zone's complaints with filters
export const getZoneComplaints = async (req, res) => {
  try {
    const zoneId = req.user.zone;
    if (!zoneId) {
      return res.status(400).json({ message: "No zone assigned" });
    }

    const { status, range, startDate, endDate, issueType, search } = req.query;
    const filter = { zone: zoneId };

    if (status && status !== "ALL") filter.status = status;
    if (issueType && issueType !== "ALL") filter.issueType = issueType;

    const dateFilter = getDateFilter(range, startDate, endDate);
    Object.assign(filter, dateFilter);

    // Safe search — only text fields, no _id tricks
    if (search && search.trim()) {
      filter.$or = [
        { description: { $regex: search.trim(), $options: "i" } },
        { address: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Zone complaints error:", err);
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

    if (!zoneId) {
      return res.status(403).json({ message: "You are not assigned to a zone." });
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
    res.status(500).json({ message: err.message || "Server error" });
  }
};
