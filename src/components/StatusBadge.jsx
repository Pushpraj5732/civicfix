export default function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    APPROVED: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    ASSIGNED: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    IN_PROGRESS: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    RESOLVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    REJECTED: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
        styles[status] || "bg-dark-500/15 text-dark-400 border-dark-500/30"
      }`}
    >
      {status?.replace("_", " ")}
    </span>
  );
}
