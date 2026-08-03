import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/smart-factory-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/smart-factory-development/new",
    });
  },
});
