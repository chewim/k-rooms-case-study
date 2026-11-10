/* =========================================================================
   ciudad/ui.js · Interfaz de la ciudad
   Partes: pins y zonas pulsables · tarjetas de proyecto · cámara (encuadre
   y zoom al barrio) · panel de resumen · visor · enlace directo (#proyecto).
   Usa lo definido en datos.js, iso.js y escena.js.
   ========================================================================= */

/* Puntos de cada proyecto en el dibujo */
const PIN_AT = { "pujo-baixo": P(2.75,4.7,1.05), "k-rooms": P(8.5,2.5,2.85), "pagopero": P(9.3,11.0,1.75) };   // donde apunta la línea del chip
const FOCUS  = { "pujo-baixo": P(2.3,4.4,.6),   "k-rooms": P(8.6,2.7,1.1),  "pagopero": P(9.9,10.3,.7) };    // centro del zoom
const HIT    = { "pujo-baixo": [1.3,3.0,3.4,5.8,1.5], "k-rooms": [6.3,1.3,10.9,5.9,2.9], "pagopero": [8.3,8.3,11.7,11.8,2.2] }; // barrio pulsable
const X_ICON = `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg>`;

const figHTML = (src, alt) => `<figure class="dr-fig rise" style="--i:5"><button type="button" class="js-zoom" aria-label="${UI.enlarge}${alt}"><img src="${src}" alt="${alt}" loading="lazy" decoding="async"></button></figure>`;
const factsHTML = rows => `<dl class="facts">${rows.map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
const summaryBody = d => `<p class="dr-lead rise" style="--i:1">${d.lead}</p>
  <div class="kpis">${d.kpis.map(([n,l], i) => `<div class="kpi rise" style="--i:${2+i}"><b>${n}</b><span>${l}</span></div>`).join("")}</div>
  ${figHTML(d.img[0], d.img[1])}
  <section class="dr-sec rise" style="--i:6"><h3>${UI.facts}</h3>${factsHTML(d.facts)}</section>`;

/* ---------- Pins: chip con + y nombre, y vista previa al pasar el ratón ---------- */
const pinEls = {};
ORDER.forEach(id => {
  const p = PROJECTS[id];
  const b = document.createElement("button");
  b.className = "pin"; b.dataset.c = p.c; b.dataset.id = id;
  b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-label", `${p.name}: ${UI.seeSummary.toLowerCase()}`);
  b.innerHTML = `<span class="pin-dot" aria-hidden="true">+</span><span class="pin-label"><b>${p.name}</b></span><span class="pv" aria-hidden="true">${p.hover ? `<figure><img src="${p.hover[0]}" alt="${p.hover[1]}"${p.hover[2] ? ` style="object-position:${p.hover[2]}"` : ""} loading="lazy" decoding="async"></figure>` : ""}<b>${p.name}</b><span>${p.title}</span><i>${UI.seeSummary} →</i></span>`;
  b.addEventListener("click", () => toggle(id));
  map.appendChild(b); pinEls[id] = b;
});

/* ---------- Viñetas de las tarjetas: la gente de cada barrio, con el mismo dibujo del mapa ---------- */
const VIGNETTE = {
  /* Pujo Baixo: el coche con sus pasajeros y quien espera junto a la parada */
  "pujo-baixo": () => car()
    + line([[2.62,.42,0],[2.62,.42,.82]], "pole") + box(2.57,.37,.62,.1,.1,.2,"pb")
    + person(2.66,.95,0,"p-c",1.3),
  /* K Rooms: un trozo de fachada con la marquesina y la puerta de cristal; delante, quien llega con la maleta */
  "k-rooms": () => box(0,0,0,1.3,.35,.95,"kr")
    + rectY(.45,.95,.35,0,.55,"glass") + line([[.7,.35,0],[.7,.35,.55]], "mull")
    + winsY(.1,1.2,.35,.68,.9,3,1,"krw room lit")
    + box(.3,.35,.58,.8,.36,.08,"kr")
    + person(.5,1.02,0,"p-a",1.45) + box(.69,.9,0,.13,.26,.31,"kr")
    + line([[.755,.98,.31],[.755,.98,.46],[.755,1.08,.46],[.755,1.08,.31]], "pole"),
  /* Pagopero: la terraza con la sombrilla, la mesa con los vasos y dos amigos */
  "pagopero": () => {
    const [cx, cy] = P(.85,.85,1.12), [ax, ay] = P(.85,.85,1.36), rx = .46*RX*U, ry = .46*RY*U;
    return person(.4,1.04,0,"p-c",1.45)
      + line([[.85,.85,0],[.85,.85,.42]], "pole") + cyl(.85,.85,.42,.22,.04,"n")
      + cyl(.78,.8,.46,.045,.1,"gl") + cyl(.93,.9,.46,.045,.1,"gl")
      + line([[.85,.85,.46],[.85,.85,1.14]], "pole")
      + `<path class="ln pp-l" d="M${f(cx-rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx+rx)} ${f(cy)}L${f(ax)} ${f(ay)}Z"/>`
      + `<path class="ln pp-r" d="M${f(cx-rx*.25)} ${f(cy+ry*.97)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx+rx*.45)} ${f(cy+ry*.9)}L${f(ax)} ${f(ay)}Z"/>`
      + person(1.3,.74,0,"p-b",1.45);
  }
};
function vignetteSVG(id){
  const d0 = D; D = 0; const body = VIGNETTE[id](); D = d0;
  return `<span class="vig" aria-hidden="true"><svg><g>${body}</g></svg></span>`;
}
/* Encuadre: un cuadrado centrado en la gente (se mide una vez dibujada) */
function fitVignette(el){
  const svgEl = el.querySelector("svg"), b = svgEl.querySelector("g").getBBox();
  const side = Math.max(b.width, b.height) * 1.08, cx = b.x + b.width/2, cy = b.y + b.height/2;
  svgEl.setAttribute("viewBox", [cx - side/2, cy - side/2, side, side].map(f).join(" "));
}

/* ---------- Bajo el mapa: los tres proyectos, cada uno con su gente, su titular y su mockup ---------- */
ORDER.forEach(id => {
  const p = PROJECTS[id], d = SUMMARY[id];
  const a = document.createElement("a");
  a.className = "proj"; a.dataset.c = p.c; a.href = d.cta.href;
  a.innerHTML = `<span class="proj__hd">${vignetteSVG(id)}<span class="proj__t"><b>${p.name} <em aria-hidden="true">→</em></b><small>${p.title}</small></span></span>
    <span class="proj__img"><img src="${d.img[0]}" alt="${d.img[1]}" loading="lazy" decoding="async"></span>`;
  document.getElementById("list").appendChild(a);
  fitVignette(a.querySelector(".vig"));
});

/* Cada barrio entero se puede pulsar, no solo el chip */
svg.insertAdjacentHTML("beforeend", ORDER.map(id => { const [x0,y0,x1,y1,h] = HIT[id];
  return `<path class="hit" data-id="${id}" d="M${pts([[x0,y0,h],[x1,y0,h],[x1,y0,0],[x1,y1,0],[x0,y1,0],[x0,y1,h]])}Z"/>`; }).join(""));
svg.querySelectorAll(".hit").forEach(h => {
  const id = h.dataset.id;
  h.addEventListener("mouseenter", () => pinEls[id].classList.add("hot"));
  h.addEventListener("mouseleave", () => pinEls[id].classList.remove("hot"));
  h.addEventListener("click", () => toggle(id));
});

function placePins(){
  const m = svg.getScreenCTM(), r = map.getBoundingClientRect();
  ORDER.forEach(id => { const q = new DOMPoint(...PIN_AT[id]).matrixTransform(m); pinEls[id].style.left = (q.x-r.left) + "px"; pinEls[id].style.top = (q.y-r.top) + "px";
    pinEls[id].classList.toggle("is-low", q.y - r.top > map.clientHeight * .5);      // en la mitad baja, la vista previa se abre hacia arriba
    pinEls[id].classList.toggle("is-right", q.x - r.left > map.clientWidth - 420); }); // cerca del borde derecho, hacia la izquierda
}

/* ---------- Cámara: encuadre base y zoom al barrio ---------- */
const scroller = document.getElementById("scroller"), hero = document.querySelector(".hero");
const SCENE = { cx:110, cy:262, w:600 };   // escena de los tres proyectos, encuadrada en móvil
let base = [-440,-95,880,600], cur = base.slice(), anim = 0, active = null;
const mobile = () => innerWidth < 720;
const setVB = v => { cur = v; svg.setAttribute("viewBox", v.map(f).join(" ")); placePins(); };
const ZOOM = .88;   // vista inicial un poco alejada: la ciudad respira y queda más centrada
function baseVB(){
  const vw = scroller.clientWidth, mw = map.clientWidth, mh = map.clientHeight;
  if(mobile()){ const k = Math.min(1, (vw-24)/SCENE.w) * ZOOM; return [SCENE.cx - mw/2/k, SCENE.cy - mh*.62/k, mw/k, mh/k]; }   // en móvil, los tres edificios al 62 % del alto: entre el titular y los botones
  const s = Math.min(mw/880, mh/600) * ZOOM, w = mw/s, h = mh/s;
  /* En escritorio, la ciudad se desplaza a la derecha lo que ocupa el titular, para que nunca lo pise */
  const intro = document.querySelector(".intro-home"), ir = intro ? intro.getBoundingClientRect().right : 0;
  const dx = Math.max(0, ir - mw * .3) * .6;
  return [-440-(w-880)/2 - dx/s, -95-(h-600)/2, w, h];
}
function focusVB(id){
  const mw = map.clientWidth, mh = map.clientHeight, dr = drawer.getBoundingClientRect();
  const s = mw/base[2] * (mobile() ? 1.45 : 1.6) / ZOOM;   // el zoom a un proyecto no cambia al alejar la vista inicial
  const fx = mobile() ? scroller.scrollLeft + scroller.clientWidth/2 : (mw - dr.width)/2;
  const fy = mobile() ? Math.max(120, (mh - cards.offsetHeight - 24)/2 + 30) : mh/2;   // en móvil, el edificio queda por encima de las tarjetas
  const [cx, cy] = FOCUS[id];
  return [cx - fx/s, cy - fy/s, mw/s, mh/s];
}
/* quick: entre tarjetas en móvil, más corto y arrancando rápido (sin la sensación de quedarse atrapado) */
function animateTo(target, quick){
  cancelAnimationFrame(anim);
  if(reduce){ setVB(target); return; }
  const from = cur.slice(), t0 = performance.now(), T = quick ? 420 : 800;
  const step = now => {
    const x = Math.min(1, (now-t0)/T), e = quick ? 1 - Math.pow(1-x, 3) : x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x+2, 3)/2;
    setVB(from.map((v,i) => v + (target[i]-v)*e));
    if(x < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}
function frame(){
  base = baseVB();
  /* Si la ventana cambia de móvil a escritorio (o al revés) con un proyecto abierto, pasa de tarjetas a panel */
  if(active && mobile() !== document.body.classList.contains("cards-open")){ const id = active; closeDrawer(); openDrawer(id); return; }
  if(mobile() && !active) scroller.scrollLeft = (map.clientWidth - scroller.clientWidth)/2;
  cancelAnimationFrame(anim);
  setVB(active ? focusVB(active) : base);
}

/* ---------- Panel de resumen ---------- */
const drawer = document.createElement("aside");
drawer.className = "drawer"; drawer.setAttribute("role", "dialog"); drawer.setAttribute("aria-label", UI.summaryOf);
document.body.appendChild(drawer);

/* ---------- Móvil: tarjetas al pie del mapa, como en Google Maps ----------
   Al pulsar un chip aparece su tarjeta; deslizando se pasa a las otras dos y el mapa
   se recoloca en cada edificio. La tarjeta entera abre la página del proyecto. */
const cards = document.createElement("div");
cards.className = "mcards"; cards.setAttribute("role", "region"); cards.setAttribute("aria-label", UI.projects);
cards.innerHTML = `<button type="button" class="mcards__x" aria-label="${UI.closeCards}">${X_ICON}</button>
  <div class="mcards__track">${ORDER.map(id => { const p = PROJECTS[id], d = SUMMARY[id], h = p.hover || d.img;
    return `<a class="mcard" data-id="${id}" data-c="${p.c}" href="${d.cta.href}">
      <span class="mcard__img"><img src="${h[0]}" alt="" loading="lazy" decoding="async"${h[2] ? ` style="object-position:${h[2]}"` : ""}></span>
      <span class="mcard__t"><b>${p.name}</b><span>${p.title}</span><em>${d.cta.label} <span aria-hidden="true">→</span></em></span></a>`; }).join("")}</div>`;
hero.appendChild(cards);
const track = cards.querySelector(".mcards__track");
const cardStep = () => { const c = track.children; return c.length > 1 ? c[1].offsetLeft - c[0].offsetLeft : 1; };
let syncing = false, ticking = false, cardsOut = 0;
cards.querySelector(".mcards__x").addEventListener("click", () => closeDrawer());
/* Al deslizar: en cuanto la tarjeta siguiente pasa de la mitad, el mapa ya va hacia su edificio */
track.addEventListener("scroll", () => {
  if(syncing || !active || ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const id = ORDER[Math.max(0, Math.min(ORDER.length - 1, Math.round(track.scrollLeft / cardStep())))];
    if(id !== active) focusProject(id, true);
  });
}, { passive: true });
function focusProject(id, quick){
  active = id;
  ORDER.forEach(k => pinEls[k].setAttribute("aria-expanded", String(k === id)));
  [...track.children].forEach(c => c.classList.toggle("is-on", c.dataset.id === id));
  animateTo(focusVB(id), quick);
  history.replaceState(null, "", location.pathname + location.search + "#" + id);
}
function openCards(id){
  map.classList.add("focus"); hero.classList.add("is-zoomed");
  scrollTo(0, 0); lockPage();
  document.body.classList.add("drawer-open", "cards-open");
  clearTimeout(cardsOut); cards.classList.remove("is-closing");
  const at = ORDER.indexOf(id);
  [...track.children].forEach((c, i) => c.style.setProperty("--i", Math.abs(i - at)));   // primero la tarjeta pulsada, luego las vecinas
  syncing = true; track.scrollLeft = at * cardStep();   // sin animación: aparece ya en su tarjeta
  requestAnimationFrame(() => { syncing = false; });
  focusProject(id);
}

/* En móvil, con el panel abierto la página de detrás no se mueve (también en iOS) */
let lockY = 0, locked = false;
function lockPage(){
  if(locked || !mobile()) return;
  lockY = scrollY; locked = true;
  Object.assign(document.body.style, { position:"fixed", top:(-lockY) + "px", left:"0", right:"0", width:"100%" });
}
function unlockPage(){
  if(!locked) return; locked = false;
  Object.assign(document.body.style, { position:"", top:"", left:"", right:"", width:"" });
  scrollTo(0, lockY);
}

function openDrawer(id){
  if(mobile()) return openCards(id);   // en móvil, tarjetas en lugar del panel
  const p = PROJECTS[id], d = SUMMARY[id];
  drawer.dataset.c = p.c;
  drawer.innerHTML = `
    <div class="dr-bar"><div class="rise" style="--i:0"><p class="chip">${UI.summary} · ${p.name}</p><h2>${d.headline}</h2></div><button class="x" aria-label="${UI.close}">${X_ICON}</button></div>
    <div class="dr-body">${summaryBody(d)}</div>
    <div class="dr-foot"><a class="dr-cta rise" style="--i:7" href="${d.cta.href}"><span>${d.cta.label} →</span>${d.cta.time ? `<small>${d.cta.time}</small>` : ""}</a></div>`;
  drawer.querySelector(".x").onclick = closeDrawer;
  drawer.querySelectorAll(".js-zoom").forEach(z => z.onclick = () => openViewer(z.querySelector("img")));
  drawer.querySelector(".dr-body").scrollTop = 0;
  active = id;
  ORDER.forEach(k => pinEls[k].setAttribute("aria-expanded", String(k === id)));
  map.classList.add("focus"); hero.classList.add("is-zoomed");
  if(mobile()){ scrollTo(0, 0); lockPage(); } else if(scrollY > 0) scrollTo({ top:0, behavior: reduce ? "auto" : "smooth" });
  drawer.classList.add("open"); document.body.classList.add("drawer-open");
  animateTo(focusVB(id));
  requestAnimationFrame(() => drawer.querySelector(".x").focus({ preventScroll: true }));
  if(location.hash !== "#" + id) history.replaceState(null, "", location.pathname + location.search + "#" + id);
}
function closeDrawer(){
  if(!active) return;
  const was = active; active = null;
  drawer.classList.remove("open"); document.body.classList.remove("drawer-open"); unlockPage();
  /* Las tarjetas bajan y se van antes de ocultarse */
  if(document.body.classList.contains("cards-open")){
    cards.classList.add("is-closing");
    cardsOut = setTimeout(() => { document.body.classList.remove("cards-open"); cards.classList.remove("is-closing"); }, reduce ? 0 : 240);
  }
  map.classList.remove("focus"); hero.classList.remove("is-zoomed");
  ORDER.forEach(k => pinEls[k].setAttribute("aria-expanded", "false"));
  animateTo(base);
  pinEls[was].focus({ preventScroll: true });
  history.replaceState(null, "", location.pathname + location.search);
}
const toggle = id => active === id ? closeDrawer() : openDrawer(id);

document.addEventListener("click", e => {
  if(active && !viewer && !drawer.contains(e.target) && !e.target.closest(".pin, .hit, .proj, .mcards, .lightbox")) closeDrawer();
});
document.addEventListener("keydown", e => { if(e.key === "Escape") closeDrawer(); });   // el visor se cierra antes (js/comun.js)

addEventListener("resize", frame);
new ResizeObserver(frame).observe(map);
frame();

/* Enlace directo: index.html#pagopero abre ese resumen */
const fromHash = () => { const id = location.hash.slice(1); if(PROJECTS[id] && active !== id) openDrawer(id); };
addEventListener("hashchange", fromHash); fromHash();

/* Nombre de la portada → barra: al hacer scroll, «David Chia» encoge y sube hasta el nombre
   de la barra, que aparece justo cuando el grande se desvanece. Arriba del todo, la barra no lo repite. */
(() => {
  const name = document.querySelector(".intro-home h1"), bar = document.querySelector(".back-nav--home");
  const target = bar && bar.querySelector(".brand__t b");
  if(!name || !target) return;
  const S = 150;   // recorrido de la transformación, en px de scroll
  let n0 = null;
  const measure = () => {
    name.style.transform = "none";
    const r = name.getBoundingClientRect();
    n0 = { x: r.left, y: r.top + scrollY, fs: parseFloat(getComputedStyle(name).fontSize) };
  };
  const update = () => {
    const s = Math.max(0, scrollY), p = Math.min(1, s / S);
    bar.classList.toggle("is-top", p < .85);
    if(reduce){ return; }
    if(!n0) measure();
    const t = target.getBoundingClientRect(), k = parseFloat(getComputedStyle(target).fontSize) / n0.fs;
    const e = p * (2 - p);   // desacelera al llegar
    /* Sin transformar, el nombre sube con la página (n0.y - s); se compensa el scroll (+ s) y se lleva hasta la barra */
    const dx = (t.left - n0.x) * e, dy = (t.top - n0.y) * e + s;
    name.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + (1 - (1 - k) * e) + ")";
    name.style.opacity = p < .7 ? 1 : Math.max(0, 1 - (p - .7) / .25);
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", () => { n0 = null; update(); });
  /* La entrada (animación rise) usa transform: se mide cuando termina */
  name.addEventListener("animationend", () => { name.style.animation = "none"; n0 = null; update(); }, { once: true });
  if(scrollY > 0) update();
})();
