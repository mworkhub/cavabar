"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { jobApplicationSchema } from "@/lib/schemas";
import { useHoneypot } from "@/hooks/useHoneypot";
import type { Vacancy } from "@/types/database";

/* ─── vacancy card ───────────────────────────────────────── */

function VacancyCard({
  vacancy,
  onApply,
}: {
  vacancy: Vacancy;
  onApply: (position: string) => void;
}) {
  return (
    <article className="flex flex-col bg-[#F2EAE0] rounded-2xl border border-[#C68E58]/15 shadow-sm overflow-hidden">
      <div className="p-6 flex flex-col gap-5 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#C68E58] flex items-center justify-center text-xl flex-shrink-0">
            {vacancy.emoji ?? "☕"}
          </div>
          <h3 className="font-heading text-xl font-bold text-[#2C1E16]">{vacancy.title}</h3>
        </div>

        <p className="text-sm text-[#2C1E16] leading-relaxed">{vacancy.description}</p>

        {vacancy.requirements?.length > 0 && (
          <ul className="flex flex-col gap-2">
            {vacancy.requirements.map((req) => (
              <li key={req} className="flex items-start gap-2.5 text-sm text-[#2C1E16]">
                <Check size={15} strokeWidth={2.5} className="text-[#C68E58] mt-0.5 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        )}

        {vacancy.schedule && (
          <div className="mt-auto pt-4 border-t border-[#2C1E16]/8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C68E58] mb-1">Графік</p>
            <p className="text-sm text-[#2C1E16]">{vacancy.schedule}</p>
          </div>
        )}
      </div>

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

function ApplyForm({ positions, defaultPosition }: { positions: string[]; defaultPosition: string }) {
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [position, setPosition] = useState(defaultPosition || positions[0] || "");
  const [about,    setAbout]    = useState("");

  type Status = "idle" | "loading" | "success" | "error";
  const [status,   setStatus]   = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { honeypotProps, checkHoneypot } = useHoneypot();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const botCheck = checkHoneypot();
    if (botCheck) { setStatus("success"); return; }
    if (!name.trim())  { setErrorMsg("Введіть ваше ім'я"); return; }
    if (!phone.trim()) { setErrorMsg("Введіть номер телефону"); return; }

    const result = jobApplicationSchema.safeParse({
      name: name.trim(), phone: phone.trim(), position, about: about.trim(),
    });
    if (!result.success) {
      setErrorMsg(result.error.issues[0].message);
      return;
    }

    setStatus("loading");
    const sb = createClient();
    const { error } = await sb
      .from("job_applications")
      .insert(result.data);

    if (error) {
      console.error("Supabase Error:", error);
      setStatus("error");
      setErrorMsg(`Не вдалося надіслати заявку: ${error.message}`);
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
          Ваша заявка отримана. Ми зв&apos;яжемося з вами найближчим часом.
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
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
        <input name="website" type="text" {...honeypotProps} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Ваше ім&apos;я</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Наприклад: Марія" maxLength={80} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Телефон</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+38 (0__) ___-__-__" maxLength={20} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Бажана посада</label>
        <select value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass}>
          {positions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Коротко про себе</label>
        <textarea value={about} onChange={(e) => setAbout(e.target.value)}
          placeholder="Розкажіть трохи про себе, досвід, чому хочете до нас…"
          rows={4} maxLength={800} className={`${inputClass} resize-none`} />
      </div>

      {errorMsg && <p className="text-red-500 text-xs leading-relaxed">{errorMsg}</p>}

      <button type="submit" disabled={status === "loading"}
        className="w-full py-4 rounded-2xl bg-[#2C1E16] text-white text-sm font-semibold tracking-wide
                   hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
                   active:scale-[0.98]">
        {status === "loading" ? "Надсилаємо…" : "Відправити заявку"}
      </button>
    </form>
  );
}

/* ─── main export ────────────────────────────────────────── */

interface Props {
  vacancies: Vacancy[];
}

export function VacanciesClient({ vacancies }: Props) {
  const [formPosition, setFormPosition] = useState("");
  const positions = vacancies.map((v) => v.title);

  function scrollToForm(position: string) {
    setFormPosition(position);
    setTimeout(() => {
      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <>
      {vacancies.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-[#F2EAE0] border border-[#C68E58]/15 p-10 text-center">
          <p className="text-3xl mb-4">☕</p>
          <p className="font-heading text-xl text-[#2C1E16] mb-2">Зараз відкритих вакансій немає</p>
          <p className="text-[#2C1E16] text-sm leading-relaxed">
            Слідкуйте за оновленнями або залиште заявку — ми зв&apos;яжемося, як тільки з&apos;явиться можливість.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {vacancies.map((v) => (
            <VacancyCard key={v.id} vacancy={v} onApply={scrollToForm} />
          ))}
        </div>
      )}

      <div id="apply-form" className="mt-16 scroll-mt-24">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-3">Хочеш до нас?</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#2C1E16] mb-2">
            Як відгукнутись
          </h2>
          <p className="text-[#2C1E16] text-sm leading-relaxed mb-8">
            Заповни форму — ми зв&apos;яжемося з тобою протягом одного робочого дня.
          </p>
          {positions.length > 0 ? (
            <ApplyForm positions={positions} defaultPosition={formPosition} />
          ) : (
            <ApplyForm
              positions={["Бариста", "Офіціант", "Кухар / Помічник кухаря"]}
              defaultPosition={formPosition}
            />
          )}
        </div>
      </div>
    </>
  );
}
