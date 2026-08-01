import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/quality-planning-apqp/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/quality-planning-apqp/new",
    });
  },
});
