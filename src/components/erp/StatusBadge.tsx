import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  paid: "bg-success/10 text-success ring-success/20",
  posted: "bg-success/10 text-success ring-success/20",
  online: "bg-success/10 text-success ring-success/20",
  active: "bg-success/10 text-success ring-success/20",
  operational: "bg-success/10 text-success ring-success/20",
  compliant: "bg-success/10 text-success ring-success/20",
  verified: "bg-success/10 text-success ring-success/20",
  passed: "bg-success/10 text-success ring-success/20",
  converted: "bg-success/10 text-success ring-success/20",
  "closed won": "bg-success/10 text-success ring-success/20",
  resolved: "bg-success/10 text-success ring-success/20",
  submission: "bg-success/10 text-success ring-success/20",
  monitoring: "bg-success/10 text-success ring-success/20",
  approved: "bg-accent/15 text-accent-foreground ring-accent/25",
  pending: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  degraded: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  maintenance: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "due soon": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "pending review": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "on hold": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  contacted: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  qualified: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  proposal: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  negotiation: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  open: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "scheme search": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  eligibility: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  dpr: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  approval: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  inactive: "bg-muted text-muted-foreground ring-border",
  canceled: "bg-muted text-muted-foreground ring-border",
  "credit memo": "bg-muted text-muted-foreground ring-border",
  draft: "bg-muted text-muted-foreground ring-border",
  obsolete: "bg-muted text-muted-foreground ring-border",
  reversed: "bg-muted text-muted-foreground ring-border",
  overdue: "bg-destructive/10 text-destructive ring-destructive/20",
  offline: "bg-destructive/10 text-destructive ring-destructive/20",
  locked: "bg-destructive/10 text-destructive ring-destructive/20",
  "non-compliant": "bg-destructive/10 text-destructive ring-destructive/20",
  rejected: "bg-destructive/10 text-destructive ring-destructive/20",
  failed: "bg-destructive/10 text-destructive ring-destructive/20",
  lost: "bg-destructive/10 text-destructive ring-destructive/20",
  "closed lost": "bg-destructive/10 text-destructive ring-destructive/20",
  expired: "bg-destructive/10 text-destructive ring-destructive/20",
  // "info" tone — in-progress/neutral-informational states that aren't
  // fully resolved (success) but aren't a warning either, e.g. "Partially
  // Paid". Same blue already used for neutral KPI icons (#3B82F6).
  "partially paid": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  planned: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "in progress": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  new: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  prospecting: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  qualification: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  closed: "bg-success/10 text-success ring-success/20",
  requirement: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "assign law firm": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  opinion: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  documentation: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  closure: "bg-success/10 text-success ring-success/20",
  // Idea Management workflow stages
  submitted: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "initial screening": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "technical review": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "business review": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "patentability review": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "innovation committee review": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "revision required": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "under review": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  validated: "bg-success/10 text-success ring-success/20",
  "partially validated": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "more research required": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "validation failed": "bg-destructive/10 text-destructive ring-destructive/20",
  "budget review": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "rework required": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  archived: "bg-muted text-muted-foreground ring-border",
  "converted to feasibility study": "bg-success/10 text-success ring-success/20",
  // Technology Scouting workflow stages
  identified: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "under evaluation": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "ip review": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "executive review": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  // Research Management workflow stages
  planning: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "resource planning": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "approved with conditions": "bg-accent/15 text-accent-foreground ring-accent/25",
  // Feasibility Study workflow stages
  "technical feasibility": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "market feasibility": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "financial feasibility": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "operational feasibility": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "compliance & risk": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "conditional approval": "bg-accent/15 text-accent-foreground ring-accent/25",
  deferred: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  // Proof of Concept workflow stages
  "technical implementation": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "build & integration": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "experimental testing": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "commercial assessment": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "final review": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "technical testing": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  // Prototype Development workflow stages
  "engineering design": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "prototype manufacturing": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "testing & validation": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "engineering review": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  // Manufacturing sub-status badges (fabrication / assembly / quality inspection)
  completed: "bg-success/10 text-success ring-success/20",
  delayed: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  cancelled: "bg-destructive/10 text-destructive ring-destructive/20",
  // Experiment Management workflow stages
  "experiment planning": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "laboratory preparation": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  "experiment execution": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  validation: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  // Patent Management workflow stages + renewal states
  preparation: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  filing: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  examination: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  granted: "bg-success/10 text-success ring-success/20",
  commercialization: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  abandoned: "bg-muted text-muted-foreground ring-border",
  upcoming: "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
  due: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const cls = TONES[key] ?? "bg-secondary text-secondary-foreground ring-border";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
