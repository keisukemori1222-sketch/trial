"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-navy mb-4">ダッシュボード</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoCard label="名前" value="デモユーザー" />
          <InfoCard label="職種" value="サービス人" />
          <InfoCard label="現在のStep" value="Step 1" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">成長グラフ</h2>
        <p className="text-navy-300 text-sm">Supabase 接続後にデータが表示されます</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          title="評価入力"
          description="自己評価を入力"
          href="/evaluation"
          color="teal"
        />
        <ActionCard
          title="面談準備"
          description="自己評価と上司評価のギャップを確認"
          href="/dashboard"
          color="teal"
        />
        <ActionCard
          title="行動計画"
          description="重点項目の行動計画を確認"
          href="/dashboard"
          color="gold"
        />
        <ActionCard
          title="月次振り返り"
          description="今月の振り返りを記入"
          href="/review"
          color="gold"
        />
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy-50 rounded-lg p-4">
      <p className="text-xs text-navy-400 mb-1">{label}</p>
      <p className="text-lg font-semibold text-navy">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  color,
}: {
  title: string;
  description: string;
  href: string;
  color: "teal" | "gold";
}) {
  const colorClasses = {
    teal: "border-teal bg-teal-50 hover:bg-teal-100",
    gold: "border-gold bg-gold-50 hover:bg-gold-100",
  };

  return (
    <Link
      href={href}
      className={`block border-l-4 rounded-lg p-5 transition-colors ${colorClasses[color]}`}
    >
      <h3 className="font-semibold text-navy mb-1">{title}</h3>
      <p className="text-sm text-navy-400">{description}</p>
    </Link>
  );
}
