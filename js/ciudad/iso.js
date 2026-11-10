/* =========================================================================
   ciudad/iso.js · Motor isométrico: convierte coordenadas 3D en trazos SVG
   Unidad: 1 celda = U píxeles. x crece hacia abajo a la derecha, y hacia
   abajo a la izquierda, z hacia arriba. Cada trazo lleva --d (retraso de la
   animación de entrada) según la variable global D.
   ========================================================================= */

const U = 40, C = Math.cos(Math.PI / 6), S = 0.5, RX = Math.SQRT2 * C, RY = Math.SQRT2 * S;
const P = (x, y, z = 0) => [(x - y) * C * U, (x + y) * S * U - z * U];
const f = n => Math.round(n * 10) / 10;
let D = 0;
const st = () => `style="--d:${D}ms"`;
const pts = a => a.map(p => { const q = P(...p); return f(q[0]) + " " + f(q[1]); }).join("L");

/* Primitivas */
const shape = (a, cls) => `<path class="ln ${cls}" pathLength="1" ${st()} d="M${pts(a)}Z"/>`;
const line  = (a, cls) => `<path class="ln ${cls}" pathLength="1" ${st()} d="M${pts(a)}"/>`;
const flat  = (a, z, cls) => shape(a.map(p => [p[0], p[1], z]), cls);
const ell = (cx, cy, rx, ry, cls) => `<path class="ln ${cls}" pathLength="1" ${st()} d="M${f(cx-rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx+rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx-rx)} ${f(cy)}Z"/>`;

/* Caja: techo (t), cara izquierda (l) y cara derecha (r) con la paleta k */
function box(x, y, z, w, d, h, k){
  const T = z + h;
  return shape([[x,y,T],[x+w,y,T],[x+w,y+d,T],[x,y+d,T]], k + "-t")
       + shape([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,T],[x,y+d,T]], k + "-l")
       + shape([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,T],[x+w,y,T]], k + "-r");
}
const rectY = (x0, x1, y, z0, z1, cls) => shape([[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]], cls);
const rectX = (x, y0, y1, z0, z1, cls) => shape([[x,y0,z0],[x,y1,z0],[x,y1,z1],[x,y0,z1]], cls);

/* Rejillas de ventanas en una fachada */
function winsY(x0, x1, y, z0, z1, nc, nr, cls){
  let s = ""; const cw = (x1-x0)/nc, ch = (z1-z0)/nr;
  for(let i=0;i<nc;i++) for(let j=0;j<nr;j++)
    s += rectY(x0+i*cw+cw*.2, x0+(i+1)*cw-cw*.2, y, z0+j*ch+ch*.18, z0+(j+1)*ch-ch*.18, cls);
  return s;
}
function winsX(x, y0, y1, z0, z1, nc, nr, cls){
  let s = ""; const cw = (y1-y0)/nc, ch = (z1-z0)/nr;
  for(let i=0;i<nc;i++) for(let j=0;j<nr;j++)
    s += rectX(x, y0+i*cw+cw*.2, y0+(i+1)*cw-cw*.2, z0+j*ch+ch*.18, z0+(j+1)*ch-ch*.18, cls);
  return s;
}

/* Tejados a dos aguas (cumbrera en x o en y) */
function gableX(x, y, z, w, d, h, k){
  return shape([[x,y,z],[x+w,y,z],[x+w,y+d/2,z+h],[x,y+d/2,z+h]], k + "-r")
       + shape([[x,y+d,z],[x+w,y+d,z],[x+w,y+d/2,z+h],[x,y+d/2,z+h]], k + "-t")
       + shape([[x+w,y,z],[x+w,y+d,z],[x+w,y+d/2,z+h]], k + "-r");
}
function gableY(x, y, z, w, d, h, k){
  return shape([[x,y,z],[x,y+d,z],[x+w/2,y+d,z+h],[x+w/2,y,z+h]], k + "-r")
       + shape([[x,y+d,z],[x+w,y+d,z],[x+w/2,y+d,z+h]], k + "-l")
       + shape([[x+w,y,z],[x+w,y+d,z],[x+w/2,y+d,z+h],[x+w/2,y,z+h]], k + "-t");
}

