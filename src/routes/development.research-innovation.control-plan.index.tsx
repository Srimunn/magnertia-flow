import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/control-plan/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/control-plan/new",
    });
  },
});
