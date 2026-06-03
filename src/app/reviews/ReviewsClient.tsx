"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types/database";

/* ─── helpers ────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function pluralReviews(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "відгук";
  if (n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)) return "відгуки";
  return "відгуків";
}

/* ─── static star display ────────────────────────────────── */

function StarDisplay({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} strokeWidth={0} fill={n <= rating ? "#C68E58" : "#E8DDD3"} />
      ))}
    </div>
  );
}

/* ─── interactive star picker ────────────────────────────── */

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Оцінка ${n}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform duration-100 hover:scale-110 active:scale-95"
        >
          <Star size={30} strokeWidth={1.5} stroke="#C68E58" fill={active >= n ? "#C68E58" : "none"} />
        </button>
      ))}
    </div>
  );
}

/* ─── single review card ─────────────────────────────────── */

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E8DDD3] flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-[15px] font-semibold text-[#2C1E16]">
            {review.author_name}
          </p>
          <p className="text-[11px] text-[#2C1E16]/55 mt-0.5">
            {formatDate(review.created_at)}
          </p>
        </div>
        <StarDisplay rating={review.rating} />
      </div>
      <p className="text-[#2C1E16]/80 text-sm leading-relaxed">{review.text}</p>
      {review.reply && (
        <div className="pt-3 pl-4 border-l-2 border-[#C68E58]/30">
          <p className="text-xs font-semibold text-[#C68E58] mb-1">Відповідь Cava Bar</p>
          <p className="text-[#2C1E16]/75 text-xs leading-relaxed">{review.reply}</p>
        </div>
      )}
    </article>
  );
}

/* ─── main client component ──────────────────────────────── */

