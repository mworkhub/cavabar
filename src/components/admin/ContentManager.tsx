"use client";

import { useState } from "react";
import { Save, CheckCircle2, Type, AlignLeft, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  initial: {
    hero_title:    string;
    hero_subtitle: string;
    about_text:    string;
    about_history: string;
  };
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const INPUT = `w-full px-3.5 py-2.5 rounded-xl border border-[#2C1E16]/15 bg-[#FDFBF7]
  text-sm text-[#2C1E16] placeholder:text-[#2C1E16]/25
  focus:outline-none focus:ring-2 focus:ring-[#C68E58]/35 focus:border-[#C68E58]
  transition-colors`;

export function ContentManager({ initial }: Props) {
  const [heroTitle,    setHeroTitle]    = useState(initial.hero_title);
  const [heroSubtitle, setHeroSubtitle] = useState(initial.hero_subtitle);
  const [aboutText,    setAboutText]    = useState(initial.about_text);
  const [aboutHistory, setAboutHistory] = useState(initial.about_history);

  const [status,   setStatus]   = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const rows = [
      { key: "hero_title",    value: heroTitle.trim(),    updated_at: new Date().toISOString() },
      { key: "hero_subtitle", value: heroSubtitle.trim(), updated_at: new Date().toISOString() },
      { key: "about_text",    value: aboutText.trim(),    updated_at: new Date().toISOString() },
      { key: "about_history", value: aboutHistory.trim(), updated_at: new Date().toISOString() },
    ];

    const supabase = createClient();
    const { error } = await supabase
      .from("site_content")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("saved");
    setTimeout(() => setStatus("idle"), 3000);
  }

  const saved  = status === "saved";
  const saving = status === "saving";

  return (
    <form onSubmit={handleSubmit}>

      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#2C1E16]">Контент сайту</h1>
          <p className="text-[#2C1E16]/40 text-xs mt-1">Тексти, які відображаються на публічних сторінках</p>
        </div>
        <SaveBtn saved={saved} saving={saving} />
      </div>

      <div className="flex flex-col gap-5">

        {/* ── Hero ── */}
        <Section icon={<Type size={16} strokeWidth={2} />} title="Головна — Hero-блок">
          <Field label="Головний заголовок"
                 hint="Кожен рядок з нового рядка (Enter). Відображається на першому екрані.">
            <textarea
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder={"Це не лише\nпро каву —\nце про любов"}
              className={`${INPUT} resize-none font-heading text-base leading-relaxed`}
            />
            <p className="text-[10px] text-[#2C1E16]/30 mt-1 text-right">{heroTitle.length} / 200</p>
          </Field>
          <Field label="Підзаголовок" hint="Короткий опис під заголовком">
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Затишне місце у серці Бродів, де кожна чашка приготована з душею."
              className={`${INPUT} resize-none`}
            />
            <p className="text-[10px] text-[#2C1E16]/30 mt-1 text-right">{heroSubtitle.length} / 200</p>
          </Field>
        </Section>

        {/* ── About block (homepage) ── */}
        <Section icon={<AlignLeft size={16} strokeWidth={2} />} title="Головна — Блок «Про нас»">
          <Field label="Текст" hint="Короткий абзац у секції «Про нас» на головній сторінці">
            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              rows={4}
              maxLength={600}
              placeholder="Cava Bar — це простір, де час сповільнюється…"
              className={`${INPUT} resize-y leading-relaxed`}
            />
            <p className="text-[10px] text-[#2C1E16]/30 mt-1 text-right">{aboutText.length} / 600</p>
          </Field>
        </Section>

        {/* ── About history ── */}
        <Section icon={<BookOpen size={16} strokeWidth={2} />} title="Сторінка «Про нас» — Історія">
          <Field
            label="Текст історії"
            hint="Абзаци розділяйте порожнім рядком (Enter двічі). Перший абзац виводиться великим шрифтом."
          >
            <textarea
              value={aboutHistory}
              onChange={(e) => setAboutHistory(e.target.value)}
              rows={12}
              maxLength={3000}
              placeholder={"Ідея створення закладу крутилась в голові…\n\nCava Bar — це затишний простір…\n\nМи варимо каву…"}
              className={`${INPUT} resize-y leading-relaxed font-mono text-xs`}
            />
            <p className="text-[10px] text-[#2C1E16]/30 mt-1 text-right">{aboutHistory.length} / 3000</p>
          </Field>
        </Section>

        {status === "error" && errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
            {errorMsg}
          </p>
        )}

        <div className="flex justify-end">
          <SaveBtn saved={saved} saving={saving} />
        </div>

      </div>
    </form>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm shadow-[#2C1E16]/6 overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#2C1E16]/6 bg-[#FDFBF7]">
        <span className="text-[#C68E58]">{icon}</span>
        <h2 className="font-heading text-[15px] font-bold text-[#2C1E16]">{title}</h2>
      </div>
      <div className="px-6 py-5 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <label className="text-xs font-semibold text-[#2C1E16]/50 uppercase tracking-wide">{label}</label>
        {hint && <span className="text-[10px] text-[#2C1E16]/30">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SaveBtn({ saved, saving }: { saved: boolean; saving: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-200 shadow-sm
                  ${saved ? "bg-emerald-500 text-white" : "bg-[#C68E58] text-white hover:opacity-90 active:scale-[0.97]"}
                  disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {saved
        ? <><CheckCircle2 size={16} strokeWidth={2.5} /> Збережено</>
        : saving
          ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Збереження…</>
          : <><Save size={15} strokeWidth={2.5} /> Зберегти зміни</>
      }
    </button>
  );
}
