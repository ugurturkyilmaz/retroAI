import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { actionItems, retroSessions, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/cuid";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const items = await db
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
    .orderBy(desc(actionItems.createdAt));

  return NextResponse.json({
    actionItems: items.map((i) => ({
      ...i,
      assignee: i.assigneeName ? { name: i.assigneeName } : null,
      session: { title: i.sessionTitle ?? "" },
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (session.role === "MANAGER") {
    return NextResponse.json({ error: "Yöneticiler aksiyon oluşturamaz" }, { status: 403 });
  }

  const { sessionId, title, description, assigneeId, dueDate } = await request.json();
  if (!sessionId || !title?.trim()) {
    return NextResponse.json({ error: "sessionId ve başlık gerekli" }, { status: 400 });
  }

  const id = generateId();
  await db.insert(actionItems).values({
    id,
    sessionId,
    title: title.trim(),
    description: description || null,
    assigneeId: assigneeId || null,
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  const [item] = await db
    .select({
      id: actionItems.id,
      title: actionItems.title,
      description: actionItems.description,
      status: actionItems.status,
      dueDate: actionItems.dueDate,
      carriedFromId: actionItems.carriedFromId,
      assigneeName: users.name,
      sessionTitle: retroSessions.title,
    })
    .from(actionItems)
    .leftJoin(users, eq(actionItems.assigneeId, users.id))
    .leftJoin(retroSessions, eq(actionItems.sessionId, retroSessions.id))
    .where(eq(actionItems.id, id));

  return NextResponse.json({
    actionItem: {
      ...item,
      assignee: item?.assigneeName ? { name: item.assigneeName } : null,
      session: { title: item?.sessionTitle ?? "" },
    },
  }, { status: 201 });
}
