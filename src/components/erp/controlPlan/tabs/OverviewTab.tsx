import React from "react";
import type { ControlPlanRecord } from "@/services/types";
import { ControlPlanOverviewCard } from "../ControlPlanOverviewCard";
import { ControlPlanReadinessRings } from "../ControlPlanReadinessRings";
import { ControlPlanCharacteristicsTable } from "../ControlPlanCharacteristicsTable";
import { ControlPlanInspectionCard } from "../ControlPlanInspectionCard";
import { ControlPlanProcessControlCard } from "../ControlPlanProcessControlCard";
import { ControlPlanQualityVerificationCard } from "../ControlPlanQualityVerificationCard";
import { ControlPlanAiCard } from "../ControlPlanAiCard";
import { ControlPlanSummaryTable } from "../ControlPlanSummaryTable";
import { ControlPlanAiInsightsPanel } from "../ControlPlanAiInsightsPanel";
import { ControlPlanScoreCard } from "../ControlPlanScoreCard";
import { ControlPlanDocumentLinksCard } from "../ControlPlanDocumentLinksCard";
import { ControlPlanReviewApprovalPanel } from "../ControlPlanReviewApprovalPanel";
import { ControlPlanAttachmentsRow } from "../ControlPlanAttachmentsRow";

interface OverviewTabProps {
  record: ControlPlanRecord;
  onNavigateTab: (tab: any) => void;
  onAddCharacteristic: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  record,
  onNavigateTab,
  onAddCharacteristic,
}) => {
  return (
    <div className="space-y-4">
      {/* Row 1: 1. Control Plan Overview & Readiness Rings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <ControlPlanOverviewCard record={record} />
        </div>
        <div className="lg:col-span-4">
          <ControlPlanReadinessRings record={record} />
        </div>
      </div>

      {/* Main Grid: Left/Center Main Column & Right Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left/Center Column (9 of 12 cols) */}
        <div className="xl:col-span-9 space-y-4">
          {/* Row 2: 2. Process & Product Characteristics Table */}
          <ControlPlanCharacteristicsTable
            characteristics={record.characteristics}
            onAddCharacteristic={onAddCharacteristic}
            onViewAll={() => onNavigateTab("characteristics")}
          />

          {/* Row 3: 3. Inspection, 4. Process Control, 5. Quality Verification, 6. AI Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3">
              <ControlPlanInspectionCard
                record={record}
                onViewDetails={() => onNavigateTab("inspection")}
              />
            </div>
            <div className="lg:col-span-3">
              <ControlPlanProcessControlCard
                record={record}
                onViewDetails={() => onNavigateTab("control")}
              />
            </div>
            <div className="lg:col-span-3">
              <ControlPlanQualityVerificationCard
                record={record}
                onViewDetails={() => onNavigateTab("verification")}
              />
            </div>
            <div className="lg:col-span-3">
              <ControlPlanAiCard
                record={record}
                onViewAnalysis={() => onNavigateTab("ai")}
              />
            </div>
          </div>

          {/* Row 4: 7. Process Control Plan (Summary Table) */}
          <ControlPlanSummaryTable
            summaryRows={record.summaryRows}
            onViewFullControlPlan={() => onNavigateTab("summary")}
          />

          {/* Row 5: Attachments & Controlled Documents */}
          <ControlPlanAttachmentsRow record={record} onNavigateTab={onNavigateTab} />
        </div>

        {/* Right Sidebar Stack */}
        <div className="xl:col-span-3 space-y-3">
          <ControlPlanAiInsightsPanel
            aiAssessment={record.aiAssessment}
            onViewAnalysis={() => onNavigateTab("ai")}
          />
          <ControlPlanScoreCard record={record} />
          <ControlPlanDocumentLinksCard
            attachments={record.attachments}
            onViewAll={() => onNavigateTab("attachments")}
          />
          <ControlPlanReviewApprovalPanel
            record={record}
            onViewApprovalFlow={() => onNavigateTab("approval")}
          />
        </div>
      </div>
    </div>
  );
};
