import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import {
  getMyZoneStats,
  getZoneComplaints,
  updateZoneComplaintStatus,
} from "../services/zoneApi";
import ZoneStatusBarChart from "../components/charts/ZoneStatusBarChart";
import ZoneIssuePieChart from "../components/charts/ZoneIssuePieChart";

export default function ZoneHeadDashboard() {
  const { user } = useAuth();
  const [range, setRange] = useState("");
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchData = async (r) => {
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        getMyZoneStats(r),
        getZoneComplaints({ range: r }),
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range);
  }, [range]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateZoneComplaintStatus(id, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c)),
      );
      const statsRes = await getMyZoneStats(range);
      setStats(statsRes.data);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const ranges = [
    { value: "", label: "All Time" },
    { value: "1w", label: "1 Week" },
    { value: "1m", label: "1 Month" },
    { value: "6m", label: "6 Months" },
  ];

  const filteredComplaints =
    statusFilter === "ALL"
      ? complaints
      : complaints.filter((c) => c.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container flex items-center justify-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const metricCards = stats
    ? [
        {
          label: "Total",
          value: stats.total,
          icon: "📊",
          gradient: "from-blue-500 to-cyan-500",
          bg: "bg-blue-500/10",
        },
        {
          label: "Pending",
          value: stats.pending,
          icon: "⏳",
          gradient: "from-amber-500 to-orange-500",
          bg: "bg-amber-500/10",
        },
        {
          label: "In Progress",
          value: stats.inProgress,
          icon: "🔧",
          gradient: "from-sky-500 to-blue-500",
          bg: "bg-sky-500/10",
        },
        {
          label: "Resolved",
          value: stats.resolved,
          icon: "✅",
          gradient: "from-emerald-500 to-green-500",
          bg: "bg-emerald-500/10",
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="section-title mb-1">📍 Zone Dashboard</h2>
            <p className="text-muted text-sm">
              {user?.zone?.name || "Your Zone"} — managed by {user?.name}
            </p>
          </div>
          <div className="flex gap-2">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  range === r.value
                    ? "bg-primary-500/20 text-primary-500 dark:text-primary-400 border border-primary-500/30"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-dark-400 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {metricCards.map((m, i) => (
            <div
              key={i}
              className="glass-card p-5 text-center hover:border-primary-500/20 transition-all"
            >
              <div
                className={`w-10 h-10 ${m.bg} rounded-lg flex items-center justify-center mx-auto mb-2 text-lg`}
              >
                {m.icon}
              </div>
              <p className="text-muted text-xs font-medium">{m.label}</p>
              <p
                className={`text-2xl font-bold mt-1 bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent`}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-heading mb-4">
              Status Overview
            </h3>
            <ZoneStatusBarChart data={stats?.statusBreakdown} />
          </div>
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-heading mb-4">
              Issues Breakdown
            </h3>
            <ZoneIssuePieChart data={stats?.issueBreakdown} />
          </div>
        </div>

        {/* Complaints List */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-heading">
              Zone Complaints
            </h3>
            <div className="flex gap-2 flex-wrap">
              {["ALL", "APPROVED", "IN_PROGRESS", "RESOLVED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === s
                      ? "bg-primary-500/20 text-primary-500 dark:text-primary-400 border border-primary-500/30"
                      : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-dark-400 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted">No complaints found in this zone</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => (
                <div
                  key={c._id}
                  className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {c.issueType === "ROAD"
                            ? "🚗"
                            : c.issueType === "GARBAGE"
                              ? "🗑️"
                              : c.issueType === "DRAINAGE"
                                ? "🌊"
                                : "💡"}
                        </span>
                        <span className="text-heading font-medium">
                          {c.issueType.replace("_", " ")}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-muted text-sm line-clamp-1">
                        {c.description}
                      </p>
                      <p className="text-subtle text-xs mt-1">
                        by {c.user?.name} •{" "}
                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                        {c.aiVerified && (
                          <span className="ml-2 text-violet-500 dark:text-violet-400">
                            🤖 AI Verified
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 shrink-0">
                      {c.status === "APPROVED" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(c._id, "IN_PROGRESS")
                          }
                          className="px-3 py-1.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-all"
                        >
                          Start Work
                        </button>
                      )}
                      {c.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleStatusUpdate(c._id, "RESOLVED")}
                          className="px-3 py-1.5 bg-green-500/10 text-green-500 dark:text-green-400 border border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-all"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
