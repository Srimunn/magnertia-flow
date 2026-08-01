import React from "react";
import type { ApqpRecord } from "@/services/types";
import { ApqpPhaseStepper } from "../ApqpPhaseStepper";
import { ApqpProjectOverviewCard } from "../ApqpProjectOverviewCard";
import { ApqpHealthDoughnut } from "../ApqpHealthDoughnut";
import { ApqpAiInsightsPanel } from "../ApqpAiInsightsPanel";
import { ApqpDeliverablesTable } from "../ApqpDeliverablesTable";
import { ApqpRecentActivitiesFeed } from "../ApqpRecentActivitiesFeed";
import { ApqpScoreCardsGrid } from "../ApqpScoreCardsGrid";
import { ApqpQuickActionsPanel } from "../ApqpQuickActionsPanel";
import { ApqpDocumentControlPanel } from "../ApqpDocumentControlPanel";
import { ApqpMilestonesPanel } from "../ApqpMilestonesPanel";
import { ApqpReviewApprovalPanel } from "../ApqpReviewApprovalPanel";
import { ApqpAttachmentsRow } from "../ApqpAttachmentsRow";

interface OverviewTabProps {
  record: ApqpRecord;
  onNavigateTab: (tab: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  record,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-4">
      {/* Top 5 APQP Phase Stepper Bar */}
      <ApqpPhaseStepper record={record} />

      {/* Main Grid: Left/Center Main Column & Right Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left/Center Column (9 of 12 cols) */}
        <div className="xl:col-span-9 space-y-4">
          {/* Row 1: Project Overview, Health Doughnut, AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <ApqpProjectOverviewCard record={record} />
            </div>
            <div className="lg:col-span-4">
              <ApqpHealthDoughnut record={record} />
            </div>
            <div className="lg:col-span-4">
              <ApqpAiInsightsPanel
                aiAssessment={record.aiAssessment}
                onViewAnalysis={() => onNavigateTab("ai")}
              />
            </div>
          </div>

          {/* Row 2: 2. Phase Key Deliverables Table & Recent Activities Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <ApqpDeliverablesTable deliverables={record.deliverables} />
            </div>
            <div className="lg:col-span-4">
              <ApqpRecentActivitiesFeed
                activities={record.recentActivities}
                onViewHistory={() => onNavigateTab("history")}
              />
            </div>
          </div>

          {/* Row 3: 5 Readiness Score Cards Grid */}
          <ApqpScoreCardsGrid record={record} onNavigateTab={onNavigateTab} />

          {/* Row 4: Attachments & Controlled Documents */}
          <ApqpAttachmentsRow record={record} onNavigateTab={onNavigateTab} />
        </div>

        {/* Right Sidebar Stack */}
        <div className="xl:col-span-3 space-y-3">
          <ApqpQuickActionsPanel />
          <ApqpDocumentControlPanel record={record} onViewHistory={() => onNavigateTab("history")} />
          <ApqpMilestonesPanel milestones={record.upcomingMilestones} onViewAll={() => onNavigateTab("phases")} />
          <ApqpReviewApprovalPanel record={record} />
        </div>
      </div>
    </div>
  );
};
