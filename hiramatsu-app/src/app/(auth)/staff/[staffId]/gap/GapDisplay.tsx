"use client";

import type {
  EvaluationItem,
  SelfEvaluation,
  ManagerEvaluation,
} from "@/types/database";
import { scoreLabels } from "@/lib/evaluation-items";
import { groupByCategory } from "@/lib/evaluation-items";

interface GapRow {
  item: EvaluationItem;
  selfScore: number | null;
  mgrScore: number | null;
  mgrComment: string | null;
  isPriority: boolean;
  gap: number | null;
}

export function GapDisplay({
  items,
  selfEvals,
  mgrEvals,
}: {
  items: EvaluationItem[];
  selfEvals: SelfEvaluation[];
  mgrEvals: ManagerEvaluation[];
}) {
  // マップ変換
  const selfMap = new Map(selfEvals.map((e) => [e.item_id, e]));
  const mgrMap = new Map(mgrEvals.map((e) => [e.item_id, e]));

  // ギャップ行を構築
  const rows: GapRow[] = items.map((item) => {
    const self = selfMap.get(item.item_id);
    const mgr = mgrMap.get(item.item_id);
    const selfScore = self?.score ?? null;
    const mgrScore = mgr?.score ?? null;
    const gap =
      selfScore !== null && mgrScore !== null ? selfScore - mgrScore : null;

    return {
      item,
      selfScore,
      mgrScore,
      mgrComment: mgr?.comment ?? null,
      isPriority: self?.is_priority ?? false,
      gap,
    };
  });

  const grouped = groupByCategory(items);
  const categories = Object.keys(grouped);

  // ギャップの大きい項目（差分2以上）
  const largeGaps = rows.filter((r) => r.gap !== null && Math.abs(r.gap) >= 2);

  return (
    <div className="space-y-8">
      {/* ギャップ警告 */}
      {largeGaps.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-700 mb-2">
            ギャップが大きい項目（差分2以上）
          </h3>
          <div className="space-y-2">
            {largeGaps.map((row) => (
              <div
                key={row.item.item_id}
                className="flex items-center gap-3 text-sm"
              >
                <span className="font-mono text-red-400">
                  {row.item.item_id}
                </span>
                <span className="text-red-700 font-medium">
                  {row.item.name}
                </span>
                <span className="ml-auto text-red-600">
                  自己: {row.selfScore} / 上司: {row.mgrScore} (差:{" "}
                  {row.gap! > 0 ? "+" : ""}
                  {row.gap})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* カテゴリー別一覧 */}
      {categories.map((category) => {
        const categoryItems = grouped[category];
        const categoryRows = rows.filter((r) =>
          categoryItems.some((i) => i.item_id === r.item.item_id)
        );

        return (
          <div key={category}>
            <h2 className="text-base font-semibold text-teal border-b-2 border-teal pb-2 mb-4">
              {category}
            </h2>

            {/* テーブルヘッダー */}
            <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-navy-400 font-medium mb-2 px-2">
              <div className="col-span-1">ID</div>
              <div className="col-span-4">項目</div>
              <div className="col-span-2 text-center">自己評価</div>
              <div className="col-span-2 text-center">上司評価</div>
              <div className="col-span-1 text-center">差分</div>
              <div className="col-span-2">コメント</div>
            </div>

            <div className="space-y-2">
              {categoryRows.map((row) => (
                <GapRowComponent key={row.item.item_id} row={row} />
              ))}
            </div>
          </div>
        );
      })}

      {selfEvals.length === 0 && mgrEvals.length === 0 && (
        <p className="text-center text-navy-300 py-8">
          まだ評価データがありません
        </p>
      )}
    </div>
  );
}

function GapRowComponent({ row }: { row: GapRow }) {
  const hasLargeGap = row.gap !== null && Math.abs(row.gap) >= 2;

  return (
    <div
      className={`border rounded-lg p-3 transition-colors ${
        hasLargeGap
          ? "border-red-300 bg-red-50"
          : row.isPriority
            ? "border-gold bg-gold-50"
            : "border-navy-100"
      }`}
    >
      {/* Desktop */}
      <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
        <div className="col-span-1 text-xs font-mono text-navy-300">
          {row.item.item_id}
        </div>
        <div className="col-span-4 flex items-center gap-1">
          {row.isPriority && <span className="text-gold text-sm">{"\u2605"}</span>}
          <span className="font-medium text-navy text-sm">{row.item.name}</span>
        </div>
        <div className="col-span-2 text-center">
          <ScoreBadge score={row.selfScore} label="自己" />
        </div>
        <div className="col-span-2 text-center">
          <ScoreBadge score={row.mgrScore} label="上司" />
        </div>
        <div className="col-span-1 text-center">
          {row.gap !== null ? (
            <span
              className={`text-sm font-bold ${
                Math.abs(row.gap) >= 2
                  ? "text-red-600"
                  : row.gap === 0
                    ? "text-teal"
                    : "text-navy-400"
              }`}
            >
              {row.gap > 0 ? "+" : ""}
              {row.gap}
            </span>
          ) : (
            <span className="text-navy-200">-</span>
          )}
        </div>
        <div className="col-span-2 text-xs text-navy-400 truncate">
          {row.mgrComment ?? ""}
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-navy-300">
            {row.item.item_id}
          </span>
          {row.isPriority && <span className="text-gold text-sm">{"\u2605"}</span>}
          <span className="font-medium text-navy text-sm">{row.item.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <ScoreBadge score={row.selfScore} label="自己" />
          <ScoreBadge score={row.mgrScore} label="上司" />
          {row.gap !== null && (
            <span
              className={`text-sm font-bold ${
                Math.abs(row.gap) >= 2
                  ? "text-red-600"
                  : row.gap === 0
                    ? "text-teal"
                    : "text-navy-400"
              }`}
            >
              差: {row.gap > 0 ? "+" : ""}
              {row.gap}
            </span>
          )}
        </div>
        {row.mgrComment && (
          <p className="text-xs text-navy-400">{row.mgrComment}</p>
        )}
      </div>
    </div>
  );
}

function ScoreBadge({
  score,
  label,
}: {
  score: number | null;
  label: string;
}) {
  if (score === null) {
    return (
      <span className="text-xs text-navy-200">
        {label}: 未入力
      </span>
    );
  }

  const colors: Record<number, string> = {
    1: "bg-red-100 text-red-700",
    2: "bg-yellow-100 text-yellow-700",
    3: "bg-teal-100 text-teal-700",
    4: "bg-navy-100 text-navy-700",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colors[score]}`}>
      {label}: {score} ({scoreLabels[score]})
    </span>
  );
}
