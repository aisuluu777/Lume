import type { Metadata } from "next";
import { About } from "@/components/home/About";
import { Advantages } from "@/components/home/Advantages";
import { Contacts } from "@/components/home/Contacts";
import { Hero } from "@/components/home/Hero";
import { PopularServices } from "@/components/home/PopularServices";
import { Reviews } from "@/components/home/Reviews";
import { Specialists } from "@/components/home/Specialists";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Структурированные данные для поисковиков (карточка организации). */
function clinicJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contacts.phoneHref,
    email: siteConfig.contacts.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contacts.address,
      addressCountry: "RU",
    },
    geo: { "@type": "GeoCoordinates", latitude: siteConfig.map.lat, longitude: siteConfig.map.lng },
    openingHoursSpecification: Object.entries(siteConfig.hours)
      .filter(([, hours]) => hours)
      .map(([day, hours]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_NAMES[Number(day)],
        opens: hours?.open,
        closes: hours?.close,
      })),
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Advantages />
      <PopularServices />
      <About />
      <Specialists />
      <Reviews />
      <Contacts />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicJsonLd()).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
