import { Cable, Gauge, Info, MousePointerClick, Puzzle, Weight, type LucideIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Maps common attribute keys (from ProductVariant.attributes — free-form JSON, so keys vary by
// product) to a friendly label + icon. Matched by substring on a normalized key, so "pollingRate",
// "polling_rate" and "Polling Rate" all resolve the same way regardless of how it was entered.
const SPEC_MATCHERS: { test: string; label: string; icon: LucideIcon }[] = [
  { test: "connection", label: "Tipo de Conexión", icon: Cable },
  { test: "conexion", label: "Tipo de Conexión", icon: Cable },
  { test: "switch", label: "Switch", icon: MousePointerClick },
  { test: "pollingrate", label: "Polling Rate", icon: Gauge },
  { test: "sensor", label: "Sensor", icon: Gauge },
  { test: "weight", label: "Peso", icon: Weight },
  { test: "peso", label: "Peso", icon: Weight },
  { test: "compatib", label: "Compatibilidad", icon: Puzzle },
];

function resolveSpec(key: string): { label: string; icon: LucideIcon } {
  const normalized = key.toLowerCase().replace(/[_\s-]/g, "");
  const match = SPEC_MATCHERS.find((m) => normalized.includes(m.test));
  if (match) return { label: match.label, icon: match.icon };
  // Fallback: turn "color" -> "Color", "cableLength" -> "cableLength" (best-effort, still readable).
  const label = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .trim();
  return { label: label.charAt(0).toUpperCase() + label.slice(1), icon: Info };
}

export function ProductSpecs({ attributes }: { attributes: Record<string, unknown> }) {
  const entries = Object.entries(attributes).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
  if (entries.length === 0) return null;

  return (
    <Accordion type="single" collapsible defaultValue="specs" className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 backdrop-blur-md">
      <AccordionItem value="specs">
        <AccordionTrigger>Especificaciones Técnicas</AccordionTrigger>
        <AccordionContent>
          <ul className="flex flex-col gap-3">
            {entries.map(([key, value]) => {
              const { label, icon: Icon } = resolveSpec(key);
              return (
                <li key={key} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                    <Icon className="h-4 w-4 text-yellow-400" strokeWidth={1.75} />
                  </span>
                  <div>
                    <div className="text-xs text-zinc-500">{label}</div>
                    <div className="font-medium text-zinc-100">{String(value)}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
