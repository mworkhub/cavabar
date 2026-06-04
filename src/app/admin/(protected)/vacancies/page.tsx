import { createClient } from "@/lib/supabase/server";
import { VacanciesManager } from "@/components/admin/VacanciesManager";
import type { Vacancy } from "@/types/database";

export default async function AdminVacanciesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vacancies")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <VacanciesManager initialVacancies={(data ?? []) as Vacancy[]} />
    </div>
  );
}
