"use client";

import { useState, useCallback } from "react";
import { Heart, Share2 } from "lucide-react";
import type { MenuItem } from "@/types/database";
import { MenuItemModal } from "./MenuItemModal";

/* Styles for photo overlay badges (solid, always readable on image) */
const BADGE_OVERLAY: Record<string, string> = {
  Популярне:       "bg-[#C68E58] text-white",
  "Хіт сезону":   "bg-[#C68E58] text-white",
  "Хіт продажів": "bg-[#C68E58] text-white",
  "Вибір гостей": "bg-[#C68E58] text-white",
  Хіт:            "bg-[#C68E58] text-white",
  Топ:            "bg-[#C68E58] text-white",
  Новинка:        "bg-emerald-600 text-white",
  Веган:          "bg-emerald-600 text-white",
  Освіжає:        "bg-sky-600 text-white",
  Гостре:         "bg-red-600 text-white",
  Гостро:         "bg-red-600 text-white",
};

function badgeOverlayClass(badge: string): string {
  return BADGE_OVERLAY[badge] ?? "bg-[#2C1E16] text-white";
}

function formatPrice(price: number): string {
  return `${Math.round(price)} грн`;
}

/* ─── photo placeholder ──────────────────────────────────── */

function PhotoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-[#E8E1D9] flex items-center justify-center ${className}`}>
      <span className="text-[#2C1E16]/25 text-xs select-none">Фото</span>
    </div>
  );
}

/* ─── component ──────────────────────────────────────────── */

interface MenuItemCardProps {
  item: MenuItem;
  isFav?: boolean;
  onToggleFav?: (id: string) => void;
}

export function MenuItemCard({ item, isFav = false, onToggleFav }: MenuItemCardProps) {
  const badges = item.badges ?? [];
  const [open, setOpen] = useState(false);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: item.name, text: "Спробуй це в Cava Bar!", url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      alert("Посилання скопійовано!");
    }
  }, [item.name]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {/* ════════════════════════════════ CARD ════ */}
      <article
        role="button"
        tabIndex={0}
        aria-label={`${item.name} — деталі`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(true); }}
        className="group flex gap-3 bg-[#F2EAE0] rounded-2xl p-4
                   border border-[#C68E58]/15 shadow-sm
                   cursor-pointer transition-transform duration-150 will-change-transform
                   hover:scale-[1.015] hover:shadow-md hover:border-[#C68E58]/30
                   active:scale-[0.97]
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C68E58]/60"
      >
        {/* — info column — */}
        <div className="flex flex-col flex-1 min-w-0 justify-between gap-2">
          <div>
            {/* name */}
            <p className="font-heading text-[17px] font-bold text-[#2C1E16] leading-snug">
              {item.name}
            </p>

            {/* weight */}
            {item.weight && (
              <p className="text-xs text-[#6B4C3B] mt-0.5 leading-none">{item.weight}</p>
            )}

            {/* description */}
            {item.description && (
              <p className="text-sm text-[#4A3C31] mt-1.5 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          {/* price + action icons row — always at bottom */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans font-bold text-lg leading-none text-[#2C1E16]">
              {formatPrice(item.price)}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                aria-label="Поділитися"
                className="w-5 h-5 flex items-center justify-center
                           hover:scale-110 active:scale-95 transition-transform duration-100"
              >
                <Share2 size={16} strokeWidth={2} stroke="#C68E58" />
              </button>
              {onToggleFav && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(item.id); }}
                  aria-label={isFav ? "Видалити з обраного" : "Додати до обраного"}
                  className="w-5 h-5 flex items-center justify-center
                             hover:scale-110 active:scale-95 transition-transform duration-100"
                >
                  <Heart
                    size={16}
                    strokeWidth={2}
                    fill={isFav ? "#C68E58" : "none"}
                    stroke={isFav ? "#C68E58" : "#C68E58"}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* — photo + badge — clean, no overlays — */}
        <div className="relative w-[82px] h-[82px] flex-shrink-0 rounded-xl overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <PhotoPlaceholder className="w-full h-full" />
          )}
          {badges[0] && (
            <span
              className={`absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wide
                          px-[5px] py-[3px] rounded-full leading-none
                          ${badgeOverlayClass(badges[0])}`}
            >
              {badges[0]}
            </span>
          )}
        </div>
      </article>

      {open && (
        <MenuItemModal
          item={item}
          onClose={close}
          isFav={isFav}
          onToggleFav={onToggleFav}
        />
      )}
    </>
  );
}
