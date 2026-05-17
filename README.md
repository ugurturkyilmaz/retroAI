# RetroAI

Ekip retrospektiflerini yönetmek için tasarlanmış, çok-agent mimarisiyle geliştirilmiş bir Next.js uygulaması.

**En kritik özellik:** Önceki retrolardan tamamlanmamış aksiyon maddeleri, yeni retro açıldığında otomatik olarak hatırlatılır.

---

## Ekran Görüntüleri

| Dashboard | Retro Board | Aksiyon Hatırlatma |
|-----------|-------------|-------------------|
| Açık aksiyonlar özeti | Start / Stop / Continue kolonları | Amber banner ile önceki retrolar |

---

## Özellikler

- **Kimlik Doğrulama** — Email + şifre girişi, JWT httpOnly cookie, middleware ile korumalı rotalar
- **2 Fazlı Retro Oturumları** — BRAINSTORMING → ACTION_ITEMS → CLOSED
- **Faz 1 (Beyin Fırtınası)** — 5 dakika countdown timer, başkalarının maddeleri CSS blur ile gizlenir
- **Faz 2 (Aksiyon Maddeleri)** — Tüm maddeler görünür, aksiyon maddeleri girilir
- **3 Kolonlu Board** — Start / Stop / Continue, oy sistemi, madde silme
- **Aksiyon Maddeleri** — Oluştur, atama yap, durum güncelle (OPEN → IN_PROGRESS → DONE)
- **Aksiyon Hatırlatma** — Yeni retro açılınca önceki açık aksiyonlar banner'da listelenir; "Taşı" veya "Kapat" yapılabilir
- **Taşıma Zinciri** — `carriedFromId` alanıyla hangi retrodan geldiği takip edilir
- **Rol Tabanlı Yetki** — 4 farklı kullanıcı rolü

---

## Kullanıcı Rolleri

| Rol | Yetki |
|-----|-------|
| **Scrum Master** | Tam yetki: faz değiştir, retro aç/kapat, madde ekle/sil, aksiyon ata/güncelle |
| **Yönetici (Manager)** | Sadece okuma — form ve butonlar gizlenir |
| **Ekip Sorumlusu (Team Lead)** | Madde ekle, kendi aksiyonlarını güncelle, carry over |
| **Ekip Üyesi (Team Member)** | Faz 1'de madde ekle, Faz 2'de sadece okuma |

---

## Retro Fazları

| Faz | Status | Açıklama |
|-----|--------|----------|
| Faz 1 | `BRAINSTORMING` | 5 dk timer, blur ile bağımsız düşünme |
| Faz 2 | `ACTION_ITEMS` | Tüm maddeler görünür, aksiyon alma |
| Kapalı | `CLOSED` | Read-only arşiv |

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Veritabanı | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Auth | `jose` (JWT) + `bcryptjs` |
| Stil | Tailwind CSS v4 |
| Deploy | Vercel |

---

## Proje Yapısı

```
retroAI/
├── src/
│   ├── app/
│   │   ├── (auth)/login/          # Giriş sayfası
│   │   ├── dashboard/             # Ana sayfa — açık aksiyonlar özeti
│   │   ├── retros/                # Retro listesi
│   │   ├── retros/[id]/           # Retro board (2 fazlı + aksiyon paneli)
│   │   ├── action-items/          # Tüm aksiyonlar (filtreli)
│   │   └── api/                   # API route'ları
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── RetroColumn.tsx        # Start / Stop / Continue kolonları (blur desteği)
│   │   ├── ActionItemCard.tsx     # Aksiyon maddesi kartı
│   │   └── OpenActionsReminder.tsx  # Önceki açık aksiyonlar banner'ı (KRİTİK)
│   └── lib/
│       ├── schema.ts              # Drizzle tablo tanımları
│       ├── db.ts                  # Neon + Drizzle bağlantısı
│       ├── auth.ts                # JWT yardımcıları
│       └── cuid.ts                # ID üretici
├── agents/                        # Agent talimat dosyaları
│   ├── analyst.md
│   ├── db-agent.md
│   ├── backend-dev.md
│   ├── frontend-dev.md
│   └── tester.md
├── plans/                         # Agent plan dosyaları
│   ├── 00-analyst-plan.md
│   ├── 01-db-plan.md
│   ├── 02-backend-plan.md
│   ├── 03-frontend-plan.md
│   └── 04-tester-plan.md
├── scripts/
│   └── seed.ts                    # Test verisi
├── drizzle.config.ts
└── middleware.ts                  # Route koruması
```

---

## Veritabanı Şeması

```
users              → id, name, email, passwordHash, role (SCRUM_MASTER|MANAGER|TEAM_LEAD|TEAM_MEMBER), createdAt
retro_sessions     → id, title, date, status (BRAINSTORMING|ACTION_ITEMS|CLOSED), phaseStartedAt, createdById, createdAt
retro_items        → id, sessionId, column (START|STOP|CONTINUE), content, authorId, votes, createdAt
action_items       → id, sessionId, title, description, assigneeId, dueDate,
                     status (OPEN|IN_PROGRESS|DONE), carriedFromId*, createdAt, updatedAt
```

