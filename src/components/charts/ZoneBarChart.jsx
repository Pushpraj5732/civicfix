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

export default function ZoneBarChart() {
  const data = {
    labels: [
      "Zone A",
      "Zone B",
      "Zone C",
      "Zone D",
      "Zone E",
    ],
    datasets: [
      {
        label: "Complaints",
        data: [14, 9, 18, 6, 8],
        backgroundColor: "#ef4444",
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  return <Bar data={data} options={options} />;
}
