import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/types/database";
import { ReviewsClient } from "@/components/reviews/ReviewsClient";

export const metadata: Metadata = {
  title: "Відгуки — Cava Bar | Кав'ярня в Бродах",
  description:
    "Відгуки гостей кав'ярні Cava Bar у м. Броди. Поділіться своїми враженнями про відвідування.",
};

export default async function ReviewsPage() {
  const supabase = await createClient();

  // Завантажуємо лише ТІЛЬКИ схвалені відгуки (approved = true)
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  const initialReviews = (data ?? []) as Review[];

  return (
    <main className="max-w-5xl mx-auto px-6 pb-24">

      {/* Кнопка "Назад" */}
      <div className="pt-6 pb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B4C3B] hover:text-[#C68E58] transition-colors"
        >
          <ArrowLeft size={15} strokeWidth={1.75} />
          На головну
        </Link>
      </div>

      {/* Наш новий компонент із дизайном і формою */}
      <ReviewsClient initialReviews={initialReviews} />

    </main>
  );
}