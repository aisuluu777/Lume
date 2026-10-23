import { Cpu, Gem, ShieldCheck, Stethoscope } from "lucide-react";
import { cn } from "@/lib/cn";
import { container } from "../ui/styles";

const advantages = [
  {
    icon: Stethoscope,
    title: "Сертифицированные врачи",
    text: "Инъекции и лазер проводят только врачи с медицинским образованием и действующими сертификатами.",
  },
  {
    icon: Gem,
    title: "Премиальная косметика",
    text: "Оригинальные препараты от официальных дистрибьюторов. Упаковку вскрываем при вас.",
  },
  {
    icon: ShieldCheck,
    title: "Стерильность",
    text: "Одноразовые расходники, автоклав и обработка кабинета после каждого пациента.",
  },
  {
    icon: Cpu,
    title: "Новейшее оборудование",
    text: "Аппараты последнего поколения с регистрационными удостоверениями: HIFU, RF и диодный лазер.",
  },
];

export function Advantages() {
  return (
    <section aria-labelledby="advantages-title" className="border-y border-line bg-pearl">
      <div className={cn(container, "grid grid-cols-1 gap-12 py-16 lg:grid-cols-12 lg:gap-10 lg:py-24")}>
        <div className="lg:col-span-4">
          <h2 id="advantages-title" className="text-3xl sm:text-4xl">
            Медицина, а не салон
          </h2>
          <p className="mt-5 max-w-sm text-smoke">
            Клиника работает по медицинской лицензии. Каждую процедуру начинаем с осмотра и честного разговора о том,
            что вам действительно нужно.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:col-span-8">
          {advantages.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-5">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-lilac text-lilac-deep">
                <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl">{title}</h3>
                <p className="mt-2 text-smoke">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
