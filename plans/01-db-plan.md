# DB Agent Planı — Prisma SQLite Şeması

## Durum: TAMAMLANDI ✅

Migration: `20260516175335_init` uygulandı.
DB dosyası: `prisma/dev.db`

---

## Şema (prisma/schema.prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         String   // SCRUM_MASTER | MANAGER | TEAM_LEAD
  createdAt    DateTime @default(now())
}

model RetroSession {
  id          String   @id @default(cuid())
  title       String
  date        DateTime @default(now())
  status      String   @default("ACTIVE")  // ACTIVE | CLOSED
  createdById String
}

model RetroItem {
  id        String   @id @default(cuid())
  sessionId String
  column    String   // START | STOP | CONTINUE
  content   String
  authorId  String
  votes     Int      @default(0)
  createdAt DateTime @default(now())
}

model ActionItem {
  id            String    @id @default(cuid())
  sessionId     String
  title         String
  description   String?
  assigneeId    String?
  dueDate       DateTime?
  status        String    @default("OPEN")  // OPEN | IN_PROGRESS | DONE
  carriedFromId String?   // ← KRİTİK: önceki retrodan taşıma zinciri
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

---

## Seed Data (prisma/seed.ts)

3 test kullanıcısı:
- `scrum@retro.ai` / `scrum123` → SCRUM_MASTER
- `manager@retro.ai` / `manager123` → MANAGER
- `lead@retro.ai` / `lead123` → TEAM_LEAD

---

## Bakım Notları
- `carriedFromId` alanını asla silme — aksiyon zinciri takibi için kritik
- Yeni alan eklemek için: şemayı güncelle → `npx prisma migrate dev --name <isim>`
- Görsel inceleme: `npx prisma studio`
