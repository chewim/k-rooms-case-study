/* =========================================================================
   comun.js · Comportamiento compartido por todas las páginas
   ========================================================================= */

/* sessionStorage puede fallar (ventana privada, datos bloqueados): todo funciona igual sin él */
const store = (k, v) => { try { sessionStorage.setItem(k, v); } catch {} };
const read = k => { try { return sessionStorage.getItem(k); } catch { return null; } };

/* Al volver atrás, la página aparece donde la dejaste (también si el navegador no la guardó en memoria) */
if("scrollRestoration" in history) history.scrollRestoration = "manual";
addEventListener("pagehide", () => store("scroll:" + location.pathname, String(scrollY)));

document.addEventListener("DOMContentLoaded", () => {

  const nav = performance.getEntriesByType("navigation")[0];
  const y = +read("scroll:" + location.pathname);
  if(nav && nav.type === "back_forward" && y && !location.hash) requestAnimationFrame(() => scrollTo(0, y));

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
    const text = b.dataset.copy, label = b.textContent;
    try { await navigator.clipboard.writeText(text); b.textContent = document.documentElement.lang === "en" ? "Copied ✓" : "Copiado ✓"; } catch { b.textContent = text; }
    setTimeout(() => b.textContent = label, 1800);
  }));

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
