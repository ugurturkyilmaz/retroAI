# Backend Dev Planı — API Route'ları

## Teknoloji
- Next.js 16 App Router (`src/app/api/`)
- Drizzle ORM + Neon PostgreSQL (`src/lib/db.ts`)
- `jose` ile JWT, httpOnly cookie
- Middleware: `src/middleware.ts`

---

## Dosya Yapısı

```
src/
├── lib/
│   ├── db.ts              # Neon + Drizzle bağlantısı
│   ├── schema.ts          # Drizzle tablo tanımları
│   ├── auth.ts            # JWT yardımcıları (jose)
│   └── cuid.ts            # ID üretici
├── middleware.ts           # Korumalı route kontrolü
└── app/
    └── api/
        ├── auth/
        │   ├── login/route.ts
        │   ├── logout/route.ts
        │   └── me/route.ts
        ├── retros/
        │   ├── route.ts               # GET list, POST create
        │   └── [id]/
        │       ├── route.ts           # GET detail, PATCH phase change
        │       └── items/
        │           ├── route.ts       # POST add item (only BRAINSTORMING)
        │           └── [itemId]/route.ts  # PATCH vote, DELETE item
        ├── action-items/
        │   ├── route.ts               # GET all, POST create
        │   └── [id]/
        │       ├── route.ts           # PATCH update status/assignee
        │       └── carry/route.ts     # POST carry to new retro
        └── users/
            └── route.ts               # GET list (atama için)
```

---

## Endpoint Detayları

### POST /api/auth/login
- Body: `{ email, password }`
- bcrypt ile şifre doğrula
- JWT imzala (payload: userId, role), 7 gün geçerli
- httpOnly cookie set

### GET /api/retros/:id
- Retro detayını döndür (phaseStartedAt dahil)
- **Kritik:** `openCarryOvers` alanında önceki CLOSED retroların OPEN/IN_PROGRESS aksiyonlarını da döndür
- Items ve action items ayrı sorgu ile yükle (Drizzle join veya iki select)

### PATCH /api/retros/:id
- Faz değiştir: `validStatuses = ["BRAINSTORMING", "ACTION_ITEMS", "CLOSED"]`
- Sadece SCRUM_MASTER yetkili
- Geçişte `phaseStartedAt` güncellenir (timer sıfırlanır)

### POST /api/action-items/:id/carry
- Mevcut aksiyon maddesini yeni retroya taşı
- Yeni ActionItem oluştur: `carriedFromId = id`
- Eski kaydın statusunu değiştirme
- SCRUM_MASTER / TEAM_LEAD yetkili (TEAM_MEMBER → 403)

---

## Yetki Matrisi
| İşlem | SCRUM_MASTER | TEAM_LEAD | MANAGER | TEAM_MEMBER |
|-------|:---:|:---:|:---:|:---:|
| Faz değiştir | ✅ | ❌ | ❌ | ❌ |
| Retro maddesi ekle | ✅ | ✅ | ❌ | ✅ (Faz 1) |
| Madde sil | ✅ | kendi | ❌ | ❌ |
| Aksiyon oluştur | ✅ | ✅ | ❌ | ❌ |
| Aksiyon güncelle | ✅ | kendi | ❌ | ❌ |
| Carry over | ✅ | ✅ | ❌ | ❌ |
| Görüntüle | ✅ | ✅ | ✅ | ✅ |

## Faz Kuralları
- Retro maddesi sadece `BRAINSTORMING` fazında eklenebilir → diğer fazda 403
- `phaseStartedAt` alanı, BRAINSTORMING başladığında set edilir; 5 dk timer için frontend bu değeri kullanır
