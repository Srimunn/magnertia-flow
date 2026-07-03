// Financial Management Service — shared payload types

export type DashboardQuery = {
  fiscalYear: string;
  companyId: string;
};

export type CashPosition = {
  cashBalance: number;
};

export type CurrentRatio = {
  currentRatio: number;
  currentRatioPY: number;
};

export type TrendPoint = {
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
};

export type CashFlowLine = {
  label: string;
  value: number;
};

export type CashFlowSummary = {
  lines: CashFlowLine[];
  netCashFlow: number;
};

export type ExpenseSlice = {
  name: string;
  value: number;
  color: string;
};

export type AgingBucket = {
  bucket: string;
  amount: number;
  pct: number;
  color: string;
};

export type AgingReport = {
  total: number;
  buckets: AgingBucket[];
};

export type Transaction = {
  date: string;
  ref: string;
  description: string;
  amount: number;
};

export type InsightMetric = {
  label: string;
  value: string;
  deltaLabel: string;
  direction: "up" | "down";
  tone: "positive" | "negative";
};

export type FinancialInsights = {
  grossMargin: InsightMetric;
  operatingMargin: InsightMetric;
  expenseRatio: InsightMetric;
  dso: InsightMetric;
  dpo: InsightMetric;
  cashConversionCycle: InsightMetric;
};

export type DashboardData = {
  totalRevenue: number;
  totalExpenses: number;
  cashPosition: CashPosition;
  netProfit: number;
  currentRatio: CurrentRatio;
  revenueExpenseTrend: TrendPoint[];
  cashFlowSummary: CashFlowSummary;
  expenseDistribution: ExpenseSlice[];
  receivableAging: AgingReport;
  payableAging: AgingReport;
  recentTransactions: Transaction[];
  financialInsights: FinancialInsights;
};

// ---------------------------------------------------------------------------
// Transactions module
// ---------------------------------------------------------------------------

export type TransactionType = "Invoice" | "Payment" | "Journal Entry" | "Bill" | "Receipt";
export type TransactionStatus = "Posted" | "Approved" | "Pending";

// The canonical transaction record shape — mock-data.ts supplies rows shaped
// like this ("Database"); services never widen or reshape it.
export type TransactionRecord = {
  ref: string;
  date: string;
  description: string;
  type: TransactionType;
  account: string;
  amount: number;
  status: TransactionStatus;
  /** Customer (Invoice/Receipt) or vendor (Payment/Bill) name; absent for Journal Entry. */
  counterparty?: string;
  /** Absent for Journal Entry, which has no payment due date. */
  dueDate?: string;
};

export type TransactionKpiPeriod = {
  count: number;
  amount: number;
};

export type TransactionsKpis = {
  totalTransactions: number;
  totalAmount: number;
  transactionsToday: TransactionKpiPeriod;
  thisMonth: TransactionKpiPeriod;
  pendingApproval: TransactionKpiPeriod;
};

export type TransactionFilters = {
  search: string;
  type: TransactionType | "All Types";
  status: TransactionStatus | "All Statuses";
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
};

export type TransactionSearchResult = {
  rows: TransactionRecord[];
  total: number;
};

type TransactionDetailBase = {
  ref: string;
  type: TransactionType;
  date: string;
  description: string;
  account: string;
  amount: number;
  status: TransactionStatus;
};

export type InvoiceDetail = TransactionDetailBase & {
  source: "invoice";
  customer: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  taxRate: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
};

export type PaymentDetail = TransactionDetailBase & {
  source: "payment";
  vendor: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  taxRate: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
};

export type JournalDetail = TransactionDetailBase & {
  source: "journal";
  memo: string;
  debit: number;
  credit: number;
};

export type TransactionDetail = InvoiceDetail | PaymentDetail | JournalDetail;

export type TransactionUpdate = Partial<
  Pick<TransactionRecord, "description" | "status" | "dueDate">
>;

// ---------------------------------------------------------------------------
// General Ledger module
// ---------------------------------------------------------------------------

export type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
export type AccountStatus = "Active" | "Inactive";

