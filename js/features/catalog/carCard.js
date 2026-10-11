import { h, icon } from '../../utils/dom.js';
import { formatKm, formatPrecio } from '../../utils/format.js';

export const ETIQUETA_ESTADO = { reservado: 'Reservado', vendido: 'Vendido' };

export const hrefAuto = (auto) => `#carro/${encodeURIComponent(auto.id)}`;

/** Sello de goma para estados no disponibles. */
export const selloEstado = (estado) =>
  ETIQUETA_ESTADO[estado] ? h('span', { class: `sello-estado sello-estado--${estado}` }, ETIQUETA_ESTADO[estado]) : null;

/** Tarjeta de un auto en la grilla, con estética de póster enmarcado. */
export function carCard(auto, { index = 0 } = {}) {
  return h(
    'article',
    { class: 'card', dataset: { estado: auto.estado }, style: `--i:${index}` },
    h(
      'a',
      { class: 'card__link', href: hrefAuto(auto), 'aria-label': `Ver ${auto.marca} ${auto.modelo} ${auto.anio}` },
      h(
        'div',
        { class: 'card__media' },
        h('img', {
          src: auto.fotos[0],
          alt: `${auto.marca} ${auto.modelo} ${auto.anio}, color ${auto.color || 'no indicado'}`,
          loading: index < 3 ? 'eager' : 'lazy',
          decoding: 'async',
          width: 1280,
          height: 860,
        }),
        selloEstado(auto.estado),
      ),
      h(
        'div',
        { class: 'card__body' },
        h('span', { class: 'card__tag mono', 'aria-hidden': 'true' }, auto.id),
        h('p', { class: 'card__marca' }, auto.marca),
        h('h3', { class: 'card__title' }, auto.modelo),
        h(
          'p',
          { class: 'card__datos' },
          h('span', { class: 'card__anio' }, auto.anio),
          h('span', {}, `${formatKm(auto.kilometraje)} / ${auto.transmision}`),
        ),
        h(
          'div',
          { class: 'card__foot' },
          h('span', { class: 'card__price' }, formatPrecio(auto.precio)),
          h('span', { class: 'card__place' }, icon('map-pin'), auto.provincia),
        ),
      ),
    ),
  );
}

/** Esqueleto con la misma forma que la tarjeta, mientras carga el JSON. */
export function cardSkeleton() {
  return h(
    'div',
    { class: 'card card--skeleton', 'aria-hidden': 'true' },
    h('div', { class: 'card__media skeleton' }),
    h(
      'div',
      { class: 'card__body' },
      h('div', { class: 'skeleton skeleton--line', style: 'width:30%' }),
      h('div', { class: 'skeleton skeleton--title' }),
      h('div', { class: 'skeleton skeleton--line', style: 'width:60%' }),
    ),
  );
}
