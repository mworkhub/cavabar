/**
 * seed-menu.ts
 * Парсить меню з cava-bar.com та імпортує дані у Supabase.
 *
 * Стратегія:
 *  1. cheerio → menu.html → назви категорій + порядок
 *  2. vm.runInContext → menu_list.js → JavaScript-масиви з позиціями
 *  3. @supabase/supabase-js (service role) → upsert у menu_categories + menu_items
 *
 * Запуск: npx tsx scripts/seed-menu.ts
 */

import vm from "vm";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// Завантажуємо .env.local
config({ path: resolve(process.cwd(), ".env.local") });

/* ─── константи ──────────────────────────────────────────── */

const BASE = "https://www.cava-bar.com";

/**
 * Відповідність між HTML id секції та назвою JS-масиву у menu_list.js
 * Порядок тут є «ground truth» для sort_order категорій.
 */
const SECTION_ID_TO_ARRAY: Record<string, string> = {
  coffee:            "coffeeMenu",
  tea:               "teaMenu",
  coffee_cold_drink: "coldDrinksMenu",
  cold_drink:        "coldDrinks",
  breakfast:         "breakfastMenu",
  first_meal:        "firstMealMenu",
  cheesecake:        "cheesecakeMenu",
  pasta:             "pastaMenu",
  salads:            "saladMenu",
  burger:            "burgerMenu",
  pita:              "pitaMenu",
  bruschetta:        "bruschettaMenu",
  waffles:           "waffleMenu",
  dessert:           "dessertMenu",
};

/* ─── типи ───────────────────────────────────────────────── */

interface RawItem {
  name:         string;
  price:        string;
  img:          string;
  description?: string;
  weight?:      string;
}

/* ─── допоміжні функції ──────────────────────────────────── */

