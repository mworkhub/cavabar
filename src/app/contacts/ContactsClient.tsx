"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Phone, X, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ─── icons ──────────────────────────────────────────────── */

function InstagramIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/* ─── info block ─────────────────────────────────────────── */

function InfoBlock({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-5">
      <div className="mt-1 text-[#C68E58] shrink-0">{icon}</div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C68E58] mb-1.5">
          {label}
        </p>
        <div className="text-base text-[#2C1E16] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────── */

export function ContactsClient() {
  /* ── modal state ── */
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [isModalFading, setIsModalFading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /* ── form state ── */
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [message, setMessage] = useState("");

  type SubmitStatus = "idle" | "loading" | "error";
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMsg,     setErrorMsg]     = useState("");

  /* ── modal controls ── */
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
      setName(""); setPhone(""); setMessage("");
      setSubmitStatus("idle"); setErrorMsg("");
    }, 280);
  }, []);

  /* ── body scroll lock ── */
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
  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim())    { setErrorMsg("Введіть ваше ім'я"); return; }
    if (!phone.trim())   { setErrorMsg("Введіть номер телефону"); return; }
    if (!message.trim()) { setErrorMsg("Напишіть ваше повідомлення"); return; }

    setSubmitStatus("loading");

    const sb = createClient();
    const { error } = await sb
      .from("leads")
      .insert({ type: "contact", name: name.trim(), phone: phone.trim(), message: message.trim() });

    if (error) {
      setSubmitStatus("error");
      setErrorMsg("Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте нам.");
      return;
    }

    setSubmitStatus("idle");
    setSubmitSuccess(true);
  }

  /* ─────────────────────────────── RENDER ───────────────── */

  return (
    <main className="px-6 py-12 max-w-6xl mx-auto lg:py-16">

      {/* ── Back + Title (always on top) ── */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#2C1E16]/40
                   hover:text-[#C68E58] transition-colors mb-8"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        На головну
      </Link>

      <div className="mb-8 lg:mb-0">
        <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-3">
          Як нас знайти
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#2C1E16] leading-tight">
          Контакти
        </h1>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-start mt-0 lg:mt-10">

        {/* ════════ LEFT: INFO ════════ */}
        <div className="flex flex-col gap-8 order-2 lg:order-1 lg:pr-10">

          {/* info blocks */}
          <div className="flex flex-col gap-8">

            <InfoBlock icon={<MapPin size={22} strokeWidth={1.5} />} label="Адреса">
              <p>
                Площа Ринок, 30<br />
                м. Броди, Львівська обл., 80601
              </p>
            </InfoBlock>

            <InfoBlock icon={<Clock size={22} strokeWidth={1.5} />} label="Графік роботи">
              <div className="flex items-baseline justify-between gap-6 max-w-[200px]">
                <span className="text-[#2C1E16]/60">Пн–Нд</span>
                <span className="font-medium tabular-nums">09:00 – 22:00</span>
              </div>
            </InfoBlock>

            <InfoBlock icon={<Phone size={22} strokeWidth={1.5} />} label="Телефон">
              <a href="tel:+380932058108" className="hover:text-[#C68E58] transition-colors">
                +38 (093) 205-81-08
              </a>
            </InfoBlock>

            <InfoBlock icon={<InstagramIcon />} label="Instagram">
              <a
                href="https://www.instagram.com/cava_bar_/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C68E58] transition-colors"
              >
                @cava_bar_
              </a>
            </InfoBlock>

            <InfoBlock icon={<Send size={22} strokeWidth={1.5} />} label="Telegram">
              <a
                href="https://t.me/+380932058108"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C68E58] transition-colors"
              >
                +38 (093) 205-81-08
              </a>
            </InfoBlock>

          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://maps.app.goo.gl/ZU3jvbMfTPPYj6vV7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full
                         bg-[#C68E58] text-white text-sm font-medium tracking-wide
                         hover:bg-[#B37A46] active:scale-[0.98] transition-all duration-200"
            >
              <MapPin size={16} strokeWidth={2} />
              Прокласти маршрут
            </a>

            <button
              onClick={openModal}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full
                         border border-[#C68E58] text-[#C68E58] text-sm font-medium tracking-wide
                         hover:bg-[#C68E58] hover:text-white transition-colors duration-200
                         active:scale-[0.98]"
            >
              Написати нам
            </button>
          </div>

        </div>

        {/* ════════ RIGHT: PHOTO ════════ */}
        {/* on mobile: order-first so it appears above info blocks; compact height */}
        <div className="order-1 lg:order-2 rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/IMG_2245.jpg"
            alt="Атмосфера кав'ярні Cava Bar у Бродах"
            className="w-full object-cover h-[220px] sm:h-[280px] lg:h-[680px]
                       transition-transform duration-700 hover:scale-105"
          />
        </div>

      </div>

      {/* ════════════════ MAP ════════════════════ */}
      <div className="mt-12 rounded-3xl overflow-hidden shadow-lg w-full h-[320px] lg:h-[420px]">
        <iframe
          title="Cava Bar на карті"
          src="https://maps.google.com/maps?q=50.0834,25.1531&hl=uk&z=17&output=embed"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* ══════════════════════════ MODAL ══════════════════════ */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Написати нам"
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
            <div aria-hidden className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#2C1E16]/15 md:hidden" />

            <button
              onClick={closeModal}
              aria-label="Закрити"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#2C1E16]/8
                         flex items-center justify-center text-[#2C1E16]/50
                         hover:bg-[#2C1E16]/12 hover:text-[#2C1E16] transition-colors"
            >
              <X size={16} strokeWidth={2} />
            </button>

            {submitSuccess ? (
              <div className="px-6 pt-12 pb-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#C68E58]/12 flex items-center justify-center mb-5">
                  <span className="text-3xl">✉️</span>
                </div>
                <h2 className="font-heading text-2xl font-bold text-[#2C1E16] mb-3">Дякуємо!</h2>
                <p className="text-[#2C1E16]/55 text-sm leading-relaxed max-w-xs">
                  Ваша заявка прийнята. Ми зв&apos;яжемося з вами найближчим часом.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-8 px-8 py-3 rounded-full bg-[#C68E58] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Закрити
                </button>
              </div>
            ) : (
              <div className="px-6 pt-8 pb-8">
                <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-1">
                  Зв&apos;яжіться з нами
                </p>
                <h2 className="font-heading text-2xl font-bold text-[#2C1E16] mb-6">
                  Написати нам
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#2C1E16]/45">
                      Ваше ім&apos;я
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Наприклад: Марія"
                      maxLength={80}
                      className="w-full px-4 py-3 rounded-xl border border-[#2C1E16]/12
                                 bg-white/70 text-[#2C1E16] text-sm placeholder:text-[#2C1E16]/30
                                 focus:outline-none focus:border-[#C68E58]/60 focus:ring-2 focus:ring-[#C68E58]/15
                                 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#2C1E16]/45">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+38 (093) 205-81-08"
                      maxLength={20}
                      className="w-full px-4 py-3 rounded-xl border border-[#2C1E16]/12
                                 bg-white/70 text-[#2C1E16] text-sm placeholder:text-[#2C1E16]/30
                                 focus:outline-none focus:border-[#C68E58]/60 focus:ring-2 focus:ring-[#C68E58]/15
                                 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#2C1E16]/45">
                      Повідомлення
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Бронювання столика, питання про меню, замовлення на свято…"
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3 rounded-xl border border-[#2C1E16]/12
                                 bg-white/70 text-[#2C1E16] text-sm placeholder:text-[#2C1E16]/30
                                 resize-none focus:outline-none focus:border-[#C68E58]/60 focus:ring-2 focus:ring-[#C68E58]/15
                                 transition-colors"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-xs leading-relaxed">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitStatus === "loading"}
                    className="w-full py-4 rounded-2xl bg-[#2C1E16] text-white
                               text-sm font-semibold tracking-wide
                               hover:opacity-85 transition-opacity
                               disabled:opacity-50 disabled:cursor-not-allowed
                               active:scale-[0.98] transition-transform duration-100"
                  >
                    {submitStatus === "loading" ? "Надсилаємо…" : "Надіслати"}
                  </button>

                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