// Canonical Chart of Accounts node shape — mock-data.ts supplies the tree
// ("Database"); services never reshape it. Net balance (debit - credit) is
// derived at render time, never stored, so it can never drift from its inputs.
export type AccountNode = {
  code: string;
  name: string;
  type: AccountType;
  group: string;
  normalBalance: "Debit" | "Credit";
  debit: number;
  credit: number;
  status: AccountStatus;
  openingBalance?: number;
  children?: AccountNode[];
};

export type LedgerKpis = {
  totalAccounts: number;
  totalDebits: number;
  totalCredits: number;
  netIncome: number;
  currentPeriod: string;
  periodStatus: "Open" | "Closed";
};

export type AccountFilters = {
  search: string;
  type: AccountType | "All Types";
  status: AccountStatus | "All Statuses";
  level: "All Levels" | "1" | "2" | "3";
};

export type AccountSummary = {
  code: string;
  name: string;
  status: AccountStatus;
  accountType: string;
  accountGroup: string;
  normalBalance: "Debit" | "Credit";
  currency: string;
  openingBalance: number;
  periodDebit: number;
  periodCredit: number;
  endingBalance: number;
};

export type AccountBalanceTrendPoint = {
  month: string;
  debit: number;
  credit: number;
  netBalance: number;
};

export type AccountDistributionSlice = {
  name: string;
  value: number;
  color: string;
};

