/* =========================================================================
   ciudad/escena.js · La ciudad: edificios, calles, gente y animaciones
   Partes: coche · objetos de la escena (proyectos y relleno) · suelo ·
   ciudad de alrededor generada · dibujo · animación de entrada y vida.
   Cada objeto lleva k (profundidad x+y) para dibujarse de atrás adelante.
   ========================================================================= */

/* ---------- Coche de Pujo Baixo (con cuatro personas y el parabrisas) ---------- */
function car(){
  const x0 = 1.52, w = .62;
  return box(x0, 0, .1, w, 1.15, .26, "pb")
    + person(x0+.16, .4, .32, "p-a", .88) + person(x0+.45, .4, .32, "p-c", .88)
    + person(x0+.16, .72, .32, "p-b", .88) + person(x0+.45, .72, .32, "p-a", .88)
    + shape([[x0+.03,1.0,.36],[x0+w-.03,1.0,.36],[x0+w-.03,.92,.6],[x0+.03,.92,.6]], "glass")
    + wheel(x0+w+.005, .28, .12, .12) + wheel(x0+w+.005, .92, .12, .12);
}
const carXY = t => [-t*C*U, t*S*U];

/* ---------- Objetos de la escena ---------- */
const objs = [];
const add = (k, dist, fn) => objs.push({ k, dist, fn });

/* Relleno neutro cercano: torre y bloque al fondo, casas delante */
add(5.6, null, () => box(3.4,.8,0,1.6,1.6,2.6,"n") + winsY(3.55,4.85,2.4,.3,2.4,3,5,"win") + winsX(5.0,.95,2.25,.3,2.4,3,5,"win"));
add(8.6, null, () => box(3.7,3.4,0,1.7,1.6,1.1,"n") + winsY(3.85,5.25,5.0,.25,.9,4,2,"win") + winsX(5.4,3.55,4.85,.25,.9,3,2,"win") + box(4.1,3.7,1.1,.5,.5,.22,"n"));
add(14.1, null, () => box(3.4,8.4,0,1.3,1.1,.7,"n") + winsY(3.55,4.55,9.5,.12,.55,2,1,"win") + gableY(3.4,8.4,.7,1.3,1.1,.45,"n"));
add(16.0, null, () => box(3.4,10.3,0,1.3,1.1,.65,"n") + winsY(3.55,4.55,11.4,.12,.52,2,1,"win") + gableY(3.4,10.3,.65,1.3,1.1,.42,"n"));
add(15.4, null, () => box(5.1,8.9,0,1.2,1.7,.95,"n") + winsX(6.3,9.05,10.45,.18,.75,3,2,"win") + winsY(5.25,6.15,10.6,.18,.75,2,2,"win") + gableX(5.1,8.9,.95,1.2,1.7,.5,"n"));
[[.4,1.4],[.4,3.6],[.4,8.6],[.4,10.8],[11.4,1.9],[11.4,3.5],[11.4,5.3],[5.7,5.5],[5.9,.6],[6.9,8.8],[7.3,11.3],[11.6,8.3]]
  .forEach(([x,y]) => add(x+y, null, () => tree(x,y)));

