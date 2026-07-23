import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Boxes,
  Plus,
  TrendingUp,
  Download,
  MoreHorizontal,
  ChevronDown,
  Search,
  Building2,
  Trash2,
  RefreshCw,
  ArrowLeftRight,
  ShieldAlert,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { WidgetBand } from "@/widgets/components/WidgetBand";
import { FinanceTabBar } from "@/components/erp/FinanceTabBar";
import { ErpButton } from "@/components/erp/Button";
import { CardHeader } from "@/components/erp/CardHeader";
import { FilterSelect } from "@/components/erp/FilterButton";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { company, formatCurrency } from "@/lib/mock-data";
import { fixedAssetService, depreciationEngineService, loadFixedAssetsDashboard } from "@/services";
import type {
  FixedAsset,
  FixedAssetCategory,
  FixedAssetStatus,
  FixedAssetFilters,
  DepreciationRun,
  AssetCategoryRecord,
  AssetDisposalRecord,
  AssetRevaluationRecord,
  AssetTransferRecord,
  DashboardQuery,
} from "@/services/types";

export const Route = createFileRoute("/management/finance/assets")({
  head: () => ({
    meta: [
      { title: "Fixed Assets · Magnertia" },
      {
        name: "description",
        content: "Track and manage your organization's fixed assets and depreciation.",
      },
    ],
  }),
  component: FixedAssetsPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

const CATEGORY_OPTIONS: { label: string; value: "All Categories" | FixedAssetCategory }[] = [
  { label: "All Categories", value: "All Categories" },
  { label: "Building", value: "Building" },
  { label: "Machinery", value: "Machinery" },
  { label: "IT Equipment", value: "IT Equipment" },
  { label: "Vehicles", value: "Vehicles" },
  { label: "Furniture", value: "Furniture" },
];

const STATUS_OPTIONS: { label: string; value: "All Statuses" | FixedAssetStatus }[] = [
  { label: "All Statuses", value: "All Statuses" },
  { label: "Active", value: "Active" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Fully Depreciated", value: "Fully Depreciated" },
  { label: "Disposed", value: "Disposed" },
];

const LOCATION_OPTIONS = [
  { label: "All Locations", value: "All Locations" },
  { label: "Head Office", value: "Head Office" },
  { label: "Manufacturing Plant", value: "Manufacturing Plant" },
  { label: "Warehouse", value: "Warehouse" },
  { label: "Logistics", value: "Logistics" },
];

const DEFAULT_FILTERS: FixedAssetFilters = {
  search: "",
  category: "All Categories",
  status: "All Statuses",
  location: "All Locations",
};

function FixedAssetsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "register" | "depreciation" | "categories" | "disposals" | "revaluation" | "transfers"
  >("register");
  const [filters, setFilters] = useState<FixedAssetFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog States
  const [addOpen, setAddOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [disposeOpen, setDisposeOpen] = useState(false);
  const [revalueOpen, setRevalueOpen] = useState(false);
  const [depreciateOpen, setDepreciateOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);

  // Input states
  const [newAssetInput, setNewAssetInput] = useState({
    name: "",
    category: "Machinery" as FixedAssetCategory,
    location: "Manufacturing Plant",
    purchaseDate: new Date().toISOString().substring(0, 10),
    cost: 0,
    salvageValue: 0,
    usefulLifeYears: 5,
    depreciationMethod: "Straight Line",
  });

  const [transferInput, setTransferInput] = useState({
    assetCode: "",
    transferDate: new Date().toISOString().substring(0, 10),
    destinationLocation: "Warehouse",
    authorizedBy: "Amit Mehra",
  });

  const [disposeInput, setDisposeInput] = useState({
    assetCode: "",
    disposalDate: new Date().toISOString().substring(0, 10),
    saleProceeds: 0,
    disposalReason: "Scrapped / Obsolete",
  });

  const [revalueInput, setRevalueInput] = useState({
    assetCode: "",
    revaluationDate: new Date().toISOString().substring(0, 10),
    newMarketValue: 0,
    reason: "Market Revaluation Update",
  });

  const [depInput, setDepInput] = useState({
    method: "Straight Line",
    executedBy: "Amit Mehra",
  });

  // Queries
  const dashboardQuery = useQuery({
    queryKey: ["fixed-assets", "dashboard", QUERY.fiscalYear],
    queryFn: () => loadFixedAssetsDashboard(QUERY),
  });

  const assetsQuery = useQuery({
    queryKey: ["fixed-assets", "list", filters],
    queryFn: () => fixedAssetService.fetchFixedAssets(QUERY, filters),
  });

  const depreciationRunsQuery = useQuery({
    queryKey: ["fixed-assets", "depreciation-runs"],
    queryFn: () => depreciationEngineService.fetchDepreciationRuns(QUERY),
    enabled: activeTab === "depreciation",
  });

  const categoriesQuery = useQuery({
    queryKey: ["fixed-assets", "categories"],
    queryFn: () => fixedAssetService.fetchAssetCategories(QUERY),
    enabled: activeTab === "categories",
  });

  const disposalsQuery = useQuery({
    queryKey: ["fixed-assets", "disposals"],
    queryFn: () => fixedAssetService.fetchAssetDisposals(QUERY),
    enabled: activeTab === "disposals",
  });

  const revaluationsQuery = useQuery({
    queryKey: ["fixed-assets", "revaluations"],
    queryFn: () => fixedAssetService.fetchAssetRevaluations(QUERY),
    enabled: activeTab === "revaluation",
  });

  const transfersQuery = useQuery({
    queryKey: ["fixed-assets", "transfers"],
    queryFn: () => fixedAssetService.fetchAssetTransfers(QUERY),
    enabled: activeTab === "transfers",
  });

  // Mutations
  const addAssetMutation = useMutation({
    mutationFn: fixedAssetService.saveFixedAsset,
    onSuccess: (newAsset) => {
      toast.success(
        `Asset "${newAsset.name}" successfully registered with code ${newAsset.assetCode}.`,
      );
      setAddOpen(false);
      setNewAssetInput({
        name: "",
        category: "Machinery",
        location: "Manufacturing Plant",
        purchaseDate: new Date().toISOString().substring(0, 10),
        cost: 0,
        salvageValue: 0,
        usefulLifeYears: 5,
        depreciationMethod: "Straight Line",
      });
      queryClient.invalidateQueries({ queryKey: ["fixed-assets"] });
    },
    onError: () => toast.error("Failed to add new asset."),
  });

  const transferMutation = useMutation({
    mutationFn: (i: typeof transferInput) =>
      fixedAssetService.transferFixedAsset(
        i.assetCode,
        i.destinationLocation,
        i.transferDate,
        i.authorizedBy,
      ),
    onSuccess: () => {
      toast.success("Asset successfully transferred to new location.");
      setTransferOpen(false);
      setTransferInput({
        assetCode: "",
        transferDate: new Date().toISOString().substring(0, 10),
        destinationLocation: "Warehouse",
        authorizedBy: "Amit Mehra",
      });
      queryClient.invalidateQueries({ queryKey: ["fixed-assets"] });
    },
    onError: () => toast.error("Failed to transfer asset."),
  });

  const disposeMutation = useMutation({
    mutationFn: (i: typeof disposeInput) =>
      fixedAssetService.disposeFixedAsset(
        i.assetCode,
        i.saleProceeds,
        i.disposalReason,
        i.disposalDate,
      ),
    onSuccess: () => {
      toast.success("Asset successfully recorded as disposed.");
      setDisposeOpen(false);
      setDisposeInput({
        assetCode: "",
        disposalDate: new Date().toISOString().substring(0, 10),
        saleProceeds: 0,
        disposalReason: "Scrapped / Obsolete",
      });
      queryClient.invalidateQueries({ queryKey: ["fixed-assets"] });
    },
    onError: () => toast.error("Failed to dispose asset."),
  });

  const revalueMutation = useMutation({
    mutationFn: (i: typeof revalueInput) =>
      fixedAssetService.revalueFixedAsset(
        i.assetCode,
        i.newMarketValue,
        i.reason,
        i.revaluationDate,
      ),
    onSuccess: () => {
      toast.success("Asset revaluation successfully posted.");
      setRevalueOpen(false);
      setRevalueInput({
        assetCode: "",
        revaluationDate: new Date().toISOString().substring(0, 10),
        newMarketValue: 0,
        reason: "Market Revaluation Update",
      });
      queryClient.invalidateQueries({ queryKey: ["fixed-assets"] });
    },
    onError: () => toast.error("Failed to revalue asset."),
  });

  const runDepreciationMutation = useMutation({
    mutationFn: (i: typeof depInput) =>
      depreciationEngineService.executeDepreciation(QUERY, i.method, i.executedBy),
    onSuccess: (run) => {
      toast.success(
        `Depreciation process successfully completed. Posted ${formatCurrency(run.totalDepreciation)} across ${run.assetsCount} assets.`,
      );
      setDepreciateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["fixed-assets"] });
    },
    onError: () => toast.error("Failed to execute depreciation run."),
  });

  const handleSelectAll = (checked: boolean, rows: FixedAsset[]) => {
    if (checked) {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetInput.name || !newAssetInput.cost) {
      toast.error("Please fill in all required fields.");
      return;
    }
    addAssetMutation.mutate(newAssetInput);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferInput.assetCode || !transferInput.destinationLocation) {
      toast.error("Please select an asset and destination.");
      return;
    }
    transferMutation.mutate(transferInput);
  };

  const handleDisposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disposeInput.assetCode) {
      toast.error("Please select an asset to dispose.");
      return;
    }
    disposeMutation.mutate(disposeInput);
  };

  const handleRevalueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revalueInput.assetCode || !revalueInput.newMarketValue) {
      toast.error("Please select an asset and enter market value.");
      return;
    }
    revalueMutation.mutate(revalueInput);
  };

  const handleDepreciateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runDepreciationMutation.mutate(depInput);
  };

  const isLoading = dashboardQuery.isLoading || assetsQuery.isLoading;
  const data = dashboardQuery.data;

  return (
    <AppShell
      title="Finance"
      breadcrumb="Management"
      description="Track and manage your organization's fixed assets and depreciation."
      tabs={<FinanceTabBar />}
      topbarActions={
        <ErpButton onClick={() => setAddOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add New Asset</span>
        </ErpButton>
      }
    >
      {isLoading || !data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="h-[500px] animate-pulse rounded-xl bg-muted" />
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-xl bg-muted" />
              <div className="h-48 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* KPI Header Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Total Assets"
              value={data.kpis.totalAssets.toLocaleString("en-US")}
              neutralText="All Assets"
              icon={<Boxes className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Gross Book Value"
              value={formatCurrency(data.kpis.grossBookValue)}
              neutralText="All Assets"
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Accumulated Depreciation"
              value={formatCurrency(data.kpis.accumulatedDepreciation)}
              neutralText="This Fiscal Year"
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-[#F59E0B]/10"
              iconColor="text-[#F59E0B]"
            />
            <StatCard
              label="Net Book Value"
              value={formatCurrency(data.kpis.netBookValue)}
              neutralText="All Assets"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Assets Added This Year"
              value={data.kpis.assetsAddedThisYear.toString()}
              neutralText="This Fiscal Year"
              icon={<Plus className="h-5 w-5" />}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Customizable widget band (empty by default) */}
          <WidgetBand pageId="finance-assets" />

          {/* Main Content Layout */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left Content Area */}
            <div className="min-w-0 space-y-5">
              {/* Tabs Navigation & Header Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-1">
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      { label: "Asset Register", value: "register" },
                      { label: "Depreciation", value: "depreciation" },
                      { label: "Asset Categories", value: "categories" },
                      { label: "Disposals", value: "disposals" },
                      { label: "Revaluation", value: "revaluation" },
                      { label: "Transfers", value: "transfers" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setActiveTab(t.value)}
                      className={`px-4 py-2 text-[14px] font-semibold border-b-2 transition-colors -mb-[2px] ${
                        activeTab === t.value
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <ErpButton
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Exporting report...")}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </ErpButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground shadow-sm hover:bg-muted/50">
                        <span>More Actions</span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setTransferOpen(true)}>
                        <ArrowLeftRight className="mr-2 h-3.5 w-3.5" /> Transfer Asset
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRevalueOpen(true)}>
                        <TrendingUp className="mr-2 h-3.5 w-3.5" /> Revalue Asset
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDisposeOpen(true)}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Dispose Asset
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDepreciateOpen(true)}>
                        <RefreshCw className="mr-2 h-3.5 w-3.5" /> Run Depreciation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tab Content Panels */}
              <div className="space-y-5">
                {/* 1. ASSET REGISTER TAB */}
                {activeTab === "register" && (
                  <>
                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5 card-soft p-3.5">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search assets by name, code, category..."
                          value={filters.search}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, search: e.target.value }))
                          }
                          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <FilterSelect
                        value={filters.category}
                        options={CATEGORY_OPTIONS}
                        onChange={(val) =>
                          setFilters((prev) => ({
                            ...prev,
                            category: val as FixedAssetFilters["category"],
                          }))
                        }
                      />

                      <FilterSelect
                        value={filters.status}
                        options={STATUS_OPTIONS}
                        onChange={(val) =>
                          setFilters((prev) => ({
                            ...prev,
                            status: val as FixedAssetFilters["status"],
                          }))
                        }
                      />

                      <FilterSelect
                        value={filters.location}
                        options={LOCATION_OPTIONS}
                        onChange={(val) => setFilters((prev) => ({ ...prev, location: val }))}
                      />

                      <button
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="text-[12px] font-semibold text-primary hover:underline px-2"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Table View */}
                    <div className="card-soft overflow-hidden">
                      <DataTable<FixedAsset>
                        data={assetsQuery.data as unknown as FixedAsset[]}
                        columns={[
                          {
                            key: "select",
                            header: (
                              <Checkbox
                                checked={
                                  selectedIds.size === (assetsQuery.data?.length || 0) &&
                                  (assetsQuery.data?.length || 0) > 0
                                }
                                onCheckedChange={(checked) =>
                                  handleSelectAll(!!checked, assetsQuery.data || [])
                                }
                                aria-label="Select all"
                              />
                            ),
                            cell: (r) => (
                              <Checkbox
                                checked={selectedIds.has(r.id)}
                                onCheckedChange={() => handleToggleSelect(r.id)}
                                aria-label={`Select ${r.name}`}
                              />
                            ),
                          },
                          {
                            key: "assetCode",
                            header: "Asset Code",
                            cell: (r) => (
                              <button
                                onClick={() => setSelectedAsset(r)}
                                className="font-mono text-xs font-semibold text-primary hover:underline"
                              >
                                {r.assetCode}
                              </button>
                            ),
                          },
                          {
                            key: "name",
                            header: "Asset Name",
                            cell: (r) => (
                              <span className="font-semibold text-foreground">{r.name}</span>
                            ),
                          },
                          {
                            key: "category",
                            header: "Category",
                            cell: (r) => (
                              <span className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground border border-border">
                                {r.category}
                              </span>
                            ),
                          },
                          {
                            key: "location",
                            header: "Location",
                            cell: (r) => (
                              <span className="text-muted-foreground">{r.location}</span>
                            ),
                          },
                          {
                            key: "purchaseDate",
                            header: "Purchase Date",
                            cell: (r) => (
                              <span className="text-muted-foreground">{r.purchaseDate}</span>
                            ),
                          },
                          {
                            key: "cost",
                            header: "Cost (₹)",
                            align: "right",
                            cell: (r) => (
                              <span className="font-semibold tabular text-foreground">
                                {formatCurrency(r.cost)}
                              </span>
                            ),
                          },
                          {
                            key: "accumulatedDepreciation",
                            header: "Accum. Depreciation",
                            align: "right",
                            cell: (r) => (
                              <span className="text-muted-foreground tabular">
                                {formatCurrency(r.accumulatedDepreciation)}
                              </span>
                            ),
                          },
                          {
                            key: "netBookValue",
                            header: "Net Book Value",
                            align: "right",
                            cell: (r) => (
                              <span className="font-bold tabular text-primary">
                                {formatCurrency(r.netBookValue)}
                              </span>
                            ),
                          },
                          {
                            key: "status",
                            header: "Status",
                            cell: (r) => (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  r.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : r.status === "Maintenance"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : r.status === "Fully Depreciated"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {r.status}
                              </span>
                            ),
                          },
                          {
                            key: "actions",
                            header: "Actions",
                            align: "center",
                            cell: (r) => (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedAsset(r)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setTransferInput((prev) => ({
                                        ...prev,
                                        assetCode: r.assetCode,
                                      }));
                                      setTransferOpen(true);
                                    }}
                                  >
                                    Transfer Location
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setRevalueInput((prev) => ({
                                        ...prev,
                                        assetCode: r.assetCode,
                                      }));
                                      setRevalueOpen(true);
                                    }}
                                  >
                                    Post Revaluation
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDisposeInput((prev) => ({
                                        ...prev,
                                        assetCode: r.assetCode,
                                      }));
                                      setDisposeOpen(true);
                                    }}
                                    className="text-destructive"
                                  >
                                    Dispose Asset
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ),
                          },
                        ]}
                        mobileCard={(r) => (
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <button
                                onClick={() => setSelectedAsset(r)}
                                className="font-semibold text-foreground hover:text-primary"
                              >
                                {r.name} ({r.assetCode})
                              </button>
                              <span className="font-bold">{formatCurrency(r.netBookValue)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                {r.category} • {r.location}
                              </span>
                              <span>Cost: {formatCurrency(r.cost)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-border">
                              <span
                                className={`text-xs ${r.status === "Active" ? "text-green-600" : "text-yellow-600"}`}
                              >
                                {r.status}
                              </span>
                              <div className="flex gap-2">
                                <ErpButton
                                  variant="outline"
                                  size="xs"
                                  onClick={() => setSelectedAsset(r)}
                                >
                                  Details
                                </ErpButton>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    </div>

                    {/* Summary row stats at the bottom */}
                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 mt-1">
                      <div className="card-soft p-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground font-medium">
                            Fully Depreciated
                          </span>
                          <h4 className="text-lg font-bold text-foreground mt-0.5 tabular">
                            {data.summaryStats.fullyDepreciatedCount}
                          </h4>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {data.summaryStats.fullyDepreciatedPct}% of Total
                        </span>
                      </div>
                      <div className="card-soft p-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground font-medium">
                            Under Maintenance
                          </span>
                          <h4 className="text-lg font-bold text-foreground mt-0.5 tabular">
                            {data.summaryStats.maintenanceCount}
                          </h4>
                        </div>
                        <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">
                          {data.summaryStats.maintenancePct}% of Total
                        </span>
                      </div>
                      <div className="card-soft p-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground font-medium">
                            Assets in Use
                          </span>
                          <h4 className="text-lg font-bold text-foreground mt-0.5 tabular">
                            {data.summaryStats.inUseCount}
                          </h4>
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                          {data.summaryStats.inUsePct}% of Total
                        </span>
                      </div>
                      <div className="card-soft p-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground font-medium">
                            Disposed This Year
                          </span>
                          <h4 className="text-lg font-bold text-foreground mt-0.5 tabular">
                            {data.summaryStats.disposedCount}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block leading-none">
                            Net Book Value
                          </span>
                          <span className="text-xs font-bold text-foreground tabular">
                            {formatCurrency(data.summaryStats.disposedNetBookValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. DEPRECIATION TAB */}
                {activeTab === "depreciation" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div>
                        <h3 className="font-semibold text-lg">Depreciation Journal Runs</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Logs of executed monthly depreciation runs posted to the general ledger.
                        </p>
                      </div>
                      <ErpButton size="sm" onClick={() => setDepreciateOpen(true)}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Run Depreciation
                      </ErpButton>
                    </div>

                    <div className="card-soft overflow-hidden">
                      {depreciationRunsQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">Loading runs...</div>
                      ) : !depreciationRunsQuery.data || depreciationRunsQuery.data.length === 0 ? (
                        <EmptyState
                          title="No runs"
                          description="No depreciation runs executed yet."
                        />
                      ) : (
                        <DataTable<DepreciationRun>
                          data={depreciationRunsQuery.data as unknown as DepreciationRun[]}
                          columns={[
                            {
                              key: "period",
                              header: "Accounting Period",
                              cell: (r) => (
                                <span className="font-semibold text-foreground">{r.period}</span>
                              ),
                            },
                            {
                              key: "date",
                              header: "Run Date",
                              cell: (r) => <span className="text-muted-foreground">{r.date}</span>,
                            },
                            {
                              key: "method",
                              header: "Calculation Method",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.method}</span>
                              ),
                            },
                            {
                              key: "assetsCount",
                              header: "Assets Affected",
                              align: "center",
                              cell: (r) => (
                                <span className="tabular font-semibold">{r.assetsCount}</span>
                              ),
                            },
                            {
                              key: "totalDepreciation",
                              header: "Total Depreciation",
                              align: "right",
                              cell: (r) => (
                                <span className="font-bold text-destructive tabular">
                                  {formatCurrency(r.totalDepreciation)}
                                </span>
                              ),
                            },
                            {
                              key: "executedBy",
                              header: "Executed By",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.executedBy}</span>
                              ),
                            },
                            {
                              key: "status",
                              header: "Status",
                              cell: (r) => (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    r.status === "Posted"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {r.status}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-semibold text-foreground">
                                  {r.period} Run
                                </span>
                                <span className="font-bold text-destructive">
                                  {formatCurrency(r.totalDepreciation)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  {r.date} • {r.assetsCount} Assets
                                </span>
                                <span>{r.status}</span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 3. ASSET CATEGORIES TAB */}
                {activeTab === "categories" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Fixed Asset Classes / Categories</h3>
                    <div className="card-soft overflow-hidden">
                      {categoriesQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading classes...
                        </div>
                      ) : (
                        <DataTable<AssetCategoryRecord>
                          data={categoriesQuery.data as unknown as AssetCategoryRecord[]}
                          columns={[
                            {
                              key: "name",
                              header: "Category Name",
                              cell: (r) => (
                                <span className="font-semibold text-foreground">{r.name}</span>
                              ),
                            },
                            {
                              key: "description",
                              header: "Description",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.description}</span>
                              ),
                            },
                            {
                              key: "depMethod",
                              header: "Default Dep. Method",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.depMethod}</span>
                              ),
                            },
                            {
                              key: "usefulLife",
                              header: "Useful Life",
                              align: "center",
                              cell: (r) => (
                                <span className="font-semibold">{r.usefulLife} Years</span>
                              ),
                            },
                            {
                              key: "assetAccount",
                              header: "Asset GL Account",
                              cell: (r) => (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {r.assetAccount}
                                </span>
                              ),
                            },
                            {
                              key: "depAccount",
                              header: "Accum. Dep. GL Account",
                              cell: (r) => (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {r.depAccount}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-2">
                              <div className="font-semibold text-foreground">{r.name}</div>
                              <div className="text-xs text-muted-foreground">{r.description}</div>
                              <div className="flex justify-between text-xs font-medium border-t border-border pt-1">
                                <span>Method: {r.depMethod}</span>
                                <span>Life: {r.usefulLife} Yrs</span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 4. DISPOSALS TAB */}
                {activeTab === "disposals" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Asset Disposals Registry</h3>
                    <div className="card-soft overflow-hidden">
                      {disposalsQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading disposals...
                        </div>
                      ) : (
                        <DataTable<AssetDisposalRecord>
                          data={disposalsQuery.data as unknown as AssetDisposalRecord[]}
                          columns={[
                            {
                              key: "assetCode",
                              header: "Asset Code",
                              cell: (r) => (
                                <span className="font-mono text-xs font-semibold text-foreground">
                                  {r.assetCode}
                                </span>
                              ),
                            },
                            {
                              key: "name",
                              header: "Asset Name",
                              cell: (r) => (
                                <span className="font-semibold text-foreground">{r.name}</span>
                              ),
                            },
                            {
                              key: "disposalDate",
                              header: "Disposal Date",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.disposalDate}</span>
                              ),
                            },
                            {
                              key: "cost",
                              header: "Acquisition Cost",
                              align: "right",
                              cell: (r) => (
                                <span className="tabular">{formatCurrency(r.cost)}</span>
                              ),
                            },
                            {
                              key: "accumulatedDepreciation",
                              header: "Accum. Dep.",
                              align: "right",
                              cell: (r) => (
                                <span className="text-muted-foreground tabular">
                                  {formatCurrency(r.accumulatedDepreciation)}
                                </span>
                              ),
                            },
                            {
                              key: "proceeds",
                              header: "Sale Proceeds",
                              align: "right",
                              cell: (r) => (
                                <span className="font-semibold text-foreground tabular">
                                  {formatCurrency(r.proceeds)}
                                </span>
                              ),
                            },
                            {
                              key: "gainLoss",
                              header: "Gain / Loss",
                              align: "right",
                              cell: (r) => (
                                <span
                                  className={`font-bold tabular ${r.gainLoss >= 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {r.gainLoss >= 0 ? "+" : ""}
                                  {formatCurrency(r.gainLoss)}
                                </span>
                              ),
                            },
                            {
                              key: "status",
                              header: "Status",
                              cell: (r) => <StatusBadge status={r.status} />,
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-semibold text-foreground">{r.name}</span>
                                <span
                                  className={`font-bold ${r.gainLoss >= 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {formatCurrency(r.gainLoss)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  {r.disposalDate} • Proceeds: {formatCurrency(r.proceeds)}
                                </span>
                                <span>{r.status}</span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 5. REVALUATION TAB */}
                {activeTab === "revaluation" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Asset Revaluation History</h3>
                    <div className="card-soft overflow-hidden">
                      {revaluationsQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading revaluations...
                        </div>
                      ) : (
                        <DataTable<AssetRevaluationRecord>
                          data={revaluationsQuery.data as unknown as AssetRevaluationRecord[]}
                          columns={[
                            {
                              key: "assetCode",
                              header: "Asset Code",
                              cell: (r) => (
                                <span className="font-mono text-xs font-semibold text-foreground">
                                  {r.assetCode}
                                </span>
                              ),
                            },
                            {
                              key: "name",
                              header: "Asset Name",
                              cell: (r) => (
                                <span className="font-semibold text-foreground">{r.name}</span>
                              ),
                            },
                            {
                              key: "date",
                              header: "Revaluation Date",
                              cell: (r) => <span className="text-muted-foreground">{r.date}</span>,
                            },
                            {
                              key: "oldNBV",
                              header: "Previous NBV",
                              align: "right",
                              cell: (r) => (
                                <span className="tabular">{formatCurrency(r.oldNBV)}</span>
                              ),
                            },
                            {
                              key: "newNBV",
                              header: "New Market Value",
                              align: "right",
                              cell: (r) => (
                                <span className="font-semibold text-primary tabular">
                                  {formatCurrency(r.newNBV)}
                                </span>
                              ),
                            },
                            {
                              key: "adjustment",
                              header: "Adjustment Amount",
                              align: "right",
                              cell: (r) => (
                                <span
                                  className={`font-bold tabular ${r.adjustment >= 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {r.adjustment >= 0 ? "+" : ""}
                                  {formatCurrency(r.adjustment)}
                                </span>
                              ),
                            },
                            {
                              key: "reason",
                              header: "Valuation Reason",
                              cell: (r) => (
                                <span className="text-muted-foreground text-xs">{r.reason}</span>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-semibold text-foreground">{r.name}</span>
                                <span
                                  className={`font-bold ${r.adjustment >= 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {formatCurrency(r.adjustment)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  {r.date} • {r.reason}
                                </span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 6. TRANSFERS TAB */}
                {activeTab === "transfers" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Asset Location Transfers Log</h3>
                    <div className="card-soft overflow-hidden">
                      {transfersQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading transfers...
                        </div>
                      ) : (
                        <DataTable<AssetTransferRecord>
                          data={transfersQuery.data as unknown as AssetTransferRecord[]}
                          columns={[
                            {
                              key: "assetCode",
                              header: "Asset Code",
                              cell: (r) => (
                                <span className="font-mono text-xs font-semibold text-foreground">
                                  {r.assetCode}
                                </span>
                              ),
                            },
                            {
                              key: "name",
                              header: "Asset Name",
                              cell: (r) => (
                                <span className="font-semibold text-foreground">{r.name}</span>
                              ),
                            },
                            {
                              key: "date",
                              header: "Transfer Date",
                              cell: (r) => <span className="text-muted-foreground">{r.date}</span>,
                            },
                            {
                              key: "sourceLocation",
                              header: "Previous Location",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.sourceLocation}</span>
                              ),
                            },
                            {
                              key: "destinationLocation",
                              header: "New Location",
                              cell: (r) => (
                                <span className="font-semibold text-primary">
                                  {r.destinationLocation}
                                </span>
                              ),
                            },
                            {
                              key: "authorizedBy",
                              header: "Authorized By",
                              cell: (r) => (
                                <span className="text-muted-foreground text-xs">
                                  {r.authorizedBy}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-2">
                              <div className="font-semibold text-foreground">
                                {r.name} ({r.assetCode})
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  {r.sourceLocation} → {r.destinationLocation}
                                </span>
                                <span>{r.date}</span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar Area */}
            <div className="space-y-5">
              {/* Asset Category Distribution Pie Chart */}
              <div className="card-soft p-5">
                <CardHeader
                  title="Asset Distribution by Category"
                  right={
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
                      By Cost
                    </span>
                  }
                />

                <div className="flex flex-col items-center gap-4 mt-2">
                  <div className="relative h-[130px] w-[130px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data.categoryDistribution}
                          dataKey="cost"
                          nameKey="name"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {data.categoryDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[15px] font-bold text-foreground">
                          {data.kpis.totalAssets.toLocaleString("en-US")}
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                          Total Assets
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="w-full space-y-1.5 mt-1 text-xs">
                    {data.categoryDistribution.map((c, index) => (
                      <li key={index} className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 truncate text-muted-foreground">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: c.color }}
                          />
                          <span className="truncate">{c.name}</span>
                        </span>
                        <span className="font-semibold text-foreground shrink-0">
                          {c.percentage}% ({formatCurrency(c.cost, true)})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Depreciation Trend Line Chart */}
              <div className="card-soft p-5">
                <CardHeader
                  title="Depreciation Trend"
                  right={
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
                      This Fiscal Year
                    </span>
                  }
                />

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3 mt-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Monthly Depreciation (₹)
                  </span>
                </div>

                <div className="h-[150px] w-full">
                  <ResponsiveContainer>
                    <LineChart
                      data={data.depreciationTrend}
                      margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${(v / 1_00_00_000).toFixed(1)}Cr`}
                        domain={[0, 2000000]}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                        formatter={(v: number) => formatCurrency(v, true)}
                      />
                      <Line
                        type="monotone"
                        dataKey="depreciation"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ r: 2.5, fill: "var(--primary)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Assets List */}
              <div className="card-soft p-5">
                <CardHeader
                  title="Top Assets by Net Book Value"
                  right={
                    <button
                      onClick={() => {
                        setFilters(DEFAULT_FILTERS);
                        setActiveTab("register");
                      }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View All
                    </button>
                  }
                />

                <div className="space-y-3 mt-2">
                  {data.topAssets.map((asset, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="min-w-0">
                        <span className="font-semibold block text-foreground truncate">
                          {asset.name}
                        </span>
                      </div>
                      <span className="font-bold text-foreground shrink-0 tabular ml-2">
                        {formatCurrency(asset.netBookValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Actions Bar */}
              <div className="card-soft p-5">
                <CardHeader title="Quick Actions" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setAddOpen(true)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-center"
                  >
                    <Plus className="h-4.5 w-4.5 text-primary mb-1" />
                    <span className="text-[11px] font-semibold text-foreground">Add New Asset</span>
                  </button>
                  <button
                    onClick={() => setTransferOpen(true)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-center"
                  >
                    <ArrowLeftRight className="h-4.5 w-4.5 text-primary mb-1" />
                    <span className="text-[11px] font-semibold text-foreground">
                      Asset Transfer
                    </span>
                  </button>
                  <button
                    onClick={() => setDisposeOpen(true)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-center"
                  >
                    <Trash2 className="h-4.5 w-4.5 text-destructive mb-1" />
                    <span className="text-[11px] font-semibold text-foreground">Dispose Asset</span>
                  </button>
                  <button
                    onClick={() => setRevalueOpen(true)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-center"
                  >
                    <TrendingUp className="h-4.5 w-4.5 text-primary mb-1" />
                    <span className="text-[11px] font-semibold text-foreground">Revalue Asset</span>
                  </button>
                  <button
                    onClick={() => setDepreciateOpen(true)}
                    className="flex flex-col items-center justify-center p-3 col-span-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-center"
                  >
                    <RefreshCw className="h-4.5 w-4.5 text-primary mb-1" />
                    <span className="text-[11px] font-semibold text-foreground">
                      Run Depreciation
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DIALOGS & MODALS --- */}

      {/* 1. Add Asset Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register Fixed Asset</DialogTitle>
            <DialogDescription>
              Add a new capitalized fixed asset to the asset ledger.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Asset Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Factory Robotic Welder"
                  value={newAssetInput.name}
                  onChange={(e) => setNewAssetInput((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Category *
                  </label>
                  <select
                    value={newAssetInput.category}
                    onChange={(e) =>
                      setNewAssetInput((prev) => ({
                        ...prev,
                        category: e.target.value as FixedAssetCategory,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Building">Building</option>
                    <option value="Machinery">Machinery</option>
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAssetInput.location}
                    onChange={(e) =>
                      setNewAssetInput((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newAssetInput.purchaseDate}
                    onChange={(e) =>
                      setNewAssetInput((prev) => ({ ...prev, purchaseDate: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Acquisition Cost (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="0.00"
                    value={newAssetInput.cost || ""}
                    onChange={(e) =>
                      setNewAssetInput((prev) => ({
                        ...prev,
                        cost: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Salvage Value
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newAssetInput.salvageValue || ""}
                    onChange={(e) =>
                      setNewAssetInput((prev) => ({
                        ...prev,
                        salvageValue: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Useful Life (Yrs)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newAssetInput.usefulLifeYears}
                    onChange={(e) =>
                      setNewAssetInput((prev) => ({
                        ...prev,
                        usefulLifeYears: parseInt(e.target.value) || 5,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Dep. Method
                  </label>
                  <select
                    value={newAssetInput.depreciationMethod}
                    onChange={(e) =>
                      setNewAssetInput((prev) => ({ ...prev, depreciationMethod: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Straight Line">Straight Line</option>
                    <option value="Declining Balance">Declining Balance</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={addAssetMutation.isPending}>
                Add Asset
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Asset Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Asset Location</DialogTitle>
            <DialogDescription>
              Record transfer of fixed asset to a new office, warehouse, or plant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Select Asset *
                </label>
                <select
                  required
                  value={transferInput.assetCode}
                  onChange={(e) =>
                    setTransferInput((prev) => ({ ...prev, assetCode: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select Asset...</option>
                  {(assetsQuery.data || []).map((a: FixedAsset) => (
                    <option key={a.id} value={a.assetCode}>
                      {a.name} ({a.assetCode}) - {a.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Transfer Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={transferInput.transferDate}
                    onChange={(e) =>
                      setTransferInput((prev) => ({ ...prev, transferDate: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Destination Location *
                  </label>
                  <select
                    value={transferInput.destinationLocation}
                    onChange={(e) =>
                      setTransferInput((prev) => ({ ...prev, destinationLocation: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Head Office">Head Office</option>
                    <option value="Manufacturing Plant">Manufacturing Plant</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Authorized By *
                </label>
                <input
                  type="text"
                  required
                  value={transferInput.authorizedBy}
                  onChange={(e) =>
                    setTransferInput((prev) => ({ ...prev, authorizedBy: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setTransferOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton
                type="submit"
                loading={transferMutation.isPending}
                disabled={!transferInput.assetCode}
              >
                Transfer Asset
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Dispose Asset Dialog */}
      <Dialog open={disposeOpen} onOpenChange={setDisposeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dispose Asset</DialogTitle>
            <DialogDescription>
              Retire and log the sale, scrap, or write-off of a fixed asset.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDisposeSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Select Asset *
                </label>
                <select
                  required
                  value={disposeInput.assetCode}
                  onChange={(e) =>
                    setDisposeInput((prev) => ({ ...prev, assetCode: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select Asset...</option>
                  {(assetsQuery.data || [])
                    .filter((a: FixedAsset) => a.status !== "Disposed")
                    .map((a: FixedAsset) => (
                      <option key={a.id} value={a.assetCode}>
                        {a.name} ({a.assetCode}) - NBV: {formatCurrency(a.netBookValue)}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Disposal Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={disposeInput.disposalDate}
                    onChange={(e) =>
                      setDisposeInput((prev) => ({ ...prev, disposalDate: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Sale Proceeds (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={disposeInput.saleProceeds || ""}
                    onChange={(e) =>
                      setDisposeInput((prev) => ({
                        ...prev,
                        saleProceeds: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Reason / Notes *
                </label>
                <input
                  type="text"
                  required
                  value={disposeInput.disposalReason}
                  onChange={(e) =>
                    setDisposeInput((prev) => ({ ...prev, disposalReason: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setDisposeOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton
                type="submit"
                variant="destructive"
                loading={disposeMutation.isPending}
                disabled={!disposeInput.assetCode}
              >
                Dispose Asset
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Revalue Asset Dialog */}
      <Dialog open={revalueOpen} onOpenChange={setRevalueOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Revalue Fixed Asset</DialogTitle>
            <DialogDescription>
              Adjust the book value of an asset to match its current fair market value.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRevalueSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Select Asset *
                </label>
                <select
                  required
                  value={revalueInput.assetCode}
                  onChange={(e) =>
                    setRevalueInput((prev) => ({ ...prev, assetCode: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select Asset...</option>
                  {(assetsQuery.data || []).map((a: FixedAsset) => (
                    <option key={a.id} value={a.assetCode}>
                      {a.name} ({a.assetCode}) - Current NBV: {formatCurrency(a.netBookValue)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Revaluation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={revalueInput.revaluationDate}
                    onChange={(e) =>
                      setRevalueInput((prev) => ({ ...prev, revaluationDate: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    New Market Value (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="0.00"
                    value={revalueInput.newMarketValue || ""}
                    onChange={(e) =>
                      setRevalueInput((prev) => ({
                        ...prev,
                        newMarketValue: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Reason for Revaluation *
                </label>
                <input
                  type="text"
                  required
                  value={revalueInput.reason}
                  onChange={(e) => setRevalueInput((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setRevalueOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton
                type="submit"
                loading={revalueMutation.isPending}
                disabled={!revalueInput.assetCode || !revalueInput.newMarketValue}
              >
                Revalue Asset
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Run Depreciation Dialog */}
      <Dialog open={depreciateOpen} onOpenChange={setDepreciateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Execute Depreciation Run</DialogTitle>
            <DialogDescription>
              Run the automated depreciation calculation for the current accounting period and post
              balances to the general ledger.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDepreciateSubmit} className="space-y-4">
            <div className="grid gap-3.5 bg-secondary/40 p-4 rounded-xl">
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Accounting Period:</span>
                <span className="font-semibold text-foreground">May 2025</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-t border-border">
                <span className="text-muted-foreground">Active Assets to Depreciate:</span>
                <span className="font-semibold text-foreground">
                  {(assetsQuery.data || []).filter((a: FixedAsset) => a.status === "Active").length}{" "}
                  Assets
                </span>
              </div>
              <div className="flex justify-between text-sm py-1 border-t border-border">
                <span className="text-muted-foreground">Depreciation Method:</span>
                <span className="font-semibold text-foreground">Category-Configured Default</span>
              </div>
            </div>
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Select Execution Method *
                </label>
                <select
                  value={depInput.method}
                  onChange={(e) => setDepInput((prev) => ({ ...prev, method: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="Straight Line">Straight Line (All Categories)</option>
                  <option value="Double Declining Balance">Double Declining Balance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Executed By *
                </label>
                <input
                  type="text"
                  required
                  value={depInput.executedBy}
                  onChange={(e) => setDepInput((prev) => ({ ...prev, executedBy: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setDepreciateOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={runDepreciationMutation.isPending}>
                Execute & Post Run
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Asset Details Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent className="max-w-md">
          {selectedAsset && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle>{selectedAsset.name}</DialogTitle>
                    <span className="text-xs text-muted-foreground">{selectedAsset.assetCode}</span>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Category</span>
                    <span className="font-semibold text-foreground">{selectedAsset.category}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Location</span>
                    <span className="font-semibold text-foreground">{selectedAsset.location}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Purchase Date</span>
                    <span className="font-semibold text-foreground">
                      {selectedAsset.purchaseDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Status</span>
                    <span className="inline-flex items-center text-xs font-semibold text-green-700">
                      {selectedAsset.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Acquisition Cost</span>
                    <span className="font-semibold text-foreground tabular">
                      {formatCurrency(selectedAsset.cost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Accum. Depreciation</span>
                    <span className="text-muted-foreground tabular">
                      {formatCurrency(selectedAsset.accumulatedDepreciation)}
                    </span>
                  </div>
                  <div className="col-span-2 border-t border-border pt-2.5">
                    <span className="text-xs text-muted-foreground block">Net Book Value</span>
                    <span className="font-bold text-primary text-base tabular">
                      {formatCurrency(selectedAsset.netBookValue)}
                    </span>
                  </div>
                </div>

                <div className="bg-secondary/40 p-3 rounded-lg flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground block mb-0.5">Audit Log</span>
                    Registered in system on purchase date. Depreciation calculated straight-line.
                    Useful life remaining: 3 years.
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-5 border-t border-border pt-3">
                <ErpButton
                  variant="outline"
                  onClick={() => {
                    setTransferInput((prev) => ({ ...prev, assetCode: selectedAsset.assetCode }));
                    setTransferOpen(true);
                    setSelectedAsset(null);
                  }}
                >
                  <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" /> Transfer
                </ErpButton>
                <ErpButton variant="outline" onClick={() => setSelectedAsset(null)}>
                  Close
                </ErpButton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
