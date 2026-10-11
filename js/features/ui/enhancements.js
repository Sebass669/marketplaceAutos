import { $, $$, ICON_SPRITE } from '../../utils/dom.js';

/**
 * Revela secciones al entrar en pantalla (marca [data-reveal] -> .is-visible).
 * Con prefers-reduced-motion el CSS ya muestra todo sin animar.
 */
export function initReveal() {
  const elementos = $$('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  elementos.forEach((el) => observer.observe(el));
}

/** Menú móvil: botón hamburguesa que abre/cierra la navegación. */
export function initNav() {
  const header = $('[data-header]');
  const toggle = $('[data-nav-toggle]', header);
  const icono = $('use', toggle);

  const setAbierto = (abierto) => {
    header.toggleAttribute('data-menu-abierto', abierto);
    toggle.setAttribute('aria-expanded', String(abierto));
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    icono.setAttribute('href', `${ICON_SPRITE}#i-${abierto ? 'x' : 'list'}`);
  };
  const cerrar = () => setAbierto(false);

  toggle.addEventListener('click', () => setAbierto(!header.hasAttribute('data-menu-abierto')));
  $$('.nav a', header).forEach((a) => a.addEventListener('click', cerrar));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && cerrar());

  // Sombra del header cuando la página ya no está arriba (sin listener de scroll).
  const centinela = $('[data-top-sentinel]');
  if (centinela && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => header.toggleAttribute('data-elevado', !entry.isIntersecting)).observe(centinela);
  }
}

/**
 * Pausa las animaciones CSS infinitas (nubes, sello, pines, cinta) mientras su sección
 * no está en pantalla. El CSS hace la pausa con [data-pausable]:not(.en-vista).
 */
export function initPausables() {
  const secciones = $$('[data-pausable]');
  if (!('IntersectionObserver' in window)) {
    secciones.forEach((el) => el.classList.add('en-vista'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.classList.toggle('en-vista', entry.isIntersecting);
  });
  secciones.forEach((el) => observer.observe(el));
}

/**
 * Scroll suave para enlaces internos (#carros, #vender...). Se hace aquí y no con
 * `scroll-behavior: smooth` en CSS porque ese modo interfiere con ScrollTrigger.
 * Los links de ficha (#carro/ID) los maneja el router.
 */
export function initAnclas() {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || link.getAttribute('href').startsWith('#carro/')) return;
    const destino = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!destino) return;
    e.preventDefault();
    destino.scrollIntoView({ behavior: reducido.matches ? 'auto' : 'smooth' });
    history.pushState(null, '', link.hash);
  });
}
