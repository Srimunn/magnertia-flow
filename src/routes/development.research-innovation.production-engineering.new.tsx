import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";
import {
  Save,
  Send,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  Building2,
  FileText,
  Download,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
  Layers,
  Target,
  Zap,
  Map,
  Award,
  Paperclip,
  Eye,
  Check,
  ClipboardCheck,
  Cpu,
  ShieldAlert,
  UserCheck,
  FileSpreadsheet,
  FileCode,
  Info,
  Clock,
  ChevronRight,
  TrendingUp,
  Maximize2,
  Share2,
  Printer,
  FileCheck,
  User,
  ShieldCheck,
  Radio,
  HardDrive,
  Database,
  Lock,
  Workflow,
  Repeat,
  Plus,
  ArrowRight,
  Palette,
  Box,
  Star,
  Ruler,
  Weight,
  PenTool,
  Factory,
  CheckSquare,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Play,
  HelpCircle,
  BarChart3,
  PieChart,
  CheckSquare2,
  RefreshCw,
  Settings,
} from "lucide-react";

import { productionEngineeringService } from "@/services/productionEngineeringService";
import type {
  ProductionEngineeringRecord,
  ProductionEngineeringFormInput,
  ProductionEngineeringApprovalDecision,
  ProductionEngineeringChecklistItem,
  ProductionEngineeringReviewer,
  ProductionEngineeringAttachment,
  ProductionEngineeringAuditEntry,
  ProductionEngineeringMilestone,
} from "@/services/types";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { ProductionEngineeringTabBar, type ProductionEngineeringTabId } from "@/components/erp/ProductionEngineeringTabBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AppShell } from "@/components/erp/AppShell";

export const Route = createFileRoute(
  "/development/research-innovation/production-engineering/new",
)({
  head: () => ({
    meta: [{ title: "Production Engineering Form · Magnertia ERP" }],
  }),
  component: ProductionEngineeringNewPage,
});

