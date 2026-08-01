import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/assembly-line-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/assembly-line-development/new",
    });
  },
});
