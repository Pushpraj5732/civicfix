import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  createComplaint,
  uploadComplaintImage,
} from "../services/complaintApi";
import { getZones } from "../services/zoneApi";

export default function RegisterComplaint() {
  const navigate = useNavigate();

  const [issueType, setIssueType] = useState("ROAD");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    getZones()
      .then((r) => setZones(r.data))
      .catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
        },
        () => {},
      );
    }
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!image) {
      setError("Please upload an image of the issue");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a description");
      return;
    }
    if (!zoneName) {
      setError("Please select a zone");
      return;
    }

    try {
      setLoading(true);
      setStep(2);
      const res = await createComplaint({
        issueType,
        description,
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
        zoneName,
      });
      const complaintId = res.data._id;

      setStep(3);
      const formData = new FormData();
      formData.append("file", image);
      formData.append("type", "BEFORE");
      const uploadRes = await uploadComplaintImage(complaintId, formData);

      setAiResult({
        verified: uploadRes.data.aiVerified,
        confidence: uploadRes.data.aiConfidence,
        status: uploadRes.data.status,
        detected: uploadRes.data.aiDetectedIssue,
      });
      setStep(4);
      setTimeout(() => navigate("/my-complaints"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const issueTypes = [
    { value: "ROAD", label: "Road / Pothole", icon: "🚗" },
    { value: "GARBAGE", label: "Garbage", icon: "🗑️" },
    { value: "DRAINAGE", label: "Drainage", icon: "🌊" },
    { value: "STREET_LIGHT", label: "Street Light", icon: "💡" },
  ];

  if (step > 1) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container flex items-center justify-center min-h-[60vh]">
          <div className="glass-card p-10 max-w-md w-full text-center animate-fade-in">
            {step === 2 && (
              <>
                <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-bold text-heading mb-2">
                  Creating Complaint...
                </h3>
                <p className="text-muted">Submitting your report</p>
              </>
            )}
            {step === 3 && (
              <>
                <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-bold text-heading mb-2">
                  🤖 AI Analyzing Image...
                </h3>
                <p className="text-muted">
                  Our AI engine is verifying the issue
                </p>
              </>
            )}
            {step === 4 && aiResult && (
              <>
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl ${
                    aiResult.status === "APPROVED"
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {aiResult.status === "APPROVED" ? "✅" : "❌"}
                </div>
                <h3 className="text-xl font-bold text-heading mb-2">
                  {aiResult.status === "APPROVED"
                    ? "Complaint Approved!"
                    : "Complaint Rejected"}
                </h3>
                <p className="text-muted mb-4">
                  {aiResult.status === "APPROVED"
                    ? "AI verified this as a genuine civic issue."
                    : "AI could not verify this as a genuine issue"}
                </p>
                <div className="glass-card p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted">AI Confidence</span>
                    <span className="text-primary-500 dark:text-primary-400 font-semibold">
                      {(aiResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        aiResult.status === "APPROVED"
                          ? "bg-primary-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${aiResult.confidence * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-subtle text-sm">
                  Redirecting to your complaints...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container max-w-2xl">
        <h2 className="section-title">📝 File a Complaint</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Image Upload */}
        <div className="glass-card p-6 mb-4">
          <label className="block text-sm font-medium text-body mb-3">
            Upload Issue Photo <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => document.getElementById("fileInput").click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              imagePreview
                ? "border-primary-500/50"
                : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
            }`}
          >
            {imagePreview ? (
              <div>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg mb-3"
                />
                <p className="text-sm text-primary-500 dark:text-primary-400">
                  Click to change image
                </p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-3">📷</div>
                <p className="text-muted">Click to upload or drag & drop</p>
                <p className="text-xs text-subtle mt-1">
                  JPG, PNG, WebP — Max 10MB
                </p>
              </div>
            )}
          </div>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Issue Type */}
        <div className="glass-card p-6 mb-4">
          <label className="block text-sm font-medium text-body mb-3">
            Issue Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {issueTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setIssueType(t.value)}
                className={`p-4 rounded-xl text-left transition-all duration-300 border ${
                  issueType === t.value
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-500 dark:text-primary-400"
                    : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-body hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <p className="text-sm font-medium mt-1">{t.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Zone */}
        <div className="glass-card p-6 mb-4">
          <label className="block text-sm font-medium text-body mb-3">
            Zone <span className="text-red-500">*</span>
            <span className="text-subtle text-xs ml-2">
              (Assigned to this zone's head)
            </span>
          </label>
          <select
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="input-field"
            required
          >
            <option value="">-- Select Zone --</option>
            {zones.map((z) => (
              <option key={z._id} value={z.name}>
                {z.name}
                {z.description ? ` — ${z.description}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="glass-card p-6 mb-4">
          <label className="block text-sm font-medium text-body mb-3">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field min-h-[100px] resize-none"
            placeholder="Describe the issue..."
            rows="3"
          />
        </div>

        {/* Location */}
        <div className="glass-card p-6 mb-6">
          <label className="block text-sm font-medium text-body mb-3">
            📍 Location{" "}
            {latitude && (
              <span className="text-primary-500 dark:text-primary-400 text-xs ml-2">
                (Auto-detected)
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="btn-primary w-full text-lg py-4 disabled:opacity-50"
        >
          🚀 Submit Complaint
        </button>
      </div>
    </div>
  );
}
