import { cn } from "@/lib/cn";
import { toMinutes } from "@/lib/schedule";

const PARTS = [
  { label: "Утро", from: 0, to: 12 * 60 },
  { label: "День", from: 12 * 60, to: 17 * 60 },
  { label: "Вечер", from: 17 * 60, to: 24 * 60 },
];

export function TimeSlots({
  slots,
  selected,
  onSelect,
}: {
  slots: string[];
  selected: string;
  onSelect: (time: string) => void;
}) {
  return (
    <div className="space-y-5" role="radiogroup" aria-label="Время визита">
      {PARTS.map((part) => {
        const items = slots.filter((slot) => toMinutes(slot) >= part.from && toMinutes(slot) < part.to);
        if (items.length === 0) return null;
        return (
          <div key={part.label} className="grid grid-cols-1 gap-3 sm:grid-cols-[4.5rem_1fr]">
            <p className="pt-2 text-sm text-smoke">{part.label}</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {items.map((slot) => {
                const active = slot === selected;
                return (
                  <button
                    key={slot}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onSelect(slot)}
                    className={cn(
                      "h-11 rounded-full border text-sm tabular transition-colors",
                      active ? "border-ink bg-ink text-porcelain" : "border-line bg-pearl text-ink hover:border-ink/40",
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
