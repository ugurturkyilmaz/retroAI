import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { actionItems, retroSessions, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/cuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (session.role === "MANAGER") {
    return NextResponse.json({ error: "Yöneticiler bu işlemi yapamaz" }, { status: 403 });
  }

  const { id: carriedFromId } = await params;
  const { targetSessionId } = await request.json();
  if (!targetSessionId) return NextResponse.json({ error: "targetSessionId gerekli" }, { status: 400 });

  const [original] = await db
    .select()
    .from(actionItems)
    .where(eq(actionItems.id, carriedFromId));

  if (!original) return NextResponse.json({ error: "Aksiyon bulunamadı" }, { status: 404 });

  const id = generateId();
  await db.insert(actionItems).values({
    id,
    sessionId: targetSessionId,
    title: original.title,
    description: original.description,
    assigneeId: original.assigneeId,
    dueDate: original.dueDate,
    status: "OPEN",
    carriedFromId,
  });

  const [item] = await db
    .select({
      id: actionItems.id,
      title: actionItems.title,
      status: actionItems.status,
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
