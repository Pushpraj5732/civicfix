import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { getComplaintById } from "../services/complaintApi";

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [statusLogs, setStatusLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaintById(id)
      .then((res) => {
        setComplaint(res.data.complaint);
        setStatusLogs(res.data.statusLogs);
      })
      .catch((err) => console.error(err))
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
          <p className="text-dark-400">Complaint not found</p>
        </div>
      </div>
    );
  }

  const issueIcon =
    complaint.issueType === "ROAD"
      ? "🚗"
      : complaint.issueType === "GARBAGE"
        ? "🗑️"
        : complaint.issueType === "DRAINAGE"
          ? "🌊"
          : "💡";

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="page-container max-w-3xl">
        {/* Header */}
        <div className="glass-card p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-3xl">
                {issueIcon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {complaint.issueType.replace("_", " ")}
                </h2>
                <p className="text-dark-400 text-sm">
                  Filed on{" "}
                  {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          <p className="text-dark-300">{complaint.description}</p>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-dark-400">
            {complaint.zone?.name && (
              <span className="flex items-center gap-1">
                📍 {complaint.zone.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              🌐 {complaint.latitude?.toFixed(4)},{" "}
              {complaint.longitude?.toFixed(4)}
            </span>
            {complaint.aiVerified && (
              <span className="flex items-center gap-1 text-violet-400">
                🤖 AI Verified ({(complaint.aiConfidence * 100).toFixed(0)}%)
              </span>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="glass-card p-4">
            <p className="text-sm font-medium text-dark-300 mb-3">📸 Before</p>
            {complaint.beforeImage ? (
              <img
                src={complaint.beforeImage}
                alt="Before"
                className="rounded-xl w-full object-cover max-h-64"
              />
            ) : (
              <div className="h-40 bg-white/5 rounded-xl flex items-center justify-center text-dark-500">
                No image
              </div>
            )}
          </div>

          <div className="glass-card p-4">
            <p className="text-sm font-medium text-dark-300 mb-3">📸 After</p>
            {complaint.afterImage ? (
              <img
                src={complaint.afterImage}
                alt="After"
                className="rounded-xl w-full object-cover max-h-64"
              />
            ) : (
              <div className="h-40 bg-white/5 rounded-xl flex items-center justify-center text-dark-500">
                Not resolved yet
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            📊 Status Timeline
          </h3>

          <div className="space-y-0">
            {statusLogs.map((log, idx) => (
              <div key={log._id} className="flex gap-4">
                {/* Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      idx === statusLogs.length - 1
                        ? "bg-primary-500 shadow-neon"
                        : "bg-dark-500"
                    }`}
                  />
                  {idx < statusLogs.length - 1 && (
                    <div className="w-0.5 h-12 bg-dark-700" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={log.newStatus} />
                    <span className="text-xs text-dark-500">
                      from {log.oldStatus}
                    </span>
                  </div>
                  <p className="text-dark-400 text-sm">
                    by{" "}
                    <span className="text-white">
                      {log.changedBy?.name || "System"}
                    </span>
                  </p>
                  {log.note && (
                    <p className="text-dark-500 text-xs mt-1 italic">
                      "{log.note}"
                    </p>
                  )}
                  <p className="text-dark-600 text-xs mt-1">
                    {new Date(log.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
