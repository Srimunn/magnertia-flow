import { memo, type ReactNode } from "react";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/erp/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { WidgetCategory, WidgetContentProps, WidgetDefinition, WidgetRole } from "../../types";

/* ===========================================================================
   KPI widget factory
   ---------------------------------------------------------------------------
   Most widgets in the system are a single KPI: fetch one aggregate, read one
   field, render the existing StatCard. This factory turns each of those into a
   one-line registry entry instead of a bespoke component, which is what keeps
   ~30 KPI widgets maintainable — and what lets new modules (Inventory, Fleet,
   Charging) register KPIs without touching the widget core.
   =========================================================================== */

/** The subset of StatCard props a KPI widget derives from its data. */
export type StatCardShape = {
  value: string;
  delta?: React.ComponentProps<typeof StatCard>["delta"];
  neutralText?: string;
  captionTone?: React.ComponentProps<typeof StatCard>["captionTone"];
  /** Optional per-value icon overrides (e.g. Trial Balance flips red/green). */
  iconBg?: string;
  iconColor?: string;
};

type MakeStatCardWidgetArgs<TData, TKey extends readonly unknown[]> = {
  id: string;
  title: string;
  description: string;
  category?: WidgetCategory;
  tags?: WidgetCategory[];
  icon: LucideIcon;
  keywords?: string[];
  roles?: WidgetRole[] | "all";
  sourceRoute?: string;
  /** Keep out of the Widget Library browser (still placeable via quick-add). */
  libraryHidden?: boolean;
  /** Base icon treatment; `map` may override per value. */
  iconBg: string;
  iconColor: string;
  /** Query options factory for the widget's data source. */
  options: () => UseQueryOptions<TData, Error, TData, TKey>;
  /** Derive the card's display props from the fetched data. */
  map: (data: TData) => StatCardShape;
};

export function makeStatCardWidget<TData, TKey extends readonly unknown[]>({
  id,
  title,
  description,
  category = "kpi",
  tags,
  icon,
  keywords = [],
  roles = "all",
  sourceRoute,
  libraryHidden,
  iconBg,
  iconColor,
  options,
  map,
}: MakeStatCardWidgetArgs<TData, TKey>): WidgetDefinition {
  const Icon = icon;

  const Content = memo(function StatCardWidgetContent({ instance }: WidgetContentProps) {
    const { data, isLoading, isError } = useQuery(options());

    if (isLoading || (!data && !isError)) {
      return <Skeleton className="h-[104px] rounded-xl" />;
    }

    const shape: StatCardShape = isError || !data ? { value: "—" } : map(data);

    return (
      <StatCard
        label={instance.customTitle ?? title}
        value={shape.value}
        delta={shape.delta}
        neutralText={shape.neutralText}
        captionTone={shape.captionTone}
        iconBg={shape.iconBg ?? iconBg}
        iconColor={shape.iconColor ?? iconColor}
        icon={<Icon className="h-5 w-5" />}
      />
    );
  });

  const dataKey = options().queryKey;

  return {
    id,
    title,
    description,
    category,
    tags,
    icon,
    keywords: [...keywords, "kpi", "metric", "stat"],
    defaultSize: "sm",
    allowedSizes: ["sm", "md", "lg"],
    roles,
    sourceRoute,
    libraryHidden,
    dataKey,
    component: Content,
  };
}

/** Shared wrapper so non-KPI widgets get identical loading behavior. */
export function WidgetLoading({ height = 240 }: { height?: number }): ReactNode {
  return <Skeleton style={{ height }} className="rounded-xl" />;
}
