import React from "react";
import type { BomEngineeringRecord } from "@/services/types";
import { BomStructureTable } from "../BomStructureTable";
import { Bom3dPreview } from "../Bom3dPreview";
import { BomAiInsightsPanel } from "../BomAiInsightsPanel";
import { BomCostSummaryPanel } from "../BomCostSummaryPanel";
import { BomDocumentControlPanel } from "../BomDocumentControlPanel";
import { BomOverviewGrid } from "../BomOverviewGrid";

interface OverviewTabProps {
  record: BomEngineeringRecord;
  onAddComponent: () => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  record,
  onAddComponent,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Main Section: Structure Table + 3D Preview (Left/Center) & Right Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left/Center Main Column (9 of 12 cols on XL screens) */}
        <div className="xl:col-span-9 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* BOM Structure Table (8/12 cols) */}
            <div className="lg:col-span-7 xl:col-span-8">
              <BomStructureTable items={record.items} onAddComponent={onAddComponent} />
            </div>

            {/* BOM Structure 3D Preview (4/12 cols) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <Bom3dPreview />
            </div>
          </div>
        </div>

        {/* Right Sidebar Stack: AI Insights, Cost Summary, Document Control & Quick Actions */}
        <div className="xl:col-span-3 space-y-3">
          <BomAiInsightsPanel
            aiInsights={record.aiInsights}
            onViewAnalysis={() => onNavigateTab("ai")}
          />
          <BomCostSummaryPanel record={record} />
          <BomDocumentControlPanel
            record={record}
            onAddComponent={onAddComponent}
            onNavigateTab={onNavigateTab}
          />
        </div>
      </div>

      {/* Bottom Row: 4 Overview Cards Grid */}
      <BomOverviewGrid record={record} onNavigateTab={onNavigateTab} />
    </div>
  );
};
