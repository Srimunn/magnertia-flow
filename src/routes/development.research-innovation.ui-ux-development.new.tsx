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
  Monitor,
  Smartphone,
  Tablet,
  Layout,
  Figma,
  Grid,
  List,
  Flame,
  ThumbsUp,
  MessageSquare,
  FilePlus,
  RefreshCw,
  Copy,
  FolderDown,
  Play,
  HelpCircle,
  BarChart3,
  PieChart,
  CheckSquare2,
} from "lucide-react";

import { uiUxDevelopmentService } from "@/services/uiUxDevelopmentService";
import type {
  UiUxDevelopmentRecord,
  UiUxDevelopmentFormInput,
  UiUxDevelopmentApprovalDecision,
  UiUxUserPersona,
  UiUxWireframeScreen,
  UiUxAttachment,
  UiUxWcagAudit,
} from "@/services/types";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { UiUxDevelopmentTabBar, UI_UX_TABS, type UiUxDevelopmentTabId } from "@/components/erp/UiUxDevelopmentTabBar";
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
  "/development/research-innovation/ui-ux-development/new",
)({
  head: () => ({
    meta: [{ title: "UI/UX Development Form · Magnertia ERP" }],
  }),
  component: UiUxDevelopmentNewPage,
});

function UiUxDevelopmentNewPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Tab State & View Settings
  const [activeTab, setActiveTab] = useState<UiUxDevelopmentTabId>("overview");
  const [isSkeleton, setIsSkeleton] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wireframeFilter, setWireframeFilter] = useState<"All" | "Low-Fi" | "Hi-Fi">("All");
  const [selectedPersona, setSelectedPersona] = useState<UiUxUserPersona | null>(null);
  const [selectedWireframe, setSelectedWireframe] = useState<UiUxWireframeScreen | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [designTokenTab, setDesignTokenTab] = useState<"colors" | "typography" | "components" | "css">("colors");

  // Approval Form State
  const [reviewDecision, setReviewDecision] = useState<UiUxDevelopmentApprovalDecision>("Approved");
  const [reviewCommentInput, setReviewCommentInput] = useState("");

  // Data Fetching
  const { data: record, isLoading } = useQuery<UiUxDevelopmentRecord>({
    queryKey: ["uiUxDevelopmentRecord"],
    queryFn: () => uiUxDevelopmentService.fetchRecord(),
  });

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<UiUxDevelopmentFormInput>) => uiUxDevelopmentService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["uiUxDevelopmentRecord"], updated);
      toast.success("Draft saved successfully!", { description: "All design parameters and metadata updated." });
    },
    onError: (err: any) => {
      toast.error("Failed to save draft", { description: err?.message || "An error occurred." });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (id?: string) => uiUxDevelopmentService.submitForReview(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["uiUxDevelopmentRecord"], updated);
      toast.success("Submitted for Executive Review!", { description: "Review notifications sent to stakeholders." });
    },
  });

  const reviewDecisionMutation = useMutation({
    mutationFn: (args: { id: string; decision: UiUxDevelopmentApprovalDecision; comments?: string }) =>
      uiUxDevelopmentService.reviewDecision(args),
    onSuccess: (updated) => {
      queryClient.setQueryData(["uiUxDevelopmentRecord"], updated);
      toast.success(`Decision submitted: ${reviewDecision}`, { description: "Workflow status updated." });
    },
  });

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading || !record) {
    return (
      <AppShell
        title="UI/UX Development"
        breadcrumb="Development"
        description="Design, validate, and hand off enterprise UI/UX design systems and wireframes."
        tabs={<ResearchInnovationTabBar />}
      >
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Magnertia UI/UX Development Module...</p>
        </div>
      </AppShell>
    );
  }

  // Quick helper handlers
  const handleSaveDraft = () => {
    saveDraftMutation.mutate({
      ...record,
      lastUpdated: new Date().toLocaleString(),
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
    toast.success("Exporting UI/UX Specification Report (PDF)...", { description: "Generating vector PDF with design system tokens." });
  };

  return (
    <AppShell
      title="UI/UX Development"
      breadcrumb="Development"
      description="Design, validate, and hand off enterprise UI/UX design systems and wireframes."
      tabs={<ResearchInnovationTabBar />}
    >
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased pb-16">
        {/* Main Container */}

      {/* Main Container */}
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 pt-3 space-y-4">
        {/* ====================================================================
           1. PROJECT HEADER & METADATA BAR (Enterprise Header)
           ==================================================================== */}
        <div className="rounded-xl border border-border/80 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-5 transition-all">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Breadcrumbs & Primary Titles */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="hover:text-foreground cursor-pointer">Development</span>
                <span>/</span>
                <span className="hover:text-foreground cursor-pointer">Product Development</span>
                <span>/</span>
                <span className="hover:text-foreground cursor-pointer">UI/UX Development</span>
                <span>/</span>
                <span className="text-primary font-semibold">UI/UX Development Form</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Palette className="h-6 w-6 text-primary shrink-0" />
                  {record.uiUxProjectName}
                </h1>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
                  {record.designVersion}
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

            {/* Right: Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSkeleton(!isSkeleton)}
                className="h-9 px-3 text-xs gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSkeleton ? "animate-spin text-primary" : ""}`} />
                {isSkeleton ? "Show Data" : "Skeleton Mode"}
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
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <Printer className="mr-2 h-4 w-4" /> Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => copyToClipboard(JSON.stringify(record, null, 2), "Record JSON")}>
                    <FileCode className="mr-2 h-4 w-4" /> Copy Raw JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsCommandPaletteOpen(true)}>
                    <Search className="mr-2 h-4 w-4" /> Quick Search (Cmd+K)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsScheduleModalOpen(true)}>
                    <Calendar className="mr-2 h-4 w-4" /> Schedule Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Metadata Grid Bar */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-3 border-t border-border/60 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">UI/UX Dev ID</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{record.uiUxDevelopmentId}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Form Code</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{record.formCode}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Linked PRD</span>
              <span className="font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer">
                {record.linkedPrdId} <ExternalLink className="h-3 w-3" />
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Linked Software Dev</span>
              <span className="font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer">
                {record.linkedSoftwareDevId} <ExternalLink className="h-3 w-3" />
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Linked Mobile App</span>
              <span className="font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer">
                {record.linkedMobileAppDevId} <ExternalLink className="h-3 w-3" />
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Product Architecture</span>
              <span className="font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer">
                {record.linkedProductArchitectureId} <ExternalLink className="h-3 w-3" />
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Business Unit</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{record.businessUnit}</span>
            </div>
          </div>
        </div>

        {/* ====================================================================
           2. PROGRESS & WORKFLOW BANNER
           ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Circular Score Gauge Card */}
          <Card className="lg:col-span-4 border-border/80 shadow-xs bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20">
            <CardContent className="p-4 sm:p-5 flex items-center gap-5">
              {/* Donut Gauge */}
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 p-2">
                <div className="text-center">
                  <span className="text-2xl font-black tracking-tight text-primary dark:text-blue-400">
                    {record.overallDesignScore}
                  </span>
                  <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    / 100
                  </span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">Overall Design Score</h3>
                  <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary">
                    WCAG 2.2 AA
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  Aggregated score calculated across Research, Information Architecture, Wireframes, Visual Design, Accessibility, and Handoff readiness.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">UX Score</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{record.uxScore}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Visual</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{record.visualDesignScore}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">A11y Score</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{record.accessibilityScore}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Workflow Timeline */}
          <Card className="lg:col-span-8 border-border/80 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-center">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  UI/UX Development Lifecycle Stage
                </span>
                <span className="text-xs font-semibold text-primary">Stage 4 of 6: Executive Review</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                {[
                  { step: "1", title: "User Research", status: "complete" },
                  { step: "2", title: "Information Arch", status: "complete" },
                  { step: "3", title: "Wireframes & Flow", status: "complete" },
                  { step: "4", title: "Visual & Prototype", status: "current" },
                  { step: "5", title: "Review & Approval", status: "pending" },
                  { step: "6", title: "Dev Handoff", status: "pending" },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-2.5 text-center border transition-all ${
                      s.status === "complete"
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                        : s.status === "current"
                          ? "border-primary bg-primary/10 text-primary dark:bg-blue-950/30 font-bold ring-1 ring-primary/40"
                          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 text-xs">
                      {s.status === "complete" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px]">
                          {s.step}
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
           3. STICKY TAB NAVIGATION
           ==================================================================== */}
        <UiUxDevelopmentTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ====================================================================
           4. MAIN CONTENT AREA & RIGHT INSIGHTS PANEL GRID
           ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Module Content (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            {/* TAB 1: OVERVIEW (The 13-Card Executive Grid) */}
            {(activeTab === "overview" || isSkeleton) && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Grid className="h-5 w-5 text-primary" /> Executive Lifecycle Overview (13 Modules)
                  </h2>
                  <Badge variant="outline" className="text-xs font-semibold bg-white dark:bg-slate-900 shadow-2xs">
                    Live Telemetry Mode
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Project Overview */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">1</span>
                        Project Overview
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary font-bold">In Progress</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Product Name</span>
                          <span className="font-bold text-slate-900 dark:text-white">{record.productName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">UI/UX Project Name</span>
                          <span className="font-bold text-slate-900 dark:text-white">{record.uiUxProjectName}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground block text-[10px]">Project Objective</span>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                          {record.projectObjective}
                        </p>
                      </div>

                      <div>
                        <span className="text-muted-foreground block text-[10px]">Business Goals</span>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] line-clamp-1">{record.businessGoals}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Target Platforms</span>
                          <div className="flex gap-1 mt-0.5">
                            {record.targetPlatforms.map((plat: string) => (
                              <Badge key={plat} variant="outline" className="text-[9px] px-1.5 py-0 font-semibold bg-slate-50 dark:bg-slate-800">
                                {plat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {/* Device Mockup Illustration */}
                        <div className="relative h-14 w-24 rounded-lg bg-slate-900 p-1 flex items-center justify-center border border-slate-700 shadow-inner overflow-hidden">
                          <Monitor className="h-7 w-7 text-primary animate-pulse" />
                          <Smartphone className="h-5 w-5 text-emerald-400 absolute right-1 bottom-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2: User Research */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">2</span>
                        User Research
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">Completed</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground text-[10px]">Research Method</span>
                          <span className="font-semibold text-right text-[10px]">Interviews, Survey, Analytics</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground text-[10px]">User Personas</span>
                          <span className="font-bold text-primary text-[10px]">3 Personas Defined</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground text-[10px]">User Journey</span>
                          <span className="font-semibold text-[10px]">5 Key Journeys</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground text-[10px]">Pain Points</span>
                          <span className="font-bold text-rose-600 text-[10px]">12 Identified</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground text-[10px]">Customer Feedback</span>
                          <span className="font-bold text-emerald-600 text-[10px]">128 Responses</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground text-[10px]">Competitive Analysis</span>
                          <span className="font-semibold text-[10px]">4 Competitors</span>
                        </div>
                      </div>

                      {/* User Persona Avatars Graphic */}
                      <div className="pt-2 flex items-center justify-center gap-3 bg-blue-50/50 dark:bg-slate-800/50 p-2 rounded-lg border border-blue-100 dark:border-slate-700">
                        <div className="flex -space-x-2 overflow-hidden">
                          {record.personas.map((p: UiUxUserPersona) => (
                            <img key={p.id} src={p.avatar} alt={p.name} className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-primary">User Personas Tree</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 3: Information Architecture */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">3</span>
                        Information Architecture
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-bold text-primary bg-primary/5">Score: {record.architectureReadinessScore ?? record.uxReadinessScore}/100</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Sitemap</span>
                          <span className="font-bold text-slate-900 dark:text-white">25 Pages</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Navigation Structure</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Top + Side Navigation</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Screen Hierarchy</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">4 Levels</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Content Structure</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Module Based</span>
                        </div>
                      </div>

                      {/* Mini Sitemap Hierarchy Diagram */}
                      <div className="pt-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="mx-auto w-20 rounded bg-primary text-[9px] text-white font-bold text-center py-0.5 shadow-2xs">
                          Dashboard
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[8px] text-center font-medium text-slate-600 dark:text-slate-300">
                          <span className="bg-white dark:bg-slate-700 p-0.5 rounded border">Telemetry</span>
                          <span className="bg-white dark:bg-slate-700 p-0.5 rounded border">Sessions</span>
                          <span className="bg-white dark:bg-slate-700 p-0.5 rounded border">Billing</span>
                          <span className="bg-white dark:bg-slate-700 p-0.5 rounded border">Profile</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 4: Wireframe & User Flow */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">4</span>
                        Wireframe & User Flow
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">UX Score: {record.uxScore ?? record.uxReadinessScore}</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground text-[10px]">Low-Fidelity</span>
                          <span className="font-bold">32 Screens</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground text-[10px]">High-Fidelity</span>
                          <span className="font-bold text-primary">32 Screens</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground text-[10px]">Screen Flow</span>
                          <span className="font-semibold">5 Flows</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground text-[10px]">Task Flow</span>
                          <span className="font-semibold">8 Key Tasks</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 5: Visual Design */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">5</span>
                        Visual Design
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-bold text-primary">Score: {record.visualDesignScore ?? record.uiReadinessScore}/100</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Design System:</span>
                        <span className="font-bold text-primary text-[10px]">{record.designSystemVersion ?? record.designVersion}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Typography:</span>
                        <span className="font-semibold text-[10px]">Poppins & Inter</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Component Library:</span>
                        <span className="font-semibold text-[10px]">120+ Components</span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-muted-foreground">Color Palette:</span>
                        <div className="flex gap-1">
                          {["#0F62FE", "#00D2FF", "#64748B", "#10B981", "#F59E0B"].map((c) => (
                            <div key={c} className="h-3.5 w-3.5 rounded-full border border-white shadow-2xs" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 6: Accessibility & Usability */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">6</span>
                        Accessibility & Usability
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">WCAG 2.2 AA</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Keyboard Navigation:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 inline" /> 100%</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Screen Reader Support:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 inline" /> Verified</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Accessibility Score:</span>
                        <span className="font-bold text-primary text-[10px]">90 / 100</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 7: Prototype & Validation */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">7</span>
                        Prototype & Validation
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 font-bold">Figma</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Usability Testing:</span>
                        <span className="font-bold text-emerald-600 text-[10px]">Completed (30 Users)</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">A/B Testing:</span>
                        <span className="font-bold text-emerald-600 text-[10px]">Completed</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">User Satisfaction (SUS):</span>
                        <span className="font-bold text-primary text-[10px]">{record.userSatisfactionScore ?? 91} / 100</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 8: Developer Handoff */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">8</span>
                        Developer Handoff
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">Ready (90/100)</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Design Tokens:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-[10px]">JSON & CSS</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Component Library:</span>
                        <span className="font-bold text-emerald-600 text-[10px]">React & Tailwind</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 9: AI UI/UX Assessment */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">9</span>
                        AI UI/UX Assessment
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-bold text-purple-600 border-purple-300">
                        AI Score: {record.aiOverallDesignScore ?? record.overallDesignScore}/100
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">AI UX Score:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{record.aiUxScore ?? record.uxReadinessScore} / 100</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground text-[10px]">AI Accessibility Review:</span>
                        <span className="font-bold text-emerald-600">{record.aiAccessibilityReview ?? record.accessibilityScore} / 100</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 10: Design Summary */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">10</span>
                        Design Summary
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-bold">Readiness 88%</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span>Research Readiness</span>
                          <span>88/100</span>
                        </div>
                        <Progress value={88} className="h-1.5" />
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Recommendation</span>
                        <span className="font-bold text-primary text-[11px]">{record.recommendation ?? "Proceed to Development"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 11: Attachments */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900 md:col-span-2">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">11</span>
                        Attachments ({record.attachments.length})
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setIsUploadOpen(true)} className="h-6 text-[10px] text-primary p-0">
                        + Upload File
                      </Button>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {record.attachments.map((att: UiUxAttachment) => (
                          <div key={att.id} className="flex justify-between items-center p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800/40">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate text-[10px] font-medium text-slate-900 dark:text-slate-100">{att.name}</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground shrink-0 ml-1">{att.size}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 12: Review & Approval */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900 md:col-span-3">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">12</span>
                        Review & Approval Workflow
                      </CardTitle>
                      <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-bold">{record.workflowStatus}</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {record.reviewers.map((rev: UiUxReviewer, i: number) => (
                          <div key={i} className="rounded-lg border border-border/60 p-2 text-center bg-slate-50/50 dark:bg-slate-800/40">
                            <span className="block font-bold text-[10px] truncate text-slate-900 dark:text-white">{rev.person}</span>
                            <span className="block text-[9px] text-muted-foreground truncate">{rev.role}</span>
                            <Badge
                              className={`mt-1 text-[8px] px-1.5 py-0 ${
                                rev.decision === "Approved"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold"
                              }`}
                            >
                              {rev.decision}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 13: System Information */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900 md:col-span-3">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">13</span>
                        System Information & Audit Trail
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono">v{record.designVersion}</Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Created By</span>
                          <span className="font-bold text-slate-900 dark:text-white">{record.designerName}</span>
                          <span className="block text-[9px] text-muted-foreground">{record.createdOn}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Last Modified By</span>
                          <span className="font-bold text-slate-900 dark:text-white">{record.designerName}</span>
                          <span className="block text-[9px] text-muted-foreground">{record.lastUpdated}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Workflow Stage</span>
                          <span className="font-semibold text-primary">{record.workflowStatus}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Audit Links</span>
                          <div className="flex flex-wrap gap-1.5 mt-0.5 text-[10px] font-medium text-primary">
                            <span className="hover:underline cursor-pointer">View Log &rarr;</span>
                            <span className="hover:underline cursor-pointer">View History &rarr;</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 2: USER RESEARCH */}
            {activeTab === "user_research" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" /> Target Personas & Customer Journeys
                    </h2>
                    <p className="text-xs text-muted-foreground">3 Personas Defined | 5 Key Journeys | 128 Customer Responses</p>
                  </div>
                </div>

                {/* Personas Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {record.personas.map((persona: UiUxUserPersona) => (
                    <Card key={persona.id} className="border-border/80 shadow-xs hover:border-primary/50 transition-all">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <img src={persona.avatar} alt={persona.name} className="h-12 w-12 rounded-full object-cover border-2 border-primary/20" />
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{persona.name}</h3>
                            <p className="text-xs text-primary font-medium">{persona.role}</p>
                            <span className="text-[10px] text-muted-foreground">{persona.location} • Age {persona.age}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-border/40">
                          "{persona.quote}"
                        </p>

                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Primary Goals:</span>
                          <ul className="text-[11px] text-muted-foreground list-disc list-inside space-y-0.5">
                            {persona.goals.map((g: string, i: number) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPersona(persona)}
                          className="w-full text-xs h-8 border-primary/30 text-primary hover:bg-primary/5"
                        >
                          View Full Persona Deep-Dive &rarr;
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Journeys Explorer */}
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                      <span>5 Key Customer Journeys Mapped</span>
                      <Badge className="bg-emerald-500/15 text-emerald-700">Average Satisfaction: 91.4%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {record.userJourneys.map((j: { id: string; title: string; satisfactionScore: number; steps: string[]; keyTakeaway: string }) => (
                      <div key={j.id} className="rounded-lg border p-3 space-y-2 bg-slate-50/40 dark:bg-slate-900">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{j.title}</span>
                          <Badge variant="outline" className="text-[10px] text-primary">{j.satisfactionScore}% Satisfaction</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {j.steps.map((st: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1">
                              <span className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded border text-[10px] font-medium">{st}</span>
                              {idx < j.steps.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">💡 Key Takeaway: {j.keyTakeaway}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 3: INFORMATION ARCHITECTURE */}
            {activeTab === "ia" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                      <span>Interactive Sitemap & Information Architecture (25 Pages)</span>
                      <Badge variant="outline" className="text-xs text-primary font-bold">Readiness Score: {record.architectureReadinessScore ?? record.uxReadinessScore}/100</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Visual Sitemap Graph */}
                    <div className="rounded-xl border border-dashed border-primary/30 p-6 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center gap-6">
                      <div className="rounded-lg bg-primary px-4 py-2 text-white font-bold text-xs shadow-md">
                        Smart EV Platform Root Dashboard
                      </div>

                      <div className="h-6 w-0.5 bg-primary/40" />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-center">
                        {[
                          { title: "Monitoring & Live Telemetry", items: ["Live Charger Status", "Grid kW Load Balance", "Active Alarms"] },
                          { title: "Sessions & Driver Apps", items: ["Active Charging Session", "Historical Session Logs", "NFC Wallet Setup"] },
                          { title: "Stations & Hardware", items: ["Station Map Explorer", "Hardware Diagnostics", "Firmware Updates"] },
                          { title: "Billing & Ledger Sync", items: ["Invoices & Receipts", "Tariff Rule Config", "Carbon Credit Export"] },
                        ].map((node, i) => (
                          <div key={i} className="rounded-lg border bg-white dark:bg-slate-800 p-3 space-y-2 shadow-xs">
                            <span className="font-bold text-xs text-primary block border-b pb-1.5">{node.title}</span>
                            <div className="space-y-1">
                              {node.items.map((it, k) => (
                                <span key={k} className="block text-[10px] text-muted-foreground bg-slate-100 dark:bg-slate-700/50 p-1 rounded">
                                  {it}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 4: WIREFRAMES & FLOW */}
            {activeTab === "wireframes" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layout className="h-5 w-5 text-primary" /> Wireframe Gallery & Screen Flows (64 Screens)
                    </h2>
                    <p className="text-xs text-muted-foreground">32 Low-Fidelity Screens • 32 High-Fidelity Screens • UX Score: {record.uxScore ?? record.uxReadinessScore}/100</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(["All", "Low-Fi", "Hi-Fi"] as const).map((f) => (
                      <Button
                        key={f}
                        variant={wireframeFilter === f ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWireframeFilter(f)}
                        className="h-8 text-xs px-3"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(record.wireframes ?? record.wireframeScreens)
                    .filter((wf: UiUxWireframeScreen) => wireframeFilter === "All" || (wf.type ?? wf.screenType) === wireframeFilter)
                    .map((wf: UiUxWireframeScreen) => (
                      <Card key={wf.id} className="border-border/80 shadow-xs group overflow-hidden hover:shadow-md transition-all">
                        <div className="relative h-44 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <img src={wf.previewUrl} alt={wf.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="sm" onClick={() => setSelectedWireframe(wf)} className="bg-white text-slate-900 hover:bg-slate-100 text-xs">
                              <Eye className="h-3.5 w-3.5 mr-1" /> Zoom Screen
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-3 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">{wf.title}</h3>
                            <Badge variant="outline" className="text-[10px] text-primary">{wf.type ?? wf.screenType}</Badge>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                            <span>Flow: {wf.screenFlow ?? wf.category}</span>
                            <span>Version: {wf.version ?? wf.status}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* TAB 5: VISUAL DESIGN */}
            {activeTab === "visual_design" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" /> {record.designSystemVersion ?? record.designVersion} Token Inspector
                    </CardTitle>
                    <Badge className="bg-emerald-500/15 text-emerald-700">Visual Score: {record.visualDesignScore ?? record.uiReadinessScore}/100</Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Color Swatches Grid */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand & System Color Tokens</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {[
                          { name: "Primary Blue", hex: "#0F62FE", usage: "Main Action Buttons & Active Headers" },
                          { name: "Electric Cyan", hex: "#00D2FF", usage: "Live EV Telemetry & Highlights" },
                          { name: "Slate Gray", hex: "#64748B", usage: "Muted Text & Borders" },
                          { name: "Success Emerald", hex: "#10B981", usage: "Approved & Online Status" },
                          { name: "Warning Amber", hex: "#F59E0B", usage: "Pending & Overload Alerts" },
                          { name: "Danger Rose", hex: "#EF4444", usage: "Critical Hardware Faults" },
                        ].map((c) => (
                          <div
                            key={c.name}
                            onClick={() => copyToClipboard(c.hex, c.name)}
                            className="rounded-lg border p-2.5 space-y-2 cursor-pointer hover:border-primary transition-all bg-white dark:bg-slate-800"
                          >
                            <div className="h-10 w-full rounded-md shadow-xs" style={{ backgroundColor: c.hex }} />
                            <div>
                              <span className="font-bold text-xs block text-slate-900 dark:text-white">{c.name}</span>
                              <span className="text-[10px] text-primary font-mono">{c.hex}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 6: ACCESSIBILITY */}
            {activeTab === "accessibility" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" /> WCAG 2.2 AA Compliance Audit
                    </CardTitle>
                    <Badge className="bg-emerald-500/15 text-emerald-700">Audit Score: {record.accessibilityScore}/100</Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-muted-foreground font-semibold border-b">
                          <tr>
                            <th className="p-2.5">Criteria</th>
                            <th className="p-2.5">WCAG Level</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Audit Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {record.wcagAudits.map((item: UiUxWcagAudit) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white">{item.criteria ?? item.criterion}</td>
                              <td className="p-2.5"><Badge variant="outline" className="text-[10px]">{item.wcagLevel ?? item.level}</Badge></td>
                              <td className="p-2.5"><Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">{item.status}</Badge></td>
                              <td className="p-2.5 text-muted-foreground text-[11px]">{item.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 7: PROTOTYPE & VALIDATION */}
            {activeTab === "prototype" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Figma className="h-4 w-4 text-purple-600" /> Figma Enterprise Interactive Prototype
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant={deviceFrame === "desktop" ? "default" : "outline"} size="sm" onClick={() => setDeviceFrame("desktop")} className="h-7 text-[10px]">
                        <Monitor className="h-3 w-3 mr-1" /> Desktop
                      </Button>
                      <Button variant={deviceFrame === "mobile" ? "default" : "outline"} size="sm" onClick={() => setDeviceFrame("mobile")} className="h-7 text-[10px]">
                        <Smartphone className="h-3 w-3 mr-1" /> Mobile
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col items-center">
                    <div
                      className={`border-4 border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center transition-all ${
                        deviceFrame === "desktop" ? "w-full h-96" : "w-72 h-[480px]"
                      }`}
                    >
                      <Zap className="h-12 w-12 text-primary animate-pulse mb-3" />
                      <h3 className="font-bold text-lg">Smart EV Charger Live Simulator</h3>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Interactive prototype framing enabled for {deviceFrame.toUpperCase()} viewport (v2.1.0).
                      </p>
                      <Button className="mt-4 bg-primary text-white hover:bg-primary/90 text-xs gap-2">
                        <Play className="h-3.5 w-3.5" /> Launch Fullscreen Prototype &rarr;
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 8: DEVELOPER HANDOFF */}
            {activeTab === "handoff" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-primary" /> Design Tokens & Component Specification
                    </CardTitle>
                    <Badge className="bg-emerald-500/15 text-emerald-700">Dev Readiness: 90/100</Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex gap-2 border-b pb-2">
                      <Button size="sm" variant={designTokenTab === "colors" ? "default" : "ghost"} onClick={() => setDesignTokenTab("colors")} className="h-7 text-xs">
                        Color Tokens
                      </Button>
                      <Button size="sm" variant={designTokenTab === "css" ? "default" : "ghost"} onClick={() => setDesignTokenTab("css")} className="h-7 text-xs">
                        CSS Variables
                      </Button>
                    </div>

                    {designTokenTab === "css" ? (
                      <div className="relative rounded-lg bg-slate-950 p-4 text-emerald-400 font-mono text-xs overflow-x-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`:root {\n  --color-primary: #0F62FE;\n  --color-cyan: #00D2FF;\n  --radius-card: 12px;\n}`, "CSS Tokens")}
                          className="absolute top-2 right-2 h-7 text-white hover:bg-slate-800 text-[10px]"
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy CSS
                        </Button>
                        <pre>{`:root {\n  --color-primary: #0F62FE;\n  --color-electric-cyan: #00D2FF;\n  --color-slate-bg: #F8FAFC;\n  --font-family-display: "Poppins", sans-serif;\n  --font-family-body: "Inter", sans-serif;\n  --border-radius-card: 12px;\n}`}</pre>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Tokens ready for automated integration into Tailwind CSS theme configuration.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 9: AI ASSESSMENT */}
            {activeTab === "ai_assessment" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs bg-gradient-to-br from-purple-50/40 via-white to-slate-50 dark:from-purple-950/20 dark:via-slate-900">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <Sparkles className="h-4 w-4" /> Magnertia AI Design Quality Evaluator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      {[
                        { label: "AI UX Score", score: record.aiUxScore ?? record.uxReadinessScore },
                        { label: "Accessibility", score: record.aiAccessibilityReview ?? record.accessibilityScore },
                        { label: "Consistency", score: record.aiConsistencyAnalysis ?? record.uiReadinessScore },
                        { label: "Journey Analysis", score: record.aiUserJourneyAnalysis ?? record.researchReadinessScore },
                        { label: "Visual Review", score: record.aiVisualDesignReview ?? record.uiReadinessScore },
                      ].map((item, idx) => (
                        <div key={idx} className="rounded-lg border bg-white dark:bg-slate-800 p-3 shadow-xs">
                          <span className="text-[10px] text-muted-foreground block">{item.label}</span>
                          <span className="text-lg font-black text-purple-600 dark:text-purple-400">{item.score} / 100</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Optimization Suggestions:</h4>
                      <ul className="space-y-2 text-xs">
                        {(record.aiSuggestions ?? ["Optimize CTA button contrast ratio on mobile"]).map((sug: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border">
                            <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300 flex-1">{sug}</span>
                            <Button size="sm" variant="ghost" onClick={() => toast.success("AI Suggestion applied!")} className="h-6 text-[10px] text-purple-600 font-bold">
                              Apply Fix
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 10: SUMMARY */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-bold">Readiness Summary & Final Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-3">
                      {[
                        { label: "Research Readiness", score: record.researchReadinessScore },
                        { label: "UX Readiness", score: record.uxReadinessScore },
                        { label: "UI Readiness", score: record.uiReadinessScore },
                        { label: "Development Readiness", score: record.developmentReadinessScore },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{item.label}</span>
                            <span className="text-primary">{item.score}%</span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 11: ATTACHMENTS */}
            {activeTab === "attachments" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-primary" /> Project Attachments & Design Assets ({record.attachments.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setIsUploadOpen(true)} className="h-8 text-xs bg-primary text-white">
                      + Upload New File
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-muted-foreground font-semibold border-b">
                          <tr>
                            <th className="p-2.5">File Name</th>
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Size</th>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {record.attachments.map((att: UiUxAttachment) => (
                            <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" /> {att.name}
                              </td>
                              <td className="p-2.5"><Badge variant="outline" className="text-[10px]">{att.type}</Badge></td>
                              <td className="p-2.5 text-muted-foreground">{att.size}</td>
                              <td className="p-2.5 text-muted-foreground">{att.date}</td>
                              <td className="p-2.5 text-right">
                                <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloading ${att.name}`)} className="h-7 text-xs text-primary">
                                  <Download className="h-3.5 w-3.5 mr-1" /> Download
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 12: REVIEW & APPROVAL */}
            {activeTab === "review_approval" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" /> Review Board Approval Decision Form
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 dark:text-white">Approval Decision:</label>
                      <div className="flex gap-3">
                        {(["Approved", "Changes Requested", "Rejected"] as const).map((dec) => (
                          <Button
                            key={dec}
                            type="button"
                            variant={reviewDecision === dec ? "default" : "outline"}
                            size="sm"
                            onClick={() => setReviewDecision(dec)}
                            className="h-8 text-xs"
                          >
                            {dec}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 dark:text-white">Review Comments:</label>
                      <Textarea
                        rows={3}
                        value={reviewCommentInput}
                        onChange={(e) => setReviewCommentInput(e.target.value)}
                        placeholder="Enter review comments or requirements for development team..."
                        className="text-xs"
                      />
                    </div>

                    <Button onClick={handleSubmitDecision} disabled={reviewDecisionMutation.isPending} className="bg-primary text-white text-xs">
                      Submit Decision
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 13: SYSTEM INFO */}
            {activeTab === "system_info" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-bold">System Audit Trail & History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-2">
                      {record.auditTrail.map((aud: UiUxAuditEntry) => (
                        <div key={aud.id} className="rounded-lg border p-3 text-xs flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{aud.action}</span>
                            <span className="text-[10px] text-muted-foreground">{aud.details}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground block">{aud.timestamp}</span>
                            <span className="text-[10px] text-primary font-mono">{aud.user} ({aud.ipAddress})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* ====================================================================
             RIGHT INSIGHTS PANEL (4 cols on desktop)
             ==================================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Overall Score Card */}
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Overall Design Score</span>
                  <Award className="h-4 w-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-center space-y-4">
                <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 p-2">
                  <div>
                    <span className="text-3xl font-black text-primary dark:text-blue-400">{record.overallDesignScore}</span>
                    <span className="block text-[10px] font-bold text-muted-foreground">/ 100</span>
                  </div>
                </div>

                <div className="space-y-2 text-left text-xs border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UX Score</span>
                    <span className="font-bold text-slate-900 dark:text-white">{record.uxScore ?? record.uxReadinessScore} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visual Design</span>
                    <span className="font-bold text-slate-900 dark:text-white">{record.visualDesignScore ?? record.uiReadinessScore} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accessibility</span>
                    <span className="font-bold text-emerald-600">{record.accessibilityScore} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Usability</span>
                    <span className="font-bold text-slate-900 dark:text-white">88 / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Development Readiness</span>
                    <span className="font-bold text-primary">{record.developmentReadinessScore} / 100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Highlights */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Highlights</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                {[
                  "User journey maps completed (91.4% satisfaction)",
                  "Interactive prototype ready (Figma v124)",
                  "Accessibility AA compliant (WCAG 2.2 verified)",
                  "Usability test completed with 87% satisfaction",
                  "Design system and components defined (v3.2)",
                ].map((hl, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{hl}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                <Button variant="outline" size="sm" onClick={handleExportPDF} className="w-full justify-start text-xs h-8">
                  <FileText className="h-3.5 w-3.5 mr-2 text-primary" /> Generate Design Report (PDF)
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("prototype")} className="w-full justify-start text-xs h-8">
                  <Figma className="h-3.5 w-3.5 mr-2 text-purple-600" /> View Figma File
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("prototype")} className="w-full justify-start text-xs h-8">
                  <Play className="h-3.5 w-3.5 mr-2 text-emerald-600" /> View Interactive Prototype
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("user_research")} className="w-full justify-start text-xs h-8">
                  <BarChart3 className="h-3.5 w-3.5 mr-2 text-amber-600" /> Usability Test Report
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("visual_design")} className="w-full justify-start text-xs h-8">
                  <Palette className="h-3.5 w-3.5 mr-2 text-blue-600" /> Design System Library
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("handoff")} className="w-full justify-start text-xs h-8">
                  <FolderDown className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Design Handoff Package
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(true)} className="w-full justify-start text-xs h-8">
                  <Calendar className="h-3.5 w-3.5 mr-2 text-primary" /> Schedule Design Review
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ====================================================================
         5. MODALS & DIALOGS
         ==================================================================== */}

      {/* Persona Detail Modal */}
      {selectedPersona && (
        <Dialog open={!!selectedPersona} onOpenChange={() => setSelectedPersona(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <img src={selectedPersona.avatar} alt={selectedPersona.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h3 className="text-base font-bold">{selectedPersona.name}</h3>
                  <p className="text-xs text-primary font-normal">{selectedPersona.role}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground">{selectedPersona.bio}</p>
              <div>
                <span className="font-bold block mb-1">Pain Points:</span>
                <ul className="list-disc list-inside text-rose-600 dark:text-rose-400 space-y-0.5">
                  {selectedPersona.painPoints.map((pp: string, i: number) => (
                    <li key={i}>{pp}</li>
                  ))}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedPersona(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Wireframe Zoom Modal */}
      {selectedWireframe && (
        <Dialog open={!!selectedWireframe} onOpenChange={() => setSelectedWireframe(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex justify-between items-center">
                <span>{selectedWireframe.title} ({selectedWireframe.type})</span>
                <Badge variant="outline">{selectedWireframe.version}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="relative h-96 w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={selectedWireframe.previewUrl} alt={selectedWireframe.title} className="h-full w-full object-contain" />
            </div>
            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedWireframe(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload File Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Upload Design Attachment</DialogTitle>
            <DialogDescription className="text-xs">Drag and drop Figma, PDF, PNG, or JSON files.</DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <Upload className="h-8 w-8 text-primary mx-auto" />
            <p className="text-xs font-semibold">Drop files here or click to browse</p>
            <p className="text-[10px] text-muted-foreground">Supports files up to 100MB</p>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { setIsUploadOpen(false); toast.success("File uploaded successfully!"); }} className="bg-primary text-white">Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Review Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Schedule Stakeholder Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold block mb-1">Select Date:</label>
              <Input type="date" className="text-xs" />
            </div>
            <div>
              <label className="font-bold block mb-1">Reviewers:</label>
              <Input defaultValue="Rahul Sharma, Ananya Iyer, Vikram Singh" className="text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { setIsScheduleModalOpen(false); toast.success("Review meeting scheduled!"); }} className="bg-primary text-white">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Command Palette (Cmd+K) */}
      <Dialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type a command or search section..."
              className="border-0 focus-visible:ring-0 text-xs h-11"
            />
          </div>
          <div className="p-2 space-y-1 text-xs max-h-64 overflow-y-auto">
            {UI_UX_TABS.filter((t) => t.label.toLowerCase().includes(searchQuery.toLowerCase())).map((tab) => (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center justify-between p-2 rounded hover:bg-primary/10 cursor-pointer"
              >
                <span className="font-medium">{tab.label}</span>
                <Badge variant="outline" className="text-[10px]">{tab.badge || "Tab"}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AppShell>
  );
}
