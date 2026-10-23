import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { container } from "../ui/styles";
import { Logo } from "./Logo";

const links = [
  { href: "/services", label: "Услуги и цены" },
  { href: "/booking", label: "Онлайн-запись" },
  { href: "/#about", label: "О клинике" },
  { href: "/#specialists", label: "Специалисты" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contacts", label: "Контакты" },
];

const YEAR = new Date().getFullYear();

export function Footer() {
  const { contacts, legal } = siteConfig;

  return (
    <footer className="border-t border-line bg-porcelain">
      <div className={cn(container, "grid grid-cols-1 gap-10 py-14 md:grid-cols-12")}>
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-smoke">{siteConfig.tagline}</p>
          <p className="mt-2 max-w-sm text-sm text-smoke">{legal.license}</p>
        </div>

        <nav aria-label="Разделы сайта" className="md:col-span-3">
          <h2 className="font-sans text-sm font-medium tracking-normal">Разделы</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-ink/75 transition-colors hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="font-sans text-sm font-medium tracking-normal">Контакты</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/75">
            <li>{contacts.address}</li>
            <li>
              <a href={`tel:${contacts.phoneHref}`} className="tabular transition-colors hover:text-ink">
                {contacts.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contacts.email}`} className="transition-colors hover:text-ink">
                {contacts.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className={cn(container, "py-8")}>
          <p className="font-display text-lg text-ink/80 sm:text-xl">
            Имеются противопоказания. Необходима консультация специалиста.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-smoke sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {YEAR} {legal.company}
            </span>
            <Link href="/privacy" className="transition-colors hover:text-ink">
              Политика обработки персональных данных
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
