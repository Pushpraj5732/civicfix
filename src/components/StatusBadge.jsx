export default function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-100 text-yellow-700",
    ASSIGNED: "bg-purple-100 text-purple-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    RESOLVED: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
