import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/schema";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

function generateId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

async function main() {
  console.log("Seed başlıyor...");

  const scrumId = generateId();
  const managerId = generateId();
  const leadId = generateId();

  await db.insert(schema.users).values([
    { id: scrumId, name: "Ahmet Yıldız", email: "scrum@retro.ai", passwordHash: await bcrypt.hash("scrum123", 10), role: "SCRUM_MASTER" },
    { id: managerId, name: "Zeynep Kaya", email: "manager@retro.ai", passwordHash: await bcrypt.hash("manager123", 10), role: "MANAGER" },
    { id: leadId, name: "Mehmet Demir", email: "lead@retro.ai", passwordHash: await bcrypt.hash("lead123", 10), role: "TEAM_LEAD" },
  ]).onConflictDoNothing();

  const pastRetroId = generateId();
  await db.insert(schema.retroSessions).values({
    id: pastRetroId,
    title: "Sprint 40 Retrospektifi",
    date: new Date("2026-04-30"),
    status: "CLOSED",
    createdById: scrumId,
  }).onConflictDoNothing();

  await db.insert(schema.retroItems).values([
    { id: generateId(), sessionId: pastRetroId, column: "START", content: "Günlük stand-up toplantılarını kısaltmayı dene", authorId: scrumId },
    { id: generateId(), sessionId: pastRetroId, column: "STOP", content: "Son dakika sprint eklentilerini durduralım", authorId: leadId },
    { id: generateId(), sessionId: pastRetroId, column: "CONTINUE", content: "Kod inceleme sürecine devam", authorId: scrumId },
  ]).onConflictDoNothing();

  await db.insert(schema.actionItems).values({
    id: generateId(),
    sessionId: pastRetroId,
    title: "Stand-up süresini 10 dakikaya indir",
    description: "Facilitation teknikleri araştır ve uygula",
    assigneeId: leadId,
    dueDate: new Date("2026-05-15"),
    status: "OPEN",
  }).onConflictDoNothing();

  const activeRetroId = generateId();
  await db.insert(schema.retroSessions).values({
    id: activeRetroId,
    title: "Sprint 41 Retrospektifi",
    status: "ACTIVE",
    createdById: scrumId,
  }).onConflictDoNothing();

  await db.insert(schema.retroItems).values({
    id: generateId(),
    sessionId: activeRetroId,
    column: "CONTINUE",
    content: "Pair programming seanslarına devam",
    authorId: leadId,
  }).onConflictDoNothing();

  console.log("✅ Seed tamamlandı:");
  console.log("  scrum@retro.ai / scrum123  (Scrum Master)");
  console.log("  manager@retro.ai / manager123  (Yönetici)");
  console.log("  lead@retro.ai / lead123  (Ekip Sorumlusu)");
  console.log(`  Kapalı retro (1 açık aksiyon): ${pastRetroId}`);
  console.log(`  Aktif retro: ${activeRetroId}`);
}

main().catch(console.error);
