import { normalizarTexto } from '../../utils/format.js';

export const FILTROS_INICIALES = Object.freeze({
  q: '',
  tipo: '',
  marca: '',
  provincia: '',
  precioMax: 0,
  orden: 'recientes',
});

const PESO_ESTADO = { disponible: 0, reservado: 1, vendido: 2 };

const ORDENES = {
  recientes: (a, b) => (b.publicado || '').localeCompare(a.publicado || ''),
  'precio-asc': (a, b) => a.precio - b.precio,
  'precio-desc': (a, b) => b.precio - a.precio,
  km: (a, b) => a.kilometraje - b.kilometraje,
  anio: (a, b) => b.anio - a.anio,
};

export const OPCIONES_ORDEN = [
  ['recientes', 'Más recientes'],
  ['precio-asc', 'Precio: menor a mayor'],
  ['precio-desc', 'Precio: mayor a menor'],
  ['km', 'Menos kilometraje'],
  ['anio', 'Año más nuevo'],
];

const textoBuscable = (auto) =>
  normalizarTexto([auto.marca, auto.modelo, auto.version, auto.anio, auto.color, auto.provincia, auto.canton].join(' '));

/** Función pura: recibe autos + filtros y devuelve la lista a mostrar. */
export function aplicarFiltros(autos, f) {
  const terminos = normalizarTexto(f.q).split(/\s+/).filter(Boolean);
  const ordenar = ORDENES[f.orden] ?? ORDENES.recientes;

  return autos
    .filter((auto) => {
      if (f.tipo && auto.tipo !== f.tipo) return false;
      if (f.marca && auto.marca !== f.marca) return false;
      if (f.provincia && auto.provincia !== f.provincia) return false;
      if (f.precioMax && auto.precio > f.precioMax) return false;
      if (terminos.length) {
        const texto = textoBuscable(auto);
        if (!terminos.every((t) => texto.includes(t))) return false;
      }
      return true;
    })
    .sort((a, b) => PESO_ESTADO[a.estado] - PESO_ESTADO[b.estado] || ordenar(a, b));
}

export const hayFiltrosActivos = (f) =>
  Object.keys(FILTROS_INICIALES).some((k) => k !== 'orden' && f[k] !== FILTROS_INICIALES[k]);

/** Valores únicos de un campo, ordenados, para poblar selects. */
export const valoresUnicos = (autos, campo) =>
  [...new Set(autos.map((a) => a[campo]))].sort((a, b) => String(a).localeCompare(String(b), 'es'));
