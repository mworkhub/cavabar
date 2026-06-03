"use client";

import { useEffect, useCallback } from "react";
import { X, Heart, Share2 } from "lucide-react";
import type { MenuItem } from "@/types/database";

const BADGE_STYLES: Record<string, string> = {
  Популярне:       "bg-[#C68E58]/15 text-[#C68E58]",
  "Хіт сезону":   "bg-[#C68E58]/15 text-[#C68E58]",
  "Хіт продажів": "bg-[#C68E58]/15 text-[#C68E58]",
  "Вибір гостей": "bg-[#C68E58]/15 text-[#C68E58]",
  Хіт:            "bg-[#C68E58]/15 text-[#C68E58]",
  Топ:            "bg-[#C68E58]/15 text-[#C68E58]",
  Новинка:        "bg-emerald-50 text-emerald-700",
  Веган:          "bg-emerald-50 text-emerald-700",
  Освіжає:        "bg-sky-50 text-sky-700",
  Гостре:         "bg-red-50 text-red-600",
  Гостро:         "bg-red-50 text-red-600",
};

function badgeClass(badge: string): string {
  return BADGE_STYLES[badge] ?? "bg-[#2C1E16]/8 text-[#6B4C3B]";
}

function formatPrice(price: number): string {
  return `${Math.round(price)} грн`;
}

function PhotoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-[#E8E1D9] flex items-center justify-center ${className}`}>
      <span className="text-[#2C1E16]/25 text-xs select-none">Фото</span>
    </div>
  );
}

interface MenuItemModalProps {
  item: MenuItem;
  onClose: () => void;
  isFav?: boolean;
  onToggleFav?: (id: string) => void;
}

export function MenuItemModal({ item, onClose, isFav = false, onToggleFav }: MenuItemModalProps) {
  const badges = item.badges ?? [];

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: item.name, text: "Спробуй це в Cava Bar!", url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      alert("Посилання скопійовано!");
    }
  }, [item.name]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center
                 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full md:max-w-md
                   bg-[#FDFBF7]
                   rounded-t-3xl md:rounded-3xl
                   overflow-hidden
                   max-h-[92dvh] md:max-h-[85vh]
                   flex flex-col
                   shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* — photo area — */}
        <div className="relative flex-shrink-0">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full aspect-[4/3] object-cover object-center"
            />
          ) : (
            <PhotoPlaceholder className="w-full aspect-[4/3]" />
          )}

          <div
            aria-hidden
            className="absolute top-3 left-1/2 -translate-x-1/2
                       w-10 h-1 rounded-full bg-white/50 md:hidden"
          />

          <button
            onClick={onClose}
            aria-label="Закрити"
            className="absolute top-3 right-3
                       w-9 h-9 rounded-full
                       bg-black/40 backdrop-blur-sm
                       flex items-center justify-center
                       text-white
                       hover:bg-black/60
                       transition-colors"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* — content — */}
        <div className="flex flex-col gap-0 overflow-y-auto px-6 pt-5 pb-8">
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {badges.map((b) => (
                <span
                  key={b}
                  className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${badgeClass(b)}`}
                >
                  {b}
                </span>
              ))}
            </div>
          )}

          <h2 className="font-heading text-2xl font-bold text-[#2C1E16] leading-snug">
            {item.name}
          </h2>

          {item.description && (
            <p className="text-[#4A3C31] text-base leading-relaxed mt-3">
              {item.description}
            </p>
          )}

          {/* weight + price + actions */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#2C1E16]/8">
            {item.weight ? (
              <span className="text-sm text-[#6B4C3B]">{item.weight}</span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                aria-label="Поділитися"
                className="w-5 h-5 flex items-center justify-center
                           hover:scale-110 active:scale-95 transition-transform duration-100"
              >
                <Share2 size={18} strokeWidth={2} stroke="#C68E58" />
              </button>
              {onToggleFav && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFav(item.id); }}
                  aria-label={isFav ? "Видалити з обраного" : "Додати до обраного"}
                  className="w-5 h-5 flex items-center justify-center
                             hover:scale-110 active:scale-95 transition-transform duration-100"
                >
                  <Heart
                    size={18}
                    strokeWidth={2}
                    fill={isFav ? "#C68E58" : "none"}
                    stroke="#C68E58"
                  />
                </button>
              )}
              <span className="font-heading font-bold text-2xl text-[#2C1E16]">
                {formatPrice(item.price)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full py-4 rounded-2xl
                       bg-[#2C1E16] text-white
                       text-sm font-semibold tracking-wide
                       hover:opacity-85 transition-opacity
                       active:scale-[0.98] transition-transform duration-100"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
