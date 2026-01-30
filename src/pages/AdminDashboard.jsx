import StatusBarChart from "../components/charts/StatusBarChart";
import IssuePieChart from "../components/charts/IssuePieChart";
import ZoneBarChart from "../components/charts/ZoneBarChart";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6">
        Admin Dashboard
      </h2>

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Complaints</p>
          <p className="text-2xl font-bold">55</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">12</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-2xl font-bold text-green-600">38</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">
            Complaints by Status
          </h3>
          <StatusBarChart />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">
            Complaints by Issue Type
          </h3>
          <IssuePieChart />
        </div>
        <div className="bg-white p-4 rounded-xl shadow mt-6">
  <h3 className="font-semibold mb-3">
    Complaints by Zone
  </h3>
  <ZoneBarChart />
</div>

      </div>
    </div>
  );
}
