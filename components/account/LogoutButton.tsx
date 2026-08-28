"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutCustomer } from "@/lib/customer-auth";
import { useInvalidateCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await logoutCustomer();
    invalidateCurrentUser();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" disabled={loading} onClick={handleLogout}>
      {loading ? "Saliendo..." : "Cerrar sesión"}
    </Button>
  );
}
