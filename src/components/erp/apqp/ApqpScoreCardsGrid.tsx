import React from "react";
import {
  FileCheck,
  Factory,
  Users,
  ShieldAlert,
  Calculator,
  ArrowRight,
} from "lucide-react";
import type { ApqpRecord } from "@/services/types";

interface ApqpScoreCardsGridProps {
  record: ApqpRecord;
  onNavigateTab: (tab: any) => void;
}

export const ApqpScoreCardsGrid: React.FC<ApqpScoreCardsGridProps> = ({
  record,
  onNavigateTab,
}) => {
  const cards = [
    {
      title: "3. Design Readiness",
      score: record.designScore,
      icon: FileCheck,
      color: "#10b981", // Emerald
      tab: "inputs",
    },
    {
      title: "4. Validation Readiness",
      score: record.validationScore,
      icon: Factory,
      color: "#3b82f6", // Blue
      tab: "validation",
    },
    {
      title: "5. Supplier Quality",
      score: record.supplierQualityScore,
      icon: Users,
      color: "#f97316", // Orange
      tab: "supplier",
    },
    {
      title: "6. Risk Readiness",
      score: record.riskScore,
      icon: ShieldAlert,
      color: "#ef4444", // Red
      tab: "risk",
    },
    {
      title: "7. Cost Readiness",
      score: record.costReadinessScore,
      icon: Calculator,
      color: "#14b8a6", // Teal
      tab: "summary",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="bg-card border border-border rounded-lg shadow-sm p-3 flex flex-col justify-between hover:shadow transition-shadow"
          >
            <div>
              <h3 className="font-bold text-foreground text-xs mb-2 truncate" title={c.title}>
                {c.title}
              </h3>

              <div className="flex items-center justify-between my-1">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${c.color}15`, color: c.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-foreground">{c.score}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold block">/ 100</span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Good</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab(c.tab)}
              className="mt-2 text-[10px] font-bold text-primary hover:underline flex items-center justify-end gap-1"
            >
              View Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
