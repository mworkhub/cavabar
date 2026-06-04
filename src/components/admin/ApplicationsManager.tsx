"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface JobApplication {
  id: string;
  name: string;
  phone: string;
  position: string;
  about: string | null;
  status: string;
  created_at: string;
}

interface Props {
  initialApplications: JobApplication[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function ApplicationsManager({ initialApplications }: Props) {
  const [apps, setApps] = useState<JobApplication[]>(initialApplications);
  const [marking, setMarking] = useState<string | null>(null);

  async function markRead(id: string) {
    setMarking(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("job_applications")
      .update({ status: "Прочитано" })
      .eq("id", id);

    if (!error) {
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "Прочитано" } : a));
    }
    setMarking(null);
  }

  const newCount = apps.filter((a) => a.status === "Нова").length;

  return (
    <div className="mt-12">
      {/* header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-heading text-2xl font-bold text-[#2C1E16]">Відгуки кандидатів</h2>
        {newCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
            {newCount} нових
          </span>
        )}
      </div>

      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-[#2C1E16]/40 text-sm">
          Заявок ще немає
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map((app) => {
            const isNew = app.status === "Нова";
            return (
              <div
                key={app.id}
                className={`bg-white rounded-2xl shadow-sm shadow-[#2C1E16]/6 p-5
                            ${isNew ? "border-l-4 border-orange-400" : "border-l-4 border-transparent"}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* main info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                     font-heading font-bold text-sm flex-shrink-0
                                     ${isNew ? "bg-orange-100 text-orange-600" : "bg-[#F2EAE0] text-[#C68E58]"}`}>
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#2C1E16] text-sm">{app.name}</span>
                        {isNew && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wide">
                            Нова
                          </span>
                        )}
                        <span className="text-[11px] text-[#2C1E16]/35">{formatDate(app.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <a
                          href={`tel:${app.phone}`}
                          className="text-xs text-[#C68E58] font-medium hover:underline"
                        >
                          {app.phone}
                        </a>
                        <span className="text-xs text-[#2C1E16]/50">
                          Посада: <span className="font-medium text-[#2C1E16]">{app.position}</span>
                        </span>
                      </div>
                      {app.about && (
                        <p className="text-sm text-[#4A3C31] mt-2 leading-relaxed whitespace-pre-line">
                          {app.about}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* action */}
                  {isNew && (
                    <button
                      onClick={() => markRead(app.id)}
                      disabled={marking === app.id}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl
                                 border border-emerald-200 bg-emerald-50 text-emerald-700
                                 text-xs font-semibold hover:bg-emerald-100 transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={13} strokeWidth={2.5} />
                      {marking === app.id ? "…" : "Прочитано"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
