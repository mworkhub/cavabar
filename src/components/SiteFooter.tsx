import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/database";

const DEFAULTS = {
  address:       "пл. Ринок, 30, м. Броди",
  instagram_url: "https://www.instagram.com/cava_bar_/",
  working_hours: "Пн–Нд: 09:00 – 22:00",
};

export async function SiteFooter() {
  let settings: SiteSettings | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("settings")
      .select("address, instagram_url, working_hours")
      .eq("id", 1)
      .maybeSingle();
    settings = data as SiteSettings | null;
  } catch {
    /* table may not exist yet — silently fall back to defaults */
  }

  const address      = settings?.address       || DEFAULTS.address;
  const instagramUrl = settings?.instagram_url || DEFAULTS.instagram_url;
  const hours        = settings?.working_hours || DEFAULTS.working_hours;

  /* extract @handle from full URL for display */
  const instagramHandle = instagramUrl
    .replace(/\/$/, "")
    .split("/")
    .pop() ?? "cava_bar_";

  return (
    <footer className="py-8 px-6 border-t border-[#2C1E16]/8 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-[#4A3428]">

        {/* brand */}
        <div className="flex flex-col gap-1.5">
          <span className="font-heading text-sm text-[#2C1E16] tracking-wide font-semibold">
            Cava Bar
          </span>
          <p className="leading-relaxed">{address}</p>
        </div>

        {/* hours */}
        <div className="flex flex-col gap-1.5 sm:text-center">
          <span className="font-semibold text-[#6B4C3B] uppercase tracking-wide text-[10px]">
            Графік роботи
          </span>
          {hours.split("\n").map((line, i) => (
            <p key={i} className="leading-relaxed">{line}</p>
          ))}
        </div>

        {/* social + copyright */}
        <div className="flex flex-col gap-1.5 sm:items-end">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C68E58] transition-colors font-medium"
          >
            @{instagramHandle}
          </a>
          <p>© {new Date().getFullYear()} Cava Bar</p>
        </div>

      </div>
    </footer>
  );
}
