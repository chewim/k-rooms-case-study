/* =========================================================================
   caso.js · Páginas de proyecto y Sobre mí: flechas de la galería
   ========================================================================= */
(() => {
  /* Flechas de la galería: avanzan una pieza */
  const strip = document.getElementById("strip");
  if(strip){
    const step = () => (strip.querySelector(".shot")?.getBoundingClientRect().width || 300) + 16;
    document.getElementById("prev")?.addEventListener("click", () => strip.scrollBy({ left: -step(), behavior: "smooth" }));
    document.getElementById("next")?.addEventListener("click", () => strip.scrollBy({ left: step(), behavior: "smooth" }));
  }

  /* Índice de capítulos (casos editoriales): marca el capítulo que se está leyendo y,
     en escritorio, el índice lateral se aparta al llegar al bloque final */
  const chapters = [...document.querySelectorAll(".ch[id]")];
  const tocLinks = [...document.querySelectorAll(".toc a")];
  if(chapters.length && tocLinks.length){
    const side = document.querySelector(".toc--side"), talk = document.querySelector(".talk");
    const inline = document.querySelector(".toc--inline"), bar = document.querySelector(".back-nav");
    let last = null;
    const update = () => {
      const y = innerHeight * .35;
      let cur = chapters[0];
      chapters.forEach(c => { if(c.getBoundingClientRect().top <= y) cur = c; });
      tocLinks.forEach(a => {
        const on = a.getAttribute("href").endsWith("#" + cur.id);   // en inglés el enlace lleva la ruta de la página
        a.classList.toggle("is-on", on);
        on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
      });
      /* El índice lateral no se superpone a la foto de portada ni al bloque final */
      const coverImg = document.querySelector(".cover__img");
      const overCover = coverImg && coverImg.getBoundingClientRect().bottom > innerHeight * .45;
      const atEnd = talk && talk.getBoundingClientRect().top < innerHeight * .8;
      if(side) side.classList.toggle("is-away", !!(overCover || atEnd));
      /* Índice horizontal (tableta y móvil): fijo bajo la barra en cuanto llega a ella */
      if(inline && inline.offsetParent){
        const stuck = inline.getBoundingClientRect().top < (bar ? bar.getBoundingClientRect().bottom : 0);
        inline.classList.toggle("is-stuck", stuck);
        inline.classList.toggle("is-away", !!atEnd);
        document.body.classList.toggle("toc-stuck", stuck && !atEnd);
        /* La pastilla del capítulo activo, siempre a la vista */
        if(cur !== last){
          const a = inline.querySelector("a.is-on"), ol = inline.querySelector("ol");
          if(a && ol) ol.scrollTo({ left: ol.scrollLeft + a.getBoundingClientRect().left - ol.getBoundingClientRect().left - ol.clientWidth / 2 + a.offsetWidth / 2,
                                    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        }
      }
      last = cur;
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* El visor de imágenes es común a todo el portfolio: js/comun.js (openViewer) */
})();
