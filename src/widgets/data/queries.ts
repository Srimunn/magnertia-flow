import { queryOptions } from "@tanstack/react-query";
import { company } from "@/lib/mock-data";
import {
  accountsPayableService,
  accountsReceivableService,
  bankAccountService,
  generalLedgerService,
  journalEntryService,
  loadAccountsPayableDashboard,
  loadAccountsReceivableDashboard,
  loadAuditTrailDashboard,
  loadBudgetingDashboard,
  loadCashBankDashboard,
  loadConsolidationDashboard,
  loadCostCentersDashboard,
  loadDashboardData,
  loadFinancialReportingDashboard,
  loadFixedAssetsDashboard,
  loadProfitabilityDashboard,
  loadTaxManagementDashboard,
} from "@/services";
import type { BankAccountFilters, DashboardQuery } from "@/services/types";

/* ===========================================================================
   Canonical widget data sources
   ---------------------------------------------------------------------------
   Widgets fetch their own data, so the same widget works on any page. That only
   costs zero extra requests if every consumer uses the SAME query key — so all
   keys live here, and each is annotated with the route it must stay in sync
   with. A widget co-located with its source page reads straight from cache.
   =========================================================================== */

export const DEFAULT_QUERY: DashboardQuery = {
  fiscalYear: company.fiscalYear,
  companyId: "all",
};

/**
 * Financial Management dashboard aggregate.
 * Key matches src/routes/index.tsx.
 * Finance Overview previously used ["finance","dashboard"] for this same
 * loader; its widgets now adopt this key so both pages share one fetch.
 */
export function dashboardDataOptions() {
  return queryOptions({
    queryKey: ["dashboard", "financial-management", DEFAULT_QUERY.fiscalYear, "all"] as const,
    queryFn: () => loadDashboardData(DEFAULT_QUERY),
  });
}

/** Live General Ledger KPIs + AI intelligence scores (MongoDB-backed). */
export function ledgerDashboardOptions() {
  return queryOptions({
    queryKey: ["finance", "ledger-dashboard"] as const,
    queryFn: () => generalLedgerService.fetchLedgerDashboardData(),
  });
}

/** Unwraps the GL server-fn envelope to the payload the widgets read. */
export function unwrapLedger<T extends { success?: boolean; data?: unknown }>(res: T | undefined) {
  if (!res) return undefined;
  if ("success" in res && res.success === false) return undefined;
  return (res as { data?: unknown }).data as
    | {
        kpis: {
          totalAccounts: number;
          totalDebits: number;
          totalCredits: number;
          netIncome: number;
          totalJournalEntries: number;
          postedJournals: number;
          pendingJournals: number;
          trialBalanceDifference: number;
          revenue: number;
          expenses: number;
          netProfit: number;
        };
        aiIntelligence: {
          ledgerHealthScore: number;
          journalAccuracyScore: number;
          financialRiskScore: number;
          fraudDetectionScore: number;
          closingReadinessScore: number;
          aiRecommendations: string;
        };
      }
    | undefined;
}

/** All journals (live). Key matches the Finance Overview route. */
export function journalsOptions() {
  return queryOptions({
    queryKey: ["finance", "journals"] as const,
    queryFn: () => journalEntryService.fetchJournals(),
  });
}

export function apTotalOptions() {
  return queryOptions({
    queryKey: ["finance", "ap-total"] as const,
    queryFn: () => accountsPayableService.calculateTotalPayables(DEFAULT_QUERY),
  });
}

export function apCountOptions() {
  return queryOptions({
    queryKey: ["finance", "ap-count"] as const,
    queryFn: () => accountsPayableService.countOpenInvoices(DEFAULT_QUERY),
  });
}

export function arTotalOptions() {
  return queryOptions({
    queryKey: ["finance", "ar-total"] as const,
    queryFn: () => accountsReceivableService.calculateTotalReceivables(DEFAULT_QUERY),
  });
}

export function arCountOptions() {
  return queryOptions({
    queryKey: ["finance", "ar-count"] as const,
    queryFn: () => accountsReceivableService.countOpenInvoices(DEFAULT_QUERY),
  });
}

const ALL_BANK_ACCOUNTS: BankAccountFilters = {
  search: "",
  type: "All Types",
  status: "All Statuses",
  currency: "All Currency",
};

/**
 * Bank accounts. Routed through the service rather than importing mock-data
 * directly, which is what the Finance Overview page used to do — that shortcut
 * violated the "routes/components never import mock-data" rule, so extracting
 * the widget was a chance to fix it.
 */
export function bankAccountsOptions() {
  return queryOptions({
    queryKey: ["finance", "bank-accounts", "all"] as const,
    queryFn: () => bankAccountService.fetchBankAccounts(DEFAULT_QUERY, ALL_BANK_ACCOUNTS),
  });
}

/* ---------------------------------------------------------------------------
   Module dashboards behind the finance pages' own KPI rows.
   Each key MUST match its route's key exactly — that's what lets a widget
   placed on its own page read from cache instead of issuing a second request.
   --------------------------------------------------------------------------- */

