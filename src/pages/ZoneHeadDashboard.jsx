import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import {
  getMyZoneStats,
  getZoneComplaints,
  updateZoneComplaintStatus,
} from "../services/zoneApi";
import { uploadAfterImage } from "../services/complaintApi";
import ZoneStatusBarChart from "../components/charts/ZoneStatusBarChart";
import ZoneIssuePieChart from "../components/charts/ZoneIssuePieChart";
import TrendLineChart from "../components/charts/TrendLineChart";
import { gsap } from "gsap";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ISSUE_ICONS = {
  ROAD: "🚗",
  GARBAGE: "🗑️",
  DRAINAGE: "🌊",
  STREET_LIGHT: "💡",
};

export default function ZoneHeadDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");
  const [range, setRange] = useState("");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [complaintsLoading, setComplaintsLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [issueFilter, setIssueFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Expand / Resolve state
  const [expandedId, setExpandedId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const cardsRef = useRef(null);

  // ── Analytics fetch ──────────────────────────────────────────────────────
  const fetchAnalytics = async (r, start = customStart, end = customEnd) => {
    try {
      const params = {};
      // Custom date range takes priority — never send both
      if (start && end) {
        params.startDate = start;
        params.endDate = end;
      } else if (r) {
        params.range = r;
      }
      const res = await getMyZoneStats(params);
      setStats(res.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    const bothDatesSet = customStart && customEnd;
    const noDates = !customStart && !customEnd;
    if (bothDatesSet || noDates) {
      fetchAnalytics(range, customStart, customEnd);
    }
  }, [range, customStart, customEnd]);

  // ── Complaints fetch ─────────────────────────────────────────────────────
  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const params = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (issueFilter !== "ALL") params.issueType = issueFilter;
      if (searchQuery) params.search = searchQuery;

      // Custom date range takes priority — never send both
      if (customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      } else if (range) {
        params.range = range;
      }

      const res = await getZoneComplaints(params);
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
      console.error("Zone complaints fetch error:", err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "complaints") {
      const bothDatesSet = customStart && customEnd;
      const noDates = !customStart && !customEnd;
      if (bothDatesSet || noDates) {
        const timer = setTimeout(fetchComplaints, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [activeTab, statusFilter, issueFilter, searchQuery, range, customStart, customEnd]);

  // ── Status update ────────────────────────────────────────────────────────
  const handleStatusUpdate = async (id, newStatus) => {
    setUpdateError("");
    setUpdateSuccess("");
    try {
      await updateZoneComplaintStatus(id, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
      );
      setUpdateSuccess(`Work ${newStatus === "IN_PROGRESS" ? "started" : "updated"} successfully!`);
      setTimeout(() => setUpdateSuccess(""), 3000);
      fetchAnalytics(range, customStart, customEnd);
    } catch (err) {
      setUpdateError("Failed to update status.");
      setTimeout(() => setUpdateError(""), 4000);
    }
  };

  const startResolveProcess = (id) => {
    setExpandedId(id);
    setResolvingId(id);
    setAfterImage(null);
    setAfterImagePreview(null);
  };

  const cancelResolveProcess = () => {
    setResolvingId(null);
    setAfterImage(null);
    setAfterImagePreview(null);
  };

  const handleAfterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterImage(file);
      setAfterImagePreview(URL.createObjectURL(file));
    }
  };

  const submitResolution = async (id) => {
    if (!afterImage) {
      setUpdateError("Please upload an 'After' image to prove resolution.");
      return;
    }
    setUploading(true);
    setUpdateError("");
    try {
      await uploadAfterImage(id, afterImage);
      await updateZoneComplaintStatus(id, "RESOLVED");

      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: "RESOLVED" } : c))
      );
      setUpdateSuccess("Resolution submitted and verified by AI!");
      setTimeout(() => setUpdateSuccess(""), 4000);
      fetchAnalytics(range, customStart, customEnd);

      cancelResolveProcess();
      setExpandedId(null);
    } catch (err) {
      setUpdateError("Resolution verification failed.");
      setTimeout(() => setUpdateError(""), 4000);
    } finally {
      setUploading(false);
    }
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const ranges = [
    { value: "", label: "All Time" },
    { value: "1w", label: "1 Week" },
    { value: "1m", label: "1 Month" },
    { value: "6m", label: "6 Months" },
  ];

  const metricCards = stats
    ? [
        { label: "Total", value: stats.total, icon: "📊", gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
        { label: "Pending", value: stats.pending, icon: "⏳", gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
        { label: "In Progress", value: stats.inProgress, icon: "🔧", gradient: "from-sky-500 to-blue-500", bg: "bg-sky-500/10" },
        { label: "Resolved", value: stats.resolved, icon: "✅", gradient: "from-emerald-500 to-green-500", bg: "bg-emerald-500/10" },
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
            <h2 className="section-title mb-1">📍 Zone Dashboard</h2>
            <p className="text-muted text-sm">{user?.zone?.name || "Your Zone"} • Managed by {user?.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-2 bg-gray-50 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
              <input
                type="date"
                value={customStart}
                onChange={(e) => { setCustomStart(e.target.value); setRange(""); }}
                className="bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none px-2"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => { setCustomEnd(e.target.value); setRange(""); }}
                className="bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none px-2"
              />
            </div>
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => { setRange(r.value); setCustomStart(""); setCustomEnd(""); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  range === r.value && !customStart ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-primary-500/10 hover:text-primary-500"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: "analytics", label: "📊 Analytics" },
            { id: "complaints", label: "📋 Regional Workload" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "analytics" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metricCards.map((m, i) => (
                <div key={i} className="glass-card p-5 text-center relative overflow-hidden transition-all hover:-translate-y-1">
                  <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${m.bg} blur-2xl opacity-50`} />
                  <div className={`relative z-10 w-12 h-12 ${m.bg} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl`}>{m.icon}</div>
                  <p className="text-muted text-xs font-bold uppercase mb-1">{m.label}</p>
                  <p className={`text-3xl font-black bg-gradient-to-br ${m.gradient} bg-clip-text text-transparent`}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3 glass-card p-6 border border-primary-500/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">📈 Zone Trajectory</h3>
                <div className="h-72"><TrendLineChart data={stats?.dailyTrend} /></div>
              </div>
              <div className="lg:col-span-2 glass-card p-6 border border-emerald-500/10">
                <h3 className="text-xl font-bold mb-6">📊 Status Metrics</h3>
                <div className="h-72"><ZoneStatusBarChart data={stats?.statusBreakdown} /></div>
              </div>
              <div className="glass-card p-6 border border-violet-500/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">🎯 Issue Breakdown</h3>
                <div className="h-72 flex items-center justify-center"><ZoneIssuePieChart data={stats?.issueBreakdown} /></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "complaints" && (
          <div className="animate-fade-in space-y-6">
            <div className="glass-card p-6 border border-primary-500/10">
              <h3 className="text-xl font-bold text-heading mb-6 flex items-center gap-2">🔍 Regional Filter Engine</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, Description, Location..."
                    className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary-500/50 outline-none"
                  />
                </div>
                <div>
                   <label className="text-xs font-bold text-muted uppercase block mb-2">Workflow Status</label>
                   <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm"
                   >
                     {["ALL", "PENDING", "APPROVED", "IN_PROGRESS", "RESOLVED", "REJECTED"].map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase block mb-2">Issue Category</label>
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
                  <div className="py-20 text-center text-muted">No regional work matches your filters</div>
                ) : (
                  complaints.map((c) => {
                    const isExpanded = expandedId === c._id;
                    const isResolving = resolvingId === c._id;

                    return (
                      <div key={c._id} className={`glass-card overflow-hidden border border-gray-200 dark:border-white/5 transition-all ${isExpanded ? "border-primary-500/30 shadow-lg" : "hover:border-primary-500/20"}`}>
                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer" onClick={() => toggleExpand(c._id)}>
                          <div className="flex gap-4 min-w-0">
                            <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-2xl shrink-0">
                               {c.beforeImage ? <img src={`${API_BASE}${c.beforeImage}`} className="w-full h-full object-cover rounded-xl" /> : ISSUE_ICONS[c.issueType]}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-heading">{c.issueType}</span>
                                <StatusBadge status={c.status} />
                                {c.aiVerified && <span className="text-[10px] text-violet-500 font-bold uppercase">🤖 AI verified</span>}
                              </div>
                              <p className="text-sm text-body line-clamp-1">{c.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             {c.status === "APPROVED" && (
                               <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(c._id, "IN_PROGRESS"); }} className="px-3 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg shadow-sm">Start Work</button>
                             )}
                             {c.status === "IN_PROGRESS" && !isResolving && (
                               <button onClick={(e) => { e.stopPropagation(); startResolveProcess(c._id); }} className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow-sm">Mark Resolved</button>
                             )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-white/5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                              <div className="space-y-4">
                                <div><p className="text-[10px] font-bold text-muted uppercase mb-1">Location Details</p><p className="text-sm p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">📍 {c.address || "Zone Centric"}</p></div>
                                <div><p className="text-[10px] font-bold text-muted uppercase mb-1">Full Description</p><p className="text-sm p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 whitespace-pre-wrap">{c.description}</p></div>
                              </div>
                              <div>
                                {isResolving ? (
                                  <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">
                                    <h4 className="text-sm font-bold text-emerald-600 mb-2 flex items-center gap-2">📸 Resolution Proof</h4>
                                    <div 
                                      onClick={() => document.getElementById(`resolve-${c._id}`).click()}
                                      className="w-full h-32 border-2 border-dashed border-emerald-500/50 rounded-xl flex items-center justify-center cursor-pointer hover:bg-emerald-500/10 transition-all overflow-hidden"
                                    >
                                      {afterImagePreview ? <img src={afterImagePreview} className="h-full w-full object-contain p-2" /> : <span className="text-xs text-emerald-600">Click to upload 'After' image</span>}
                                    </div>
                                    <input id={`resolve-${c._id}`} type="file" className="hidden" onChange={handleAfterImageChange} />
                                    <div className="flex gap-2 mt-4">
                                      <button onClick={cancelResolveProcess} className="flex-1 py-2 text-xs font-bold bg-white dark:bg-dark-900 border border-gray-200 rounded-lg">Cancel</button>
                                      <button disabled={uploading || !afterImage} onClick={() => submitResolution(c._id)} className="flex-1 py-2 text-xs font-bold bg-emerald-500 text-white rounded-lg disabled:opacity-50">{uploading ? "Verifying..." : "Confirm & Resolve"}</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div><p className="text-[10px] font-bold text-muted uppercase mb-1">Initial Report Image</p>{c.beforeImage ? <img src={`${API_BASE}${c.beforeImage}`} className="w-full h-40 object-cover rounded-xl border border-gray-100 shadow-sm" /> : <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-muted">No image provided</div>}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
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
