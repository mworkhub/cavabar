import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { VacanciesClient } from "./VacanciesClient";
import type { Vacancy } from "@/types/database";

export const metadata: Metadata = {
  title: "Вакансії — Cava Bar",
  description: "Приєднуйся до команди Cava Bar у Бродах. Відкриті вакансії: бариста, офіціант, кухар.",
};

export default async function VacanciesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vacancies")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const vacancies = (data ?? []) as Vacancy[];

  return (
    <main className="px-6 py-12 max-w-6xl mx-auto lg:py-16">

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B4C3B]
                   hover:text-[#C68E58] transition-colors mb-8"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        На головну
      </Link>

      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-3">
          Робота у Cava Bar
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#2C1E16] leading-tight mb-4">
          Приєднуйся до команди
        </h1>
        <p className="text-[#2C1E16] text-base leading-relaxed">
          Cava Bar — це місце, де цінують людей. Ми шукаємо тих, хто любить каву,
          поважає гостей і хоче рости разом із нами. Якщо ти енергійний,
          відповідальний і відкритий до нового — ми чекаємо на тебе.
        </p>
      </div>

      <VacanciesClient vacancies={vacancies} />

    </main>
  );
}
