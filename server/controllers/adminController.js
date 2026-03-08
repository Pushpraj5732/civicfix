import Complaint from "../models/Complaint.js";
import Zone from "../models/Zone.js";

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

// GET /api/admin/stats — Dashboard stats with time range filter
export const getAdminStats = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range);

    const [total, pending, approved, inProgress, resolved, rejected] =
      await Promise.all([
        Complaint.countDocuments(dateFilter),
        Complaint.countDocuments({ status: "PENDING", ...dateFilter }),
        Complaint.countDocuments({ status: "APPROVED", ...dateFilter }),
        Complaint.countDocuments({ status: "IN_PROGRESS", ...dateFilter }),
        Complaint.countDocuments({ status: "RESOLVED", ...dateFilter }),
        Complaint.countDocuments({ status: "REJECTED", ...dateFilter }),
      ]);

    // Issue type breakdown
    const issueBreakdown = await Complaint.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$issueType", count: { $sum: 1 } } },
    ]);

    // Status breakdown
    const statusBreakdown = await Complaint.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Daily trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyTrend = await Complaint.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
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
      dailyTrend,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/zone-stats — Zone-wise analytics
export const getZoneStats = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range);

    const zones = await Zone.find().lean();

    const zoneStats = await Promise.all(
      zones.map(async (zone) => {
        const filter = { zone: zone._id, ...dateFilter };
        const [total, pending, inProgress, resolved] = await Promise.all([
          Complaint.countDocuments(filter),
          Complaint.countDocuments({ ...filter, status: "PENDING" }),
          Complaint.countDocuments({ ...filter, status: "IN_PROGRESS" }),
          Complaint.countDocuments({ ...filter, status: "RESOLVED" }),
        ]);

        return {
          zoneId: zone._id,
          zoneName: zone.name,
          total,
          pending,
          inProgress,
          resolved,
        };
      }),
    );

    res.json(zoneStats);
  } catch (err) {
    console.error("Zone stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/zones — Get all zones
export const getZones = async (req, res) => {
  try {
    const zones = await Zone.find().populate("head", "name email");
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
