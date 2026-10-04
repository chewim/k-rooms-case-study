/* Intro de la portada (~14 s): primera sección de la página, bajo la cabecera. Se puede hacer scroll en cualquier momento.
 *
 * Un grupo pequeño de trazos se acumula en un botón; llegan más y el botón queda dentro de una card (sus trazos no se mueven:
 * la card crece alrededor); llegan más y la card queda dentro de un wireframe low-fi de página. La cámara se aleja con cada
 * paso: componente → módulo → página. Seis guías ocres marcan los bordes de cada escala. El enjambre explota en una retícula
 * y las ocho piezas entran limpias encima, con su ritmo de siempre:
 * Smartvel → Hablar → Shortcat → Crowd predict → Cuantofaltapapatum → Madres → Cappy → K Rooms.
 * La masa vuelve, se posa como contorno en los bordes de las piezas, se hunde en ellas y vuelve a salir para posarse en la
 * retícula ocre que es el fondo de toda la página. La pila se queda.
 *
 *   0,00–1,80  Exploración   ·  2,00 Botón  ·  3,40 Card  ·  4,95 Wireframe  ·  6,60 Explosión en retícula
 *   7,20–11,0  Piezas        ·  10,6 Vuelta (contorno)   ·  11,45 Unión   ·  11,85–14,2 La retícula ocre se posa
 *
 * Se reproduce en cada visita; se pausa fuera de pantalla o con la pestaña oculta; con movimiento reducido se ve el final.
 * Simulación de bandada propia (Reynolds: separación, alineación, cohesión, atracción, turbulencia, muelle hacia la
 * estructura) con paso fijo de 1/60 s y semilla fija: cada pase es idéntico. Canvas 2D; las piezas, Web Animations API.
 * También genera la textura de la página (una celda en --texture). Prototipo con sonido y parámetros ajustables:
 * prueba-murmuracion.html (local, ignorado en git).
 */
