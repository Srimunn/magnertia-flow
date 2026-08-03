import { Package, Layers, Rocket, Repeat, Activity } from "lucide-react";
import type { WidgetDefinition } from "../../types";
import { makeStatCardWidget } from "../shared/StatCardWidget";

export const pdWidgets: WidgetDefinition[] = [
  makeStatCardWidget({
    id: "kpi.pd.active-projects",
    title: "Active Projects",
    description: "Total active product engineering projects across design and build stages.",
    category: "kpi",
    icon: Package,
    queryKey: ["pd", "active-projects"],
    extract: () => ({ value: 18, label: "Active Projects", statusText: "+3 this month", trend: { value: 16.6, positive: true } }),
  }),
  makeStatCardWidget({
    id: "kpi.pd.in-development",
    title: "In Development",
    description: "Products currently undergoing detailed mechanical, electrical & software engineering.",
    category: "kpi",
    icon: Layers,
    queryKey: ["pd", "in-development"],
    extract: () => ({ value: 12, label: "In Engineering", statusText: "On schedule", trend: { value: 8.3, positive: true } }),
  }),
  makeStatCardWidget({
    id: "kpi.pd.ready-release",
    title: "Ready for Release",
    description: "Products passing validation and awaiting release gate approval.",
    category: "kpi",
    icon: Rocket,
    queryKey: ["pd", "ready-release"],
    extract: () => ({ value: 4, label: "Release Gates", statusText: "1 pending review", trend: { value: 25.0, positive: true } }),
  }),
  makeStatCardWidget({
    id: "kpi.pd.active-lifecycle",
    title: "In Active Lifecycle",
    description: "Products in active commercial lifecycle with active digital thread tracking.",
    category: "kpi",
    icon: Repeat,
    queryKey: ["pd", "active-lifecycle"],
    extract: () => ({ value: 34, label: "Live Baselines", statusText: "ECR/ECO active", trend: { value: 4.2, positive: true } }),
  }),
  makeStatCardWidget({
    id: "kpi.pd.overall-health",
    title: "Overall Product Health",
    description: "Aggregate engineering quality, schedule compliance, and requirement satisfaction score.",
    category: "kpi",
    icon: Activity,
    queryKey: ["pd", "overall-health"],
    extract: () => ({ value: "94%", label: "Pipeline Health", statusText: "Optimal quality", trend: { value: 2.1, positive: true } }),
  }),
];
