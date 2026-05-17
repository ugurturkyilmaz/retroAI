"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RetroColumn from "@/components/RetroColumn";
import OpenActionsReminder from "@/components/OpenActionsReminder";
import ActionItemCard from "@/components/ActionItemCard";

interface User { userId: string; name: string; role: string; email: string }
interface RetroItem { id: string; content: string; votes: number; author: { name: string }; authorId: string; column: string }
interface ActionItem { id: string; title: string; description?: string | null; status: string; dueDate?: string | null; assignee?: { name: string } | null; session?: { title: string } | null; carriedFromId?: string | null }
interface Retro { id: string; title: string; status: string; date: string; createdBy: { name: string } }
interface OrgUser { id: string; name: string }

export default function RetroBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [retro, setRetro] = useState<Retro | null>(null);
  const [items, setItems] = useState<RetroItem[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [carryOvers, setCarryOvers] = useState<ActionItem[]>([]);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionForm, setActionForm] = useState({ title: "", description: "", assigneeId: "", dueDate: "" });
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user));
    fetch("/api/users").then(r => r.json()).then(d => setUsers(d.users ?? []));
    fetchRetro();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchRetro() {
    const res = await fetch(`/api/retros/${id}`);
    if (!res.ok) { router.push("/retros"); return; }
    const data = await res.json();
    setRetro(data.retro);
    setItems(data.retro.retroItems ?? []);
    setActionItems(data.retro.actionItems ?? []);
    setCarryOvers(data.openCarryOvers ?? []);
  }

  async function handleClose() {
    if (!confirm("Bu retroyu kapatmak istediğinizden emin misiniz?")) return;
    setClosing(true);
    try {
      await fetch(`/api/retros/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      fetchRetro();
    } finally {
      setClosing(false);
    }
  }

  async function handleAddAction(e: React.FormEvent) {
    e.preventDefault();
    if (!actionForm.title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/action-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: id,
          title: actionForm.title,
          description: actionForm.description || undefined,
          assigneeId: actionForm.assigneeId || undefined,
          dueDate: actionForm.dueDate || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionItems((prev) => [...prev, data.actionItem]);
        setActionForm({ title: "", description: "", assigneeId: "", dueDate: "" });
        setShowActionForm(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!user || !retro) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Yükleniyor...</div>;

  const isClosed = retro.status === "CLOSED";
  const isScrumMaster = user.role === "SCRUM_MASTER";
  const isManager = user.role === "MANAGER";
  const canAdd = !isClosed && !isManager;

  const colItems = (col: string) => items.filter(i => i.column === col);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Başlık */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{retro.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isClosed ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
                {isClosed ? "Kapalı" : "Aktif"}
              </span>
            </div>
            <p className="text-xs text-gray-500">{new Date(retro.date).toLocaleDateString("tr-TR")} · {retro.createdBy.name}</p>
          </div>
          {isScrumMaster && !isClosed && (
            <button onClick={handleClose} disabled={closing} className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
              {closing ? "Kapatılıyor..." : "Retroyu Kapat"}
            </button>
          )}
        </div>

        {/* Önceki açık aksiyonlar hatırlatması */}
        <OpenActionsReminder
          items={carryOvers}
          targetSessionId={id}
          canEdit={!isManager}
          onUpdate={fetchRetro}
        />

        {/* Board kolonları */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(["START", "STOP", "CONTINUE"] as const).map((col) => (
            <RetroColumn
              key={col}
              column={col}
              items={colItems(col)}
              sessionId={id}
              canAdd={canAdd}
              currentUserId={user.userId}
              isScrumMaster={isScrumMaster}
              onItemAdded={(item) => setItems((prev) => [...prev, item as RetroItem])}
              onItemDeleted={(itemId) => setItems((prev) => prev.filter(i => i.id !== itemId))}
              onVote={(itemId, votes) => setItems((prev) => prev.map(i => i.id === itemId ? { ...i, votes } : i))}
            />
          ))}
        </div>

        {/* Aksiyon Maddeleri */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">Aksiyon Maddeleri</h2>
            {canAdd && (
              <button
                onClick={() => setShowActionForm(!showActionForm)}
                className="text-sm text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                + Aksiyon Ekle
              </button>
            )}
          </div>

          {showActionForm && (
            <form onSubmit={handleAddAction} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2">
                  <input
                    value={actionForm.title}
                    onChange={(e) => setActionForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Aksiyon başlığı *"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <textarea
                    value={actionForm.description}
                    onChange={(e) => setActionForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Açıklama (isteğe bağlı)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                    rows={2}
                  />
                </div>
                <select
                  value={actionForm.assigneeId}
                  onChange={(e) => setActionForm(p => ({ ...p, assigneeId: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Atanan kişi seç</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input
                  type="date"
                  value={actionForm.dueDate}
                  onChange={(e) => setActionForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? "Ekleniyor..." : "Ekle"}
                </button>
                <button type="button" onClick={() => setShowActionForm(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">
                  İptal
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 gap-3">
            {actionItems.length === 0 && (
              <p className="col-span-2 text-sm text-gray-400 text-center py-8">Henüz aksiyon maddesi yok.</p>
            )}
            {actionItems.map((item) => (
              <ActionItemCard
                key={item.id}
                item={item}
                canEdit={!isManager && (isScrumMaster || item.assignee?.name === user.name)}
                onStatusChange={(itemId, status) =>
                  setActionItems((prev) => prev.map(i => i.id === itemId ? { ...i, status } : i))
                }
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
