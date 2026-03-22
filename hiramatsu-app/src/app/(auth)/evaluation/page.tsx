"use client";

import { EvaluationForm } from "./EvaluationForm";
import { getItemsForShokushu, groupByCategory } from "@/lib/evaluation-items";

export default function EvaluationPage() {
  const items = getItemsForShokushu("サービス人");
  const groupedItems = groupByCategory(items);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-navy">自己評価入力</h1>
            <p className="text-sm text-navy-400 mt-1">
              デモモード / Step 1 / サービス人
            </p>
          </div>
        </div>

        <EvaluationForm
          sessionId="demo"
          groupedItems={groupedItems}
          existingEvals={[]}
          isClosed={false}
        />
      </div>
    </div>
  );
}
