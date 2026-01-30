import StatusBadge from "./StatusBadge";

export default function ComplaintCard({ complaint }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">Complaint #{complaint.id}</p>
        <p className="font-semibold mt-1">{complaint.issueType}</p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(complaint.createdAt).toLocaleDateString()}
        </p>
      </div>

      <StatusBadge status={complaint.status} />
    </div>
  );
}
