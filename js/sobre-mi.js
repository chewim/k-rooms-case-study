/* =========================================================================
   sobre-mi.js · Ilustraciones de «Lo que aporto», con el dibujo isométrico de la ciudad
   (js/ciudad/iso.js y css/dibujo.css). Cada capacidad, una escena pequeña.
   ========================================================================= */
(() => {
  const tile = (x0, y0, x1, y1, cls) => flat([[x0,y0],[x1,y0],[x1,y1],[x0,y1]], 0, cls);
  const SCENES = {
    /* 01 Strategy: piezas sueltas y desordenadas a un lado; al otro, un edificio ordenado */
    strategy: () => tile(0,0,2.3,1.3,"pb-p")
      + box(.12,.2,0,.28,.28,.28,"n") + box(.5,.62,0,.2,.2,.2,"n") + box(.14,.78,0,.24,.18,.4,"n")
      + line([[.95,.65,0],[1.25,.65,0]], "pole")
      + box(1.35,.2,0,.8,.85,1.05,"pb") + winsY(1.43,2.07,1.05,.12,.95,3,3,"win") + winsX(2.15,.28,.97,.12,.95,3,3,"win"),
    /* 02 People: usuario, negocio y ejecución, alrededor de la misma mesa */
    people: () => tile(0,0,1.7,1.7,"pp-p")
      + person(.45,.6,0,"p-a",1.7) + person(.85,.32,0,"p-c",1.7)
      + line([[.85,.85,0],[.85,.85,.38]], "pole") + cyl(.85,.85,.38,.3,.05,"n") + cyl(.78,.8,.43,.05,.1,"gl") + cyl(.94,.9,.43,.05,.1,"gl")
      + person(1.3,.95,0,"p-b",1.7),
    /* 03 Build: dos plantas hechas, la tercera en estructura y una pieza que llega colgada de la grúa */
    build: () => tile(0,0,2.4,1.7,"kr-p")
      + box(.1,.1,0,1.0,1.0,.45,"kr") + box(.1,.1,.45,1.0,1.0,.45,"kr")
      + winsY(.18,1.02,1.1,.08,.38,3,1,"krw") + winsX(1.1,.18,1.02,.08,.38,3,1,"krw")
      + winsY(.18,1.02,1.1,.53,.83,3,1,"krw") + winsX(1.1,.18,1.02,.53,.83,3,1,"krw")
      + [[.1,.1],[1.1,.1],[1.1,1.1],[.1,1.1]].map(([x,y]) => line([[x,y,.9],[x,y,1.3]], "pole")).join("")
      + line([[1.55,.6,0],[1.55,.6,2.05]], "pole") + line([[1.55,.6,2.05],[.6,.6,2.05]], "pole") + line([[.6,.6,2.05],[.6,.6,1.78]], "pole")
      + box(.42,.42,1.48,.36,.36,.3,"kr")
      + person(2.05,.75,0,"p-a",1.6),
    /* 04 Validation: un cruce con dos direcciones; alguien se para a decidir */
    validation: () => tile(0,0,2.0,1.8,"pb-p")
      + flat([[.15,1.25],[.85,.95],[.95,1.15],[.25,1.45]], 0, "n-t")
      + flat([[.85,.95],[1.85,.45],[1.95,.65],[.95,1.15]], 0, "n-t")
      + flat([[.85,.95],[1.05,.1],[1.25,.15],[.95,1.15]], 0, "n-t")
      + box(1.15,.7,.92,.06,.55,.18,"pb") + box(.8,1.05,.62,.55,.06,.18,"n")
      + line([[1.18,1.08,0],[1.18,1.08,1.12]], "pole sign-pole")
      + person(.45,1.3,0,"p-c",1.6)
  };
  document.querySelectorAll(".cap__ill").forEach(el => {
    const draw = SCENES[el.dataset.ill]; if(!draw) return;
    el.innerHTML = `<svg><g>${draw()}</g></svg>`;
    const svg = el.querySelector("svg"), b = svg.querySelector("g").getBBox(), pad = 6;
    svg.setAttribute("viewBox", [b.x - pad, b.y - pad, b.width + pad*2, b.height + pad*2].map(f).join(" "));
  });
})();
