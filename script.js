(function () {
  'use strict';
  // ====== EDIT HERE: WhatsApp number (country code + number, no + or spaces) ======
  var WHATSAPP = '919573672459';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Navbar shrink on scroll
  var nav = $('#nav');
  function onScroll() { nav.classList.toggle('sm', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Scroll reveal + counters
  function count(el) {
    var end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    var t0 = null;
    el.textContent = 0;
    (function step(t) {
      t0 = t0 || t;
      var p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (i) {
        if (!i.isIntersecting) return;
        i.target.classList.add('in');
        $$('[data-count]', i.target).forEach(count);
        io.unobserve(i.target);
      });
    }, { threshold: 0.15 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('in'); });
  }

  // "Learn More" pre-selects the program in the form
  $$('[data-prog]').forEach(function (a) {
    a.addEventListener('click', function () { $('#pg').value = a.dataset.prog; });
  });

  // Enquiry form (no backend: validates, then prepares a WhatsApp message)
  var form = $('#form'), ok = $('#ok');
  function check(id, test, msg) {
    var f = $('#' + id), good = test(f.value.trim());
    f.parentNode.classList.toggle('bad', !good);
    $('em', f.parentNode).textContent = good ? '' : msg;
    f.setAttribute('aria-invalid', !good);
    return good;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var req = function (v) { return v.length > 1; };
    var results = [
      check('sn', req, 'Please enter the student name.'),
      check('pn', req, 'Please enter the parent name.'),
      check('ph', function (v) { return /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/\s/g, '')); }, 'Enter a valid 10-digit Indian mobile number.'),
      check('cl', function (v) { return v !== ''; }, 'Please select a class.'),
      check('pg', function (v) { return v !== ''; }, 'Please select a program.')
    ];
    if (results.indexOf(false) > -1) { $('.bad input, .bad select', form).focus(); ok.hidden = true; return; }
    var v = function (id) { return $('#' + id).value.trim(); };
    var text = 'Hello, I would like to enquire about ' + v('pg') + '.\n' +
      'Student: ' + v('sn') + '\nParent: ' + v('pn') + '\nClass: ' + v('cl') +
      '\nPhone: ' + v('ph') + (v('ms') ? '\nMessage: ' + v('ms') : '');
    ok.hidden = false;
    ok.innerHTML = '<strong>Your enquiry is ready, but it has not been sent yet.</strong><br>' +
      'This website has no server, so please tap the button below to send it on WhatsApp, or call +91 95736 72459.<br>';
    var a = document.createElement('a');
    a.className = 'btn';
    a.target = '_blank'; a.rel = 'noopener';
    a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
    a.textContent = 'Send on WhatsApp';
    ok.appendChild(a);
    ok.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  });
  $$('input,select', form).forEach(function (f) {
    f.addEventListener('input', function () { f.parentNode.classList.remove('bad'); $('em', f.parentNode).textContent = ''; });
  });
})();