/* K Rooms: casa de huéspedes / centro cultural con habitaciones que se encienden */
add(11.0, "kr", () => {
  const X0 = 6.4, X1 = 10.6, Y0 = 1.4, Y1 = 3.6, H = 2.05;
  let r = box(X0, Y0, 0, X1-X0, Y1-Y0, H, "kr");
  r += rectY(7.45, 9.55, Y1, 0, .68, "glass") + [7.97, 8.5, 9.02].map(x => line([[x,Y1,0],[x,Y1,.68]], "mull")).join("");
  r += winsY(6.5, 7.35, Y1, .15, .68, 2, 1, "krw") + winsY(9.65, 10.5, Y1, .15, .68, 2, 1, "krw");
  r += winsX(X1, Y0+.1, Y1-.1, .15, .68, 3, 1, "krw");
  r += winsY(6.5, 10.5, Y1, .95, 2.0, 7, 2, "krw room") + winsX(X1, Y0+.1, Y1-.1, .95, 2.0, 3, 2, "krw room");
  r += [0, 2, 4, 6].map(i => { const cw = 4/7, a = 6.5+i*cw+cw*.12, b = 6.5+(i+1)*cw-cw*.12; return box(a, Y1, .97, b-a, .16, .05, "kr"); }).join("");
  r += [7.3, 8.5, 9.7].map(x => cyl(x, 4.15, 0, .045, .72, "n")).join("");
  r += box(7.05, Y1, .72, 3.1, .72, .2, "kr") + textY(7.55, Y1+.72, .77, "K ROOMS", 8.5, "sign kr-ink");
  r += gableX(X0, Y0, H, X1-X0, Y1-Y0, .75, "kr");
  r += [7.2, 8.6, 10.0].map(x => box(x-.25, Y1-.75, H, .5, .32, .32, "kr") + rectY(x-.15, x+.15, Y1-.43, H+.06, H+.26, "krw room")).join("");
  return r;
});
/* Quien llega con la maleta: cruza la plaza hasta la puerta de cristal, entra (se desvanece bajo la marquesina) y vuelve a empezar */
add(13.5, "kr", () => {
  const X = 7.9, Y = 5.6;                 // salida: a la derecha de la plaza, lejos del chip de Pagopero en móvil
  const [ax, ay] = P(X,Y), [bx, by] = P(7.5,4.5);   // llegada: el borde de la marquesina, ante la puerta de cristal
  return `<g class="arrive" style="--dx:${f(bx-ax)}px;--dy:${f(by-ay)}px"><g class="arrive-step">`
    + person(X,Y,0,"p-a") + box(X+.14,Y-.1,0,.1,.2,.24,"kr") + line([[X+.19,Y-.04,.24],[X+.19,Y-.04,.36],[X+.19,Y+.04,.36],[X+.19,Y+.04,.24]], "pole")
    + `</g></g>`;
});
add(14.7, "kr", () => person(9.6,5.1,0,"p-c"));
add(15.6, "kr", () => person(10.1,5.5,0,"p-b"));

