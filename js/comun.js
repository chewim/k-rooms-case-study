/* =========================================================================
   comun.js · Comportamiento compartido por todas las páginas
   ========================================================================= */

/* sessionStorage puede fallar (ventana privada, datos bloqueados): todo funciona igual sin él */
const store = (k, v) => { try { sessionStorage.setItem(k, v); } catch {} };
const read = k => { try { return sessionStorage.getItem(k); } catch { return null; } };

const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Visor de imágenes (común a la ciudad y a las páginas) ----------
   La imagen crece desde su miniatura y, al cerrar, vuelve a ella. Esc o un toque cierran. */
let viewer = null;
function openViewer(thumb){
  if(viewer || !thumb) return;
  const back = thumb.closest("button") || thumb;
  const box = document.createElement("div");
  box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", thumb.alt);
  const close = document.documentElement.lang === "en" ? "Close image" : "Cerrar imagen";
  box.innerHTML = `<img src="${thumb.currentSrc || thumb.src}" alt="${thumb.alt}"><button type="button" aria-label="${close}"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg></button>`;
  box.addEventListener("click", closeViewer);
  document.body.appendChild(box);
  viewer = { box, thumb, back };
  box.querySelector("button").focus({ preventScroll: true });
  flip(box.querySelector("img"), thumb, false);
}
function closeViewer(e){
  if(e) e.stopPropagation();
  if(!viewer || viewer.closing) return;
  const { box, thumb, back } = viewer; viewer.closing = true;
  box.classList.add("is-closing");
  const done = () => { box.remove(); viewer = null; back.focus({ preventScroll: true }); };
  const r = thumb.getBoundingClientRect(), visible = r.bottom > 0 && r.top < innerHeight && r.width > 0;
  if(REDUCE) return done();
  if(visible) flip(box.querySelector("img"), thumb, true).finished.then(done, done);
  else setTimeout(done, 260);
}
/* FLIP: anima la imagen grande desde (o hacia) el rectángulo de la miniatura */
function flip(big, thumb, reverse){
  const a = thumb.getBoundingClientRect(), b = big.getBoundingClientRect();
  if(REDUCE || !b.width || !a.width) return { finished: Promise.resolve() };
  const dx = (a.left + a.width/2) - (b.left + b.width/2), dy = (a.top + a.height/2) - (b.top + b.height/2), k = a.width / b.width;
  const from = { transform:`translate(${dx}px, ${dy}px) scale(${k})`, opacity: .6 }, to = { transform:"none", opacity: 1 };
  return big.animate(reverse ? [to, from] : [from, to],
    { duration: reverse ? 260 : 420, easing: reverse ? "cubic-bezier(.4,0,1,1)" : "cubic-bezier(.2,.9,.25,1)", fill: "both" });
}
/* Esc cierra primero el visor (antes que el panel que haya debajo) */
addEventListener("keydown", e => { if(e.key === "Escape" && viewer){ e.stopImmediatePropagation(); closeViewer(); } }, true);

/* Al volver atrás, la página aparece donde la dejaste (también si el navegador no la guardó en memoria) */
if("scrollRestoration" in history) history.scrollRestoration = "manual";
addEventListener("pagehide", () => store("scroll:" + location.pathname, String(scrollY)));

