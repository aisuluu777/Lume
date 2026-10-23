import { cn } from "@/lib/cn";

interface StepIndicatorProps {
  steps: string[];
  current: number;
  canOpen: (step: number) => boolean;
  onSelect: (step: number) => void;
}

/** Прогресс записи: четыре последовательных шага. */
export function StepIndicator({ steps, current, canOpen, onSelect }: StepIndicatorProps) {
  return (
    <nav aria-label="Шаги записи">
      <ol className="grid grid-cols-4 gap-2 sm:gap-3">
        {steps.map((label, index) => {
          const step = index + 1;
          const state = step < current ? "done" : step === current ? "current" : "todo";
          const enabled = step !== current && canOpen(step);
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onSelect(step)}
                aria-current={state === "current" ? "step" : undefined}
                className="group flex w-full flex-col gap-2.5 text-left disabled:cursor-default"
              >
                <span
                  className={cn(
                    "h-1 rounded-full transition-colors",
                    state === "todo" ? "bg-line" : state === "current" ? "bg-ink" : "bg-mauve",
                  )}
                />
                <span className="flex items-baseline gap-2 text-sm">
                  <span className={cn("tabular", state === "current" ? "text-ink" : "text-smoke")}>{step}</span>
                  <span
                    className={cn(
                      "hidden sm:inline",
                      state === "current" ? "font-medium text-ink" : "text-smoke",
                      enabled && "group-hover:text-ink",
                    )}
                  >
                    {label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm sm:hidden">
        <span className="font-medium text-ink">{steps[current - 1]}</span>
        <span className="text-smoke">
          , шаг {current} из {steps.length}
        </span>
      </p>
    </nav>
  );
}
