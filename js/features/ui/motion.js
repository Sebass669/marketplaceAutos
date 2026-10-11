import { $, $$ } from '../../utils/dom.js';

/**
 * Capa de animación con GSAP + ScrollTrigger (cargados por CDN en index.html).
 * Todo es progresivo: si GSAP no carga o el usuario pidió menos movimiento,
 * la página queda completa y estática.
 *
 * Cada animación tiene un motivo:
 *  - Hero: el carro llega y se estaciona (la historia del sitio: un carro que se pone en venta).
 *  - Parallax del cielo: profundidad entre letras, nubes y paisaje.
 *  - Plano técnico: el carro se dibuja a línea mientras se explica el proceso.
 */

const gsapListo = () => Boolean(window.gsap && window.ScrollTrigger);

let movimientoActivo = false;

/** Parte el wordmark en letras para animarlas una por una. */
function partirLetras(el) {
  const texto = el.textContent.trim();
  el.replaceChildren(
    ...[...texto].map((letra) => {
      const span = document.createElement('span');
      span.className = 'letra';
      span.textContent = letra;
      return span;
    }),
  );
}

/** Prepara un trazo SVG para dibujarse (stroke-dasharray = largo). */
function prepararTrazo(el) {
  const largo = el.getTotalLength();
  el.style.strokeDasharray = `${largo}`;
  el.style.strokeDashoffset = `${largo}`;
}

function introHero(gsap) {
  const carro = $('[data-carro]');
  const nota = $('[data-nota]');
  const flecha = $('.nota__flecha path', nota);
  prepararTrazo(flecha);

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.wordmark .letra', { yPercent: 70, opacity: 0, duration: 1, stagger: 0.055 })
    .from('.cielo__lugar', { y: 16, opacity: 0, duration: 0.6 }, '-=0.6')
    .from('.paisaje__fondo', { y: 40, opacity: 0, duration: 1.2 }, 0.2)
    .from('.paisaje__sedan', { opacity: 0, duration: 0.8 }, 0.6)
    // El carro entra manejando desde la izquierda, con rebote de suspensión.
    .from(carro, { xPercent: -260, duration: 2.4, ease: 'power3.out' }, 0.5)
    .to(carro.firstElementChild, { y: -3, duration: 0.11, repeat: 13, yoyo: true, ease: 'sine.inOut' }, 0.5)
    .to(carro.firstElementChild, { y: 2, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, 2.55)
    .from(nota, { scale: 0.5, rotate: -18, opacity: 0, duration: 0.7, ease: 'back.out(2.2)' }, 2.6)
    .to(flecha, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, 2.9)
    .from('.suelo__titulo span', { y: 24, opacity: 0, duration: 0.8, stagger: 0.12 }, 0.9)
    .from('.se-vende span', { yPercent: 30, opacity: 0, duration: 1, stagger: 0.1 }, 1.1)
    .from('.suelo__accion > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 }, 1.3);
}

function parallaxCielo(gsap) {
  const st = { trigger: '.cielo', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.wordmark', { yPercent: 35, ease: 'none', scrollTrigger: st });
  gsap.to('.paisaje__fondo', { yPercent: 6, ease: 'none', scrollTrigger: st });
  gsap.to('.nube--1', { x: 120, ease: 'none', scrollTrigger: st });
  gsap.to('.nube--2', { x: -90, ease: 'none', scrollTrigger: st });
}

function planoTecnico(gsap) {
  const svg = $('[data-plano-carro]');
  const trazos = $$('.trazo path, .trazo circle, .cotas path', svg);
  trazos.forEach(prepararTrazo);

  gsap
    .timeline({
      scrollTrigger: { trigger: '.plano__cuerpo', start: 'top 80%', end: 'bottom 55%', scrub: 0.8 },
    })
    .to(trazos, { strokeDashoffset: 0, ease: 'none', stagger: 0.04, duration: 1 })
    .from($$('text', svg), { opacity: 0, stagger: 0.1, duration: 0.3 }, '-=0.4');

  gsap.from('.plano__datos p', {
    x: -16,
    opacity: 0,
    stagger: 0.12,
    duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.plano__datos', start: 'top 85%' },
  });

  gsap.from('[data-paso]', {
    y: 40,
    opacity: 0,
    stagger: 0.15,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.plano__pie', start: 'top 85%' },
  });
}

function carroFooter(gsap) {
  gsap.from('.footer__carro', {
    x: () => -window.innerWidth,
    duration: 2.6,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.footer', start: 'top 90%' },
  });
}

export function initMotion() {
  const wordmark = $('[data-wordmark]');
  if (!gsapListo()) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  // En celulares la barra de direcciones cambia el alto de la ventana al hacer scroll:
  // ignorarlo evita recalcular todos los disparadores en cada gesto.
  ScrollTrigger.config({ ignoreMobileResize: true });
  partirLetras(wordmark);

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    movimientoActivo = true;
    introHero(gsap);
    parallaxCielo(gsap);
    planoTecnico(gsap);
    carroFooter(gsap);
    return () => {
      movimientoActivo = false;
    };
  });

  // Las fuentes web cambian el alto del texto al cargar: recalcula los disparadores una vez.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** Cuenta de 0 al número final (contador del hero). Sin GSAP, pone el número directo. */
export function contarHasta(el, final) {
  const formato = (n) => String(Math.round(n)).padStart(2, '0');
  if (!gsapListo() || !movimientoActivo) {
    el.textContent = formato(final);
    return;
  }
  const estado = { n: 0 };
  window.gsap.to(estado, {
    n: final,
    duration: 1.6,
    delay: 1.4,
    ease: 'power2.out',
    onUpdate: () => (el.textContent = formato(estado.n)),
  });
}

/** Recalcula posiciones de ScrollTrigger cuando cambia el alto de la página (ej. carga del catálogo). */
export function refrescarScroll() {
  if (gsapListo()) window.ScrollTrigger.refresh();
}
