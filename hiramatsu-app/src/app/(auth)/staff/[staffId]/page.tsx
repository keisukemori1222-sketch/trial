import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StaffDetailPage({
  params,
}: {
  params: { staffId: string };
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

  // 対象スタッフ情報
  const { data: staff } = await supabase
    .from("users")
    .select("*, stores(name)")
    .eq("id", params.staffId)
    .single();

  if (!staff) redirect("/dashboard");

  // スタッフの評価セッション一覧
  const { data: sessions } = await supabase
    .from("evaluation_sessions")
    .select("*")
    .eq("user_id", params.staffId)
    .order("session_month", { ascending: false });

  return (
    <div className="space-y-6">
      {/* スタッフ情報 */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-navy">{staff.name}</h1>
            <p className="text-sm text-navy-400 mt-1">
              {staff.shokushu ?? "未設定"} / Step {staff.current_step}
              {staff.stores && ` / ${(staff.stores as { name: string }).name}`}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-teal hover:text-teal-600 transition-colors"
          >
            ← 戻る
          </Link>
        </div>
      </div>

      {/* セッション一覧 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">
          評価セッション
        </h2>

        {!sessions || sessions.length === 0 ? (
          <p className="text-navy-300">評価セッションがありません</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-navy-100 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy">
                      {session.session_month}
                    </p>
                    <p className="text-sm text-navy-400">
                      Step {session.step_num} /{" "}
                      <span
                        className={
                          session.status === "closed"
                            ? "text-navy-400"
                            : "text-teal"
                        }
                      >
                        {session.status === "closed" ? "確定済み" : "入力中"}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/staff/${params.staffId}/evaluate?session=${session.id}`}
                      className="px-4 py-2 bg-teal text-white text-sm rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      評価する
                    </Link>
                    <Link
                      href={`/staff/${params.staffId}/gap?session=${session.id}`}
                      className="px-4 py-2 border border-navy-200 text-navy text-sm rounded-lg hover:bg-navy-50 transition-colors"
                    >
                      ギャップ確認
                    </Link>
                    <Link
                      href={`/staff/${params.staffId}/action-plans?session=${session.id}`}
                      className="px-4 py-2 border border-gold text-gold-700 text-sm rounded-lg hover:bg-gold-50 transition-colors"
                    >
                      行動計画
                    </Link>
                    <Link
                      href={`/staff/${params.staffId}/review?session=${session.id}`}
                      className="px-4 py-2 border border-gold text-gold-700 text-sm rounded-lg hover:bg-gold-50 transition-colors"
                    >
                      振り返り
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
