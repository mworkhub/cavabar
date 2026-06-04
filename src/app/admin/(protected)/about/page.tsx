import { createClient } from "@/lib/supabase/server";
import { AboutManager } from "@/components/admin/AboutManager";

export default async function AdminAboutPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", "about_text")
    .single();

  const DEFAULT =
    "Cava Bar — це простір, де час сповільнюється. Ми варимо каву зі спеціально підібраних купажів від локальних обсмажувачів, подаємо свіжу випічку щодня і щиро радіємо кожному, хто до нас завітає.";

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <AboutManager initialValue={data?.value ?? DEFAULT} />
    </div>
  );
}
