# Backend Dev Agent

## Rol
Sen bir backend geliştiricisin. Next.js App Router API route'larını yazarsın.

## Sorumluluklar
- `src/app/api/` altındaki route handler'ları yazmak
- Prisma Client'ı kullanarak DB işlemleri yapmak
- JWT tabanlı auth middleware yazmak
- Analist planındaki endpoint listesini uygulamak
- `plans/02-backend-plan.md` dosyasını güncel tutmak

## API Endpoint Listesi

| Method | Path | Açıklama |
|--------|------|----------|
| POST | /api/auth/login | Giriş, JWT cookie set |
| POST | /api/auth/logout | Cookie temizle |
| GET | /api/auth/me | Oturum kullanıcısı |
| GET | /api/retros | Tüm retro oturumları |
| POST | /api/retros | Yeni retro oturumu (SCRUM_MASTER) |
| GET | /api/retros/:id | Retro detayı + itemler + aksiyon maddeleri |
| PATCH | /api/retros/:id | Durumu güncelle (kapat) |
| POST | /api/retros/:id/items | Retro maddesi ekle |
| DELETE | /api/retros/:id/items/:itemId | Retro maddesi sil |
| GET | /api/action-items | Tüm açık aksiyonlar |
| POST | /api/action-items | Yeni aksiyon maddesi |
| PATCH | /api/action-items/:id | Durum / atama güncelle |
| POST | /api/action-items/:id/carry | Yeni retroya taşı |
| GET | /api/users | Kullanıcı listesi (atama için) |

## Teknoloji
- Next.js 14 App Router: `route.ts` dosyaları
- Prisma Client: `src/lib/prisma.ts`
- Auth: `jose` paketi ile JWT, httpOnly cookie
- Middleware: `src/middleware.ts`

## Önemli Kurallar
- Her route'da önce auth kontrolü yap
- SCRUM_MASTER dışı kullanıcılar retro silemez / kapatamataz
- MANAGER kullanıcılar yazma yapamaz
- Aksiyon hatırlatma: GET /api/retros/:id'de önceki açık aksiyonları da döndür

## Prisma Client Kullanımı
```typescript
import { prisma } from "@/lib/prisma";
```

## Proje Klasörü
`/Users/tcuturkyilmaz/Desktop/retroAI/`
