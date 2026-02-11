import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password, role: loginRole });
      login(res.data.token, res.data.user);

      switch (res.data.user.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "ZONE_HEAD":
          navigate("/zone-head");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const roleTabs = [
    {
      value: "USER",
      label: "Citizen",
      icon: "👤",
      desc: "Report civic issues",
    },
    { value: "ADMIN", label: "Admin", icon: "🛡️", desc: "City-wide analytics" },
    {
      value: "ZONE_HEAD",
      label: "Zone Head",
      icon: "📍",
      desc: "Manage zone complaints",
    },
  ];

  const demoCredentials = {
    USER: { email: "user@civicfix.com", password: "user123" },
    ADMIN: { email: "admin@civicfix.com", password: "admin123" },
    ZONE_HEAD: { email: "zonea@civicfix.com", password: "zone123" },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blob rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blob rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Theme toggle for login page */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                   bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20
                   border border-gray-200 dark:border-white/10 z-20"
        title={
          theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
        }
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className="glass-card p-8 w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">CivicFix</h1>
          <p className="text-muted text-sm">Smart Civic Issue Tracker</p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {roleTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setLoginRole(tab.value);
                setError("");
              }}
              className={`p-3 rounded-xl text-center transition-all duration-300 border ${
                loginRole === tab.value
                  ? "bg-primary-500/15 border-primary-500/30 text-primary-500 dark:text-primary-400"
                  : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-muted hover:border-gray-300 dark:hover:border-white/20"
              }`}
            >
              <span className="text-xl block">{tab.icon}</span>
              <span className="text-xs font-medium block mt-1">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <p className="text-subtle text-xs text-center mb-4">
          {roleTabs.find((t) => t.value === loginRole)?.desc}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-body mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
                Signing in...
              </span>
            ) : (
              `Sign In as ${roleTabs.find((t) => t.value === loginRole)?.label}`
            )}
          </button>
        </form>

        {loginRole === "USER" && (
          <p className="text-center mt-6 text-muted text-sm">
            New citizen?{" "}
            <Link
              to="/register"
              className="text-primary-500 dark:text-primary-400 hover:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
            >
              Create an account
            </Link>
          </p>
        )}

        {loginRole !== "USER" && (
          <p className="text-center mt-6 text-subtle text-xs">
            {loginRole === "ADMIN" ? "Admin" : "Zone Head"} accounts are
            pre-configured by the system administrator.
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
          <p className="text-xs text-subtle mb-2">Demo Credentials:</p>
          <div className="text-xs text-muted">
            <p>
              {roleTabs.find((t) => t.value === loginRole)?.icon}{" "}
              <span className="text-body">
                {demoCredentials[loginRole].email}
              </span>
              {" / "}
              <span className="text-body">
                {demoCredentials[loginRole].password}
              </span>
            </p>
            {loginRole === "ZONE_HEAD" && (
              <p className="text-subtle mt-1">
                Also: zoneb@, zonec@, zoned@, zonee@civicfix.com
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
