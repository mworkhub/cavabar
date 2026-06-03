"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types/database";

interface Props {
  reviews: Review[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={0}
          fill={i < rating ? "#C68E58" : "#E5DDD5"}
        />
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-10 h-[22px] rounded-full transition-colors duration-150 flex-shrink-0
        ${checked ? "bg-emerald-500" : "bg-[#2C1E16]/20"}
        disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{ width: 40, height: 22 }}
    >
      <span
        className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150
          ${checked ? "translate-x-[20px]" : "translate-x-[3px]"}`}
      />
    </button>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReviewsManager({ reviews: initial }: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initial);
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  const approved  = reviews.filter((r) => r.approved).length;
  const pending   = reviews.filter((r) => !r.approved).length;

  async function handleToggle(review: Review) {
    setTogglingId(review.id);

    /* optimistic update */
    setReviews((prev) =>
      prev.map((r) => r.id === review.id ? { ...r, approved: !r.approved } : r)
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("reviews")
      .update({ approved: !review.approved })
      .eq("id", review.id);

    if (error) {
      /* revert on failure */
      setReviews((prev) =>
        prev.map((r) => r.id === review.id ? { ...r, approved: review.approved } : r)
      );
    }

    setTogglingId(null);
  }

  async function handleDelete(review: Review) {
    const ok = window.confirm(`Видалити відгук від "${review.author_name}"? Цю дію не можна скасувати.`);
    if (!ok) return;

    setDeletingId(review.id);
    const supabase = createClient();
    await supabase.from("reviews").delete().eq("id", review.id);
    setDeletingId(null);

    /* remove from local state + refresh server data */
    setReviews((prev) => prev.filter((r) => r.id !== review.id));
    router.refresh();
  }

  return (
    <>
      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#2C1E16]">Відгуки клієнтів</h1>
          <p className="text-[#2C1E16]/45 text-sm mt-0.5">
            Всього: {reviews.length} · Опубліковано: {approved} · На модерації: {pending}
          </p>
        </div>
      </div>

      {/* pending banner */}
      {pending > 0 && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200">
          <span className="text-amber-600 text-sm font-medium">
            {pending} {pending === 1 ? "відгук очікує" : "відгуки очікують"} модерації
          </span>
        </div>
      )}

      {/* table card */}
      <div className="bg-white rounded-2xl shadow-sm shadow-[#2C1E16]/6 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="py-20 text-center text-[#2C1E16]/35 text-sm">
            Відгуків ще немає.
          </div>
        ) : (
          <div className="divide-y divide-[#2C1E16]/6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors
                  ${!review.approved ? "bg-amber-50/50" : "hover:bg-[#FDFBF7]"}`}
              >
                {/* avatar */}
                <div className="w-9 h-9 rounded-xl bg-[#F2EAE0] flex items-center justify-center
                                text-[#C68E58] font-heading font-bold text-sm flex-shrink-0 mt-0.5">
                  {review.author_name.charAt(0).toUpperCase()}
                </div>

                {/* content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[#2C1E16]">
                      {review.author_name}
                    </span>
                    <Stars rating={review.rating} />
                    <span className="text-xs text-[#2C1E16]/35">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-[#4A3C31] mt-1.5 leading-relaxed line-clamp-3">
                    {review.text}
                  </p>
                  {review.reply && (
                    <div className="mt-2 pl-3 border-l-2 border-[#C68E58]/40">
                      <p className="text-xs text-[#2C1E16]/55 italic">{review.reply}</p>
                    </div>
                  )}
                </div>

                {/* actions */}
                <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${review.approved ? "text-emerald-600" : "text-amber-600"}`}>
                      {review.approved ? "Опубл." : "Очікує"}
                    </span>
                    <Toggle
                      checked={review.approved}
                      onChange={() => handleToggle(review)}
                      disabled={togglingId === review.id}
                    />
                  </div>
                  <button
                    onClick={() => handleDelete(review)}
                    disabled={deletingId === review.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center
                               text-[#2C1E16]/35 hover:text-red-600 hover:bg-red-50
                               transition-colors disabled:opacity-40"
                    aria-label="Видалити відгук"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
