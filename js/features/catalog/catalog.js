import { CATALOGO } from '../../config.js';
import { $, h, icon } from '../../utils/dom.js';
import { formatMillones } from '../../utils/format.js';
import { carCard, cardSkeleton } from './carCard.js';
import { FILTROS_INICIALES, OPCIONES_ORDEN, aplicarFiltros, hayFiltrosActivos, valoresUnicos } from './filters.js';

/**
 * Controla la sección de catálogo: barra de filtros, conteo y grilla.
 * Recibe los nodos raíz desde index.html, así el markup estático vive en el HTML
 * y aquí solo se pinta lo dinámico.
 */
export function createCatalog({ root }) {
  const form = $('[data-filtros]', root);
  const grid = $('[data-grid]', root);
  const conteo = $('[data-conteo]', root);
  const chips = $('[data-chips-tipo]', root);

  let autos = [];
  let filtros = { ...FILTROS_INICIALES };

  function poblarSelect(name, opciones, etiquetaTodos) {
    const select = form.elements[name];
    select.replaceChildren(
      h('option', { value: '' }, etiquetaTodos),
      ...opciones.map(([value, label]) => h('option', { value }, label)),
    );
  }

  function pintarChips() {
    const tipos = CATALOGO.tipos.filter((t) => autos.some((a) => a.tipo === t));
    chips.replaceChildren(
      ...['', ...tipos].map((tipo) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip',
            'aria-pressed': String(filtros.tipo === tipo),
            onclick: () => actualizar({ tipo }),
          },
          tipo || 'Todos',
        ),
      ),
    );
  }

  function pintarGrilla() {
    const lista = aplicarFiltros(autos, filtros);
    const disponibles = lista.filter((a) => a.estado === 'disponible').length;

    conteo.textContent =
      lista.length === 0
        ? 'Sin resultados'
        : `${disponibles} ${disponibles === 1 ? 'carro disponible' : 'carros disponibles'}`;

    if (lista.length === 0) {
      grid.replaceChildren(estadoVacio());
      return;
    }
    grid.replaceChildren(...lista.map((auto, index) => carCard(auto, { index })));
  }

  function estadoVacio() {
    return h(
      'div',
      { class: 'estado-panel' },
      icon('magnifying-glass', 'estado-panel__icon'),
      h('p', { class: 'estado-panel__title' }, 'Ningún carro coincide con esa búsqueda.'),
      h('p', {}, 'Probá con menos filtros o escribinos y te avisamos cuando entre uno así.'),
      h('button', { type: 'button', class: 'btn btn--ghost', onclick: limpiar }, 'Limpiar filtros'),
    );
  }

  function actualizar(cambios) {
    filtros = { ...filtros, ...cambios };
    form.toggleAttribute('data-activos', hayFiltrosActivos(filtros));
    pintarChips();
    pintarGrilla();
  }

  function limpiar() {
    form.reset();
    actualizar({ ...FILTROS_INICIALES });
  }

  function leerFormulario() {
    const datos = new FormData(form);
    actualizar({
      q: String(datos.get('q') ?? ''),
      marca: String(datos.get('marca') ?? ''),
      provincia: String(datos.get('provincia') ?? ''),
      precioMax: Number(datos.get('precioMax')) || 0,
      orden: String(datos.get('orden') || 'recientes'),
    });
  }

  form.addEventListener('input', leerFormulario);
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => queueMicrotask(limpiar));

  return {
    mostrarCargando(cantidad = 6) {
      grid.setAttribute('aria-busy', 'true');
      grid.replaceChildren(...Array.from({ length: cantidad }, cardSkeleton));
    },

    mostrarError(mensaje) {
      grid.removeAttribute('aria-busy');
      conteo.textContent = '';
      grid.replaceChildren(
        h(
          'div',
          { class: 'estado-panel estado-panel--error', role: 'alert' },
          icon('warning-circle', 'estado-panel__icon'),
          h('p', { class: 'estado-panel__title' }, 'No pudimos cargar los carros.'),
          h('p', {}, mensaje),
          h('button', { type: 'button', class: 'btn btn--ghost', onclick: () => location.reload() }, 'Reintentar'),
        ),
      );
    },

    setAutos(lista) {
      autos = lista;
      grid.removeAttribute('aria-busy');
      poblarSelect('marca', valoresUnicos(autos, 'marca').map((m) => [m, m]), 'Todas las marcas');
      poblarSelect(
        'provincia',
        CATALOGO.provincias.filter((p) => autos.some((a) => a.provincia === p)).map((p) => [p, p]),
        'Todo el país',
      );
      poblarSelect('precioMax', CATALOGO.preciosMaximos.map((v) => [v, `Hasta ${formatMillones(v)}`]), 'Cualquier precio');
      form.elements.orden.replaceChildren(...OPCIONES_ORDEN.map(([value, label]) => h('option', { value }, label)));
      actualizar({});
    },
  };
}
