import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase";
import { HistoryClient } from "@/components/dashboard/history-client";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/history");

  const client = createServiceClient();
  const { data, count } = await client
    .from("user_searches")
    .select("id, domain_name, searched_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("searched_at", { ascending: false })
    .range(0, 19);

  return <HistoryClient initialData={data ?? []} initialTotal={count ?? 0} />;
}
