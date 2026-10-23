"use client";

import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "../layout/Logo";
import { container } from "../ui/styles";
import { BookingsPanel } from "./BookingsPanel";
import { ReviewsPanel } from "./ReviewsPanel";

type Tab = "bookings" | "reviews";

export function AdminShell({ devPassword }: { devPassword: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("bookings");

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-porcelain">
      <header className="border-b border-line bg-pearl">
        <div className={cn(container, "flex h-16 items-center justify-between gap-4")}>
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="На сайт">
              <Logo />
            </Link>
            <span className="hidden text-sm text-smoke sm:inline">Админ-панель</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-ink/80 hover:bg-ink/5 hover:text-ink"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Открыть сайт</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-ink/80 hover:bg-ink/5 hover:text-ink"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className={cn(container, "py-8")}>
        {devPassword && (
          <p className="mb-6 rounded-2xl bg-lilac px-4 py-3 text-sm text-lilac-deep">
            Используется пароль разработки «admin». Перед публикацией задайте переменную ADMIN_PASSWORD.
          </p>
        )}

        <div role="tablist" aria-label="Разделы админ-панели" className="flex gap-6 border-b border-line">
          {(
            [
              ["bookings", "Заявки на запись"],
              ["reviews", "Отзывы"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={cn(
                "-mb-px border-b-2 pb-3 text-base transition-colors",
                tab === id ? "border-ink text-ink" : "border-transparent text-smoke hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-6">
          {tab === "bookings" ? <BookingsPanel /> : <ReviewsPanel />}
        </div>
      </main>
    </div>
  );
}
