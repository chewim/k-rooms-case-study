(function () {
  var root = document.documentElement;
  // Textos que genera el script, según el idioma de la página
  var STRINGS = {
    es: { sections: 'Secciones', sectionsNow: 'Secciones. Ahora: ', start: 'Inicio', enlarge: 'Ampliar: ', goto: 'Ir al texto →' },
    en: { sections: 'Sections', sectionsNow: 'Sections. Now: ', start: 'Start', enlarge: 'Enlarge: ', goto: 'Go to the text →' }
  };
  var T = STRINGS[(root.lang || 'es').slice(0, 2)] || STRINGS.es;
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
      var label = T.sections;
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
      tocButton.setAttribute('aria-label', label === T.sections ? T.sections : T.sectionsNow + label);
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

  // Galería: drawer con la lista vertical de imágenes, construido al abrirlo a partir de las figuras del caso.
  var drawer = document.getElementById('gallery');
  var viewer = document.getElementById('viewer');
  if (drawer && drawer.showPopover) {
    var list = drawer.querySelector('.drawer__list');
    var items = [];
    var built = false;
    var stage = viewer.querySelector('.viewer__stage');
    var viewerCaption = viewer.querySelector('.viewer__caption');
    var viewerTitle = viewer.querySelector('.viewer__title');

    var el = function (tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    };
    var media = function (fig) {
      var img = fig.querySelector('img');
      if (img) {
        var m = new Image();
        m.src = img.getAttribute('src');
        m.alt = img.alt;
        m.width = img.width; m.height = img.height;
        m.loading = 'lazy';
        return m;
      }
      // Los ids del esquema (marcadores de las flechas) no pueden repetirse en el documento: si no, al ocultar
      // la copia de la galería desaparecen las flechas del original.
      var copy = fig.querySelector('.diagram').cloneNode(true);
      copy.querySelectorAll('[id]').forEach(function (n) {
        var id = n.id;
        n.id = id + '-copy';
        copy.querySelectorAll('[marker-end*="#' + id + ')"]').forEach(function (u) {
          u.setAttribute('marker-end', 'url(#' + id + '-copy)');
        });
      });
      return copy;
    };

    var build = function () {
      built = true;
      var figs = document.querySelectorAll('main figure[data-gtitle]');
      var lastLabel = '';
      figs.forEach(function (fig, i) {
        if (!fig.id) fig.id = 'fig-' + (i + 1);
        var section = fig.closest('.section');
        var label = T.start;
        if (section) {
          var a = document.querySelector('.toc__link[href="#' + section.id + '"]');
          if (a) label = a.querySelector('.toc__num').textContent + ' · ' + a.querySelector('.toc__label').textContent;
        }
        if (label !== lastLabel) { list.appendChild(el('h2', 'drawer__group', label)); lastLabel = label; }
        var whenEl = fig.querySelector('.image-pair__when');
        var capEl = fig.querySelector('figcaption');
        var caption = fig.dataset.gcaption || (capEl ? Array.prototype.filter.call(capEl.childNodes, function (n) { return n !== whenEl; })
          .map(function (n) { return n.textContent; }).join('').replace(/\s+/g, ' ').trim() : '');

        // Si el pie empieza repitiendo el título ("El nuevo circuito: una sola entrada…"), se quita la repetición.
        var prefix = fig.dataset.gtitle.toLowerCase() + ': ';
        if (caption.toLowerCase().indexOf(prefix) === 0) {
          caption = caption.slice(prefix.length);
          caption = caption.charAt(0).toUpperCase() + caption.slice(1);
        }
        var item = el('article', 'drawer__item');
        var thumb = el('button', 'drawer__thumb');
        thumb.type = 'button';
        thumb.setAttribute('popovertarget', 'viewer');
        thumb.setAttribute('aria-label', T.enlarge + fig.dataset.gtitle);
        thumb.appendChild(media(fig));
        thumb.addEventListener('click', function () {
          stage.classList.remove('is-zoomed');
          stage.replaceChildren(media(fig));
          viewerTitle.textContent = fig.dataset.gtitle;
          viewerCaption.textContent = caption;
        });
        var meta = el('div', 'drawer__meta');
        if (whenEl) {
          meta.appendChild(el('span', 'drawer__when' + (whenEl.classList.contains('image-pair__when--after') ? ' drawer__when--after' : ''), whenEl.textContent.trim()));
        }
        meta.appendChild(el('h3', 'drawer__name', fig.dataset.gtitle));
        meta.appendChild(el('p', 'drawer__caption', caption));
        var go = el('a', 'drawer__goto', T.goto);
        go.href = '#' + fig.id;
        go.addEventListener('click', function () {
          drawer.hidePopover();
          setTimeout(function () {
            fig.classList.add('fig-flash');
            setTimeout(function () { fig.classList.remove('fig-flash'); }, 1800);
          }, reduce ? 0 : 600);
        });
        item.appendChild(thumb);
        meta.appendChild(go);
        item.appendChild(meta);
        list.appendChild(item);
        items.push({ fig: fig, node: item });
      });
      drawer.querySelector('.drawer__count').textContent = '· ' + items.length;
    };

    stage.addEventListener('click', function (e) {
      if (e.target.tagName === 'IMG') stage.classList.toggle('is-zoomed');
    });

    drawer.addEventListener('toggle', function (e) {
      if (e.newState !== 'open') return;
      if (!built) build();
      // Abre la lista en la figura más cercana a lo que se estaba leyendo.
      var start = items.length - 1;
      for (var k = 0; k < items.length; k++) {
        if (items[k].fig.getBoundingClientRect().bottom > window.innerHeight * 0.4) { start = k; break; }
      }
      var node = items[start].node;
      list.scrollTop = Math.max(0, node.offsetTop - list.offsetTop - 64);
    });
  }

  // Enlace directo a la galería (por ejemplo, desde la página de prueba): k-rooms.html#galeria
  if (location.hash === '#galeria' && drawer && drawer.showPopover) {
    setTimeout(function () { drawer.showPopover(); }, 400);
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
