"use client";

import { useState } from "react";

interface RetroItem {
  id: string;
  content: string;
  votes: number;
  author: { name: string };
  authorId: string;
}

interface Props {
  column: "START" | "STOP" | "CONTINUE";
  items: RetroItem[];
  sessionId: string;
  canAdd: boolean;
  phase: "BRAINSTORMING" | "ACTION_ITEMS" | "CLOSED";
  currentUserId: string;
  isScrumMaster: boolean;
  onItemAdded: (item: RetroItem) => void;
  onItemDeleted: (id: string) => void;
  onVote: (id: string, votes: number) => void;
}

const COLUMN_CONFIG = {
  START: { label: "Başla", bg: "bg-green-50", border: "border-green-200", header: "bg-green-100 text-green-800" },
  STOP: { label: "Dur", bg: "bg-red-50", border: "border-red-200", header: "bg-red-100 text-red-800" },
  CONTINUE: { label: "Devam Et", bg: "bg-blue-50", border: "border-blue-200", header: "bg-blue-100 text-blue-800" },
};

export default function RetroColumn({ column, items, sessionId, canAdd, phase, currentUserId, isScrumMaster, onItemAdded, onItemDeleted, onVote }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const config = COLUMN_CONFIG[column];

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/retros/${sessionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column, content }),
      });
      if (res.ok) {
        const data = await res.json();
        onItemAdded(data.item);
        setContent("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(itemId: string) {
    const res = await fetch(`/api/retros/${sessionId}/items/${itemId}`, { method: "DELETE" });
    if (res.ok) onItemDeleted(itemId);
  }

  async function handleVote(item: RetroItem) {
    const res = await fetch(`/api/retros/${sessionId}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ votes: item.votes + 1 }),
    });
    if (res.ok) {
      const data = await res.json();
      onVote(item.id, data.item.votes);
    }
  }

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} flex flex-col`}>
      <div className={`px-4 py-3 rounded-t-xl ${config.header} font-semibold text-sm flex items-center justify-between`}>
        <span>{config.label}</span>
        <span className="text-xs opacity-70">{items.length}</span>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-96">
        {items.map((item) => {
          const isBlurred = phase === "BRAINSTORMING" && item.authorId !== currentUserId;
          return (
            <div key={item.id} className="bg-white rounded-lg border border-gray-100 p-3 group">
              <p className={`text-sm text-gray-800 ${isBlurred ? "blur-sm select-none" : ""}`}>
                {item.content}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs text-gray-400 ${isBlurred ? "blur-sm" : ""}`}>
                  {isBlurred ? "..." : item.author.name}
                </span>
                {!isBlurred && (
                  <div className="flex items-center gap-1">
                    {phase !== "BRAINSTORMING" && (
                      <button
                        onClick={() => handleVote(item)}
                        className="text-xs text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5"
                      >
                        👍 {item.votes}
                      </button>
                    )}
                    {(isScrumMaster || item.authorId === currentUserId) && phase !== "CLOSED" && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-gray-300 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {canAdd && (
        <form onSubmit={handleAdd} className="p-3 border-t border-gray-100">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Madde ekle..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            rows={2}
          />
          <button
            type="submit"
            disabled={!content.trim() || loading}
            className="mt-1.5 w-full text-xs bg-white border border-gray-300 text-gray-700 rounded-lg py-1.5 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            + Ekle
          </button>
        </form>
      )}
    </div>
  );
}
