import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * On-demand ISR invalidation, called from admin mutation UI right after a save succeeds
 * (product images, variant price/stock) — bridges the gap between the long revalidate window
 * on /producto/[slug] (3600s, tuned for public SEO traffic) and an admin expecting to see their
 * edit reflected immediately.
 *
 * Authenticated by re-checking the caller's session against the backend (same check the
 * /admin layout guard uses), not a client-embedded secret — anything shipped in a "use client"
 * bundle is visible in devtools, so it can't actually gate access on its own.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const meRes = await fetch(`${API_URL}/auth/me`, { headers: { Cookie: cookieHeader }, cache: "no-store" });
  if (!meRes.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { user } = (await meRes.json()) as { user: { role: string } | null };
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { paths } = (await req.json()) as { paths?: string[] };
  for (const path of paths ?? []) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true });
}
