import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import {
  Repeat,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Eye,
  Plus,
  Sparkles,
  FileCode,
  FileSpreadsheet,
  MoreHorizontal,
  Layers,
  Check,
  X,
  Clock,
  HelpCircle,
  Search,
  FileCheck,
  Award,
  ListChecks,
  FileArchive,
  ChevronDown,
  User,
  AlertCircle,
  Info,
  BookOpen,
  Send,
  Save,
  FolderPlus,
  Printer,
  History,
  Workflow,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  Box,
  Zap,
  Activity,
  Maximize2,
  Megaphone,
  Globe,
  Truck,
  ShieldAlert,
  Calendar,
  Tag,
  Share2,
  Users,
  CheckSquare,
  FileText,
  BadgeAlert,
  Wrench,
  Archive,
  RotateCcw,
} from "lucide-react";

import { plmService } from "@/services/plmService";
import type {
  PlmApprovalDecision,
  PlmFormInput,
  PlmRecord,
  PlmChecklistItem,
  PlmAttachment,
} from "@/services/types";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { PlmTabBar, type PlmTabId } from "@/components/erp/PlmTabBar";
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

export const Route = createFileRoute(
  "/development/research-innovation/product-lifecycle-management/new"
)({
  component: PlmPage,
});

/* Helper component for SVG Circular Gauge */
function CircularScoreGauge({
  score,
  size = 72,
  strokeWidth = 6,
  label,
  sublabel,
  color = "#10B981",
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {score}
          </span>
          <span className="text-[9px] text-slate-400 font-medium">/100</span>
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>}
      {sublabel && <span className="text-[10px] text-slate-500">{sublabel}</span>}
    </div>
  );
}

/* File Icon Selector helper */
function getFileIcon(type?: string, name?: string) {
  const n = (name || type || "").toLowerCase();
  if (n.endsWith(".zip") || n.endsWith(".tar") || n.endsWith(".gz")) {
    return <FileArchive className="h-4 w-4 text-amber-500 shrink-0" />;
  }
  if (n.endsWith(".xlsx") || n.endsWith(".csv") || n.endsWith(".xls")) {
    return <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />;
  }
  if (n.endsWith(".pdf")) {
    return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
  }
  return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
}

