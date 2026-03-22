"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@/types/database";

const roleLabels: Record<string, string> = {
  staff: "スタッフ",
  manager: "マネージャー",
  admin: "管理者",
};

export function AuthNav({ user }: { user: User }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-navy text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-wide">ひらまつ</span>
          <span className="text-gold text-sm hidden sm:inline">
            基本の型 評価システム
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-navy-200 text-xs">
              {roleLabels[user.role]}
              {user.shokushu && ` / ${user.shokushu}`}
            </p>
          </div>

          {user.role === "admin" && (
            <Link
              href="/admin/users"
              className="text-sm text-gold hover:text-gold-300 transition-colors hidden sm:inline"
            >
              管理
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="text-sm text-navy-200 hover:text-white transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
