import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ZoneBarChart({ data }) {
  const labels = data ? data.map((z) => z.zoneName) : [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Pending",
        data: data ? data.map((z) => z.pending) : [],
        backgroundColor: "rgba(245, 158, 11, 0.85)",
        borderColor: "#f59e0b",
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: "In Progress",
        data: data ? data.map((z) => z.inProgress) : [],
        backgroundColor: "rgba(14, 165, 233, 0.85)",
        borderColor: "#0ea5e9",
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: "Resolved",
        data: data ? data.map((z) => z.resolved) : [],
        backgroundColor: "rgba(16, 185, 129, 0.85)",
        borderColor: "#10b981",
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { 
          color: "#94a3b8", 
          usePointStyle: true,
          font: { family: "'Inter', sans-serif", size: 12, weight: "600" }
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#f8fafc",
        bodyColor: "#ffffff",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, family: "'Inter', sans-serif" },
        bodyFont: { size: 14, family: "'Inter', sans-serif", weight: "bold" }
      }
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: "#64748b", font: { family: "'Inter', sans-serif", size: 11, weight: "600" } },
        grid: { color: "rgba(148, 163, 184, 0.1)", drawBorder: false, borderDash: [5, 5] },
        border: { display: false }
      },
      y: {
        stacked: true,
        ticks: { color: "#94a3b8", font: { family: "'Inter', sans-serif", size: 12, weight: "600" } },
        grid: { display: false },
        border: { display: false }
      },
    },
    animation: {
      x: { duration: 1000, easing: 'easeOutQuart' }
    }
  };

  return <Bar data={chartData} options={options} />;
}
