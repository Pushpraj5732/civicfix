import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import { getZones } from "../services/zoneApi";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    zoneName: "",
  });
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // We don't need auth for zone list, but we'll handle it gracefully
    getZones()
      .then((res) => setZones(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await registerUser(form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-violet/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="glass-card p-8 w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">CivicFix</h1>
          <p className="text-dark-400 text-sm">
            Join the movement for better cities
          </p>
        </div>

        <h2 className="text-xl font-semibold text-white mb-6">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="USER">Citizen (Report Issues)</option>
              <option value="ZONE_HEAD">Zone Head</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {form.role === "ZONE_HEAD" && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Zone
              </label>
              <select
                name="zoneName"
                value={form.zoneName}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Zone</option>
                {zones.map((z) => (
                  <option key={z._id} value={z.name}>
                    {z.name}
                  </option>
                ))}
                {zones.length === 0 && (
                  <>
                    <option value="Zone A">Zone A</option>
                    <option value="Zone B">Zone B</option>
                    <option value="Zone C">Zone C</option>
                    <option value="Zone D">Zone D</option>
                    <option value="Zone E">Zone E</option>
                  </>
                )}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-dark-400 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
