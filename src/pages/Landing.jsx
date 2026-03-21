import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";

const FEATURES = [
  {
    icon: "🚗",
    title: "Road & Pothole",
    desc: "Report damaged roads, deep potholes, and crumbling surfaces that endanger commuters.",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    icon: "🗑️",
    title: "Garbage Overflow",
    desc: "Flag overflowing bins and illegal dumping spots before they become health hazards.",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: "🌊",
    title: "Drainage Issues",
    desc: "Report blocked drains and waterlogging that cause flooding in your neighbourhood.",
    color: "from-teal-500 to-cyan-600",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  {
    icon: "💡",
    title: "Street Lights",
    desc: "Alert authorities about broken or missing street lights that leave areas unsafe at night.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
];

const STEPS = [
  {
    step: "01",
    title: "File a Complaint",
    desc: "Choose the issue type, describe the problem, and upload a photo from the spot.",
    icon: "📝",
    color: "from-primary-500 to-primary-600",
  },
  {
    step: "02",
    title: "AI Verification",
    desc: "Our on-device AI model instantly verifies your photo and confirms the issue is genuine.",
    icon: "🤖",
    color: "from-violet-500 to-purple-600",
  },
  {
    step: "03",
    title: "Track & Resolve",
    desc: "Your zone head is notified, picks up the work, and you track status in real time.",
    icon: "✅",
    color: "from-emerald-500 to-green-600",
  },
];

const STATS = [
  { value: "4", label: "Issue Categories", icon: "📋" },
  { value: "AI", label: "Powered Verification", icon: "🤖" },
  { value: "3", label: "Role-based Access", icon: "🔐" },
  { value: "24/7", label: "Live Tracking", icon: "📡" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ===== NAVBAR ===== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10 shadow-light-card"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-neon">
              CF
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Civic<span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Fix</span>
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 transition-all duration-300"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-dark-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-md hover:shadow-neon active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">

        {/* Decorative background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-accent-violet/10 dark:bg-accent-violet/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 dark:bg-primary-500/3 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'} 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide">
              AI-Powered Civic Issue Management
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 animate-slide-up">
            Your City.
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 dark:from-primary-400 dark:via-primary-300 dark:to-primary-200 bg-clip-text text-transparent">
              Your Voice.
            </span>
            <br />
            <span className="text-gray-500 dark:text-dark-400 text-3xl sm:text-5xl md:text-6xl font-bold">
              Fixed Faster.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-500 dark:text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            CivicFix empowers citizens to report roads, garbage, drainage, and
            street light issues verified by AI and resolved by your local zone officials.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col xs:flex-row flex-wrap justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <button
              onClick={() => navigate("/register")}
              className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-base font-bold rounded-2xl hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-lg hover:shadow-neon active:scale-95 flex items-center justify-center gap-2"
            >
              📝 Report an Issue
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white dark:bg-white/5 text-gray-700 dark:text-white text-base font-bold rounded-2xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 active:scale-95 text-center"
            >
              Sign In to Dashboard
            </button>
          </div>

          {/* Floating stat pills */}
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            {[
              { label: "AI Verified", icon: "🤖", color: "text-violet-500 dark:text-violet-400" },
              { label: "Real-time Tracking", icon: "📡", color: "text-sky-500 dark:text-sky-400" },
              { label: "Zone-based Routing", icon: "📍", color: "text-primary-600 dark:text-primary-400" },
              { label: "Before & After Proof", icon: "📸", color: "text-amber-500 dark:text-amber-400" },
            ].map((pill) => (
              <div
                key={pill.label}
                className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 rounded-full text-sm font-medium text-gray-600 dark:text-dark-300 backdrop-blur-sm"
              >
                <span>{pill.icon}</span>
                <span className={pill.color}>{pill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="py-12 bg-gray-50/80 dark:bg-white/[0.02] border-y border-gray-200/60 dark:border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-1">
                  {s.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section heading */}
          <div className="text-center mb-16">
            <p className="text-primary-600 dark:text-primary-400 text-sm font-semibold uppercase tracking-widest mb-3">
              What We Cover
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Report Any Civic Issue
            </h2>
            <p className="text-gray-500 dark:text-dark-400 text-lg max-w-xl mx-auto">
              From cracked roads to broken lights — CivicFix handles the four most
              common civic problems that affect daily life.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`group relative bg-white/80 dark:bg-white/5 backdrop-blur-xl border ${f.border} dark:border-white/10 rounded-3xl p-7 hover:shadow-light-card dark:hover:shadow-glass transition-all duration-500 hover:-translate-y-1 cursor-default overflow-hidden`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Gradient top bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${f.color} rounded-t-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-dark-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-6 bg-gray-50/60 dark:bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary-600 dark:text-primary-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Simple Process
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              How CivicFix Works
            </h2>
            <p className="text-gray-500 dark:text-dark-400 text-lg max-w-xl mx-auto">
              Three easy steps from reporting an issue to seeing it resolved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/30 to-primary-500/0" />

            {STEPS.map((s, i) => (
              <div key={i} className="relative text-center group">
                {/* Step number bubble */}
                <div className={`relative w-24 h-24 bg-gradient-to-br ${s.color} rounded-3xl flex flex-col items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-105 group-hover:shadow-neon transition-all duration-300`}>
                  <span className="text-white/60 text-xs font-bold tracking-widest">{s.step}</span>
                  <span className="text-4xl leading-none">{s.icon}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{s.title}</h3>
                <p className="text-gray-500 dark:text-dark-400 leading-relaxed px-4">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI SECTION ===== */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 rounded-3xl p-10 md:p-16 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                  <span className="text-violet-600 dark:text-violet-400 text-sm font-semibold">Powered by Machine Learning</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                  AI That Decides
                  <br />
                  <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                    In Seconds
                  </span>
                </h2>
                <p className="text-gray-500 dark:text-dark-400 leading-relaxed mb-6">
                  Every image you upload is instantly analysed by our locally-trained deep learning models a garbage detector and a pothole detector with over 70% confidence threshold before auto-approval.
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Garbage Detection Model", badge: ".keras", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
                    { label: "Pothole Detection Model", badge: ".h5", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
                    { label: "70% Confidence Threshold", badge: "Strict", color: "bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/20" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      <span className="text-gray-700 dark:text-dark-300 text-sm font-medium">{item.label}</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border font-semibold ${item.color}`}>
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div className="flex flex-col gap-4">
                {[
                  { label: "Image Uploaded", icon: "📷", status: "Received", color: "text-gray-500 dark:text-dark-400" },
                  { label: "AI Model Running", icon: "🤖", status: "Processing...", color: "text-violet-500 dark:text-violet-400", active: true },
                  { label: "Confidence Score", icon: "📊", status: "87.3%", color: "text-primary-600 dark:text-primary-400" },
                  { label: "Complaint Status", icon: "✅", status: "APPROVED", color: "text-green-600 dark:text-green-400" },
                ].map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      row.active
                        ? "bg-violet-500/10 border-violet-500/30"
                        : "bg-gray-50 dark:bg-white/5 border-gray-200/60 dark:border-white/10"
                    }`}
                  >
                    <span className="text-2xl">{row.icon}</span>
                    <span className="text-gray-700 dark:text-dark-300 text-sm font-medium flex-1">{row.label}</span>
                    <span className={`text-sm font-bold ${row.color}`}>{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 rounded-3xl p-12 md:p-20 overflow-hidden">
            {/* Decorative rings */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[400px] h-[400px] rounded-full border border-white/10 absolute" />
              <div className="w-[600px] h-[600px] rounded-full border border-white/5 absolute" />
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />
                <span className="text-white/90 text-sm font-semibold">Join Your Community</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                Make Your City
                <br />
                Better Today.
              </h2>
              <p className="text-primary-100/80 text-lg mb-10 max-w-xl mx-auto">
                Thousands of civic issues remain unresolved because they go unreported.
                Be the change. Report in seconds.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-white text-primary-700 text-base font-bold rounded-2xl hover:bg-primary-50 transition-all duration-300 shadow-lg active:scale-95 flex items-center gap-2"
                >
                  📝 Create Free Account
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white/10 border border-white/20 text-white text-base font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 active:scale-95"
                >
                  Already have an account?
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200/60 dark:border-white/10 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-neon">
                CF
              </div>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                Civic<span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Fix</span>
              </span>
            </div>

            <p className="text-sm text-gray-400 dark:text-dark-500 text-center">
              Built for citizens, by citizens. Empowering local communities through technology.
            </p>

            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => navigate("/login")}
                className="text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Sign In
              </button>
              <span className="text-gray-200 dark:text-white/10">|</span>
              <button
                onClick={() => navigate("/register")}
                className="text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Register
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-xs text-gray-400 dark:text-dark-600">
              © 2026 CivicFix. A Mini Project for Civic Issue Management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
