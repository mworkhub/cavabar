import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { MenuClient } from "@/components/menu/MenuClient";
import { TopOfDay } from "@/components/menu/TopOfDay";
import type { MenuCategory, MenuItem } from "@/types/database";

export const metadata: Metadata = {
  title: "Меню — Cava Bar",
  description: "Меню кав'ярні Cava Bar у м. Броди. Кава, чай, десерти, сніданки.",
};

export default async function MenuPage() {
  const supabase = await createClient();

  const [{ data: categories, error: catError }, { data: items, error: itemError }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

  if (catError || itemError) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-heading text-xl text-[#2C1E16] mb-2">
            Не вдалося завантажити меню
          </p>
          <p className="text-[#2C1E16]/45 text-sm">Спробуйте оновити сторінку</p>
        </div>
      </main>
    );
  }

  const cats   = (categories ?? []) as MenuCategory[];
  const items_ = (items      ?? []) as MenuItem[];

  /* pick a random "top of day" from badged items */
  const badged = items_.filter((i) => i.badges && i.badges.length > 0);
  const topItem: MenuItem | null =
    badged.length > 0 ? badged[Math.floor(Math.random() * badged.length)] : null;

  return (
    <main>
      {/* ════ Page header (sticky, h-14 = 56px) ════ */}
      <header className="sticky top-0 z-50 h-14 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-[#2C1E16]/6 flex items-center">
        <div className="max-w-5xl mx-auto w-full px-4 flex items-center gap-3">
          <Link
            href="/"
            aria-label="На головну"
            className="p-1.5 -ml-1.5 rounded-lg text-[#2C1E16]/50 hover:text-[#2C1E16] hover:bg-[#2C1E16]/5 transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </Link>
          <span className="font-heading text-xl font-semibold text-[#2C1E16] tracking-wide">
            Cava Bar
          </span>
          <span className="ml-auto text-xs text-[#2C1E16]/35 font-medium">
            м. Броди
          </span>
        </div>
      </header>

      {/* ════ Title block ════ */}
      <div className="max-w-5xl mx-auto px-4 pt-7 pb-2">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#2C1E16]">
          Меню
        </h1>
        {cats.length === 0 && (
          <p className="text-[#2C1E16]/45 text-sm mt-2">
            Меню поки порожнє — заходьте пізніше
          </p>
        )}
      </div>

      {/* ════ Top of Day ════ */}
      {topItem && (
        <div className="max-w-5xl mx-auto pt-3 px-4">
          <TopOfDay item={topItem} />
        </div>
      )}

      {/* ════ Interactive section (client) ════ */}
      {cats.length > 0 && (
        <MenuClient categories={cats} items={items_} />
      )}
    </main>
  );
}
