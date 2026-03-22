"use client";

import { useState } from "react";
import type { Role, Shokushu } from "@/types/database";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  shokushu: Shokushu | null;
  current_step: number;
  store_id: string | null;
  manager_id: string | null;
  stores: { name: string } | null;
}

const roleLabels: Record<Role, string> = {
  staff: "スタッフ",
  manager: "マネージャー",
  admin: "管理者",
};

export function UserManagement({
  initialUsers,
}: {
  initialUsers: UserRow[];
  stores: { id: string; name: string }[];
  managers: { id: string; name: string }[];
}) {
  const [users] = useState(initialUsers);

  return (
    <div>
      {/* ユーザー一覧テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100">
              <th className="text-left py-3 px-2 text-navy-400 font-medium">
                名前
              </th>
              <th className="text-left py-3 px-2 text-navy-400 font-medium">
                メール
              </th>
              <th className="text-left py-3 px-2 text-navy-400 font-medium">
                ロール
              </th>
              <th className="text-left py-3 px-2 text-navy-400 font-medium">
                職種
              </th>
              <th className="text-left py-3 px-2 text-navy-400 font-medium">
                店舗
              </th>
              <th className="text-left py-3 px-2 text-navy-400 font-medium">
                Step
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-navy-50 hover:bg-navy-50 transition-colors"
              >
                <td className="py-3 px-2 font-medium text-navy">{u.name}</td>
                <td className="py-3 px-2 text-navy-400">{u.email}</td>
                <td className="py-3 px-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-gold-100 text-gold-700"
                        : u.role === "manager"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-navy-100 text-navy-600"
                    }`}
                  >
                    {roleLabels[u.role]}
                  </span>
                </td>
                <td className="py-3 px-2 text-navy-400">
                  {u.shokushu ?? "-"}
                </td>
                <td className="py-3 px-2 text-navy-400">
                  {u.stores?.name ?? "-"}
                </td>
                <td className="py-3 px-2 text-navy-400">
                  Step {u.current_step}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p className="text-center text-navy-300 py-8">
          ユーザーが登録されていません
        </p>
      )}
    </div>
  );
}
