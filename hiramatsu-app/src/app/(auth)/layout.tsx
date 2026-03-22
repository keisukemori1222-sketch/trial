import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthNav } from "@/components/AuthNav";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // usersテーブルからプロフィール取得
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AuthNav user={profile} />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
