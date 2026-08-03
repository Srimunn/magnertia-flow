import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  Award,
  Paperclip,
  Eye,
  Check,
  ClipboardCheck,
  Cpu,
  ShieldAlert,
  UserCheck,
  FileCode,
  Info,
  Clock,
  ChevronRight,
  TrendingUp,
  Maximize2,
  Printer,
  FileCheck,
  User,
  ShieldCheck,
  Workflow,
  Plus,
  ArrowRight,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Monitor,
  Smartphone,
  Grid,
  List,
  MessageSquare,
  RefreshCw,
  Copy,
  FolderDown,
  Play,
  HelpCircle,
  BarChart3,
  PieChart,
  Cloud,
  Code,
  Lock,
  Radio,
  Server,
  Database,
  Terminal,
  Rocket,
  Shield,
  Key,
  Globe,
  Share2,
} from "lucide-react";

import { apiDevelopmentService } from "@/services/apiDevelopmentService";
import type {
  ApiDevelopmentRecord,
  ApiDevelopmentFormInput,
  ApiDevelopmentApprovalDecision,
  ApiEndpoint,
  ApiAttachment,
} from "@/services/types";
import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { ApiDevelopmentTabBar, API_DEVELOPMENT_TABS, type ApiDevelopmentTabId } from "@/components/erp/ApiDevelopmentTabBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute(
  "/development/research-innovation/api-development/new"
)({
  head: () => ({ meta: [{ title: "API Development Form · Magnertia ERP" }] }),
  component: ApiDevelopmentNewPage,
});

