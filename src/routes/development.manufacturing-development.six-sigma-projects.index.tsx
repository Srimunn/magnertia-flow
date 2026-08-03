import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/manufacturing-development/six-sigma-projects/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/manufacturing-development/six-sigma-projects" }); }, [navigate]);
    return null;
  },
});
