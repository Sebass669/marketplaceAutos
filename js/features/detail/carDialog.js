import { h, icon } from '../../utils/dom.js';
import { formatFecha, formatKm, formatPrecio, tituloAuto } from '../../utils/format.js';
import { linkWhatsApp, mensajeInteres } from '../../utils/whatsapp.js';
import { selloEstado } from '../catalog/carCard.js';

/** Ficha técnica: [etiqueta, valor]. Se omiten los campos vacíos. */
const especificaciones = (auto) =>
  [
    ['Año', auto.anio],
    ['Kilometraje', formatKm(auto.kilometraje)],
    ['Transmisión', auto.transmision],
    ['Combustible', auto.combustible],
    ['Motor', auto.motor],
    ['Tracción', auto.traccion],
    ['Color', auto.color],
    ['Ubicación', [auto.canton, auto.provincia].filter(Boolean).join(', ')],
  ].filter(([, valor]) => valor !== '' && valor !== undefined);

function galeria(auto) {
  const principal = h('img', {
    class: 'galeria__principal',
    src: auto.fotos[0],
    alt: `${tituloAuto(auto)}, foto 1 de ${auto.fotos.length}`,
    width: 1280,
    height: 860,
  });

  if (auto.fotos.length === 1) return h('div', { class: 'galeria' }, principal);

  const miniaturas = auto.fotos.map((src, i) =>
    h(
      'button',
      {
        type: 'button',
        class: 'galeria__thumb',
        'aria-label': `Ver foto ${i + 1}`,
        'aria-current': i === 0 ? 'true' : 'false',
        onclick: (e) => {
          principal.src = src;
          principal.alt = `${tituloAuto(auto)}, foto ${i + 1} de ${auto.fotos.length}`;
          for (const btn of e.currentTarget.parentElement.children) btn.setAttribute('aria-current', 'false');
          e.currentTarget.setAttribute('aria-current', 'true');
        },
      },
      h('img', { src, alt: '', loading: 'lazy' }),
    ),
  );

  return h('div', { class: 'galeria' }, principal, h('div', { class: 'galeria__thumbs' }, miniaturas));
}

async function compartir(auto, boton) {
  const url = location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title: tituloAuto(auto), url });
      return;
    }
    await navigator.clipboard.writeText(url);
    boton.lastChild.textContent = 'Link copiado';
    setTimeout(() => (boton.lastChild.textContent = 'Compartir'), 2000);
  } catch {
    /* El usuario canceló el diálogo de compartir. */
  }
}

function acciones(auto) {
  const botonCompartir = h(
    'button',
    { type: 'button', class: 'btn btn--ghost', onclick: (e) => compartir(auto, e.currentTarget) },
    icon('share-network'),
    h('span', {}, 'Compartir'),
  );

  if (auto.estado === 'vendido') {
    return h(
      'div',
      { class: 'ficha__acciones' },
      h('p', { class: 'ficha__aviso' }, 'Este carro ya se vendió.'),
      h('a', { class: 'btn btn--yellow', href: '#carros', 'data-cerrar': '' }, 'Ver otros carros'),
    );
  }

  return h(
    'div',
    { class: 'ficha__acciones' },
    h(
      'a',
      { class: 'btn btn--yellow', href: linkWhatsApp(mensajeInteres(auto)), target: '_blank', rel: 'noopener' },
      icon('whatsapp-logo'),
      'Me interesa',
    ),
    botonCompartir,
  );
}

function contenido(auto) {
  return h(
    'div',
    { class: 'ficha' },
    galeria(auto),
    h(
      'div',
      { class: 'ficha__info' },
      h('div', { class: 'ficha__cabecera mono' }, h('span', {}, `Ficha ${auto.id}`), selloEstado(auto.estado)),
      h('p', { class: 'ficha__marca' }, auto.marca),
      h('h2', { class: 'ficha__titulo', id: 'ficha-titulo' }, auto.modelo),
      auto.version && h('p', { class: 'ficha__version' }, auto.version),
      h('p', { class: 'ficha__precio' }, formatPrecio(auto.precio)),
      h(
        'dl',
        { class: 'specs' },
        especificaciones(auto).map(([k, v]) =>
          h('div', { class: 'specs__item' }, h('dt', {}, k), h('dd', { class: 'mono' }, v)),
        ),
      ),
      auto.descripcion && h('p', { class: 'ficha__descripcion' }, auto.descripcion),
      auto.extras.length > 0 && h('ul', { class: 'ficha__extras', 'aria-label': 'Equipamiento' }, auto.extras.map((x) => h('li', {}, x))),
      acciones(auto),
      h(
        'p',
        { class: 'ficha__nota' },
        icon('shield-check'),
        'Antes de pagar, pedí el estudio registral en el Registro Nacional y llevalo a revisar con tu mecánico.',
      ),
      auto.publicado && h('p', { class: 'ficha__fecha mono' }, `Publicado el ${formatFecha(auto.publicado)}`),
    ),
  );
}

/**
 * Envuelve el <dialog> nativo. El diálogo da gratis el foco atrapado,
 * cierre con Escape y el fondo inerte.
 */
export function createCarDialog({ dialog, onClose }) {
  const cuerpo = dialog.querySelector('[data-dialog-body]');

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('dialogo-abierto');
    onClose?.();
  });
  // Clic en el fondo (fuera del panel) cierra.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-cerrar]')) dialog.close();
  });

  return {
    abrir(auto) {
      cuerpo.replaceChildren(contenido(auto));
      document.title = `${tituloAuto(auto)} | MONTEVER`;
      if (!dialog.open) dialog.showModal();
      document.documentElement.classList.add('dialogo-abierto');
      cuerpo.scrollTop = 0;
    },
    cerrar() {
      if (dialog.open) dialog.close();
    },
    get abierto() {
      return dialog.open;
    },
  };
}
