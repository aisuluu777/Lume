import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCatalog } from "@/components/services/ServiceCatalog";
import { container } from "@/components/ui/styles";
import { getService, isCategoryId } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Услуги и цены",
  description:
    "Цены на инъекционные, аппаратные, лазерные и уходовые процедуры. Описание эффекта, показания, противопоказания и онлайн-запись.",
  alternates: { canonical: "/services" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ServicesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = typeof params.category === "string" && isCategoryId(params.category) ? params.category : "all";
  const service = typeof params.service === "string" && getService(params.service) ? params.service : null;

  return (
    <div className={cn(container, "py-12 lg:py-16")}>
      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Услуги и цены</h1>
        <p className="mt-5 text-lg text-smoke">
          Нажмите на процедуру, чтобы узнать эффект, показания и противопоказания. Если сомневаетесь в выборе,{" "}
          <Link
            href="/booking?service=consultation"
            className="text-ink underline decoration-mauve/40 underline-offset-4 hover:decoration-mauve"
          >
            запишитесь на бесплатную консультацию
          </Link>
          .
        </p>
      </header>

      <div className="mt-10">
        <ServiceCatalog initialCategory={category} initialService={service} />
      </div>

      <p className="mt-10 max-w-3xl text-sm text-smoke">
        Цены указаны в рублях и не являются публичной офертой. Итоговая стоимость зависит от объёма работы и
        определяется врачом после осмотра.
      </p>
    </div>
  );
}
