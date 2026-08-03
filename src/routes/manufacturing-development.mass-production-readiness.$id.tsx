import { useState, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  Plus,
  RefreshCw,
  Info,
  Rocket,
  Lock,
} from "lucide-react";

import { massProductionReadinessService } from "@/services/massProductionReadinessService";
import type {
  MassProductionReadiness,
  ReadinessApprovalDecision,
} from "@/lib/mass-production-readiness/types";
import {
  calculateManufacturingScore,
  calculateQualityScore,
  calculateSupplyChainScore,
  calculateOperationalScore,
  calculateOverallMassProductionReadiness,
  calculateRecommendation,
} from "@/lib/mass-production-readiness/scoring";
import { AppShell } from "@/components/erp/AppShell";
import { MassProductionHeader } from "@/components/mass-production-readiness/MassProductionHeader";
import { MassProductionKpis } from "@/components/mass-production-readiness/MassProductionKpis";
import { MassProductionHorizontalBarChart } from "@/components/mass-production-readiness/MassProductionHorizontalBarChart";
import { MassProductionReviewTable } from "@/components/mass-production-readiness/MassProductionReviewTable";
import { MassProductionSopReleasePanel } from "@/components/mass-production-readiness/MassProductionSopReleasePanel";
import { MassProductionSummaryCard } from "@/components/mass-production-readiness/MassProductionSummaryCard";
import { MassProductionAiInsightsCard } from "@/components/mass-production-readiness/MassProductionAiInsightsCard";
import { MassProductionAttachmentsCard } from "@/components/mass-production-readiness/MassProductionAttachmentsCard";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export const Route = createFileRoute("/manufacturing-development/mass-production-readiness/$id")({
  head: () => ({
    meta: [{ title: "Mass Production Readiness Detail · Magnertia ERP" }],
  }),
  component: MassProductionReadinessDetailPage,
});

type TabKey =
  | "overview"
  | "manufacturing"
  | "quality"
  | "supplyChain"
  | "performance"
  | "operations"
  | "ai"
  | "summary"
  | "review"
  | "attachments"
  | "history";

function MassProductionReadinessDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Section Refs for sticky tab scrolling
  const sec1Ref = useRef<HTMLDivElement>(null);
  const sec2Ref = useRef<HTMLDivElement>(null);
  const sec3Ref = useRef<HTMLDivElement>(null);
  const sec4Ref = useRef<HTMLDivElement>(null);
  const sec5Ref = useRef<HTMLDivElement>(null);
  const sec6Ref = useRef<HTMLDivElement>(null);
  const sec7Ref = useRef<HTMLDivElement>(null);
  const sec8Ref = useRef<HTMLDivElement>(null);
  const sec9Ref = useRef<HTMLDivElement>(null);
  const secAttachmentsRef = useRef<HTMLDivElement>(null);

  const { data: record, isLoading, refetch } = useQuery<MassProductionReadiness>({
    queryKey: ["massProductionReadinessRecord", id],
    queryFn: () => massProductionReadinessService.fetchRecord(id),
  });

  const saveMutation = useMutation({
    mutationFn: (updated: MassProductionReadiness) => massProductionReadinessService.saveRecord(updated),
    onSuccess: (saved) => {
      queryClient.setQueryData(["massProductionReadinessRecord", id], saved);
      toast.success("Draft saved successfully!");
    },
  });

  const decisionMutation = useMutation({
    mutationFn: ({ decision, comments }: { decision: ReadinessApprovalDecision; comments: string }) =>
      massProductionReadinessService.applyDecision(record!, decision, comments),
    onSuccess: (res) => {
      queryClient.setQueryData(["massProductionReadinessRecord", id], res.record);
      toast.success(res.message);
    },
  });

  const sopActionMutation = useMutation({
    mutationFn: (actionKey: "releaseProductionOrders" | "authorizeSupplierDeliveries" | "releaseProductionMaterials" | "releaseSop") =>
      massProductionReadinessService.fireSopAction(record!, actionKey),
    onSuccess: (updated) => {
      queryClient.setQueryData(["massProductionReadinessRecord", id], updated);
      toast.success("SOP action executed!");
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell title="Mass Production Readiness">
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Mass Production Readiness Record...</p>
        </div>
      </AppShell>
    );
  }

  const handleSaveDraft = () => {
    saveMutation.mutate({ ...record });
  };

  const handleSubmitForApproval = () => {
    const gateCheck = massProductionReadinessService.checkGates(record);
    if (!gateCheck.canSubmit) {
      toast.error("Cannot submit for Executive Approval", {
        description: gateCheck.failingGates.join(" • "),
      });
      return;
    }
    const updated = { ...record, workflowStatus: "Under Review" as const };
    saveMutation.mutate(updated);
    toast.success("Submitted for Executive Approval!");
  };

  const handleDecisionChange = (decision: ReadinessApprovalDecision, comments: string) => {
    decisionMutation.mutate({ decision, comments });
  };

  const scrollToSection = (tab: TabKey, ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const mfgScore = calculateManufacturingScore({
    productionLineQualified: record.productionLineQualified,
    equipmentQualification: record.equipmentQualification,
    toolingQualification: record.toolingQualification,
    manufacturingCapacityVerified: record.manufacturingCapacityVerified,
    oeeTargetAchieved: record.oeeTargetAchieved,
    cycleTimeVerified: record.cycleTimeVerified,
    standardWorkAvailable: record.standardWorkAvailable,
  });

  const qualScore = calculateQualityScore({
    pfmeaApproved: record.pfmeaApproved,
    controlPlanApproved: record.controlPlanApproved,
    spcActive: record.spcActive,
    msaApproved: record.msaApproved,
    ppapStatus: record.ppapStatus,
    qualityTargetsAchieved: record.qualityTargetsAchieved,
    customerRequirementsVerified: record.customerRequirementsVerified,
  });

  const scScore = calculateSupplyChainScore({
    supplierApprovalStatus: record.supplierApprovalStatus,
    rawMaterialAvailability: record.rawMaterialAvailability,
    safetyStockAvailable: record.safetyStockAvailable,
    logisticsReadiness: record.logisticsReadiness,
    packagingValidation: record.packagingValidation,
    warehouseReady: record.warehouseReady,
  });

  const opsScore = calculateOperationalScore({
    operatorTrainingCompleted: record.operatorTrainingCompleted,
    maintenanceTeamReady: record.maintenanceTeamReady,
    sparePartsAvailable: record.sparePartsAvailable,
    safetyAuditCompleted: record.safetyAuditCompleted,
    emergencyResponsePlan: record.emergencyResponsePlan,
    itMesReady: record.itMesReady,
  });

  const overallScore = calculateOverallMassProductionReadiness({
    manufacturingScore: mfgScore,
    qualityScore: qualScore,
    supplyChainScore: scScore,
    operationalScore: opsScore,
    aiReadinessScore: record.aiProductionReadinessScore,
  });

  const isAuthorized = record.workflowStatus === "Mass Production Authorized" || record.approvalDecision === "Approved";

  return (
    <TooltipProvider>
      <AppShell title="Mass Production Readiness">
        <div className="space-y-4">
          {/* Header Component */}
          <MassProductionHeader
            record={record}
            onSaveDraft={handleSaveDraft}
            onSubmitForApproval={handleSubmitForApproval}
            onDuplicate={() => toast.info("Record duplicated")}
            onExportPdf={() => toast.info("Exporting PDF report...")}
            onPrint={() => window.print()}
            onArchive={() => toast.warning("Record archived")}
            onRevalidate={() => {
              handleDecisionChange("Additional Validation Required", "Triggered manual revalidation cycle.");
            }}
          />

          {/* Sticky 11-Tab Bar */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-2 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
            {[
              { id: "overview", label: "Overview", ref: sec1Ref },
              { id: "manufacturing", label: "Manufacturing", ref: sec2Ref },
              { id: "quality", label: "Quality", ref: sec3Ref },
              { id: "supplyChain", label: "Supply Chain", ref: sec4Ref },
              { id: "performance", label: "Performance", ref: sec5Ref },
              { id: "operations", label: "Operations", ref: sec6Ref },
              { id: "ai", label: "AI Assessment", ref: sec7Ref },
              { id: "summary", label: "Summary", ref: sec8Ref },
              { id: "review", label: "Review & Approval", ref: sec9Ref },
              { id: "attachments", label: "Attachments", ref: secAttachmentsRef },
              { id: "history", label: "Activity History", ref: sec9Ref },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id as TabKey, tab.ref)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="px-4 pb-12 space-y-6">
            {/* Top 6 KPI Donut Strip */}
            <MassProductionKpis
              overallScore={overallScore}
              manufacturingScore={mfgScore}
              qualityScore={qualScore}
              supplyChainScore={scScore}
              operationsScore={opsScore}
              aiReadinessScore={record.aiProductionReadinessScore}
            />

            {/* PPAP Gate Warning Banner if not approved */}
            {record.ppapStatus !== "Customer Approved" && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 rounded-lg text-xs flex items-center justify-between text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="font-semibold">
                    Awaiting PPAP Customer Approval. Hard Gate: Record cannot be submitted for executive approval until PPAP Status is "Customer Approved".
                  </span>
                </div>
                <span className="font-bold underline cursor-pointer" onClick={() => toast.info("Opening PPAP Management...")}>
                  View PPAP Record ↗
                </span>
              </div>
            )}

            {/* Main Layout: 2 Columns on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left 2 Columns: Main Flow */}
              <div className="lg:col-span-2 space-y-6">
                {/* Section 1 — Production Readiness Overview */}
                <div ref={sec1Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    1. Production Readiness Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Production Launch Target</label>
                        <input
                          type="date"
                          value={record.productionLaunchTarget}
                          onChange={(e) => saveMutation.mutate({ ...record, productionLaunchTarget: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">Production Program</span>
                        <a
                          href={`/production-planning/production-program/${record.productionProgramRef}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded font-bold text-blue-700 dark:text-blue-300 hover:underline"
                        >
                          {record.productionProgramRef} <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Manufacturing Strategy</label>
                        <select
                          value={record.manufacturingStrategy}
                          onChange={(e) =>
                            saveMutation.mutate({ ...record, manufacturingStrategy: e.target.value as any })
                          }
                          className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                        >
                          <option value="Make-to-Stock (MTS)">Make-to-Stock (MTS)</option>
                          <option value="Make-to-Order (MTO)">Make-to-Order (MTO)</option>
                          <option value="Assemble-to-Order (ATO)">Assemble-to-Order (ATO)</option>
                          <option value="Engineer-to-Order (ETO)">Engineer-to-Order (ETO)</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">Launch Phase</span>
                        <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold rounded-full">
                          {record.launchPhase}
                        </span>
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">Process Owner</span>
                        <div className="flex items-center gap-2 p-2 bg-muted/40 rounded border border-border">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="font-bold text-foreground">{record.processOwner}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Cross Functional Team</label>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {record.crossFunctionalTeam.map((m, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full font-bold text-foreground text-[10px]"
                            >
                              <User className="w-3 h-3 text-muted-foreground" />
                              {m.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Readiness Priority</label>
                        <select
                          value={record.readinessPriority}
                          onChange={(e) =>
                            saveMutation.mutate({ ...record, readinessPriority: e.target.value as any })
                          }
                          className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Full-width Launch Objective */}
                  <div className="pt-2">
                    <label className="text-muted-foreground font-semibold block mb-1">Launch Objective</label>
                    <textarea
                      rows={2}
                      value={record.launchObjective}
                      onChange={(e) => saveMutation.mutate({ ...record, launchObjective: e.target.value })}
                      className="w-full p-2 bg-background border border-input rounded text-xs text-foreground focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Section 2 — Manufacturing Readiness */}
                <div ref={sec2Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    2. Manufacturing Readiness
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-2.5">
                      {[
                        { label: "Production Line Qualified", key: "productionLineQualified" },
                        { label: "Equipment Qualification", key: "equipmentQualification" },
                        { label: "Tooling Qualification", key: "toolingQualification" },
                        { label: "Manufacturing Capacity Verified", key: "manufacturingCapacityVerified" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(record as any)[item.key]}
                              onChange={(e) => saveMutation.mutate({ ...record, [item.key]: e.target.checked })}
                              className="rounded text-primary"
                            />
                            <span className="font-semibold text-foreground">{item.label}</span>
                          </div>
                          <span className="text-emerald-600 font-bold">Ready ✓</span>
                        </div>
                      ))}
                    </div>

                    {/* Right Col */}
                    <div className="space-y-2.5">
                      {[
                        { label: "OEE Target Achieved", key: "oeeTargetAchieved" },
                        { label: "Cycle Time Verified", key: "cycleTimeVerified" },
                        { label: "Standard Work Available", key: "standardWorkAvailable" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(record as any)[item.key]}
                              onChange={(e) => saveMutation.mutate({ ...record, [item.key]: e.target.checked })}
                              className="rounded text-primary"
                            />
                            <span className="font-semibold text-foreground">{item.label}</span>
                          </div>
                          <span className="text-emerald-600 font-bold">Ready ✓</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded border border-emerald-200">
                      Manufacturing Readiness Score: {mfgScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 3 — Quality Readiness */}
                <div ref={sec3Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    3. Quality Readiness
                  </h2>
                  <div className="space-y-2.5 text-xs">
                    {[
                      { label: "PFMEA Approved", key: "pfmeaApproved" },
                      { label: "Control Plan Approved", key: "controlPlanApproved" },
                      { label: "SPC Active", key: "spcActive" },
                      { label: "MSA Approved", key: "msaApproved" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(record as any)[item.key]}
                            onChange={(e) => saveMutation.mutate({ ...record, [item.key]: e.target.checked })}
                            className="rounded text-primary"
                          />
                          <span className="font-semibold text-foreground">{item.label}</span>
                        </div>
                        <span className="text-emerald-600 font-bold">Approved ✓</span>
                      </div>
                    ))}

                    {/* PPAP Status Hard Gate Row */}
                    <div className="flex items-center justify-between p-3 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span className="font-extrabold text-foreground">PPAP Status (Executive Hard Gate)</span>
                      </div>
                      <select
                        value={record.ppapStatus}
                        onChange={(e) => saveMutation.mutate({ ...record, ppapStatus: e.target.value as any })}
                        className="px-3 py-1 bg-background border border-input rounded font-extrabold text-emerald-700 dark:text-emerald-300"
                      >
                        <option value="Customer Approved">Customer Approved ✓</option>
                        <option value="Submitted">Submitted (Pending)</option>
                        <option value="Not Submitted">Not Submitted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    {[
                      { label: "Quality Targets Achieved", key: "qualityTargetsAchieved" },
                      { label: "Customer Requirements Verified", key: "customerRequirementsVerified" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(record as any)[item.key]}
                            onChange={(e) => saveMutation.mutate({ ...record, [item.key]: e.target.checked })}
                            className="rounded text-primary"
                          />
                          <span className="font-semibold text-foreground">{item.label}</span>
                        </div>
                        <span className="text-emerald-600 font-bold">Verified ✓</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded border border-blue-200">
                      Quality Readiness Score: {qualScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 4 — Supply Chain Readiness */}
                <div ref={sec4Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    4. Supply Chain Readiness
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                        <span className="font-semibold text-foreground">Supplier Approval Status</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 font-bold">
                          {record.supplierApprovalStatus}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                        <span className="font-semibold text-foreground">Raw Material Availability</span>
                        <span className="text-emerald-600 font-bold">Available ✓</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                        <span className="font-semibold text-foreground">Safety Stock Available</span>
                        <span className="text-emerald-600 font-bold">Available ✓</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                        <span className="font-semibold text-foreground">Logistics Readiness</span>
                        <span className="text-emerald-600 font-bold">Ready ✓</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                        <span className="font-semibold text-foreground">Packaging Validation</span>
                        <span className="text-emerald-600 font-bold">Validated ✓</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                        <span className="font-semibold text-foreground">Warehouse Ready</span>
                        <span className="text-emerald-600 font-bold">Ready ✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded border border-purple-200">
                      Supply Chain Score: {scScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 5 — Production Performance */}
                <div ref={sec5Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    5. Production Performance (Carried from Pilot)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Planned Monthly Capacity</span>
                        <span className="font-bold text-foreground">
                          {record.plannedProductionCapacityUnitsPerMonth.toLocaleString()} Units/Month
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Expected Daily Output</span>
                        <span className="font-bold text-foreground">{record.expectedDailyOutputUnits} Units/Day</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-muted-foreground cursor-help underline decoration-dotted">
                              OEE (%)
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Carried from Pilot Production</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="font-bold text-purple-600">{record.oee}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">First Pass Yield (FPY)</span>
                        <span className="font-bold text-emerald-600">{record.fpy}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Scrap Rate</span>
                        <span className="font-bold text-foreground">{record.scrapRate}%</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Process Capability (Cp/Cpk)</span>
                        <span className="font-bold text-foreground">
                          {record.cp} / {record.cpk}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-orange-600 bg-orange-50 dark:bg-orange-950 px-3 py-1 rounded border border-orange-200">
                      Performance Score: {record.performanceScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 6 — Operational Readiness */}
                <div ref={sec6Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    6. Operational Readiness
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2.5">
                      {[
                        { label: "Operator Training Completed", key: "operatorTrainingCompleted" },
                        { label: "Maintenance Team Ready", key: "maintenanceTeamReady" },
                        { label: "Spare Parts Available", key: "sparePartsAvailable" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(record as any)[item.key]}
                              onChange={(e) => saveMutation.mutate({ ...record, [item.key]: e.target.checked })}
                              className="rounded text-primary"
                            />
                            <span className="font-semibold text-foreground">{item.label}</span>
                          </div>
                          <span className="text-emerald-600 font-bold">Ready ✓</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { label: "Safety Audit Completed", key: "safetyAuditCompleted" },
                        { label: "Emergency Response Plan", key: "emergencyResponsePlan" },
                        { label: "IT & MES Ready", key: "itMesReady" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(record as any)[item.key]}
                              onChange={(e) => saveMutation.mutate({ ...record, [item.key]: e.target.checked })}
                              className="rounded text-primary"
                            />
                            <span className="font-semibold text-foreground">{item.label}</span>
                          </div>
                          <span className="text-emerald-600 font-bold">Ready ✓</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded border border-emerald-200">
                      Operational Readiness Score: {opsScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 7 — AI Production Readiness Assessment */}
                <div ref={sec7Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 className="text-sm font-bold text-foreground">7. AI Production Readiness Assessment</h2>
                    <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs rounded">
                      AI Readiness Score: {record.aiProductionReadinessScore}/100
                    </span>
                  </div>

                  <div className="divide-y divide-border/60 text-xs">
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Production Risk Analysis</span>
                      <span className="text-muted-foreground">{record.aiProductionRiskAnalysis}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Capacity Prediction</span>
                      <span className="text-muted-foreground">{record.aiCapacityPrediction}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Bottleneck Prediction</span>
                      <span className="text-muted-foreground">{record.aiBottleneckPrediction}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Quality Prediction</span>
                      <span className="text-muted-foreground">{record.aiQualityPrediction}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Demand Forecast</span>
                      <span className="text-muted-foreground">{record.aiDemandForecast}</span>
                    </div>
                  </div>
                </div>

                {/* Section 8 — Executive Summary (Horizontal Bar Chart) */}
                <div ref={sec8Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 className="text-sm font-bold text-foreground">8. Executive Summary (Scores)</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">Overall Readiness:</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {overallScore}/100
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 font-extrabold text-xs">
                        Excellent
                      </span>
                    </div>
                  </div>

                  <MassProductionHorizontalBarChart
                    manufacturingScore={mfgScore}
                    qualityScore={qualScore}
                    supplyChainScore={scScore}
                    operationsScore={opsScore}
                    aiReadinessScore={record.aiProductionReadinessScore}
                  />
                </div>

                {/* SOP Release Panel (Start of Production side-effects) */}
                <MassProductionSopReleasePanel
                  sopActions={record.sopActions}
                  isAuthorized={isAuthorized}
                  onFireAction={(actionKey) => sopActionMutation.mutate(actionKey)}
                />

                {/* Section 9 — Review & Approval (TABLE-based) */}
                <div ref={sec9Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    9. Review & Approval
                  </h2>
                  <MassProductionReviewTable
                    reviewers={record.reviewers}
                    currentDecision={record.approvalDecision}
                    comments={record.executiveComments}
                    approvalDate={record.approvalDate}
                    ppapStatus={record.ppapStatus}
                    onDecisionChange={handleDecisionChange}
                  />
                </div>

                {/* Full-width System Information */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    System Information
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Created By</span>
                      <span className="font-semibold text-foreground">{record.createdBy}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Created Date</span>
                      <span className="font-medium text-foreground">{record.createdDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Last Modified By</span>
                      <span className="font-semibold text-foreground">{record.lastModifiedBy}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Last Modified Date</span>
                      <span className="font-medium text-foreground">{record.lastUpdated}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Workflow Stage</span>
                      <span className="font-bold text-foreground">{record.launchPhase}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Version</span>
                      <span className="font-bold text-foreground">{record.version}</span>
                    </div>
                  </div>
                </div>

                {/* History Links Row (4 separate links per late house style) */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-muted-foreground border-t border-border">
                  <button onClick={() => toast.info("Opening Audit Trail drawer...")} className="hover:text-foreground hover:underline">
                    Audit Trail
                  </button>
                  <span>·</span>
                  <button onClick={() => toast.info("Opening Activity History drawer...")} className="hover:text-foreground hover:underline">
                    Activity History
                  </button>
                  <span>·</span>
                  <button onClick={() => toast.info("Opening Change History drawer...")} className="hover:text-foreground hover:underline">
                    Change History
                  </button>
                  <span>·</span>
                  <button onClick={() => toast.info("Opening Workflow History drawer...")} className="hover:text-foreground hover:underline">
                    Workflow History
                  </button>
                </div>
              </div>

              {/* Right Rail Sidebar Column (Float Cards) */}
              <div className="space-y-6">
                {/* AI Insights Card */}
                <MassProductionAiInsightsCard
                  onJumpToAiSection={() => scrollToSection("ai", sec7Ref)}
                />

                {/* Executive Summary Card */}
                <MassProductionSummaryCard
                  manufacturingScore={mfgScore}
                  qualityScore={qualScore}
                  supplyChainScore={scScore}
                  operationsScore={opsScore}
                  aiReadinessScore={record.aiProductionReadinessScore}
                  ppapStatus={record.ppapStatus}
                  overrideRecommendation={record.recommendationOverride}
                />

                {/* Attachments Card Strip */}
                <div ref={secAttachmentsRef}>
                  <MassProductionAttachmentsCard
                    attachments={record.attachments}
                    onJumpToAttachmentsTab={() => scrollToSection("attachments", secAttachmentsRef)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </TooltipProvider>
  );
}
