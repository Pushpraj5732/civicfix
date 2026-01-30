export default function TimelineItem({ log, isLast }) {
  return (
    <div className="flex gap-4">
      {/* LEFT LINE */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-green-600 rounded-full" />
        {!isLast && (
          <div className="flex-1 w-px bg-gray-300" />
        )}
      </div>

      {/* CONTENT */}
      <div className="pb-6">
        <p className="font-medium text-sm">
          {log.oldStatus} → {log.newStatus}
        </p>

        <p className="text-xs text-gray-500">
          By {log.changedBy} • {log.time}
        </p>
      </div>
    </div>
  );
}
