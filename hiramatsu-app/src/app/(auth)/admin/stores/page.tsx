import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoreManagement } from "./StoreManagement";

export default async function AdminStoresPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-navy mb-6">店舗管理</h1>
        <StoreManagement initialStores={stores ?? []} />
      </div>
    </div>
  );
}
