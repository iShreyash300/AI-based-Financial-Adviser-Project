import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TelemetryChart = () => {
  const data = {
    labels: ["2021", "2022", "2023", "2024", "2025 (AI Target)"],
    datasets: [
      {
        label: "Projected Revenue",
        data: [15000, 21500, 28000, 36500, 45000],
        borderColor: "#10b981",
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(16, 185, 129, 0.15)";
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(16, 185, 129, 0.32)");
          gradient.addColorStop(0.65, "rgba(16, 185, 129, 0.08)");
          gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");
          return gradient;
        },
        pointRadius: [4.5, 4.5, 4.5, 4.5, 7],
        pointHoverRadius: [6, 6, 6, 6, 9],
        pointBackgroundColor: ["#10b981", "#10b981", "#10b981", "#10b981", "#10b981"],
        pointBorderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "rgba(16, 185, 129, 0.35)"],
        pointBorderWidth: [2.5, 2.5, 2.5, 2.5, 6],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#94a3b8",
        bodyColor: "#f8fafc",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => ` Projected: $${Number(context.raw).toLocaleString()} ARR`,
        },
      },
    },
    scales: {
      y: {
        min: 10000,
        max: 50000,
        ticks: {
          stepSize: 10000,
          callback: (value) => {
            if (value === 15000) return "15k";
            if (value === 25000) return "25k";
            if (value === 35000) return "35k";
            if (value === 45000) return "45k";
            return `${value / 1000}k`;
          },
          color: "#94a3b8",
          font: {
            size: 11,
            family: "Inter, system-ui, -apple-system, sans-serif",
            weight: 500,
          },
        },
        grid: {
          color: "rgba(226, 232, 240, 0.7)",
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
      x: {
        ticks: {
          color: (c) => (c.index === 4 ? "#047857" : "#64748b"),
          font: (c) => ({
            size: 11,
            family: "Inter, system-ui, -apple-system, sans-serif",
            weight: c.index === 4 ? 700 : 500,
          }),
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full h-52 sm:h-56 md:h-60">
      <Line data={data} options={options} />
    </div>
  );
};

export default TelemetryChart;
