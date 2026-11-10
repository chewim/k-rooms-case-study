/* =========================================================================
   ciudad/datos.js · Contenido de los tres proyectos, en castellano e inglés
   Textos de davidchia.es (también su versión en inglés), de los casos de
   K Rooms y Pujobaixo y de la documentación de Pagopero. Si cambia un texto,
   se cambia aquí, en los dos idiomas: T("castellano", "inglés").
   La página en inglés (en/index.html) lleva <html lang="en">.
   ========================================================================= */

const LANG = document.documentElement.lang === "en" ? "en" : "es";
const T = (es, en) => LANG === "en" ? en : es;
/* Las páginas en inglés usan <base href="../">: sus enlaces internos van a en/ */
const PAGE = file => T(file, "en/" + file);

/* Textos de la interfaz de la ciudad */
const UI = {
  seeSummary: T("Ver resumen", "View summary"),
  summary:    T("Resumen", "Summary"),
  summaryOf:  T("Resumen del proyecto", "Project summary"),
  close:      T("Cerrar resumen", "Close summary"),
  closeImg:   T("Cerrar imagen", "Close image"),
  enlarge:    T("Ampliar imagen: ", "Enlarge image: "),
  facts:      T("Ficha", "Key facts"),
  projects:   T("Proyectos", "Projects")
};

/* Orden de los pins y de las tarjetas */
const ORDER = ["pujo-baixo", "k-rooms", "pagopero"];

/* Nombre, color (pb · kr · pp), titular corto (vista previa y tarjetas)
   y, si la hay, foto de uso que aparece al pasar el ratón por el chip: [archivo, texto alternativo, encuadre opcional] */
const PROJECTS = {
  "pujo-baixo": { c:"pb", name:"Pujo Baixo",
                  title:T("¿Tienes plazas libres cuando bajas a Barcelona?", "Got free seats when you drive down to Barcelona?"),
                  hover:["img/pujobaixo/uso-app.webp", T("Una persona en una parada junto a la carretera consulta en el móvil la lista de viajes de Pujobaixo", "A person at a roadside stop checks the Pujobaixo trip list on their phone")] },
  "k-rooms":    { c:"kr", name:"K Rooms",
                  title:T("Gestión de habitaciones con una webapp", "Room management with a web app"),
                  hover:["img/krooms/uso-real.webp", T("Una persona consulta en el móvil el Mapa de la casa de K Rooms, en una mesa junto a un cuaderno con la lista de recepción", "A person checks the K Rooms house map on their phone, at a table next to a notebook with the reception to-do list"), "62% 50%"] },
  "pagopero":   { c:"pp", name:"Pagopero",
                  title:T("Apunta quién te debe, comparte el enlace y marca quién ya ha pagado.", "Track who owes you, share the link and tick off who has paid."),
                  hover:["img/pagopero/uso-real.webp", T("Móvil con la lista de Pagopero en la barra de un bar", "Phone showing a Pagopero list on a bar counter"), "60% 64%"] }
};

/* Panel de resumen: mismo esquema para los tres
   (titular, una frase, tres cifras, mockup, ficha de cuatro filas y «Ver más»).
   El mockup es también la imagen del proyecto bajo el mapa. */
const SUMMARY = {
  "pujo-baixo": {
    headline: T("De un experimento en WhatsApp a una red local escalable", "From a WhatsApp experiment to a scalable local network"),
    lead: T("Una red para compartir trayectos entre el Berguedà y Barcelona, nacida de observar cómo se coordinaba la gente en un grupo de WhatsApp.",
            "A network for sharing rides between Berguedà and Barcelona, born from watching how people coordinated in a WhatsApp group."),
    kpis: [["111", T("perfiles registrados", "registered profiles")], ["2", T("caminos: ofrezco y necesito", "paths: offering and needing")], [T("0 €", "€0"), T("de comisión", "commission")]],
    img: ["img/pujobaixo/mockup.jpg", T("Pujobaixo en móvil: lista de viajes con las pestañas Ofereixo y Necessito", "Pujobaixo on mobile: trip list with the Ofereixo and Necessito tabs")],
    facts: [[T("Rol","Role"), "UX Researcher · Product Owner"], [T("Proyecto","Project"), T("Producto propio en evolución", "Own product, evolving")],
            [T("Sector","Sector"), T("Movilidad · Comunidad", "Mobility · Community")], [T("Producto","Product"), "pujobaixo.cat"]],
    cta: { label:T("Ver más", "See more"), time:T("Galería y decisiones", "Gallery and decisions"), href:PAGE("pujobaixo.html") } },
  "k-rooms": {
    headline: T("K Rooms como única fuente de información y gestión", "K Rooms as the single source of information and management"),
    lead: T("Centralizar la información para evitar pérdidas de comunicación y errores de organización.",
            "Centralizing information to prevent communication gaps and organizational errors."),
    kpis: [["40", T("habitaciones", "rooms")], [T("2.000", "2,000"), T("residentes al año", "residents a year")], ["90", T("eventos al año", "events a year")]],
    img: ["img/krooms/mockup-desktop.jpg", T("K Rooms en escritorio: el Mapa de la casa con el plano de la planta tercera y, encima, el formulario de nueva Residència",
                                             "K Rooms on desktop: the house map with the third-floor plan and, on top, the new Residency form")],
    facts: [[T("Rol","Role"), T("Product designer y product builder", "Product designer and product builder")], [T("Proyecto","Project"), T("Encargo a medida para Konvent, 2026", "Custom commission for Konvent, 2026")],
            [T("Plataforma","Platform"), T("Webapp responsive", "Responsive web app")], ["MVP", T("15 días", "15 days")]],
    cta: { label:T("Ver más", "See more"), time:T("Galería y decisiones", "Gallery and decisions"), href:PAGE("k-rooms.html") } },
  "pagopero": {
    headline: T("Apunta quién te debe, comparte el enlace y marca quién ya ha pagado.", "Track who owes you, share the link and tick off who has paid."),
    lead: T("Una lista compartida de pagos que siempre está actualizada. El pago es por Bizum, fuera de la app.",
            "A shared payment list that is always up to date. Payment happens by Bizum, outside the app."),
    kpis: [["3", T("pasos para crear y compartir", "steps to create and share")], ["0", T("cuentas para quien paga", "accounts for whoever pays")], [T("0 €", "€0"), T("pasan por la app", "goes through the app")]],
    img: ["img/pagopero/mockup.jpg", T("Pagopero en móvil: seguimiento de Cena del viernes con Recuperado 14,50 € de 43,50 € y Luis marcado como pagado",
                                       "Pagopero on mobile: tracking for Friday dinner, with €14.50 of €43.50 recovered and Luis marked as paid")],
    facts: [[T("Rol","Role"), T("Branding, diseño y desarrollo", "Branding, design and build")], [T("Proyecto","Project"), T("Producto propio · 2026", "Own product · 2026")],
            [T("Plataforma","Platform"), T("Webapp móvil (PWA)", "Mobile web app (PWA)")], [T("Estado","Status"), T("Online en pagopero.com", "Live at pagopero.com")]],
    cta: { label:T("Ver más", "See more"), time:T("Galería y decisiones", "Gallery and decisions"), href:PAGE("pagopero.html") } }
};
