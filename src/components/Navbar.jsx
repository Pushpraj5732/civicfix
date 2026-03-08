import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    {
      path: "/",
      label: "Home",
      icon: "🏠",
      roles: ["USER", "ADMIN", "ZONE_HEAD"],
    },
    {
      path: "/file-complaint",
      label: "File Complaint",
      icon: "📝",
      roles: ["USER"],
    },
    {
      path: "/my-complaints",
      label: "My Complaints",
      icon: "📋",
      roles: ["USER"],
    },
    { path: "/admin", label: "Admin Panel", icon: "⚙️", roles: ["ADMIN"] },
    {
      path: "/zone-head",
      label: "Zone Dashboard",
      icon: "📍",
      roles: ["ZONE_HEAD"],
    },
  ];

  const userLinks = navLinks.filter((l) => l.roles.includes(user?.role));

  return (
    <nav className="glass-card rounded-none md:rounded-2xl md:mx-4 md:mt-4 px-6 py-4 mb-6 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-neon group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-shadow">
            CF
          </div>
          <span className="text-lg font-bold text-heading hidden sm:block">
            Civic<span className="gradient-text">Fix</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {userLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive(link.path)
                  ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                  : "text-body hover:text-heading hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span className="mr-1.5">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: Theme toggle + User Menu */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                       bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20
                       border border-gray-200 dark:border-white/10"
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? (
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-heading">{user?.name}</p>
            <p className="text-xs text-muted">
              {user?.role?.replace("_", " ")}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-sm hover:shadow-neon transition-shadow"
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-card py-2 animate-fade-in">
                {/* Mobile nav links */}
                <div className="md:hidden border-b border-gray-200 dark:border-white/10 pb-2 mb-2">
                  {userLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-body hover:text-heading hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="md:hidden w-full text-left px-4 py-2 text-sm text-body hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-white/10 mb-2 pb-2"
                >
                  {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
