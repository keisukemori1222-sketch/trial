import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReviewForm } from "@/app/(auth)/review/ReviewForm";
import Link from "next/link";

export default async function StaffReviewPage({
  params,
  searchParams,
}: {
  params: { staffId: string };
  searchParams: { session?: string; month?: string };
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
      .select("id, session_month")
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

  if (!session) redirect(`/staff/${params.staffId}`);

  const reviewMonth = searchParams.month ?? session.session_month;

  const { data: existingReview } = await supabase
    .from("monthly_reviews")
    .select("*")
    .eq("session_id", resolvedSessionId)
    .eq("review_month", reviewMonth)
    .single();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-navy">
              月次振り返り：{staff.name}
            </h1>
            <p className="text-sm text-navy-400 mt-1">
              {reviewMonth} / Step {session.step_num}
            </p>
          </div>
          <Link
            href={`/staff/${params.staffId}`}
            className="text-sm text-teal hover:text-teal-600 transition-colors"
          >
            ← 戻る
          </Link>
        </div>

        <ReviewForm
          sessionId={resolvedSessionId}
          reviewMonth={reviewMonth}
          existingReview={existingReview}
          isManager={true}
        />
      </div>
    </div>
  );
}
