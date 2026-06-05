import { z } from "zod";

/* ── reusable fields ─────────────────────────────────────── */

const name = z
  .string()
  .min(2, "Ім'я занадто коротке (мін. 2 символи)")
  .max(80, "Ім'я занадто довге (макс. 80 символів)")
  .regex(/^[a-zA-ZА-ЯҐЄІЇа-яґєії'\- ]+$/, "Ім'я може містити лише літери, пробіл та дефіс");

const phone = z
  .string()
  .min(7, "Телефон занадто короткий")
  .max(20, "Телефон занадто довгий")
  .regex(/^\+?[\d\s\-().]{7,20}$/, "Введіть коректний номер телефону");

const message = z
  .string()
  .min(5, "Повідомлення занадто коротке (мін. 5 символів)")
  .max(1000, "Повідомлення занадто довге (макс. 1000 символів)");

/* ── public forms ────────────────────────────────────────── */

export const contactSchema = z.object({
  name,
  phone,
  message,
});
export type ContactData = z.infer<typeof contactSchema>;

export const reviewSchema = z.object({
  author_name: z
    .string()
    .min(2, "Ім'я занадто коротке")
    .max(80, "Ім'я занадто довге"),
  rating: z
    .number()
    .int("Оцінка має бути цілим числом")
    .min(1, "Мінімальна оцінка — 1")
    .max(5, "Максимальна оцінка — 5"),
  text: z
    .string()
    .min(5, "Відгук занадто короткий (мін. 5 символів)")
    .max(2000, "Відгук занадто довгий (макс. 2000 символів)"),
});
export type ReviewData = z.infer<typeof reviewSchema>;

export const jobApplicationSchema = z.object({
  name,
  phone,
  position: z
    .string()
    .min(2, "Оберіть посаду")
    .max(100, "Назва посади занадто довга"),
  about: z
    .string()
    .max(800, "Текст занадто довгий (макс. 800 символів)")
    .optional()
    .transform((v) => v?.trim() || undefined),
});
export type JobApplicationData = z.infer<typeof jobApplicationSchema>;

/* ── admin: menu item ────────────────────────────────────── */

export const menuItemSchema = z.object({
  name: z
    .string()
    .min(1, "Введіть назву страви")
    .max(120, "Назва занадто довга"),
  slug: z
    .string()
    .max(120, "Slug занадто довгий")
    .regex(/^[a-z0-9\-А-ЯҐЄІЇа-яґєіїЁёЪъЫыЭэ]*$/, "Slug містить недопустимі символи")
    .optional()
    .or(z.literal("")),
  description: z.string().max(500, "Опис занадто довгий").optional().or(z.literal("")),
  price: z
    .number()
    .positive("Ціна має бути більше 0")
    .max(9999, "Ціна занадто велика")
    .finite("Некоректне значення ціни"),
  weight: z.string().max(40, "Вага занадто довга").optional().or(z.literal("")),
  category_id: z.string().uuid("Оберіть категорію"),
  sort_order: z
    .number()
    .int()
    .min(0, "Порядок не може бути від'ємним")
    .max(9999, "Порядок занадто великий"),
});
export type MenuItemData = z.infer<typeof menuItemSchema>;

/* ── file upload ─────────────────────────────────────────── */

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg", "image/jpg", "image/png",
  "image/webp", "image/heic", "image/heif",
];
const MAX_FILE_SIZE_MB  = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Файл занадто великий (макс. ${MAX_FILE_SIZE_MB} МБ). Ваш файл: ${(file.size / 1024 / 1024).toFixed(1)} МБ`;
  }
  const isHeicByName = /\.(heic|heif)$/i.test(file.name);
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !isHeicByName) {
    return `Дозволені формати: JPEG, PNG, WebP, HEIC. Ваш файл: ${file.type || "невідомий тип"}`;
  }
  return null;
}

/* ── admin: settings ─────────────────────────────────────── */

const optionalUrl = z
  .string()
  .max(500)
  .refine(
    (v) => !v || v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/"),
    "Введіть коректний URL (починається з https://)"
  )
  .optional()
  .or(z.literal(""));

export const settingsSchema = z.object({
  phone:               z.string().max(20).optional().or(z.literal("")),
  address:             z.string().max(200).optional().or(z.literal("")),
  instagram_url:       optionalUrl,
  contacts_image_url:  optionalUrl,
  working_hours:       z.string().max(100).optional().or(z.literal("")),
  google_analytics_id: z
    .string()
    .max(20)
    .regex(/^(G-[A-Z0-9]+|UA-\d+-\d+|)?$/, "Формат: G-XXXXXXXX або порожнє")
    .optional()
    .or(z.literal("")),
  meta_pixel_id: z
    .string()
    .max(20)
    .regex(/^\d*$/, "Pixel ID — лише цифри")
    .optional()
    .or(z.literal("")),
});
export type SettingsData = z.infer<typeof settingsSchema>;
