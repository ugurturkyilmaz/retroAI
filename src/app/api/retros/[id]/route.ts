import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { retroSessions, retroItems, actionItems, users } from "@/lib/schema";
import { eq, and, inArray, notInArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;

  const [retro] = await db
    .select({
      id: retroSessions.id,
      title: retroSessions.title,
      date: retroSessions.date,
      status: retroSessions.status,
      createdByName: users.name,
      createdByRole: users.role,
    })
    .from(retroSessions)
    .leftJoin(users, eq(retroSessions.createdById, users.id))
    .where(eq(retroSessions.id, id));

  if (!retro) return NextResponse.json({ error: "Retro bulunamadı" }, { status: 404 });

  const items = await db
    .select({
      id: retroItems.id,
      column: retroItems.column,
      content: retroItems.content,
      votes: retroItems.votes,
      authorId: retroItems.authorId,
      createdAt: retroItems.createdAt,
      authorName: users.name,
    })
    .from(retroItems)
    .leftJoin(users, eq(retroItems.authorId, users.id))
    .where(eq(retroItems.sessionId, id))
    .orderBy(retroItems.votes);

  const actions = await db
    .select({
      id: actionItems.id,
      title: actionItems.title,
      description: actionItems.description,
      status: actionItems.status,
      dueDate: actionItems.dueDate,
      carriedFromId: actionItems.carriedFromId,
      assigneeId: actionItems.assigneeId,
      assigneeName: users.name,
    })
    .from(actionItems)
    .leftJoin(users, eq(actionItems.assigneeId, users.id))
    .where(eq(actionItems.sessionId, id));

  // Daha önce bu retroya taşınmış eski aksiyon ID'leri
  const carriedIds = actions
    .map((a) => a.carriedFromId)
    .filter(Boolean) as string[];

  // Önceki KAPALI retrolardan açık kalan aksiyonlar (KRİTİK: hatırlatma)
  const closedSessionsResult = await db
    .select({ id: retroSessions.id })
    .from(retroSessions)
    .where(eq(retroSessions.status, "CLOSED"));

  const closedIds = closedSessionsResult.map((r) => r.id);

  let openCarryOvers: typeof actions = [];
  if (closedIds.length > 0) {
    const baseQuery = db
      .select({
        id: actionItems.id,
        title: actionItems.title,
        description: actionItems.description,
        status: actionItems.status,
        dueDate: actionItems.dueDate,
        carriedFromId: actionItems.carriedFromId,
        assigneeId: actionItems.assigneeId,
        assigneeName: users.name,
        sessionTitle: retroSessions.title,
      })
      .from(actionItems)
      .leftJoin(users, eq(actionItems.assigneeId, users.id))
      .leftJoin(retroSessions, eq(actionItems.sessionId, retroSessions.id))
      .where(
        and(
          inArray(actionItems.status, ["OPEN", "IN_PROGRESS"]),
          inArray(actionItems.sessionId, closedIds),
          carriedIds.length > 0
            ? notInArray(actionItems.id, carriedIds)
            : undefined
        )
      );

    openCarryOvers = await baseQuery;
  }

  return NextResponse.json({
    retro: {
      ...retro,
      retroItems: items.map((i) => ({
        ...i,
        author: { name: i.authorName ?? "" },
      })),
      actionItems: actions.map((a) => ({
        ...a,
        assignee: a.assigneeName ? { name: a.assigneeName } : null,
      })),
    },
    openCarryOvers: openCarryOvers.map((a) => ({
      ...a,
      assignee: a.assigneeName ? { name: a.assigneeName } : null,
      session: { title: (a as { sessionTitle?: string }).sessionTitle ?? "" },
    })),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (session.role !== "SCRUM_MASTER") {
    return NextResponse.json({ error: "Sadece Scrum Master kapatabilir" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  await db
    .update(retroSessions)
    .set({ status })
    .where(eq(retroSessions.id, id));

  return NextResponse.json({ ok: true });
}
