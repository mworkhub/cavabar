"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Heart } from "lucide-react";
import type { MenuCategory, MenuItem } from "@/types/database";
import { MenuItemCard } from "./MenuItemCard";
import { StaggeredList } from "@/components/ui/StaggeredList";
import { useFavorites } from "@/hooks/useFavorites";

interface Props {
  categories: MenuCategory[];
  items: MenuItem[];
}

export function MenuClient({ categories, items }: Props) {
  const [activeId,      setActiveId]      = useState<string>(categories[0]?.id ?? "");
  const [showFavorites, setShowFavorites] = useState(false);
  const navRef             = useRef<HTMLDivElement>(null);
  const blockRef           = useRef(false);
  const showFavoritesRef   = useRef(false);

  const { isFav, toggle, count, isMounted } = useFavorites();

  /* group items by category_id */
  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category_id] ??= []).push(item);
    return acc;
  }, {});

  const favItems = items.filter((item) => isFav(item.id));

  /* keep ref in sync for observer callback */
  useEffect(() => { showFavoritesRef.current = showFavorites; }, [showFavorites]);

  /* scroll active pill into view */
  useEffect(() => {
    if (showFavorites) return;
    navRef.current
      ?.querySelector<HTMLButtonElement>(`[data-cid="${activeId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeId, showFavorites]);

  /* IntersectionObserver — sync pill with visible section */
  useEffect(() => {
    const observers = categories.map((cat) => {
      const el = document.getElementById(`s-${cat.id}`);
      if (!el) return null;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !blockRef.current && !showFavoritesRef.current) {
            setActiveId(cat.id);
          }
        },
        { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
      );

      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, [categories]);

  /* click pill → scroll to section */
  const goTo = useCallback((id: string) => {
    setShowFavorites(false);
    setActiveId(id);
    blockRef.current = true;
    document.getElementById(`s-${id}`)?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => { blockRef.current = false; }, 900);
  }, []);

  function toggleFavorites() {
    setShowFavorites((v) => !v);
  }

  return (
    <>
      {/* ════ Category pills ════ */}
      <div
        ref={navRef}
        className="sticky top-14 z-40 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-[#2C1E16]/6"
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide
                        md:justify-center w-full max-w-5xl mx-auto px-4 py-4">

          {/* favorites pill */}
          <button
            onClick={toggleFavorites}
            className={[
              "flex-shrink-0 flex items-center gap-1.5 px-4 py-[7px] rounded-full text-sm font-medium transition-all",
              showFavorites
                ? "bg-[#C68E58] text-white shadow-sm"
                : "border border-[#2C1E16]/25 text-[#2C1E16]/70 hover:border-[#C68E58]/60 hover:text-[#C68E58]",
            ].join(" ")}
          >
            <Heart
              size={13}
              strokeWidth={2}
              fill={showFavorites ? "white" : (isMounted && count > 0 ? "#C68E58" : "none")}
              stroke={showFavorites ? "white" : (isMounted && count > 0 ? "#C68E58" : "currentColor")}
            />
            Обране
            {isMounted && count > 0 && (
              <span className={`text-[11px] font-bold ${showFavorites ? "text-white/80" : "text-[#C68E58]"}`}>
                {count}
              </span>
            )}
          </button>

          {/* category pills */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              data-cid={cat.id}
              onClick={() => goTo(cat.id)}
              className={[
                "flex-shrink-0 px-4 py-[7px] rounded-full text-sm font-medium transition-all",
                !showFavorites && activeId === cat.id
                  ? "bg-[#C68E58] text-white shadow-sm"
                  : "border border-[#2C1E16]/25 text-[#2C1E16]/70 hover:border-[#C68E58]/60 hover:text-[#C68E58]",
              ].join(" ")}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ════ Content ════ */}
      <div className="max-w-5xl mx-auto px-4 pb-12">

        {/* ── favorites view ── */}
        {showFavorites ? (
          favItems.length === 0 ? (
            <div className="mt-16 flex flex-col items-center text-center gap-4 px-4">
              <div className="w-16 h-16 rounded-full bg-[#F2EAE0] flex items-center justify-center">
                <Heart size={28} strokeWidth={1.5} stroke="#C68E58" fill="none" />
              </div>
              <p className="font-heading text-xl text-[#2C1E16]">Тут поки порожньо</p>
              <p className="text-[#2C1E16]/45 text-sm leading-relaxed max-w-[240px]">
                Натисніть ❤ на будь-якій страві — і вона збережеться тут для наступного візиту.
              </p>
            </div>
          ) : (
            <section className="pt-8">
              <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-5">
                {count} збережено
              </p>
              <StaggeredList className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {favItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    isFav={isFav(item.id)}
                    onToggleFav={toggle}
                  />
                ))}
              </StaggeredList>
            </section>
          )
        ) : (

          /* ── normal category view ── */
          <>
            {categories.map((cat) => {
              const catItems = byCategory[cat.id];
              if (!catItems?.length) return null;

              return (
                <section key={cat.id} id={`s-${cat.id}`} className="scroll-mt-32 pt-10">
                  <h2 className="font-heading text-2xl md:text-3xl font-semibold text-[#2C1E16]">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="text-[#2C1E16]/45 text-sm mt-1 mb-5">{cat.description}</p>
                  )}
                  <StaggeredList className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-4">
                    {catItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        isFav={isFav(item.id)}
                        onToggleFav={toggle}
                      />
                    ))}
                  </StaggeredList>
                </section>
              );
            })}

            {/* packaging banner */}
            <div className="mt-12 flex items-center gap-4 rounded-2xl bg-[#E8E1D9] border border-[#C68E58]/40 p-5">
              <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-[#C68E58] flex items-center justify-center text-xl">
                ☕
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#2C1E16]">Пакування з собою</p>
                <p className="text-xs text-[#2C1E16]/55 mt-0.5">
                  До вартості замовлення додається{" "}
                  <span className="font-bold text-[#2C1E16]">+20 грн</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
