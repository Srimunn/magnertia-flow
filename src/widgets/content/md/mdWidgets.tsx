import { Settings, Repeat, ShieldCheck, Rocket, Gauge } from "lucide-react";
import type { WidgetDefinition } from "../../types";
import { makeStatCardWidget } from "../shared/StatCardWidget";

export const mdWidgets: WidgetDefinition[] = [
  makeStatCardWidget({
    id: "kpi.md.active-projects",
    title: "Active Mfg Projects",
    description: "Total active manufacturing engineering and industrialization projects.",
    category: "kpi",
    icon: Settings,
    queryKey: ["md", "active-projects"],
    extract: () => ({ value: 15, label: "Active Projects", statusText: "+2 this quarter", trend: { value: 15.4, positive: true } }),
  }),
  makeStatCardWidget({
    id: "kpi.md.in-pilot",
    title: "In Pilot Production",
    description: "Line trial runs and pilot production builds underway.",
    category: "kpi",
    icon: Repeat,
    queryKey: ["md", "in-pilot"],
    extract: () => ({ value: 5, label: "Pilot Builds", statusText: "Average yield 98.2%", trend: { value: 6.1, positive: true } }),
  }),
  makeStatCardWidget({
    id: "kpi.md.ready-ppap",
    title: "Ready for PPAP",
    description: "Process validation complete and ready for PPAP submission.",
    category: "kpi",
    icon: ShieldCheck,
    queryKey: ["md", "ready-ppap"],
    extract: () => ({ value: 3, label: "PPAP Packages", statusText: "Level 3 submission", trend: { value: 12.0, positive: true } }),
  }),
  makeStatCardWidget({
    id: "kpi.md.mass-production",
    title: "In Mass Production",
    description: "Full rate mass production lines operating under control plans.",
    category: "kpi",
    icon: Rocket,
    queryKey: ["md", "mass-production"],
    extract: () => ({ value: 28, label: "Full Rate Lines", statusText: "OEE 89.4%", trend: { value: 3.5, positive: true } }),
  }),
  makeStatCardWidget({
    id: "kpi.md.overall-readiness",
    title: "Overall Mfg Readiness",
    description: "Aggregate manufacturing readiness score across tooling, process, and quality.",
    category: "kpi",
    icon: Gauge,
    queryKey: ["md", "overall-readiness"],
    extract: () => ({ value: "92%", label: "MRL Rating", statusText: "Target MRL 8+", trend: { value: 1.8, positive: true } }),
  }),
];
