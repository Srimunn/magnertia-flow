import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/development/research-innovation/electronics-design/",
)({
  component: ElectronicsDesignIndexPage,
});

function ElectronicsDesignIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/development/research-innovation/electronics-design/new" as any });
  }, [navigate]);

  return (
    <div className="p-8 text-center text-muted-foreground">
      Redirecting to Electronics Design Form...
    </div>
  );
}
