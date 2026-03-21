import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function IssuePieChart({ data }) {
  const issueMap = {};
  if (data) {
    data.forEach((d) => {
      issueMap[d._id] = d.count;
    });
  }

  const labels = ["Road", "Garbage", "Drainage", "Street Light"];
  const values = [
    issueMap["ROAD"] || 0,
    issueMap["GARBAGE"] || 0,
    issueMap["DRAINAGE"] || 0,
    issueMap["STREET_LIGHT"] || 0,
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "rgba(14, 165, 233, 0.85)", 
          "rgba(16, 185, 129, 0.85)", 
          "rgba(245, 158, 11, 0.85)", 
          "rgba(139, 92, 246, 0.85)"
        ],
        borderColor: [
          "#0ea5e9", 
          "#10b981", 
          "#f59e0b", 
          "#8b5cf6"
        ],
        borderWidth: 2,
        hoverOffset: 12,
        hoverBorderColor: "#ffffff"
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: { 
          color: "#64748b", 
          padding: 20, 
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
    cutout: "65%",
    radius: "90%",
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1200,
      easing: "easeOutExpo"
    }
  };

  return <Doughnut data={chartData} options={options} />;
}
