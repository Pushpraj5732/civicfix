import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getAdminStats, getZoneStats } from "../services/zoneApi";
import StatusBarChart from "../components/charts/StatusBarChart";
import IssuePieChart from "../components/charts/IssuePieChart";
import ZoneBarChart from "../components/charts/ZoneBarChart";

export default function AdminDashboard() {
  const [range, setRange] = useState("");
  const [stats, setStats] = useState(null);
  const [zoneStats, setZoneStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (r) => {
    try {
      const [statsRes, zoneRes] = await Promise.all([
        getAdminStats(r),
        getZoneStats(r),
      ]);
      setStats(statsRes.data);
      setZoneStats(zoneRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range);
  }, [range]);

  const ranges = [
    { value: "", label: "All Time" },
    { value: "1w", label: "1 Week" },
    { value: "1m", label: "1 Month" },
    { value: "6m", label: "6 Months" },
  ];

  const metricCards = stats
    ? [
        {
          label: "Total",
          value: stats.total,
          icon: "📊",
          gradient: "from-blue-500 to-cyan-500",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
        },
        {
          label: "Pending",
          value: stats.pending,
          icon: "⏳",
          gradient: "from-amber-500 to-orange-500",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
        },
        {
          label: "Approved",
          value: stats.approved,
          icon: "✅",
          gradient: "from-violet-500 to-purple-500",
          bg: "bg-violet-500/10",
          border: "border-violet-500/20",
        },
        {
          label: "In Progress",
          value: stats.inProgress,
          icon: "🔧",
          gradient: "from-sky-500 to-blue-500",
          bg: "bg-sky-500/10",
          border: "border-sky-500/20",
        },
        {
          label: "Resolved",
          value: stats.resolved,
          icon: "🎉",
          gradient: "from-emerald-500 to-green-500",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
        },
        {
          label: "Rejected",
          value: stats.rejected,
          icon: "❌",
          gradient: "from-red-500 to-rose-500",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
        },
      ]
    : [];

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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="section-title mb-1">⚙️ Admin Dashboard</h2>
            <p className="text-muted text-sm">City-wide complaint analytics</p>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {metricCards.map((m, i) => (
            <div
              key={i}
              className={`glass-card p-4 text-center ${m.border} border hover:shadow-lg transition-all`}
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
              Complaints by Status
            </h3>
            <StatusBarChart data={stats?.statusBreakdown} />
          </div>
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-heading mb-4">
              Complaints by Issue Type
            </h3>
            <IssuePieChart data={stats?.issueBreakdown} />
          </div>
        </div>

        {/* Zone Stats Chart */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-heading mb-4">
            📍 Zone-wise Analytics
          </h3>
          <ZoneBarChart data={zoneStats} />
        </div>

        {/* Zone Table */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-heading mb-4">
            Zone Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left py-3 px-4 text-muted font-medium">
                    Zone
                  </th>
                  <th className="text-center py-3 px-4 text-muted font-medium">
                    Total
                  </th>
                  <th className="text-center py-3 px-4 text-muted font-medium">
                    Pending
                  </th>
                  <th className="text-center py-3 px-4 text-muted font-medium">
                    In Progress
                  </th>
                  <th className="text-center py-3 px-4 text-muted font-medium">
                    Resolved
                  </th>
                  <th className="text-center py-3 px-4 text-muted font-medium">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {zoneStats.map((z) => (
                  <tr
                    key={z.zoneId}
                    className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-heading font-medium">
                      {z.zoneName}
                    </td>
                    <td className="py-3 px-4 text-center text-body">
                      {z.total}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-amber-500/10 text-amber-500 dark:text-amber-400 px-2 py-0.5 rounded text-xs">
                        {z.pending}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded text-xs">
                        {z.inProgress}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-green-500/10 text-green-500 dark:text-green-400 px-2 py-0.5 rounded text-xs">
                        {z.resolved}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-primary-500 dark:text-primary-400 font-semibold">
                        {z.total > 0
                          ? ((z.resolved / z.total) * 100).toFixed(0)
                          : 0}
                        %
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
