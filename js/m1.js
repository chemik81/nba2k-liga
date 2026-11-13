/*@v:af4a9d7b1a*/
function setLang(lang) {
  setTimeout(() => { try { _syncExpLabels(); } catch(e) {} }, 0);
  if(lang !== 'en') lang = 'pl';
  currentLang = lang;
  localStorage.setItem('nba2k_lang', lang);
  // Update switcher buttons
  ['pl','en','nl'].forEach(l => {
    const btn = document.getElementById('lang-' + l);
    if(!btn) return;
    const active = l === lang;
    btn.style.background = active ? 'var(--accent)' : 'transparent';
    btn.style.color = active ? '#000' : 'var(--muted)';
    btn.style.borderColor = active ? 'var(--accent)' : 'var(--border)';
  });
  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if(val) el.textContent = val;
  });
  // Reload page to apply language to all elements
  location.reload();
}