/** Парсимо ціну типу "260 грн" або "105  грн" у число */
function parsePrice(raw: string): number {
  const m = raw.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

/**
 * Нормалізуємо відносні шляхи до зображень.
 * У JS-файлі є як ./images/... так і ../images/... — обидва
 * вказують на https://www.cava-bar.com/images/...
 * Також є україномовні назви файлів (кавун.webp) — кодуємо лише non-ASCII.
 */
function resolveImageUrl(img: string): string {
  if (!img) return "";
  if (img.startsWith("http")) return img;

  const m = img.match(/images\/(.+)$/);
  if (!m) return "";

  // Percent-encode тільки не-ASCII символи (кириличні назви файлів)
  const encoded = m[1].replace(/[^\x00-\x7F]/g, (c) => encodeURIComponent(c));
  return `${BASE}/images/${encoded}`;
}

/**
 * Генеруємо slug для menu_items:
 * categorySlug-N (гарантовано унікальний у межах категорії)
 */
function makeItemSlug(categorySlug: string, index: number): string {
  return `${categorySlug}-${String(index).padStart(3, "0")}`;
}

/** Slug для категорії: coffee_cold_drink → coffee-cold-drink */
function makeCategorySlug(htmlId: string): string {
  return htmlId.replace(/_/g, "-");
}

/* ─── main ───────────────────────────────────────────────── */

async function main(): Promise<void> {
  /* ── 0. Валідація env ─────────────────────────────────── */
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Відсутні змінні оточення NEXT_PUBLIC_SUPABASE_URL або " +
      "SUPABASE_SERVICE_ROLE_KEY у файлі .env.local"
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  /* ── 1. Fetch + cheerio: категорії з HTML ─────────────── */
  console.log("🌐  Завантажую menu.html...");
  const html = await fetch(`${BASE}/menu.html`).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} при завантаженні menu.html`);
    return r.text();
  });

  const $ = cheerio.load(html);

  // Знаходимо всі секції меню, які мають id і відомий масив даних
  const htmlCategories: Array<{ htmlId: string; name: string }> = [];

  $(".box_menu_title[id]").each((_, el) => {
    const htmlId = $(el).attr("id") ?? "";
    const name   = $(el).find(".section_menu_title").text().trim();
    if (htmlId && name && SECTION_ID_TO_ARRAY[htmlId]) {
      htmlCategories.push({ htmlId, name });
    }
  });

  if (htmlCategories.length === 0) {
    throw new Error("cheerio не знайшов жодної категорії — можливо, структура HTML змінилась");
  }
  console.log(`   Знайдено ${htmlCategories.length} категорій`);
  htmlCategories.forEach(({ htmlId, name }) =>
    console.log(`   · [${htmlId.padEnd(20)}] ${name}`)
  );

  /* ── 2. Fetch + vm: дані позицій з JS ─────────────────── */
  console.log("\n📜  Завантажую menu_list.js...");
  const jsText = await fetch(`${BASE}/js/menu_list.js`).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} при завантаженні menu_list.js`);
    return r.text();
  });

  /**
   * Відрізаємо все після першого рядка DOM-коду (`let isOpen = true`).
   * Залишаємо лише визначення масивів — вони є чистими JS-літералами.
   */
  // const у vm.runInContext не потрапляє в sandbox — замінюємо на var
  const arrayDefsOnly = jsText
    .split("\nlet isOpen")[0]
    .replace(/\bconst\b/g, "var");

  const sandbox: Record<string, unknown> = {
    // Мокаємо document, бо масив `mains` викликає getElementById
    document: { getElementById: () => ({ innerHTML: "" }) },
  };
  vm.createContext(sandbox);
  vm.runInContext(arrayDefsOnly, sandbox);

  // Перевіряємо, що дані завантажились
  const loadedArrays = Object.keys(SECTION_ID_TO_ARRAY).map(
    (id) => SECTION_ID_TO_ARRAY[id]
  );
  const missingArrays = loadedArrays.filter((key) => !Array.isArray(sandbox[key]));
  if (missingArrays.length > 0) {
    console.warn(`   ⚠  Не знайдено JS-масивів: ${missingArrays.join(", ")}`);
  }

  /* ── 3. Upsert категорій ──────────────────────────────── */
  console.log("\n📂  Записую категорії в Supabase...");

  const categoryRows = htmlCategories.map(({ htmlId, name }, i) => ({
    slug:       makeCategorySlug(htmlId),
    name,
    sort_order: i,
    is_active:  true,
  }));

  const { data: insertedCats, error: catErr } = await supabase
    .from("menu_categories")
    .upsert(categoryRows, { onConflict: "slug" })
    .select("id, slug");

  if (catErr) {
    throw new Error(`Supabase menu_categories: ${catErr.message}`);
  }

  const catIdBySlug: Record<string, string> = Object.fromEntries(
    (insertedCats ?? []).map((c) => [c.slug, c.id])
  );
  console.log(`   ✓ ${insertedCats?.length ?? 0} категорій збережено`);

  /* ── 4. Upsert позицій ────────────────────────────────── */
  console.log("\n🍽   Записую позиції меню...\n");

  let totalItems = 0;
  let totalErrors = 0;

  for (const { htmlId, name } of htmlCategories) {
    const arrayKey   = SECTION_ID_TO_ARRAY[htmlId];
    const rawItems   = (sandbox[arrayKey] ?? []) as RawItem[];
    const catSlug    = makeCategorySlug(htmlId);
    const categoryId = catIdBySlug[catSlug];

    if (!categoryId) {
      console.error(`  ✗ Не знайдено ID категорії для "${name}" (slug: ${catSlug})`);
      totalErrors++;
      continue;
    }

    if (rawItems.length === 0) {
      console.warn(`  ⚠  ${name}: масив порожній`);
      continue;
    }

    const itemRows = rawItems.map((item, i) => ({
      slug:        makeItemSlug(catSlug, i),
      category_id: categoryId,
      name:        item.name.trim(),
      description: item.description?.trim() ?? null,
      weight:      item.weight?.trim()       ?? null,
      price:       parsePrice(item.price),
      image_url:   resolveImageUrl(item.img),
      is_active:   true,
      sort_order:  i,
    }));

    const { error } = await supabase
      .from("menu_items")
      .upsert(itemRows, { onConflict: "slug" });

    if (error) {
      console.error(`  ✗ ${name}: ${error.message}`);
      totalErrors++;
    } else {
      const label = name.padEnd(32);
      console.log(`  ✓ ${label} ${rawItems.length} позицій`);
      totalItems += rawItems.length;
    }
  }

  /* ── 5. Підсумок ──────────────────────────────────────── */
  const status = totalErrors === 0 ? "✅ Успішно" : "⚠  З помилками";
  console.log(`
┌─────────────────────────────────────┐
│  ${status.padEnd(35)}│
├─────────────────────────────────────┤
│  Категорій записано : ${String(htmlCategories.length).padEnd(14)} │
│  Позицій записано   : ${String(totalItems).padEnd(14)} │
│  Помилок            : ${String(totalErrors).padEnd(14)} │
└─────────────────────────────────────┘`);

  if (totalErrors > 0) process.exit(1);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("\n❌ Критична помилка:", msg);
  process.exit(1);
});
