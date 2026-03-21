import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { getComplaintById } from "../services/complaintApi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ISSUE_META = {
  ROAD: { icon: "🚗", color: "from-sky-600 to-blue-600", light: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-600 dark:text-sky-400" },
  GARBAGE: { icon: "🗑️", color: "from-amber-600 to-orange-600", light: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
  DRAINAGE: { icon: "🌊", color: "from-teal-600 to-cyan-600", light: "bg-teal-500/10", border: "border-teal-500/20", text: "text-teal-600 dark:text-teal-400" },
  STREET_LIGHT: { icon: "💡", color: "from-violet-600 to-purple-600", light: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-600 dark:text-violet-400" },
};

const STATUS_STEP = { PENDING: 0, APPROVED: 1, IN_PROGRESS: 2, RESOLVED: 3 };
const JOURNEY_STEPS = [
  { key: "PENDING", label: "Submitted", icon: "📝" },
  { key: "APPROVED", label: "Verified", icon: "✅" },
  { key: "IN_PROGRESS", label: "In Progress", icon: "🔧" },
  { key: "RESOLVED", label: "Resolved", icon: "🎉" },
];

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [statusLogs, setStatusLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    getComplaintById(id)
      .then((res) => {
        setComplaint(res.data.complaint);
        setStatusLogs(res.data.statusLogs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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

  if (!complaint) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-heading font-bold text-xl mb-2">Complaint not found</p>
          <p className="text-muted text-sm mb-6">This complaint may have been removed or the link is invalid.</p>
          <button onClick={() => navigate("/my-complaints")} className="btn-primary">← Back to My Complaints</button>
        </div>
      </div>
    );
  }

  const meta = ISSUE_META[complaint.issueType] || ISSUE_META.ROAD;
  const currentStep = STATUS_STEP[complaint.status] ?? 0;
  const isRejected = complaint.status === "REJECTED";

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} alt="Full size" className="max-w-full max-h-full rounded-2xl object-contain" />
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white text-xl flex items-center justify-center">×</button>
        </div>
      )}

      <div className="page-container max-w-3xl">

        {/* ── Back + breadcrumb ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 text-sm animate-fade-in">
          <button
            onClick={() => navigate("/my-complaints")}
            className="flex items-center gap-1.5 text-muted hover:text-heading transition-colors"
          >
            ← My Complaints
          </button>
          <span className="text-subtle">/</span>
          <span className="text-body">{complaint.issueType.replace("_", " ")}</span>
        </div>

        {/* ── Hero header ───────────────────────────────────────────────────── */}
        <div className="glass-card overflow-hidden mb-4 animate-slide-up">
          {/* Gradient top stripe */}
          <div className={`h-2 bg-gradient-to-r ${meta.color}`} />

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${meta.light} ${meta.border} border-2 rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shrink-0`}>
                  {meta.icon}
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-heading">
                    {complaint.issueType.replace("_", " ")}
                  </h1>
                  <p className="text-muted text-xs sm:text-sm mt-0.5">
                    Filed on {new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex justify-center sm:block">
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            <p className="text-body leading-relaxed mb-5">{complaint.description}</p>

            <div className="flex flex-wrap gap-3">
              {complaint.zone?.name && (
                <span className="flex items-center gap-1.5 text-sm bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-xl text-body">
                  📍 {complaint.zone.name}
                </span>
              )}
              {complaint.address && (
                <span className="flex items-center gap-1.5 text-sm bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-xl text-body">
                  📍 {complaint.address}
                </span>
              )}
              {complaint.aiVerified && (
                <span className="flex items-center gap-1.5 text-sm bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl text-violet-600 dark:text-violet-400">
                  🤖 AI Verified ({(complaint.aiConfidence * 100).toFixed(0)}% confidence)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Journey progress (only for non-rejected) ──────────────────────── */}
        {!isRejected && (
          <div className="glass-card p-6 mb-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-widest mb-6">Complaint Journey</h3>
            <div className="flex items-start justify-between relative gap-1">
              {/* Connector line */}
              <div className="absolute top-3.5 sm:top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-white/10 z-0" />
              <div
                className="absolute top-3.5 sm:top-4 left-4 h-0.5 bg-primary-500 z-0 transition-all duration-700"
                style={{ width: `${(currentStep / (JOURNEY_STEPS.length - 1)) * 100}%` }}
              />

              {JOURNEY_STEPS.map((s, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={s.key} className="relative z-10 flex flex-col items-center flex-1 min-w-0">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm transition-all duration-300 ${
                      done
                        ? "bg-primary-500 border-primary-500 shadow-neon"
                        : "bg-white dark:bg-dark-900 border-gray-300 dark:border-white/20"
                    } ${active ? "ring-4 ring-primary-500/20" : ""}`}>
                      {done ? <span className="text-white text-[10px] sm:text-xs">{i < currentStep ? "✓" : s.icon}</span> : <span className="text-gray-400 text-[10px] sm:text-xs">{i + 1}</span>}
                    </div>
                    <p className={`text-[10px] sm:text-xs mt-2 font-medium text-center truncate w-full ${done ? "text-heading" : "text-muted"}`}>{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isRejected && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4 flex items-center gap-3 animate-fade-in">
            <span className="text-3xl">❌</span>
            <div>
              <p className="text-red-500 dark:text-red-400 font-semibold">Complaint Rejected</p>
              <p className="text-muted text-sm">AI verification could not confirm this issue from the submitted image.</p>
            </div>
          </div>
        )}

        {/* ── Before / After Images ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 animate-fade-in">
          {[
            { label: "📸 Before", img: complaint.beforeImage, placeholder: "No image uploaded" },
            { label: "📸 After", img: complaint.afterImage, placeholder: complaint.status === "RESOLVED" ? "No after image" : "Pending resolution" },
          ].map(({ label, img, placeholder }) => (
            <div key={label} className="glass-card overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-body">{label}</p>
                {img && (
                  <button
                    onClick={() => setLightboxImg(`${API_BASE}${img}`)}
                    className="text-xs text-primary-500 dark:text-primary-400 hover:underline"
                  >
                    Fullscreen
                  </button>
                )}
              </div>
              {img ? (
                <img
                  src={`${API_BASE}${img}`}
                  alt={label}
                  onClick={() => setLightboxImg(`${API_BASE}${img}`)}
                  className="w-full h-52 object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                />
              ) : (
                <div className="h-52 bg-gray-50 dark:bg-white/3 flex flex-col items-center justify-center text-center px-6">
                  <span className="text-4xl mb-2">{label.includes("After") ? "⏳" : "🖼️"}</span>
                  <p className="text-muted text-sm">{placeholder}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Status Timeline ───────────────────────────────────────────────── */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-widest mb-6">Activity Timeline</h3>
          {statusLogs.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">No activity logged yet</p>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-white/10" />
              <div className="space-y-0">
                {statusLogs.map((log, idx) => {
                  const isLast = idx === statusLogs.length - 1;
                  return (
                    <div key={log._id} className="flex gap-5 relative pb-6 last:pb-0">
                      {/* Dot */}
                      <div className={`relative z-10 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isLast ? "bg-primary-500 shadow-neon" : "bg-gray-200 dark:bg-dark-700"
                      }`}>
                        <span className="text-xs">{isLast ? "●" : "○"}</span>
                      </div>
                      {/* Content */}
                      <div className="flex-1 bg-gray-50 dark:bg-white/3 rounded-2xl p-3.5">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <StatusBadge status={log.newStatus} />
                          <span className="text-xs text-subtle">from {log.oldStatus}</span>
                        </div>
                        <p className="text-sm text-body">
                          by <span className="font-semibold text-heading">{log.changedBy?.name || "System"}</span>
                        </p>
                        {log.note && (
                          <p className="text-subtle text-xs mt-1.5 italic bg-white dark:bg-white/5 rounded-lg px-3 py-2">
                            "{log.note}"
                          </p>
                        )}
                        <p className="text-xs text-subtle mt-1.5">
                          {new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
