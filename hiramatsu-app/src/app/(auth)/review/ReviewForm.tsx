"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { MonthlyReview } from "@/types/database";

export function ReviewForm({
  sessionId,
  reviewMonth,
  existingReview,
  isManager,
}: {
  sessionId: string;
  reviewMonth: string;
  existingReview: MonthlyReview | null;
  isManager: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [selfComment, setSelfComment] = useState(
    existingReview?.self_comment ?? ""
  );
  const [managerFeedback, setManagerFeedback] = useState(
    existingReview?.manager_feedback ?? ""
  );
  const [nextDeclaration, setNextDeclaration] = useState(
    existingReview?.next_declaration ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const data = {
      session_id: sessionId,
      review_month: reviewMonth,
      self_comment: selfComment || null,
      manager_feedback: managerFeedback || null,
      next_declaration: nextDeclaration || null,
    };

    let error;

    if (existingReview) {
      ({ error } = await supabase
        .from("monthly_reviews")
        .update(data)
        .eq("id", existingReview.id));
    } else {
      ({ error } = await supabase.from("monthly_reviews").insert(data));
    }

    if (error) {
      setMessage(`保存エラー: ${error.message}`);
    } else {
      setMessage("保存しました");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* 自己振り返り */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">
          今月の振り返り
        </label>
        <p className="text-xs text-navy-400 mb-2">
          今月できたこと、できなかったこと、気づいたことを自由に記入してください
        </p>
        <textarea
          value={selfComment}
          onChange={(e) => setSelfComment(e.target.value)}
          disabled={isManager}
          rows={5}
          placeholder="今月の振り返りを記入..."
          className="w-full px-4 py-3 border border-navy-100 rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none disabled:bg-navy-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* 来月の宣言 */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">
          来月の宣言
        </label>
        <p className="text-xs text-navy-400 mb-2">
          来月特に意識して取り組むことを宣言してください
        </p>
        <textarea
          value={nextDeclaration}
          onChange={(e) => setNextDeclaration(e.target.value)}
          disabled={isManager}
          rows={3}
          placeholder="来月の宣言を記入..."
          className="w-full px-4 py-3 border border-navy-100 rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none disabled:bg-navy-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* 上司フィードバック */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">
          上司フィードバック
        </label>
        <textarea
          value={managerFeedback}
          onChange={(e) => setManagerFeedback(e.target.value)}
          disabled={!isManager}
          rows={3}
          placeholder={isManager ? "フィードバックを記入..." : "上司からのフィードバックがここに表示されます"}
          className="w-full px-4 py-3 border border-navy-100 rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none disabled:bg-navy-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* 保存ボタン */}
      <div className="flex items-center justify-between">
        <div>
          {message && (
            <p
              className={`text-sm ${message.includes("エラー") ? "text-red-600" : "text-teal-600"}`}
            >
              {message}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-teal text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );
}
