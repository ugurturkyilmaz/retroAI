import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { actionItems, retroSessions, users } from "@/lib/schema";
import { inArray, eq, desc } from "drizzle-orm";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const openActions = await db
    .select({
      id: actionItems.id,
      title: actionItems.title,
      status: actionItems.status,
      dueDate: actionItems.dueDate,
      assigneeName: users.name,
      sessionTitle: retroSessions.title,
    })
    .from(actionItems)
    .leftJoin(users, eq(actionItems.assigneeId, users.id))
    .leftJoin(retroSessions, eq(actionItems.sessionId, retroSessions.id))
    .where(inArray(actionItems.status, ["OPEN", "IN_PROGRESS"]))
    .orderBy(desc(actionItems.createdAt))
    .limit(10);

  const [lastRetro] = await db
    .select({
      id: retroSessions.id,
      title: retroSessions.title,
      date: retroSessions.date,
      status: retroSessions.status,
      createdByName: users.name,
    })
    .from(retroSessions)
    .leftJoin(users, eq(retroSessions.createdById, users.id))
    .orderBy(desc(retroSessions.date))
    .limit(1);

  const STATUS_LABELS: Record<string, string> = {
    OPEN: "Açık",
    IN_PROGRESS: "Devam Ediyor",
  };
  const STATUS_COLORS: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={session} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Hoş geldin, {session.name}</p>
          </div>
          {session.role === "SCRUM_MASTER" && (
            <Link
              href="/retros"
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Yeni Retro
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-3xl font-bold text-gray-900">{openActions.length}</p>
            <p className="text-sm text-gray-500 mt-1">Açık / Devam Eden Aksiyon</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {lastRetro ? (
              <>
                <Link href={`/retros/${lastRetro.id}`} className="text-base font-semibold text-indigo-600 hover:underline line-clamp-1">
                  {lastRetro.title}
                </Link>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(lastRetro.date).toLocaleDateString("tr-TR")} · {lastRetro.createdByName}
                </p>
                {(() => {
                  const statusLabel = lastRetro.status === "BRAINSTORMING" ? "Beyin Fırtınası"
                    : lastRetro.status === "ACTION_ITEMS" ? "Aksiyon Fazı"
                    : "Kapalı";
                  const isActive = lastRetro.status === "BRAINSTORMING" || lastRetro.status === "ACTION_ITEMS";
                  return (
                    <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {statusLabel}
                    </span>
                  );
                })()}
              </>
            ) : (
              <p className="text-sm text-gray-400">Henüz retro yok</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Son retro</p>
          </div>
        </div>

        {openActions.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Açık Aksiyon Maddeleri</h2>
            <div className="space-y-2">
              {openActions.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.sessionTitle}{item.assigneeName && ` · ${item.assigneeName}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[item.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
