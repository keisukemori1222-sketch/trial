"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { EvaluationItem, ManagerEvaluation } from "@/types/database";
import { scoreLabels } from "@/lib/evaluation-items";

interface EvalState {
  score: number;
  comment: string;
}

export function ManagerEvaluationForm({
  sessionId,
  groupedItems,
  existingEvals,
  isClosed,
}: {
  sessionId: string;
  groupedItems: Record<string, EvaluationItem[]>;
  existingEvals: ManagerEvaluation[];
  isClosed: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();

  const initialState: Record<string, EvalState> = {};
  existingEvals.forEach((e) => {
    initialState[e.item_id] = { score: e.score, comment: e.comment ?? "" };
  });

  const [evals, setEvals] = useState<Record<string, EvalState>>(initialState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const setScore = useCallback((itemId: string, score: number) => {
    setEvals((prev) => ({
      ...prev,
      [itemId]: { score, comment: prev[itemId]?.comment ?? "" },
    }));
  }, []);

  const setComment = useCallback((itemId: string, comment: string) => {
    setEvals((prev) => ({
      ...prev,
      [itemId]: { score: prev[itemId]?.score ?? 0, comment },
    }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const entries = Object.entries(evals).filter(([, v]) => v.score > 0);

    if (entries.length === 0) {
      setMessage("少なくとも1つの項目を評価してください");
      setSaving(false);
      return;
    }

    for (const [itemId, val] of entries) {
      const isCommon = itemId.startsWith("C");
      const { error } = await supabase.from("manager_evaluations").upsert(
        {
          session_id: sessionId,
          item_id: itemId,
          item_type: isCommon ? "common" : "unique",
          score: val.score,
          comment: val.comment || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "session_id,item_id" }
      );

      if (error) {
        setMessage(`保存エラー: ${error.message}`);
        setSaving(false);
        return;
      }
    }

    setMessage("保存しました");
    setSaving(false);
    router.refresh();
  };

  const categories = Object.keys(groupedItems);

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-base font-semibold text-teal border-b-2 border-teal pb-2 mb-4">
            {category}
          </h2>
          <div className="space-y-4">
            {groupedItems[category].map((item) => (
              <ManagerItemRow
                key={item.item_id}
                item={item}
                evalState={evals[item.item_id]}
                onScoreChange={setScore}
                onCommentChange={setComment}
                disabled={isClosed}
              />
            ))}
          </div>
        </div>
      ))}

      {!isClosed && (
        <div className="sticky bottom-4 bg-white border border-navy-100 rounded-xl shadow-lg p-4 flex items-center justify-between">
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
      )}
    </div>
  );
}

function ManagerItemRow({
  item,
  evalState,
  onScoreChange,
  onCommentChange,
  disabled,
}: {
  item: EvaluationItem;
  evalState?: EvalState;
  onScoreChange: (itemId: string, score: number) => void;
  onCommentChange: (itemId: string, comment: string) => void;
  disabled: boolean;
}) {
  const currentScore = evalState?.score ?? 0;
  const comment = evalState?.comment ?? "";

  return (
    <div className="border border-navy-100 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-navy-300 font-mono">{item.item_id}</span>
        <h3 className="font-medium text-navy">{item.name}</h3>
      </div>

      {/* スコア選択 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {[1, 2, 3, 4].map((score) => (
          <button
            key={score}
            onClick={() => !disabled && onScoreChange(item.item_id, score)}
            disabled={disabled}
            className={`px-3 py-2 rounded-lg text-sm border transition-all ${
              currentScore === score
                ? "bg-navy text-white border-navy"
                : "border-navy-100 text-navy-400 hover:border-navy-300 hover:bg-navy-50"
            } disabled:cursor-not-allowed`}
          >
            <span className="font-medium">{score}</span>
            <span className="block text-xs mt-0.5 opacity-80">
              {scoreLabels[score]}
            </span>
          </button>
        ))}
      </div>

      {/* コメント入力 */}
      <textarea
        value={comment}
        onChange={(e) => onCommentChange(item.item_id, e.target.value)}
        disabled={disabled}
        placeholder="コメント（任意）"
        rows={2}
        className="w-full px-3 py-2 border border-navy-100 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none disabled:bg-navy-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
