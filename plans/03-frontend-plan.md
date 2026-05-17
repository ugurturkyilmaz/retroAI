# Frontend Dev Planı — Sayfalar ve Bileşenler

## Teknoloji
- Next.js 16 App Router
- Tailwind CSS v4 (`@import "tailwindcss"`)
- Client/Server Component ayrımı

---

## Sayfa + Dosya Haritası

```
src/app/
├── (auth)/
│   └── login/page.tsx          # Giriş formu
├── dashboard/page.tsx           # Açık aksiyonlar + son retro
├── retros/
│   ├── page.tsx                 # Retro listesi
│   └── [id]/page.tsx            # Retro board
├── action-items/page.tsx        # Tüm aksiyonlar
├── layout.tsx                   # Root layout (Navbar dahil)
└── page.tsx                     # / → /dashboard redirect

src/components/
├── Navbar.tsx                   # Üst menü
├── RetroColumn.tsx              # Tek kolon (Start/Stop/Continue)
├── RetroCard.tsx                # Tek retro maddesi
├── ActionItemCard.tsx           # Aksiyon maddesi kartı
├── OpenActionsReminder.tsx      # ← KRİTİK: Önceki açık aksiyonlar banner
├── RoleBadge.tsx                # Kullanıcı rolü rozeti
└── NewRetroItemForm.tsx         # Kolona madde ekleme formu
```

---

## Kolon Renkleri
| Kolon | Başlık | Tailwind |
|-------|--------|----------|
| START | Başla | `bg-green-50 border-green-300` |
| STOP | Dur | `bg-red-50 border-red-300` |
| CONTINUE | Devam Et | `bg-blue-50 border-blue-300` |

---

## OpenActionsReminder (KRİTİK Bileşen)
- Retro board sayfasında (`/retros/[id]`) üstte göster
- API: `GET /api/retros/:id` → `openCarryOvers` alanından beslen
- Her satırda: aksiyon başlığı, atanan kişi, durum badge, "Taşı" ve "Kapat" butonları
- MANAGER kullanıcılara butonlar gösterilmez

---

## Faz Görünümleri (Retro Board `/retros/[id]`)

### BRAINSTORMING (Faz 1)
- 5 dakika countdown timer (yeşil→sarı→kırmızı progress bar)
- Kendi maddeleri net, başkalarının maddeleri `blur-sm select-none`
- Blurlu maddelerde vote ve delete butonları gizlenir
- SCRUM_MASTER için "Aksiyon Fazına Geç →" butonu
- Timer bitince otomatik ACTION_ITEMS fazına geçer

### ACTION_ITEMS (Faz 2)
- Tüm maddeler blur olmadan görünür
- Add form yok (canAdd=false RetroColumn'a geçilir)
- Aksiyon maddeleri paneli (sadece SM ve TEAM_LEAD ekleyebilir)
- `OpenActionsReminder` banner üstte görünür
- SM için "Retroyu Kapat" butonu

### CLOSED
- Her şey read-only, form/buton yok

## Yetki Kuralları (UI)
- `role === "MANAGER"` → madde ekleme formu, butonlar gizlenir
- `role === "TEAM_MEMBER"` → aksiyon ekleme formu gizlenir
- `role === "SCRUM_MASTER"` → retro kapat / faz değiştir butonları görünür
- `role === "TEAM_LEAD"` → sadece kendi aksiyonlarını güncelleyebilir

---

## Renk Kodları (Aksiyonlar)
| Durum | Badge Rengi |
|-------|-------------|
| OPEN | `bg-yellow-100 text-yellow-800` |
| IN_PROGRESS | `bg-blue-100 text-blue-800` |
| DONE | `bg-green-100 text-green-800` |
