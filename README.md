# Site Structure Analyzer

Web sitelerinin tasarım ve yapısını analiz eden bir araç. Herhangi bir URL girin ve sitenin detaylı yapısal analizini JSON formatında alın.

## Özellikler

- **Meta Bilgileri**: Başlık, açıklama, anahtar kelimeler, Open Graph ve Twitter Card etiketleri
- **Yapı Analizi**: Başlık hiyerarşisi, linkler, görseller, formlar, semantik HTML elementleri
- **Tasarım Tespiti**: Renk paleti, yazı tipleri, CSS framework tespiti, responsive tasarım kontrolü
- **SEO Analizi**: SEO skoru, başlık/açıklama optimizasyonu, structured data kontrolü
- **Performans İpuçları**: HTML boyutu, lazy loading, script optimizasyonu önerileri
- **Erişilebilirlik**: Alt metin kontrolü, ARIA etiketleri, landmark bölgeleri

## Kullanım

1. `index.html` dosyasını bir tarayıcıda açın
2. Analiz etmek istediğiniz web sitesinin URL'sini girin
3. "Analiz Et" butonuna tıklayın
4. Sonuçları farklı sekmelerden inceleyin
5. JSON çıktısını kopyalayın veya indirin

## JSON Çıktı Yapısı

```json
{
  "url": "https://example.com",
  "analyzedAt": "2025-01-16T12:00:00.000Z",
  "meta": {
    "title": "Sayfa Başlığı",
    "description": "Sayfa açıklaması",
    "language": "tr",
    "ogTags": { ... },
    "twitterTags": { ... }
  },
  "structure": {
    "headings": { "h1": [...], "h2": [...] },
    "links": { "internal": [...], "external": [...] },
    "images": { "total": 10, "withAlt": 8 },
    "forms": [...],
    "semanticElements": { ... }
  },
  "design": {
    "colors": ["#ffffff", "#000000", ...],
    "fonts": ["Roboto", "Open Sans"],
    "layout": ["Bootstrap"],
    "responsive": { ... }
  },
  "seo": {
    "score": 75,
    "title": { ... },
    "description": { ... },
    "openGraph": true,
    "structuredData": [...]
  },
  "performance": { ... },
  "security": { ... },
  "accessibility": { ... }
}
```

## Teknik Detaylar

- Pure JavaScript (framework yok)
- CORS proxy kullanarak cross-origin istekler
- Client-side HTML parsing (DOMParser)
- Modern CSS (CSS Variables, Flexbox, Grid)
- Responsive tasarım

## Sınırlamalar

- CORS kısıtlamaları nedeniyle bazı siteler analiz edilemeyebilir
- JavaScript ile dinamik olarak yüklenen içerikler analiz edilemez
- Inline CSS'den renk ve font çıkarımı yapılır, harici CSS dosyaları tam olarak parse edilemez

## Dosya Yapısı

```
├── index.html      # Ana HTML dosyası
├── style.css       # Stiller
├── analyzer.js     # Analiz mantığı
└── README.md       # Dokümantasyon
```

## Lisans

MIT