export type LedgerJournalEntry = {
  date: string;
  ref: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

export type TrialBalanceRow = {
  code: string;
  name: string;
  debit: number;
  credit: number;
};

export type TrialBalanceReport = {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
};

// ---------------------------------------------------------------------------
// Accounts Payable module
// ---------------------------------------------------------------------------

export type InvoiceStatus = "Paid" | "Due Soon" | "Overdue" | "Canceled";

// Canonical payable invoice shape — mock-data.ts supplies rows shaped like
// this ("Database"); services never reshape it.
export type PayableInvoice = {
  invoiceNo: string;
  vendor: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  dueAmount: number;
  approved: boolean;
};

export type AccountsPayableKpis = {
  totalPayables: number;
  overdueAmount: number;
  overduePctOfTotal: number;
  dueWithin30Days: number;
  dueWithin30PctOfTotal: number;
  paidThisMonth: number;
  openInvoices: number;
};

export type InvoiceFilters = {
  search: string;
  status: InvoiceStatus | "All";
  page: number;
  pageSize: number;
};

export type InvoiceSearchResult = {
  rows: PayableInvoice[];
  total: number;
};

export type VendorProfile = {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  paymentTerms: string;
  outstandingBalance: number;
  status: "Active" | "Inactive";
};

export type TopVendor = {
  vendor: string;
  amount: number;
};

export type PaymentSummary = {
  totalPaid: number;
  averagePayment: number;
  totalPayments: number;
  discountsTaken: number;
};

export type NewInvoiceInput = {
  vendor: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
};

export type RecordPaymentInput = {
  invoiceNo: string;
  amount: number;
  paymentDate: string;
  method: string;
};

// ---------------------------------------------------------------------------
// Accounts Receivable module
// ---------------------------------------------------------------------------

// Broader than Accounts Payable's InvoiceStatus — AR has "Partially Paid"
// (part-settled invoices) and "Credit Memo" (its own record, filtered via
// the same status-driven tab bar as everything else). Deliberately its own
// type rather than widening AP's InvoiceStatus, since "Credit Memo" makes no
// sense as a payable status.
export type ReceivableInvoiceStatus =
  "Paid" | "Partially Paid" | "Due Soon" | "Overdue" | "Canceled" | "Credit Memo";

// Canonical receivable invoice shape — mock-data.ts supplies rows shaped
// like this ("Database"); services never reshape it.
export type ReceivableInvoice = {
  invoiceNo: string;
  customer: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: ReceivableInvoiceStatus;
  dueAmount: number;
};

export type AccountsReceivableKpis = {
  totalReceivables: number;
  overdueAmount: number;
  overduePctOfTotal: number;
  dueWithin30Days: number;
  dueWithin30PctOfTotal: number;
  collectedThisMonth: number;
  openInvoices: number;
};

export type ReceivableInvoiceFilters = {
  search: string;
  status: ReceivableInvoiceStatus | "All";
  page: number;
  pageSize: number;
};

export type ReceivableInvoiceSearchResult = {
  rows: ReceivableInvoice[];
  total: number;
};

export type CustomerProfile = {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  paymentTerms: string;
  outstandingBalance: number;
  status: "Active" | "Inactive";
};

export type TopCustomer = {
  customer: string;
  amount: number;
};

export type CollectionSummary = {
  billedAmount: number;
  collectedAmount: number;
  collectionPct: number;
  avgDaysToCollect: number;
};

export type ReceivableTrendPoint = {
  month: string;
  totalReceivables: number;
  collectedAmount: number;
};

export type NewReceivableInvoiceInput = {
  customer: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
};

export type ReceivePaymentInput = {
  invoiceNo: string;
  amount: number;
  paymentDate: string;
  method: string;
};

export type CreateCreditMemoInput = {
  customer: string;
  amount: number;
  reason: string;
};

// ---------------------------------------------------------------------------
// Cash & Bank module
// ---------------------------------------------------------------------------

export type BankAccountType = "Operating" | "Payroll" | "Collections" | "Petty Cash" | "Savings";
export type BankAccountStatus = "Active" | "Inactive";
export type ReconciliationStatus = "Reconciled" | "Partially Reconciled" | "Not Reconciled";

export type BankAccount = {
  id: string;
  name: string;
  bankName: string;
  type: BankAccountType;
  accountNo: string;
  currency: string;
  currentBalance: number;
  status: BankAccountStatus;
  reconciliationStatus: ReconciliationStatus;
  unreconciledAmount: number;
};

export type BankAccountFilters = {
  search: string;
  type: "All Types" | BankAccountType;
  status: "All Statuses" | BankAccountStatus;
  currency: "All Currency" | string;
};

export type CashTransactionType = "Inflow" | "Outflow";
export type CashTransactionStatus = "Posted" | "Cleared" | "Pending";

export type CashTransaction = {
  id: string;
  date: string;
  description: string;
  type: CashTransactionType;
  amount: number;
  bankAccountNo: string;
  reference: string;
  category: string;
  status: CashTransactionStatus;
};

export type CashReconciliationRecord = {
  id: string;
  accountNo: string;
  statementDate: string;
  statementBalance: number;
  ledgerBalance: number;
  unreconciledAmount: number;
  status: ReconciliationStatus;
  lastReconciledAt?: string;
};

export type ChequeStatus = "Cleared" | "Pending" | "Void";

export type ChequeRecord = {
  id: string;
  chequeNo: string;
  issueDate: string;
  payee: string;
  amount: number;
  bankAccountNo: string;
  status: ChequeStatus;
};

export type DepositStatus = "Cleared" | "Pending" | "Rejected";

export type DepositRecord = {
  id: string;
  depositNo: string;
  depositDate: string;
  source: string;
  amount: number;
  bankAccountNo: string;
  status: DepositStatus;
};

export type CashBankKpiDetail = {
  value: number;
  deltaPct: number;
  direction: "up" | "down";
  label: string;
};

export type CashBankKpis = {
  totalCashBalance: CashBankKpiDetail;
  operatingCash: CashBankKpiDetail;
  cashInflowMtd: CashBankKpiDetail;
  cashOutflowMtd: CashBankKpiDetail;
  netCashFlowMtd: CashBankKpiDetail;
};

export type CashPositionTrendPoint = {
  month: string;
  inflow: number;
  outflow: number;
  netFlow: number;
};

export type BankReconciliationSummary = {
  reconciledCount: number;
  partiallyReconciledCount: number;
  notReconciledCount: number;
  totalAccounts: number;
};

export type AccountSummaryStats = {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  totalBalanceUsd: number;
  totalBalanceBaseCurrency: number;
  unreconciledAmount: number;
};

export type CashBankDashboardData = {
  kpis: CashBankKpis;
  bankAccounts: BankAccount[];
  accountSummary: AccountSummaryStats;
  cashPositionTrend: CashPositionTrendPoint[];
  reconciliationSummary: BankReconciliationSummary;
};

export type NewBankAccountInput = {
  name: string;
  bankName: string;
  type: BankAccountType;
  accountNo: string;
  currency: string;
  initialBalance: number;
};

export type NewCashTransactionInput = {
  date: string;
  description: string;
  type: CashTransactionType;
  amount: number;
  bankAccountNo: string;
  category: string;
  reference: string;
};

// ---------------------------------------------------------------------------
// Fixed Assets module
// ---------------------------------------------------------------------------

export type FixedAssetCategory =
  "Building" | "Machinery" | "IT Equipment" | "Vehicles" | "Furniture" | "Others";

export type FixedAssetStatus = "Active" | "Maintenance" | "Fully Depreciated" | "Disposed";

export type FixedAsset = {
  id: string;
  assetCode: string;
  name: string;
  category: FixedAssetCategory;
  location: string;
  purchaseDate: string;
  cost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  status: FixedAssetStatus;
};

export type FixedAssetFilters = {
  search: string;
  category: "All Categories" | FixedAssetCategory;
  status: "All Statuses" | FixedAssetStatus;
  location: "All Locations" | string;
};

export type DepreciationRun = {
  id: string;
  date: string;
  period: string;
  assetsCount: number;
  totalDepreciation: number;
  method: string;
  status: "Posted" | "Draft";
  executedBy: string;
};

export type AssetCategoryCount = {
  name: string;
  count: number;
  percentage: number;
  cost: number;
  color: string;
};

export type FixedAssetKpis = {
  totalAssets: number;
  grossBookValue: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  assetsAddedThisYear: number;
};

export type FixedAssetSummaryStats = {
  fullyDepreciatedCount: number;
  fullyDepreciatedPct: number;
  maintenanceCount: number;
  maintenancePct: number;
  inUseCount: number;
  inUsePct: number;
  disposedCount: number;
  disposedNetBookValue: number;
};

export type FixedAssetDashboardData = {
  kpis: FixedAssetKpis;
  assets: FixedAsset[];
  categoryDistribution: AssetCategoryCount[];
  depreciationTrend: { month: string; depreciation: number }[];
  topAssets: { name: string; netBookValue: number }[];
  summaryStats: FixedAssetSummaryStats;
};

export type NewFixedAssetInput = {
  name: string;
  category: FixedAssetCategory;
  location: string;
  purchaseDate: string;
  cost: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: string;
};

export type AssetDisposalInput = {
  assetCode: string;
  disposalDate: string;
  saleProceeds: number;
  disposalReason: string;
};

export type AssetTransferInput = {
  assetCode: string;
  transferDate: string;
  destinationLocation: string;
  authorizedBy: string;
};

export type AssetRevaluationInput = {
  assetCode: string;
  revaluationDate: string;
  newMarketValue: number;
  reason: string;
};

export type AssetCategoryRecord = {
  id: string;
  name: string;
  description: string;
  depMethod: string;
  usefulLife: number;
  assetAccount: string;
  depAccount: string;
};

export type AssetDisposalRecord = {
  id: string;
  assetCode: string;
  name: string;
  disposalDate: string;
  cost: number;
  accumulatedDepreciation: number;
  proceeds: number;
  gainLoss: number;
  status: string;
};

export type AssetRevaluationRecord = {
  id: string;
  assetCode: string;
  name: string;
  date: string;
  oldNBV: number;
  newNBV: number;
  adjustment: number;
  reason: string;
};

export type AssetTransferRecord = {
  id: string;
  assetCode: string;
  name: string;
  date: string;
  sourceLocation: string;
  destinationLocation: string;
  authorizedBy: string;
};

// ---------------------------------------------------------------------------
// Budgeting module
// ---------------------------------------------------------------------------

export type DepartmentBudget = {
  id: string;
  department: string;
  budget: number;
  actual: number;
  variance: number;
  variancePct: number;
  utilization: number;
};

export type CostCenterBudget = {
  id: string;
  costCenter: string;
  code: string;
  budget: number;
  actual: number;
  variance: number;
  variancePct: number;
  utilization: number;
};

export type ProjectBudget = {
  id: string;
  project: string;
  manager: string;
  budget: number;
  actual: number;
  variance: number;
  utilization: number;
  status: "On Track" | "At Risk" | "Over Budget";
};

export type BudgetVersion = {
  id: string;
  name: string;
  type: "Original" | "Revision" | "Forecast";
  status: "Active" | "Draft" | "Archived";
  totalBudget: number;
  createdBy: string;
  lastUpdated: string;
};

export type BudgetKpis = {
  totalBudget: number;
  totalActual: number;
  budgetUtilization: number;
  variance: number;
  activeBudgetsCount: number;
};

export type BudgetHealthSummary = {
  onTrackCount: number;
  onTrackPct: number;
  atRiskCount: number;
  atRiskPct: number;
  overBudgetCount: number;
  overBudgetPct: number;
};

export type BudgetDashboardData = {
  kpis: BudgetKpis;
  departments: DepartmentBudget[];
  costCenters: CostCenterBudget[];
  projects: ProjectBudget[];
  versions: BudgetVersion[];
  trend: { month: string; budget: number; actual: number; forecast: number }[];
  varianceByDept: { name: string; variance: number }[];
  health: BudgetHealthSummary;
};

export type NewBudgetInput = {
  name: string;
  totalBudget: number;
  type: BudgetVersion["type"];
  status: BudgetVersion["status"];
  createdBy: string;
};

export type NewBudgetVersionInput = {
  parentVersionId: string;
  name: string;
  type: BudgetVersion["type"];
  totalBudget: number;
  createdBy: string;
};

export type BudgetComparisonReport = {
  version1: BudgetVersion;
  version2: BudgetVersion;
  totalDifference: number;
  differencePct: number;
  departmentDifferences: {
    department: string;
    v1Amount: number;
    v2Amount: number;
    difference: number;
  }[];
};

// ---------------------------------------------------------------------------
// Financial Reporting module
// ---------------------------------------------------------------------------

export type ReportCategory =
  | "Financial Statements"
  | "Management Reports"
  | "Cash Flow Reports"
  | "Budget Reports"
  | "Tax Reports"
  | "Custom Reports";

export type ReportRecord = {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  type: "Standard" | "Custom";
  lastModified: string;
  lastModifiedBy: string;
  isFavorite: boolean;
};

export type ReportFilters = {
  search: string;
  category: "All Reports" | ReportCategory;
  type: "All" | "Standard" | "Custom";
  dateRange: string;
  fromDate: string;
  toDate: string;
  companyId: string;
};

export type ReportScheduleRecord = {
  id: string;
  reportId: string;
  reportName: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  format: "PDF" | "XLSX" | "CSV";
  recipients: string;
  status: "Active" | "Paused";
  nextRun: string;
};

export type ReportShareRecord = {
  id: string;
  reportId: string;
  reportName: string;
  sharedWith: string;
  dateShared: string;
  accessLevel: "View" | "Edit";
};

export type RecentReportActivity = {
  id: string;
  reportName: string;
  activity: string;
  performedBy: string;
  timestamp: string;
};

export type FinancialPerformancePoint = {
  month: string;
  revenue: number;
  grossProfit: number;
  netIncome: number;
};

export type ReportCategoryCount = {
  name: string;
  count: number;
  percentage: number;
  color: string;
};

export type FinancialReportingKpis = {
  totalRevenue: number;
  totalRevenueDelta: number;
  grossProfit: number;
  grossProfitDelta: number;
  netIncome: number;
  netIncomeDelta: number;
  totalAssets: number;
  totalAssetsDelta: number;
  totalLiabilities: number;
  totalLiabilitiesDelta: number;
};

export type FinancialReportingDashboardData = {
  kpis: FinancialReportingKpis;
  reports: ReportRecord[];
  trend: FinancialPerformancePoint[];
  categoryDistribution: ReportCategoryCount[];
  activities: RecentReportActivity[];
  scheduled: ReportScheduleRecord[];
  shared: ReportShareRecord[];
};

export type NewReportInput = {
  name: string;
  description: string;
  category: ReportCategory;
  type: "Standard" | "Custom";
  templateId?: string;
};

export type NewReportScheduleInput = {
  reportId: string;
  frequency: ReportScheduleRecord["frequency"];
  format: ReportScheduleRecord["format"];
  recipients: string;
};

export type NewReportShareInput = {
  reportId: string;
  sharedWith: string;
  accessLevel: ReportShareRecord["accessLevel"];
  message?: string;
};

// ---------------------------------------------------------------------------
// Tax Management module
// ---------------------------------------------------------------------------

export type TaxObligation = {
  id: string;
  taxType: string;
  jurisdiction: string;
  period: string;
  dueDate: string;
  taxLiability: number;
  paid: number;
  payable: number;
  status: "Paid" | "Partially Paid" | "Due Soon" | "Pending";
};

export type TaxFiling = {
  id: string;
  taxType: string;
  period: string;
  filingDate: string;
  filedBy: string;
  returnAmount: number;
  acknowledgementNo: string;
  status: "Filed" | "Draft" | "Rejected";
};

export type TaxPayment = {
  id: string;
  taxType: string;
  period: string;
  paymentDate: string;
  bankAccount: string;
  amount: number;
  transactionRef: string;
  status: "Cleared" | "Processing";
};

export type TaxAuthority = {
  id: string;
  name: string;
  jurisdiction: string;
  taxType: string;
  portalUrl: string;
  contactPerson: string;
  email: string;
};

export type TaxReconciliation = {
  id: string;
  taxType: string;
  period: string;
  returnsLiability: number;
  booksLiability: number;
  difference: number;
  status: "Reconciled" | "Mismatched";
};

export type TaxFilters = {
  search: string;
  taxType: string;
  status: string;
  dueDate: string;
};

export type ComplianceSummary = {
  rate: number;
  onTrackCount: number;
  dueSoonCount: number;
  overdueCount: number;
};

export type TaxKpis = {
  totalTaxLiability: number;
  totalTaxLiabilityDelta: number;
  totalTaxPaid: number;
  totalTaxPaidDelta: number;
  taxPayable: number;
  upcomingFilings: number;
  complianceStatus: number;
};

export type TaxDashboardData = {
  kpis: TaxKpis;
  obligations: TaxObligation[];
  trend: { month: string; liability: number; paid: number }[];
  typeDistribution: { name: string; value: number; percentage: number; color: string }[];
  upcomingFilingsList: { name: string; period: string; dueDate: string; daysLeft: number }[];
  compliance: ComplianceSummary;
  filings: TaxFiling[];
  payments: TaxPayment[];
  authorities: TaxAuthority[];
  reconciliations: TaxReconciliation[];
};

export type NewFilingInput = {
  taxType: string;
  period: string;
  returnAmount: number;
  filedBy: string;
};

export type NewTaxPaymentInput = {
  taxType: string;
  period: string;
  bankAccount: string;
  amount: number;
  transactionRef: string;
};

// ---------------------------------------------------------------------------
// Cost Center module
// ---------------------------------------------------------------------------

export type CostCenterRecord = {
  id: string;
  code: string;
  name: string;
  department: string;
  manager: string;
  budget: number;
  actual: number;
  variance: number;
  utilization: number;
  status: "Active" | "Inactive";
  type: "Operational" | "Support" | "Administrative" | "Revenue-Generating";
  parentId?: string;
};

export type NewCostCenterInput = {
  code: string;
  name: string;
  department: string;
  manager: string;
  budget: number;
  type: "Operational" | "Support" | "Administrative" | "Revenue-Generating";
  parentId?: string;
};

export type NewSubCostCenterInput = {
  parentId: string;
  code: string;
  name: string;
  department: string;
  manager: string;
  budget: number;
};

export type CostCenterVarianceRecord = {
  costCenter: string;
  variance: number;
  percentage: number;
};

export type CostCenterKpis = {
  totalCostCenters: number;
  totalBudget: number;
  totalActual: number;
  variance: number;
  variancePercentage: number;
  budgetUtilization: number;
};

export type CostCenterHierarchyNode = {
  name: string;
  children?: CostCenterHierarchyNode[];
};

export type CostCenterDashboardData = {
  kpis: CostCenterKpis;
  costCenters: CostCenterRecord[];
  trend: { month: string; budget: number; actual: number; forecast: number }[];
  departmentSplits: { name: string; value: number; percentage: number; color: string }[];
  topVariances: CostCenterVarianceRecord[];
  hierarchy: CostCenterHierarchyNode;
  summary: {
    totalBudget: number;
    totalActual: number;
    totalCommitments: number;
    totalForecast: number;
    budgetUtilization: number;
  };
};

// ---------------------------------------------------------------------------
// Profitability Analysis module
// ---------------------------------------------------------------------------

export type ProfitabilityRecord = {
  code: string;
  name: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
};

export type ProfitabilityTrendPoint = {
  month: string;
  netProfit: number;
  netMargin: number;
};

export type RegionalProfitabilityPoint = {
  region: string;
  netMargin: number;
};

export type SalesChannelProfitabilityPoint = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

export type TopPerformer = {
  rank: number;
  name: string;
  netMargin: number;
  netProfit: number;
};

export type CostAllocationRule = {
  id: string;
  costCenter: string;
  allocationKey: "Headcount" | "Square Footage" | "Direct Revenue" | "Direct Expense";
  weight: number;
};

export type ProfitabilityDashboardData = {
  kpis: {
    revenueYTD: number;
    revenueYTDDelta: number;
    grossProfitYTD: number;
    grossProfitYTDDelta: number;
    grossMarginYTD: number;
    grossMarginYTDDelta: number;
    netProfitYTD: number;
    netProfitYTDDelta: number;
    netMarginYTD: number;
    netMarginYTDDelta: number;
  };
  dimensionData: ProfitabilityRecord[];
  trend: ProfitabilityTrendPoint[];
  regional: RegionalProfitabilityPoint[];
  salesChannels: SalesChannelProfitabilityPoint[];
  topPerformers: TopPerformer[];
  summary: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    netProfit: number;
    netMargin: number;
  };
  allocationRules: CostAllocationRule[];
};

