// Script do site (arquivo próprio para a política de segurança proibir scripts embutidos na página).
document.documentElement.classList.add('js');

// Tema claro ou escuro: segue o sistema até a pessoa escolher no botão; a escolha fica guardada neste aparelho.
var tema = (function () {
  var root = document.documentElement;
  var dark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var saved = null;
  try { saved = localStorage.getItem('tema'); } catch (e) {}
  if (saved !== 'light' && saved !== 'dark') saved = null;
  function current() { return saved || (dark && dark.matches ? 'dark' : 'light'); }
  function paint() {
    var t = current();
    if (saved) root.setAttribute('data-theme', saved); else root.removeAttribute('data-theme');
    root.classList.toggle('is-dark', t === 'dark');
    // As telas do app em <picture> e a cor da barra do navegador acompanham a escolha.
    document.querySelectorAll('source[data-dark]').forEach(function (s) {
      s.setAttribute('media', saved ? (saved === 'dark' ? 'all' : 'not all') : '(prefers-color-scheme: dark)');
    });
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      var isDarkMeta = /dark/.test(m.getAttribute('data-scheme') || m.getAttribute('media') || '');
      if (!m.hasAttribute('data-scheme')) m.setAttribute('data-scheme', isDarkMeta ? 'dark' : 'light');
      m.setAttribute('media', saved ? (isDarkMeta === (saved === 'dark') ? 'all' : 'not all') : '(prefers-color-scheme: ' + m.getAttribute('data-scheme') + ')');
    });
    var b = document.querySelector('.theme');
    if (b) b.setAttribute('aria-label', t === 'dark' ? 'Usar tema claro' : 'Usar tema escuro');
  }
  function toggle() {
    saved = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('tema', saved); } catch (e) {}
    paint();
  }
  if (dark && dark.addEventListener) dark.addEventListener('change', paint);
  paint();
  return { paint: paint, toggle: toggle };
})();

