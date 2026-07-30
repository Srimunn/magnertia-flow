import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/api-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/api-development/new",
    });
  },
});