// ---------------------------------------------------------------------------
// Consolidation module
// ---------------------------------------------------------------------------

export type ConsolidationRecord = {
  code: string;
  name: string;
  revenue: number;
  expenses: number;
  operatingProfit: number;
  netProfit: number;
  netMargin: number | null;
  status: "Consolidated" | "Included" | "Eliminated" | "Pending";
  isEliminationAdjustment?: boolean;
};

export type IntercompanyTransaction = {
  fromEntity: string;
  toEntity: string;
  amount: number;
  matched: boolean;
  ref: string;
  date: string;
};

export type ConsolidationTimelineMilestone = {
  name: string;
  date: string;
  status: "Completed" | "Pending" | "Failed";
};

export type ConsolidationProgressSummary = {
  dataCollected: string;
  intercompanyMatching: string;
  eliminations: string;
  consolidation: string;
  percentage: number;
};

export type AccountMappingRecord = {
  id: string;
  sourceAccount: string;
  targetAccount: string;
  entity: string;
};

export type EntityValidationResult = {
  id: string;
  checkName: string;
  status: "Passed" | "Warning" | "Failed";
  message: string;
};

export type ConsolidationDashboardData = {
  kpis: {
    totalEntities: number;
    consolidatedRevenueYTD: number;
    consolidatedRevenueYTDDelta: number;
    consolidatedNetProfitYTD: number;
    consolidatedNetProfitYTDDelta: number;
    eliminationEntriesYTD: number;
    eliminationEntriesCount: number;
    status: string;
  };
  summaryData: ConsolidationRecord[];
  progress: ConsolidationProgressSummary;
  timeline: ConsolidationTimelineMilestone[];
  intercompanyTrend: { month: string; value: number }[];
  topIntercompany: IntercompanyTransaction[];
  profitTrend: { month: string; netProfit: number; netMargin: number }[];
  mappings: AccountMappingRecord[];
  validations: EntityValidationResult[];
};
