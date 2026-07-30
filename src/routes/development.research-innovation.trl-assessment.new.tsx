/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  FlaskConical,
  History,
  Layers,
  Link as LinkIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  Rocket,
  Save,
  Send,
  ShieldAlert,
  Sparkles,
  Upload,
  UserCheck,
  X,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  TrlAssessmentPageTabBar,
  TRL_STATUS_LABEL,
} from "@/components/erp/TrlAssessmentTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { StarRating } from "@/components/erp/StarRating";
import { ErpButton } from "@/components/erp/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { trlAssessmentService } from "@/services";
import type {
  TrlApprovalDecision,
  TrlFormInput,
  TrlLevelNumber,
  TrlStage,
  TrlStatus,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/trl-assessment/new")({
  head: () => ({ meta: [{ title: "TRL Assessment Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: TrlAssessmentFormPage,
});

/* --------------------------------- Consts --------------------------------- */
const EDITABLE: TrlStatus[] = [
  "draft",
  "technology_assessment",
  "technical_validation",
  "demonstration_review",
  "risk_commercial_assessment",
  "executive_review",
  "approved_with_improvements",
  "revision_required",
];

const TRL_SCALE_GUIDE = [
  { level: 1, title: "Basic Principles Observed", desc: "Scientific research begins to be translated into applied R&D." },
  { level: 2, title: "Technology Concept Formulated", desc: "Practical applications can be invented; principles are postulated." },
  { level: 3, title: "Experimental Proof of Concept", desc: "Analytical and laboratory studies validate predictions." },
  { level: 4, title: "Technology Validated in Laboratory", desc: "Basic technological components integrated in lab environment." },
  { level: 5, title: "Technology Validated in Relevant Environment", desc: "Fidelity of technology increases; validated in realistic environment." },
  { level: 6, title: "Technology Demonstrated in Relevant Environment", desc: "Representative model or prototype system tested in relevant environment." },
  { level: 7, title: "System Prototype Demonstrated in Operational Environment", desc: "Prototype near or at planned operational system level." },
  { level: 8, title: "System Complete and Qualified", desc: "Technology proven through test and demonstration in final form." },
  { level: 9, title: "Actual System Proven in Operational Environment", desc: "Actual application of technology in its final operational environment." },
];

/* ------------------------------- Helper Circular Gauge ------------------------------- */
function ReadinessGauge({ percent }: { percent: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-36 w-36 -rotate-90 stroke-current">
        <circle
          cx="72"
          cy="72"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted/30"
          fill="transparent"
        />
        <circle
          cx="72"
          cy="72"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-emerald-500 transition-all duration-700 ease-out"
          fill="transparent"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-extrabold tracking-tight text-foreground">{percent}%</div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Readiness</div>
      </div>
    </div>
  );
}

/* ------------------------------- Main Component ------------------------------- */
function TrlAssessmentFormPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recordId = search.id || "trl-record-0087";

  // Data Queries & Mutations
  const lookupsQuery = useQuery({
    queryKey: ["trl-assessment", "lookups"],
    queryFn: () => trlAssessmentService.fetchLookups(),
  });

  const recordQuery = useQuery({
    queryKey: ["trl-assessment", "record", recordId],
    queryFn: () => trlAssessmentService.fetchRecord(recordId),
  });

  const saveMutation = useMutation({
    mutationFn: (input: TrlFormInput) => trlAssessmentService.saveDraft(input, recordId),
    onSuccess: (updated) => {
      queryClient.setQueryData(["trl-assessment", "record", recordId], updated);
      toast.success("TRL Assessment draft saved successfully.");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to save draft"),
  });

  const submitMutation = useMutation({
    mutationFn: () => trlAssessmentService.submitForReview(recordId),
    onSuccess: (updated) => {
      queryClient.setQueryData(["trl-assessment", "record", recordId], updated);
      toast.success("Submitted for Executive Review.");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (args: { decision: TrlApprovalDecision; comments?: string }) =>
      trlAssessmentService.reviewDecision({ id: recordId, ...args }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["trl-assessment", "record", recordId], updated);
      setShowReviewModal(false);
      if (updated.status === "approved" && updated.linkedMrlAssessmentCode) {
        toast.success(
          `TRL Assessment Approved! Linked MRL Assessment ${updated.linkedMrlAssessmentCode} auto-created.`,
          { duration: 6000 },
        );
      } else {
        toast.success(`Executive Review updated decision to: ${updated.approvalDecision}`);
      }
    },
  });

  const reportMutation = useMutation({
    mutationFn: () => trlAssessmentService.generateReport(recordId),
    onSuccess: (updated) => {
      queryClient.setQueryData(["trl-assessment", "record", recordId], updated);
      toast.success("TRL Assessment PDF Report generated and downloaded.");
    },
  });

  // Local state form fields
  const record = recordQuery.data;
  const isEditable = EDITABLE.includes(record?.status || "draft");

  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [assessmentTeam, setAssessmentTeam] = useState<string[]>([]);
  const [assessmentDate, setAssessmentDate] = useState("");

  // Card 1: Technology Info
  const [technologyName, setTechnologyName] = useState("");
  const [technologyDomain, setTechnologyDomain] = useState("");
  const [technologyDescription, setTechnologyDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [applicationArea, setApplicationArea] = useState<string[]>([]);
  const [innovationType, setInnovationType] = useState("");
  const [strategicImportance, setStrategicImportance] = useState(5);
  const [newTag, setNewTag] = useState("");

  // Card 2: Current TRL Assessment
  const [currentTrlLevel, setCurrentTrlLevel] = useState<TrlLevelNumber>(5);
  const [previousTrlLevel, setPreviousTrlLevel] = useState<TrlLevelNumber>(4);
  const [targetTrlLevel, setTargetTrlLevel] = useState<TrlLevelNumber>(7);
  const [assessmentMethod, setAssessmentMethod] = useState("");
  const [assessmentEvidence, setAssessmentEvidence] = useState("");
  const [assessmentScore, setAssessmentScore] = useState(78);
  const [confidenceLevel, setConfidenceLevel] = useState(82);

  // Card 3: Technical Validation
  const [scientificValidation, setScientificValidation] = useState(5);
  const [laboratoryValidation, setLaboratoryValidation] = useState(5);
  const [prototypeValidation, setPrototypeValidation] = useState(5);
  const [systemIntegration, setSystemIntegration] = useState(4);
  const [functionalDemonstration, setFunctionalDemonstration] = useState(5);
  const [environmentalValidation, setEnvironmentalValidation] = useState(4);
  const [validationEvidence, setValidationEvidence] = useState("");

  // Card 4: Technology Demonstration
  const [demonstrationEnvironment, setDemonstrationEnvironment] = useState("");
  const [testResults, setTestResults] = useState("");
  const [performanceMetrics, setPerformanceMetrics] = useState("");
  const [reliabilityResults, setReliabilityResults] = useState("");
  const [safetyAssessment, setSafetyAssessment] = useState(5);
  const [complianceStatus, setComplianceStatus] = useState("");
  const [demonstrationOutcome, setDemonstrationOutcome] = useState("");

  // Card 5: Risk Assessment
  const [technicalRisk, setTechnicalRisk] = useState(2);
  const [manufacturingRisk, setManufacturingRisk] = useState(3);
  const [supplyChainRisk, setSupplyChainRisk] = useState(3);
  const [regulatoryRisk, setRegulatoryRisk] = useState(2);
  const [commercialRisk, setCommercialRisk] = useState(2);
  const [overallRiskScore, setOverallRiskScore] = useState(32);
  const [riskMitigationPlan, setRiskMitigationPlan] = useState("");

  // Card 6: Commercial Readiness
  const [mrlLevel, setMrlLevel] = useState(3);
  const [marketReadiness, setMarketReadiness] = useState(4);
  const [customerValidation, setCustomerValidation] = useState(4);
  const [investmentReadiness, setInvestmentReadiness] = useState(4);
  const [businessReadiness, setBusinessReadiness] = useState(4);
  const [commercialPotential, setCommercialPotential] = useState(4);
  const [goToMarketStatus, setGoToMarketStatus] = useState("");

  // Attachments
  const [attachments, setAttachments] = useState<any[]>([]);

  // Recommendation Override
  const [recommendationOverride, setRecommendationOverride] = useState("Advance to Next TRL");

  // Modals & Drawers State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDecisionChoice, setReviewDecisionChoice] = useState<TrlApprovalDecision>("Approved");
  const [reviewComments, setReviewComments] = useState("");
  const [activeLinkedModal, setActiveLinkedModal] = useState<string | null>(null);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompareHistoryDrawer, setShowCompareHistoryDrawer] = useState(false);

  // Sync state from query data
  useEffect(() => {
    if (!record) return;
    setAssessmentTitle(record.assessmentTitle || "");
    setBusinessUnit(record.businessUnit || "");
    setAssessmentTeam(record.assessmentTeam || []);
    setAssessmentDate(record.assessmentDate || "");

    const ti = record.technologyInfo;
    if (ti) {
      setTechnologyName(ti.technologyName || "");
      setTechnologyDomain(ti.technologyDomain || "");
      setTechnologyDescription(ti.technologyDescription || "");
      setProductCategory(ti.productCategory || "");
      setApplicationArea(ti.applicationArea || []);
      setInnovationType(ti.innovationType || "");
      setStrategicImportance(ti.strategicImportance || 5);
    }

    const ca = record.currentAssessment;
    if (ca) {
      setCurrentTrlLevel(ca.currentTrlLevel || 5);
      setPreviousTrlLevel(ca.previousTrlLevel || 4);
      setTargetTrlLevel(ca.targetTrlLevel || 7);
      setAssessmentMethod(ca.assessmentMethod || "");
      setAssessmentEvidence(ca.assessmentEvidence || "");
      setAssessmentScore(ca.assessmentScore || 78);
      setConfidenceLevel(ca.confidenceLevel || 82);
    }

    const tv = record.technicalValidation;
    if (tv) {
      setScientificValidation(tv.scientificValidation || 5);
      setLaboratoryValidation(tv.laboratoryValidation || 5);
      setPrototypeValidation(tv.prototypeValidation || 5);
      setSystemIntegration(tv.systemIntegration || 4);
      setFunctionalDemonstration(tv.functionalDemonstration || 5);
      setEnvironmentalValidation(tv.environmentalValidation || 4);
      setValidationEvidence(tv.validationEvidence || "");
    }

    const td = record.technologyDemonstration;
    if (td) {
      setDemonstrationEnvironment(td.demonstrationEnvironment || "");
      setTestResults(td.testResults || "");
      setPerformanceMetrics(td.performanceMetrics || "");
      setReliabilityResults(td.reliabilityResults || "");
      setSafetyAssessment(td.safetyAssessment || 5);
      setComplianceStatus(td.complianceStatus || "");
      setDemonstrationOutcome(td.demonstrationOutcome || "");
    }

    const ra = record.riskAssessment;
    if (ra) {
      setTechnicalRisk(ra.technicalRisk || 2);
      setManufacturingRisk(ra.manufacturingRisk || 3);
      setSupplyChainRisk(ra.supplyChainRisk || 3);
      setRegulatoryRisk(ra.regulatoryRisk || 2);
      setCommercialRisk(ra.commercialRisk || 2);
      setOverallRiskScore(ra.overallRiskScore || 32);
      setRiskMitigationPlan(ra.riskMitigationPlan || "");
    }

    const cr = record.commercialReadiness;
    if (cr) {
      setMrlLevel(cr.mrlLevel || 3);
      setMarketReadiness(cr.marketReadiness || 4);
      setCustomerValidation(cr.customerValidation || 4);
      setInvestmentReadiness(cr.investmentReadiness || 4);
      setBusinessReadiness(cr.businessReadiness || 4);
      setCommercialPotential(cr.commercialPotential || 4);
      setGoToMarketStatus(cr.goToMarketStatus || "");
    }

    setAttachments(record.attachments || []);
    if (record.summary?.recommendation) {
      setRecommendationOverride(record.summary.recommendation);
    }
  }, [record]);

  // Derived calculations (Single source of truth)
  const derivedScores = useMemo(() => {
    const techAvg =
      (scientificValidation +
        laboratoryValidation +
        prototypeValidation +
        systemIntegration +
        functionalDemonstration +
        environmentalValidation) /
      6;
    const commAvg =
      (marketReadiness + customerValidation + investmentReadiness + businessReadiness + commercialPotential) / 5;
    const riskStarsAvg = (technicalRisk + manufacturingRisk + supplyChainRisk + regulatoryRisk + commercialRisk) / 5;

    // Overall Risk Score: 32/100 (Lower is Better)
    const riskScoreValue = Math.round((riskStarsAvg / 5) * 60 + 10);
    // Risk Control / Safety Score: 68/100 (Higher is Better)
    const riskControlValue = 100 - riskScoreValue;

    const overallTech = Math.round((techAvg / 5) * 80 + 20);
    const validationScore = Math.round((techAvg / 5) * 85 + 15);
    const commercialScore = Math.round((commAvg / 5) * 75 + 20);

    const finalScore = Math.round(
      overallTech * 0.35 + validationScore * 0.3 + commercialScore * 0.2 + riskControlValue * 0.15,
    );

    let recLevelNum = currentTrlLevel;
    if (finalScore >= 75 && currentTrlLevel < 9) recLevelNum = (currentTrlLevel + 1) as any;

    return {
      overallTech,
      validationScore,
      commercialScore,
      riskScoreValue,
      riskControlValue,
      finalScore,
      recommendedLevelNum: recLevelNum,
      aiTechScore: Math.min(99, Math.round(finalScore * 1.05)),
    };
  }, [
    scientificValidation,
    laboratoryValidation,
    prototypeValidation,
    systemIntegration,
    functionalDemonstration,
    environmentalValidation,
    marketReadiness,
    customerValidation,
    investmentReadiness,
    businessReadiness,
    commercialPotential,
    technicalRisk,
    manufacturingRisk,
    supplyChainRisk,
    regulatoryRisk,
    commercialRisk,
    currentTrlLevel,
  ]);

  // Validation rules for TRL levels (Previous <= Current <= Target)
  const isTrlSequenceValid = previousTrlLevel <= currentTrlLevel && currentTrlLevel <= targetTrlLevel;

  const handleSubmitDraft = () => {
    const input: TrlFormInput = {
      assessmentTitle,
      businessUnit,
      assessmentTeam,
      assessmentDate,
      linkedTechnologyId: record?.linkedTechnologyId,
      linkedResearchProjectId: record?.linkedResearchProjectId,
      linkedPrototypeId: record?.linkedPrototypeId,
      linkedProductId: record?.linkedProductId,
      technologyInfo: {
        technologyName,
        technologyDomain,
        technologyDescription,
        productCategory,
        applicationArea,
        innovationType,
        strategicImportance,
      },
      currentAssessment: {
        currentTrlLevel,
        previousTrlLevel,
        targetTrlLevel,
        assessmentMethod,
        assessmentEvidence,
        assessmentScore: derivedScores.finalScore,
        confidenceLevel,
      },
      technicalValidation: {
        scientificValidation,
        laboratoryValidation,
        prototypeValidation,
        systemIntegration,
        functionalDemonstration,
        environmentalValidation,
        validationEvidence,
      },
      technologyDemonstration: {
        demonstrationEnvironment,
        testResults,
        performanceMetrics,
        reliabilityResults,
        safetyAssessment,
        complianceStatus,
        demonstrationOutcome,
      },
      riskAssessment: {
        technicalRisk,
        manufacturingRisk,
        supplyChainRisk,
        regulatoryRisk,
        commercialRisk,
        overallRiskScore: derivedScores.riskScoreValue,
        riskMitigationPlan,
      },
      commercialReadiness: {
        mrlLevel,
        marketReadiness,
        customerValidation,
        investmentReadiness,
        businessReadiness,
        commercialPotential,
        goToMarketStatus,
      },
      attachments,
      recommendationOverride,
    };
    saveMutation.mutate(input);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newAtts = Array.from(files).map((f, i) => ({
      id: `att-${Date.now()}-${i}`,
      fileName: f.name,
      fileSize: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: f.name.split(".").pop()?.toUpperCase() || "PDF",
      uploadDate: new Date().toISOString().substring(0, 10),
      uploadedBy: "Rohit Verma",
    }));
    setAttachments((prev) => [...prev, ...newAtts]);
    toast.success(`Added ${newAtts.length} attachment(s).`);
  };

  const removeTag = (tag: string) => {
    setApplicationArea((prev) => prev.filter((t) => t !== tag));
  };
  const addTag = () => {
    if (!newTag.trim()) return;
    if (!applicationArea.includes(newTag.trim())) {
      setApplicationArea((prev) => [...prev, newTag.trim()]);
    }
    setNewTag("");
  };

  const lookups = lookupsQuery.data;

  if (recordQuery.isLoading) {
    return (
      <AppShell
        breadcrumb="Development > Research & Innovation Development > Technology Readiness Level (TRL) Assessment"
        title="Technology Readiness Level"
      description="Assess and advance technology readiness levels."
      tabs={<InnovationAreaTabs sub={<TrlAssessmentPageTabBar />} />}
      >
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      breadcrumb="Development > Research & Innovation Development > Technology Readiness Level (TRL) Assessment > TRL Assessment Form"
      title="Technology Readiness Level"
      description="Assess and advance technology readiness levels."
      tabs={<InnovationAreaTabs sub={<TrlAssessmentPageTabBar />} />}
    >
      <div className="space-y-6">
        {/* =========================================================================
           RECORD HEADER BAR (TWO ROWS)
           ========================================================================= */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">TRL Assessment ID:</span>
                <span className="font-mono text-sm font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
                  {record?.trlAssessmentId || "TRL-2024-0087"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Form Code:</span>
                <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                  {record?.formCode || "TRL-2024-25"}
                </span>
              </div>

              <div className="min-w-[280px] max-w-[400px]">
                <input
                  type="text"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  disabled={!isEditable}
                  placeholder="Assessment Title..."
                  className="w-full text-base font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 rounded"
                />
              </div>

              {/* Resolved Chips Row 1 */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLinkedModal("technology")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 ring-1 ring-blue-200 transition-colors cursor-pointer"
                >
                  <LinkIcon className="h-3 w-3" />
                  {record?.linkedTechnologyCode || "TEC-2024-0032"}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLinkedModal("research")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 hover:bg-purple-100 ring-1 ring-purple-200 transition-colors cursor-pointer"
                >
                  <FlaskConical className="h-3 w-3" />
                  {record?.linkedResearchProjectCode || "RES-2024-0018"}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLinkedModal("prototype")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 ring-1 ring-indigo-200 transition-colors cursor-pointer"
                >
                  <Rocket className="h-3 w-3" />
                  {record?.linkedPrototypeCode || "PRD-2024-0012"}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>

                <StatusBadge
                  status={TRL_STATUS_LABEL[record?.status || "executive_review"] || "Executive Review"}
                />
              </div>
            </div>

            {/* Actions Right */}
            <div className="flex items-center gap-2">
              <ErpButton
                variant="secondary"
                loading={saveMutation.isPending}
                onClick={handleSubmitDraft}
                aria-label="Save Draft"
                title="Save Draft"
              >
                <Save className="h-4 w-4" />
              </ErpButton>

              <ErpButton
                variant="primary"
                loading={submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
                aria-label="Submit for Review"
                title="Submit for Review"
              >
                <Send className="h-4 w-4" />
              </ErpButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-input bg-background hover:bg-secondary text-foreground transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => reportMutation.mutate()}>
                    <FileText className="mr-2 h-4 w-4 text-primary" />
                    Generate TRL Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowReviewModal(true)}>
                    <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />
                    Executive Review Decision
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowScheduleModal(true)}>
                    <Calendar className="mr-2 h-4 w-4 text-indigo-600" />
                    Schedule Review Meeting
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowCompareHistoryDrawer(true)}>
                    <History className="mr-2 h-4 w-4 text-amber-600" />
                    Compare TRL History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast.success("Exported TRL Assessment data.")}>
                    <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                    Export Assessment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Linked Product:</span>
                <button
                  type="button"
                  onClick={() => setActiveLinkedModal("product")}
                  className="inline-flex items-center gap-1 font-bold text-primary hover:underline bg-primary/5 px-2 py-0.5 rounded border border-primary/20 cursor-pointer"
                >
                  {record?.linkedProductCode || "PRD-1001"}
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Business Unit:</span>
                <select
                  value={businessUnit}
                  onChange={(e) => setBusinessUnit(e.target.value)}
                  disabled={!isEditable}
                  className="bg-transparent font-medium text-foreground focus:outline-none border-b border-dashed border-border"
                >
                  {(lookups?.businessUnits || ["Smart Mobility Division"]).map((bu) => (
                    <option key={bu} value={bu}>
                      {bu}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assessment Team Avatar Picker */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Assessment Team:</span>
                <div className="flex items-center -space-x-2">
                  {assessmentTeam.slice(0, 4).map((member, idx) => (
                    <div
                      key={idx}
                      title={member}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background shadow-xs"
                    >
                      {member
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  ))}
                  {assessmentTeam.length > 4 && (
                    <div
                      title={assessmentTeam.slice(4).join(", ")}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-background cursor-pointer hover:bg-accent"
                    >
                      +{assessmentTeam.length - 4}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Assessment Date:</span>
                <input
                  type="date"
                  value={assessmentDate}
                  onChange={(e) => setAssessmentDate(e.target.value)}
                  disabled={!isEditable}
                  className="bg-transparent font-mono text-xs text-foreground focus:outline-none border-b border-dashed border-border"
                />
              </div>
            </div>

            {/* Stage Progress Pills */}
            <div className="flex items-center gap-1.5">
              {(record?.stages || []).map((st) => (
                <div
                  key={st.stage}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all",
                    st.completed
                      ? "bg-emerald-100 text-emerald-800"
                      : st.active
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground opacity-60",
                  )}
                >
                  {st.completed ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                  {st.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic MRL Link Banner if Approved */}
        {record?.linkedMrlAssessmentCode && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50/90 p-3 text-emerald-900 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>
                TRL Assessment Approved! Linked <strong>Manufacturing Readiness (MRL) Assessment</strong> has been auto-created.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveLinkedModal("mrl")}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              View {record.linkedMrlAssessmentCode}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* TRL Sequence Validation Warning Banner */}
        {!isTrlSequenceValid && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>TRL Progression Warning:</strong> Standard TRL sequence requires <em>Previous TRL ≤ Current TRL ≤ Target TRL</em>. Please adjust Card 2 levels.
            </span>
          </div>
        )}

        {/* =========================================================================
           MAIN GRID (LEFT 11 FORM CARDS | RIGHT STICKY SIDEBAR)
           ========================================================================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* LEFT 3 COLUMNS: FORM CARDS 1 TO 11 */}
          <div className="lg:col-span-3 space-y-6">
            {/* ---------------- CARD 1 & CARD 2 GRID ---------------- */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* CARD 1: Technology Information */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    1
                  </div>
                  <h3 className="font-bold text-foreground">Technology Information</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-muted-foreground">Technology Name *</label>
                    <input
                      type="text"
                      value={technologyName}
                      onChange={(e) => setTechnologyName(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground">Technology Domain *</label>
                    <select
                      value={technologyDomain}
                      onChange={(e) => setTechnologyDomain(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    >
                      {(lookups?.technologyDomains || ["Robotics & Automation"]).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground">Technology Description</label>
                    <textarea
                      rows={3}
                      value={technologyDescription}
                      onChange={(e) => setTechnologyDescription(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-muted-foreground">Product Category *</label>
                      <select
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        disabled={!isEditable}
                        className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                      >
                        {(lookups?.productCategories || ["Automotive"]).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-muted-foreground">Innovation Type *</label>
                      <select
                        value={innovationType}
                        onChange={(e) => setInnovationType(e.target.value)}
                        disabled={!isEditable}
                        className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                      >
                        {(lookups?.innovationTypes || ["Incremental Innovation"]).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Application Area Tags Input */}
                  <div>
                    <label className="font-semibold text-muted-foreground">Application Area *</label>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-2">
                      {applicationArea.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200"
                        >
                          {tag}
                          {isEditable && (
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive cursor-pointer">
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                      {isEditable && (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                            placeholder="+ add tag"
                            className="w-20 text-[11px] bg-transparent focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strategic Importance */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="font-semibold text-muted-foreground">Strategic Importance *</label>
                    <StarRating
                      value={strategicImportance}
                      onChange={setStrategicImportance}
                      readOnly={!isEditable}
                      showValue={false}
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: Current TRL Assessment */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    2
                  </div>
                  <h3 className="font-bold text-foreground">Current TRL Assessment</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-muted-foreground">Current TRL Level *</label>
                    <select
                      value={currentTrlLevel}
                      onChange={(e) => setCurrentTrlLevel(Number(e.target.value) as TrlLevelNumber)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-emerald-300 bg-emerald-50/50 px-3 py-1.5 text-xs font-bold text-emerald-900 focus:border-emerald-500 focus:outline-none"
                    >
                      {(lookups?.trlLevels || TRL_SCALE_GUIDE.map((g) => ({ level: g.level, descriptor: `TRL ${g.level} – ${g.title}` }))).map(
                        (l) => (
                          <option key={l.level} value={l.level}>
                            {l.descriptor}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-muted-foreground">Previous TRL Level *</label>
                      <select
                        value={previousTrlLevel}
                        onChange={(e) => setPreviousTrlLevel(Number(e.target.value) as TrlLevelNumber)}
                        disabled={!isEditable}
                        className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                      >
                        {TRL_SCALE_GUIDE.map((g) => (
                          <option key={g.level} value={g.level}>
                            TRL {g.level}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-muted-foreground">Target TRL Level *</label>
                      <select
                        value={targetTrlLevel}
                        onChange={(e) => setTargetTrlLevel(Number(e.target.value) as TrlLevelNumber)}
                        disabled={!isEditable}
                        className="mt-1 w-full rounded-md border border-blue-300 bg-blue-50/50 px-2.5 py-1.5 text-xs font-bold text-blue-900 focus:border-blue-500 focus:outline-none"
                      >
                        {TRL_SCALE_GUIDE.map((g) => (
                          <option key={g.level} value={g.level}>
                            TRL {g.level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground">Assessment Method *</label>
                    <select
                      value={assessmentMethod}
                      onChange={(e) => setAssessmentMethod(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    >
                      {(lookups?.assessmentMethods || ["Field Demonstration"]).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground">Assessment Evidence</label>
                    <textarea
                      rows={2}
                      value={assessmentEvidence}
                      onChange={(e) => setAssessmentEvidence(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-center">
                      <div className="text-[11px] font-semibold text-muted-foreground">Assessment Score</div>
                      <div className="text-lg font-extrabold text-emerald-600">{derivedScores.finalScore} /100</div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-center">
                      <div className="text-[11px] font-semibold text-muted-foreground">Confidence Level</div>
                      <div className="text-lg font-extrabold text-blue-600">{confidenceLevel} %</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- CARD 3 & CARD 4 GRID ---------------- */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* CARD 3: Technical Validation */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    3
                  </div>
                  <h3 className="font-bold text-foreground">Technical Validation</h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Scientific Validation</span>
                    <StarRating value={scientificValidation} onChange={setScientificValidation} readOnly={!isEditable} showValue={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Laboratory Validation</span>
                    <StarRating value={laboratoryValidation} onChange={setLaboratoryValidation} readOnly={!isEditable} showValue={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Prototype Validation</span>
                    <StarRating value={prototypeValidation} onChange={setPrototypeValidation} readOnly={!isEditable} showValue={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">System Integration</span>
                    <StarRating value={systemIntegration} onChange={setSystemIntegration} readOnly={!isEditable} showValue={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Functional Demonstration</span>
                    <StarRating value={functionalDemonstration} onChange={setFunctionalDemonstration} readOnly={!isEditable} showValue={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Environmental Validation</span>
                    <StarRating value={environmentalValidation} onChange={setEnvironmentalValidation} readOnly={!isEditable} showValue={false} />
                  </div>

                  <div className="pt-2">
                    <label className="font-semibold text-muted-foreground">Validation Evidence</label>
                    <textarea
                      rows={2}
                      value={validationEvidence}
                      onChange={(e) => setValidationEvidence(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 4: Technology Demonstration */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    4
                  </div>
                  <h3 className="font-bold text-foreground">Technology Demonstration</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-muted-foreground">Demonstration Environment *</label>
                    <select
                      value={demonstrationEnvironment}
                      onChange={(e) => setDemonstrationEnvironment(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    >
                      {(lookups?.demonstrationEnvironments || ["Pilot Plant"]).map((env) => (
                        <option key={env} value={env}>
                          {env}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground">Test Results</label>
                    <textarea
                      rows={2}
                      value={testResults}
                      onChange={(e) => setTestResults(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-muted-foreground">Performance Metrics</label>
                      <textarea
                        rows={2}
                        value={performanceMetrics}
                        onChange={(e) => setPerformanceMetrics(e.target.value)}
                        disabled={!isEditable}
                        className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground">Reliability Results</label>
                      <textarea
                        rows={2}
                        value={reliabilityResults}
                        onChange={(e) => setReliabilityResults(e.target.value)}
                        disabled={!isEditable}
                        className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="font-semibold text-muted-foreground">Safety Assessment *</label>
                    <StarRating value={safetyAssessment} onChange={setSafetyAssessment} readOnly={!isEditable} showValue={false} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-muted-foreground">Compliance Status *</label>
                      <select
                        value={complianceStatus}
                        onChange={(e) => setComplianceStatus(e.target.value)}
                        disabled={!isEditable}
                        className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                      >
                        {(lookups?.complianceStatuses || ["Partially Compliant"]).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-muted-foreground">Demonstration Outcome</label>
                      <textarea
                        rows={1}
                        value={demonstrationOutcome}
                        onChange={(e) => setDemonstrationOutcome(e.target.value)}
                        disabled={!isEditable}
                        className="mt-1 w-full rounded-md border border-input bg-background p-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- CARD 5 & CARD 6 GRID ---------------- */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* CARD 5: Risk Assessment */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      5
                    </div>
                    <h3 className="font-bold text-foreground">Risk Assessment</h3>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Polarity: Lower is Better
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Technical Risk</span>
                    <StarRating value={technicalRisk} onChange={setTechnicalRisk} readOnly={!isEditable} invert showValue={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Manufacturing Risk</span>
                    <StarRating value={manufacturingRisk} onChange={setManufacturingRisk} readOnly={!isEditable} invert showValue={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Supply Chain Risk</span>
                    <StarRating value={supplyChainRisk} onChange={setSupplyChainRisk} readOnly={!isEditable} invert showValue={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Regulatory Risk</span>
                    <StarRating value={regulatoryRisk} onChange={setRegulatoryRisk} readOnly={!isEditable} invert showValue={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Commercial Risk</span>
                    <StarRating value={commercialRisk} onChange={setCommercialRisk} readOnly={!isEditable} invert showValue={false} />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5 my-1">
                    <span className="font-bold text-emerald-900">Overall Risk Score (Lower is Better)</span>
                    <span className="font-mono text-base font-extrabold text-emerald-700">
                      {derivedScores.riskScoreValue} /100
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground">Risk Mitigation Plan</label>
                    <textarea
                      rows={2}
                      value={riskMitigationPlan}
                      onChange={(e) => setRiskMitigationPlan(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 6: Commercial Readiness */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    6
                  </div>
                  <h3 className="font-bold text-foreground">Commercial Readiness</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-muted-foreground">Manufacturing Readiness Level (MRL) *</label>
                    <select
                      value={mrlLevel}
                      onChange={(e) => setMrlLevel(Number(e.target.value))}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-indigo-300 bg-indigo-50/50 px-3 py-1.5 text-xs font-bold text-indigo-900 focus:border-indigo-500 focus:outline-none"
                    >
                      {(lookups?.mrlLevels || [
                        { level: 3, descriptor: "MRL 3 – Manufacturing Feasibility" },
                      ]).map((m) => (
                        <option key={m.level} value={m.level}>
                          {m.descriptor}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground">Market Readiness</span>
                      <StarRating value={marketReadiness} onChange={setMarketReadiness} readOnly={!isEditable} showValue={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground">Customer Validation</span>
                      <StarRating value={customerValidation} onChange={setCustomerValidation} readOnly={!isEditable} showValue={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground">Investment Readiness</span>
                      <StarRating value={investmentReadiness} onChange={setInvestmentReadiness} readOnly={!isEditable} showValue={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground">Business Readiness</span>
                      <StarRating value={businessReadiness} onChange={setBusinessReadiness} readOnly={!isEditable} showValue={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground">Commercial Potential</span>
                      <StarRating value={commercialPotential} onChange={setCommercialPotential} readOnly={!isEditable} showValue={false} />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground">Go-to-Market Status *</label>
                    <select
                      value={goToMarketStatus}
                      onChange={(e) => setGoToMarketStatus(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    >
                      {(lookups?.goToMarketStatuses || ["Pilot / Early Market"]).map((gtm) => (
                        <option key={gtm} value={gtm}>
                          {gtm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- CARD 7 & CARD 8 GRID ---------------- */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* CARD 7: AI TRL Assessment */}
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-card to-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-xs">
                      7
                    </div>
                    <h3 className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      AI TRL Assessment
                    </h3>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-800">
                    Generated Output
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-xs border border-indigo-100">
                    <div>
                      <div className="text-[11px] font-semibold text-muted-foreground">AI Technology Score</div>
                      <div className="text-xl font-extrabold text-indigo-600">{derivedScores.aiTechScore} /100</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-muted-foreground">AI Readiness Prediction</div>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        {record?.aiAssessment?.aiReadinessPrediction || "On Track"}
                      </span>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-muted-foreground">Est. Time to Next TRL</div>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                        {record?.aiAssessment?.aiEstimatedTimeToNextTrl || "3 – 4 Months"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-bold text-indigo-900">AI Technical Gap Analysis:</span>
                      <p className="mt-0.5 rounded-md bg-white p-2 text-muted-foreground border border-indigo-50 leading-relaxed">
                        {record?.aiAssessment?.aiTechnicalGapAnalysis ||
                          "Improve vision algorithm robustness in low-light conditions. Optimize docking speed."}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-indigo-900">AI Development Roadmap:</span>
                      <p className="mt-0.5 rounded-md bg-white p-2 text-muted-foreground border border-indigo-50 leading-relaxed">
                        {record?.aiAssessment?.aiDevelopmentRoadmap ||
                          "Enhance sensor fusion, refine control algorithms, and conduct extended field trials."}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-indigo-900">AI Recommendation:</span>
                      <p className="mt-0.5 rounded-md bg-indigo-100/60 p-2 font-semibold text-indigo-900 border border-indigo-200">
                        {record?.aiAssessment?.aiRecommendation || "Proceed to TRL 6 with extended field testing."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 8: TRL Summary */}
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-card to-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-xs">
                      8
                    </div>
                    <h3 className="font-bold text-emerald-950">TRL Summary</h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Computed Source of Truth
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                    <span className="font-medium text-muted-foreground">Overall Technical Score</span>
                    <span className="font-mono font-bold text-foreground">{derivedScores.overallTech} /100</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                    <span className="font-medium text-muted-foreground">Validation Score</span>
                    <span className="font-mono font-bold text-foreground">{derivedScores.validationScore} /100</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                    <span className="font-medium text-muted-foreground">Commercial Score</span>
                    <span className="font-mono font-bold text-foreground">{derivedScores.commercialScore} /100</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                    <span className="font-medium text-muted-foreground">
                      Risk Control / Safety Score (Higher is Better)
                    </span>
                    <span className="font-mono font-bold text-emerald-700">{derivedScores.riskControlValue} /100</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-emerald-100/70 p-3 my-2 border border-emerald-200">
                    <span className="font-extrabold text-emerald-950 text-sm">Final TRL Score</span>
                    <span className="font-mono text-xl font-extrabold text-emerald-700">
                      {derivedScores.finalScore} /100
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-foreground">Recommended TRL Level:</span>
                    <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-xs">
                      TRL {derivedScores.recommendedLevelNum}
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground">Recommendation *</label>
                    <select
                      value={recommendationOverride}
                      onChange={(e) => setRecommendationOverride(e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                    >
                      {(lookups?.recommendations || ["Advance to Next TRL"]).map((rec) => (
                        <option key={rec} value={rec}>
                          {rec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- CARD 9: Attachments ---------------- */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    9
                  </div>
                  <h3 className="font-bold text-foreground">Attachments ({attachments.length})</h3>
                </div>

                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
                  {isEditable && (
                    <ErpButton
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Upload File
                    </ErpButton>
                  )}
                  <button
                    type="button"
                    onClick={() => toast.success("Displaying all 8 attachments.")}
                    className="text-xs font-bold text-primary hover:underline ml-2 cursor-pointer"
                  >
                    View All Attachments →
                  </button>
                </div>
              </div>

              {/* 4-column Grid matching screenshot */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {attachments.slice(0, 8).map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/20 p-2.5 transition-all hover:bg-accent/40 cursor-pointer"
                    onClick={() => toast.success(`Downloading ${att.fileName}...`)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-700 font-bold text-[10px]">
                      {att.fileType || "PDF"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold text-foreground" title={att.fileName}>
                        {att.fileName}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{att.fileSize}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------- CARD 10: Review & Approval (5-Row Table) ---------------- */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    10
                  </div>
                  <h3 className="font-bold text-foreground">Review & Approval</h3>
                </div>

                <ErpButton
                  variant="primary"
                  size="sm"
                  onClick={() => setShowReviewModal(true)}
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  Perform Executive Review
                </ErpButton>
              </div>

              {/* 5-row Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Person</th>
                      <th className="py-2.5 px-3">Decision</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(record?.reviewRows || []).map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="py-2.5 px-3 font-bold text-foreground">{row.role}</td>
                        <td className="py-2.5 px-3 font-medium text-foreground">{row.person}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold",
                              row.decision === "Approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : row.decision === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800",
                            )}
                          >
                            {row.decision}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                              row.status === "Approved"
                                ? "bg-emerald-50 text-emerald-700"
                                : row.status === "In Review"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-gray-100 text-gray-700",
                            )}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground font-mono">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---------------- CARD 11: System Information ---------------- */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  11
                </div>
                <h3 className="font-bold text-foreground">System Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
                <div>
                  <span className="font-semibold text-muted-foreground">Created By</span>
                  <div className="mt-0.5 font-medium text-foreground">{record?.createdBy || "Rohit Verma"}</div>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground">Created Date</span>
                  <div className="mt-0.5 font-mono text-foreground">{record?.createdAt || "2024-05-20 09:15 AM"}</div>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground">Last Modified By</span>
                  <div className="mt-0.5 font-medium text-foreground">{record?.lastModifiedBy || "Rohit Verma"}</div>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground">Last Modified Date</span>
                  <div className="mt-0.5 font-mono text-foreground">{record?.updatedAt || "2024-05-20 04:32 PM"}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-muted-foreground">
                    Workflow Stage:{" "}
                    <span className="font-bold text-foreground capitalize">
                      {record?.currentStageLabel || "Executive Review"}
                    </span>
                  </span>

                  <span className="font-semibold text-muted-foreground">
                    Version: <span className="font-mono font-bold text-foreground">{record?.version || "1.2"}</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 font-bold text-primary">
                  <button type="button" onClick={() => setShowAuditDrawer(true)} className="hover:underline cursor-pointer">
                    Audit Trail →
                  </button>

                  <button type="button" onClick={() => setShowActivityDrawer(true)} className="hover:underline cursor-pointer">
                    Activity History →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
             RIGHT SIDEBAR PANEL (STICKY ON SCROLL)
             ========================================================================= */}
          <div className="space-y-6 lg:sticky lg:top-4 lg:self-start">
            {/* PANEL 1: TRL Overview */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-foreground border-b border-border pb-2.5">TRL Overview</h3>

              <ReadinessGauge percent={derivedScores.finalScore} />

              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Current TRL</span>
                  <span className="font-extrabold text-foreground text-sm">{currentTrlLevel}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Target TRL</span>
                  <span className="font-extrabold text-blue-600 text-sm">{targetTrlLevel}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Final TRL Score</span>
                  <span className="font-mono font-bold text-emerald-600">{derivedScores.finalScore} /100</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Confidence Level</span>
                  <span className="font-mono font-bold text-foreground">{confidenceLevel}%</span>
                </div>

                <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-200 mt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Recommendation</div>
                  <div className="text-xs font-extrabold text-emerald-700 mt-0.5">
                    Advance to TRL {derivedScores.recommendedLevelNum}
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: TRL Scale Guide */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-foreground border-b border-border pb-2.5">TRL Scale Guide</h3>

              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {TRL_SCALE_GUIDE.map((g) => {
                  const isCurrent = g.level === currentTrlLevel;
                  return (
                    <div
                      key={g.level}
                      className={cn(
                        "flex items-start gap-2.5 rounded-lg p-2 text-xs transition-colors",
                        isCurrent
                          ? "bg-emerald-50 border border-emerald-300 font-bold text-emerald-950 shadow-xs"
                          : "hover:bg-muted/40 text-muted-foreground",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                          isCurrent
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {g.level}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={cn("truncate text-[11px]", isCurrent && "font-bold text-emerald-950")}>
                          {g.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PANEL 3: Quick Actions */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-foreground border-b border-border pb-2.5">Quick Actions</h3>

              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => reportMutation.mutate()}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  Generate TRL Report
                </button>

                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Schedule Review Meeting
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-emerald-600" />
                  Upload New Evidence
                </button>

                <button
                  type="button"
                  onClick={() => setShowCompareHistoryDrawer(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  <History className="h-4 w-4 text-amber-600" />
                  Compare TRL History
                </button>

                <button
                  type="button"
                  onClick={() => setShowRoadmapModal(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  <Layers className="h-4 w-4 text-purple-600" />
                  View Technology Roadmap
                </button>

                <button
                  type="button"
                  onClick={() => toast.success("Exporting TRL Assessment report...")}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4 text-muted-foreground" />
                  Export Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
         MODALS & DRAWERS
         ========================================================================= */}

      {/* EXECUTIVE REVIEW DECISION MODAL */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              Executive Review Committee Decision
            </DialogTitle>
            <DialogDescription className="text-xs">
              Execute formal technical review decision for TRL Assessment {record?.trlAssessmentId}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground">Select Decision *</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["Approved", "Approved with Improvements", "Revision Required", "Rejected"] as const).map(
                  (d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setReviewDecisionChoice(d)}
                      className={cn(
                        "rounded-lg border p-2.5 text-left font-bold transition-all cursor-pointer",
                        reviewDecisionChoice === d
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {d}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground">Reviewer Comments & Feedback</label>
              <textarea
                rows={3}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Enter formal committee rationale and conditions..."
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {reviewDecisionChoice === "Approved" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-emerald-900">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Approval Action Trigger:
                </div>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Upon approving this assessment:
                  <br />- TRL Level will advance to <strong>TRL {derivedScores.recommendedLevelNum}</strong>.
                  <br />- Linked <strong>Manufacturing Readiness (MRL) Assessment</strong> will be auto-created.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <ErpButton variant="ghost" onClick={() => setShowReviewModal(false)}>
              Cancel
            </ErpButton>
            <ErpButton
              variant="primary"
              loading={reviewMutation.isPending}
              onClick={() =>
                reviewMutation.mutate({ decision: reviewDecisionChoice, comments: reviewComments })
              }
            >
              Commit Decision
            </ErpButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* RESOLVED LINKED RECORDS PREVIEW MODAL */}
      <Dialog open={!!activeLinkedModal} onOpenChange={(o) => !o && setActiveLinkedModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <ExternalLink className="h-4 w-4 text-primary" />
              Resolved Record Details
            </DialogTitle>
          </DialogHeader>

          {activeLinkedModal === "technology" && (
            <div className="space-y-3 text-xs">
              <div className="font-mono text-sm font-bold text-blue-700 bg-blue-50 p-2 rounded">
                TEC-2024-0032: Autonomous Vision Docking Core
              </div>
              <p className="text-muted-foreground">
                High-precision AI vision system for automated vehicle docking. Includes camera optics array, edge neural processing, and closed-loop control actuators.
              </p>
              <div className="flex justify-between border-t pt-2 text-muted-foreground">
                <span>Domain: Robotics & AI</span>
                <span>Status: Active</span>
              </div>
            </div>
          )}

          {activeLinkedModal === "research" && (
            <div className="space-y-3 text-xs">
              <div className="font-mono text-sm font-bold text-purple-700 bg-purple-50 p-2 rounded">
                RES-2024-0018: Advanced Sensor Fusion for EV Alignment
              </div>
              <p className="text-muted-foreground">
                Multi-sensor fusion research combining LiDAR, ultrasonic, and camera telemetry for sub-centimeter alignment accuracy under extreme weather conditions.
              </p>
              <div className="flex justify-between border-t pt-2 text-muted-foreground">
                <span>PI: Dr. Anil Patel</span>
                <span>Publications: 4 Papers</span>
              </div>
            </div>
          )}

          {activeLinkedModal === "prototype" && (
            <div className="space-y-3 text-xs">
              <div className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 p-2 rounded">
                PRD-2024-0012: Pilot Docking Arm Prototype v3.2
              </div>
              <p className="text-muted-foreground">
                Hardware prototype featuring motorized 3-axis arm, automated latching head, and safety force-feedback sensors. Passed 500 bench tests.
              </p>
              <div className="flex justify-between border-t pt-2 text-muted-foreground">
                <span>Build Date: 12 April 2024</span>
                <span>Owner: Vikram Singh</span>
              </div>
            </div>
          )}

          {activeLinkedModal === "product" && (
            <div className="space-y-3 text-xs">
              <div className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 p-2 rounded">
                PRD-1001: NextGen EV Charging Station Suite
              </div>
              <p className="text-muted-foreground">
                Flagship commercial station product targeted for highway fast-charging infrastructure and commercial fleet depots.
              </p>
              <div className="flex justify-between border-t pt-2 text-muted-foreground">
                <span>Category: Automotive</span>
                <span>Market Launch: Q4 2025</span>
              </div>
            </div>
          )}

          {activeLinkedModal === "mrl" && (
            <div className="space-y-3 text-xs">
              <div className="font-mono text-sm font-bold text-emerald-800 bg-emerald-100 p-2 rounded flex justify-between items-center">
                <span>{record?.linkedMrlAssessmentCode || "MRL-2024-0042"}</span>
                <span className="text-xs font-semibold">Created</span>
              </div>
              <p className="text-muted-foreground">
                Manufacturing Readiness Level Assessment auto-generated from TRL approval. Assesses pilot line capability, tooling readiness, and supply chain qualification.
              </p>
              <div className="flex justify-between border-t pt-2 text-muted-foreground">
                <span>Target MRL: 5</span>
                <span>Assessor: Quality & Mfg Board</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AUDIT TRAIL DRAWER */}
      <Dialog open={showAuditDrawer} onOpenChange={setShowAuditDrawer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <History className="h-5 w-5 text-primary" />
              Full Audit Trail Log
            </DialogTitle>
            <DialogDescription className="text-xs">
              Immutable system record of modifications and state transitions for {record?.trlAssessmentId}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
            {(record?.auditTrail || []).map((log) => (
              <div key={log.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-bold text-foreground">{log.actor}</span>
                  <span className="font-mono text-[11px]">{log.timestamp}</span>
                </div>
                <div className="text-xs text-muted-foreground">{log.event}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ACTIVITY HISTORY DRAWER */}
      <Dialog open={showActivityDrawer} onOpenChange={setShowActivityDrawer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Activity className="h-5 w-5 text-emerald-600" />
              Activity History
            </DialogTitle>
            <DialogDescription className="text-xs">
              Chronological log of user actions, comments, and file uploads.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
            {(record?.auditTrail || [])
              .filter((a) => a.kind === "audit" || a.kind === "activity")
              .map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 border-b border-border/60 pb-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold shrink-0">
                    {log.actor[0]}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{log.event}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {log.actor} • {log.timestamp}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* SCHEDULE REVIEW MEETING MODAL */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Schedule TRL Review Meeting
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs py-2">
            <div>
              <label className="font-semibold text-muted-foreground">Meeting Subject</label>
              <input
                type="text"
                defaultValue={`TRL Gate Review: ${record?.trlAssessmentId}`}
                className="mt-1 w-full rounded-md border border-input p-2 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-muted-foreground">Date & Time</label>
              <input type="datetime-local" className="mt-1 w-full rounded-md border border-input p-2 text-xs" />
            </div>
            <div>
              <label className="font-semibold text-muted-foreground">Attendees</label>
              <input
                type="text"
                defaultValue={assessmentTeam.join(", ")}
                className="mt-1 w-full rounded-md border border-input p-2 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-2">
            <ErpButton variant="ghost" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </ErpButton>
            <ErpButton
              variant="primary"
              onClick={() => {
                setShowScheduleModal(false);
                toast.success("Review meeting invitation sent to committee.");
              }}
            >
              Send Calendar Invite
            </ErpButton>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
