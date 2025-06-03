/**
 * UI İşlemleri
 * Kullanıcı arayüzü ile ilgili tüm fonksiyonları içerir.
 */

// Yardımcı fonksiyon: CSS selector ile tek element seçme
const querySelector = (selector) => document.querySelector(selector);
// Yardımcı fonksiyon: CSS selector ile birden çok element seçme
const querySelectorAll = (selector) => document.querySelectorAll(selector);

// Tally.so form iframe'ini yükle
const loadTallyForm = () => {
  const tallyFormContainer = querySelector('#tally-form');
  
  if (!tallyFormContainer) return;
  
  // Form yükleme yerini temizle
  tallyFormContainer.innerHTML = '';
  
  // Her sayfa yüklemede eski formId'yi sil, yeni formId oluştur
  sessionStorage.removeItem('formId');
  const formId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  sessionStorage.setItem('formId', formId);
  console.log('Yeni formId:', formId);
  
  // Iframe oluştur
  const iframe = document.createElement('iframe');
  iframe.id = 'tally-frame';
  // Tally formu URL'sine formId parametresi ekle
  iframe.src = CONFIG.form.tallyFormUrl + '?formId=' + formId;
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
            
            // API'dan sonuçları almaya başla (artık formId kullanıyoruz)
            const formId = sessionStorage.getItem('formId');
            if (formId) {
                // Polling'i başlat
                startSheetPolling();
            } else {
                console.error("Form gönderildi ama sessionStorage'da formId bulunamadı.");
                showNoResultState();
            }
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
  querySelector('#no-result').classList.add('hidden');
  querySelector('#result-content').classList.add('hidden');
  querySelector('#loading-indicator').classList.remove('hidden');
  
  // Sayfayı sonuç paneline kaydır
  querySelector('#result-panel').scrollIntoView({ behavior: 'smooth' });
};

// Sonuç içeriğini göster
const showResultContent = (content) => {
  querySelector('#loading-indicator').classList.add('hidden');
  querySelector('#no-result').classList.add('hidden');
  
  // Sonuç içeriğini ayarla
  querySelector('#content-display').textContent = content;
  
  // Sonuç panelini göster
  querySelector('#result-content').classList.remove('hidden');
};

// Sonuç bulunamadı durumunu göster
const showNoResultState = () => {
  querySelector('#loading-indicator').classList.add('hidden');
  querySelector('#result-content').classList.add('hidden');
  querySelector('#no-result').classList.remove('hidden');
};

// Kopyalama butonunu işlevsel hale getir
const setupCopyButton = () => {
  const copyBtn = querySelector('#copy-btn');
  
  if (!copyBtn) return;
  
  copyBtn.addEventListener('click', async () => {
    const content = querySelector('#content-display').textContent;
    
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
  const newContentBtn = querySelector('#new-content-btn');
  
  if (!newContentBtn) return;
  
  newContentBtn.addEventListener('click', () => {
    // Formu sıfırla ve görünüme kaydır
    const iframe = querySelector('#tally-form iframe');
    if (iframe) {
      iframe.src = CONFIG.form.tallyFormUrl;
      querySelector('#form-section').scrollIntoView({ behavior: 'smooth' });
    }
  });
};

// Tema değiştirme butonunu işlevsel hale getir
const setupThemeToggle = () => {
  const themeToggleBtn = querySelector('#theme-toggle');
  
  if (!themeToggleBtn) return;
  
  themeToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
  });
};

// Yumuşak kaydırma için tüm iç bağlantıları ayarla
const setupSmoothScrolling = () => {
  const internalLinks = querySelectorAll('a[href^="#"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
};

// Helper function to parse CSV data robustly
function parseCsv(text) {
    const rows = [];
    let currentRow = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentValue += '"';
                i++; // Skip the next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentValue.trim());
            currentValue = '';
        } else if (char === '\n' && !inQuotes) {
            // Handle potential \r\n line endings
            if (text[i - 1] === '\r') {
                // Do nothing, already handled by \r
            } else {
                 currentRow.push(currentValue.trim());
                 rows.push(currentRow);
                 currentRow = [];
                 currentValue = '';
            }
        } else if (char === '\r' && !inQuotes) {
             currentRow.push(currentValue.trim());
             rows.push(currentRow);
             currentRow = [];
             currentValue = '';
        } else {
            currentValue += char;
        }
    }

    // Add the last value and row if exists
    if (currentValue || currentRow.length > 0) {
        currentRow.push(currentValue.trim());
        rows.push(currentRow);
    }

    return rows;
}

