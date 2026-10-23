import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceDetails } from "@/components/services/ServiceDetails";
import { SpecialistMonogram } from "@/components/ui/SpecialistMonogram";
import { buttonClass, container } from "@/components/ui/styles";
import { getService, relatedServices, services, specialistsForService } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatDuration, formatPrice, formatPriceWithUnit } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.name,
    description:
      `${service.short}. ${formatPrice(service)}, ${formatDuration(service.duration)}. ${service.description}`.slice(
        0,
        300,
      ),
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: { params: Params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const specialists = specialistsForService(service);
  const related = relatedServices(service);

  return (
    <div className={cn(container, "py-10 lg:py-14")}>
      <nav aria-label="Навигационная цепочка">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-smoke">
          <li>
            <Link href="/" className="hover:text-ink">
              Главная
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <Link href="/services" className="hover:text-ink">
              Услуги и цены
            </Link>
          </li>
          <li aria-current="page" className="flex items-center gap-1.5 text-ink">
            <ChevronRight className="size-3.5 text-smoke" aria-hidden="true" />
            {service.name}
          </li>
        </ol>
      </nav>

      <h1 className="mt-8 max-w-3xl text-4xl sm:text-5xl">{service.name}</h1>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="rounded-panel border border-line bg-pearl p-6 sm:p-10 lg:col-span-8">
          <ServiceDetails service={service} showTitle={false} />
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-panel border border-line bg-pearl p-6 lg:sticky lg:top-28">
            <p className="text-2xl font-medium tabular">{formatPriceWithUnit(service)}</p>
            <p className="mt-1 text-smoke">{formatDuration(service.duration)}</p>
            <Link href={`/booking?service=${service.slug}`} className={buttonClass("primary", "lg", "mt-6 w-full")}>
              Записаться онлайн
            </Link>

            <h2 className="mt-8 font-sans text-sm font-medium tracking-normal">Проводят</h2>
            <ul className="mt-3 space-y-3">
              {specialists.map((specialist) => (
                <li key={specialist.id}>
                  <Link
                    href={`/booking?service=${service.slug}&specialist=${specialist.id}`}
                    className="group flex items-center gap-3"
                  >
                    <SpecialistMonogram specialist={specialist} size="sm" />
                    <span className="min-w-0">
                      <span className="block text-ink group-hover:text-mauve">{specialist.name}</span>
                      <span className="block text-sm text-smoke">{specialist.role}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-16 lg:mt-24">
          <h2 id="related-title" className="text-3xl">
            Похожие процедуры
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ServiceCard key={item.slug} service={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
