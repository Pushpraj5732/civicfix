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

export default function StatusBarChart({ data }) {
  const statusMap = {};
  if (data) {
    data.forEach((d) => {
      statusMap[d._id] = d.count;
    });
  }

    const chartData = {
    labels: ["Pending", "Approved", "In Progress", "Resolved", "Rejected"],
    datasets: [
      {
        label: "Reports Active",
        data: [
          statusMap["PENDING"] || 0,
          statusMap["APPROVED"] || 0,
          statusMap["IN_PROGRESS"] || 0,
          statusMap["RESOLVED"] || 0,
          statusMap["REJECTED"] || 0,
        ],
        backgroundColor: [
          "rgba(245, 158, 11, 0.8)",  // amber
          "rgba(139, 92, 246, 0.8)",  // violet
          "rgba(14, 165, 233, 0.8)",  // sky
          "rgba(16, 185, 129, 0.8)",  // emerald
          "rgba(239, 68, 68, 0.8)",   // red
        ],
        borderColor: [
          "#f59e0b",
          "#8b5cf6",
          "#0ea5e9",
          "#10b981",
          "#ef4444",
        ],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: [
          "#f59e0b",
          "#8b5cf6",
          "#0ea5e9",
          "#10b981",
          "#ef4444",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 14, family: "'Inter', sans-serif" },
        bodyFont: { size: 13, family: "'Inter', sans-serif", weight: "bold" }
      }
    },
    scales: {
      x: {
        ticks: { color: "#64748b", font: { family: "'Inter', sans-serif", size: 12, weight: "600" } },
        grid: { display: false },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { 
          color: "#94a3b8", 
          stepSize: 1,
          font: { family: "'Inter', sans-serif", size: 11 } 
        },
        grid: { 
          color: "rgba(148, 163, 184, 0.1)", 
          drawBorder: false,
          borderDash: [5, 5]
        },
        border: { display: false }
      },
    },
    animation: {
      y: { duration: 1000, easing: 'easeOutQuart' }
    }
  };

  return <Bar data={chartData} options={options} />;
}
