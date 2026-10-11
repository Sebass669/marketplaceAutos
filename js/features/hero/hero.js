import { $ } from '../../utils/dom.js';
import { hrefAuto } from '../catalog/carCard.js';
import { contarHasta } from '../ui/motion.js';

/** Elige el auto de la nota del hero: el marcado como destacado, o el disponible más reciente. */
export function elegirDestacado(autos) {
  const disponibles = autos.filter((a) => a.estado === 'disponible');
  return (
    disponibles.find((a) => a.destacado) ??
    [...disponibles].sort((a, b) => (b.publicado || '').localeCompare(a.publicado || ''))[0]
  );
}

/** Completa los datos vivos del hero: contador de disponibles y la nota "recién llegado". */
export function renderHero(autos) {
  const disponibles = autos.filter((a) => a.estado === 'disponible').length;
  contarHasta($('[data-contador]'), disponibles);

  const destacado = elegirDestacado(autos);
  const nota = $('[data-nota]');
  if (!destacado) {
    nota.hidden = true;
    return;
  }
  nota.href = hrefAuto(destacado);
  nota.setAttribute('aria-label', `Recién llegado: ${destacado.marca} ${destacado.modelo} ${destacado.anio}`);
  $('[data-nota-auto]', nota).textContent = `${destacado.marca} ${destacado.modelo} ${destacado.anio}`;
}
