import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/capacity-planning/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/capacity-planning/new",
    });
  },
});
