import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

export default function ZoneIssuePieChart() {
  const data = {
    labels: ["Road", "Garbage", "Drainage", "Street Light"],
    datasets: [
      {
        data: [6, 5, 4, 3],
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
