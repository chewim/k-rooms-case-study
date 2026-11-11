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

  /* El visor de imágenes es común a todo el portfolio: js/comun.js (openViewer) */
})();
