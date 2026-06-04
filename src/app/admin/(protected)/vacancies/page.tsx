export const dynamic   = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { VacanciesManager } from "@/components/admin/VacanciesManager";
import { ApplicationsManager } from "@/components/admin/ApplicationsManager";
import type { Vacancy } from "@/types/database";
import type { JobApplication } from "@/components/admin/ApplicationsManager";

export default async function AdminVacanciesPage() {
  const supabase = await createClient();

  const [{ data: vacancies }, { data: applications }] = await Promise.all([
    supabase
      .from("vacancies")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
      <VacanciesManager initialVacancies={(vacancies ?? []) as Vacancy[]} />
      <ApplicationsManager initialApplications={(applications ?? []) as JobApplication[]} />
    </div>
  );
}
