import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getItemsForShokushu } from "@/lib/evaluation-items";
import type { Shokushu } from "@/types/database";
import Link from "next/link";
import { ActionPlanForm } from "./ActionPlanForm";

export default async function ActionPlansPage({
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

  if (!myProfile) redirect("/login");

  const isOwnProfile = user.id === params.staffId;
  const isManagerOrAdmin =
    myProfile.role === "manager" || myProfile.role === "admin";

  if (!isOwnProfile && !isManagerOrAdmin) {
    redirect("/dashboard");
  }

  const { data: staff } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.staffId)
    .single();

  if (!staff) redirect("/dashboard");

  // セッション取得
  let sessionId: string | undefined = searchParams.session;

  if (!sessionId) {
    const { data: latestSession } = await supabase
      .from("evaluation_sessions")
      .select("id")
      .eq("user_id", params.staffId)
      .order("session_month", { ascending: false })
      .limit(1)
      .single();

    if (!latestSession) {
      return (
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-navy-400">評価セッションがありません</p>
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

  if (!session) redirect("/dashboard");

  // ギャップの大きい項目を取得するため自己評価と上司評価を取得
  const [{ data: selfEvals }, { data: mgrEvals }, { data: existingPlans }] =
    await Promise.all([
      supabase
        .from("self_evaluations")
        .select("*")
        .eq("session_id", resolvedSessionId),
      supabase
        .from("manager_evaluations")
        .select("*")
        .eq("session_id", resolvedSessionId),
      supabase
        .from("action_plans")
        .select("*")
        .eq("session_id", resolvedSessionId),
    ]);

  // 全評価項目
  const items = getItemsForShokushu(staff.shokushu as Shokushu);

  // ギャップ情報を構築
  const selfMap = new Map((selfEvals ?? []).map((e) => [e.item_id, e]));
  const mgrMap = new Map((mgrEvals ?? []).map((e) => [e.item_id, e]));

  const gapItems = items
    .map((item) => {
      const self = selfMap.get(item.item_id);
      const mgr = mgrMap.get(item.item_id);
      const selfScore = self?.score ?? null;
      const mgrScore = mgr?.score ?? null;
      const gap =
        selfScore !== null && mgrScore !== null ? selfScore - mgrScore : null;
      return { ...item, selfScore, mgrScore, gap, isPriority: self?.is_priority ?? false };
    })
    .filter((item) => {
      // 重点項目 or ギャップ大きい項目を優先表示
      return item.isPriority || (item.gap !== null && Math.abs(item.gap) >= 2);
    });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-navy">
              行動計画：{staff.name}
            </h1>
            <p className="text-sm text-navy-400 mt-1">
              {session.session_month} / Step {session.step_num}
            </p>
          </div>
          <Link
            href={isOwnProfile ? "/dashboard" : `/staff/${params.staffId}`}
            className="text-sm text-teal hover:text-teal-600 transition-colors"
          >
            ← 戻る
          </Link>
        </div>

        {gapItems.length === 0 && (!existingPlans || existingPlans.length === 0) ? (
          <p className="text-navy-300">
            重点項目またはギャップの大きい項目がありません。評価を入力してから行動計画を作成してください。
          </p>
        ) : (
          <ActionPlanForm
            sessionId={resolvedSessionId}
            gapItems={gapItems}
            existingPlans={existingPlans ?? []}
            isManager={isManagerOrAdmin}
          />
        )}
      </div>
    </div>
  );
}
