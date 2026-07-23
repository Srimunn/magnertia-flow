import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "destructive";
type Size = "xs" | "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
  ghost: "text-foreground hover:bg-secondary",
  outline: "border border-input bg-background text-foreground hover:bg-secondary",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  // Alias for "danger" — some pages use the shadcn-conventional name instead.
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};
const SIZES: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs",
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export const ErpButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }
>(function ErpButton(
  { className, variant = "primary", size = "md", loading = false, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />}
      {children}
    </button>
  );
});
