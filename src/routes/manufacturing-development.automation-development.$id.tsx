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
  Cpu,
  Download,
  Link2,
} from "lucide-react";

import { automationDevelopmentService } from "@/services/automationDevelopmentService";
import type {
  AutomationDevelopment,
  AutomationApprovalDecision,
  VendorProductChip,
  InlineFileAttachment,
} from "@/lib/automation-development/types";
import {
  calculateProcessReadinessScore,
  calculateDevelopmentScore,
  calculateValidationScore,
  calculateCommissioningScore,
  calculateOverallAutomationReadiness,
  formatINR,
} from "@/lib/automation-development/scoring";
import { AppShell } from "@/components/erp/AppShell";
import { AutomationHeader } from "@/components/automation-development/AutomationHeader";
import { AutomationKpis } from "@/components/automation-development/AutomationKpis";
import { AutomationDeploymentReleasePanel } from "@/components/automation-development/AutomationDeploymentReleasePanel";
import { AutomationReviewTable } from "@/components/automation-development/AutomationReviewTable";
import { AutomationSummaryCard } from "@/components/automation-development/AutomationSummaryCard";
import { AutomationAiInsightsCard } from "@/components/automation-development/AutomationAiInsightsCard";
import { AutomationAttachmentsCard } from "@/components/automation-development/AutomationAttachmentsCard";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export const Route = createFileRoute("/manufacturing-development/automation-development/$id")({
  head: () => ({
    meta: [{ title: "Automation Development Detail · Magnertia ERP" }],
  }),
  component: AutomationDevelopmentDetailPage,
});

type TabKey =
  | "overview"
  | "process"
  | "systemDesign"
  | "development"
  | "testing"
  | "deployment"
  | "ai"
  | "summary"
  | "review"
  | "history";

