import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getItemsForShokushu } from "@/lib/evaluation-items";
import type { Shokushu } from "@/types/database";
import Link from "next/link";
import { GapDisplay } from "./GapDisplay";

export default async function GapPage({
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

  // staff が自分のギャップを見る場合 or manager/admin が見る場合
  const isOwnProfile = user.id === params.staffId;
  const isManagerOrAdmin =
    myProfile.role === "manager" || myProfile.role === "admin";

  if (!isOwnProfile && !isManagerOrAdmin) {
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
  let sessionId = searchParams.session;

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

  const { data: session } = await supabase
    .from("evaluation_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (!session) redirect("/dashboard");

  // 自己評価と上司評価を取得
  const [{ data: selfEvals }, { data: mgrEvals }] = await Promise.all([
    supabase
      .from("self_evaluations")
      .select("*")
      .eq("session_id", sessionId),
    supabase
      .from("manager_evaluations")
      .select("*")
      .eq("session_id", sessionId),
  ]);

  // 評価項目マスタ
  const items = getItemsForShokushu(staff.shokushu as Shokushu);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-navy">
              評価ギャップ確認：{staff.name}
            </h1>
            <p className="text-sm text-navy-400 mt-1">
              {session.session_month} / Step {session.step_num} /{" "}
              {staff.shokushu}
            </p>
          </div>
          <Link
            href={isOwnProfile ? "/dashboard" : `/staff/${params.staffId}`}
            className="text-sm text-teal hover:text-teal-600 transition-colors"
          >
            ← 戻る
          </Link>
        </div>

        <GapDisplay
          items={items}
          selfEvals={selfEvals ?? []}
          mgrEvals={mgrEvals ?? []}
        />
      </div>
    </div>
  );
}
