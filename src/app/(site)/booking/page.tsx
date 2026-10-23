import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { container } from "@/components/ui/styles";
import { getService, getSpecialist } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Онлайн-запись",
  description: "Запишитесь на процедуру онлайн: выберите услугу, специалиста и удобное время.",
  alternates: { canonical: "/booking" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BookingPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const service = typeof params.service === "string" && getService(params.service) ? params.service : null;
  const specialist =
    typeof params.specialist === "string" && getSpecialist(params.specialist) ? params.specialist : null;

  return (
    <div className={cn(container, "py-10 lg:py-14")}>
      <h1 className="text-4xl sm:text-5xl">Онлайн-запись</h1>
      <p className="mt-4 max-w-2xl text-lg text-smoke">
        Выберите процедуру, специалиста и удобное время. Администратор перезвонит, чтобы подтвердить запись.
      </p>
      <div className="mt-10">
        <BookingWizard key={`${service}:${specialist}`} initialService={service} initialSpecialist={specialist} />
      </div>
    </div>
  );
}
