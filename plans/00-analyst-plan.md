# Analist Planı — RetroAI Feature Listesi

## Proje Brief
Ekip retrospektif yönetim uygulaması. En kritik özellik: bir retroda oluşturulan aksiyon maddelerinin bir sonraki retroda hatırlatılması.

---

## Kullanıcı Rolleri (v2)

| Rol | Kısaltma | Yetki |
|-----|----------|-------|
| Scrum Master | SCRUM_MASTER | Tam yetki — faz değiştir, retro aç/kapat, madde ekle/sil, aksiyon ata |
| Yönetici | MANAGER | Sadece okuma |
| Ekip Sorumlusu | TEAM_LEAD | Madde ekle, kendi aksiyonlarını güncelle, carry over |
| Ekip Üyesi | TEAM_MEMBER | Faz 1'de madde ekle, Faz 2'de okuma |

---

## Feature Listesi

### F-01: Kimlik Doğrulama (Auth)
**User Story:** Bir kullanıcı olarak kullanıcı adı + şifremle giriş yapmak istiyorum, çünkü yetkisiz erişimi önlemek istiyorum.
**Kabul Kriterleri:**
- [ ] Login formu: email + şifre alanları
- [ ] Hatalı girişte hata mesajı
- [ ] Başarılı girişte dashboard'a yönlendirme
- [ ] JWT cookie ile oturum yönetimi
- [ ] Çıkış yapıldığında cookie temizlenir
**İlgili Agent:** Backend Dev, Frontend Dev

### F-02: Dashboard (Ana Sayfa)
**User Story:** Bir kullanıcı olarak giriş yapınca açık aksiyon maddelerimi ve son retro bilgisini görmek istiyorum.
**Kabul Kriterleri:**
- [ ] Açık (OPEN/IN_PROGRESS) aksiyon maddelerinin sayısını gösteren özet kart
- [ ] Son retro oturumunun adı ve tarihi (BRAINSTORMING/ACTION_ITEMS/CLOSED etiketi)
- [ ] "Yeni Retro Başlat" butonu (sadece SCRUM_MASTER)
- [ ] Açık aksiyonların listesi (atanan kişi, bitiş tarihi, durum)
**İlgili Agent:** Backend Dev, Frontend Dev

### F-03: Retro Oturumu Yönetimi
**User Story:** Bir Scrum Master olarak yeni retro oturumu açmak ve mevcut oturumları görmek istiyorum.
**Kabul Kriterleri:**
- [ ] Retro listesi sayfası (tarih, başlık, durum: Beyin Fırtınası / Aksiyon Fazı / Kapalı)
- [ ] Yeni retro formu: başlık
- [ ] Retro BRAINSTORMING fazında başlar
**İlgili Agent:** Backend Dev, Frontend Dev

### F-04: Retro Board — 2 Fazlı (KRİTİK)
**User Story:** Bir kullanıcı olarak önce bağımsız beyin fırtınası yapıp, sonra birlikte aksiyon almak istiyorum.

#### Faz 1 — BRAINSTORMING
**Kabul Kriterleri:**
- [ ] 5 dakika countdown timer (yeşil→sarı→kırmızı progress bar)
- [ ] Kendi maddeleri net görünür; başkalarının maddeleri CSS blur ile gizlenir
- [ ] Blurlu maddelerde vote ve delete butonları gizlenir
- [ ] TEAM_MEMBER madde ekleyebilir; MANAGER ekleyemez
- [ ] Timer bitince otomatik ACTION_ITEMS fazına geçer
- [ ] SCRUM_MASTER "Aksiyon Fazına Geç →" butonu ile erken geçebilir
**İlgili Agent:** Backend Dev, Frontend Dev

#### Faz 2 — ACTION_ITEMS
**Kabul Kriterleri:**
- [ ] Tüm maddeler blur olmadan görünür
- [ ] Madde ekleme formu yoktur
- [ ] Oylar görünür ve kullanılabilir
- [ ] Aksiyon maddeleri paneli (SCRUM_MASTER / TEAM_LEAD ekleyebilir)
- [ ] SCRUM_MASTER "Retroyu Kapat" ile CLOSED yapar
**İlgili Agent:** Backend Dev, Frontend Dev

### F-05: Aksiyon Maddesi Yönetimi
**User Story:** Bir Scrum Master olarak retrodan çıkan aksiyonları atayıp takip etmek istiyorum.
**Kabul Kriterleri:**
- [ ] Aksiyon maddesi oluştur: başlık, açıklama, atanan kişi, bitiş tarihi (SCRUM_MASTER / TEAM_LEAD)
- [ ] Durum değiştirme: OPEN → IN_PROGRESS → DONE
- [ ] TEAM_MEMBER aksiyon oluşturamaz / güncelleyemez / carry over yapamaz
**İlgili Agent:** Backend Dev, Frontend Dev

### F-06: Aksiyon Maddesi Hatırlatma (EN KRİTİK)
**User Story:** Bir Scrum Master olarak yeni retro açtığımda önceki retroların tamamlanmamış aksiyonlarını görmek istiyorum.
**Kabul Kriterleri:**
- [ ] Retro board'u açıldığında CLOSED retrolardan OPEN/IN_PROGRESS aksiyonlar banner'da listelenir
- [ ] Banner'dan aksiyon "Bu Retroya Taşı" veya "Kapat (DONE)" yapılabilir
- [ ] "Taşı" işlemi: yeni ActionItem kaydı oluşur, carriedFromId önceki kaydı gösterir
**İlgili Agent:** Backend Dev, Frontend Dev, DB Agent

---

## API Endpoint Özeti → plans/02-backend-plan.md'ye bak

## DB Şema Özeti → plans/01-db-plan.md'ye bak

## Ekran Listesi → plans/03-frontend-plan.md'ye bak
