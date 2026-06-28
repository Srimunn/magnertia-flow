// Magnertia ERP - Mock data (Phase 1: Financial Management)

export const company = {
  name: "Magnertia",
  tagline: "EV Charging Infrastructure",
  currency: "₹",
  fiscalYear: "FY 2025-26",
};

export const kpis = {
  totalRevenue: 48275000,
  todayRevenue: 184250,
  monthlyRevenue: 6420000,
  pendingPayments: 1245600,
  expenses: 28940000,
  netProfit: 19335000,
  profitMargin: 40.05,
  outstandingReceivables: 3210000,
  outstandingPayables: 1875000,
  cashBalance: 12480000,
};

export const revenueTrend = [
  { month: "Jan", revenue: 3850000, expenses: 2210000 },
  { month: "Feb", revenue: 4120000, expenses: 2380000 },
  { month: "Mar", revenue: 4480000, expenses: 2540000 },
  { month: "Apr", revenue: 4720000, expenses: 2680000 },
  { month: "May", revenue: 5180000, expenses: 2820000 },
  { month: "Jun", revenue: 5620000, expenses: 3010000 },
  { month: "Jul", revenue: 5980000, expenses: 3180000 },
  { month: "Aug", revenue: 6240000, expenses: 3340000 },
  { month: "Sep", revenue: 6420000, expenses: 3480000 },
];

export const revenueSources = [
  { name: "Charging Revenue", value: 32400000, color: "var(--chart-1)" },
  { name: "Subscription Revenue", value: 8650000, color: "var(--chart-2)" },
  { name: "Partner Revenue", value: 4720000, color: "var(--chart-3)" },
  { name: "Commission Revenue", value: 2505000, color: "var(--chart-4)" },
];

export const revenueByStation = [
  { station: "Bengaluru – Whitefield Hub", revenue: 4820000, sessions: 8420 },
  { station: "Mumbai – BKC Tower", revenue: 4310000, sessions: 7180 },
  { station: "Delhi – Aerocity Plaza", revenue: 3950000, sessions: 6720 },
  { station: "Hyderabad – HITEC City", revenue: 3580000, sessions: 6240 },
  { station: "Pune – Hinjewadi Park", revenue: 3120000, sessions: 5410 },
  { station: "Chennai – OMR Tech Park", revenue: 2880000, sessions: 4980 },
  { station: "Gurugram – Cyber Hub", revenue: 2640000, sessions: 4520 },
  { station: "Ahmedabad – SG Road", revenue: 2210000, sessions: 3840 },
];

export const expenseCategories = [
  { category: "Electricity", amount: 12480000, color: "var(--chart-1)" },
  { category: "Maintenance", amount: 4820000, color: "var(--chart-2)" },
  { category: "Employee Salaries", amount: 5210000, color: "var(--chart-3)" },
  { category: "Rent & Lease", amount: 2840000, color: "var(--chart-4)" },
  { category: "Marketing", amount: 1620000, color: "var(--chart-5)" },
  { category: "Software & SaaS", amount: 980000, color: "var(--chart-2)" },
  { category: "Repairs", amount: 690000, color: "var(--chart-3)" },
  { category: "Miscellaneous", amount: 300000, color: "var(--chart-4)" },
];

export const expenses = [
  { id: "EXP-2025-0142", date: "2025-09-26", category: "Electricity", vendor: "BESCOM", amount: 1248000, status: "Paid" as const },
  { id: "EXP-2025-0141", date: "2025-09-25", category: "Maintenance", vendor: "VoltCare Services", amount: 184500, status: "Pending" as const },
  { id: "EXP-2025-0140", date: "2025-09-24", category: "Software & SaaS", vendor: "ChargePoint OS", amount: 92500, status: "Paid" as const },
  { id: "EXP-2025-0139", date: "2025-09-22", category: "Rent & Lease", vendor: "DLF Properties", amount: 320000, status: "Paid" as const },
  { id: "EXP-2025-0138", date: "2025-09-20", category: "Repairs", vendor: "Siemens India", amount: 68400, status: "Approved" as const },
  { id: "EXP-2025-0137", date: "2025-09-18", category: "Marketing", vendor: "BrandMatter Studio", amount: 145000, status: "Paid" as const },
  { id: "EXP-2025-0136", date: "2025-09-15", category: "Employee Salaries", vendor: "Payroll – Sept", amount: 1840000, status: "Paid" as const },
  { id: "EXP-2025-0135", date: "2025-09-12", category: "Miscellaneous", vendor: "Office Supplies Co.", amount: 24800, status: "Pending" as const },
];

export const receivables = [
  { invoice: "INV-9821", customer: "Ola Electric Fleet", amount: 482500, due: "2025-10-04", status: "Overdue" as const, days: 6 },
  { invoice: "INV-9820", customer: "Uber Green India", amount: 318900, due: "2025-10-10", status: "Pending" as const, days: 0 },
  { invoice: "INV-9819", customer: "BluSmart Mobility", amount: 624000, due: "2025-10-12", status: "Pending" as const, days: 0 },
  { invoice: "INV-9818", customer: "Zypp Electric", amount: 184200, due: "2025-09-28", status: "Overdue" as const, days: 12 },
  { invoice: "INV-9817", customer: "Tata Power EZ", amount: 920000, due: "2025-10-18", status: "Pending" as const, days: 0 },
  { invoice: "INV-9816", customer: "Mahindra Logistics", amount: 285600, due: "2025-09-30", status: "Paid" as const, days: 0 },
  { invoice: "INV-9815", customer: "Lithium Urban Tech", amount: 142000, due: "2025-09-25", status: "Overdue" as const, days: 15 },
  { invoice: "INV-9814", customer: "Shuttl Mobility", amount: 96400, due: "2025-10-22", status: "Pending" as const, days: 0 },
];