/* Pagopero: el local con toldo y la terraza con amigos charlando */
add(19.8, "pp", () =>
  box(9.6,8.4,0,1.9,1.8,1.45,"pp")
  + winsX(11.5,8.6,10.0,.35,.95,2,1,"win")
  + rectY(9.8,11.3,10.2,.05,.72,"glass")
  + [10.3,10.8].map(x => line([[x,10.2,.05],[x,10.2,.72]], "mull")).join("")
  + textY(9.86,10.2,1.04,"PAGOPERO",9,"sign pp-ink")
  + shape([[9.7,10.2,.85],[11.4,10.2,.85],[11.4,10.6,.68],[9.7,10.6,.68]], "pp-t")
  + [0,2,4,6].map(i => { const a = 9.7+i*.2125, b = a+.2125; return shape([[a,10.2,.85],[b,10.2,.85],[b,10.6,.68],[a,10.6,.68]], "pp-l"); }).join("")
  + rectY(9.7,11.4,10.6,.6,.68,"pp-r")
  + box(10.0,8.7,1.45,.5,.4,.18,"n")
);
add(19.75, "pp", () => `<g class="talk-anim s1">${person(8.75,11.0,0,"p-c")}</g>`);
add(19.8,  "pp", () => `<g class="talk-anim s3">${person(9.3,10.48,0,"p-a")}</g>`);
add(20.3,  "pp", () => line([[9.3,11.0,0],[9.3,11.0,.42]], "pole") + cyl(9.3,11.0,.42,.3,.04,"n") + cyl(9.18,10.92,.46,.05,.11,"gl") + cyl(9.42,11.06,.46,.05,.11,"gl") + cyl(9.3,11.16,.46,.05,.11,"gl"));
add(20.9,  "pp", () => `<g class="talk-anim s2">${person(9.85,11.05,0,"p-b")}</g>`);
add(24,    "pp", () => {
  const [cx, cy] = P(9.3,11.0,1.42), [ax, ay] = P(9.3,11.0,1.72), rx = .62*RX*U, ry = .62*RY*U;
  return line([[9.3,11.0,.46],[9.3,11.0,1.45]], "pole")
    + `<path class="ln pp-l" pathLength="1" ${st()} d="M${f(cx-rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx+rx)} ${f(cy)}L${f(ax)} ${f(ay)}Z"/>`
    + `<path class="ln pp-r" pathLength="1" ${st()} d="M${f(cx-rx*.25)} ${f(cy+ry*.97)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx+rx*.45)} ${f(cy+ry*.9)}L${f(ax)} ${f(ay)}Z"/>`;
});
function say(x, y, dx, txt, cls){
  const [hx, hy] = P(x,y,0), cx = hx+dx, cy = hy-30, w = 24, h = 15, tx = cx - Math.sign(dx)*6;
  return `<g class="say ${cls}"><path class="say-b" d="M${f(cx-w/2+5)} ${f(cy)}H${f(cx+w/2-5)}Q${f(cx+w/2)} ${f(cy)} ${f(cx+w/2)} ${f(cy+5)}V${f(cy+h-5)}Q${f(cx+w/2)} ${f(cy+h)} ${f(cx+w/2-5)} ${f(cy+h)}H${f(tx+3)}L${f(hx+dx*.35)} ${f(cy+h+5)}L${f(tx-3)} ${f(cy+h)}H${f(cx-w/2+5)}Q${f(cx-w/2)} ${f(cy+h)} ${f(cx-w/2)} ${f(cy+h-5)}V${f(cy+5)}Q${f(cx-w/2)} ${f(cy)} ${f(cx-w/2+5)} ${f(cy)}Z"/>`
    + `<text class="say-t" x="${f(cx)}" y="${f(cy+10.5)}" text-anchor="middle">${txt}</text></g>`;
}
add(25, "pp", () => say(8.75,11.0,-22,"···","s1") + say(9.85,11.05,20,"€","s2"));

/* Pujo Baixo: la señal y alguien esperando a que lo recojan */
add(7.4, "pb", () => {
  const [sx, sy] = P(2.75,4.7,1.0);
  return line([[2.75,4.7,0],[2.75,4.7,1.0]], "pole") + ell(sx,sy,9.5,9.5,"pb-l")
    + `<text class="fade pb-ink" ${st()} x="${f(sx)}" y="${f(sy+3.4)}" text-anchor="middle" font-size="9" font-weight="700" font-family="Figtree, sans-serif">PB</text>`;
});
add(7.0, "pb", () => `<g id="waiting">${person(2.95,4.05,0,"p-c")}</g>`);

/* ---------- Suelo: rejilla, calles y plazas de los proyectos ---------- */
const W0 = -20, W1 = 30;
const ROADS_X = [[-11.8,-10.4],[.8,2.2],[13.4,14.8],[26,27.4]];   // calles a lo largo de y
const ROADS_Y = [[-17.8,-16.4],[-5.8,-4.4],[6.2,7.6],[18.2,19.6]]; // calles a lo largo de x
function ground(){
  let s = "";
  for(let i = W0; i <= W1; i++){ D = 60 + Math.abs(i-6)*24; s += line([[i,W0,0],[i,W1,0]], "grid") + line([[W0,i,0],[W1,i,0]], "grid"); }
  D = 420;
  ROADS_X.forEach(([a,b]) => s += flat([[a,W0],[b,W0],[b,W1],[a,W1]], 0, "road"));
  ROADS_Y.forEach(([a,b]) => s += flat([[W0,a],[W1,a],[W1,b],[W0,b]], 0, "road"));
  D = 600;
  s += `<g class="fade" ${st()}>`;
  let m = "";
  ROADS_X.forEach(([a,b]) => { const c = (a+b)/2, p = P(c,W0), q = P(c,W1); m += `M${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}`; });
  ROADS_Y.forEach(([a,b]) => { const c = (a+b)/2, p = P(W0,c), q = P(W1,c); m += `M${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}`; });
  s += `<path class="mark" d="${m}"/>`;
  for(let i = 0; i < 5; i++){ const y0 = 6.32 + i*.26; s += `<path class="cross" d="M${pts([[2.4,y0,0],[2.95,y0,0],[2.95,y0+.14,0],[2.4,y0+.14,0]])}Z"/>`; }
  s += `</g>`;
  D = 650;
  s += flat([[6.2,4.0],[10.8,4.0],[10.8,5.9],[6.2,5.9]], 0, "kr-p")
     + flat([[8.0,10.3],[11.6,10.3],[11.6,11.7],[8.0,11.7]], 0, "pp-p")
     + flat([[2.25,3.6],[3.3,3.6],[3.3,5.1],[2.25,5.1]], 0, "pb-p");
  s += textRoad(1.43, 11.5, "PUJO BAIXO", 10, "paint");
  return s;
}

