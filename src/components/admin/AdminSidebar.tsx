"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, UtensilsCrossed, Star, MessageSquare,
  Settings, LogOut, Menu, X, FileText, Briefcase, Bell,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin",           label: "Дашборд",     icon: LayoutDashboard },
  { href: "/admin/menu",      label: "Меню",         icon: UtensilsCrossed },
  { href: "/admin/reviews",   label: "Відгуки",      icon: Star },
  { href: "/admin/leads",     label: "Заявки",       icon: MessageSquare },
  { href: "/admin/content",   label: "Контент",      icon: FileText },
  { href: "/admin/vacancies", label: "Вакансії",     icon: Briefcase },
  { href: "/admin/settings",  label: "Налаштування", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const [isOpen,       setIsOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifCount,   setNotifCount]   = useState(0);
  const [notifLeads,   setNotifLeads]   = useState(0);
  const [notifReviews, setNotifReviews] = useState(0);
  const [notifApps,    setNotifApps]    = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    if (!dropdownOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    fetchCounts();
  }, [pathname]);

  async function fetchCounts() {
    const supabase = createClient();
    const [leadsRes, reviewsRes, appsRes] = await Promise.all([
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("is_processed", false),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("approved", false),
      supabase
        .from("job_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "Нова"),
    ]);

    const l = leadsRes.count  ?? 0;
    const r = reviewsRes.count ?? 0;
    const a = appsRes.count   ?? 0;
    setNotifLeads(l);
    setNotifReviews(r);
    setNotifApps(a);
    setNotifCount(l + r + a);
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Відкрити меню"
        className="lg:hidden fixed top-3.5 left-4 z-40 w-10 h-10 rounded-xl
                   bg-[#2C1E16] flex items-center justify-center text-white shadow-lg"
      >
        <Menu size={20} />
      </button>

      <div
        onClick={() => setIsOpen(false)}
        className={[
          "lg:hidden fixed inset-0 z-40 bg-black/55 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-64",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0 lg:w-60 lg:flex-shrink-0",
          "flex flex-col bg-[#2C1E16] h-full",
        ].join(" ")}
      >
        <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between w-full">
          <Link
            href="/admin"
            aria-label="Дашборд"
            className="bg-[#F9F8F6] px-3 py-2 rounded-xl h-12 flex items-center justify-center
                       transition-transform hover:scale-105"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.svg" alt="Cava Bar" className="h-full w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-1">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label={`Сповіщення${notifCount > 0 ? `: ${notifCount} нових` : ""}`}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Bell size={20} strokeWidth={2} className="text-white/70" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center
                                   rounded-full bg-orange-500 text-[10px] font-bold text-white leading-none">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-[#3D2B1F] rounded-2xl
                                shadow-xl shadow-black/30 border border-white/10 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-xs font-semibold text-white/45 uppercase tracking-wide">
                      Сповіщення
                    </p>
                  </div>
                  <div className="flex flex-col py-1">
                    <Link
                      href="/admin/leads"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageSquare size={15} className="text-white/55" />
                        <span className="text-sm text-white/80">Заявки</span>
                      </div>
                      {notifLeads > 0
                        ? <span className="text-xs font-semibold text-orange-400">{notifLeads} нових</span>
                        : <span className="text-xs text-white/30">Немає нових</span>
                      }
                    </Link>
                    <Link
                      href="/admin/reviews"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Star size={15} className="text-white/55" />
                        <span className="text-sm text-white/80">Відгуки</span>
                      </div>
                      {notifReviews > 0
                        ? <span className="text-xs font-semibold text-orange-400">{notifReviews} нових</span>
                        : <span className="text-xs text-white/30">Немає нових</span>
                      }
                    </Link>
                    <Link
                      href="/admin/vacancies"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Briefcase size={15} className="text-white/55" />
                        <span className="text-sm text-white/80">Кандидати</span>
                      </div>
                      {notifApps > 0
                        ? <span className="text-xs font-semibold text-orange-400">{notifApps} нових</span>
                        : <span className="text-xs text-white/30">Немає нових</span>
                      }
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Закрити меню"
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center
                         text-white/45 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                            transition-colors duration-100
                            ${active
                              ? "bg-[#C68E58] text-white shadow-sm"
                              : "text-white/55 hover:text-white hover:bg-white/10"
                            }`}
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 pt-3 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                       text-white/45 hover:text-white hover:bg-white/10 transition-colors duration-100"
          >
            <LogOut size={18} strokeWidth={2} />
            Вийти
          </button>
        </div>
      </aside>
    </>
  );
}
