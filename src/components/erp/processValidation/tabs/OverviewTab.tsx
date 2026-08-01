import React from "react";
import type { ProcessValidationRecord } from "@/services/types";
import { ProcessValidationTopBadges } from "../ProcessValidationTopBadges";
import { ProcessValidationOverviewCard } from "../ProcessValidationOverviewCard";
import { ProcessValidationPlanCard } from "../ProcessValidationPlanCard";
import { ProcessValidationCapabilityCard } from "../ProcessValidationCapabilityCard";
import { ProcessValidationQualityCard } from "../ProcessValidationQualityCard";
import { ProcessValidationEquipmentCard } from "../ProcessValidationEquipmentCard";
import { ProcessValidationSummaryCard } from "../ProcessValidationSummaryCard";
import { ProcessValidationAiInsightsPanel } from "../ProcessValidationAiInsightsPanel";
import { ProcessValidationDocumentLinksCard } from "../ProcessValidationDocumentLinksCard";
import { ProcessValidationSystemInfoCard } from "../ProcessValidationSystemInfoCard";
import { ProcessValidationReviewApprovalPanel } from "../ProcessValidationReviewApprovalPanel";
import { ProcessValidationAttachmentsRow } from "../ProcessValidationAttachmentsRow";

interface OverviewTabProps {
  record: ProcessValidationRecord;
  onNavigateTab: (tab: any) => void;
  onLogTrialRun: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  record,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-4">
      {/* Row 1: Top 6 Summary Badges */}
      <ProcessValidationTopBadges record={record} />

      {/* Main Grid: Left/Center Main Column & Right Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left/Center Column (9 of 12 cols) */}
        <div className="xl:col-span-9 space-y-4">
          {/* Row 2: 1. Overview, 3. Validation Plan, 4. Capability Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <ProcessValidationOverviewCard record={record} />
            </div>
            <div className="lg:col-span-4">
              <ProcessValidationPlanCard record={record} />
            </div>
            <div className="lg:col-span-4">
              <ProcessValidationCapabilityCard
                record={record}
                onViewDetails={() => onNavigateTab("capability")}
              />
            </div>
          </div>

          {/* Row 3: 5. Quality Verification, Equipment Readiness, 8. Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <ProcessValidationQualityCard
                record={record}
                onViewDetails={() => onNavigateTab("quality")}
              />
            </div>
            <div className="lg:col-span-4">
              <ProcessValidationEquipmentCard
                record={record}
                onViewDetails={() => onNavigateTab("equipment")}
              />
            </div>
            <div className="lg:col-span-4">
              <ProcessValidationSummaryCard record={record} />
            </div>
          </div>

          {/* Row 4: 10. Review & Approval Status Board */}
          <ProcessValidationReviewApprovalPanel
            record={record}
            onViewApprovalFlow={() => onNavigateTab("approval")}
          />

          {/* Row 5: Attachments & Validation Documents */}
          <ProcessValidationAttachmentsRow record={record} onNavigateTab={onNavigateTab} />
        </div>

        {/* Right Sidebar Stack */}
        <div className="xl:col-span-3 space-y-3">
          <ProcessValidationAiInsightsPanel
            aiAssessment={record.aiAssessment}
            onViewAnalysis={() => onNavigateTab("ai")}
          />
          <ProcessValidationDocumentLinksCard
            attachments={record.attachments}
            onViewAll={() => onNavigateTab("attachments")}
          />
          <ProcessValidationSystemInfoCard record={record} />
        </div>
      </div>
    </div>
  );
};
