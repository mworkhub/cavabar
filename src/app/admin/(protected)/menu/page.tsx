import { createClient } from "@/lib/supabase/server";
import { MenuManager } from "@/components/admin/MenuManager";
import type { MenuItem, MenuCategory } from "@/types/database";

export const metadata = { title: "Меню — Cava Bar Admin" };

export default async function AdminMenuPage() {
  const supabase = await createClient();

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from("menu_items")
      .select("*")
      .order("category_id")
      .order("sort_order"),
    supabase
      .from("menu_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <MenuManager
        items={(items as MenuItem[]) ?? []}
        categories={(categories as MenuCategory[]) ?? []}
      />
    </div>
  );
}
