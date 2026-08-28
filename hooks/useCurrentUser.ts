import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/customer-auth";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

/** Shared across Navbar, checkout, and /cuenta — one fetch to /auth/me, cached via TanStack Query. */
export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
  });
}

/** Call after login/register/logout/profile updates so every consumer of useCurrentUser re-renders. */
export function useInvalidateCurrentUser() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
}
