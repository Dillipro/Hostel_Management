import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RealtimeChart = ({ data = [], timeRange = '24h' }) => {
  const [chartType, setChartType] = useState('line');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      generateChartData();
    }
  }, [data, chartType, timeRange]);

  const generateChartData = () => {
    if (!data || data.length === 0) return;

    // Generate time labels based on time range
    const labels = generateTimeLabels();
    
    // Process access data
    const hostelAccess = new Array(labels.length).fill(0);
    const messAccess = new Array(labels.length).fill(0);
    const accessDenied = new Array(labels.length).fill(0);

    data.forEach(item => {
      const index = getTimeIndex(item.timestamp, labels);
      if (index >= 0) {
        if (item.accessType === 'hostel_entry' && item.accessGranted) {
          hostelAccess[index]++;
        } else if (item.accessType === 'mess_entry' && item.accessGranted) {
          messAccess[index]++;
        } else if (!item.accessGranted) {
          accessDenied[index]++;
        }
      }
    });

    if (chartType === 'doughnut') {
      setChartData({
        labels: ['Hostel Access', 'Mess Access', 'Access Denied'],
        datasets: [{
          data: [
            hostelAccess.reduce((a, b) => a + b, 0),
            messAccess.reduce((a, b) => a + b, 0),
            accessDenied.reduce((a, b) => a + b, 0)
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(147, 51, 234, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(147, 51, 234)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2
        }]
      });
    } else {
      setChartData({
        labels,
        datasets: [
          {
            label: 'Hostel Access',
            data: hostelAccess,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: chartType === 'line' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.8)',
            fill: chartType === 'line',
            tension: 0.4
          },
          {
            label: 'Mess Access',
            data: messAccess,
            borderColor: 'rgb(147, 51, 234)',
            backgroundColor: chartType === 'line' ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.8)',
            fill: chartType === 'line',
            tension: 0.4
          },
          {
            label: 'Access Denied',
            data: accessDenied,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: chartType === 'line' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.8)',
            fill: chartType === 'line',
            tension: 0.4
          }
        ]
      });
    }
  };

  const generateTimeLabels = () => {
    const now = new Date();
    const labels = [];

    switch (timeRange) {
      case '1h':
        for (let i = 11; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 5 * 60 * 1000);
          labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        break;
      case '24h':
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000);
          labels.push(time.toLocaleTimeString([], { hour: '2-digit' }) + ':00');
        }
        break;
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(date.toLocaleDateString([], { weekday: 'short' }));
        }
        break;
      case '30d':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
        }
        break;
      default:
        labels.push('No Data');
    }

    return labels;
  };

  const getTimeIndex = (timestamp, labels) => {
    const time = new Date(timestamp);
    const now = new Date();
    
    switch (timeRange) {
      case '1h':
        const minutesAgo = Math.floor((now - time) / (5 * 60 * 1000));
        return labels.length - 1 - minutesAgo;
      case '24h':
        const hoursAgo = Math.floor((now - time) / (60 * 60 * 1000));
        return labels.length - 1 - hoursAgo;
      case '7d':
        const daysAgo = Math.floor((now - time) / (24 * 60 * 60 * 1000));
        return labels.length - 1 - daysAgo;
      case '30d':
        const monthDaysAgo = Math.floor((now - time) / (24 * 60 * 60 * 1000));
        return labels.length - 1 - monthDaysAgo;
      default:
        return 0;
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: chartType === 'doughnut' ? 'bottom' : 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: chartType !== 'doughnut' ? {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 8
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          precision: 0
        }
      }
    } : {},
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  };

  const renderChart = () => {
    if (!chartData) return null;

    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  return (
    <div className="h-64">
      {/* Chart Type Selector */}
      <div className="flex justify-end mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'line' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'bar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType('doughnut')}
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'doughnut' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pie
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48">
        {data && data.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">📊</div>
              <p className="text-gray-500 text-sm">No data available</p>
              <p className="text-gray-400 text-xs">Access data will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Statistics */}
      {data && data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {data.filter(d => d.accessType === 'hostel_entry' && d.accessGranted).length}
              </div>
              <div className="text-xs text-gray-600">Hostel Access</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {data.filter(d => d.accessType === 'mess_entry' && d.accessGranted).length}
              </div>
              <div className="text-xs text-gray-600">Mess Access</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {data.filter(d => !d.accessGranted).length}
              </div>
              <div className="text-xs text-gray-600">Denied</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeChart;
