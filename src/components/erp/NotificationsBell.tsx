import { useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, TrendingUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ===========================================================================
   NotificationsBell — bell icon + popover shown ONLY on the main dashboard.
   The AppShell topbar no longer carries a global bell; each page opts in by
   placing this in its `topbarActions` slot. Data is a local demo list until a
   system-wide notifications service exists.
   =========================================================================== */

type Tone = "info" | "warning" | "success" | "primary";
type Notification = {
  id: string;
  title: string;
  body: string;
  when: string;
  tone: Tone;
  read: boolean;
};

const ICONS: Record<Tone, typeof Bell> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  primary: TrendingUp,
};
const TONE_CLASSES: Record<Tone, string> = {
  info: "bg-[#3B82F6]/10 text-[#3B82F6]",
  warning: "bg-[#F59E0B]/10 text-[#F59E0B]",
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
};

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "3 invoices pending approval",
    body: "Accounts Payable has 3 vendor invoices awaiting your review.",
    when: "12 min ago",
    tone: "warning",
    read: false,
  },
  {
    id: "n2",
    title: "GSTR-3B filing due",
    body: "Monthly GSTR-3B filing is due in 5 days.",
    when: "2 hr ago",
    tone: "info",
    read: false,
  },
  {
    id: "n3",
    title: "Bank reconciliation complete",
    body: "October bank statement reconciled with 0 unmatched entries.",
    when: "Yesterday",
    tone: "success",
    read: false,
  },
  {
    id: "n4",
    title: "Revenue up 12.6% vs. PY",
    body: "Q3 revenue closed at ₹2.46Cr — 12.6% above prior year.",
    when: "2 days ago",
    tone: "primary",
    read: true,
  },
];

export function NotificationsBell() {
  const [items, setItems] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((xs) => xs.map((n) => ({ ...n, read: true })));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
          className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted/50 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span
              className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background"
              aria-hidden
            >
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0" sideOffset={6}>
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div>
            <div className="text-sm font-bold text-foreground">Notifications</div>
            <div className="text-[11px] text-muted-foreground">
              {unread === 0 ? "You're all caught up" : `${unread} unread`}
            </div>
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <ul className="max-h-[360px] overflow-y-auto">
          {items.length === 0 ? (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">No notifications.</li>
          ) : (
            items.map((n) => {
              const Icon = ICONS[n.tone];
              return (
                <li
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 border-b border-border/60 px-3 py-2.5 last:border-b-0",
                    !n.read && "bg-primary/[0.03]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full",
                      TONE_CLASSES[n.tone],
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{n.title}</span>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{n.body}</p>
                    <span className="text-[10px] text-muted-foreground/70">{n.when}</span>
                  </div>
                </li>
              );
            })
          )}
        </ul>
        <div className="border-t border-border px-3 py-2 text-right">
          <button
            type="button"
            className="text-[11px] font-semibold text-primary hover:underline"
            onClick={() => {
              /* placeholder: hook up to full notifications page when it exists */
            }}
          >
            View all →
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
