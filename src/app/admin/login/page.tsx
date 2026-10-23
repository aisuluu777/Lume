import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/layout/Logo";
import { SESSION_COOKIE, getAdminPassword, usesDevPassword, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Вход в админ-панель",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  if (verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)) redirect("/admin");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-porcelain px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" aria-label="На сайт">
          <Logo />
        </Link>
        <div className="mt-8 rounded-panel border border-line bg-pearl p-6 sm:p-8">
          <h1 className="text-2xl">Вход в админ-панель</h1>
          <p className="mt-2 text-sm text-smoke">Заявки на запись и отзывы пациентов.</p>
          <div className="mt-6">
            <LoginForm disabled={!getAdminPassword()} devHint={usesDevPassword()} />
          </div>
        </div>
      </div>
    </div>
  );
}
