import { Mail, MapPin, MessageCircle, Navigation, Phone, Send } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { buttonClass, container } from "../ui/styles";
import { CopyAddress, OpenStatus, WorkingHours } from "./ContactsLive";

function mapEmbedUrl(): string {
  const { lat, lng, embedUrl } = siteConfig.map;
  if (embedUrl) return embedUrl;
  const bbox = [lng - 0.012, lat - 0.006, lng + 0.012, lat + 0.006].map((value) => value.toFixed(5)).join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function Contacts() {
  const { contacts, map } = siteConfig;

  return (
    <section
      id="contacts"
      aria-labelledby="contacts-title"
      className="scroll-mt-20 border-t border-line bg-pearl py-16 lg:scroll-mt-24 lg:py-24"
    >
      <div className={cn(container, "grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12")}>
        <div className="lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="contacts-title" className="text-3xl sm:text-4xl">
              Контакты
            </h2>
            <OpenStatus />
          </div>

          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-mauve" aria-hidden="true" />
              <div>
                <p className="text-lg text-ink">{contacts.address}</p>
                <p className="mt-1 text-sm text-smoke">{contacts.addressNote}</p>
                <div className="-ml-2.5 mt-2">
                  <CopyAddress />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0 text-mauve" aria-hidden="true" />
              <div>
                <a href={`tel:${contacts.phoneHref}`} className="tabular text-lg text-ink hover:text-mauve">
                  {contacts.phone}
                </a>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`https://wa.me/${contacts.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass("secondary", "sm")}
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    WhatsApp
                  </a>
                  <a
                    href={`https://t.me/${contacts.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass("secondary", "sm")}
                  >
                    <Send className="size-4" aria-hidden="true" />
                    Telegram
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Mail className="mt-1 size-5 shrink-0 text-mauve" aria-hidden="true" />
              <a href={`mailto:${contacts.email}`} className="text-lg text-ink hover:text-mauve">
                {contacts.email}
              </a>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="font-sans text-sm font-medium tracking-normal">Часы работы</h3>
            <div className="mt-2">
              <WorkingHours />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://yandex.ru/maps/?rtext=~${map.lat},${map.lng}&rtt=auto`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("primary", "md")}
            >
              <Navigation className="size-4" aria-hidden="true" />
              Маршрут в Яндекс Картах
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${map.lat},${map.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("secondary", "md")}
            >
              Google Maps
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative h-[360px] overflow-hidden rounded-panel border border-line bg-lilac sm:h-[440px] lg:h-full lg:min-h-[520px]">
            <iframe
              title={`Карта: ${contacts.address}`}
              src={mapEmbedUrl()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0 [filter:saturate(0.55)_contrast(0.95)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
