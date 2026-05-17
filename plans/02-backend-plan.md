# Backend Dev Planı — API Route'ları

## Teknoloji
- Next.js 14 App Router (`src/app/api/`)
- Prisma Client (`src/lib/prisma.ts`)
- `jose` ile JWT, httpOnly cookie
- Middleware: `src/middleware.ts`

---

## Dosya Yapısı

```
src/
├── lib/
│   ├── prisma.ts          # Prisma singleton
│   └── auth.ts            # JWT yardımcıları
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
        │       ├── route.ts           # GET detail, PATCH close
        │       └── items/
        │           ├── route.ts       # POST add item
        │           └── [itemId]/route.ts  # DELETE item
        ├── action-items/
        │   ├── route.ts               # GET all open, POST create
        │   └── [id]/
        │       ├── route.ts           # PATCH update
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
- Retro detayını döndür
- **Kritik:** `openCarryOvers` alanında önceki retroların OPEN/IN_PROGRESS aksiyonlarını da döndür
  ```ts
  openCarryOvers = await prisma.actionItem.findMany({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] }, session: { status: "CLOSED" } }
  })
  ```

### POST /api/action-items/:id/carry
- Mevcut aksiyon maddesini yeni retroya taşı
- Yeni ActionItem oluştur: `carriedFromId = id`
- Eski kaydın statusunu IN_PROGRESS'te bırak (ya da kullanıcı seçeceği)

---

## Yetki Matrisi
| İşlem | SCRUM_MASTER | TEAM_LEAD | MANAGER |
|-------|:---:|:---:|:---:|
| Retro aç/kapat | ✅ | ❌ | ❌ |
| Madde ekle | ✅ | ✅ | ❌ |
| Madde sil | ✅ | kendi | ❌ |
| Aksiyon oluştur | ✅ | ✅ | ❌ |
| Aksiyon güncelle | ✅ | kendi | ❌ |
| Görüntüle | ✅ | ✅ | ✅ |
