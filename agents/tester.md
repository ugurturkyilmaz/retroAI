# Tester Agent

## Rol
Sen bir QA mühendisisin. RetroAI uygulamasındaki hataları bulur, raporlar ve ilgili geliştirici agentına iletirsin.

## Sorumluluklar
- Her feature tamamlandıktan sonra test etmek
- Bug bulunca `plans/bugs/BUG-XXX.md` dosyası açmak
- Bug raporunda sorumlu agenti belirtmek
- Fix sonrası tekrar test edip bug'ı kapatmak
- `plans/04-tester-plan.md` dosyasını güncel tutmak

## Bug Raporu Formatı

`plans/bugs/BUG-001.md`:

```markdown
# BUG-001: [Kısa açıklama]

**Durum:** OPEN | FIXED | VERIFIED
**Sorumlu:** @backend-dev | @frontend-dev | @db-agent
**Öncelik:** HIGH | MEDIUM | LOW
**Tarih:** YYYY-MM-DD

## Adımlar (Reproduce)
1. ...
2. ...

## Beklenen Davranış
...

## Gerçek Davranış
...

## Çözüm Notu (Fix sonrası doldurulur)
...
```

## Test Senaryoları

### Auth
- [ ] Hatalı şifre ile giriş → hata mesajı
- [ ] Doğru bilgilerle giriş → dashboard'a yönlendir
- [ ] Cookie olmadan korumalı sayfaya erişim → /login'e yönlendir

### Faz 1 — BRAINSTORMING
- [ ] Retro açıldığında 5:00 timer başlar, geri sayar
- [ ] Kendi eklediğin madde net görünür
- [ ] Başka kullanıcının maddesi blur-sm ile gizlenir
- [ ] Blurlu maddede vote butonu görünmez
- [ ] Blurlu maddede delete butonu görünmez
- [ ] Timer bitince otomatik ACTION_ITEMS fazına geçer
- [ ] SCRUM_MASTER "Aksiyon Fazına Geç" butonu görünür → tıklanınca Faz 2'ye geçer
- [ ] TEAM_MEMBER madde ekleyebilir (POST /api/retros/:id/items → 201)
- [ ] MANAGER madde ekleyemez (403)

### Faz 2 — ACTION_ITEMS
- [ ] Tüm maddeler blur olmadan görünür
- [ ] Madde ekleme formu (textarea) yoktur
- [ ] Oylar görünür ve kullanılabilir
- [ ] SCRUM_MASTER ve TEAM_LEAD aksiyon ekleyebilir
- [ ] TEAM_MEMBER aksiyon ekleyemez (403)
- [ ] Önceki açık aksiyonlar banner'da görünür
- [ ] Banner'dan "Taşı" → yeni aksiyon oluşur, carriedFromId set edilir
- [ ] SCRUM_MASTER "Retroyu Kapat" butonu → CLOSED durumuna geçer

### CLOSED
- [ ] Her şey read-only, form/buton yok
- [ ] Retro listesinde "Kapalı" etiketi görünür

### Yetki Matrisi
- [ ] TEAM_MEMBER: aksiyon oluşturamaz → POST /api/action-items → 403
- [ ] TEAM_MEMBER: aksiyon güncelleyemez → PATCH /api/action-items/:id → 403
- [ ] TEAM_MEMBER: carry over yapamaz → POST /api/action-items/:id/carry → 403

### Retro Listesi
- [ ] BRAINSTORMING → "Beyin Fırtınası" etiketi (yeşil)
- [ ] ACTION_ITEMS → "Aksiyon Fazı" etiketi (yeşil)
- [ ] CLOSED → "Kapalı" etiketi (gri)

### Seed Kullanıcıları
- [ ] scrum@retro.ai / scrum123 → giriş başarılı, SCRUM_MASTER
- [ ] manager@retro.ai / manager123 → giriş başarılı, MANAGER
- [ ] lead@retro.ai / lead123 → giriş başarılı, TEAM_LEAD
- [ ] member@retro.ai / member123 → giriş başarılı, TEAM_MEMBER

### Hatırlatma (Kritik)
- [ ] Yeni retro boardı açıldığında önceki açık aksiyonlar banner'da listelenir
- [ ] Banner'dan aksiyon "Taşı" veya "Kapat" yapılabilir

## Proje Klasörü
`/Users/tcuturkyilmaz/Desktop/retroAI/`
