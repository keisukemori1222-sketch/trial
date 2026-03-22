"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Store } from "@/types/database";

export function StoreManagement({
  initialStores,
}: {
  initialStores: Store[];
}) {
  const [stores, setStores] = useState(initialStores);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("stores")
      .insert({ name: newName.trim() })
      .select()
      .single();

    if (!error && data) {
      setStores([data, ...stores]);
      setNewName("");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この店舗を削除しますか？")) return;

    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (!error) {
      setStores(stores.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* 新規登録フォーム */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新しい店舗名"
          className="flex-1 px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal text-navy"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-teal text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
        >
          追加
        </button>
      </form>

      {/* 店舗一覧 */}
      <div className="space-y-2">
        {stores.map((store) => (
          <div
            key={store.id}
            className="flex items-center justify-between bg-navy-50 rounded-lg p-4"
          >
            <span className="font-medium text-navy">{store.name}</span>
            <button
              onClick={() => handleDelete(store.id)}
              className="text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              削除
            </button>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <p className="text-center text-navy-300 py-8">
          店舗が登録されていません
        </p>
      )}
    </div>
  );
}
