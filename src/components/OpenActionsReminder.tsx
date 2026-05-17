"use client";

import { useState } from "react";

interface ActionItem {
  id: string;
  title: string;
  status: string;
  assignee?: { name: string } | null;
  session?: { title: string } | null;
}

interface Props {
  items: ActionItem[];
  targetSessionId: string;
  canEdit: boolean;
  onUpdate?: () => void;
}

export default function OpenActionsReminder({ items, targetSessionId, canEdit, onUpdate }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  if (items.length === 0) return null;

  const visible = items.filter((i) => !dismissed.has(i.id));
  if (visible.length === 0) return null;

  async function handleCarry(id: string) {
    setLoading(id);
    try {
      const res = await fetch(`/api/action-items/${id}/carry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetSessionId }),
      });
      if (res.ok) {
        setDismissed((prev) => new Set([...prev, id]));
        onUpdate?.();
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleClose(id: string) {
    setLoading(id);
    try {
      const res = await fetch(`/api/action-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      if (res.ok) {
        setDismissed((prev) => new Set([...prev, id]));
        onUpdate?.();
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-600 font-semibold text-sm">
          ⚠️ {visible.length} adet tamamlanmamış aksiyon maddesi var
        </span>
      </div>
      <div className="space-y-2">
        {visible.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100">
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
              <p className="text-xs text-gray-500">
                {item.session?.title} {item.assignee && `· ${item.assignee.name}`}
              </p>
            </div>
            {canEdit && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleCarry(item.id)}
                  disabled={loading === item.id}
                  className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Taşı
                </button>
                <button
                  onClick={() => handleClose(item.id)}
                  disabled={loading === item.id}
                  className="text-xs bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Kapat
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
