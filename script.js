(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Barra inferior de CTA: aparece al empezar a hacer scroll.
  var bar = document.querySelector('.cta-bar');
  if (bar) root.classList.add('js');

  // Barra de progreso de lectura.
  var progress = document.createElement('div');
  progress.className = 'progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  var ticking = false;
  function update() {
    ticking = false;
    var max = root.scrollHeight - window.innerHeight;
    if (bar) {
      bar.classList.toggle('is-visible', window.scrollY > 80 || max <= 80);
    }
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Aparición por bloques al hacer scroll.
  if (reduce || !('IntersectionObserver' in window)) return;
  var targets = document.querySelectorAll([
    '.role .spec__label', '.role__lead', '.role li', '.spec',
    '.section__header', '.section > h3', '.section > p',
    '.section > ul > li', '.section > ol > li', '.callout', '.callout__list li',
    '.case-figure', '.image-pair', '.section > table', '.section > .diagram'
  ].join(','));
  if (!targets.length) return;

  var io = new IntersectionObserver(function (entries) {
    // Lo que ya quedó por encima de la pantalla (salto por ancla, scroll rápido) se muestra sin animar.
    entries.forEach(function (e) {
      if (!e.isIntersecting && e.boundingClientRect.top < 0) {
        e.target.style.setProperty('--reveal-delay', '0ms');
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
    var visible = entries.filter(function (e) { return e.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
    visible.forEach(function (entry, i) {
      entry.target.style.setProperty('--reveal-delay', Math.min(i, 3) * 80 + 'ms');
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  root.classList.add('reveal-ready');
})();
