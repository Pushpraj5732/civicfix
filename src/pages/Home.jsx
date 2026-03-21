import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAdminStats } from "../services/zoneApi";
import { getMyComplaints } from "../services/complaintApi";
import CivicHeatMap from "../components/CivicHeatMap";
import StatusBadge from "../components/StatusBadge";

const ISSUE_ICONS = { ROAD: "🚗", GARBAGE: "🗑️", DRAINAGE: "🌊", STREET_LIGHT: "💡" };

const QUICK_ACTIONS = [
  {
    icon: "📝",
    label: "File a Complaint",
    desc: "Report a new civic issue",
    route: "/file-complaint",
    gradient: "from-primary-600 to-primary-500",
    shadow: "hover:shadow-neon",
    text: "white",
  },
  {
    icon: "📋",
    label: "My Complaints",
    desc: "Track your submissions",
    route: "/my-complaints",
    gradient: "from-sky-600 to-sky-500",
    shadow: "hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]",
    text: "white",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate("/admin", { replace: true });
    } else if (user?.role === "ZONE_HEAD") {
      navigate("/zone-head", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    getAdminStats()
      .then((res) => {
        const d = res.data;
        setStats({
          total: d.total || 0,
          pending: (d.pending || 0) + (d.approved || 0),
          inProgress: d.inProgress || 0,
          resolved: d.resolved || 0,
        });
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    getMyComplaints()
      .then((res) => setRecentComplaints(res.data.slice(0, 3)))
      .catch(() => {});
  }, []);

  const statBar = [
    { label: "Total City Issues", value: stats.total, color: "text-blue-500 dark:text-blue-400", icon: "📊" },
    { label: "Awaiting Action", value: stats.pending, color: "text-amber-500 dark:text-amber-400", icon: "⏳" },
    { label: "In Progress", value: stats.inProgress, color: "text-sky-500 dark:text-sky-400", icon: "🔧" },
    { label: "Resolved", value: stats.resolved, color: "text-emerald-600 dark:text-emerald-400", icon: "✅" },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="page-container">

        {/* ── Welcome Bar ───────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <p className="text-muted text-sm font-medium mb-0.5">{greeting} 👋</p>
            <h1 className="text-2xl md:text-3xl font-bold text-heading">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                {user?.name}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold">Live Tracking Active</span>
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-slide-up">
          {statBar.map((s, i) => (
            <div
              key={i}
              className="glass-card p-3.5 sm:p-4 flex items-center gap-3 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className={`text-xl font-bold ${s.color}`}>
                  {statsLoading ? (
                    <span className="inline-block w-6 h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  ) : s.value}
                </p>
                <p className="text-xs text-muted leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Left: Quick Actions + Recent Complaints */}
          <div className="lg:col-span-1 space-y-4">

            {/* Quick Actions */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {QUICK_ACTIONS.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(a.route)}
                    className={`w-full flex items-center gap-4 p-4 bg-gradient-to-r ${a.gradient} ${a.shadow} text-${a.text} rounded-2xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group`}
                  >
                    <span className="text-2xl">{a.icon}</span>
                    <div className="text-left">
                      <p className="font-bold text-sm">{a.label}</p>
                      <p className="text-xs opacity-80">{a.desc}</p>
                    </div>
                    <span className="ml-auto group-hover:translate-x-1 transition-transform duration-300 opacity-70">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent My Complaints */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted uppercase tracking-widest">My Recent</h3>
                <button
                  onClick={() => navigate("/my-complaints")}
                  className="text-xs text-primary-500 dark:text-primary-400 hover:underline font-medium"
                >
                  View all →
                </button>
              </div>
              {recentComplaints.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-muted text-sm">No complaints yet</p>
                  <button
                    onClick={() => navigate("/file-complaint")}
                    className="text-xs text-primary-500 dark:text-primary-400 mt-2 hover:underline"
                  >
                    File your first one →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentComplaints.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => navigate(`/complaints/${c._id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                    >
                      <span className="text-xl shrink-0">{ISSUE_ICONS[c.issueType] || "📋"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-heading group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors leading-tight">
                          {c.issueType.replace("_", " ")}
                        </p>
                        <p className="text-xs text-muted truncate">{c.description}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: City Stats visual panel */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 h-full">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-widest mb-6">City Overview</h3>
              <div className="space-y-4">
                {[
                  { label: "Awaiting Action", value: stats.pending, total: stats.total, color: "bg-amber-500", light: "bg-amber-500/10", text: "text-amber-500 dark:text-amber-400" },
                  { label: "In Progress", value: stats.inProgress, total: stats.total, color: "bg-sky-500", light: "bg-sky-500/10", text: "text-sky-500 dark:text-sky-400" },
                  { label: "Resolved", value: stats.resolved, total: stats.total, color: "bg-emerald-500", light: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
                ].map((item, i) => {
                  const pct = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-body">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${item.text}`}>{item.value}</span>
                          <span className="text-xs text-subtle">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: statsLoading ? "0%" : `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resolution rate pill */}
              {!statsLoading && stats.total > 0 && (
                <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-2xl">🎉</div>
                  <div>
                    <p className="text-sm font-semibold text-heading">Resolution Rate</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {((stats.resolved / stats.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <p className="text-xs text-muted ml-auto text-right max-w-[120px]">
                    of all city complaints resolved
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Heat Map ──────────────────────────────────────────────────────── */}
        <div className="animate-fade-in">
          <CivicHeatMap />
        </div>

      </div>
    </div>
  );
}
