import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/manufacturing-development/mass-production-readiness/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/manufacturing-development/mass-production-readiness" }); }, [navigate]);
    return null;
  },
});
