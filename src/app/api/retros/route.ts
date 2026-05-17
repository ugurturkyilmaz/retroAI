import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { retroSessions, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/cuid";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const retros = await db
    .select({
      id: retroSessions.id,
      title: retroSessions.title,
      date: retroSessions.date,
      status: retroSessions.status,
      createdAt: retroSessions.createdAt,
      createdByName: users.name,
    })
    .from(retroSessions)
    .leftJoin(users, eq(retroSessions.createdById, users.id))
    .orderBy(desc(retroSessions.date));

  return NextResponse.json({ retros });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (session.role !== "SCRUM_MASTER") {
    return NextResponse.json({ error: "Sadece Scrum Master retro oluşturabilir" }, { status: 403 });
  }

  const { title } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Başlık gerekli" }, { status: 400 });
  }

  const id = generateId();
  await db.insert(retroSessions).values({
    id,
    title: title.trim(),
    createdById: session.userId,
  });

  const [retro] = await db
    .select({ id: retroSessions.id, title: retroSessions.title, date: retroSessions.date, status: retroSessions.status, createdByName: users.name })
    .from(retroSessions)
    .leftJoin(users, eq(retroSessions.createdById, users.id))
    .where(eq(retroSessions.id, id));

  return NextResponse.json({ retro }, { status: 201 });
}
