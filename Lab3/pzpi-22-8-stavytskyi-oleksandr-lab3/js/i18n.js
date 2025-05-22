let translations = {};
let currentLang = localStorage.getItem('language') || 'uk';
let i18nInitialized = false;

async function loadTranslations(lang) {
  try {
    const response = await fetch(`../locales/${lang}.json`);
    translations[lang] = await response.json();
  } catch (err) {
    console.error(`Помилка завантаження локалізації для ${lang}:`, err);
  }
}

async function initI18n() {
  await Promise.all([loadTranslations('en'), loadTranslations('uk')]);
  setLanguage(currentLang);
  i18nInitialized = true; // Позначаємо, що ініціалізація завершена
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    // Перевіряємо, чи елемент не є userRole, щоб не перезаписати його значення
    if (element.id !== 'userRole') {
      element.textContent = translations[lang][key] || key;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = translations[lang][key] || key;
  });
  document.querySelectorAll('[data-i18n-value]').forEach(element => {
    const key = element.getAttribute('data-i18n-value');
    element.value = translations[lang][key] || key;
  });
  const langSelect = document.getElementById('languageSelect');
  if (langSelect) langSelect.value = lang;
}

function t(key) {
  return translations[currentLang][key] || key;
}

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
});