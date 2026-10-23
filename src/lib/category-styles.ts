import type { CategoryId } from "./types";

/**
 * Цвет на сайте всегда обозначает категорию процедур. Классы перечислены
 * целиком (без сборки строк), чтобы Tailwind их нашёл при сборке.
 */
export const categoryStyles: Record<
  CategoryId,
  { panel: string; dot: string; text: string; chip: string; monogram: string }
> = {
  injection: {
    panel: "bg-powder",
    dot: "bg-powder-deep",
    text: "text-powder-deep",
    chip: "bg-powder text-powder-deep",
    monogram: "bg-powder text-powder-deep",
  },
  hardware: {
    panel: "bg-lilac",
    dot: "bg-lilac-deep",
    text: "text-lilac-deep",
    chip: "bg-lilac text-lilac-deep",
    monogram: "bg-lilac text-lilac-deep",
  },
  care: {
    panel: "bg-aloe",
    dot: "bg-aloe-deep",
    text: "text-aloe-deep",
    chip: "bg-aloe text-aloe-deep",
    monogram: "bg-aloe text-aloe-deep",
  },
  laser: {
    panel: "bg-ice",
    dot: "bg-ice-deep",
    text: "text-ice-deep",
    chip: "bg-ice text-ice-deep",
    monogram: "bg-ice text-ice-deep",
  },
};
