import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function IssuePieChart() {
  const data = {
    labels: ["Road", "Garbage", "Drainage", "Street Light"],
    datasets: [
      {
        data: [20, 15, 10, 10],
        backgroundColor: [
          "#ef4444",
          "#22c55e",
          "#3b82f6",
          "#facc15",
        ],
      },
    ],
  };

  return <Pie data={data} />;
}
