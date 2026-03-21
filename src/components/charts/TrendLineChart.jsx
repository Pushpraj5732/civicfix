import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export default function TrendLineChart({ data }) {
  // If no data, render empty state
  const hasData = data && data.length > 0;
  
  // Format data for chart
  const labels = hasData ? data.map((d) => {
    const date = new Date(d._id);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }) : ["No Data"];
  
  const values = hasData ? data.map((d) => d.count) : [0];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Reports Logged",
        data: values,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.5)"); // Strong Violet
          gradient.addColorStop(1, "rgba(139, 92, 246, 0.0)"); // Fade to transparent
          return gradient;
        },
        borderColor: "#8b5cf6",
        borderWidth: 3,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#8b5cf6",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4, // Smooth curves!
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
        ticks: { color: "#64748b", font: { family: "'Inter', sans-serif", size: 11, weight: "600" } },
        grid: { display: false },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { 
          color: "#94a3b8", 
          stepSize: 1, // Since counts are absolute integers
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
      y: { duration: 1500, easing: 'easeOutQuart' }
    }
  };

  return <Line data={chartData} options={options} />;
}
