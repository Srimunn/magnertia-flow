// Magnertia ERP — Mock data (Financial Management)

export const company = {
  name: "Magnertia",
  tagline: "EV Manufacturing",
  currency: "$",
  fiscalYear: "FY 2024-25",
};

/* -------- Dashboard headline KPIs (match reference exactly) -------- */
export const dashKpis = {
  totalRevenue: 24_580_000,
  netProfit: 4_320_000,
  totalExpenses: 18_760_000,
  cashBalance: 6_780_000,
  currentRatio: 2.35,
  currentRatioPY: 2.18,
};

/* -------- Revenue vs Expenses Trend (Apr'24 → Mar'25) -------- */
export const revenueExpenseTrend = [
  { month: "Apr '24", revenue: 2_100_000, expenses: 1_600_000, netProfit: 500_000 },
  { month: "May '24", revenue: 2_300_000, expenses: 1_700_000, netProfit: 600_000 },
  { month: "Jun '24", revenue: 2_000_000, expenses: 1_500_000, netProfit: 500_000 },
  { month: "Jul '24", revenue: 2_200_000, expenses: 1_800_000, netProfit: 400_000 },
  { month: "Aug '24", revenue: 2_400_000, expenses: 1_900_000, netProfit: 500_000 },
  { month: "Sep '24", revenue: 2_100_000, expenses: 1_700_000, netProfit: 400_000 },
  { month: "Oct '24", revenue: 2_500_000, expenses: 1_900_000, netProfit: 600_000 },
  { month: "Nov '24", revenue: 2_600_000, expenses: 2_000_000, netProfit: 600_000 },
  { month: "Dec '24", revenue: 2_800_000, expenses: 2_100_000, netProfit: 700_000 },
  { month: "Jan '25", revenue: 3_800_000, expenses: 2_900_000, netProfit: 900_000 },
  { month: "Feb '25", revenue: 4_200_000, expenses: 3_100_000, netProfit: 1_100_000 },
  { month: "Mar '25", revenue: 4_600_000, expenses: 3_300_000, netProfit: 1_300_000 },
];

export const cashFlowSummary = [
  { label: "Cash from Operating Activities", value: 8_450_000 },
  { label: "Cash from Investing Activities", value: -2_150_000 },
  { label: "Cash from Financing Activities", value: -1_320_000 },
];
export const netCashFlow = 4_980_000;

export const expenseDistribution = [
  { name: "Cost of Goods Sold", value: 35, color: "#6B4EFF" },
  { name: "Operating Expenses", value: 25, color: "#3B82F6" },
  { name: "Employee Expenses", value: 20, color: "#22C55E" },
  { name: "Marketing & Sales", value: 10, color: "#F59E0B" },
  { name: "Other Expenses", value: 10, color: "#D1D5DB" },
];

export const agingReceivable = {
  total: 7_650_000,
  buckets: [
    { bucket: "0 - 30 Days", amount: 2_850_000, pct: 37.3, color: "#6B4EFF" },
    { bucket: "31 - 60 Days", amount: 1_900_000, pct: 24.8, color: "#3B82F6" },
    { bucket: "61 - 90 Days", amount: 1_350_000, pct: 17.6, color: "#22C55E" },
    { bucket: "91 - 120 Days", amount: 850_000, pct: 11.1, color: "#F59E0B" },
    { bucket: "120+ Days", amount: 700_000, pct: 9.2, color: "#EC4899" },
  ],
};

export const agingPayable = {
  total: 5_420_000,
  buckets: [
    { bucket: "0 - 30 Days", amount: 2_100_000, pct: 38.7, color: "#6B4EFF" },
    { bucket: "31 - 60 Days", amount: 1_500_000, pct: 27.7, color: "#3B82F6" },
    { bucket: "61 - 90 Days", amount: 1_000_000, pct: 18.5, color: "#22C55E" },
    { bucket: "91 - 120 Days", amount: 550_000, pct: 10.1, color: "#F59E0B" },
    { bucket: "120+ Days", amount: 270_000, pct: 9.0, color: "#EC4899" },
  ],
};