> `carriedFromId` — bir aksiyon maddesinin önceki retrodan taşınma zincirini takip eder.
> `phaseStartedAt` — mevcut fazın başladığı zamanı tutar; BRAINSTORMING timer hesaplaması için kullanılır.

---

## Kurulum

### Gereksinimler

- Node.js 18+
- Neon PostgreSQL hesabı (ya da herhangi bir PostgreSQL)

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/ugurturkyilmaz/retroAI.git
cd retroAI

# 2. Bağımlılıkları kur
npm install

# 3. Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local içine DATABASE_URL ve JWT_SECRET değerlerini gir

# 4. Tabloları oluştur
npx drizzle-kit push

# 5. Test verisi ekle (isteğe bağlı)
npm run seed

# 6. Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

---

## Ortam Değişkenleri

```env
DATABASE_URL=postgresql://...   # Neon bağlantı string'i
JWT_SECRET=...                  # En az 32 karakterlik rastgele string
```

JWT_SECRET üretmek için:
```bash
openssl rand -hex 32
```

---

## Test Hesapları

Seed çalıştırıldıktan sonra:

| Email | Şifre | Rol |
|-------|-------|-----|
| scrum@retro.ai | scrum123 | Scrum Master |
| manager@retro.ai | manager123 | Yönetici |
| lead@retro.ai | lead123 | Ekip Sorumlusu |
| member@retro.ai | member123 | Ekip Üyesi |

---

## Test Verisi

Seed 5 retro oturumu ve carry-over zinciri içeren aksiyon maddeleri oluşturur:

| Oturum | Durum | Açıklama |
|--------|-------|----------|
| Sprint 39 | CLOSED | 6 retro maddesi, 2 aksiyon (1 DONE, 1 zincir başlangıcı) |
| Sprint 40 | CLOSED | 6 retro maddesi, 3 aksiyon (taşınan + yeniler) |
| Sprint 41 | CLOSED | 6 retro maddesi, 4 aksiyon (taşınan + yeniler) |
| Sprint 42 | ACTION_ITEMS | 6 retro maddesi, 3 aksiyon (aktif sprint, Faz 2'de) |
| Sprint 43 | BRAINSTORMING | 3 retro maddesi (aktif sprint, Faz 1'de — timer çalışıyor) |

**Carry-Over Zinciri:**
- `PR şablonu oluştur` → S39 (OPEN) → S40 (IN_PROGRESS) → S41 (**DONE** ✓)
- `Stand-up süresini indir` → S40 (OPEN) → S41 (OPEN) → S42 (IN_PROGRESS)
- `Tasarımcıyla sync kur` → S41 (IN_PROGRESS) — henüz taşınmadı

Sprint 43 board'unu açınca önceki açık aksiyonlar `OpenActionsReminder` banner'ında listelenir.

---

## API Endpoint'leri

| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/api/auth/login` | Giriş, JWT cookie set |
| POST | `/api/auth/logout` | Cookie temizle |
| GET | `/api/auth/me` | Oturum kullanıcısı |
| GET | `/api/retros` | Tüm retro oturumları |
| POST | `/api/retros` | Yeni retro (SCRUM_MASTER) |
| GET | `/api/retros/:id` | Retro detayı + `openCarryOvers` + `phaseStartedAt` |
| PATCH | `/api/retros/:id` | Faz değiştir (BRAINSTORMING→ACTION_ITEMS→CLOSED) |
| POST | `/api/retros/:id/items` | Retro maddesi ekle (sadece BRAINSTORMING fazında) |
| PATCH/DELETE | `/api/retros/:id/items/:itemId` | Madde güncelle / sil |
| GET | `/api/action-items` | Tüm aksiyonlar |
| POST | `/api/action-items` | Yeni aksiyon (SCRUM_MASTER / TEAM_LEAD) |
| PATCH | `/api/action-items/:id` | Durum / atama güncelle (SCRUM_MASTER / TEAM_LEAD) |
| POST | `/api/action-items/:id/carry` | Yeni retroya taşı (SCRUM_MASTER / TEAM_LEAD) |
| GET | `/api/users` | Kullanıcı listesi (atama için) |

---

## Vercel Deploy

1. Vercel'de yeni proje oluştur → `ugurturkyilmaz/retroAI` reposunu bağla
2. Environment Variables ekle:
   - `DATABASE_URL` → Neon connection string
   - `JWT_SECRET` → güçlü rastgele string
3. Deploy et

---

## Çok-Agent Mimarisi

Bu proje, birden fazla yapay zeka agentının iş birliğiyle geliştirilmiştir:

| Agent | Dosya | Görev |
|-------|-------|-------|
| Analist | `agents/analyst.md` | Gereksinim analizi, user story, iş dağıtımı |
| DB Agent | `agents/db-agent.md` | Drizzle şeması, Neon bağlantısı, seed |
| Backend Dev | `agents/backend-dev.md` | API route'ları, auth, faz yönetimi |
| Frontend Dev | `agents/frontend-dev.md` | Sayfalar, bileşenler, timer, blur efekti |
| Tester | `agents/tester.md` | Test senaryoları, bug raporlama |

Her agent kendi planını `plans/` klasöründe tutar.
