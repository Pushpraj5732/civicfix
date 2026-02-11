import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-blob rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blob-alt rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                   bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20
                   border border-gray-200 dark:border-white/10 z-20"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className="glass-card p-8 w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">CivicFix</h1>
          <p className="text-muted text-sm">
            Join as a citizen to report civic issues
          </p>
        </div>

        <h2 className="text-xl font-semibold text-heading mb-2">
          Create Citizen Account
        </h2>
        <p className="text-subtle text-xs mb-6">
          👤 This creates a citizen account for reporting issues. Admin & Zone
          Head accounts are managed by the system administrator.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-body mb-2">
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
            <label className="block text-sm font-medium text-body mb-2">
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
            <label className="block text-sm font-medium text-body mb-2">
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
            <label className="block text-sm font-medium text-body mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="input-field"
              placeholder="Re-enter password"
              minLength={6}
              required
            />
          </div>

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
              "👤 Create Citizen Account"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-muted text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-500 dark:text-primary-400 hover:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
