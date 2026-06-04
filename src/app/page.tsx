import type { Metadata } from "next";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { SiteHeader } from "@/components/SiteHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import type { MenuItem, Review } from "@/types/database";

const DEFAULTS = {
  hero_title:    "Це не лише\nпро каву —\nце про любов",
  hero_subtitle: "Затишне місце у серці Бродів, де кожна чашка приготована з душею і щирою турботою.",
  about_text:    "Cava Bar — це простір, де час сповільнюється. Ми варимо каву зі спеціально підібраних купажів від локальних обсмажувачів, подаємо свіжу випічку щодня і щиро радіємо кожному, хто до нас завітає.",
};

export const metadata: Metadata = {
  title: "Cava Bar — Кав'ярня в Бродах | Меню, Відгуки, Контакти",
  description:
    "Затишна кав'ярня Cava Bar у серці Бродів. Якісна кава від локальних обсмажувачів, свіжа випічка щодня, сніданки. Площа Ринок, 30, м. Броди.",
  openGraph: {
    title: "Cava Bar — Кав'ярня в Бродах",
    description:
      "Затишна кав'ярня у серці Бродів. Якісна кава, свіжа випічка, тепла атмосфера.",
    locale: "uk_UA",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: "Cava Bar",
  description:
    "Затишна кав'ярня у серці Бродів. Якісна кава від локальних обсмажувачів, свіжа випічка, сніданки.",
  url: "https://www.cava-bar.com",
  telephone: "+380932058108",
  address: {
    "@type": "PostalAddress",
    streetAddress: "пл. Ринок, 30",
    addressLocality: "Броди",
    addressRegion: "Львівська область",
    postalCode: "80601",
    addressCountry: "UA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "50.0834",
    longitude: "25.1531",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "09:00",
      closes: "22:00",
    },
  ],
  servesCuisine: ["Кава", "Сніданки", "Десерти"],
  priceRange: "₴₴",
  sameAs: ["https://www.instagram.com/cava_bar_/"],
};

