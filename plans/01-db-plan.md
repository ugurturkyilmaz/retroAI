# DB Agent Planı — Drizzle ORM + Neon PostgreSQL

## Durum: TAMAMLANDI ✅

ORM: Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
DB: Neon PostgreSQL (serverless, Vercel uyumlu)
Şema dosyası: `src/lib/schema.ts`
Bağlantı dosyası: `src/lib/db.ts`

---

## Şema (src/lib/schema.ts)

```typescript
users
  id           text (PK, cuid)
  name         text
  email        text (unique)
  passwordHash text
  role         text default "TEAM_MEMBER"  // SCRUM_MASTER | MANAGER | TEAM_LEAD | TEAM_MEMBER
  createdAt    timestamp default now()

retro_sessions
  id             text (PK, cuid)
  title          text
  date           timestamp default now()
  status         text default "BRAINSTORMING"  // BRAINSTORMING | ACTION_ITEMS | CLOSED
  phaseStartedAt timestamp default now()       // ← timer hesabı için
  createdById    text
  createdAt      timestamp default now()

retro_items
  id        text (PK, cuid)
  sessionId text
  column    text   // START | STOP | CONTINUE
  content   text
  authorId  text
  votes     integer default 0
  createdAt timestamp default now()

action_items
  id            text (PK, cuid)
  sessionId     text
  title         text
  description   text (nullable)
  assigneeId    text (nullable)
  dueDate       timestamp (nullable)
  status        text default "OPEN"  // OPEN | IN_PROGRESS | DONE
  carriedFromId text (nullable)      // ← KRİTİK: önceki retrodan taşıma zinciri
  createdAt     timestamp default now()
  updatedAt     timestamp default now()
```

---

## Seed Data (scripts/seed.ts)

4 test kullanıcısı:
- `scrum@retro.ai` / `scrum123` → SCRUM_MASTER
- `manager@retro.ai` / `manager123` → MANAGER
- `lead@retro.ai` / `lead123` → TEAM_LEAD
- `member@retro.ai` / `member123` → TEAM_MEMBER

5 retro oturumu:
| Oturum | Durum | İçerik |
|--------|-------|--------|
| Sprint 39 | CLOSED | 6 madde (oylu), 2 aksiyon |
| Sprint 40 | CLOSED | 6 madde (oylu), 3 aksiyon (1 carry-over) |
| Sprint 41 | CLOSED | 6 madde (oylu), 4 aksiyon (2 carry-over) |
| Sprint 42 | ACTION_ITEMS | 6 madde (oylu), 3 aksiyon (1 carry-over) |
| Sprint 43 | BRAINSTORMING | 3 madde (oy yok), aksiyon yok |

Carry-over zinciri:
- `PR şablonu`: S39(OPEN) → S40(IN_PROGRESS) → S41(DONE ✓)
- `Stand-up süresi`: S40(OPEN) → S41(OPEN) → S42(IN_PROGRESS)  ← 3 sprint taşındı!

---

## Komutlar
```bash
# Şemayı Neon DB'ye uygula
npx drizzle-kit push

# Test verisi ekle
npm run seed

# Görsel inceleme
npx drizzle-kit studio
```

---

## Bakım Notları
- `carriedFromId` alanını asla silme — aksiyon zinciri takibi için kritik
- `phaseStartedAt` alanını asla silme — BRAINSTORMING timer hesabı için kritik
- Yeni alan eklemek için: `src/lib/schema.ts` güncelle → `npx drizzle-kit push`
- **Prisma kullanılmıyor** — eski dökümanlardaki Prisma referanslarını yoksay
