/* Medición del portfolio (GoatCounter): sin cookies y sin datos personales.
 *
 * CODE es el nombre de la cuenta en goatcounter.com (https://CODE.goatcounter.com); si se deja vacío, queda inactiva.
 * Respeta «No rastrear» (DNT) y Global Privacy Control, y no cuenta visitas desde localhost.
 *
 * Qué se mide (cada evento es un nombre; GoatCounter los cuenta en su apartado de eventos):
 *   card-open/<proyecto>        pulsar una tarjeta de proyecto (abre el resumen)
 *   summary-seen/<proyecto>/<n> al cerrar el resumen, cuántas piezas llegó a ver
 *   summary-cta/<proyecto>      «Ver todo el case study» desde el resumen
 *   summary-goto/<proyecto>     «Ir al texto →» desde el resumen
 *   gallery-open/<pieza>        ampliar una pieza de la retícula Gallery
 *   case-summary-open           abrir el resumen desde el botón de la página del caso
 *   depth/<página>/<25|50|75|100>  hasta dónde se lee el caso o el CV
 *   cv-open · cv-download · book-meeting · mail-click · mail-copy · linkedin-click · profile-open · lang-switch
 */
(function () {
  var CODE = 'dcb';   // cuenta de GoatCounter: https://dcb.goatcounter.com

  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  var debug = false;
  try { debug = localStorage.getItem('analyticsDebug') === '1'; } catch (e) {}
  if (dnt && !debug) return;

  // Carga el contador solo si hay cuenta configurada
  if (CODE) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.dataset.goatcounter = 'https://' + CODE + '.goatcounter.com/count';
    document.head.appendChild(s);
  }

  var page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
  var lang = document.documentElement.lang === 'en' ? 'en' : 'es';

  var track = function (name) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: name, title: name + ' (' + lang + ')', event: true });
    } else if (debug) {
      console.info('[analytics]', name, lang);
    }
  };
  var slug = function (t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  // Clics: se resuelven por delegación, sin tocar el marcado
  document.addEventListener('click', function (e) {
    var t = e.target;
    var drawer = document.getElementById('draft-drawer');
    var project = function () {
      var h = drawer && drawer.querySelector('.drawer__headline');
      return slug(h && h.textContent);
    };
    var el;
    if ((el = t.closest('.draft-card[data-draft]'))) return track('card-open/' + slug((el.querySelector('.project-card__name') || {}).textContent || el.dataset.draft));
    if ((el = t.closest('.gallery-tile'))) return track('gallery-open/' + slug(el.dataset.shotTitle));
    if (drawer && drawer.contains(t)) {
      if (t.closest('.drawer__cta')) return track('summary-cta/' + project());
      if (t.closest('.drawer__goto')) return track('summary-goto/' + project());
    }
    if (t.closest('.toc__summary')) return track('case-summary-open');
    if (t.closest('[data-drawer-open]')) return track('profile-open');
    if (t.closest('.about__copy')) return track('mail-copy');
    if ((el = t.closest('a[href]'))) {
      var href = el.getAttribute('href');
      if (el.hasAttribute('download') || /\.pdf$/i.test(href)) return track('cv-download');
      if (/calendly\.com/.test(href)) return track('book-meeting');
      if (/^mailto:/.test(href)) return track('mail-click');
      if (/linkedin\.com/.test(href)) return track('linkedin-click');
      if (/(^|\/)cv\.html$/.test(href) && page !== 'cv') return track('cv-open');
      if (el.closest('.lang-switch')) return track('lang-switch/' + (el.getAttribute('hreflang') || ''));
    }
  }, true);

  // Piezas del resumen que llegó a ver quien lo abre (se envía al cerrarlo)
  var drawer = document.getElementById('draft-drawer');
  if (drawer && 'IntersectionObserver' in window) {
    var io, mo, seen, total, name;
    drawer.addEventListener('toggle', function (e) {
      var list = drawer.querySelector('.drawer__list');
      if (e.newState === 'open') {
        seen = 0; total = 0;
        name = slug((drawer.querySelector('.drawer__headline') || {}).textContent);
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && !en.target.dataset.seen) { en.target.dataset.seen = '1'; seen++; }
          });
        }, { root: list, threshold: 0.5 });
        var watch = function () {
          var items = list.querySelectorAll('.drawer__item');
          total = Math.max(total, items.length);   // el panel vacía la lista al cerrarse: se conserva el máximo
          items.forEach(function (i) { if (!i.dataset.watched) { i.dataset.watched = '1'; io.observe(i); } });
        };
        watch();
        mo = new MutationObserver(watch);
        mo.observe(list, { childList: true });
      } else if (io) {
        io.disconnect(); mo.disconnect();
        if (total) track('summary-seen/' + name + '/' + seen);
        io = mo = null;
      }
    });
  }

  // Hasta dónde se lee el caso o el CV
  if (page !== 'index') {
    var marks = [25, 50, 75, 100];
    var sent = {};
    var ticking = false;
    var check = function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var pct = Math.min(100, Math.round((window.scrollY / max) * 100));
      marks.forEach(function (m) {
        if (pct >= m - (m === 100 ? 2 : 0) && !sent[m]) { sent[m] = true; track('depth/' + page + '/' + m); }
      });
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    }, { passive: true });
  }
})();
