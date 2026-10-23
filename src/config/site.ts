/**
 * Все данные клиники в одном месте: название, контакты, часы работы,
 * адрес на карте и настройки онлайн-записи. Замените значения на свои —
 * они используются на всём сайте, в SEO-метаданных и в расписании записи.
 */

export type WorkingHours = { open: string; close: string } | null;

export const siteConfig = {
  name: "Lumé",
  tagline: "Клиника эстетической косметологии",
  description:
    "Клиника эстетической косметологии: инъекционные, аппаратные и лазерные процедуры, профессиональный уход за кожей. Врачи-дерматологи, сертифицированные препараты, онлайн-запись.",
  /** Адрес сайта для SEO. На Vercel и Render определяется автоматически. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:3000",

  contacts: {
    phone: "+7 (900) 000-00-00",
    phoneHref: "+79000000000",
    email: "hello@lume-clinic.ru",
    address: "Москва, ул. Примерная, 12",
    addressNote: "Вход со двора, 2 этаж. Бесплатная парковка для пациентов",
    whatsapp: "79000000000", // номер без «+» для ссылки wa.me
    telegram: "lume_clinic", // имя пользователя без «@»
  },

  /** Координаты точки на карте (OpenStreetMap). */
  map: {
    lat: 55.7539,
    lng: 37.6208,
    /**
     * Можно вставить ссылку на iframe из конструктора Яндекс Карт
     * или Google Maps — тогда она заменит карту OpenStreetMap.
     */
    embedUrl: "",
  },

  /**
   * Фотографии (Unsplash License). Замените на свои: положите файлы
   * в public/images и укажите путь, например "/images/hero.jpg".
   */
  images: {
    hero: "https://images.unsplash.com/photo-1761718209835-c8586b7dcac0?auto=format&fit=crop&w=1200&q=80",
    about: "https://images.unsplash.com/photo-1713085085470-fba013d67e65?auto=format&fit=crop&w=1200&q=80",
  },

  /** Часовой пояс клиники — по нему считаются свободные слоты. */
  timezone: "Europe/Moscow",
  currency: "₽",

  /** Часы работы по дням недели: 0 — воскресенье, 6 — суббота. */
  hours: {
    0: { open: "10:00", close: "19:00" },
    1: { open: "09:00", close: "21:00" },
    2: { open: "09:00", close: "21:00" },
    3: { open: "09:00", close: "21:00" },
    4: { open: "09:00", close: "21:00" },
    5: { open: "09:00", close: "21:00" },
    6: { open: "10:00", close: "20:00" },
  } satisfies Record<number, WorkingHours> as Record<number, WorkingHours>,

  booking: {
    /** На сколько дней вперёд открыта запись. */
    windowDays: 30,
    /** Шаг сетки времени, минут. */
    slotStepMinutes: 30,
    /** Минимальный запас до начала процедуры при записи на сегодня, минут. */
    minLeadMinutes: 60,
  },

  legal: {
    company: "ООО «Люме»",
    license: "Лицензия на медицинскую деятельность № Л041-00000-77/00000000",
  },
} as const;

export type SiteConfig = typeof siteConfig;
