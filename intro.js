/* Intro de la portada (~6 s).
 *
 * 1. El nombre aparece centrado en gris claro y se llena de tinta de abajo arriba, como una batería que se carga;
 *    se sostiene un momento y se retira.
 * 2. En su lugar se forma una pila de piezas reales, todas del mismo tamaño y sin pies (es decorativa),
 *    que se posan una sobre otra de forma irregular con un ritmo regular:
 *    Smartvel → Hablar → Shortcat → Crowd predict → Cuantofaltapapatum → Madres → Cappy → K Rooms.
 * 3. K Rooms, el producto construido, llega con más aire y vuela a su card; el resto se retira y aparece la portada.
 *
 * La decisión de reproducirla se toma en un script del <head> (clase html.intro-on) para que la portada no asome.
 * Solo transform y opacity. Se salta con clic, Esc/Espacio/flechas o scroll (salta directamente al vuelo final).
 */
(function () {
  var root = document.documentElement;
  var intro = document.querySelector('.intro');
  if (!intro) return;
  var abort = function () { intro.remove(); root.classList.remove('intro-on'); };
  clearTimeout(window.__introSafety);
  // En una pestaña abierta en segundo plano no se ve: portada directa (y la intro queda pendiente para otra visita)
  if (!root.classList.contains('intro-on') || !intro.animate || document.visibilityState === 'hidden') { abort(); return; }

  var $ = function (s) { return intro.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(intro.querySelectorAll(s)); };
  var mobile = window.matchMedia('(max-width: 699px)').matches;

  var OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';     // entradas: rápidas al principio, se posan suaves
  var INOUT = 'cubic-bezier(0.76, 0, 0.24, 1)';  // vuelos: arrancan y frenan con la misma suavidad

  var anims = [];
  var play = function (el, frames, dur, at, easing, fill) {
    var a = el.animate(frames, { duration: dur, delay: at, easing: easing || OUT, fill: fill || 'both' });
    anims.push(a);
    return a;
  };
  // Textos que se relevan en la misma ranura: el saliente sube, el entrante llega desde abajo
  var relay = function (items, times) {
    items.forEach(function (el, i) {
      play(el, [{ transform: 'translateY(110%)' }, { transform: 'none' }], 600, times[i]);
      if (times[i + 1] != null) play(el, [{ transform: 'none' }, { transform: 'translateY(-110%)' }], 300, times[i + 1] - 180, INOUT, 'forwards');
    });
  };

  var pile = $('.intro__pile');
  var cards = $$('.intro__card');
  var name = $('.intro__name-line');

  // Retícula de la pila: cada pieza en una fracción del hueco libre (x, y). Alternan lados para que se superpongan
  // sin taparse del todo; K Rooms, la última, cae en el centro.
  var SPOTS = [[1, 0.1], [0, 0.35], [0.75, 1], [0.25, 0], [0.95, 0.55], [0.05, 0.85], [0.5, 0.3], [0.5, 0.5]];
  var place = function () {
    var free = { x: pile.clientWidth - cards[0].offsetWidth, y: pile.clientHeight - cards[0].offsetHeight };
    cards.forEach(function (c, i) {
      c.style.left = Math.round(SPOTS[i][0] * free.x) + 'px';
      c.style.top = Math.round(SPOTS[i][1] * free.y) + 'px';
    });
  };

  // Carga: las imágenes, a la resolución que pide el tamaño de la pieza. Si no llegan en 1,5 s, no hay intro.
  var imgs = cards.map(function (c) { return c.querySelector('img'); });
  imgs.forEach(function (img) {
    img.sizes = mobile ? '54vw' : 'min(30vw, 50vh)';
    img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
  });
  var loaded = Promise.all(imgs.map(function (img) { return img.decode().catch(function () {}); }));
  var late = new Promise(function (r) { setTimeout(function () { r('late'); }, 1500); });
  Promise.race([loaded, late]).then(function (r) { if (r === 'late') abort(); else start(); });

  // Ritmo: el nombre (0–2,2 s); siete piezas cada 380 ms; el producto construido, con más aire
  var T_NAME_OUT = 1900;
  var TIMES = [2200, 2580, 2960, 3340, 3720, 4100, 4480, 5100];
  var T_END = 6400;
  var timer, done = false;

  function start() {
    try { sessionStorage.setItem('introSeen', '1'); } catch (err) {}
    place();

    $$('.intro__meta span').forEach(function (el, i) { play(el, [{ opacity: 0 }, { opacity: 1 }], 600, 80 * i, 'linear'); });
    play(name, [{ opacity: 0 }, { opacity: 1 }], 300, 0, 'linear');
    play($('.intro__name-fill'), [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 1300, 250, 'cubic-bezier(0.45, 0, 0.25, 1)');
    play(name, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-0.15em)' }], 500, T_NAME_OUT, INOUT, 'forwards');
    play($('.intro__total'), [{ opacity: 0 }, { opacity: 1 }], 600, 300, 'linear');
    play($('.intro__skip'), [{ opacity: 0 }, { opacity: 1 }], 600, 600, 'linear');

    cards.forEach(function (c, i) {
      var slow = i >= 7;
      play(c, [{ opacity: 0 }, { opacity: 1 }], slow ? 450 : 300, TIMES[i], 'linear');
      play(c, [{ transform: 'translateY(' + (slow ? 56 : 40) + 'px)' }, { transform: 'none' }], slow ? 1100 : 850, TIMES[i]);
      play(c.querySelector('img'), [{ transform: 'scale(1.08)' }, { transform: 'none' }], 1200, TIMES[i]);
    });
    relay($$('.intro__count .intro__item'), TIMES);

    timer = setTimeout(resolve, T_END);
  }

  // Vuelo FLIP: la pieza escala hasta el hueco de su card; el radio se compensa para acabar con el de la card
  var fly = function (el, slot, at) {
    if (!slot) return null;
    var a = el.getBoundingClientRect(), b = slot.getBoundingClientRect();
    var s = b.width / a.width, r = parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 16;
    return el.animate([
      { transform: 'none', borderRadius: getComputedStyle(el).borderTopLeftRadius },
      { transform: 'translate(' + (b.left - a.left) + 'px,' + (b.top - a.top) + 'px) scale(' + s + ')', borderRadius: (r / s) + 'px', boxShadow: 'none' }
    ], { duration: 950, delay: at, easing: INOUT, fill: 'forwards' });
  };

  // Resolución: también es el destino de cualquier salto
  function resolve(skipped) {
    if (done) return;
    done = true;
    clearTimeout(timer);
    if (skipped) anims.forEach(function (a) { try { a.finish(); } catch (err) {} });

    // La portada aparece debajo, ya en su sitio
    root.classList.add('intro-played', 'intro-landing');
    root.classList.remove('intro-on');
    intro.classList.add('is-landing');   // sin .intro-on, esta clase la mantiene visible mientras dura el vuelo
    window.scrollTo({ top: 0, behavior: 'instant' });

    // K Rooms a su card; el resto de la pila se retira
    var flights = [fly(cards[7], document.querySelector('.project-list > li .project-card__media'), 0)].filter(Boolean);
    var fade = function (el, at) { el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: at || 0, easing: 'linear', fill: 'forwards' }); };
    cards.slice(0, 7).forEach(function (c) { fade(c); });
    [name, $('.intro__count'), $('.intro__skip'), $('.intro__meta')].forEach(function (el) { fade(el); });
    intro.animate([{ backgroundColor: getComputedStyle(intro).backgroundColor }, { backgroundColor: 'transparent' }], { duration: 700, delay: 150, easing: 'linear', fill: 'forwards' });

    Promise.all(flights.map(function (f) { return f.finished; })).then(finish, finish);
  }

  function finish() {
    root.classList.remove('intro-landing');
    intro.remove();
    window.removeEventListener('wheel', skip, { passive: false });
    window.removeEventListener('touchmove', skip, { passive: false });
    window.removeEventListener('keydown', onKey);
  }

  // Saltar: cualquier intento de avanzar lleva directamente a la resolución, sin mover la página que hay debajo
  function skip(e) {
    if (e.cancelable) e.preventDefault();
    if (anims.length) resolve(true);
  }
  function onKey(e) {
    if (/^(Escape|Enter| |Spacebar|ArrowDown|ArrowUp|PageDown|PageUp|Home|End)$/.test(e.key)) skip(e);
  }
  window.addEventListener('wheel', skip, { passive: false });
  window.addEventListener('touchmove', skip, { passive: false });
  window.addEventListener('keydown', onKey);
  intro.addEventListener('click', skip);
})();
