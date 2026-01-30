import { useEffect, useState } from "react";
import { getMyComplaints } from "../services/complaintApi";
import ComplaintCard from "../components/ComplaintCard";
import { useNavigate } from "react-router-dom";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyComplaints()
      .then((res) => {
        setComplaints(res.data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load complaints");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-6">Loading complaints...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6">My Complaints</h2>

      {complaints.length === 0 ? (
        <p className="text-gray-500">No complaints found.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/complaints/${c.id}`)}
              className="cursor-pointer"
            >
              <ComplaintCard complaint={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
