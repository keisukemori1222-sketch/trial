import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EvaluationForm } from "./EvaluationForm";
import { getItemsForShokushu, groupByCategory } from "@/lib/evaluation-items";
import type { Shokushu } from "@/types/database";

export default async function EvaluationPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "staff") {
    redirect("/dashboard");
  }

  // 今月のセッションを取得 or 作成
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  let { data: session } = await supabase
    .from("evaluation_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("session_month", currentMonth)
    .single();

  if (!session) {
    const { data: newSession } = await supabase
      .from("evaluation_sessions")
      .insert({
        user_id: user.id,
        step_num: profile.current_step,
        session_month: currentMonth,
        status: "open",
      })
      .select()
      .single();
    session = newSession;
  }

  if (!session) {
    redirect("/dashboard");
  }

  // 既存の自己評価を取得
  const { data: existingEvals } = await supabase
    .from("self_evaluations")
    .select("*")
    .eq("session_id", session.id);

  // 職種に応じた評価項目を取得
  const items = getItemsForShokushu(profile.shokushu as Shokushu);
  const groupedItems = groupByCategory(items);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-navy">自己評価入力</h1>
            <p className="text-sm text-navy-400 mt-1">
              {currentMonth} / Step {profile.current_step} / {profile.shokushu}
            </p>
          </div>
          {session.status === "closed" && (
            <span className="px-3 py-1 bg-navy-100 text-navy-600 text-sm rounded-full">
              確定済み
            </span>
          )}
        </div>

        <EvaluationForm
          sessionId={session.id}
          groupedItems={groupedItems}
          existingEvals={existingEvals ?? []}
          isClosed={session.status === "closed"}
        />
      </div>
    </div>
  );
}
