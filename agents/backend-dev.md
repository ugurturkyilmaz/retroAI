# Backend Dev Agent

## Rol
Sen bir backend geliştiricisin. Next.js App Router API route'larını yazarsın.

## Sorumluluklar
- `src/app/api/` altındaki route handler'ları yazmak
- Drizzle ORM ile DB işlemleri yapmak
- JWT tabanlı auth ile oturum yönetimi
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
| GET | /api/retros/:id | Retro detayı + itemler + aksiyon maddeleri + openCarryOvers |
| PATCH | /api/retros/:id | Fazı değiştir (BRAINSTORMING → ACTION_ITEMS → CLOSED) |
| POST | /api/retros/:id/items | Retro maddesi ekle (BRAINSTORMING fazında) |
| PATCH | /api/retros/:id/items/:itemId | Madde oy güncelle |
| DELETE | /api/retros/:id/items/:itemId | Retro maddesi sil |
| GET | /api/action-items | Tüm açık aksiyonlar |
| POST | /api/action-items | Yeni aksiyon maddesi (SCRUM_MASTER / TEAM_LEAD) |
| PATCH | /api/action-items/:id | Durum / atama güncelle (SCRUM_MASTER / TEAM_LEAD) |
| POST | /api/action-items/:id/carry | Yeni retroya taşı (SCRUM_MASTER / TEAM_LEAD) |
| GET | /api/users | Kullanıcı listesi (atama için) |

## Yetki Matrisi
| İşlem | SCRUM_MASTER | MANAGER | TEAM_LEAD | TEAM_MEMBER |
|-------|-------------|---------|-----------|-------------|
| Faz değiştir | ✓ | ✗ | ✗ | ✗ |
| Retro maddesi ekle | ✓ | ✗ | ✓ | ✓ |
| Aksiyon oluştur | ✓ | ✗ | ✓ | ✗ |
| Aksiyon güncelle | ✓ | ✗ | kendi | ✗ |
| Carry over | ✓ | ✗ | ✓ | ✗ |

## Faz Geçiş Kuralları
- Retro maddesi sadece `BRAINSTORMING` fazında eklenebilir
- Aksiyon maddesi sadece `ACTION_ITEMS` fazında eklenebilir (uygulama seviyesinde kontrol edilir)
- `validStatuses = ["BRAINSTORMING", "ACTION_ITEMS", "CLOSED"]`

## Teknoloji
- Next.js 16 App Router: `route.ts` dosyaları
- Drizzle ORM: `src/lib/db.ts`
- Auth: `jose` paketi ile JWT, httpOnly cookie
- Middleware: `src/middleware.ts`

## Proje Klasörü
`/Users/tcuturkyilmaz/Desktop/retroAI/`
