import { SITE } from './config.js';
import { cargarAutos } from './data/autosRepository.js';
import { createCatalog } from './features/catalog/catalog.js';
import { createCarDialog } from './features/detail/carDialog.js';
import { renderHero } from './features/hero/hero.js';
import { createSellForm } from './features/sell/sellForm.js';
import { initAnclas, initNav, initPausables, initReveal } from './features/ui/enhancements.js';
import { initMotion, refrescarScroll } from './features/ui/motion.js';
import { $, $$ } from './utils/dom.js';
import { formatFecha } from './utils/format.js';
import { linkWhatsApp, whatsappConfigurado } from './utils/whatsapp.js';

const TITULO_BASE = document.title;
const RUTA_AUTO = /^#carro\/(.+)$/;

/** Links genéricos de WhatsApp en el HTML: <a data-wa="mensaje">. */
function initLinksWhatsApp() {
  $$('[data-wa]').forEach((a) => {
    a.href = linkWhatsApp(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  if (!whatsappConfigurado()) {
    console.warn(`[${SITE.nombre}] Configurá tu número de WhatsApp en js/config.js`);
  }
}

/** Enlaza el hash #carro/ID con el diálogo de detalle, para que cada carro tenga link propio. */
function initRouter(autos, dialogo) {
  const porId = new Map(autos.map((a) => [a.id, a]));

  const sincronizar = () => {
    const match = location.hash.match(RUTA_AUTO);
    const auto = match && porId.get(decodeURIComponent(match[1]));
    if (auto) dialogo.abrir(auto);
    else dialogo.cerrar();
  };

  window.addEventListener('hashchange', sincronizar);
  sincronizar();
}

async function init() {
  initNav();
  initAnclas();
  initMotion();
  initReveal();
  initPausables();
  initLinksWhatsApp();
  createSellForm({ form: $('[data-form-venta]') });

  const catalogo = createCatalog({ root: $('#carros') });
  const dialogo = createCarDialog({
    dialog: $('[data-dialog]'),
    onClose: () => {
      document.title = TITULO_BASE;
      // Quita el #carro/ID sin saltar de posición ni agregar historial.
      if (RUTA_AUTO.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    },
  });

  catalogo.mostrarCargando();

  try {
    const { autos, actualizado } = await cargarAutos();
    catalogo.setAutos(autos);
    renderHero(autos);
    if (actualizado) $('[data-actualizado]').textContent = `Catálogo actualizado el ${formatFecha(actualizado)}.`;
    initRouter(autos, dialogo);
  } catch (error) {
    console.error(error);
    catalogo.mostrarError(error.message);
    $('[data-nota]').hidden = true;
  } finally {
    // El catálogo cambió el alto de la página: recalcula los disparadores de scroll.
    refrescarScroll();
  }
}

init();
