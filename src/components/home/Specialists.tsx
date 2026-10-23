import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { specialists } from "@/lib/catalog";
import { formatExperience } from "@/lib/format";
import { SpecialistMonogram } from "../ui/SpecialistMonogram";
import { CategoryBadge } from "../ui/CategoryBadge";
import { container } from "../ui/styles";

export function Specialists() {
  return (
    <section
      id="specialists"
      aria-labelledby="specialists-title"
      className="scroll-mt-20 border-y border-line bg-pearl py-16 lg:scroll-mt-24 lg:py-24"
    >
      <div className={container}>
        <div className="max-w-2xl">
          <h2 id="specialists-title" className="text-3xl sm:text-4xl">
            Специалисты
          </h2>
          <p className="mt-4 text-smoke">
            Врачи и косметологи с медицинским образованием. Можно записаться к конкретному специалисту или выбрать
            ближайшее свободное время.
          </p>
        </div>

        <ul className="scrollbar-none -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
          {specialists.map((specialist) => (
            <li
              key={specialist.id}
              className="relative flex w-[78%] shrink-0 snap-start flex-col rounded-panel border border-line bg-porcelain/50 p-6 sm:w-auto xl:p-5"
            >
              <SpecialistMonogram specialist={specialist} size="lg" />
              <h3 className="mt-6 text-xl xl:text-lg">{specialist.name}</h3>
              <p className="mt-1 text-sm text-smoke">{specialist.role}</p>
              <p className="mt-3 text-sm text-ink/80">Стаж {formatExperience(specialist.experience)}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {specialist.categories.map((category) => (
                  <CategoryBadge key={category} category={category} className="px-2.5 py-0.5 text-xs" />
                ))}
              </div>
              <Link
                href={`/booking?specialist=${specialist.id}`}
                className="mt-auto inline-flex items-center gap-1.5 self-start pt-6 text-sm font-medium text-ink hover:text-mauve"
              >
                <span>
                  Записаться<span className="sr-only">: {specialist.name}</span>
                </span>
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
