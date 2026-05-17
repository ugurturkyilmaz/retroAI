import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { retroItems, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { itemId } = await params;
  const { votes } = await request.json();

  await db.update(retroItems).set({ votes }).where(eq(retroItems.id, itemId));

  const [item] = await db
    .select({ id: retroItems.id, votes: retroItems.votes, authorName: users.name })
    .from(retroItems)
    .leftJoin(users, eq(retroItems.authorId, users.id))
    .where(eq(retroItems.id, itemId));

  return NextResponse.json({ item: { ...item, author: { name: item?.authorName ?? "" } } });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { itemId } = await params;

  const [item] = await db
    .select({ authorId: retroItems.authorId })
    .from(retroItems)
    .where(eq(retroItems.id, itemId));

  if (!item) return NextResponse.json({ error: "Madde bulunamadı" }, { status: 404 });
  if (session.role !== "SCRUM_MASTER" && item.authorId !== session.userId) {
    return NextResponse.json({ error: "Sadece yazar veya Scrum Master silebilir" }, { status: 403 });
  }

  await db.delete(retroItems).where(eq(retroItems.id, itemId));
  return NextResponse.json({ ok: true });
}
