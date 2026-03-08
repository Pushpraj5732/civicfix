import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ZoneIssuePieChart({ data }) {
  const issueMap = {};
  if (data) {
    data.forEach((d) => {
      issueMap[d._id] = d.count;
    });
  }

  const chartData = {
    labels: ["Road", "Garbage", "Drainage", "Street Light"],
    datasets: [
      {
        data: [
          issueMap["ROAD"] || 0,
          issueMap["GARBAGE"] || 0,
          issueMap["DRAINAGE"] || 0,
          issueMap["STREET_LIGHT"] || 0,
        ],
        backgroundColor: ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#94a3b8", padding: 16, usePointStyle: true },
      },
    },
    cutout: "60%",
  };

  return <Doughnut data={chartData} options={options} />;
}