export const payables = [
  { invoice: "VND-4521", vendor: "BESCOM", amount: 1248000, due: "2025-10-05", status: "Pending" as const },
  { invoice: "VND-4520", vendor: "VoltCare Services", amount: 184500, due: "2025-10-08", status: "Pending" as const },
  { invoice: "VND-4519", vendor: "Siemens India", amount: 68400, due: "2025-10-15", status: "Approved" as const },
  { invoice: "VND-4518", vendor: "ABB Power Grids", amount: 412000, due: "2025-09-30", status: "Paid" as const },
  { invoice: "VND-4517", vendor: "Delta Electronics", amount: 295000, due: "2025-10-12", status: "Pending" as const },
  { invoice: "VND-4516", vendor: "Schneider Electric", amount: 178000, due: "2025-09-28", status: "Paid" as const },
];

export const ledger = [
  { date: "2025-09-26", ref: "JV-1042", desc: "Charging revenue – Whitefield Hub", debit: 0, credit: 184250, balance: 12480000 },
  { date: "2025-09-26", ref: "JV-1041", desc: "Electricity bill – BESCOM Sept", debit: 1248000, credit: 0, balance: 12295750 },
  { date: "2025-09-25", ref: "JV-1040", desc: "Subscription revenue – BluSmart", debit: 0, credit: 624000, balance: 13543750 },
  { date: "2025-09-25", ref: "JV-1039", desc: "Maintenance – VoltCare invoice", debit: 184500, credit: 0, balance: 12919750 },
  { date: "2025-09-24", ref: "JV-1038", desc: "Partner revenue – Tata Power EZ", debit: 0, credit: 920000, balance: 13104250 },
  { date: "2025-09-24", ref: "JV-1037", desc: "Software – ChargePoint OS", debit: 92500, credit: 0, balance: 12184250 },
  { date: "2025-09-22", ref: "JV-1036", desc: "Rent – DLF Properties", debit: 320000, credit: 0, balance: 12276750 },
  { date: "2025-09-22", ref: "JV-1035", desc: "Commission – Hopcharge tie-up", debit: 0, credit: 142000, balance: 12596750 },
];

export const assets = [
  { id: "AST-1042", name: "ABB Terra 360 – BLR-WF-01", type: "DC Fast Charger", station: "Whitefield Hub", cost: 4820000, depreciated: 482000, status: "Operational" as const },
  { id: "AST-1041", name: "Delta 150kW – MUM-BKC-02", type: "DC Fast Charger", station: "BKC Tower", cost: 3920000, depreciated: 392000, status: "Operational" as const },
  { id: "AST-1040", name: "Schneider EVlink – DEL-AC-03", type: "AC Charger", station: "Aerocity Plaza", cost: 480000, depreciated: 96000, status: "Maintenance" as const },
  { id: "AST-1039", name: "Siemens Transformer 1000 kVA", type: "Transformer", station: "HITEC City", cost: 2680000, depreciated: 268000, status: "Operational" as const },
  { id: "AST-1038", name: "Tata Charge 60kW – PUN-HJ-04", type: "DC Charger", station: "Hinjewadi Park", cost: 1840000, depreciated: 184000, status: "Operational" as const },
  { id: "AST-1037", name: "Office Fitout – HQ Bengaluru", type: "Office Asset", station: "HQ", cost: 1240000, depreciated: 248000, status: "Operational" as const },
];

export const vendors = [
  { id: "VND-001", name: "BESCOM", category: "Electricity", outstanding: 1248000, status: "Active" as const, rating: 4.6 },
  { id: "VND-002", name: "VoltCare Services", category: "Maintenance", outstanding: 184500, status: "Active" as const, rating: 4.4 },
  { id: "VND-003", name: "Siemens India", category: "Equipment", outstanding: 68400, status: "Active" as const, rating: 4.8 },
  { id: "VND-004", name: "ABB Power Grids", category: "Equipment", outstanding: 0, status: "Active" as const, rating: 4.9 },
  { id: "VND-005", name: "Delta Electronics", category: "Equipment", outstanding: 295000, status: "Active" as const, rating: 4.5 },
  { id: "VND-006", name: "DLF Properties", category: "Rent", outstanding: 0, status: "Active" as const, rating: 4.2 },
];

export const stations = [
  { id: "STN-01", name: "Whitefield Hub", city: "Bengaluru", chargers: 12, uptime: 99.4, todayRevenue: 38420, status: "Online" as const },
  { id: "STN-02", name: "BKC Tower", city: "Mumbai", chargers: 10, uptime: 98.8, todayRevenue: 31240, status: "Online" as const },
  { id: "STN-03", name: "Aerocity Plaza", city: "Delhi", chargers: 8, uptime: 97.2, todayRevenue: 24180, status: "Online" as const },
  { id: "STN-04", name: "HITEC City", city: "Hyderabad", chargers: 10, uptime: 99.1, todayRevenue: 28640, status: "Online" as const },
  { id: "STN-05", name: "Hinjewadi Park", city: "Pune", chargers: 6, uptime: 95.8, todayRevenue: 18420, status: "Degraded" as const },
  { id: "STN-06", name: "OMR Tech Park", city: "Chennai", chargers: 8, uptime: 99.0, todayRevenue: 21580, status: "Online" as const },
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
  if (compact) {
    if (n >= 10000000) return `${company.currency}${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `${company.currency}${(n / 100000).toFixed(2)} L`;
    if (n >= 1000) return `${company.currency}${(n / 1000).toFixed(1)}K`;
  }
  return `${company.currency}${n.toLocaleString("en-IN")}`;
}
