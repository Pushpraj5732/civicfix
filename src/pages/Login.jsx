import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authApi";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      login(res.data.token, res.data.user);

      // Redirect based on role
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="glass-card p-8 w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">CivicFix</h1>
          <p className="text-dark-400 text-sm">Smart Civic Issue Tracker</p>
        </div>

        <h2 className="text-xl font-semibold text-white mb-6">Welcome back</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
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
            <label className="block text-sm font-medium text-dark-300 mb-2">
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
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-dark-400 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-dark-500 mb-3">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-dark-400">
            <p>
              👤 User:{" "}
              <span className="text-dark-300">user@civicfix.com / user123</span>
            </p>
            <p>
              🛡️ Admin:{" "}
              <span className="text-dark-300">
                admin@civicfix.com / admin123
              </span>
            </p>
            <p>
              📍 Zone:{" "}
              <span className="text-dark-300">
                zonea@civicfix.com / zone123
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
