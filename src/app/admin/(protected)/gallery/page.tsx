export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { GalleryManager } from "@/components/admin/GalleryManager";
import type { GalleryItem } from "@/types/database";

export default async function GalleryPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("gallery")
    .select("*")
    .order("sort_order", { ascending: true });

  const items = (data ?? []) as GalleryItem[];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <GalleryManager initialItems={items} />
    </div>
  );
}
