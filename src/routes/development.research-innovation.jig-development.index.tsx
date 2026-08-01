import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/jig-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/jig-development/new",
    });
  },
});
