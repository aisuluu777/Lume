import type { Metadata } from "next";
import { container } from "@/components/ui/styles";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  alternates: { canonical: "/privacy" },
};

/**
 * Шаблон политики. Перед запуском согласуйте текст с юристом
 * и укажите реквизиты вашей организации.
 */
export default function PrivacyPage() {
  const { legal, contacts } = siteConfig;

  return (
    <div className={cn(container, "py-12 lg:py-16")}>
      <article className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Политика обработки персональных данных</h1>
        <div className="mt-10 space-y-8 text-ink/85 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:text-ink">
          <section>
            <h2>1. Общие положения</h2>
            <p>
              Настоящая политика определяет порядок обработки персональных данных пользователей сайта клиники{" "}
              {siteConfig.name} (оператор — {legal.company}). Отправляя форму на сайте, пользователь соглашается с
              условиями этой политики.
            </p>
          </section>
          <section>
            <h2>2. Какие данные мы собираем</h2>
            <p>
              Имя, номер телефона, выбранная услуга, дата и время визита, комментарий к записи, а также текст отзыва,
              если пользователь его оставляет.
            </p>
          </section>
          <section>
            <h2>3. Цели обработки</h2>
            <p>
              Запись на приём, подтверждение и напоминание о визите, ответы на вопросы пользователя и публикация отзывов
              после модерации.
            </p>
          </section>
          <section>
            <h2>4. Хранение и защита</h2>
            <p>
              Данные хранятся на защищённых серверах и доступны только сотрудникам клиники, которым они нужны для
              работы. Мы не передаём данные третьим лицам, кроме случаев, предусмотренных законом.
            </p>
          </section>
          <section>
            <h2>5. Права пользователя</h2>
            <p>
              Пользователь может запросить уточнение, блокировку или удаление своих данных и отозвать согласие на их
              обработку, написав на {contacts.email} или позвонив по телефону {contacts.phone}.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
