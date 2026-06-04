"use client";

import { useState } from "react";
import { Save, CheckCircle2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  initialValue: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const INPUT = `w-full px-3.5 py-2.5 rounded-xl border border-[#2C1E16]/15 bg-[#FDFBF7]
  text-sm text-[#2C1E16] placeholder:text-[#2C1E16]/25
  focus:outline-none focus:ring-2 focus:ring-[#C68E58]/35 focus:border-[#C68E58]
  transition-colors`;

export function AboutManager({ initialValue }: Props) {
  const [value,    setValue]    = useState(initialValue);
  const [status,   setStatus]   = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: "about_text", value: value.trim(), updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("saved");
    setTimeout(() => setStatus("idle"), 3000);
  }

  const saved   = status === "saved";
  const saving  = status === "saving";

  return (
    <form onSubmit={handleSubmit}>

      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#2C1E16]">Про нас</h1>
          <p className="text-[#2C1E16]/40 text-xs mt-1">
            Текст відображається у блоці «Про нас» на головній сторінці
          </p>
        </div>
        <SaveBtn saved={saved} saving={saving} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm shadow-[#2C1E16]/6 overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#2C1E16]/6 bg-[#FDFBF7]">
          <FileText size={16} strokeWidth={2} className="text-[#C68E58]" />
          <h2 className="font-heading text-[15px] font-bold text-[#2C1E16]">Текст блоку</h2>
        </div>
        <div className="px-6 py-5">
          <textarea
            value={value}
            onChange={(e) => { setValue(e.target.value); if (status === "saved") setStatus("idle"); }}
            rows={6}
            maxLength={1200}
            placeholder="Cava Bar — це простір, де час сповільнюється…"
            className={`${INPUT} resize-y leading-relaxed`}
          />
          <p className="text-[10px] text-[#2C1E16]/30 mt-1.5 text-right">
            {value.length} / 1200 символів
          </p>
        </div>
      </div>

      {status === "error" && errorMsg && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
          {errorMsg}
        </p>
      )}

      <div className="flex justify-end mt-5">
        <SaveBtn saved={saved} saving={saving} />
      </div>

    </form>
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
          : <><Save size={15} strokeWidth={2.5} /> Зберегти</>
      }
    </button>
  );
}
