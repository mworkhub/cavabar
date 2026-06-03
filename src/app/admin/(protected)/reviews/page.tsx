export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { ReviewsManager } from "@/components/admin/ReviewsManager";
import type { Review } from "@/types/database";

export const metadata = { title: "Відгуки — Cava Bar Admin" };

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <ReviewsManager reviews={(reviews as Review[]) ?? []} />
    </div>
  );
}
