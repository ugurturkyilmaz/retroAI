"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ActionItemCard from "@/components/ActionItemCard";

interface User { userId: string; name: string; role: string; email: string }
interface ActionItem { id: string; title: string; description?: string | null; status: string; dueDate?: string | null; assignee?: { name: string } | null; session?: { title: string } | null; carriedFromId?: string | null }

type StatusFilter = "ALL" | "OPEN" | "IN_PROGRESS" | "DONE";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Tümü" },
  { value: "OPEN", label: "Açık" },
  { value: "IN_PROGRESS", label: "Devam Ediyor" },
  { value: "DONE", label: "Tamamlandı" },
];

export default function ActionItemsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ActionItem[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user));
    fetchItems();
  }, []);

  async function fetchItems() {
    const res = await fetch("/api/action-items");
    const data = await res.json();
    setItems(data.actionItems ?? []);
  }

  const filtered = filter === "ALL" ? items : items.filter(i => i.status === filter);

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Yükleniyor...</div>;

  const isManager = user.role === "MANAGER";
  const isScrumMaster = user.role === "SCRUM_MASTER";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Aksiyon Maddeleri</h1>

        {/* Filtre */}
        <div className="flex gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                filter === f.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label}
              {f.value !== "ALL" && (
                <span className="ml-1.5 text-xs opacity-70">
                  {items.filter(i => i.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-12 text-sm">Bu filtrede aksiyon maddesi yok.</p>
          )}
          {filtered.map((item) => (
            <ActionItemCard
              key={item.id}
              item={item}
              canEdit={!isManager && (isScrumMaster || item.assignee?.name === user.name)}
              onStatusChange={(itemId, status) =>
                setItems((prev) => prev.map(i => i.id === itemId ? { ...i, status } : i))
              }
            />
          ))}
        </div>
      </main>
    </div>
  );
}
