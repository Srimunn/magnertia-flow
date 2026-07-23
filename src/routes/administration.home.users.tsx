import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { AdminHomeTabBar } from "@/components/erp/AdminHomeTabBar";
import { ErpButton } from "@/components/erp/Button";
import { FilterSelect } from "@/components/erp/FilterButton";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable } from "@/components/erp/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { userService, departmentService, roleService } from "@/services";
import type { UserRecord, NewUserInput, LoginHistoryEntry } from "@/services/types";

export const Route = createFileRoute("/administration/home/users")({
  head: () => ({ meta: [{ title: "Users · Magnertia ERP" }] }),
  component: UsersPage,
});

const STATUS_OPTIONS: { label: string; value: "All Statuses" | UserRecord["status"] }[] = [
  { label: "All Statuses", value: "All Statuses" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "Locked", value: "Locked" },
];

function UsersPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]["value"]>("All Statuses");

  const usersQuery = useQuery({
    queryKey: ["administration", "users"],
    queryFn: () => userService.fetchUsers(),
  });
  const loginHistoryQuery = useQuery({
    queryKey: ["administration", "login-history"],
    queryFn: () => userService.fetchLoginHistory(),
  });
  const departmentsQuery = useQuery({
    queryKey: ["administration", "departments"],
    queryFn: () => departmentService.fetchDepartments(),
  });
  const rolesQuery = useQuery({
    queryKey: ["administration", "roles"],
    queryFn: () => roleService.fetchRoles(),
  });

  const defaultInput = (): NewUserInput => ({
    name: "",
    email: "",
    department: departmentsQuery.data?.[0]?.name ?? "",
    role: rolesQuery.data?.[0]?.name ?? "",
  });
  const [newUserInput, setNewUserInput] = useState<NewUserInput>(defaultInput());

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: (newUser) => {
      toast.success(`User created: ${newUser.name}`);
      setCreateOpen(false);
      setNewUserInput(defaultInput());
      queryClient.invalidateQueries({ queryKey: ["administration"] });
    },
    onError: () => toast.error("Failed to create user."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserInput.name || !newUserInput.email) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createMutation.mutate(newUserInput);
  };

  const filteredUsers = useMemo(() => {
    return (usersQuery.data ?? []).filter((u) => {
      const matchesStatus = statusFilter === "All Statuses" || u.status === statusFilter;
      const matchesSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [usersQuery.data, statusFilter, search]);

  return (
    <AppShell
      title="Home"
      breadcrumb="Administration"
      description="Manage user accounts, roles, and login activity."
      tabs={<AdminHomeTabBar />}
      topbarActions={
        <ErpButton onClick={() => setCreateOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New User</span>
        </ErpButton>
      }
    >
      {usersQuery.isLoading ? (
        <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2.5 card-soft p-3.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <FilterSelect
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(val) => setStatusFilter(val as (typeof STATUS_OPTIONS)[number]["value"])}
            />
          </div>

          <div className="card-soft overflow-hidden">
            <DataTable<UserRecord>
              data={filteredUsers}
              columns={[
                {
                  key: "name",
                  header: "User",
                  cell: (r) => (
                    <div>
                      <span className="font-semibold text-foreground block">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.email}</span>
                    </div>
                  ),
                },
                {
                  key: "department",
                  header: "Department",
                  cell: (r) => <span className="text-muted-foreground">{r.department}</span>,
                },
                {
                  key: "role",
                  header: "Role",
                  cell: (r) => <span className="text-foreground">{r.role}</span>,
                },
                {
                  key: "lastLogin",
                  header: "Last Login",
                  cell: (r) => <span className="text-xs text-muted-foreground">{r.lastLogin}</span>,
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={r.status} />,
                },
              ]}
              mobileCard={(r) => (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.department} • {r.role}
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              )}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-base text-foreground">Login History</h3>
            <div className="card-soft overflow-hidden">
              <DataTable<LoginHistoryEntry>
                data={loginHistoryQuery.data ?? []}
                columns={[
                  {
                    key: "user",
                    header: "User",
                    cell: (r) => <span className="font-semibold text-foreground">{r.user}</span>,
                  },
                  {
                    key: "timestamp",
                    header: "Timestamp",
                    cell: (r) => (
                      <span className="text-xs text-muted-foreground">{r.timestamp}</span>
                    ),
                  },
                  {
                    key: "ipAddress",
                    header: "IP Address",
                    cell: (r) => (
                      <span className="font-mono text-xs text-muted-foreground">{r.ipAddress}</span>
                    ),
                  },
                  {
                    key: "device",
                    header: "Device",
                    cell: (r) => <span className="text-muted-foreground">{r.device}</span>,
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (r) => <StatusBadge status={r.status} />,
                  },
                ]}
                mobileCard={(r) => (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{r.user}</div>
                      <div className="text-xs text-muted-foreground">{r.timestamp}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user and assign them a department and role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavya Iyer"
                  value={newUserInput.name}
                  onChange={(e) => setNewUserInput((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kavya.iyer@magnertia.com"
                  value={newUserInput.email}
                  onChange={(e) => setNewUserInput((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Department *
                  </label>
                  <select
                    value={newUserInput.department}
                    onChange={(e) =>
                      setNewUserInput((prev) => ({ ...prev, department: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    {(departmentsQuery.data ?? []).map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Role *
                  </label>
                  <select
                    value={newUserInput.role}
                    onChange={(e) => setNewUserInput((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    {(rolesQuery.data ?? []).map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={createMutation.isPending}>
                Create User
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
