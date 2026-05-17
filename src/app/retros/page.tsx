"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface User {
  userId: string;
  name: string;
  role: string;
  email: string;
}

interface Retro {
  id: string;
  title: string;
  date: string;
  status: string;
  createdBy: { name: string };
  _count: { retroItems: number; actionItems: number };
}

export default function RetrosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [retros, setRetros] = useState<Retro[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user));
    fetchRetros();
  }, []);

  async function fetchRetros() {
    const res = await fetch("/api/retros");
    const data = await res.json();
    setRetros(data.retros ?? []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/retros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setNewTitle("");
        setShowForm(false);
        fetchRetros();
      }
    } finally {
      setCreating(false);
    }
  }

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Yükleniyor...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Retrolar</h1>
          {user.role === "SCRUM_MASTER" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Yeni Retro
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Yeni Retro Oturumu</h2>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Retro başlığı (örn. Sprint 42 Retrospektifi)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              required
            />
            <div className="flex gap-2">
              <button type="submit" disabled={creating} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {creating ? "Oluşturuluyor..." : "Oluştur"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">
                İptal
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {retros.length === 0 && (
            <p className="text-center text-gray-400 py-12 text-sm">Henüz retro yok.</p>
          )}
          {retros.map((retro) => (
            <Link key={retro.id} href={`/retros/${retro.id}`} className="block">
              <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{retro.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(retro.date).toLocaleDateString("tr-TR")} · {retro.createdBy.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${retro.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {retro.status === "ACTIVE" ? "Aktif" : "Kapalı"}
                    </span>
                    <span className="text-xs text-gray-400">{retro._count.retroItems} madde · {retro._count.actionItems} aksiyon</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
