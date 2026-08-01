import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/process-validation/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/process-validation/new",
    });
  },
});
