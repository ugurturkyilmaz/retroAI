# Tester Planı — Test Senaryoları

## Test Ortamı
- `npm run dev` → localhost:3000
- Seed kullanıcıları: `scrum@retro.ai/scrum123`, `manager@retro.ai/manager123`, `lead@retro.ai/lead123`, `member@retro.ai/member123`

---

## Test Senaryoları

### T-01: Auth
| # | Senaryo | Beklenen | Sorumlu |
|---|---------|----------|---------|
| 1 | Hatalı şifre ile giriş | Hata mesajı gösterilir, yönlendirme olmaz | @backend-dev |
| 2 | Doğru bilgilerle giriş | /dashboard'a yönlendir | @backend-dev |
| 3 | Cookie olmadan /dashboard | /login'e yönlendir | @backend-dev |
| 4 | Çıkış yap | Cookie silinir, /login'e döner | @backend-dev |
| 5 | member@retro.ai / member123 ile giriş | TEAM_MEMBER olarak dashboard'a girer | @backend-dev |

### T-02: Faz 1 — BRAINSTORMING
| # | Senaryo | Beklenen | Sorumlu |
|---|---------|----------|---------|
| 6 | Retro açıldığında timer | 5:00'dan geri sayar, progress bar yeşil | @frontend-dev |
| 7 | Kendi eklediğin madde | Net görünür, blur yok | @frontend-dev |
| 8 | Başka kullanıcının maddesi | blur-sm ile gizlenir | @frontend-dev |
| 9 | Blurlu maddede butonlar | Vote ve delete butonu görünmez | @frontend-dev |
| 10 | Timer sıfırlandığında | Otomatik ACTION_ITEMS fazına geçer | @backend-dev |
| 11 | SM "Aksiyon Fazına Geç" | Faz 2'ye anında geçer | @backend-dev |
| 12 | TEAM_MEMBER madde ekle | Başarıyla eklenir (201) | @backend-dev |
| 13 | MANAGER madde eklemeye çalışır | 403 hatası | @backend-dev |

### T-03: Faz 2 — ACTION_ITEMS
| # | Senaryo | Beklenen | Sorumlu |
|---|---------|----------|---------|
| 14 | Tüm maddeler görünür | Blur yok | @frontend-dev |
| 15 | Madde ekleme formu | Yoktur (canAdd=false) | @frontend-dev |
| 16 | Oylar görünür ve çalışır | +1 oy butonu aktif | @frontend-dev |
| 17 | SCRUM_MASTER aksiyon ekle | Başarılı (201) | @backend-dev |
| 18 | TEAM_MEMBER aksiyon eklemeye çalışır | 403 hatası | @backend-dev |
| 19 | SM "Retroyu Kapat" | CLOSED durumuna geçer | @backend-dev |

### T-04: CLOSED
| # | Senaryo | Beklenen | Sorumlu |
|---|---------|----------|---------|
| 20 | CLOSED retro board | Her şey read-only, form/buton yok | @frontend-dev |
| 21 | Retro listesinde CLOSED | "Kapalı" gri etiketi görünür | @frontend-dev |

### T-05: Retro Listesi Status Label'ları
| # | Senaryo | Beklenen | Sorumlu |
|---|---------|----------|---------|
| 22 | BRAINSTORMING retro | "Beyin Fırtınası" yeşil etiketi | @frontend-dev |
| 23 | ACTION_ITEMS retro | "Aksiyon Fazı" yeşil etiketi | @frontend-dev |
| 24 | CLOSED retro | "Kapalı" gri etiketi | @frontend-dev |

### T-06: Aksiyon Maddeleri
| # | Senaryo | Beklenen | Sorumlu |
|---|---------|----------|---------|
| 25 | Aksiyon maddesi oluştur (SM) | Listede görünür | @backend-dev |
| 26 | Durum OPEN→IN_PROGRESS | Badge rengi değişir | @frontend-dev |
| 27 | Durum IN_PROGRESS→DONE | Dashboard'dan kaybolur | @backend-dev |
| 28 | TEAM_MEMBER aksiyon güncellemeye çalışır | 403 hatası | @backend-dev |
| 29 | TEAM_MEMBER carry over yapmaya çalışır | 403 hatası | @backend-dev |

### T-07: Hatırlatma (KRİTİK)
| # | Senaryo | Beklened | Sorumlu |
|---|---------|----------|---------|
| 30 | Önceki retroda OPEN aksiyon var, yeni retro aç | Board'da banner görünür | @frontend-dev |
| 31 | Banner'dan "Taşı" tıkla | Yeni aksiyon oluşur, carriedFromId set | @backend-dev |
| 32 | Taşınan aksiyonun zinciri | Eski retro'da kalmaz, yenisinde görünür | @backend-dev |
| 33 | Banner'dan "Kapat" tıkla | Aksiyon DONE olur, banner'dan kalkar | @backend-dev |

---

## Bug Raporlama
Bug bulunca `plans/bugs/BUG-XXX.md` oluştur.
Mevcut buglar: (henüz yok)

## Test Durumu
- [ ] T-01 Auth testleri
- [ ] T-02 Faz 1 BRAINSTORMING testleri
- [ ] T-03 Faz 2 ACTION_ITEMS testleri
- [ ] T-04 CLOSED testleri
- [ ] T-05 Retro listesi etiket testleri
- [ ] T-06 Aksiyon testleri
- [ ] T-07 Hatırlatma testleri (KRİTİK)