export const recentTxns = [
  { date: "Today", ref: "INV-10034", description: "Invoice to Acme Corp.", amount: 45_600 },
  { date: "Today", ref: "PAY-20021", description: "Payment to ABC Supplies", amount: -12_450 },
  { date: "Today", ref: "JE-30015", description: "Journal Entry", amount: 8_750 },
  { date: "Today", ref: "BILL-40011", description: "Bill from Global Services", amount: -7_850 },
  { date: "Today", ref: "RCPT-50009", description: "Payment from Beta Ltd.", amount: 22_300 },
];

/* -------- Legacy / supporting data for other routes -------- */
export const kpis = {
  totalRevenue: 24_580_000,
  todayRevenue: 184_250,
  monthlyRevenue: 3_420_000,
  pendingPayments: 1_245_600,
  expenses: 18_760_000,
  netProfit: 4_320_000,
  profitMargin: 17.6,
  outstandingReceivables: 7_650_000,
  outstandingPayables: 5_420_000,
  cashBalance: 6_780_000,
};

export const revenueTrend = revenueExpenseTrend.map((r) => ({
  month: r.month.split(" ")[0], revenue: r.revenue, expenses: r.expenses,
}));

export const revenueSources = [
  { name: "Vehicle Sales", value: 14_200_000, color: "#6B4EFF" },
  { name: "Service & Maintenance", value: 4_850_000, color: "#3B82F6" },
  { name: "Charging Network", value: 3_620_000, color: "#22C55E" },
  { name: "Accessories & Parts", value: 1_910_000, color: "#F59E0B" },
];

export const revenueByStation = [
  { station: "Bengaluru – Whitefield Hub", revenue: 4_820_000, sessions: 8420 },
  { station: "Mumbai – BKC Tower", revenue: 4_310_000, sessions: 7180 },
  { station: "Delhi – Aerocity Plaza", revenue: 3_950_000, sessions: 6720 },
  { station: "Hyderabad – HITEC City", revenue: 3_580_000, sessions: 6240 },
  { station: "Pune – Hinjewadi Park", revenue: 3_120_000, sessions: 5410 },
  { station: "Chennai – OMR Tech Park", revenue: 2_880_000, sessions: 4980 },
  { station: "Gurugram – Cyber Hub", revenue: 2_640_000, sessions: 4520 },
  { station: "Ahmedabad – SG Road", revenue: 2_210_000, sessions: 3840 },
];

export const expenseCategories = [
  { category: "Cost of Goods Sold", amount: 6_566_000, color: "#6B4EFF" },
  { category: "Operating Expenses", amount: 4_690_000, color: "#3B82F6" },
  { category: "Employee Expenses", amount: 3_752_000, color: "#22C55E" },
  { category: "Marketing & Sales", amount: 1_876_000, color: "#F59E0B" },
  { category: "Other Expenses", amount: 1_876_000, color: "#D1D5DB" },
];

export const expenses = [
  { id: "EXP-2025-0142", date: "2025-03-26", category: "Cost of Goods Sold", vendor: "Panasonic Cells", amount: 248_000, status: "Paid" as const },
  { id: "EXP-2025-0141", date: "2025-03-25", category: "Operating Expenses", vendor: "DLF Properties", amount: 84_500, status: "Pending" as const },
  { id: "EXP-2025-0140", date: "2025-03-24", category: "Marketing & Sales", vendor: "BrandMatter Studio", amount: 92_500, status: "Paid" as const },
  { id: "EXP-2025-0139", date: "2025-03-22", category: "Employee Expenses", vendor: "Payroll – March", amount: 320_000, status: "Paid" as const },
  { id: "EXP-2025-0138", date: "2025-03-20", category: "Other Expenses", vendor: "Siemens India", amount: 68_400, status: "Approved" as const },
  { id: "EXP-2025-0137", date: "2025-03-18", category: "Marketing & Sales", vendor: "Google Ads", amount: 45_000, status: "Paid" as const },
  { id: "EXP-2025-0136", date: "2025-03-15", category: "Cost of Goods Sold", vendor: "Bosch Components", amount: 184_000, status: "Paid" as const },
  { id: "EXP-2025-0135", date: "2025-03-12", category: "Other Expenses", vendor: "Office Supplies Co.", amount: 24_800, status: "Pending" as const },
];

