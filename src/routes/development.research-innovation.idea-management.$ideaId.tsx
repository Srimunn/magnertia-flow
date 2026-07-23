import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  Send,
  ShieldCheck,
  GitBranch,
  History as HistoryIcon,
  FlaskConical,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { IdeaTabBar } from "@/components/erp/IdeaTabBar";
import { CardHeader } from "@/components/erp/CardHeader";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mock-data";
import { ideaManagementService } from "@/services";
import type { IdeaDecision, IdeaRecord, IdeaReviewerRole, IdeaStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/idea-management/$ideaId")({
  head: () => ({ meta: [{ title: "Idea Detail · Magnertia ERP" }] }),
  component: IdeaDetailPage,
});

const REVIEW_STAGE_ROLE: Record<string, IdeaReviewerRole> = {
  "Initial Screening": "Department Manager",
  "Technical Review": "Technical Reviewer",
  "Business Review": "Business Reviewer",
  "Patentability Review": "IP & Patent Team",
  "Innovation Committee Review": "Innovation Committee",
};
const ALL_ROLES: IdeaReviewerRole[] = [
  "Department Manager",
  "Technical Reviewer",
  "Business Reviewer",
  "IP & Patent Team",
  "Innovation Committee",
];

// Decisions offered per stage.
function decisionsFor(
  stage: IdeaStatus,
): { decision: IdeaDecision; label: string; variant?: "primary" | "outline" | "destructive" }[] {
  if (stage === "Innovation Committee Review") {
    return [
      { decision: "Approved", label: "Approve", variant: "primary" },
      { decision: "Revision Required", label: "Request Revision", variant: "outline" },
      { decision: "On Hold", label: "Put On Hold", variant: "outline" },
      { decision: "Rejected", label: "Reject", variant: "destructive" },
    ];
  }
  return [
    { decision: "Forwarded", label: "Forward", variant: "primary" },
    { decision: "Returned for Correction", label: "Return for Correction", variant: "outline" },
    { decision: "Rejected", label: "Reject", variant: "destructive" },
  ];
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function IdeaDetailPage() {
  const { ideaId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const ideaQuery = useQuery({
    queryKey: ["ideas", "detail", ideaId],
    queryFn: () => ideaManagementService.fetchIdea(ideaId),
  });
  const idea = ideaQuery.data;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ideas", "detail", ideaId] });
    queryClient.invalidateQueries({ queryKey: ["ideas", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["ideas", "notifications"] });
  };

  const review = useMutation({
    mutationFn: (args: Parameters<typeof ideaManagementService.reviewIdea>[0]) =>
      ideaManagementService.reviewIdea(args),
    onSuccess: (rec) => {
      invalidate();
      toast.success(`${rec.ideaCode} → ${rec.status}`);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const submit = useMutation({
    mutationFn: () => ideaManagementService.submitIdea(ideaId),
    onSuccess: (rec) => {
      invalidate();
      toast.success(`${rec.ideaCode} submitted for Initial Screening.`);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (ideaQuery.isLoading || !idea) {
    return (
      <AppShell
        title="Idea Detail"
        breadcrumb="Research & Innovation Development"
        tabs={<IdeaTabBar />}
      >
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={idea.basic.title || idea.ideaCode}
      breadcrumb="Research & Innovation Development"
      description={`${idea.ideaCode} · v${idea.version} · submitted by ${idea.submittedBy}`}
      tabs={<IdeaTabBar />}
      topbarActions={
        <Link to="/development/research-innovation/idea-management">
          <ErpButton variant="outline">
            <ArrowLeft className="h-4 w-4" /> Back
          </ErpButton>
        </Link>
      }
    >
      <div className="space-y-5">
        {/* Status band */}
        <div className="card-soft flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={idea.status} />
            <span className="text-xs text-muted-foreground">Priority:</span>
            <span className="text-xs font-bold text-foreground">{idea.priority}</span>
            {idea.feasibilityProjectId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                <FlaskConical className="h-3 w-3" /> Feasibility project created
              </span>
            )}
          </div>
          {(idea.status === "Draft" || idea.status === "Revision Required") && (
            <div className="flex items-center gap-2">
              <Link
                to="/development/research-innovation/idea-management/new"
                search={{ id: idea.id }}
              >
                <ErpButton variant="outline">
                  <Pencil className="h-4 w-4" /> Edit
                </ErpButton>
              </Link>
              <ErpButton loading={submit.isPending} onClick={() => submit.mutate()}>
                <Send className="h-4 w-4" /> Submit for Screening
              </ErpButton>
            </div>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          {/* Left — data */}
          <div className="min-w-0 space-y-5">
            <ReviewerActionPanel
              key={idea.status}
              idea={idea}
              onReview={(args) => review.mutate(args)}
              pending={review.isPending}
            />

            <ScorePanel idea={idea} />

            <DataCard title="Overview">
              <KV k="Short Description" v={idea.basic.shortDescription} />
              <KV k="Detailed Description" v={idea.basic.detailedDescription} />
              <KV
                k="Category"
                v={[idea.basic.category, idea.basic.subCategory].filter(Boolean).join(" / ")}
              />
              <KV k="Business Unit" v={idea.basic.businessUnit} />
              <KV k="Department" v={idea.basic.department} />
              <KV k="Product Line" v={idea.basic.productLine} />
              <KV k="Innovation Theme" v={idea.basic.innovationTheme} />
              <KV
                k="Innovation Type / Level"
                v={[idea.classification.innovationType, idea.classification.innovationLevel]
                  .filter(Boolean)
                  .join(" / ")}
              />
              <KV k="Technology Area" v={idea.classification.technologyArea.join(", ")} />
              <KV k="Team Members" v={idea.basic.teamMembers.join(", ")} />
            </DataCard>

            <DataCard title="Problem & Solution">
              <KV k="Existing Problem" v={idea.problem.existingProblem} />
              <KV k="Root Cause" v={idea.problem.rootCause} />
              <KV k="Opportunity" v={idea.problem.opportunityDescription} />
              <KV k="Proposed Solution" v={idea.solution.proposedSolution} />
              <KV k="Unique Value Proposition" v={idea.solution.uniqueValueProposition} />
              <KV k="Competitive Advantage" v={idea.solution.competitiveAdvantage} />
              <KV k="Technology Used" v={idea.solution.technologyUsed.join(", ")} />
            </DataCard>

            <DataCard title="Business & Financials">
              <KV k="Expected Revenue" v={formatCurrency(idea.businessImpact.expectedRevenue)} />
              <KV k="Cost Saving" v={formatCurrency(idea.businessImpact.costSaving)} />
              <KV
                k="Estimated Investment"
                v={formatCurrency(idea.financials.estimatedInvestment)}
              />
              <KV k="Funding Required" v={formatCurrency(idea.financials.fundingRequired)} />
              <KV k="Expected ROI" v={`${idea.financials.expectedROI}%`} />
              <KV k="Payback Period" v={`${idea.financials.paybackPeriod} months`} />
              <KV k="Profit Margin" v={`${idea.financials.estimatedProfitMargin}%`} />
              <KV k="Break-even" v={`${idea.financials.estimatedBreakEven} months`} />
            </DataCard>

            <DataCard title="Market">
              <KV k="Target Market" v={idea.market.targetMarket} />
              <KV k="Market Size" v={formatCurrency(idea.market.marketSize)} />
              <KV
                k="TAM / SAM / SOM"
                v={[idea.market.tam, idea.market.sam, idea.market.som]
                  .map((n) => formatCurrency(n, true))
                  .join(" / ")}
              />
              <KV k="Growth Rate" v={`${idea.market.marketGrowthRate}%`} />
              <KV k="Competitor Availability" v={idea.market.competitorAvailability} />
            </DataCard>

            <DataCard title="Intellectual Property">
              <KV k="Patentable" v={idea.ip.patentable ? "Yes" : "No"} />
              <KV k="Patent Search Completed" v={idea.ip.patentSearchCompleted ? "Yes" : "No"} />
              <KV k="Existing Patent References" v={idea.ip.existingPatentReferences.join(", ")} />
              <KV
                k="Trade Secret / Copyright / Trademark"
                v={[
                  idea.ip.tradeSecret && "Trade Secret",
                  idea.ip.copyrightApplicable && "Copyright",
                  idea.ip.trademarkApplicable && "Trademark",
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
              <KV k="IP Comments" v={idea.ip.ipComments} />
              <KV k="Patent Search Status" v={idea.ip.patentSearchStatus} />
              <KV k="IP Risk" v={idea.ip.ipRisk} />
              <KV k="Patent Recommendation" v={idea.ip.patentRecommendation} />
            </DataCard>

            {idea.attachments.length > 0 && (
              <DataCard title={`Attachments (${idea.attachments.length})`}>
                <ul className="divide-y divide-border">
                  {idea.attachments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <div className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {a.filename}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {a.category} · {a.fileType} · {a.uploadedBy}
                        </span>
                      </div>
                      <a
                        href={a.url}
                        className="shrink-0 text-xs font-semibold text-primary hover:underline"
                        onClick={(e) => e.preventDefault()}
                        title={a.url}
                      >
                        Mock link
                      </a>
                    </li>
                  ))}
                </ul>
              </DataCard>
            )}

            {/* AI Evaluation placeholder */}
            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">AI Evaluation — Coming Soon</p>
                  <p className="text-[11px] text-muted-foreground">
                    AI scores, recommendation, similar ideas and priority ranking will appear here
                    once the AI Innovation Assistant is enabled.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — workflow + approvals + history */}
          <div className="space-y-5">
            <div className="card-soft p-5">
              <CardHeader title="Workflow" />
              <ol className="mt-3 space-y-3">
                {idea.workflow.length === 0 && (
                  <li className="text-xs text-muted-foreground">Not yet submitted.</li>
                )}
                {idea.workflow.map((w, i) => (
                  <li key={i} className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">
                        <GitBranch className="h-3 w-3" />
                      </span>
                      {i < idea.workflow.length - 1 && (
                        <span className="mt-0.5 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="text-xs font-semibold text-foreground">{w.toStatus}</p>
                      <p className="text-[11px] text-muted-foreground">{w.action}</p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {w.actorName} · {fmt(w.at)}
                      </p>
                      {w.comment && (
                        <p className="mt-0.5 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          “{w.comment}”
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-soft p-5">
              <CardHeader title="Approvals" />
              <ul className="mt-3 space-y-2">
                {idea.approvals.length === 0 && (
                  <li className="text-xs text-muted-foreground">No review stages yet.</li>
                )}
                {idea.approvals.map((a) => (
                  <li key={a.stage} className="flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="block truncate font-medium text-foreground">{a.stage}</span>
                      <span className="text-[10px] text-muted-foreground">{a.role}</span>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        a.decision === "Pending"
                          ? "bg-muted text-muted-foreground"
                          : a.decision === "Rejected"
                            ? "bg-destructive/10 text-destructive"
                            : a.decision === "Approved" || a.decision === "Forwarded"
                              ? "bg-success/10 text-success"
                              : "bg-warning/15 text-[oklch(0.45_0.15_75)]",
                      )}
                    >
                      {a.decision}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-soft p-5">
              <div className="flex items-center gap-1.5">
                <HistoryIcon className="h-4 w-4 text-primary" />
                <CardHeader title="Activity & Comments" />
              </div>
              <ul className="mt-3 space-y-2">
                {idea.history
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <li key={i} className="text-xs">
                      <p className="font-medium text-foreground">{h.action}</p>
                      {h.detail && <p className="text-[11px] text-muted-foreground">{h.detail}</p>}
                      <p className="text-[10px] text-muted-foreground/70">
                        {h.actor} · {fmt(h.at)}
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* ------------------------------ Sub-components ----------------------------- */
function ReviewerActionPanel({
  idea,
  onReview,
  pending,
}: {
  idea: IdeaRecord;
  onReview: (args: Parameters<typeof ideaManagementService.reviewIdea>[0]) => void;
  pending: boolean;
}) {
  const stageRole = REVIEW_STAGE_ROLE[idea.status];
  const [actingRole, setActingRole] = useState<IdeaReviewerRole>(stageRole ?? "Department Manager");
  const [comment, setComment] = useState("");
  const [priority, setPriority] = useState<IdeaRecord["priority"]>(idea.priority);
  const [patentRec, setPatentRec] = useState("File Patent");
  const [ipRisk, setIpRisk] = useState("Low");

  const isReviewStage = Boolean(stageRole);
  const canAct = isReviewStage && actingRole === stageRole;

  return (
    <div className="card-soft p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <CardHeader title="Reviewer Action" />
        </div>
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Acting as</span>
          <select
            className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-semibold text-foreground"
            value={actingRole}
            onChange={(e) => setActingRole(e.target.value as IdeaReviewerRole)}
          >
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!isReviewStage ? (
        <p className="mt-3 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
          {idea.status === "Approved" || idea.status === "Converted to Feasibility Study"
            ? "This idea has been approved — no further review actions."
            : idea.status === "Rejected"
              ? "This idea was rejected and archived."
              : idea.status === "On Hold"
                ? "This idea is on hold. It can be revisited by the Innovation Committee."
                : "This idea is not currently in a review stage."}
        </p>
      ) : !canAct ? (
        <p className="mt-3 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
          The current stage <span className="font-semibold text-foreground">{idea.status}</span> is
          actioned by the <span className="font-semibold text-foreground">{stageRole}</span>. Switch
          role to act.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            Stage: <span className="font-semibold text-foreground">{idea.status}</span>
          </p>

          {idea.status === "Patentability Review" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-foreground">IP Risk</span>
                <select
                  className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-xs"
                  value={ipRisk}
                  onChange={(e) => setIpRisk(e.target.value)}
                >
                  {["Low", "Medium", "High"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-foreground">
                  Patent Recommendation
                </span>
                <select
                  className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-xs"
                  value={patentRec}
                  onChange={(e) => setPatentRec(e.target.value)}
                >
                  {["File Patent", "File Provisional", "Keep as Trade Secret", "No Action"].map(
                    (o) => (
                      <option key={o}>{o}</option>
                    ),
                  )}
                </select>
              </label>
            </div>
          )}

          {idea.status === "Innovation Committee Review" && (
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold text-foreground">Assign Priority</span>
              <select
                className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-xs"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IdeaRecord["priority"])}
              >
                {["Low", "Medium", "High", "Critical"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          )}

          <textarea
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            rows={2}
            placeholder="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {decisionsFor(idea.status).map((d) => (
              <ErpButton
                key={d.decision}
                variant={d.variant ?? "primary"}
                loading={pending}
                onClick={() =>
                  onReview({
                    id: idea.id,
                    stage: idea.status,
                    decision: d.decision,
                    comment: comment.trim() || undefined,
                    priority: idea.status === "Innovation Committee Review" ? priority : undefined,
                    patentFields:
                      idea.status === "Patentability Review"
                        ? {
                            patentSearchStatus: "Completed",
                            ipRisk,
                            patentRecommendation: patentRec,
                          }
                        : undefined,
                  })
                }
              >
                {d.decision === "Approved" && <CheckCircle2 className="h-4 w-4" />}
                {d.label}
              </ErpButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScorePanel({ idea }: { idea: IdeaRecord }) {
  const s = idea.scores;
  const tiles = useMemo(
    () =>
      [
        ["Innovation", s.overallInnovationScore],
        ["Technical Feasibility", s.technicalFeasibilityScore],
        ["Business Feasibility", s.businessFeasibilityScore],
        ["Market Opportunity", s.marketOpportunityScore],
        ["Risk", s.riskScore],
        ["ESG", s.esgScore],
      ] as [string, number][],
    [s],
  );
  return (
    <div className="card-soft p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardHeader title="Evaluation Scores" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Overall</span>
          <span className="font-display text-xl font-bold tabular text-primary">
            {s.overallEvaluationScore}
          </span>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {s.ideaRanking}
          </span>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Calculated from the manually-entered ratings — no AI inputs.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {tiles.map(([label, val]) => (
          <div key={label} className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{label}</span>
              <span className="text-xs font-bold tabular text-foreground">{val}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  label === "Risk" ? "bg-destructive/70" : "bg-primary",
                )}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-soft p-5">
      <CardHeader title={title} />
      <dl className="mt-3 divide-y divide-border">{children}</dl>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 py-2 text-sm">
      <dt className="text-xs font-medium text-muted-foreground">{k}</dt>
      <dd className="whitespace-pre-wrap text-foreground">{v && v.trim() ? v : "—"}</dd>
    </div>
  );
}
