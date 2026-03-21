import { useEffect, useState } from "react";
import { getMyComplaints } from "../services/complaintApi";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ISSUE_META = {
  ROAD: { icon: "🚗", color: "bg-sky-500/10 border-sky-500/20", badge: "text-sky-600 dark:text-sky-400" },
  GARBAGE: { icon: "🗑️", color: "bg-amber-500/10 border-amber-500/20", badge: "text-amber-600 dark:text-amber-400" },
  DRAINAGE: { icon: "🌊", color: "bg-teal-500/10 border-teal-500/20", badge: "text-teal-600 dark:text-teal-400" },
  STREET_LIGHT: { icon: "💡", color: "bg-violet-500/10 border-violet-500/20", badge: "text-violet-600 dark:text-violet-400" },
};

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "IN_PROGRESS", "RESOLVED", "REJECTED"];

const STATUS_COLORS = {
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  APPROVED: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20",
};

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    getMyComplaints()
      .then((res) => setComplaints(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "ALL" ? complaints : complaints.filter((c) => c.status === filter);

  // Count per status
  const counts = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted">Loading your complaints...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container">

        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-heading">My Complaints</h1>
            <p className="text-muted text-sm mt-0.5">
              {complaints.length} total submission{complaints.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => navigate("/file-complaint")}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-md hover:shadow-neon active:scale-95 flex items-center gap-2 self-start"
          >
            <span>📝</span> New Complaint
          </button>
        </div>

        {/* ── Status Summary Pills ──────────────────────────────────────────── */}
        {complaints.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 animate-slide-up">
            {complaints.length > 0 && (
              <button
                onClick={() => setFilter("ALL")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  filter === "ALL"
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                    : "bg-white dark:bg-white/5 text-gray-600 dark:text-dark-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                All <span className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-dark-300 text-xs px-1.5 py-0.5 rounded-full">{complaints.length}</span>
              </button>
            )}
            {STATUS_FILTERS.slice(1).map((s) =>
              counts[s] ? (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    filter === s
                      ? `${STATUS_COLORS[s]} opacity-100`
                      : "bg-white dark:bg-white/5 text-gray-600 dark:text-dark-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  {s.replace("_", " ")}
                  <span className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-dark-300 text-xs px-1.5 py-0.5 rounded-full">{counts[s]}</span>
                </button>
              ) : null
            )}
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="glass-card p-16 text-center animate-fade-in">
            <div className="text-6xl mb-4">{filter !== "ALL" ? "🔍" : "📭"}</div>
            <h3 className="text-xl font-bold text-heading mb-2">
              {filter !== "ALL" ? `No ${filter.replace("_", " ")} complaints` : "No complaints yet"}
            </h3>
            <p className="text-muted text-sm mb-6">
              {filter !== "ALL"
                ? "Try a different status filter above"
                : "Be the first to report a civic issue in your area"}
            </p>
            {filter === "ALL" && (
              <button onClick={() => navigate("/file-complaint")} className="btn-primary">
                📝 File a Complaint
              </button>
            )}
          </div>
        ) : (
          /* ── Complaints Grid ─────────────────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
            {filtered.map((c, i) => {
              const meta = ISSUE_META[c.issueType] || ISSUE_META.ROAD;
              return (
                <div
                  key={c._id}
                  onClick={() => navigate(`/complaints/${c._id}`)}
                  className="glass-card overflow-hidden cursor-pointer hover:border-primary-500/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Image strip */}
                  {c.beforeImage ? (
                    <div className="h-36 overflow-hidden relative">
                      <img
                        src={`${API_BASE}${c.beforeImage}`}
                        alt="issue"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Gradient overlay with status badge */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${meta.color} border font-semibold ${meta.badge}`}>
                          {meta.icon} {c.issueType.replace("_", " ")}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  ) : (
                    <div className={`h-14 ${meta.color} border-b border-current/10 flex items-center px-4 gap-3`}>
                      <span className="text-3xl">{meta.icon}</span>
                      <div className="flex-1 flex items-center justify-between">
                        <span className={`text-sm font-bold ${meta.badge}`}>
                          {c.issueType.replace("_", " ")}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  )}

                  {/* Card body */}
                  <div className="p-4">
                    <p className="text-body text-sm line-clamp-2 mb-3 leading-relaxed">{c.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      {c.zone?.name && (
                        <span className="flex items-center gap-1">
                          📍 {c.zone.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        🕒 {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {c.aiVerified && (
                        <span className="flex items-center gap-1 text-violet-500 dark:text-violet-400">
                          🤖 AI Verified
                        </span>
                      )}
                      <span className="ml-auto text-primary-500 dark:text-primary-400 font-medium group-hover:translate-x-1 transition-transform duration-300 inline-block">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