// Google Sheets'ten veri çekme fonksiyonu (CSV formatı)
async function fetchSheetCsvData(sheetCsvUrl) {
    try {
        const response = await fetch(sheetCsvUrl);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return null;
        }
        const text = await response.text();
        return text;
    } catch (error) {
        console.error('Google Sheets CSV verisi çekilirken hata:', error);
        return null;
    }
}

// --- Otomasyon: Form submit sonrası loading ve otomatik güncelleme ---
let sheetPollingInterval = null;

function startSheetPolling() {
    let attempts = 0;
    const maxAttempts = 30; // 30x2=60sn (daha sık kontrol)
    const pollingInterval = 2000; // 2 saniyede bir kontrol

    showLoadingState();
    if (sheetPollingInterval) clearInterval(sheetPollingInterval);
    sheetPollingInterval = setInterval(async () => {
        attempts++;
        console.log(`Sheets kontrol ediliyor (Deneme ${attempts}/${maxAttempts})...`);
        const formId = sessionStorage.getItem('formId');
        if (formId) {
             const aiOutput = await getAIOutputByFormId(formId);
            if (aiOutput) {
                clearInterval(sheetPollingInterval);
                showEditableResult(aiOutput);
            } else if (attempts >= maxAttempts) {
                clearInterval(sheetPollingInterval);
                console.warn('Belirtilen formId için AI çıktısı bulunamadı.', formId);
                showNoResultState();
            }
        } else {
             console.error("sessionStorage'da formId bulunamadı.");
             clearInterval(sheetPollingInterval);
             showNoResultState();
        }
    }, pollingInterval);
}

// AI çıktısını formId'ye göre bulan fonksiyon
async function getAIOutputByFormId(formIdToFind) {
    const sheetCsvUrl = CONFIG.form.sheetCsvPublicUrl; // CONFIG dosyasından alınacak
    const csvText = await fetchSheetCsvData(sheetCsvUrl);

    if (!csvText) {
        console.error('CSV verisi çekilemedi.');
        return null;
    }

    const data = parseCsv(csvText);

    if (data.length === 0) {
        console.warn('CSV verisi boş.');
        return null;
    }

    // Başlık satırını al ve indexleri bul (case-insensitive, trimmed)
    const headers = data[0].map(header => header.trim().toLowerCase());
    const formIdColIndex = headers.indexOf('formid');
    // Searching for 'ai çıktısı' (lowercase with Turkish character) based on previous interaction analysis
    const aiOutputColIndex = headers.indexOf('ai çıktısı');

    if (formIdColIndex === -1 || aiOutputColIndex === -1) {
        console.error('CSV başlıkları bulunamadı. "formID" veya "AI Çıktısı" sütunlarını kontrol edin.', {headers, formIdColIndex, aiOutputColIndex});
        return null;
    }

    // FormId'ye göre ilgili satırı bul
    for (let i = 1; i < data.length; i++) { // İlk satır başlık, 1'den başla
        const row = data[i];
        if (row[formIdColIndex] && row[formIdColIndex].trim() === formIdToFind) {
            // İlgili AI çıktısını döndür
            return row[aiOutputColIndex] ? row[aiOutputColIndex].trim() : null;
        }
    }

    console.warn(`Belirtilen formId (${formIdToFind}) CSV verisinde bulunamadı.`);
    return null;
}

// Submission ID yerine formId kullanacak şekilde fetchResults fonksiyonunu güncelle (placeholder)
async function fetchResults(submissionId) { 
     console.log('fetchResults çağrıldı.');
     // startSheetPolling zaten listenForFormSubmission içinde veya sayfa yüklendiğinde (eğer sonuç varsa)
     // çağrılıyor, bu fonksiyon artık sadece bir placeholder veya eski çağrıları yakalamak için duruyor.
}

// Sonuç içeriğini düzenlenebilir hale getir ve butonları göster
function showEditableResult(content) {
    querySelector('#loading-indicator').classList.add('hidden');
    querySelector('#no-result').classList.add('hidden');
    const contentDiv = querySelector('#content-display');
    contentDiv.innerText = content;
    contentDiv.setAttribute('contenteditable', 'true');
    querySelector('#result-content').classList.remove('hidden');
    
    // Butonları göster
    setupCopyButton();
    setupDownloadButton(); // İndir butonu fonksiyonu eklenmişse
}

