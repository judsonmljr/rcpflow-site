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
});
