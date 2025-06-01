/**
 * Configuração do Site
 * Bu dosya, site ayarlarını ve metinlerini içerir.
 * Site sahibi tarafından kolayca değiştirilebilir.
 */
const CONFIG = {
  // Site Genel Ayarları
  site: {
    title: "AI İçerik Üreticisi",
    description: "Yapay zeka ile hızlı ve kaliteli içerik üretme platformu",
    language: "tr",
    themeDefault: "dark", // "dark" veya "light"
  },
  
  // Form Ayarları
  form: {
    // Tally.so form entegrasyonu
    tallyFormUrl: "https://tally.so/r/mO9b2g",
    formTitle: "İçerik Oluştur",
    
    // Sonuç paneli ayarları
    resultTitle: "Oluşturulan İçerik",
    loadingText: "İçerik oluşturuluyor...",
    noResultText: "Henüz içerik oluşturulmadı. Formu doldurup gönderin.",
    copyButtonText: "Kopyala",
    newContentButtonText: "Yeni İçerik",
  },
  
  // Ana Sayfa Metinleri
  home: {
    heroTitle: "Yapay Zeka ile İçerik Üretme",
    heroDescription: "Formu doldurarak saniyeler içinde AI destekli içerik oluşturun.",
    ctaButtonText: "Hemen Başla",
    
    // Nasıl Çalışır Bölümü
    aboutTitle: "Nasıl Çalışır?",
    steps: [
      {
        title: "Formu Doldur",
        description: "İhtiyacınıza uygun parametreleri belirleyin ve formu gönderin."
      },
      {
        title: "İşleniyor",
        description: "Yapay zeka algoritmalarımız verilerinizi işler ve analiz eder."
      },
      {
        title: "Sonuç",
        description: "Oluşturulan içerik anında görüntülenir ve kullanıma hazır olur."
      }
    ]
  },
  
  // Google Sheets API ayarları
  api: {
    // Google Sheets'e bağlanmak için gerekli bilgiler
    // ÖNEMLİ: Bu değerler Make.com üzerinden gelen verilerle eşleşmelidir
    sheetId: "1xYz-ABC123_DEF456", // Örnek değer, gerçek Sheet ID ile değiştirilmeli
    apiKey: "AIzaSyBOQAE1xyzS-123abc456def", // Örnek değer, gerçek API Key ile değiştirilmeli
    range: "Sheet1!A:C", // Veri aralığı
    
    // Make.com webhook URL'i (isteğe bağlı)
    webhookUrl: "https://hook.eu1.make.com/abc123xyz456",
    
    // Çekim frekansı (milisaniye)
    pollInterval: 2000, // Her 2 saniyede bir sonuçları kontrol et
    maxPollAttempts: 30, // Maksimum 30 kez kontrol et (1 dakika)
    
    // Sonuçları simüle et (API hazır değilse true yapın)
    simulateResults: true,
    simulationDelay: 3000 // 3 saniye sonra simüle edilmiş sonuç göster
  },
  
  // Footer Bilgileri
  footer: {
    copyright: "&copy; 2025 AI İçerik Üreticisi. Tüm hakları saklıdır.",
    // Sosyal medya linkleri
    socialLinks: [
      { platform: "github", url: "https://github.com/username" },
      { platform: "linkedin", url: "https://linkedin.com/in/username" },
      { platform: "twitter", url: "https://twitter.com/username" }
    ]
  }
};