export function ProductionEngineeringNewPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Tab State & View Settings
  const [activeTab, setActiveTab] = useState<ProductionEngineeringTabId>("overview");
  const [isTelemetryMode, setIsTelemetryMode] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  // Approval Form State
  const [reviewDecision, setReviewDecision] = useState<ProductionEngineeringApprovalDecision>("Approved");
  const [reviewCommentInput, setReviewCommentInput] = useState("");

  // Data Fetching
  const { data: record, isLoading } = useQuery<ProductionEngineeringRecord>({
    queryKey: ["productionEngineeringRecord"],
    queryFn: () => productionEngineeringService.fetchRecord(),
  });

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<ProductionEngineeringFormInput>) => productionEngineeringService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["productionEngineeringRecord"], updated);
      toast.success("Draft saved successfully!", { description: "All production engineering parameters updated." });
    },
    onError: (err: any) => {
      toast.error("Failed to save draft", { description: err?.message || "An error occurred." });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (id?: string) => productionEngineeringService.submitForReview(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["productionEngineeringRecord"], updated);
      toast.success("Submitted for Executive Board Review!", { description: "Stakeholders and plant managers notified." });
    },
  });

  const reviewDecisionMutation = useMutation({
    mutationFn: (args: { id: string; decision: ProductionEngineeringApprovalDecision; comments?: string }) =>
      productionEngineeringService.reviewDecision(args),
    onSuccess: (updated) => {
      queryClient.setQueryData(["productionEngineeringRecord"], updated);
      toast.success(`Decision submitted: ${reviewDecision}`, { description: "Production workflow status updated." });
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="Production Engineering"
        breadcrumb="Development"
        description="Govern mass production process design, workstation allocation, pilot runs, PFMEA, OEE Targets, and AI optimization."
        tabs={<ResearchInnovationTabBar />}
      >
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Magnertia Production Engineering Module...</p>
        </div>
      </AppShell>
    );
  }

  // Quick helper handlers
  const handleSaveDraft = () => {
    saveDraftMutation.mutate({
      projectName: record.projectName,
      productName: record.productName,
      manufacturingPlant: record.manufacturingPlant,
      productionLine: record.productionLine,
      manufacturingProcess: record.manufacturingProcess,
      productionObjective: record.productionObjective,
      developmentStage: record.developmentStage,
      productionPriority: record.productionPriority,
      businessReadiness: record.businessReadiness,
      
      // Design
      routingSheet: record.routingSheet,
      operationSequence: record.operationSequence,
      workstationLayout: record.workstationLayout,
      processParameters: record.processParameters,
      standardCycleTime: record.standardCycleTime,
      layoutPreview: record.layoutPreview,
      versionControl: record.versionControl,
      designReadinessScore: record.designReadinessScore,
      
      // Resources
      machinesRequired: record.machinesRequired,
      toolingRequired: record.toolingRequired,
      fixturesRequired: record.fixturesRequired,
      workforceRequirement: record.workforceRequirement,
      utilityRequirements: record.utilityRequirements,
      productionCapacity: record.productionCapacity,
      equipmentAvailability: record.equipmentAvailability,
      capacityPlanning: record.capacityPlanning,
      resourceAllocation: record.resourceAllocation,
      resourceReadinessScore: record.resourceReadinessScore,
      
      // Validation
      pilotProduction: record.pilotProduction,
      trialRun: record.trialRun,
      firstArticleInspection: record.firstArticleInspection,
      processCapability: record.processCapability,
      lineBalancing: record.lineBalancing,
      validationRemarks: record.validationRemarks,
      correctiveActions: record.correctiveActions,
      validationScore: record.validationScore,
      
      // Quality
      controlPlan: record.controlPlan,
      pfmea: record.pfmea,
      riskAssessment: record.riskAssessment,
      safetyAssessment: record.safetyAssessment,
      pokaYoke: record.pokaYoke,
      qualityGates: record.qualityGates,
      inspectionPlans: record.inspectionPlans,
      complianceStatus: record.complianceStatus,
      qualityScore: record.qualityScore,
      
      // Performance
      plannedOutput: record.plannedOutput,
      oeeTarget: record.oeeTarget,
      yieldTarget: record.yieldTarget,
      scrapTarget: record.scrapTarget,
      throughputTarget: record.throughputTarget,
      cycleTime: record.cycleTime,
      downtimeAnalysis: record.downtimeAnalysis,
      performanceScore: record.performanceScore,
      
      // AI
      aiBottleneckAnalysis: record.aiBottleneckAnalysis,
      aiCapacityOptimization: record.aiCapacityOptimization,
      aiPredictiveMaintenance: record.aiPredictiveMaintenance,
      aiLineBalancingRecommendations: record.aiLineBalancingRecommendations,
      aiProductionRiskPrediction: record.aiProductionRiskPrediction,
      aiQualityPrediction: record.aiQualityPrediction,
      aiThroughputOptimization: record.aiThroughputOptimization,
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
    toast.success("Exporting Industrial Engineering Specification Report (PDF)...", { description: "Generating DELMIA process routing document." });
  };

  // Mock PFMEA Data Register
  const pfmeaItems = [
    { id: "PF-01", processStep: "PCB Insertion", failureMode: "Component alignment offset", severity: 7, occurrence: 3, detection: 2, rpn: 42, action: "Install physical tooling slot guides (Poka-Yoke)." },
    { id: "PF-02", processStep: "Cable Harness Routing", failureMode: "Tension stress on logic pins", severity: 8, occurrence: 4, detection: 3, rpn: 96, action: "Add secondary zip-tie anchor at Station 3." },
    { id: "PF-03", processStep: "Automatic Screwdriving", failureMode: "Torque limit slip on AC relay", severity: 9, occurrence: 2, detection: 4, rpn: 72, action: "Implement smart electric screwdriver calibration log." },
    { id: "PF-04", processStep: "Hi-Pot Electrical Test", failureMode: "ESD shock warning false positive", severity: 6, occurrence: 5, detection: 2, rpn: 60, action: "Recalibrate insulation test probe shield monthly." },
  ];

  // Workstation Visualization Mock
  const workstations = [
    { id: "WS-1", name: "Station 1: PCB & Solder", status: "Operational", operator: "Assigned (2 Techs)", parameter: "Solder Temp: 240°C", efficiency: "94%" },
    { id: "WS-2", name: "Station 2: Screw Torquing", status: "Operational", operator: "Assigned (1 Tech)", parameter: "Torque: 1.2 N.m", efficiency: "92%" },
    { id: "WS-3", name: "Station 3: Enclosure & Harness", status: "Bottleneck", operator: "Assigned (2 Techs)", parameter: "Harness Fit check", efficiency: "85%" },
    { id: "WS-4", name: "Station 4: Functional Testing", status: "Operational", operator: "Assigned (1 QA Tech)", parameter: "Voltage: 220V", efficiency: "96%" },
  ];

  return (
    <AppShell
      title="Process Engineering & Validation"
      breadcrumb={breadcrumb}
      description="Govern mass production process design, workstation allocation, pilot runs, PFMEA, OEE Targets, and AI optimization."
      tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
    >
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased pb-16">
        
        {/* Main Container */}
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 pt-3 space-y-4">
          
          {/* ====================================================================
             1. PRODUCTION HEADER & METADATA BAR
             ==================================================================== */}
          <div className="rounded-xl border border-border/80 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-5 transition-all">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Left: Primary Titles */}
              <div className="space-y-1.5">

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Factory className="h-6 w-6 text-primary shrink-0 animate-pulse" />
                    {record.projectName}
                  </h1>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
                    {record.productionVersion}
                  </Badge>
                  <Badge
                    className={
                      record.workflowStatus === "Approved"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        : record.workflowStatus === "In Review"
                          ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    }
                  >
                    <Workflow className="mr-1 h-3 w-3 inline" />
                    {record.workflowStatus}
                  </Badge>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTelemetryMode(!isTelemetryMode)}
                  className="h-9 px-3 text-xs gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTelemetryMode ? "animate-spin text-primary" : ""}`} />
                  {isTelemetryMode ? "Active SCADA Feed" : "Telemetry Mode"}
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
                      <Printer className="mr-2 h-4 w-4" /> Export Delmia Process (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(JSON.stringify(record, null, 2), "Production JSON")}>
                      <FileCode className="mr-2 h-4 w-4" /> Copy Raw Production JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsScheduleModalOpen(true)}>
                      <Calendar className="mr-2 h-4 w-4" /> Schedule Safety Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Metadata Grid Bar */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-3 border-t border-border/60 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Production Eng ID</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.productionEngineeringId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Form Code</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.formCode}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Production Engineer</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <img src={record.productionEngineer.avatar} className="h-4 w-4 rounded-full" alt="owner" />
                  {record.productionEngineer.name}
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
                <span className="text-muted-foreground block text-[11px]">Process Dev Link</span>
                <span className="font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                  {record.linkedProcessDevelopment.code}
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
             2. PROGRESS & WORKFLOW TIMELINE BAR
             ==================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* Overall Production Readiness */}
            <Card className="lg:col-span-4 border-border/80 shadow-xs bg-gradient-to-br from-white via-slate-50 to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/10">
              <CardContent className="p-4 sm:p-5 flex items-center gap-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 p-2">
                  <div className="text-center">
                    <span className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                      {record.overallProductionReadiness}
                    </span>
                    <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      / 100
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">Overall Readiness</h3>
                    <Badge variant="secondary" className="text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      Mass Prod Ready
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Aggregated production engineering status across cycle times, PFMEA validations, utility provisions, and line balanced workstation layouts.
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Design</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.designReadinessScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Resource</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.resourceReadinessScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Validation</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.validationScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Quality</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.qualityScore}</span>
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
                    Production Engineering Stage
                  </span>
                  <span className="text-xs font-semibold text-primary">Stage 3 of 6: Validation & Trial Runs Staging</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                  {record.timeline.map((s: ProductionEngineeringMilestone, idx: number) => (
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
          <ProductionEngineeringTabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ====================================================================
             4. MAIN CONTENT AREA & RIGHT INSIGHTS PANEL GRID
             ==================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Main module content */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {(activeTab === "overview" || isTelemetryMode) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" /> Production Summary & Status
                    </h2>
                    <Badge variant="outline" className="bg-white dark:bg-slate-900 shadow-2xs">
                      Factory Configuration
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Panel 1 */}
                    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                      <CardHeader className="p-4 pb-2 border-b border-border/40">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" /> Project Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Project Name</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.projectName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Product Name</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.productName}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Manufacturing Process</span>
                          <p className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                            {record.manufacturingProcess}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Objective</span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                            {record.productionObjective}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t text-[11px]">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Stage</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.developmentStage}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Business Readiness</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.businessReadiness}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Panel 2 */}
                    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between">
                      <CardHeader className="p-4 pb-2 border-b border-border/40">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Radio className="h-4 w-4 text-emerald-500 shrink-0" /> Charger Unit Graphic
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[9px]">Priority Level</span>
                            <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[9px] px-2">
                              {record.productionPriority}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[9px]">Plant Location</span>
                            <span className="font-bold">{record.manufacturingPlant}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[9px]">Production Line</span>
                            <span className="font-bold">{record.productionLine}</span>
                          </div>
                        </div>

                        {/* Beautiful vector or mock graphic */}
                        <div className="h-28 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg border flex flex-col items-center justify-center p-2 relative shrink-0">
                          <div className="h-16 w-8 bg-slate-400 dark:bg-slate-600 rounded-full flex flex-col justify-around p-1 items-center">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="h-2 w-2 rounded-full bg-slate-200" />
                          </div>
                          <span className="text-[8px] font-bold text-muted-foreground mt-2">AC 7kW</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 2: PROCESS DESIGN */}
              {activeTab === "design" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Map className="h-5 w-5 text-primary" /> Routing & Sequence Design
                      </h2>
                      <p className="text-xs text-muted-foreground">Standard workstation configurations, sequence parameters, cycle targets, and line layouts.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.designReadinessScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Design documents & parameters */}
                    <div className="md:col-span-5 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Routing Specification Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 text-xs space-y-2">
                          <div className="flex items-center justify-between p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold">{record.routingSheet}</span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold">{record.operationSequence}</span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold">{record.workstationLayout}</span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Process Parameters & cycle time</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-xs space-y-3">
                          <div>
                            <span className="text-muted-foreground block text-[10px] mb-0.5">Parameters Summary</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                              {record.processParameters}
                            </p>
                          </div>
                          <div className="pt-2 border-t flex justify-between items-center">
                            <div>
                              <span className="text-muted-foreground block text-[10px]">Standard Cycle Time</span>
                              <span className="text-base font-extrabold text-primary">{record.standardCycleTime} Min/Unit</span>
                            </div>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">
                              OEE Target 85%
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Manufacturing Line Visualizer */}
                    <div className="md:col-span-7 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>Manufacturing Station Map</span>
                            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/25 text-[9px]">4 Stations Live</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {workstations.map((ws) => (
                              <div
                                key={ws.id}
                                className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 text-xs transition-all ${
                                  ws.status === "Bottleneck"
                                    ? "border-amber-300 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/10"
                                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 dark:text-white truncate">{ws.name}</span>
                                  <Badge
                                    className={`text-[8px] font-bold px-1.5 py-0 ${
                                      ws.status === "Bottleneck"
                                        ? "bg-amber-500/10 text-amber-700 border-amber-500/25"
                                        : "bg-emerald-500/10 text-emerald-700 border-emerald-500/25"
                                    }`}
                                  >
                                    {ws.status}
                                  </Badge>
                                </div>
                                <div className="text-[10px] text-muted-foreground space-y-0.5">
                                  <div>Staff: <span className="font-semibold text-slate-700 dark:text-slate-300">{ws.operator}</span></div>
                                  <div>Param: <span className="font-semibold text-slate-700 dark:text-slate-300">{ws.parameter}</span></div>
                                  <div>OEE Load: <span className="font-bold text-primary">{ws.efficiency}</span></div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex justify-between items-center text-[10px] text-muted-foreground">
                            <span>DELMIA Station Flow Map (Synchronized)</span>
                            <span className="text-primary hover:underline cursor-pointer flex items-center gap-1" onClick={() => setSelectedDiagram(record.layoutPreview)}>
                              <Maximize2 className="h-3 w-3" /> Full Layout
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RESOURCES */}
              {activeTab === "resources" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" /> Resource Allocation & Capacity Planning
                      </h2>
                      <p className="text-xs text-muted-foreground">Detailed workforce allocation, fixtures, utility parameters, and plant capacity targets.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.resourceReadinessScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Resource Requirements Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Machines Required</span>
                          <p className="font-bold text-slate-900 dark:text-white leading-relaxed">{record.machinesRequired}</p>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Tooling Required</span>
                          <p className="font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                            {record.toolingRequired}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Fixtures Required</span>
                          <p className="font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                            {record.fixturesRequired}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Workforce Requirement</span>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {record.workforceRequirement}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Utility Constraints & Capacities</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Utility Requirements</span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                            {record.utilityRequirements}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Equipment Availability Stance</span>
                          <p className="text-slate-700 dark:text-slate-300 font-bold text-emerald-600">
                            {record.equipmentAvailability}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Production Capacity Target</span>
                          <p className="text-slate-750 dark:text-slate-300">
                            {record.productionCapacity} Units / Day
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">ERP Allocation Status</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                            <Check className="h-4 w-4 bg-emerald-500/10 rounded-full" /> {record.resourceAllocation}
                          </span>
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
                        <ClipboardCheck className="h-5 w-5 text-primary" /> FAI & Staging Validation
                      </h2>
                      <p className="text-xs text-muted-foreground">First Article Inspection (FAI), Process Capability indices, and trial runs reports.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.validationScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Trial run overview */}
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Validation Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3.5 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-muted-foreground block text-[10px] mb-0.5">Trial Runs Log</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                              {record.trialRun}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] mb-0.5">First Article Inspection</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {record.firstArticleInspection}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] mb-0.5">Corrective Actions</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                              {record.correctiveActions}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t pt-3 text-[11px]">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Process Capability (Cp/Cpk)</span>
                            <span className="font-black text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">{record.processCapability}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Line Balancing</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{record.lineBalancing}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Pilot Production Stance</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{record.pilotProduction}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Validation Remarks</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{record.validationRemarks}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Validation Checklist */}
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Validation Checklist</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 text-xs grid grid-cols-1 md:grid-cols-2 gap-3">
                        {record.validationChecklist.map((item: ProductionEngineeringChecklistItem) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-850">
                            <span className="font-semibold text-[11px] text-slate-900 dark:text-slate-100">{item.label}</span>
                            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 font-bold text-[9px] px-2 py-0">
                              {item.completed ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 5: QUALITY & SAFETY */}
              {activeTab === "quality" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" /> Quality & Safety Engineering (PFMEA)
                      </h2>
                      <p className="text-xs text-muted-foreground">PFMEA failure modes, standard control plans, Poka-Yoke fixtures, and safety regulations.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.qualityScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Documents & Poka Yoke */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Control Plan & Safety Docs</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3 text-xs">
                          <div className="flex justify-between items-center p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <div>
                              <span className="font-bold text-[11px] block">Control Plan Specification</span>
                              <span className="text-[10px] text-muted-foreground">{record.controlPlan}</span>
                            </div>
                            <Download className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>

                          <div className="flex justify-between items-center p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <div>
                              <span className="font-bold text-[11px] block">Process Risk Assessment</span>
                              <span className="text-[10px] text-muted-foreground">{record.riskAssessment}</span>
                            </div>
                            <Download className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>

                          <div className="flex justify-between items-center p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <div>
                              <span className="font-bold text-[11px] block">Safety Assessment Plan</span>
                              <span className="text-[10px] text-muted-foreground">{record.safetyAssessment}</span>
                            </div>
                            <Download className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Poka-Yoke & Compliance</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px] mb-0.5">Poka-Yoke Implemented</span>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold">{record.pokaYoke}</p>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px] mb-0.5">Quality Inspection Gates</span>
                            <p className="text-slate-700 dark:text-slate-300">{record.qualityGates}</p>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px] mb-0.5">Compliance Status</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                              <Check className="h-4 w-4 bg-emerald-500/10 rounded-full" /> {record.complianceStatus}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* PFMEA Register */}
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">PFMEA Risk Matrix</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[700px]">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-muted-foreground font-semibold border-b">
                            <tr>
                              <th className="p-2.5">Risk ID</th>
                              <th className="p-2.5">Process Step</th>
                              <th className="p-2.5">Failure Mode</th>
                              <th className="p-2.5 text-center">Severity (S)</th>
                              <th className="p-2.5 text-center">Occurrence (O)</th>
                              <th className="p-2.5 text-center">Detection (D)</th>
                              <th className="p-2.5 text-center">RPN</th>
                              <th className="p-2.5">Corrective Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {pfmeaItems.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="p-2.5 font-bold">{item.id}</td>
                                <td className="p-2.5 font-medium">{item.processStep}</td>
                                <td className="p-2.5 font-medium text-slate-900 dark:text-slate-100">{item.failureMode}</td>
                                <td className="p-2.5 text-center font-mono">{item.severity}</td>
                                <td className="p-2.5 text-center font-mono">{item.occurrence}</td>
                                <td className="p-2.5 text-center font-mono">{item.detection}</td>
                                <td className="p-2.5 text-center">
                                  <Badge className={item.rpn >= 90 ? "bg-rose-500/10 text-rose-600 border-rose-500/25" : "bg-amber-500/10 text-amber-600 border-amber-500/25"}>
                                    {item.rpn}
                                  </Badge>
                                </td>
                                <td className="p-2.5 text-muted-foreground text-[11px]">{item.action}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
                        <BarChart3 className="h-5 w-5 text-primary" /> OEE & Production Output Analysis
                      </h2>
                      <p className="text-xs text-muted-foreground">Overall Equipment Effectiveness (OEE) parameters, scrap thresholds, and yield trends.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.performanceScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Performance targets */}
                    <div className="md:col-span-4 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Production Targets</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Planned Output Target</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{record.plannedOutput} units/day</span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px]">OEE Target</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{record.oeeTarget}%</span>
                            <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">86.2% achieved in Day 3 Run</span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px]">Yield Target Stance</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{record.yieldTarget}%</span>
                            <span className="text-[10px] text-rose-500 font-medium block mt-0.5">Scrap Limit Max: {record.scrapTarget}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Chart trend */}
                    <div className="md:col-span-8">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Yield Improvement Cycle</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="h-56 w-full bg-slate-50 dark:bg-slate-950 rounded-lg border p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground border-b pb-1">
                              <span>OEE Rate vs Defect Percentage</span>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary inline-block" /> OEE (%)</span>
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> Defect (%)</span>
                              </div>
                            </div>

                            <div className="flex-1 w-full relative flex items-end justify-between px-6 pt-6">
                              <svg className="absolute inset-0 h-full w-full p-6 overflow-visible" xmlns="http://www.w3.org/2000/svg">
                                <line x1="0%" y1="0%" x2="100%" y2="0%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />
                                <line x1="0%" y1="33%" x2="100%" y2="33%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />
                                <line x1="0%" y1="66%" x2="100%" y2="66%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />
                                <line x1="0%" y1="100%" x2="100%" y2="100%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />

                                {/* OEE line (primary blue) */}
                                <path d="M 0 100 L 150 70 L 300 40" fill="none" stroke="#0F62FE" strokeWidth="2.5" strokeLinecap="round" className="opacity-80" style={{ transform: "scaleY(0.7) translateY(20px)" }} />
                                {/* Defect line (rose red) */}
                                <path d="M 0 30 L 150 50 L 300 90" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" className="opacity-80" style={{ transform: "scaleY(0.7) translateY(20px)" }} />
                              </svg>

                              {record.kpiTrend.map((run: any) => (
                                <div key={run.period} className="flex flex-col items-center z-10">
                                  <div className="text-[9px] font-bold text-slate-800 dark:text-slate-200">OEE: {run.oee}%</div>
                                  <div className="h-2 w-2 rounded-full bg-primary border border-white" />
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
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 text-purple-750 dark:text-purple-300">
                        <Sparkles className="h-5 w-5 animate-pulse text-purple-600" /> AI Production Optimization Recommendations
                      </h2>
                      <p className="text-xs text-muted-foreground">Advanced line balancing predictions, predictive maintenance telemetry, and robotic assembly suggestions.</p>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-700 border-purple-300 font-bold">AI Engineering Score: {record.aiEngineeringScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/80 shadow-xs bg-gradient-to-br from-purple-50/20 via-white to-slate-50 dark:from-purple-950/10 dark:via-slate-900">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-purple-700 dark:text-purple-300">Bottlenecks & Predictive Maintenance</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">Identified Station Bottleneck</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {record.aiBottleneckAnalysis}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 border-t pt-3">
                          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">Predictive Maintenance Notification</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed text-amber-700 dark:text-amber-300 font-medium">
                              {record.aiPredictiveMaintenance}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Automation & Efficiency Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Line Balancing Recommendations</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {record.aiLineBalancingRecommendations}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 border-t pt-3">
                          <Cpu className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Capacity & Throughput Optimization</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {record.aiCapacityOptimization}
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
                      <Award className="h-5 w-5 text-primary" /> Overall Production Engineering Summary
                    </h2>
                    <Badge variant="outline">Maturity Status: v1.2.0 Baseline</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-border/80 shadow-xs flex flex-col justify-between">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold uppercase text-slate-900 dark:text-white">Overall Production Readiness</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 text-center space-y-3">
                        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 p-2">
                          <div className="text-center">
                            <span className="text-2xl font-black text-primary dark:text-blue-400">{record.overallProductionReadiness}</span>
                            <span className="block text-[9px] font-bold text-muted-foreground">/ 100</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground block">
                          Weighted readiness level across all 5 evaluation gates.
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
                            <span>Process Routing & Design Layout</span>
                            <span className="text-primary">{record.designReadinessScore}%</span>
                          </div>
                          <Progress value={record.designReadinessScore} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Resource Availability Stance</span>
                            <span className="text-primary">{record.resourceReadinessScore}%</span>
                          </div>
                          <Progress value={record.resourceReadinessScore} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>FAI & Trial Run Validation</span>
                            <span className="text-primary">{record.validationScore}%</span>
                          </div>
                          <Progress value={record.validationScore} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Quality & Safety Engineering PFMEA</span>
                            <span className="text-primary">{record.qualityScore}%</span>
                          </div>
                          <Progress value={record.qualityScore} className="h-2" />
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
                        <Paperclip className="h-5 w-5 text-primary" /> Production Files Manager
                      </h2>
                      <p className="text-xs text-muted-foreground">Manage PFMEA reports, control plans, routing sheets, and CAD assembly diagrams.</p>
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
                          {record.attachments.map((att: ProductionEngineeringAttachment) => (
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
                      <UserCheck className="h-5 w-5 text-primary" /> Review Board Approval Status
                    </h2>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-300 font-bold">
                      {record.workflowStatus}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Reviewers */}
                    <div className="md:col-span-7 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Workflow Approval Board</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3.5 text-xs">
                          <div className="space-y-2.5">
                            {record.reviewers.map((rev: ProductionEngineeringReviewer) => (
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
                              placeholder="Describe engineering feedback or compliance remarks..."
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

              {/* TAB 11: ACTIVITY HISTORY / SYSTEM INFO */}
              {activeTab === "system_info" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" /> System Audit Trail & History
                    </h2>
                    <Badge variant="outline" className="font-mono">v{record.productionVersion}</Badge>
                  </div>

                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Audit Entries</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2.5 text-xs">
                      {record.auditTrail.map((aud: ProductionEngineeringAuditEntry) => (
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
               RIGHT INSIGHTS PANEL
               ==================================================================== */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Overall readiness */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Overall Production Readiness</span>
                    <Award className="h-4 w-4 text-emerald-600 animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-center space-y-4">
                  <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 p-2">
                    <div>
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{record.overallProductionReadiness}</span>
                      <span className="block text-[10px] font-bold text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-left text-xs border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Process Design Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.designReadinessScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resource Readiness</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.resourceReadinessScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validation Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.validationScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quality & Safety Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.qualityScore} / 100</span>
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
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">Pilot production run completed successfully.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">First Article Inspection passed.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">Process Capability (Cp/Cpk) is 1.67.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">OEE target achievable with current setup.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">AI suggests 8% productivity improvement.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">No critical risks identified.</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("validation")} className="w-full justify-start text-xs h-8">
                    <ClipboardCheck className="h-3.5 w-3.5 mr-2 text-primary" /> Create Pilot Production Plan
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("design")} className="w-full justify-start text-xs h-8">
                    <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Upload Routing Sheet
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("quality")} className="w-full justify-start text-xs h-8">
                    <ShieldCheck className="h-3.5 w-3.5 mr-2 text-amber-500" /> Generate Control Plan
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("quality")} className="w-full justify-start text-xs h-8">
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-rose-500" /> Run FMEA Analysis
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("design")} className="w-full justify-start text-xs h-8">
                    <Workflow className="h-3.5 w-3.5 mr-2 text-purple-600" /> View Line Balancing Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("resources")} className="w-full justify-start text-xs h-8">
                    <Building2 className="h-3.5 w-3.5 mr-2 text-emerald-600" /> View Capacity Planning
                  </Button>
                </CardContent>
              </Card>

              {/* Production Timeline */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Production Timeline</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs space-y-4">
                  <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-4">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Process Design Completed</span>
                      <span className="text-[10px] text-muted-foreground">05 Jun 2024 11:20 AM</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Resource Planning Completed</span>
                      <span className="text-[10px] text-muted-foreground">07 Jun 2024 03:45 PM</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Pilot Production Completed</span>
                      <span className="text-[10px] text-muted-foreground">12 Jun 2024 02:10 PM</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">FAI & Validation Completed</span>
                      <span className="text-[10px] text-muted-foreground">14 Jun 2024 10:05 AM</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-primary" />
                      <span className="font-bold block text-slate-900 dark:text-white">Review & Approval</span>
                      <span className="text-[10px] text-muted-foreground">In Progress</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <span className="font-bold block text-muted-foreground">Mass Production Release</span>
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

      {/* Diagram Zoom Dialog */}
      {selectedDiagram && (
        <Dialog open={!!selectedDiagram} onOpenChange={() => setSelectedDiagram(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex justify-between items-center">
                <span>Manufacturing Layout Preview</span>
                <Badge variant="outline">DELMIA Simulation Map</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="relative h-96 w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={selectedDiagram} alt="layout" className="h-full w-full object-contain" />
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
            <DialogTitle className="text-sm font-bold">Upload Manufacturing Files</DialogTitle>
          </DialogHeader>
          <div className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <Upload className="h-8 w-8 text-primary mx-auto" />
            <p className="text-xs font-semibold">Drop CAD, PDF routing sheets, or Control logs here</p>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { setIsUploadOpen(false); toast.success("File uploaded successfully!"); }} className="bg-primary text-white">Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document View Modal */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">Document Details</DialogTitle>
            </DialogHeader>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-semibold">{selectedDocument.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-semibold">{selectedDocument.size}</span>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedDocument(null)}>Close</Button>
              <Button size="sm" onClick={() => { setSelectedDocument(null); toast.success(`Downloading ${selectedDocument.name}...`); }} className="bg-primary text-white">Download</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Schedule Safety Review Meeting */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Schedule Safety & Compliance Review</DialogTitle>
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
            <Button size="sm" onClick={() => { setIsScheduleModalOpen(false); toast.success("Safety review scheduled!"); }} className="bg-primary text-white">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppShell>
  );
}
