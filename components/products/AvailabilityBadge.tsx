import { cn } from "@/lib/utils";

export function AvailabilityBadge({ inStock }: { inStock: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md",
        inStock
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/30 bg-red-500/10 text-red-400",
      )}
    >
      <span className="relative flex h-2 w-2">
        {inStock && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", inStock ? "bg-emerald-500" : "bg-red-500")} />
      </span>
      {inStock ? "En stock" : "Agotado"}
    </span>
  );
}
