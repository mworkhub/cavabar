export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { SettingsManager } from "@/components/admin/SettingsManager";
import type { SiteSettings } from "@/types/database";

export const metadata = { title: "Налаштування — Cava Bar Admin" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <SettingsManager settings={data as SiteSettings | null} />
    </div>
  );
}
