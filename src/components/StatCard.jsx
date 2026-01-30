export default function StatCard({ title, count, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 text-center">
      <h3 className={`text-sm font-medium ${color}`}>{title}</h3>
      <p className="text-3xl font-bold mt-2">{count}</p>
    </div>
  );
}
