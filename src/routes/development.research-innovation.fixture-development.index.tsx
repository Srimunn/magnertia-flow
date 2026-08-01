import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/fixture-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/fixture-development/new",
    });
  },
});
