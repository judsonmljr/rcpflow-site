// Script do site (arquivo próprio para a política de segurança proibir scripts embutidos na página).
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  // O celular fixo troca de tela conforme cada momento da parada chega ao centro da tela.
  (function () {
    var items = document.querySelectorAll('.moments li');
    var shots = document.querySelectorAll('#shots .shot');
    if (!('IntersectionObserver' in window) || !items.length) return;
    function activate(li) {
      items.forEach(function (x) { x.classList.toggle('is-on', x === li); });
      var n = Number(li.getAttribute('data-shot'));
      shots.forEach(function (s, i) { s.classList.toggle('is-on', i === n); });
    }
    activate(items[0]);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) activate(e.target); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    items.forEach(function (li) { io.observe(li); });
  })();

  // O menu do topo marca a seção que está no meio da tela.
  (function () {
    var links = document.querySelectorAll('.top nav a');
    var sections = document.querySelectorAll('main > section');
    if (!('IntersectionObserver' in window) || !links.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  })();
  // Movimento ao rolar: blocos entram quando chegam à tela e os celulares da abertura têm leve paralaxe.
  (function () {
    if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    var groups = [
      'main > section:not(.hero) h2', 'main > section .lead', '.stages .stage', '.also > div',
      '.privacy-body > div', '.nots li', '.platforms > div', '.steps li', '.guide',
      '.qa > div', '.close .pill', '.close .disclaimer'
    ];
    var els = [];
    groups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.classList.contains('rv')) return;
        el.classList.add('rv');
        // Itens irmãos entram em sequência; o atraso volta a zero a cada quatro para não demorar.
        var i = Array.prototype.indexOf.call(el.parentElement.children, el);
        if (i > 0) el.style.setProperty('--i', String(i % 4));
        els.push(el);
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });

    var phones = document.querySelectorAll('.hero-phones .device');
    var hero = document.querySelector('.hero');
    if (!phones.length || !hero || !window.matchMedia('(min-width: 48.01rem)').matches) return;
    var ticking = false;
    function update() {
      ticking = false;
      var y = Math.min(window.scrollY, hero.offsetHeight);
      phones[0].style.setProperty('--py', (y * -0.08).toFixed(1) + 'px');
      phones[1].style.setProperty('--py', (y * -0.18).toFixed(1) + 'px');
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();
});
