(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Volver: si llegas desde otra página de la web (portada o caso), retrocede en el historial y te deja donde estabas;
  // si llegas de fuera o cambiaste de idioma, sigue el enlace.
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

  // La foto de la cabecera viaja a la barra superior mientras haces scroll, y vuelve a su sitio al subir.
  // Una copia fija recorre el camino entre la foto y el hueco de la barra según el scroll; en reposo se ven los originales.
  var photo = document.querySelector('.cv__photo');
  var slot = document.querySelector('.cv-toolbar__avatar');
  var label = document.querySelector('.cv-toolbar__label');
  if (!photo || !slot) return;

  root.classList.add('cv-anim');
  var fly = photo.cloneNode();
  fly.className = 'cv-fly';
  fly.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fly);

  var start, end, dist, state = '';
  var measure = function () {
    var was = root.dataset.cvPhoto;
    root.dataset.cvPhoto = 'start';          // medir con la foto en su sitio
    var p = photo.getBoundingClientRect();
    var t = slot.getBoundingClientRect();
    start = { x: p.left, y: p.top + window.scrollY, size: p.width };
    end = { x: t.left, y: t.top, size: t.width };
    // Scroll necesario para que la foto llegue a la altura del hueco de la barra
    dist = Math.max(1, start.y - end.y);
    fly.style.width = fly.style.height = start.size + 'px';
    root.dataset.cvPhoto = was || 'start';
  };
  var ease = function (k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };

  var render = function () {
    var k = Math.min(1, Math.max(0, window.scrollY / dist));
    var next = k <= 0 ? 'start' : k >= 1 ? 'end' : (reduce ? (k < 0.5 ? 'start' : 'end') : 'flying');
    if (next !== state) { root.dataset.cvPhoto = next; state = next; }
    if (label) label.style.opacity = reduce ? (next === 'end' ? 1 : 0) : Math.max(0, (k - 0.6) / 0.4);
    if (next !== 'flying') return;
    var e = ease(k);
    var fromY = start.y - window.scrollY;     // dónde estaría la foto ahora mismo, siguiendo la página
    var x = start.x + (end.x - start.x) * e;
    var y = fromY + (end.y - fromY) * k;      // en vertical sigue el scroll y llega justo al final
    var s = (start.size + (end.size - start.size) * e) / start.size;
    fly.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  };

  var ticking = false;
  var onScroll = function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; render(); });
  };
  var refresh = function () { measure(); render(); };

  refresh();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', refresh);
  window.addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
})();
