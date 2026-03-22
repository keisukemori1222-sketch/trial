import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserManagement } from "./UserManagement";

export default async function AdminUsersPage() {
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

  const { data: users } = await supabase
    .from("users")
    .select("*, stores(name)")
    .order("created_at", { ascending: false });

  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .order("name");

  const { data: managers } = await supabase
    .from("users")
    .select("id, name")
    .eq("role", "manager");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-navy mb-6">ユーザー管理</h1>
        <UserManagement
          initialUsers={users ?? []}
          stores={stores ?? []}
          managers={managers ?? []}
        />
      </div>
    </div>
  );
}