function AutomationDevelopmentDetailPage() {
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

  const { data: record, isLoading, refetch } = useQuery<AutomationDevelopment>({
    queryKey: ["automationDevelopmentRecord", id],
    queryFn: () => automationDevelopmentService.fetchRecord(id),
  });

  const saveMutation = useMutation({
    mutationFn: (updated: AutomationDevelopment) => automationDevelopmentService.saveRecord(updated),
    onSuccess: (saved) => {
      queryClient.setQueryData(["automationDevelopmentRecord", id], saved);
      toast.success("Draft saved successfully!");
    },
  });

  const decisionMutation = useMutation({
    mutationFn: ({ decision, comments }: { decision: AutomationApprovalDecision; comments: string }) =>
      automationDevelopmentService.applyDecision(record!, decision, comments),
    onSuccess: (res) => {
      queryClient.setQueryData(["automationDevelopmentRecord", id], res.record);
      toast.success(res.message);
    },
    onError: (err: any) => {
      toast.error("Failed to set decision", { description: err?.message });
    },
  });

  const deploymentActionMutation = useMutation({
    mutationFn: (
      actionKey:
        | "releaseAutomatedProduction"
        | "registerAutomationAssets"
        | "archiveAutomationDocumentation"
        | "markProductionDeploymentApproved"
    ) => automationDevelopmentService.fireDeploymentAction(record!, actionKey),
    onSuccess: (updated) => {
      queryClient.setQueryData(["automationDevelopmentRecord", id], updated);
      toast.success("Deployment action executed!");
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell title="Automation Development">
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Automation Development Record...</p>
        </div>
      </AppShell>
    );
  }

  const handleSaveDraft = () => {
    saveMutation.mutate({ ...record });
  };

  const handleSubmitForApproval = () => {
    const gateCheck = automationDevelopmentService.checkGates(record);
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

  const handleDecisionChange = (decision: AutomationApprovalDecision, comments: string) => {
    decisionMutation.mutate({ decision, comments });
  };

  const scrollToSection = (tab: TabKey, ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const procScore = calculateProcessReadinessScore({
    currentCycleSec: record.cycleTimeCurrentSec,
    targetCycleSec: record.cycleTimeTargetSec,
    automationPotential: record.automationPotential,
  });

  const devScore = calculateDevelopmentScore({
    hasElectricalDesign: !!record.electricalPanelDesignFile,
    hasPlcProgram: !!record.plcProgramFile,
    hasHmiScreens: !!record.hmiScreensFile,
    hasScadaConfig: !!record.scadaConfigurationFile,
    hasRobotProgram: !!record.robotProgrammingFile,
    iiotStatus: record.iiotConnectivity,
    cybersecurityStatus: record.cybersecurityValidation,
  });

  const valScore = calculateValidationScore({
    fatCompleted: record.fatCompleted,
    satCompleted: record.satCompleted,
    dryRunCompleted: record.dryRunCompleted,
    performanceTest: record.performanceTest,
    safetyValidation: record.safetyValidation,
    oeeImprovementPct: record.oeeImprovementPct,
  });

  const commScore = calculateCommissioningScore({
    installationStatus: record.installationStatus,
    operatorTraining: record.operatorTraining,
    maintenanceTraining: record.maintenanceTraining,
    documentationCompleted: record.documentationCompleted,
    sopUpdated: record.sopUpdated,
    productionHandover: record.productionHandover,
  });

  const overallScore = calculateOverallAutomationReadiness({
    productivityScore: record.productivityScore,
    qualityImprovementScore: record.qualityImprovementScore,
    costSavingScore: record.costSavingScore,
    energyEfficiencyScore: record.energyEfficiencyScore,
    aiHealthScore: record.aiAutomationHealthScore,
  });

  const isAuthorized =
    record.workflowStatus === "Approved — Deployment Authorized" || record.approvalDecision === "Approved";

  const renderFileChip = (file: InlineFileAttachment | null, label: string) => {
    if (!file) {
      return (
        <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-dashed border-border/80">
          <span className="text-[11px] text-muted-foreground">{label} (Not Uploaded)</span>
          <button
            onClick={() => toast.info(`Upload ${label}...`)}
            className="text-[10px] font-bold text-blue-600 hover:underline"
          >
            Upload
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-foreground text-xs block truncate">{file.filename}</span>
            <span className="text-[9px] text-muted-foreground block">
              {file.uploadedAt} • {file.fileSize || "3.5 MB"} • v{file.version}
            </span>
          </div>
        </div>
        <button
          onClick={() => toast.success(`Downloading ${file.filename}...`)}
          className="p-1 text-muted-foreground hover:text-foreground rounded"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  const renderVendorChip = (chip: VendorProductChip, label: string) => {
    return (
      <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <a
          href={`/masters/vendor-products/${chip.id || "demo"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded font-extrabold text-xs text-blue-700 dark:text-blue-300 hover:underline"
        >
          {chip.name} <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <AppShell title="Automation Development">
        <div className="space-y-4">
          {/* Header Component */}
          <AutomationHeader
            record={record}
            onSaveDraft={handleSaveDraft}
            onSubmitForApproval={handleSubmitForApproval}
            onDuplicate={() => toast.info("Record duplicated")}
            onExportPdf={() => toast.info("Exporting PDF report...")}
            onPrint={() => window.print()}
            onArchive={() => toast.warning("Record archived")}
            onCloneVariant={() => toast.success("Cloned as Variant Automation Project!")}
          />

          {/* Sticky 10-Tab Bar (NO Attachments tab) */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-2 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
            {[
              { id: "overview", label: "Overview", ref: sec1Ref },
              { id: "process", label: "Process Analysis", ref: sec2Ref },
              { id: "systemDesign", label: "System Design", ref: sec3Ref },
              { id: "development", label: "Development", ref: sec4Ref },
              { id: "testing", label: "Testing & Validation", ref: sec5Ref },
              { id: "deployment", label: "Deployment", ref: sec6Ref },
              { id: "ai", label: "AI Assessment", ref: sec7Ref },
              { id: "summary", label: "Summary", ref: sec8Ref },
              { id: "review", label: "Review & Approval", ref: sec9Ref },
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
            {/* Top 6 KPI Donut Strip (Card 5 features custom AI Hexagon Badge) */}
            <AutomationKpis
              processReadinessScore={procScore}
              developmentScore={devScore}
              validationScore={valScore}
              commissioningScore={commScore}
              aiAutomationHealthScore={record.aiAutomationHealthScore}
              overallAutomationReadiness={overallScore}
            />

            {/* Frozen Context Snapshot Banner */}
            <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-foreground">
                  Manufacturing Context Snapshot: Process Flow {record.manufacturingContextSnapshot?.processEngineering?.processFlow}, BOM {record.manufacturingContextSnapshot?.plm?.bomReference}, Drawings {record.manufacturingContextSnapshot?.plm?.drawingsReference}.
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">
                Snapshotted: {record.manufacturingContextSnapshot?.snapshotAt}
              </span>
            </div>

            {/* Main Layout: 2 Columns on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left 2 Columns: Main Flow */}
              <div className="lg:col-span-2 space-y-6">
                {/* Section 1 — Automation Project Overview */}
                <div ref={sec1Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    1. Automation Project Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Automation Category</label>
                        <select
                          value={record.automationCategory}
                          onChange={(e) =>
                            saveMutation.mutate({ ...record, automationCategory: e.target.value as any })
                          }
                          className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                        >
                          <option value="Industrial Robotics">Industrial Robotics</option>
                          <option value="Collaborative Robotics">Collaborative Robotics</option>
                          <option value="Machine Vision">Machine Vision</option>
                          <option value="AGV & AMR">AGV & AMR</option>
                          <option value="PLC-based Automation">PLC-based Automation</option>
                          <option value="SCADA Integration">SCADA Integration</option>
                          <option value="IIoT">IIoT</option>
                          <option value="Full Cell Automation">Full Cell Automation</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Automation Objective</label>
                        <textarea
                          rows={2}
                          value={record.automationObjective}
                          onChange={(e) => saveMutation.mutate({ ...record, automationObjective: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Existing Manual Process</label>
                        <textarea
                          rows={2}
                          value={record.existingManualProcess}
                          onChange={(e) => saveMutation.mutate({ ...record, existingManualProcess: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Proposed Automated Process</label>
                        <textarea
                          rows={2}
                          value={record.proposedAutomatedProcess}
                          onChange={(e) => saveMutation.mutate({ ...record, proposedAutomatedProcess: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Business Justification</label>
                        <textarea
                          rows={2}
                          value={record.businessJustification}
                          onChange={(e) => saveMutation.mutate({ ...record, businessJustification: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Expected Benefits</label>
                        <textarea
                          rows={2}
                          value={record.expectedBenefits}
                          onChange={(e) => saveMutation.mutate({ ...record, expectedBenefits: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Priority</label>
                        <select
                          value={record.priority}
                          onChange={(e) => saveMutation.mutate({ ...record, priority: e.target.value as any })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">Project Status</span>
                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold rounded-full">
                          {record.projectStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 — Process Analysis */}
                <div ref={sec2Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    2. Process Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Current Process Flow</label>
                        {renderFileChip(record.currentProcessFlowFile, "Current Flow PDF")}
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Target Process Flow</label>
                        {renderFileChip(record.targetProcessFlowFile, "Target Flow PDF")}
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground font-semibold">Cycle Time (Current)</span>
                        <span className="font-bold text-foreground">{record.cycleTimeCurrentSec.toFixed(2)} sec</span>
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground font-semibold">Cycle Time (Target)</span>
                        <span className="font-bold text-emerald-600">{record.cycleTimeTargetSec.toFixed(2)} sec</span>
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground font-semibold">Bottleneck Process</span>
                        <span className="font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2.5 py-0.5 rounded">
                          {record.bottleneckProcess}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground font-semibold">Automation Potential</span>
                        <span className="font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded">
                          {record.automationPotential}/100
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground font-semibold">ROI Estimate</span>
                        <div className="text-right">
                          <span className="font-black text-emerald-600 text-sm block">
                            {formatINR(record.roiEstimateInr, { style: "full" })}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({formatINR(record.roiEstimateInr, { style: "crore" })})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded border border-emerald-200">
                      Process Readiness Score: {procScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 3 — Automation System Design */}
                <div ref={sec3Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    3. Automation System Design (Hardware & Software Specifications)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Automation Architecture</label>
                        {renderFileChip(record.automationArchitectureFile, "Architecture PDF")}
                      </div>

                      {renderVendorChip(record.plcPlatform, "PLC Platform")}
                      {renderVendorChip(record.hmiPlatform, "HMI Platform")}
                      {renderVendorChip(record.scadaPlatform, "SCADA Platform")}
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      {renderVendorChip(record.robotCobotModel, "Robot / Cobot Model")}
                      {renderVendorChip(record.machineVisionSystem, "Machine Vision System")}

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Sensor Configuration</label>
                        {renderFileChip(record.sensorConfigurationFile, "Sensors Config PDF")}
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Control Logic Reference</label>
                        {renderFileChip(record.controlLogicReferenceFile, "Control Logic PDF")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4 — Hardware & Software Development */}
                <div ref={sec4Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    4. Hardware & Software Development
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Electrical Panel Design</label>
                        {renderFileChip(record.electricalPanelDesignFile, "Panel Design PDF")}
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">PLC Program (.a17/.l5x)</label>
                        {renderFileChip(record.plcProgramFile, "PLC Program File")}
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">HMI Screens (.zip/.mer)</label>
                        {renderFileChip(record.hmiScreensFile, "HMI Screens Archive")}
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">SCADA Configuration (.pdf/.zip)</label>
                        {renderFileChip(record.scadaConfigurationFile, "SCADA Config File")}
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Robot Programming (.mod/.rapid)</label>
                        {renderFileChip(record.robotProgrammingFile, "Robot Program File")}
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded bg-muted/40 border border-border">
                        <span className="font-semibold text-foreground">IIoT Connectivity</span>
                        <span className="px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 font-extrabold border border-emerald-300">
                          {record.iiotConnectivity} ✓
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded bg-muted/40 border border-border">
                        <span className="font-semibold text-foreground">Cybersecurity Validation</span>
                        <span className="px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 font-extrabold border border-blue-300">
                          {record.cybersecurityValidation} ✓
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded border border-blue-200">
                      Development Score: {devScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 5 — Testing & Validation */}
                <div ref={sec5Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    5. Testing & Validation
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "FAT Completed", key: "fatCompleted" },
                      { label: "SAT Completed", key: "satCompleted" },
                      { label: "Dry Run Completed", key: "dryRunCompleted" },
                      { label: "Performance Test", key: "performanceTest" },
                      { label: "Safety Validation", key: "safetyValidation" },
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
                        <span className="text-emerald-600 font-bold">Passed ✓</span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                      <span className="font-semibold text-foreground">OEE Improvement (%)</span>
                      <input
                        type="number"
                        step="0.1"
                        value={record.oeeImprovementPct}
                        onChange={(e) => saveMutation.mutate({ ...record, oeeImprovementPct: parseFloat(e.target.value) || 0 })}
                        className="w-24 p-1 bg-background border border-input rounded text-right font-extrabold text-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded border border-purple-200">
                      Validation Score: {valScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 6 — Deployment & Commissioning */}
                <div ref={sec6Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    6. Deployment & Commissioning
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                      <span className="font-semibold text-foreground">Installation Status</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                        {record.installationStatus}
                      </span>
                    </div>

                    {[
                      { label: "Operator Training", key: "operatorTraining" },
                      { label: "Maintenance Training", key: "maintenanceTraining" },
                      { label: "Documentation Completed", key: "documentationCompleted" },
                      { label: "SOP Updated", key: "sopUpdated" },
                      { label: "Production Handover", key: "productionHandover" },
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
                        <span className="text-emerald-600 font-bold">Completed ✓</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-orange-600 bg-orange-50 dark:bg-orange-950 px-3 py-1 rounded border border-orange-200">
                      Commissioning Score: {commScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 7 — AI Automation Assessment */}
                <div ref={sec7Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 className="text-sm font-bold text-foreground">7. AI Automation Assessment</h2>
                    <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs rounded">
                      AI Health Score: {record.aiAutomationHealthScore}/100
                    </span>
                  </div>

                  <div className="divide-y divide-border/60 text-xs">
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Process Optimization</span>
                      <span className="text-muted-foreground">{record.aiProcessOptimization}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Cycle Time Prediction</span>
                      <span className="text-muted-foreground">{record.aiCycleTimePrediction}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Predictive Maintenance</span>
                      <span className="text-muted-foreground">{record.aiPredictiveMaintenance}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Energy Optimization</span>
                      <span className="text-muted-foreground">{record.aiEnergyOptimization}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Automation Recommendations</span>
                      <span className="text-muted-foreground">{record.aiAutomationRecommendations}</span>
                    </div>
                  </div>
                </div>

                {/* Automation Deployment Release Panel */}
                <AutomationDeploymentReleasePanel
                  actions={record.deploymentReleaseActions}
                  isAuthorized={isAuthorized}
                  onFireAction={(actionKey) => deploymentActionMutation.mutate(actionKey)}
                />

                {/* Section 9 — Review & Approval (8 Approvers Table) */}
                <div ref={sec9Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    9. Review & Approval (8 Approver Roles)
                  </h2>
                  <AutomationReviewTable
                    reviewers={record.reviewers}
                    currentDecision={record.approvalDecision}
                    comments={record.reviewComments}
                    approvalDate={record.approvalDate}
                    onDecisionChange={handleDecisionChange}
                  />
                </div>

                {/* System Information */}
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
                      <span className="font-bold text-foreground">{record.projectStatus}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Version</span>
                      <span className="font-bold text-foreground">{record.version}</span>
                    </div>
                  </div>
                </div>

                {/* History Links Row (4 separate links) */}
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
                <AutomationAiInsightsCard
                  onJumpToAiSection={() => scrollToSection("ai", sec7Ref)}
                />

                {/* Section 8 Summary Card */}
                <div ref={sec8Ref}>
                  <AutomationSummaryCard
                    productivityScore={record.productivityScore}
                    qualityImprovementScore={record.qualityImprovementScore}
                    costSavingScore={record.costSavingScore}
                    energyEfficiencyScore={record.energyEfficiencyScore}
                    aiHealthScore={record.aiAutomationHealthScore}
                    validationScore={valScore}
                    commissioningScore={commScore}
                    recommendation={record.recommendation}
                    onRecommendationChange={(rec) => saveMutation.mutate({ ...record, recommendation: rec })}
                  />
                </div>

                {/* Attachments Card Strip (with modal launcher) */}
                <div>
                  <AutomationAttachmentsCard attachments={record.attachments} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </TooltipProvider>
  );
}