/** Key matches src/routes/management.finance.payables.tsx */
export function payablesDashboardOptions() {
  return queryOptions({
    queryKey: ["payables", "kpis", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadAccountsPayableDashboard(DEFAULT_QUERY),
  });
}

/** Key matches src/routes/management.finance.receivables.tsx */
export function receivablesDashboardOptions() {
  return queryOptions({
    queryKey: ["receivables", "kpis", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadAccountsReceivableDashboard(DEFAULT_QUERY),
  });
}

/** Key matches src/routes/management.finance.cash-bank.tsx */
export function cashBankDashboardOptions() {
  return queryOptions({
    queryKey: ["cash-bank", "dashboard", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadCashBankDashboard(DEFAULT_QUERY),
  });
}

/** Key matches src/routes/management.finance.budgeting.tsx */
export function budgetingDashboardOptions() {
  return queryOptions({
    queryKey: ["budgeting", "dashboard", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadBudgetingDashboard(DEFAULT_QUERY),
  });
}

/** Key matches src/routes/management.finance.tax.tsx */
export function taxDashboardOptions() {
  return queryOptions({
    queryKey: ["tax", "dashboard", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadTaxManagementDashboard(DEFAULT_QUERY),
  });
}

/** Key matches src/routes/management.finance.assets.tsx */
export function fixedAssetsDashboardOptions() {
  return queryOptions({
    queryKey: ["fixed-assets", "dashboard", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadFixedAssetsDashboard(DEFAULT_QUERY),
  });
}

/** Key matches src/routes/management.finance.audit.tsx */
export function auditDashboardOptions() {
  return queryOptions({
    queryKey: ["audit", "dashboard", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadAuditTrailDashboard(DEFAULT_QUERY),
  });
}

/** Key matches src/routes/management.finance.cost-centers.tsx */
export function costCentersDashboardOptions() {
  return queryOptions({
    queryKey: ["costCenters", "dashboard", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadCostCentersDashboard(DEFAULT_QUERY),
  });
}

/** Key matches src/routes/management.finance.consolidation.tsx */
export function consolidationDashboardOptions() {
  return queryOptions({
    queryKey: ["consolidation", "dashboard", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadConsolidationDashboard(DEFAULT_QUERY),
  });
}

/** Key matches src/routes/management.finance.profitability.tsx */
export function profitabilityDashboardOptions() {
  return queryOptions({
    queryKey: ["profitability", "dashboard", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadProfitabilityDashboard(DEFAULT_QUERY),
  });
}

/** Key matches src/routes/management.finance.reports.tsx */
export function reportingDashboardOptions() {
  return queryOptions({
    queryKey: ["reporting", "dashboard", DEFAULT_QUERY.fiscalYear] as const,
    queryFn: () => loadFinancialReportingDashboard(DEFAULT_QUERY),
  });
}

/* ---------------------------------------------------------------------------
   Research & Innovation module data sources — one list-fetch per module, key
   matches the module's index route's own useQuery so cache is shared.
   --------------------------------------------------------------------------- */
import {
  continuousInnovationService,
  opportunityDiscoveryService,
  designThinkingService,
  problemValidationService,
  innovationPortfolioService,
  technologyScoutingService,
  researchManagementService,
  feasibilityStudyService,
  pocService,
  prototypeDevService,
  experimentMgmtService,
  trlAssessmentService,
  commercializationService,
  patentMgmtService,
  ideaManagementService,
} from "@/services";

export function riIdeasOptions() {
  return queryOptions({ queryKey: ["idea-management", "dashboard"] as const, queryFn: () => ideaManagementService.fetchDashboard() });
}
export function riOpportunitiesOptions() {
  return queryOptions({ queryKey: ["opportunity-discovery", "list"] as const, queryFn: () => opportunityDiscoveryService.fetchOpportunities() });
}
export function riDesignOptions() {
  return queryOptions({ queryKey: ["design-thinking", "list"] as const, queryFn: () => designThinkingService.fetchList() });
}
export function riValidationOptions() {
  return queryOptions({ queryKey: ["problem-validation", "list"] as const, queryFn: () => problemValidationService.fetchList() });
}
export function riPortfolioOptions() {
  return queryOptions({ queryKey: ["innovation-portfolio", "list"] as const, queryFn: () => innovationPortfolioService.fetchList() });
}
export function riScoutingOptions() {
  return queryOptions({ queryKey: ["technology-scouting", "list"] as const, queryFn: () => technologyScoutingService.fetchList() });
}
export function riResearchOptions() {
  return queryOptions({ queryKey: ["research-management", "list"] as const, queryFn: () => researchManagementService.fetchList() });
}
export function riFeasibilityOptions() {
  return queryOptions({ queryKey: ["feasibility-study", "list"] as const, queryFn: () => feasibilityStudyService.fetchList() });
}
export function riPocOptions() {
  return queryOptions({ queryKey: ["proof-of-concept", "list"] as const, queryFn: () => pocService.fetchList() });
}
export function riPrototypeOptions() {
  return queryOptions({ queryKey: ["prototype-development", "list"] as const, queryFn: () => prototypeDevService.fetchList() });
}
export function riExperimentsOptions() {
  return queryOptions({ queryKey: ["experiment-management", "list"] as const, queryFn: () => experimentMgmtService.fetchList() });
}
export function riTrlOptions() {
  return queryOptions({ queryKey: ["trl-assessment", "list"] as const, queryFn: () => trlAssessmentService.fetchList() });
}
export function riCommercializationOptions() {
  return queryOptions({ queryKey: ["commercialization-planning", "list"] as const, queryFn: () => commercializationService.fetchList() });
}
export function riInnovationOptions() {
  return queryOptions({ queryKey: ["continuous-innovation", "list"] as const, queryFn: () => continuousInnovationService.fetchList() });
}
export function riPatentsOptions() {
  return queryOptions({ queryKey: ["patent-management", "list"] as const, queryFn: () => patentMgmtService.fetchList() });
}
