import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import IssueCard from "../components/IssueCard";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import gsap from "gsap";
import CivicHeatMap from "../components/CivicHeatMap";



export default function Home() {
    const navigate = useNavigate();
   useEffect(() => {
  gsap.fromTo(
    ".hero",
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
  );

  gsap.fromTo(
    ".stat-card",
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.2,
      delay: 0.3,
      ease: "power2.out",
    }
  );

}, []);



  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Hero */}
      <section className="hero px-6 py-12 text-center">
        <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
  Report Civic Issues in Your Area
</h2>


        <p className="text-gray-600 mt-2">
          Roads • Garbage • Drainage • Street Lights
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <button
  onClick={() => navigate("/register")}
  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium
             transition transform hover:scale-105 active:scale-95"
>
  Register Complaint
</button>



          <button
            onClick={() => navigate("/my-complaints")}
            className="bg-white border px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            My Complaints
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 flex flex-col sm:grid sm:grid-cols-3 gap-4">
  <div className="stat-card">
    <StatCard title="Pending" count="12" color="text-yellow-600" />
  </div>

  <div className="stat-card">
    <StatCard title="In Progress" count="5" color="text-blue-600" />
  </div>

  <div className="stat-card">
    <StatCard title="Resolved" count="38" color="text-green-600" />
  </div>
</section>
    <CivicHeatMap />


      {/* Issues */}
      
    </div>
  );
}
