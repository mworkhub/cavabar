export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { LeadsManager } from "@/components/admin/LeadsManager";
import type { Lead } from "@/types/database";

export const metadata = { title: "Заявки — Cava Bar Admin" };

export default async function AdminLeadsPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <LeadsManager leads={(leads as Lead[]) ?? []} />
    </div>
  );
}