// --- Kopyala ve İndir butonları ---
function setupDownloadButton() {
    const downloadBtn = querySelector('#download-btn');
    if (!downloadBtn) return;
    downloadBtn.addEventListener('click', () => {
        const content = querySelector('#content-display').innerText;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'icerik.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Sayfa yüklendiğinde çalışacak UI hazırlık fonksiyonu
const initializeUI = () => {
     console.log('initializeUI çağrıldı. UI başlatılıyor...');
     // Diğer UI hazırlıklarını buraya ekleyebilirsiniz (smooth scrolling vb.)
     setupSmoothScrolling();
     setupThemeToggle();
     setupNewContentButton(); // Yeni içerik oluştur butonunu ayarla
     // Copy ve Download butonları artık showEditableResult içinde ayarlanacak
};

// Scroll animasyonlarını başlat
const initScrollAnimations = () => {
    console.log('initScrollAnimations çağrıldı.');
    // ScrollReveal konfigürasyonu
    // ScrollReveal().reveal('.form-section', { delay: 200, origin: 'top', distance: '20px' }); // Commented out due to potential conflict or library issue
    // ScrollReveal().reveal('.result-panel', { delay: 200, origin: 'bottom', distance: '20px' }); // Commented out
    // Diğer elementler için animasyonlar
    // ScrollReveal().reveal('.container', { delay: 100, origin: 'top', distance: '20px' }); // Commented out
    // ScrollReveal().reveal('h1, h2, p', { delay: 100, origin: 'left', distance: '20px', interval: 100 }); // Commented out
    // ScrollReveal().reveal('.button', { delay: 200, origin: 'bottom', distance: '20px', interval: 100 }); // Commented out
};

// Yardımcı fonksiyon: Clipboard'a kopyalama
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Metin panoya kopyalandı!');
  } catch (err) {
    console.error('Panoya kopyalama başarısız:', err);
    // Alternatif kopyalama yöntemi (eski tarayıcılar için veya fallback)
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Gizli tut
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      console.log('Alternatif kopyalama başarılı!');
    } catch (altErr) {
      console.error('Alternatif kopyalama başarısız:', altErr);
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// Yardımcı fonksiyon: Tally.so URL'sinden submissionId çekme
function extractSubmissionId(url) {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        // path'in son kısmını submissionId olarak al (örneğin, /submissions/xxxx)
        const pathSegments = urlObj.pathname.split('/').filter(segment => segment !== '');
        if (pathSegments.length > 0 && pathSegments[pathSegments.length - 1] !== 'submissions') {
            return pathSegments[pathSegments.length - 1];
        }
    } catch (error) {
        console.error("Submission ID URL'den çekilirken hata:", error);
    }
    return null;
}

// Tema değiştirme mantığı
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Kaydedilmiş temayı yükle
function loadSavedTheme() {
    console.log('loadSavedTheme çağrıldı.');
    const savedTheme = localStorage.getItem('theme') || 'light'; // Varsayılan tema light
    document.body.setAttribute('data-theme', savedTheme);
}

// Sayfa yüklendiğinde UI'ı başlat
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired. Starting UI initialization...');
    loadSavedTheme(); // Temayı yükle
    console.log('loadSavedTheme finished.');
    initializeUI(); // Diğer UI bileşenlerini başlat
    console.log('initializeUI finished.');
    loadTallyForm(); // Tally formunu yükle
    console.log('loadTallyForm finished.');
    initScrollAnimations(); // Scroll animasyonlarını başlat
    console.log('initScrollAnimations finished.');
    
    // Add event listeners from script.js after UI is initialized
    if (typeof addEventListeners === 'function') {
        console.log('Calling addEventListeners.');
        addEventListeners();
        console.log('addEventListeners finished.');
    } else {
        console.error('addEventListeners fonksiyonu script.js içinde tanımlı değil veya erişilemiyor.');
    }
    
    console.log('UI initialization complete.');
    
    // Sayfa yüklendiğinde hemen sonuç kontrolü yapma, form submit olunca başla
    // showAIOutputByFormId(); // Bu satır kaldırıldı
});
