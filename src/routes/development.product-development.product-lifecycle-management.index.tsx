import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/product-development/product-lifecycle-management/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/development/research-innovation/product-lifecycle-management/new" }); }, [navigate]);
    return null;
  },
});
