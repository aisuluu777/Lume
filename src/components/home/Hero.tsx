import { Gift } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { Photo } from "../ui/Photo";
import { buttonClass, container } from "../ui/styles";
import { ConcernPicker } from "./ConcernPicker";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className={cn(
          container,
          "grid grid-cols-1 gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-24 lg:pt-16",
        )}
      >
        <div className="animate-fade-up lg:col-span-6">
          <p className="text-smoke">{siteConfig.tagline}</p>
          <h1 className="mt-5 text-4xl sm:text-5xl">Кожа, которой не нужен фильтр</h1>
          <p className="mt-6 max-w-lg text-lg text-smoke">
            Врачи-дерматологи, сертифицированные препараты и аппараты последнего поколения. Подбираем процедуры под вашу
            кожу, а не под прайс.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/booking" className={buttonClass("primary", "lg")}>
              Записаться онлайн
            </Link>
            <Link href="/services" className={buttonClass("secondary", "lg")}>
              Услуги и цены
            </Link>
          </div>
          <p className="mt-9 flex max-w-md items-start gap-3 text-sm text-ink/80">
            <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-lilac text-lilac-deep">
              <Gift className="size-4" aria-hidden="true" />
            </span>
            <span className="pt-1.5">Первая консультация врача-косметолога бесплатна при записи через сайт</span>
          </p>
        </div>

        <div className="relative lg:col-span-6">
          {/* Капсула с фото — отсылка к ампуле; на мобильных её заменяет сам подборщик */}
          <Photo
            src={siteConfig.images.hero}
            alt="Косметолог наносит маску на лицо пациентки"
            sizes="330px"
            eager
            className="absolute right-0 top-0 hidden h-[560px] w-[300px] rounded-full lg:block xl:w-[330px]"
          />
          <div className="relative animate-fade-in lg:mr-[110px] lg:mt-24 xl:mr-[120px]">
            <ConcernPicker />
          </div>
        </div>
      </div>
    </section>
  );
}
