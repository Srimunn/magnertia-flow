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

import { roboticsIntegrationService } from "@/services/roboticsIntegrationService";
import type {
  RoboticsIntegration,
  RoboticsApprovalDecision,
  VendorRobotProductChip,
  InlineFileAttachment,
} from "@/lib/robotics-integration/types";
import {
  calculateCellReadinessScore,
  calculateIntegrationScore,
  calculateProgrammingScore,
  calculateValidationScore,
  calculateCommissioningScore,
  calculateOverallRoboticsReadiness,
  formatINR,
} from "@/lib/robotics-integration/scoring";
import { AppShell } from "@/components/erp/AppShell";
import { RoboticsHeader } from "@/components/robotics-integration/RoboticsHeader";
import { RoboticsKpis } from "@/components/robotics-integration/RoboticsKpis";
import { RoboticsDeploymentReleasePanel } from "@/components/robotics-integration/RoboticsDeploymentReleasePanel";
import { RoboticsReviewTable } from "@/components/robotics-integration/RoboticsReviewTable";
import { RoboticsSummaryCard } from "@/components/robotics-integration/RoboticsSummaryCard";
import { RoboticsAiInsightsCard } from "@/components/robotics-integration/RoboticsAiInsightsCard";
import { RoboticsAttachmentsCard } from "@/components/robotics-integration/RoboticsAttachmentsCard";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export const Route = createFileRoute("/manufacturing-development/robotics-integration/$id")({
  head: () => ({
    meta: [{ title: "Robotics Integration Detail · Magnertia ERP" }],
  }),
  component: RoboticsIntegrationDetailPage,
});

type TabKey =
  | "overview"
  | "cellDesign"
  | "systemIntegration"
  | "programming"
  | "testing"
  | "deployment"
  | "ai"
  | "summary"
  | "review"
  | "history";

