/**
 * Ana Uygulama Scripti
 * Tüm uygulamayı başlatan ve diğer modülleri birleştiren ana dosya.
 */

// Sayfa yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
  console.log('AI İçerik Üreticisi yükleniyor...');
  
  // UI'yi başlat
  initializeUI();
  
  // Event dinleyicilerini ekle
  addEventListeners();
  
  console.log('Uygulama başarıyla yüklendi!');
});

// Olay dinleyicileri
const addEventListeners = () => {
  // Kullanıcı uygulamayı kullanırken olası hataları yakala
  window.addEventListener('error', (event) => {
    console.error('Uygulama hatası:', event.error);
  });
  
  // Sayfadan ayrılmadan önce kullanıcıya uyarı göster (form dolduruyorsa)
  window.addEventListener('beforeunload', (event) => {
    const isFormActive = !$('#loading-indicator').classList.contains('hidden');
    
    if (isFormActive) {
      // Form gönderimi yapılıyorsa, kullanıcıya uyarı göster
      event.preventDefault();
      event.returnValue = 'Form gönderimi devam ediyor. Sayfadan ayrılmak istediğinize emin misiniz?';
      return event.returnValue;
    }
  });
  
  // Klavye kısayolları
  document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + C ile içeriği kopyala
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      if (!$('#result-content').classList.contains('hidden')) {
        const selection = window.getSelection().toString();
        
        // Hiçbir şey seçili değilse tüm içeriği kopyala
        if (!selection) {
          event.preventDefault();
          $('#copy-btn').click();
        }
      }
    }
    
    // Esc tuşu ile yeni içerik oluşturma
    if (event.key === 'Escape') {
      if (!$('#result-content').classList.contains('hidden')) {
        $('#new-content-btn').click();
      }
    }
  });
  
  // Pencere boyutu değiştiğinde UI'yi uyarla
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Tally form yüksekliğini ayarla (mobil görünümde daha küçük)
      adjustFormHeight();
    }, 250);
  });
  
  // İlk yükleme için form yüksekliğini ayarla
  adjustFormHeight();
};

// Ekran boyutuna göre form yüksekliğini ayarla
const adjustFormHeight = () => {
  const formContainer = $('.tally-form-container');
  const resultPanel = $('.result-panel');
  
  if (!formContainer || !resultPanel) return;
  
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
  
  // Ekran boyutuna göre yükseklik ayarla
  if (isMobile) {
    formContainer.style.height = '450px';
    resultPanel.style.height = '450px';
  } else if (isTablet) {
    formContainer.style.height = '500px';
    resultPanel.style.height = '500px';
  } else {
    formContainer.style.height = '600px';
    resultPanel.style.height = '600px';
  }
};

// Sayfa performansını izle
const monitorPerformance = () => {
  // Performans API'yi destekleyen tarayıcılar için
  if (window.performance && window.performance.getEntriesByType) {
    // Sayfa yükleme metrikleri
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.getEntriesByType('navigation')[0];
        
        if (perfData) {
          console.log('Sayfa yükleme performansı:', {
            'Toplam yükleme süresi': `${Math.round(perfData.duration)}ms`,
            'DOM hazır': `${Math.round(perfData.domContentLoadedEventEnd)}ms`,
            'İlk byte': `${Math.round(perfData.responseStart)}ms`
          });
        }
      }, 0);
    });
  }
};

// Performans izlemeyi başlat
monitorPerformance();