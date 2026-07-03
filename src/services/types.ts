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
