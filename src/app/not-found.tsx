import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { buttonClass } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-porcelain px-5 py-12">
      <div className="max-w-md">
        <Link href="/" aria-label="На главную">
          <Logo />
        </Link>
        <h1 className="mt-10 text-4xl">Страница не найдена</h1>
        <p className="mt-4 text-lg text-smoke">
          Возможно, ссылка устарела. Посмотрите каталог процедур или запишитесь на консультацию.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/services" className={buttonClass("primary", "lg")}>
            Услуги и цены
          </Link>
          <Link href="/" className={buttonClass("secondary", "lg")}>
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
