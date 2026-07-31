import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Rocket,
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
} from "lucide-react";

import { productReleaseService } from "@/services/productReleaseService";
import type {
  ProductReleaseApprovalDecision,
  ProductReleaseFormInput,
  ProductReleaseRecord,
  ProductReleaseChecklistItem,
  ProductReleaseAttachment,
} from "@/services/types";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import {
  ProductReleaseTabBar,
  type ProductReleaseTabId,
} from "@/components/erp/ProductReleaseTabBar";
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
  "/development/research-innovation/product-release-management/new"
)({
  component: ProductReleasePage,
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
  if (n.endsWith(".pptx") || n.endsWith(".ppt")) {
    return <FileText className="h-4 w-4 text-orange-500 shrink-0" />;
  }
  return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
}

function ProductReleasePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ProductReleaseTabId>("overview");

  // Dialog & Drawer States
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showReleaseNotesDialog, setShowReleaseNotesDialog] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showAuditLogDrawer, setShowAuditLogDrawer] = useState(false);
  const [showReleasePackageModal, setShowReleasePackageModal] = useState(false);
  const [showAiAnalyzerModal, setShowAiAnalyzerModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  // New file input state for upload modal
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Engineering");

  // Main Data Query
  const { data: record, isLoading } = useQuery({
    queryKey: ["product-release"],
    queryFn: productReleaseService.fetchRecord,
  });

  // Local Form state
  const [formData, setFormData] = useState<Partial<ProductReleaseFormInput>>({
    releaseProjectName: "",
    productName: "",
    productCategory: "",
    releaseName: "",
    releaseVersion: "",
    releaseType: "",
    releaseObjective: "",
    targetMarkets: ["India", "EU", "USA", "MEA"],
    plannedReleaseDate: "",
    releasePriority: "High",
    distributionPartner: "",
    inventoryAvailable: 2450,
    rolloutStrategy: "",
    productPricing: "",
    approvalDecision: "Approved",
    reviewComments: "All departments are aligned. Proceed with product launch.",
    approvalDate: "19 Jun 2024",
    recommendation: "Ready for Product Launch",
  });

  const rec = useMemo(() => {
    if (!record) return null;
    return record;
  }, [record]);

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<ProductReleaseFormInput>) =>
      productReleaseService.saveDraft(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-release"] });
      toast.success("Draft saved successfully.");
    },
    onError: (err: any) => toast.error(`Failed to save draft: ${err.message}`),
  });

  const submitMutation = useMutation({
    mutationFn: () => productReleaseService.submitForReview(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-release"] });
      toast.success("Product Release submitted for Executive Board Review (Stage 3).");
    },
    onError: (err: any) => toast.error(`Gate Check Failed: ${err.message}`),
  });

  const reviewMutation = useMutation({
    mutationFn: (args: {
      id: string;
      decision: ProductReleaseApprovalDecision;
      comments?: string;
    }) => productReleaseService.reviewDecision(args),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-release"] });
      if (variables.decision === "Approved") {
        toast.success("PRODUCT LAUNCH AUTHORIZED! Release status set to Approved & Sales Active.");
      } else if (variables.decision === "Approved with Conditions") {
        toast.info("Approved with Conditions. Pending minor actions.");
      } else if (variables.decision === "Revision Required") {
        toast.warning("Revision Requested. Returned to Readiness Assessment.");
      } else {
        toast.error("Release Project Rejected & Archived.");
      }
    },
    onError: (err: any) => toast.error(`Executive Review failed: ${err.message}`),
  });

  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: 1 | 2 | 3) => productReleaseService.advanceStage(targetStage),
    onSuccess: (_, targetStage) => {
      queryClient.invalidateQueries({ queryKey: ["product-release"] });
      toast.success(`Workflow stage set to Stage ${targetStage}`);
    },
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: (args: { section: "engineering" | "manufacturing" | "commercial"; itemId: string }) =>
      productReleaseService.toggleChecklistItem(args.section, args.itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-release"] });
      toast.success("Readiness checklist item updated.");
    },
  });

  if (isLoading || !rec) {
    return (
      <div className="flex h-96 w-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-muted-foreground">Loading Product Release Management record...</p>
        </div>
      </div>
    );
  }

  // Key Highlights calculation
  const keyHighlights = [
    { label: "All engineering deliverables complete", done: rec.engineeringScore >= 90 },
    { label: "Manufacturing line readiness confirmed", done: rec.manufacturingScore >= 90 },
    { label: "Inventory available for initial release", done: rec.inventoryAvailable > 0 },
    { label: "Marketing and sales kit ready", done: rec.commercialScore >= 85 },
    { label: "Regulatory and compliance in place", done: rec.regulatoryApproval },
  ];

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
      case "Rejected":
        return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16">
      {/* 1. Global Innovation Tab Bar */}
      <InnovationAreaTabs />

      {/* 2. Page Header & Breadcrumbs */}
      <div className="border-b border-border bg-white dark:bg-slate-900 px-6 py-3 shadow-xs">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Development</span>
            <ChevronRight className="h-3 w-3" />
            <span>Product Development</span>
            <ChevronRight className="h-3 w-3" />
            <span>Product Release Management</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">Product Release Management Form</span>
          </nav>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Product Release Management
                <Rocket className="h-5 w-5 text-blue-600" />
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 font-semibold">
                Release Gate Module
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
                Release Gate Workflow (3 Stages)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Record Header Bar (2 Rows) */}
      <div className="mx-auto max-w-[1600px] px-4 pt-4">
        <Card className="border-border shadow-xs bg-white dark:bg-slate-900 mb-4">
          <CardContent className="p-4 flex flex-col gap-3">
            {/* Row 1 */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border/60">
              <div className="flex flex-wrap items-center gap-6 text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">Release ID</span>
                  <span className="font-mono font-bold text-foreground">{rec.releaseId}</span>
                </div>
                <div className="h-7 w-px bg-border hidden sm:block" />
                <div>
                  <span className="text-muted-foreground block font-medium">Form Code</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{rec.formCode}</span>
                </div>
                <div className="h-7 w-px bg-border hidden sm:block" />
                <div className="min-w-[220px]">
                  <span className="text-muted-foreground block font-medium">Release Project</span>
                  <Input
                    value={formData.releaseProjectName || rec.releaseProjectName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, releaseProjectName: e.target.value }))}
                    className="h-7 text-xs font-semibold text-foreground bg-slate-50 dark:bg-slate-800/80 border-slate-200"
                  />
                </div>
                <div className="h-7 w-px bg-border hidden sm:block" />
                <div>
                  <span className="text-muted-foreground block font-medium">Release Version</span>
                  <span className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                    {rec.releaseVersion}
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
                    <DropdownMenuItem onClick={() => setShowReleasePackageModal(true)} className="gap-2">
                      <Download className="h-4 w-4 text-blue-600" />
                      Download Release Package (.ZIP)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowReleaseNotesDialog(true)} className="gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      Publish Release Notes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowAiAnalyzerModal(true)} className="gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      Run AI Release Analysis
                    </DropdownMenuItem>
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

                {/* Linked Documentation Chip */}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">Linked Documentation:</span>
                  <button
                    type="button"
                    onClick={() => toast.info(`Navigating to documentation record: ${rec.linkedDocumentation.code}`)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                    {rec.linkedDocumentation.code}
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </button>
                </div>

                {/* Release Manager */}
                <div className="flex items-center gap-1.5 border-l border-border pl-3">
                  <span className="text-muted-foreground font-medium">Release Manager:</span>
                  <div className="flex items-center gap-1.5">
                    <img src={rec.releaseManager.avatar} alt={rec.releaseManager.name} className="h-5 w-5 rounded-full object-cover" />
                    <span className="font-semibold text-foreground">{rec.releaseManager.name}</span>
                  </div>
                </div>

                {/* Planned Release Date */}
                <div className="flex items-center gap-1.5 border-l border-border pl-3">
                  <span className="text-muted-foreground font-medium">Planned Release Date:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    {rec.plannedReleaseDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">Release Type:</span>
                  <Badge variant="secondary" className="font-semibold bg-slate-100 dark:bg-slate-800">
                    {rec.releaseType}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">Release Priority:</span>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 font-semibold border-red-200">
                    {rec.releasePriority}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3-Stage Interactive Stage Stepper Bar */}
        <div className="mb-4 rounded-xl border border-blue-200/60 bg-blue-50/40 dark:bg-blue-950/20 p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                3-Stage Release Gate Lifecycle
              </span>
            </div>
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              Current Stage: <strong className="font-bold">{rec.workflowStageLabel}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Stage 1 */}
            <button
              type="button"
              onClick={() => advanceStageMutation.mutate(1)}
              className={`flex items-start gap-2.5 rounded-lg p-2.5 text-left border transition-all cursor-pointer ${
                rec.stage === 1
                  ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                  : rec.stage > 1
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  rec.stage === 1
                    ? "bg-blue-600 text-white"
                    : rec.stage > 1
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                {rec.stage > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Stage 1: Release Readiness Assessment</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Verify engineering, manufacturing, commercial & compliance streams. Trigger AI assessment.
                </p>
              </div>
            </button>

            {/* Stage 2 */}
            <button
              type="button"
              onClick={() => advanceStageMutation.mutate(2)}
              className={`flex items-start gap-2.5 rounded-lg p-2.5 text-left border transition-all cursor-pointer ${
                rec.stage === 2
                  ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                  : rec.stage > 2
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  rec.stage === 2
                    ? "bg-blue-600 text-white"
                    : rec.stage > 2
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                {rec.stage > 2 ? <Check className="h-3.5 w-3.5" /> : "2"}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Stage 2: Deployment Planning</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure release schedule, rollout channels, reserve inventory stock & activate sales channels.
                </p>
              </div>
            </button>

            {/* Stage 3 */}
            <button
              type="button"
              onClick={() => advanceStageMutation.mutate(3)}
              className={`flex items-start gap-2.5 rounded-lg p-2.5 text-left border transition-all cursor-pointer ${
                rec.stage === 3
                  ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  rec.stage === 3 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                3
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Stage 3: Executive Review & Launch</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Executive Review Board decision → Authorize production release & publish release notes.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation Shell */}
      <div className="mx-auto max-w-[1600px] px-4">
        <ProductReleaseTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scores={{
            readiness: rec.engineeringScore,
            deployment: rec.deploymentScore,
            risk: rec.riskScore,
            ai: rec.aiReleaseScore,
            overall: rec.overallReleaseScore,
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
                    <Rocket className="h-8 w-8" />
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
                {/* PANEL 1: Release Overview */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                        1
                      </div>
                      <CardTitle className="text-base font-bold">Release Overview</CardTitle>
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
                              <option value="Industrial Energy System">Industrial Energy System</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Release Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={formData.releaseName || rec.releaseName}
                              onChange={(e) => setFormData((prev) => ({ ...prev, releaseName: e.target.value }))}
                              className="h-8 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Release Version <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={formData.releaseVersion || rec.releaseVersion}
                              onChange={(e) => setFormData((prev) => ({ ...prev, releaseVersion: e.target.value }))}
                              className="h-8 text-xs font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Release Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.releaseType || rec.releaseType}
                              onChange={(e) => setFormData((prev) => ({ ...prev, releaseType: e.target.value }))}
                              className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <option value="Production Release">Production Release</option>
                              <option value="Beta Pilot Release">Beta Pilot Release</option>
                              <option value="Minor Patch Release">Minor Patch Release</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                              Planned Release Date <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={formData.plannedReleaseDate || rec.plannedReleaseDate}
                              onChange={(e) => setFormData((prev) => ({ ...prev, plannedReleaseDate: e.target.value }))}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                            Target Markets
                          </label>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {rec.targetMarkets.map((m) => (
                              <Badge key={m} className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold border-blue-200">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                            Release Objective <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            rows={2}
                            value={formData.releaseObjective || rec.releaseObjective}
                            onChange={(e) => setFormData((prev) => ({ ...prev, releaseObjective: e.target.value }))}
                            className="text-xs resize-none"
                          />
                        </div>
                      </div>

                      {/* Right Graphic Panel (Embedded Rocket Launch Illustration matching screenshot) */}
                      <div className="md:col-span-5 flex flex-col justify-center items-center rounded-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-slate-100 dark:from-slate-800/80 dark:to-slate-900 border border-blue-200/80 dark:border-slate-700 p-6 text-center">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl mb-3">
                          <Rocket className="h-12 w-12 animate-pulse" />
                          <span className="absolute -bottom-2 -right-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs uppercase">
                            High Priority
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Smart EV Charger v1.2 Launch
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                          Final release gate converging engineering, manufacturing, quality, CRM stock & sales channels.
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Badge variant="outline" className="bg-white dark:bg-slate-800 text-xs font-bold">
                            2,450 Units Stock Ready
                          </Badge>
                          <Badge className="bg-emerald-600 text-white text-xs font-bold">
                            Ready for Launch
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Grid for Engineering & Manufacturing Readiness Cards (Panels 2 & 3) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ------------------------------------------------------------- */}
                  {/* PANEL 2: Engineering Release Readiness */}
                  {/* ------------------------------------------------------------- */}
                  <Card className="border-border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b border-border/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                              2
                            </div>
                            <CardTitle className="text-base font-bold">Engineering Release Readiness</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800">
                            6 Deliverables
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 pb-2 px-4">
                        <div className="space-y-2.5">
                          {rec.engineeringChecklist.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleChecklistMutation.mutate({ section: "engineering", itemId: item.id })}
                              className="w-full flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2.5 text-xs transition-hover hover:bg-slate-100/60 dark:hover:bg-slate-800/80 cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-2.5">
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

                  {/* ------------------------------------------------------------- */}
                  {/* PANEL 3: Manufacturing Readiness */}
                  {/* ------------------------------------------------------------- */}
                  <Card className="border-border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b border-border/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                              3
                            </div>
                            <CardTitle className="text-base font-bold">Manufacturing Readiness</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800">
                            6 Deliverables
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 pb-2 px-4">
                        <div className="space-y-2.5">
                          {rec.manufacturingChecklist.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleChecklistMutation.mutate({ section: "manufacturing", itemId: item.id })}
                              className="w-full flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2.5 text-xs transition-hover hover:bg-slate-100/60 dark:hover:bg-slate-800/80 cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-2.5">
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
                        Manufacturing Readiness Score
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-md font-bold text-sm">
                        <span>{rec.manufacturingScore}</span>
                        <span className="text-xs font-normal opacity-80">/100</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Grid for Commercial Readiness & Deployment Cards (Panels 4 & 5) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ------------------------------------------------------------- */}
                  {/* PANEL 4: Commercial Readiness */}
                  {/* ------------------------------------------------------------- */}
                  <Card className="border-border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b border-border/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                              4
                            </div>
                            <CardTitle className="text-base font-bold">Commercial Readiness</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800">
                            6 Deliverables
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 pb-2 px-4">
                        <div className="space-y-2.5">
                          {rec.commercialChecklist.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleChecklistMutation.mutate({ section: "commercial", itemId: item.id })}
                              className="w-full flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2.5 text-xs transition-hover hover:bg-slate-100/60 dark:hover:bg-slate-800/80 cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-2.5">
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
                        Commercial Readiness Score
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-md font-bold text-sm">
                        <span>{rec.commercialScore}</span>
                        <span className="text-xs font-normal opacity-80">/100</span>
                      </div>
                    </div>
                  </Card>

                  {/* ------------------------------------------------------------- */}
                  {/* PANEL 5: Deployment & Distribution */}
                  {/* ------------------------------------------------------------- */}
                  <Card className="border-border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b border-border/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                              5
                            </div>
                            <CardTitle className="text-base font-bold">Deployment & Distribution</CardTitle>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-mono font-bold">
                            Stock Reserved
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 pb-2 px-4 space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-muted-foreground block font-medium">Release Channels</span>
                            <div className="flex gap-1 flex-wrap mt-1">
                              {rec.releaseChannels.map((c) => (
                                <Badge key={c} variant="secondary" className="text-[10px] font-semibold">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground block font-medium">Deployment Regions</span>
                            <div className="flex gap-1 flex-wrap mt-1">
                              {rec.deploymentRegions.map((r) => (
                                <Badge key={r} variant="outline" className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">
                                  {r}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-muted-foreground block font-medium">Distribution Partner</span>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{rec.distributionPartner}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground block font-medium">Inventory Available</span>
                            <p className="font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                              {rec.inventoryAvailable.toLocaleString()} {rec.inventoryUnits}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-muted-foreground block font-medium">Release Schedule</span>
                            <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{rec.plannedReleaseDate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground block font-medium">Rollout Strategy</span>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{rec.rolloutStrategy}</p>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    {/* Computed Score Footer Tile */}
                    <div className="p-3 border-t border-border/60 bg-slate-50/60 dark:bg-slate-800/40 rounded-b-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Deployment Readiness Score
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-md font-bold text-sm">
                        <span>{rec.deploymentScore}</span>
                        <span className="text-xs font-normal opacity-80">/100</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 6: Risk & Compliance Review */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                          6
                        </div>
                        <CardTitle className="text-base font-bold">Risk & Compliance Review</CardTitle>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-mono font-bold">
                        1 Critical Risk Monitored
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="text-muted-foreground block font-medium">Open Risks</span>
                          <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{rec.openRisksCount}</span>
                        </div>

                        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
                          <span className="text-amber-900 dark:text-amber-300 block font-medium">Critical Risks</span>
                          <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{rec.criticalRisksCount}</span>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                          <div>
                            <span className="text-muted-foreground block font-medium">CAPA Closed</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Yes</span>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                          <div>
                            <span className="text-muted-foreground block font-medium">Regulatory Approval</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Yes</span>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                          <div>
                            <span className="text-muted-foreground block font-medium">Warranty Policy Approved</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Yes</span>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>

                        <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between">
                          <span className="text-muted-foreground block font-medium">Release Risk Assessment</span>
                          <button
                            type="button"
                            onClick={() => toast.info("Opening Risk Assessment Report...")}
                            className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 text-xs mt-1 cursor-pointer"
                          >
                            View Report <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Score Badge Card */}
                      <div className="md:col-span-3 flex flex-col items-center justify-center rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-4 text-center">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">Risk Readiness Score</span>
                        <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 px-4 py-2 rounded-lg font-bold text-xl">
                          <span>{rec.riskScore}</span>
                          <span className="text-xs font-normal opacity-80">/100</span>
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-2">1 minor supply buffer risk monitored.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 7: AI Release Assessment */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                          7
                        </div>
                        <CardTitle className="text-base font-bold">AI Release Assessment</CardTitle>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 gap-1 border-purple-200 font-semibold">
                        <Sparkles className="h-3 w-3 text-purple-600" />
                        AI Agent Generated
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-9 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 w-1/3">
                            AI Release Readiness Review
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium flex-1">
                            {rec.aiReleaseReadinessReview}
                          </span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 w-1/3">
                            AI Deployment Risk Analysis
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium flex-1">
                            {rec.aiDeploymentRiskAnalysis}
                          </span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 w-1/3">
                            AI Commercial Readiness
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium flex-1">
                            {rec.aiCommercialReadiness}
                          </span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-emerald-200/80 dark:border-emerald-900/40 p-2.5 bg-emerald-50/40 dark:bg-emerald-950/20">
                          <span className="font-semibold text-emerald-900 dark:text-emerald-300 w-1/3">
                            AI Launch Recommendation
                          </span>
                          <span className="text-emerald-800 dark:text-emerald-200 font-bold flex-1">
                            {rec.aiLaunchRecommendation}
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
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">AI Release Score</span>
                        <div className="mt-2 flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg font-bold text-lg">
                          <span>{rec.aiReleaseScore}</span>
                          <span className="text-xs font-normal opacity-80">/100</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 8: Release Summary */}
                {/* ------------------------------------------------------------- */}
                <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                          8
                        </div>
                        <CardTitle className="text-base font-bold">Release Summary</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 font-semibold">
                        Single Source of Truth Gauges
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
                        score={rec.commercialScore}
                        label="Commercial Score"
                        color="#10B981"
                      />
                      <CircularScoreGauge
                        score={rec.riskScore}
                        label="Risk Score"
                        color="#F59E0B"
                      />
                      {/* Overall Release Score — Larger Gauge */}
                      <div className="col-span-2 sm:col-span-1 flex flex-col items-center">
                        <CircularScoreGauge
                          score={rec.overallReleaseScore}
                          size={96}
                          strokeWidth={8}
                          label="Overall Release Score"
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
                          <option value="Ready for Product Launch">Ready for Product Launch</option>
                          <option value="Requires Minor Updates">Requires Minor Updates</option>
                          <option value="Pending Board Decision">Pending Board Decision</option>
                          <option value="Not Recommended">Not Recommended</option>
                        </select>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        All 6 readiness & compliance streams converged. Product launch authorized.
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
                        Executive Review Board
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

                    {/* Board Decision Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs pt-2">
                      <div className="md:col-span-4">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Approval Decision <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.approvalDecision || rec.approvalDecision}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              approvalDecision: e.target.value as ProductReleaseApprovalDecision,
                            }))
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <option value="Approved">Approved</option>
                          <option value="Approved with Conditions">Approved with Conditions</option>
                          <option value="Revision Required">Revision Required</option>
                          <option value="Rejected">Rejected</option>
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
                          Authorize Launch
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
                        Audit Logged
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
                          <span className="text-muted-foreground block font-medium">Commercial Date</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{rec.commercialDate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Workflow Stage</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{rec.workflowStageLabel}</span>
                        </div>
                      </div>

                      <div className="md:col-span-4 flex flex-col justify-center space-y-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                        <button
                          type="button"
                          onClick={() => setShowAuditLogDrawer(true)}
                          className="flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 cursor-pointer"
                        >
                          <span>View Log</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTimelineModal(true)}
                          className="flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 cursor-pointer"
                        >
                          <span>View Release Timeline</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowWorkflowModal(true)}
                          className="flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 cursor-pointer"
                        >
                          <span>View Workflow</span>
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
              {/* Overall Release Score Gauge Card */}
              <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                <CardHeader className="pb-2 border-b border-border/60">
                  <CardTitle className="text-sm font-bold">Overall Release Score</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col items-center">
                  <CircularScoreGauge
                    score={rec.overallReleaseScore}
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
                      <span className="text-slate-600 dark:text-slate-400">Commercial</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rec.commercialScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Risk</span>
                      <span className="font-bold text-amber-600">{rec.riskScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Deployment</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rec.deploymentScore}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Highlights Card */}
              <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                <CardHeader className="pb-2 border-b border-border/60">
                  <CardTitle className="text-sm font-bold">Key Highlights</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2.5 text-xs">
                  {keyHighlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{hl.label}</span>
                    </div>
                  ))}
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
                    onClick={() => setActiveTab("readiness")}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                    <span>Release Checklist</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTimelineModal(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>View Release Timeline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReleasePackageModal(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Download className="h-4 w-4 text-blue-600" />
                    <span>Download Release Package</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => submitMutation.mutate()}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Send className="h-4 w-4 text-blue-600" />
                    <span>Send for Approval</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReleaseNotesDialog(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Publish Release Notes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.success("Launch plan updated.")}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Update Launch Plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNotifyModal(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>Notify Stakeholders</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.success("Release report generated.")}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Printer className="h-4 w-4 text-blue-600" />
                    <span>Generate Release Report</span>
                  </button>
                </CardContent>
              </Card>

              {/* Release Timeline Component (Vertical Timeline) */}
              <Card className="border-border bg-white dark:bg-slate-900 shadow-xs">
                <CardHeader className="pb-2 border-b border-border/60">
                  <CardTitle className="text-sm font-bold">Release Timeline</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-4 text-xs">
                  <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {rec.releaseTimeline.map((ms) => (
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
              Upload Release Attachment
            </DialogTitle>
            <DialogDescription>
              Add supporting documents, checklists, or marketing materials to this release package.
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
                <option value="Engineering">Engineering Deliverable</option>
                <option value="Manufacturing">Manufacturing SOP</option>
                <option value="Marketing">Marketing Material</option>
                <option value="Release Notes">Release Notes</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">File Name</label>
              <Input
                placeholder="e.g. final_release_notes_v1.2.pdf"
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
                toast.success(`Uploaded "${uploadFileName || 'release_notes.pdf'}"!`);
                setShowUploadDialog(false);
              }}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Notes Modal */}
      <Dialog open={showReleaseNotesDialog} onOpenChange={setShowReleaseNotesDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Publish Product Release Notes (v1.2.0)
            </DialogTitle>
            <DialogDescription>
              Generate and publish public & dealer release notes for Smart EV Charger AC 7kW v1.2.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <Textarea
              rows={5}
              defaultValue={`# Release Notes - Smart EV Charger AC 7kW v1.2.0\n- Full support for OCPP 2.0.1 protocol\n- Upgraded thermal management & IP54 enclosure protection\n- Enhanced mobile app remote scheduling features`}
              className="font-mono text-xs resize-none"
            />
          </div>
          <DialogFooter>
            <Button size="sm" className="bg-emerald-600 text-white" onClick={() => { toast.success("Release notes published!"); setShowReleaseNotesDialog(false); }}>
              Publish Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Engine Modal */}
      <Dialog open={showWorkflowModal} onOpenChange={setShowWorkflowModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-blue-600" />
              Product Release Gate Lifecycle (3 Stages)
            </DialogTitle>
            <DialogDescription>
              Convergence gate verifying readiness across engineering, manufacturing, quality, CRM stock & sales.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-xs">
            <div className="grid grid-cols-3 gap-3 text-center font-bold">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-lg border border-blue-200">
                <span className="text-blue-600 font-extrabold text-sm block">Stage 1</span>
                Readiness Assessment
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-lg border border-blue-200">
                <span className="text-blue-600 font-extrabold text-sm block">Stage 2</span>
                Deployment Planning
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-lg border border-blue-200">
                <span className="text-blue-600 font-extrabold text-sm block">Stage 3</span>
                Executive Launch Authorization
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Workflow Outcomes (Stage 3):</strong>
              <br />
              • <strong>Approved:</strong> Production launch authorized, warehouse inventory released & sales channels activated.
              <br />
              • <strong>Approved with Conditions:</strong> Minor actions required before full commercial rollout.
              <br />
              • <strong>Revision Required:</strong> Returns to Stage 1 for readiness rework.
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
              System Audit Trail Log
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

      {/* Release Package Modal */}
      <Dialog open={showReleasePackageModal} onOpenChange={setShowReleasePackageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-emerald-600" />
              Download Product Release Package
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-3 text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Package Contents (REL-2024-0053_v1.2.0.zip):</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Engineering & Certification Package</li>
              <li>Manufacturing SOP & BOM File</li>
              <li>Sales & Marketing Kit</li>
              <li>Published Release Notes (.PDF)</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              className="bg-emerald-600 text-white"
              onClick={() => {
                toast.success("Downloading Release Package (94.7 MB)...");
                setShowReleasePackageModal(false);
              }}
            >
              Download (.ZIP 94.7 MB)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Release Analyzer Modal */}
      <Dialog open={showAiAnalyzerModal} onOpenChange={setShowAiAnalyzerModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Release Intelligence Agent
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200">
              <p className="font-bold text-purple-900 dark:text-purple-300">Launch Readiness Assessment</p>
              <p className="text-purple-800 dark:text-purple-200 mt-1">
                AI verified all 18 readiness deliverables. Inventory buffer of 2,450 units is optimal for initial 30 days. Release Score: <strong>91/100</strong>.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" className="bg-purple-600 text-white" onClick={() => setShowAiAnalyzerModal(false)}>
              Close Analysis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stakeholders Notification Modal */}
      <Dialog open={showNotifyModal} onOpenChange={setShowNotifyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Notify Stakeholders
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">Send automated product launch notifications to Executive Board, Dealer Network, and Customer Success teams.</p>
          </div>
          <DialogFooter>
            <Button size="sm" className="bg-blue-600 text-white" onClick={() => { toast.success("Notifications dispatched to 42 stakeholders!"); setShowNotifyModal(false); }}>
              Dispatch Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Timeline Modal */}
      <Dialog open={showTimelineModal} onOpenChange={setShowTimelineModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Product Release Timeline & Milestones
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            {rec.releaseTimeline.map((ms) => (
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
  );
}
