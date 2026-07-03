import { createFileRoute } from "@tanstack/react-router";
import { Building, Receipt, DollarSign, Bell, Lock, ScrollText, Monitor } from "lucide-react";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Magnertia ERP" }] }),
  component: SettingsPage,
});

const SECTIONS = [
  {
    icon: Building,
    title: "Company Profile",
    desc: "Legal entity, branding, address and contact.",
  },
  { icon: Receipt, title: "Tax Settings", desc: "GST, TDS, HSN/SAC codes and tax rules." },
  {
    icon: DollarSign,
    title: "Currency Settings",
    desc: "Base currency, exchange rates and rounding.",
  },
  { icon: Bell, title: "Notifications", desc: "Email, SMS and in-app alert preferences." },
  { icon: Lock, title: "Security", desc: "MFA, password policy and IP allowlist." },
  { icon: Monitor, title: "Session Management", desc: "Active sessions and device approvals." },
  { icon: ScrollText, title: "Audit Logs", desc: "Complete activity trail across the platform." },
];

function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" description="Configure your Magnertia ERP workspace." />

      <div className="card-soft mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/20">
              <Building className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-xl font-bold">
                Magnertia EV Infrastructure Pvt Ltd
              </div>
              <div className="text-sm opacity-90">FY 2025-26 · INR · IST · Bengaluru, India</div>
            </div>
            <ErpButton
              variant="outline"
              className="bg-white/10 text-primary-foreground border-white/30 hover:bg-white/20"
            >
              Edit Profile
            </ErpButton>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              className="card-soft p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-display text-base font-semibold text-foreground">
                {s.title}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              <div className="mt-3 text-xs font-semibold text-primary">Configure →</div>
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}