export function PlmPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<PlmTabId>("overview");

  // Dialog & Modal States
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEcrModal, setShowEcrModal] = useState(false);
  const [showEcoModal, setShowEcoModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showAuditLogDrawer, setShowAuditLogDrawer] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAiReportModal, setShowAiReportModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  // New file upload state
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Engineering");

  // Main Data Query
  const { data: record, isLoading } = useQuery({
    queryKey: ["plm-record"],
    queryFn: plmService.fetchRecord,
  });

  // Local Form state
  const [formData, setFormData] = useState<Partial<PlmFormInput>>({
    plmProjectName: "",
    productName: "",
    productCategory: "",
    productFamily: "",
    productVersion: "",
    businessUnit: "",
    productDescription: "",
    productPriority: "High",
    productConfigurationId: "",
    bomVersion: "",
    hardwareVersion: "",
    firmwareVersion: "",
    softwareVersion: "",
    configurationBaseline: "",
    ecrNumber: "",
    ecoNumber: "",
    revisionNumber: "",
    productChangeSummary: "",
    obsolescenceRisk: "Medium",
    endOfLifePlan: "Planned for FY2031",
    approvalDecision: "Approved",
    reviewComments: "Product lifecycle is aligned and ready to proceed.",
    approvalDate: "18 Jun 2024",
    recommendation: "Continue Lifecycle",
  });

  const rec = useMemo(() => {
    if (!record) return null;
    return record;
  }, [record]);

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<PlmFormInput>) => plmService.saveDraft(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plm-record"] });
      toast.success("Draft saved successfully.");
    },
    onError: (err: any) => toast.error(`Failed to save draft: ${err.message}`),
  });

  const submitMutation = useMutation({
    mutationFn: () => plmService.submitForReview(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plm-record"] });
      toast.success("PLM Report submitted for Executive Board Review (Stage 4).");
    },
    onError: (err: any) => toast.error(`Submission failed: ${err.message}`),
  });

  const reviewMutation = useMutation({
    mutationFn: (args: {
      id: string;
      decision: PlmApprovalDecision;
      comments?: string;
    }) => plmService.reviewDecision(args),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plm-record"] });
      if (variables.decision === "Approved") {
        toast.success("PLM REPORT APPROVED! Product lifecycle active and continued.");
      } else if (variables.decision === "Approved with Conditions") {
        toast.info("Approved with Conditions. Minor lifecycle improvements requested.");
      } else if (variables.decision === "Revision Required") {
        toast.warning("Revision Requested. Returned for engineering review.");
      } else if (variables.decision === "End-of-Life Approved") {
        toast.warning("END-OF-LIFE APPROVED! Product retirement process initiated.");
      } else {
        toast.error("PLM Record Rejected & Archived.");
      }
    },
    onError: (err: any) => toast.error(`Executive Review failed: ${err.message}`),
  });

  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: 1 | 2 | 3 | 4) => plmService.advanceStage(targetStage),
    onSuccess: (_, targetStage) => {
      queryClient.invalidateQueries({ queryKey: ["plm-record"] });
      toast.success(`PLM stage set to Stage ${targetStage}`);
    },
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: (args: { section: "engineering" | "manufacturing" | "service"; itemId: string }) =>
      plmService.toggleChecklistItem(args.section, args.itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plm-record"] });
      toast.success("Lifecycle checklist item updated.");
    },
  });

  if (isLoading || !rec) {
    return (
      <AppShell
        title="Product Lifecycle Management (PLM)"
        breadcrumb={breadcrumb ?? "Research & Innovation Development"}
        tabs={tabs ?? <ResearchInnovationTabBar />}
      >
        <div className="flex h-96 w-full items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-muted-foreground">Loading Product Lifecycle Management record...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Helper for workflow status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">Approved</Badge>;
      case "Approved with Conditions":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">Approved with Conditions</Badge>;
      case "Executive Review":
      case "In Review":
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30">Executive Review</Badge>;
      case "In Progress":
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30">In Progress</Badge>;
      case "Revision Required":
        return <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30">Revision Required</Badge>;
      case "End-of-Life Approved":
      case "End-of-Life":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30">End-of-Life Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppShell
      title="Product Lifecycle Management (PLM)"
      breadcrumb={breadcrumb ?? "Research & Innovation Development"}
      description="Manage digital thread traceability, ECO/ECN change control, BOM revisions, and End-of-Life sunsetting."
      tabs={tabs ?? <ResearchInnovationTabBar />}
    >
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Product Lifecycle Management (PLM)
              <Repeat className="h-5 w-5 text-blue-600" />
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 font-semibold">
              Digital Thread Control
            </Badge>
          </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWorkflowModal(true)}
                className="gap-1.5 text-xs"
              >
                <Workflow className="h-3.5 w-3.5 text-blue-600" />
                PLM Lifecycle (4 Stages & 5-Way Decision)
              </Button>
            </div>
          </div>

      {/* 3. Record Header Bar (2 Rows matching screenshot 2_24.png) */}
      <div className="mx-auto max-w-[1600px] px-4 pt-4">
        <Card className="border-border shadow-xs bg-white dark:bg-slate-900 mb-4">
          <CardContent className="p-4 flex flex-col gap-3">
            {/* Row 1 */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border/60">
              <div className="flex flex-wrap items-center gap-6 text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">PLM ID</span>
                  <span className="font-mono font-bold text-foreground">{rec.plmId}</span>
                </div>
                <div className="h-7 w-px bg-border hidden sm:block" />
                <div>
                  <span className="text-muted-foreground block font-medium">Form Code</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{rec.formCode}</span>
                </div>
                <div className="h-7 w-px bg-border hidden sm:block" />
                <div className="min-w-[220px]">
                  <span className="text-muted-foreground block font-medium">Product Lifecycle Project</span>
                  <Input
                    value={formData.plmProjectName || rec.plmProjectName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, plmProjectName: e.target.value }))}
                    className="h-7 text-xs font-semibold text-foreground bg-slate-50 dark:bg-slate-800/80 border-slate-200"
                  />
                </div>
                <div className="h-7 w-px bg-border hidden sm:block" />
                <div>
                  <span className="text-muted-foreground block font-medium">Product Version</span>
                  <span className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                    {rec.productVersion}
                  </span>
                </div>
                <div className="h-7 w-px bg-border hidden sm:block" />
                <div>
                  <span className="text-muted-foreground block font-medium">Workflow Status</span>
                  {getStatusBadge(rec.workflowStatus)}
                </div>
                <div className="h-7 w-px bg-border hidden sm:block" />
                <div>
                  <span className="text-muted-foreground block font-medium">Created On</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{rec.createdOn}</span>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveDraftMutation.mutate(formData)}
                  disabled={saveDraftMutation.isPending}
                  className="gap-1.5 text-xs"
                >
                  <Save className="h-3.5 w-3.5 text-slate-600" />
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-bold"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit for Review
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 text-xs">
                    <DropdownMenuItem onClick={() => setShowConfigModal(true)} className="gap-2">
                      <Box className="h-4 w-4 text-blue-600" />
                      View Product Configuration
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowEcrModal(true)} className="gap-2">
                      <Wrench className="h-4 w-4 text-amber-600" />
                      Create Engineering Change (ECR)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowEcoModal(true)} className="gap-2">
                      <FileCheck className="h-4 w-4 text-emerald-600" />
                      Create Change Order (ECO)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowAiReportModal(true)} className="gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      Generate AI Lifecycle Report
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowAuditLogDrawer(true)} className="gap-2">
                      <History className="h-4 w-4 text-slate-600" />
                      View Audit Log
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                {/* Linked Product Chip */}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">Linked Product:</span>
                  <button
                    type="button"
                    onClick={() => toast.info(`Navigating to product record: ${rec.linkedProduct.name}`)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                  >
                    <Box className="h-3.5 w-3.5 text-blue-600" />
                    {rec.linkedProduct.name}
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </button>
                </div>

                {/* Product Owner */}
                <div className="flex items-center gap-1.5 border-l border-border pl-3">
                  <span className="text-muted-foreground font-medium">Product Owner:</span>
                  <div className="flex items-center gap-1.5">
                    <img src={rec.productOwner.avatar} alt={rec.productOwner.name} className="h-5 w-5 rounded-full object-cover" />
                    <span className="font-semibold text-foreground">{rec.productOwner.name}</span>
                  </div>
                </div>

                {/* Lifecycle Manager */}
                <div className="flex items-center gap-1.5 border-l border-border pl-3">
                  <span className="text-muted-foreground font-medium">Lifecycle Manager:</span>
                  <div className="flex items-center gap-1.5">
                    <img src={rec.lifecycleManager.avatar} alt={rec.lifecycleManager.name} className="h-5 w-5 rounded-full object-cover" />
                    <span className="font-semibold text-foreground">{rec.lifecycleManager.name}</span>
                  </div>
                </div>

                {/* Business Unit */}
                <div className="flex items-center gap-1.5 border-l border-border pl-3">
                  <span className="text-muted-foreground font-medium">Business Unit:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.businessUnit}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">Product Category:</span>
                  <Badge variant="secondary" className="font-semibold bg-slate-100 dark:bg-slate-800">
                    {rec.productCategory}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">Product Family:</span>
                  <Badge variant="outline" className="font-semibold bg-slate-50 dark:bg-slate-800">
                    {rec.productFamily}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">Priority:</span>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold border-amber-200">
                    {rec.productPriority}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4-Stage Stepper Bar */}
        <div className="mb-4 rounded-xl border border-blue-200/60 bg-blue-50/40 dark:bg-blue-950/20 p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                4-Stage PLM Digital Thread Workflow
              </span>
            </div>
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              Current Stage: <strong className="font-bold">{rec.workflowStageLabel}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Stage 1 */}
            <button
              type="button"
              onClick={() => advanceStageMutation.mutate(1)}
              className={`flex items-start gap-2 rounded-lg p-2.5 text-left border transition-all cursor-pointer ${
                rec.stage === 1
                  ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                  : rec.stage > 1
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  rec.stage === 1
                    ? "bg-blue-600 text-white"
                    : rec.stage > 1
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                {rec.stage > 1 ? <Check className="h-3 w-3" /> : "1"}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-[11px]">Stage 1: Config Mgmt</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">BOM & HW/FW baseline.</p>
              </div>
            </button>

            {/* Stage 2 */}
            <button
              type="button"
              onClick={() => advanceStageMutation.mutate(2)}
              className={`flex items-start gap-2 rounded-lg p-2.5 text-left border transition-all cursor-pointer ${
                rec.stage === 2
                  ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                  : rec.stage > 2
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  rec.stage === 2
                    ? "bg-blue-600 text-white"
                    : rec.stage > 2
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                {rec.stage > 2 ? <Check className="h-3 w-3" /> : "2"}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-[11px]">Stage 2: Lifecycle Assess</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Eng, Mfg & Service readiness.</p>
              </div>
            </button>

            {/* Stage 3 */}
            <button
              type="button"
              onClick={() => advanceStageMutation.mutate(3)}
              className={`flex items-start gap-2 rounded-lg p-2.5 text-left border transition-all cursor-pointer ${
                rec.stage === 3
                  ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                  : rec.stage > 3
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  rec.stage === 3
                    ? "bg-blue-600 text-white"
                    : rec.stage > 3
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                {rec.stage > 3 ? <Check className="h-3 w-3" /> : "3"}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-[11px]">Stage 3: ECR / ECO Mgmt</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Evaluate revision changes.</p>
              </div>
            </button>

            {/* Stage 4 */}
            <button
              type="button"
              onClick={() => advanceStageMutation.mutate(4)}
              className={`flex items-start gap-2 rounded-lg p-2.5 text-left border transition-all cursor-pointer ${
                rec.stage === 4
                  ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  rec.stage === 4 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                4
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-[11px]">Stage 4: Executive Board</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">5-Way outcome decision.</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation Shell */}
      <div className="mx-auto max-w-[1600px] px-4">
        <PlmTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scores={{
            configuration: rec.configurationScore,
            engineering: rec.engineeringScore,
            manufacturing: rec.manufacturingScore,
            service: rec.serviceScore,
            risk: rec.riskScore,
            ai: rec.aiLifecycleScore,
            overall: rec.overallProductHealthScore,
          }}
          attachmentsCount={rec.attachments.length}
          status={rec.workflowStatus}
        />
      </div>

      {/* 5. Main Dashboard Grid Layout */}
      <div className="mx-auto max-w-[1600px] px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Main Content Column */}
          <div className="lg:col-span-9 space-y-6">
            {activeTab !== "overview" ? (
              <Card className="border-border bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
                <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                    <Repeat className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                    {activeTab.replace("_", " ")} Section View
                  </h3>
                  <p className="max-w-md text-sm text-muted-foreground">
                    This section view is aggregated under the <strong>Overview tab</strong> single-source-of-truth dashboard. Click below to return to the interactive Overview panel.
                  </p>
                  <Button onClick={() => setActiveTab("overview")} className="bg-blue-600 text-white">
                    Return to Overview Tab
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* ------------------------------------------------------------- */}
                {/* PANEL 1: Product Lifecycle Overview */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                        1
                      </div>
                      <CardTitle className="text-base font-bold">Product Lifecycle Overview</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Left Form Inputs */}
                      <div className="md:col-span-7 space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Product Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={formData.productName || rec.productName}
                              onChange={(e) => setFormData((prev) => ({ ...prev, productName: e.target.value }))}
                              className="h-8 text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Product Category <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.productCategory || rec.productCategory}
                              onChange={(e) => setFormData((prev) => ({ ...prev, productCategory: e.target.value }))}
                              className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <option value="AC EV Charger">AC EV Charger</option>
                              <option value="DC Fast Charger">DC Fast Charger</option>
                              <option value="Industrial Energy Storage">Industrial Energy Storage</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Product Family <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={formData.productFamily || rec.productFamily}
                              onChange={(e) => setFormData((prev) => ({ ...prev, productFamily: e.target.value }))}
                              className="h-8 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Business Unit <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={formData.businessUnit || rec.businessUnit}
                              onChange={(e) => setFormData((prev) => ({ ...prev, businessUnit: e.target.value }))}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Lifecycle Stage
                            </label>
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border-amber-200">
                              {rec.lifecycleStage}
                            </Badge>
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Product Status
                            </label>
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold border-emerald-200">
                              {rec.productStatus}
                            </Badge>
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Priority
                            </label>
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold border-red-200">
                              {rec.productPriority}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                            Product Description <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            rows={2}
                            value={formData.productDescription || rec.productDescription}
                            onChange={(e) => setFormData((prev) => ({ ...prev, productDescription: e.target.value }))}
                            className="text-xs resize-none"
                          />
                        </div>
                      </div>

                      {/* Right Product Image Panel (EV Wallbox Charger image matching screenshot 2_24.png) */}
                      <div className="md:col-span-5 flex flex-col justify-center items-center rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 text-center">
                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xs mb-2 max-w-[200px]">
                          <img
                            src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&auto=format&fit=crop&q=80"
                            alt="Smart EV Charger Product Wallbox"
                            className="h-32 w-full object-cover rounded-lg"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Smart EV Charger AC 7kW</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Model: AC-7KW-EVSE-V1.2</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Grid for Configuration & Engineering Cards (Panels 2 & 3) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ------------------------------------------------------------- */}
                  {/* PANEL 2: Product Configuration Management */}
                  {/* ------------------------------------------------------------- */}
                  <Card className="border-border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b border-border/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                              2
                            </div>
                            <CardTitle className="text-base font-bold">Product Configuration Management</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800">
                            Baseline v1.2
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 pb-2 px-4 space-y-2.5 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-muted-foreground block font-medium">Product Configuration ID</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{rec.productConfigurationId}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block font-medium">BOM Version</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{rec.bomVersion}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-muted-foreground block font-medium">Hardware</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{rec.hardwareVersion}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block font-medium">Firmware</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{rec.firmwareVersion}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block font-medium">Software</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{rec.softwareVersion}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-muted-foreground block font-medium">Configuration Baseline</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{rec.configurationBaseline}</span>
                        </div>
                      </CardContent>
                    </div>

                    {/* Computed Score Footer Tile */}
                    <div className="p-3 border-t border-border/60 bg-slate-50/60 dark:bg-slate-800/40 rounded-b-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Configuration Score
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-md font-bold text-sm">
                        <span>{rec.configurationScore}</span>
                        <span className="text-xs font-normal opacity-80">/100</span>
                      </div>
                    </div>
                  </Card>

                  {/* ------------------------------------------------------------- */}
                  {/* PANEL 3: Engineering Lifecycle */}
                  {/* ------------------------------------------------------------- */}
                  <Card className="border-border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b border-border/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                              3
                            </div>
                            <CardTitle className="text-base font-bold">Engineering Lifecycle</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800">
                            6 Deliverables
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 pb-2 px-4">
                        <div className="space-y-2">
                          {rec.engineeringChecklist.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleChecklistMutation.mutate({ section: "engineering", itemId: item.id })}
                              className="w-full flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2 text-xs transition-hover hover:bg-slate-100/60 dark:hover:bg-slate-800/80 cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                                    item.completed ? "bg-emerald-600 text-white" : "border border-slate-300 dark:border-slate-600"
                                  }`}
                                >
                                  {item.completed && <Check className="h-3 w-3" />}
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono bg-slate-200/60 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                {item.sourceStream}
                              </span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </div>

                    {/* Computed Score Footer Tile */}
                    <div className="p-3 border-t border-border/60 bg-slate-50/60 dark:bg-slate-800/40 rounded-b-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Engineering Readiness Score
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-md font-bold text-sm">
                        <span>{rec.engineeringScore}</span>
                        <span className="text-xs font-normal opacity-80">/100</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Grid for Manufacturing & Service Cards (Panels 4 & 5) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ------------------------------------------------------------- */}
                  {/* PANEL 4: Manufacturing Lifecycle */}
                  {/* ------------------------------------------------------------- */}
                  <Card className="border-border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b border-border/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                              4
                            </div>
                            <CardTitle className="text-base font-bold">Manufacturing Lifecycle</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800">
                            6 Deliverables
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 pb-2 px-4">
                        <div className="space-y-2">
                          {rec.manufacturingChecklist.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleChecklistMutation.mutate({ section: "manufacturing", itemId: item.id })}
                              className="w-full flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2 text-xs transition-hover hover:bg-slate-100/60 dark:hover:bg-slate-800/80 cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                                    item.completed ? "bg-emerald-600 text-white" : "border border-slate-300 dark:border-slate-600"
                                  }`}
                                >
                                  {item.completed && <Check className="h-3 w-3" />}
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono bg-slate-200/60 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                {item.sourceStream}
                              </span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </div>

                    {/* Computed Score Footer Tile */}
                    <div className="p-3 border-t border-border/60 bg-slate-50/60 dark:bg-slate-800/40 rounded-b-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Manufacturing Lifecycle Score
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-md font-bold text-sm">
                        <span>{rec.manufacturingScore}</span>
                        <span className="text-xs font-normal opacity-80">/100</span>
                      </div>
                    </div>
                  </Card>

                  {/* ------------------------------------------------------------- */}
                  {/* PANEL 5: Service & Support Lifecycle */}
                  {/* ------------------------------------------------------------- */}
                  <Card className="border-border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b border-border/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                              5
                            </div>
                            <CardTitle className="text-base font-bold">Service & Support Lifecycle</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800">
                            5 Deliverables
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 pb-2 px-4">
                        <div className="space-y-2">
                          {rec.serviceChecklist.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleChecklistMutation.mutate({ section: "service", itemId: item.id })}
                              className="w-full flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2 text-xs transition-hover hover:bg-slate-100/60 dark:hover:bg-slate-800/80 cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                                    item.completed ? "bg-emerald-600 text-white" : "border border-slate-300 dark:border-slate-600"
                                  }`}
                                >
                                  {item.completed && <Check className="h-3 w-3" />}
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono bg-slate-200/60 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                {item.sourceStream}
                              </span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </div>

                    {/* Computed Score Footer Tile */}
                    <div className="p-3 border-t border-border/60 bg-slate-50/60 dark:bg-slate-800/40 rounded-b-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Service Lifecycle Score
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-md font-bold text-sm">
                        <span>{rec.serviceScore}</span>
                        <span className="text-xs font-normal opacity-80">/100</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 6: Change & Obsolescence Management */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                          6
                        </div>
                        <CardTitle className="text-base font-bold">Change & Obsolescence Management</CardTitle>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-mono font-bold">
                        Obsolescence Risk: Medium
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-9 space-y-3 text-xs">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <span className="text-muted-foreground block font-medium mb-1">Engineering Change Request (ECR)</span>
                            <button
                              type="button"
                              onClick={() => setShowEcrModal(true)}
                              className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 font-mono font-bold text-blue-700 dark:text-blue-300 border border-blue-200"
                            >
                              {rec.ecrNumber}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>

                          <div>
                            <span className="text-muted-foreground block font-medium mb-1">Engineering Change Order (ECO)</span>
                            <button
                              type="button"
                              onClick={() => setShowEcoModal(true)}
                              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 font-mono font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                            >
                              {rec.ecoNumber}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>

                          <div>
                            <span className="text-muted-foreground block font-medium mb-1">Revision Number</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{rec.revisionNumber}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-muted-foreground block font-medium mb-1">Obsolescence Risk</span>
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border-amber-200">
                              {rec.obsolescenceRisk}
                            </Badge>
                          </div>

                          <div>
                            <span className="text-muted-foreground block font-medium mb-1">End-of-Life Plan</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.endOfLifePlan}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-muted-foreground block font-medium mb-1">Product Change Summary</span>
                          <p className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                            {rec.productChangeSummary}
                          </p>
                        </div>
                      </div>

                      {/* Score Badge Card */}
                      <div className="md:col-span-3 flex flex-col items-center justify-center rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-4 text-center">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">Lifecycle Risk Score</span>
                        <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 px-4 py-2 rounded-lg font-bold text-xl">
                          <span>{rec.riskScore}</span>
                          <span className="text-xs font-normal opacity-80">/100</span>
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-2">Monitored thermal revision change.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 7: AI Lifecycle Assessment */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                          7
                        </div>
                        <CardTitle className="text-base font-bold">AI Lifecycle Assessment</CardTitle>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 gap-1 border-purple-200 font-semibold">
                        <Sparkles className="h-3 w-3 text-purple-600" />
                        AI Digital Thread Assessment
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-9 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 w-1/3">
                            AI Product Health Analysis
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium flex-1">
                            {rec.aiProductHealthAnalysis}
                          </span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 w-1/3">
                            AI Lifecycle Prediction
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium flex-1">
                            {rec.aiLifecyclePrediction}
                          </span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 w-1/3">
                            AI Obsolescence Prediction
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium flex-1">
                            {rec.aiObsolescencePrediction}
                          </span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-emerald-200/80 dark:border-emerald-900/40 p-2.5 bg-emerald-50/40 dark:bg-emerald-950/20">
                          <span className="font-semibold text-emerald-900 dark:text-emerald-300 w-1/3">
                            AI Reliability Forecast
                          </span>
                          <span className="text-emerald-800 dark:text-emerald-200 font-bold flex-1">
                            {rec.aiReliabilityForecast}
                          </span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-purple-200/80 dark:border-purple-900/40 p-2.5 bg-purple-50/40 dark:bg-purple-950/20">
                          <span className="font-semibold text-purple-900 dark:text-purple-300 w-1/3">
                            AI Improvement Suggestions
                          </span>
                          <span className="text-purple-800 dark:text-purple-200 font-medium flex-1">
                            {rec.aiImprovementSuggestions}
                          </span>
                          <Sparkles className="h-4 w-4 text-purple-600 shrink-0 ml-2" />
                        </div>
                      </div>

                      {/* AI Graphic Icon Card */}
                      <div className="md:col-span-3 flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-purple-200/60 dark:border-slate-700 p-4 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold shadow-sm mb-2">
                          AI
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">AI Lifecycle Score</span>
                        <div className="mt-2 flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg font-bold text-lg">
                          <span>{rec.aiLifecycleScore}</span>
                          <span className="text-xs font-normal opacity-80">/100</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 8: Product Lifecycle Summary */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                          8
                        </div>
                        <CardTitle className="text-base font-bold">Product Lifecycle Summary</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 font-semibold">
                        Digital Thread Gauges
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-items-center">
                      <CircularScoreGauge
                        score={rec.engineeringScore}
                        label="Engineering Score"
                        color="#10B981"
                      />
                      <CircularScoreGauge
                        score={rec.manufacturingScore}
                        label="Manufacturing Score"
                        color="#10B981"
                      />
                      <CircularScoreGauge
                        score={rec.serviceScore}
                        label="Service Score"
                        color="#10B981"
                      />
                      <CircularScoreGauge
                        score={rec.riskScore}
                        label="Lifecycle Risk Score"
                        color="#F59E0B"
                      />
                      {/* Overall Health Score — Larger Gauge */}
                      <div className="col-span-2 sm:col-span-1 flex flex-col items-center">
                        <CircularScoreGauge
                          score={rec.overallProductHealthScore}
                          size={96}
                          strokeWidth={8}
                          label="Overall Product Health Score"
                          color="#059669"
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Recommendation:</span>
                        <select
                          value={formData.recommendation || rec.recommendation}
                          onChange={(e) => setFormData((prev) => ({ ...prev, recommendation: e.target.value }))}
                          className="h-8 rounded-md border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <option value="Continue Lifecycle">Continue Lifecycle</option>
                          <option value="Minor Improvements Required">Minor Improvements Required</option>
                          <option value="Initiate End-of-Life Plan">Initiate End-of-Life Plan</option>
                          <option value="Retire Product">Retire Product</option>
                        </select>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        All 5 stream lifecycles aggregated. Product digital thread active.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 9: Attachments */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                          9
                        </div>
                        <CardTitle className="text-base font-bold">Attachments</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUploadDialog(true)}
                        className="gap-1.5 text-xs"
                      >
                        <Upload className="h-3.5 w-3.5 text-blue-600" />
                        Upload Attachment
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {rec.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2.5 transition-hover hover:bg-slate-100/60 dark:hover:bg-slate-800/80"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {getFileIcon(att.type, att.name)}
                            <div className="truncate">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={att.name}>
                                {att.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{att.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toast.success(`Downloading ${att.name}`)}
                            className="p-1 text-slate-500 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
                            title="Download Attachment"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 text-right">
                      <button
                        type="button"
                        onClick={() => setShowUploadDialog(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        View All Attachments (8) <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 10: Review & Approval */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                          10
                        </div>
                        <CardTitle className="text-base font-bold">Review & Approval</CardTitle>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold border-emerald-200">
                        Executive Review Board (5-Way Decision Engine)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-6">
                    {/* Reviewers Table */}
                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-2.5">Role</th>
                            <th className="p-2.5">Person</th>
                            <th className="p-2.5">Decision</th>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Comments</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {rec.reviewers.map((rev) => (
                            <tr key={rev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{rev.role}</td>
                              <td className="p-2.5">
                                <div className="flex items-center gap-1.5">
                                  {rev.avatar && (
                                    <img src={rev.avatar} alt={rev.person} className="h-5 w-5 rounded-full object-cover" />
                                  )}
                                  <span className="font-medium text-slate-700 dark:text-slate-300">{rev.person}</span>
                                </div>
                              </td>
                              <td className="p-2.5">
                                {rev.decision === "Approved" ? (
                                  <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                                    Approved
                                  </span>
                                ) : rev.decision === "Pending" ? (
                                  <span className="inline-flex items-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 text-[10px] font-medium">
                                    Pending
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                                    {rev.decision}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-slate-500">{rev.date}</td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">{rev.comments}</td>
                              <td className="p-2.5 text-center">
                                {rev.status === "Completed" ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500 inline-block" />
                                ) : (
                                  <Clock className="h-4 w-4 text-slate-400 inline-block" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 5-Way Executive Decision Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs pt-2">
                      <div className="md:col-span-4">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Approval Decision (5 Outcomes) <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.approvalDecision || rec.approvalDecision}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              approvalDecision: e.target.value as PlmApprovalDecision,
                            }))
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <option value="Approved">Approved (Continue Lifecycle)</option>
                          <option value="Approved with Conditions">Approved with Conditions (Minor Actions)</option>
                          <option value="Revision Required">Revision Required (Rework Plan)</option>
                          <option value="End-of-Life Approved">End-of-Life Approved (Initiate Retirement)</option>
                          <option value="Rejected">Rejected (Archive Record)</option>
                        </select>
                      </div>

                      <div className="md:col-span-5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">
                            Review Comments <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {(formData.reviewComments || rec.reviewComments || "").length}/2000
                          </span>
                        </div>
                        <Textarea
                          rows={2}
                          maxLength={2000}
                          value={formData.reviewComments || rec.reviewComments}
                          onChange={(e) => setFormData((prev) => ({ ...prev, reviewComments: e.target.value }))}
                          className="text-xs resize-none"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Approval Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={formData.approvalDate || rec.approvalDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, approvalDate: e.target.value }))}
                          className="h-9 text-xs"
                        />
                        <Button
                          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 font-bold"
                          onClick={() =>
                            reviewMutation.mutate({
                              id: rec.id,
                              decision: formData.approvalDecision || rec.approvalDecision,
                              comments: formData.reviewComments || rec.reviewComments,
                            })
                          }
                          disabled={reviewMutation.isPending}
                        >
                          Record Executive Decision
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 11: System Information */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                          11
                        </div>
                        <CardTitle className="text-base font-bold">System Information</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs font-mono">
                        Digital Thread Logged
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                      <div className="md:col-span-8 grid grid-cols-2 gap-y-3 gap-x-6">
                        <div>
                          <span className="text-muted-foreground block font-medium">Created By</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.createdBy}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Created Date</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{rec.createdDate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Last Modified By</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.lastModifiedBy}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Last Modified Date</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{rec.lastModifiedDate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Workflow Stage</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{rec.workflowStageLabel}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Product Version</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.productVersion}</span>
                        </div>
                      </div>

                      <div className="md:col-span-4 flex flex-col justify-center space-y-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                        <button
                          type="button"
                          onClick={() => setShowAuditLogDrawer(true)}
                          className="flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 cursor-pointer"
                        >
                          <span>View Audit Log</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTimelineModal(true)}
                          className="flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 cursor-pointer"
                        >
                          <span>View Product Timeline</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowWorkflowModal(true)}
                          className="flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 cursor-pointer"
                        >
                          <span>View PLM Workflow</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Sticky Sidebar Panel */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-[110px] space-y-4">
              {/* Overall Product Health Score Gauge Card */}
              <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                <CardHeader className="pb-2 border-b border-border/60">
                  <CardTitle className="text-sm font-bold">Overall Product Health Score</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col items-center">
                  <CircularScoreGauge
                    score={rec.overallProductHealthScore}
                    size={110}
                    strokeWidth={10}
                    color="#059669"
                  />

                  {/* Breakdown List */}
                  <div className="w-full mt-4 space-y-2 text-xs border-t border-border/60 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Engineering</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rec.engineeringScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Manufacturing</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rec.manufacturingScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Service</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rec.serviceScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Risk</span>
                      <span className="font-bold text-amber-600">{rec.riskScore}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lifecycle Stage Progress (12 Ordered Stages matching screenshot 2_24.png) */}
              <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                <CardHeader className="pb-2 border-b border-border/60">
                  <CardTitle className="text-sm font-bold">Lifecycle Stage Progress</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2 text-xs">
                  {rec.stageProgress.map((sp) => {
                    const isCurrent = sp.name === rec.lifecycleStage;
                    return (
                      <div key={sp.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              sp.status === "Completed"
                                ? "bg-emerald-500"
                                : isCurrent
                                ? "bg-amber-500 animate-ping"
                                : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          />
                          <span
                            className={`font-semibold ${
                              isCurrent
                                ? "text-amber-600 dark:text-amber-400 font-bold"
                                : sp.status === "Completed"
                                ? "text-slate-700 dark:text-slate-300"
                                : "text-slate-400"
                            }`}
                          >
                            {sp.name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono ${
                            isCurrent
                              ? "text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded"
                              : sp.status === "Completed"
                              ? "text-emerald-600 dark:text-emerald-400 font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {sp.status}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                <CardHeader className="pb-2 border-b border-border/60">
                  <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowEcrModal(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <span>Create Engineering Change (ECR)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEcoModal(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <FileCheck className="h-4 w-4 text-blue-600" />
                    <span>Create Change Order (ECO)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTimelineModal(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>View Product Timeline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAiReportModal(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span>Generate AI Lifecycle Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowConfigModal(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Box className="h-4 w-4 text-blue-600" />
                    <span>View Product Configuration</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.success("Exporting PLM Report...")}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Printer className="h-4 w-4 text-blue-600" />
                    <span>Export PLM Report</span>
                  </button>
                </CardContent>
              </Card>

              {/* Lifecycle Timeline Component */}
              <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                <CardHeader className="pb-2 border-b border-border/60 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold">Lifecycle Timeline</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-4 text-xs space-y-3">
                  <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {rec.lifecycleTimeline.map((ms) => (
                      <div key={ms.id} className="relative flex flex-col">
                        <div
                          className={`absolute -left-4 top-1 h-3 w-3 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                            ms.completed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        />
                        <span className={`font-bold ${ms.completed ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                          {ms.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{ms.date}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-right border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => setShowTimelineModal(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      View Full Timeline <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOGS & MODALS */}
      {/* --------------------------------------------------------------------- */}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload PLM Attachment
            </DialogTitle>
            <DialogDescription>
              Add engineering records, BOM configuration packages, or service manuals to the product digital thread.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-xs">
            <div>
              <label className="font-semibold block mb-1">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full h-8 rounded-md border px-3 text-xs"
              >
                <option value="Engineering">Engineering Record</option>
                <option value="Configuration">Configuration Package</option>
                <option value="Manufacturing">Manufacturing Record</option>
                <option value="Service">Service Documentation</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">File Name</label>
              <Input
                placeholder="e.g. bom_configuration_v1.2.zip"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 text-white"
              onClick={() => {
                toast.success(`Uploaded "${uploadFileName || 'plm_attachment.pdf'}"!`);
                setShowUploadDialog(false);
              }}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create ECR Modal */}
      <Dialog open={showEcrModal} onOpenChange={setShowEcrModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-600" />
              Create Engineering Change Request (ECR)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            <div>
              <label className="font-semibold block mb-1">ECR Title</label>
              <Input defaultValue="Thermal Heat Dissipation Revision" className="h-8 text-xs" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Reason for Change</label>
              <Textarea rows={3} defaultValue="Upgrade thermal heatsink compound to reduce operating temperature by 6°C under peak EV load." className="text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" className="bg-amber-600 text-white" onClick={() => { toast.success("ECR-2024-0126 Created!"); setShowEcrModal(false); }}>
              Create ECR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create ECO Modal */}
      <Dialog open={showEcoModal} onOpenChange={setShowEcoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-600" />
              Create Engineering Change Order (ECO)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            <div>
              <label className="font-semibold block mb-1">Linked ECR</label>
              <Input defaultValue="ECR-2024-0125" readOnly className="h-8 text-xs font-mono font-bold bg-slate-100" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Implementation Plan</label>
              <Textarea rows={3} defaultValue="Update BOM to BOM-7KW-V1.3, update production assembly line SOP." className="text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" className="bg-emerald-600 text-white" onClick={() => { toast.success("ECO-2024-0099 Released!"); setShowEcoModal(false); }}>
              Release ECO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Configuration Modal */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-blue-600" />
              Product Configuration Baseline (CFG-SMART-AC-7KW)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
              <div><strong>BOM Version:</strong> BOM-7KW-V1.2</div>
              <div><strong>Hardware:</strong> HW-1.2.0</div>
              <div><strong>Firmware:</strong> FW-1.2.0</div>
              <div><strong>Software:</strong> SW-1.2.0</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Report Modal */}
      <Dialog open={showAiReportModal} onOpenChange={setShowAiReportModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Product Lifecycle Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="font-bold text-purple-900">Product Health & Obsolescence Prediction</p>
              <p className="text-purple-800 mt-1">
                Predicted active lifespan: 5.2 Years. Low obsolescence risk across MCU & power electronics components. Health Score: <strong>89/100</strong>.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workflow Engine Modal */}
      <Dialog open={showWorkflowModal} onOpenChange={setShowWorkflowModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-blue-600" />
              PLM Digital Thread Engine (4 Stages & 5-Way Decision)
            </DialogTitle>
            <DialogDescription>
              Aggregating live state across engineering, manufacturing, quality, service & documentation streams.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-xs">
            <div className="grid grid-cols-4 gap-2 text-center font-bold">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">Stage 1: Config</div>
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">Stage 2: Assess</div>
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">Stage 3: ECR/ECO</div>
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">Stage 4: Executive</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg leading-relaxed text-slate-700">
              <strong>Executive Board 5-Way Outcome Decisions:</strong>
              <br />
              • <strong>Approved:</strong> Product lifecycle continued and active.
              <br />
              • <strong>Approved with Conditions:</strong> Minor lifecycle improvements required.
              <br />
              • <strong>Revision Required:</strong> Engineering review required; returns to Stage 2.
              <br />
              • <strong>End-of-Life Approved:</strong> Terminal path initiating product retirement & config archiving.
              <br />
              • <strong>Rejected:</strong> Release project closed & archived.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit Log Drawer */}
      <Dialog open={showAuditLogDrawer} onOpenChange={setShowAuditLogDrawer}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Product Digital Thread Audit Log
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs max-h-96 overflow-y-auto">
            {rec.auditTrail.map((aud) => (
              <div key={aud.id} className="p-2.5 border-b border-border/60">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>{aud.action}</span>
                  <span className="text-muted-foreground font-normal">{aud.timestamp}</span>
                </div>
                <p className="text-muted-foreground mt-1">{aud.details}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">By {aud.user}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Timeline Modal */}
      <Dialog open={showTimelineModal} onOpenChange={setShowTimelineModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Full Product Lifecycle Timeline
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            {rec.lifecycleTimeline.map((ms) => (
              <div key={ms.id} className="flex items-center justify-between p-2.5 border rounded-lg">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{ms.title}</p>
                  <p className="text-[10px] text-muted-foreground">{ms.date}</p>
                </div>
                <Badge className={ms.completed ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}>
                  {ms.completed ? "Completed" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </AppShell>
);
}
