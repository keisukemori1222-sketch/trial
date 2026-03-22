"use client";

interface MonthlyScore {
  month: string;
  avgSelf: number | null;
  avgMgr: number | null;
}

export function GrowthChart({ data }: { data: MonthlyScore[] }) {
  if (data.length === 0) {
    return (
      <p className="text-navy-300 text-sm py-4">
        まだ評価データがありません
      </p>
    );
  }

  const maxScore = 4;
  const chartHeight = 200;
  const chartWidth = Math.max(data.length * 80, 300);
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const xStep = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth / 2;

  const getY = (score: number) =>
    padding.top + plotHeight - (score / maxScore) * plotHeight;

  // SVG path for line
  const buildPath = (key: "avgSelf" | "avgMgr") => {
    const points = data
      .map((d, i) => {
        const val = d[key];
        if (val === null) return null;
        const x = padding.left + (data.length > 1 ? i * xStep : plotWidth / 2);
        const y = getY(val);
        return `${x},${y}`;
      })
      .filter(Boolean);

    if (points.length === 0) return "";
    return `M ${points.join(" L ")}`;
  };

  const selfPath = buildPath("avgSelf");
  const mgrPath = buildPath("avgMgr");

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full min-w-[300px]"
        style={{ maxHeight: "250px" }}
      >
        {/* グリッド線 */}
        {[1, 2, 3, 4].map((score) => (
          <g key={score}>
            <line
              x1={padding.left}
              y1={getY(score)}
              x2={chartWidth - padding.right}
              y2={getY(score)}
              stroke="#E8EBF0"
              strokeDasharray="4"
            />
            <text
              x={padding.left - 8}
              y={getY(score) + 4}
              textAnchor="end"
              className="text-[10px] fill-navy-300"
            >
              {score}
            </text>
          </g>
        ))}

        {/* X軸ラベル */}
        {data.map((d, i) => {
          const x = padding.left + (data.length > 1 ? i * xStep : plotWidth / 2);
          return (
            <text
              key={d.month}
              x={x}
              y={chartHeight - 8}
              textAnchor="middle"
              className="text-[10px] fill-navy-400"
            >
              {d.month.slice(5)}月
            </text>
          );
        })}

        {/* 自己評価ライン */}
        {selfPath && (
          <path
            d={selfPath}
            fill="none"
            stroke="#2A7B88"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* 上司評価ライン */}
        {mgrPath && (
          <path
            d={mgrPath}
            fill="none"
            stroke="#C5A55A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 3"
          />
        )}

        {/* データポイント（自己） */}
        {data.map((d, i) => {
          if (d.avgSelf === null) return null;
          const x = padding.left + (data.length > 1 ? i * xStep : plotWidth / 2);
          return (
            <circle
              key={`self-${d.month}`}
              cx={x}
              cy={getY(d.avgSelf)}
              r="4"
              fill="#2A7B88"
            />
          );
        })}

        {/* データポイント（上司） */}
        {data.map((d, i) => {
          if (d.avgMgr === null) return null;
          const x = padding.left + (data.length > 1 ? i * xStep : plotWidth / 2);
          return (
            <circle
              key={`mgr-${d.month}`}
              cx={x}
              cy={getY(d.avgMgr)}
              r="4"
              fill="#C5A55A"
            />
          );
        })}
      </svg>

      {/* 凡例 */}
      <div className="flex gap-6 justify-center mt-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-teal rounded" />
          自己評価
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-gold rounded border-dashed" />
          上司評価
        </span>
      </div>
    </div>
  );
}
