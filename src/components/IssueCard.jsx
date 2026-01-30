export default function IssueCard({ icon, label }) {
  return (
    <div
      className="bg-white rounded-xl shadow p-6 flex flex-col items-center
                 transition transform hover:-translate-y-2 hover:shadow-lg
                 cursor-pointer"
    >
      <div className="text-3xl">{icon}</div>
      <p className="mt-3 text-sm font-medium text-gray-700">{label}</p>
    </div>
  );
}