/* Cilindro (columnas, mesa, vasos) */
function cyl(x, y, z, r, h, k){
  const [bx, by] = P(x,y,z), [, ty] = P(x,y,z+h), rx = r*RX*U, ry = r*RY*U;
  return `<path class="ln ${k}-l" pathLength="1" ${st()} d="M${f(bx-rx)} ${f(ty)}L${f(bx-rx)} ${f(by)}A${f(rx)} ${f(ry)} 0 0 0 ${f(bx+rx)} ${f(by)}L${f(bx+rx)} ${f(ty)}Z"/>`
       + ell(bx, ty, rx, ry, k + "-t");
}

/* Árbol en cono, con dos tonos */
function tree(x, y, r = .3, h = 1.05){
  const [bx, by] = P(x,y,.14), [ax, ay] = P(x,y,h), rx = r*RX*U, ry = r*RY*U;
  return line([[x,y,0],[x,y,.16]], "pole")
    + `<path class="ln tr-l" pathLength="1" ${st()} d="M${f(bx-rx)} ${f(by)}A${f(rx)} ${f(ry)} 0 0 0 ${f(bx)} ${f(by+ry)}L${f(ax)} ${f(ay)}Z"/>`
    + `<path class="ln tr-r" pathLength="1" ${st()} d="M${f(bx)} ${f(by+ry)}A${f(rx)} ${f(ry)} 0 0 0 ${f(bx+rx)} ${f(by)}L${f(ax)} ${f(ay)}Z"/>`;
}

/* Persona: sombra en el suelo (si está de pie), cuerpo redondeado con un lado en sombra para darle volumen, y cabeza */
function person(x, y, z, cls, s = 1){
  const [px, py] = P(x,y,z), w = 3.6*s, hb = 7.5*s, hr = 3.3*s;
  const shadow = z === 0 ? `<ellipse class="fade p-shadow" ${st()} cx="${f(px+1.2*s)}" cy="${f(py)}" rx="${f(w*1.45)}" ry="${f(w*.55)}"/>` : "";
  return shadow
       + `<path class="ln ${cls}" pathLength="1" ${st()} d="M${f(px-w)} ${f(py)}L${f(px-w)} ${f(py-hb)}A${f(w)} ${f(w)} 0 0 1 ${f(px+w)} ${f(py-hb)}L${f(px+w)} ${f(py)}Z"/>`
       + `<path class="fade p-side" ${st()} d="M${f(px+w*.15)} ${f(py-.4)}L${f(px+w*.15)} ${f(py-hb-w+.6)}A${f(w)} ${f(w)} 0 0 1 ${f(px+w-.5)} ${f(py-hb)}L${f(px+w-.5)} ${f(py-.4)}Z"/>`
       + ell(px, py-hb-w-hr+.6*s, hr, hr, "head");
}

/* Rueda en el plano x */
function wheel(X, yc, zc, r){
  const a = []; for(let i=0;i<14;i++){ const t = i/14*Math.PI*2; a.push([X, yc + r*Math.cos(t), zc + r*Math.sin(t)]); }
  return shape(a, "wheel");
}

/* Texto sobre una fachada (plano y) o pintado en la calzada */
const textY = (x, y, z, txt, size, cls) => { const [sx, sy] = P(x,y,z); return `<text class="fade ${cls}" ${st()} font-size="${size}" transform="matrix(${f(C*1000)/1000} .5 0 1 ${f(sx)} ${f(sy)})">${txt}</text>`; };
const textRoad = (x, y, txt, size, cls) => { const [sx, sy] = P(x,y,0); return `<text class="fade ${cls}" ${st()} font-size="${size}" transform="matrix(${f(C*1000)/1000} -.5 ${f(C*1000)/1000} .5 ${f(sx)} ${f(sy)})">${txt}</text>`; };
