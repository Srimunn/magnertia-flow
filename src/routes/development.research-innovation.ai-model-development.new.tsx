import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Brain,
  Cpu,
  Database,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Gauge,
  Layers,
  ShieldCheck,
  Terminal,
  Cloud,
  Play,
  RefreshCw,
  FileText,
  Download,
  Upload,
  Eye,
  Save,
  Send,
  MoreHorizontal,
  ExternalLink,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Calendar,
  Building2,
  Clock,
  Workflow,
  User,
  Copy,
  Plus,
  FileCode,
  FileSpreadsheet,
  HardDrive,
  Lock,
  Target,
  Zap,
  BarChart3,
  PieChart,
  HelpCircle,
  Check,
  X,
  ArrowUpRight,
  ChevronDown,
  Filter,
  ShieldAlert,
  Sparkle,
  Radio,
  FileCheck,
  Share2,
  Printer,
  History,
  Info,
  Grid3x3,
  Maximize2,
  FolderDown,
  LineChart,
} from "lucide-react";

import { aiModelDevelopmentService } from "@/services/aiModelDevelopmentService";
import type {
  AiModelRecord,
  AiModelFormInput,
  AiModelApprovalDecision,
  AiAttachment,
  AiReviewer,
  AiAuditEntry,
} from "@/services/types";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import {
  AiModelDevelopmentTabBar,
  AI_MODEL_TABS,
  type AiModelDevelopmentTabId,
} from "@/components/erp/AiModelDevelopmentTabBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AppShell } from "@/components/erp/AppShell";

export const Route = createFileRoute(
  "/development/research-innovation/ai-model-development/new",
)({
  head: () => ({
    meta: [{ title: "AI Model Development Form · Magnertia ERP" }],
  }),
  component: AiModelDevelopmentNewPage,
});

export function AiModelDevelopmentNewPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Tab State & Interactive Controls
  const [activeTab, setActiveTab] = useState<AiModelDevelopmentTabId>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<AiAttachment | null>(null);

  // Modals & Dialog States
  const [isRetrainModalOpen, setIsRetrainModalOpen] = useState(false);
  const [isInferenceModalOpen, setIsInferenceModalOpen] = useState(false);
  const [isBiasModalOpen, setIsBiasModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Retrain State Simulation
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainEpoch, setRetrainEpoch] = useState(0);
  const [retrainLogs, setRetrainLogs] = useState<string[]>([]);

  // Inference Simulator State
  const [inferencePayload, setInferencePayload] = useState<string>(
    JSON.stringify(
      {
        station_id: "EV-STATION-402",
        hour_of_day: 18,
        day_of_week: "Friday",
        temperature_celsius: 28.5,
        is_holiday: 0,
        historical_kwh_usage: 142.8,
        charger_type: "DC_FAST_150KW",
      },
      null,
      2,
    ),
  );
  const [inferenceResult, setInferenceResult] = useState<{
    status: string;
    predicted_demand_kwh: number;
    confidence_score: number;
    latency_ms: number;
    shap_top_feature: string;
  } | null>(null);
  const [isInferring, setIsInferring] = useState(false);

  // Review & Approval State
  const [reviewDecision, setReviewDecision] =
    useState<AiModelApprovalDecision>("Approved with Conditions");
  const [reviewCommentInput, setReviewCommentInput] = useState(
    "Overall model is good. Please improve explainability and add more test cases.",
  );

  // Data Fetching via React Query
  const { data: record, isLoading } = useQuery<AiModelRecord>({
    queryKey: ["aiModelDevelopmentRecord"],
    queryFn: () => aiModelDevelopmentService.fetchRecord(),
  });

  // Draft Save & Submit Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<AiModelFormInput>) =>
      aiModelDevelopmentService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["aiModelDevelopmentRecord"], updated);
      toast.success("Draft saved successfully!", {
        description: "All AI model configurations updated.",
      });
    },
  });

  const submitForReviewMutation = useMutation({
    mutationFn: () => aiModelDevelopmentService.submitForReview(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["aiModelDevelopmentRecord"], updated);
      toast.success("Submitted for AI Review!", {
        description: "Project moved to 'In Review' workflow stage.",
      });
    },
  });

  const reviewDecisionMutation = useMutation({
    mutationFn: (args: {
      id: string;
      decision: AiModelApprovalDecision;
      comments?: string;
    }) => aiModelDevelopmentService.reviewDecision(args),
    onSuccess: (updated) => {
      queryClient.setQueryData(["aiModelDevelopmentRecord"], updated);
      toast.success(`Review status updated to '${reviewDecision}'`, {
        description: "Audit trail log generated.",
      });
    },
  });

  // Shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Retrain Action Handler
  const handleStartRetrain = () => {
    setIsRetraining(true);
    setRetrainEpoch(0);
    setRetrainLogs([
      "Initializing XGBoost GPU environment (NVIDIA A100 80GB)...",
      "Loading EV_Usage_Historical dataset (2.4 TB Parquet)...",
    ]);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setRetrainEpoch(current);
      setRetrainLogs((prev) => [
        ...prev,
        `Epoch ${current}/200 - train_loss: ${(0.85 * (1 - current / 220)).toFixed(4)} - val_loss: ${(0.92 * (1 - current / 210)).toFixed(4)}`,
      ]);

      if (current >= 200) {
        clearInterval(interval);
        setIsRetraining(false);
        setRetrainLogs((prev) => [
          ...prev,
          "Training finished successfully! Validation accuracy: 93.1%. Model checkpoint saved to MLflow Registry.",
        ]);
        toast.success("Model retraining completed!", {
          description: "Model score updated to 93/100.",
        });
      }
    }, 400);
  };

  // Inference Execution Simulation
  const handleExecuteInference = () => {
    setIsInferring(true);
    setTimeout(() => {
      setIsInferring(false);
      setInferenceResult({
        status: "200 OK",
        predicted_demand_kwh: 168.4,
        confidence_score: 0.952,
        latency_ms: 13.8,
        shap_top_feature: "historical_kwh_usage (+34.2 kW)",
      });
      toast.success("Inference endpoint response received!", {
        description: "Latency: 13.8ms | Status: 200 OK",
      });
    }, 600);
  };

  if (isLoading || !record) {
    return (
      <AppShell
        title="AI Model Development"
        breadcrumb={breadcrumb}
        tabs={tabs}
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
      title="AI Model Development"
      breadcrumb={breadcrumb}
      description="Train neural network architectures, LLM fine-tuning, MLflow model registries, and ONNX deployment."
      tabs={tabs}
    >
      <div className="space-y-6 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              {record.aiProjectName}
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-mono text-xs"
            >
              {record.modelVersion}
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
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setIsRetrainModalOpen(true)}>
                    <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                    Trigger Model Retraining
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsInferenceModalOpen(true)}>
                    <Terminal className="h-4 w-4 mr-2 text-purple-500" />
                    Test Inference Endpoint
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsBiasModalOpen(true)}>
                    <ShieldCheck className="h-4 w-4 mr-2 text-amber-500" />
                    Run Responsible AI Audit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Specification
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

          {/* Key Reference Badges Row */}
          <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="flex flex-col">
              <span className="text-muted-foreground">AI Model ID</span>
              <span className="font-mono font-semibold text-foreground">
                {record.aiModelDevelopmentId}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Form Code</span>
              <span className="font-mono font-semibold text-foreground">
                {record.formCode}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Linked Product</span>
              <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 cursor-pointer">
                {record.linkedProductId}
                <ExternalLink className="h-3 w-3" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Linked Cloud Platform</span>
              <span className="font-medium text-foreground">
                {record.linkedCloudPlatformId}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">AI Lead Engineer</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <img
                  src={record.aiLeadEngineerAvatar}
                  alt={record.aiLeadEngineerName}
                  className="h-4 w-4 rounded-full object-cover"
                />
                {record.aiLeadEngineerName}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Created / Updated</span>
              <span className="font-medium text-foreground">{record.createdOn}</span>
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
                          {record.overallAiModelScore}
                        </span>
                        <span className="text-[10px] block text-muted-foreground font-semibold">
                          /100
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
                        Overall AI Model Score
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        Production Ready
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Validated across 5 AI lifecycle benchmarks
                      </div>
                    </div>
                  </div>

                  {/* Lifecycle Stages Bar */}
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>AI Model Development Lifecycle Progress</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        8 of 8 Stages Complete (100%)
                      </span>
                    </div>
                    <div className="grid grid-cols-8 gap-1.5">
                      {[
                        { label: "Data", score: record.datasetReadinessScore, color: "bg-emerald-500" },
                        { label: "Features", score: record.featureReadinessScore, color: "bg-emerald-500" },
                        { label: "Arch", score: record.modelDesignScore, color: "bg-blue-500" },
                        { label: "Train", score: record.trainingScore, color: "bg-blue-500" },
                        { label: "Eval", score: record.evaluationScore, color: "bg-indigo-500" },
                        { label: "Gov", score: record.governanceScore, color: "bg-purple-500" },
                        { label: "Deploy", score: record.deploymentReadinessScore, color: "bg-emerald-500" },
                        { label: "Assess", score: record.aiOverallScore, color: "bg-blue-600" },
                      ].map((stage, idx) => (
                        <div key={idx} className="space-y-1 text-center">
                          <div className={`h-2 rounded-full ${stage.color}`} />
                          <span className="text-[10px] block font-medium truncate text-slate-600 dark:text-slate-400">
                            {stage.label} ({stage.score})
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
                  {/* Card 1: AI Project Overview */}
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          1. AI Project Overview
                        </CardTitle>
                        <CardDescription>
                          Business context and problem formulation
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{record.businessUnit}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">
                          Business Objective
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-md border border-slate-200/60 dark:border-slate-800">
                          {record.businessObjective}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-muted-foreground block mb-1">
                            AI Use Case
                          </span>
                          <Badge variant="outline" className="font-medium">
                            {record.aiUseCase}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground block mb-1">
                            Target Users
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {record.targetUsers.map((u, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">
                                {u}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">
                          Problem Statement
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">
                          {record.problemStatement}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">
                          Expected Business Outcome
                        </span>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                          <TrendingUp className="h-4 w-4" />
                          {record.expectedBusinessOutcome}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2: Quick Project Statistics */}
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        Project Telemetry & Status
                      </CardTitle>
                      <CardDescription>
                        Execution metrics across infrastructure
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <span className="text-muted-foreground block text-[11px]">
                            Model Architecture
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            {record.architectureConfig.modelType}
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {record.architectureConfig.framework}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <span className="text-muted-foreground block text-[11px]">
                            Dataset Volume
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            {record.datasetConfig.datasetSize}
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {record.datasetConfig.dataFormat} Format
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <span className="text-muted-foreground block text-[11px]">
                            Evaluation Accuracy
                          </span>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {record.evaluationMetrics.accuracy}%
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            F1: {record.evaluationMetrics.f1Score}%
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <span className="text-muted-foreground block text-[11px]">
                            Deployment Endpoint
                          </span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono truncate block">
                            Kubernetes
                          </span>
                          <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
                            Live Active
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-semibold text-blue-900 dark:text-blue-200">
                          <span>AI Recommendation Engine</span>
                          <Badge className="bg-blue-600 text-white text-[10px]">
                            Verified
                          </Badge>
                        </div>
                        <p className="text-blue-800 dark:text-blue-300">
                          {record.readinessSummary.recommendation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: DATASET MANAGEMENT */}
            {(activeTab === "overview" || activeTab === "dataset") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      2. Dataset Management & Data Quality
                    </CardTitle>
                    <CardDescription>
                      Data ingestion, lineage, quality scoring, and splits
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {record.datasetConfig.datasetName}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsUploadOpen(true)}
                      className="gap-1 text-xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload Dataset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quality Metrics Row */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 flex items-center gap-4">
                      <div className="relative flex items-center justify-center h-14 w-14 rounded-full border-3 border-blue-600 bg-white dark:bg-slate-900">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {record.datasetConfig.dataQualityScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Dataset Quality Score
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {record.datasetConfig.datasetSize} • {record.datasetConfig.dataFormat}
                        </span>
                      </div>
                    </div>

                    {[
                      { label: "Completeness", val: record.datasetConfig.completeness },
                      { label: "Consistency", val: record.datasetConfig.consistency },
                      { label: "Accuracy", val: record.datasetConfig.accuracy },
                      { label: "Timeliness", val: record.datasetConfig.timeliness },
                    ].map((metric, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1"
                      >
                        <span className="text-[11px] text-muted-foreground block font-medium">
                          {metric.label}
                        </span>
                        <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                          {metric.val}%
                        </span>
                        <Progress value={metric.val} className="h-1.5" />
                      </div>
                    ))}
                  </div>

                  {/* Dataset Partitioning Table */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                    <div className="bg-slate-100/70 dark:bg-slate-900 px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <span>Dataset Partitioning & Splitting</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        Ratio: 70% Train / 15% Val / 15% Test
                      </span>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {[
                        {
                          type: "Training Dataset",
                          file: record.datasetConfig.trainDataset,
                          size: "1.68 TB",
                          records: "48,500,000 rows",
                          status: "Verified",
                        },
                        {
                          type: "Validation Dataset",
                          file: record.datasetConfig.valDataset,
                          size: "360 GB",
                          records: "10,200,000 rows",
                          status: "Verified",
                        },
                        {
                          type: "Test Dataset",
                          file: record.datasetConfig.testDataset,
                          size: "360 GB",
                          records: "10,200,000 rows",
                          status: "Holdout Protected",
                        },
                      ].map((partition, i) => (
                        <div
                          key={i}
                          className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        >
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                                {partition.type}
                              </span>
                              <span className="font-mono text-muted-foreground text-[11px]">
                                {partition.file}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                            <span>{partition.size}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{partition.records}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {partition.status}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Download className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 3: FEATURE ENGINEERING */}
            {(activeTab === "overview" || activeTab === "features") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      3. Feature Engineering & Feature Store
                    </CardTitle>
                    <CardDescription>
                      Selection, scaling, imputation, and importance analysis
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-600 text-white">
                    Score: {record.featureConfig.featureReadinessScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Selection Method
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {record.featureConfig.selectionMethod}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Feature Scaling
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {record.featureConfig.scaling}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Missing Value Strategy
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {record.featureConfig.missingValueStrategy}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Preprocessing Pipeline
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate block">
                        {record.featureConfig.preprocessing}
                      </span>
                    </div>
                  </div>

                  {/* Feature Importance Rankings Chart */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      Feature Importance Rankings (SHAP Feature Attribution)
                    </h4>

                    <div className="space-y-2 text-xs">
                      {[
                        { name: "historical_kwh_usage", score: 0.38, type: "Numeric", status: "High Impact" },
                        { name: "hour_of_day", score: 0.24, type: "Categorical", status: "Medium Impact" },
                        { name: "temperature_celsius", score: 0.16, type: "Numeric", status: "Medium Impact" },
                        { name: "is_holiday", score: 0.12, type: "Binary", status: "Low Impact" },
                        { name: "charger_type_kw", score: 0.10, type: "Categorical", status: "Low Impact" },
                      ].map((feat, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                        >
                          <span className="w-36 font-mono font-medium text-slate-900 dark:text-white truncate">
                            {feat.name}
                          </span>
                          <div className="flex-1 space-y-1">
                            <Progress value={feat.score * 100} className="h-2" />
                          </div>
                          <span className="w-12 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            {(feat.score * 100).toFixed(0)}%
                          </span>
                          <Badge variant="outline" className="text-[10px] w-24 justify-center">
                            {feat.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 4: MODEL ARCHITECTURE */}
            {(activeTab === "overview" || activeTab === "architecture") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-blue-600" />
                      4. Model Architecture & Network Topology
                    </CardTitle>
                    <CardDescription>
                      Framework specifications, hyperparameter grid, and model design
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    Score: {record.architectureConfig.modelDesignScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        AI Category
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {record.architectureConfig.aiCategory}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Model Type
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {record.architectureConfig.modelType}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Framework
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {record.architectureConfig.framework}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Language
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {record.architectureConfig.language}
                      </span>
                    </div>
                  </div>

                  {/* Hyperparameter Configuration Box */}
                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block tracking-wider">
                      // Hyperparameters & Model Config
                    </span>
                    <p className="text-emerald-400">{record.architectureConfig.hyperparameters}</p>
                  </div>

                  {/* Interactive Network Diagram Visual */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 dark:from-slate-900 dark:via-blue-950/10 dark:to-slate-900 space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span>Model Architecture Graph (Gradient Boosted Trees Network)</span>
                      <Badge variant="outline" className="text-[10px]">
                        Visual Topology
                      </Badge>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                      {/* Inputs */}
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center w-full md:w-36 space-y-1">
                        <Database className="h-5 w-5 text-blue-600 mx-auto" />
                        <span className="font-bold text-slate-900 dark:text-white block">
                          Input Layer
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          18 Features
                        </span>
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-400 hidden md:block" />

                      {/* Tree Ensemble */}
                      <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center w-full md:w-44 space-y-1">
                        <Cpu className="h-5 w-5 text-indigo-600 mx-auto" />
                        <span className="font-bold text-slate-900 dark:text-white block">
                          XGBoost Estimators
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          500 Trees (Depth 8)
                        </span>
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-400 hidden md:block" />

                      {/* Loss Optimization */}
                      <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center w-full md:w-40 space-y-1">
                        <Target className="h-5 w-5 text-purple-600 mx-auto" />
                        <span className="font-bold text-slate-900 dark:text-white block">
                          Loss Objective
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          RMSE Minimization
                        </span>
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-400 hidden md:block" />

                      {/* Prediction */}
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center w-full md:w-36 space-y-1">
                        <Sparkles className="h-5 w-5 text-emerald-600 mx-auto" />
                        <span className="font-bold text-slate-900 dark:text-white block">
                          Inference Output
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Demand (kWh)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 5: MODEL TRAINING */}
            {(activeTab === "overview" || activeTab === "training") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      5. Model Training & GPU Optimization
                    </CardTitle>
                    <CardDescription>
                      Hyperparameter optimization, loss convergence, and training hardware
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 text-white">
                      Status: {record.trainingMetrics.trainingStatus}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => setIsRetrainModalOpen(true)}
                      className="bg-blue-600 text-white gap-1 text-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retrain Model
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Strategy
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate block">
                        {record.trainingMetrics.strategy}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Optimizer
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">
                        {record.trainingMetrics.optimizer}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Loss Function
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">
                        {record.trainingMetrics.lossFunction}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Batch Size / Epochs
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">
                        {record.trainingMetrics.batchSize} / {record.trainingMetrics.epochs}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 col-span-2">
                      <span className="text-muted-foreground block text-[11px]">
                        Hardware & GPU
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                        {record.trainingMetrics.gpuUtilization}
                      </span>
                    </div>
                  </div>

                  {/* Learning Curve Chart Visual */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <LineChart className="h-4 w-4 text-blue-600" />
                        Learning & Convergence Curve (Train Loss vs Validation Loss)
                      </span>
                      <div className="flex items-center gap-4 text-[11px] font-medium">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          Train Loss
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          Val Loss
                        </span>
                      </div>
                    </div>

                    {/* SVG Loss Curve Chart */}
                    <div className="h-44 w-full bg-slate-50/50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800 p-3 flex flex-col justify-between">
                      <div className="h-32 w-full relative">
                        <svg className="h-full w-full overflow-visible" viewBox="0 0 500 120">
                          {/* Grid lines */}
                          <line x1="0" y1="20" x2="500" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                          <line x1="0" y1="60" x2="500" y2="60" stroke="#e2e8f0" strokeDasharray="3 3" />
                          <line x1="0" y1="100" x2="500" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />

                          {/* Train Loss Polyline (Blue) */}
                          <polyline
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3"
                            points="0,105 100,55 200,32 350,22 500,14"
                          />

                          {/* Val Loss Polyline (Amber) */}
                          <polyline
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="3"
                            points="0,115 100,68 200,44 350,31 500,24"
                          />

                          {/* Points */}
                          {[
                            { x: 0, trainY: 105, valY: 115 },
                            { x: 100, trainY: 55, valY: 68 },
                            { x: 200, trainY: 32, valY: 44 },
                            { x: 350, trainY: 22, valY: 31 },
                            { x: 500, trainY: 14, valY: 24 },
                          ].map((pt, i) => (
                            <g key={i}>
                              <circle cx={pt.x} cy={pt.trainY} r="4" fill="#2563eb" />
                              <circle cx={pt.x} cy={pt.valY} r="4" fill="#f59e0b" />
                            </g>
                          ))}
                        </svg>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono pt-1">
                        <span>Epoch 1 (Loss: 0.85)</span>
                        <span>Epoch 50 (Loss: 0.45)</span>
                        <span>Epoch 100 (Loss: 0.28)</span>
                        <span>Epoch 150 (Loss: 0.18)</span>
                        <span>Epoch 200 (Loss: 0.12)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 6: MODEL EVALUATION */}
            {(activeTab === "overview" || activeTab === "evaluation") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-blue-600" />
                      6. Model Evaluation & Confusion Matrix
                    </CardTitle>
                    <CardDescription>
                      Performance benchmarks, accuracy metrics, and confusion grid
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-600 text-white font-mono">
                    Evaluation Score: {record.evaluationMetrics.evaluationScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Evaluation Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Accuracy
                      </span>
                      <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                        {record.evaluationMetrics.accuracy}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Precision
                      </span>
                      <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        {record.evaluationMetrics.precision}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Recall
                      </span>
                      <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                        {record.evaluationMetrics.recall}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        F1 Score
                      </span>
                      <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                        {record.evaluationMetrics.f1Score}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 col-span-2 sm:col-span-1">
                      <span className="text-muted-foreground block text-[11px]">
                        ROC AUC
                      </span>
                      <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                        {record.evaluationMetrics.rocAuc}
                      </span>
                    </div>
                  </div>

                  {/* Confusion Matrix Heatmap Component */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Grid3x3 className="h-4 w-4 text-blue-600" />
                      Confusion Matrix (Actual vs Predicted EV Demand Classes)
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center border-collapse text-xs">
                        <thead>
                          <tr>
                            <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-muted-foreground">
                              Actual \ Predicted
                            </th>
                            <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-200">
                              Low Demand
                            </th>
                            <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-200">
                              Med Demand
                            </th>
                            <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-200">
                              High Demand
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              label: "Low Demand",
                              vals: record.evaluationMetrics.confusionMatrix[0],
                            },
                            {
                              label: "Med Demand",
                              vals: record.evaluationMetrics.confusionMatrix[1],
                            },
                            {
                              label: "High Demand",
                              vals: record.evaluationMetrics.confusionMatrix[2],
                            },
                          ].map((row, rIdx) => (
                            <tr key={rIdx}>
                              <td className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-200 text-left">
                                {row.label}
                              </td>
                              {row.vals.map((val, cIdx) => {
                                const isDiagonal = rIdx === cIdx;
                                return (
                                  <td
                                    key={cIdx}
                                    className={`p-3 border border-slate-200 dark:border-slate-800 font-mono font-bold ${
                                      isDiagonal
                                        ? "bg-blue-600/15 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300"
                                        : "bg-red-500/5 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                                    }`}
                                  >
                                    {val}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 7: GOVERNANCE & RESPONSIBLE AI */}
            {(activeTab === "overview" || activeTab === "governance") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      7. AI Governance & Responsible AI Checklist
                    </CardTitle>
                    <CardDescription>
                      Explainability, bias assessments, privacy compliance, and ethics
                    </CardDescription>
                  </div>
                  <Badge className="bg-purple-600 text-white font-mono">
                    Governance Score: {record.governancePolicy.governanceScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Explainability Method
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {record.governancePolicy.explainabilityMethod}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Bias Detection Result
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {record.governancePolicy.biasDetection}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Privacy & Compliance Standard
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {record.governancePolicy.privacyCompliance} Compliant
                      </span>
                    </div>
                  </div>

                  {/* Responsible AI Compliance Checklist */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-slate-100/70 dark:bg-slate-900 px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <span>Enterprise Responsible AI Audit Checklist</span>
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        8/8 Verified
                      </Badge>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {[
                        { title: "Fairness Assessment", detail: record.governancePolicy.fairnessAssessment, status: "Passed" },
                        { title: "Ethical Review Board Clearance", detail: "Review completed on 20 Jun 2024 by AI Ethics Committee.", status: "Passed" },
                        { title: "Risk Classification Level", detail: `Assigned Risk Level: ${record.governancePolicy.riskClassification}`, status: "Medium Risk" },
                        { title: "Data Anonymization & PII Protection", detail: "All personal user identifiers scrubbed prior to feature engineering.", status: "Passed" },
                      ].map((item, i) => (
                        <div key={i} className="px-4 py-3 flex justify-between items-center">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {item.title}
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              {item.detail}
                            </span>
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 8: DEPLOYMENT & MLOPS */}
            {(activeTab === "overview" || activeTab === "deployment") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-blue-600" />
                      8. Deployment & MLOps Infrastructure
                    </CardTitle>
                    <CardDescription>
                      Container registry, CI/CD pipeline, and inference endpoint
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 text-white">
                      {record.mlopsDeployment.deploymentStatus}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsInferenceModalOpen(true)}
                      className="gap-1 text-xs"
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      Test Endpoint
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Deployment Platform
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {record.mlopsDeployment.platform}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Containerization
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {record.mlopsDeployment.containerization}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        Model Registry
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {record.mlopsDeployment.registry}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-muted-foreground block text-[11px]">
                        CI/CD Pipeline
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {record.mlopsDeployment.cicdPipeline}
                      </span>
                    </div>
                  </div>

                  {/* Inference Endpoint Box */}
                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                        Production Inference Endpoint URL (REST API)
                      </span>
                      <span className="font-mono text-xs text-emerald-400 block break-all">
                        {record.mlopsDeployment.inferenceEndpoint}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(record.mlopsDeployment.inferenceEndpoint);
                        toast.success("Inference URL copied!");
                      }}
                      className="gap-1 shrink-0 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy URL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 9: AI ASSESSMENT */}
            {(activeTab === "overview" || activeTab === "ai_assessment") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      9. AI Model Assessment & Drift Diagnostics
                    </CardTitle>
                    <CardDescription>
                      Robustness, drift forecasting, security posture, and explainability score
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-600 text-white font-mono">
                    Assessment: {record.aiAssessment.aiOverallScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Robustness Analysis
                      </span>
                      <p className="text-muted-foreground">
                        {record.aiAssessment.aiRobustnessReview}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Model Drift Prediction
                      </span>
                      <p className="text-muted-foreground">
                        {record.aiAssessment.aiDriftPrediction}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Security & Vulnerability Audit
                      </span>
                      <p className="text-muted-foreground">
                        {record.aiAssessment.aiSecurityReview}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Optimization Suggestions
                      </span>
                      <p className="text-blue-600 dark:text-blue-400">
                        {record.aiAssessment.aiOptimizationSuggestions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 10: SUMMARY */}
            {(activeTab === "overview" || activeTab === "summary") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    10. AI Model Readiness Summary
                  </CardTitle>
                  <CardDescription>
                    Consolidated score across all evaluation dimensions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Dataset Readiness
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {record.readinessSummary.datasetReadiness}/100
                      </span>
                    </div>

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
                        Deployment Readiness
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {record.readinessSummary.deploymentReadiness}/100
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-muted-foreground block text-[11px]">
                        Governance Readiness
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {record.readinessSummary.governanceReadiness}/100
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT 11: ATTACHMENTS */}
            {(activeTab === "overview" || activeTab === "attachments") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      11. Project Attachments & Model Cards
                    </CardTitle>
                    <CardDescription>
                      Documentation, logs, reports, and risk assessment files
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

            {/* TAB CONTENT 12: REVIEW & APPROVAL */}
            {(activeTab === "overview" || activeTab === "review_approval") && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-blue-600" />
                    12. Review & Approval Board Timeline
                  </CardTitle>
                  <CardDescription>
                    Multi-sign-off enterprise governance committee status
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
                            setReviewDecision(e.target.value as AiModelApprovalDecision)
                          }
                          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-xs font-medium"
                        >
                          <option value="Approved">Approved</option>
                          <option value="Approved with Conditions">
                            Approved with Conditions
                          </option>
                          <option value="Changes Requested">Changes Requested</option>
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
                          placeholder="Add approval or modification remarks..."
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
                <CardTitle className="text-sm font-semibold">Overall AI Model Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="h-28 w-28 rounded-full border-6 border-blue-600 flex items-center justify-center bg-blue-50/30 dark:bg-blue-950/30">
                    <div>
                      <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {record.overallAiModelScore}
                      </span>
                      <span className="text-[10px] block font-semibold text-muted-foreground">
                        / 100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-left pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dataset</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {record.datasetReadinessScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {record.modelDesignScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Deployment</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {record.deploymentReadinessScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Governance</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {record.governanceScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Performance</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {record.aiAssessment.aiPerformanceScore}
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
                  "High quality dataset with 87% score",
                  "Model performance exceeds benchmark",
                  "No major bias detected in audit",
                  "Model deployed successfully on K8s",
                  "AI governance review completed",
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
                  onClick={() => toast.info("Generating AI Model Executive PDF Report...")}
                >
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  Generate AI Model Report
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs font-medium"
                  onClick={() => setIsRetrainModalOpen(true)}
                >
                  <Activity className="h-3.5 w-3.5 text-indigo-600" />
                  View Training Dashboard
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs font-medium"
                  onClick={() => setIsBiasModalOpen(true)}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                  Run Bias Detection
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs font-medium"
                  onClick={() => setIsInferenceModalOpen(true)}
                >
                  <Terminal className="h-3.5 w-3.5 text-emerald-600" />
                  View Inference Endpoint
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* =========================================================================
            3. INTERACTIVE DIALOGS & MODALS
            ========================================================================= */}

        {/* Retrain Simulation Dialog */}
        <Dialog open={isRetrainModalOpen} onOpenChange={setIsRetrainModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                Live Model Retraining Console
              </DialogTitle>
              <DialogDescription>
                Execute model training job on GPU cluster with updated datasets
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>Epoch Progress ({retrainEpoch} / 200)</span>
                  <span className="font-mono text-blue-600">
                    {((retrainEpoch / 200) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={(retrainEpoch / 200) * 100} className="h-2" />
              </div>

              <div className="h-44 rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-1">
                {retrainLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                size="sm"
                onClick={handleStartRetrain}
                disabled={isRetraining}
                className="bg-blue-600 text-white gap-1.5"
              >
                <Play className="h-4 w-4" />
                {isRetraining ? "Training..." : "Start Retraining Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Inference Endpoint Tester Dialog */}
        <Dialog open={isInferenceModalOpen} onOpenChange={setIsInferenceModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-purple-600" />
                Inference REST API Simulator
              </DialogTitle>
              <DialogDescription>
                Send mock JSON request payload to live Kubernetes endpoint
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Request Body (JSON)
                </label>
                <Textarea
                  value={inferencePayload}
                  onChange={(e) => setInferencePayload(e.target.value)}
                  className="font-mono h-32 text-xs bg-slate-950 text-slate-100"
                />
              </div>

              {inferenceResult && (
                <div className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono space-y-1">
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Status: {inferenceResult.status}</span>
                    <span>Latency: {inferenceResult.latency_ms} ms</span>
                  </div>
                  <div>Predicted Demand: {inferenceResult.predicted_demand_kwh} kWh</div>
                  <div>Confidence: {(inferenceResult.confidence_score * 100).toFixed(1)}%</div>
                  <div className="text-blue-400">
                    Top SHAP Feature: {inferenceResult.shap_top_feature}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                size="sm"
                onClick={handleExecuteInference}
                disabled={isInferring}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
              >
                <Send className="h-4 w-4" />
                {isInferring ? "Sending..." : "Execute Inference Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Responsible AI / Bias Inspector Dialog */}
        <Dialog open={isBiasModalOpen} onOpenChange={setIsBiasModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                Responsible AI & Fairness Inspector
              </DialogTitle>
              <DialogDescription>
                Demographic parity and algorithmic fairness evaluation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold block text-slate-900 dark:text-white">
                  Demographic Parity Ratio
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-extrabold text-base">
                  0.982 (Satisfied &gt; 0.80 benchmark)
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold block text-slate-900 dark:text-white">
                  Disparate Impact Metric
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  No statistical disparity found across geographic charger regions.
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" onClick={() => setIsBiasModalOpen(false)}>
                Close Inspector
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
                {selectedAttachment?.type} Document • {selectedAttachment?.size}
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

        {/* File Upload Modal */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Dataset / Attachment</DialogTitle>
              <DialogDescription>
                Upload parquet, csv, pdf, or model weights file
              </DialogDescription>
            </DialogHeader>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Drag and drop files here or click to browse
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Supports .parquet, .csv, .pdf, .onnx up to 5 GB
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
