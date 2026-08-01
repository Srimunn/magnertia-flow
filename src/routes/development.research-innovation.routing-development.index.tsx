import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/routing-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/routing-development/new",
    });
  },
});