export function ApiDevelopmentNewPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ApiDevelopmentTabId>("overview");
  const [isSkeleton, setIsSkeleton] = useState(false);

  // Modals & Interactive States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPostmanModalOpen, setIsPostmanModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("ep-1");
  const [searchQuery, setSearchQuery] = useState("");

  // Approval Form Local State
  const [reviewDecision, setReviewDecision] = useState<ApiDevelopmentApprovalDecision>("Approved with Conditions");
  const [reviewCommentInput, setReviewCommentInput] = useState("Overall API architecture looks solid. Please review rate limit policies.");

  // Data Fetching
  const { data: record, isLoading } = useQuery<ApiDevelopmentRecord>({
    queryKey: ["apiDevelopmentRecord"],
    queryFn: () => apiDevelopmentService.fetchRecord(),
  });

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<ApiDevelopmentFormInput>) =>
      apiDevelopmentService.saveDraft(input, record?.id),
    onSuccess: (data) => {
      queryClient.setQueryData(["apiDevelopmentRecord"], data);
      toast.success("Draft Saved Successfully", {
        description: `API Development record ${data.apiDevelopmentId} updated.`,
      });
    },
    onError: (err: Error) => {
      toast.error("Failed to save draft", { description: err.message });
    },
  });

  // Submit for Review Mutation
  const submitReviewMutation = useMutation({
    mutationFn: (id?: string) => apiDevelopmentService.submitForReview(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["apiDevelopmentRecord"], data);
      toast.success("Submitted for Executive Review", {
        description: `API Development record ${data.apiDevelopmentId} is now under review.`,
      });
    },
  });

  // Approval Decision Mutation
  const reviewDecisionMutation = useMutation({
    mutationFn: (args: { id: string; decision: ApiDevelopmentApprovalDecision; comments?: string }) =>
      apiDevelopmentService.reviewDecision(args),
    onSuccess: (data) => {
      queryClient.setQueryData(["apiDevelopmentRecord"], data);
      toast.success(`Review Decision Recorded: ${data.workflowStatus}`, {
        description: `Approval decision set to ${data.approvalDecision}.`,
      });
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
        title="API Development"
        breadcrumb="Development"
        description="Design, secure, test, deploy and monitor enterprise APIs."
        tabs={<ResearchInnovationTabBar />}
      >
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Magnertia API Development Module...</p>
        </div>
      </AppShell>
    );
  }

  const selectedEndpoint = record.endpoints.find((ep) => ep.id === selectedEndpointId) || record.endpoints[0];

  const handleSaveDraft = () => {
    saveDraftMutation.mutate({
      apiName: record.apiName,
      businessObjective: record.businessObjective,
      functionalDescription: record.functionalDescription,
      apiCategory: record.apiCategory,
      deploymentEnvironment: record.deploymentEnvironment,
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
    toast.success("Exporting API Specification Report (PDF)...", { description: "Generating vector OpenAPI PDF specification." });
  };

  return (
    <AppShell
      title="API Development"
      breadcrumb={breadcrumb}
      description="Design RESTful & GraphQL endpoints, OpenAPI specs, rate-limiting policies, and gateway routes."
      tabs={tabs}
    >
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased pb-16">
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 pt-3 space-y-4">
          <div className="rounded-xl border border-border/80 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-5 transition-all">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Cloud className="h-6 w-6 text-primary shrink-0" />
                    {record.apiProjectName}
                  </h1>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
                    {record.apiVersion}
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
                      <Printer className="mr-2 h-4 w-4" /> Export OpenAPI PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(JSON.stringify(record, null, 2), "Record JSON")}>
                      <FileCode className="mr-2 h-4 w-4" /> Copy Raw OpenAPI JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsCommandPaletteOpen(true)}>
                      <Search className="mr-2 h-4 w-4" /> Quick Search (Cmd+K)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsPostmanModalOpen(true)}>
                      <Play className="mr-2 h-4 w-4" /> Test in Postman
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsScheduleModalOpen(true)}>
                      <Calendar className="mr-2 h-4 w-4" /> Schedule API Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Metadata Grid Bar */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-3 border-t border-border/60 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">API Development ID</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.apiDevelopmentId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Form Code</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{record.formCode}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Linked Product</span>
                <span className="font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer">
                  {record.linkedProductId} <ExternalLink className="h-3 w-3" />
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Linked Software Dev</span>
                <span className="font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer">
                  {record.linkedSoftwareDevId} <ExternalLink className="h-3 w-3" />
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Linked Cloud Platform</span>
                <span className="font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer">
                  {record.linkedCloudPlatformId} <ExternalLink className="h-3 w-3" />
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Linked Mobile App</span>
                <span className="font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer">
                  {record.linkedMobileAppDevId} <ExternalLink className="h-3 w-3" />
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">API Architect</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <img src={record.apiArchitectAvatar} alt={record.apiArchitectName} className="h-4 w-4 rounded-full object-cover" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{record.apiArchitectName}</span>
                </div>
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
                      {record.overallApiScore}
                    </span>
                    <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      / 100
                    </span>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">Overall API Score</h3>
                    <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary">
                      REST / OpenAPI 3.0
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Aggregated quality score calculated across API Design, Security, Integration, Testing, Deployment & Monitoring.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Design</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.designReadinessScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Security</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.securityScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Testing</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{record.validationScore}</span>
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
                    API Development Lifecycle Stage
                  </span>
                  <span className="text-xs font-semibold text-primary">Stage 4 of 6: Architecture Review</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                  {[
                    { step: "1", title: "API Design", status: "complete" },
                    { step: "2", title: "Security & Auth", status: "complete" },
                    { step: "3", title: "Data Integration", status: "complete" },
                    { step: "4", title: "Testing & Validation", status: "current" },
                    { step: "5", title: "Review & Approval", status: "pending" },
                    { step: "6", title: "Production Deploy", status: "pending" },
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
          <ApiDevelopmentTabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ====================================================================
             4. MAIN CONTENT AREA & RIGHT INSIGHTS PANEL GRID
             ==================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Module Content (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-6">
              {/* TAB 1: OVERVIEW (The 13-Card Executive Grid matching reference screenshot) */}
              {(activeTab === "overview" || isSkeleton) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Grid className="h-5 w-5 text-primary" /> API Lifecycle Executive Overview (13 Modules)
                    </h2>
                    <Badge variant="outline" className="text-xs font-semibold bg-white dark:bg-slate-900 shadow-2xs">
                      Live Telemetry Mode
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: API Overview */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900 flex flex-col justify-between">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">1</span>
                          API Overview
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary font-bold">In Progress</Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">API Name</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.apiName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">API Category</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700">{record.apiCategory}</Badge>
                          </div>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px]">Business Objective</span>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                            {record.businessObjective}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px]">Functional Description</span>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] line-clamp-2">{record.functionalDescription}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Consumer Apps</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {record.consumerApplications.slice(0, 3).map((app) => (
                                <Badge key={app} variant="outline" className="text-[9px] px-1.5 py-0 bg-slate-50 dark:bg-slate-800">
                                  {app}
                                </Badge>
                              ))}
                              {record.consumerApplications.length > 3 && (
                                <span className="text-[9px] text-muted-foreground">+{record.consumerApplications.length - 3}</span>
                              )}
                            </div>
                          </div>
                          <div className="relative h-12 w-16 rounded-lg bg-slate-900 p-1 flex items-center justify-center border border-slate-700 shadow-inner overflow-hidden">
                            <Cloud className="h-6 w-6 text-primary animate-pulse" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 2: API Design */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900 flex flex-col justify-between">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">2</span>
                          API Design
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-bold text-primary bg-primary/5">Score: {record.designReadinessScore}/100</Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-2">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">API Style</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.endpoints[0].method} / {record.integrationConfig.primaryDataSource}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Protocol</span>
                            <span className="font-bold text-emerald-600">HTTPS / TLS 1.3</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Endpoint Structure</span>
                            <span className="font-mono text-[10px] text-primary">/api/v2/{`{resources}`}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Naming</span>
                            <span className="font-semibold">kebab-case</span>
                          </div>
                        </div>

                        {/* Interactive Endpoint Preview Box */}
                        <div className="rounded-lg bg-slate-950 p-2 text-white font-mono text-[10px] space-y-1 border border-slate-800">
                          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                            <span className="text-emerald-400 font-bold">GET</span>
                            <span className="text-[9px]">/api/v2/chargers</span>
                          </div>
                          <div className="text-slate-300 text-[9px] truncate">
                            Header: Authorization Bearer ******
                          </div>
                          <div className="text-emerald-400 text-[9px]">
                            Response (200 OK): {`{ "status": "success" }`}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 3: Authentication & Authorization */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900 flex flex-col justify-between">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">3</span>
                          Authentication & Security
                        </CardTitle>
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">Score: {record.securityScore}/100</Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Auth Method:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{record.securityPolicy.authMethod}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Authorization Model:</span>
                          <span className="font-semibold text-primary">{record.securityPolicy.authorizationModel}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Token Expiry:</span>
                          <span className="font-semibold">{record.securityPolicy.tokenExpiryMinutes} mins</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Rate Limiting:</span>
                          <span className="font-bold text-emerald-600">{record.securityPolicy.rateLimit}</span>
                        </div>
                        {/* Security Shield Graphic */}
                        <div className="pt-1 flex items-center justify-center gap-2 bg-emerald-50/50 dark:bg-slate-800 p-1.5 rounded border border-emerald-100 dark:border-slate-700">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">OAuth 2.0 + RBAC Active</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 4: Data Integration */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">4</span>
                          Data Integration
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px]">Score: {record.integrationConfig.integrationScore}/100</Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Primary DB:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{record.integrationConfig.primaryDataSource}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">ERP Integration:</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 inline" /> Connected</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Cloud Integration:</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 inline" /> AWS / Azure</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 5: API Documentation */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">5</span>
                          API Documentation
                        </CardTitle>
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">OpenAPI 3.0</Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">OpenAPI Spec:</span>
                          <span className="font-bold text-primary">{record.documentationInfo.openApiSpecName}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Error Codes:</span>
                          <span className="font-bold">{record.documentationInfo.errorCodesCount} Documented</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">SDKs Available:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{record.documentationInfo.sdkLanguages.join(", ")}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 6: Testing & Validation */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">6</span>
                          Testing & Validation
                        </CardTitle>
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">{record.testSummary.testCoveragePercentage}% Coverage</Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Unit Testing:</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 inline" /> Passed</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Security Testing:</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 inline" /> Passed</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Contract Testing:</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 inline" /> Passed</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 7: Deployment & Version Management */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">7</span>
                          Deployment & Versioning
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 font-bold">Kong Gateway</Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">CI/CD Pipeline:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{record.deploymentConfig.cicdPipeline}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Environment:</span>
                          <span className="font-bold text-emerald-600">{record.deploymentConfig.environment}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Version Strategy:</span>
                          <span className="font-semibold text-primary">{record.deploymentConfig.versionStrategy}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 8: Monitoring & Analytics */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">8</span>
                          Monitoring & Analytics
                        </CardTitle>
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">99.95% SLA</Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Monitoring Engine:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{record.monitoringSummary.apiMonitoringTool}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Request Analytics:</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 inline" /> Enabled</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 9: AI API Assessment */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">9</span>
                          AI API Assessment
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-bold text-purple-600 border-purple-300">
                          AI Score: {record.aiAssessment.aiOverallScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">AI Design Review:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{record.aiAssessment.aiApiDesignScore} / 100</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground text-[10px]">AI Security Review:</span>
                          <span className="font-bold text-emerald-600">{record.aiAssessment.aiSecurityReview} / 100</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 10: API Summary */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">10</span>
                          API Summary
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-bold">Readiness 89%</Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold">
                            <span>Design Readiness</span>
                            <span>92/100</span>
                          </div>
                          <Progress value={92} className="h-1.5" />
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Recommendation</span>
                          <span className="font-bold text-primary text-[11px]">{record.readinessSummary.recommendation}</span>
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
                          {record.attachments.map((att) => (
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
                          {record.reviewers.map((rev, i) => (
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
                        <Badge variant="outline" className="text-[10px] font-mono">v{record.apiVersion}</Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Created By</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.apiArchitectName}</span>
                            <span className="block text-[9px] text-muted-foreground">{record.createdOn}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Last Modified By</span>
                            <span className="font-bold text-slate-900 dark:text-white">{record.apiArchitectName}</span>
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

              {/* TAB 2: API DESIGN */}
              {activeTab === "design" && (
                <div className="space-y-4">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Code className="h-4 w-4 text-primary" /> Endpoints Specification & Schema Designer
                      </CardTitle>
                      <Button size="sm" className="h-8 text-xs font-semibold gap-1">
                        <Plus className="h-3.5 w-3.5" /> Add Endpoint
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* Endpoint Selection Tabs */}
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {record.endpoints.map((ep) => (
                          <button
                            key={ep.id}
                            onClick={() => setSelectedEndpointId(ep.id)}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                              selectedEndpointId === ep.id
                                ? "border-primary bg-primary/10 text-primary font-bold"
                                : "border-border bg-slate-50 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Badge className="bg-primary text-white text-[9px] px-1 py-0">{ep.method}</Badge>
                            <span className="font-mono text-[11px]">{ep.path}</span>
                          </button>
                        ))}
                      </div>

                      {/* Selected Endpoint Editor */}
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-900 text-white">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500 text-white text-xs font-bold">{selectedEndpoint.method}</Badge>
                            <span className="font-mono text-sm font-bold text-primary-foreground">{selectedEndpoint.path}</span>
                          </div>
                          <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
                            {selectedEndpoint.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300">{selectedEndpoint.description}</p>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Sample Response JSON Payload</span>
                          <pre className="rounded-lg bg-slate-950 p-3 text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
                            {selectedEndpoint.sampleResponse}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 3: SECURITY */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 border-b border-border/40">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Lock className="h-4 w-4 text-emerald-600" /> OAuth 2.0 & Role-Based Security Policies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border">
                          <span className="font-bold text-slate-900 dark:text-white">Authentication Protocol</span>
                          <p className="text-muted-foreground text-[11px]">OAuth 2.0 Bearer Tokens issued via Identity Provider with JWT RFC 7519 signatures.</p>
                          <div className="pt-2 flex justify-between">
                            <span>Token Expiry:</span>
                            <span className="font-bold">60 minutes</span>
                          </div>
                        </div>
                        <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border">
                          <span className="font-bold text-slate-900 dark:text-white">Rate Limiting Policy</span>
                          <p className="text-muted-foreground text-[11px]">Kong API Gateway rate-limiting plugin enforcing token bucket throttling.</p>
                          <div className="pt-2 flex justify-between">
                            <span>Quota:</span>
                            <span className="font-bold text-emerald-600">1000 req / hour per client</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 5: DOCUMENTATION */}
              {activeTab === "documentation" && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 border-b border-border/40 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> OpenAPI 3.0 Specification Documentation
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard("openapi: 3.0.0", "OpenAPI Spec")}>
                      <Copy className="mr-1 h-3.5 w-3.5" /> Copy YAML
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 text-xs">
                    <pre className="rounded-lg bg-slate-950 p-4 text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800">
{`openapi: 3.0.3
info:
  title: EV Charging APIs
  version: 2.1.0
  description: Enterprise APIs for EV charging station discovery and session management.
paths:
  /api/v2/chargers:
    get:
      summary: List Charging Stations
      security:
        - OAuth2: [read:chargers]
      responses:
        '200':
          description: Successful retrieval of available charging stations.`}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* TAB 6: TESTING */}
              {activeTab === "testing" && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 border-b border-border/40">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Automated Test Suite & Coverage (87.3%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200">
                        <span className="text-[10px] text-muted-foreground block">Unit Tests</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">142 Passed</span>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200">
                        <span className="text-[10px] text-muted-foreground block">Integration</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">58 Passed</span>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200">
                        <span className="text-[10px] text-muted-foreground block">Security Scans</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">0 Vulnerabilities</span>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                        <span className="text-[10px] text-muted-foreground block">Coverage</span>
                        <span className="font-bold text-primary text-sm">87.3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* TAB 8: MONITORING */}
              {activeTab === "monitoring" && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 border-b border-border/40">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" /> Live Request Telemetry & SLA Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="h-48 w-full rounded-lg bg-slate-900 p-4 text-white flex items-end justify-between gap-2 border border-slate-800">
                      {record.monitoringSummary.requestTrend7Days.map((t) => (
                        <div key={t.day} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full rounded-t bg-primary transition-all hover:bg-blue-400"
                            style={{ height: `${(t.requests / 30000) * 100}%` }}
                          />
                          <span className="text-[9px] text-slate-400 font-mono">{t.day}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* FALLBACK FOR OTHER TABS */}
              {["integration", "deployment", "ai_assessment", "summary", "attachments", "review_approval", "system_info"].includes(activeTab) && (
                <Card className="border-border/80 shadow-xs p-6 text-center text-xs text-muted-foreground">
                  <Sparkles className="mx-auto h-8 w-8 text-primary mb-2 animate-bounce" />
                  <h3 className="font-bold text-sm text-foreground">Interactive Module Ready</h3>
                  <p className="mt-1">Detailed enterprise view loaded for tab: <span className="font-semibold text-primary">{activeTab}</span>.</p>
                </Card>
              )}
            </div>

            {/* Right Insights Panel (4 cols on desktop) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Overall Score Card */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b border-border/40">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Overall API Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">API Design</span>
                    <span className="font-bold text-slate-900 dark:text-white">90 / 100</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Security</span>
                    <span className="font-bold text-slate-900 dark:text-white">90 / 100</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Testing</span>
                    <span className="font-bold text-slate-900 dark:text-white">88 / 100</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Deployment</span>
                    <span className="font-bold text-slate-900 dark:text-white">88 / 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Operations</span>
                    <span className="font-bold text-slate-900 dark:text-white">89 / 100</span>
                  </div>
                </CardContent>
              </Card>

              {/* Key Highlights */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b border-border/40">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Key Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs space-y-2">
                  {[
                    "RESTful API design compliant",
                    "OAuth 2.0 authentication implemented",
                    "Rate limiting and throttling enabled",
                    "API documentation (OpenAPI) ready",
                    "Test coverage achieved 87.3%",
                    "Monitoring and analytics configured",
                  ].map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{h}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b border-border/40">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs space-y-2">
                  <Button variant="outline" size="sm" onClick={handleExportPDF} className="w-full justify-start text-xs h-8">
                    <FileText className="mr-2 h-3.5 w-3.5 text-primary" /> Generate API Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("documentation")} className="w-full justify-start text-xs h-8">
                    <FileCode className="mr-2 h-3.5 w-3.5 text-primary" /> View API Documentation
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsPostmanModalOpen(true)} className="w-full justify-start text-xs h-8">
                    <Play className="mr-2 h-3.5 w-3.5 text-orange-500" /> Test API in Postman
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("monitoring")} className="w-full justify-start text-xs h-8">
                    <Activity className="mr-2 h-3.5 w-3.5 text-emerald-500" /> View API Analytics Dashboard
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("security")} className="w-full justify-start text-xs h-8">
                    <ShieldCheck className="mr-2 h-3.5 w-3.5 text-blue-500" /> Run Security Scan
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(true)} className="w-full justify-start text-xs h-8">
                    <Calendar className="mr-2 h-3.5 w-3.5 text-purple-500" /> Schedule API Review
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
