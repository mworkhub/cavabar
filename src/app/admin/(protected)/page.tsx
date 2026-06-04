export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UtensilsCrossed, Star, MessageSquare, TrendingUp, ArrowRight, Phone } from "lucide-react";
import type { Review, Lead } from "@/types/database";
import { QRCodeBlock } from "@/components/admin/QRCodeBlock";

export const metadata = { title: "Дашборд — Cava Bar Admin" };

async function fetchDashboardData() {
  const supabase = await createClient();

  const [
    menuRes,
    pendingRes,
    leadsRes,
    allReviewsRes,
    recentReviewsRes,
    recentLeadsRes,
  ] = await Promise.all([
    supabase.from("menu_items").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("approved", false),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("id,author_name,rating,text,approved,created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("leads").select("id,name,phone,message,is_processed,created_at").order("created_at", { ascending: false }).limit(4),
  ]);

  return {
    menuCount:      menuRes.count          ?? 0,
    pendingCount:   pendingRes.count       ?? 0,
    leadsCount:     leadsRes.count         ?? 0,
    reviewsTotal:   allReviewsRes.count    ?? 0,
    recentReviews:  (recentReviewsRes.data as Pick<Review, "id" | "author_name" | "rating" | "text" | "approved" | "created_at">[]) ?? [],
    recentLeads:    (recentLeadsRes.data   as Pick<Lead,   "id" | "name" | "phone" | "message" | "is_processed" | "created_at">[])  ?? [],
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < rating ? "#C68E58" : "#E5DDD5"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "2-digit", month: "short" });
}

export default async function AdminDashboardPage() {
  const data = await fetchDashboardData();

  const CARDS = [
    {
      label: "Активних страв",
      value: data.menuCount,
      icon: UtensilsCrossed,
      accent: "#C68E58",
      bg: "#FDF4EB",
      hint: "у меню зараз",
    },
    {
      label: "Відгуків на модерації",
      value: data.pendingCount,
      icon: Star,
      accent: data.pendingCount > 0 ? "#D97706" : "#16A34A",
      bg: data.pendingCount > 0 ? "#FFFBEB" : "#F0FDF4",
      hint: "потребують перевірки",
    },
    {
      label: "Всього відгуків",
      value: data.reviewsTotal,
      icon: TrendingUp,
      accent: "#6366F1",
      bg: "#EEF2FF",
      hint: "за весь час",
    },
    {
      label: "Заявок від гостей",
      value: data.leadsCount,
      icon: MessageSquare,
      accent: "#0891B2",
      bg: "#ECFEFF",
      hint: "через форму контактів",
    },
  ];

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">

      {/* header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[#2C1E16]">Панель керування</h1>
        <p className="text-[#2C1E16]/45 text-sm mt-1">Cava Bar · загальна статистика</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {CARDS.map(({ label, value, icon: Icon, accent, bg, hint }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm shadow-[#2C1E16]/6 flex flex-col gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: bg }}
            >
              <Icon size={20} strokeWidth={2} style={{ color: accent }} />
            </div>
            <div>
              <p className="font-heading text-4xl font-bold leading-none" style={{ color: accent }}>
                {value}
              </p>
              <p className="text-[#2C1E16] text-sm font-semibold mt-2 leading-snug">{label}</p>
              <p className="text-[#2C1E16]/40 text-xs mt-0.5">{hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* QR code */}
      <div className="mb-4">
        <QRCodeBlock />
      </div>

      {/* recent panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── recent reviews ── */}
        <div className="bg-white rounded-2xl shadow-sm shadow-[#2C1E16]/6 flex flex-col">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#2C1E16]/6">
            <h2 className="font-heading text-base font-bold text-[#2C1E16]">Останні відгуки</h2>
            <Link
              href="/admin/reviews"
              className="flex items-center gap-1 text-xs font-medium text-[#C68E58] hover:opacity-75 transition-opacity"
            >
              Всі <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </div>

          {data.recentReviews.length === 0 ? (
            <p className="px-6 py-8 text-sm text-[#2C1E16]/35 text-center">Відгуків ще немає</p>
          ) : (
            <div className="divide-y divide-[#2C1E16]/5">
              {data.recentReviews.map((r) => (
                <div key={r.id} className={`flex items-start gap-3 px-6 py-3.5 ${!r.approved ? "bg-amber-50/60" : ""}`}>
                  <div className="w-7 h-7 rounded-lg bg-[#F2EAE0] flex items-center justify-center
                                  text-[#C68E58] font-heading font-bold text-xs flex-shrink-0 mt-0.5">
                    {r.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#2C1E16]">{r.author_name}</span>
                      <Stars rating={r.rating} />
                      <span className="text-[10px] text-[#2C1E16]/35">{formatDate(r.created_at)}</span>
                    </div>
                    <p className="text-xs text-[#4A3C31]/70 mt-0.5 line-clamp-1">{r.text}</p>
                  </div>
                  <span className={`flex-shrink-0 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full
                    ${r.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {r.approved ? "Опубл." : "Очікує"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── recent leads ── */}
        <div className="bg-white rounded-2xl shadow-sm shadow-[#2C1E16]/6 flex flex-col">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#2C1E16]/6">
            <h2 className="font-heading text-base font-bold text-[#2C1E16]">Останні заявки</h2>
            <Link
              href="/admin/leads"
              className="flex items-center gap-1 text-xs font-medium text-[#C68E58] hover:opacity-75 transition-opacity"
            >
              Всі <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </div>

          {data.recentLeads.length === 0 ? (
            <p className="px-6 py-8 text-sm text-[#2C1E16]/35 text-center">Заявок ще немає</p>
          ) : (
            <div className="divide-y divide-[#2C1E16]/5">
              {data.recentLeads.map((l) => (
                <div key={l.id} className={`flex items-start gap-3 px-6 py-3.5 ${!l.is_processed ? "bg-sky-50/50" : ""}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                                   font-heading font-bold text-xs flex-shrink-0 mt-0.5
                                   ${l.is_processed ? "bg-[#F2EAE0] text-[#C68E58]" : "bg-sky-100 text-sky-700"}`}>
                    {l.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#2C1E16]">{l.name}</span>
                      {l.phone && (
                        <span className="flex items-center gap-0.5 text-[10px] text-[#C68E58] font-medium">
                          <Phone size={9} strokeWidth={2.5} />
                          {l.phone}
                        </span>
                      )}
                      <span className="text-[10px] text-[#2C1E16]/35">{formatDate(l.created_at)}</span>
                    </div>
                    {l.message && (
                      <p className="text-xs text-[#4A3C31]/70 mt-0.5 line-clamp-1">{l.message}</p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full
                    ${l.is_processed ? "bg-[#2C1E16]/8 text-[#2C1E16]/50" : "bg-sky-50 text-sky-700"}`}>
                    {l.is_processed ? "Оброблено" : "Нова"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
