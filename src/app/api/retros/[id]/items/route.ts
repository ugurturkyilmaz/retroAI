import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { retroItems, retroSessions, users } from "@/lib/schema";
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
    return NextResponse.json({ error: "Yöneticiler madde ekleyemez" }, { status: 403 });
  }

  const { id: sessionId } = await params;
  const { column, content } = await request.json();

  if (!["START", "STOP", "CONTINUE"].includes(column)) {
    return NextResponse.json({ error: "Geçersiz kolon" }, { status: 400 });
  }
  if (!content?.trim()) {
    return NextResponse.json({ error: "İçerik gerekli" }, { status: 400 });
  }

  const [retro] = await db
    .select({ status: retroSessions.status })
    .from(retroSessions)
    .where(eq(retroSessions.id, sessionId));

  if (!retro) return NextResponse.json({ error: "Retro bulunamadı" }, { status: 404 });
  if (retro.status === "CLOSED") {
    return NextResponse.json({ error: "Kapalı retroya madde eklenemez" }, { status: 400 });
  }

  const id = generateId();
  await db.insert(retroItems).values({
    id,
    sessionId,
    column,
    content: content.trim(),
    authorId: session.userId,
  });

  const [item] = await db
    .select({
      id: retroItems.id,
      column: retroItems.column,
      content: retroItems.content,
      votes: retroItems.votes,
      authorId: retroItems.authorId,
      authorName: users.name,
    })
    .from(retroItems)
    .leftJoin(users, eq(retroItems.authorId, users.id))
    .where(eq(retroItems.id, id));

  return NextResponse.json({
    item: { ...item, author: { name: item?.authorName ?? "" } },
  }, { status: 201 });
}
