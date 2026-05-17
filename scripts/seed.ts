import * as path from "path";
import * as fs from "fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/schema";
import bcrypt from "bcryptjs";

// .env veya .env.local dosyasını oku (hangisi varsa)
const envPath = [".env.local", ".env"]
  .map(f => path.resolve(__dirname, "..", f))
  .find(f => fs.existsSync(f)) ?? "";
if (envPath) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function generateId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

async function main() {
  // DB bağlantısı burada kurulur — env zaten yüklenmiş olur
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Seed başlıyor...");

  // ─── TEMIZLE ─────────────────────────────────────────────────────────────────
  console.log("  Tablolar temizleniyor...");
  await sql`TRUNCATE action_items, retro_items, retro_sessions, users RESTART IDENTITY CASCADE`;
  console.log("  Tablolar temizlendi ✓");

  // ─── KULLANICILAR ────────────────────────────────────────────────────────────
  const scrumId  = generateId();
  const managerId = generateId();
  const leadId   = generateId();
  const memberId = generateId();

  await db.insert(schema.users).values([
    { id: scrumId,   name: "Ahmet Yıldız",  email: "scrum@retro.ai",   passwordHash: await bcrypt.hash("scrum123",   10), role: "SCRUM_MASTER" },
    { id: managerId, name: "Zeynep Kaya",   email: "manager@retro.ai", passwordHash: await bcrypt.hash("manager123", 10), role: "MANAGER" },
    { id: leadId,    name: "Mehmet Demir",  email: "lead@retro.ai",    passwordHash: await bcrypt.hash("lead123",    10), role: "TEAM_LEAD" },
    { id: memberId,  name: "Ali Vural",     email: "member@retro.ai",  passwordHash: await bcrypt.hash("member123",  10), role: "TEAM_MEMBER" },
  ]).onConflictDoNothing();

  // ─── SPRINT 39 — CLOSED ──────────────────────────────────────────────────────
  const retro39Id = generateId();
  await db.insert(schema.retroSessions).values({
    id: retro39Id,
    title: "Sprint 39 Retrospektifi",
    date: new Date("2026-04-02"),
    status: "CLOSED",
    createdById: scrumId,
  }).onConflictDoNothing();

  await db.insert(schema.retroItems).values([
    { id: generateId(), sessionId: retro39Id, column: "START",    content: "Feature flag kullanmaya başlayalım",           authorId: scrumId,  votes: 4 },
    { id: generateId(), sessionId: retro39Id, column: "START",    content: "PR'lara daha fazla bağlam yazalım",             authorId: leadId,   votes: 3 },
    { id: generateId(), sessionId: retro39Id, column: "STOP",     content: "Review olmadan merge etmeyi bırakalım",         authorId: scrumId,  votes: 5 },
    { id: generateId(), sessionId: retro39Id, column: "STOP",     content: "Ticket olmadan iş almayı durduralım",           authorId: memberId, votes: 2 },
    { id: generateId(), sessionId: retro39Id, column: "CONTINUE", content: "Haftalık teknik borç değerlendirmesi iyi gidiyor", authorId: leadId, votes: 3 },
    { id: generateId(), sessionId: retro39Id, column: "CONTINUE", content: "Çift programlama seansları çok verimli",         authorId: memberId, votes: 4 },
  ]).onConflictDoNothing();

  // Sprint 39 aksiyon → DONE (tamamlandı)
  const action39_1Id = generateId();
  await db.insert(schema.actionItems).values({
    id: action39_1Id,
    sessionId: retro39Id,
    title: "Feature flag altyapısını kur",
    description: "LaunchDarkly veya benzeri bir araç entegre edilecek",
    assigneeId: scrumId,
    dueDate: new Date("2026-04-10"),
    status: "DONE",
  }).onConflictDoNothing();

  // Sprint 39 aksiyon → taşınacak (OPEN kaldı)
  const action39_2Id = generateId();
  await db.insert(schema.actionItems).values({
    id: action39_2Id,
    sessionId: retro39Id,
    title: "PR şablonu oluştur",
    description: "Context, test planı ve ekran görüntüsü bölümleri içeren template",
    assigneeId: leadId,
    dueDate: new Date("2026-04-10"),
    status: "OPEN",
  }).onConflictDoNothing();

  // ─── SPRINT 40 — CLOSED ──────────────────────────────────────────────────────
  const retro40Id = generateId();
  await db.insert(schema.retroSessions).values({
    id: retro40Id,
    title: "Sprint 40 Retrospektifi",
    date: new Date("2026-04-16"),
    status: "CLOSED",
    createdById: scrumId,
  }).onConflictDoNothing();

  await db.insert(schema.retroItems).values([
    { id: generateId(), sessionId: retro40Id, column: "START",    content: "Deployment öncesi checklist uygulayalım",       authorId: scrumId,  votes: 5 },
    { id: generateId(), sessionId: retro40Id, column: "START",    content: "Async standuplara geçmeyi deneyelim",            authorId: memberId, votes: 2 },
    { id: generateId(), sessionId: retro40Id, column: "STOP",     content: "Son dakika sprint eklentilerini durduralım",     authorId: leadId,   votes: 4 },
    { id: generateId(), sessionId: retro40Id, column: "STOP",     content: "Yetersiz test yazıp merge etmeyi bırakalım",     authorId: scrumId,  votes: 3 },
    { id: generateId(), sessionId: retro40Id, column: "CONTINUE", content: "Kod inceleme sürecine devam",                    authorId: scrumId,  votes: 4 },
    { id: generateId(), sessionId: retro40Id, column: "CONTINUE", content: "Sprint planlama toplantıları iyi akıyor",        authorId: leadId,   votes: 2 },
  ]).onConflictDoNothing();

  // Sprint 40: PR şablonu Sprint 39'dan taşındı → hâlâ IN_PROGRESS
  const action40_carriedId = generateId();
  await db.insert(schema.actionItems).values({
    id: action40_carriedId,
    sessionId: retro40Id,
    title: "PR şablonu oluştur",
    description: "Context, test planı ve ekran görüntüsü bölümleri içeren template",
    assigneeId: leadId,
    dueDate: new Date("2026-04-25"),
    status: "IN_PROGRESS",
    carriedFromId: action39_2Id,
  }).onConflictDoNothing();

  // Sprint 40: yeni aksiyon → DONE
  const action40_1Id = generateId();
  await db.insert(schema.actionItems).values({
    id: action40_1Id,
    sessionId: retro40Id,
    title: "Deployment checklist dökümanı yaz",
    description: "Pre/post deploy adımlarını içeren Confluence sayfası",
    assigneeId: scrumId,
    dueDate: new Date("2026-04-23"),
    status: "DONE",
  }).onConflictDoNothing();

  // Sprint 40: stand-up süresi → OPEN (bir sonraki retroya taşınacak)
  const action40_2Id = generateId();
  await db.insert(schema.actionItems).values({
    id: action40_2Id,
    sessionId: retro40Id,
    title: "Stand-up süresini 10 dakikaya indir",
    description: "Facilitation teknikleri araştır ve uygula",
    assigneeId: leadId,
    dueDate: new Date("2026-04-30"),
    status: "OPEN",
  }).onConflictDoNothing();

  // ─── SPRINT 41 — CLOSED ──────────────────────────────────────────────────────
  const retro41Id = generateId();
  await db.insert(schema.retroSessions).values({
    id: retro41Id,
    title: "Sprint 41 Retrospektifi",
    date: new Date("2026-04-30"),
    status: "CLOSED",
    createdById: scrumId,
  }).onConflictDoNothing();

  await db.insert(schema.retroItems).values([
    { id: generateId(), sessionId: retro41Id, column: "START",    content: "End-to-end testleri CI pipeline'a ekleyelim",   authorId: scrumId,  votes: 6 },
    { id: generateId(), sessionId: retro41Id, column: "START",    content: "Tasarımcıyla haftalık sync koyalım",             authorId: memberId, votes: 3 },
    { id: generateId(), sessionId: retro41Id, column: "STOP",     content: "Deploy günü yeni feature almayı durduralım",    authorId: leadId,   votes: 5 },
    { id: generateId(), sessionId: retro41Id, column: "STOP",     content: "Test etmeden 'done' demekten vazgeçelim",        authorId: scrumId,  votes: 4 },
    { id: generateId(), sessionId: retro41Id, column: "CONTINUE", content: "Pair programming seanslarına devam",             authorId: leadId,   votes: 5 },
    { id: generateId(), sessionId: retro41Id, column: "CONTINUE", content: "Günlük async durum güncellemeleri işe yarıyor",  authorId: memberId, votes: 3 },
  ]).onConflictDoNothing();

  // Sprint 41: PR şablonu Sprint 40'tan taşındı → DONE (sonunda bitti!)
  await db.insert(schema.actionItems).values({
    id: generateId(),
    sessionId: retro41Id,
    title: "PR şablonu oluştur",
    description: "Context, test planı ve ekran görüntüsü bölümleri içeren template",
    assigneeId: leadId,
    dueDate: new Date("2026-05-07"),
    status: "DONE",
    carriedFromId: action40_carriedId,
  }).onConflictDoNothing();

  // Sprint 41: stand-up Sprint 40'tan taşındı → hâlâ OPEN (Sprint 42'ye de taşınacak)
  const action41_carriedId = generateId();
  await db.insert(schema.actionItems).values({
    id: action41_carriedId,
    sessionId: retro41Id,
    title: "Stand-up süresini 10 dakikaya indir",
    description: "Facilitation teknikleri araştır ve uygula",
    assigneeId: leadId,
    dueDate: new Date("2026-05-07"),
    status: "OPEN",
    carriedFromId: action40_2Id,
  }).onConflictDoNothing();

  // Sprint 41: yeni aksiyon → DONE
  await db.insert(schema.actionItems).values({
    id: generateId(),
    sessionId: retro41Id,
    title: "E2E test framework'ü seç ve kur",
    description: "Playwright veya Cypress karşılaştırması yap",
    assigneeId: scrumId,
    dueDate: new Date("2026-05-07"),
    status: "DONE",
  }).onConflictDoNothing();

  // Sprint 41: yeni aksiyon → IN_PROGRESS (Sprint 42'de devam ediyor)
  const action41_2Id = generateId();
  await db.insert(schema.actionItems).values({
    id: action41_2Id,
    sessionId: retro41Id,
    title: "Tasarımcıyla haftalık sync toplantısı kur",
    description: "Figma review + sprint handoff için düzenli slot",
    assigneeId: memberId,
    dueDate: new Date("2026-05-14"),
    status: "IN_PROGRESS",
  }).onConflictDoNothing();

  // ─── SPRINT 42 — ACTION_ITEMS (Faz 2'de) ────────────────────────────────────
  const retro42Id = generateId();
  await db.insert(schema.retroSessions).values({
    id: retro42Id,
    title: "Sprint 42 Retrospektifi",
    date: new Date("2026-05-14"),
    status: "ACTION_ITEMS",
    createdById: scrumId,
  }).onConflictDoNothing();

  await db.insert(schema.retroItems).values([
    { id: generateId(), sessionId: retro42Id, column: "START",    content: "Monitoring ve alerting kuralım artık",           authorId: scrumId,  votes: 4 },
    { id: generateId(), sessionId: retro42Id, column: "START",    content: "Teknik borç sprint'e yazalım, görünür olsun",    authorId: leadId,   votes: 5 },
    { id: generateId(), sessionId: retro42Id, column: "STOP",     content: "Kritik yolda refactor yapmayı bırakalım",        authorId: memberId, votes: 3 },
    { id: generateId(), sessionId: retro42Id, column: "STOP",     content: "Tanımsız kabulle ticket almayı durduralım",      authorId: leadId,   votes: 4 },
    { id: generateId(), sessionId: retro42Id, column: "CONTINUE", content: "Retrospektif kalitesi yükseliyor, sürdürelim",   authorId: scrumId,  votes: 6 },
    { id: generateId(), sessionId: retro42Id, column: "CONTINUE", content: "Kod kalite metrikleri takibi iyi gidiyor",       authorId: memberId, votes: 3 },
  ]).onConflictDoNothing();

  // Sprint 42: stand-up Sprint 41'den taşındı → IN_PROGRESS (CARRY ZİNCİRİ: 40→41→42)
  await db.insert(schema.actionItems).values({
    id: generateId(),
    sessionId: retro42Id,
    title: "Stand-up süresini 10 dakikaya indir",
    description: "Facilitation teknikleri araştır ve uygula",
    assigneeId: leadId,
    dueDate: new Date("2026-05-21"),
    status: "IN_PROGRESS",
    carriedFromId: action41_carriedId,
  }).onConflictDoNothing();

  // Sprint 42: yeni aksiyonlar
  await db.insert(schema.actionItems).values([
    {
      id: generateId(),
      sessionId: retro42Id,
      title: "Datadog/Grafana alerting kur",
      description: "Error rate ve latency için alert threshold'ları belirle",
      assigneeId: scrumId,
      dueDate: new Date("2026-05-21"),
      status: "OPEN",
    },
    {
      id: generateId(),
      sessionId: retro42Id,
      title: "Teknik borç backlog'u oluştur",
      description: "Tüm bilinen teknik borçları Jira'da ayrı epic altında topla",
      assigneeId: leadId,
      dueDate: new Date("2026-05-21"),
      status: "IN_PROGRESS",
    },
  ]).onConflictDoNothing();

  // ─── SPRINT 43 — BRAINSTORMING (aktif, Faz 1) ───────────────────────────────
  const retro43Id = generateId();
  await db.insert(schema.retroSessions).values({
    id: retro43Id,
    title: "Sprint 43 Retrospektifi",
    date: new Date("2026-05-17"),
    status: "BRAINSTORMING",
    createdById: scrumId,
  }).onConflictDoNothing();

  // Faz 1'de birkaç madde var (birinin gizleneceği, birinin net görüneceği test için)
  await db.insert(schema.retroItems).values([
    { id: generateId(), sessionId: retro43Id, column: "START",    content: "Deployment pipeline'ı otomatikleştirelim",       authorId: scrumId,  votes: 0 },
    { id: generateId(), sessionId: retro43Id, column: "STOP",     content: "Scope creep'e dur diyelim",                      authorId: leadId,   votes: 0 },
    { id: generateId(), sessionId: retro43Id, column: "CONTINUE", content: "Ekip içi bilgi paylaşım kültürü sürsün",          authorId: memberId, votes: 0 },
  ]).onConflictDoNothing();

  // ─── ÖZET ────────────────────────────────────────────────────────────────────
  console.log("\nSeed tamamlandı ✅\n");
  console.log("── Kullanıcılar ──────────────────────────────────");
  console.log("  scrum@retro.ai   / scrum123    → SCRUM_MASTER");
  console.log("  manager@retro.ai / manager123  → MANAGER");
  console.log("  lead@retro.ai    / lead123     → TEAM_LEAD");
  console.log("  member@retro.ai  / member123   → TEAM_MEMBER");
  console.log("\n── Retro Oturumları ──────────────────────────────");
  console.log(`  Sprint 39  CLOSED       → ${retro39Id}`);
  console.log(`  Sprint 40  CLOSED       → ${retro40Id}`);
  console.log(`  Sprint 41  CLOSED       → ${retro41Id}`);
  console.log(`  Sprint 42  ACTION_ITEMS → ${retro42Id}`);
  console.log(`  Sprint 43  BRAINSTORMING→ ${retro43Id}`);
  console.log("\n── Carry-Over Zinciri ────────────────────────────");
  console.log("  'PR şablonu oluştur'       : S39(OPEN) → S40(IN_PROGRESS) → S41(DONE) ✓");
  console.log("  'Stand-up süresini indir'  : S40(OPEN) → S41(OPEN) → S42(IN_PROGRESS)");
  console.log("  'Tasarımcıyla sync kur'    : S41(IN_PROGRESS) — henüz taşınmadı");
  console.log("\n  Sprint 43 boardunu açınca önceki açık aksiyonlar banner'da görünür!");
}

main().catch(console.error);
