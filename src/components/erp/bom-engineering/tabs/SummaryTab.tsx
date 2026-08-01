import React from "react";
import { FileSpreadsheet, CheckCircle2, Award, Zap } from "lucide-react";
import type { BomEngineeringRecord, BomRecommendation } from "@/services/types";

interface SummaryTabProps {
  record: BomEngineeringRecord;
  onUpdateRecommendation?: (rec: BomRecommendation) => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  record,
  onUpdateRecommendation,
}) => {
  const scoreMatrix = [
    { label: "BOM Completeness Score", score: record.completenessScore, weight: "20%", status: "Excellent" },
    { label: "Material Availability Score", score: record.materialAvailabilityScore, weight: "20%", status: "Good" },
    { label: "Manufacturing Readiness Score", score: record.manufacturingReadinessScore, weight: "20%", status: "Excellent" },
    { label: "Quality Readiness Score", score: record.qualityReadinessScore, weight: "20%", status: "Good" },
    { label: "Cost Score", score: record.costScore, weight: "20%", status: "Good" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            MAICW Executive BOM Summary & Recommendation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consolidates readiness scores across all 5 operational vectors to recommend production release readiness.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold">Overall Readiness:</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {record.overallReadinessScore}%
          </span>
        </div>
      </div>

      {/* Score Matrix Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden text-xs">
        <div className="p-3 border-b border-border bg-muted/20">
          <h3 className="font-bold text-foreground">MAICW Score Audit Matrix</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-3">Readiness Category</th>
              <th className="py-2.5 px-3 text-center">Score Weight</th>
              <th className="py-2.5 px-3 text-center">Score</th>
              <th className="py-2.5 px-3 text-center">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {scoreMatrix.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/30">
                <td className="py-2.5 px-3 font-bold text-foreground">{item.label}</td>
                <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">{item.weight}</td>
                <td className="py-2.5 px-3 text-center font-extrabold font-mono text-foreground">{item.score}%</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Recommendation Selector */}
      <div className="bg-card p-4 rounded-lg border border-border text-xs space-y-3">
        <h3 className="font-bold text-foreground pb-2 border-b border-border">
          Engineering Review Board Recommendation
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Current System Recommendation</span>
            <span className="text-sm font-extrabold text-primary">{record.recommendation}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">Update Recommendation:</span>
            <select
              value={record.recommendation}
              onChange={(e) => onUpdateRecommendation?.(e.target.value as BomRecommendation)}
              className="bg-background border border-input rounded px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Approve BOM">Approve BOM</option>
              <option value="Update Components">Update Components</option>
              <option value="Optimize Cost">Optimize Cost</option>
              <option value="Review Supply Risk">Review Supply Risk</option>
              <option value="Validate Manufacturing">Validate Manufacturing</option>
              <option value="Release for Production">Release for Production</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
