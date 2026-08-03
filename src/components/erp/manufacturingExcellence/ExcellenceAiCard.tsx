import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import type { ManufacturingExcellenceRecord } from "@/services/types";

interface ExcellenceAiCardProps {
  record: ManufacturingExcellenceRecord;
  onChange: (field: keyof ManufacturingExcellenceRecord, value: any) => void;
  isEditing?: boolean;
}

export const ExcellenceAiCard: React.FC<ExcellenceAiCardProps> = ({
  record,
  onChange,
  isEditing = true,
}) => {
  const MaicwBadge = ({ type, tooltip }: { type: "M" | "A" | "I" | "C" | "W"; tooltip: string }) => {
    const colors = {
      M: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200",
      A: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
      I: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
      C: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
      W: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200",
    };
    return (
      <span
        title={tooltip}
        className={`ml-1.5 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase border ${colors[type]}`}
      >
        {type}
      </span>
    );
  };

  const fields = [
    { key: "aiPerformanceInsights", label: "AI Performance Insights", placeholder: "AI identifies key loss areas and root causes..." },
    { key: "productivityForecast", label: "Productivity Forecast", placeholder: "Expected 14% productivity improvement..." },
    { key: "predictiveQuality", label: "Predictive Quality", placeholder: "AI predicts defect reduction by 20%..." },
    { key: "costOptimizationText", label: "Cost Optimization", placeholder: "Potential savings of ₹ 18.75 Lakhs..." },
    { key: "riskPredictionText", label: "Risk Prediction", placeholder: "Low risk with proactive AI alerts..." },
    { key: "aiRecommendations", label: "AI Recommendations", placeholder: "Focus on downtime, energy and quality..." },
  ] as const;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-base font-bold text-foreground">
              7. AI Excellence Assessment
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">AI Score:</span>
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {record.aiExcellenceScore} / 100
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              {f.label}
              <MaicwBadge type="A" tooltip="Auto-generated AI Insight" />
            </label>
            {isEditing ? (
              <Textarea
                rows={2}
                value={record[f.key as keyof ManufacturingExcellenceRecord] as string}
                onChange={(e) => onChange(f.key as keyof ManufacturingExcellenceRecord, e.target.value)}
                placeholder={f.placeholder}
                className="text-xs"
              />
            ) : (
              <p className="rounded-md bg-muted/40 p-2.5 text-xs text-foreground">
                {record[f.key as keyof ManufacturingExcellenceRecord] as string}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
