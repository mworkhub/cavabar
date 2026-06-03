import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { GalleryItem } from "@/types/database";

export const metadata: Metadata = {
  title: "Про нас — Cava Bar | Кав'ярня в Бродах",
  description:
    "Дізнайтеся більше про кав'ярню Cava Bar у м. Броди. Наша філософія, цінності та любов до кожної чашки кави. Площа Ринок, 30.",
};

const VALUES = [
  {
    icon: "☕",
    title: "Якість",
    text: "Тільки свіже зерно від локальних обсмажувачів, щоденна калібровка обладнання.",
  },
  {
    icon: "🤍",
    title: "Турбота",
    text: "Кожен, хто заходить — гість. Не клієнт. Різниця відчувається.",
  },
  {
    icon: "🌿",
    title: "Локальність",
    text: "Підтримуємо українських виробників та створюємо простір для спільноти.",
  },
];

export default async function AboutPage() {
  let gallery: GalleryItem[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    gallery = (data ?? []) as GalleryItem[];
  } catch {
    /* gallery table may not exist yet */
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 lg:py-20">

      {/* back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#2C1E16]/40
                   hover:text-[#C68E58] transition-colors mb-12"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        На головну
      </Link>

      {/* ── PAGE HEADER ── */}
      <header className="mb-14 lg:mb-16">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#C68E58] mb-4">
          Наша філософія
        </p>
        <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.25rem] font-bold
                        text-[#2C1E16] leading-[1.15] max-w-2xl">
          Історія про Cava Bar
        </h1>
      </header>

      {/* ── ASYMMETRIC GRID ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">

        {/* photo */}
        <div className="flex justify-center lg:justify-start lg:sticky lg:top-24">
          <div className="relative w-full max-w-[380px] mx-auto lg:mx-0 h-[500px]
                          rounded-tl-[80px] rounded-br-[80px] rounded-tr-2xl rounded-bl-2xl
                          overflow-hidden shadow-xl shadow-[#2C1E16]/12">
            <Image
              src="/images/IMG_4592.JPG"
              alt="Засновниця Cava Bar"
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 380px"
            />
          </div>
        </div>

        {/* text */}
        <div className="flex flex-col gap-6">

          {/* lead paragraph */}
          <p className="text-xl md:text-2xl text-[#2C1E16] font-heading leading-relaxed font-medium">
            Ідея створення закладу крутилась в голові дуже давно. Але якось не було ні часу, ні сміливості зробити перший крок...
          </p>

          <div className="w-10 h-[2px] bg-[#C68E58] rounded-full" />

          <div className="space-y-5 text-[#2C1E16]/80 leading-loose text-[15px]">
            <p>
              Cava Bar — це затишний простір у самому серці Бродів, де час ніби сповільнюється.
              Ми відкрилися з однією простою ідеєю: зробити якісну каву доступною для кожного,
              хто живе або буває в нашому місті.
            </p>
            <p>
              Ми варимо каву зі спеціально підібраних купажів від локальних українських
              обсмажувачів. Рецептури відточуються щодня — ми не зупиняємось на досягнутому і
              завжди шукаємо ідеальний баланс смаку та аромату в кожній чашці.
            </p>
            <p>
              Для нас важливо не просто подати напій, а створити момент. Теплий. Справжній.
              Тому кожен відвідувач тут — не клієнт, а гість, якому раді завжди і безумовно.
            </p>
            <p>
              З часом Cava Bar перетворився на щось більше, ніж просто кав'ярня. Це місце,
              де зустрічаються друзі, де народжуються ідеї, де можна просто помовчати наодинці
              з собою — і це теж буде добре.
            </p>
          </div>

        </div>
      </section>

      {/* ── EMOTIONAL ACCENT ── */}
      <section className="relative mb-20 rounded-[2rem] bg-[#2C1E16] px-8 py-12 md:px-14 md:py-16 overflow-hidden">
        {/* decorative circle */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#C68E58]/10 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#C68E58]/8 pointer-events-none" />

        <p className="relative text-[11px] font-semibold uppercase tracking-widest text-[#C68E58] mb-6">
          Головне
        </p>
        <blockquote className="relative">
          <p className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-snug mb-4">
            «CAVA BAR» —<br className="hidden sm:block" /> це велика сім'я.
          </p>
          <p className="font-heading text-xl md:text-2xl text-white/70 italic leading-snug">
            І пам'ятай: «Кава вирішує все» ❤️
          </p>
        </blockquote>
      </section>

      {/* ── VALUES ── */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#C68E58] mb-3">
          Що для нас важливо
        </p>
        <h2 className="font-heading text-3xl font-bold text-[#2C1E16] mb-10">
          Наші цінності
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {VALUES.map(({ icon, title, text }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 shadow-sm shadow-[#2C1E16]/5
                         border border-[#2C1E16]/5 flex flex-col gap-4"
            >
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="font-heading text-lg font-bold text-[#2C1E16] mb-1.5">{title}</p>
                <p className="text-sm text-[#2C1E16]/75 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GALLERY ── */}
      {gallery.length > 0 && (
        <section className="mt-20">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#C68E58] mb-3">
            Атмосфера
          </p>
          <h2 className="font-heading text-3xl font-bold text-[#2C1E16] mb-10">
            Наш простір
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {gallery.map((item, i) => (
              <div
                key={item.id}
                className={`overflow-hidden rounded-2xl bg-[#E8E1D9]
                  ${i === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto md:h-[480px]" : "aspect-square"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt={item.alt || "Cava Bar"}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
