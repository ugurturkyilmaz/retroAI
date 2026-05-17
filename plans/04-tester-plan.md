# Tester Planı — Test Senaryoları

## Test Ortamı
- `npm run dev` → localhost:3000
- Seed kullanıcıları: `scrum@retro.ai/scrum123`, `manager@retro.ai/manager123`, `lead@retro.ai/lead123`

---

## Test Senaryoları

### T-01: Auth
| # | Senaryo | Beklenen | Sorumlu |
|---|---------|----------|---------|
| 1 | Hatalı şifre ile giriş | Hata mesajı gösterilir, yönlendirme olmaz | @backend-dev |
| 2 | Doğru bilgilerle giriş | /dashboard'a yönlendir | @backend-dev |
| 3 | Cookie olmadan /dashboard | /login'e yönlendir | @backend-dev |
| 4 | Çıkış yap | Cookie silinir, /login'e döner | @backend-dev |

### T-02: Retro Board
| # | Senaryo | Beklenen | Sorumlu |
|---|---------|----------|---------|
| 5 | SCRUM_MASTER olarak retro oluştur | Listede görünür | @backend-dev |
| 6 | Start kolonuna madde ekle | Kolonda görünür | @frontend-dev |
| 7 | MANAGER ile giriş, madde eklemeye çalış | Form görünmez | @frontend-dev |
| 8 | Retroyu kapat (SCRUM_MASTER) | Durum CLOSED, düzenleme kapanır | @backend-dev |

### T-03: Aksiyon Maddeleri
| # | Senaryo | Beklenen | Sorumlu |
|---|---------|----------|---------|
| 9 | Aksiyon maddesi oluştur | Listede görünür | @backend-dev |
| 10 | Durum OPEN→IN_PROGRESS güncelle | Badge rengi değişir | @frontend-dev |
| 11 | Durum IN_PROGRESS→DONE güncelle | Dashboard'dan kaybolur | @backend-dev |

### T-04: Hatırlatma (KRİTİK)
| # | Senaryo | Beklenen | Sorumlu |
|---|---------|----------|---------|
| 12 | Önceki retroda OPEN aksiyon var, yeni retro aç | Board'da banner görünür | @frontend-dev |
| 13 | Banner'dan "Taşı" tıkla | Yeni aksiyon oluşur, carriedFromId set | @backend-dev |
| 14 | Taşınan aksiyonun zinciri | Eski retro'da kalmaz, yenisinde görünür | @backend-dev |
| 15 | Banner'dan "Kapat" tıkla | Aksiyon DONE olur, banner'dan kalkar | @backend-dev |

---

## Bug Raporlama
Bug bulunca `plans/bugs/BUG-XXX.md` oluştur.
Mevcut buglar: (henüz yok)

## Test Durumu
- [ ] T-01 Auth testleri
- [ ] T-02 Retro Board testleri  
- [ ] T-03 Aksiyon testleri
- [ ] T-04 Hatırlatma testleri (KRİTİK)
