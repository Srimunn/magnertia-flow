import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gauge, ArrowRight } from "lucide-react";
import type { ManufacturingExcellenceRecord } from "@/services/types";

interface ExcellenceKpiSnapshotCardProps {
  record: ManufacturingExcellenceRecord;
  onViewDashboard: () => void;
}

export const ExcellenceKpiSnapshotCard: React.FC<ExcellenceKpiSnapshotCardProps> = ({
  record,
  onViewDashboard,
}) => {
  const renderSparkline = (pts: number[], color: string) => {
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const range = max - min || 1;
    const pointsString = pts
      .map((val, idx) => {
        const x = (idx / (pts.length - 1)) * 50;
        const y = 20 - ((val - min) / range) * 15;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg className="h-5 w-12 overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsString}
        />
      </svg>
    );
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-bold text-foreground">
              Quick KPI Snapshot
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        {/* Row 1: OEE, FPY, PPM */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
            <span className="text-[10px] font-bold text-muted-foreground">OEE</span>
            <span className="my-0.5 text-xs font-black text-blue-600 dark:text-blue-400">{record.oeePercentage}%</span>
            <div className="flex justify-center">{renderSparkline([68, 70, 71, 69, 72.65], "#3b82f6")}</div>
          </div>

          <div className="flex flex-col rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
            <span className="text-[10px] font-bold text-muted-foreground">FPY</span>
            <span className="my-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400">{record.firstPassYield}%</span>
            <div className="flex justify-center">{renderSparkline([94, 95, 94.5, 96, 96.4], "#10b981")}</div>
          </div>

          <div className="flex flex-col rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
            <span className="text-[10px] font-bold text-muted-foreground">PPM</span>
            <span className="my-0.5 text-xs font-black text-rose-600 dark:text-rose-400">{record.customerPpm}</span>
            <div className="flex justify-center">{renderSparkline([1200, 1100, 950, 900, 850], "#ef4444")}</div>
          </div>
        </div>

        {/* Row 2: Energy, CO2, Cost Savings */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
            <span className="text-[10px] font-bold text-muted-foreground">Energy (MWh/Unit)</span>
            <span className="my-0.5 text-xs font-black text-foreground">{record.energyConsumption}</span>
            <div className="flex justify-center">{renderSparkline([1.4, 1.35, 1.3, 1.28, 1.24], "#8b5cf6")}</div>
          </div>

          <div className="flex flex-col rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
            <span className="text-[10px] font-bold text-muted-foreground">CO₂ (tCO₂e/Unit)</span>
            <span className="my-0.5 text-xs font-black text-foreground">{record.carbonEmissions}</span>
            <div className="flex justify-center">{renderSparkline([0.8, 0.75, 0.72, 0.7, 0.68], "#06b6d4")}</div>
          </div>

          <div className="flex flex-col rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
            <span className="text-[10px] font-bold text-muted-foreground">Cost Saving (₹)</span>
            <span className="my-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400">18.75 L</span>
            <div className="flex justify-center">{renderSparkline([5, 8, 12, 15, 18.75], "#10b981")}</div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onViewDashboard}
          className="mt-1 w-full gap-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
        >
          <span>View KPI Dashboard</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
};
