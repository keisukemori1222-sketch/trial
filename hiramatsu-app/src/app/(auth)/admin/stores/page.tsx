"use client";

import { StoreManagement } from "./StoreManagement";

export default function AdminStoresPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-navy mb-6">店舗管理</h1>
        <StoreManagement initialStores={[]} />
      </div>
    </div>
  );
}
