import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { popularServices } from "@/lib/catalog";
import { ServiceCard } from "../services/ServiceCard";
import { buttonClass, container } from "../ui/styles";

export function PopularServices() {
  const items = popularServices();

  return (
    <section id="services" aria-labelledby="popular-title" className="scroll-mt-20 py-16 lg:scroll-mt-24 lg:py-28">
      <div className={container}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="popular-title" className="text-3xl sm:text-4xl">
              Популярные процедуры
            </h2>
            <p className="mt-4 max-w-xl text-smoke">
              С них чаще всего начинают знакомство с клиникой. Точную стоимость врач назовёт после осмотра.
            </p>
          </div>
          <Link href="/services" className={buttonClass("secondary", "md", "self-start sm:self-auto")}>
            Все услуги и цены
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
