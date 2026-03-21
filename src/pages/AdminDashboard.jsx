import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { getAdminStats, getZoneStats } from "../services/zoneApi";
import { getComplaints, updateComplaintStatus } from "../services/complaintApi";
import StatusBarChart from "../components/charts/StatusBarChart";
import IssuePieChart from "../components/charts/IssuePieChart";
import ZoneBarChart from "../components/charts/ZoneBarChart";
import TrendLineChart from "../components/charts/TrendLineChart";
import { gsap } from "gsap";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ISSUE_ICONS = {
  ROAD: "🚗",
  GARBAGE: "🗑️",
  DRAINAGE: "🌊",
  STREET_LIGHT: "💡",
};

const STATUS_TRANSITIONS = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
  REJECTED: ["APPROVED"],
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [range, setRange] = useState("");
  const [stats, setStats] = useState(null);
  const [zoneStats, setZoneStats] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Complaints tab state
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [issueFilter, setIssueFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const cardsRef = useRef(null);

  // ── Analytics fetch ──────────────────────────────────────────────────────
  const fetchAnalytics = async (r) => {
    try {
      const [statsRes, zoneRes] = await Promise.all([
        getAdminStats(r),
        getZoneStats(r),
      ]);
      setStats(statsRes.data);
      setZoneStats(zoneRes.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  // ── Complaints fetch ─────────────────────────────────────────────────────
  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const params = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (issueFilter !== "ALL") params.issueType = issueFilter;
      if (searchQuery) params.search = searchQuery;
      if (range) params.range = range;
      
      const res = await getComplaints(params);
      setComplaints(res.data);
      
      // GSAP Animation
      setTimeout(() => {
        if (cardsRef.current) {
          gsap.fromTo(
            cardsRef.current.children,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
          );
        }
      }, 50);
    } catch (err) {
      console.error("Complaints fetch error:", err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "complaints") {
      const timer = setTimeout(fetchComplaints, 300); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [activeTab, statusFilter, issueFilter, searchQuery]);

  // ── Status update ────────────────────────────────────────────────────────
  const handleStatusUpdate = async (id, newStatus) => {
    setUpdateError("");
    setUpdateSuccess("");
    setUpdatingId(id);
    try {
      await updateComplaintStatus(id, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c)),
      );
      setUpdateSuccess(`Status updated to ${newStatus}`);
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch (err) {
      setUpdateError("Failed to update status. Please try again.");
      setTimeout(() => setUpdateError(""), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const ranges = [
    { value: "", label: "All Time" },
    { value: "1w", label: "1 Week" },
    { value: "1m", label: "1 Month" },
    { value: "6m", label: "6 Months" },
  ];

  const metricCards = stats
    ? [
        { label: "Total", value: stats.total, icon: "📊", gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { label: "Pending", value: stats.pending, icon: "⏳", gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        { label: "Approved", value: stats.approved, icon: "✅", gradient: "from-violet-500 to-purple-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
        { label: "In Progress", value: stats.inProgress, icon: "🔧", gradient: "from-sky-500 to-blue-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
        { label: "Resolved", value: stats.resolved, icon: "🎉", gradient: "from-emerald-500 to-green-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { label: "Rejected", value: stats.rejected, icon: "❌", gradient: "from-red-500 to-rose-500", bg: "bg-red-500/10", border: "border-red-500/20" },
      ]
    : [];

  if (analyticsLoading && activeTab === "analytics") {
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
    <div className="min-h-screen pb-12">
      <Navbar />
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-4">
          <div>
            <h2 className="section-title mb-1">⚙️ Admin Dashboard</h2>
            <p className="text-muted text-sm">City-wide complaint analytics & management</p>
          </div>
          {activeTab === "analytics" && (
            <div className="flex flex-wrap gap-2">
              {ranges.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    range === r.value
                      ? "bg-primary-500/20 text-primary-500 border border-primary-500/30"
                      : "bg-gray-100 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: "analytics", label: "📊 Analytics" },
            { id: "complaints", label: "📋 All Complaints" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10 hover:border-primary-500/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Analytics Content */}
        {activeTab === "analytics" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {metricCards.map((m, i) => (
                <div key={i} className={`relative overflow-hidden glass-card p-5 text-center transition-all hover:-translate-y-1 border ${m.border}`}>
                  <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${m.bg} blur-2xl opacity-50`} />
                  <div className={`relative z-10 w-12 h-12 ${m.bg} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl`}>{m.icon}</div>
                  <p className="relative z-10 text-muted text-xs font-bold uppercase tracking-wider mb-1">{m.label}</p>
                  <p className={`relative z-10 text-3xl font-black bg-gradient-to-br ${m.gradient} bg-clip-text text-transparent`}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3 glass-card p-6 border border-primary-500/10">
                <h3 className="text-xl font-bold text-heading mb-6 flex items-center gap-2">📈 Global Incident Trajectory</h3>
                <div className="h-72"><TrendLineChart data={stats?.dailyTrend} /></div>
              </div>
              <div className="lg:col-span-2 glass-card p-6 border border-emerald-500/10">
                <h3 className="text-xl font-bold text-heading mb-6 flex items-center gap-2">📊 Status Breakdown</h3>
                <div className="h-72"><StatusBarChart data={stats?.statusBreakdown} /></div>
              </div>
              <div className="glass-card p-6 border border-violet-500/10">
                <h3 className="text-xl font-bold text-heading mb-6 flex items-center gap-2">🎯 Issue Breakdown</h3>
                <div className="h-72 flex items-center justify-center"><IssuePieChart data={stats?.issueBreakdown} /></div>
              </div>
            </div>

            <div className="glass-card p-6 shadow-sm">
              <h3 className="text-xl font-bold text-heading mb-6 flex items-center gap-2">📍 Zone Analytics</h3>
              <div className="h-80"><ZoneBarChart data={zoneStats} /></div>
            </div>
          </div>
        )}

        {/* Complaints Content */}
        {activeTab === "complaints" && (
          <div className="animate-fade-in space-y-6">
            <div className="glass-card p-6 border border-primary-500/10">
              <h3 className="text-xl font-bold text-heading mb-6">🔍 Multi-Factor Intelligence Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search descriptions, locations, user names..."
                    className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/50 outline-none"
                  />
                </div>
                <div>
                   <label className="text-xs font-bold text-muted uppercase block mb-2">Status</label>
                   <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm"
                   >
                     {["ALL", "PENDING", "APPROVED", "IN_PROGRESS", "RESOLVED", "REJECTED"].map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase block mb-2">Issue Type</label>
                  <select 
                    value={issueFilter} 
                    onChange={(e) => setIssueFilter(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm"
                  >
                    {["ALL", "ROAD", "GARBAGE", "DRAINAGE", "STREET_LIGHT"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {updateError && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl border border-red-500/20">⚠️ {updateError}</div>}
            {updateSuccess && <div className="bg-green-500/10 text-green-500 p-4 rounded-xl border border-green-500/20">✅ {updateSuccess}</div>}

            {complaintsLoading ? (
               <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>
            ) : (
              <div className="space-y-4" ref={cardsRef}>
                {complaints.length === 0 ? (
                  <div className="py-20 text-center text-muted">No complaints match your filters</div>
                ) : (
                  complaints.map((c) => {
                    const nextStatuses = STATUS_TRANSITIONS[c.status] || [];
                    return (
                      <div key={c._id} className="glass-card p-4 border border-gray-200 dark:border-white/5 hover:border-primary-500/20 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex gap-4 min-w-0">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 bg-gray-100 dark:bg-white/5 flex items-center justify-center text-2xl">
                              {c.beforeImage ? <img src={`${API_BASE}${c.beforeImage}`} className="w-full h-full object-cover" /> : ISSUE_ICONS[c.issueType]}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-bold text-heading">{ISSUE_ICONS[c.issueType]} {c.issueType}</span>
                                <StatusBadge status={c.status} />
                                {c.aiVerified && <span className="text-[10px] bg-violet-500/10 text-violet-500 px-2 rounded-full border border-violet-500/20">🤖 AI SECURE</span>}
                              </div>
                              <p className="text-sm text-body line-clamp-1">{c.description}</p>
                              <div className="flex gap-3 mt-1 text-[10px] text-muted font-medium">
                                <span>👤 {c.user?.name}</span>
                                {c.zone?.name && <span>📍 {c.zone.name}</span>}
                                <span>🕒 {new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0 overflow-x-auto pb-2 md:pb-0">
                            {nextStatuses.map((ns) => (
                              <button
                                key={ns}
                                disabled={updatingId === c._id}
                                onClick={() => handleStatusUpdate(c._id, ns)}
                                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-primary-500/30 text-primary-500 hover:bg-primary-500 hover:text-white transition-all disabled:opacity-50"
                              >
                                {updatingId === c._id ? "..." : ns}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
