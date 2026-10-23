import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { Photo } from "../ui/Photo";
import { container } from "../ui/styles";

const principles = [
  {
    title: "Сначала диагностика",
    text: "Осматриваем кожу и обсуждаем образ жизни, прежде чем что-то предлагать.",
  },
  {
    title: "План вместо разовых визитов",
    text: "Расписываем процедуры по месяцам и заранее называем бюджет курса.",
  },
  {
    title: "Сопровождение после процедуры",
    text: "Врач остаётся на связи в мессенджере и приглашает на бесплатный контрольный осмотр.",
  },
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20 py-16 lg:scroll-mt-24 lg:py-28">
      <div className={cn(container, "grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16")}>
        <Photo
          src={siteConfig.images.about}
          alt="Врач-косметолог проводит процедуру пилинга"
          sizes="(min-width: 1024px) 420px, 100vw"
          className="relative aspect-[4/5] w-full max-w-[18rem] rounded-[999px] sm:max-w-md lg:col-span-5"
        />

        <div className="lg:col-span-7">
          <h2 id="about-title" className="max-w-2xl text-3xl sm:text-4xl">
            Подчеркнуть черты лица, а не изменить их
          </h2>
          <p className="mt-6 max-w-xl text-lg text-smoke">
            {siteConfig.name} — клиника эстетической косметологии с медицинской лицензией. Мы верим в естественный
            результат. Иногда лучший план — это меньше процедур, чем вы ожидали, и мы скажем об этом прямо.
          </p>

          <dl className="mt-10 max-w-2xl divide-y divide-line border-y border-line">
            {principles.map((item) => (
              <div key={item.title} className="grid grid-cols-1 gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-8">
                <dt className="font-medium text-ink">{item.title}</dt>
                <dd className="text-smoke">{item.text}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-sm text-smoke">{siteConfig.legal.license}</p>
        </div>
      </div>
    </section>
  );
}
