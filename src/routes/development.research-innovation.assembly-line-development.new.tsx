import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
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

import { assemblyLineDevelopmentService } from "@/services/assemblyLineDevelopmentService";
import type {
  AssemblyLineRecord,
  AssemblyLineFormInput,
  AssemblyLineApprovalDecision,
  AssemblyLineChecklistItem,
  AssemblyLineReviewer,
  AssemblyLineAttachment,
  AssemblyLineAuditEntry,
  AssemblyLineMilestone,
} from "@/services/types";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { AssemblyLineDevelopmentTabBar, type AssemblyLineTabId } from "@/components/erp/AssemblyLineDevelopmentTabBar";
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
  "/development/research-innovation/assembly-line-development/new",
)({
  head: () => ({
    meta: [{ title: "Assembly Line Development Form · Magnertia ERP" }],
  }),
  component: AssemblyLineDevelopmentNewPage,
});

import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export function AssemblyLineDevelopmentNewPage({
  breadcrumb = "Development > Manufacturing Development",
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Tab State & Settings
  const [activeTab, setActiveTab] = useState<AssemblyLineTabId>("overview");
  const [isTelemetryMode, setIsTelemetryMode] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  // Approval Decision Form
  const [reviewDecision, setReviewDecision] = useState<AssemblyLineApprovalDecision>("Approved");
  const [reviewCommentInput, setReviewCommentInput] = useState("");

  // Data Fetching
  const { data: record, isLoading } = useQuery<AssemblyLineRecord>({
    queryKey: ["assemblyLineRecord"],
    queryFn: () => assemblyLineDevelopmentService.fetchRecord(),
  });

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<AssemblyLineFormInput>) => assemblyLineDevelopmentService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["assemblyLineRecord"], updated);
      toast.success("Draft saved successfully!", { description: "Assembly line design baseline updated." });
    },
    onError: (err: any) => {
      toast.error("Failed to save draft", { description: err?.message || "An error occurred." });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (id?: string) => assemblyLineDevelopmentService.submitForReview(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["assemblyLineRecord"], updated);
      toast.success("Submitted for review board!", { description: "Plant layout and industrial managers notified." });
    },
  });

  const reviewDecisionMutation = useMutation({
    mutationFn: (args: { id: string; decision: AssemblyLineApprovalDecision; comments?: string }) =>
      assemblyLineDevelopmentService.reviewDecision(args),
    onSuccess: (updated) => {
      queryClient.setQueryData(["assemblyLineRecord"], updated);
      toast.success(`Decision recorded: ${reviewDecision}`, { description: "Assembly line workflow stage updated." });
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="Assembly Line Development"
        breadcrumb="Development"
        description="Govern assembly line layout design, workstations planning, takt time line balancing, automation level, OEE targets, and AI quality checks."
        tabs={<ResearchInnovationTabBar />}
      >
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Assembly Line Development Module...</p>
        </div>
      </AppShell>
    );
  }

  // Quick helper handlers
  const handleSaveDraft = () => {
    saveDraftMutation.mutate({
      projectName: record.projectName,
      plantName: record.manufacturingPlant,
      productionLine: record.productionLine,
      productFamily: record.productFamily,
      assemblyLineType: record.assemblyLineType,
      productionObjective: record.productionObjective,
      developmentStage: record.developmentStage,
      priority: record.priority,
      
      // Design
      factoryLayout: record.factoryLayout,
      assemblyLineLayout: record.assemblyLineLayout,
      workstationLayoutFile: record.workstationLayoutFile,
      materialFlowDiagram: record.materialFlowDiagram,
      lineConfiguration: record.lineConfiguration,
      numberOfWorkstations: record.numberOfWorkstations,
      layoutDesignScore: record.layoutDesignScore,
      
      // Workstations
      workstationList: record.workstationList,
      workInstructions: record.workInstructions,
      cycleTimePerStation: record.cycleTimePerStation,
      operatorRequirement: record.operatorRequirement,
      machineAllocation: record.machineAllocation,
      ergonomicAssessment: record.ergonomicAssessment,
      workstationReadinessScore: record.workstationReadinessScore,
      
      // Line Balancing
      taktTime: record.taktTime,
      lineBalancingCompleted: record.lineBalancingCompleted,
      bottleneckAnalysis: record.bottleneckAnalysis,
      pilotLineRun: record.pilotLineRun,
      throughputValidation: record.throughputValidation,
      validationRemarks: record.validationRemarks,
      validationScore: record.validationScore,
      
      // Automation
      automationLevel: record.automationLevel,
      robotStations: record.robotStations,
      visionInspection: record.visionInspection,
      pokaYoke: record.pokaYoke,
      inlineTesting: record.inlineTesting,
      qualityGates: record.qualityGates,
      automationScore: record.automationScore,
      
      // Performance
      plannedOutput: record.plannedOutput,
      lineCapacity: record.lineCapacity,
      oeeTarget: record.oeeTarget,
      yieldTarget: record.yieldTarget,
      scrapTarget: record.scrapTarget,
      overallEfficiency: record.overallEfficiency,
      performanceScore: record.performanceScore,
      
      // AI
      aiLineOptimization: record.aiLineOptimization,
      aiBottleneckPrediction: record.aiBottleneckPrediction,
      aiResourceUtilization: record.aiResourceUtilization,
      aiMaintenanceSuggestions: record.aiMaintenanceSuggestions,
      aiProductivityRecommendations: record.aiProductivityRecommendations,
      aiReadinessScore: record.aiReadinessScore,

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
    toast.success("Exporting Assembly Line Specification Report (PDF)...", { description: "Generating factory layouts and line balancing parameters." });
  };

  // Mock Workstation Utilization list for Custom Balancing Visualizer
  const balancingWorkstations = [
    { id: "WS-1", name: "PCB Loading & Solder", load: 82, target: 90, status: "Under Target" },
    { id: "WS-2", name: "AC/DC Power Screwing", load: 85, target: 90, status: "Under Target" },
    { id: "WS-3", name: "Enclosure Wiring Fit", load: 88, target: 90, status: "Near Bottleneck" },
    { id: "WS-4", name: "Final Functional Test", load: 80, target: 90, status: "Under Target" },
  ];

  return (
    <AppShell
      title="Assembly Line Development"
      breadcrumb={breadcrumb}
      description="Balance assembly lines, takt time distribution, ergonomic workstations, and automated line feeds."
      tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
    >
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased pb-16">
        
        {/* Main Layout Container */}
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 pt-3 space-y-4">
          
          {/* ====================================================================
             1. PAGE HEADER (Assembly Line Info Bar)
             ==================================================================== */}
          <div className="rounded-xl border border-border/80 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-5 transition-all">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Left Title Parameters */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="hover:text-foreground cursor-pointer">Development</span>
                  <span>/</span>
                  <span className="hover:text-foreground cursor-pointer">Process Development</span>
                  <span>/</span>
                  <span className="text-primary font-semibold">Assembly Line Development Form</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Cpu className="h-6 w-6 text-primary shrink-0 animate-pulse" />
                    {record.projectName}
                  </h1>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
                    {record.assemblyLineVersion}
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
                      <Printer className="mr-2 h-4 w-4" /> Export Layout drawings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(JSON.stringify(record, null, 2), "Assembly Line JSON")}>
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
                <span className="text-muted-foreground block text-[11px]">Assembly Line ID</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.assemblyLineId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Form Code</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.formCode}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Assembly Engineer</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <img src={record.assemblyLineEngineer.avatar} className="h-4 w-4 rounded-full" alt="owner" />
                  {record.assemblyLineEngineer.name}
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
                <span className="text-muted-foreground block text-[11px]">Linked Prod Eng</span>
                <span className="font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                  {record.linkedProductionEngineering.code}
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
            
            {/* Assembly readiness gauge */}
            <Card className="lg:col-span-4 border-border/80 shadow-xs bg-gradient-to-br from-white via-slate-50 to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/15">
              <CardContent className="p-4 sm:p-5 flex items-center gap-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 p-2">
                  <div className="text-center">
                    <span className="text-2xl font-black tracking-tight text-primary dark:text-blue-400">
                      {record.overallAssemblyReadiness}
                    </span>
                    <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      / 100
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">Overall Assembly Readiness</h3>
                    <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary">
                      Ready for Mass Prod
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Evaluation status across takt balance, workstation routing, safety audits, and pilot line trial runs.
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Layout</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.layoutDesignScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Stations</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.workstationReadinessScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Validation</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.validationScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] truncate">Automation</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.automationScore}</span>
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
                    Assembly Line Timeline Stages
                  </span>
                  <span className="text-xs font-semibold text-primary">Stage 4 of 6: Line Balancing Staging</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                  {record.timeline.map((s: AssemblyLineMilestone, idx: number) => (
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
          <AssemblyLineDevelopmentTabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ====================================================================
             4. MAIN CONTENT AREA & RIGHT SIDEBAR GRID
             ==================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Main tab content */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {(activeTab === "overview" || isTelemetryMode) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" /> Assembly Line Specifications
                    </h2>
                    <Badge variant="outline">DELMIA Configuration</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Panel 1 */}
                    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                      <CardHeader className="p-4 pb-2 border-b border-border/40">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" /> Profile Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Assembly Line Name</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.productionLine}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Product Family</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.productFamily}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Objective</span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                            {record.productionObjective}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t text-[11px]">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Development Stage</span>
                            <Badge className="mt-0.5 bg-blue-500/10 text-blue-700 border-blue-500/20 text-[9px] font-semibold px-2 py-0">
                              {record.developmentStage}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Priority</span>
                            <Badge className="mt-0.5 bg-amber-500/10 text-amber-700 border-amber-500/20 text-[9px] font-semibold px-2 py-0">
                              {record.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Panel 2 */}
                    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between">
                      <CardHeader className="p-4 pb-2 border-b border-border/40">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Radio className="h-4 w-4 text-emerald-500 shrink-0" /> Line Illustration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[9px]">Assembly Line Type</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.assemblyLineType}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[9px]">Plant Location</span>
                            <span className="font-bold">{record.manufacturingPlant}</span>
                          </div>
                        </div>

                        {/* Graphic layout representation */}
                        <div className="h-28 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg border flex flex-col items-center justify-center p-2 relative shrink-0">
                          <div className="flex gap-2">
                            <span className="h-6 w-6 rounded bg-primary/20 border border-primary flex items-center justify-center font-bold text-[8px]">WS-1</span>
                            <span className="h-6 w-6 rounded bg-primary/20 border border-primary flex items-center justify-center font-bold text-[8px]">WS-2</span>
                            <span className="h-6 w-6 rounded bg-amber-500/20 border border-amber-500 flex items-center justify-center font-bold text-[8px]">WS-3</span>
                          </div>
                          <span className="text-[8px] font-bold text-muted-foreground mt-2">12 Workstations</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 2: LAYOUT DESIGN */}
              {activeTab === "design" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Map className="h-5 w-5 text-primary" /> Assembly Line Layout Design
                      </h2>
                      <p className="text-xs text-muted-foreground">U-Shaped line configurations, material flow coordinates, layouts preview, and workstation counts.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.layoutDesignScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Design documents & parameters */}
                    <div className="md:col-span-5 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Line Design Files</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 text-xs space-y-2">
                          <div className="flex items-center justify-between p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold">{record.factoryLayout}</span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold">{record.assemblyLineLayout}</span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="font-semibold">{record.materialFlowDiagram}</span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Configuration Specs</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-xs space-y-3">
                          <div>
                            <span className="text-muted-foreground block text-[10px] mb-0.5">Line Configuration</span>
                            <p className="font-bold text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                              {record.lineConfiguration}
                            </p>
                          </div>
                          <div className="pt-2 border-t flex justify-between items-center">
                            <div>
                              <span className="text-muted-foreground block text-[10px]">Workstations</span>
                              <span className="text-base font-extrabold text-primary">{record.numberOfWorkstations} Stations</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Layout diagram preview */}
                    <div className="md:col-span-7">
                      <Card className="border-border/80 shadow-xs overflow-hidden">
                        <div className="relative h-64 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center group">
                          <img
                            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80"
                            alt="layout diagram preview"
                            className="h-full w-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              size="sm"
                              className="bg-white text-slate-950 hover:bg-slate-100 border text-xs"
                              onClick={() => setSelectedDiagram("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80")}
                            >
                              <Maximize2 className="h-3.5 w-3.5 mr-1" /> Full Layout Preview
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4 space-y-1 text-xs">
                          <span className="text-muted-foreground block text-[10px]">Layout Design Score</span>
                          <Badge className="bg-primary/10 text-primary">Score: {record.layoutDesignScore}/100</Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WORKSTATIONS */}
              {activeTab === "workstations" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" /> Workstation Planning & Allocation
                      </h2>
                      <p className="text-xs text-muted-foreground">Detailed workstation plans, cycle times, operators requirement, machine allocations, and ergonomics.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.workstationReadinessScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Planning Documents & Cycles</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div className="flex justify-between items-center p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                          <div>
                            <span className="font-bold text-[11px] block">Workstation List</span>
                            <span className="text-[10px] text-muted-foreground">{record.workstationList}</span>
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                        </div>

                        <div className="flex justify-between items-center p-2 rounded border bg-slate-50/50 dark:bg-slate-800/40">
                          <div>
                            <span className="font-bold text-[11px] block">Standard Work Instructions</span>
                            <span className="text-[10px] text-muted-foreground">{record.workInstructions}</span>
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Cycle Time per Station</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{record.cycleTimePerStation} Sec</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Operator Requirement</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{record.operatorRequirement} Nos</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Machine Allocations & Ergonomics</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
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

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Ergonomic Assessment Stance</span>
                          <p className="text-slate-700 dark:text-slate-300 font-semibold">{record.ergonomicAssessment}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 4: LINE BALANCING */}
              {activeTab === "balancing" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-primary" /> Takt Time & Line Balancing Validation
                      </h2>
                      <p className="text-xs text-muted-foreground">Takt time constraints compliance, bottleneck analysis documents, and pilot line validation logs.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.validationScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* balancing details */}
                    <div className="md:col-span-5 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Takt Constraints</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Takt Time Limit</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{record.taktTime} Sec</span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px]">Bottleneck Analysis Report</span>
                            <span className="font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1 mt-0.5">
                              <FileText className="h-3.5 w-3.5" /> {record.bottleneckAnalysis}
                            </span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px]">Validation Summary Remarks</span>
                            <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                              {record.validationRemarks}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* balancing visualizer */}
                    <div className="md:col-span-7">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Workstation Cycle Time utilization vs Takt Limit</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          {/* High-fidelity utilization bars */}
                          <div className="space-y-3">
                            {balancingWorkstations.map((ws) => (
                              <div key={ws.id} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span>{ws.name} ({ws.id})</span>
                                  <span className={ws.status === "Near Bottleneck" ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>{ws.load}s / {ws.target}s</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      ws.status === "Near Bottleneck"
                                        ? "bg-amber-500 animate-pulse"
                                        : "bg-emerald-500"
                                    }`}
                                    style={{ width: `${(ws.load / ws.target) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t text-[10px] text-muted-foreground text-center font-semibold">
                            Red Line represents Takt Time Limit (90 Sec)
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AUTOMATION & QUALITY */}
              {activeTab === "automation" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" /> Automation Level & Inline Testing
                      </h2>
                      <p className="text-xs text-muted-foreground">Workstation automation plans, robotics loading, inline testing checks, and quality gates.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.automationScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Automation Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Overall Automation Level</span>
                          <span className="font-bold text-slate-900 dark:text-white text-base block">{record.automationLevel}</span>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Robot Stations count</span>
                          <span className="font-bold text-slate-900 dark:text-white text-base block">{record.robotStations} Stations</span>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px] mb-0.5">Quality Inspection Gates</span>
                          <p className="text-slate-700 dark:text-slate-300 font-semibold">{record.qualityGates}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Inline Quality Checks</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-bold">Vision Inspection System</span>
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/25">Active</Badge>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-bold">Poka-Yoke Implementation</span>
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/25">Verified</Badge>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-bold">Inline Functional Testing</span>
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/25">Active</Badge>
                        </div>
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
                        <BarChart3 className="h-5 w-5 text-primary" /> Overall Efficiency & Throughput
                      </h2>
                      <p className="text-xs text-muted-foreground">Line design capacities, OEE target compliance levels, scrap targets, and runs yield.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Score: {record.performanceScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Performance numbers */}
                    <div className="md:col-span-4 space-y-4">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">KPI actual vs targets</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Overall Line Efficiency</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{record.overallEfficiency}%</span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px]">OEE Target</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{record.oeeTarget}%</span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-[10px]">Planned Output Limit</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{record.plannedOutput} units/day</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Chart visualization */}
                    <div className="md:col-span-8">
                      <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Throughput Performance Staging</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="h-56 w-full bg-slate-50 dark:bg-slate-950 rounded-lg border p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground border-b pb-1">
                              <span>Throughput Yield (units/day)</span>
                            </div>

                            <div className="flex-1 w-full relative flex items-end justify-between px-6 pt-6">
                              <svg className="absolute inset-0 h-full w-full p-6 overflow-visible" xmlns="http://www.w3.org/2000/svg">
                                <line x1="0%" y1="0%" x2="100%" y2="0%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />
                                <line x1="0%" y1="33%" x2="100%" y2="33%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />
                                <line x1="0%" y1="66%" x2="100%" y2="66%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />
                                <line x1="0%" y1="100%" x2="100%" y2="100%" stroke="rgba(100,116,139,0.1)" strokeDasharray="3 3" />

                                <path d="M 0 110 L 150 70 L 300 30" fill="none" stroke="#0F62FE" strokeWidth="2.5" strokeLinecap="round" className="opacity-80" style={{ transform: "scaleY(0.7) translateY(20px)" }} />
                              </svg>

                              {record.kpiTrend.map((run: any) => (
                                <div key={run.period} className="flex flex-col items-center z-10">
                                  <div className="text-[9px] font-bold text-slate-800 dark:text-slate-200">{run.throughput} units</div>
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
                        <Sparkles className="h-5 w-5 animate-pulse text-purple-650" /> AI Assembly Line Quality Checks
                      </h2>
                      <p className="text-xs text-muted-foreground">Line optimization suggestions, predictive bottlenecks forecasting, and operator allocations advice.</p>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-700 border-purple-300 font-bold">AI Score: {record.aiReadinessScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/80 shadow-xs bg-gradient-to-br from-purple-50/20 via-white to-slate-50 dark:from-purple-950/10 dark:via-slate-900">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-purple-750 dark:text-purple-300">AI Bottlenecks & Maintenance Prediction</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Bottleneck Prediction</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {record.aiBottleneckPrediction}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 border-t pt-3">
                          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Maintenance Suggestions</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed text-amber-700 dark:text-amber-300 font-medium">
                              {record.aiMaintenanceSuggestions}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">AI Resource & Optimization Advice</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Sparkles className="h-5 w-5 text-purple-650 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Line Optimization Stance</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {record.aiLineOptimization}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 border-t pt-3">
                          <UserCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Resource Utilization</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {record.aiResourceUtilization}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 border-t pt-3">
                          <Cpu className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-slate-900 dark:text-white">AI Productivity Recommendations</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {record.aiProductivityRecommendations}
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
                      <Award className="h-5 w-5 text-primary" /> Overall Assembly Readiness Summary
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
                            <span className="text-2xl font-black text-primary dark:text-blue-400">{record.overallAssemblyReadiness}</span>
                            <span className="block text-[9px] font-bold text-muted-foreground">/ 100</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground block">
                          Weighted operational readiness status across all 5 evaluation gates.
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
                            <span>Line Layout & Design</span>
                            <span className="text-primary">{record.layoutDesignScore}%</span>
                          </div>
                          <Progress value={record.layoutDesignScore} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Workstation Planning Stance</span>
                            <span className="text-primary">{record.workstationReadinessScore}%</span>
                          </div>
                          <Progress value={record.workstationReadinessScore} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Takt Validation & Balancing</span>
                            <span className="text-primary">{record.validationScore}%</span>
                          </div>
                          <Progress value={record.validationScore} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Automation Level & Quality Checks</span>
                            <span className="text-primary">{record.automationScore}%</span>
                          </div>
                          <Progress value={record.automationScore} className="h-2" />
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
                        <Paperclip className="h-5 w-5 text-primary" /> Assembly Attachments Manager
                      </h2>
                      <p className="text-xs text-muted-foreground">Manage factory layouts drawings, work instructions, quality plans, and pilot reports.</p>
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
                          {record.attachments.map((att: AssemblyLineAttachment) => (
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
                      <UserCheck className="h-5 w-5 text-primary" /> Review Board Approval Gate
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
                            {record.reviewers.map((rev: AssemblyLineReviewer) => (
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

              {/* TAB 11: SYSTEM INFO / AUDIT TRAIL */}
              {activeTab === "system_info" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" /> System Audit Trail & History
                    </h2>
                    <Badge variant="outline" className="font-mono">v{record.assemblyLineVersion}</Badge>
                  </div>

                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">Audit Entries</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2.5 text-xs">
                      {record.auditTrail.map((aud: AssemblyLineAuditEntry) => (
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
              
              {/* Overall Assembly Readiness Score gauge */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Overall Assembly Readiness</span>
                    <Award className="h-4 w-4 text-primary animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-center space-y-4">
                  <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 p-2">
                    <div>
                      <span className="text-3xl font-black text-primary dark:text-blue-400">{record.overallAssemblyReadiness}</span>
                      <span className="block text-[10px] font-bold text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-left text-xs border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Layout Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.layoutDesignScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Workstation Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.workstationReadinessScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validation Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.validationScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Automation Score</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.automationScore} / 100</span>
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
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">Takt Time achieved: 90 sec.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">Pilot Run completed successfully.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">AI Optimization available: 6% reduction.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">OEE Target reached: 82.6%.</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("balancing")} className="w-full justify-start text-xs h-8">
                    <ClipboardCheck className="h-3.5 w-3.5 mr-2 text-primary" /> Create Pilot Run Plan
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("design")} className="w-full justify-start text-xs h-8">
                    <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Upload Assembly Layout
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("workstations")} className="w-full justify-start text-xs h-8">
                    <FileCheck className="h-3.5 w-3.5 mr-2 text-amber-500" /> Generate Work Instructions
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("balancing")} className="w-full justify-start text-xs h-8">
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-rose-500" /> Run Line Balancing
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("performance")} className="w-full justify-start text-xs h-8">
                    <BarChart3 className="h-3.5 w-3.5 mr-2 text-purple-600" /> View Performance Dashboard
                  </Button>
                </CardContent>
              </Card>

              {/* Vertical Timeline */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Line Timeline</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs space-y-4">
                  <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-4">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Layout Design Completed</span>
                      <span className="text-[10px] text-muted-foreground">05 Jun 2024</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Workstation Planning Completed</span>
                      <span className="text-[10px] text-muted-foreground">07 Jun 2024</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Pilot Line Run Completed</span>
                      <span className="text-[10px] text-muted-foreground">12 Jun 2024</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Line Balancing Verified</span>
                      <span className="text-[10px] text-muted-foreground">14 Jun 2024</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold block text-slate-900 dark:text-white">Quality Validation Verified</span>
                      <span className="text-[10px] text-muted-foreground">17 Jun 2024</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-primary" />
                      <span className="font-bold block text-slate-900 dark:text-white">Review & Approval</span>
                      <span className="text-[10px] text-muted-foreground">In Progress</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <span className="font-bold block text-muted-foreground">Mass Production Staging</span>
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
                <span>Layout Drawing</span>
              </DialogTitle>
            </DialogHeader>
            <div className="relative h-96 w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={selectedDiagram} alt="layout drawings" className="h-full w-full object-contain" />
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
            <DialogTitle className="text-sm font-bold">Upload Drawings & Layouts</DialogTitle>
          </DialogHeader>
          <div className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <Upload className="h-8 w-8 text-primary mx-auto" />
            <p className="text-xs font-semibold">Drop drawings or instructions files here</p>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { setIsUploadOpen(false); toast.success("File uploaded successfully!"); }} className="bg-primary text-white">Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Safety Review */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Schedule Assembly Line Review</DialogTitle>
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
