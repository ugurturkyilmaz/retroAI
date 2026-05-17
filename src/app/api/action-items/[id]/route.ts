import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { actionItems, retroSessions, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const [existing] = await db
    .select({ assigneeId: actionItems.assigneeId })
    .from(actionItems)
    .where(eq(actionItems.id, id));

  if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  if (session.role === "TEAM_LEAD" && existing.assigneeId !== session.userId) {
    return NextResponse.json({ error: "Sadece kendi aksiyonlarınızı güncelleyebilirsiniz" }, { status: 403 });
  }
  if (session.role === "MANAGER") {
    return NextResponse.json({ error: "Yöneticiler güncelleme yapamaz" }, { status: 403 });
  }

  const updateData: Partial<typeof actionItems.$inferInsert> = {};
  if (body.status) updateData.status = body.status;
  if (body.title) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description || null;
  if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId || null;
  if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  updateData.updatedAt = new Date();

  await db.update(actionItems).set(updateData).where(eq(actionItems.id, id));

  const [item] = await db
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
    .where(eq(actionItems.id, id));

  return NextResponse.json({
    actionItem: {
      ...item,
      assignee: item?.assigneeName ? { name: item.assigneeName } : null,
      session: { title: item?.sessionTitle ?? "" },
    },
  });
}
