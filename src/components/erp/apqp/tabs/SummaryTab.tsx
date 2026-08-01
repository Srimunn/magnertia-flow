import React from "react";
import { FileSpreadsheet } from "lucide-react";
import type { ApqpRecord, ApqpRecommendation } from "@/services/types";

interface SummaryTabProps {
  record: ApqpRecord;
  onUpdateRecommendation?: (rec: ApqpRecommendation) => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  record,
  onUpdateRecommendation,
}) => {
  const scoreMatrix = [
    { label: "Design Readiness Score", score: record.designScore, weight: "20%", status: "Good" },
    { label: "Validation Readiness Score", score: record.validationScore, weight: "20%", status: "Good" },
    { label: "Supplier Quality Score", score: record.supplierQualityScore, weight: "20%", status: "Good" },
    { label: "Risk Readiness Score", score: record.riskScore, weight: "20%", status: "Good" },
    { label: "APQP Health Score", score: record.apqpHealthScore, weight: "20%", status: "Good" },
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            MAICW Executive APQP Summary & Recommendation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consolidates quality planning scores across design, manufacturing, supplier, and risk vectors.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold">Overall Readiness:</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {record.overallProjectReadiness} / 100
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-3">APQP Quality Vector</th>
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
          APQP Review Board Recommendation
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Current APQP Recommendation:</span>
          <select
            value={record.recommendation}
            onChange={(e) => onUpdateRecommendation?.(e.target.value as ApqpRecommendation)}
            className="bg-background border border-input rounded px-3 py-1.5 font-bold text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="Approve APQP">Approve APQP</option>
            <option value="Update Design">Update Design</option>
            <option value="Improve Process Capability">Improve Process Capability</option>
            <option value="Complete Validation">Complete Validation</option>
            <option value="Mitigate Risks">Mitigate Risks</option>
            <option value="Release for Production">Release for Production</option>
          </select>
        </div>
      </div>
    </div>
  );
};
