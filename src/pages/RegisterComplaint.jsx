import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createComplaint, uploadComplaintImage } from "../services/complaintApi";
import { getZones } from "../services/zoneApi";

const ISSUE_TYPES = [
  { value: "ROAD", label: "Road / Pothole", icon: "🚗", desc: "Damaged roads, potholes", color: "border-sky-500/40 bg-sky-500/5", active: "border-sky-500 bg-sky-500/10", badge: "text-sky-600 dark:text-sky-400" },
  { value: "GARBAGE", label: "Garbage Overflow", icon: "🗑️", desc: "Overflowing bins, waste", color: "border-amber-500/40 bg-amber-500/5", active: "border-amber-500 bg-amber-500/10", badge: "text-amber-600 dark:text-amber-400" },
  { value: "DRAINAGE", label: "Drainage Issues", icon: "🌊", desc: "Blocked drains, flooding", color: "border-teal-500/40 bg-teal-500/5", active: "border-teal-500 bg-teal-500/10", badge: "text-teal-600 dark:text-teal-400" },
  { value: "STREET_LIGHT", label: "Street Light", icon: "💡", desc: "Broken or missing lights", color: "border-violet-500/40 bg-violet-500/5", active: "border-violet-500 bg-violet-500/10", badge: "text-violet-600 dark:text-violet-400" },
];

const STEPS = ["Choose Issue", "Add Details", "Review & Submit"];

