/**
 * seed-badges.ts
 * Точково встановлює бейджі для обраних позицій меню.
 * Запуск: npx tsx scripts/seed-badges.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

interface Row { name: string; badges: string[] | null }

async function set(name: string, badges: string[]): Promise<void> {
  const { data, error } = await supabase
    .from("menu_items")
    .update({ badges })
    .eq("name", name)
    .select("name, badges")
    .returns<Row[]>();

  if (error) { console.error(`  ✗  "${name}": ${error.message}`); return; }
  if (!data?.length) { console.warn(`  ⚠   "${name}": не знайдено`); return; }
  data.forEach((r) => console.log(`  ✓  "${r.name}" → [${r.badges?.join(", ")}]`));
}

async function main(): Promise<void> {
  /* ── 1. Секція "Популярне" на головній ─── */
  console.log("\n── Головна: Популярне ──");
  await set("Капучино",             ["Хіт сезону"]);
  await set("Англійський сніданок", ["Популярне"]);
  await set("Грибний крем-суп",     ["Новинка"]);
  await set("Сирники з карамеллю",  ["Вибір гостей"]);

  /* ── 2. Інші позиції з різних категорій ─── */
  console.log("\n── Додаткові ──");
  await set("Чай манго-маракуйя",                    ["Освіжає"]);
  await set("Буржуйський бургер з телятиною та фрі", ["Хіт"]);
  await set("Салат з тунцем та авокадо",             ["Топ"]);
  await set("Чізкейк",                               ["Новинка"]);

  /* ── 3. Очищення старих стейл-бейджів ─── */
  console.log("\n── Очищення застарілих бейджів ──");
  // Капучино раніше мав ['Хіт'] з попереднього скрипту — вже перезаписано вище.
  // Для чистоти — обнуляємо те, що не потрапило в жоден новий список.
  const stale = ["Грибний крем-суп"]; // вже отримав Новинка через попередній run
  for (const name of stale) {
    const { data } = await supabase
      .from("menu_items")
      .select("name, badges")
      .eq("name", name)
      .returns<Row[]>();
    if (data?.[0]) {
      console.log(`  ℹ  "${data[0].name}" badges = [${data[0].badges?.join(", ")}] (уже оновлено вище)`);
    }
  }

  console.log("\n✅  Готово");
}

main().catch((err: unknown) => {
  console.error("❌  Критична помилка:", err);
  process.exit(1);
});
