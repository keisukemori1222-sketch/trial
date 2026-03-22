"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { ActionPlan, EvaluationItem } from "@/types/database";
import { scoreLabels } from "@/lib/evaluation-items";

interface GapItem extends EvaluationItem {
  selfScore: number | null;
  mgrScore: number | null;
  gap: number | null;
  isPriority: boolean;
}

interface PlanState {
  plan_text: string;
  manager_comment: string;
  agreed: boolean;
}

export function ActionPlanForm({
  sessionId,
  gapItems,
  existingPlans,
  isManager,
}: {
  sessionId: string;
  gapItems: GapItem[];
  existingPlans: ActionPlan[];
  isManager: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();

  // 既存プランをマップに変換
  const initialState: Record<string, PlanState> = {};
  existingPlans.forEach((p) => {
    initialState[p.item_id] = {
      plan_text: p.plan_text ?? "",
      manager_comment: p.manager_comment ?? "",
      agreed: !!p.agreed_at,
    };
  });
  // gapItemsに存在するがまだプランがない項目を追加
  gapItems.forEach((item) => {
    if (!initialState[item.item_id]) {
      initialState[item.item_id] = { plan_text: "", manager_comment: "", agreed: false };
    }
  });

  const [plans, setPlans] = useState<Record<string, PlanState>>(initialState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    for (const item of gapItems) {
      const plan = plans[item.item_id];
      if (!plan || (!plan.plan_text && !plan.manager_comment)) continue;

      // 既存プランを探す
      const existing = existingPlans.find((p) => p.item_id === item.item_id);

      if (existing) {
        const { error } = await supabase
          .from("action_plans")
          .update({
            plan_text: plan.plan_text || null,
            manager_comment: plan.manager_comment || null,
            agreed_at: plan.agreed ? new Date().toISOString() : null,
          })
          .eq("id", existing.id);

        if (error) {
          setMessage(`保存エラー: ${error.message}`);
          setSaving(false);
          return;
        }
      } else {
        const { error } = await supabase.from("action_plans").insert({
          session_id: sessionId,
          item_id: item.item_id,
          item_name: item.name,
          plan_text: plan.plan_text || null,
          manager_comment: plan.manager_comment || null,
          agreed_at: plan.agreed ? new Date().toISOString() : null,
        });

        if (error) {
          setMessage(`保存エラー: ${error.message}`);
          setSaving(false);
          return;
        }
      }
    }

    setMessage("保存しました");
    setSaving(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {gapItems.map((item) => {
        const plan = plans[item.item_id] ?? {
          plan_text: "",
          manager_comment: "",
          agreed: false,
        };

        return (
          <div
            key={item.item_id}
            className={`border rounded-lg p-4 ${
              item.isPriority ? "border-gold bg-gold-50" : "border-navy-100"
            }`}
          >
            {/* 項目ヘッダー */}
            <div className="flex items-center gap-2 mb-2">
              {item.isPriority && <span className="text-gold">{"\u2605"}</span>}
              <span className="text-xs font-mono text-navy-300">
                {item.item_id}
              </span>
              <span className="font-medium text-navy">{item.name}</span>
            </div>

            {/* スコア表示 */}
            <div className="flex gap-4 text-sm mb-3">
              <span className="text-navy-400">
                自己: {item.selfScore !== null ? `${item.selfScore} (${scoreLabels[item.selfScore]})` : "未入力"}
              </span>
              <span className="text-navy-400">
                上司: {item.mgrScore !== null ? `${item.mgrScore} (${scoreLabels[item.mgrScore]})` : "未入力"}
              </span>
              {item.gap !== null && Math.abs(item.gap) >= 2 && (
                <span className="text-red-600 font-medium">
                  差: {item.gap > 0 ? "+" : ""}{item.gap}
                </span>
              )}
            </div>

            {/* 行動計画テキスト */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">
                  行動計画（自分の店舗での具体的な行動）
                </label>
                <textarea
                  value={plan.plan_text}
                  onChange={(e) =>
                    setPlans((prev) => ({
                      ...prev,
                      [item.item_id]: { ...prev[item.item_id], plan_text: e.target.value },
                    }))
                  }
                  rows={3}
                  placeholder="具体的な行動計画を記入..."
                  className="w-full px-3 py-2 border border-navy-100 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
                />
              </div>

              {/* 上司コメント（マネージャーのみ編集可） */}
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">
                  上司コメント
                </label>
                <textarea
                  value={plan.manager_comment}
                  onChange={(e) =>
                    setPlans((prev) => ({
                      ...prev,
                      [item.item_id]: {
                        ...prev[item.item_id],
                        manager_comment: e.target.value,
                      },
                    }))
                  }
                  disabled={!isManager}
                  rows={2}
                  placeholder={isManager ? "コメントを記入..." : ""}
                  className="w-full px-3 py-2 border border-navy-100 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none disabled:bg-navy-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* 合意チェック（マネージャーのみ） */}
              {isManager && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={plan.agreed}
                    onChange={(e) =>
                      setPlans((prev) => ({
                        ...prev,
                        [item.item_id]: {
                          ...prev[item.item_id],
                          agreed: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-navy-300 text-teal focus:ring-teal"
                  />
                  <span className="text-navy-600">合意済み</span>
                </label>
              )}

              {plan.agreed && (
                <span className="inline-block text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                  合意済み
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* 保存ボタン */}
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
    </div>
  );
}
