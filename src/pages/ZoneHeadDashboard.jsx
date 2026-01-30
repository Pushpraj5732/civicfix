import ZoneStatusBarChart from "../components/charts/ZoneStatusBarChart";
import ZoneIssuePieChart from "../components/charts/ZoneIssuePieChart";
import ComplaintTimeline from "../components/ComplaintTimeline";
import ComplaintImages from "../components/ComplaintImages";

export default function ZoneHeadDashboard() {
  // mock – later from backend / JWT
  const zoneName = "Zone B";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-1">
        Zone Head Dashboard
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        {zoneName}
      </p>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Complaints</p>
          <p className="text-2xl font-bold">18</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">7</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-2xl font-bold text-green-600">9</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">
            Status Overview (This Zone)
          </h3>
          <ZoneStatusBarChart />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">
            Issues in This Zone
          </h3>
          <ZoneIssuePieChart />
          <ComplaintTimeline />
          <ComplaintImages complaintId={101} />


        </div>
      </div>
    </div>
  );
}
