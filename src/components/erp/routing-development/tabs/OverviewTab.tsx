import React from "react";
import type { RoutingRecord } from "@/services/types";
import { OperationRoutingTable } from "../OperationRoutingTable";
import { ProcessFlowDiagram } from "../ProcessFlowDiagram";
import { ResourceAllocationCard } from "../ResourceAllocationCard";
import { ManufacturingValidationCard } from "../ManufacturingValidationCard";
import { QualityComplianceCard } from "../QualityComplianceCard";
import { ProductionCostAnalysisCard } from "../ProductionCostAnalysisCard";
import { AiRoutingAssessmentPanel } from "../AiRoutingAssessmentPanel";
import { RoutingSummaryPanel } from "../RoutingSummaryPanel";
import { ReviewApprovalPanel } from "../ReviewApprovalPanel";
import { RoutingAttachmentsRow } from "../RoutingAttachmentsRow";
import { RoutingSystemInfoPanel } from "../RoutingSystemInfoPanel";

interface OverviewTabProps {
  record: RoutingRecord;
  onAddOperation: () => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  record,
  onAddOperation,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-4">
      {/* Main Top Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left/Center Column (9 of 12 cols) */}
        <div className="xl:col-span-9 space-y-4">
          {/* Operations Table + Process Flow Diagram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 xl:col-span-8">
              <OperationRoutingTable
                operations={record.operations}
                onAddOperation={onAddOperation}
              />
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <ProcessFlowDiagram />
            </div>
          </div>

          {/* 4 Cards Grid (3. Resources, 4. Validation, 5. Quality, 6. Cost) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResourceAllocationCard record={record} />
            <ManufacturingValidationCard record={record} />
            <QualityComplianceCard record={record} />
            <ProductionCostAnalysisCard record={record} />
          </div>

          {/* Attachments Row */}
          <RoutingAttachmentsRow record={record} onNavigateTab={onNavigateTab} />
        </div>

        {/* Right Sidebar Stack */}
        <div className="xl:col-span-3 space-y-3">
          <AiRoutingAssessmentPanel
            aiAssessment={record.aiAssessment}
            onViewAnalysis={() => onNavigateTab("ai")}
          />
          <RoutingSummaryPanel record={record} />
          <ReviewApprovalPanel record={record} />
          <RoutingSystemInfoPanel record={record} onNavigateTab={onNavigateTab} />
        </div>
      </div>
    </div>
  );
};
