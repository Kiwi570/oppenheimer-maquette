/* La tache d'encre : la photo d'ouverture apparaît comme de l'encre qui
   s'étale dans le papier, puis respire très lentement et s'écarte sous le curseur.
   WebGL (OGL). Sans WebGL, l'image reste visible avec un masque de tache fixe. */
import { Renderer } from '../vendor/ogl/core/Renderer.js';
import { Program } from '../vendor/ogl/core/Program.js';
import { Mesh } from '../vendor/ogl/core/Mesh.js';
import { Texture } from '../vendor/ogl/core/Texture.js';
import { Triangle } from '../vendor/ogl/extras/Triangle.js';

const host = document.querySelector('[data-stain]');
const root = document.documentElement;

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0., 1.); }`;

const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tMap;
uniform vec2 uRes;
uniform float uImgAspect;
uniform float uTime;
uniform float uSpread;
uniform vec2 uMouse;
uniform float uMouseAmt;
uniform float uSeed;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32 + uSeed); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1., 0.)), c = hash(i + vec2(0., 1.)), d = hash(i + vec2(1., 1.));
  vec2 u = f * f * (3. - 2. * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1. - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return v; }
float fbm3(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.07 + 7.3; a *= .5; } return v; }

vec2 cover(vec2 uv) {
  float ca = uRes.x / uRes.y;
  vec2 s = ca > uImgAspect ? vec2(1., uImgAspect / ca) : vec2(ca / uImgAspect, 1.);
  return (uv - .5) * s + .5;
}

void main() {
  vec2 uv = vUv;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - .5) * vec2(asp, 1.);
  float t = uTime * .035;

  float n = fbm(p * 2.1 + vec2(t, -t * .6));
  float n2 = fbm3(p * 7.5 - vec2(t * 1.4, t));
  float grow = 1. - pow(1. - clamp(uSpread, 0., 1.), 2.2);
  float radius = mix(.0, .47, grow) + sin(uTime * .33) * .005 * grow;
  float d = length(p * vec2(.94, 1.));
  float edge = d - radius - (n - .5) * .36 * grow - (n2 - .5) * .07;

  vec2 m = (uMouse - .5) * vec2(asp, 1.);
  vec2 dm = p - m;
  float md = dot(dm, dm);
  vec2 disp = dm * exp(-md * 16.) * .07 * uMouseAmt;
  edge += exp(-md * 22.) * .03 * uMouseAmt;

  float bx = min(min(uv.x * 1.6, (1. - uv.x) * 2.2), min(uv.y, 1. - uv.y));
  edge += (1. - smoothstep(0., .16, bx)) * .22;
  float inside = 1. - smoothstep(-.012, .01, edge);
  vec2 iuv = cover(uv - disp + vec2(n - .5, n2 - .5) * .005);
  vec3 col = texture2D(tMap, iuv).rgb;
  float lum = dot(col, vec3(.299, .587, .114));
  col = mix(vec3(lum), col, .0);
  vec3 inkC = vec3(.078, .102, .2);
  col = mix(col, col * vec3(.92, .95, 1.06), .5);

  float rim = smoothstep(-.085, .0, edge) * inside;
  float gran = fbm3(p * 55. + 3.);
  col = mix(col, inkC, rim * (.42 + gran * .45));

  float fib = smoothstep(.48, .78, fbm3(vec2(p.x * 9., p.y * 38.) + n * 2.));
  float bleed = (1. - smoothstep(0., .05, edge)) * (1. - inside) * fib;
  float alpha = clamp(inside + bleed * .45, 0., 1.);
  vec3 outC = mix(inkC, col, inside);
  gl_FragColor = vec4(outC * alpha, alpha);
}`;

/* L'image de repli reste masquée (CSS) tant que WebGL n'a pas répondu :
   elle ne s'affiche qu'en cas d'échec (délai de sécurité dans site.js). */
function noGl() { if (!root.classList.contains('has-gl')) root.classList.add('no-gl'); }

function start() {
  if (!host) return;
  const calm = root.classList.contains('calme');
  const fallback = host.querySelector('.stain__fallback');
  let renderer;
  try {
    renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.25 : 1.6) });
  } catch (e) { noGl(); return; }
  const gl = renderer.gl;
  if (!gl) { noGl(); return; }
  gl.clearColor(0, 0, 0, 0);
  host.appendChild(gl.canvas);
  gl.canvas.setAttribute('aria-hidden', 'true');

  const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR });
  const program = new Program(gl, {
    vertex, fragment, transparent: true,
    uniforms: {
      tMap: { value: texture }, uRes: { value: [1, 1] }, uImgAspect: { value: 1168 / 784 }, uTime: { value: 0 },
      uSpread: { value: 0 }, uMouse: { value: [.5, .5] }, uMouseAmt: { value: 0 }, uSeed: { value: Math.random() * 10 }
    }
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  function resize() {
    const r = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, r.width), Math.max(1, r.height));
    program.uniforms.uRes.value = [r.width, r.height];
  }
  resize();
  window.addEventListener('resize', resize);

  const img = new Image();
  img.decoding = 'async';
  const small = window.innerWidth < 760;
  img.src = small ? host.dataset.srcMobile || host.dataset.src : host.dataset.src;

  let mouse = [.5, .5], target = [.5, .5], amt = 0, amtT = 0, visible = true, ready = false, t0 = performance.now();
  host.closest('.hero').addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    target = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    amtT = 1;
  });
  host.closest('.hero').addEventListener('pointerleave', () => { amtT = 0; });
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(host);

  function spreadValue(now) {
    const go = window.ENCRE_GO;
    if (calm) return 1;
    if (!go) return 0;
    if (!go.dur) return 1;
    return Math.min(1, Math.max(0, (now - go.at) / (go.dur * 1000)));
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!ready || (!visible && program.uniforms.uSpread.value >= 1)) return;
    const s = spreadValue(now);
    program.uniforms.uSpread.value = s;
    program.uniforms.uTime.value = (now - t0) / 1000;
    mouse[0] += (target[0] - mouse[0]) * .06; mouse[1] += (target[1] - mouse[1]) * .06;
    amt += (amtT - amt) * .04;
    program.uniforms.uMouse.value = mouse;
    program.uniforms.uMouseAmt.value = calm ? 0 : amt;
    renderer.render({ scene: mesh });
  }

  img.onload = () => {
    texture.image = img;
    program.uniforms.uImgAspect.value = img.naturalWidth / img.naturalHeight;
    ready = true;
    renderer.render({ scene: mesh });
    root.classList.add('has-gl');
    if (calm) { program.uniforms.uSpread.value = 1; renderer.render({ scene: mesh }); return; }
    requestAnimationFrame(frame);
  };
  img.onerror = () => { gl.canvas.remove(); noGl(); };
  if (fallback && fallback.alt) gl.canvas.setAttribute('title', fallback.alt);
}

try { start(); } catch (e) { noGl(); /* l'image de repli s'affiche */ }
