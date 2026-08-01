import React from "react";
import type { PfmeaRecord } from "@/services/types";
import { PfmeaScoresHeader } from "../PfmeaScoresHeader";
import { PfmeaFailureAnalysisTable } from "../PfmeaFailureAnalysisTable";
import { PfmeaRecommendedActionsCard } from "../PfmeaRecommendedActionsCard";
import { PfmeaManufacturingValidationCard } from "../PfmeaManufacturingValidationCard";
import { PfmeaRpnDistributionChart } from "../PfmeaRpnDistributionChart";
import { PfmeaDocumentLinksCard } from "../PfmeaDocumentLinksCard";
import { PfmeaWorkflowProgressBar } from "../PfmeaWorkflowProgressBar";
import { PfmeaAiRiskInsightsPanel } from "../PfmeaAiRiskInsightsPanel";
import { PfmeaRiskPrioritySummary } from "../PfmeaRiskPrioritySummary";
import { PfmeaReviewApprovalPanel } from "../PfmeaReviewApprovalPanel";
import { PfmeaAttachmentsRow } from "../PfmeaAttachmentsRow";

interface OverviewTabProps {
  record: PfmeaRecord;
  onNavigateTab: (tab: any) => void;
  onAddFailureMode: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  record,
  onNavigateTab,
  onAddFailureMode,
}) => {
  return (
    <div className="space-y-4">
      {/* Top 5 Score Rings & RPN Stat Badges */}
      <PfmeaScoresHeader record={record} />

      {/* Main Grid: Left/Center Main Column & Right Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left/Center Column (9 of 12 cols) */}
        <div className="xl:col-span-9 space-y-4">
          {/* Row 1: Failure Analysis Table (Total 8 Failure Modes) */}
          <PfmeaFailureAnalysisTable
            failureModes={record.failureModes}
            onAddFailureMode={onAddFailureMode}
          />

          {/* Row 2: Bottom Cards Row matching mockup */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <PfmeaRecommendedActionsCard
                actions={record.recommendedActions}
                onViewAll={() => onNavigateTab("actions")}
              />
            </div>
            <div className="lg:col-span-3">
              <PfmeaManufacturingValidationCard
                record={record}
                onViewValidation={() => onNavigateTab("validation")}
              />
            </div>
            <div className="lg:col-span-3">
              <PfmeaRpnDistributionChart
                failureModes={record.failureModes}
                onViewRiskAnalysis={() => onNavigateTab("ai")}
              />
            </div>
            <div className="lg:col-span-2">
              <PfmeaDocumentLinksCard
                attachments={record.attachments}
                onViewAll={() => onNavigateTab("attachments")}
              />
            </div>
          </div>

          {/* Row 3: Workflow Progress Bar (6 Steps) */}
          <PfmeaWorkflowProgressBar record={record} />

          {/* Row 4: Attachments & Controlled Documents */}
          <PfmeaAttachmentsRow record={record} onNavigateTab={onNavigateTab} />
        </div>

        {/* Right Sidebar Stack */}
        <div className="xl:col-span-3 space-y-3">
          <PfmeaAiRiskInsightsPanel
            aiAssessment={record.aiAssessment}
            onViewAnalysis={() => onNavigateTab("ai")}
          />
          <PfmeaRiskPrioritySummary failureModes={record.failureModes} />
          <PfmeaReviewApprovalPanel record={record} />
        </div>
      </div>
    </div>
  );
};