document.addEventListener("DOMContentLoaded", () => {

  /* Imágenes ampliables de las páginas (.js-zoom); las del panel de la ciudad se enganchan al crearlo */
  document.querySelectorAll(".js-zoom").forEach(b => b.addEventListener("click", () => openViewer(b.querySelector("img"))));

  /* Lectura gradual: cada bloque aparece al entrar en pantalla. Lo que ya está a la vista al cargar
     no se toca (su entrada es CSS, ver caso.css); al volver atrás, lo ya leído aparece sin animación. */
  const blocks = [...document.querySelectorAll(".case-head, .gallery, .intro, .row, .media, .next, .proj, .list-title, .rv-item")];
  if(blocks.length && "IntersectionObserver" in window && !REDUCE){
    document.documentElement.classList.add("reveal");
    blocks.forEach(el => el.classList.add("rv"));
    /* Lo que ya está a la vista al cargar no se esconde: su entrada la hace el CSS desde el primer pintado
       (caso.css, «Entrada de la página»). Solo se animan con .rv los bloques que llegan al hacer scroll. */
    blocks.forEach(el => { if(el.getBoundingClientRect().top < innerHeight * .92) el.classList.add("is-in"); });
    /* Lo que entra a la vez aparece escalonado (titular, texto, imagen…), 70 ms entre uno y otro */
    const io = new IntersectionObserver(es => {
      es.filter(en => en.isIntersecting).forEach((en, k) => {
        en.target.style.setProperty("--rv-d", (k * 70) + "ms");
        en.target.classList.add("is-in"); io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    blocks.filter(el => !el.classList.contains("is-in")).forEach(el => io.observe(el));
  }

  const nav = performance.getEntriesByType("navigation")[0];
  const y = +read("scroll:" + location.pathname);
  if(nav && nav.type === "back_forward" && y && !location.hash) requestAnimationFrame(() => scrollTo(0, y));

  /* El carrusel (galería, «Mi enfoque») también recuerda dónde estaba: al volver de un proyecto
     se ve la tarjeta desde la que entraste, no la primera */
  const strip = document.getElementById("strip");
  if(strip){
    addEventListener("pagehide", () => store("strip:" + location.pathname, String(strip.scrollLeft)));
    const x = +read("strip:" + location.pathname);
    if(nav && nav.type === "back_forward" && x){
      /* Cuando la página ha terminado de cargar: antes, el navegador vuelve a ponerlo al principio */
      const go = () => { strip.style.scrollBehavior = "auto"; strip.scrollLeft = x; strip.style.scrollBehavior = ""; };
      if(document.readyState === "complete") setTimeout(go, 0); else addEventListener("load", () => setTimeout(go, 0), { once: true });
    }
  }

  /* Navegación interna: se anota al pulsar un enlace del propio portfolio.
     (En file:// el navegador no da document.referrer, así que no sirve para saberlo.) */
  document.addEventListener("click", e => {
    const l = e.target.closest("a[href]");
    if(l && !l.target && !l.hasAttribute("download") && l.origin === location.origin && !/^(mailto|tel):/.test(l.href)) store("navInternal", "1");
  });

  /* Flecha atrás: si llegaste navegando por el portfolio, vuelve al punto exacto
     (historial: mismo scroll y, si venías del resumen, el resumen abierto). Si no, va a la ciudad. */
  document.querySelectorAll("[data-back]").forEach(a => a.addEventListener("click", e => {
    if(read("navInternal") === "1" && history.length > 1){ e.preventDefault(); history.back(); }
  }));

  /* Copiar el email */
  document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    const t = b.querySelector(".copy__t") || b, text = b.dataset.copy, label = t.textContent;   // solo cambia el texto; el icono se queda
    try { await navigator.clipboard.writeText(text); t.textContent = document.documentElement.lang === "en" ? "Copied ✓" : "Copiado ✓"; } catch { t.textContent = text; }
    setTimeout(() => t.textContent = label, 1800);
  }));

  /* Barra superior: la línea inferior solo aparece cuando hay contenido pasando por debajo */
  const bar = document.querySelector(".back-nav");
  if(bar){
    const onScroll = () => bar.classList.toggle("is-scrolled", scrollY > 4);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Cápsula fija inferior: visible hasta que aparece el bloque «¿Seguimos hablando?» */
  const fab = document.querySelector(".fab"), talk = document.querySelector(".talk");
  if(fab && talk){
    const check = () => fab.classList.toggle("is-hidden", talk.getBoundingClientRect().top < innerHeight - 40);
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    check();
  }

  /* Estado rotatorio: una sola frase a la vez */
  if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
    document.querySelectorAll(".rot").forEach(rot => {
      const items = [...rot.children]; let i = 0;
      const fit = el => rot.style.width = el.offsetWidth + "px";   // la caja mide lo que la frase visible
      fit(items[0]); addEventListener("resize", () => fit(items[i]));
      setInterval(() => {
        const a = items[i]; a.classList.remove("on"); a.classList.add("out");
        i = (i + 1) % items.length;
        const b = items[i]; b.classList.remove("out"); b.classList.add("on");
        fit(b);
        setTimeout(() => a.classList.remove("out"), 400);
      }, 3000);
    });
  } else {
    document.querySelectorAll(".rot").forEach(rot => rot.style.width = rot.querySelector(".on").offsetWidth + "px");
  }
});
