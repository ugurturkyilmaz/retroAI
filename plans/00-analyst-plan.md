# Analist Planı — RetroAI Feature Listesi

## Proje Brief
Ekip retrospektif yönetim uygulaması. En kritik özellik: bir retroda oluşturulan aksiyon maddelerinin bir sonraki retroda hatırlatılması.

---

## Kullanıcı Rolleri

| Rol | Kısaltma | Yetki |
|-----|----------|-------|
| Scrum Master | SCRUM_MASTER | Tam yetki — retro aç/kapat, madde ekle/sil, aksiyon ata |
| Yönetici | MANAGER | Sadece okuma + rapor |
| Ekip Sorumlusu | TEAM_LEAD | Madde ekle, kendi aksiyonlarını güncelle |

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
- [ ] Son retro oturumunun adı ve tarihi
- [ ] "Yeni Retro Başlat" butonu (sadece SCRUM_MASTER)
- [ ] Açık aksiyonların listesi (atanan kişi, bitiş tarihi, durum)
**İlgili Agent:** Backend Dev, Frontend Dev

### F-03: Retro Oturumu Yönetimi
**User Story:** Bir Scrum Master olarak yeni retro oturumu açmak ve mevcut oturumları görmek istiyorum.
**Kabul Kriterleri:**
- [ ] Retro listesi sayfası (tarih, başlık, durum)
- [ ] Yeni retro formu: başlık + tarih
- [ ] Retroyu kapatma (CLOSED durumu — sadece SCRUM_MASTER)
- [ ] Kapalı retrolar düzenlenemez
**İlgili Agent:** Backend Dev, Frontend Dev

### F-04: Retro Board (3 Kolon)
**User Story:** Bir kullanıcı olarak Start / Stop / Continue kolonlarına madde ekleyip oylayabilmek istiyorum.
**Kabul Kriterleri:**
- [ ] 3 kolon: Start (yeşil), Stop (kırmızı), Continue (mavi)
- [ ] Madde ekleme formu her kolonda
- [ ] Maddeyi sil (yazar veya SCRUM_MASTER)
- [ ] Oy verme (+1) butonu
- [ ] MANAGER kullanıcılar form göremez, sadece listeler
**İlgili Agent:** Backend Dev, Frontend Dev

### F-05: Aksiyon Maddesi Yönetimi (KRİTİK)
**User Story:** Bir Scrum Master olarak retrodan çıkan aksiyonları atayıp takip etmek istiyorum.
**Kabul Kriterleri:**
- [ ] Aksiyon maddesi oluştur: başlık, açıklama, atanan kişi, bitiş tarihi
- [ ] Durum değiştirme: OPEN → IN_PROGRESS → DONE
- [ ] Tüm aksiyonlar listesi, durum/atanan kişiye göre filtreli
**İlgili Agent:** Backend Dev, Frontend Dev

### F-06: Aksiyon Maddesi Hatırlatma (EN KRİTİK)
**User Story:** Bir Scrum Master olarak yeni retro açtığımda önceki retroların tamamlanmamış aksiyonlarını görmek istiyorum.
**Kabul Kriterleri:**
- [ ] Retro board'u açıldığında OPEN/IN_PROGRESS aksiyonlar banner'da listelenir
- [ ] Banner'dan aksiyon "Bu Retroya Taşı" veya "Kapat (DONE)" yapılabilir
- [ ] "Taşı" işlemi: yeni ActionItem kaydı oluşur, carriedFromId önceki kaydı gösterir
- [ ] Dashboard'da "X adet açık aksiyon hatırlatılacak" uyarısı
**İlgili Agent:** Backend Dev, Frontend Dev, DB Agent

---

## API Endpoint Özeti → plans/02-backend-plan.md'ye bak

## DB Şema Özeti → plans/01-db-plan.md'ye bak

## Ekran Listesi → plans/03-frontend-plan.md'ye bak
