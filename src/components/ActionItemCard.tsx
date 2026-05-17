"use client";

import { useState } from "react";

interface ActionItem {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueDate?: string | null;
  assignee?: { name: string } | null;
  session?: { title: string } | null;
  carriedFromId?: string | null;
}

interface Props {
  item: ActionItem;
  canEdit: boolean;
  onStatusChange?: (id: string, status: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Açık",
  IN_PROGRESS: "Devam Ediyor",
  DONE: "Tamamlandı",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
};

const STATUS_NEXT: Record<string, string> = {
  OPEN: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "OPEN",
};

export default function ActionItemCard({ item, canEdit, onStatusChange }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleStatusChange() {
    if (!canEdit || loading) return;
    const next = STATUS_NEXT[item.status] ?? "OPEN";
    setLoading(true);
    try {
      const res = await fetch(`/api/action-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok && onStatusChange) onStatusChange(item.id, next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
          )}
        </div>
        <button
          onClick={handleStatusChange}
          disabled={!canEdit || loading}
          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
            STATUS_COLORS[item.status] ?? "bg-gray-100 text-gray-700"
          } ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
        >
          {STATUS_LABELS[item.status] ?? item.status}
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {item.assignee && <span>👤 {item.assignee.name}</span>}
        {item.dueDate && (
          <span>📅 {new Date(item.dueDate).toLocaleDateString("tr-TR")}</span>
        )}
        {item.session && <span className="truncate">📋 {item.session.title}</span>}
        {item.carriedFromId && (
          <span className="text-amber-600">↩ Taşındı</span>
        )}
      </div>
    </div>
  );
}
