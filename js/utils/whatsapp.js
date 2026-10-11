import { SITE } from '../config.js';
import { formatKm, formatPrecio, tituloAuto } from './format.js';

const PLACEHOLDER = '50600000000';

export const whatsappConfigurado = () => SITE.whatsapp && SITE.whatsapp !== PLACEHOLDER;

/** Link wa.me hacia el número de MONTEVER con el mensaje ya escrito. */
export function linkWhatsApp(mensaje) {
  const texto = encodeURIComponent(mensaje);
  return `https://wa.me/${SITE.whatsapp}${texto ? `?text=${texto}` : ''}`;
}

export function mensajeInteres(auto) {
  return [
    `Hola ${SITE.nombre}, me interesa el ${tituloAuto(auto)} (código ${auto.id}).`,
    `Precio publicado: ${formatPrecio(auto.precio)}.`,
    '¿Sigue disponible?',
  ].join('\n');
}

/** Arma el mensaje de "quiero vender mi carro" a partir de los datos del formulario. */
export function mensajeVenta(d) {
  const lineas = [
    `Hola ${SITE.nombre}, quiero publicar mi carro.`,
    '',
    `Nombre: ${d.nombre}`,
    `Carro: ${d.marca} ${d.modelo} ${d.anio}`,
    `Kilometraje: ${formatKm(d.kilometraje)}`,
    `Transmisión: ${d.transmision}`,
    `Precio que espero: ${formatPrecio(d.precio)}`,
    `Ubicación: ${d.provincia}`,
  ];
  if (d.comentario) lineas.push(`Comentarios: ${d.comentario}`);
  lineas.push('', 'Ahora les mando las fotos por aquí.');
  return lineas.join('\n');
}
