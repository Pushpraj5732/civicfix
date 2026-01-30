import { useParams } from "react-router-dom";
import Timeline from "../components/Timeline";

export default function ComplaintDetails() {
  const { id } = useParams();

  // TEMP MOCK DATA (we’ll connect backend later)
  const complaint = {
    id,
    issueType: "ROAD",
    status: "IN_PROGRESS",
    beforeImage:
      "https://via.placeholder.com/400x250?text=Before+Image",
    afterImage:
      "https://via.placeholder.com/400x250?text=After+Image",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-2">
        Complaint #{complaint.id}
      </h2>

      <p className="text-gray-600 mb-6">
        Issue Type: <b>{complaint.issueType}</b>
      </p>

      {/* Timeline */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h3 className="font-semibold mb-3">Status Timeline</h3>
        <Timeline status={complaint.status} />
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-xl shadow">
          <p className="text-sm font-medium mb-2">Before</p>
          <img
            src={complaint.beforeImage}
            alt="Before"
            className="rounded"
          />
        </div>

        <div className="bg-white p-3 rounded-xl shadow">
          <p className="text-sm font-medium mb-2">After</p>
          <img
            src={complaint.afterImage}
            alt="After"
            className="rounded"
          />
        </div>
      </div>
    </div>
  );
}
