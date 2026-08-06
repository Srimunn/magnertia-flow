import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Box,
  Layers,
  Cpu,
  Play,
  Pause,
  RefreshCw,
  FileText,
  Download,
  Upload,
  Eye,
  Save,
  Send,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  Workflow,
  Copy,
  Plus,
  FileCode,
  HardDrive,
  Target,
  Zap,
  BarChart3,
  Check,
  X,
  ChevronDown,
  Filter,
  FileCheck,
  Share2,
  Printer,
  History,
  Info,
  Maximize2,
  FolderDown,
  LineChart,
  CheckCircle2,
  AlertTriangle,
  Server,
  Globe,
  Settings,
  TrendingUp,
  Sparkles,
  Clock,
  ArrowUpRight,
  Flame,
  Gauge,
  Sliders,
  Scale,
  Thermometer,
  Compass,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { simulationAnalysisService } from "@/services/simulationAnalysisService";
import type {
  SimulationRecord,
  SimulationFormInput,
  SimulationApprovalDecision,
  SimulationAttachment,
  SimulationReviewer,
  SimulationAuditEntry,
} from "@/services/types";
import { ResearchInnovationTabBar, InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import {
  SimulationAnalysisTabBar,
  SIMULATION_TABS,
  type SimulationAnalysisTabId,
} from "@/components/erp/SimulationAnalysisTabBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { AppShell } from "@/components/erp/AppShell";

export const Route = createFileRoute(
  "/development/research-innovation/simulation-analysis/new",
)({
  head: () => ({
    meta: [{ title: "Simulation & Analysis Form · Magnertia ERP" }],
  }),
  component: SimulationAnalysisNewPage,
});

export function SimulationAnalysisNewPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Tab State & Interactive Controls
  const [activeTab, setActiveTab] = useState<SimulationAnalysisTabId>("overview");
  const [selectedAttachment, setSelectedAttachment] = useState<SimulationAttachment | null>(null);

  // Modals & Dialog States
  const [isRunSolverOpen, setIsRunSolverOpen] = useState(false);
  const [isCompareScenariosOpen, setIsCompareScenariosOpen] = useState(false);
  const [isDigitalTwinSyncOpen, setIsDigitalTwinSyncOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Solver Simulation State
  const [isSolving, setIsSolving] = useState(false);
  const [solveProgress, setSolveProgress] = useState(0);
  const [solverLogs, setSolverLogs] = useState<string[]>([]);

  // Review & Approval State
  const [reviewDecision, setReviewDecision] =
    useState<SimulationApprovalDecision>("Approved with Conditions");
  const [reviewCommentInput, setReviewCommentInput] = useState(
    "Overall results are good. Please optimize the rib design near the mounting region.",
  );

  // Data Fetching via React Query
  const { data: record, isLoading } = useQuery<SimulationRecord>({
    queryKey: ["simulationAnalysisRecord"],
    queryFn: () => simulationAnalysisService.fetchRecord(),
  });

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<SimulationFormInput>) =>
      simulationAnalysisService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["simulationAnalysisRecord"], updated);
      toast.success("Draft saved successfully!", {
        description: "Simulation parameters updated.",
      });
    },
  });

  const submitForReviewMutation = useMutation({
    mutationFn: () => simulationAnalysisService.submitForReview(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["simulationAnalysisRecord"], updated);
      toast.success("Submitted for Engineering Review!", {
        description: "Project moved to 'In Review' stage.",
      });
    },
  });

  const reviewDecisionMutation = useMutation({
    mutationFn: (args: {
      id: string;
      decision: SimulationApprovalDecision;
      comments?: string;
    }) => simulationAnalysisService.reviewDecision(args),
    onSuccess: (updated) => {
      queryClient.setQueryData(["simulationAnalysisRecord"], updated);
      toast.success(`Review decision updated to '${reviewDecision}'`, {
        description: "Audit log entry added.",
      });
    },
  });

  // Solver Execution Action
  const handleStartSolver = () => {
    setIsSolving(true);
    setSolveProgress(0);
    setSolverLogs([
      "Initializing ANSYS Mechanical 2024 R1 FEA Solver...",
      "Loading CAD mesh W-EVSE_Housing_v2.step (1,245,876 elements)...",
      "Applying boundary conditions (Fixed Support Base, 45 °C ambient, 25 W/m²K)...",
    ]);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setSolveProgress(current);
      setSolverLogs((prev) => [
        ...prev,
        `Iterative Non-Linear Step ${current / 20}: Energy convergence 1e-6 reached...`,
      ]);

      if (current >= 100) {
        clearInterval(interval);
        setIsSolving(false);
        setSolverLogs((prev) => [
          ...prev,
          "Simulation completed successfully! Max Stress: 78.6 MPa, Max Temp: 78.4 °C.",
        ]);
        toast.success("ANSYS Multi-Physics Simulation Completed!", {
          description: "Results updated with 96.3% prototype correlation.",
        });
      }
    }, 400);
  };

  if (isLoading || !record) {
    return (
      <AppShell
        title="Simulation & Analysis"
        breadcrumb={breadcrumb ?? "Research & Innovation Development"}
        tabs={tabs ?? <ResearchInnovationTabBar />}
      >
        <div className="p-8 space-y-6">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Simulation & Analysis"
      breadcrumb={breadcrumb ?? "Research & Innovation Development"}
      description="Execute multi-physics FEA/CFD CAE simulations, structural mesh validation, and thermal analyses."
      tabs={tabs ?? <ResearchInnovationTabBar />}
    >
      <div className="space-y-6 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              {record.simulationProjectName}
            </h1>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-mono text-xs"
                >
                  {record.simulationVersion}
                </Badge>
                <Badge
                  className={
                    record.workflowStatus === "Approved"
                      ? "bg-emerald-600 text-white"
                      : record.workflowStatus === "In Review"
                      ? "bg-amber-500 text-white"
                      : "bg-blue-600 text-white"
                  }
                >
                  {record.workflowStatus}
                </Badge>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveDraftMutation.mutate({})}
                disabled={saveDraftMutation.isPending}
                className="gap-1.5"
              >
                <Save className="h-4 w-4 text-slate-500" />
                Save Draft
              </Button>

              <Button
                size="sm"
                onClick={() => submitForReviewMutation.mutate()}
                disabled={submitForReviewMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
              >
                <Send className="h-4 w-4" />
                Submit for Review
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setIsRunSolverOpen(true)}>
                    <Play className="h-4 w-4 mr-2 text-blue-500" />
                    Run ANSYS Solver
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsCompareScenariosOpen(true)}>
                    <Sliders className="h-4 w-4 mr-2 text-purple-500" />
                    Compare FEA Scenarios
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDigitalTwinSyncOpen(true)}>
                    <Globe className="h-4 w-4 mr-2 text-emerald-500" />
                    Sync Digital Twin
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Linked Entities Bar (Matching Screenshot) */}
          <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px]">Simulation ID</span>
              <span className="font-mono font-semibold text-foreground">
                {record.simulationId}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px]">Form Code</span>
              <span className="font-mono font-semibold text-foreground">
                {record.formCode}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px]">Linked Product</span>
              <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 cursor-pointer truncate">
                {record.linkedProductId}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px]">Mechanical Design</span>
              <span className="font-mono text-muted-foreground truncate">
                {record.linkedMechanicalDevId}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px]">Electrical Design</span>
              <span className="font-mono text-muted-foreground truncate">
                {record.linkedElectricalDevId}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px]">Electronics Design</span>
              <span className="font-mono text-muted-foreground truncate">
                {record.linkedElectronicsDevId}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px]">Embedded Systems</span>
              <span className="font-mono text-muted-foreground truncate">
                {record.linkedEmbeddedDevId}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px]">Simulation Engineer</span>
              <div className="flex items-center gap-1 font-medium text-foreground truncate">
                <img
                  src={record.simulationEngineerAvatar}
                  alt={record.simulationEngineerName}
                  className="h-3.5 w-3.5 rounded-full object-cover shrink-0"
                />
                <span className="truncate">{record.simulationEngineerName}</span>
              </div>
            </div>
          </div>

        {/* =========================================================================
            2. MAIN CONTENT AREA (LAYOUT: LEFT CONTENT + RIGHT SIDEBAR)
            ========================================================================= */}
        <div className="max-w-7xl mx-auto px-6 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 9-column content */}
          <div className="lg:col-span-9 space-y-6">
            {/* WORKFLOW STAGE TIMELINE / OVERALL PROGRESS BANNER */}
            <Card className="border-border/80 shadow-xs bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/20 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Score Radial Visual */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="relative flex items-center justify-center h-20 w-20 rounded-full border-4 border-blue-600/20 bg-blue-600/5 dark:bg-blue-500/10">
                      <div className="text-center">
                        <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                          {record.overallSimulationScore}
                        </span>
                        <span className="text-[10px] block text-muted-foreground font-semibold">
                          /100
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
                        Overall Simulation Score
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        High Correlation (96.3%)
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        4-Stage CAE FEA/CFD Simulation Lifecycle
                      </div>
                    </div>
                  </div>

                  {/* 4-Stage Engineering Workflow */}
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>CAE Engineering Simulation Lifecycle</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        Stage 2: Engineering Simulation
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { stage: "1. Model Prep", status: "Completed", score: record.modelReadinessScore, color: "bg-emerald-500" },
                        { stage: "2. Simulation", status: "In Progress", score: record.configurationScore, color: "bg-blue-600" },
                        { stage: "3. Validation", status: "Upcoming", score: record.validationScore, color: "bg-purple-500" },
                        { stage: "4. Review", status: "Pending", score: record.optimizationScore, color: "bg-amber-500" },
                      ].map((stg, idx) => (
                        <div key={idx} className="space-y-1 text-center">
                          <div className={`h-2 rounded-full ${stg.color}`} />
                          <span className="text-[10px] block font-medium truncate text-slate-700 dark:text-slate-300">
                            {stg.stage} ({stg.score})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TAB CONTENT 1: OVERVIEW */}
            {(activeTab === "overview" || activeTab === "system_info") && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Simulation Overview */}
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          1. Simulation Overview
                        </CardTitle>
                        <CardDescription>
                          Multi-Physics thermal & structural simulation objective
                        </CardDescription>
                      </div>
                      <Badge className="bg-red-600 text-white">
                        Priority: {record.projectPriority}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">
                          Simulation Purpose
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-md border border-slate-200/60 dark:border-slate-800">
                          {record.simulationPurpose}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-muted-foreground block mb-1">
                            Simulation Type
                          </span>
                          <Badge variant="outline" className="font-medium">
                            {record.simulationType}
                          </Badge>
                        </div>

                        <div>
                          <span className="font-semibold text-muted-foreground block mb-1">
                            Engineering Domain
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {record.engineeringDomain}
                          </Badge>
                        </div>
                      </div>

                      {/* 3D CAD Preview Card Graphic (Matching Screenshot) */}
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-white flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 block font-mono">
                            FEA 3D CONTOUR PREVIEW
                          </span>
                          <span className="text-sm font-bold block text-blue-400">
                            {record.modelPrepConfig.cadModel}
                          </span>
                          <span className="text-[11px] text-slate-300">
                            {record.modelPrepConfig.materialLibrary} • {record.modelPrepConfig.totalElements} Elements
                          </span>
                        </div>
                        <div className="h-16 w-20 rounded-md bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                          78.6 MPa
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2: Model Preparation */}
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <Box className="h-4 w-4 text-blue-600" />
                          2. Model Preparation & Mesh Quality
                        </CardTitle>
                        <CardDescription>
                          CAD model, material library, and element meshing
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-600 text-white font-mono">
                        {record.modelPrepConfig.meshQuality}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <span className="text-muted-foreground block text-[11px]">
                            CAD Geometry Model
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono truncate block">
                            {record.modelPrepConfig.cadModel}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <span className="text-muted-foreground block text-[11px]">
                            Material Assigned
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                            {record.modelPrepConfig.materialLibrary}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <span className="text-muted-foreground block text-[11px]">
                            Mesh Strategy
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {record.modelPrepConfig.meshStrategy}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <span className="text-muted-foreground block text-[11px]">
                            Total Mesh Elements
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {record.modelPrepConfig.totalElements}
                          </span>
                        </div>
                      </div>

                      {/* Mesh Preview Diagram */}
                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1 text-center">
                        <span className="text-[10px] text-muted-foreground block">
                          Tetrahedral Mesh Visualization Preview
                        </span>
                        <div className="h-14 w-full rounded border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 font-mono text-[11px]">
                          [ 1,245,876 Tetrahedral FEA Nodes Verified ]
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2 & 3: BOUNDARY CONDITIONS & CONFIGURATION */}
            {(activeTab === "overview" || activeTab === "boundary_conditions" || activeTab === "configuration") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 3: Boundary Conditions */}
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Compass className="h-4 w-4 text-blue-600" />
                        3. Boundary Conditions & Constraints
                      </CardTitle>
                      <CardDescription>
                        Fixed supports, ambient temperature, heat flux
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-mono">
                      Score: {record.boundaryConditionsConfig.boundaryConditionScore}/100
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <span className="text-muted-foreground block text-[11px]">
                          Load Conditions
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {record.boundaryConditionsConfig.loadConditions.map((lc, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {lc}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <span className="text-muted-foreground block text-[11px]">
                          Constraints
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {record.boundaryConditionsConfig.constraints}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <span className="text-muted-foreground block text-[11px]">
                          Environmental Conditions
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {record.boundaryConditionsConfig.environmentalConditions}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <span className="text-muted-foreground block text-[11px]">
                          Operating Scenario
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono truncate block">
                          {record.boundaryConditionsConfig.operatingScenario}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 4: Simulation Configuration */}
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-600" />
                        4. Simulation Configuration & Solver Setup
                      </CardTitle>
                      <CardDescription>
                        ANSYS Mechanical 2024 R1 HPC cluster setup
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-600 text-white font-mono">
                      Config: {record.configurationConfig.configurationScore}/100
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <span className="text-muted-foreground block text-[11px]">
                          Solver Type & Version
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {record.configurationConfig.solverType} ({record.configurationConfig.solverVersion})
                        </span>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <span className="text-muted-foreground block text-[11px]">
                          Time Step / Convergence
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {record.configurationConfig.timeStep} • {record.configurationConfig.convergenceCriteria}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 col-span-2">
                        <span className="text-muted-foreground block text-[11px]">
                          Computing Platform
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {record.configurationConfig.computingPlatform}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB CONTENT 4: ENGINEERING ANALYSIS */}
            {(activeTab === "overview" || activeTab === "analysis") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      5. Engineering Analysis Categories
                    </CardTitle>
                    <CardDescription>
                      Multi-physics solver domain status
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-mono">
                    Score: {record.analysisCategoriesConfig.analysisCompletionScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {[
                        { domain: "Structural Analysis (FEA)", status: record.analysisCategoriesConfig.structuralAnalysisStatus },
                        { domain: "Thermal Analysis (Transient)", status: record.analysisCategoriesConfig.thermalAnalysisStatus },
                        { domain: "CFD Fluid Dynamics", status: record.analysisCategoriesConfig.cfdAnalysisStatus },
                        { domain: "Electromagnetic Analysis", status: record.analysisCategoriesConfig.electromagneticAnalysisStatus },
                        { domain: "Dynamic & Modal Analysis", status: record.analysisCategoriesConfig.dynamicAnalysisStatus },
                        { domain: "Multi-Physics Coupled Analysis", status: record.analysisCategoriesConfig.multiPhysicsAnalysisStatus },
                      ].map((item, i) => (
                        <div key={i} className="px-4 py-2.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {item.domain}
                          </span>
                          <Badge
                            className={
                              item.status === "Completed"
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-400 text-white"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 5: RESULTS & VALIDATION */}
            {(activeTab === "overview" || activeTab === "results_validation") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Flame className="h-4 w-4 text-blue-600" />
                      6. Results & Prototype Validation
                    </CardTitle>
                    <CardDescription>
                      Von-Mises stress, temperature distribution, and physical correlation
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-mono">
                    Validation: {record.resultsConfig.validationScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Max Von-Mises Stress
                      </span>
                      <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                        {record.resultsConfig.maxStressVonMises}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Max Temperature
                      </span>
                      <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {record.resultsConfig.maxTemperature}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Max Displacement
                      </span>
                      <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {record.resultsConfig.maxDisplacement}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Prototype Correlation
                      </span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {record.resultsConfig.correlationWithPrototype}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 6: OPTIMIZATION */}
            {(activeTab === "overview" || activeTab === "optimization") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      7. Design & Topology Optimization Study
                    </CardTitle>
                    <CardDescription>
                      Weight reduction, thermal dissipation, and iteration graph
                    </CardDescription>
                  </div>
                  <Badge className="bg-purple-600 text-white font-mono">
                    Opt Score: {record.optimizationConfig.optimizationScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Weight Reduction
                      </span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        -{record.optimizationConfig.weightReductionPct}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Performance Impr.
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
                        +{record.optimizationConfig.performanceImprovementPct}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Cost Optimization
                      </span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono">
                        -{record.optimizationConfig.costOptimizationPct}%
                      </span>
                    </div>
                  </div>

                  {/* Optimization Convergence Recharts Graph */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      Optimization Iteration Curve (Weight vs Max Temp)
                    </span>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReLineChart data={record.optimizationConfig.iterationsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="iteration" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="weightKg"
                            name="Weight (kg)"
                            stroke="#2563eb"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="maxTempC"
                            name="Max Temp (°C)"
                            stroke="#10b981"
                            strokeWidth={2}
                          />
                        </ReLineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 7: AI ASSESSMENT */}
            {(activeTab === "overview" || activeTab === "ai_assessment") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      8. AI Engineering Assessment & Advisory
                    </CardTitle>
                    <CardDescription>
                      AI structural validation, failure prediction, and thermal insights
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-600 text-white font-mono">
                    AI Score: {record.aiAssessment.aiEngineeringScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                    <span className="font-bold text-blue-900 dark:text-blue-200 block">
                      AI Simulation Copilot Insight
                    </span>
                    <p className="text-blue-800 dark:text-blue-300">
                      {record.aiAssessment.aiSimulationReview} {record.aiAssessment.aiPerformancePrediction}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 8: SUMMARY */}
            {(activeTab === "overview" || activeTab === "summary") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    9. Simulation Summary & Executive Recommendation
                  </CardTitle>
                  <CardDescription>
                    Consolidated scores across all CAE simulation domains
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Model Readiness
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {record.readinessSummary.modelReadiness}/100
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Simulation Accuracy
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {record.readinessSummary.simulationAccuracy}/100
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Validation Score
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {record.readinessSummary.validationScore}/100
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Optimization Score
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {record.readinessSummary.optimizationScore}/100
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 9: ATTACHMENTS */}
            {(activeTab === "overview" || activeTab === "attachments") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      10. Engineering Simulation Attachments
                    </CardTitle>
                    <CardDescription>
                      CAD STEP models, mesh reports, and ANSYS H5 solver outputs
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsUploadOpen(true)}
                    className="gap-1 text-xs"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload File
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {record.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileCode className="h-5 w-5 text-blue-500 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 dark:text-white block truncate">
                              {att.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {att.size} • {att.uploadedBy}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSelectedAttachment(att)}
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Download className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 10: REVIEW & APPROVAL */}
            {(activeTab === "overview" || activeTab === "review_approval") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-blue-600" />
                    11. Review & Approval Board Timeline
                  </CardTitle>
                  <CardDescription>
                    Multi-stage engineering approval committee
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  {/* Reviewers Table */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-muted-foreground font-semibold">
                          <th className="p-3">Role</th>
                          <th className="p-3">Reviewer</th>
                          <th className="p-3">Decision</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Comments</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {record.reviewers.map((rev, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <td className="p-3 font-semibold text-slate-900 dark:text-white">
                              {rev.role}
                            </td>
                            <td className="p-3 flex items-center gap-2">
                              <img
                                src={rev.avatar}
                                alt={rev.person}
                                className="h-5 w-5 rounded-full object-cover"
                              />
                              <span className="font-medium">{rev.person}</span>
                            </td>
                            <td className="p-3">
                              <Badge
                                className={
                                  rev.decision === "Approved"
                                    ? "bg-emerald-600 text-white"
                                    : rev.decision === "Approved with Conditions"
                                    ? "bg-amber-500 text-white"
                                    : "bg-slate-400 text-white"
                                }
                              >
                                {rev.decision}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">{rev.date}</td>
                            <td className="p-3 text-slate-700 dark:text-slate-300">
                              {rev.comments}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Decision Form Block */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Submit Review Decision
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-muted-foreground block mb-1">
                          Approval Decision
                        </label>
                        <select
                          value={reviewDecision}
                          onChange={(e) =>
                            setReviewDecision(e.target.value as SimulationApprovalDecision)
                          }
                          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-xs font-medium"
                        >
                          <option value="Approved">Approved</option>
                          <option value="Approved with Conditions">
                            Approved with Conditions
                          </option>
                          <option value="Revision Required">Revision Required</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-muted-foreground block mb-1">
                          Review Comments
                        </label>
                        <Textarea
                          value={reviewCommentInput}
                          onChange={(e) => setReviewCommentInput(e.target.value)}
                          placeholder="Add engineering remarks..."
                          className="h-20 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() =>
                          reviewDecisionMutation.mutate({
                            id: record.id,
                            decision: reviewDecision,
                            comments: reviewCommentInput,
                          })
                        }
                        disabled={reviewDecisionMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Save Decision
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT SIDEBAR (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overall Score Radial Widget */}
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-sm font-semibold">Overall Simulation Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="h-28 w-28 rounded-full border-6 border-blue-600 flex items-center justify-center bg-blue-50/30 dark:bg-blue-950/30">
                    <div>
                      <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {record.overallSimulationScore}
                      </span>
                      <span className="text-[10px] block font-semibold text-muted-foreground">
                        / 100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-left pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Model Readiness</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {record.modelReadinessScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Simulation Accuracy</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {record.configurationScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Validation Score</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {record.validationScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Optimization Score</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {record.optimizationScore}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Highlights */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Key Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                {[
                  "Mesh quality is excellent (0.92)",
                  "Max temperature within safe limit (78.4 °C)",
                  "Structural stress within allowable range",
                  "Weight optimized by 8.7%",
                  "All critical results validated",
                ].map((hl, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {hl}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs font-medium"
                  onClick={() => setIsRunSolverOpen(true)}
                >
                  <Play className="h-3.5 w-3.5 text-blue-600" />
                  Run Simulation
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs font-medium"
                  onClick={() => setActiveTab("results_validation")}
                >
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
                  View Results
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs font-medium"
                  onClick={() => setIsCompareScenariosOpen(true)}
                >
                  <Sliders className="h-3.5 w-3.5 text-purple-600" />
                  Compare Scenarios
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs font-medium"
                  onClick={() => setIsDigitalTwinSyncOpen(true)}
                >
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                  Create Digital Twin
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* =========================================================================
            3. INTERACTIVE DIALOGS & MODALS
            ========================================================================= */}

        {/* Live Solver Modal */}
        <Dialog open={isRunSolverOpen} onOpenChange={setIsRunSolverOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                Live ANSYS FEA/CFD Solver Console
              </DialogTitle>
              <DialogDescription>
                High-Performance Computing Cluster (GPU Acceleration)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>Iteration Progress ({solveProgress}%)</span>
                  <span className="font-mono text-blue-600">{solveProgress}%</span>
                </div>
                <Progress value={solveProgress} className="h-2" />
              </div>

              <div className="h-40 rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-1">
                {solverLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                size="sm"
                onClick={handleStartSolver}
                disabled={isSolving}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              >
                <Play className="h-4 w-4" />
                {isSolving ? "Solving FEA..." : "Start FEA Solver"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Compare Scenarios Modal */}
        <Dialog open={isCompareScenariosOpen} onOpenChange={setIsCompareScenariosOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-purple-600" />
                Compare FEA Scenarios
              </DialogTitle>
              <DialogDescription>
                Compare Baseline vs Optimized Aluminum 6061 Housing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Optimized Scenario
                </span>
                <span className="text-emerald-600 font-mono font-bold">
                  Weight: -8.7% • Max Temp: 78.4 °C (Safe Limit &lt; 85 °C)
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" onClick={() => setIsCompareScenariosOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Digital Twin Modal */}
        <Dialog open={isDigitalTwinSyncOpen} onOpenChange={setIsDigitalTwinSyncOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" />
                Digital Twin Sync & Telemetry Link
              </DialogTitle>
              <DialogDescription>
                Sync FEA results with Azure Digital Twins instance
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs space-y-1">
              <div>[SYNC] Digital Twin Status: Synced</div>
              <div>[TIME] Last Updated: {record.digitalTwinLastUpdated}</div>
            </div>
            <DialogFooter>
              <Button
                size="sm"
                onClick={() => {
                  setIsDigitalTwinSyncOpen(false);
                  toast.success("Digital Twin synced with physical prototype telemetry!");
                }}
              >
                Sync Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Attachment Preview Modal */}
        <Dialog
          open={!!selectedAttachment}
          onOpenChange={(open) => !open && setSelectedAttachment(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                {selectedAttachment?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedAttachment?.type} File • {selectedAttachment?.size}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs h-40 flex items-center justify-center">
              [Previewing file content for {selectedAttachment?.name}]
            </div>
            <DialogFooter>
              <Button size="sm" onClick={() => setSelectedAttachment(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Modal */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Simulation Attachment</DialogTitle>
              <DialogDescription>
                Upload CAD STEP models, mesh reports, or ANSYS H5 solver outputs
              </DialogDescription>
            </DialogHeader>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Drag and drop files here or click to browse
              </span>
            </div>
            <DialogFooter>
              <Button
                size="sm"
                onClick={() => {
                  setIsUploadOpen(false);
                  toast.success("File uploaded successfully!");
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </AppShell>
  );
}