/* ---------- Ciudad de alrededor: manzanas neutras con semilla fija (siempre igual) ---------- */
objs.slice().sort((a,b) => a.k - b.k).forEach((o,i) => o.fd = 700 + i*55);
function rng(seed){ return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(11), rr = (a,b) => a + R()*(b-a);
const gaps = roads => { const v = [W0, ...roads.flat(), W1], o = []; for(let i = 0; i < v.length; i += 2) o.push([v[i], v[i+1]]); return o; };
gaps(ROADS_X).forEach(([ax,bx]) => gaps(ROADS_Y).forEach(([ay,by]) => {
  const SL = 2.1, nx = Math.floor((bx-ax-.3)/SL), ny = Math.floor((by-ay-.3)/SL);
  const ox = ax + (bx-ax-nx*SL)/2, oy = ay + (by-ay-ny*SL)/2;
  for(let i = 0; i < nx; i++) for(let j = 0; j < ny; j++){
    const x = ox+i*SL+.2, y = oy+j*SL+.2, w = rr(1.25,1.7), d = rr(1.25,1.7), r = R(), hh = R(), wn = R();
    const [sx, sy] = P(x+w/2, y+d/2);
    if(sx < -1000 || sx > 1000 || sy < -420 || sy > 820) continue;
    if(x+w > -.3 && x < 12.7 && y+d > -.7 && y < 12.7) continue;      // barrio de los proyectos
    const k = x+w/2+y+d/2, fd = 900 + Math.hypot(x-6, y-6)*42;
    if(r < .16) continue;
    if(r < .36){ objs.push({ k, fd, dist:null, fill:true, fn:() => tree(x+w*.35, y+d*.4) + (wn < .5 ? tree(x+w*.8, y+d*.85, .24, .8) : "") }); continue; }
    if(r < .6){
      const h = rr(.6,.9), alongX = wn < .5;
      objs.push({ k, fd, dist:null, fill:true, fn:() => box(x,y,0,w,d,h,"n") + winsY(x+.15,x+w-.15,y+d,.12,h-.15,2,1,"win")
        + (alongX ? gableX(x,y,h,w,d,.45,"n") : gableY(x,y,h,w,d,.45,"n")) });
      continue;
    }
    const h = .9 + hh*hh*2.6, rows = Math.max(1, Math.round(h/.5));
    objs.push({ k, fd, dist:null, fill:true, fn:() => box(x,y,0,w,d,h,"n")
      + (wn < .6 ? winsY(x+.12,x+w-.12,y+d,.2,h-.15,3,rows,"win") + winsX(x+w,y+.12,y+d-.12,.2,h-.15,3,rows,"win") : "") });
  }
}));

/* ---------- Dibujo: suelo, objetos de atrás adelante, coche y máscara que funde los bordes ---------- */
function build(){
  let s = ground();
  objs.slice().sort((a,b) => a.k - b.k).forEach(o => { D = o.fd; s += `<g class="o${o.fill ? " fill" : ""}" data-k="${f(o.k)}">${o.fn()}</g>`; });
  D = 2100; s += `<g id="car">${car()}</g>`;
  return `<defs><radialGradient id="fadeG" gradientUnits="userSpaceOnUse" cx="0" cy="240" r="1050"><stop offset=".42" stop-color="#fff"/><stop offset="1" stop-color="#2a2a2a"/></radialGradient>`
    + `<mask id="fadeM" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="6000" height="6000"><rect x="-3000" y="-3000" width="6000" height="6000" fill="url(#fadeG)"/></mask></defs>`
    + `<g mask="url(#fadeM)">${s}</g>`;
}
const svg = document.getElementById("city");
svg.innerHTML = build();

/* ---------- Entrada: la ciudad se dibuja solo la primera vez en cada visita ---------- */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || /still/.test(location.search);
const map = document.getElementById("map");
const seen = (() => { try { return sessionStorage.getItem("cityDrawn") === "1"; } catch { return false; } })();
if(reduce || seen){
  svg.classList.add("instant"); map.classList.add("instant");
  svg.classList.remove("pre"); map.classList.add("ready");
  requestAnimationFrame(() => requestAnimationFrame(() => { svg.classList.remove("instant"); map.classList.remove("instant"); }));
} else {
  requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.remove("pre")));
  setTimeout(() => { map.classList.add("ready"); try { sessionStorage.setItem("cityDrawn", "1"); } catch {} }, 2300);
}