export default function RegisterComplaint() {
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(0); // 0, 1, 2 = form wizard steps
  const [submitStep, setSubmitStep] = useState(0); // 0=idle, 1=creating, 2=ai, 3=done

  const [issueType, setIssueType] = useState("ROAD");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [zones, setZones] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getZones().then((r) => setZones(r.data)).catch(() => {});
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const canProceedStep1 = issueType;
  const canProceedStep2 = description.trim().length >= 10 && zoneName && image && address.trim();

  const handleSubmit = async () => {
    setError("");
    if (!image) { setError("Please upload an image of the issue"); return; }
    if (description.trim().length < 10) { setError("Description must be at least 10 characters"); return; }
    if (!zoneName) { setError("Please select a zone"); return; }
    if (!address.trim()) { setError("Please enter the specific location/address"); return; }

    try {
      setLoading(true);
      setSubmitStep(1);
      const res = await createComplaint({
        issueType, description, address, zoneName,
      });
      const complaintId = res.data._id;

      setSubmitStep(2);
      const formData = new FormData();
      formData.append("file", image);
      formData.append("type", "BEFORE");
      const uploadRes = await uploadComplaintImage(complaintId, formData);

      setAiResult({
        verified: uploadRes.data.aiVerified,
        confidence: uploadRes.data.aiConfidence,
        status: uploadRes.data.status,
      });
      setSubmitStep(3);
      setTimeout(() => navigate("/my-complaints"), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setSubmitStep(0);
      setFormStep(2);
    } finally {
      setLoading(false);
    }
  };

  const selectedIssue = ISSUE_TYPES.find((t) => t.value === issueType);

  // ── Submission overlay ─────────────────────────────────────────────────────
  if (submitStep > 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container flex items-center justify-center min-h-[70vh]">
          <div className="glass-card p-10 max-w-sm w-full text-center animate-fade-in">
            {submitStep === 1 && (
              <>
                <div className="w-20 h-20 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-bold text-heading mb-2">Creating Complaint</h3>
                <p className="text-muted text-sm">Submitting your report to the system…</p>
              </>
            )}
            {submitStep === 2 && (
              <>
                <div className="w-20 h-20 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-bold text-heading mb-2">🤖 AI Analyzing…</h3>
                <p className="text-muted text-sm">Our deep learning model is verifying your photo</p>
                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </>
            )}
            {submitStep === 3 && aiResult && (
              <>
                <div className={`w-24 h-24 ${aiResult.status === "APPROVED" ? "bg-emerald-500/10 border-2 border-emerald-500/30" : "bg-red-500/10 border-2 border-red-500/30"} rounded-full flex items-center justify-center mx-auto mb-6 text-5xl`}>
                  {aiResult.status === "APPROVED" ? "✅" : "❌"}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${aiResult.status === "APPROVED" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  {aiResult.status === "APPROVED" ? "Complaint Approved!" : "Verification Failed"}
                </h3>
                <p className="text-muted text-sm mb-5">
                  {aiResult.status === "APPROVED"
                    ? "AI confirmed this is a genuine civic issue. Zone head has been notified."
                    : "AI could not verify this issue from the image. You may resubmit with a clearer photo."}
                </p>

                {/* Confidence bar */}
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted">AI Confidence</span>
                    <span className={`font-bold ${aiResult.status === "APPROVED" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                      {(aiResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${aiResult.status === "APPROVED" ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${aiResult.confidence * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-subtle text-xs">Redirecting to My Complaints…</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Form wizard ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container max-w-2xl">

        {/* Page header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-heading mb-1">File a Complaint</h1>
          <p className="text-muted text-sm">Report a civic issue in 3 simple steps</p>
        </div>

        {/* Step progress bar */}
        <div className="flex items-center gap-0 mb-8 animate-slide-up">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                    i < formStep
                      ? "bg-primary-500 text-white"
                      : i === formStep
                      ? "bg-primary-500 text-white ring-4 ring-primary-500/20"
                      : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-dark-500"
                  }`}
                >
                  {i < formStep ? "✓" : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${i === formStep ? "text-primary-600 dark:text-primary-400" : "text-muted"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300 ${i < formStep ? "bg-primary-500" : "bg-gray-200 dark:bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* ── Step 0: Choose Issue Type ─────────────────────────────────────── */}
        {formStep === 0 && (
          <div className="animate-fade-in">
            <div className="glass-card p-6 mb-4">
              <h3 className="text-base font-semibold text-heading mb-1">What type of issue is it?</h3>
              <p className="text-muted text-sm mb-5">Select the category that best describes the problem</p>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                {ISSUE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setIssueType(t.value)}
                    className={`p-5 rounded-2xl text-left transition-all duration-300 border-2 group ${
                      issueType === t.value ? t.active : t.color + " hover:border-gray-300 dark:hover:border-white/20"
                    }`}
                  >
                    <span className="text-3xl block mb-2">{t.icon}</span>
                    <p className={`text-sm font-bold mb-0.5 ${issueType === t.value ? t.badge : "text-heading"}`}>{t.label}</p>
                    <p className="text-xs text-muted">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setFormStep(1)}
              className="btn-primary w-full py-3.5"
            >
              Continue → Add Details
            </button>
          </div>
        )}

        {/* ── Step 1: Add Details ───────────────────────────────────────────── */}
        {formStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            {/* Image Upload */}
            <div className="glass-card p-6">
              <label className="block text-sm font-semibold text-heading mb-1">
                Upload Issue Photo <span className="text-red-500">*</span>
              </label>
              <p className="text-muted text-xs mb-4">A clear photo helps AI verify and speeds up resolution</p>
              <div
                onClick={() => document.getElementById("fileInput").click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
                  imagePreview
                    ? "border-primary-500/50 bg-primary-500/5"
                    : "border-gray-300 dark:border-white/10 hover:border-primary-400 dark:hover:border-primary-500/40 hover:bg-primary-500/5"
                }`}
              >
                {imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="Preview" className="max-h-52 mx-auto rounded-xl mb-3 shadow-lg" />
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">✓ Image selected — click to change</p>
                    <p className="text-xs text-subtle mt-1">{image?.name}</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-5xl mb-3">📷</div>
                    <p className="text-body font-medium">Drop image here or click to upload</p>
                    <p className="text-xs text-subtle mt-1">JPG, PNG, WebP — Max 10MB</p>
                  </div>
                )}
              </div>
              <input id="fileInput" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>

            {/* Zone + Description row */}
            <div className="glass-card p-6">
              <label className="block text-sm font-semibold text-heading mb-1">
                Zone <span className="text-red-500">*</span>
              </label>
              <p className="text-muted text-xs mb-3">Your complaint will be routed to the zone head</p>
              <select value={zoneName} onChange={(e) => setZoneName(e.target.value)} className="input-field mb-5">
                <option value="">-- Select Zone --</option>
                {zones.map((z) => (
                  <option key={z._id} value={z.name}>{z.name}{z.description ? ` — ${z.description}` : ""}</option>
                ))}
              </select>

              <label className="block text-sm font-semibold text-heading mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <p className="text-muted text-xs mb-3">Minimum 10 characters — be specific</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[100px] resize-none"
                placeholder="e.g. Large pothole on the main road near the bus stop — about 1 foot deep"
                rows="3"
              />
              <p className={`text-xs mt-1 ${description.length < 10 ? "text-red-400" : "text-muted"}`}>
                {description.length}/1000 characters {description.length < 10 ? `(${10 - description.length} more needed)` : "✓"}
              </p>
            </div>

            {/* Location Address */}
            <div className="glass-card p-6">
              <label className="block text-sm font-semibold text-heading mb-1">
                📍 Location Details <span className="text-red-500">*</span>
              </label>
              <p className="text-muted text-xs mb-3">Provide a manual address or landmark where the issue is located</p>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field min-h-[80px] resize-none"
                placeholder="e.g. Opposite City Mall, near the main gate"
                rows="2"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setFormStep(0)} className="btn-secondary flex-1 py-3.5 order-2 sm:order-1">← Back</button>
              <button
                onClick={() => setFormStep(2)}
                disabled={!canProceedStep2}
                className="btn-primary flex-[2] py-3.5 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Review & Submit ───────────────────────────────────────── */}
        {formStep === 2 && (
          <div className="animate-fade-in space-y-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-heading mb-4">Review your complaint</h3>

              <div className="space-y-3">
                {imagePreview && (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
                    <img src={imagePreview} alt="Issue" className="w-full max-h-56 object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-muted font-medium mb-0.5">Issue Type</p>
                    <p className="text-sm font-bold text-heading">{selectedIssue?.icon} {selectedIssue?.label}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-muted font-medium mb-0.5">Zone</p>
                    <p className="text-sm font-bold text-heading">📍 {zoneName}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 col-span-2">
                    <p className="text-xs text-muted font-medium mb-0.5">Location / Landmark</p>
                    <p className="text-sm font-bold text-heading truncate">📍 {address}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-muted font-medium mb-1">Description</p>
                  <p className="text-sm text-body">{description}</p>
                </div>

                <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">AI Verification</p>
                    <p className="text-xs text-muted">Your image will be analyzed by our deep learning model after submission</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setFormStep(1)} className="btn-secondary flex-1 py-3.5 order-2 sm:order-1">← Edit</button>
              <button
                disabled={loading}
                onClick={handleSubmit}
                className="btn-primary flex-[2] py-3.5 disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                🚀 Submit Complaint
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
