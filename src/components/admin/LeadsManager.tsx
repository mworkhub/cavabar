"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Trash2, CheckCheck, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/types/database";

interface Props {
  leads: Lead[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_LABEL: Record<string, string> = {
  contact: "Контакт",
  order:   "Замовлення",
};

export function LeadsManager({ leads: initial }: Props) {
  const router = useRouter();
  const [leads, setLeads]           = useState(initial);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const newCount  = leads.filter((l) => !l.is_processed).length;
  const doneCount = leads.filter((l) =>  l.is_processed).length;

  async function handleToggle(lead: Lead) {
    setTogglingId(lead.id);

    /* optimistic */
    setLeads((prev) =>
      prev.map((l) => l.id === lead.id ? { ...l, is_processed: !l.is_processed } : l)
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .update({ is_processed: !lead.is_processed })
      .eq("id", lead.id);

    if (error) {
      /* revert */
      setLeads((prev) =>
        prev.map((l) => l.id === lead.id ? { ...l, is_processed: lead.is_processed } : l)
      );
    }

    setTogglingId(null);
  }

  async function handleDelete(lead: Lead) {
    const ok = window.confirm(`Видалити заявку від "${lead.name}"? Цю дію не можна скасувати.`);
    if (!ok) return;

    setDeletingId(lead.id);
    const supabase = createClient();
    await supabase.from("leads").delete().eq("id", lead.id);

    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setDeletingId(null);
    router.refresh();
  }

  return (
    <>
      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#2C1E16]">Заявки від клієнтів</h1>
          <p className="text-[#2C1E16]/45 text-sm mt-0.5">
            Всього: {leads.length} · Нових: {newCount} · Оброблено: {doneCount}
          </p>
        </div>
      </div>

      {/* new leads banner */}
      {newCount > 0 && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 border border-sky-200">
          <Inbox size={16} className="text-sky-600 flex-shrink-0" />
          <span className="text-sky-700 text-sm font-medium">
            {newCount} {newCount === 1 ? "нова заявка потребує" : "нових заявки потребують"} обробки
          </span>
        </div>
      )}

      {/* list */}
      <div className="bg-white rounded-2xl shadow-sm shadow-[#2C1E16]/6 overflow-hidden">
        {leads.length === 0 ? (
          <div className="py-20 text-center text-[#2C1E16]/35 text-sm">
            Заявок ще немає.
          </div>
        ) : (
          <div className="divide-y divide-[#2C1E16]/6">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors
                  ${!lead.is_processed ? "bg-sky-50/50" : "hover:bg-[#FDFBF7]"}`}
              >
                {/* avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                                 font-heading font-bold text-sm flex-shrink-0 mt-0.5
                                 ${lead.is_processed ? "bg-[#F2EAE0] text-[#C68E58]" : "bg-sky-100 text-sky-700"}`}>
                  {lead.name.charAt(0).toUpperCase()}
                </div>

                {/* content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[#2C1E16]">{lead.name}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5
                                     rounded-full bg-[#2C1E16]/8 text-[#2C1E16]/50">
                      {TYPE_LABEL[lead.type] ?? lead.type}
                    </span>
                    <span className="text-xs text-[#2C1E16]/35">{formatDate(lead.created_at)}</span>
                  </div>

                  {/* phone */}
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-1.5 mt-1 text-sm text-[#C68E58]
                                 font-medium hover:underline"
                    >
                      <Phone size={12} strokeWidth={2.5} />
                      {lead.phone}
                    </a>
                  )}

                  {/* message */}
                  {lead.message && (
                    <p className="text-sm text-[#4A3C31] mt-1.5 leading-relaxed line-clamp-3">
                      {lead.message}
                    </p>
                  )}
                </div>

                {/* actions */}
                <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                  <button
                    onClick={() => handleToggle(lead)}
                    disabled={togglingId === lead.id}
                    title={lead.is_processed ? "Позначити як нову" : "Позначити як оброблену"}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                transition-colors disabled:opacity-50
                                ${lead.is_processed
                                  ? "bg-[#2C1E16]/8 text-[#2C1E16]/50 hover:bg-[#2C1E16]/12"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}
                  >
                    <CheckCheck size={13} strokeWidth={2.5} />
                    {lead.is_processed ? "Оброблено" : "Обробити"}
                  </button>
                  <button
                    onClick={() => handleDelete(lead)}
                    disabled={deletingId === lead.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center
                               text-[#2C1E16]/35 hover:text-red-600 hover:bg-red-50
                               transition-colors disabled:opacity-40"
                    aria-label="Видалити заявку"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