/* ---------- Vida: el coche recorre la calle, recoge a quien espera y pasa por detrás de los edificios ---------- */
const carEl = document.getElementById("car"), waitEl = document.getElementById("waiting");
const objEls = [...svg.querySelectorAll("g.o")], objK = objEls.map(g => +g.dataset.k);
let carSlot = -1;
function sortCar(t){
  const kc = 1.83 + t + .575;
  let lo = 0, hi = objK.length;
  while(lo < hi){ const m = (lo+hi) >> 1; if(objK[m] <= kc) lo = m+1; else hi = m; }
  if(lo === carSlot) return;
  carSlot = lo;
  const next = objEls[lo];
  next ? next.parentNode.insertBefore(carEl, next) : objEls[objEls.length-1].parentNode.appendChild(carEl);
}
const clamp = v => Math.max(0, Math.min(1, v));
const easeOut = x => 1 - Math.pow(1-x, 3), easeIn = x => x*x*x;
function carAt(s){
  if(s < 6) return -10 + 13.4*easeOut(s/6);
  if(s < 7.7) return 3.4;
  if(s < 14.5) return 3.4 + 20*easeIn((s-7.7)/6.8);
  return 23.4;
}
function placeCar(t){
  sortCar(t);
  const [dx, dy] = carXY(t);
  carEl.setAttribute("transform", `translate(${f(dx)} ${f(dy)})`);
  carEl.style.opacity = Math.min(clamp((t+10)/1.5), clamp((23.4-t)/1.5));
}
if(reduce){
  const ct = location.search.match(/carT=(-?[\d.]+)/);
  placeCar(ct ? +ct[1] : 3.4); waitEl.style.opacity = 0;
} else {
  const t0 = performance.now() + (seen ? 0 : 2600);
  placeCar(-10);
  const tick = now => {
    const s = Math.max(0, (now - t0)/1000) % 16;
    placeCar(carAt(s));
    waitEl.style.opacity = s < 6.6 ? 1 : s < 7 ? 1-(s-6.6)/.4 : s < 15.2 ? 0 : (s-15.2)/.8;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* Habitaciones de K Rooms que se ocupan y se liberan */
const rooms = [...svg.querySelectorAll(".room")];
rooms.forEach(r => r.classList.toggle("lit", Math.random() < .45));
if(!reduce) setInterval(() => { const r = rooms[Math.floor(Math.random()*rooms.length)]; r && r.classList.toggle("lit"); }, 900);
