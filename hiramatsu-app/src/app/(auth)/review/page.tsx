"use client";

import { ReviewForm } from "./ReviewForm";

export default function ReviewPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-navy">月次振り返り</h1>
          <p className="text-sm text-navy-400 mt-1">デモモード / Step 1</p>
        </div>

        <ReviewForm
          sessionId="demo"
          reviewMonth="2026-03"
          existingReview={null}
          isManager={false}
        />
      </div>
    </div>
  );
}
