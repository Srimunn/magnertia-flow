import React from "react";
import type { ControlPlanRecord } from "@/services/types";
import { ControlPlanCharacteristicsTable } from "../ControlPlanCharacteristicsTable";

interface CharacteristicsTabProps {
  record: ControlPlanRecord;
  onAddCharacteristic?: () => void;
}

export const CharacteristicsTab: React.FC<CharacteristicsTabProps> = ({
  record,
  onAddCharacteristic,
}) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Stage 1 - Process & Product Characteristics Definition
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Defines special characteristics (KCC/KPC), product tolerances, process parameters, control methods, and readiness scores.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs text-muted-foreground font-semibold">Characteristic Readiness:</span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {record.characteristicReadinessScore} / 100
          </span>
        </div>
      </div>

      <ControlPlanCharacteristicsTable
        characteristics={record.characteristics}
        onAddCharacteristic={onAddCharacteristic}
      />
    </div>
  );
};
