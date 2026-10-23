"use client";

import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { buttonClass, container } from "../ui/styles";
import { Logo } from "./Logo";

const navigation = [
  { href: "/services", label: "Услуги и цены" },
  { href: "/#about", label: "О клинике" },
  { href: "/#specialists", label: "Специалисты" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contacts", label: "Контакты" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  // Меню рендерится рядом с <header>, а не внутри: backdrop-filter шапки
  // создаёт новый контейнер для position: fixed и «сплющил» бы панель.
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-porcelain/85 backdrop-blur-md">
        <div className={cn(container, "flex h-16 items-center justify-between gap-6 lg:h-20")}>
          <Link href="/" onClick={close} aria-label={`${siteConfig.name} — на главную`} className="rounded-lg">
            <Logo />
          </Link>

          <nav aria-label="Основное меню" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navigation.map((item) => {
                const active = item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-sm transition-colors hover:bg-ink/5 hover:text-ink",
                        active ? "text-ink" : "text-ink/75",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${siteConfig.contacts.phoneHref}`}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-ink/80 transition-colors hover:text-ink xl:inline-flex"
            >
              <Phone className="size-4" aria-hidden="true" />
              <span className="tabular">{siteConfig.contacts.phone}</span>
            </a>
            <Link href="/booking" className={buttonClass("primary", "sm", "hidden sm:inline-flex")}>
              Записаться
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-pearl text-ink lg:hidden"
            >
              {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-16 z-30 flex animate-fade-in flex-col overflow-y-auto bg-porcelain lg:hidden"
        >
          <nav aria-label="Мобильное меню" className={cn(container, "flex-1 py-6")}>
            <ul className="divide-y divide-line border-y border-line">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} className="block py-4 font-display text-2xl text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-3">
              <Link href="/booking" onClick={close} className={buttonClass("primary", "lg", "w-full")}>
                Записаться онлайн
              </Link>
              <a href={`tel:${siteConfig.contacts.phoneHref}`} className={buttonClass("secondary", "lg", "w-full")}>
                <Phone className="size-4" aria-hidden="true" />
                {siteConfig.contacts.phone}
              </a>
            </div>
            <p className="mt-8 text-sm text-smoke">{siteConfig.contacts.address}</p>
          </nav>
        </div>
      )}
    </>
  );
}