(function () {
  var root = document.documentElement;
  var intro = document.querySelector('.intro');
  if (!intro) return;
  var css = getComputedStyle(root);
  var INK = css.getPropertyValue('--color-ink').trim() || '#111111';
  var OCHRE = css.getPropertyValue('--color-accent').trim() || '#7a5f00';

  // ---------- textura: la retícula plana de la página ----------
  // La misma retícula en la que explota el enjambre: celdas cuadradas de 22 px (18 en móvil) desde el origen de la página y
  // un trazo horizontal por celda. Como fondo de la página, en ocre al 10 %, se mueve con el scroll; la sección de la intro
  // calcula sus puntos en coordenadas de página, así que encaja con ella sin costura.
  var TEX_A = 0.1, cellW = 0;
  function cellSize(w) { return w < 700 ? 18 : 22; }
  // Puntos de la retícula dentro de un rectángulo w × h situado en (ox, oy) de la página, en coordenadas del rectángulo
  function latticeSlots(w, h, ox, oy) {
    var s = cellSize(document.documentElement.clientWidth), d = [];
    for (var y = (Math.floor(oy / s) + 0.5) * s; y - oy < h; y += s) {
      for (var x = (Math.floor(ox / s) + 0.5) * s; x - ox < w; x += s) if (y - oy >= 0 && x - ox >= 0) d.push(x - ox, y - oy, 1, 0, s * 0.3, TEX_A);
    }
    return new Float32Array(d);
  }
  function texture() {
    var w = document.documentElement.clientWidth, s = cellSize(w), dpr = Math.min(devicePixelRatio || 1, 2);
    if (s === cellW) return;
    var cv = document.createElement('canvas'), c = cv.getContext('2d');
    cv.width = cv.height = Math.round(s * dpr);
    c.scale(dpr, dpr); c.strokeStyle = OCHRE; c.globalAlpha = TEX_A; c.lineCap = 'round'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(s / 2 - s * 0.15, s / 2); c.lineTo(s / 2 + s * 0.15, s / 2); c.stroke();
    root.style.setProperty('--texture', 'url(' + cv.toDataURL() + ')');
    root.style.setProperty('--texture-size', s + 'px');
    root.classList.add('has-texture');
    cellW = s;
  }
  texture();
  if (!root.classList.contains('intro-on')) return;

  var $ = function (s) { return intro.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(intro.querySelectorAll(s)); };
  var canvas = $('.intro__canvas'), ctx = canvas && canvas.getContext('2d');
  var pile = $('.intro__pile');
  var cards = $$('.intro__card');
  var header = document.querySelector('.site-header');
  // La sección ocupa la pantalla menos la cabecera
  var fit = function () { if (header) root.style.setProperty('--header-h', header.offsetHeight + 'px'); };
  fit();

  var OUT_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';    // entradas: rápidas al principio, se posan suaves
  var INOUT_CSS = 'cubic-bezier(0.76, 0, 0.24, 1)';  // vuelos: arrancan y frenan con la misma suavidad

  var CONFIG = {
    separation: 1.5, separationRadius: 15, alignment: 0.75, cohesion: 1.1, neighborRadius: 34, neighbors: 12,
    attraction: 1, turbulence: 1, maxSpeed: 360, textureOpacity: 0.16
  };
  // Escalas: cada una contiene a la anterior (sus huecos empiezan por los de la anterior)
  var STAGES = [{ assign: 2.0, conv: 0.8, stagger: 0.3 }, { assign: 3.4, conv: 0.8, stagger: 0.35 }, { assign: 4.95, conv: 0.9, stagger: 0.4 }];
  var T = { guides: 1.8, slide1: 3.3, slide2: 4.8, guidesOut: 6.5, explode: 6.6, back: 10.6, absorb: 11.45, open: 11.85, ground: 14.2 };
  var CARD_AT = [7.2, 7.58, 7.96, 8.34, 8.72, 9.1, 9.48, 10.1];   // cada 380 ms; K Rooms, el producto construido, con más aire
  var SPEED = [[0, 1.1], [1.5, 1.15], [1.85, 0.5], [2.1, 0.9], [3.3, 0.9], [3.5, 1.2], [4.8, 1.0], [5.0, 1.2], [6.0, 0.8], [6.6, 0.8], [6.7, 1.7], [7.4, 0.6], [10.55, 0.6], [10.75, 1.4], [11.4, 0.9]];
  var TURB = [[0, 1], [1.7, 0.6], [2.2, 0.3], [6.6, 0.3], [6.7, 0.5], [7.4, 0.05], [10.55, 0.05], [10.7, 0.45], [11.2, 0.05]];
  var COH = [[0, 1], [1.5, 1.8], [2.2, 1]];
  var GRID = [[0, 0], [1.85, 0], [2.1, 0.8], [6.5, 0.8], [6.6, 0]];

  // ---------- utilidades ----------
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var rng = mulberry32(11);
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, u) { return a + (b - a) * u; }
  function smooth(u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }
  function smoother(u) { u = clamp(u, 0, 1); return u * u * u * (u * (u * 6 - 15) + 10); }
  function kf(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (var i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) { var a = keys[i - 1], b = keys[i]; return mix(a[1], b[1], smooth((t - a[0]) / (b[0] - a[0]))); }
    }
    return keys[keys.length - 1][1];
  }
  function bezier(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var lo = 0, hi = 1, s = x;
      for (var i = 0; i < 22; i++) { var xs = ((ax * s + bx) * s + cx) * s; if (xs < x) lo = s; else hi = s; s = (lo + hi) / 2; }
      return ((ay * s + by) * s + cy) * s;
    };
  }
  var OUT = bezier(0.16, 1, 0.3, 1), INOUT = bezier(0.76, 0, 0.24, 1);

  // ---------- composición ----------
  // El mundo es la página a escala 1 (px); la cámara se acerca al botón y a la card y se aleja hasta la página.
  var W, H, SEC, DPR, K, KM, FR, S, mobile, LAYOUTS, RECTS, GUIDES, ZK, FXK, FYK;

  function Builder() { this.d = []; }
  Builder.prototype.push = function (x, y, dx, dy, len, th) { this.d.push(FR.x + x * FR.w, FR.y + y * FR.h, dx, dy, len, th); };
  // Línea discontinua: trazos a lo largo de la línea
  Builder.prototype.line = function (x1, y1, x2, y2, th) {
    var ax = x1 * FR.w, ay = y1 * FR.h, bx = x2 * FR.w, by = y2 * FR.h, l = Math.hypot(bx - ax, by - ay);
    var step = S * (th === 2 ? 1.05 : 1.2), n = Math.max(1, Math.round(l / step)), ux = (bx - ax) / l, uy = (by - ay) / l;
    for (var k = 0; k < n; k++) { var u = (k + 0.5) / n; this.push(mix(x1, x2, u), mix(y1, y2, u), ux, uy, l / n * 0.66, th); }
  };
  Builder.prototype.rect = function (x, y, w, h, th) { this.line(x, y, x + w, y, th); this.line(x + w, y, x + w, y + h, th); this.line(x + w, y + h, x, y + h, th); this.line(x, y + h, x, y, th); };
  // Relleno en aparejo; sx/sy en px; skip(u, v) deja huecos (u, v de 0 a 1 dentro del rectángulo)
  Builder.prototype.fill = function (x, y, w, h, angle, th, sx, sy, skip) {
    var pw = w * FR.w, ph = h * FR.h, rows = Math.max(1, Math.round(ph / sy)), dx = Math.cos(angle), dy = Math.sin(angle);
    for (var j = 0; j < rows; j++) {
      var py = (j + 0.5) / rows * ph, off = (j % 2) * sx * 0.5, cols = Math.max(1, Math.floor((pw - off) / sx));
      for (var i = 0; i < cols; i++) {
        var px = off + (i + 0.5) * sx;
        if (skip && skip(px / pw, py / ph)) continue;
        this.push(x + px / FR.w, y + py / FR.h, dx, dy, sx * 0.62, th);
      }
    }
  };

  // Medidas relativas al marco del wireframe. La card 0 contiene al botón; el wireframe contiene a la card 0.
  function geometry() {
    return mobile ? {
      cards: [[0, 0.32], [0.52, 0.32], [0, 0.65], [0.52, 0.65]], cw: 0.48, ch: 0.3,
      img: [0.03, 0.02, 0.13], title: [0.18, 0.18], text: [0.205, 0.22], btn: [0.03, 0.235, 0.2, 0.045],
      guides: [0, 0, 0.48, 0.52, 1, 1]
    } : {
      cards: [[0.36, 0.16], [0.695, 0.16], [0.36, 0.6], [0.695, 0.6]], cw: 0.305, ch: 0.38,
      img: [0.02, 0.03, 0.17], title: [0.24, 0.18], text: [0.28, 0.22], btn: [0.02, 0.305, 0.1, 0.05],
      guides: [0, 0.28, 0.36, 0.665, 0.695, 1]
    };
  }
  function button(b, g, c) {
    var s = Math.max(S * 0.55, 3);
    // Relleno denso con el hueco de la etiqueta en el centro
    b.fill(c[0] + g.btn[0], c[1] + g.btn[1], g.btn[2], g.btn[3], 0, 1, s * 1.3, s * 0.85, function (u, v) { return Math.abs(u - 0.5) < 0.27 && Math.abs(v - 0.5) < 0.2; });
  }
  function cardBody(b, g, c) {
    var x = c[0] + g.img[0];
    b.rect(c[0], c[1], g.cw, g.ch, 0);
    b.fill(x, c[1] + g.img[1], g.cw - 2 * g.img[0], g.img[2], -Math.PI / 4, 0, S * 1.7, S * 1.35);
    b.line(x, c[1] + g.title[0], x + g.title[1], c[1] + g.title[0], 2);
    b.line(x, c[1] + g.text[0], x + g.text[1], c[1] + g.text[0], 0);
  }
  function page(b, g) {
    var hs = S * 1.28, vs = S * 0.86;
    if (!mobile) {
      b.fill(0, 0.02, 0.06, 0.03, 0, 2, hs, vs);
      b.line(0.62, 0.035, 0.68, 0.035, 1); b.line(0.71, 0.035, 0.77, 0.035, 1); b.line(0.8, 0.035, 0.86, 0.035, 1);
      b.rect(0.9, 0.012, 0.1, 0.05, 1);
      b.line(0, 0.1, 1, 0.1, 0);
      b.fill(0, 0.18, 0.28, 0.055, 0, 2, hs, vs); b.fill(0, 0.25, 0.2, 0.055, 0, 2, hs, vs);
      [[0.37, 0.28], [0.41, 0.26], [0.45, 0.28], [0.49, 0.17]].forEach(function (r) { b.line(0, r[0], r[1], r[0], 0); });
      b.rect(0, 0.58, 0.13, 0.06, 1);
    } else {
      b.fill(0, 0.012, 0.14, 0.02, 0, 2, hs, vs);
      b.line(0.86, 0.012, 1, 0.012, 1); b.line(0.86, 0.03, 1, 0.03, 1);
      b.line(0, 0.06, 1, 0.06, 0);
      b.fill(0, 0.1, 0.8, 0.04, 0, 2, hs, vs); b.fill(0, 0.155, 0.55, 0.04, 0, 2, hs, vs);
      b.line(0, 0.23, 0.9, 0.23, 0); b.line(0, 0.26, 0.6, 0.26, 0);
    }
    for (var i = 1; i < g.cards.length; i++) { button(b, g, g.cards[i]); cardBody(b, g, g.cards[i]); }
  }

  function layout() {
    W = intro.clientWidth; H = intro.clientHeight; mobile = W < 700;
    var sr = intro.getBoundingClientRect(); SEC = { x: sr.left + scrollX, y: sr.top + scrollY };   // la sección en la página
    DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    K = clamp(Math.min(W, H) / 900, 0.5, 1.4);
    KM = clamp(Math.sqrt(W * H) / 1150, 0.75, 1.2);
    var pad = clamp(W * 0.05, 20, 96), colW = Math.min(1100, W - 2 * pad);
    var fh = mobile ? Math.min(colW * 1.45, H * 0.64) : Math.min(colW * 0.56, H * 0.62);
    FR = { x: (W - colW) / 2, y: Math.round((H - fh) / 2 + (mobile ? 6 : 10)), w: colW, h: fh };
    S = mobile ? Math.max(3.6, colW / 92) : Math.max(4.2, colW / 150);

    // Huecos acumulativos: botón ⊂ botón + card ⊂ todo el wireframe
    var g = geometry(), c0 = g.cards[0], b = new Builder();
    button(b, g, c0); var nB = b.d.length;
    cardBody(b, g, c0); var nC = b.d.length;
    page(b, g);
    var all = new Float32Array(b.d);
    LAYOUTS = [all.subarray(0, nB), all.subarray(0, nC), all];
    var abs = function (x, y, w, h) { return { x: FR.x + x * FR.w, y: FR.y + y * FR.h, w: w * FR.w, h: h * FR.h }; };
    RECTS = [abs(c0[0] + g.btn[0], c0[1] + g.btn[1], g.btn[2], g.btn[3]), abs(c0[0], c0[1], g.cw, g.ch), { x: FR.x, y: FR.y, w: FR.w, h: FR.h }];
    RECTS.forEach(function (r) { r.cx = r.x + r.w / 2; r.cy = r.y + r.h / 2; });

    // Cámara: cerca del botón, a media distancia de la card, a escala 1 en la página
    var zB = Math.min(mobile ? 2.8 : 2.4, W * (mobile ? 0.42 : 0.22) / RECTS[0].w);
    var zC = Math.max(1.05, Math.min(mobile ? 1.9 : 1.6, W * (mobile ? 0.8 : 0.5) / RECTS[1].w, H * 0.55 / RECTS[1].h));
    var key = function (a, b2, c) { return [[0, a], [T.slide1, a], [T.slide1 + 0.7, b2], [T.slide2, b2], [T.slide2 + 0.75, c]]; };
    ZK = key(zB, zC, 1);
    FXK = key(RECTS[0].cx, RECTS[1].cx, RECTS[2].cx);
    FYK = key(RECTS[0].cy, RECTS[1].cy, RECTS[2].cy);

    // Guías ocres por escala: bordes del botón, de la card y de la página (6 y 6 y 6, una a una)
    var bl = RECTS[0].x, br = RECTS[0].x + RECTS[0].w, cl = RECTS[1].x, cr = RECTS[1].x + RECTS[1].w;
    GUIDES = [[bl, bl, bl, br, br, br], [cl, cl, cl, cr, cr, cr], g.guides.map(function (u) { return FR.x + u * FR.w; })];
    placeCards();
  }

  function cam(t) { return { z: kf(t, ZK), fx: kf(t, FXK), fy: kf(t, FYK) }; }
  function toWorldX(sx, c) { return (sx - W / 2) / c.z + c.fx; }
  function toWorldY(sy, c) { return (sy - H / 2) / c.z + c.fy; }

  // Pila: cada pieza en una fracción del hueco libre (x, y), como antes. Alternan lados; K Rooms cae en el centro.
  var SPOTS = [[1, 0.1], [0, 0.35], [0.75, 1], [0.25, 0], [0.95, 0.55], [0.05, 0.85], [0.5, 0.3], [0.5, 0.5]];
  var cardRects = [];
  // Rectángulo de un elemento en coordenadas de la sección
  function local(el) { var r = el.getBoundingClientRect(), s0 = intro.getBoundingClientRect(); return { left: r.left - s0.left, top: r.top - s0.top, width: r.width, height: r.height }; }
  function placeCards() {
    var side = cards[0].offsetWidth, free = { x: pile.clientWidth - side, y: pile.clientHeight - side }, pr = local(pile);
    cardRects = cards.map(function (c, i) {
      var l = Math.round(SPOTS[i][0] * free.x), tp = Math.round(SPOTS[i][1] * free.y);
      c.style.left = l + 'px'; c.style.top = tp + 'px';
      return { x: pr.left + l, y: pr.top + tp, w: side, h: side };
    });
  }

  // ---------- enjambre ----------
  var N, X, Y, VX, VY, HX, HY, MODE, SPAWN, SPD, LEN, KIND, THICK, CURL, GROUP, STREAM;
  var LAY, SLOT, TX, TY, TDX, TDY, TL, TT, TS, CV, WC, PHS, FREE, KICK, EX, EY, CCX, CCY, FA;
  var assigned = [false, false, false], lattice, latticeDone = false, backDone = false, gw, gh, head, next;
  var guides = [];

  function init() {
    var nB = LAYOUTS[0].length / 6, nC = LAYOUTS[1].length / 6, nP = LAYOUTS[2].length / 6;
    N = Math.ceil(nP * 1.05);
    var n0 = Math.ceil(nB * 1.25), n1 = Math.max(n0 + 1, Math.ceil(nC * 1.12));
    var F = function () { return new Float32Array(N); }, U = function () { return new Uint8Array(N); };
    X = F(); Y = F(); VX = F(); VY = F(); HX = F(); HY = F(); SPAWN = F(); SPD = F(); LEN = F(); CURL = F(); PHS = F();
    TX = F(); TY = F(); TDX = F(); TDY = F(); TL = F(); TS = F(); CV = F(); WC = F(); EX = F(); EY = F(); CCX = F(); CCY = F(); FA = F();
    MODE = U(); KIND = U(); THICK = U(); GROUP = U(); STREAM = U(); LAY = U(); TT = U(); FREE = U(); KICK = U();
    SLOT = new Int32Array(N).fill(-1);
    for (var i = 0; i < N; i++) {
      // Llegan en tres oleadas: las que forman el botón, las de la card y las de la página
      SPAWN[i] = (i < n0 ? 0.1 + 1.1 * Math.pow(i / n0, 1.4) : i < n1 ? 2.5 + 1.1 * (i - n0) / (n1 - n0) : 3.95 + 1.0 * (i - n1) / (N - n1)) + rng() * 0.04;
      var r = rng();
      STREAM[i] = r < 0.45 ? 0 : r < 0.75 ? 1 : 2;
      GROUP[i] = STREAM[i] === 2 ? 1 : 0;
      SPD[i] = 0.82 + rng() * 0.36;
      LEN[i] = (4.5 + rng() * 3.5) * KM;
      var k = rng(); KIND[i] = k < 0.7 ? 0 : k < 0.88 ? 1 : 2;   // trazo · cuña · curva
      THICK[i] = rng() < 0.3 ? 1 : 0;
      CURL[i] = (rng() - 0.5) * 2; PHS[i] = rng() * 6.283;
      HX[i] = 1;
    }
    gw = Math.ceil(W / (CONFIG.neighborRadius * K)) + 6; gh = Math.ceil(H / (CONFIG.neighborRadius * K)) + 6;
    head = new Int32Array(gw * gh); next = new Int32Array(N);
    guides = GUIDES[0].map(function () { return { x: 0, y: 0, v: 0, on: false }; });

    // Retícula de la explosión: la misma de la textura de la página, a escala 1 (al mundo de la cámara final)
    var c = cam(99), d = latticeSlots(W, H, SEC.x, SEC.y), pts = [];
    for (var o = 0; o < d.length; o += 6) pts.push([toWorldX(d[o], c), toWorldY(d[o + 1], c)]);
    lattice = { pts: pts, len: d[4] };
  }

  // Al entrar un trazo: posición y velocidad de pantalla convertidas al mundo de la cámara de ese momento
  function spawn(i, c) {
    var ms = CONFIG.maxSpeed * K, sx, sy, vx, vy, s = STREAM[i];
    if (s === 0) { sx = -20 - rng() * 40; sy = H * (0.4 + (rng() - 0.5) * 0.25); vx = ms * (0.9 + rng() * 0.2); vy = (rng() - 0.6) * ms * 0.35; }
    else if (s === 1) { sx = W * (0.12 + rng() * 0.3); sy = H + 20 + rng() * 40; vx = ms * 0.45; vy = -ms * 0.9; }
    else { sx = W + 20 + rng() * 40; sy = H * (0.15 + rng() * 0.25); vx = -ms * 0.95; vy = ms * 0.25; }
    X[i] = toWorldX(sx, c); Y[i] = toWorldY(sy, c); VX[i] = vx / c.z; VY[i] = vy / c.z;
  }

  // Reparto por bandas verticales: se ordenan trazos y huecos por x, y dentro de cada banda por y (sin cruces caóticos)
  function bandAssign(keep, free, data, bands, each) {
    keep.sort(function (a, b) { return X[a] - X[b]; });
    free.sort(function (a, b) { return data[a * 6] - data[b * 6]; });
    var per = Math.ceil(keep.length / bands);
    for (var b = 0; b < bands; b++) {
      var kb = keep.slice(b * per, (b + 1) * per).sort(function (a, c) { return Y[a] - Y[c]; });
      var sb = free.slice(b * per, (b + 1) * per).sort(function (a, c) { return data[a * 6 + 1] - data[c * 6 + 1]; });
      for (var j = 0; j < kb.length && j < sb.length; j++) each(kb[j], sb[j]);
    }
  }

  // Escala k: quien ya tenía hueco lo conserva (la estructura crece alrededor); los huecos nuevos, a los más cercanos
  function assign(k, t) {
    assigned[k] = true;
    var P = STAGES[k], data = LAYOUTS[k], nSlots = data.length / 6, taken = new Uint8Array(nSlots), pool = [], z = cam(t).z;
    for (var i = 0; i < N; i++) {
      if (MODE[i] !== 1) continue;
      if (LAY[i] === k && SLOT[i] >= 0) { taken[SLOT[i]] = 1; LAY[i] = k + 1; continue; }
      pool.push(i);
    }
    var free = []; for (var s = 0; s < nSlots; s++) if (!taken[s]) free.push(s);
    var R = RECTS[k], d2 = function (i) { var dx = X[i] - R.cx, dy = (Y[i] - R.cy) * 1.4; return dx * dx + dy * dy; };
    pool.sort(function (a, b) { return d2(a) - d2(b); });
    pool.slice(free.length).forEach(function (i) { FREE[i] = 1; LAY[i] = 0; });   // sin sitio: rodean la estructura
    bandAssign(pool.slice(0, free.length), free, data, Math.max(1, Math.min(30, Math.round(free.length / 40))), function (n, si) {
      var o = si * 6;
      LAY[n] = k + 1; FREE[n] = 0; SLOT[n] = si;
      TX[n] = data[o]; TY[n] = data[o + 1]; TDX[n] = data[o + 2]; TDY[n] = data[o + 3]; TL[n] = data[o + 4]; TT[n] = data[o + 5];
      var dist = Math.hypot(TX[n] - X[n], TY[n] - Y[n]) * z;
      TS[n] = P.assign + clamp(dist / (Math.min(W, H) * 0.9), 0, 1) * P.stagger * 0.6 + rng() * P.stagger * 0.4;
      CV[n] = P.conv;
    });
  }

  // Reparto por ángulo y radio alrededor de un centro: para expandirse (explosión) y para recogerse (vuelta)
  function radialAssign(idx, pts, cx, cy, each) {
    var ang = function (p) { return Math.atan2(p[1] - cy, p[0] - cx); }, rad = function (p) { return Math.hypot(p[0] - cx, (p[1] - cy) * W / H); };
    var me = function (i) { return [X[i], Y[i]]; }, order = pts.map(function (p, k) { return k; });
    idx.sort(function (a, b) { return ang(me(a)) - ang(me(b)); });
    order.sort(function (a, b) { return ang(pts[a]) - ang(pts[b]); });
    // Bandas proporcionales: si hay más huecos que trazos, quedan huecos repartidos (no un sector vacío)
    var bands = 44, per = Math.ceil(idx.length / bands), perP = Math.ceil(pts.length / bands);
    for (var b = 0; b < bands; b++) {
      var kb = idx.slice(b * per, (b + 1) * per).sort(function (a, c) { return rad(me(a)) - rad(me(c)); });
      var sb = order.slice(b * perP, (b + 1) * perP).sort(function (a, c) { return rad(pts[a]) - rad(pts[c]); });
      for (var j = 0; j < kb.length && sb.length; j++) { var p = pts[sb[Math.floor(j * sb.length / kb.length)]]; each(kb[j], p, rad(p)); }
    }
  }
  function active() { var a = []; for (var i = 0; i < N; i++) if (MODE[i] === 1) a.push(i); return a; }

  // Explosión: cada trazo sale hacia fuera desde el centro y se posa en su punto de la retícula
  function explode(t) {
    latticeDone = true;
    var cx = RECTS[2].cx, cy = RECTS[2].cy, ms = CONFIG.maxSpeed * K, maxR = Math.hypot(W, W) / 2;
    radialAssign(active(), lattice.pts, cx, cy, function (n, p, r) {
      LAY[n] = 4; FREE[n] = 0;
      TX[n] = p[0]; TY[n] = p[1]; TDX[n] = 1; TDY[n] = 0; TL[n] = lattice.len; TT[n] = 0;
      TS[n] = t + 0.08 + r / maxR * 0.35; CV[n] = 0.5;
      var dx = X[n] - cx, dy = Y[n] - cy, dl = Math.hypot(dx, dy) || 1;
      VX[n] += dx / dl * ms * (1.6 + rng()); VY[n] += dy / dl * ms * (1.6 + rng());
      KICK[n] = 1;
    });
  }

  // Vuelta: la retícula se recoge en un contorno de trazos alrededor de cada pieza, un poco por fuera
  // (el lienzo queda debajo de las piezas: las de arriba tapan los contornos de las de abajo)
  function gatherBack(t) {
    backDone = true;
    var c = cam(t), off = 4, pts = [], per = 0, idx = active();
    var rects = cardRects.map(function (r) { return { x: toWorldX(r.x, c), y: toWorldY(r.y, c), w: r.w, h: r.h }; });
    rects.forEach(function (r) { per += 4 * (r.w + 2 * off); });
    var step = per / idx.length;
    rects.forEach(function (r) {
      var x0 = r.x - off, y0 = r.y - off, s = r.w + 2 * off, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      [[x0, y0, 1, 0], [x0 + s, y0, 0, 1], [x0 + s, y0 + s, -1, 0], [x0, y0 + s, 0, -1]].forEach(function (sd) {
        for (var d = step / 2; d < s; d += step) pts.push([sd[0] + sd[2] * d, sd[1] + sd[3] * d, sd[2], sd[3], cx, cy]);
      });
    });
    var pr = local(pile);
    radialAssign(idx, pts, toWorldX(pr.left + pr.width / 2, c), toWorldY(pr.top + pr.height / 2, c), function (n, p) {
      LAY[n] = 5; KICK[n] = 0;
      EX[n] = TX[n] = p[0]; EY[n] = TY[n] = p[1]; TDX[n] = p[2]; TDY[n] = p[3]; CCX[n] = p[4]; CCY[n] = p[5];
      TL[n] = Math.max(3, step * 0.75); TT[n] = 0;
      TS[n] = t + rng() * 0.25; CV[n] = 0.55;
    });
  }

  // Retícula ocre: los trazos salen de debajo de las piezas y se posan en la de la página; primero los más cercanos
  function groundAssign(t) {
    var c = cam(t), idx = active(), pr = local(pile), pcx = pr.left + pr.width / 2, pcy = pr.top + pr.height / 2;
    var pts = latticeSlots(W, H, SEC.x, SEC.y), all = [];
    for (var o = 0; o < pts.length; o += 6) all.push([toWorldX(pts[o], c), toWorldY(pts[o + 1], c), Math.hypot(pts[o] - pcx, pts[o + 1] - pcy)]);
    var maxR = Math.hypot(W, H) / 2;
    radialAssign(idx, all, toWorldX(pcx, c), toWorldY(pcy, c), function (m, p) {
      LAY[m] = 6; KICK[m] = 0;
      TX[m] = p[0]; TY[m] = p[1]; TDX[m] = 1; TDY[m] = 0; TL[m] = pts[4]; FA[m] = TEX_A; TT[m] = 0;
      TS[m] = t + 0.15 + clamp(p[2] / maxR, 0, 1) * 0.8 + rng() * 0.15; CV[m] = 0.9;
    });
  }

  function attractor(t, c) {
    // En pantalla: dos lazos que se cruzan y se juntan en el centro (que es el foco de la cámara); al mundo
    var a1x = W * (0.42 + 0.17 * Math.sin(0.85 * t)), a1y = H * (0.5 + 0.14 * Math.sin(1.25 * t + 0.6));
    var a2x = W * (0.62 + 0.15 * Math.cos(1.05 * t + 1.3)), a2y = H * (0.4 + 0.16 * Math.sin(0.9 * t + 2.1));
    var m = kf(t, [[0.6, 0], [1.3, 1]]); a2x = mix(a2x, a1x, m); a2y = mix(a2y, a1y, m);
    var g = kf(t, [[1.0, 0], [1.9, 1]]);
    return [toWorldX(mix(a1x, W / 2, g), c), toWorldY(mix(a1y, H / 2, g), c), toWorldX(mix(a2x, W / 2, g), c), toWorldY(mix(a2y, H / 2, g), c)];
  }

  // Guías: caen sobre los bordes del botón, se abren a los de la card y a los de la página, y suben al final
  function updateGuides(t, c) {
    guides.forEach(function (g, i) {
      var u0 = (t - T.guides - i * 0.05) / 0.45, e = OUT(clamp(u0, 0, 1));
      var u1 = OUT(clamp((t - T.slide1 - i * 0.03) / 0.5, 0, 1)), u2 = OUT(clamp((t - T.slide2 - i * 0.03) / 0.55, 0, 1));
      var uo = INOUT(clamp((t - T.guidesOut - i * 0.04) / 0.4, 0, 1));
      var px = g.x, py = g.y;
      g.on = u0 > 0 && uo < 1;
      g.x = mix(mix(GUIDES[0][i], GUIDES[1][i], u1), GUIDES[2][i], u2);
      var rest = mix(mix(RECTS[0].y, RECTS[1].y, u1), RECTS[2].y, u2) - Math.max(16, S * 3.2) / c.z, top = toWorldY(-30, c);
      g.y = mix(top, rest, e) - uo * (rest - top);
      g.v = Math.hypot(g.x - px, g.y - py) * c.z / Math.max(1, S) * 0.6;
    });
  }

  function step(t, dt) {
    var c = cam(t), z = c.z;
    var ms = CONFIG.maxSpeed * K * kf(t, SPEED) / z, turb = CONFIG.turbulence * kf(t, TURB), grid = kf(t, GRID);
    var sepW = CONFIG.separation, sepR = CONFIG.separationRadius * K / z, cohW = CONFIG.cohesion * kf(t, COH), aliW = CONFIG.alignment;
    var A = attractor(t, c), minD = Math.min(W, H) / z;
    for (var k = 0; k < 3; k++) if (!assigned[k] && t >= STAGES[k].assign) assign(k, t);
    if (!latticeDone && t >= T.explode) explode(t);
    if (!backDone && t >= T.back) gatherBack(t);
    var sink = smooth((t - T.absorb) / (T.open - T.absorb));   // la masa se hunde en las piezas
    var SR = RECTS[t < STAGES[1].assign ? 0 : t < STAGES[2].assign ? 1 : 2];

    // Rejilla espacial en coordenadas de la vista actual
    var cell = CONFIG.neighborRadius * K / z, ox = toWorldX(0, c) - 3 * cell, oy = toWorldY(0, c) - 3 * cell;
    head.fill(-1);
    for (var i = 0; i < N; i++) {
      if (MODE[i] !== 1 || WC[i] >= 0.985) continue;
      var cc = clamp(((Y[i] - oy) / cell) | 0, 0, gh - 1) * gw + clamp(((X[i] - ox) / cell) | 0, 0, gw - 1);
      next[i] = head[cc]; head[cc] = i;
    }
    var R2 = cell * cell, nb = CONFIG.neighbors, G = 3.2;

    for (i = 0; i < N; i++) {
      if (MODE[i] === 0) { if (t >= SPAWN[i]) { MODE[i] = 1; spawn(i, c); } else continue; }
      var px = X[i], py = Y[i], vx = VX[i], vy = VY[i];
      var L = LAY[i], w = L ? smoother((t - TS[i]) / CV[i]) : 0, lat = L >= 4;
      if (L === 5 && sink > 0) { TX[i] = mix(EX[i], CCX[i], sink * 0.35); TY[i] = mix(EY[i], CCY[i], sink * 0.35); }
      WC[i] = w;
      var ax = 0, ay = 0, lim = ms * SPD[i];

      if (w < 0.985) {
        var gx = clamp(((px - ox) / cell) | 0, 1, gw - 2), gy = clamp(((py - oy) / cell) | 0, 1, gh - 2), n = 0;
        var sx = 0, sy = 0, avx = 0, avy = 0, cx = 0, cy = 0;
        for (var oyy = -1; oyy <= 1 && n < nb; oyy++) for (var oxx = -1; oxx <= 1 && n < nb; oxx++) {
          for (var j = head[(gy + oyy) * gw + gx + oxx]; j !== -1 && n < nb; j = next[j]) {
            if (j === i) continue;
            var dx = px - X[j], dy = py - Y[j], d2 = dx * dx + dy * dy;
            if (d2 > R2 || d2 < 1e-6) continue;
            n++; avx += VX[j]; avy += VY[j]; cx += X[j]; cy += Y[j];
            var d = Math.sqrt(d2);
            if (d < sepR) { var f = (sepR - d) / sepR / d; sx += dx * f; sy += dy * f; }
          }
        }
        // Cada regla aporta una dirección con su peso; se vuela hacia la suma a la velocidad propia del momento
        // (si cada regla frenara por su cuenta, en las zonas densas se anularían y la bandada se quedaría parada)
        var cv = Math.hypot(vx, vy) || 1, dirX = vx / cv * 1.2, dirY = vy / cv * 1.2;
        if (n) {
          var al = Math.hypot(avx, avy) || 1;
          dirX += avx / al * aliW; dirY += avy / al * aliW;
          var tcx = cx / n - px, tcy = cy / n - py, tl = Math.hypot(tcx, tcy) || 1, cf = Math.min(1, tl / (sepR * 1.5));
          dirX += tcx / tl * cohW * cf; dirY += tcy / tl * cohW * cf;
          var sl = Math.hypot(sx, sy);
          if (sl > 0) { var sf = sepW * Math.min(1, sl * 3 * z); dirX += sx / sl * sf; dirY += sy / sl * sf; }
        }
        var gx2, gy2, aw, far = 1;
        if (L) { gx2 = TX[i]; gy2 = TY[i]; aw = lat ? 2.2 : 1.6; if (lat) lim = ms * 1.6; }
        else if (FREE[i]) {
          // Los que aún no tienen sitio rodean la estructura por fuera, sin pisarla
          var an = t * 1.1 + GROUP[i] * 2.4 + PHS[i] * 0.15;
          gx2 = SR.cx + Math.cos(an) * (SR.w / 2 + 70 * K / z); gy2 = SR.cy + Math.sin(an * 1.3) * (SR.h / 2 + 60 * K / z); aw = 1.4;
          var mg = 22 * K / z, inL = px - (SR.x - mg), inR = SR.x + SR.w + mg - px, inT = py - (SR.y - mg), inB = SR.y + SR.h + mg - py;
          if (inL > 0 && inR > 0 && inT > 0 && inB > 0) {
            var mn = Math.min(inL, inR, inT, inB);
            if (mn === inL) dirX -= 3; else if (mn === inR) dirX += 3; else if (mn === inT) dirY -= 3; else dirY += 3;
          }
        } else { gx2 = A[GROUP[i] * 2]; gy2 = A[GROUP[i] * 2 + 1]; aw = CONFIG.attraction; far = 0; }
        var ddx = gx2 - px, ddy = gy2 - py, dl = Math.hypot(ddx, ddy) || 1;
        if (!far) far = clamp(dl / (minD * 0.3), 0.2, 1);
        dirX += ddx / dl * aw * far; dirY += ddy / dl * aw * far;
        if (turb > 0.01) {
          // El campo vive en la pantalla: pliegues del mismo tamaño a cualquier zoom
          var sxp = (px - c.fx) * z, syp = (py - c.fy) * z;
          var th = Math.PI * (Math.sin(sxp * 0.0042 + t * 0.6) + Math.sin(syp * 0.0051 - t * 0.45) + Math.sin((sxp + syp) * 0.0029 + t * 0.33));
          dirX += Math.cos(th) * turb * 0.9; dirY += Math.sin(th) * turb * 0.9;
        }
        // Rejilla inferida: mientras se forma la estructura, los que vuelan giran al eje más cercano
        if (grid > 0.01 && !FREE[i] && !lat) {
          if (Math.abs(dirX) > Math.abs(dirY)) dirX += (dirX > 0 ? 1.4 : -1.4) * grid; else dirY += (dirY > 0 ? 1.4 : -1.4) * grid;
        }
        var dn = Math.hypot(dirX, dirY) || 1;
        ax += (dirX / dn * lim - vx) * G; ay += (dirY / dn * lim - vy) * G;
        if (KICK[i] && t < T.explode + 0.25) { ax *= 0.15; ay *= 0.15; }   // la explosión manda un instante
        ax *= 1 - w; ay *= 1 - w;
      }

      if (w > 0) {
        // Muelle hacia su hueco; en la estructura, una respiración mínima
        var fq = lat ? 0.8 + 1.4 * w : 0.6 + 1.9 * w, kk = (6.2832 * fq) * (6.2832 * fq), dd = 2 * 0.85 * 6.2832 * fq;
        var br = w >= 1 && !lat ? 0.3 * KM / z * Math.sin(t * 1.7 + PHS[i]) : 0;
        ax += ((TX[i] - px) * kk - vx * dd) * w;
        ay += ((TY[i] + br - py) * kk - vy * dd) * w;
        lim = mix(lim, ms * 4, w);
      }

      vx += ax * dt; vy += ay * dt;
      var sp = Math.hypot(vx, vy);
      if (w < 0.98 && sp > lim && !(KICK[i] && t < T.explode + 0.3)) { vx *= lim / sp; vy *= lim / sp; sp = lim; }
      if (w < 0.3 && !lat && sp < lim * 0.35 && sp > 0) { var bb = lim * 0.35 / sp; vx *= bb; vy *= bb; sp *= bb; }   // los pájaros no se paran
      if (sp > 1e-3) { HX[i] = vx / sp; HY[i] = vy / sp; }
      X[i] = px + vx * dt; Y[i] = py + vy * dt; VX[i] = vx; VY[i] = vy;
    }
  }

  // ---------- dibujo ----------
  var WIDTHS = [1.1, 1.5, 2.15];
  function draw(t) {
    var c = cam(t), z = c.z;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);   // transparente: el fondo es el de .intro y las piezas quedan encima
    ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * (W / 2 - c.fx * z), DPR * (H / 2 - c.fy * z));
    if (t >= T.open) { drawGround(t); return; }
    // Tras la explosión, textura a baja opacidad; vuelve a la tinta al recogerse y se apaga al hundirse en las piezas
    var sink = smooth((t - T.absorb) / (T.open - T.absorb));
    ctx.globalAlpha = mix(mix(1, CONFIG.textureOpacity, smooth((t - T.explode - 0.05) / 0.55)), 0.85, smooth((t - T.back) / 0.45)) * (1 - sink);
    if (ctx.globalAlpha > 0.003) {
      ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      var ms = CONFIG.maxSpeed * K / z, lw = (mobile ? 0.8 : 1) / Math.pow(z, 0.6);
      for (var batch = 0; batch < 3; batch++) {
        ctx.lineWidth = WIDTHS[batch] * lw;
        ctx.beginPath();
        for (var i = 0; i < N; i++) {
          if (MODE[i] !== 1) continue;
          var w = WC[i];
          if ((w > 0.5 ? TT[i] : THICK[i]) !== batch) continue;
          var x = X[i], y = Y[i];
          // Dirección: la del vuelo, que gira hacia la del hueco (con el signo que menos gira)
          var tdx = TDX[i], tdy = TDY[i];
          if (w > 0 && tdx * HX[i] + tdy * HY[i] < 0) { tdx = -tdx; tdy = -tdy; }
          var bx = mix(HX[i], tdx, w), by = mix(HY[i], tdy, w), bl = Math.hypot(bx, by) || 1; bx /= bl; by /= bl;
          var sp = Math.hypot(VX[i], VY[i]);
          var len = mix(clamp(LEN[i] * (0.55 + sp / ms * 0.6), 2.5, 14 * KM) / z, TL[i] || 4 / z, w) * (LAY[i] === 5 ? 1 - sink * 0.85 : 1);
          var hx = bx * len / 2, hy = by * len / 2;
          if (KIND[i] === 1 && w < 0.999) {
            // Cuña: la huella abstracta de un ala; se cierra en trazo al ordenarse
            var a = 0.6 * (1 - w), ca = Math.cos(a), sa = Math.sin(a), wl = mix(0.7, 1, w), qx = x + hx, qy = y + hy;
            ctx.moveTo(qx - (bx * ca - by * sa) * len * wl, qy - (by * ca + bx * sa) * len * wl);
            ctx.lineTo(qx, qy);
            ctx.lineTo(qx - (bx * ca + by * sa) * len * wl, qy - (by * ca - bx * sa) * len * wl);
          } else if (KIND[i] === 2 && w < 0.999) {
            var cu = CURL[i] * len * 0.55 * (1 - w);
            ctx.moveTo(x - hx, y - hy);
            ctx.quadraticCurveTo(x - by * cu, y + bx * cu, x + hx, y + hy);
          } else {
            ctx.moveTo(x - hx, y - hy); ctx.lineTo(x + hx, y + hy);
          }
        }
        ctx.stroke();
      }
    }
    // Guías ocres: marcas verticales cortas; al moverse dejan una estela breve
    ctx.globalAlpha = 1;
    ctx.strokeStyle = OCHRE; ctx.lineWidth = 2 / z;
    ctx.beginPath();
    var gl = Math.max(9, S * 2) / z;
    guides.forEach(function (g) {
      if (!g.on) return;
      ctx.moveTo(g.x, g.y - gl * (1 + Math.min(3, g.v))); ctx.lineTo(g.x, g.y);
    });
    ctx.stroke();
  }

  // Textura en formación: cada trazo aparece en ocre al salir de debajo de las piezas y llega a la opacidad de la retícula
  function drawGround(t) {
    ctx.strokeStyle = OCHRE; ctx.lineCap = 'round'; ctx.lineWidth = 1;
    var ms = CONFIG.maxSpeed * K;
    for (var b = 1; b <= 8; b++) {
      ctx.globalAlpha = b / 8 * TEX_A; ctx.beginPath();
      for (var i = 0; i < N; i++) {
        if (MODE[i] !== 1 || LAY[i] !== 6) continue;
        if (Math.round(FA[i] * smooth((t - TS[i] + 0.4) / 0.7) / TEX_A * 8) !== b) continue;
        var w = WC[i], tdx = TDX[i], tdy = TDY[i];
        if (w > 0 && tdx * HX[i] + tdy * HY[i] < 0) { tdx = -tdx; tdy = -tdy; }
        var bx = mix(HX[i], tdx, w), by = mix(HY[i], tdy, w), bl = Math.hypot(bx, by) || 1; bx /= bl; by /= bl;
        var len = mix(clamp(LEN[i] * (0.55 + Math.hypot(VX[i], VY[i]) / ms * 0.6), 2.5, 14 * KM), TL[i], w), hx = bx * len / 2, hy = by * len / 2;
        ctx.moveTo(X[i] - hx, Y[i] - hy); ctx.lineTo(X[i] + hx, Y[i] + hy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- piezas ----------
  var anims = [];
  var play = function (el, frames, dur, at, easing) {
    var a = el.animate(frames, { duration: dur, delay: at, easing: easing || OUT_CSS, fill: 'both' });
    anims.push(a);
    return a;
  };
  var imgs = cards.map(function (c) { return c.querySelector('img'); });
  imgs.forEach(function (img) {
    img.sizes = matchMedia('(max-width: 699px)').matches ? '54vw' : 'min(30vw, 42vh)';
    img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
  });

  // ---------- reloj ----------
  var t = 0, acc = 0, last = 0, raf = 0, running = false, done = false, grounded = false, DT = 1 / 60;

  function start() {
    layout(); init();
    intro.classList.add('is-running');   // se muestra ya con los estados iniciales de todas las animaciones aplicados
    play($('.intro__cue'), [{ opacity: 0 }, { opacity: 1 }], 600, 900, 'linear');
    cards.forEach(function (c, i) {
      var at = CARD_AT[i] * 1000, slow = i === cards.length - 1;
      play(c, [{ opacity: 0 }, { opacity: 1 }], slow ? 450 : 300, at, 'linear');
      play(c, [{ transform: 'translateY(' + (slow ? 56 : 40) + 'px)' }, { transform: 'none' }], slow ? 1100 : 850, at);
      play(c.querySelector('img'), [{ transform: 'scale(1.08)' }, { transform: 'none' }], 1200, at);
    });
    resume();
  }

  function frame(now) {
    if (!running) return;
    acc += Math.min(0.05, (now - last) / 1000); last = now;
    var n = 0;
    while (acc >= DT && n < 3) { updateGuides(t, cam(t)); step(t, DT); t += DT; acc -= DT; n++; }
    if (n === 3) acc = 0;
    if (t >= T.open && !grounded) { grounded = true; groundAssign(t); }
    if (t >= T.ground) { end(); return; }
    draw(t);
    raf = requestAnimationFrame(frame);
  }

  // Pausa y reanudación juntas: la simulación (requestAnimationFrame) y las piezas (Web Animations) no se desacompasan
  function pause() { if (!running) return; running = false; cancelAnimationFrame(raf); anims.forEach(function (a) { a.pause(); }); }
  function resume() {
    if (running || done) return;
    running = true; last = performance.now();
    anims.forEach(function (a) { a.play(); });
    raf = requestAnimationFrame(frame);
  }

  // Final: la retícula ocre ya está donde la del fondo de la página; se quita el lienzo y el fondo de la sección a la vez
  function end() {
    done = true; running = false; cancelAnimationFrame(raf);
    anims.forEach(function (a) { try { a.finish(); } catch (err) {} });
    if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); }
    intro.classList.remove('is-running');
    intro.classList.add('is-done');
    if (io) io.disconnect();
  }

  // Movimiento reducido o sin lienzo: directamente el final, con la pila quieta
  function still() {
    done = true;
    placeCards();
    cards.forEach(function (c) { c.style.opacity = 1; });
    intro.classList.add('is-done');
  }

  var io = null;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !ctx || !intro.animate) { still(); }
  else {
    start();
    // Fuera de pantalla o con la pestaña oculta, en pausa
    var visible = true;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !document.hidden) resume(); else pause(); });
      io.observe(intro);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else if (visible) resume(); });
  }

  // Si cambia el ancho (giro del móvil), la composición ya no cuadra: se salta al final y se recoloca la pila
  addEventListener('resize', function () {
    texture(); fit();
    if (W && Math.abs(intro.clientWidth - W) <= 40) return;
    if (!done) end();
    W = intro.clientWidth;
    placeCards();
  });
})();
