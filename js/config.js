/**
 * Configuración del sitio. Es el único archivo JS que necesitás tocar.
 * Los carros se editan en data/autos.json (ver README.md).
 */
export const SITE = Object.freeze({
  nombre: 'MONTEVER',

  // Número de WhatsApp que recibe TODOS los mensajes (compradores y vendedores).
  // Formato internacional sin "+", espacios ni guiones. Ej: 50688887777
  whatsapp: '50600000000',

  // Ruta del catálogo. Relativa a index.html.
  datos: 'data/autos.json',

  locale: 'es-CR',
  moneda: 'CRC',
});

/** Valores válidos para los campos con opciones fijas del JSON. */
export const CATALOGO = Object.freeze({
  tipos: ['SUV', 'Pickup', 'Sedán', 'Hatchback', 'Van', 'Coupé', 'Moto'],
  provincias: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'],
  estados: ['disponible', 'reservado', 'vendido'],
  // Topes del filtro de precio, en colones.
  preciosMaximos: [5000000, 8000000, 10000000, 12000000, 15000000, 20000000, 30000000],
});
