'use client';

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register necessary Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const RadarChart: React.FC = () => {
  const data = {
    labels: [
      'Phương trình mặt cầu', 'Lũy thừa & Logarit', 'Tích phân', 
      'Diện tích hình phẳng', 'Thể tích đa diện', 'Phương trình đường thẳng',
      'Hệ tọa độ không gian', 'Phương trình mặt phẳng', 'Tọa độ điểm & Vector',
      'Cực trị hàm số', 'Khảo sát hàm số', 'Đạo hàm & Tiếp tuyến', 
      'Hàm số & Đồ thị', 'Biến đổi biểu thức', 'Hình học phẳng', 'Khối tròn xoay'
    ],
    datasets: [{
      label: 'Mức độ thành thạo chuyên đề',
      data: [85, 40, 75, 60, 80, 50, 45, 90, 70, 65, 80, 55, 75, 60, 40, 85],
      fill: true,
      backgroundColor: 'rgba(26, 115, 232, 0.08)', // Light blue fill
      borderColor: 'rgba(26, 115, 232, 1)',       // Bold blue border
      borderWidth: 2,
      pointBackgroundColor: 'rgba(26, 115, 232, 1)',
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Hide top legend for minimalist design
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)' // Inner spoke lines
        },
        grid: {
          circular: false, // Polyhedral/polygon grid instead of circles
          color: 'rgba(0, 0, 0, 0.06)'
        },
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          showLabelBackdrop: false,
          font: {
            size: 10
          }
        },
        pointLabels: {
          font: {
            family: 'Arial, sans-serif',
            size: 11
          },
          color: '#333333'
        }
      }
    }
  };

  return (
    <div className="w-full h-[360px] md:h-[400px] relative flex items-center justify-center p-2 bg-[#FDFBF7] rounded-2xl border border-amber-100/80 shadow-sm">
      <Radar data={data} options={options} />
    </div>
  );
};
