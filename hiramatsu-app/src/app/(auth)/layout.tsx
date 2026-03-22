"use client";

import { AuthNav } from "@/components/AuthNav";
import type { User } from "@/types/database";

const demoUser: User = {
  id: "demo",
  name: "デモユーザー",
  email: "demo@hiramatsu.co.jp",
  role: "staff",
  shokushu: "サービス人",
  current_step: 1,
  store_id: null,
  manager_id: null,
  created_at: new Date().toISOString(),
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AuthNav user={demoUser} />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
