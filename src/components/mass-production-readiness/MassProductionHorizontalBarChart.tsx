import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MassProductionHorizontalBarChartProps {
  manufacturingScore: number;
  qualityScore: number;
  supplyChainScore: number;
  operationsScore: number;
  aiReadinessScore: number;
}

export const MassProductionHorizontalBarChart: React.FC<MassProductionHorizontalBarChartProps> = ({
  manufacturingScore,
  qualityScore,
  supplyChainScore,
  operationsScore,
  aiReadinessScore,
}) => {
  const data = [
    { name: "Manufacturing", score: manufacturingScore, color: "#10b981" },
    { name: "Quality", score: qualityScore, color: "#2563eb" },
    { name: "Supply Chain", score: supplyChainScore, color: "#9333ea" },
    { name: "Operations", score: operationsScore, color: "#f97316" },
    { name: "AI Readiness", score: aiReadinessScore, color: "#14b8a6" },
  ];

  return (
    <div className="w-full h-56 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(150, 150, 150, 0.2)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#888888" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600 }} stroke="#888888" width={90} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#ffffff",
            }}
            formatter={(val: any) => [`${val}/100`, "Score"]}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
