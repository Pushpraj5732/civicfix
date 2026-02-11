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

export default function ZoneStatusBarChart({ data }) {
  const statusMap = {};
  if (data) {
    data.forEach((d) => {
      statusMap[d._id] = d.count;
    });
  }

  const chartData = {
    labels: ["Pending", "Approved", "In Progress", "Resolved"],
    datasets: [
      {
        label: "Complaints",
        data: [
          statusMap["PENDING"] || 0,
          statusMap["APPROVED"] || 0,
          statusMap["IN_PROGRESS"] || 0,
          statusMap["RESOLVED"] || 0,
        ],
        backgroundColor: ["#f59e0b", "#8b5cf6", "#0ea5e9", "#10b981"],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
      y: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
