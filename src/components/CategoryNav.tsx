"use client";

import { useState } from "react";

const CATEGORIES = ["Кава", "Чай", "Десерти", "Сніданки"] as const;

export function CategoryNav() {
  const [active, setActive] = useState<string>("Кава");

  return (
    <div className="flex overflow-x-auto gap-3 pb-1 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={[
            "flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors",
            active === cat
              ? "bg-[#C68E58] text-white shadow-sm"
              : "border border-[#2C1E16]/30 text-[#2C1E16] hover:border-[#C68E58] hover:text-[#C68E58]",
          ].join(" ")}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
