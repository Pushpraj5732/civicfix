import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
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
          <span className="text-lg font-bold text-white hidden sm:block">
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
                  : "text-dark-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="mr-1.5">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-dark-400">
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
                <div className="md:hidden border-b border-white/10 pb-2 mb-2">
                  {userLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5"
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
