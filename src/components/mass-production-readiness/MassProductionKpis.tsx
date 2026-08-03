import React from "react";
import { getScoreBand } from "@/lib/mass-production-readiness/scoring";

interface MassProductionKpisProps {
  overallScore: number;
  manufacturingScore: number;
  qualityScore: number;
  supplyChainScore: number;
  operationsScore: number;
  aiReadinessScore: number;
}

export const MassProductionKpis: React.FC<MassProductionKpisProps> = ({
  overallScore,
  manufacturingScore,
  qualityScore,
  supplyChainScore,
  operationsScore,
  aiReadinessScore,
}) => {
  const cards = [
    { label: "Overall Readiness", score: overallScore },
    { label: "Manufacturing Score", score: manufacturingScore },
    { label: "Quality Score", score: qualityScore },
    { label: "Supply Chain Score", score: supplyChainScore },
    { label: "Operations Score", score: operationsScore },
    { label: "AI Readiness Score", score: aiReadinessScore },
  ];

  // SVG Ring Renderer
  const renderDonut = (value: number, strokeColor: string) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/20"
            fill="transparent"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke={strokeColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-foreground">{value}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, idx) => {
        const band = getScoreBand(c.score);
        return (
          <div
            key={idx}
            className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                {c.label}
              </span>
              <span className="text-lg font-black text-foreground">{c.score}/100</span>
              <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${band.colorClass}`}>
                {band.label}
              </span>
            </div>
            {renderDonut(c.score, band.ringColor)}
          </div>
        );
      })}
    </div>
  );
};
