/** Pings our own /api/revalidate route (same-origin, so cookies ride along automatically) after
 * an admin edit that affects public pages the ISR cache won't otherwise refresh for up to an hour. */
export async function triggerRevalidate(paths: string[]): Promise<void> {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
  } catch {
    // Best-effort: a failed ping shouldn't surface as a user-facing error — the page still
    // refreshes naturally once its normal revalidate window elapses.
  }
}
