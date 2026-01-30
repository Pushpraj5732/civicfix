import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";
import { createComplaint, uploadComplaintImage } from "../services/complaintApi";
import { useSearchParams } from "react-router-dom";

export default function RegisterComplaint() {
  const navigate = useNavigate();

  const [issueType, setIssueType] = useState("ROAD");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!image) {
      alert("Please upload an image");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create complaint
      const res = await createComplaint({
        issueType,
        description,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      const complaintId = res.data.id;

      // 2️⃣ Upload image
      const formData = new FormData();
      formData.append("file", image);
      formData.append("type", "BEFORE");

      await uploadComplaintImage(complaintId, formData);

      alert("Complaint registered successfully");
      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6">Register Complaint</h2>

      {/* Image */}
      <ImageUpload onFileSelect={setImage} />

      {/* Issue Type */}
      <div className="bg-white p-4 rounded-xl shadow mt-4">
        <label className="block text-sm font-medium mb-2">Issue Type</label>
        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="ROAD">Road</option>
          <option value="GARBAGE">Garbage</option>
          <option value="DRAINAGE">Drainage</option>
          <option value="STREET_LIGHT">Street Light</option>
        </select>
      </div>

      {/* Description */}
      <div className="bg-white p-4 rounded-xl shadow mt-4">
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
          rows="3"
        />
      </div>

      {/* Location */}
      <div className="bg-white p-4 rounded-xl shadow mt-4 grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      {/* Submit */}
      <button
        disabled={loading}
        onClick={handleSubmit}
        className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Complaint"}
      </button>
    </div>
  );
}
