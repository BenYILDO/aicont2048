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

// --- AI İçeriği için formId ve Google Sheets entegrasyonu ---

// 1. Sayfa yüklendiğinde benzersiz formId oluştur ve sessionStorage'a kaydet
function getOrCreateFormId() {
  let formId = sessionStorage.getItem('formId');
  if (!formId) {
    formId = Date.now().toString();
    sessionStorage.setItem('formId', formId);
  }
  return formId;
}

// 2. Tally iframe'ine formId parametresi ekle
function updateTallyIframeWithFormId() {
  const formId = getOrCreateFormId();
  const tallyIframe = document.querySelector('#tally-form iframe');
  if (tallyIframe) {
    let src = tallyIframe.src.split('?')[0];
    tallyIframe.src = `${src}?formId=${formId}`;
  }
}

// 3. Tabletop.js ile Google Sheets'ten veri çek ve formId ile eşleşen satırı göster
function fetchAndShowAIOutput() {
  const formId = getOrCreateFormId();
  const sheetID = '1iE9WuCsiYiAnrGUY7ajX8fnlkSZp1rx5_vtE46R_tUY'; // Google Sheet ID
  Tabletop.init({
    key: sheetID,
    simpleSheet: true,
    callback: function(data) {
      // formId ile eşleşen satırı bul
      const match = data.find(row => row.formId === formId);
      const aiOutputDiv = document.getElementById('ai-output');
      if (match) {
        // Başlık, İçerik Metni, Hashtag alanlarını göster
        aiOutputDiv.innerHTML = `
          <h3>${match.Başlık || ''}</h3>
          <p>${match['İçerik Metni'] || ''}</p>
          <strong>${match.Hashtag || ''}</strong>
        `;
      } else {
        aiOutputDiv.innerHTML = '<p>Henüz içerik oluşturulmadı.</p>';
      }
    }
  });
}

// 4. Sayfa yüklendiğinde ve form submit sonrası işlemleri tetikle
function setupAIOutputSystem() {
  // Benzersiz formId oluştur
  getOrCreateFormId();
  // Tally iframe'ine formId ekle
  setTimeout(updateTallyIframeWithFormId, 1000); // iframe yüklenmesi için gecikme
  // AI çıktısını ilk yüklemede ve her 5 sn'de bir kontrol et
  fetchAndShowAIOutput();
  setInterval(fetchAndShowAIOutput, 5000);
}

// 5. Tabletop.js'i yükle (CDN'den)
(function loadTabletopJs() {
  if (!window.Tabletop) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tabletop.js/1.5.4/tabletop.min.js';
    script.onload = setupAIOutputSystem;
    document.body.appendChild(script);
  } else {
    setupAIOutputSystem();
  }
})();