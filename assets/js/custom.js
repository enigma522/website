// Force dark mode by default
if (!localStorage.getItem('theme')) {
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('theme', 'dark');
}
