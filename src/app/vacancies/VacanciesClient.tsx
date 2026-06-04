"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ─── vacancy data ───────────────────────────────────────── */

const VACANCIES = [
  {
    title: "Бариста",
    emoji: "☕",
    description:
      "Готуєш смачну каву, створюєш атмосферу та даруєш гостям чудовий настрій з першого ковтка.",
    requirements: [
      "Досвід роботи за кавомашиною (або бажання навчитися)",
      "Привітність та комунікабельність",
      "Відповідальність та акуратність",
      "Бажання розвиватися у кавовій культурі",
    ],
    schedule: "Гнучкий графік, змінна робота",
  },
  {
    title: "Офіціант",
    emoji: "🍽️",
    description:
      "Зустрічаєш гостей, приймаєш замовлення та турбуєшся про комфорт кожного відвідувача.",
    requirements: [
      "Досвід у сфері обслуговування (буде перевагою)",
      "Енергійність та доброзичливість",
      "Вміння працювати в команді",
      "Грамотне мовлення та охайний вигляд",
    ],
    schedule: "Змінна робота, вихідні та свята",
  },
  {
    title: "Кухар / Помічник кухаря",
    emoji: "🍳",
    description:
      "Готуєш сніданки, десерти та легкі страви відповідно до стандартів нашого меню.",
    requirements: [
      "Досвід роботи на кухні або профільна освіта",
      "Знання санітарних норм",
      "Швидкість та уважність під час роботи",
      "Любов до якісної їжі та деталей",
    ],
    schedule: "Повний робочий день, можлива часткова зайнятість",
  },
];

const POSITIONS = ["Бариста", "Офіціант", "Кухар / Помічник кухаря"];

/* ─── vacancy card ───────────────────────────────────────── */

function VacancyCard({
  vacancy,
  onApply,
}: {
  vacancy: (typeof VACANCIES)[number];
  onApply: (position: string) => void;
}) {
  return (
    <article className="flex flex-col bg-[#F2EAE0] rounded-2xl border border-[#C68E58]/15 shadow-sm overflow-hidden">
      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#C68E58] flex items-center justify-center text-xl flex-shrink-0">
            {vacancy.emoji}
          </div>
          <h3 className="font-heading text-xl font-bold text-[#2C1E16]">
            {vacancy.title}
          </h3>
        </div>

        {/* description */}
        <p className="text-sm text-[#2C1E16] leading-relaxed">{vacancy.description}</p>

        {/* requirements */}
        <ul className="flex flex-col gap-2">
          {vacancy.requirements.map((req) => (
            <li key={req} className="flex items-start gap-2.5 text-sm text-[#2C1E16]">
              <Check size={15} strokeWidth={2.5} className="text-[#C68E58] mt-0.5 flex-shrink-0" />
              {req}
            </li>
          ))}
        </ul>

        {/* schedule */}
        <div className="mt-auto pt-4 border-t border-[#2C1E16]/8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C68E58] mb-1">
            Графік
          </p>
          <p className="text-sm text-[#2C1E16]">{vacancy.schedule}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onApply(vacancy.title)}
          className="w-full py-3 rounded-full border border-[#C68E58] text-[#C68E58] text-sm font-medium
                     hover:bg-[#C68E58] hover:text-white transition-colors duration-200 active:scale-[0.98]"
        >
          Відгукнутись
        </button>
      </div>
    </article>
  );
}

/* ─── apply form ─────────────────────────────────────────── */

function ApplyForm({ defaultPosition = "" }: { defaultPosition?: string }) {
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [position, setPosition] = useState(defaultPosition || POSITIONS[0]);
  const [about,    setAbout]    = useState("");

  type Status = "idle" | "loading" | "success" | "error";
  const [status,   setStatus]   = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim())  { setErrorMsg("Введіть ваше ім'я"); return; }
    if (!phone.trim()) { setErrorMsg("Введіть номер телефону"); return; }

    setStatus("loading");

    const sb = createClient();
    const { error } = await sb
      .from("job_applications")
      .insert({ name: name.trim(), phone: phone.trim(), position, about: about.trim() });

    if (error) {
      setStatus("error");
      setErrorMsg("Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте нам.");
      return;
    }

    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-10">
        <div className="w-16 h-16 rounded-full bg-[#C68E58]/12 flex items-center justify-center">
          <span className="text-3xl">☕</span>
        </div>
        <h3 className="font-heading text-2xl font-bold text-[#2C1E16]">Дякуємо!</h3>
        <p className="text-[#2C1E16] text-sm leading-relaxed max-w-sm">
          Ваша заявка отримана. Ми зв'яжемося з вами найближчим часом для уточнення деталей.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[#2C1E16]/12 bg-white/70 text-[#2C1E16] text-sm " +
    "placeholder:text-[#2C1E16]/30 focus:outline-none focus:border-[#C68E58]/60 focus:ring-2 focus:ring-[#C68E58]/15 transition-colors";

  const labelClass = "text-xs font-semibold uppercase tracking-wide text-[#4A3428]";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Ваше ім'я</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Наприклад: Марія"
            maxLength={80}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Телефон</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+38 (0__) ___-__-__"
            maxLength={20}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Бажана посада</label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className={inputClass}
        >
          {POSITIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Коротко про себе</label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Розкажіть трохи про себе, досвід, чому хочете до нас…"
          rows={4}
          maxLength={800}
          className={`${inputClass} resize-none`}
        />
      </div>

      {errorMsg && (
        <p className="text-red-500 text-xs leading-relaxed">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 rounded-2xl bg-[#2C1E16] text-white text-sm font-semibold tracking-wide
                   hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
                   active:scale-[0.98] transition-transform duration-100"
      >
        {status === "loading" ? "Надсилаємо…" : "Відправити заявку"}
      </button>
    </form>
  );
}

/* ─── main export ────────────────────────────────────────── */

export function VacanciesClient() {
  const [formPosition, setFormPosition] = useState("");
  const formRef = typeof document !== "undefined" ? null : null;

  function scrollToForm(position: string) {
    setFormPosition(position);
    setTimeout(() => {
      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <>
      {/* ── vacancy cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {VACANCIES.map((v) => (
          <VacancyCard key={v.title} vacancy={v} onApply={scrollToForm} />
        ))}
      </div>

      {/* ── apply form section ── */}
      <div id="apply-form" className="mt-16 scroll-mt-24">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-3">
            Хочеш до нас?
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#2C1E16] mb-2">
            Як відгукнутись
          </h2>
          <p className="text-[#2C1E16] text-sm leading-relaxed mb-8">
            Заповни форму — ми зв'яжемося з тобою протягом одного робочого дня.
          </p>
          <ApplyForm defaultPosition={formPosition} />
        </div>
      </div>
    </>
  );
}
