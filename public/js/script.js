/**
 * Ana Uygulama Scripti
 * Tüm uygulamayı başlatan ve diğer modülleri birleştiren ana dosya.
 */

// Remove this commented out block that might be causing issues
/*
// document.addEventListener('DOMContentLoaded', () => { // Remove this listener
//   console.log('AI İçerik Üreticisi yükleniyor...');
  
//   // UI'yi başlat
//   initializeUI(); // Remove this call
  
//   // Event dinleyicilerini ekle
//   addEventListeners(); // Move this call if necessary, or ensure it's called after UI is ready
  
//   console.log('Uygulama başarıyla yüklendi!');
// });
*/

// Event dinleyicileri
const addEventListeners = () => {
  // Kullanıcı uygulamayı kullanırken olası hataları yakala
  window.addEventListener('error', (event) => {
    console.error('Uygulama hatası:', event.error);
  });
  
  // Sayfadan ayrılmadan önce kullanıcıya uyarı göster (form dolduruyorsa)
  window.addEventListener('beforeunload', (event) => {
    // Use querySelector instead of $ for consistency
    const isFormActive = !querySelector('#loading-indicator').classList.contains('hidden');
    
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
      // Use querySelector instead of $
      if (!querySelector('#result-content').classList.contains('hidden')) {
        const selection = window.getSelection().toString();
        
        // Hiçbir şey seçili değilse tüm içeriği kopyala
        if (!selection) {
          event.preventDefault();
          // Make sure copy button logic is accessible, or call it differently
          // $('#copy-btn').click(); 
          // Assuming copyToClipboard is globally accessible or available via UI module
          // Use querySelector for #content-display
          const contentToCopy = querySelector('#content-display').textContent;
          if (contentToCopy) {
              // Assuming copyToClipboard is a global function or imported
              // Call the copyToClipboard function defined in ui.js
              if (typeof copyToClipboard === 'function') {
                  copyToClipboard(contentToCopy);
                   // Optional: visual feedback for copy
                  // Use querySelector for #copy-btn
                  const copyBtn = querySelector('#copy-btn');
                    if (copyBtn) {
                        const originalText = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Kopyalandı!';
                        copyBtn.classList.add('success');
                        setTimeout(() => {
                            copyBtn.innerHTML = originalText;
                            copyBtn.classList.remove('success');
                        }, 2000);
                    }
              } else {
                  console.error('copyToClipboard fonksiyonu tanımlı değil veya erişilemiyor.');
              }
          }
        }
      }
    }
    
    // Esc tuşu ile yeni içerik oluşturma
    if (event.key === 'Escape') {
      // Use querySelector instead of $
      if (!querySelector('#result-content').classList.contains('hidden')) {
          // Make sure new content button logic is accessible
          // $('#new-content-btn').click();
          // Assuming the new content logic is part of the UI module and callable
          // This might require a function export from ui.js or a different structure.
          // For now, log a message indicating this needs to be handled.
          console.log('Escape key pressed: New content functionality needs to be called from UI module.');
          // Consider calling a function from ui.js here if needed, e.g., ui.resetForm();
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
  // Use querySelector instead of $
  const formContainer = querySelector('.tally-form-container');
  const resultPanel = querySelector('.result-panel');
  
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

// Make addEventListeners globally accessible for ui.js to call
window.addEventListeners = addEventListeners;

// Add event listeners after UI is initialized (assuming this is called from ui.js)
// addEventListeners(); // This call will be managed by ui.js or called explicitly after UI is ready