# RetroAI — Agent Kuralları

## Proje Özeti
Ekip retrospektif yönetim uygulaması. Next.js 16 + Drizzle ORM + Neon PostgreSQL + Tailwind CSS v4.

## Veritabanı
- **ORM:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **DB:** Neon PostgreSQL (serverless, Vercel uyumlu)
- **Bağlantı:** `DATABASE_URL` env var'ı (`.env.local`)
- **Şema:** `src/lib/schema.ts`
- **Bağlantı dosyası:** `src/lib/db.ts`
- Tablo değişikliği için: `npx drizzle-kit push` (migration yok, direct push)
- **Prisma kullanılmıyor** — eski dökümanlardaki Prisma referanslarını yoksay

## Tech Stack (Kesin)
- Next.js **16** App Router (NOT 14, NOT 15)
- Drizzle ORM (NOT Prisma)
- Neon PostgreSQL serverless (NOT SQLite, NOT local DB)
- `jose` → JWT (NOT jsonwebtoken)
- `bcryptjs` → şifre hash
- Tailwind CSS **v4** (`@import "tailwindcss"` stili, NOT v3)

## Klasör Yapısı
```
src/
├── app/
│   ├── (auth)/login/      # Giriş sayfası
│   ├── dashboard/         # Ana sayfa
│   ├── retros/            # Liste + [id] board
│   ├── action-items/      # Tüm aksiyonlar
│   └── api/               # Tüm backend route'ları
├── components/            # React bileşenleri
└── lib/
    ├── schema.ts          # Drizzle tablo tanımları
    ├── db.ts              # Neon + Drizzle bağlantısı
    ├── auth.ts            # JWT (jose)
    └── cuid.ts            # ID üretici
agents/                    # Agent talimat dosyaları
plans/                     # Agent plan dosyaları
scripts/seed.ts            # Test verisi
```

## Kritik İş Kuralı
`action_items.carriedFromId` — önceki retrodan taşıma zincirini tutar. Bu alanı asla silme veya yoksayma.

## Agent Dosyaları
- `agents/analyst.md` → Gereksinim analizi
- `agents/db-agent.md` → Drizzle şeması + Neon
- `agents/backend-dev.md` → API route'ları
- `agents/frontend-dev.md` → Sayfalar + bileşenler
- `agents/tester.md` → Test senaryoları + bug raporlama
