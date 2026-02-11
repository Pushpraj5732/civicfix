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
        backgroundColor: "#f59e0b",
        borderRadius: 4,
      },
      {
        label: "In Progress",
        data: data ? data.map((z) => z.inProgress) : [],
        backgroundColor: "#0ea5e9",
        borderRadius: 4,
      },
      {
        label: "Resolved",
        data: data ? data.map((z) => z.resolved) : [],
        backgroundColor: "#10b981",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#94a3b8", usePointStyle: true },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        stacked: true,
        ticks: { color: "#94a3b8" },
        grid: { display: false },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
