"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { EvaluationItem, SelfEvaluation } from "@/types/database";
import { scoreLabels } from "@/lib/evaluation-items";

interface EvalState {
  score: number;
  is_priority: boolean;
}

export function EvaluationForm({
  sessionId,
  groupedItems,
  existingEvals,
  isClosed,
}: {
  sessionId: string;
  groupedItems: Record<string, EvaluationItem[]>;
  existingEvals: SelfEvaluation[];
  isClosed: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();

  // 既存評価をマップに変換
  const initialState: Record<string, EvalState> = {};
  existingEvals.forEach((e) => {
    initialState[e.item_id] = { score: e.score, is_priority: e.is_priority };
  });

  const [evals, setEvals] = useState<Record<string, EvalState>>(initialState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const setScore = useCallback((itemId: string, score: number) => {
    setEvals((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], score, is_priority: prev[itemId]?.is_priority ?? false },
    }));
  }, []);

  const togglePriority = useCallback((itemId: string) => {
    setEvals((prev) => ({
      ...prev,
      [itemId]: {
        score: prev[itemId]?.score ?? 0,
        is_priority: !prev[itemId]?.is_priority,
      },
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

    // すべての項目をupsert
    for (const [itemId, val] of entries) {
      const isCommon = itemId.startsWith("C");
      const { error } = await supabase
        .from("self_evaluations")
        .upsert(
          {
            session_id: sessionId,
            item_id: itemId,
            item_type: isCommon ? "common" : "unique",
            score: val.score,
            is_priority: val.is_priority,
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
              <EvaluationItemRow
                key={item.item_id}
                item={item}
                evalState={evals[item.item_id]}
                onScoreChange={setScore}
                onPriorityToggle={togglePriority}
                disabled={isClosed}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 保存ボタン */}
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

function EvaluationItemRow({
  item,
  evalState,
  onScoreChange,
  onPriorityToggle,
  disabled,
}: {
  item: EvaluationItem;
  evalState?: EvalState;
  onScoreChange: (itemId: string, score: number) => void;
  onPriorityToggle: (itemId: string) => void;
  disabled: boolean;
}) {
  const currentScore = evalState?.score ?? 0;
  const isPriority = evalState?.is_priority ?? false;

  return (
    <div
      className={`border rounded-lg p-4 transition-colors ${
        isPriority ? "border-gold bg-gold-50" : "border-navy-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-navy-300 font-mono">
              {item.item_id}
            </span>
            <h3 className="font-medium text-navy">{item.name}</h3>
          </div>
        </div>
        <button
          onClick={() => !disabled && onPriorityToggle(item.item_id)}
          disabled={disabled}
          className={`text-xl transition-colors ${
            isPriority
              ? "text-gold"
              : "text-navy-200 hover:text-gold-400"
          } disabled:cursor-not-allowed`}
          title="重点項目"
        >
          {isPriority ? "\u2605" : "\u2606"}
        </button>
      </div>

      {/* スコア選択 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
    </div>
  );
}
