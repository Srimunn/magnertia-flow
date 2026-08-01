import React from "react";
import { FileSpreadsheet } from "lucide-react";
import type { PfmeaRecord, PfmeaRecommendation } from "@/services/types";

interface SummaryTabProps {
  record: PfmeaRecord;
  onUpdateRecommendation?: (rec: PfmeaRecommendation) => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  record,
  onUpdateRecommendation,
}) => {
  const scoreMatrix = [
    { label: "Function Readiness Score", score: record.functionReadinessScore, weight: "25%", status: "Good" },
    { label: "Validation Readiness Score", score: record.validationScore, weight: "25%", status: "Good" },
    { label: "AI Health Score", score: record.aiHealthScore, weight: "25%", status: "Good" },
    { label: "Overall PFMEA Readiness Score", score: record.overallPfmeaReadinessScore, weight: "25%", status: "Good" },
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            MAICW Executive PFMEA Summary & Production Release Recommendation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consolidates function readiness, process validation, open high-risk RPN items, and AI health metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold">Overall Readiness:</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {record.overallPfmeaReadinessScore} / 100
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-3">PFMEA Quality Vector</th>
              <th className="py-2.5 px-3 text-center">Weight</th>
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
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border space-y-3">
        <h3 className="font-bold text-foreground pb-2 border-b border-border">
          PFMEA Review Board Recommendation
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Current PFMEA Recommendation:</span>
          <select
            value={record.recommendation}
            onChange={(e) => onUpdateRecommendation?.(e.target.value as PfmeaRecommendation)}
            className="bg-background border border-input rounded px-3 py-1.5 font-bold text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="Approve PFMEA">Approve PFMEA</option>
            <option value="Update Process Controls">Update Process Controls</option>
            <option value="Reduce Process Risk">Reduce Process Risk</option>
            <option value="Complete Validation">Complete Validation</option>
            <option value="Implement Corrective Actions">Implement Corrective Actions</option>
            <option value="Release for Production">Release for Production</option>
          </select>
        </div>
      </div>
    </div>
  );
};
