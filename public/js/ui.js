/**
 * UI İşlemleri
 * Kullanıcı arayüzü ile ilgili tüm fonksiyonları içerir.
 */

// Tally.so form iframe'ini yükle
const loadTallyForm = () => {
  const tallyFormContainer = $('#tally-form');
  
  if (!tallyFormContainer) return;
  
  // Form yükleme yerini temizle
  tallyFormContainer.innerHTML = '';
  
  // Iframe oluştur
  const iframe = document.createElement('iframe');
  iframe.src = CONFIG.form.tallyFormUrl;
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.frameBorder = '0';
  iframe.marginHeight = '0';
  iframe.marginWidth = '0';
  iframe.title = CONFIG.form.formTitle;
  
  // Iframe'i container'a ekle
  tallyFormContainer.appendChild(iframe);
  
  // Form gönderimini dinle
  listenForFormSubmission(iframe);
};

// Form gönderimini dinleme
const listenForFormSubmission = (iframe) => {
  // İframe mesajlarını dinle
  window.addEventListener('message', (event) => {
    // Tally.so'dan geldiğinden emin ol
    if (event.origin.includes('tally.so')) {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Form gönderildiğinde
        if (data.type === 'tally:form:submitted' || 
            (data.eventName && data.eventName === 'tally-form:submitted')) {
          
          console.log('Form gönderildi!', data);
          
          // Form ID veya Submission ID'sini al
          const submissionId = data.data?.submissionId || extractSubmissionId(data.currentLocation);
          
          if (submissionId) {
            // Sonuç panelini göster ve yükleme animasyonunu başlat
            showLoadingState();
            
            // API'dan sonuçları almaya başla
            fetchResults(submissionId);
          }
        }
      } catch (error) {
        console.error('Tally.so form mesajı işlenirken hata:', error);
      }
    }
  });
};

// Yükleme durumunu göster
const showLoadingState = () => {
  $('#no-result').classList.add('hidden');
  $('#result-content').classList.add('hidden');
  $('#loading-indicator').classList.remove('hidden');
  
  // Sayfayı sonuç paneline kaydır
  $('#result-panel').scrollIntoView({ behavior: 'smooth' });
};

// Sonuç içeriğini göster
const showResultContent = (content) => {
  $('#loading-indicator').classList.add('hidden');
  $('#no-result').classList.add('hidden');
  
  // Sonuç içeriğini ayarla
  $('#content-display').textContent = content;
  
  // Sonuç panelini göster
  $('#result-content').classList.remove('hidden');
};

// Sonuç bulunamadı durumunu göster
const showNoResultState = () => {
  $('#loading-indicator').classList.add('hidden');
  $('#result-content').classList.add('hidden');
  $('#no-result').classList.remove('hidden');
};

// Kopyalama butonunu işlevsel hale getir
const setupCopyButton = () => {
  const copyBtn = $('#copy-btn');
  
  if (!copyBtn) return;
  
  copyBtn.addEventListener('click', async () => {
    const content = $('#content-display').textContent;
    
    if (!content) return;
    
    try {
      await copyToClipboard(content);
      
      // Kopyalama başarılı olduğunda görsel geri bildirim
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Kopyalandı!';
      copyBtn.classList.add('success');
      
      // 2 saniye sonra eski haline getir
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('success');
      }, 2000);
      
    } catch (error) {
      console.error('Kopyalama hatası:', error);
    }
  });
};

// Yeni içerik oluşturma butonunu ayarla
const setupNewContentButton = () => {
  const newContentBtn = $('#new-content-btn');
  
  if (!newContentBtn) return;
  
  newContentBtn.addEventListener('click', () => {
    // Formu sıfırla ve görünüme kaydır
    const iframe = $('#tally-form iframe');
    if (iframe) {
      iframe.src = CONFIG.form.tallyFormUrl;
      $('#form-section').scrollIntoView({ behavior: 'smooth' });
    }
  });
};

// Tema değiştirme butonunu işlevsel hale getir
const setupThemeToggle = () => {
  const themeToggleBtn = $('#theme-toggle');
  
  if (!themeToggleBtn) return;
  
  themeToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
  });
};

// Yumuşak kaydırma için tüm iç bağlantıları ayarla
const setupSmoothScrolling = () => {
  const internalLinks = $$('a[href^="#"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = $(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
};

// Google Sheets'ten veri çekme fonksiyonu
async function fetchSheetData(sheetId) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    return json.table.rows.map(row => row.c.map(cell => cell ? cell.v : ""));
}

// Google Sheets verisini göster
async function showSheetData() {
    const sheetId = "1iE9WuCsiYiAnrGUY7ajX8fnlkSZp1rx5_vtE46R_tUY";
    const data = await fetchSheetData(sheetId);
    const contentDiv = document.getElementById("content-display");
    contentDiv.innerHTML = "";
    // I sütununun (index 8) son dolu satırını bul
    let lastContent = "";
    for (let i = data.length - 1; i >= 0; i--) {
        if (data[i][8]) { // 9. sütun (I)
            lastContent = data[i][8];
            break;
        }
    }
    if (lastContent) {
        contentDiv.textContent = lastContent;
    } else {
        contentDiv.textContent = "Henüz içerik bulunamadı.";
    }
}

// Sayfa yüklendiğinde Google Sheets verisini göster
window.addEventListener('DOMContentLoaded', showSheetData);

// Sayfa yüklendiğinde çalışacak UI hazırlık fonksiyonu
const initializeUI = () => {
  // Temayı yükle
  loadSavedTheme();
  
  // Site metinlerini yükle
  loadSiteTexts();
  
  // Tally.so formunu yükle
  loadTallyForm();
  
  // Butonları ayarla
  setupCopyButton();
  setupNewContentButton();
  setupThemeToggle();
  setupSmoothScrolling();
  
  // Sayfa scroll animasyonları
  initScrollAnimations();
};

// Sayfa kaydırma animasyonları
const initScrollAnimations = () => {
  // IntersectionObserver API kullanarak elementlerin görünür olduğunda animasyon ekle
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  // Animasyon eklenecek elementler
  const animateElements = [
    $('.hero-content'),
    $('.hero-image'),
    ...$$('.step'),
    $('.form-container'),
    $('.result-container')
  ];
  
  // CSS sınıfları ekle
  animateElements.forEach((el, index) => {
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
      el.style.transitionDelay = `${index * 0.1}s`;
      
      // Görünür olduğunda tetiklenecek sınıf
      el.classList.add('animate-element');
      
      // Görünürlüğü izle
      observer.observe(el);
    }
  });
  
  // CSS stil ekle
  const style = document.createElement('style');
  style.textContent = `
    .animate-element.animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
};