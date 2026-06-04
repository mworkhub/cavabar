import { createClient } from "@/lib/supabase/server";
import { ContentManager } from "@/components/admin/ContentManager";

const DEFAULTS = {
  hero_title:
    "Це не лише\nпро каву —\nце про любов",
  hero_subtitle:
    "Затишне місце у серці Бродів, де кожна чашка приготована з душею і щирою турботою.",
  about_text:
    "Cava Bar — це простір, де час сповільнюється. Ми варимо каву зі спеціально підібраних купажів від локальних обсмажувачів, подаємо свіжу випічку щодня і щиро радіємо кожному, хто до нас завітає.",
  about_history:
    "Ідея створення закладу крутилась в голові дуже давно. Але якось не було ні часу, ні сміливості зробити перший крок...\n\nCava Bar — це затишний простір у самому серці Бродів, де час ніби сповільнюється. Ми відкрилися з однією простою ідеєю: зробити якісну каву доступною для кожного, хто живе або буває в нашому місті.\n\nМи варимо каву зі спеціально підібраних купажів від локальних українських обсмажувачів. Рецептури відточуються щодня — ми не зупиняємось на досягнутому і завжди шукаємо ідеальний баланс смаку та аромату в кожній чашці.\n\nДля нас важливо не просто подати напій, а створити момент. Теплий. Справжній. Тому кожен відвідувач тут — не клієнт, а гість, якому раді завжди і безумовно.\n\nЗ часом Cava Bar перетворився на щось більше, ніж просто кав'ярня. Це місце, де зустрічаються друзі, де народжуються ідеї, де можна просто помовчати наодинці з собою — і це теж буде добре.",
};

export default async function AdminContentPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .in("key", ["hero_title", "hero_subtitle", "about_text", "about_history"]);

  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <ContentManager
        initial={{
          hero_title:    map.hero_title    ?? DEFAULTS.hero_title,
          hero_subtitle: map.hero_subtitle ?? DEFAULTS.hero_subtitle,
          about_text:    map.about_text    ?? DEFAULTS.about_text,
          about_history: map.about_history ?? DEFAULTS.about_history,
        }}
      />
    </div>
  );
}
