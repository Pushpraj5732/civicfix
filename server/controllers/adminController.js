import Zone from "../models/Zone.js";
import { getDateFilter } from "../utils/dateFilter.js";
import { fillTrendGaps } from "../utils/chartHelper.js";

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
    const trendFilter = { createdAt: { $gte: thirtyDaysAgo } };
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
