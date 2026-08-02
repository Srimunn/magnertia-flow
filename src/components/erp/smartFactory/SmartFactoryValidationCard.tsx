import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";
import type { SmartFactoryDevelopmentRecord } from "@/services/types";

interface SmartFactoryValidationCardProps {
  record: SmartFactoryDevelopmentRecord;
  onChange: (field: keyof SmartFactoryDevelopmentRecord, value: any) => void;
}

export const SmartFactoryValidationCard: React.FC<SmartFactoryValidationCardProps> = ({
  record,
  onChange,
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

  const items = [
    { key: "factoryAcceptanceTest", label: "Factory Acceptance Test (FAT)" },
    { key: "siteAcceptanceTest", label: "Site Acceptance Test (SAT)" },
    { key: "cybersecurityValidation", label: "Cybersecurity Validation" },
    { key: "digitalTwinValidation", label: "Digital Twin Validation" },
    { key: "aiValidation", label: "AI Validation" },
    { key: "productionReadiness", label: "Production Readiness" },
  ] as const;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base font-bold text-foreground">
              7. Validation & Readiness
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Validation Score:</span>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {record.validationScore} / 100
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
              <span className="text-xs font-semibold text-foreground">
                {item.label}
                <MaicwBadge type="W" tooltip="Workflow Validation Checkbox" />
              </span>
              <Checkbox
                checked={record[item.key as keyof SmartFactoryDevelopmentRecord] as boolean}
                onCheckedChange={(checked) => onChange(item.key as keyof SmartFactoryDevelopmentRecord, !!checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
