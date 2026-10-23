import { z } from "zod";

/** Общие схемы валидации — используются и в формах, и в API. */

const NAME_RE = new RegExp("^[\\p{L}][\\p{L}\\s'’.-]*$", "u");
const PHONE_CHARS_RE = /^[+\d\s()-]+$/;

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Введите имя — минимум 2 буквы")
  .max(60, "Имя слишком длинное")
  .regex(NAME_RE, "Имя может содержать только буквы");

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Укажите телефон")
  .regex(PHONE_CHARS_RE, "Используйте цифры, пробелы, скобки и дефис")
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 10 && digits <= 15;
  }, "Проверьте номер: нужно от 10 до 15 цифр");

export const bookingSchema = z.object({
  serviceSlug: z.string().min(1, "Выберите услугу"),
  specialistId: z.string().min(1, "Выберите специалиста"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Выберите дату"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Выберите время"),
  name: nameSchema,
  phone: phoneSchema,
  comment: z.string().trim().max(500, "Комментарий — не больше 500 символов").optional(),
  consent: z.boolean().refine((value) => value === true, "Подтвердите согласие на обработку данных"),
  /** Скрытое поле-ловушка для ботов: люди его не видят и не заполняют. */
  website: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const reviewSchema = z.object({
  name: nameSchema,
  rating: z.number().int().min(1, "Поставьте оценку").max(5),
  text: z.string().trim().min(10, "Напишите хотя бы пару предложений").max(1000, "Отзыв — не больше 1000 символов"),
  serviceSlug: z.string().optional(),
  website: z.string().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const bookingStatusSchema = z.object({ status: z.enum(["new", "confirmed", "completed", "cancelled"]) });
export const reviewStatusSchema = z.object({ status: z.enum(["pending", "approved", "hidden"]) });

export const loginSchema = z.object({ password: z.string().min(1, "Введите пароль").max(200) });

/** Ошибки валидации в формате { поле: первое сообщение }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) result[key] = issue.message;
  }
  return result;
}
