"use client";

import { useState } from "react";
import { Phone, MapPin, Link2, Clock, BarChart2, Layers, Save, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/types/database";

interface Props {
  settings: SiteSettings | null;
}

type FormState = {
  phone:                string;
  address:              string;
  instagram_url:        string;
  contacts_image_url:   string;
  working_hours:        string;
  google_analytics_id:  string;
  meta_pixel_id:        string;
};

function fromSettings(s: SiteSettings | null): FormState {
  return {
    phone:               s?.phone               ?? "",
    address:             s?.address             ?? "",
    instagram_url:       s?.instagram_url       ?? "",
    contacts_image_url:  s?.contacts_image_url  ?? "",
    working_hours:       s?.working_hours        ?? "",
    google_analytics_id: s?.google_analytics_id ?? "",
    meta_pixel_id:       s?.meta_pixel_id       ?? "",
  };
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SettingsManager({ settings }: Props) {
  const [form, setForm]       = useState<FormState>(fromSettings(settings));
  const [status, setStatus]   = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (status === "saved") setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const payload = {
      id:                   1,
      phone:                form.phone.trim()               || null,
      address:              form.address.trim()             || null,
      instagram_url:        form.instagram_url.trim()       || null,
      working_hours:        form.working_hours.trim()       || null,
      google_analytics_id:  form.google_analytics_id.trim() || null,
      meta_pixel_id:        form.meta_pixel_id.trim()       || null,
      contacts_image_url:   form.contacts_image_url.trim()  || null,
      updated_at:           new Date().toISOString(),
    };

    const supabase = createClient();
    const { error } = await supabase
      .from("settings")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("saved");
    setTimeout(() => setStatus("idle"), 3000);
  }

  const lastSaved = settings?.updated_at
    ? new Date(settings.updated_at).toLocaleString("uk-UA", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <form onSubmit={handleSubmit}>

      {/* header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#2C1E16]">Налаштування</h1>
          {lastSaved && (
            <p className="text-[#2C1E16]/40 text-xs mt-1">Останнє збереження: {lastSaved}</p>
          )}
        </div>
        <SaveButton status={status} />
      </div>

      <div className="flex flex-col gap-5">

        {/* ── contacts ── */}
        <Section
          icon={<Phone size={16} strokeWidth={2} />}
          title="Контакти"
        >
          <Field label="Телефон" hint="Наприклад: +38 (093) 205-81-08">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+38 (0XX) XXX-XX-XX"
              className={INPUT}
            />
          </Field>
          <Field label="Адреса" hint="Відображається в контактах і JSON-LD">
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="пл. Ринок, 30, м. Броди"
              className={INPUT}
            />
          </Field>
          <Field label="Instagram URL">
            <div className="relative">
              <Link2
                size={15}
                strokeWidth={2}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1E16]/35"
              />
              <input
                type="url"
                value={form.instagram_url}
                onChange={(e) => set("instagram_url", e.target.value)}
                placeholder="https://www.instagram.com/cava_bar_/"
                className={`${INPUT} pl-9`}
              />
            </div>
          </Field>
          <Field
            label="Фото сторінки Контактів"
            hint="URL або локальний шлях /images/назва.jpg"
          >
            <input
              type="text"
              value={form.contacts_image_url}
              onChange={(e) => set("contacts_image_url", e.target.value)}
              placeholder="/images/IMG_2245.jpg або https://…"
              className={INPUT}
            />
            {form.contacts_image_url && (
              <div className="mt-2 flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.contacts_image_url}
                  alt="preview"
                  className="w-20 h-20 rounded-xl object-cover border border-[#2C1E16]/10 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <p className="text-xs text-[#2C1E16]/40 leading-relaxed mt-1">
                  Рекомендований формат: вертикальне фото,<br />мінімум 800×1000 px.
                </p>
              </div>
            )}
          </Field>
        </Section>

        {/* ── schedule ── */}
        <Section
          icon={<Clock size={16} strokeWidth={2} />}
          title="Графік роботи"
        >
          <Field label="Години роботи" hint="Вільний формат тексту, відображається в контактах">
            <textarea
              value={form.working_hours}
              onChange={(e) => set("working_hours", e.target.value)}
              rows={3}
              placeholder={"Пн–Пт: 08:00 – 20:00\nСб–Нд: 09:00 – 21:00"}
              className={`${INPUT} resize-none font-mono text-xs leading-relaxed`}
            />
          </Field>
        </Section>

        {/* ── marketing ── */}
        <Section
          icon={<BarChart2 size={16} strokeWidth={2} />}
          title="Маркетинг та аналітика"
        >
          <Field label="Google Analytics ID" hint="Формат: G-XXXXXXXXXX або UA-XXXXXXXX-X">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#2C1E16]/30 select-none">
                GA
              </span>
              <input
                type="text"
                value={form.google_analytics_id}
                onChange={(e) => set("google_analytics_id", e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className={`${INPUT} pl-9 font-mono text-sm`}
              />
            </div>
          </Field>
          <Field label="Meta (Facebook) Pixel ID" hint="15-значний числовий ID">
            <div className="relative">
              <Layers
                size={14}
                strokeWidth={2}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1E16]/35"
              />
              <input
                type="text"
                value={form.meta_pixel_id}
                onChange={(e) => set("meta_pixel_id", e.target.value)}
                placeholder="123456789012345"
                className={`${INPUT} pl-9 font-mono text-sm`}
              />
            </div>
          </Field>
        </Section>

        {/* error */}
        {status === "error" && errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
            {errorMsg}
          </p>
        )}

        {/* bottom save */}
        <div className="flex justify-end pt-1">
          <SaveButton status={status} />
        </div>

      </div>
    </form>
  );
}

/* ── sub-components ── */

function Section({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
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

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <label className="text-xs font-semibold text-[#2C1E16]/50 uppercase tracking-wide">
          {label}
        </label>
        {hint && <span className="text-[10px] text-[#2C1E16]/30">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SaveButton({ status }: { status: SaveStatus }) {
  const saved = status === "saved";
  const saving = status === "saving";

  return (
    <button
      type="submit"
      disabled={saving}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-200 shadow-sm
                  ${saved
                    ? "bg-emerald-500 text-white"
                    : "bg-[#C68E58] text-white hover:opacity-90 active:scale-[0.97]"
                  }
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

const INPUT = `w-full px-3.5 py-2.5 rounded-xl border border-[#2C1E16]/15 bg-[#FDFBF7]
  text-sm text-[#2C1E16] placeholder:text-[#2C1E16]/25
  focus:outline-none focus:ring-2 focus:ring-[#C68E58]/35 focus:border-[#C68E58]
  transition-colors`;
