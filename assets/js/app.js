/* RIPEX concept - progressive enhancement only.
   Nothing here is required to read the page: reveals are handled inline
   with a hard failsafe, and every section renders without JavaScript. */
(function () {
  'use strict';

  var d = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(min-width: 768px)').matches;

  /* ---------- mobile drawer ---------- */
  var burger = d.getElementById('burger');
  var mnav = d.getElementById('mnav');

  function closeNav() {
    if (!burger || !mnav) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Atidaryti meniu');
    mnav.hidden = true;
    d.body.style.overflow = '';
  }
  function openNav() {
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Uždaryti meniu');
    mnav.hidden = false;
    d.body.style.overflow = 'hidden';
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') closeNav(); else openNav();
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        closeNav();
        burger.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) closeNav();
    });
  }

  /* ---------- active section in nav + chips ---------- */
  var navLinks = Array.prototype.slice.call(d.querySelectorAll('.nav a[href^="#"]'));
  var chipLinks = Array.prototype.slice.call(d.querySelectorAll('.chips__in a[href^="#"]'));

  function trackActive(links, opts) {
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    var targets = [];
    links.forEach(function (a) {
      var el = d.getElementById(a.getAttribute('href').slice(1));
      if (el) { map[el.id] = a; targets.push(el); }
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-on'); });
        var a = map[en.target.id];
        if (a) a.classList.add('is-on');
      });
    }, opts);
    targets.forEach(function (t) { io.observe(t); });
  }
  trackActive(navLinks, { rootMargin: '-25% 0px -68% 0px' });
  trackActive(chipLinks, { rootMargin: '-20% 0px -72% 0px' });

  /* ---------- counters (real machine specs, animated once) ---------- */
  var nums = Array.prototype.slice.call(d.querySelectorAll('.num'));
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    var fmt = function (v, dec) {
      return v.toFixed(dec).replace('.', ',');
    };
    var run = function (el) {
      var to = parseFloat(el.getAttribute('data-to'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      if (isNaN(to)) return;
      var start = 0, dur = 1100, t0 = null;
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(start + (to - start) * eased, dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = fmt(to, dec);
      };
      requestAnimationFrame(step);
    };
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); nio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { nio.observe(n); });
  }

  /* ---------- hero parallax (desktop only, transform only) ---------- */
  var heroMedia = d.querySelector('.hero__media');
  if (heroMedia && fine && !reduce && 'IntersectionObserver' in window) {
    var ticking = false, active = false;
    var move = function () {
      var y = window.scrollY || window.pageYOffset;
      heroMedia.style.transform = 'translate3d(0,' + (y * 0.14).toFixed(1) + 'px,0)';
      ticking = false;
    };
    var onScroll = function () {
      if (!ticking && active) { ticking = true; requestAnimationFrame(move); }
    };
    var hio = new IntersectionObserver(function (entries) {
      active = entries[0].isIntersecting;
      if (active) { move(); }
    });
    hio.observe(heroMedia);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- "Užklausti" prefills the subject ---------- */
  var subject = d.getElementById('f-tema');
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-item]');
    if (!a || !subject) return;
    subject.value = a.getAttribute('data-item');
    var name = d.getElementById('f-name');
    if (name) setTimeout(function () { name.focus({ preventScroll: true }); }, 520);
  });

  /* ---------- form: inline validation, then a prepared e-mail to RIPEX ---------- */
  var frm = d.getElementById('frm');
  var done = d.getElementById('done');
  var again = d.getElementById('again');

  function setErr(input, errEl, bad, msg) {
    if (!input || !errEl) return;
    if (bad) {
      input.setAttribute('aria-invalid', 'true');
      if (msg) errEl.textContent = msg;
      errEl.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      errEl.hidden = true;
    }
  }

  if (frm) {
    var name = d.getElementById('f-name');
    var mail = d.getElementById('f-mail');
    var eName = d.getElementById('e-name');
    var eMail = d.getElementById('e-mail');
    var mailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var status = d.getElementById('frm-status');

    [[name, eName], [mail, eMail]].forEach(function (pair) {
      if (!pair[0]) return;
      pair[0].addEventListener('blur', function () {
        if (pair[0] === name) setErr(name, eName, !name.value.trim());
        else setErr(mail, eMail, !mailRe.test(mail.value.trim()));
      });
      pair[0].addEventListener('input', function () {
        if (pair[0].getAttribute('aria-invalid') === 'true') {
          if (pair[0] === name) setErr(name, eName, !name.value.trim());
          else setErr(mail, eMail, !mailRe.test(mail.value.trim()));
        }
      });
    });

    frm.addEventListener('submit', function (e) {
      e.preventDefault();
      var badName = !name.value.trim();
      var badMail = !mailRe.test(mail.value.trim());
      setErr(name, eName, badName);
      setErr(mail, eMail, badMail);
      if (badName || badMail) {
        if (status) status.textContent = 'Formoje yra klaidų. Patikrinkite pažymėtus laukus.';
        (badName ? name : mail).focus();
        return;
      }
      var val = function (id) { var el = d.getElementById(id); return el && el.value.trim() ? el.value.trim() : '-'; };
      var tema = val('f-tema');
      var body = [
        'Vardas: ' + val('f-name'),
        'El. paštas: ' + val('f-mail'),
        'Tel. nr.: ' + val('f-tel'),
        'Tema: ' + tema,
        'Žinutė: ' + val('f-msg')
      ].join('\n');
      var href = 'mailto:ripex.info@gmail.com?subject=' + encodeURIComponent('Užklausa RIPEX' + (tema !== '-' ? ': ' + tema : '')) +
        '&body=' + encodeURIComponent(body);
      frm.hidden = true;
      if (status) status.textContent = 'Atidaroma el. pašto programa su paruoštu laišku. Išsiųskite jį, kad užklausa pasiektų RIPEX.';
      if (done) {
        done.hidden = false;
        done.setAttribute('tabindex', '-1');
        done.focus({ preventScroll: true });
      }
      var a = d.createElement('a');
      a.href = href;
      a.click();
    });
  }

  if (again && frm && done) {
    again.addEventListener('click', function () {
      done.hidden = true;
      frm.hidden = false;
      frm.reset();
      var st = d.getElementById('frm-status');
      if (st) st.textContent = '';
      var n = d.getElementById('f-name');
      if (n) n.focus();
    });
  }
})();