export const receivables = [
  { invoice: "INV-9821", customer: "Acme Corp.", amount: 482_500, due: "2025-04-04", status: "Overdue" as const, days: 6 },
  { invoice: "INV-9820", customer: "Beta Ltd.", amount: 318_900, due: "2025-04-10", status: "Pending" as const, days: 0 },
  { invoice: "INV-9819", customer: "Gamma Industries", amount: 624_000, due: "2025-04-12", status: "Pending" as const, days: 0 },
  { invoice: "INV-9818", customer: "Delta Mobility", amount: 184_200, due: "2025-03-28", status: "Overdue" as const, days: 12 },
  { invoice: "INV-9817", customer: "Epsilon Fleet", amount: 920_000, due: "2025-04-18", status: "Pending" as const, days: 0 },
  { invoice: "INV-9816", customer: "Zeta Logistics", amount: 285_600, due: "2025-03-30", status: "Paid" as const, days: 0 },
];

export const payables = [
  { invoice: "BILL-40011", vendor: "Global Services", amount: 7_850, due: "2025-04-05", status: "Pending" as const },
  { invoice: "BILL-40010", vendor: "ABC Supplies", amount: 12_450, due: "2025-04-08", status: "Pending" as const },
  { invoice: "BILL-40009", vendor: "Siemens India", amount: 68_400, due: "2025-04-15", status: "Approved" as const },
  { invoice: "BILL-40008", vendor: "ABB Power Grids", amount: 412_000, due: "2025-03-30", status: "Paid" as const },
  { invoice: "BILL-40007", vendor: "Delta Electronics", amount: 295_000, due: "2025-04-12", status: "Pending" as const },
  { invoice: "BILL-40006", vendor: "Schneider Electric", amount: 178_000, due: "2025-03-28", status: "Paid" as const },
];

export const ledger = [
  { date: "2025-03-26", ref: "JV-1042", desc: "Revenue – Vehicle delivery batch #341", debit: 0, credit: 184_250, balance: 6_780_000 },
  { date: "2025-03-26", ref: "JV-1041", desc: "COGS – Battery cell procurement", debit: 248_000, credit: 0, balance: 6_595_750 },
  { date: "2025-03-25", ref: "JV-1040", desc: "Revenue – Service contract", debit: 0, credit: 624_000, balance: 6_843_750 },
  { date: "2025-03-25", ref: "JV-1039", desc: "Operating – Facility lease", debit: 84_500, credit: 0, balance: 6_219_750 },
  { date: "2025-03-24", ref: "JV-1038", desc: "Revenue – Charging network", debit: 0, credit: 920_000, balance: 6_304_250 },
  { date: "2025-03-24", ref: "JV-1037", desc: "Marketing – Campaign Q1", debit: 92_500, credit: 0, balance: 5_384_250 },
  { date: "2025-03-22", ref: "JV-1036", desc: "Payroll – March", debit: 320_000, credit: 0, balance: 5_476_750 },
  { date: "2025-03-22", ref: "JV-1035", desc: "Other – Misc settlement", debit: 0, credit: 142_000, balance: 5_796_750 },
];

export const assets = [
  { id: "AST-1042", name: "Stamping Press – Plant 1", type: "Machinery", station: "Bengaluru Plant", cost: 4_820_000, depreciated: 482_000, status: "Operational" as const },
  { id: "AST-1041", name: "Battery Assembly Line A", type: "Machinery", station: "Bengaluru Plant", cost: 3_920_000, depreciated: 392_000, status: "Operational" as const },
  { id: "AST-1040", name: "Paint Booth – Line 2", type: "Machinery", station: "Pune Plant", cost: 480_000, depreciated: 96_000, status: "Maintenance" as const },
  { id: "AST-1039", name: "Test Track Equipment", type: "Equipment", station: "R&D Center", cost: 2_680_000, depreciated: 268_000, status: "Operational" as const },
  { id: "AST-1038", name: "Robotic Welding Arm #4", type: "Machinery", station: "Bengaluru Plant", cost: 1_840_000, depreciated: 184_000, status: "Operational" as const },
  { id: "AST-1037", name: "Office Fitout – HQ", type: "Office Asset", station: "HQ", cost: 1_240_000, depreciated: 248_000, status: "Operational" as const },
];

