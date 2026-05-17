"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RetroColumn from "@/components/RetroColumn";
import OpenActionsReminder from "@/components/OpenActionsReminder";
import ActionItemCard from "@/components/ActionItemCard";

const PHASE_DURATION = 5 * 60;

interface User { userId: string; name: string; role: string; email: string }
interface RetroItem { id: string; content: string; votes: number; author: { name: string }; authorId: string; column: string }
interface ActionItem { id: string; title: string; description?: string | null; status: string; dueDate?: string | null; assignee?: { name: string } | null; session?: { title: string } | null; carriedFromId?: string | null }
interface Retro { id: string; title: string; status: string; date: string; phaseStartedAt: string; createdByName: string }
interface OrgUser { id: string; name: string }

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function RetroBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [retro, setRetro] = useState<Retro | null>(null);
  const [items, setItems] = useState<RetroItem[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [carryOvers, setCarryOvers] = useState<ActionItem[]>([]);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionForm, setActionForm] = useState({ title: "", description: "", assigneeId: "", dueDate: "" });
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [closing, setClosing] = useState(false);
  const phaseAdvancedRef = useRef(false);
  const advanceFnRef = useRef<(() => Promise<void>) | null>(null);

  const fetchRetro = useCallback(async () => {
    const res = await fetch(`/api/retros/${id}`);
    if (!res.ok) { router.push("/retros"); return; }
    const data = await res.json();
    setRetro(data.retro);
    setItems(data.retro.retroItems ?? []);
    setActionItems(data.retro.actionItems ?? []);
    setCarryOvers(data.openCarryOvers ?? []);
  }, [id, router]);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user));
    fetch("/api/users").then(r => r.json()).then(d => setUsers(d.users ?? []));
    fetchRetro();
  }, [fetchRetro]);

  const handleAdvancePhase = useCallback(async () => {
    setAdvancing(true);
    try {
      await fetch(`/api/retros/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTION_ITEMS" }),
      });
      await fetchRetro();
    } finally {
      setAdvancing(false);
    }
  }, [id, fetchRetro]);

  useEffect(() => { advanceFnRef.current = handleAdvancePhase; }, [handleAdvancePhase]);

  useEffect(() => {
    if (!retro || retro.status !== "BRAINSTORMING") { setTimeLeft(null); return; }
    phaseAdvancedRef.current = false;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - new Date(retro.phaseStartedAt).getTime()) / 1000);
      const remaining = Math.max(0, PHASE_DURATION - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0 && !phaseAdvancedRef.current) {
        phaseAdvancedRef.current = true;
        advanceFnRef.current?.();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [retro?.phaseStartedAt, retro?.status]);

  async function handleCloseRetro() {
    if (!confirm("Retroyu kapatmak istediğinizden emin misiniz?")) return;
    setClosing(true);
    try {
      await fetch(`/api/retros/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CLOSED" }) });
      await fetchRetro();
    } finally { setClosing(false); }
  }

  async function handleAddAction(e: React.FormEvent) {
    e.preventDefault();
    if (!actionForm.title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/action-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, title: actionForm.title, description: actionForm.description || undefined, assigneeId: actionForm.assigneeId || undefined, dueDate: actionForm.dueDate || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionItems(prev => [...prev, data.actionItem]);
        setActionForm({ title: "", description: "", assigneeId: "", dueDate: "" });
        setShowActionForm(false);
      }
    } finally { setSubmitting(false); }
  }

  if (!user || !retro) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Yükleniyor...</div>;

  const isScrumMaster = user.role === "SCRUM_MASTER";
  const isManager = user.role === "MANAGER";
  const isTeamMember = user.role === "TEAM_MEMBER";
  const canAddAction = !isManager && !isTeamMember;
  const colItems = (col: string) => items.filter(i => i.column === col);

  // ── FAZ 1: BRAINSTORMING ──
  if (retro.status === "BRAINSTORMING") {
    const pct = timeLeft !== null ? (timeLeft / PHASE_DURATION) * 100 : 100;
    const barColor = pct > 40 ? "bg-green-500" : pct > 15 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{retro.title}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">Faz 1 — Beyin Fırtınası</span>
              </div>
              <p className="text-xs text-gray-500">{new Date(retro.date).toLocaleDateString("tr-TR")}</p>
            </div>
            {isScrumMaster && (
              <button onClick={handleAdvancePhase} disabled={advancing} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {advancing ? "Geçiliyor..." : "Aksiyon Fazına Geç →"}
              </button>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-mono font-bold text-gray-900">{timeLeft !== null ? formatTime(timeLeft) : "--:--"}</span>
                <span className="text-sm text-gray-500">kalan süre</span>
              </div>
              <p className="text-xs text-gray-400 text-right max-w-xs">Süre dolunca tüm maddeler görünür olacak ve aksiyon fazına geçilecek.</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
            Diğer katılımcıların maddeleri süre bitene kadar bulanık görünür. Herkes bağımsız düşünsün!
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(["START", "STOP", "CONTINUE"] as const).map(col => (
              <RetroColumn key={col} column={col} items={colItems(col)} sessionId={id} canAdd={!isManager} phase="BRAINSTORMING" currentUserId={user.userId} isScrumMaster={isScrumMaster}
                onItemAdded={item => setItems(prev => [...prev, item as RetroItem])}
                onItemDeleted={itemId => setItems(prev => prev.filter(i => i.id !== itemId))}
                onVote={(itemId, votes) => setItems(prev => prev.map(i => i.id === itemId ? { ...i, votes } : i))}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ── FAZ 2: ACTION_ITEMS ──
  if (retro.status === "ACTION_ITEMS") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{retro.title}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">Faz 2 — Aksiyon Maddeleri</span>
              </div>
              <p className="text-xs text-gray-500">{new Date(retro.date).toLocaleDateString("tr-TR")} · {retro.createdByName}</p>
            </div>
            {isScrumMaster && (
              <button onClick={handleCloseRetro} disabled={closing} className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
                {closing ? "Kapatılıyor..." : "Retroyu Kapat"}
              </button>
            )}
          </div>

          <OpenActionsReminder items={carryOvers} targetSessionId={id} canEdit={canAddAction} onUpdate={fetchRetro} />

          <div className="grid grid-cols-3 gap-4 mb-8">
            {(["START", "STOP", "CONTINUE"] as const).map(col => (
              <RetroColumn key={col} column={col} items={colItems(col)} sessionId={id} canAdd={false} phase="ACTION_ITEMS" currentUserId={user.userId} isScrumMaster={isScrumMaster}
                onItemAdded={() => {}}
                onItemDeleted={itemId => setItems(prev => prev.filter(i => i.id !== itemId))}
                onVote={(itemId, votes) => setItems(prev => prev.map(i => i.id === itemId ? { ...i, votes } : i))}
              />
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-800">Aksiyon Maddeleri</h2>
              {canAddAction && (
                <button onClick={() => setShowActionForm(!showActionForm)} className="text-sm text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                  + Aksiyon Ekle
                </button>
              )}
            </div>
            {showActionForm && (
              <form onSubmit={handleAddAction} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2">
                    <input value={actionForm.title} onChange={e => setActionForm(p => ({ ...p, title: e.target.value }))} placeholder="Aksiyon başlığı *" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
                  </div>
                  <div className="col-span-2">
                    <textarea value={actionForm.description} onChange={e => setActionForm(p => ({ ...p, description: e.target.value }))} placeholder="Açıklama (isteğe bağlı)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" rows={2} />
                  </div>
                  <select value={actionForm.assigneeId} onChange={e => setActionForm(p => ({ ...p, assigneeId: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="">Atanan kişi seç</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <input type="date" value={actionForm.dueDate} onChange={e => setActionForm(p => ({ ...p, dueDate: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">{submitting ? "Ekleniyor..." : "Ekle"}</button>
                  <button type="button" onClick={() => setShowActionForm(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">İptal</button>
                </div>
              </form>
            )}
            <div className="grid grid-cols-2 gap-3">
              {actionItems.length === 0 && <p className="col-span-2 text-sm text-gray-400 text-center py-8">Henüz aksiyon maddesi yok.</p>}
              {actionItems.map(item => (
                <ActionItemCard key={item.id} item={item}
                  canEdit={canAddAction && (isScrumMaster || item.assignee?.name === user.name)}
                  onStatusChange={(itemId, status) => setActionItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i))}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── CLOSED ──
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{retro.title}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">Kapalı</span>
            </div>
            <p className="text-xs text-gray-500">{new Date(retro.date).toLocaleDateString("tr-TR")} · {retro.createdByName}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(["START", "STOP", "CONTINUE"] as const).map(col => (
            <RetroColumn key={col} column={col} items={colItems(col)} sessionId={id} canAdd={false} phase="CLOSED" currentUserId={user.userId} isScrumMaster={false}
              onItemAdded={() => {}} onItemDeleted={() => {}} onVote={() => {}} />
          ))}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Aksiyon Maddeleri</h2>
          <div className="grid grid-cols-2 gap-3">
            {actionItems.length === 0 && <p className="col-span-2 text-sm text-gray-400 text-center py-8">Bu retroda aksiyon maddesi yok.</p>}
            {actionItems.map(item => <ActionItemCard key={item.id} item={item} canEdit={false} onStatusChange={() => {}} />)}
          </div>
        </div>
      </main>
    </div>
  );
}
