"use client";

import React from 'react';
import { usePortfolio } from '../../src/contexts/PortfolioContext';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = {
  BTC: '#F7931A',   // 비트코인 오렌지색
  ETH: '#627EEA',   // 이더리움 파란색
  XRP: '#23292F',   // 리플 검정색
  XLM: '#14B6E7',   // 스텔라루멘 하늘색
  default: '#808080' // 기본 회색
};

export default function PortfolioPage() {
  const { portfolio } = usePortfolio();

  // 차트 데이터 준비
  const chartData = {
    labels: portfolio.assets.map(asset => asset.name),
    datasets: [
      {
        data: portfolio.assets.map(asset => (asset.currentPrice * asset.quantity / portfolio.totalValue) * 100),
        backgroundColor: portfolio.assets.map(asset => 
          CHART_COLORS[asset.symbol as keyof typeof CHART_COLORS] || CHART_COLORS.default
        ),
        borderColor: portfolio.assets.map(asset => 
          CHART_COLORS[asset.symbol as keyof typeof CHART_COLORS] || CHART_COLORS.default
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#fff',
          font: {
            size: 14
          },
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label} (${value.toFixed(2)}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  lineWidth: 1,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const totalValue = (portfolio.assets[context.dataIndex].currentPrice * 
                              portfolio.assets[context.dataIndex].quantity).toLocaleString();
            return [`${label}: ${value.toFixed(2)}%`, `평가금액: ${totalValue} KRW`];
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* 상단 요약 정보 */}
      <div className="bg-[#161B22] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">보유자산 현황</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">총 보유자산</p>
              <p className="text-xl font-bold">{portfolio.totalValue.toLocaleString()} KRW</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">총매수</p>
              <p className="text-xl font-bold">
                {portfolio.assets.reduce((sum, asset) => sum + (asset.purchasePrice * asset.quantity), 0).toLocaleString()} KRW
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">평가손익</p>
              <p className={`text-xl font-bold ${portfolio.totalProfitLoss >= 0 ? 'text-[#C84A31]' : 'text-[#1261C4]'}`}>
                {portfolio.totalProfitLoss.toLocaleString()} KRW
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">수익률</p>
              <p className={`text-xl font-bold ${portfolio.totalProfitLossPercentage >= 0 ? 'text-[#C84A31]' : 'text-[#1261C4]'}`}>
                {portfolio.totalProfitLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 포트폴리오 차트 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-[#161B22] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-4">포트폴리오 구성</h2>
          <div className="h-[400px]">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* 자산 목록 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-[#161B22] rounded-lg border border-gray-800">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="text-left py-4 px-6">보유자산</th>
                <th className="text-right py-4 px-6">보유수량</th>
                <th className="text-right py-4 px-6">매수평균가</th>
                <th className="text-right py-4 px-6">현재가</th>
                <th className="text-right py-4 px-6">평가금액</th>
                <th className="text-right py-4 px-6">평가손익</th>
                <th className="text-right py-4 px-6">수익률</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.assets.map((asset) => {
                const currentValue = asset.currentPrice * asset.quantity;
                const profitLoss = (asset.currentPrice - asset.purchasePrice) * asset.quantity;
                const profitLossPercentage = ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
                
                return (
                  <tr 
                    key={asset.symbol}
                    className="border-b border-gray-800 hover:bg-[#1C2128] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-gray-400">{asset.symbol}</p>
                      </div>
                    </td>
                    <td className="text-right py-4 px-6">
                      <p>{asset.quantity.toLocaleString()}</p>
                    </td>
                    <td className="text-right py-4 px-6">
                      <p>{asset.purchasePrice.toLocaleString()} KRW</p>
                    </td>
                    <td className="text-right py-4 px-6">
                      <p>{asset.currentPrice.toLocaleString()} KRW</p>
                    </td>
                    <td className="text-right py-4 px-6">
                      <p>{currentValue.toLocaleString()} KRW</p>
                    </td>
                    <td className="text-right py-4 px-6">
                      <p className={profitLoss >= 0 ? 'text-[#C84A31]' : 'text-[#1261C4]'}>
                        {profitLoss.toLocaleString()} KRW
                      </p>
                    </td>
                    <td className="text-right py-4 px-6">
                      <p className={profitLossPercentage >= 0 ? 'text-[#C84A31]' : 'text-[#1261C4]'}>
                        {profitLossPercentage.toFixed(2)}%
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 