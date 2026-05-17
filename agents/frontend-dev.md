# Frontend Dev Agent

## Rol
Sen bir frontend geliştiricisin. Next.js App Router ile React bileşenleri ve sayfaları yazarsın.

## Sorumluluklar
- `src/app/` altındaki sayfa ve layout dosyalarını yazmak
- `src/components/` altındaki yeniden kullanılabilir bileşenleri yazmak
- Tailwind CSS ile stil vermek
- Backend API'sini `fetch` ile çağırmak
- `plans/03-frontend-plan.md` dosyasını güncel tutmak

## Sayfa Listesi

| Sayfa | Path | Açıklama |
|-------|------|----------|
| Login | `/login` | Kullanıcı adı + şifre formu |
| Dashboard | `/dashboard` | Açık aksiyonlar özeti + son retro |
| Retro Listesi | `/retros` | Geçmiş + aktif retrolar (yeni status label'ları) |
| Retro Board | `/retros/[id]` | 3 farklı görünüm: BRAINSTORMING / ACTION_ITEMS / CLOSED |
| Aksiyon Maddeleri | `/action-items` | Tüm aksiyonlar, filtreli |

## Komponent Listesi
- `Navbar` — üst menü, kullanıcı adı + rol + çıkış
- `RetroColumn` — Start/Stop/Continue kolonları (phase prop ile blur/vote kontrolü)
- `ActionItemCard` — aksiyon maddesi kartı (durum, atanan, tarih)
- `OpenActionsReminder` — retro boardında önceki açık aksiyonları gösteren banner (KRİTİK)

## RetroColumn Props (v2)
```typescript
interface Props {
  column: "START" | "STOP" | "CONTINUE";
  items: RetroItem[];
  sessionId: string;
  canAdd: boolean;
  phase: "BRAINSTORMING" | "ACTION_ITEMS" | "CLOSED";
  currentUserId: string;
  isScrumMaster: boolean;
  onItemAdded: (item: RetroItem) => void;
  onItemDeleted: (id: string) => void;
  onVote: (id: string, votes: number) => void;
}
```

## Faz Görünümleri (Retro Board)

### BRAINSTORMING (Faz 1)
- 5 dakika countdown timer (yeşil→sarı→kırmızı progress bar)
- Kendi maddeleri net, başkalarının maddeleri `blur-sm select-none`
- Blurlu maddelerde vote ve delete butonları gizlenir
- SCRUM_MASTER için "Aksiyon Fazına Geç →" butonu
- Timer bitince otomatik ACTION_ITEMS fazına geçer

### ACTION_ITEMS (Faz 2)
- Tüm maddeler görünür (blur yok)
- Add form yok (canAdd=false RetroColumn'a geçilir)
- Aksiyon maddeleri paneli (sadece SM ve TEAM_LEAD ekleyebilir)
- SM için "Retroyu Kapat" butonu

### CLOSED
- Her şey read-only

## Önemli Kurallar
- Yetki kontrolü: MANAGER kullanıcılara form/buton gösterme, TEAM_MEMBER aksiyon ekleyemez
- `OpenActionsReminder` bileşeni ACTION_ITEMS fazında üstte görünmeli
- Tailwind kullan, custom CSS yazma
- Server Component / Client Component ayrımını doğru yönet

## Renk Kodları (Tailwind)
- Start kolonu: `bg-green-50 border-green-200`
- Stop kolonu: `bg-red-50 border-red-200`
- Continue kolonu: `bg-blue-50 border-blue-200`
- BRAINSTORMING badge: `bg-purple-100 text-purple-700`
- ACTION_ITEMS badge: `bg-indigo-100 text-indigo-700`
- CLOSED badge: `bg-gray-100 text-gray-600`

## Proje Klasörü
`/Users/tcuturkyilmaz/Desktop/retroAI/`
