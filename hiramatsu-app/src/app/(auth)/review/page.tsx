import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReviewForm } from "./ReviewForm";

export default async function ReviewPage() {
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

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // 今月のセッションを取得
  const { data: session } = await supabase
    .from("evaluation_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("session_month", currentMonth)
    .single();

  if (!session) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-navy mb-4">月次振り返り</h1>
        <p className="text-navy-400">
          今月の評価セッションがまだありません。先に評価入力を行ってください。
        </p>
      </div>
    );
  }

  // 既存の振り返りを取得
  const { data: existingReview } = await supabase
    .from("monthly_reviews")
    .select("*")
    .eq("session_id", session.id)
    .eq("review_month", currentMonth)
    .single();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-navy">月次振り返り</h1>
          <p className="text-sm text-navy-400 mt-1">
            {currentMonth} / Step {session.step_num}
          </p>
        </div>

        <ReviewForm
          sessionId={session.id}
          reviewMonth={currentMonth}
          existingReview={existingReview}
          isManager={false}
        />
      </div>
    </div>
  );
}
