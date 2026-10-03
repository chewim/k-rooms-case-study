(function () {
  var root = document.documentElement;
  // Textos que genera el script, según el idioma de la página
  var STRINGS = {
    es: { sections: 'Secciones', sectionsNow: 'Secciones. Ahora: ', start: 'Inicio', enlarge: 'Ampliar: ', goto: 'Ir al texto →', close: 'Cerrar', cvFull: 'Ver CV completo', copied: 'Copiado', copyEmail: 'Copiar email' },
    en: { sections: 'Sections', sectionsNow: 'Sections. Now: ', start: 'Start', enlarge: 'Enlarge: ', goto: 'Go to the text →', close: 'Close', cvFull: 'View full CV', copied: 'Copied', copyEmail: 'Copy email' }
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

  // Fila de proyectos: el fundido de los bordes solo aparece donde quedan tarjetas por ver.
  document.querySelectorAll('.project-list').forEach(function (list) {
    var edges = function () {
      var max = list.scrollWidth - list.clientWidth;
      list.classList.toggle('is-scrolled', list.scrollLeft > 4);
      list.classList.toggle('is-at-end', max <= 4 || list.scrollLeft >= max - 4);
    };
    list.addEventListener('scroll', edges, { passive: true });
    window.addEventListener('resize', edges);
    edges();
  });

  // Drawer «sobre mí»: al pulsar foto, nombre o estado se abre desde la izquierda
  // con el perfil y la experiencia, leídos del propio CV para no duplicar contenido.
  var trigger = document.querySelector('[data-drawer-open]');
  if (trigger && window.HTMLDialogElement && window.fetch) {
    var cvUrl = trigger.getAttribute('href');
    var cvDoc = null;
    function loadCv() {
      if (!cvDoc) {
        cvDoc = fetch(cvUrl).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.text();
        }).then(function (html) {
          return new DOMParser().parseFromString(html, 'text/html');
        });
        cvDoc.catch(function () { cvDoc = null; });
      }
      return cvDoc;
    }

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    }

    var drawer = el('dialog', 'about');
    drawer.setAttribute('aria-labelledby', 'about-title');
    var panel = el('div', 'about__panel');
    var close = el('button', 'about__close');
    close.type = 'button';
    close.setAttribute('aria-label', T.close);
    close.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var head = el('header', 'about__head');
    var avatar = trigger.querySelector('img');
    if (avatar) {
      var a = avatar.cloneNode();
      a.className = 'about__avatar';
      head.appendChild(a);
    }
    var who = el('div', 'about__who');
    var title = el('h2', 'about__name', 'David Chia');
    title.id = 'about-title';
    who.appendChild(title);
    var role = el('p', 'about__role');
    who.appendChild(role);
    var status = trigger.querySelector('.status');
    if (status) who.appendChild(status.cloneNode(true));
    head.appendChild(who);
    var body = el('div', 'about__body');
    panel.appendChild(close);
    panel.appendChild(head);
    panel.appendChild(body);
    drawer.appendChild(panel);
    document.body.appendChild(drawer);

    var filled = false;
    function fill(doc) {
      if (filled) return;
      filled = true;
      var r = doc.querySelector('.cv__role');
      if (r) role.textContent = r.textContent;
      // Contacto primero: email con copia rápida y LinkedIn
      var contact = doc.querySelector('.cv__contact');
      if (contact) {
        var box = el('div', 'about__contact');
        var mail = contact.querySelector('a[href^="mailto:"]');
        if (mail) {
          var mrow = el('div', 'about__row');
          mrow.insertAdjacentHTML('beforeend', '<svg class="about__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>');
          var maddr = el('a', 'about__value', mail.textContent);
          maddr.href = mail.getAttribute('href');
          mrow.appendChild(maddr);
          var copy = el('button', 'about__copy');
          copy.type = 'button';
          copy.setAttribute('aria-label', T.copyEmail);
          copy.title = T.copyEmail;
          copy.innerHTML = '<svg class="about__copy-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>' +
            '<svg class="about__copy-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' +
            '<span class="about__copy-tip" aria-hidden="true">' + T.copied + '</span>';
          var live = el('span', 'about__sr');
          live.setAttribute('aria-live', 'polite');
          var resetCopy;
          copy.addEventListener('click', function () {
            var done = function () {
              copy.classList.add('is-done');
              live.textContent = T.copied;
              clearTimeout(resetCopy);
              resetCopy = setTimeout(function () {
                copy.classList.remove('is-done');
                live.textContent = '';
              }, 2000);
            };
            // Alternativa sin API de portapapeles: copiar desde un campo temporal
            var legacy = function () {
              var ta = el('textarea');
              ta.value = mail.textContent;
              ta.setAttribute('readonly', '');
              ta.style.position = 'fixed';
              ta.style.opacity = '0';
              drawer.appendChild(ta);
              ta.select();
              var ok = false;
              try { ok = document.execCommand('copy'); } catch (err) {}
              ta.remove();
              copy.focus({ preventScroll: true });
              if (ok) done();
            };
            if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(mail.textContent).then(done, legacy);
            else legacy();
          });
          mrow.appendChild(copy);
          mrow.appendChild(live);
          box.appendChild(mrow);
        }
        var li = contact.querySelector('a[href*="linkedin.com"]');
        if (li) {
          var lrow = el('a', 'about__row about__row--link');
          lrow.href = li.getAttribute('href');
          lrow.target = '_blank';
          lrow.rel = 'noopener';
          lrow.insertAdjacentHTML('beforeend', '<svg class="about__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v5M8 8v.01M12 16v-5M16 16v-3a2 2 0 0 0-4 0"/></svg>');
          lrow.appendChild(el('span', 'about__value', 'LinkedIn'));
          lrow.insertAdjacentHTML('beforeend', '<svg class="about__ext" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>');
          box.appendChild(lrow);
        }
        body.appendChild(box);
      }

      // Pre-info: el perfil siempre visible, con la ubicación
      var intro = doc.querySelector('.cv__section[data-drawer="intro"]');
      if (intro) {
        var pre = el('div', 'about__intro');
        var where = contact && contact.querySelector('span');
        if (where) pre.appendChild(el('p', 'about__where', where.textContent));
        var itext = intro.querySelector('.cv__text');
        if (itext) pre.appendChild(el('p', 'about__text', itext.textContent));
        // Justo debajo de la descripción: ir a la página completa del CV
        var full = el('a', 'btn about__btn', T.cvFull);
        full.href = cvUrl;
        full.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>');
        pre.appendChild(full);
        body.appendChild(pre);
      }
    }

    function openDrawer() {
      root.classList.add('about-locked');
      drawer.showModal();
      drawer.scrollTop = 0;
      requestAnimationFrame(function () { drawer.classList.add('is-open'); });
      loadCv().then(fill).catch(function () {
        closeDrawer(true);
        window.location.href = cvUrl;
      });
    }
    function closeDrawer(now) {
      if (!drawer.open) return;
      drawer.classList.remove('is-open');
      var done = function () {
        drawer.close();
        root.classList.remove('about-locked');
        trigger.focus({ preventScroll: true });
      };
      if (reduce || now === true) done(); else setTimeout(done, 280);
    }

    trigger.addEventListener('pointerenter', loadCv, { once: true });
    trigger.addEventListener('focus', loadCv, { once: true });
    trigger.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      openDrawer();
    });
    close.addEventListener('click', closeDrawer);
    drawer.addEventListener('cancel', function (e) { e.preventDefault(); closeDrawer(); });
    // Clic en el fondo oscuro (fuera del panel) cierra
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeDrawer(); });
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
