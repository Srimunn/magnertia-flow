import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/manufacturing-development/production-engineering/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/development/research-innovation/production-engineering/new" }); }, [navigate]);
    return null;
  },
});
