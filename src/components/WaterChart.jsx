import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register necessary chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Define the days of the week in order, Mon to Sun
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function WaterChart({ dailyUsages }) {
  // dailyUsages prop is expected to be an array of 7 numbers (Mon to Sun)
  // Fallback to zeros if not provided or length incorrect
  const usageData = Array.isArray(dailyUsages) && dailyUsages.length === 7
    ? dailyUsages
    : new Array(7).fill(0)

  // Calculate the max usage to determine y-axis max value
  // Minimum of 50 to avoid too small scale
  const maxUsage = Math.max(...usageData, 50)
  // Round maxUsage up to nearest 50 for a clean scale step
  const yMax = Math.ceil(maxUsage / 50) * 50

  // State to hold the data object for the chart
  const [weeklyData, setWeeklyData] = useState({
    labels: WEEK_DAYS,
    datasets: [
      {
        label: 'Daily Usage (L)',
        data: usageData,
        borderColor: '#3b82f6', // Tailwind blue-500
        backgroundColor: '#60a5fa', // Tailwind blue-400
        tension: 0.4, // Smooth curves
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  })

  // Update chart data when dailyUsages prop changes
  useEffect(() => {
    setWeeklyData({
      labels: WEEK_DAYS,
      datasets: [
        {
          label: 'Daily Usage (L)',
          data: usageData,
          borderColor: '#3b82f6',
          backgroundColor: '#60a5fa',
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    })
  }, [dailyUsages])

  // Chart display options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          // Show usage in Liters on tooltip
          label: context => `${context.parsed.y}L`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yMax,
        ticks: {
          stepSize: 50,
          callback: value => `${value}L`
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)', // Tailwind gray-400, transparent
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <div className="rounded-lg bg-gray-900 p-4 h-96 w-full">
      <div className="text-gray-300 mb-4 font-semibold text-lg">Weekly Water Usage</div>
      <div className="h-80">
        <Line data={weeklyData} options={options} />
      </div>
    </div>
  )
}

export default WaterChart
