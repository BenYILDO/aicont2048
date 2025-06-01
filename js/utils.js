/**
 * Yardımcı Fonksiyonlar
 * Uygulama genelinde kullanılan yardımcı fonksiyonları içerir.
 */

// DOM elementini seçmek için yardımcı fonksiyon
const $ = (selector) => document.querySelector(selector);

// DOM elementlerini seçmek için yardımcı fonksiyon
const $$ = (selector) => document.querySelectorAll(selector);

// Metni panoya kopyalamak için fonksiyon
const copyToClipboard = (text) => {
  return new Promise((resolve, reject) => {
    if (!navigator.clipboard) {
      // Eski yöntem (klavye ile erişim güvenlik sorunu olabilir)
      fallbackCopyTextToClipboard(text);
      resolve(true);
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => resolve(true))
      .catch(err => {
        console.error('Panoya kopyalama başarısız:', err);
        reject(err);
      });
  });
};

// Modern Clipboard API desteklenmeyen tarayıcılar için alternatif
const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Görünmez yapma
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = "0";
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Kopyalama başarısız oldu:', err);
  }
  
  document.body.removeChild(textArea);
};

// Tema değiştirme fonksiyonu
const toggleTheme = () => {
  const currentTheme = localStorage.getItem('theme') || CONFIG.site.themeDefault;
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Tema değişikliğini kaydet
  localStorage.setItem('theme', newTheme);
  
  // DOM'u güncelle
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // İkon değiştir
  const themeIcon = $('#theme-toggle i');
  if (themeIcon) {
    if (newTheme === 'dark') {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    } else {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    }
  }
  
  return newTheme;
};

// Kayıtlı temayı yükle
const loadSavedTheme = () => {
  const savedTheme = localStorage.getItem('theme') || CONFIG.site.themeDefault;
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // İkonu güncelle
  const themeIcon = $('#theme-toggle i');
  if (themeIcon) {
    if (savedTheme === 'light') {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    }
  }
};

// Form ID'sinden submission ID'sini çıkarmak için fonksiyon
const extractSubmissionId = (url) => {
  if (!url) return null;
  
  // URL'den form gönderim ID'sini çıkar
  const match = url.match(/tally\.so\/forms\/.*\/submissions\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

// Rastgele bir ID oluşturmak için fonksiyon
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Zaman formatını düzenleyen yardımcı fonksiyon
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Objeyi URL parametrelerine dönüştürme
const objectToParams = (obj) => {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

// Bekletme fonksiyonu (async/await ile kullanılabilir)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Site metinlerini config'den yükleme
const loadSiteTexts = () => {
  // Site başlığı
  document.title = CONFIG.site.title;
  $('#site-title').textContent = CONFIG.site.title;
  
  // Hero bölümü
  $('#hero-title').textContent = CONFIG.home.heroTitle;
  $('#hero-description').textContent = CONFIG.home.heroDescription;
  $('#cta-button').textContent = CONFIG.home.ctaButtonText;
  
  // Nasıl Çalışır bölümü
  $('#about-title').textContent = CONFIG.home.aboutTitle;
  $('#step1-description').textContent = CONFIG.home.steps[0].description;
  $('#step2-description').textContent = CONFIG.home.steps[1].description;
  $('#step3-description').textContent = CONFIG.home.steps[2].description;
  
  // Form bölümü
  $('#form-title').textContent = CONFIG.form.formTitle;
  $('#result-title').textContent = CONFIG.form.resultTitle;
  $('.loading-indicator p').textContent = CONFIG.form.loadingText;
  $('.no-result p').textContent = CONFIG.form.noResultText;
  $('#copy-btn').innerHTML = `<i class="fa-regular fa-clipboard"></i> ${CONFIG.form.copyButtonText}`;
  $('#new-content-btn').innerHTML = `<i class="fa-solid fa-plus"></i> ${CONFIG.form.newContentButtonText}`;
  
  // Footer
  $('#footer-copyright').innerHTML = CONFIG.footer.copyright;
};