function RoboticsIntegrationDetailPage() {
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

  const { data: record, isLoading, refetch } = useQuery<RoboticsIntegration>({
    queryKey: ["roboticsIntegrationRecord", id],
    queryFn: () => roboticsIntegrationService.fetchRecord(id),
  });

  const saveMutation = useMutation({
    mutationFn: (updated: RoboticsIntegration) => roboticsIntegrationService.saveRecord(updated),
    onSuccess: (saved) => {
      queryClient.setQueryData(["roboticsIntegrationRecord", id], saved);
      toast.success("Draft saved successfully!");
    },
  });

  const decisionMutation = useMutation({
    mutationFn: ({ decision, comments }: { decision: RoboticsApprovalDecision; comments: string }) =>
      roboticsIntegrationService.applyDecision(record!, decision, comments),
    onSuccess: (res) => {
      queryClient.setQueryData(["roboticsIntegrationRecord", id], res.record);
      toast.success(res.message);
    },
    onError: (err: any) => {
      toast.error("Failed to set decision", { description: err?.message });
    },
  });

  const deploymentActionMutation = useMutation({
    mutationFn: (
      actionKey:
        | "releaseRoboticProductionCell"
        | "registerRoboticAssets"
        | "archiveRobotPrograms"
        | "markProductionDeploymentApproved"
    ) => roboticsIntegrationService.fireDeploymentAction(record!, actionKey),
    onSuccess: (updated) => {
      queryClient.setQueryData(["roboticsIntegrationRecord", id], updated);
      toast.success("Deployment action executed!");
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell title="Robotics Integration">
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Robotics Integration Record...</p>
        </div>
      </AppShell>
    );
  }

  const handleSaveDraft = () => {
    saveMutation.mutate({ ...record });
  };

  const handleSubmitForApproval = () => {
    const gateCheck = roboticsIntegrationService.checkGates(record);
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

  const handleDecisionChange = (decision: RoboticsApprovalDecision, comments: string) => {
    decisionMutation.mutate({ decision, comments });
  };

  const scrollToSection = (tab: TabKey, ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cellScore = calculateCellReadinessScore({
    hasLayout: !!record.robotCellLayoutFile,
    hasRobotModel: !!record.robotModel.name,
    hasPayloadAndReach: record.robotPayloadKg > 0 && record.robotReachMm > 0,
    hasDof: record.degreesOfFreedom > 0,
    hasEoat: !!record.eoatConfiguration,
    hasSafetyZone: !!record.safetyZoneLayoutFile,
  });

  const integScore = calculateIntegrationScore({
    plc: record.plcIntegration,
    scada: record.scadaIntegration,
    mes: record.mesIntegration,
    erp: record.erpIntegration,
    vision: record.machineVisionIntegration,
    iiot: record.iiotConnectivity,
    digitalTwin: record.digitalTwinAvailable,
  });

  const progScore = calculateProgrammingScore({
    hasRobotProgram: !!record.robotProgramFile,
    hasMotionSequence: !!record.motionSequenceFile,
    pathOptimized: record.pathOptimization,
    collisionDetected: record.collisionDetection,
    cycleTimeSec: record.cycleTimeSec,
  });

  const valScore = calculateValidationScore({
    simulationCompleted: record.simulationCompleted,
    offlineVerified: record.offlineProgrammingVerified,
    fatCompleted: record.fatCompleted,
    satCompleted: record.satCompleted,
    safetyValidation: record.safetyValidation,
    performanceValidation: record.performanceValidation,
    oeeImprovementPct: record.oeeImprovementPct,
  });

  const commScore = calculateCommissioningScore({
    installationStatus: record.installationStatus,
    robotCalibration: record.robotCalibration,
    operatorTraining: record.operatorTraining,
    maintenanceTraining: record.maintenanceTraining,
    sopUpdated: record.sopUpdated,
    productionHandover: record.productionHandover,
  });

  const overallScore = calculateOverallRoboticsReadiness({
    cellReadinessScore: cellScore,
    integrationScore: integScore,
    programmingScore: progScore,
    validationScore: valScore,
    commissioningScore: commScore,
    aiHealthScore: record.aiRoboticsHealthScore,
  });

  const isAuthorized =
    record.workflowStatus === "Approved — Deployment Authorized" || record.approvalDecision === "Approved";

  const renderFileChip = (file: InlineFileAttachment | null, label: string) => {
    if (!file) {
      return (
        <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-dashed border-border/80 text-xs">
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
      <div className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors text-xs">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-foreground truncate block">{file.filename}</span>
            <span className="text-[9px] text-muted-foreground block">
              {file.uploadedAt} • {file.fileSize || "3.2 MB"} • v{file.version}
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

  const renderRobotModelChip = (chip: VendorRobotProductChip) => {
    return (
      <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border text-xs">
        <span className="font-semibold text-muted-foreground">Robot Model</span>
        <div className="flex items-center gap-1.5">
          <a
            href={`/masters/vendor-products/${chip.id || "demo"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded font-extrabold text-blue-700 dark:text-blue-300 hover:underline"
          >
            {chip.name} <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => toast.success(`Downloading spec sheet for ${chip.name}...`)}
            className="p-1.5 bg-background border border-input rounded hover:bg-accent text-foreground transition-colors"
            title="Download Spec Sheet PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <AppShell title="Robotics Integration">
        <div className="space-y-4">
          {/* Header Component */}
          <RoboticsHeader
            record={record}
            onSaveDraft={handleSaveDraft}
            onSubmitForApproval={handleSubmitForApproval}
            onDuplicate={() => toast.info("Record duplicated")}
            onExportPdf={() => toast.info("Exporting PDF report...")}
            onPrint={() => window.print()}
            onArchive={() => toast.warning("Record archived")}
            onCloneVariant={() => toast.success("Cloned as Variant Robotics Cell!")}
          />

          {/* Sticky 10-Tab Bar (NO Attachments tab) */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-2 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
            {[
              { id: "overview", label: "Overview", ref: sec1Ref },
              { id: "cellDesign", label: "Robot Cell Design", ref: sec2Ref },
              { id: "systemIntegration", label: "System Integration", ref: sec3Ref },
              { id: "programming", label: "Programming", ref: sec4Ref },
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
            {/* Top 7 KPI Donut Strip (Card 7 features custom AI Hexagon Badge) */}
            <RoboticsKpis
              overallRoboticsReadiness={overallScore}
              cellReadinessScore={cellScore}
              integrationScore={integScore}
              programmingScore={progScore}
              validationScore={valScore}
              commissioningScore={commScore}
              aiRoboticsHealthScore={record.aiRoboticsHealthScore}
            />

            {/* Frozen Context Snapshot Banner (Includes optional Automation Dev upstream link) */}
            <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-foreground">
                  Manufacturing Context Snapshot: Process Flow {record.manufacturingContextSnapshot?.processEngineering?.processFlow}, CAD {record.manufacturingContextSnapshot?.plm?.cadModels}.
                  {record.manufacturingContextSnapshot?.automationDev && (
                    <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                      Upstream Linked: Automation Dev ({record.manufacturingContextSnapshot.automationDev.automationDevId})
                    </span>
                  )}
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
                {/* Section 1 — Robotics Project Overview */}
                <div ref={sec1Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    1. Robotics Project Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Robotics Category</label>
                        <select
                          value={record.roboticsCategory}
                          onChange={(e) =>
                            saveMutation.mutate({ ...record, roboticsCategory: e.target.value as any })
                          }
                          className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                        >
                          <option value="Industrial Robot">Industrial Robot</option>
                          <option value="Collaborative Robot (Cobot)">Collaborative Robot (Cobot)</option>
                          <option value="SCARA">SCARA</option>
                          <option value="Delta">Delta</option>
                          <option value="Cartesian">Cartesian</option>
                          <option value="AGV & AMR">AGV & AMR</option>
                          <option value="Welding Robot">Welding Robot</option>
                          <option value="Painting Robot">Painting Robot</option>
                          <option value="Assembly Robot">Assembly Robot</option>
                          <option value="Palletizing Robot">Palletizing Robot</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Business Objective</label>
                        <textarea
                          rows={2}
                          value={record.businessObjective}
                          onChange={(e) => saveMutation.mutate({ ...record, businessObjective: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Manual Process</label>
                        <textarea
                          rows={2}
                          value={record.manualProcess}
                          onChange={(e) => saveMutation.mutate({ ...record, manualProcess: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Automated Robotic Process</label>
                        <textarea
                          rows={2}
                          value={record.automatedRoboticProcess}
                          onChange={(e) => saveMutation.mutate({ ...record, automatedRoboticProcess: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground font-semibold">Expected Productivity Gain</span>
                        <span className="font-extrabold text-emerald-600 text-sm">
                          +{record.expectedProductivityGainPct.toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground font-semibold">ROI Estimate</span>
                        <span className="font-black text-emerald-600 text-sm">
                          {formatINR(record.roiEstimateInr)}
                        </span>
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

                {/* Section 2 — Robot Cell Design */}
                <div ref={sec2Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    2. Robot Cell Design (Physical Specifications)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Robot Cell Layout</label>
                        {renderFileChip(record.robotCellLayoutFile, "Welding Cell Layout PDF")}
                      </div>

                      {renderRobotModelChip(record.robotModel)}

                      <div className="flex justify-between items-center p-2.5 bg-muted/40 rounded border border-border">
                        <span className="font-semibold text-muted-foreground">Robot Payload</span>
                        <span className="font-bold text-foreground">{record.robotPayloadKg.toFixed(1)} kg</span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-muted/40 rounded border border-border">
                        <span className="font-semibold text-muted-foreground">Robot Reach</span>
                        <span className="font-bold text-foreground">{record.robotReachMm} mm</span>
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2.5 bg-muted/40 rounded border border-border">
                        <span className="font-semibold text-muted-foreground">Degrees of Freedom (DOF)</span>
                        <span className="font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                          {record.degreesOfFreedom} DOF
                        </span>
                      </div>

                      <div className="p-2.5 bg-muted/40 rounded border border-border space-y-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-semibold text-muted-foreground cursor-help underline decoration-dotted block">
                              EOAT Configuration
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>End of Arm Tooling — mounted on robot end effector</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="font-bold text-foreground block">{record.eoatConfiguration}</span>
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Safety Zone Layout</label>
                        {renderFileChip(record.safetyZoneLayoutFile, "Safety Zone Layout PDF")}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded border border-emerald-200">
                      Cell Readiness Score: {cellScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 3 — Robotics System Integration */}
                <div ref={sec3Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    3. Robotics System Integration (7 Points)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "PLC Integration", key: "plcIntegration" },
                      { label: "SCADA Integration", key: "scadaIntegration" },
                      { label: "MES Integration", key: "mesIntegration" },
                      { label: "ERP Integration", key: "erpIntegration" },
                      { label: "Machine Vision Integration", key: "machineVisionIntegration" },
                      { label: "IIoT Connectivity", key: "iiotConnectivity" },
                      { label: "Digital Twin Available", key: "digitalTwinAvailable" },
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
                        <span className={`font-bold ${(record as any)[item.key] ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {(record as any)[item.key] ? "Integrated ✓" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded border border-blue-200">
                      Integration Score: {integScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 4 — Robot Programming */}
                <div ref={sec4Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    4. Robot Programming & Motion Control
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Robot Program (.vpp/.mod/.rapid)</label>
                        {renderFileChip(record.robotProgramFile, "Welding Program File")}
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Motion Sequence</label>
                        {renderFileChip(record.motionSequenceFile, "Motion Sequence File")}
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={record.pathOptimization}
                            onChange={(e) => saveMutation.mutate({ ...record, pathOptimization: e.target.checked })}
                            className="rounded text-primary"
                          />
                          <span className="font-semibold text-foreground">Path Optimization</span>
                        </div>
                        <span className="text-emerald-600 font-bold">Optimized ✓</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={record.collisionDetection}
                            onChange={(e) => saveMutation.mutate({ ...record, collisionDetection: e.target.checked })}
                            className="rounded text-primary"
                          />
                          <span className="font-semibold text-foreground">Collision Detection</span>
                        </div>
                        <span className="text-emerald-600 font-bold">Passed ✓</span>
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2.5 bg-muted/40 rounded border border-border">
                        <span className="font-semibold text-muted-foreground">Cycle Time</span>
                        <span className="font-extrabold text-foreground">{record.cycleTimeSec.toFixed(2)} sec</span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-muted/40 rounded border border-border">
                        <span className="font-semibold text-muted-foreground">Program Package Version</span>
                        <span className="font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                          {record.programVersion}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded border border-purple-200">
                      Programming Score: {progScore}/100
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
                      { label: "Simulation Completed", key: "simulationCompleted" },
                      { label: "Offline Programming Verified", key: "offlineProgrammingVerified" },
                      { label: "FAT Completed", key: "fatCompleted" },
                      { label: "SAT Completed", key: "satCompleted" },
                      { label: "Safety Validation", key: "safetyValidation" },
                      { label: "Performance Validation", key: "performanceValidation" },
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
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded border border-emerald-200">
                      Validation Score: {valScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 6 — Production Deployment */}
                <div ref={sec6Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    6. Production Deployment
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                      <span className="font-semibold text-foreground">Installation Status</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                        {record.installationStatus}
                      </span>
                    </div>

                    {[
                      { label: "Robot Calibration", key: "robotCalibration" },
                      { label: "Operator Training", key: "operatorTraining" },
                      { label: "Maintenance Training", key: "maintenanceTraining" },
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
                        <span className={`font-bold ${(record as any)[item.key] ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {(record as any)[item.key] ? "Completed ✓" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-orange-600 bg-orange-50 dark:bg-orange-950 px-3 py-1 rounded border border-orange-200">
                      Commissioning Score: {commScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 7 — AI Robotics Assessment */}
                <div ref={sec7Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 className="text-sm font-bold text-foreground">7. AI Robotics Assessment</h2>
                    <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs rounded">
                      AI Health Score: {record.aiRoboticsHealthScore}/100
                    </span>
                  </div>

                  <div className="divide-y divide-border/60 text-xs">
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Motion Optimization</span>
                      <span className="text-muted-foreground">{record.aiMotionOptimization}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Collision Prediction</span>
                      <span className="text-muted-foreground">{record.aiCollisionPrediction}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Predictive Maintenance</span>
                      <span className="text-muted-foreground">{record.aiPredictiveMaintenance}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Vision Accuracy</span>
                      <span className="text-muted-foreground">{record.aiVisionAccuracy}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Robot Performance</span>
                      <span className="text-muted-foreground">{record.aiRobotPerformanceAnalysis}</span>
                    </div>
                  </div>
                </div>

                {/* Robotics Deployment Release Panel */}
                <RoboticsDeploymentReleasePanel
                  actions={record.deploymentReleaseActions}
                  isAuthorized={isAuthorized}
                  onFireAction={(actionKey) => deploymentActionMutation.mutate(actionKey)}
                />

                {/* Section 9 — Review & Approval (9 Approvers Table) */}
                <div ref={sec9Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    9. Review & Approval (9 Approver Roles)
                  </h2>
                  <RoboticsReviewTable
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
                <RoboticsAiInsightsCard
                  onJumpToAiSection={() => scrollToSection("ai", sec7Ref)}
                />

                {/* Section 8 Summary Card */}
                <div ref={sec8Ref}>
                  <RoboticsSummaryCard
                    cellReadinessScore={cellScore}
                    integrationScore={integScore}
                    programmingScore={progScore}
                    validationScore={valScore}
                    commissioningScore={commScore}
                    aiHealthScore={record.aiRoboticsHealthScore}
                    recommendation={record.recommendation}
                    onRecommendationChange={(rec) => saveMutation.mutate({ ...record, recommendation: rec })}
                  />
                </div>

                {/* Attachments Card Strip (with modal launcher) */}
                <div>
                  <RoboticsAttachmentsCard attachments={record.attachments} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </TooltipProvider>
  );
}
