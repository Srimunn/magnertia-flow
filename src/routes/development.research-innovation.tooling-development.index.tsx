import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/tooling-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/tooling-development/new",
    });
  },
});
