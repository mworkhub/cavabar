"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Star, MessageSquare, Settings, LogOut, Coffee, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin",          label: "Дашборд",      icon: LayoutDashboard },
  { href: "/admin/menu",     label: "Меню",          icon: UtensilsCrossed },
  { href: "/admin/reviews",  label: "Відгуки",       icon: Star },
  { href: "/admin/leads",    label: "Заявки",        icon: MessageSquare },
  { href: "/admin/gallery",  label: "Галерея",       icon: ImageIcon },
  { href: "/admin/settings", label: "Налаштування",  icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <aside className="w-60 flex flex-col bg-[#2C1E16] h-full flex-shrink-0">

      {/* brand */}
      <div className="px-6 py-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#C68E58] flex items-center justify-center flex-shrink-0">
          <Coffee size={16} strokeWidth={2.5} className="text-white" />
        </div>
        <div>
          <p className="text-white font-heading text-[15px] font-bold leading-none">Cava Bar</p>
          <p className="text-white/35 text-[11px] mt-0.5 leading-none">Admin Panel</p>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-100
                ${active
                  ? "bg-[#C68E58] text-white shadow-sm"
                  : "text-white/55 hover:text-white hover:bg-white/10"
                }`}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* sign out */}
      <div className="px-3 pb-5 pt-3 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-white/45 hover:text-white hover:bg-white/10 transition-colors duration-100"
        >
          <LogOut size={17} strokeWidth={2} />
          Вийти
        </button>
      </div>

    </aside>
  );
}
