import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
);

export default function ZoneStatusBarChart() {
  const data = {
    labels: ["Pending", "In Progress", "Resolved"],
    datasets: [
      {
        data: [7, 2, 9],
        backgroundColor: ["#facc15", "#3b82f6", "#22c55e"],
      },
    ],
  };

  return <Bar data={data} />;
}
