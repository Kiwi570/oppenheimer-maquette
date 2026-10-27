/* Téléconsultation : liste de préparation, test caméra et micro (local), galerie « Pour qui ». */
(function () {
  'use strict';
  var RO = window.RO || {}, d = document, $ = RO.$, $$ = RO.$$;

  /* Liste de préparation : rien n'est enregistré */
  var list = $('[data-checklist]');
  if (list) {
    var boxes = $$('input[type="checkbox"]', list), count = $('[data-check-count]'), bar = $('[data-check-bar]'), msg = $('[data-check-msg]');
    var upd = function () {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      count.textContent = n + ' sur ' + boxes.length;
      bar.style.transform = 'scaleX(' + (n / boxes.length) + ')';
      msg.textContent = n === boxes.length ? 'Tout est prêt pour la séance' : 'Prêt quand tout est coché';
    };
    boxes.forEach(function (b) { b.addEventListener('change', upd); });
    upd();
  }

  /* Test caméra et micro : le flux reste dans le navigateur */
  var cam = $('[data-camtest]');
  if (cam) {
    var video = $('video', cam), meter = $('.camtest__meter i', cam), status = $('[data-cam-status]', cam);
    var bStart = $('[data-cam-start]', cam), bStop = $('[data-cam-stop]', cam);
    var stream = null, actx = null, raf = 0;
    var stop = function () {
      cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      if (actx) actx.close();
      stream = null; actx = null; video.srcObject = null; meter.style.transform = 'scaleX(0)';
      bStart.hidden = false; bStop.hidden = true;
    };
    bStart.addEventListener('click', function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        status.textContent = 'Ce navigateur ne permet pas le test. Doctolib vérifiera votre matériel avant la séance.';
        return;
      }
      status.textContent = 'Autorisez la caméra et le micro dans la fenêtre du navigateur.';
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function (s) {
        stream = s; video.srcObject = s; video.play();
        bStart.hidden = true; bStop.hidden = false;
        status.textContent = 'Caméra et micro fonctionnent. Parlez : la barre doit bouger. Rien n’est enregistré.';
        try {
          actx = new (window.AudioContext || window.webkitAudioContext)();
          var src = actx.createMediaStreamSource(s), an = actx.createAnalyser(); an.fftSize = 512; src.connect(an);
          var data = new Uint8Array(an.fftSize);
          var loop = function () {
            an.getByteTimeDomainData(data);
            var sum = 0; for (var i = 0; i < data.length; i++) { var v = (data[i] - 128) / 128; sum += v * v; }
            meter.style.transform = 'scaleX(' + Math.min(1, Math.sqrt(sum / data.length) * 5) + ')';
            raf = requestAnimationFrame(loop);
          };
          loop();
        } catch (e) {}
      }).catch(function () {
        status.textContent = 'Le test n’a pas pu démarrer (autorisation refusée ou aperçu sans accès à la caméra). Sur le site en ligne, il fonctionnera après autorisation.';
      });
    });
    bStop.addEventListener('click', function () { stop(); status.textContent = 'Test arrêté.'; });
    window.addEventListener('pagehide', stop);
  }

  /* Galerie horizontale « Pour qui » */
  var gal = $('[data-hgal]');
  if (gal) {
    var step = function () { var c = $('.card', gal); return c ? c.getBoundingClientRect().width + 24 : 320; };
    $('[data-hgal-prev]').addEventListener('click', function () { gal.scrollBy({ left: -step(), behavior: RO.calm ? 'auto' : 'smooth' }); });
    $('[data-hgal-next]').addEventListener('click', function () { gal.scrollBy({ left: step(), behavior: RO.calm ? 'auto' : 'smooth' }); });
    if (window.gsap && !RO.calm) {
      gsap.from($$('.card', gal), { x: 80, opacity: 0, duration: 1.1, stagger: .08, scrollTrigger: { trigger: gal, start: 'top 85%', once: true } });
    }
  }
})();
