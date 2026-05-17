# Frontend Dev Planı — Sayfalar ve Bileşenler

## Teknoloji
- Next.js 14 App Router
- Tailwind CSS
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

## Yetki Kuralları (UI)
- `role === "MANAGER"` → madde ekleme formu, butonlar gizlenir
- `role === "SCRUM_MASTER"` → retro kapat butonu görünür
- `role === "TEAM_LEAD"` → sadece kendi aksiyonlarını güncelleyebilir

---

## Renk Kodları (Aksiyonlar)
| Durum | Badge Rengi |
|-------|-------------|
| OPEN | `bg-yellow-100 text-yellow-800` |
| IN_PROGRESS | `bg-blue-100 text-blue-800` |
| DONE | `bg-green-100 text-green-800` |
