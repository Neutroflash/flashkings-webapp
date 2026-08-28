import { Badge } from "@/components/ui/badge";

export function AvailabilityBadge({ inStock }: { inStock: boolean }) {
  return (
    <Badge variant={inStock ? "success" : "destructive"}>
      {inStock ? "En stock" : "Agotado"}
    </Badge>
  );
}
