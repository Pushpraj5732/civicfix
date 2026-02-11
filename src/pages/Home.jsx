import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getComplaints } from "../services/complaintApi";
import gsap from "gsap";
import CivicHeatMap from "../components/CivicHeatMap";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    getComplaints()
      .then((res) => {
        const data = res.data;
        setStats({
          pending: data.filter(
            (c) => c.status === "PENDING" || c.status === "APPROVED",
          ).length,
          inProgress: data.filter(
            (c) => c.status === "IN_PROGRESS" || c.status === "ASSIGNED",
          ).length,
          resolved: data.filter((c) => c.status === "RESOLVED").length,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    gsap.fromTo(
      ".hero-section",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
    );
    gsap.fromTo(
      ".stat-card",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        delay: 0.3,
        ease: "power2.out",
      },
    );
    gsap.fromTo(
      ".map-section",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.8, ease: "power2.out" },
    );
  }, []);

  const statCards = [
    {
      title: "Pending",
      count: stats.pending,
      color: "from-amber-500 to-orange-500",
      icon: "⏳",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "In Progress",
      count: stats.inProgress,
      color: "from-sky-500 to-blue-500",
      icon: "🔧",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      title: "Resolved",
      count: stats.resolved,
      color: "from-emerald-500 to-green-500",
      icon: "✅",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="page-container">
        {/* Hero */}
        <section className="hero-section text-center py-12 md:py-20">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            <span className="text-primary-400 text-sm font-medium">
              Live Tracking Active
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            Report Civic Issues
            <br />
            <span className="gradient-text">In Your Area</span>
          </h2>

          <p className="text-dark-400 text-lg mb-8 max-w-xl mx-auto">
            Roads • Garbage • Drainage • Street Lights — AI-powered verification
            for faster resolution
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/file-complaint")}
              className="btn-primary text-lg px-8 py-4"
            >
              📝 File a Complaint
            </button>
            <button
              onClick={() => navigate("/my-complaints")}
              className="btn-secondary text-lg px-8 py-4"
            >
              📋 My Complaints
            </button>
          </div>

          <p className="text-dark-500 text-sm mt-4">
            Welcome back, <span className="text-primary-400">{user?.name}</span>
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {statCards.map((s, i) => (
            <div
              key={i}
              className={`stat-card glass-card p-6 text-center ${s.border} border hover:shadow-lg transition-all duration-300`}
            >
              <div
                className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl`}
              >
                {s.icon}
              </div>
              <p className="text-dark-400 text-sm font-medium">{s.title}</p>
              <p
                className={`text-3xl font-bold mt-1 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}
              >
                {s.count}
              </p>
            </div>
          ))}
        </section>

        {/* Heat Map */}
        <section className="map-section">
          <CivicHeatMap />
        </section>
      </div>
    </div>
  );
}
