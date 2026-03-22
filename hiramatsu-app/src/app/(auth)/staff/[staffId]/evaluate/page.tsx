import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ManagerEvaluationForm } from "./ManagerEvaluationForm";
import { getItemsForShokushu, groupByCategory } from "@/lib/evaluation-items";
import type { Shokushu } from "@/types/database";
import Link from "next/link";

export default async function ManagerEvaluatePage({
  params,
  searchParams,
}: {
  params: { staffId: string };
  searchParams: { session?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!myProfile || (myProfile.role !== "manager" && myProfile.role !== "admin")) {
    redirect("/dashboard");
  }

  // 対象スタッフ
  const { data: staff } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.staffId)
    .single();

  if (!staff) redirect("/dashboard");

  // セッション取得
  let sessionId: string | undefined = searchParams.session;

  if (!sessionId) {
    // 最新のopenセッションを取得
    const { data: latestSession } = await supabase
      .from("evaluation_sessions")
      .select("id")
      .eq("user_id", params.staffId)
      .eq("status", "open")
      .order("session_month", { ascending: false })
      .limit(1)
      .single();

    if (!latestSession) {
      return (
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-navy-400">
            評価対象のセッションがありません。スタッフが自己評価を開始するのを待ってください。
          </p>
          <Link
            href={`/staff/${params.staffId}`}
            className="text-teal hover:underline mt-4 inline-block"
          >
            ← 戻る
          </Link>
        </div>
      );
    }
    sessionId = latestSession.id;
  }

  const resolvedSessionId = sessionId!;

  const { data: session } = await supabase
    .from("evaluation_sessions")
    .select("*")
    .eq("id", resolvedSessionId)
    .single();

  if (!session) redirect(`/staff/${params.staffId}`);

  // 既存の上司評価を取得
  const { data: existingEvals } = await supabase
    .from("manager_evaluations")
    .select("*")
    .eq("session_id", resolvedSessionId);

  // 職種に応じた評価項目
  const items = getItemsForShokushu(staff.shokushu as Shokushu);
  const groupedItems = groupByCategory(items);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-navy">
              上司評価入力：{staff.name}
            </h1>
            <p className="text-sm text-navy-400 mt-1">
              {session.session_month} / Step {session.step_num} /{" "}
              {staff.shokushu}
            </p>
          </div>
          <Link
            href={`/staff/${params.staffId}`}
            className="text-sm text-teal hover:text-teal-600 transition-colors"
          >
            ← 戻る
          </Link>
        </div>

        <ManagerEvaluationForm
          sessionId={resolvedSessionId}
          groupedItems={groupedItems}
          existingEvals={existingEvals ?? []}
          isClosed={session.status === "closed"}
        />
      </div>
    </div>
  );
}