document.addEventListener('DOMContentLoaded', function () {
  // Botão do tema no cabeçalho, ao lado do botão principal.
  (function () {
    document.querySelectorAll('source[media="(prefers-color-scheme: dark)"]').forEach(function (s) { s.setAttribute('data-dark', ''); });
    var wrap = document.querySelector('.top .wrap');
    if (wrap) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'theme';
      b.innerHTML = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>' +
        '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
      b.addEventListener('click', tema.toggle);
      var cta = wrap.querySelector('.pill');
      wrap.insertBefore(b, cta || null);
    }
    tema.paint();
  })();

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
  // Relógio da parada: rolar a linha do tempo é o tempo passando. O relógio conta entre os horários de cada
  // momento, a trilha mostra o ciclo de 2 minutos e cada evento acende na cor dele (azul ritmo, vermelho choque,
  // laranja droga). Com movimento reduzido, os números mudam sem contagem e sem pulso.
  (function () {
    var list = document.querySelector('.moments');
    var items = list ? Array.prototype.slice.call(list.querySelectorAll('li')) : [];
    if (!items.length) return;
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function secs(li) {
      var m = /(\d+):(\d+)/.exec(li.querySelector('time').textContent);
      return m ? Number(m[1]) * 60 + Number(m[2]) : null;
    }
    var stops = items.map(function (li) {
      var kind = ['rhythm', 'shock', 'drug', 'end'].filter(function (k) { return li.classList.contains(k); })[0] || 'start';
      return { li: li, t: secs(li), kind: kind, name: li.querySelector('h3').textContent };
    });
    var last = 0;
    stops.forEach(function (s) { if (s.t === null) s.t = last; last = s.t; });
    // Eventos marcados na trilha: os da lista e o 2º choque, que a linha do tempo cita no item da adrenalina.
    var marks = stops.filter(function (s) { return s.kind === 'shock' || s.kind === 'drug'; })
      .map(function (s) { return { t: s.t, kind: s.kind }; });
    var drug = stops.filter(function (s) { return s.kind === 'drug'; })[0];
    if (drug) marks.push({ t: drug.t - 25, kind: 'shock', name: '2º choque' });

    var clock = document.createElement('div');
    clock.className = 'clock';
    clock.setAttribute('aria-hidden', 'true');
    clock.innerHTML = '<div class="clock-head"><span class="clock-cycle">Ciclo 1</span><span class="clock-event"></span></div>' +
      '<div class="clock-time mono">0:00</div><div class="clock-track"><i class="clock-fill"></i></div>';
    var track = clock.querySelector('.clock-track');
    marks.forEach(function (m) {
      var dot = document.createElement('b');
      dot.className = 'clock-mark ' + m.kind;
      m.el = dot;
      track.appendChild(dot);
    });
    var elTime = clock.querySelector('.clock-time');
    var elCycle = clock.querySelector('.clock-cycle');
    var elEvent = clock.querySelector('.clock-event');
    var elFill = clock.querySelector('.clock-fill');

    // No computador o relógio fica sobre o celular fixo; no celular, preso ao topo da linha do tempo.
    var wide = window.matchMedia('(min-width: 48.01rem)');
    function place() {
      if (wide.matches) { var dev = document.getElementById('shots'); if (dev) dev.appendChild(clock); }
      else list.parentNode.insertBefore(clock, list);
    }
    place();
    if (wide.addEventListener) wide.addEventListener('change', place);

    function fmt(t) { t = Math.max(0, Math.round(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
    var shown = -1, lastFlash = null, ended = false;
    function render(t, endState) {
      var cycle = Math.floor(t / 120) + 1;
      var within = (t % 120) / 120;
      if (Math.round(t) !== shown || endState !== ended) {
        shown = Math.round(t);
        elTime.textContent = fmt(t);
      }
      elCycle.textContent = endState ? 'Parada encerrada' : 'Ciclo ' + cycle + ' · tempo total';
      elFill.style.transform = 'scaleX(' + (endState ? 1 : within).toFixed(4) + ')';
      marks.forEach(function (m) {
        var inCycle = Math.floor(m.t / 120) + 1 === cycle;
        m.el.style.left = ((m.t % 120) / 120 * 100).toFixed(2) + '%';
        m.el.classList.toggle('is-on', !endState && inCycle && t >= m.t);
        m.el.classList.toggle('is-out', !endState && !inCycle);
      });
      // O evento mais recente já alcançado dá nome e cor ao relógio.
      var hit = null;
      marks.concat(stops.filter(function (s) { return s.kind === 'rhythm'; })).forEach(function (m) {
        if (t >= m.t && t - m.t < 18 && (!hit || m.t >= hit.t)) hit = m;
      });
      var label = endState ? 'Resumo pronto' : hit ? (hit.name || stops.filter(function (s) { return s.t === hit.t && s.kind === hit.kind; })[0].name) : '';
      elEvent.textContent = label;
      var kind = endState ? 'end' : hit ? hit.kind : '';
      clock.setAttribute('data-kind', kind);
      var key = endState ? 'end' : hit ? hit.kind + hit.t : null;
      if (key && key !== lastFlash && !still) {
        clock.classList.remove('flash'); void clock.offsetWidth; clock.classList.add('flash');
      }
      lastFlash = key;
      ended = endState;
    }

    // Tempo pela posição: entre o centro de um momento e o do seguinte, o relógio anda de um horário ao outro.
    function target() {
      var mid = window.innerHeight * 0.5;
      var centers = stops.map(function (s) { var r = s.li.getBoundingClientRect(); return r.top + Math.min(r.height, 160) / 2; });
      if (mid <= centers[0]) return { t: stops[0].t, end: false };
      for (var i = 0; i < stops.length - 1; i++) {
        if (mid < centers[i + 1]) {
          var k = (mid - centers[i]) / (centers[i + 1] - centers[i]);
          var a = stops[i], b = stops[i + 1];
          return { t: a.t + (b.t - a.t) * Math.min(1, Math.max(0, k)), end: false };
        }
      }
      return { t: stops[stops.length - 1].t, end: stops[stops.length - 1].kind === 'end' };
    }
    var cur = 0, goal = { t: 0, end: false }, raf = 0;
    function step() {
      raf = 0;
      var d = goal.t - cur;
      cur = still || Math.abs(d) < 0.3 ? goal.t : cur + d * 0.18;
      render(cur, goal.end && cur === goal.t);
      if (cur !== goal.t) raf = window.requestAnimationFrame(step);
    }
    function onScroll() { goal = target(); if (!raf) raf = window.requestAnimationFrame(step); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  })();

  // Cabeçalho: a linha de baixo só aparece quando o conteúdo passa por baixo dele.
  (function () {
    var top = document.querySelector('.top');
    if (!top) return;
    function edge() { top.classList.toggle('is-scrolled', window.scrollY > 4); }
    window.addEventListener('scroll', edge, { passive: true });
    edge();
  })();

  // Listas que se leem em sequência entram item por item (as negativas da privacidade e os passos de instalação).
  // Com movimento reduzido, os itens só aparecem num fade curto (ver o CSS).
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var lists = document.querySelectorAll('.nots, .steps');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    lists.forEach(function (l) {
      l.classList.add('seq');
      Array.prototype.forEach.call(l.children, function (li, i) { li.style.setProperty('--i', String(i)); });
      io.observe(l);
    });
    // O botão do fecho bate três vezes, como o da abertura, quando chega à tela.
    var close = document.querySelector('.close .pill-green');
    if (close) {
      var io2 = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { close.classList.add('beat'); io2.disconnect(); }
      }, { rootMargin: '0px 0px -20% 0px' });
      io2.observe(close);
    }
  })();
});
