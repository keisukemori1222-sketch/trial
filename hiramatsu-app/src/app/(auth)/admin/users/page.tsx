"use client";

import { UserManagement } from "./UserManagement";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-navy mb-6">ユーザー管理</h1>
        <UserManagement initialUsers={[]} stores={[]} managers={[]} />
      </div>
    </div>
  );
}