export function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const reviews = initialReviews;

  /* ── modal state ── */
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [isModalFading, setIsModalFading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /* ── form state ── */
  const [name,   setName]   = useState("");
  const [rating, setRating] = useState(0);
  const [text,   setText]   = useState("");

  type SubmitStatus = "idle" | "loading" | "error";
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMsg,     setErrorMsg]     = useState("");

  /* ── rating stats ── */
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  /* ── open / close modal ── */
  function openModal() {
    setIsModalOpen(true);
    setIsModalFading(false);
    setSubmitSuccess(false);
  }

  const closeModal = useCallback(() => {
    setIsModalFading(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsModalFading(false);
      setSubmitSuccess(false);
      setName(""); setRating(0); setText("");
      setSubmitStatus("idle"); setErrorMsg("");
    }, 280);
  }, []);

  /* ── body scroll lock while modal is open ── */
  useEffect(() => {
    if (!isModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isModalOpen]);

  /* ── Escape key ── */
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal]);

  /* ── submit ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim())           { setErrorMsg("Введіть ваше ім'я"); return; }
    if (rating === 0)           { setErrorMsg("Оберіть оцінку від 1 до 5 зірочок"); return; }
    if (text.trim().length < 5) { setErrorMsg("Напишіть трохи більше у вашому відгуку"); return; }

    setSubmitStatus("loading");

    const sb = createClient();
    const { error } = await sb
      .from("reviews")
      .insert({ author_name: name.trim(), rating, text: text.trim() });

    if (error) {
      setSubmitStatus("error");
      setErrorMsg("Не вдалося зберегти відгук. Перевірте з'єднання та спробуйте ще раз.");
      return;
    }

    setSubmitStatus("idle");
    setSubmitSuccess(true);
  }

  /* ════════════════════════════════════════ RENDER ════════ */

  return (
    <>
      {/* ── two-column layout ── */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-14">

        {/* ════════ LEFT SIDEBAR ════════ */}
        <aside className="lg:col-span-1 mb-12 lg:mb-0">
          <div className="lg:sticky lg:top-[80px] flex flex-col gap-8">

            {/* title */}
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-3">
                Думки гостей
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#2C1E16] leading-tight">
                Відгуки
              </h1>
            </div>

            {/* rating summary */}
            {avgRating !== null ? (
              <div className="flex flex-col gap-2">
                <p className="font-heading text-6xl font-bold text-[#2C1E16] leading-none tracking-tight">
                  {avgRating.toFixed(1)}
                </p>
                <StarDisplay rating={Math.round(avgRating)} size={16} />
                <p className="text-[12px] text-[#2C1E16]/65 tracking-wide">
                  {reviews.length} {pluralReviews(reviews.length)}
                </p>
              </div>
            ) : (
              <p className="text-[#2C1E16]/60 text-sm">Поки немає відгуків</p>
            )}

            {/* CTA */}
            <div>
              <button
                onClick={openModal}
                className="px-7 py-3.5 rounded-full text-sm font-medium
                           border border-[#C68E58] text-[#C68E58]
                           hover:bg-[#C68E58] hover:text-white transition-colors duration-200"
              >
                Залишити відгук
              </button>
            </div>

          </div>
        </aside>

        {/* ════════ REVIEWS GRID ════════ */}
        <div className="lg:col-span-2">
          {reviews.length === 0 ? (
            <div className="rounded-2xl bg-[#F2EAE0] border border-[#C68E58]/15 p-10 text-center">
              <p className="text-3xl mb-4">☕</p>
              <p className="font-heading text-xl text-[#2C1E16] mb-2">
                Тут поки що порожньо
              </p>
              <p className="text-[#2C1E16]/50 text-sm leading-relaxed mb-6">
                Станьте першим, хто поділиться враженнями!
              </p>
              <button
                onClick={openModal}
                className="inline-block px-6 py-2.5 rounded-full text-sm font-medium
                           border border-[#C68E58] text-[#C68E58]
                           hover:bg-[#C68E58] hover:text-white transition-colors duration-200"
              >
                Написати відгук
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ════════════════════════════ MODAL ════════════════════ */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Залишити відгук"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          className={[
            "fixed inset-0 z-50 flex items-end md:items-center justify-center",
            "bg-black/55 backdrop-blur-sm",
            "transition-opacity duration-[280ms] ease-in-out",
            isModalFading ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={[
              "relative w-full md:max-w-lg bg-[#FDFBF7]",
              "rounded-t-3xl md:rounded-3xl shadow-2xl",
              "max-h-[92dvh] md:max-h-[85vh] overflow-y-auto",
              "transition-transform duration-[280ms] ease-in-out",
              isModalFading
                ? "translate-y-4 md:translate-y-0 md:scale-95"
                : "translate-y-0 md:scale-100",
            ].join(" ")}
          >
            {/* drag handle */}
            <div
              aria-hidden
              className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#2C1E16]/15 md:hidden"
            />

            {/* close button */}
            <button
              onClick={closeModal}
              aria-label="Закрити"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#2C1E16]/8
                         flex items-center justify-center text-[#2C1E16]/50
                         hover:bg-[#2C1E16]/12 hover:text-[#2C1E16] transition-colors"
            >
              <X size={16} strokeWidth={2} />
            </button>

            {/* ── success state ── */}
            {submitSuccess ? (
              <div className="px-6 pt-12 pb-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#C68E58]/12 flex items-center justify-center mb-5">
                  <span className="text-3xl">☕</span>
                </div>
                <h2 className="font-heading text-2xl font-bold text-[#2C1E16] mb-3">
                  Дякуємо!
                </h2>
                <p className="text-[#2C1E16]/75 text-sm leading-relaxed max-w-xs">
                  Ваш відгук надіслано на модерацію і з&apos;явиться на сайті
                  найближчим часом.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-8 px-8 py-3 rounded-full bg-[#C68E58] text-white text-sm font-medium
                             hover:opacity-90 transition-opacity"
                >
                  Закрити
                </button>
              </div>
            ) : (

              /* ── form ── */
              <div className="px-6 pt-8 pb-8">
                <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-1">
                  Поділіться враженнями
                </p>
                <h2 className="font-heading text-2xl font-bold text-[#2C1E16] mb-6">
                  Ваш відгук
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  {/* name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#2C1E16]/65">
                      Ваше ім&apos;я
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Наприклад: Марія"
                      maxLength={60}
                      className="w-full px-4 py-3 rounded-xl border border-[#2C1E16]/12
                                 bg-white/70 text-[#2C1E16] text-sm placeholder:text-[#2C1E16]/30
                                 focus:outline-none focus:border-[#C68E58]/60 focus:ring-2 focus:ring-[#C68E58]/15
                                 transition-colors"
                    />
                  </div>

                  {/* star picker */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#2C1E16]/65">
                      Оцінка
                    </label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>

                  {/* text */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#2C1E16]/65">
                      Коментар
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Розкажіть про ваш візит…"
                      rows={4}
                      maxLength={800}
                      className="w-full px-4 py-3 rounded-xl border border-[#2C1E16]/12
                                 bg-white/70 text-[#2C1E16] text-sm placeholder:text-[#2C1E16]/30
                                 resize-none focus:outline-none focus:border-[#C68E58]/60 focus:ring-2 focus:ring-[#C68E58]/15
                                 transition-colors"
                    />
                  </div>

                  {/* error */}
                  {errorMsg && (
                    <p className="text-red-500 text-xs leading-relaxed">{errorMsg}</p>
                  )}

                  {/* submit */}
                  <button
                    type="submit"
                    disabled={submitStatus === "loading"}
                    className="w-full py-4 rounded-2xl bg-[#2C1E16] text-white
                               text-sm font-semibold tracking-wide
                               hover:opacity-85 transition-opacity
                               disabled:opacity-50 disabled:cursor-not-allowed
                               active:scale-[0.98] transition-transform duration-100"
                  >
                    {submitStatus === "loading" ? "Відправляємо…" : "Надіслати відгук"}
                  </button>

                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}