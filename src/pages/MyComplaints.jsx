import { useEffect, useState } from "react";
import { getMyComplaints } from "../services/complaintApi";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    getMyComplaints()
      .then((res) => setComplaints(res.data))
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "ALL"
      ? complaints
      : complaints.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-dark-400">Loading your complaints...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="section-title mb-0">📋 My Complaints</h2>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              "ALL",
              "PENDING",
              "APPROVED",
              "IN_PROGRESS",
              "RESOLVED",
              "REJECTED",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === s
                    ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                    : "bg-white/5 text-dark-400 border border-white/10 hover:border-white/20"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-dark-400 text-lg">No complaints found</p>
            <p className="text-dark-500 text-sm mt-1">
              {filter !== "ALL"
                ? "Try a different filter"
                : "File your first complaint to get started"}
            </p>
            {filter === "ALL" && (
              <button
                onClick={() => navigate("/file-complaint")}
                className="btn-primary mt-6"
              >
                📝 File a Complaint
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div
                key={c._id}
                onClick={() => navigate(`/complaints/${c._id}`)}
                className="glass-card p-5 flex items-center justify-between cursor-pointer hover:border-primary-500/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl">
                    {c.issueType === "ROAD"
                      ? "🚗"
                      : c.issueType === "GARBAGE"
                        ? "🗑️"
                        : c.issueType === "DRAINAGE"
                          ? "🌊"
                          : "💡"}
                  </div>
                  <div>
                    <p className="text-white font-semibold group-hover:text-primary-400 transition-colors">
                      {c.issueType.replace("_", " ")}
                    </p>
                    <p className="text-dark-400 text-sm mt-0.5 line-clamp-1 max-w-xs">
                      {c.description}
                    </p>
                    <p className="text-dark-500 text-xs mt-1">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {c.zone?.name && (
                        <span className="ml-2">📍 {c.zone.name}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {c.aiVerified && (
                    <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded-lg border border-violet-500/20">
                      🤖 AI Verified
                    </span>
                  )}
                  <StatusBadge status={c.status} />
                  <span className="text-dark-500 group-hover:text-dark-300 transition-colors">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
