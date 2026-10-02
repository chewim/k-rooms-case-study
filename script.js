// Barra inferior de CTA: aparece al empezar a hacer scroll.
(function () {
  var bar = document.querySelector('.cta-bar');
  if (!bar) return;
  document.documentElement.classList.add('js');
  function update() {
    bar.classList.toggle('is-visible', window.scrollY > 80);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
