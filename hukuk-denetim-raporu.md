# Hukuki Uyumluluk ve KVKK Denetim Raporu

**Proje:** Who is That Pykemon  
**Tarih:** 15 Kasım 2026  
**Denetim Standardı:** `tr-app-hukuk` (6698 sayılı KVKK, 6502 sayılı TKHK, 6563 sayılı ETK, 5846 sayılı FSEK, 5651 sayılı Kanun)

---

## 1. Proje ve Mimari Özeti

Who is That Pykemon; React 18, TypeScript, Tailwind CSS ve Vite ile geliştirilmiş bir PWA frontend ile FastAPI, MoviePy ve rembg (u2net) kullanan bir Python backend servisinden oluşan tam teşekküllü bir video sentezleme uygulamasıdır. Kullanıcılar fotoğraf yüklemekte, isteğe bağlı isim girmekte; backend u2net yapay zeka modeliyle arka planı temizleyip silüet çıkarmakta ve 1920x1080 24fps MP4 video üretmektedir.

---

## 2. Mevzuat Uyumluluk Denetim Tablosu

| Başlık | Durum | Bulgu (dosya:satır) | Risk | Önerilen Düzeltme |
| :--- | :--- | :--- | :--- | :--- |
| **1. Ödeme & Abonelik (6502 Sayılı Kanun)** | **Yok** | [frontend/package.json:1-26](frontend/package.json#L1-L26), [backend/requirements.txt:1-15](backend/requirements.txt#L1-L15) | Düşük | Projede ödeme, faturalandırma veya abonelik sistemi bulunmamaktadır. Gelecekte ücretli plan açılırsa ön bilgilendirme ve onay adımları entegre edilmelidir. |
| **2. Ticari İleti (6563 Sayılı ETK)** | **Yok** | [backend/app/main.py:124-146](backend/app/main.py#L124-L146), [frontend/src/App.tsx:85-100](frontend/src/App.tsx#L85-L100) | Düşük | Kullanıcıdan e-posta toplanmamakta; bülten veya tanıtım iletisi gönderilmemektedir. İleti gönderimi planlanırsa İYS ve açık rıza mekanizması kurulmalıdır. |
| **3. Telif (5846 Sayılı FSEK)** | **Kısmen** | [frontend/src/App.tsx:85-90](frontend/src/App.tsx#L85-L90), [backend/assets/whos_that_pokemon.mp3](backend/assets/whos_that_pokemon.mp3), [backend/assets/fonts/pokemon_solid.ttf](backend/assets/fonts/pokemon_solid.ttf) | **Yüksek** | Kullanıcı yüklemeleri ve Pokémon marka/ses unsurları için arayüzde feragatname (Disclaimer) ve hak sahiplerinin bildirim yapabileceği "Uyar-Kaldır" kanalı bulunmamaktadır. Altbilgiye telif feragatnamesi ve bildirim e-postası eklenmelidir. |
| **4. Yer Sağlayıcı (5651 Sayılı Kanun)** | **Kısmen** | [frontend/src/App.tsx:695-698](frontend/src/App.tsx#L695-L698), [backend/app/main.py:32-33](backend/app/main.py#L32-L33) | **Orta** | Kullanıcı fotoğrafları işlenip sunucuda geçici barındırıldığı halde arayüzde yer sağlayıcı iletişim bilgisi ve şikayet mekanizması yoktur. Ayrıca zaman damgalı erişim loglarının 1 yıl bütünlüğü korunarak saklanması kurgulanmamıştır. Loglama ve iletişim bilgisi eklenmelidir. |
| **5. Aydınlatma (6698 Sayılı KVKK m.10)** | **Yok** | [frontend/src/App.tsx:85-100](frontend/src/App.tsx#L85-L100), [backend/app/main.py:125-146](backend/app/main.py#L125-L146), [backend/app/config.py:22-25](backend/app/config.py#L22-L25) | **Yüksek** | Yüklenen portre fotoğrafları (fiziksel görünüm kişisel verisi) ve isim verisi işlenirken kullanıcıya hiçbir aydınlatma metni sunulmamaktadır. 15 dakikalık geçici saklama ve imha süreci aydınlatma metniyle şeffaflaştırılmalıdır. |
| **6. Yurt Dışı Veri & Güvenlik (KVKK m.9 & m.12)** | **Kısmen** | [frontend/index.html:10-12](frontend/index.html#L10-L12), [backend/app/main.py:44-45](backend/app/main.py#L44-L45) | **Yüksek** | Google Fonts CDN üzerinden kullanıcı IP adresleri izinsiz yurt dışına aktarılmaktadır. Backend CORS ayarlarında `allow_origins=["*"]` ile `allow_credentials=True` birlikte kullanılmıştır. Fontlar yerelleştirilmeli (self-hosted) ve CORS sınırlandırılmalıdır. |

---

## 3. Risk Sırasına Göre En Kritik 5 Bulgu ve 2026 Ceza Üst Sınırları

### 1. Yurt Dışı Veri Aktarımı ve Veri Güvenliği (KVKK m.9, m.12 & m.18/1-b)
- **Tespit:** `frontend/index.html:10-12` satırlarında çağrılan Google Fonts CDN (`fonts.googleapis.com`), siteyi ziyaret eden kullanıcıların IP adreslerinin ve cihaz başlıklarının ABD sunucularına aktarılmasına sebep olmaktadır. Ayrıca `backend/app/main.py:44-45` CORS yapılandırmasında joker karakter (`*`) ile kimlik bilgisi izni (`allow_credentials=True`) birlikte verilmiştir.
- **Yasal Risk:** 6698 sayılı Kanun m.12 ve m.18/1-b uyarınca veri güvenliği yükümlülüklerine aykırılık ve hukuka aykırı yurt dışı aktarımı.
- **2026 Yılı Ceza Üst Sınırı:** **17.092.242 TL**

### 2. Aydınlatma Yükümlülüğünün Yerine Getirilmemesi (KVKK m.10 & m.18/1-a)
- **Tespit:** Kullanıcı fotoğraf seçtiğinde ve isim girdiğinde (`frontend/src/App.tsx:85-90`), verilerin video oluşturma amacıyla işlendiği, üçüncü şahıslarla paylaşılmadığı ve `TEMP_DIR` üzerinde en fazla 15 dakika saklandıktan sonra otomatik olarak silindiği bilgisini içeren bir Aydınlatma Metni sunulmamaktadır.
- **Yasal Risk:** 6698 sayılı Kanun m.10 ve m.18/1-a uyarınca aydınlatma yükümlülüğünün ihlali.
- **2026 Yılı Ceza Üst Sınırı:** **1.709.200 TL**

### 3. Yer Sağlayıcı İletişim Bilgileri ve Trafik Bilgisi Saklama (5651 Sayılı Kanun m.5 & m.6)
- **Tespit:** Kullanıcı tarafından üretilen içerikleri geçici olarak barındıran serviste yer sağlayıcı tanıtıcı iletişim bilgisi, içerik şikayet/ihbar kanalı ve zaman damgalı trafik loglarının en az 1 yıl bütünlüğü sağlanarak saklanması mekanizması eksiktir (`frontend/src/App.tsx:695`, `backend/app/main.py:32`).
- **Yasal Risk:** 5651 sayılı Kanun m.5 uyarınca yer sağlayıcılık yükümlülüklerinin yerine getirilmemesi.
- **2026 Yılı Ceza Üst Sınırı:** **1.000.000 TL**

### 4. Telif Hakkı ve Uyar-Kaldır Mekanizması (5846 Sayılı FSEK Ek m.4 & m.71)
- **Tespit:** Kullanıcıların telif hakkı başkasına ait fotoğrafları yükleyebilmesine karşın serviste hak sahiplerinin başvurabileceği "Uyar-Kaldır" (Notice & Takedown) iletişim kanalı ve telif hakkı feragatnamesi bulunmamaktadır (`frontend/src/App.tsx:85-90`).
- **Yasal Risk:** 5846 sayılı FSEK m.71 uyarınca telif hakkı ihlali bildirimine rağmen içeriği kaldırmama hali.
- **2026 Yasal Yaptırımı:** **365.000 TL adli para cezası ve 1 yıldan 5 yıla kadar hapis cezası**

### 5. Mesafeli Sözleşmeler ve Tüketici Hakları (6502 Sayılı Kanun m.48 & m.77)
- **Tespit:** Uygulama tamamen ücretsiz olup ödeme ve abonelik mekanizması içermediğinden şu an doğrudan bir tüketici cezası riski yoktur. Ancak gelecekte freemium/ücretli model eklenirse ön bilgilendirme, cayma hakkı ve açık satın alma onayı zorunlu olacaktır.
- **2026 Yılı Ceza Üst Sınırı:** İşlem başına **3.973 TL**; haksız ticari uygulama ve dark pattern hallerinde **10.837.065 TL**.

---

## 4. Eylem Planı ve Önerilen Düzeltmeler

1. **Google Fonts'un Yerelleştirilmesi (Self-Hosting):**
   - `frontend/index.html` içerisindeki Google CDN linkleri kaldırılmalı, fontlar doğrudan `@fontsource` paketleri veya `public/fonts/` üzerinden yerel olarak sunulmalıdır.
2. **KVKK Aydınlatma Metni Bileşeni:**
   - Fotoğraf yükleme alanının altına veya modal pencereye basit, anlaşılır bir Aydınlatma Metni bağlantısı eklenmelidir.
3. **CORS Yapılandırmasının Güçlendirilmesi:**
   - `backend/app/main.py` içerisindeki `allow_credentials` değeri `False` yapılmalı veya etki alanları spesifik olarak tanımlanmalıdır.
4. **Feragatname ve Uyar-Kaldır (Telif & Yer Sağlayıcı) İletişimi:**
   - Arayüz footer alanına telif feragatnamesi ve hak ihlali bildirim e-posta adresi (`atacanymc@gmail.com`) eklenmelidir.
