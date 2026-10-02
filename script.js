// Barra inferior de CTA: aparece al empezar a hacer scroll.
(function () {
  var bar = document.querySelector('.cta-bar');
  if (!bar) return;
  document.documentElement.classList.add('js');
  function update() {
    var scrollable = document.documentElement.scrollHeight > window.innerHeight + 80;
    bar.classList.toggle('is-visible', window.scrollY > 80 || !scrollable);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
