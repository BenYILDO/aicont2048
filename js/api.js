/**
 * API İşlemleri
 * Dış kaynaklardan veri çekme işlemlerini içerir.
 */

// Yapay zeka sonuçlarını almak için Google Sheets'e istek
const fetchResults = async (submissionId) => {
  console.log(`${submissionId} ID'li form için sonuçlar alınıyor...`);
  
  // Simülasyon modunu kontrol et
  if (CONFIG.api.simulateResults) {
    console.log('Simülasyon modu aktif, gerçek API çağrısı yapılmıyor.');
    await simulateResultFetch(submissionId);
    return;
  }
  
  let attempts = 0;
  const maxAttempts = CONFIG.api.maxPollAttempts;
  const pollInterval = CONFIG.api.pollInterval;
  
  // Belirli aralıklarla sonuçları kontrol et
  const checkResults = async () => {
    if (attempts >= maxAttempts) {
      console.log('Maksimum kontrol sayısına ulaşıldı. Sonuç bulunamadı.');
      showNoResultState();
      return;
    }
    
    attempts++;
    console.log(`Sonuçlar kontrol ediliyor... (${attempts}/${maxAttempts})`);
    
    try {
      // Google Sheets API'a istek
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.api.sheetId}/values/${CONFIG.api.range}?key=${CONFIG.api.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.values || data.values.length <= 1) {
        console.log('Henüz sonuç bulunamadı, tekrar denenecek...');
        setTimeout(checkResults, pollInterval);
        return;
      }
      
      // Başlık satırını ve veri satırlarını ayır
      const [headers, ...rows] = data.values;
      
      // Form gönderim ID'sine göre sonucu bul
      const submissionIdIndex = headers.findIndex(h => h.toLowerCase().includes('submission') || h.toLowerCase().includes('id'));
      const contentIndex = headers.findIndex(h => h.toLowerCase().includes('content') || h.toLowerCase().includes('result') || h.toLowerCase().includes('output'));
      
      if (submissionIdIndex === -1 || contentIndex === -1) {
        console.error('Gerekli sütunlar bulunamadı');
        setTimeout(checkResults, pollInterval);
        return;
      }
      
      // En son eklenen ve aranan submission ID'ye sahip satırı bul
      let resultRow = null;
      
      for (let i = rows.length - 1; i >= 0; i--) {
        const row = rows[i];
        if (row[submissionIdIndex] && row[submissionIdIndex].includes(submissionId)) {
          resultRow = row;
          break;
        }
      }
      
      if (resultRow && resultRow[contentIndex]) {
        console.log('Sonuç bulundu!');
        showResultContent(resultRow[contentIndex]);
      } else {
        console.log('Sonuç henüz hazır değil, tekrar denenecek...');
        setTimeout(checkResults, pollInterval);
      }
      
    } catch (error) {
      console.error('API hatası:', error);
      setTimeout(checkResults, pollInterval);
    }
  };
  
  // İlk kontrolü başlat
  checkResults();
};

// Test ve demo için sonuç simülasyonu
const simulateResultFetch = async (submissionId) => {
  console.log(`Simülasyon: ${submissionId} için yapay sonuç oluşturuluyor...`);
  
  // Yükleme efekti için bekle
  await sleep(CONFIG.api.simulationDelay);
  
  // Örnek yapay zeka sonuçları
  const sampleResults = [
    `# Harika İçerik Örneği

## Giriş
Bu içerik yapay zeka tarafından otomatik olarak oluşturulmuştur. İçerik oluşturma sürecinizi hızlandırmak ve ilham vermek amacıyla tasarlanmıştır.

## Başlıca Özellikler
- Hızlı ve kaliteli içerik üretimi
- SEO uyumlu metinler
- Özgün ve yaratıcı fikirler
- Farklı formatlarda içerik desteği

## Sonuç
Bu örnek içerik, sistemimizin ne kadar başarılı çalıştığını göstermektedir. İhtiyaçlarınıza göre özelleştirilmiş içerikler için formu kullanmaya devam edebilirsiniz.`,

    `# Dijital Pazarlama Stratejisi

## Hedef Kitle Analizi
Hedef kitlenizi anlamak, başarılı bir pazarlama stratejisinin temel taşıdır. Müşterilerinizin demografik özelliklerini, ilgi alanlarını ve davranış biçimlerini analiz ederek daha etkili kampanyalar oluşturabilirsiniz.

## Kanal Stratejisi
- **Sosyal Medya**: Instagram, Facebook ve LinkedIn platformlarında düzenli içerik paylaşımı
- **E-posta Pazarlaması**: Haftalık bültenler ve özel teklifler
- **İçerik Pazarlaması**: Blog yazıları ve infografikler
- **SEO**: Anahtar kelime optimizasyonu ve teknik SEO iyileştirmeleri

## Bütçe Planlaması
Toplam pazarlama bütçenizin %40'ını dijital reklamlara, %30'unu içerik üretimine, %20'sini SEO çalışmalarına ve %10'unu analiz araçlarına ayırmanız önerilir.`,

    `# Proje Yönetimi Rehberi

## Proje Başlangıç Aşaması
1. Proje kapsamını net bir şekilde tanımlayın
2. Tüm paydaşları belirleyin ve beklentilerini anlayın
3. SMART hedefler belirleyin (Specific, Measurable, Achievable, Relevant, Time-bound)
4. Risk analizi yapın ve olası engelleri önceden belirleyin

## Planlama Aşaması
- İş kırılım yapısı (WBS) oluşturun
- Görev bağımlılıklarını belirleyin
- Kaynakları atayın
- Zaman çizelgesi oluşturun

## Uygulama ve Kontrol
Düzenli durum toplantıları yaparak projenin ilerleyişini takip edin. KPI'lar belirleyin ve ölçün. Sapmaları erken tespit ederek hızlı müdahalede bulunun.`
  ];
  
  // Rastgele bir sonuç seç
  const randomIndex = Math.floor(Math.random() * sampleResults.length);
  const simulatedResult = sampleResults[randomIndex];
  
  // Sonucu göster
  showResultContent(simulatedResult);
};

// Webhook'a veri gönderme (Make.com entegrasyonu için)
const sendToWebhook = async (data) => {
  if (!CONFIG.api.webhookUrl) return;
  
  try {
    const response = await fetch(CONFIG.api.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook hatası: ${response.status}`);
    }
    
    console.log('Webhook\'a veri başarıyla gönderildi');
    
  } catch (error) {
    console.error('Webhook hatası:', error);
  }
};