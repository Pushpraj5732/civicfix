import TimelineItem from "./TimelineItem";

export default function ComplaintTimeline() {
  // 🔹 MOCK DATA (later from backend status_logs)
  const logs = [
    {
      id: 1,
      oldStatus: "NONE",
      newStatus: "PENDING",
      changedBy: "User",
      time: "10 Aug 2026, 10:30 AM",
    },
    {
      id: 2,
      oldStatus: "PENDING",
      newStatus: "IN_PROGRESS",
      changedBy: "Zone Head",
      time: "10 Aug 2026, 2:15 PM",
    },
    {
      id: 3,
      oldStatus: "IN_PROGRESS",
      newStatus: "RESOLVED",
      changedBy: "Zone Head",
      time: "11 Aug 2026, 11:00 AM",
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-6">
      <h3 className="font-semibold mb-4">
        Complaint Timeline
      </h3>

      {logs.map((log, index) => (
        <TimelineItem
          key={log.id}
          log={log}
          isLast={index === logs.length - 1}
        />
      ))}
    </div>
  );
}
