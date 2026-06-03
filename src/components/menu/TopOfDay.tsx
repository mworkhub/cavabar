"use client";

import { useState } from "react";
import Image from "next/image";
import type { MenuItem } from "@/types/database";
import { MenuItemModal } from "./MenuItemModal";

function formatPrice(price: number) {
  return `${Math.round(price)} грн`;
}

export function TopOfDay({ item }: { item: MenuItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Детальніше: ${item.name}`}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsModalOpen(true); }}
        className="mx-4 mb-2 rounded-2xl bg-[#F2EAE0] border border-[#C68E58]/25 overflow-hidden
                   cursor-pointer hover:bg-[#E6DCCF] transition-colors duration-150
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C68E58]/60"
      >
        <div className="flex gap-4 p-4">

          {/* text */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0 justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C68E58]">
              Рекомендуємо сьогодні
            </p>
            <p className="font-heading text-[17px] font-bold text-[#2C1E16] leading-snug line-clamp-2">
              {item.name}
            </p>
            {item.description && (
              <p className="text-[13px] text-[#2C1E16]/55 leading-relaxed line-clamp-1">
                {item.description}
              </p>
            )}
            <p className="font-sans font-bold text-lg text-[#2C1E16] mt-0.5">
              {formatPrice(item.price)}
            </p>
          </div>

          {/* photo */}
          <div className="relative w-[96px] h-[96px] flex-shrink-0 rounded-xl overflow-hidden self-center">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#E8DDD3] flex items-center justify-center">
                <span className="text-2xl">☕</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {isModalOpen && (
        <MenuItemModal
          item={item}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
