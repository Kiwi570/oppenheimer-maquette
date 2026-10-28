/* Rodolphe Oppenheimer — comportements communs aux trois pages.
   Défilement fluide, sceau de cire, révélations à l'encre, fiches livres,
   fenêtres modales, mode calme, curseur, transitions de page. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, body = d.body;
  var calm = root.classList.contains('calme');
  var fine = window.matchMedia('(pointer: fine)').matches;
  var hasG = !!(window.gsap && window.ScrollTrigger);
  var TODAY = new Date();
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var sess = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var RO = window.RO = { calm: calm, fine: fine, lenis: null, $: $, $$: $$ };

  if (hasG) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    gsap.defaults({ ease: 'power3.out' });
  }

  /* ---------- Sceau (cachet de cire ou sceau à l'encre) ---------- */
  var BLOB = 'M182.4 100.0 L183.1 107.3 L184.7 114.9 L184.8 122.7 L184.4 130.7 L183.1 138.8 L180.8 146.7 L175.9 153.2 L168.4 157.4 L160.9 160.9 L156.5 167.3 L150.7 172.4 L143.2 174.9 L136.1 177.4 L129.8 181.9 L122.4 183.6 L114.7 183.5 L107.3 183.6 L100.0 186.5 L92.1 190.0 L84.0 191.0 L76.2 188.9 L68.5 186.6 L61.3 183.1 L55.7 176.8 L51.6 169.1 L46.1 164.3 L39.6 160.4 L32.8 156.3 L29.1 149.6 L25.6 143.0 L21.1 136.8 L17.5 130.0 L16.0 122.5 L13.7 115.2 L10.0 107.9 L6.8 100.0 L7.6 91.9 L10.9 84.3 L15.0 77.2 L18.4 70.3 L23.5 64.3 L28.4 58.6 L31.8 52.3 L33.0 43.7 L37.1 37.1 L43.0 32.0 L49.3 27.6 L55.3 22.6 L62.1 18.7 L69.4 15.9 L77.0 14.0 L84.1 9.7 L92.0 8.7 L100.0 11.2 L107.4 15.8 L114.4 18.1 L121.8 18.5 L128.8 20.8 L135.8 23.3 L143.4 24.9 L152.2 25.5 L159.3 29.3 L163.9 36.1 L168.1 42.9 L173.4 48.6 L177.8 55.1 L180.1 62.6 L182.5 70.0 L185.4 77.1 L187.5 84.6 L185.5 92.5 Z';
  var uid = 0;
  function sealSVG(variant) {
    var id = 'sc' + (++uid);
    var wax = variant !== 'encre';
    var stops = wax
      ? '<stop offset="0" stop-color="#bd4c40"/><stop offset=".55" stop-color="#8f2a22"/><stop offset="1" stop-color="#651a14"/>'
      : '<stop offset="0" stop-color="#26305a"/><stop offset=".7" stop-color="#141a33"/><stop offset="1" stop-color="#0c1024"/>';
    var shape = wax ? '<path d="' + BLOB + '" fill="url(#g' + id + ')"/>' : '<circle cx="100" cy="100" r="92" fill="url(#g' + id + ')"/>';
    var ring = wax ? 'rgba(52,8,5,.35)' : '#c7ab73';
    var txt = wax ? 'rgba(255,229,216,.86)' : '#d9c18c';
    var ro = wax ? '#f8e7df' : '#efe9dc';
    return '<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false"><defs><radialGradient id="g' + id + '" cx="36%" cy="30%" r="80%">' + stops + '</radialGradient>' +
      '<path id="p' + id + '" d="M100,100 m-63,0 a63,63 0 1,1 126,0 a63,63 0 1,1 -126,0"/></defs>' + shape +
      '<circle cx="100" cy="100" r="80" fill="none" stroke="' + ring + '" stroke-width="' + (wax ? 2.2 : 1.2) + '"/>' +
      '<circle cx="100" cy="100" r="47" fill="none" stroke="' + ring + '" stroke-width="1"/>' +
      (wax ? '<ellipse cx="74" cy="58" rx="34" ry="16" fill="rgba(255,255,255,.10)" transform="rotate(-28 74 58)"/>' : '') +
      '<text font-family="Instrument Sans, Arial, sans-serif" font-size="10.4" font-weight="600" fill="' + txt + '"><textPath href="#p' + id + '" textLength="392" lengthAdjust="spacing">PSYCHOTHÉRAPEUTE · PSYCHANALYSTE · PROFESSION RÉGLEMENTÉE ·</textPath></text>' +
      '<text x="100" y="116" text-anchor="middle" font-family="Literata, Georgia, serif" font-style="italic" font-weight="300" font-size="45" fill="' + ro + '">RO</text></svg>';
  }
  $$('[data-sceau]').forEach(function (el) { el.innerHTML = sealSVG(el.getAttribute('data-sceau')); });

  RO.stamp = function (el, delay) {
    if (!hasG || calm) { el.style.opacity = 1; return; }
    var tl = gsap.timeline({ delay: delay || 0 });
    tl.fromTo(el, { opacity: 0, scale: 1.55, rotate: -18 }, { opacity: 1, scale: 1, rotate: -6, duration: .75, ease: 'power3.in' })
      .to(el, { scaleX: 1.04, scaleY: .95, duration: .12, ease: 'power1.out' })
      .to(el, { scaleX: 1, scaleY: 1, duration: .5, ease: 'elastic.out(1, .5)' })
      .add(function () {
        var r = d.createElement('span'); r.className = 'seal-ripple'; el.appendChild(r);
        gsap.fromTo(r, { scale: .9, opacity: .6 }, { scale: 1.6, opacity: 0, duration: 1.2, ease: 'power2.out', onComplete: function () { r.remove(); } });
      }, '-=.55');
    return tl;
  };

  /* ---------- Défilement fluide ---------- */
  if (hasG && !calm && window.Lenis) {
    var lenis = new Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: .95 });
    RO.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  RO.scrollTo = function (target, immediate) {
    var el = typeof target === 'string' ? d.querySelector(target) : target;
    if (!el) return;
    if (RO.lenis) RO.lenis.scrollTo(el, { offset: -78, immediate: !!immediate, duration: 1.4 });
    else el.scrollIntoView({ behavior: immediate || calm ? 'auto' : 'smooth' });
  };
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a || a.hasAttribute('data-open')) return;
    var url = new URL(a.getAttribute('href'), location.href);
    var here = url.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');
    if (!here || !url.hash || url.hash.length < 2) return;
    var t = d.getElementById(url.hash.slice(1));
    if (!t) return;
    e.preventDefault();
    closeMenu();
    RO.scrollTo(t);
  });

  /* ---------- En-tête ---------- */
  var header = $('#header'), lastY = 0;
  function onScrollHeader() {
    var y = window.scrollY || 0;
    header.classList.toggle('is-solid', y > 30);
    lastY = y;
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* Hauteurs réelles de l'en-tête et de la barre du bas, pour les scènes épinglées et le dernier bloc */
  var dock = $('.dock');
  function measureBars() {
    if (header) root.style.setProperty('--entete-h', header.offsetHeight + 'px');
    if (dock) root.style.setProperty('--barres-h', (getComputedStyle(dock).display === 'none' ? 0 : dock.offsetHeight) + 'px');
  }
  measureBars();
  if (window.ResizeObserver) { var ro = new ResizeObserver(measureBars); if (header) ro.observe(header); if (dock) ro.observe(dock); }
  window.addEventListener('resize', measureBars);

  /* Barre du bas : seulement une fois l'ouverture dépassée, jamais sur le pied de page */
  if (dock) {
    var heroEl = $('.hero'), footEl = $('.footer'), seen = {};
    if (!heroEl || body.getAttribute('data-page') === 'introuvable') body.classList.add('dock-off');
    else if ('IntersectionObserver' in window) {
      body.classList.add('dock-off');
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { seen[e.target === heroEl ? 'hero' : 'foot'] = e.isIntersecting; });
        body.classList.toggle('dock-off', !!(seen.hero || seen.foot));
      });
      io.observe(heroEl); if (footEl) io.observe(footEl);
    }
  }

  /* Image de repli de l'encre : affichée si WebGL n'a pas répondu à temps */
  if ($('.stain__fallback')) setTimeout(function () { if (!root.classList.contains('has-gl')) root.classList.add('no-gl'); }, 1500);

  var burger = $('.burger'), menu = $('#menu');
  function closeMenu() {
    if (!body.classList.contains('menu-open')) return;
    body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Ouvrir le menu');
    menu.setAttribute('aria-hidden', 'true'); if (RO.lenis) RO.lenis.start();
    if (menu.contains(d.activeElement)) burger.focus({ preventScroll: true });
  }
  if (burger) burger.addEventListener('click', function () {
    var open = !body.classList.contains('menu-open');
    if (!open) return closeMenu();
    body.classList.add('menu-open'); burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Fermer le menu');
    menu.setAttribute('aria-hidden', 'false'); if (RO.lenis) RO.lenis.stop();
    setTimeout(function () { var f = menu.querySelector('a'); if (f) f.focus({ preventScroll: true }); }, 350);
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Fenêtres modales ---------- */
  function openDialog(id) {
    var dlg = d.getElementById(id);
    if (!dlg || dlg.open) return;
    closeMenu();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    if (RO.lenis) RO.lenis.stop();
    if (hasG && !calm) gsap.fromTo(dlg.firstElementChild, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6 });
  }
  RO.openDialog = openDialog;
  d.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); openDialog(o.getAttribute('data-open')); return; }
    var c = e.target.closest('[data-close]');
    if (c) { var dl = c.closest('dialog'); if (dl) dl.close(); }
  });
  $$('dialog').forEach(function (dlg) {
    dlg.addEventListener('close', function () { if (RO.lenis) RO.lenis.start(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  });

  var form = $('#form-contact');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var ok = $('[data-form-ok]', form);
    ok.hidden = false; form.reset();
    if (hasG && !calm) gsap.from(ok, { opacity: 0, y: 8, duration: .5 });
  });

  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (!b) return;
    var text = b.getAttribute('data-copy'), label = b.textContent;
    var done = function () { b.textContent = 'Copié'; setTimeout(function () { b.textContent = label; }, 1600); };
    var fallback = function () {
      var t = b.parentNode.querySelector('.tel');
      if (t) { var r = d.createRange(); r.selectNodeContents(t); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      b.textContent = 'Sélectionné'; setTimeout(function () { b.textContent = label; }, 1600);
    };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (err) { fallback(); }
  });

  /* ---------- Mode calme ---------- */
  var calmBtn = $('[data-calm]');
  if (calmBtn) {
    calmBtn.setAttribute('aria-pressed', calm ? 'true' : 'false');
    calmBtn.addEventListener('click', function () {
      store.set('ro-calme', calm ? '0' : '1');
      sess.set('ro-scroll', String(window.scrollY || 0));
      location.reload();
    });
    var keep = sess.get('ro-scroll');
    if (keep !== null) { sess.del('ro-scroll'); window.addEventListener('load', function () { window.scrollTo(0, +keep); }); }
  }

  /* ---------- Transitions de page (feuille qui passe) ---------- */
  var turn = $('.turn');
  if (root.classList.contains('turning')) {
    sess.del('ro-turn');
    if (hasG && !calm) {
      gsap.fromTo(turn, { xPercent: 0 }, { xPercent: -101, duration: .9, ease: 'power3.inOut', delay: .08, onComplete: function () { root.classList.remove('turning'); gsap.set(turn, { clearProps: 'all' }); } });
    } else root.classList.remove('turning');
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-transition]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    var url = new URL(a.getAttribute('href'), location.href);
    var samePage = url.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');
    if (samePage || url.origin !== location.origin) return;
    e.preventDefault();
    closeMenu();
    if (calm || !hasG) { location.href = url.href; return; }
    sess.set('ro-turn', '1');
    gsap.fromTo(turn, { xPercent: 101 }, { xPercent: 0, duration: .65, ease: 'power3.inOut', onComplete: function () { location.href = url.href; } });
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted && hasG) gsap.set(turn, { xPercent: 101 }); });

  /* ---------- Curseur goutte d'encre ---------- */
  if (fine && !calm && hasG) {
    var dot = $('.cursor'), ring = $('.cursor-ring');
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    var dx = gsap.quickSetter(dot, 'x', 'px'), dy = gsap.quickSetter(dot, 'y', 'px');
    var rxs = gsap.quickSetter(ring, 'x', 'px'), rys = gsap.quickSetter(ring, 'y', 'px');
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY; dx(mx); dy(my);
      body.classList.add('has-cursor');
      var t = e.target;
      ring.classList.toggle('is-link', !!(t.closest && t.closest('a, button, [data-livre], summary, label, input, select, textarea')));
    }, { passive: true });
    d.addEventListener('pointerleave', function () { body.classList.remove('has-cursor'); });
    gsap.ticker.add(function () { rx += (mx - rx) * .16; ry += (my - ry) * .16; rxs(rx); rys(ry); });
  }

  /* ---------- Boutons magnétiques ---------- */
  $$('.btn').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      b.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });
  if (fine && !calm && hasG) {
    $$('[data-magnetic]').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .6, ease: 'power3' });
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * .22); yTo((e.clientY - (r.top + r.height / 2)) * .3);
      });
      b.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
    $$('[data-tilt]').forEach(function (el) {
      var rX = gsap.quickTo(el, 'rotationX', { duration: .8 }), rY = gsap.quickTo(el, 'rotationY', { duration: .8 });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        rY(((e.clientX - r.left) / r.width - .5) * 8); rX(-((e.clientY - r.top) / r.height - .5) * 8);
      });
      el.addEventListener('pointerleave', function () { rX(0); rY(0); });
    });
  }

  /* ---------- Folio (titre courant en pied de page) ---------- */
  var folio = $('.folio'), folioN = $('[data-folio-n]'), folioT = $('[data-folio-t]');
  var folioSecs = $$('[data-folio]');
  function setFolio(i) {
    var s = folioSecs[i]; if (!s || !folio) return;
    folioN.textContent = String(i + 1);
    folioT.textContent = s.getAttribute('data-folio');
    var onInk = s.hasAttribute('data-onink');
    folio.classList.toggle('on-ink', onInk);
    var c = $('.cursor'), r = $('.cursor-ring');
    if (c) { c.classList.toggle('on-ink', onInk); r.classList.toggle('on-ink', onInk); }
  }
  if (hasG) folioSecs.forEach(function (s, i) {
    ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) { if (self.isActive) setFolio(i); } });
  });

  /* ---------- Révélations ---------- */
  RO.splitTitle = function (el, opts) {
    if (!hasG || calm || !window.SplitText) return null;
    var st = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'sl' });
    var tw = gsap.from(st.lines, Object.assign({ yPercent: 112, duration: 1.15, stagger: .09, ease: 'power4.out' }, opts || {}));
    return tw;
  };
  if (hasG && !calm) {
    $$('[data-split]').forEach(function (el) {
      RO.splitTitle(el, { scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
    });

    $$('[data-blur-words]').forEach(function (el) {
      if (!window.SplitText) return;
      var st = new SplitText(el, { type: 'words', wordsClass: 'w' });
      gsap.fromTo(st.words, { filter: 'blur(9px)', opacity: .18 }, {
        filter: 'blur(0px)', opacity: 1, ease: 'none', stagger: .08,
        scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 42%', scrub: .6 }
      });
    });

    $$('img[data-ink]').forEach(function (img) {
      img.classList.add('ink-in');
      ScrollTrigger.create({
        trigger: img, start: 'top 90%', once: true,
        onEnter: function () {
          img.classList.add('is-in');
          gsap.fromTo(img, { scale: 1.1 }, { scale: 1, duration: 2, ease: 'power2.out', clearProps: 'transform' });
        }
      });
    });

    $$('.parallax > img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-parallax-bg] img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -7 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    $$('[data-stamp]').forEach(function (el) {
      if (el.closest('.hero')) return;
      gsap.set(el, { opacity: 0 });
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: function () { RO.stamp(el); } });
    });

    $$('[data-timeline]').forEach(function (tl) {
      var line = $('.timeline__line', tl);
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0%', ease: 'none', scrollTrigger: { trigger: tl, start: 'top 75%', end: 'bottom 60%', scrub: .5 } });
      $$('li', tl).forEach(function (li) {
        gsap.from(li, { opacity: 0, x: -14, duration: .8, scrollTrigger: { trigger: li, start: 'top 82%', once: true } });
      });
    });

    $$('svg[data-draw]').forEach(function (svg) {
      var parts = $$('path, rect, circle, line', svg);
      parts.forEach(function (p) {
        var len = p.getTotalLength ? p.getTotalLength() : 200;
        p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      });
      ScrollTrigger.create({ trigger: svg, start: 'top 88%', once: true, onEnter: function () {
        gsap.to(parts, { strokeDashoffset: 0, duration: 1.6, stagger: .12, ease: 'power2.inOut' });
      } });
    });

    $$('.press-item, .org, .cards3 > *, .frise__item, .countdown').forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 26, duration: 1, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
  }

  /* ---------- Compteurs ---------- */
  if (hasG && !calm) $$('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count'), o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () {
      gsap.to(o, { v: to, duration: 1.8, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
    } });
  });

  /* ---------- Interlude : l'encre remplit les mots ---------- */
  $$('[data-ink-words]').forEach(function (el) {
    if (!hasG || calm || !window.SplitText) return;
    var st = new SplitText(el, { type: 'words', wordsClass: 'iw' });
    gsap.fromTo(st.words, { color: 'rgba(20,26,51,.13)' }, {
      color: function (i, t) { return t.closest('em') ? '#8f2a22' : '#141a33'; }, ease: 'none', stagger: .12,
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 42%', scrub: .5 }
    });
    var ink = el.closest('section').querySelector('.interlude__ink');
    if (ink) gsap.fromTo(ink, { scale: .85, rotate: -6 }, { scale: 1.1, rotate: 4, ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- Questions (ouverture douce) ---------- */
  $$('[data-faq] details').forEach(function (det) {
    var sum = $('summary', det), ans = $('.ans', det);
    sum.addEventListener('click', function (e) {
      if (!hasG || calm) return;
      e.preventDefault();
      if (det.open) {
        gsap.to(ans, { height: 0, opacity: 0, duration: .5, ease: 'power2.inOut', onComplete: function () { det.open = false; gsap.set(ans, { clearProps: 'height,opacity' }); ScrollTrigger.refresh(); } });
      } else {
        det.open = true;
        gsap.fromTo(ans, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .6, ease: 'power2.out', onComplete: function () { gsap.set(ans, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
        gsap.from($$('p', ans), { y: 10, opacity: 0, duration: .7, stagger: .08, delay: .1 });
      }
    });
  });

  /* ---------- Livres : fiches, comptes à rebours, étagères ---------- */
  var LIVRES = window.LIVRES || [];
  var byId = {}; LIVRES.forEach(function (b) { byId[b.id] = b; });
  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function daysUntil(s) { var t = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()); return Math.round((parse(s) - t) / 864e5); }
  function longDate(s) {
    var m = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var dt = parse(s); return dt.getDate() + (dt.getDate() === 1 ? 'er' : '') + ' ' + m[dt.getMonth()] + ' ' + dt.getFullYear();
  }
  function upcoming(b) { return b.parution && daysUntil(b.parution) > 0; }
  $$('[data-tag-date]').forEach(function (t) { if (daysUntil(t.getAttribute('data-tag-date')) <= 0) t.remove(); });

  var sheet = $('[data-sheet]');
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function openBook(id) {
    var b = byId[id]; if (!b || !sheet) return;
    var rows = '';
    if (b.editeur) rows += '<dt>Éditeur</dt><dd>' + esc(b.editeur) + '</dd>';
    rows += '<dt>' + (b.famille ? 'Auteurs' : 'Auteur') + '</dt><dd>' + esc(b.auteurs) + '</dd>';
    if (b.parution) {
      var n = daysUntil(b.parution);
      rows += '<dt>Parution</dt><dd>' + (n > 0 ? 'À paraître le ' + longDate(b.parution) + ' <span class="muted">(dans ' + n + ' jour' + (n > 1 ? 's' : '') + ')</span>' : 'Paru le ' + longDate(b.parution)) + '</dd>';
    }
    if (b.note) rows += '<dt>Note</dt><dd>' + esc(b.note) + '</dd>';
    var link = b.lien ? '<a class="btn" href="' + esc(b.lien) + '" target="_blank" rel="noopener">' + esc(b.lienTexte || 'Voir le livre') + ' <span class="ext">↗</span></a>' : '';
    sheet.innerHTML = '<div class="sheet__cover"><img src="assets/img/livres/' + b.id + '.webp" width="' + b.w + '" height="' + b.h + '" alt="Couverture du livre « ' + esc(b.titre) + ' »"></div>' +
      '<div class="sheet__body"><p class="eyebrow">' + (b.famille ? 'Ouvrage de la famille' : (upcoming(b) ? 'À paraître' : 'Livre')) + '</p>' +
      '<h2 id="dlg-livre-t">' + esc(b.titre) + '</h2>' + (b.sous ? '<p class="lead">' + esc(b.sous) + '</p>' : '') +
      '<dl>' + rows + '</dl>' + (link ? '<div class="btns" style="margin-top:8px">' + link + '</div>' : '') + '</div>';
    openDialog('dlg-livre');
    if (hasG && !calm) gsap.from($('.sheet__cover img', sheet), { rotateY: -35, x: -30, opacity: 0, duration: 1, transformPerspective: 900 });
  }
  RO.openBook = openBook;
  d.addEventListener('click', function (e) { var b = e.target.closest('[data-livre]'); if (b) openBook(b.getAttribute('data-livre')); });

  $$('[data-countdowns]').forEach(function (box) {
    var list = LIVRES.filter(function (b) { return !b.famille && upcoming(b); }).sort(function (a, b) { return a.parution < b.parution ? -1 : 1; });
    if (!list.length) { box.remove(); return; }
    box.innerHTML = list.map(function (b) {
      var n = daysUntil(b.parution);
      return '<button class="countdown" type="button" data-livre="' + b.id + '"><img src="assets/img/livres/' + b.id + '.webp" width="' + b.w + '" height="' + b.h + '" alt="">' +
        '<span><strong>' + esc(b.court || b.titre) + '</strong><span>À paraître le ' + longDate(b.parution) + '</span></span>' +
        '<span class="days num">' + n + '<small>jour' + (n > 1 ? 's' : '') + '</small></span></button>';
    }).join('');
  });

  /* Étagère et frise : défilement horizontal piloté par la page (ordinateur), glisser ailleurs */
  function hPin(viewport, scroller, track, opts) {
    opts = opts || {};
    if (!hasG || calm || innerWidth <= 980) return null;
    var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
    if (dist() < 40) return null;
    scroller.classList.add('is-pinned');
    /* scène plein écran : tout tient entre l'en-tête et le bas de l'écran */
    if (opts.stage) viewport.classList.add('is-stage');
    var tw = gsap.to(track, { x: function () { return -dist(); }, ease: 'none' });
    var st = ScrollTrigger.create({ trigger: viewport, start: opts.start || 'center 56%', end: function () { return '+=' + Math.round(dist() * (opts.speed || .7)); }, pin: true, scrub: .6, animation: tw, invalidateOnRefresh: true, anticipatePin: opts.stage ? 0 : 1, onUpdate: opts.onUpdate });
    tw._st = st;
    /* clavier : un livre qui reçoit le focus est amené à l'écran */
    track.addEventListener('focusin', function (e) {
      var it = e.target.closest('.book, .frise__item'); if (!it || !st) return;
      var p = Math.min(1, Math.max(0, (it.offsetLeft - innerWidth * .3) / dist()));
      var y = st.start + (st.end - st.start) * p;
      if (RO.lenis) RO.lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
    });
    return tw;
  }
  RO.hPin = hPin;
  $$('.shelf-scroll').forEach(function (sc) {
    var down = false, sx = 0, sl = 0, moved = false;
    sc.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || sc.classList.contains('is-pinned')) return; down = true; moved = false; sx = e.clientX; sl = sc.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; sc.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; });
    sc.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  });
  var homeShelf = $('[data-shelf-pin]');
  if (homeShelf) {
    var books = $$('.book', homeShelf), nEl = $('[data-shelf-n]', homeShelf), bar = $('[data-shelf-bar]', homeShelf);
    var setProg = function (p) {
      if (bar) bar.style.transform = 'scaleX(' + Math.max(.06, p) + ')';
      if (nEl) nEl.textContent = Math.min(books.length, 1 + Math.round(p * (books.length - 1)));
    };
    var shTw = hPin(homeShelf, $('.shelf-scroll', homeShelf), $('.shelf', homeShelf), { start: 'top top', stage: true, speed: .62, onUpdate: function (self) { setProg(self.progress); } });
    if (!shTw) {
      var sc = $('.shelf-scroll', homeShelf);
      sc.addEventListener('scroll', function () { setProg(sc.scrollLeft / Math.max(1, sc.scrollWidth - sc.clientWidth)); }, { passive: true });
    }
    if (hasG && !calm) gsap.from($$('.book', homeShelf), { y: 60, opacity: 0, rotateY: -70, duration: 1.2, stagger: .05, scrollTrigger: { trigger: homeShelf, start: 'top 85%', once: true } });
  }
  var frise = $('[data-frise-pin]');
  if (frise) {
    var frTw = hPin(frise, $('.frise__scroll', frise), $('.frise__track', frise));
    if (hasG && !calm) $$('.frise__stamp', frise).forEach(function (s) {
      var conf = { trigger: s.parentNode, start: frTw ? 'left 78%' : 'top 85%', once: true, onEnter: function () { gsap.fromTo(s, { scale: 1.8, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: -6, duration: .6, ease: 'back.out(2)' }); } };
      if (frTw) conf.containerAnimation = frTw;
      gsap.set(s, { opacity: 0 });
      ScrollTrigger.create(conf);
    });
  }
  var filters = $('[data-lib-filters]');
  if (filters) filters.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-f]'); if (!b) return;
    var f = b.getAttribute('data-f');
    $$('button', filters).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    $$('[data-group]').forEach(function (g) { g.hidden = !(f === 'tout' || g.getAttribute('data-group') === f); });
    if (hasG) { ScrollTrigger.refresh(); if (!calm) gsap.from($$('[data-group]:not([hidden]) .book'), { y: 30, opacity: 0, duration: .8, stagger: .03 }); }
  });

  /* ---------- Ouverture des pages intérieures ---------- */
  var heroTitle = $('[data-hero-title]');
  if (heroTitle && body.getAttribute('data-page') !== 'accueil') {
    window.ENCRE_GO = { at: performance.now() + (root.classList.contains('turning') ? 450 : 150), dur: calm ? 0 : 1.7 };
    if (hasG && !calm) {
      var delay = root.classList.contains('turning') ? .45 : .1;
      var tl = gsap.timeline({ delay: delay });
      var st = RO.splitTitle(heroTitle, { paused: true });
      if (st) tl.add(st.play(), 0);
      tl.from($$('.hero__text > :not([data-hero-title])'), { y: 24, opacity: 0, duration: .9, stagger: .08 }, .25)
        .from('.hero__card', { y: 50, rotate: 4, opacity: 0, duration: 1.1 }, .6);
      var hs = $('.hero__seal');
      if (hs) { gsap.set(hs, { opacity: 0 }); tl.add(function () { RO.stamp(hs); }, 1.2); }
    }
  }

  /* ---------- Ancre à l'arrivée depuis une autre page ---------- */
  window.addEventListener('load', function () {
    if (hasG) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
    if (location.hash.length > 1) {
      var t = d.getElementById(location.hash.slice(1));
      if (t) setTimeout(function () { RO.scrollTo(t, true); }, 80);
    }
  });
})();