export default async function Home() {
  const supabase = await createClient();

  /* ── curated featured mix: coffee + breakfast + soup + dessert ── */
  const FEATURED_NAMES = [
    "Капучино",
    "Англійський сніданок",
    "Грибний крем-суп",
    "Сирники з карамеллю",
  ];

  const [{ data: rows }, { data: reviewRows }, { data: aboutRow }] = await Promise.all([
    supabase
      .from("menu_items")
      .select("*")
      .in("name", FEATURED_NAMES)
      .eq("is_active", true),
    supabase
      .from("reviews")
      .select("id, author_name, rating, text, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("site_content")
      .select("key, value")
      .in("key", ["hero_title", "hero_subtitle", "about_text"]),
  ]);

  const contentMap = Object.fromEntries(
    ((aboutRow as { key: string; value: string }[] | null) ?? []).map((r) => [r.key, r.value])
  );
  const heroTitle    = contentMap.hero_title    ?? DEFAULTS.hero_title;
  const heroSubtitle = contentMap.hero_subtitle ?? DEFAULTS.hero_subtitle;
  const aboutText    = contentMap.about_text    ?? DEFAULTS.about_text;

  // preserve the desired display order
  const featuredItems: MenuItem[] = FEATURED_NAMES
    .map((name) => rows?.find((r) => r.name === name))
    .filter((r): r is MenuItem => r !== undefined);

  const latestReviews: Review[] = (reviewRows ?? []) as Review[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      {/* ════════════════ HERO — BOUTIQUE ══════════════════ */}
      <section className="bg-[#FDFBF7] w-full min-h-[calc(100svh-80px)] flex items-center">
        <div className="flex flex-col lg:flex-row items-center justify-between
                        gap-12 max-w-7xl mx-auto px-6 py-16 w-full">

          {/* ── LEFT: text — always visible, no animation dependency ── */}
          <div className="lg:w-1/2 flex flex-col items-start text-left">

            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#C68E58] mb-7">
              Кав&apos;ярня · м. Броди
            </p>

            <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-[3.75rem] xl:text-[4.25rem]
                           leading-[1.08] text-[#2C1E16] mb-7 whitespace-pre-line">
              {heroTitle}
            </h1>

            <p className="text-[#2C1E16] text-base leading-relaxed mb-10 max-w-sm">
              {heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-start justify-start gap-3">
              <a
                href="#menu"
                className="px-8 py-3.5 bg-[#2C1E16] text-white text-sm font-medium rounded-full
                           hover:bg-[#C68E58] active:scale-[0.97] transition-all duration-300"
              >
                Популярне ↓
              </a>
              <a
                href="/menu"
                className="px-8 py-3.5 rounded-full text-sm font-medium
                           border border-[#2C1E16]/30 text-[#2C1E16]
                           hover:border-[#C68E58] hover:text-[#C68E58] transition-colors duration-200"
              >
                Повне меню
              </a>
            </div>

          </div>

          {/* ── RIGHT: arch photo ── */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[420px] mx-auto">

              {/* arch photo */}
              <div className="h-[480px] sm:h-[550px] lg:h-[650px] overflow-hidden
                              rounded-t-[300px] rounded-b-[40px]
                              shadow-2xl shadow-[#2C1E16]/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/IMG_4594.JPG"
                  alt="Cava Bar — кав'ярня у Бродах"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              {/* glassmorphism badge — outside overflow-hidden so it can stick out left */}
              <FadeIn delay={0.5} y={12}
                className="absolute bottom-16 -left-8 lg:-left-16 z-20">
                <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl
                                shadow-xl border border-white flex items-center gap-3">
                  <span className="text-[#C68E58] text-xl leading-none">★</span>
                  <div>
                    <p className="font-heading text-sm font-bold text-[#2C1E16] leading-none mb-0.5">
                      4.6 / 5
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-[#4A3428] leading-none">
                      За відгуками гостей
                    </p>
                  </div>
                </div>
              </FadeIn>

            </div>
          </div>

        </div>
      </section>

      {/* ════════════════ ABOUT ═════════════════ */}
      <section className="bg-[#F2EAE0] py-20 px-6">
        <FadeIn className="max-w-xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-4">
            Наша філософія
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-[#2C1E16] mb-7">
            Про нас
          </h2>
          <p className="text-[#2C1E16] leading-[1.9] text-base mb-10">
            {aboutText}
          </p>
          <a
            href="/about"
            className="inline-block px-7 py-3 rounded-full text-sm font-medium border border-[#C68E58] text-[#C68E58] hover:bg-[#C68E58] hover:text-white transition-colors"
          >
            Читати далі
          </a>
        </FadeIn>
      </section>

      {/* ════════════════ POPULAR ITEMS ═════════════════ */}
      <section id="menu" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">

          <FadeIn className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-2">
              Що ми готуємо
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-[#2C1E16]">
              Популярне
            </h2>
          </FadeIn>

          {/* real items — staggered appearance */}
          <div className="flex flex-col gap-3">
            {featuredItems.map((item, i) => (
              <FadeIn key={item.id} delay={i * 0.1} y={20}>
                <MenuItemCard item={item} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2} className="mt-10 text-center">
            <a
              href="/menu"
              className="inline-block px-8 py-3 rounded-full text-sm font-medium border border-[#2C1E16]/20 text-[#2C1E16] hover:border-[#C68E58] hover:text-[#C68E58] transition-colors"
            >
              Переглянути повне меню →
            </a>
          </FadeIn>

        </div>
      </section>

      {/* ════════════════ REVIEWS ═══════════════ */}
      {latestReviews.length > 0 && (
        <section className="bg-[#F2EAE0] py-20 px-6">
          <div className="max-w-5xl mx-auto">

            <FadeIn className="mb-10">
              <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-2">
                Думки гостей
              </p>
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-heading text-3xl md:text-4xl text-[#2C1E16]">
                  Відгуки
                </h2>
                <a
                  href="/reviews"
                  className="text-sm text-[#C68E58] hover:underline shrink-0"
                >
                  Всі відгуки →
                </a>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {latestReviews.map((review, i) => (
                <FadeIn key={review.id} delay={i * 0.1}>
                  <article className="bg-white rounded-2xl p-6 flex flex-col gap-3
                                      border border-[#2C1E16]/5 shadow-sm
                                      transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} size={13} strokeWidth={0}
                              fill={n <= review.rating ? "#C68E58" : "#E8DDD3"} />
                      ))}
                    </div>
                    <p className="text-[#2C1E16] text-sm leading-relaxed line-clamp-4">
                      {review.text}
                    </p>
                    <p className="text-xs font-semibold text-[#4A3428] mt-auto">
                      {review.author_name}
                    </p>
                  </article>
                </FadeIn>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ════════════════ CONTACTS ══════════════ */}
      <section className="bg-[#F2EAE0] py-16 px-6">
        <FadeIn className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6 text-center">

          <div>
            <p className="font-heading text-lg text-[#2C1E16] mb-1">Адреса</p>
            <p className="text-[#2C1E16] text-sm leading-relaxed">
              вул. Площа Ринок, 30<br />м. Броди
            </p>
          </div>

          <div>
            <p className="font-heading text-lg text-[#2C1E16] mb-1">Графік</p>
            <p className="text-[#2C1E16] text-sm leading-relaxed">
              Пн–Нд: 09:00 – 22:00
            </p>
          </div>

          <div>
            <p className="font-heading text-lg text-[#2C1E16] mb-1">Instagram</p>
            <a
              href="https://www.instagram.com/cava_bar_/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C68E58] text-sm font-medium hover:underline"
            >
              @cava_bar_
            </a>
          </div>

        </FadeIn>
      </section>


</>
  );
}
