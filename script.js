(function () {
  var root = document.documentElement;
  // Textos que genera el script, según el idioma de la página
  var STRINGS = {
    es: { sections: 'Secciones', sectionsNow: 'Secciones. Ahora: ', start: 'Inicio', summary: 'Resumen', enlarge: 'Ampliar: ', goto: 'Ir al texto →', close: 'Cerrar', cvFull: 'Ver CV completo', copied: 'Copiado', copyEmail: 'Copiar email' },
    en: { sections: 'Sections', sectionsNow: 'Sections. Now: ', start: 'Start', summary: 'Summary', enlarge: 'Enlarge: ', goto: 'Go to the text →', close: 'Close', cvFull: 'View full CV', copied: 'Copied', copyEmail: 'Copy email' }
  };
  var T = STRINGS[(root.lang || 'es').slice(0, 2)] || STRINGS.es;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Posición de scroll: al volver con el historial se restaura exactamente donde estabas
  // (el navegador a veces la restaura unos píxeles más allá, sobre todo si saliste desde un panel abierto).
  var navEntry = performance.getEntriesByType('navigation')[0];
  var cameBack = !!navEntry && navEntry.type === 'back_forward';
  var scrollKey = 'scroll:' + location.pathname;
  window.addEventListener('pagehide', function () {
    try { sessionStorage.setItem(scrollKey, String(window.scrollY)); } catch (err) {}
  });
  if (cameBack) {
    var savedY = null;
    try { savedY = sessionStorage.getItem(scrollKey); } catch (err) {}
    if (savedY !== null && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
      var restoreY = function () { window.scrollTo({ top: +savedY, behavior: 'instant' }); };
      restoreY();
      window.addEventListener('load', restoreY);
    }
  }

  // Flecha de volver: si llegas desde otra página de la web, retrocede en el historial para dejarte donde estabas
  // (con el scroll intacto). Si cambiaste de idioma en la misma página, o llegas de fuera, sigue su enlace.
  var back = document.querySelector('.site-header__back');
  if (back && history.length > 1 && document.referrer) {
    try {
      var ref = new URL(document.referrer);
      var page = function (u) { return u.pathname.split('/').pop() || 'index.html'; };
      if (ref.origin === location.origin && page(ref) !== page(location)) {
        back.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          history.back();
        });
      }
    } catch (err) {}
  }

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

  // Galería de figuras: la usan el botón de galería del caso y el resumen de K Rooms en la portada,
  // que la lee directamente de k-rooms.html para tener una sola fuente.
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };
  // Copiar al portapapeles con confirmación: el icono pasa a un check verde con aviso, y se anuncia a lectores de pantalla.
  // host: dónde crear el campo temporal de la alternativa (dentro de un diálogo modal tiene que ser el propio diálogo).
  var bindCopy = function (btn, text, live, host) {
    var timer;
    var done = function () {
      btn.classList.add('is-done');
      if (live) live.textContent = live.dataset.done || T.copied;
      clearTimeout(timer);
      timer = setTimeout(function () {
        btn.classList.remove('is-done');
        if (live) live.textContent = '';
      }, 2000);
    };
    var legacy = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      (host || document.body).appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) {}
      ta.remove();
      btn.focus({ preventScroll: true });
      if (ok) done();
    };
    btn.addEventListener('click', function () {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, legacy);
      else legacy();
    });
  };
  document.querySelectorAll('.about__copy[data-copy]').forEach(function (btn) {
    bindCopy(btn, btn.dataset.copy, btn.parentNode.querySelector('.about__sr'));
  });
  var media = function (fig, base) {
    var img = fig.querySelector('img');
    if (img) {
      var m = new Image();
      m.src = base ? new URL(img.getAttribute('src'), base).href : img.getAttribute('src');
      m.alt = img.alt;
      m.width = img.width; m.height = img.height;
      m.loading = 'lazy';
      m.decoding = 'async';
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
  // Lee las figuras de la galería del caso (K Rooms): título, pie y grupo por sección.
  var readCaseFigures = function (doc, opts) {
    var out = [];
    doc.querySelectorAll('main figure[data-gtitle]').forEach(function (fig, i) {
      if (!fig.id) fig.id = 'fig-' + (i + 1);
      // El resumen omite las piezas de detalle (data-gskip); la galería del caso las muestra todas
      if (opts && opts.summary && fig.hasAttribute('data-gskip')) return;
      var section = fig.closest('.section');
      var label = T.start;
      if (section) {
        var a = doc.querySelector('.toc__link[href="#' + section.id + '"]');
        if (a) label = a.querySelector('.toc__num').textContent + ' · ' + a.querySelector('.toc__label').textContent;
      }
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
      out.push({ fig: fig, id: fig.id, label: label, title: fig.dataset.gtitle, caption: caption, whenEl: whenEl });
    });
    return out;
  };
  // Lee las figuras del caso de investigación de Pujobaixo: sin título propio, el grupo es el apartado.
  var readResearchFigures = function (doc) {
    var out = [];
    doc.querySelectorAll('main figure').forEach(function (fig) {
      var section = fig.closest('section');
      var h = section && section.querySelector('h2');
      var raw = h ? h.textContent.replace(/\s+/g, ' ').trim() : T.start;
      var m = raw.match(/^(\d+)\s+(.*)$/);
      var cap = fig.querySelector('figcaption');
      out.push({ fig: fig, id: section ? section.id : '', label: m ? m[1] + ' · ' + m[2] : raw, title: '',
        caption: cap ? cap.textContent.replace(/\s+/g, ' ').trim() : '', whenEl: null });
    });
    return out;
  };
  // Minutos del resumen según cómo se consume de verdad: se lee entre el 20 y el 28 % de las palabras de una página
  // (Nielsen Norman Group), así que se estima el tiempo de escanear el 28 % a 220 palabras por minuto, redondeado al alza.
  // El caso completo, en cambio, se cuenta como lectura entera. «Ir al texto →» no cuenta.
  var scanMinutes = function (root) {
    var copy = root.cloneNode(true);
    copy.querySelectorAll('.drawer__goto').forEach(function (n) { n.remove(); });
    var count = copy.textContent.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(count * 0.28 / 220));
  };
  // Construye la lista (grupos por sección, miniatura, título y pie) a partir de las figuras de `doc`.
  // opts.read(doc): lector de figuras; opts.base: URL del documento si es de otra web;
  // opts.href(item): destino de «Ir al texto»; opts.onOpen(entry): al ampliar; opts.onGoto(fig): al ir al texto.
  var buildGallery = function (doc, list, opts) {
    var entries = [];
    var lastLabel = '';
    (opts.read || readCaseFigures)(doc, opts).forEach(function (it) {
      var fig = it.fig;
      if (it.label !== lastLabel) { list.appendChild(el('h2', 'drawer__group', it.label)); lastLabel = it.label; }
      var name = it.title || it.label.replace(/^\d+\s·\s/, '');
      var item = el('article', 'drawer__item');
      var thumb = el('button', 'drawer__thumb');
      thumb.type = 'button';
      thumb.setAttribute('popovertarget', 'viewer');
      thumb.setAttribute('aria-label', T.enlarge + name);
      thumb.appendChild(media(fig, opts.base));
      var entry = { fig: fig, node: item, el: thumb, title: name, caption: it.caption, make: function () { return media(fig, opts.base); } };
      thumb.addEventListener('click', function () { opts.onOpen(entry); });
      var meta = el('div', 'drawer__meta');
      if (it.whenEl) {
        meta.appendChild(el('span', 'drawer__when' + (it.whenEl.classList.contains('image-pair__when--after') ? ' drawer__when--after' : ''), it.whenEl.textContent.trim()));
      }
      if (it.title) meta.appendChild(el('h3', 'drawer__name', it.title));
      meta.appendChild(el('p', 'drawer__caption', it.caption));
      var go = el('a', 'drawer__goto', T.goto);
      go.href = opts.href(it);
      if (opts.newTab) { go.target = '_blank'; go.rel = 'noopener'; }
      if (opts.onGoto) go.addEventListener('click', function () { opts.onGoto(fig); });
      item.appendChild(thumb);
      meta.appendChild(go);
      item.appendChild(meta);
      list.appendChild(item);
      entries.push(entry);
    });
    return entries;
  };

  var viewer = document.getElementById('viewer');

  // Enlace directo al resumen: k-rooms.html#resumen (#galeria se mantiene como alias, lo usaba la página de prueba)
  var summaryHash = location.hash === '#resumen' || location.hash === '#galeria';
  var caseSummary = document.getElementById('summary');
  if (summaryHash && caseSummary && caseSummary.showPopover) {
    setTimeout(function () { caseSummary.showPopover(); }, 400);
  }

  // Enlace a un punto del caso (por ejemplo, «Ir al texto →» desde el resumen de la portada): te lleva hasta ahí
  // y resalta la figura. Se corrige una vez cargada la página por si el diseño se mueve, salvo que ya hayas hecho scroll.
  var anchorTarget = null;
  if (!cameBack && location.hash.length > 1 && !summaryHash) {
    try { anchorTarget = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (err) {}
  }
  if (anchorTarget) {
    var userScrolled = false;
    var markScrolled = function () { userScrolled = true; };
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, markScrolled, { once: true, passive: true }); });
    var goToAnchor = function () { anchorTarget.scrollIntoView({ block: 'start', behavior: 'instant' }); };
    goToAnchor();
    window.addEventListener('load', function () {
      if (!userScrolled) goToAnchor();
      if (anchorTarget.matches('figure')) {
        setTimeout(function () {
          anchorTarget.classList.add('fig-flash');
          setTimeout(function () { anchorTarget.classList.remove('fig-flash'); }, 1800);
        }, 250);
      }
    });
  }

  // Visor compartido (portada y caso): sirve a la retícula Gallery, al resumen de cada proyecto y al resumen del caso.
  // Con las flechas del teclado se pasa a la anterior o la siguiente del mismo grupo.
  var homeViewer = viewer;
  var shots = Array.prototype.slice.call(document.querySelectorAll('.gallery-tile'));
  var draftDrawer = document.getElementById('draft-drawer');
  if (homeViewer) {
    var homeStage = homeViewer.querySelector('.viewer__stage');
    var group = [];
    var at = 0;
    var showItem = function (i) {
      at = (i + group.length) % group.length;
      var it = group[at];
      homeStage.classList.remove('is-zoomed');
      homeStage.replaceChildren(it.make());
      homeViewer.querySelector('.viewer__title').textContent = it.title;
      homeViewer.querySelector('.viewer__caption').textContent = it.caption;
    };
    // Entrada del visor a partir de una miniatura con imagen
    var imgEntry = function (node, title, caption) {
      var src = node.querySelector('img');
      return { el: node, title: title, caption: caption, make: function () {
        var m = new Image();
        m.src = src.getAttribute('data-full') || src.getAttribute('src');
        m.alt = title;
        m.width = +src.dataset.w || src.width; m.height = +src.dataset.h || src.height;
        return m;
      } };
    };
    shots.forEach(function (card, i) {
      card.addEventListener('click', function () {
        group = shots.map(function (c) { return imgEntry(c, c.dataset.shotTitle, c.dataset.shotCaption); });
        showItem(i);
      });
    });
    homeStage.addEventListener('click', function (e) {
      if (e.target.tagName === 'IMG') homeStage.classList.toggle('is-zoomed');
    });
    document.addEventListener('keydown', function (e) {
      if (!homeViewer.matches(':popover-open') || !group.length) return;
      if (e.key === 'ArrowRight') showItem(at + 1);
      if (e.key === 'ArrowLeft') showItem(at - 1);
    });
    homeViewer.addEventListener('toggle', function (e) {
      if (e.newState === 'closed' && group[at]) group[at].el.focus({ preventScroll: true });
    });

    // Resumen del caso (página de K Rooms): el mismo contenido y la misma construcción que el resumen de la portada,
    // pero sin «Ver todo el case study» (ya estás en el caso). Se construye al abrirlo por primera vez.
    if (caseSummary && caseSummary.showPopover) {
      var sList = caseSummary.querySelector('.drawer__list');
      var sEyebrow = caseSummary.querySelector('.drawer__eyebrow');
      var sBuilt = false;
      caseSummary.addEventListener('toggle', function (e) {
        if (e.newState !== 'open' || sBuilt) return;
        sBuilt = true;
        var frag = document.createDocumentFragment();
        var lead = document.getElementById('resumen');
        if (lead && lead.content) frag.appendChild(lead.content.cloneNode(true));
        var entries = buildGallery(document, frag, {
          summary: true,
          href: function (it) { return '#' + it.id; },
          onOpen: function (en) { group = entries; showItem(entries.indexOf(en)); },
          onGoto: function (fig) {
            caseSummary.hidePopover();
            setTimeout(function () {
              fig.classList.add('fig-flash');
              setTimeout(function () { fig.classList.remove('fig-flash'); }, 1800);
            }, reduce ? 0 : 600);
          }
        });
        sList.appendChild(frag);
        sEyebrow.textContent = T.summary + ' · ' + scanMinutes(sList) + ' min';
      });
    }

    // Drafts: cada tarjeta abre su resumen (plantilla) en el panel lateral.
    if (draftDrawer) {
      var dList = draftDrawer.querySelector('.drawer__list');
      var dTitle = draftDrawer.querySelector('.drawer__headline');
      var dEyebrow = draftDrawer.querySelector('.drawer__eyebrow');
      var lastCard = null;
      var galleryDoc = {};
      // El resumen de K Rooms es su galería: se lee de k-rooms.html, una sola fuente.
      var loadGallery = function (url) {
        if (!galleryDoc[url]) {
          galleryDoc[url] = fetch(url).then(function (r) {
            if (!r.ok) throw new Error(r.status);
            return r.text();
          }).then(function (html) { return new DOMParser().parseFromString(html, 'text/html'); });
          galleryDoc[url].catch(function () { delete galleryDoc[url]; });
        }
        return galleryDoc[url];
      };
      document.querySelectorAll('.draft-card').forEach(function (card) {
        var tpl = document.getElementById('draft-' + card.dataset.draft);
        var url = tpl && tpl.dataset.gallery;
        if (url) {
          card.addEventListener('pointerenter', function () { loadGallery(url).catch(function () {}); }, { once: true });
          card.addEventListener('focus', function () { loadGallery(url).catch(function () {}); }, { once: true });
        }
        card.addEventListener('click', function (e) {
          // Con ctrl, cmd o botón central, el enlace sigue su camino
          if (card.tagName === 'A' && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return;
          if (!tpl) return;
          lastCard = card;
          dTitle.textContent = tpl.dataset.name;
          dEyebrow.textContent = T.summary;
          var frag = tpl.content.cloneNode(true);
          // «Ver todo el case study» queda fijo en la base del panel, fuera de la lista que se desplaza
          var cta = frag.querySelector('[data-foot]');
          draftDrawer.querySelectorAll('.drawer__foot').forEach(function (n) { n.remove(); });
          if (cta) {
            var foot = el('div', 'drawer__foot');
            foot.appendChild(cta);
            draftDrawer.appendChild(foot);
          }
          dList.replaceChildren(frag);
          dList.scrollTop = 0;
          // El panel se abre aquí, antes de rellenarlo: con la lectura ya precargada, el relleno ocurría antes de que
          // el botón lo abriera y el resumen quedaba vacío.
          e.preventDefault();
          if (!draftDrawer.matches(':popover-open')) draftDrawer.showPopover();
          if (!url) return;
          loadGallery(url).then(function (doc) {
            if (lastCard !== card || !draftDrawer.matches(':popover-open')) return;
            var frag = document.createDocumentFragment();
            var remote = /^https?:/.test(url);
            // Texto del resumen (si el caso lo trae): metadatos, qué es, escala, problema, rol, decisiones y resultado
            var lead = doc.getElementById('resumen');
            if (lead && lead.content) frag.appendChild(lead.content.cloneNode(true));
            var entries = buildGallery(doc, frag, {
              summary: true,
              read: tpl.dataset.reader === 'research' ? readResearchFigures : null,
              base: remote ? url : null,
              newTab: remote,
              href: function (it) { return url + '#' + it.id; },
              onOpen: function (en) { group = entries; showItem(entries.indexOf(en)); }
            });
            dList.appendChild(frag);
            dEyebrow.textContent = T.summary + ' · ' + scanMinutes(dList) + ' min';
            // Minutos del caso completo, calculados del propio caso (el número de la plantilla es solo el valor inicial)
            var ctaTime = draftDrawer.querySelector('.drawer__cta-time');
            var mainEl = !remote && doc.querySelector('main');
            if (ctaTime && mainEl) {
              var full = mainEl.cloneNode(true);
              full.querySelectorAll('script,style,svg').forEach(function (n) { n.remove(); });
              var caseMin = Math.max(1, Math.round(full.textContent.trim().split(/\s+/).filter(Boolean).length / 220));
              ctaTime.textContent = ctaTime.textContent.replace(/\d+/, caseMin);
            }
          }).catch(function () {});
        });
      });
      // Al salir hacia el caso, el panel se cierra antes: la portada queda en su estado normal (sin el bloqueo de scroll)
      // y al volver con la flecha aparece exactamente donde estabas.
      var closeBeforeLeaving = function (e) {
        var a = e.target.closest('a[href]');
        if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (draftDrawer.matches(':popover-open')) draftDrawer.hidePopover();
      };
      draftDrawer.addEventListener('click', closeBeforeLeaving);
      dList.addEventListener('click', function (e) {
        var thumb = e.target.closest('.drawer__thumb');
        if (!thumb || !thumb.dataset.title) return;
        var thumbs = Array.prototype.slice.call(dList.querySelectorAll('.drawer__thumb[data-title]'));
        group = thumbs.map(function (t) { return imgEntry(t, t.dataset.title, t.dataset.caption); });
        showItem(thumbs.indexOf(thumb));
      });
      draftDrawer.addEventListener('toggle', function (e) {
        if (e.newState !== 'closed') return;
        dList.replaceChildren();
        draftDrawer.querySelectorAll('.drawer__foot').forEach(function (n) { n.remove(); });
        if (lastCard) lastCard.focus({ preventScroll: true });
      });
    }
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

    var aboutDrawer = el('dialog', 'about');
    aboutDrawer.setAttribute('aria-labelledby', 'about-title');
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
    aboutDrawer.appendChild(panel);
    document.body.appendChild(aboutDrawer);

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
          bindCopy(copy, mail.textContent, live, aboutDrawer);
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
      aboutDrawer.showModal();
      aboutDrawer.scrollTop = 0;
      requestAnimationFrame(function () { aboutDrawer.classList.add('is-open'); });
      loadCv().then(fill).catch(function () {
        closeDrawer(true);
        window.location.href = cvUrl;
      });
    }
    function closeDrawer(now) {
      if (!aboutDrawer.open) return;
      aboutDrawer.classList.remove('is-open');
      var done = function () {
        aboutDrawer.close();
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
    aboutDrawer.addEventListener('cancel', function (e) { e.preventDefault(); closeDrawer(); });
    // Clic en el fondo oscuro (fuera del panel) cierra
    aboutDrawer.addEventListener('click', function (e) { if (e.target === aboutDrawer) closeDrawer(); });
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
