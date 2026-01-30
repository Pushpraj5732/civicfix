import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function StatusBarChart() {
  const data = {
    labels: ["Pending", "In Progress", "Resolved"],
    datasets: [
      {
        label: "Complaints",
        data: [12, 5, 38],
        backgroundColor: [
          "#facc15",
          "#3b82f6",
          "#22c55e",
        ],
      },
    ],
  };

  return <Bar data={data} />;
}
