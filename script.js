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
    updateClosing();
  }

  // Cierre: al llegar, el bloque oscuro arranca con la forma exacta de la píldora y se estira.
  var closing = document.querySelector('.closing');
  var pill = bar && bar.querySelector('.cta-bar__inner');
  var open = false;
  function pillClip() {
    var c = closing.getBoundingClientRect();
    var p = pill.getBoundingClientRect();
    return 'inset(' + (p.top - c.top) + 'px ' + (c.right - p.right) + 'px ' +
      (c.bottom - p.bottom) + 'px ' + (p.left - c.left) + 'px round ' + p.height / 2 + 'px)';
  }
  function updateClosing() {
    if (!closing || !pill) return;
    var top = closing.getBoundingClientRect().top;
    if (!open && top < window.innerHeight * 0.5) {
      open = true;
      closing.style.transition = 'none';
      closing.style.setProperty('--closing-clip', pillClip());
      closing.getBoundingClientRect();
      closing.style.transition = '';
      root.classList.add('at-end');
      closing.classList.add('is-open');
    } else if (open && top > window.innerHeight * 0.6) {
      open = false;
      closing.style.setProperty('--closing-clip', pillClip());
      closing.classList.remove('is-open');
      // La píldora flotante vuelve cuando el bloque ya se ha recogido en su forma.
      setTimeout(function () {
        if (open) return;
        root.classList.remove('at-end');
        // Vuelve a ocultarse del todo, sin animar, para no dejar una píldora oscura en la página.
        closing.style.transition = 'none';
        closing.style.removeProperty('--closing-clip');
        closing.getBoundingClientRect();
        closing.style.transition = '';
      }, reduce ? 0 : 640);
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Índice de secciones: aparece tras el inicio del caso y muestra la sección actual.
  var toc = document.querySelector('.toc');
  if (toc) {
    var tocButton = toc.querySelector('.toc__button');
    var tocCurrent = toc.querySelector('.toc__current');
    var panel = document.getElementById('toc-panel');
    var links = panel ? panel.querySelectorAll('.toc__link') : [];
    var hero = document.querySelector('.hero');
    var updateToc = function () {
      var threshold = hero ? hero.offsetTop + hero.offsetHeight - window.innerHeight / 2 : 400;
      toc.classList.toggle('is-visible', window.scrollY > threshold);
    };
    window.addEventListener('scroll', updateToc, { passive: true });
    updateToc();

    var setCurrent = function (id) {
      var label = 'Secciones';
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        if (on) {
          a.setAttribute('aria-current', 'true');
          label = a.querySelector('.toc__num').textContent + ' · ' + a.querySelector('.toc__label').textContent;
        } else {
          a.removeAttribute('aria-current');
        }
      });
      tocCurrent.textContent = label;
      tocButton.setAttribute('aria-label', label === 'Secciones' ? 'Secciones' : 'Secciones. Ahora: ' + label);
    };
    if ('IntersectionObserver' in window) {
      var sectionIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
      }, { rootMargin: '-30% 0px -60% 0px' });
      document.querySelectorAll('.section[id]').forEach(function (s) { sectionIo.observe(s); });
    }
    links.forEach(function (a) {
      a.addEventListener('click', function () { if (panel.hidePopover) panel.hidePopover(); });
    });
  }

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
