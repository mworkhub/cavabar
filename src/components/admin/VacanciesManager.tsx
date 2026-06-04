"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Save, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Vacancy } from "@/types/database";

interface Props {
  initialVacancies: Vacancy[];
}

type FormData = {
  title:        string;
  emoji:        string;
  description:  string;
  requirements: string;
  schedule:     string;
  sort_order:   number;
  is_active:    boolean;
};

const EMPTY: FormData = {
  title: "", emoji: "☕", description: "", requirements: "", schedule: "", sort_order: 0, is_active: true,
};

const INPUT = `w-full px-3.5 py-2.5 rounded-xl border border-[#2C1E16]/15 bg-[#FDFBF7]
  text-sm text-[#2C1E16] placeholder:text-[#2C1E16]/25
  focus:outline-none focus:ring-2 focus:ring-[#C68E58]/35 focus:border-[#C68E58]
  transition-colors`;

function vacancyToForm(v: Vacancy): FormData {
  return {
    title:        v.title,
    emoji:        v.emoji ?? "☕",
    description:  v.description,
    requirements: (v.requirements ?? []).join("\n"),
    schedule:     v.schedule,
    sort_order:   v.sort_order,
    is_active:    v.is_active,
  };
}

export function VacanciesManager({ initialVacancies }: Props) {
  const [vacancies, setVacancies] = useState<Vacancy[]>(initialVacancies);
  const [modal,     setModal]     = useState<"add" | "edit" | null>(null);
  const [editing,   setEditing]   = useState<Vacancy | null>(null);
  const [form,      setForm]      = useState<FormData>(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");

  function openAdd() {
    setForm(EMPTY);
    setEditing(null);
    setErrorMsg("");
    setModal("add");
  }

  function openEdit(v: Vacancy) {
    setForm(vacancyToForm(v));
    setEditing(v);
    setErrorMsg("");
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setErrorMsg(""); }

  function set(key: keyof FormData, val: string | number | boolean) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setErrorMsg("Введіть назву вакансії"); return; }

    setSaving(true);
    setErrorMsg("");

    const payload = {
      title:        form.title.trim(),
      emoji:        form.emoji.trim() || null,
      description:  form.description.trim(),
      requirements: form.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
      schedule:     form.schedule.trim(),
      sort_order:   Number(form.sort_order),
      is_active:    form.is_active,
    };

    const supabase = createClient();

    if (modal === "edit" && editing) {
      const { data, error } = await supabase
        .from("vacancies")
        .update(payload)
        .eq("id", editing.id)
        .select()
        .single();

      if (error) { setErrorMsg(error.message); setSaving(false); return; }
      setVacancies((vs) => vs.map((v) => v.id === editing.id ? data as Vacancy : v));
    } else {
      const { data, error } = await supabase
        .from("vacancies")
        .insert(payload)
        .select()
        .single();

      if (error) { setErrorMsg(error.message); setSaving(false); return; }
      setVacancies((vs) => [...vs, data as Vacancy].sort((a, b) => a.sort_order - b.sort_order));
    }

    setSaving(false);
    closeModal();
  }

  async function toggleActive(v: Vacancy) {
    const supabase = createClient();
    const { error } = await supabase
      .from("vacancies")
      .update({ is_active: !v.is_active })
      .eq("id", v.id);

    if (!error) setVacancies((vs) => vs.map((x) => x.id === v.id ? { ...x, is_active: !x.is_active } : x));
  }

  async function handleDelete(v: Vacancy) {
    if (!confirm(`Видалити вакансію "${v.title}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("vacancies").delete().eq("id", v.id);
    if (!error) setVacancies((vs) => vs.filter((x) => x.id !== v.id));
  }

  return (
    <>
      {/* ── header ── */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#2C1E16]">Вакансії</h1>
          <p className="text-[#2C1E16]/40 text-xs mt-1">Управління відкритими позиціями</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C68E58] text-white text-sm font-semibold
                     hover:opacity-90 active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} /> Додати вакансію
        </button>
      </div>

      {/* ── list ── */}
      {vacancies.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-[#2C1E16]/40 text-sm">
          Вакансій поки немає. Натисніть «Додати вакансію».
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vacancies.map((v) => (
            <div
              key={v.id}
              className={`bg-white rounded-2xl shadow-sm shadow-[#2C1E16]/6 p-5 flex items-start gap-4
                          ${!v.is_active ? "opacity-50" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#F2EAE0] flex items-center justify-center text-xl flex-shrink-0">
                {v.emoji ?? "☕"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-[15px] font-bold text-[#2C1E16]">{v.title}</p>
                <p className="text-xs text-[#2C1E16]/50 mt-0.5 line-clamp-1">{v.description}</p>
                <p className="text-[11px] text-[#C68E58] mt-1">{v.schedule}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => toggleActive(v)}
                  title={v.is_active ? "Приховати" : "Показати"}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#2C1E16]/40 hover:bg-[#2C1E16]/5 hover:text-[#2C1E16] transition-colors"
                >
                  {v.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => openEdit(v)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#2C1E16]/40 hover:bg-[#2C1E16]/5 hover:text-[#2C1E16] transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(v)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── modal ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/55 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full md:max-w-xl bg-[#FDFBF7] rounded-t-3xl md:rounded-3xl shadow-2xl
                       max-h-[92dvh] overflow-y-auto"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#2C1E16]/8 flex items-center justify-center
                         text-[#6B4C3B] hover:bg-[#2C1E16]/12 hover:text-[#2C1E16] transition-colors"
            >
              <X size={16} strokeWidth={2} />
            </button>

            <form onSubmit={handleSave} className="px-6 pt-8 pb-8 flex flex-col gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#C68E58] mb-1">
                  {modal === "add" ? "Нова вакансія" : "Редагування"}
                </p>
                <h2 className="font-heading text-2xl font-bold text-[#2C1E16]">
                  {modal === "add" ? "Додати вакансію" : form.title || "Вакансія"}
                </h2>
              </div>

              <div className="grid grid-cols-[1fr_80px] gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#4A3428]">Назва посади</label>
                  <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
                    placeholder="Бариста" maxLength={80} className={INPUT} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#4A3428]">Емодзі</label>
                  <input type="text" value={form.emoji} onChange={(e) => set("emoji", e.target.value)}
                    placeholder="☕" maxLength={4} className={`${INPUT} text-center text-xl`} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#4A3428]">Опис</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  rows={3} maxLength={400} placeholder="Коротко про роль…" className={`${INPUT} resize-none`} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#4A3428]">
                  Вимоги <span className="normal-case font-normal text-[#2C1E16]/30">(кожна з нового рядка)</span>
                </label>
                <textarea value={form.requirements} onChange={(e) => set("requirements", e.target.value)}
                  rows={4} placeholder={"Досвід роботи з кавомашиною\nПривітність та комунікабельність"}
                  className={`${INPUT} resize-none font-mono text-xs leading-relaxed`} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#4A3428]">Графік</label>
                <input type="text" value={form.schedule} onChange={(e) => set("schedule", e.target.value)}
                  placeholder="Гнучкий графік, змінна робота" maxLength={120} className={INPUT} />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#4A3428]">Порядок</label>
                  <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))}
                    min={0} className={INPUT} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#4A3428]">Активна</label>
                  <button
                    type="button"
                    onClick={() => set("is_active", !form.is_active)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${form.is_active ? "bg-emerald-100 text-emerald-700" : "bg-[#2C1E16]/8 text-[#2C1E16]/50"}`}
                  >
                    {form.is_active ? "Так" : "Ні"}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-red-500 text-xs leading-relaxed">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 rounded-2xl bg-[#2C1E16] text-white text-sm font-semibold tracking-wide
                           hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
                           active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {saving
                  ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Збереження…</>
                  : <><Save size={15} strokeWidth={2.5} /> {modal === "add" ? "Додати" : "Зберегти зміни"}</>
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
