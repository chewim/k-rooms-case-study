/* =========================================================================
   caso.js · Páginas de proyecto y Sobre mí: flechas de la galería y visor
   ========================================================================= */
(() => {
  /* Flechas de la galería: avanzan una pieza */
  const strip = document.getElementById("strip");
  if(strip){
    const step = () => (strip.querySelector(".shot")?.getBoundingClientRect().width || 300) + 16;
    document.getElementById("prev")?.addEventListener("click", () => strip.scrollBy({ left: -step(), behavior: "smooth" }));
    document.getElementById("next")?.addEventListener("click", () => strip.scrollBy({ left: step(), behavior: "smooth" }));
  }

  /* Visor: cualquier botón .js-zoom amplía su imagen */
  let box = null, back = null;
  const CLOSE = document.documentElement.lang === "en" ? "Close image" : "Cerrar imagen";
  const X = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg>';
  const close = () => { if(!box) return; box.remove(); box = null; back && back.focus({ preventScroll: true }); };
  document.querySelectorAll(".js-zoom").forEach(b => b.addEventListener("click", () => {
    const img = b.querySelector("img"); if(!img) return; back = b;
    box = document.createElement("div");
    box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", img.alt);
    box.innerHTML = `<img src="${img.currentSrc || img.src}" alt="${img.alt}"><button type="button" aria-label="${CLOSE}">${X}</button>`;
    box.addEventListener("click", close);
    document.body.appendChild(box);
    box.querySelector("button").focus({ preventScroll: true });
  }));
  document.addEventListener("keydown", e => { if(e.key === "Escape") close(); });
})();
