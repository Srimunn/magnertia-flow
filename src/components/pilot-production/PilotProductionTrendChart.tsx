import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { StabilityTrendPoint } from "@/lib/pilot-production/types";

interface PilotProductionTrendChartProps {
  data: StabilityTrendPoint[];
}

export const PilotProductionTrendChart: React.FC<PilotProductionTrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-48 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.2)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#888888" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#888888" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#ffffff",
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#2563eb" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
