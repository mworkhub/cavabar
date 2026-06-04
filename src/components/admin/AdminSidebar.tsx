"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, UtensilsCrossed, Star, MessageSquare,
  Settings, LogOut, Coffee, Menu, X, FileText, Briefcase,
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  /* close on route change */
  useEffect(() => { setIsOpen(false); }, [pathname]);

  /* body scroll lock while open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <>
      {/* ── Mobile hamburger trigger ── */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Відкрити меню"
        className="lg:hidden fixed top-3.5 left-4 z-40 w-10 h-10 rounded-xl
                   bg-[#2C1E16] flex items-center justify-center text-white shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* ── Backdrop ── */}
      <div
        onClick={() => setIsOpen(false)}
        className={[
          "lg:hidden fixed inset-0 z-40 bg-black/55 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* ── Sidebar panel ── */}
      <aside
        className={[
          /* mobile: fixed overlay, slides in/out */
          "fixed inset-y-0 left-0 z-50 w-64",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          /* desktop: static in-flow column */
          "lg:static lg:translate-x-0 lg:w-60 lg:flex-shrink-0",
          "flex flex-col bg-[#2C1E16] h-full",
        ].join(" ")}
      >
        {/* brand */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#C68E58] flex items-center justify-center shrink-0">
              <Coffee size={16} strokeWidth={2.5} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-heading text-[15px] font-bold leading-none">Cava Bar</p>
              <p className="text-white/35 text-[11px] mt-0.5 leading-none">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Закрити меню"
            className="lg:hidden shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                       text-white/45 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* nav */}
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

        {/* sign out */}
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
