import { categories, concerns, services } from "@/data/services";
import { specialists } from "@/data/specialists";
import type { Category, CategoryId, Service, Specialist } from "./types";

export { categories, concerns, services, specialists };

export function getService(slug: string | null | undefined): Service | undefined {
  if (!slug) return undefined;
  return services.find((service) => service.slug === slug);
}

export function getCategory(id: CategoryId): Category {
  const category = categories.find((item) => item.id === id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && categories.some((category) => category.id === value);
}

export function getSpecialist(id: string | null | undefined): Specialist | undefined {
  if (!id) return undefined;
  return specialists.find((specialist) => specialist.id === id);
}

/** Специалисты, к которым можно записаться на услугу. */
export function specialistsForService(service: Service): Specialist[] {
  if (service.specialistIds?.length) {
    return specialists.filter((specialist) => service.specialistIds?.includes(specialist.id));
  }
  return specialists.filter((specialist) => specialist.categories.includes(service.category));
}

/** Кандидаты на запись: конкретный специалист или все подходящие («любой»). */
export function resolveCandidates(service: Service, specialistId: string): Specialist[] | null {
  const eligible = specialistsForService(service);
  if (specialistId === "any") return eligible;
  const chosen = eligible.find((specialist) => specialist.id === specialistId);
  return chosen ? [chosen] : null;
}

export function servicesForCategory(id: CategoryId): Service[] {
  return services.filter((service) => service.category === id);
}

export function popularServices(): Service[] {
  return services.filter((service) => service.popular);
}

export function relatedServices(service: Service, limit = 3): Service[] {
  return services.filter((item) => item.category === service.category && item.slug !== service.slug).slice(0, limit);
}

export function servicesForSpecialist(specialist: Specialist): Service[] {
  return services.filter((service) => specialistsForService(service).some((item) => item.id === specialist.id));
}
