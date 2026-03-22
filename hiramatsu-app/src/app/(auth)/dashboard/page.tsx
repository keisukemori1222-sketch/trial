import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GrowthChart } from "@/components/GrowthChart";

export default async function DashboardPage() {
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
  if (!profile) redirect("/login");

  // ロール別にコンテンツを分岐
  if (profile.role === "admin") {
    return <AdminDashboard />;
  }
  if (profile.role === "manager") {
    return <ManagerDashboard userId={user.id} />;
  }
  return <StaffDashboard profile={profile} userId={user.id} />;
}

// ── Staff Dashboard ──
async function StaffDashboard({
  profile,
  userId,
}: {
  profile: { id: string; name: string; shokushu: string | null; current_step: number };
  userId: string;
}) {
  const supabase = createClient();
  const shokushuLabel = profile.shokushu ?? "未設定";
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // 成長グラフ用データ取得（過去のセッション別平均スコア）
  const { data: sessions } = await supabase
    .from("evaluation_sessions")
    .select("id, session_month")
    .eq("user_id", userId)
    .order("session_month", { ascending: true });

  let chartData: { month: string; avgSelf: number | null; avgMgr: number | null }[] = [];

  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map((s) => s.id);

    const [{ data: selfEvals }, { data: mgrEvals }] = await Promise.all([
      supabase
        .from("self_evaluations")
        .select("session_id, score")
        .in("session_id", sessionIds),
      supabase
        .from("manager_evaluations")
        .select("session_id, score")
        .in("session_id", sessionIds),
    ]);

    chartData = sessions.map((session) => {
      const selfScores = (selfEvals ?? [])
        .filter((e) => e.session_id === session.id)
        .map((e) => e.score);
      const mgrScores = (mgrEvals ?? [])
        .filter((e) => e.session_id === session.id)
        .map((e) => e.score);

      return {
        month: session.session_month,
        avgSelf:
          selfScores.length > 0
            ? Math.round((selfScores.reduce((a, b) => a + b, 0) / selfScores.length) * 10) / 10
            : null,
        avgMgr:
          mgrScores.length > 0
            ? Math.round((mgrScores.reduce((a, b) => a + b, 0) / mgrScores.length) * 10) / 10
            : null,
      };
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-navy mb-4">ダッシュボード</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoCard label="名前" value={profile.name} />
          <InfoCard label="職種" value={shokushuLabel} />
          <InfoCard label="現在のStep" value={`Step ${profile.current_step}`} />
        </div>
      </div>

      {/* 成長グラフ */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">成長グラフ</h2>
        <GrowthChart data={chartData} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          title="評価入力"
          description={`${currentMonth} の自己評価を入力`}
          href="/evaluation"
          color="teal"
        />
        <ActionCard
          title="面談準備"
          description="自己評価と上司評価のギャップを確認"
          href={`/staff/${profile.id}/gap`}
          color="teal"
        />
        <ActionCard
          title="行動計画"
          description="重点項目の行動計画を確認"
          href={`/staff/${profile.id}/action-plans`}
          color="gold"
        />
        <ActionCard
          title="月次振り返り"
          description="今月の振り返りを記入"
          href="/review"
          color="gold"
        />
      </div>
    </div>
  );
}

// ── Manager Dashboard ──
async function ManagerDashboard({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: staffList } = await supabase
    .from("users")
    .select("id, name, shokushu, current_step, store_id")
    .eq("manager_id", userId)
    .eq("role", "staff");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-navy mb-4">
          担当スタッフ一覧
        </h1>
        {(!staffList || staffList.length === 0) ? (
          <p className="text-navy-300">担当スタッフがいません</p>
        ) : (
          <div className="space-y-3">
            {staffList.map((staff) => (
              <Link
                key={staff.id}
                href={`/staff/${staff.id}`}
                className="block bg-navy-50 rounded-lg p-4 hover:bg-navy-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy">{staff.name}</p>
                    <p className="text-sm text-navy-400">
                      {staff.shokushu ?? "未設定"} / Step {staff.current_step}
                    </p>
                  </div>
                  <span className="text-teal text-sm">評価する →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Dashboard ──
function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-navy mb-4">管理画面</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <ActionCard
            title="ユーザー管理"
            description="スタッフ・マネージャーの登録・編集"
            href="/admin/users"
            color="teal"
          />
          <ActionCard
            title="店舗管理"
            description="店舗の登録・編集"
            href="/admin/stores"
            color="gold"
          />
        </div>
      </div>
    </div>
  );
}

// ── Components ──
function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy-50 rounded-lg p-4">
      <p className="text-xs text-navy-400 mb-1">{label}</p>
      <p className="text-lg font-semibold text-navy">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  color,
}: {
  title: string;
  description: string;
  href: string;
  color: "teal" | "gold";
}) {
  const colorClasses = {
    teal: "border-teal bg-teal-50 hover:bg-teal-100",
    gold: "border-gold bg-gold-50 hover:bg-gold-100",
  };

  return (
    <Link
      href={href}
      className={`block border-l-4 rounded-lg p-5 transition-colors ${colorClasses[color]}`}
    >
      <h3 className="font-semibold text-navy mb-1">{title}</h3>
      <p className="text-sm text-navy-400">{description}</p>
    </Link>
  );
}
