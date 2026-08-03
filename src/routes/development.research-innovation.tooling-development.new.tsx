import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";
import {
  Save,
  Send,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  FileText,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
  Workflow,
  DownloadCloud,
  FileCode,
  Info,
  Clock,
  Printer,
  FileCheck,
  Palette,
  Box,
  Factory,
  CheckSquare,
  SlidersHorizontal,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserCheck,
  FileSpreadsheet,
  Maximize2,
  Award,
  Paperclip,
} from "lucide-react";

import { toolingDevelopmentService } from "@/services/toolingDevelopmentService";
import type {
  ToolingRecord,
  ToolingFormInput,
  ToolingApprovalDecision,
  ToolingChecklistItem,
  ToolingReviewer,
  ToolingAttachment,
  ToolingAuditEntry,
  ToolingMilestone,
} from "@/services/types";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { ToolingDevelopmentTabBar, type ToolingTabId } from "@/components/erp/ToolingDevelopmentTabBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { AppShell } from "@/components/erp/AppShell";

export const Route = createFileRoute(
  "/development/research-innovation/tooling-development/new",
)({
  head: () => ({
    meta: [{ title: "Tooling Development Form · Magnertia ERP" }],
  }),
  component: ToolingDevelopmentNewPage,
});

export function ToolingDevelopmentNewPage({
  breadcrumb = "Development > Manufacturing Development",
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();

  // Tab State & Settings
  const [activeTab, setActiveTab] = useState<ToolingTabId>("overview");
  const [isTelemetryMode, setIsTelemetryMode] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Drag-and-drop widget layout ordering
  const [widgetsOrder, setWidgetsOrder] = useState<string[]>(["specs", "drawing", "kpis"]);

  // 3D Model rotation/zoom simulation states
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Approval Decision Form
  const [reviewDecision, setReviewDecision] = useState<ToolingApprovalDecision>("Approved");
  const [reviewCommentInput, setReviewCommentInput] = useState("");

  // Data Fetching
  const { data: record, isLoading } = useQuery<ToolingRecord>({
    queryKey: ["toolingRecord"],
    queryFn: () => toolingDevelopmentService.fetchRecord(),
  });

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<ToolingFormInput>) => toolingDevelopmentService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["toolingRecord"], updated);
      toast.success("Draft saved successfully!", { description: "Tooling design baseline updated." });
    },
    onError: (err: any) => {
      toast.error("Failed to save draft", { description: err?.message || "An error occurred." });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (id?: string) => toolingDevelopmentService.submitForReview(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["toolingRecord"], updated);
      toast.success("Submitted for review board!", { description: "Plant layout and industrial managers notified." });
    },
  });

  const reviewDecisionMutation = useMutation({
    mutationFn: (args: { id: string; decision: ToolingApprovalDecision; comments?: string }) =>
      toolingDevelopmentService.reviewDecision(args),
    onSuccess: (updated) => {
      queryClient.setQueryData(["toolingRecord"], updated);
      toast.success(`Decision submitted: ${reviewDecision}`, { description: "Tooling workflow status updated." });
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="Tooling Development"
        breadcrumb={breadcrumb}
        tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading Tooling Development Master Record...
        </div>
      </AppShell>
    );
  }

  // Quick helper handlers
  const handleSaveDraft = () => {
    saveDraftMutation.mutate({
      projectName: record.projectName,
      toolName: record.toolName,
      toolCategory: record.toolCategory,
      manufacturingPlant: record.manufacturingPlant,
      productionLine: record.productionLine,
      productFamily: record.productFamily,
      purpose: record.purpose,
      developmentStage: record.developmentStage,
      priority: record.priority,
      
      // Design
      assemblyDrawing: record.assemblyDrawing,
      detailDrawings: record.detailDrawings,
      bom: record.bom,
      materialSpecification: record.materialSpecification,
      surfaceFinish: record.surfaceFinish,
      designReviewScore: record.designReviewScore,
      
      // Planning
      manufacturingProcess: record.manufacturingProcess,
      machineAllocation: record.machineAllocation,
      materialRequirements: record.materialRequirements,
      heatTreatment: record.heatTreatment,
      surfaceCoating: record.surfaceCoating,
      manufacturingLeadTime: record.manufacturingLeadTime,
      manufacturingReadinessScore: record.manufacturingReadinessScore,
      
      // Validation
      trialToolCompleted: record.trialToolCompleted,
      dimensionalInspection: record.dimensionalInspection,
      functionalValidation: record.functionalValidation,
      toolAccuracy: record.toolAccuracy,
      repeatability: record.repeatability,
      validationRemarks: record.validationRemarks,
      validationScore: record.validationScore,
      
      // Readiness
      installationCompleted: record.installationCompleted,
      operatorTraining: record.operatorTraining,
      maintenancePlan: record.maintenancePlan,
      sparePartsList: record.sparePartsList,
      calibrationSchedule: record.calibrationSchedule,
      productionRelease: record.productionRelease,
      readinessScore: record.readinessScore,
      
      // Performance
      toolLife: record.toolLife,
      cycleTime: record.cycleTime,
      downtime: record.downtime,
      mtbf: record.mtbf,
      mttr: record.mttr,
      oeeContribution: record.oeeContribution,
      performanceScore: record.performanceScore,
      
      // AI
      aiWearPrediction: record.aiWearPrediction,
      aiMaintenanceRecommendation: record.aiMaintenanceRecommendation,
      aiToolOptimization: record.aiToolOptimization,
      aiCostOptimization: record.aiCostOptimization,
      aiFailurePrediction: record.aiFailurePrediction,
      aiEngineeringScore: record.aiEngineeringScore,

      approvalDecision: record.approvalDecision,
      reviewComments: record.reviewComments,
      approvalDate: record.approvalDate,
      recommendation: record.recommendation,
    });
  };

  const handleSubmitDecision = () => {
    reviewDecisionMutation.mutate({
      id: record.id,
      decision: reviewDecision,
      comments: reviewCommentInput || undefined,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label}`, { description: text });
  };

  const handleExportPDF = () => {
    toast.success("Exporting Tooling Specification Report (PDF)...", { description: "Generating tool details and manufacturing parameter summaries." });
  };

  // Drag-and-drop swap widgets handler
  const moveWidget = (direction: "up" | "down", idx: number) => {
    const newOrder = [...widgetsOrder];
    if (direction === "up" && idx > 0) {
      const temp = newOrder[idx];
      newOrder[idx] = newOrder[idx - 1];
      newOrder[idx - 1] = temp;
    } else if (direction === "down" && idx < widgetsOrder.length - 1) {
      const temp = newOrder[idx];
      newOrder[idx] = newOrder[idx + 1];
      newOrder[idx + 1] = temp;
    }
    setWidgetsOrder(newOrder);
    toast.success("Dashboard layout rearranged!", { description: "Positions saved to local cache." });
  };

  return (
    <AppShell
      title="Tooling Development"
      breadcrumb={breadcrumb}
      description="Design molds, dies, cutting tools, stamping tooling, and tool maintenance schedules."
      tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
    >
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased pb-16">
        
        {/* Main Layout Container */}
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 pt-3 space-y-4">
          
          {/* ====================================================================
             1. PAGE HEADER (Tooling Info Bar)
             ==================================================================== */}
          <div className="rounded-xl border border-border/80 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-5 transition-all">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Left Title Parameters */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="hover:text-foreground cursor-pointer">Development</span>
                  <span>/</span>
                  <span className="hover:text-foreground cursor-pointer">Manufacturing Engineering</span>
                  <span>/</span>
                  <span className="text-primary font-semibold">Tooling Development Form</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Settings className="h-6 w-6 text-primary shrink-0 animate-pulse" />
                    {record.projectName}
                  </h1>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
                    {record.toolVersion}
                  </Badge>
                  <Badge
                    className={
                      record.workflowStatus === "Production Release"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        : record.workflowStatus === "Executive Review"
                          ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    }
                  >
                    <Workflow className="mr-1 h-3 w-3 inline" />
                    {record.workflowStatus}
                  </Badge>
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTelemetryMode(!isTelemetryMode)}
                  className="h-9 px-3 text-xs gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTelemetryMode ? "animate-spin text-primary" : ""}`} />
                  {isTelemetryMode ? "Active SCADA Feed" : "Telemetry Feed"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={saveDraftMutation.isPending}
                  className="h-9 px-3 text-xs gap-1.5 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Save className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                  Save Draft
                </Button>

                <Button
                  size="sm"
                  onClick={() => submitReviewMutation.mutate(record.id)}
                  disabled={submitReviewMutation.isPending}
                  className="h-9 px-4 text-xs font-semibold gap-1.5 bg-primary text-white hover:bg-primary/90 shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit for Review
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-slate-300 dark:border-slate-700">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={handleExportPDF}>
                      <Printer className="mr-2 h-4 w-4" /> Export specs drawings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(JSON.stringify(record, null, 2), "Tooling JSON")}>
                      <FileCode className="mr-2 h-4 w-4" /> Copy Raw Record JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsScheduleModalOpen(true)}>
                      <Calendar className="mr-2 h-4 w-4" /> Schedule Review board
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-3 border-t border-border/60 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Tooling ID</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.toolingId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Form Code</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.formCode}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Design Engineer</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <img src={record.toolDesignEngineer.avatar} className="h-4 w-4 rounded-full" alt="owner" />
                  {record.toolDesignEngineer.name}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Manufacturing Plant</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.manufacturingPlant}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Production Line</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.productionLine}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Linked Assembly Line</span>
                <span className="font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                  {record.linkedAssemblyLine.code}
                  <ExternalLink className="h-2.5 w-2.5 inline" />
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Next Review Date</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.nextReviewDate}</span>
              </div>
            </div>
          </div>

          {/* ====================================================================
             2. PROGRESS & LIFECYCLE BAR
             ==================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* Tooling readiness gauge */}
            <Card className="lg:col-span-4 border-border/80 shadow-xs bg-gradient-to-br from-white via-slate-50 to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/15">
              <CardContent className="p-4 sm:p-5 flex items-center gap-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 p-2">
                  <div className="text-center">
                    <span className="text-2xl font-black tracking-tight text-primary dark:text-blue-400">
                      {record.overallToolReadiness}
                    </span>
                    <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      / 100
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">Overall Tooling Readiness</h3>
                    <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary">
                      Ready for Mass Production
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Evaluation status across trial runs, CAD compliance, EHS checklists, and OEE performance targets.
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Design</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.designReviewScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Planning</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.manufacturingReadinessScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Validation</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.validationScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Readiness</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.readinessScore}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lifecycle timeline */}
            <Card className="lg:col-span-8 border-border/80 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-center">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tooling Development Timeline Stages
                  </span>
                  <span className="text-xs font-semibold text-primary">Stage 5 of 7: Validation Completed</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-1">
                  {record.timeline.map((s: ToolingMilestone, idx: number) => (
                    <div
                      key={s.id}
                      className={`rounded-lg p-2.5 text-center border transition-all ${
                        s.completed
                          ? "border-emerald-205 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                          : s.stageNumber === record.stage
                            ? "border-primary bg-primary/10 text-primary dark:bg-blue-950/30 font-bold ring-1 ring-primary/40"
                            : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        {s.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold">
                            {s.stageNumber}
                          </span>
                        )}
                        <span className="truncate text-[11px]">{s.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ====================================================================
             3. STICKY SUB-TAB NAVIGATION
             ==================================================================== */}
          <ToolingDevelopmentTabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ====================================================================
             4. MAIN CONTENT AREA & RIGHT SIDEBAR GRID
             ==================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Main tab content */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {(activeTab === "overview" || isTelemetryMode) && (
                <div className="space-y-6">
                  
                  {/* Draggable Dashboard Layout Controls */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Draggable Dashboard Grid (Rearrange below widgets)
                    </span>
                    <Badge variant="outline" className="font-semibold text-[10px]">Saved Layout</Badge>
                  </div>

                  {/* Rearrangeable dashboard layout */}
                  <div className="space-y-4">
                    {widgetsOrder.map((widgetId, index) => {
                      if (widgetId === "specs") {
                        return (
                          <div key="specs" className="relative group rounded-xl border border-border bg-white dark:bg-slate-900 p-4 space-y-3.5">
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveWidget("up", index)}>▲</Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveWidget("down", index)}>▼</Button>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <Info className="h-4 w-4 text-primary" /> PROFILE SPECIFICATION
                              </span>
                              <span className="text-[10px] text-muted-foreground">Widget #1</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Tooling Project</span>
                                <span className="font-bold">{record.projectName}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Tool Number</span>
                                <span className="font-bold">{record.toolNumber}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Tool Category</span>
                                <span className="font-bold">{record.toolCategory}</span>
                              </div>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground block text-[10px]">Purpose</span>
                              <p className="text-slate-700 dark:text-slate-350">{record.purpose}</p>
                            </div>
                          </div>
                        );
                      }

                      if (widgetId === "drawing") {
                        return (
                          <div key="drawing" className="relative group rounded-xl border border-border bg-white dark:bg-slate-900 p-4 space-y-3.5">
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveWidget("up", index)}>▲</Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveWidget("down", index)}>▼</Button>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <Palette className="h-4 w-4 text-primary" /> TOOLING PREVIEW
                              </span>
                              <span className="text-[10px] text-muted-foreground">Widget #2</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                              <div className="space-y-3 text-xs">
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">Product Family</span>
                                  <span className="font-bold">{record.productFamily}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">Line Allocation</span>
                                  <span className="font-bold text-primary">{record.productionLine}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">Stage</span>
                                  <Badge className="bg-primary/10 text-primary text-[10px]">{record.developmentStage}</Badge>
                                </div>
                              </div>
                              {/* 3D CAD Preview Panel inside overview */}
                              <div className="h-36 w-64 bg-slate-100 dark:bg-slate-950 border rounded-lg flex flex-col items-center justify-center p-3 relative shrink-0">
                                <div className="absolute top-2 left-2 flex gap-1">
                                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setRotationAngle(rotationAngle + 90)}>⟳</Button>
                                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>-</Button>
                                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>+</Button>
                                </div>
                                <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                                  <img
                                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=350&auto=format&fit=crop&q=80"
                                    className="h-full w-full object-cover transition-transform duration-300"
                                    style={{ transform: `rotate(${rotationAngle}deg) scale(${zoomLevel / 100})` }}
                                    alt="tooling mock"
                                  />
                                </div>
                                <span className="absolute bottom-1 right-1 text-[8px] bg-slate-900/60 text-white px-1.5 py-0.5 rounded">3D Model active</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (widgetId === "kpis") {
                        return (
                          <div key="kpis" className="relative group rounded-xl border border-border bg-white dark:bg-slate-900 p-4 space-y-3.5">
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveWidget("up", index)}>▲</Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveWidget("down", index)}>▼</Button>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-500" /> SENSOR TELEMETRY & KPIS
                              </span>
                              <span className="text-[10px] text-muted-foreground">Widget #3</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Cycles Run</span>
                                <span className="font-bold text-slate-900 dark:text-white text-base">{record.productionCycles.toLocaleString()} Cycles</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Downtime</span>
                                <span className="font-bold text-slate-900 dark:text-white text-base">{record.downtime} Hrs/Month</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Accuracy pin clearance</span>
                                <span className="font-bold text-slate-900 dark:text-white text-base">{record.toolAccuracy} mm</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">OEE Contribution</span>
                                <span className="font-bold text-primary text-base">{record.oeeContribution}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>

                </div>
              )}

              {/* TAB 2: TOOL DESIGN */}
              {activeTab === "design" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" /> CAD Modeling & Blueprint Release
                      </h2>
                      <p className="text-xs text-muted-foreground">Detailed CAD drawings, blueprint releases, material specification, and design reviews score parameters.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Design Score: {record.designReviewScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Design parameters */}
                    <div className="md:col-span-5 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Design Release Files</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 text-xs space-y-2">
                          <div className="flex items-center justify-between p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold">{record.assemblyDrawing}</span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold">{record.detailDrawings}</span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold">{record.bom}</span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Material & Finishing Specifications</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-xs space-y-3">
                          <div>
                            <span className="text-muted-foreground block text-[10px] mb-0.5">Material Specification Sheet</span>
                            <span className="font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1 mt-0.5">
                              <FileText className="h-3.5 w-3.5" /> {record.materialSpecification}
                            </span>
                          </div>
                          <div className="pt-2 border-t">
                            <span className="text-muted-foreground block text-[10px]">Surface Finish Requirements</span>
                            <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{record.surfaceFinish}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* CAD Drawing preview */}
                    <div className="md:col-span-7">
                      <Card className="border-border/80 shadow-xs overflow-hidden">
                        <div className="relative h-64 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center group">
                          <img
                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                            alt="CAD preview"
                            className="h-full w-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              size="sm"
                              className="bg-white text-slate-950 hover:bg-slate-100 border text-xs"
                              onClick={() => setSelectedDiagram("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80")}
                            >
                              <Maximize2 className="h-3.5 w-3.5 mr-1" /> View Design Drawing
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4 space-y-1 text-xs">
                          <span className="text-muted-foreground block text-[10px]">CAD Model Release</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">evo_fixture_cad.step</span>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MANUFACTURING PLANNING */}
              {activeTab === "planning" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Factory className="h-5 w-5 text-primary" /> CNC Program & Heat Treatment Processes
                      </h2>
                      <p className="text-xs text-muted-foreground">Machine allocation, material requirements sheets, and surface coatings planning parameters.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.manufacturingReadinessScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Machining parameters</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Manufacturing Process</span>
                          <span className="font-bold text-slate-900 dark:text-white text-base block">{record.manufacturingProcess}</span>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-1">Machine Allocations</span>
                          <div className="flex flex-wrap gap-1.5">
                            {record.machineAllocation.map((m, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Material & Coatings</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Material Requirements</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{record.materialRequirements}</span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-bold">Heat Treatment Required</span>
                          <Badge className={record.heatTreatment ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/25" : "bg-slate-200 text-slate-700"}>
                            {record.heatTreatment ? "Yes" : "No"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-bold">Surface Coating Type</span>
                          <span className="font-semibold">{record.surfaceCoating}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 4: VALIDATION */}
              {activeTab === "validation" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-primary" /> Trial Tool Validation & Accuracy
                      </h2>
                      <p className="text-xs text-muted-foreground">Verification check logs, repeatability tolerances validation, and dimensional accuracy margins.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.validationScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* validation details */}
                    <div className="md:col-span-5 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Dimensional accuracy metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Tooling Accuracy Margin</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">{record.toolAccuracy} mm</span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px]">Repeatability margin</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">{record.repeatability} mm</span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px]">Validation Remarks</span>
                            <p className="text-slate-700 dark:text-slate-350 text-[11px] leading-relaxed font-semibold text-emerald-600 dark:text-emerald-400">
                              {record.validationRemarks}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Checklist */}
                    <div className="md:col-span-7">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Validation Gates</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold text-xs">Trial Tool Completed</span>
                            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/25">Passed</Badge>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold text-xs">Dimensional Inspections Checked</span>
                            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/25">Passed</Badge>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold text-xs">Functional Validation Completed</span>
                            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/25">Passed</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PRODUCTION READINESS */}
              {activeTab === "readiness" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" /> Calibration Schedules & Maintenance Plans
                      </h2>
                      <p className="text-xs text-muted-foreground">Operator training certifications status, calibration logs, and spare parts supply buffers.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.readinessScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Readiness Documents</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div className="flex justify-between items-center p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                          <div>
                            <span className="font-bold text-[11px] block">Maintenance Plan File</span>
                            <span className="text-[10px] text-muted-foreground">{record.maintenancePlan}</span>
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                        </div>

                        <div className="flex justify-between items-center p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                          <div>
                            <span className="font-bold text-[11px] block">Spare Parts Inventory List</span>
                            <span className="text-[10px] text-muted-foreground">{record.sparePartsList}</span>
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                        </div>

                        <div className="flex justify-between items-center p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                          <div>
                            <span className="font-bold text-[11px] block">Calibration Schedule</span>
                            <span className="text-[10px] text-muted-foreground">{record.calibrationSchedule}</span>
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Readiness Checklist</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3.5 text-xs">
                        {record.readinessChecklist.map((check: ToolingChecklistItem) => (
                          <div key={check.id} className="flex justify-between items-center p-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                            <div>
                              <span className="font-bold block text-slate-900 dark:text-white text-[11px]">{check.label}</span>
                              {check.notes && <span className="text-[10px] text-muted-foreground">{check.notes}</span>}
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/25">Completed</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 6: PERFORMANCE */}
              {activeTab === "performance" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" /> Production Cycles & Downtime Trends
                      </h2>
                      <p className="text-xs text-muted-foreground">Historical cycle run quantities, tool life depletion indices, and OEE contribution tracking.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.performanceScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Performance numbers */}
                    <div className="md:col-span-4 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Historical performance KPIS</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Tool Life Limit</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{record.toolLife.toLocaleString()} Cycles</span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px]">Actual Cycles Completed</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{record.productionCycles.toLocaleString()} Cycles</span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px]">MTBF Target</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{record.mtbf} Hrs</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Chart visualization */}
                    <div className="md:col-span-8">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Cycles Run & Depletion Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="h-56 w-full bg-slate-50 dark:bg-slate-950 rounded-lg border p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground border-b pb-1">
                              <span>Throughput Cycles Count (cumulative)</span>
                            </div>

                            <div className="flex-1 w-full relative flex items-end justify-between px-6 pt-6">
                              <svg className="absolute inset-0 h-full w-full p-6 overflow-visible" xmlns="http://www.w3.org/2000/svg">
                                <line x1="0%" y1="0%" x2="100%" y2="0%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />
                                <line x1="0%" y1="33%" x2="100%" y2="33%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />
                                <line x1="0%" y1="66%" x2="100%" y2="66%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />
                                <line x1="0%" y1="100%" x2="100%" y2="100%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />

                                <path d="M 0 110 L 100 90 L 200 70 L 300 50" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" className="opacity-80" style={{ transform: "scaleY(0.7) translateY(20px)" }} />
                              </svg>

                              {record.kpiTrend.map((run: any) => (
                                <div key={run.period} className="flex flex-col items-center z-10">
                                  <div className="text-[9px] font-bold text-slate-800 dark:text-slate-200">{(run.toolLifeCount / 1000).toFixed(0)}k</div>
                                  <div className="h-2 w-2 rounded-full bg-emerald-500 border border-white" />
                                  <span className="text-[9px] text-muted-foreground mt-1">{run.period}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: AI ASSESSMENT */}
              {activeTab === "ai_assessment" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 text-purple-750 dark:text-purple-306">
                        <Sparkles className="h-5 w-5 animate-pulse text-purple-650" /> AI Tool wear & Maintenance Predictions
                      </h2>
                      <p className="text-xs text-muted-foreground">Failure prediction probability, cycle wear index parameters, and resource conservation advice.</p>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-700 border-purple-300 font-bold">AI Score: {record.aiEngineeringScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/80 shadow-xs bg-gradient-to-br from-purple-50/20 via-white to-slate-50 dark:from-purple-950/10 dark:via-slate-900">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-purple-750 dark:text-purple-350">AI wear predictions</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Wear Prediction</span>
                            <p className="text-slate-700 dark:text-slate-350 mt-0.5 leading-relaxed">
                              {record.aiWearPrediction}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 border-t pt-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Cost Optimization</span>
                            <p className="text-slate-700 dark:text-slate-350 mt-0.5 leading-relaxed text-emerald-700 dark:text-emerald-300 font-medium">
                              {record.aiCostOptimization}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">AI Maintenance & Optimization advice</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Sparkles className="h-5 w-5 text-purple-650 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Maintenance Recommendation</span>
                            <p className="text-slate-700 dark:text-slate-350 mt-0.5 leading-relaxed">
                              {record.aiMaintenanceRecommendation}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 border-t pt-3">
                          <SlidersHorizontal className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Tool Optimization</span>
                            <p className="text-slate-700 dark:text-slate-350 mt-0.5 leading-relaxed">
                              {record.aiToolOptimization}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 8: SUMMARY */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" /> Overall Tooling Readiness Summary
                    </h2>
                    <Badge variant="outline">Maturity Status: v1.2.0 Baseline</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-border/80 shadow-xs flex flex-col justify-between">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold uppercase text-slate-900 dark:text-white">Overall Readiness</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 text-center space-y-3">
                        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 p-2">
                          <div className="text-center">
                            <span className="text-2xl font-black text-primary dark:text-blue-400">{record.overallToolReadiness}</span>
                            <span className="block text-[9px] font-bold text-muted-foreground">/ 100</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground block">
                          Weighted operational readiness status across all engineering validation gates.
                        </span>
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs md:col-span-2">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold uppercase text-slate-900 dark:text-white">Gate Scores Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>CAD Model & Design</span>
                            <span className="text-primary">{record.designReviewScore}%</span>
                          </div>
                          <Progress value={record.designReviewScore} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Manufacturing Planning</span>
                            <span className="text-primary">{record.manufacturingReadinessScore}%</span>
                          </div>
                          <Progress value={record.manufacturingReadinessScore} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Trial Run Validation</span>
                            <span className="text-primary">{record.validationScore}%</span>
                          </div>
                          <Progress value={record.validationScore} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Production Readiness</span>
                            <span className="text-primary">{record.readinessScore}%</span>
                          </div>
                          <Progress value={record.readinessScore} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 9: ATTACHMENTS */}
              {activeTab === "attachments" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Paperclip className="h-5 w-5 text-primary" /> Engineering Attachments Manager
                      </h2>
                      <p className="text-xs text-muted-foreground">Manage CAD models, inspection sheets, calibration plans, and design drawings.</p>
                    </div>
                    <Button size="sm" onClick={() => setIsUploadOpen(true)} className="h-8 text-xs bg-primary text-white">
                      + Add File
                    </Button>
                  </div>

                  <Card className="border-border/80 shadow-xs">
                    <CardContent className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-xs min-w-[650px]">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-muted-foreground font-semibold border-b">
                          <tr>
                            <th className="p-2.5">File Name</th>
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Size</th>
                            <th className="p-2.5">Upload Date</th>
                            <th className="p-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {record.attachments.map((att: ToolingAttachment) => (
                            <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileCode className="h-4 w-4 text-primary shrink-0" />
                                {att.name}
                              </td>
                              <td className="p-2.5"><Badge variant="outline" className="text-[10px]">{att.type}</Badge></td>
                              <td className="p-2.5 text-muted-foreground">{att.size}</td>
                              <td className="p-2.5 text-muted-foreground">{att.uploadDate}</td>
                              <td className="p-2.5 text-right">
                                <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloading ${att.name}`)} className="h-7 text-xs text-primary">
                                  <Download className="h-3.5 w-3.5 mr-1" /> Download
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 10: REVIEW & APPROVAL */}
              {activeTab === "review_approval" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" /> Review Board Gate status
                    </h2>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-300 font-bold">
                      {record.workflowStatus}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Review workflow state */}
                    <div className="md:col-span-7 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Workflow Approval Board</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3.5 text-xs">
                          <div className="space-y-2.5">
                            {record.reviewers.map((rev: ToolingReviewer) => (
                              <div key={rev.id} className="flex items-center justify-between p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                                <div className="flex items-center gap-2 min-w-0">
                                  {rev.avatar ? (
                                    <img src={rev.avatar} className="h-8 w-8 rounded-full object-cover" alt="avatar" />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px]">
                                      {rev.person.split(" ").map(w => w[0]).join("")}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <span className="block font-bold text-[11px] text-slate-900 dark:text-white truncate">{rev.person}</span>
                                    <span className="block text-[9px] text-muted-foreground truncate">{rev.role}</span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <Badge
                                    className={`text-[8px] px-1.5 py-0 font-bold border ${
                                      rev.decision === "Approved"
                                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/25"
                                        : rev.decision === "Pending"
                                          ? "bg-amber-500/10 text-amber-700 border-amber-500/25"
                                          : "bg-rose-500/10 text-rose-700 border-rose-500/25"
                                    }`}
                                  >
                                    {rev.decision}
                                  </Badge>
                                  {rev.date && <span className="block text-[9px] text-muted-foreground mt-0.5">{rev.date}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Action form */}
                    <div className="md:col-span-5">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Submit Approval Decision</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-900 dark:text-white block">Approval Decision:</label>
                            <div className="flex gap-2">
                              {(["Approved", "Changes Requested", "Rejected"] as const).map((dec) => (
                                <Button
                                  key={dec}
                                  type="button"
                                  variant={reviewDecision === dec ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setReviewDecision(dec)}
                                  className="h-8 text-xs font-semibold"
                                >
                                  {dec}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-900 dark:text-white block">Remarks:</label>
                            <Textarea
                              rows={3}
                              value={reviewCommentInput}
                              onChange={(e) => setReviewCommentInput(e.target.value)}
                              placeholder="Describe tooling design feedback or dimensional remarks..."
                              className="text-xs"
                            />
                          </div>

                          <Button
                            onClick={handleSubmitDecision}
                            disabled={reviewDecisionMutation.isPending}
                            className="w-full bg-primary text-white text-xs font-bold"
                          >
                            Submit Decision
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 11: SYSTEM INFO / AUDIT TRAIL */}
              {activeTab === "system_info" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" /> System Audit Trail & Logs
                    </h2>
                    <Badge variant="outline" className="font-mono">v{record.toolVersion}</Badge>
                  </div>

                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Audit Entries</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2.5 text-xs">
                      {record.auditTrail.map((aud: ToolingAuditEntry) => (
                        <div key={aud.id} className="rounded-lg border p-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{aud.action}</span>
                            <span className="text-[10px] text-muted-foreground">{aud.details}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-muted-foreground block">{aud.timestamp}</span>
                            <span className="text-[10px] text-primary font-mono">{aud.user} ({aud.ipAddress})</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* ====================================================================
               RIGHT SIDEBAR (Readiness score & highlights panel)
               ==================================================================== */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Overall Tooling Readiness Score gauge */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Overall Tooling Readiness</span>
                    <Award className="h-4 w-4 text-primary animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-center space-y-4">
                  <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 p-2">
                    <div>
                      <span className="text-3xl font-black text-primary dark:text-blue-400">{record.overallToolReadiness}</span>
                      <span className="block text-[10px] font-bold text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-left text-xs border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Design Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.designReviewScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Planning Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.manufacturingReadinessScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validation Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.validationScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Readiness Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.readinessScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Performance Score</span>
                      <span className="font-bold text-primary">{record.performanceScore} / 100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Highlights */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Highlights</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3.5 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-350 font-medium text-[11px]">Design review score achieved: 88%</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-350 font-medium text-[11px]">Repeatability limit: 0.025 mm.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-350 font-medium text-[11px]">Trial tool validation successful.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-350 font-medium text-[11px]">AI predicts 520,000 cycles wear.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-350 font-medium text-[11px]">Ready for installation and commissioning.</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("design")} className="w-full justify-start text-xs h-8">
                    <Palette className="h-3.5 w-3.5 mr-2 text-primary" /> Create Tooling Concept
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("design")} className="w-full justify-start text-xs h-8">
                    <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Upload CAD Model
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("planning")} className="w-full justify-start text-xs h-8">
                    <FileCheck className="h-3.5 w-3.5 mr-2 text-amber-500" /> Generate Manufacturing Plan
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("validation")} className="w-full justify-start text-xs h-8">
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-rose-500" /> Run Tool Validation
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("readiness")} className="w-full justify-start text-xs h-8">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-purple-600" /> Schedule Calibration
                  </Button>
                </CardContent>
              </Card>

              {/* Vertical Timeline */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tooling Timeline</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs space-y-4">
                  <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-4">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Tool Concept Created</span>
                      <span className="text-[10px] text-muted-foreground">05 Jun 2024</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">CAD Design Completed</span>
                      <span className="text-[10px] text-muted-foreground">07 Jun 2024</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Manufacturing Started</span>
                      <span className="text-[10px] text-muted-foreground">10 Jun 2024</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Trial Tool Completed</span>
                      <span className="text-[10px] text-muted-foreground">14 Jun 2024</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Validation Completed</span>
                      <span className="text-[10px] text-muted-foreground">17 Jun 2024</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-primary" />
                      <span className="font-bold block text-slate-900 dark:text-white">Review & Approval</span>
                      <span className="text-[10px] text-muted-foreground">In Progress</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <span className="font-bold block text-muted-foreground">Production Release</span>
                      <span className="text-[10px] text-muted-foreground">Pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
         5. MODALS & DIALOGS
         ==================================================================== */}

      {/* Layout Zoom Dialog */}
      {selectedDiagram && (
        <Dialog open={!!selectedDiagram} onOpenChange={() => setSelectedDiagram(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex justify-between items-center">
                <span>CAD Modeling Drawing</span>
              </DialogTitle>
            </DialogHeader>
            <div className="relative h-96 w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={selectedDiagram} alt="CAD drawings" className="h-full w-full object-contain" />
            </div>
            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedDiagram(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload File Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Upload Drawings & BOMs</DialogTitle>
          </DialogHeader>
          <div className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <Upload className="h-8 w-8 text-primary mx-auto" />
            <p className="text-xs font-semibold">Drop CAD or PDF documents here</p>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { setIsUploadOpen(false); toast.success("File uploaded successfully!"); }} className="bg-primary text-white">Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Calibration Board */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Schedule Tooling Review Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold block mb-1">Select Date:</label>
              <Input type="date" className="text-xs" />
            </div>
            <div>
              <label className="font-bold block mb-1">Attendees:</label>
              <Input defaultValue="Rahul Sharma, Naresh Verma, Vikram Singh" className="text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { setIsScheduleModalOpen(false); toast.success("Review board scheduled!"); }} className="bg-primary text-white">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppShell>
  );
}