export const vendors = [
  { id: "VND-001", name: "Panasonic Cells", category: "Batteries", outstanding: 1_248_000, status: "Active" as const, rating: 4.6 },
  { id: "VND-002", name: "Bosch Components", category: "Electronics", outstanding: 184_500, status: "Active" as const, rating: 4.4 },
  { id: "VND-003", name: "Siemens India", category: "Equipment", outstanding: 68_400, status: "Active" as const, rating: 4.8 },
  { id: "VND-004", name: "ABB Power Grids", category: "Equipment", outstanding: 0, status: "Active" as const, rating: 4.9 },
  { id: "VND-005", name: "Delta Electronics", category: "Electronics", outstanding: 295_000, status: "Active" as const, rating: 4.5 },
  { id: "VND-006", name: "DLF Properties", category: "Facilities", outstanding: 0, status: "Active" as const, rating: 4.2 },
];

export const stations = [
  { id: "STN-01", name: "Whitefield Hub", city: "Bengaluru", chargers: 12, uptime: 99.4, todayRevenue: 38_420, status: "Online" as const },
  { id: "STN-02", name: "BKC Tower", city: "Mumbai", chargers: 10, uptime: 98.8, todayRevenue: 31_240, status: "Online" as const },
  { id: "STN-03", name: "Aerocity Plaza", city: "Delhi", chargers: 8, uptime: 97.2, todayRevenue: 24_180, status: "Online" as const },
  { id: "STN-04", name: "HITEC City", city: "Hyderabad", chargers: 10, uptime: 99.1, todayRevenue: 28_640, status: "Online" as const },
  { id: "STN-05", name: "Hinjewadi Park", city: "Pune", chargers: 6, uptime: 95.8, todayRevenue: 18_420, status: "Degraded" as const },
  { id: "STN-06", name: "OMR Tech Park", city: "Chennai", chargers: 8, uptime: 99.0, todayRevenue: 21_580, status: "Online" as const },
  { id: "STN-07", name: "Cyber Hub", city: "Gurugram", chargers: 6, uptime: 0, todayRevenue: 0, status: "Offline" as const },
];

export const users = [
  { id: "USR-001", name: "Aarav Mehta", email: "aarav@magnertia.com", role: "Super Admin", lastActive: "2 min ago", status: "Active" as const },
  { id: "USR-002", name: "Priya Sharma", email: "priya@magnertia.com", role: "Finance Manager", lastActive: "1 hr ago", status: "Active" as const },
  { id: "USR-003", name: "Rohan Iyer", email: "rohan@magnertia.com", role: "Operations Manager", lastActive: "3 hr ago", status: "Active" as const },
  { id: "USR-004", name: "Neha Kapoor", email: "neha@magnertia.com", role: "Accountant", lastActive: "Yesterday", status: "Active" as const },
  { id: "USR-005", name: "Vikram Singh", email: "vikram@magnertia.com", role: "Auditor", lastActive: "2 days ago", status: "Inactive" as const },
  { id: "USR-006", name: "Ananya Rao", email: "ananya@magnertia.com", role: "Viewer", lastActive: "5 days ago", status: "Active" as const },
];

export function formatCurrency(n: number, compact = false) {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  if (compact) {
    if (v >= 1_000_000) return `${sign}$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `${sign}$${(v / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatSignedCurrency(n: number, compact = false) {
  if (n < 0) {
    const inner = formatCurrency(Math.abs(n), compact).replace("-", "");
    return `(${inner})`;
  }
  return formatCurrency(n, compact);
}
