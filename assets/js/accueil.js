/* Accueil : goutte d'encre d'ouverture, fils d'association libre,
   deux lignes vers un même cadre, fenêtre de visio épinglée. */
(function () {
  'use strict';
  var RO = window.RO || {}, d = document, $ = RO.$, $$ = RO.$$;
  var calm = RO.calm, hasG = !!window.gsap;
  var root = d.documentElement;

  /* ---------- Ouverture orchestrée (moins de 3 secondes) ---------- */
  var title = $('[data-hero-title]'), stain = $('[data-stain]'), heroSeal = $('.hero__seal');
  var seen = false;
  try { seen = sessionStorage.getItem('ro-intro') === '1'; sessionStorage.setItem('ro-intro', '1'); } catch (e) {}
  var arriving = root.classList.contains('turning');

  if (!hasG || calm) {
    window.ENCRE_GO = { at: performance.now(), dur: 0 };
  } else {
    var tl = gsap.timeline({ delay: arriving ? .5 : .15 });
    var st = RO.splitTitle(title, { paused: true, duration: 1.2, stagger: .1 });
    var rest = $$('.hero__text > :not([data-hero-title])');
    gsap.set(rest, { opacity: 0, y: 22 });
    gsap.set('.hero__card', { opacity: 0, y: 60, rotate: 5 });
    if (heroSeal) gsap.set(heroSeal, { opacity: 0 });

    if (!seen && !arriving) {
      var drop = d.createElement('div'); drop.className = 'drop'; d.body.appendChild(drop);
      var r = stain.getBoundingClientRect();
      var tx = r.left + r.width * .5, ty = r.top + r.height * .5;
      gsap.set(drop, { x: tx, y: -30, opacity: 1, scaleY: 1.3 });
      tl.to(drop, { y: ty, duration: .62, ease: 'power2.in' }, 0)
        .to(drop, { scaleX: 2.6, scaleY: .25, opacity: 0, duration: .35, ease: 'power2.out', onStart: function () { window.ENCRE_GO = { at: performance.now(), dur: 1.9 }; }, onComplete: function () { drop.remove(); } }, .62);
      if (st) tl.add(st.play(), .55);
      tl.to(rest, { opacity: 1, y: 0, duration: .9, stagger: .08 }, .95)
        .to('.hero__card', { opacity: 1, y: 0, rotate: -2.2, duration: 1.1 }, 1.2);
      if (heroSeal) tl.add(function () { RO.stamp(heroSeal); }, 1.65);
    } else {
      tl.add(function () { window.ENCRE_GO = { at: performance.now(), dur: 1.4 }; }, 0);
      if (st) tl.add(st.play(), .1);
      tl.to(rest, { opacity: 1, y: 0, duration: .8, stagger: .06 }, .35)
        .to('.hero__card', { opacity: 1, y: 0, rotate: -2.2, duration: 1 }, .5);
      if (heroSeal) tl.add(function () { RO.stamp(heroSeal); }, .9);
    }
    /* Sécurité : tout est visible même si une étape échoue */
    setTimeout(function () { gsap.set(rest.concat($$('.hero__card')), { opacity: 1 }); }, 3600);
  }

  if (!hasG) return;

  /* ---------- Fumée d'encre de la bande Repères ---------- */
  var smoke = $('[data-drift]');
  if (smoke && !calm) {
    gsap.to(smoke, { xPercent: 6, yPercent: -4, rotate: 4, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  /* ---------- Association libre : fils d'encre entre les motifs ---------- */
  var cvs = $('[data-assoc]');
  if (cvs && !calm) {
    var ctx = cvs.getContext('2d'), sec = cvs.parentNode, nodes = $$('[data-assoc-node]', sec);
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), mouse = null, on = false, t = 0, pts = [];
    var size = function () {
      var r = sec.getBoundingClientRect(); W = r.width; H = r.height;
      cvs.width = W * dpr; cvs.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = nodes.map(function (n) {
        var h = n.querySelector('h3'), rr = h.getBoundingClientRect();
        return { x: rr.left - r.left - 10, y: rr.top - r.top + rr.height / 2 };
      });
    };
    size(); window.addEventListener('resize', size); ScrollTrigger.addEventListener('refresh', size);
    sec.addEventListener('pointermove', function (e) { var r = sec.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    sec.addEventListener('pointerleave', function () { mouse = null; });
    ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: function (s) { on = s.isActive; } });
    var pairs = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5], [0, 4], [2, 4]];
    gsap.ticker.add(function () {
      if (!on || !pts.length) return;
      t += .006;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      pairs.forEach(function (p, i) {
        var a = pts[p[0]], b = pts[p[1]]; if (!a || !b) return;
        var cx = (a.x + b.x) / 2 + Math.sin(t * 1.3 + i) * 40, cy = (a.y + b.y) / 2 + Math.cos(t + i * 1.7) * 40;
        var alpha = .1;
        if (mouse) {
          var dx = mouse.x - cx, dy = mouse.y - cy, dist = Math.sqrt(dx * dx + dy * dy);
          var pull = Math.max(0, 1 - dist / 520);
          cx += dx * pull * .55; cy += dy * pull * .55; alpha += pull * .22;
        }
        ctx.strokeStyle = 'rgba(20,26,51,' + alpha.toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(cx, cy, b.x, b.y); ctx.stroke();
      });
      pts.forEach(function (a) {
        ctx.fillStyle = 'rgba(143,42,34,.55)';
        ctx.beginPath(); ctx.arc(a.x, a.y, 2.6, 0, Math.PI * 2); ctx.fill();
      });
      if (mouse) {
        var near = pts.map(function (a) { return { a: a, d: Math.hypot(a.x - mouse.x, a.y - mouse.y) }; }).sort(function (x, y) { return x.d - y.d; }).slice(0, 2);
        near.forEach(function (n) {
          ctx.strokeStyle = 'rgba(143,42,34,' + Math.max(0, .35 - n.d / 1600).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.quadraticCurveTo((mouse.x + n.a.x) / 2, mouse.y, n.a.x, n.a.y); ctx.stroke();
        });
      }
    });
  }

  /* ---------- Deux lignes vers un même cadre ---------- */
  var bridge = $('[data-bridge]');
  if (bridge && !calm) {
    var parts = $$('.b-left, .b-right, .b-frame', bridge);
    parts.forEach(function (p) { var l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    var et = $('.b-et', bridge);
    gsap.set(et, { opacity: 0, scale: .6, transformOrigin: '50% 60%' });
    var btl = gsap.timeline({ scrollTrigger: { trigger: bridge.closest('.approaches'), start: 'top 70%', end: 'center 45%', scrub: .8 } });
    btl.to($$('.b-left, .b-right', bridge), { strokeDashoffset: 0, duration: 1, ease: 'none' })
      .to($('.b-frame', bridge), { strokeDashoffset: 0, duration: .6, ease: 'none' })
      .to(et, { opacity: 1, scale: 1, duration: .4, ease: 'power2.out' }, '-=.2');
  }

  /* ---------- La fenêtre de visio ---------- */
  var visio = $('[data-visio]');
  if (visio) {
    var steps = $$('.step', visio), imgs = $$('.screen__img', visio), num = $('[data-step-num]', visio);
    var stroke = $('.screen__stroke', visio);
    var setStep = function (i) {
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      if (num) num.textContent = i + 1;
    };
    if (stroke && !calm) {
      var len = stroke.getTotalLength();
      stroke.style.strokeDasharray = len; stroke.style.strokeDashoffset = len;
    }
    if (window.innerWidth > 980 && !calm) {
      visio.classList.add('js-pinned');
      var frame = $('.screen__frame', visio);
      var vtl = gsap.timeline({
        scrollTrigger: {
          trigger: visio, start: 'center 52%', end: '+=' + (window.innerHeight * 2.4), pin: visio.closest('section'), pinSpacing: true, scrub: .6,
          onUpdate: function (self) { setStep(Math.min(3, Math.floor(self.progress * 4))); }
        }
      });
      vtl.fromTo(frame, { filter: 'brightness(.25)' }, { filter: 'brightness(1)', duration: .5, ease: 'none' }, 0);
      if (stroke) vtl.to(stroke, { strokeDashoffset: 0, duration: .5, ease: 'none' }, 0);
      steps.forEach(function (s, i) {
        var bar = $('.step__bar', s);
        vtl.fromTo(bar, { width: '0%' }, { width: '100%', duration: 1, ease: 'none' }, i);
      });
      $$('.screen__img img', visio).forEach(function (im, i) {
        vtl.fromTo(im, { scale: 1.08 }, { scale: 1, duration: 1, ease: 'none' }, i);
      });
      // la section est épinglée en entier : on ne garde que la scène visible
      ScrollTrigger.refresh();
    } else {
      setStep(0);
    }
  }
})();
